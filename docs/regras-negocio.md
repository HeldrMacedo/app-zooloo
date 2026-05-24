---
created: 2026-05-24
fase: 2
status: a-fazer
tags: [fase/2, aposta, jogo-do-bicho]
bloqueada_por: [fase-0-regras]
---

# Fase 2 — Tela de aposta do Jogo do Bicho

> ⚠️ **Bloqueada pela [[fase-0-regras]].** Não comece a codar a validação de
> `palpites` sem antes ter as amostras reais extraídas do banco na Fase 0.
> Ver [[docs/plano#2.7]] e [[docs/CLAUDE#Armadilhas-conhecidas]].

## Objetivo

Implementar o fluxo completo de registro de **uma aposta de Jogo do Bicho**, de ponta
a ponta: seleção da modalidade → escolha de bicho/dezena → valor → confirmação →
persistência no backend → exibição do comprovante. Esta é a **primeira fatia vertical
de aposta** e estabelece o padrão que será reaproveitado em Lotinha, Quininha e
Seninha (Fases seguintes).

## Regra de ouro (não esquecer)

**O app NUNCA calcula prêmio, comissão, limite ou ganhador.** Ele monta os dados brutos
da aposta, envia via `apiCall`, e **relê** os valores que o backend devolve (ID, valor
total, valores calculados). Se você se pegar somando prêmios na tela, pare.
Ver [[docs/CLAUDE#Regra-de-ouro-inegociável]] e [[docs/plano#2.4]].

## Critérios de aceite

### Seleção e entrada
- [ ] Tela de seleção de modalidade do Bicho renderiza as opções vindas do backend
- [ ] Componente de seleção de bicho/dezena renderiza a grade dos 25 bichos
- [ ] Seleção de posição/colocação (1º ao 5º) funciona conforme a modalidade
- [ ] Input de valor com máscara monetária (R$) e validação de mín/máx
- [ ] Resumo da aposta mostra o que foi montado antes de confirmar

### Integração com backend
- [ ] Monta o campo `palpites` no **formato posicional correto** (ver Fase 0)
- [ ] Chama `ApostaService.registrar` via `apiCall` (nunca `fetch` cru)
- [ ] Trata `ApiError` (httpStatus + message) com feedback ao usuário
- [ ] Trata estado de carregamento (loading) durante o envio
- [ ] Relê e exibe os valores calculados que o backend retornou

### Comprovante
- [ ] Tela/componente de comprovante renderiza os dados retornados pelo backend
- [ ] Comprovante exibe: ID da aposta, modalidade, palpites, valor, data/hora, vendedor
- [ ] Layout do comprovante é compatível com largura de impressora térmica (preparação para Fase 3)

### Qualidade
- [ ] Sem cores hardcoded — usar tokens de `src/theme`
- [ ] Imports via alias `@/` (não caminhos relativos longos)
- [ ] Testes da camada de serviço (`ApostaService`) com mock do `apiClient`
- [ ] Teste de render da tela de aposta (estados: vazio, preenchido, erro)
- [ ] Cobertura mantém o threshold do projeto (80% lines/stmts/funcs, 70% branches)

## Subtarefas (ordem de execução)

1. [ ] Definir os tipos TS da aposta (`types/aposta.ts`) — modalidade, palpite, payload, resposta
2. [ ] Criar `services/apostaService.ts` com `registrar` e `listarModalidades`
3. [ ] Criar a tela de seleção de modalidade (`app/aposta/modalidade.tsx` ou similar)
4. [ ] Criar o componente `BichoGrid` (grade dos 25 bichos)
5. [ ] Criar o input de valor com máscara e validação
6. [ ] Criar a função que monta o `palpites` posicional (helper isolado e testável)
7. [ ] Criar a tela de confirmação/resumo
8. [ ] Integrar com `apostaService.registrar` e tratar erros/loading
9. [ ] Criar o componente `Comprovante` (layout pronto para térmica)
10. [ ] Escrever os testes (serviço + helper de palpites + render da tela)

## Dependências

- [[fase-0-regras]] — **bloqueante.** Regras das modalidades e formato real de `palpites`
- [[docs/README-AUTH]] — autenticação já funciona; usar `apiCall` que já injeta Bearer + refresh
- [[docs/regras-negocio#Jogo-do-Bicho]] — regras de validação (valor mín/máx, modalidades válidas)
- [[docs/plano#2.4]] — backend é a fonte de verdade para cálculo
- [[docs/plano#2.7]] — `palpites` é string posicional, não relacional
- Backend: classe REST de aposta precisa existir/estar mapeada (ver [[../zooloo/zooloo/CLAUDE]])

## Notas técnicas

- **`palpites` é string posicional**, não relacional. Não tente parsear/montar no app
  sem as amostras reais da Fase 0. Errar o formato aqui contamina todas as fases seguintes.
- **Datas vêm como string** em tabelas `system_*` do Adianti — tratar conversão ao exibir.
- **Envelope Adianti:** toda resposta é `{ status, data }` — o `apiClient` já desembrulha.
- Usar `apiCall<TipoResposta>({ class: 'XxxRestService', method: 'registrar', data: {...} })`.
- Pensar o comprovante já com a **largura da térmica** em mente (geralmente 32/48 colunas),
  mesmo que a impressão real só venha na Fase 3 — evita retrabalho de layout.
- Esta tela é o **molde** das outras modalidades. Componha em componentes reaproveitáveis
  (grid, input de valor, resumo, comprovante) em vez de hardcodar só para o Bicho.

## Riscos / pontos de atenção

- ❓ Formato exato de `palpites` ainda não confirmado → resolver na Fase 0 antes de avançar
- ❓ Quais modalidades do Bicho entram no MVP? (milhar, centena, dezena, grupo, etc.) → confirmar
- ❓ Validação de valor mín/máx é por modalidade ou global? → confirmar nas regras
- ❓ O backend já tem o endpoint de registro de aposta pronto? → checar antes de integrar

## Referências

- [[docs/CLAUDE]] — índice operacional do app
- [[docs/plano]] — roadmap e modelagem
- [[docs/regras-negocio]] — regras das modalidades
- [[tasks/roadmap]] — quadro Kanban geral
- [[daily/2026-05-24]] — diário do dia

## Log de progresso

<!-- Vá anotando aqui conforme avança. Ex:
- 2026-05-24: criei os tipos e o esqueleto do apostaService (mock)
-->