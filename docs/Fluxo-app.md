---
created: 2026-05-24
updated: 2026-05-24
tags: [fluxo, navegacao, arquitetura]
status: rascunho
---

# Fluxo do App — App Zooloo

> Mapa de navegação do PDV móvel, do login até a impressão do pule. O conceito
> central é o **carrinho**: o vendedor monta várias apostas, elas se acumulam no
> carrinho, e só no final escolhe a **extração** (dia/horário) e finaliza.
> Detalhes de regra que dependem do banco estão marcados com ❓ (ver [[fase-0-regras]]).

## Regra de ouro (vale para todo o fluxo)

Em **toda** tela com valores, o app só **monta dados brutos** e **relê** o que o
backend devolve. O app nunca calcula prêmio, comissão, limite ou ganhador.
Ver [[docs/CLAUDE#Regra-de-ouro-inegociável]] e [[docs/plano#2.4]].

---

## Conceito central: o carrinho

Diferente de um fluxo linear "uma aposta por vez", o app funciona como um **carrinho
de compras**:

1. O vendedor escolhe um jogo, monta uma aposta e **adiciona ao carrinho**.
2. A tela volta para que ele possa adicionar **outra aposta** (do mesmo jogo ou de outro).
3. Quando termina, abre o **carrinho**, escolhe a **extração** (dia/horário) e **finaliza**.
4. Ao finalizar, o backend registra tudo e o app imprime o **pule** (com NSU e detalhes).

❓ _A confirmar:_ a extração é única para o carrinho todo, ou cada aposta pode ter sua
própria extração? (O fluxo abaixo assume **uma extração para o carrinho**; ajustar se for
por aposta.)

---

## Diagrama de navegação

```mermaid
flowchart TD
    Start([App abre]) --> AuthCheck{JWT local válido?}
    AuthCheck -->|Não| Login[Tela de Login]
    AuthCheck -->|Sim, offline ok| Home[Tela Inicial / Escolha de Jogo]
    Login -->|login OK| Home

    Home --> JB[JB - Jogo do Bicho]
    Home --> Qui[Quininha]
    Home --> Sen[Seninha]
    Home --> Lot[Lotinha]

    %% Jogo do Bicho
    JB --> Mod[Escolher Modalidade<br/>milhar, centena, dezena, grupo...]
    Mod --> Num[Digitar números da aposta]
    Num -->|OK| Premio[Definir valor por intervalo de prêmio<br/>1º / 1º-5º / 1º-10º / 3º-6º...]
    Premio -->|OK| AddCarrinho

    %% Quininha / Seninha / Lotinha
    Qui --> GradeQ[Grade 80 dezenas<br/>escolher até 13]
    Sen --> GradeS[Grade de dezenas ❓]
    Lot --> GradeL[Grade de dezenas ❓]
    GradeQ -->|valor + OK| AddCarrinho
    GradeS -->|valor + OK| AddCarrinho
    GradeL -->|valor + OK| AddCarrinho

    AddCarrinho[(Adiciona ao carrinho)] --> Decisao{Mais apostas?}
    Decisao -->|Sim, mesma modalidade/jogo| Home
    Decisao -->|Concluir / abrir carrinho| Carrinho[Carrinho]

    Carrinho --> Extracao[Escolher Extração<br/>dia + horário disponível]
    Extracao --> Finaliza[/apiCall: registrar apostas/]
    Finaliza -->|sucesso| Pule[Pule / NSU + detalhes]
    Finaliza -->|ApiError| ErroC[Mostra erro] --> Carrinho
    Pule --> Imprime[Imprimir na térmica ❓ Fase 3]
    Pule --> Home
```

---

## Fluxo passo a passo

### 0. Abertura do app

`AuthContext.checkAuthStatus` roda no mount e decodifica o **JWT local** (sem rede).
Se `exp` está no futuro, abre direto na tela inicial — mesmo offline (maquinetas POS).
Senão, vai para o login. Ver [[docs/README-AUTH#Por-que-o-app-abre-offline]].

### 1. Login

Tela `app/login.tsx`. Vendedor informa login/senha → `AuthService.login` → backend
devolve `access`, `refresh`, `user`, `vendedor`, `permissoes`. Tokens no SecureStore;
o guard (`app/_layout.tsx`) redireciona para a área autenticada. Ver [[docs/README-AUTH]].

### 2. Tela inicial — escolha do tipo de jogo

O vendedor escolhe entre:

- **JB** — Jogo do Bicho
- **Quininha**
- **Seninha**
- **Lotinha**

❓ _A confirmar:_ lista fixa ou filtrada pelas `permissoes` do vendedor (já retornadas no login)?

---

### 3. Fluxo do JB (Jogo do Bicho)

O mais elaborado. Etapas:

**3.1 — Escolher modalidade.** Milhar, centena, dezena, grupo, etc.
❓ _Confirmar a lista completa de modalidades do MVP em `regraJogos.md`._

**3.2 — Digitar os números da aposta.** Abre uma tela de digitação onde o vendedor
informa os números conforme a modalidade (ex.: 4 dígitos para milhar, 2 para dezena).
Ao clicar em **OK**, segue para o valor.
❓ _Confirmar quantos dígitos cada modalidade exige e como isso vira o campo `palpites`
posicional (ver [[fase-0-regras]])._

**3.3 — Definir o valor por intervalo de prêmio.** Esta é a parte rica do JB. O vendedor
informa o valor associado a um **intervalo de colocações de prêmio**, sempre dentro da
faixa **1º ao 10º**. Exemplos:

- **1º prêmio** → informa o valor
- **1º ao 5º prêmio** → informa o valor
- **1º ao 10º prêmio** → informa o valor
- **Intervalo livre** → ex.: 3º ao 5º, 1º ao 6º, 4º ao 9º — qualquer intervalo dentro de 1–10

Regras de validação (a confirmar):

- ❓ O intervalo é sempre contíguo (início ≤ fim) e limitado a 1–10?
- ❓ O valor é por aposta ou multiplicado pela quantidade de prêmios do intervalo?
  (Lembrar: **quem calcula é o backend** — o app só envia início, fim e valor.)
- ❓ Pode haver mais de um intervalo na mesma aposta (ex.: 1º a R$2 e 5º a R$1)?

Ao clicar em **OK**, a aposta vai para o **carrinho** e a tela **volta para a tela de
modalidades**, para o vendedor montar outra aposta do JB se quiser. Se não quiser, ele
clica em **Concluir** ou no **carrinho** para finalizar.

---

### 4. Fluxo da Quininha

**4.1 — Grade de dezenas.** Abre uma grade com **80 dezenas**, onde o vendedor escolhe
**até 13 números**.
❓ _Confirmar a quantidade mínima de números (1? 5?) e se há faixas com valores diferentes._

**4.2 — Valor.** Informa o valor e clica em **OK**.

**4.3 — Carrinho.** A aposta vai para o carrinho. O vendedor pode adicionar mais apostas
ou ir ao carrinho escolher a extração e encerrar.

---

### 5. Fluxo da Seninha e da Lotinha

Seguem o **mesmo fluxo da Quininha**: grade de dezenas → escolher números → valor → OK →
carrinho.

❓ _A confirmar para cada uma (ver `lotinha_quininha_senhinha.sql` + `regraJogos.md`):_

- Quantas dezenas tem a grade? (Quininha = 80; Seninha = ❓; Lotinha = ❓)
- Quantos números o vendedor pode escolher? (Quininha = até 13; Seninha = ❓; Lotinha = ❓)
- Mínimo de números por aposta?

---

### 6. Carrinho

Reúne **todas as apostas** adicionadas (de qualquer jogo). O vendedor:

- Revê as apostas (e ❓ pode remover/editar?)
- Escolhe a **extração** — o **dia e horário** disponíveis para aquelas apostas
- Vê o **valor total** (calculado pelo backend, relido pelo app)
- **Finaliza**

❓ _A confirmar:_ a lista de extrações disponíveis vem do backend e depende do
jogo/horário atual? Apostas de jogos diferentes podem compartilhar a mesma extração?

### 7. Finalização e pule

Ao finalizar, o app envia o carrinho via `apiCall` (Bearer + refresh + retry já cuidados
pelo `apiClient`). Em erro, `ApiError` é exibido e o vendedor pode tentar de novo.
Com sucesso, o backend retorna os dados registrados (IDs, **NSU**, valores, extração) e o
app renderiza o **pule** para impressão. Ver [[docs/CLAUDE#Como-falar-com-o-backend]].

### 8. Impressão (Fase 3)

Impressão do pule na **térmica** da maquineta POS. Planejada para a Fase 3
(ver [[docs/plano#12]]). O layout do pule já deve ser pensado para a largura da térmica
(32/48 colunas) desde agora, para evitar retrabalho.

---

## Telas / componentes reaproveitáveis

- **Tela inicial** (escolha de jogo)
- **Grade de dezenas** parametrizável (Quininha 80, Seninha/Lotinha ❓) — mesma base
- **Input de valor** (máscara R$ + validação)
- **Carrinho** (comum a todos os jogos)
- **Seletor de extração** (no carrinho)
- **Pule / comprovante**

O que muda por jogo é a etapa de **montar a aposta**: o JB tem modalidade + dígitos +
intervalo de prêmios; os demais têm grade de dezenas + valor.

---

## Estado a manter no app (carrinho)

O carrinho precisa de um estado global (ex.: Context próprio, separado do `AuthContext`)
contendo a lista de apostas em construção. Cada item do carrinho deve guardar, no mínimo:

- `jogo` (JB / Quininha / Seninha / Lotinha)
- `modalidade` (só JB)
- `palpites` / números escolhidos (formato bruto ❓ Fase 0)
- para JB: `intervalo` (início, fim) + `valor`
- para os demais: `valor`

A **extração** é definida uma vez no carrinho, na finalização. Nenhum cálculo de prêmio
ou total fica no app — o total exibido vem do backend.

---

## Pendências do fluxo

- ❓ Extração: única por carrinho ou por aposta? Lista vem do backend?
- ❓ JB — lista de modalidades do MVP e dígitos por modalidade
- ❓ JB — intervalo de prêmios: contíguo? múltiplos intervalos? valor por prêmio vs. total?
- ❓ Quininha — mínimo de números (máx confirmado = 13 de 80)
- ❓ Seninha / Lotinha — tamanho da grade e quantidade de números escolhíveis
- ❓ Carrinho — permite editar/remover itens?
- ❓ Lista de jogos: fixa ou filtrada por `permissoes`?
- ❓ Formato do `palpites` por jogo (resolver na [[fase-0-regras]])

## Referências

- [[docs/CLAUDE]] — índice operacional do app
- [[docs/plano]] — roadmap e modelagem do banco
- [[docs/README-AUTH]] — autenticação e abertura offline
- [[docs/regras-negocio]] — regras das modalidades
- [[fase-0-regras]] — regras + amostras do banco (bloqueante)
- [[fase-2-aposta-bicho]] — implementação do fluxo do JB
- [[tasks/roadmap]] — quadro Kanban
