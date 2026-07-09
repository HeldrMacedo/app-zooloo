---
created: 2026-05-27
updated: 2026-05-27
fase: 2
status: concluido
tags: [tarefa, status/concluido, premios, jogo-do-bicho]
---

# Múltiplos Intervalos e Valores na Tela de Prêmios

> Alterar a lógica da tela de prêmios para permitir que o vendedor configure múltiplos intervalos de prêmio (com valores e modos "Por Cada/Rateado" distintos) para o mesmo palpite antes de adicioná-lo ao carrinho.

## Contexto e Motivação
Atualmente, a tela de prêmios limita o vendedor a escolher apenas um intervalo de prêmios por palpite e adicionar o valor. Na prática de vendas do Jogo do Bicho, é comum o cliente querer apostar no mesmo palpite em múltiplos prêmios com valores diferentes (ex: R$ 2,00 no 1º prêmio + R$ 1,00 do 1º ao 5º).

## Escopo

- **Dentro do escopo**:
  - Permitir adicionar múltiplos intervalos com valores e switches `bitT` ("Por Cada" / "Rateado") independentes para o mesmo conjunto de palpites.
  - Exibir uma listagem em tela dos intervalos adicionados ao palpite atual antes de enviar ao carrinho.
  - Atualizar dinamicamente o total estimado na tela de prêmios com a soma de todos os intervalos.
  - Ajustar o payload enviado ao backend (`BilheteRestService::registrar`) para conter os múltiplos jogos/intervalos gerados.
  - Validar a compatibilidade no backend (triggers e procedures do PostgreSQL) para registrar múltiplos intervalos.

- **Fora do escopo**:
  - Outras modalidades além da Milhar (continuam desativadas nesta etapa).
  - Edição de palpites anteriores após envio ao carrinho (deve ser feita a remoção e reinserção).

## Critérios de Aceite

- [x] A tela de prêmios exibe uma seção de "Intervalos Adicionados" listando cada prêmio cadastrado para o palpite.
- [x] Cada intervalo cadastrado na lista exibe:
  - O intervalo (ex: `1º ao 5º` ou `1º`)
  - O valor (ex: `R$ 2,00`)
  - O modo (ex: `Por Cada` ou `Rateado`)
  - Um botão para remover o intervalo específico.
- [x] O valor total estimado do palpite na tela reflete a soma de todos os intervalos inseridos.
- [x] O botão principal adiciona o palpite com toda a sua lista de prêmios ao carrinho.
- [x] O carrinho e a tela de Preview (Checkout) mostram corretamente os múltiplos intervalos e o somatório final estimado.
- [x] O envio do bilhete registra com sucesso no backend (com todos os intervalos processados pelas triggers do banco).

## Subtarefas

1. [x] **Análise do Backend & Triggers**:
   - Verificar se `BilheteRestService::registrar` recebe um array de `jogos` onde cada entrada representa um intervalo (o que simplificaria para o app apenas enviar múltiplos objetos no array).
   - Validar se a trigger no PostgreSQL calcula corretamente as comissões e prêmios para apostas com múltiplos intervalos para o mesmo palpite.
2. [x] **Refatoração da Tela de Prêmios (`app/aposta/premios.tsx`)**:
   - Criar estado local (`listaIntervalos`) para gerenciar as seleções temporárias de prêmios e valores do palpite atual.
   - Adicionar botão "Adicionar Intervalo" para acumular na lista local.
   - Adicionar componente visual da lista com opção de remoção de item.
3. [x] **Adaptação do Carrinho (`context/CarrinhoContext.tsx` e `types/aposta.ts`)**:
   - Verificar se é melhor desmembrar a estrutura para que cada intervalo seja um item separado no carrinho ou se o item do carrinho deve suportar uma lista de intervalos.
   *Nota: Se o backend espera que cada intervalo seja uma linha no array `jogos` do payload, podemos desmembrar em múltiplos `ApostaItem` no carrinho ou fazer essa quebra na tela de Preview.*
4. [x] **Atualização de Helpers & Cálculos**:
   - Ajustar `utils/apostaHelpers.ts` para somar os totais quando houver múltiplos intervalos.
5. [x] **Testes Automatizados**:
   - Atualizar a suíte de testes unitários para validar múltiplos intervalos no carrinho e no payload final.

## Referências
- [[docs/CLAUDE]]
- [[docs/Fluxo-app]]
- [[tasks/roadmap]]
