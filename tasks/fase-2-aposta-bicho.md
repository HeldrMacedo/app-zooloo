---
created: 2026-05-24
updated: 2026-05-25
fase: 2
status: concluido
tags: [fase/2, aposta, jogo-do-bicho, carrinho, preview]
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
- JB: modalidade → digitar números → selecionar prêmios + valor + switch rateado → adicionar ao carrinho
- Tela Preview: revisar itens, selecionar data, selecionar extrações (múltiplas), finalizar
- Pule na tela (layout pronto para térmica)

**Fora do escopo (fase futura):**

- 🚫 Quininha, Seninha, Lotinha (grade de dezenas)
- 🚫 Impressão real na térmica (Fase 3)
- 🚫 Histórico/cancelamento de apostas

## Regra de ouro (não esquecer)

O app **NUNCA** calcula prêmio, comissão, limite ou ganhador. Ele monta os dados
brutos (modalidade, números, prêmios, valor, bitT) e **relê** o que o backend
devolve. O **total final registrado vem dos triggers do banco**, não do app.

> ⚠️ **Nota da análise do app-base:** O app original **calcula um total local como
> estimativa** durante a montagem (método `Aposta.getTotalGeral()`), mas o valor oficial
> é recalculado por trigger no INSERT. No app-zooloo, manter a mesma abordagem:
> exibir estimativa local para UX, mas o valor final é sempre do backend.

Ver [[docs/CLAUDE#Regra-de-ouro-inegociável]] e [[docs/plano#2.4]].

---

## Fluxo desta fase (resumo)

```
Tela inicial → [JB] → Modalidade → Digitar números → OK
   → Selecionar colocações de prêmio (contíguo OU livre, 1-10)
   → Definir valor + switch Rateado/Cada (bitT)
   → OK → aposta adicionada ao CARRINHO, volta pra tela de modalidades
   → (repete quantas vezes quiser)
   → Clicar no carrinho → TELA PREVIEW:
      → Listar apostas (pode remover)
      → Selecionar DATA do sorteio (DatePicker)
      → Selecionar EXTRAÇÕES (múltiplas checkboxes, vindas do backend)
      → Switch: Ratear valor entre extrações sim/não
      → Confirmar → Enviar → Pule
```

> ⚠️ **Conforme análise do app-base:** a extração é selecionada na tela Preview (não
> no carrinho), e o vendedor pode selecionar **múltiplas extrações** por bilhete.
> O flag `cfg_parametros.multiplas_extracoes` controla se isso é permitido.

Detalhe completo em [[docs/fluxo-app]] e [[analise-comparativa-fluxo-jb]].

---

## Critérios de aceite

### Tela inicial e navegação

- [x] Tela inicial mostra a opção **JB** (demais jogos podem aparecer desabilitados/ocultos)
- [x] Selecionar JB abre a tela de modalidades

### Montagem da aposta (JB)

- [x] Tela de modalidade lista as modalidades do JB (milhar, centena, dezena, grupo, etc.)
- [x] Tela de digitação aceita os números conforme a modalidade escolhida
- [x] Validação da quantidade de dígitos por modalidade (ver Fase 0)
- [x] Botão **OK** na digitação leva à tela de prêmio

### Seleção de prêmios + valor

- [x] Exibe bolinhas numeradas de `tnyPremioMenor` a `tnyPremioMaior` (geralmente 1 a 10)
- [x] **Modo contíguo** (padrão): selecionar intervalo contíguo arrastando (ex: 1 ao 5)
- [x] **Modo livre**: selecionar prêmios individuais não adjacentes (ex: 1, 3, 5 - resolvido com auto-contiguidade para a API)
- [x] Respeitar `tnyQtdMinimaPremio` e `tnyQtdMaximaPremio` do `TipoJogo`
- [x] Switch **"P/ Cada" vs "P/ Todos"** (`bitT`): define se o valor é por prêmio ou rateado
- [x] Input de valor com máscara monetária (R$) e validação de mín/máx
- [x] Botão **OK** adiciona a aposta ao carrinho e **volta para a tela de modalidades**

### Carrinho (badge na toolbar)

- [x] Carrinho acumula múltiplas apostas de JB
- [x] Exibir badge com quantidade de itens na toolbar
- [x] Clicar no badge abre a **Tela Preview**
- [x] Limite máximo de apostas por bilhete: **150** (conforme app-base)

### Tela Preview (Revisão + Extração + Envio)

- [x] Listar todas as apostas do carrinho (modalidade, números, prêmios, valor)
- [x] Permite **remover** um item antes de finalizar
- [x] **DatePicker** para selecionar data do sorteio (default: hoje, exibição estática no MVP)
- [x] Lista de **extrações disponíveis** para a data (vindas do backend via `vw_sorteio`)
- [x] **Múltiplas extrações selecionáveis** (checkboxes) — controlado por `cfg_parametros.multiplas_extracoes`
- [x] Switch **ratear entre extrações** sim/não (quando múltiplas selecionadas)
- [x] Total exibido como **estimativa local** (valor × prêmios × extrações)

### Integração com backend

- [x] Monta `palpites` no **formato posicional correto** (ver Fase 0)
- [x] Monta `ApostaEnvioModel` com: lista de apostas + lista de extrações selecionadas + data + flag rateio
- [x] Finalizar envia via `apiCall` (nunca `fetch` cru)
- [x] Trata `ApiError` (httpStatus + message) com feedback ao vendedor
- [x] Trata estado de carregamento durante o envio
- [x] Relê e exibe IDs / NSU / valores retornados (total oficial do backend)

### Pule

- [x] Tela de pule renderiza dados retornados (ID, NSU, modalidade, números, intervalo, valor, extração, data/hora, vendedor)
- [x] Layout compatível com largura de impressora térmica (32/48 colunas) — preparação Fase 3

### Qualidade

- [x] Sem cores hardcoded — usar tokens de `src/theme`
- [x] Imports via alias `@/`
- [x] Testes do `CarrinhoContext` (adicionar, remover, limpar)
- [x] Testes do `apostaService` com mock do `apiClient` (corrigido bug de data hardcoded)
- [x] Teste do helper que monta `palpites` e valida intervalo de prêmio
- [x] Cobertura mantém threshold (80% lines/stmts/funcs, 70% branches)

---

## Subtarefas (ordem de execução)

1. [x] Definir tipos TS (`types/aposta.ts`): jogo, modalidade, prêmios (contíguos e livres), bitT, item de carrinho, payload de envio, resposta
2. [x] Criar o **estado do carrinho** (`context/CarrinhoContext.tsx`) — separado do AuthContext, limite 150 apostas
3. [x] Criar `services/apostaService.ts` — `listarModalidades`, `listarExtracoes(data)`, `registrarBilhete`
4. [x] Tela inicial com a opção JB
5. [x] Tela de seleção de modalidade + badge do carrinho na toolbar
6. [x] Tela de digitação de números (validação por modalidade)
7. [x] Helper isolado e testável: montar `palpites` posicional
8. [x] Tela de seleção de prêmios: grade de bolinhas 1-10, modo contíguo e livre, switch bitT + input de valor
9. [x] Ao confirmar, adicionar item ao carrinho e voltar para modalidades
10. [x] **Tela Preview**: listar apostas do carrinho, remover itens
11. [x] **DatePicker** na Preview: selecionar data do sorteio (estática no MVP)
12. [x] **Seletor de extrações** na Preview: checkboxes, múltiplas selecionáveis + switch ratear
13. [x] Finalizar: montar `ApostaEnvioModel`, enviar via `apiCall`, tratar erro/loading
14. [x] Componente de pule (layout pronto para térmica)
15. [x] Testes (CarrinhoContext + apostaService + helper de palpites + seleção de prêmios)

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
  em construção (máx 150). Extrações e data são definidas na tela Preview.
- **`palpites` é string posicional**, não relacional — não montar sem as amostras da Fase 0.
- **Prêmios: contíguos OU livres.** O app envia `(lista_premios, valor, bitT)`. O formato da
  string `vchPremio` é: `"1.5"` para contíguo (1 ao 5) ou `"135"` para livre (1, 3, 5).
- **bitT (Rateado/Cada):** 0 = valor "por cada prêmio", 1 = valor "rateado entre todos".
- **Múltiplas extrações:** controlado por `cfg_parametros.multiplas_extracoes`. O campo
  `mov_jb.sorteios_ids` armazena IDs separados por vírgula.
- **Data do sorteio:** selecionável na Preview. A lista de extrações muda conforme a data.
- **Total local é estimativa.** Calcular localmente para UX, mas relê o valor oficial do
  backend após INSERT (os triggers preenchem `total_bilhete` e `comissao_valor`).
- **Datas vêm como string** em tabelas `system_*` do Adianti — tratar conversão ao exibir.
- **Envelope Adianti:** resposta é `{ status, data }` — o `apiClient` já desembrulha.
- Usar `apiCall<TipoResposta>({ class: 'XxxRestService', method: 'registrar', data: {...} })`.
- Pensar o **pule** já com a largura da térmica (32/48 colunas) desde agora.
- Componentizar o que será reaproveitado por Quininha/Seninha/Lotinha depois:
  **carrinho, input de valor, seletor de extração, pule, preview**.

## Riscos / pontos de atenção

- ❓ Formato exato de `palpites` → resolver na [[fase-0-regras]] antes de avançar
- ❓ Lista de modalidades do JB no MVP e dígitos de cada uma
- ✅ ~~Intervalo de prêmio: pode haver mais de um intervalo por aposta?~~ **Sim.** O vendedor pode adicionar múltiplos `PremioValor` na mesma aposta (contíguos ou livres)
- ✅ ~~Extração única por carrinho ou por aposta?~~ **Múltiplas extrações por bilhete.** Selecionadas na tela Preview.
- ✅ ~~Valor por prêmio vs. total?~~ Controlado pelo switch `bitT`: 0=por cada, 1=rateado
- ❓ O endpoint de registro aceita um **bilhete** (várias apostas + extrações) de uma vez, ou uma por requisição?
- ⚠️ Milhar Brinde (`bitBrinde`) — funcionalidade avançada, postergar para fase futura

## Referências

- [[docs/CLAUDE]] — índice operacional do app
- [[docs/fluxo-app]] — fluxo completo do app
- [[docs/plano]] — roadmap e modelagem
- [[docs/regras-negocio]] — regras das modalidades
- [[tasks/roadmap]] — quadro Kanban
- [[daily/2026-05-24]] — diário do dia

## Log de progresso

- 2026-05-25: análise comparativa com app-base decompilado — corrigido fluxo de extração
  (Preview, não carrinho), prêmios não-contíguos, switch bitT, múltiplas extrações,
  seleção de data. Ver [[analise-comparativa-fluxo-jb]].

<!-- Vá anotando aqui conforme avança. -->
