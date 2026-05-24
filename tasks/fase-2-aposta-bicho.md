---
created: 2026-05-24
updated: 2026-05-24
fase: 2
status: a-fazer
tags: [fase/2, aposta, jogo-do-bicho, carrinho]
bloqueada_por: [fase-0-regras]
---

# Fase 2 — Aposta do Jogo do Bicho (com carrinho)

> ⚠️ **Bloqueada pela [[fase-0-regras]].** Não comece a codar a montagem dos números
> nem o `palpites` sem as amostras reais extraídas do banco na Fase 0.
> Ver [[docs/plano#2.7]] e [[docs/CLAUDE#Armadilhas-conhecidas]].

## Escopo desta fase

Implementar **apenas o Jogo do Bicho (JB)** de ponta a ponta, dentro do modelo de
**carrinho** definido em [[docs/fluxo-app]]. Quininha, Seninha e Lotinha ficam **fora
desta fase** (entram em fase futura), mas as peças construídas aqui — carrinho, input de
valor, seletor de extração, pule — devem ser **genéricas o suficiente** para reaproveitar
depois.

**Dentro do escopo:**

- Tela inicial com a opção JB
- JB: modalidade → digitar números → valor por intervalo de prêmio → adicionar ao carrinho
- Carrinho: revisar itens, escolher extração, finalizar
- Pule na tela (layout pronto para térmica)

**Fora do escopo (fase futura):**

- 🚫 Quininha, Seninha, Lotinha (grade de dezenas)
- 🚫 Impressão real na térmica (Fase 3)
- 🚫 Histórico/cancelamento de apostas

## Regra de ouro (não esquecer)

O app **NUNCA** calcula prêmio, comissão, limite, total ou ganhador. Ele monta os dados
brutos (modalidade, números, intervalo de prêmio, valor) e **relê** o que o backend
devolve. Em especial, no carrinho o **total exibido vem do backend**, não de uma soma no
app. Ver [[docs/CLAUDE#Regra-de-ouro-inegociável]] e [[docs/plano#2.4]].

---

## Fluxo desta fase (resumo)

```
Tela inicial → [JB] → Modalidade → Digitar números → OK
   → Definir valor por intervalo de prêmio (1º / 1º-5º / 1º-10º / 3º-6º...) → OK
   → aposta vai pro CARRINHO, volta pra tela de modalidades
   → (repete quantas vezes quiser)
   → Concluir / abrir carrinho → escolher extração → finalizar → pule
```

Detalhe completo em [[docs/fluxo-app]].

---

## Critérios de aceite

### Tela inicial e navegação

- [ ] Tela inicial mostra a opção **JB** (demais jogos podem aparecer desabilitados/ocultos)
- [ ] Selecionar JB abre a tela de modalidades

### Montagem da aposta (JB)

- [ ] Tela de modalidade lista as modalidades do JB (milhar, centena, dezena, grupo, etc.)
- [ ] Tela de digitação aceita os números conforme a modalidade escolhida
- [ ] Validação da quantidade de dígitos por modalidade (ver Fase 0)
- [ ] Botão **OK** na digitação leva à tela de valor

### Valor por intervalo de prêmio

- [ ] Permite escolher prêmio único (1º), intervalos fixos (1º-5º, 1º-10º) e intervalo livre (ex.: 3º-6º)
- [ ] Intervalo sempre dentro de **1–10** e contíguo (início ≤ fim)
- [ ] Input de valor com máscara monetária (R$) e validação de mín/máx
- [ ] Botão **OK** adiciona a aposta ao carrinho e **volta para a tela de modalidades**

### Carrinho

- [ ] Carrinho acumula múltiplas apostas de JB
- [ ] Cada item mostra modalidade, números, intervalo de prêmio e valor
- [ ] Permite **remover** um item antes de finalizar
- [ ] Botão **Concluir** / ícone de carrinho abre o carrinho
- [ ] Seletor de **extração** (dia + horário) — lista vinda do backend
- [ ] Total exibido vem do backend (não somado no app)

### Integração com backend

- [ ] Monta `palpites` no **formato posicional correto** (ver Fase 0)
- [ ] Finalizar envia o carrinho via `apiCall` (nunca `fetch` cru)
- [ ] Trata `ApiError` (httpStatus + message) com feedback ao vendedor
- [ ] Trata estado de carregamento durante o envio
- [ ] Relê e exibe IDs / NSU / valores retornados

### Pule

- [ ] Tela de pule renderiza dados retornados (ID, NSU, modalidade, números, intervalo, valor, extração, data/hora, vendedor)
- [ ] Layout compatível com largura de impressora térmica (32/48 colunas) — preparação Fase 3

### Qualidade

- [ ] Sem cores hardcoded — usar tokens de `src/theme`
- [ ] Imports via alias `@/`
- [ ] Testes do `CarrinhoContext` (adicionar, remover, limpar)
- [ ] Testes do `apostaService` com mock do `apiClient`
- [ ] Teste do helper que monta `palpites` e valida intervalo de prêmio
- [ ] Cobertura mantém threshold (80% lines/stmts/funcs, 70% branches)

---

## Subtarefas (ordem de execução)

1. [ ] Definir tipos TS (`types/aposta.ts`): jogo, modalidade, intervalo de prêmio, item de carrinho, payload, resposta
2. [ ] Criar o **estado do carrinho** (`context/CarrinhoContext.tsx`) — separado do AuthContext
3. [ ] Criar `services/apostaService.ts` — `listarModalidades`, `listarExtracoes`, `registrarCarrinho`
4. [ ] Tela inicial com a opção JB
5. [ ] Tela de seleção de modalidade
6. [ ] Tela de digitação de números (validação por modalidade)
7. [ ] Helper isolado e testável: montar `palpites` posicional
8. [ ] Tela/componente de valor por intervalo de prêmio (1–10, contíguo) + input de valor
9. [ ] Ao confirmar, adicionar item ao carrinho e voltar para modalidades
10. [ ] Tela de carrinho (listar itens, remover, abrir)
11. [ ] Seletor de extração no carrinho (lista do backend)
12. [ ] Finalizar: `registrarCarrinho` via `apiCall`, tratar erro/loading
13. [ ] Componente de pule (layout pronto para térmica)
14. [ ] Testes (CarrinhoContext + apostaService + helper de palpites/intervalo)

## Dependências

- [[fase-0-regras]] — **bloqueante.** Modalidades do JB, dígitos por modalidade, formato de `palpites`, regras do intervalo de prêmio
- [[docs/fluxo-app]] — fluxo de carrinho definido
- [[docs/README-AUTH]] — autenticação pronta; usar `apiCall` (Bearer + refresh já cuidados)
- [[docs/regras-negocio#Jogo-do-Bicho]] — regras de validação (valor mín/máx, modalidades)
- [[docs/plano#2.4]] — backend é a fonte de verdade do cálculo
- [[docs/plano#2.7]] — `palpites` é string posicional
- Backend: classe REST de registro de aposta/carrinho precisa existir (ver [[../zooloo/zooloo/CLAUDE]])

## Notas técnicas

- **Carrinho = Context próprio.** Não misturar com `AuthContext`. Guarda a lista de itens
  em construção; a extração é definida uma vez, na finalização.
- **`palpites` é string posicional**, não relacional — não montar sem as amostras da Fase 0.
- **Intervalo de prêmio:** o app envia apenas `(inicio, fim, valor)`. Não multiplica nem
  soma — o backend calcula o custo. Validar só que está em 1–10 e contíguo.
- **Datas vêm como string** em tabelas `system_*` do Adianti — tratar conversão ao exibir.
- **Envelope Adianti:** resposta é `{ status, data }` — o `apiClient` já desembrulha.
- Usar `apiCall<TipoResposta>({ class: 'XxxRestService', method: 'registrar', data: {...} })`.
- Pensar o **pule** já com a largura da térmica (32/48 colunas) desde agora.
- Componentizar o que será reaproveitado por Quininha/Seninha/Lotinha depois:
  **carrinho, input de valor, seletor de extração, pule**.

## Riscos / pontos de atenção

- ❓ Formato exato de `palpites` → resolver na [[fase-0-regras]] antes de avançar
- ❓ Lista de modalidades do JB no MVP e dígitos de cada uma
- ❓ Intervalo de prêmio: pode haver mais de um intervalo por aposta? valor por prêmio vs. total? (cálculo é do backend, mas a UI precisa saber o que coletar)
- ❓ Extração única por carrinho ou por aposta? Lista vem do backend?
- ❓ O endpoint de registro aceita um **carrinho** (várias apostas) de uma vez, ou uma por requisição?

## Referências

- [[docs/CLAUDE]] — índice operacional do app
- [[docs/fluxo-app]] — fluxo completo do app
- [[docs/plano]] — roadmap e modelagem
- [[docs/regras-negocio]] — regras das modalidades
- [[tasks/roadmap]] — quadro Kanban
- [[daily/2026-05-24]] — diário do dia

## Log de progresso

<!-- Vá anotando aqui conforme avança. Ex:
- 2026-05-24: criei os tipos e o CarrinhoContext
-->
