---
created: 2026-05-24
status: ativo
fonte: introspeccao-banco-postgresql
---

# Arquitetura de Dados — Zooloo

> Documento gerado por introspecção direta do banco `applications` (PostgreSQL 15).
> Reflete o estado real das tabelas, FKs, views e triggers em 2026-05-24.
> Relacionado: [[CLAUDE]], [[plano]], [[README-AUTH]]

---

## Visão Geral

O banco `applications` contém **79 tabelas** organizadas em 6 prefixos semânticos:

| Prefixo | Qtde | Domínio |
|---------|------|---------|
| `int_`  | 4    | Catálogos internos imutáveis (jogos, grupos, cálculos) |
| `cad_`  | 9    | Cadastros mestres (área, vendedor, extração, modalidade) |
| `cfg_`  | 11   | Configurações de negócio (cotação, limite, comissão) |
| `mov_`  | 11   | Movimentação transacional (bilhetes, sorteios, caixa) |
| `data_` | 1    | Auditoria de alterações |
| `mob_`  | 1    | Autenticação mobile (tokens JWT revogáveis) |
| `system_` | 25+ | Framework Adianti (usuários, grupos, permissões, logs) |

**Regra fundamental:** toda lógica de cálculo (comissão, prêmio, descarga) vive em
**23 funções/triggers PostgreSQL**. O app mobile **nunca calcula** — envia dados brutos
e relê os valores que os triggers preenchem.

**Banco original que está servindo de base é o jb ip: [localhost] e porta 5432, user postgres, senha postgres, esse banco só tem dados referente ao lotinha, quininha e seninha**
**Arquivo Bando de dados que serve como base, contendo dados do jogo bicho: C:\desenvolvimento\jogo_bicho.sql**

---

## Diagrama de Dependências (alto nível)

```
system_users ──────────────────────────────────────────────┐
                                                            │
int_jogo ──→ cad_modalidade ──→ cfg_area_cotacao           │
int_calculo_sorteio ──→ cad_extracao                       │
                                                            ▼
cad_area ──→ cad_coletor ──→ cad_vendedor ──→ cad_terminal
    │              │               │
    │              │               └──→ mov_jb ──→ mov_jb_sorteio ──→ mov_jb_sort_palpite
    │              │               └──→ mov_bilhetinho ──→ mov_bilhetinho_sorteio ──→ mov_bilhetinho_sort_palpite
    │              │               └──→ mov_caixa ──→ mov_caixa_lancamentos
    │              │
    └──→ cfg_area_extracao ──→ mov_sorteio
    └──→ cfg_area_cotacao
    └──→ cfg_area_limite
```

---

## 1. Catálogos Internos (`int_`)

### `int_jogo` — Tipos de Jogo (catálogo fixo)

Tabela-mestre imutável. Define os 37 tipos de jogos disponíveis no sistema.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `jogo_id` | integer PK | Identificador |
| `filtro_banca` | integer | **1=JB, 2=Quininha, 3=Seninha, 4=Lotinha** |
| `descricao_grupo` | varchar | Grupo visual (BILHETINHO, MILHAR, CENTENA, GRUPO, DEZENA, DUQUE, TERNO, PASSE, QUININHA, SENINHA, LOTINHA) |
| `descricao` | varchar(60) | Nome completo |
| `abreviacao` | varchar(10) | Código curto (M, C, D, G, DD, DG, etc.) |
| `tamanho_max` | integer | **Tamanho máximo do palpite em dígitos** |
| `qtd_colocacao_premio` | integer | Quantas colocações têm prêmio (1, 2 ou 3) |
| `informar_valores_modalidade` | char(1) | S=valor por modalidade, N=valor calculado automaticamente |
| `orientacao` | varchar(200) | Instrução de uso para cadastro |
| `habilitar_edicao_regular` | char(1) | S=edição normal, N=somente leitura |
| `ativo` | char(1) | S/N |

**Catálogo completo — jogos ativos relevantes para o app:**

| jogo_id | filtro_banca | descricao_grupo | abreviacao | tamanho_max | qtd_colocacao |
|---------|-------------|-----------------|------------|-------------|---------------|
| 2 | JB | MILHAR | M | 4 | 1 |
| 3 | JB | MILHAR | MI | 10 | 1 |
| 4 | JB | CENTENA | C | 3 | 1 |
| 5 | JB | CENTENA | CI | 10 | 1 |
| 6 | JB | GRUPO | G | 2 | 1 |
| 7 | JB | GRUPO | GCOMB | 5 | 1 |
| 8 | JB | DEZENA | D | 2 | 1 |
| 9 | JB | MILHAR | MC | 4 | 1 |
| 10 | JB | MILHAR | MCI | 10 | 1 |
| 11 | JB | DUQUE | DG1/5 | 5 | 2 |
| 12 | JB | DUQUE | DD | 5 | 2 |
| 13 | JB | TERNO | TG1/5 | 8 | 3 |
| 14 | JB | TERNO | TD | 8 | 3 |
| 20 | JB | MILHAR | MB | 4 | 1 |
| 22 | JB | MILHAR | MINST | 4 | 1 |
| 25 | Quininha | QUININHA | QUI | 2 | 1 |
| 27 | Seninha | SENINHA | SEN | 2 | 1 |
| 37 | Lotinha | LOTINHA | LOT | 2 | 1 |

> **Para o app:** `tamanho_max` define o limite do campo de palpite. `filtro_banca` identifica
> a qual banco/jogo pertence. `qtd_colocacao_premio` determina quantas colocações o usuário
> pode marcar ao apostar.

### `int_calculo_sorteio` — Tipos de Cálculo

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `calculo_id` | integer PK | |
| `descricao` | varchar | Nome do método de cálculo |
| `abreviacao` | varchar | |
| `orientacao` | varchar | |
| `premiacao_maxima` | integer | Máximo de prêmios por cálculo |
| `ativo` | char(1) | |

Atualmente só existe o cálculo `1 = SORTEIO DIGITADOS` (resultados digitados manualmente).

### `int_grupo` — Grupos/Animais do Jogo do Bicho

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `final_grupo_id` | integer PK | |
| `grupo` | char(2) | Código do grupo (01–25) |
| `descricao` | varchar(60) | Nome do animal |
| `ativo` | char(1) | |

### `int_config` — Configuração de Bancos

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `config_id` | integer PK | |
| `descricao` | varchar(60) | Nome da configuração |
| `nome_banca` | varchar(60) | Nome exibido |
| `filtro_banca` | integer | FK para identificação do banco |

---

## 2. Cadastros Mestres (`cad_`)

### `cad_area` — Áreas/Franquias

Unidade geográfica ou comercial que agrupa vendedores.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `area_id` | integer PK | |
| `descricao` | varchar(100) | Nome da área |
| `complemento` | varchar(100) | Info adicional |
| `ativo` | char(1) | default 'S' |

**FKs recebidas:** `cad_coletor`, `cad_vendedor`, `cfg_area_*`, `mov_jb`, `mov_bilhetinho`

### `cad_coletor` — Gerentes/Coletores

Supervisor entre área e vendedor. Pode ter acesso web.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `coletor_id` | integer PK | |
| `area_id` | integer FK→cad_area | |
| `nome` | varchar(100) | |
| `usuario_id` | bigint FK→system_users | Login no sistema |
| `acesso_web` | char(1) | Permissão painel web |
| `outras_areas` | char(1) | Pode ver outras áreas |
| `ativo` | char(1) | default 'S' |

### `cad_vendedor` — Vendedores (Ponto de Venda)

Entidade central do app. Cada login mobile retorna um `vendedor` com suas permissões.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `vendedor_id` | integer PK | |
| `area_id` | integer FK→cad_area | |
| `coletor_id` | integer FK→cad_coletor | |
| `nome` | varchar(100) | |
| `cep/rua/numero/bairro/cidade/uf` | varchar | Endereço |
| `comissao` | numeric(5,2) | % comissão padrão |
| `limite_venda` | numeric(15,2) | Limite de venda (por bilhete ou diário) |
| `tipo_limite` | char(1) | Tipo do limite (B=bilhete, D=diário) |
| `usuario_id` | bigint FK→system_users | Login associado |
| `treinamento` | char(1) | S=modo treinamento (não grava de verdade) |
| `ativo` | char(1) | default 'S' |
| **Permissões de cancelamento** | | |
| `pode_cancelar` | char(1) | S/N |
| `pode_cancelar_qtde` | smallint | Máximo de cancelamentos |
| `pode_cancelar_tempo` | time | Prazo limite para cancelar |
| **Permissões de reimpressão** | | |
| `pode_reimprimir` | char(1) | S/N |
| `pode_reimprimir_qtde` | smallint | Máximo de reimpressões |
| `pode_reimprimir_tempo` | time | Prazo limite |
| `pode_reimprimir_sort_naopg` | char(1) | Reimprimir sorteio não pago |
| `pode_reimprimir_sort_pago` | char(1) | Reimprimir sorteio já pago |
| `pode_reimprimir_outro` | char(1) | Reimprimir de outro vendedor |
| **Permissões de pagamento** | | |
| `pode_pagar` | char(1) | default 'S' |
| `pode_pagar_outro` | char(1) | Pagar prêmio de outro vendedor |
| **Controles internos** | | |
| `exibe_comissao` | char(1) | Mostrar comissão no app |
| `exibe_premiacao` | char(1) | Mostrar previsão de prêmio |
| `reimprimir_data` / `reimprimir_qtde` | date/smallint | Controle diário de reimpressões |

> **Para o app:** O payload de login devolve as permissões de `cad_vendedor` diretamente.
> Use esses flags para habilitar/desabilitar botões de cancelar, reimprimir e pagar.

### `cad_terminal` — Terminais (Maquinetas)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `terminal_id` | integer PK | |
| `vendedor_id` | integer FK→cad_vendedor | |
| `tipo` | varchar(10) | Tipo de hardware |
| `serial` | varchar(60) | Número de série da maquineta |
| `multi_usuario` | char(1) | Permite múltiplos usuários |
| `ativo` | char(1) | default 'S' |

### `cad_extracao` — Extrações (Sorteios recorrentes)

Define a programação de sorteios — quais dias da semana, horário, jogo.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `extracao_id` | integer PK | |
| `filtro_banca` | integer | 1=JB, 2=Quininha, 3=Seninha, 4=Lotinha |
| `descricao` | varchar(100) | Nome completo ("Federal da Manhã") |
| `descricao_mobile` | varchar(10) | **Abreviação para o app** ("FED-M") |
| `hora_limite` | time | Horário de corte para apostas |
| `segunda` a `domingo` | char(1) | S/N — dias em que ocorre |
| `premiacao_maxima` | integer | Limite máximo de prêmio |
| `ultimo_sorteio_numero` | integer | Sequência |
| `gerar_restante` | char(1) | Auto-gerar sorteios restantes |
| `extracao_instantanea` | char(1) | N=regular, S=instantânea |
| `calculo_id` | integer FK→int_calculo_sorteio | Método de cálculo |
| `limite_palpite` | numeric(15,2) | Limite por palpite nesta extração |
| `dia_sorteio_inicial` | date | Data de início |
| `ativo` | char(1) | |

### `cad_modalidade` — Modalidades de Aposta

Instância configurável de um `int_jogo`. Define multiplicadores e limites reais.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `modalidade_id` | integer PK | |
| `jogo_id` | integer FK→int_jogo | Tipo de jogo |
| `ordem` | integer | Ordem de exibição |
| `apresentacao` | varchar(60) | Nome de exibição no app |
| `multiplicador` | numeric(15,2) | Fator de multiplicação do prêmio |
| `limite_descarga` | numeric(15,2) | Limite de descarga (risco) |
| `limite_palpite` | numeric(15,2) | Limite por palpite |
| `limite_aceite` | numeric(15,2) | Limite de aceite por aposta |
| `multiplicador_colocacao_01..05` | numeric(15,2) | Multiplicador por colocação (1ª, 2ª... 5ª) |
| `limite_min_sorteio_diario` | numeric(15,2) | Mínimo diário por sorteio |
| `limite_min_sorteio_colocacao_diario` | numeric(15,2) | Mínimo diário por colocação |
| `ativo` | char(1) | |

### `cad_modalidade_jb` — Configurações extras para JB

Estende `cad_modalidade` com limites específicos do Jogo do Bicho.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `modalidade_id` | integer FK→cad_modalidade | (também é PK) |
| `multiplicador` | numeric(15,2) | |
| `limite_descarga` | numeric(15,2) | |
| `limite_palpite_min` | numeric(15,2) | Valor mínimo por palpite |
| `limite_palpite_max` | numeric(15,2) | Valor máximo por palpite |
| `limite_aceite` | numeric(15,2) | |
| `ativo` | char(1) | |

### `cad_modalidade_bilhetinho` — Configurações por colocação para Bilhetinho/Quininha/Seninha

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `modalidade_id` | integer FK→cad_modalidade | (também é PK) |
| `colocacao` | integer | Número da colocação (1ª, 2ª...) |
| `multiplicador` | numeric(15,2) | |
| `limite_descarga` | numeric(15,2) | |
| `limite_palpite` | numeric(15,2) | |
| `limite_aceite` | numeric(15,2) | |
| `ativo` | char(1) | |

### `cad_pessoas` — Clientes (opcional, LGPD)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `pessoa_id` | integer PK | |
| `fone` | varchar(15) | Telefone |
| `nome` | varchar(200) | |
| `cpf` | varchar(18) | |
| `endereco` | varchar(200) | |
| `email` | varchar(100) | |

---

## 3. Configurações de Negócio (`cfg_`)

### `cfg_parametros` — Parâmetros Globais do Sistema

Tabela singleton com configurações gerais da banca.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `nome_banca` | varchar(100) | Nome da banca (exibido no comprovante) |
| `cnpj/telefone/cidade/estado/site/email` | varchar | Dados de contato |
| `mensagem_01..05` | varchar(120) | Mensagens no rodapé do comprovante |
| `multiplas_extracoes` | char(1) | Permite apostar em múltiplas extrações |
| `valor_milhar_brinde` | numeric(15,2) | Valor fixo do brinde da milhar |
| `valor_bilhetinho` | numeric(15,2) | Valor fixo do bilhetinho |
| **Flags de jogos ativos** | | |
| `ativo_jb` | char(1) | default 'S' |
| `ativo_quininha` / `ativo_seninha` | char(1) | |
| `ativo_bilhetinho` / `ativo_lotinha` | char(1) | |
| `ativo_instantaneo` / `ativo_milharpremiada` | char(1) | |
| **Flags de regras Quininha/Seninha** | | |
| `sena_inc_quina` | char(1) | Sena inclui quina? |
| `sena_inc_quadra` | char(1) | Sena inclui quadra? |
| `quina_inc_quadra` | char(1) | Quina inclui quadra? |
| `quina_inc_terno` | char(1) | Quina inclui terno? |
| **Qtde de números por modalidade** | | |
| `qtde_num_mi` | smallint | Qtde números Milhar Invertida (default 10) |
| `qtde_num_ci` | smallint | Qtde números Centena Invertida (default 10) |
| `qtde_num_mci` | smallint | Qtde números Milhar+Centena Invertida (default 10) |
| `versao_app` | varchar(30) | Versão mínima do app aceita |
| `limite_extracao` | char(1) | Controlar limite por extração |

> **Para o app:** use `cfg_parametros` na carga inicial para determinar quais modalidades
> exibir na tela de apostas e as regras de cobertura de Quininha/Seninha.

### `cfg_area_extracao` — Extrações ativas por área

Quais sorteios estão disponíveis para cada área.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `area_extracao_id` | integer PK | |
| `area_id` | integer FK→cad_area | |
| `extracao_id` | integer FK→cad_extracao | |
| `ativo` | boolean | |

### `cfg_area_cotacao` — Multiplicadores por Área/Extração/Modalidade

Sobrepõe o multiplicador padrão de `cad_modalidade` para uma combinação específica.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `area_cotacao_id` | integer PK | |
| `area_id` | integer FK→cad_area | |
| `extracao_id` | integer FK→cad_extracao | (NULL = todas) |
| `modalidade_id` | integer FK→cad_modalidade | |
| `multiplicador` | numeric(15,2) | Valor sobreposto |

### `cfg_area_limite` — Limites de palpite por Área/Modalidade

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `area_limite_id` | integer PK | |
| `area_id` | integer FK→cad_area | |
| `modalidade_id` | integer FK→cad_modalidade | |
| `limite_palpite` | numeric(15,2) | |

### `cfg_area_comissao_modalidade` — Comissão por Área/Modalidade

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `area_comissao_modalidade_id` | integer PK | |
| `area_id` | integer FK→cad_area | |
| `modalidade_id` | integer FK→cad_modalidade | |
| `comissao` | numeric(15,2) | % comissão |

### `cfg_extracao_descarga` — Limite de descarga por Extração/Modalidade

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `extracao_descarga_id` | integer PK | |
| `extracao_id` | integer FK→cad_extracao | |
| `modalidade_id` | integer FK→cad_modalidade | |
| `limite_descarga` | numeric(15,2) | |

### `cfg_extracao_modalidade` — Modalidades disponíveis por Extração

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `extracao_modalidade_id` | integer PK | |
| `extracao_id` | integer FK→cad_extracao | |
| `modalidade_id` | integer FK→cad_modalidade | |

### `cfg_palpite_cotado` — Cotações especiais por palpite

Permite definir um multiplicador diferente para um palpite específico.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `palpite_cotado_id` | integer PK | |
| `modalidade_id` | integer FK→cad_modalidade | |
| `palpite` | varchar(10) | Valor do palpite |
| `cotacao` | numeric(5,2) | Multiplicador especial |
| `ativo` | char(1) | |

### `cfg_grade_comissao` / `cfg_grade_comissao_itens` — Grade de comissões

| cfg_grade_comissao | Descrição |
|---|---|
| `grade_comissao_id` PK | |
| `descricao` | Nome da grade |

| cfg_grade_comissao_itens | Descrição |
|---|---|
| `grade_comissao_itens_id` PK | |
| `grade_comissao_id` FK | |
| `modalidade_id` FK | |
| `comissao` numeric(5,2) | |

### `cfg_vendedor_mod_comissao` — Comissão específica por Vendedor/Modalidade/Área

Overrides individuais para vendedores com comissão diferenciada.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `vendedor_mod_comissao_id` PK | | |
| `vendedor_id` FK→cad_vendedor | | |
| `area_id` FK→cad_area | | |
| `modalidade_id` FK→cad_modalidade | | |
| `comissao` | numeric(5,2) | |

### `cfg_coletor_area` — Áreas que um Coletor pode acessar

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `coletor_area_id` PK | | |
| `coletor_id` FK→cad_coletor | | |
| `area_id` FK→cad_area | | |
| `ativo` | boolean | |
| `nome` | varchar | |

---

## 4. Movimentação Transacional (`mov_`)

### `mov_sorteio` — Ocorrências de Sorteio

Instância de uma extração em uma data específica. É para aqui que os bilhetes apontam.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `sorteio_id` | integer PK | |
| `extracao_id` | integer FK→cad_extracao | |
| `sorteio_numero` | integer | Número sequencial |
| `data_sorteio` | date | |
| `hora_sorteio` | time | |
| `situacao` | char(1) | **'A'=Aberto, 'F'=Fechado, 'S'=Sorteado** |
| `numeros_sorteados` | varchar(200) | Resultado separado por vírgula |

---

### Estrutura de Bilhetes — Jogo do Bicho (JB)

O bilhete do JB é composto por 3 tabelas encadeadas:

```
mov_jb (bilhete-cabeçalho)
  └── mov_jb_sorteio (1 linha por sorteio selecionado)
        └── mov_jb_sort_palpite (1 linha por palpite/modalidade)
```

#### `mov_jb` — Bilhete JB (cabeçalho)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `jb_id` | integer PK | **NSU do bilhete** |
| `area_id` | integer FK→cad_area | |
| `coletor_id` | integer FK→cad_coletor | |
| `terminal_id` | integer FK→cad_terminal | |
| `vendedor_id` | integer FK→cad_vendedor | |
| `sorteios_ids` | varchar(100) | IDs dos sorteios (ex: "12,13,14") |
| `sorteios_quantidade` | integer | default 1 |
| `bilhete_numero` | integer | Número do bilhete (poule) |
| `data_hora` | timestamp | Data/hora da aposta |
| `data_hora_servidor` | timestamp | Carimbo do servidor |
| `nome_cliente` | varchar(60) | Opcional |
| `fone_cliente` | varchar(30) | Opcional |
| `total_bilhete` | numeric(15,2) | **Calculado por trigger** |
| `comissao_valor` | numeric(15,2) | **Calculado por trigger** |
| `comissao_pago` | char(1) | default 'N' |
| `string_autorizacao` | varchar(60) | **Hash de autenticidade** |
| `cancelado` | char(1) | default 'N' |
| `cancelado_motivo` | varchar(200) | |
| `data_cancelamento` | timestamp | |
| `data_reimpressao` | timestamp | |
| `reimpressao` | integer | Contador de reimpressões |

#### `mov_jb_sorteio` — Detalhes por Sorteio do bilhete JB

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `jb_sorteio_id` | integer PK | |
| `jb_id` | integer FK→mov_jb | |
| `sorteio_id` | integer FK→mov_sorteio | |
| `modalidade_id` | integer FK→cad_modalidade | |
| `palpites` | varchar(2000) | **String posicional dos palpites** |
| `palpites_quantidade` | integer | Qtde de palpites |
| `colocao_inicial` | integer | Primeira colocação apostada |
| `colocao_final` | integer | Última colocação apostada |
| `valor_palpites` | numeric(15,2) | Valor por palpite |
| `total_sorteio` | numeric(15,2) | **Calculado por trigger** |
| `comissao_sorteio` | numeric(15,2) | **Calculado por trigger** |
| `previsao_premio` | numeric(15,2) | **Calculado por trigger** |
| `sorteado` | char(1) | default 'N' — resultado lançado? |
| `sorteado_colocacao` | varchar(30) | Colocações premiadas |
| `sorteado_valor` | numeric(15,2) | Valor do prêmio calculado |
| `sorteado_valor_pago` | numeric(15,2) | default 0 — valor efetivamente pago |
| `sorteado_pago` | char(1) | default 'N' |

#### `mov_jb_sort_palpite` — Palpites individuais do bilhete JB

**Tabela mais granular.** Um registro por palpite × sorteio.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `jb_palpites_id` | integer PK | |
| `jb_sorteio_id` | integer FK→mov_jb_sorteio | |
| `jb_id` | integer FK→mov_jb | |
| `sorteio_id` | integer FK→mov_sorteio | |
| `modalidade_id` | integer FK→cad_modalidade | |
| `palpite` | varchar(200) | Valor do palpite |
| `valor_palpite` | numeric(15,2) | Valor apostado neste palpite |
| `jogou_colocacao_01..10` | char(1) | S/N — apostou na colocação N? |
| `premio_colocacao_01..10` | numeric(15,2) | **Prêmio calculado por trigger** |
| `ganhou_colocacao_01..10` | char(1) | default 'N' — ganhou na colocação N? |
| `pago_colocacao_01..10` | char(1) | default 'N' — foi pago? |
| `pago_data_colocacao_01..10` | timestamp | Data do pagamento |
| `processado_colocacao_01..10` | char(1) | default 'N' — trigger processou? |
| `ganhou_premio_total` | numeric | default 0 |
| `pago_premio_total` | char(1) | default 'N' |
| `pago_data_premio_total` | timestamp | |
| `pago_usuario_id` | integer FK→system_users | Quem pagou |

> **Para o app:** ao criar um bilhete JB, insere-se `mov_jb` + `mov_jb_sorteio`.
> Os triggers preenchem `total_bilhete`, `comissao_sorteio`, `previsao_premio`.
> O app **relê** esses valores após o INSERT — nunca os calcula.

---

### Estrutura de Bilhetes — Bilhetinho/Quininha/Seninha

Mesma estrutura 3-nível, com variações de colunas:

```
mov_bilhetinho (cabeçalho)
  └── mov_bilhetinho_sorteio (por sorteio)
        └── mov_bilhetinho_sort_palpite (por palpite — 5 colocações)
```

#### `mov_bilhetinho` — Bilhete Bilhetinho/Quininha/Seninha

Idêntico ao `mov_jb` com coluna `total_bilhetinho` (em vez de `total_bilhete`).

#### `mov_bilhetinho_sorteio` — Detalhes por Sorteio

| Coluna | Tipo | Notas vs mov_jb_sorteio |
|--------|------|------------------------|
| Mesmas colunas principais | | |
| `palpites` | varchar(500) | Menor que JB (500 vs 2000) |
| `colocao_inicial/final` | integer | Igual |
| `sorteado_colocacao` | varchar(30) | default '0' |

#### `mov_bilhetinho_sort_palpite` — Palpites individuais (5 colocações)

| Coluna | Tipo | Notas vs mov_jb_sort_palpite |
|--------|------|------------------------------|
| `palpite` | char(3) | Máx 3 chars vs 200 |
| `jogou_colocacao_01..05` | char(1) | Só 5 colocações (JB tem 10) |
| `premio_colocacao_01..05` | numeric(15,2) | |
| `ganhou_colocacao_01..05` | char(1) | |

---

### `mov_caixa` — Caixa Diário do Vendedor

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `caixa_id` | integer PK | |
| `data` | date | default CURRENT_DATE |
| `vendedor_id` | integer FK→cad_vendedor | |
| `anterior` | numeric(15,2) | Saldo do dia anterior |
| `entrada` | numeric(15,2) | Total de apostas |
| `saida` | numeric(15,2) | Total de prêmios pagos |
| `saldo` | numeric(15,2) | Calculado: anterior + entrada - saida |
| `fechado` | char(1) | |

### `mov_caixa_lancamentos` — Lançamentos do Caixa

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `lancamento_id` | integer PK | |
| `vendedor_id` | integer FK→cad_vendedor | |
| `operacao_id` | integer FK→mov_caixa_operacao | |
| `historico` | varchar(1000) | Descrição do lançamento |
| `valor` | numeric(15,2) | |
| `tipo_dc` | char(1) | D=débito, C=crédito |
| `data` | timestamp | |
| `lancado_usuario_id` | integer FK→system_users | |

### `mov_caixa_operacao` — Tipos de Operação do Caixa

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `operacao_id` | integer PK | |
| `descricao` | varchar(50) | |
| `tipo` | varchar(20) | |
| `ativo` | char(1) | |

---

## 5. Auditoria (`data_`)

### `data_jb_sort_palpite` — Log de alterações em palpites JB

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `data_id` | integer PK | |
| `jb_palpites_id` | integer FK→mov_jb_sort_palpite | Palpite alterado |
| `data_hora` | timestamp | |
| `id_usuario` | integer FK→system_users | Quem alterou |
| `nome` | varchar | Nome do usuário |

---

## 6. Autenticação Mobile (`mob_`)

### `mob_auth_token` — Tokens JWT Revogáveis

Cada token emitido tem um registro aqui. Permite revogar por JTI (logout seguro).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `jti` | varchar(64) **PK** | JWT ID único do token |
| `user_id` | integer | ID do usuário (`system_users.id`) |
| `token_type` | varchar(10) | **'access'** (15min) ou **'refresh'** (30 dias) |
| `parent_jti` | varchar(64) | JTI do token de refresh que gerou este |
| `issued_at` | timestamp | default now() |
| `expires_at` | timestamp | |
| `revoked` | boolean | default false |
| `revoked_at` | timestamp | |
| `revoked_reason` | varchar(40) | 'logout', 'rotation', 'security' |
| `user_agent` | varchar(255) | Device do cliente |
| `ip_address` | varchar(45) | IPv4 ou IPv6 |

> Documentação completa do fluxo JWT: [[README-AUTH]]

---

## 7. Views

| View | Propósito |
|------|-----------|
| `vw_sorteio` | Sorteios abertos com dados da extração (usado por `SorteioRestService.abertos`) |
| `vw_vendajb` | Bilhetes JB completos com modalidade, extração, valores calculados — consulta principal de histórico |
| `vw_venda` | Equivalente para Bilhetinho/Quininha/Seninha |
| `vw_confere` | Palpites JB com modalidade — conferência de resultados |
| `vw_venda_papitejb` | Palpites JB com jogo e modalidade — versão simplificada |
| `vw_premiojb` | Foco em prêmios: área, vendedor, total/comissão/líquido/pago |
| `vw_comprovante` | Dados do comprovante Bilhetinho |
| `vw_venda` | Vendas Bilhetinho com situação e sorteio |
| `vw_caixa_result` | Saldo calculado do caixa (anterior + entrada - saida) |
| `vw_modalidade` | Modalidades com multiplicador resolvido (herda de JB para invertidas/combinadas) |
| `varnumerossorteados` | Números sorteados para consulta |

---

## 8. Triggers e Funções

As 23 funções PostgreSQL implementam toda a lógica de negócio:

| Função | Trigger em | O que faz |
|--------|-----------|-----------|
| `func_trg_mv_jb_datahora` | mov_jb INSERT | Preenche `data_hora_servidor` com now() |
| `func_trg_mv_jb_sorteio_comissao` | mov_jb_sorteio INSERT/UPDATE | Calcula `comissao_sorteio` com base na % do vendedor e área |
| `func_trg_mov_jb_sorteio_previsao` | mov_jb_sorteio INSERT/UPDATE | Calcula `previsao_premio` = valor × multiplicador |
| `func_trg_mv_jb_sorteio_atualiza_palpites` | mov_jb_sorteio UPDATE | Sincroniza campos calculados com mov_jb_sort_palpite |
| `func_trg_mov_jb_sorteio_instantaneo` | mov_jb_sorteio INSERT | Lógica especial para sorteios instantâneos |
| `func_trg_mv_jb_sorteio_pagamento` | mov_jb_sort_palpite UPDATE | Processa pagamento de prêmio, atualiza pago_colocacao_NN |
| `func_trg_bilhetinho_bilhete` | mov_bilhetinho INSERT | Calcula total e comissão do bilhetinho |
| `func_trg_mv_sorteio_regular` | mov_sorteio UPDATE | Processa resultado: varre bilhetes, determina ganhadores |
| `func_trg_mv_sorteio_qui_sen` | mov_sorteio UPDATE | Processa resultado Quininha/Seninha |
| `func_trg_mv_sorteio_lotinha` | mov_sorteio UPDATE | Processa resultado Lotinha |
| `func_trg_mv_sorteio_bilhetinho` | mov_sorteio UPDATE | Processa resultado Bilhetinho |
| `func_trg_mv_sorteio_cria_novo_sorteio_aberto` | mov_sorteio UPDATE | Gera próxima ocorrência automaticamente |
| `func_trg_cad_extracao_criar_sorteio` | cad_extracao INSERT | Gera sorteios iniciais ao criar extração |
| `func_trg_cad_extracao_validacao` | cad_extracao INSERT/UPDATE | Valida configuração da extração |
| `func_trg_cad_modalidade_mist` | cad_modalidade INSERT/UPDATE | Valida/atualiza modalidades mistas (MC, MCD, etc.) |
| `func_trg_mov_caixa_calcula_saldo` | mov_caixa UPDATE | Recalcula saldo |
| `func_trg_ai1_mov_caixa_lancamentos` | mov_caixa_lancamentos INSERT | Atualiza entrada/saída no caixa |
| `func_trg_mov_caixa_lancamentos` | mov_caixa_lancamentos INSERT/UPDATE | Lançamento contábil |
| `func_sorteio_milhar_instanaea` | — | Helper para sorteio instantâneo |
| `extraidigitosdireitaarray` | — | Extrai dígitos da direita (helper de cálculo) |
| `reset_sequence` / `reset_sequence1` | — | Utilitários de manutenção |

---

## 9. Campo `palpites` — Formato da String Posicional

**Esta é a chave para implementar as apostas no app.**

O campo `mov_jb_sorteio.palpites` (varchar 2000) e `mov_bilhetinho_sorteio.palpites`
(varchar 500) armazenam todos os palpites de uma modalidade em um único campo string.

### Regras gerais observadas no schema:

- O `tamanho_max` em `int_jogo` define o número de dígitos por palpite individual
- `palpites_quantidade` indica quantos palpites há no campo
- A view `vw_confere` separa `palpites` em `mov_jb_sort_palpite.palpite` (varchar 200)
  mostrando que o parsing ocorre no backend

> **Bloqueante Fase 0:** o formato exato (separador, padding) ainda precisa ser confirmado
> com amostras reais do banco. Ver [[plano#2.7]] e [[bugs/2025-05-24-formato-palpites]] se criado.

---

## 10. Hierarquia de Limites (precedência)

O sistema usa uma hierarquia de sobrescrita para calcular o limite e cotação efetivos:

```
cfg_palpite_cotado (palpite específico)  ← maior precedência
    ↓
cfg_area_cotacao (área + extração + modalidade)
    ↓
cfg_area_limite (área + modalidade)
    ↓
cad_extracao.limite_palpite (por extração)
    ↓
cad_modalidade.limite_palpite (padrão da modalidade)  ← menor precedência
```

A comissão segue hierarquia similar:
```
cfg_vendedor_mod_comissao (vendedor específico)
    ↓
cfg_area_comissao_modalidade (por área)
    ↓
cad_vendedor.comissao (% padrão do vendedor)
```

---

## 11. Resumo de Chaves para o App Mobile

| O app precisa de... | Busca em... | Campo-chave |
|--------------------|-------------|-------------|
| Login / token | `ApplicationAuthenticationRestService` | `cad_vendedor.usuario_id` → `system_users` |
| Permissões do vendedor | `cad_vendedor` (retornado no login) | `pode_cancelar`, `pode_reimprimir`, `pode_pagar` |
| Lista de sorteios abertos | `vw_sorteio` | `situacao = 'A'`, filtrando por área |
| Modalidades disponíveis | `cfg_extracao_modalidade` + `cad_modalidade` | Cruzar `extracao_id` com `jogo_id` |
| Flags de jogos ativos | `cfg_parametros` | `ativo_jb`, `ativo_quininha`, etc. |
| Criar bilhete JB | `mov_jb` + `mov_jb_sorteio` | Triggers calculam tudo |
| Criar bilhete Bilhetinho | `mov_bilhetinho` + `mov_bilhetinho_sorteio` | Idem |
| Comprovante | `vw_vendajb` ou `vw_venda` | Por `jb_id` ou `bilhetinho_id` |
| Hash do comprovante | `mov_jb.string_autorizacao` | Calculado por trigger no INSERT |

---

## Ver também

- [[CLAUDE]] — índice operacional do app
- [[plano]] — roadmap e modelagem detalhada de domínio
- [[README-AUTH]] — fluxo completo de autenticação JWT
