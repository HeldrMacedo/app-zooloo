---
name: zooloo-regras-negocio
description: Regras comerciais e de modelagem para apostas e modalidades de jogos do app Zooloo. Use ao criar ou editar fluxos de aposta (Bicho, Lotinha, Quininha, Seninha).
---

# Regras de Negócio e Jogos do Zooloo

Esta skill orienta o agente em como desenvolver telas e integrações para o fluxo de apostas das modalidades: **Jogo do Bicho, Lotinha, Quininha e Seninha**.

## Contexto de Negócio

Qualquer fluxo de aposta deve seguir a risca os seguintes limites e modelagens mapeados do banco PostgreSQL:
- **Catálogo de Jogos (`int_jogo`):** 
  - Jogo do Bicho (`filtro_banca = 1`)
  - Quininha (`filtro_banca = 2`)
  - Seninha (`filtro_banca = 3`)
  - Lotinha (`filtro_banca = 4`)
- O app deve buscar os parâmetros gerais em `cfg_parametros` para habilitar ou desabilitar cada um dos jogos (usando as flags `ativo_jb`, `ativo_lotinha`, etc.).

## 🛠️ Validação de Palpites no App

Ao criar a tela de entrada de palpites, garanta que o app valida no lado cliente o básico antes de submeter ao backend:
1. **Tamanho Máximo do Palpite (`tamanho_max`):** O comprimento dos dígitos do palpite deve ser validado com base no catálogo `int_jogo` do backend (Ex: Milhar = 4 dígitos, Centena = 3 dígitos, Grupo = 2 dígitos entre 01-25).
2. **Formato Posicional de Palpites:** O backend espera que o campo `palpites` seja uma string concatenada contendo as seleções (e não registros relacionais). Respeite rigorosamente a formatação do Jogo do Bicho extraída na Fase 0 antes de enviar os dados.
3. **Colocações:** Garanta que as colocações escolhidas (1º ao 5º, ou apenas 1º) estejam dentro da quantidade de premiações permitidas (`qtd_colocacao_premio`).
4. **Valor Mínimo e Máximo:** Valide o valor do palpite contra as regras de `cad_modalidade_jb` ou `cad_modalidade_bilhetinho`.

## 🔒 Comunicação Transacional com o Banco

1. **Envelope de Aposta:**
   Para criar uma aposta (Fluxo A de Bicho/Lotinha/Qui/Sen), envie as informações de cabeçalho para criar o bilhete em `mov_jb` (vendedor, terminal, área, cliente, etc.) e o array de sorteios em `mov_jb_sorteio` contendo os palpites e valores.
2. **Idempotência:**
   Como o banco não possui uma coluna nativa de idempotência, crie e anexe um UUID temporário ou utilize o hash do comprovante no fluxo de envio para evitar registros duplicados em caso de quedas de conexão ou retentativas.
3. **Leitura de Retorno:**
   Ao realizar o POST de registro com `apostaService.registrar`, leia os campos populados pelas triggers do banco, como `previsao_premio` e `comissao_sorteio`, e injete-os na tela de sucesso/comprovante. **Nunca faça esses cálculos localmente.**

## 🖨️ Formato do Comprovante (Largura Térmica)

Ao desenvolver a tela ou componente de comprovante de aposta:
- O layout deve ser desenhado nativamente com restrição de largura (tipicamente 32 ou 48 colunas).
- Estruture o componente de forma limpa usando texto monoespaçado para que o mesmo layout seja adaptável para a impressão física por Bluetooth ESC/POS ou SDK de maquinetas na Fase 3.
