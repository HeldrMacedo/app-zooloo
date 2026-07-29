# Regras do Projeto Zooloo (Workspace Rules)

Este arquivo define as diretrizes arquiteturais, restrições e regras de negócio inegociáveis do projeto Zooloo que todo agente inteligente deve seguir ao modificar ou estender o código.

---

## ⚖️ Regra de Ouro (Inegociável)

**O app é estritamente uma interface operacional.**

1. **NUNCA** implemente lógica de cálculo de prêmios, comissões, limites de apostas, ou lógica de validação de ganhadores no frontend (React Native/Expo).
2. Toda a inteligência comercial, precificação, limites de cotação e validação reside no banco de dados oficial do novo projeto (**`applications`** no PostgreSQL) e no backend (PHP/Adianti). O banco **`jb`** é estritamente uma referência legada e não é utilizado em tempo de execução.
3. O app deve apenas empacotar e enviar os dados brutos da aposta e, em seguida, **re-ler os valores calculados retornados pelo backend** para exibir na interface e gerar o comprovante.
4. Qualquer tentativa de violar essa regra gerará bugs catastróficos de divergência de valores.

---

## 🏗️ Stack de Desenvolvimento e Padrões de Código

- **Runtime:** Expo SDK 54, React Native 0.81, React 19.
- **Linguagem:** TypeScript (modo estrito).
- **Roteamento:** Expo Router (roteamento baseado em arquivos na pasta `app/`).
- **Navegação:** O arquivo `app/_layout.tsx` gerencia o redirecionamento de segurança entre `/login` e `(tabs)`.
- **Estilos:** React Native `StyleSheet` por tela; tokens globais em `assets/styles/` (`colors.ts`, `fontFamily.ts`).
- **Importações:** Use caminhos absolutos com alias `@/` (ex: `@/services/auth`), nunca caminhos relativos longos (ex: `../../services/auth`).
- **Tema / cores:** Não use cores hardcoded (hex solto). Use sempre os tokens de `assets/styles/colors.ts` e estilos locais com `StyleSheet.create` na própria tela.

---

## 🔌 Comunicação com o Backend

- **Único ponto de chamada:** Toda requisição HTTPS protegida com JWT deve usar o wrapper `apiCall` de `services/apiClient.ts`.
- **Nunca** use a API nativa `fetch` ou instâncias cruas sem autorização, exceto para chamadas públicas como `login` ou `refreshToken` (usando `{ skipAuth: true }`).
- `apiCall` resolve automaticamente a injeção do token Bearer, trata o refresh proativo quando a validade está próxima do limite (< 60s) e realiza tentativas transparentes em erros 401.
- Erros de rede e do servidor devem ser traduzidos e encapsulados como instâncias de `ApiError` (`httpStatus` e `message`).

---

## 📁 Estrutura de Documentação do Projeto (Segundo Cérebro)

Antes de fazer qualquer alteração arquitetural, leia a documentação correspondente em `docs/`:

- **Indice Geral:** [[docs/GEMINI.md]]
- **Histórico/Operações:** [[docs/CLAUDE.md]]
- **Modelagem do Banco:** [[docs/arquitetura-dados.md]]
- **Fluxo de Autenticação:** [[docs/README-AUTH.md]]
- **Regras do Jogo/Fases:** [[docs/regras-negocio.md]] / [[plano.md]]
