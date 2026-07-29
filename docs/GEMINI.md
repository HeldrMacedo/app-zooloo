# GEMINI.md — Índice e Contexto para o App Zooloo

Bem-vindo ao índice de contexto da inteligência artificial para o projeto **App Zooloo**.
Este arquivo atua como o ponto central para compreender as regras de negócio, a arquitetura e conectar as documentações essenciais do sistema.

## 📌 Links Rápidos para Documentação (O Segundo Cérebro)

Aqui estão os documentos fundamentais do projeto. Siga os links para aprofundar em cada área:

- 📖 **Plano Técnico e Roadmap:** [[../plano.md]] - Detalhes do escopo, análise do banco PostgreSQL, catálogo de modalidades e o plano de desenvolvimento.
- 🏗️ **Arquitetura de Dados:** [[arquitetura-dados.md]] - Estrutura do banco de dados oficial `applications` (prefixos `int_`, `cad_`, `cfg_`, `mov_`), triggers e dependências. (Nota: O banco `jb` é a referência legada).
- 🔐 **Autenticação e Segurança:** [[README-AUTH.md]] - Fluxo de JWT (access/refresh), armazenamento no `SecureStore`, funcionamento offline e integração com Adianti.
- 📜 **Regras de Negócio (Fase 2):** [[regras-negocio.md]] - Regras específicas das apostas (ex: Jogo do Bicho), validações e limites.
- 🤖 **Índice Operacional (Claude):** [[CLAUDE.md]] - Índice operacional original do projeto.
- 🏛️ **Sistema Base Legado:** `jballsystem` (localizado na pasta irmã `../../jballsystem` ou `desenvolvimento/jballsystem`) - Sistema Java/Spring Boot legado de onde regras e schemas foram derivados.
- 🗺️ **Guia do Obsidian:** [[../roadmap-obsidian.md]] - Como a documentação está estruturada para o sistema de "segundo cérebro" usando links Markdown.

---

## 🏗️ Arquitetura e Stack Tecnológico

O App Zooloo é o Ponto de Venda (PDV) móvel focado em celulares e maquinetas POS Android.

- **Stack Core:** Expo SDK 54, React Native 0.81, React 19, TypeScript (strict).
- **Roteamento e UI:** Expo Router (file-based em `app/`), estilos com React Native `StyleSheet`.
- **Estilização:** Evite cores hardcoded nas telas novas. Use tokens globais em `assets/styles/colors.ts` (e `fontFamily.ts` quando aplicável) e `StyleSheet` na própria tela.
- **Comunicação REST:**
  - Chamadas são feitas EXCLUSIVAMENTE via `apiCall` (encapsulado em `services/apiClient.ts`).
  - O wrapper lida proativamente com refresh de tokens (< 60s), injeta o cabeçalho `Bearer` e empacota falhas na classe `ApiError`.
- **Armazenamento:** `expo-secure-store` (tokens) e `@react-native-async-storage/async-storage` (dados de usuário e offline).

---

## ⚖️ Regra de Ouro (Inegociável)

> ⚠️ **O app é uma interface estritamente operacional.**

1. **NUNCA** calcule prêmios, comissões, limites ou tente verificar ganhadores no lado do cliente (app).
2. Todo cálculo e regra de precificação ocorre **nas triggers do PostgreSQL** e é processado pelos endpoints REST do backend.
3. O app deve apenas **coletar os dados brutos** da aposta (modalidade, seleção, valor, palpites), enviá-los ao backend e **re-ler os valores calculados** retornados para exibir nos comprovantes.
4. O campo `palpites` é uma **string posicional** gerada conforme a modalidade; não tente parseá-la semanticamente no app sem os exemplos corretos.

---

## 🚀 Fluxos Operacionais Críticos

1. **Inicialização e Autenticação:**
   - O app usa um access token curto (15 min) e um refresh token longo (30 dias rotativo com revogação).
   - O sistema de sessão (`AuthContext.tsx` via `useAuth()`) é a única fonte de verdade para acesso.
   - O app pode inicializar offline se o token JWT local ainda for válido.

2. **Carga de Dados Base e Permissões:**
   - As funcionalidades do app dependem de permissões atreladas ao usuário logado na tabela `cad_vendedor` (ex: `pode_cancelar`, `exibe_comissao`, `pode_reimprimir`). O app deve adaptar a UI dinamicamente.

3. **Registrando Apostas:**
   - O desenvolvimento e as apostas funcionam sob o esquema: Seleção de Jogo → Seleção de Modalidade → Preenchimento → Carrinho → Backend → Comprovante.
   - **Impressão:** As telas (em particular do comprovante) devem ser desenhadas pensando na largura estreita da impressora térmica (Bluetooth ou SDK interno POS), evitando o retrabalho em Fases posteriores.
