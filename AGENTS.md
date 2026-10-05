# AGENTS.md — App Zooloo (mobile)

Mapa para agentes de IA (Claude, Codex, Gemini, Kilo...). Este arquivo é curto de propósito:
ele aponta para onde o conhecimento mora. Não copie detalhes aqui — atualize o doc de destino.

PDV móvel (Expo SDK 54 / React Native 0.81 / TypeScript strict) para registrar apostas de
**Jogo do Bicho, Lotinha, Quininha e Seninha**. Roda no celular do vendedor e em maquinetas
POS Android com impressora térmica. Backend PHP/Adianti em repo separado (`../zooloo`).

## Regra de ouro (inegociável)

O app é **interface operacional**. Ele **nunca** calcula prêmio, comissão, limite de aposta
nem valida ganhador. Isso mora nas triggers do PostgreSQL / backend. O app empacota os dados
brutos, envia, e **relê** os valores calculados da resposta para tela e comprovante.
Detalhes e o limite entre "total estimado para UX" e "valor oficial":
[docs/design-docs/golden-principles.md](docs/design-docs/golden-principles.md).

## Onde está cada coisa

| Preciso de... | Leia |
|---|---|
| Camadas, pastas, fluxo de dados, impressão | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Invariantes do código (o que nunca fazer) | [docs/design-docs/golden-principles.md](docs/design-docs/golden-principles.md) |
| Regras dos jogos, modalidades, formato de `palpites` | [docs/product-specs/regras-jogo.md](docs/product-specs/regras-jogo.md) |
| Fluxo de telas e carrinho | [docs/product-specs/fluxo-app.md](docs/product-specs/fluxo-app.md) |
| Autenticação, tokens, terminal, offline | [docs/design-docs/autenticacao.md](docs/design-docs/autenticacao.md) |
| Plano técnico original (domínio, banco, roadmap) | [docs/design-docs/plano.md](docs/design-docs/plano.md) |
| Decisões de arquitetura (ADRs) | [docs/design-docs/adr/](docs/design-docs/adr/) |
| Schema Postgres, prefixos `int_/cad_/cfg_/mov_`, triggers | [docs/references/arquitetura-dados.md](docs/references/arquitetura-dados.md) |
| Contrato com o backend (classes REST usadas) | [docs/references/backend-zooloo.md](docs/references/backend-zooloo.md) |
| App legado de referência (`app-base`, decompilado) | [docs/references/app-base-legado.md](docs/references/app-base-legado.md) |
| O que está em andamento / feito | [docs/exec-plans/README.md](docs/exec-plans/README.md) |
| Dívida técnica conhecida | [docs/exec-plans/tech-debt.md](docs/exec-plans/tech-debt.md) |
| Nota de qualidade por área | [docs/QUALITY_SCORE.md](docs/QUALITY_SCORE.md) |

Em dúvida sobre auth, regras de aposta ou banco: **leia o doc antes de deduzir pelo código.**

## Comandos

```bash
npm start              # Expo dev server
npm run android        # Android (emulador ou device)
npm run check          # lint + typecheck + testes + docs:check — rode antes de dizer "pronto"
npm run lint           # eslint (config expo)
npm run typecheck      # tsc --noEmit
npm test               # Jest completo
npm run test:coverage  # cobertura (80% linhas/funções/statements, 70% branches)
npm run docs:check     # links da base de conhecimento + tamanho deste arquivo
npx jest __tests__/services/apostaService.test.ts   # um arquivo
npx jest -t "nome do teste"                          # um teste
```

APK para maquineta POS:

```bash
cd android && ./gradlew assembleRelease -PreactNativeArchitectures=armeabi-v7a,arm64-v8a
adb install -r app/build/outputs/apk/release/app-release.apk
```

Dev client no device: `npx expo start --dev-client` (mesma Wi-Fi, ou `adb reverse tcp:8081 tcp:8081`).

## Como trabalhar aqui

1. **Antes de codar:** ache o exec-plan ativo em `docs/exec-plans/active/`. Trabalho novo com
   mais de um passo ganha um plano novo ali (template: `templates/nova-tarefa.md`).
2. **Specs/designs** vão para `docs/design-docs/`; **planos** para `docs/exec-plans/active/`.
   Isso vale também para skills que sugerem `docs/superpowers/...` — use estas pastas.
3. **Decisão que muda arquitetura** vira ADR em `docs/design-docs/adr/`
   (template: `templates/nova-decisao-arquitetural.md`).
4. **Ao terminar:** `npm run check` verde, plano movido para `completed/` com log de progresso,
   `tech-debt.md` atualizado se você deixou algo para depois.
5. **Mudou o contrato REST?** A mudança nasce no backend (`../zooloo`), que é dono do contrato.
   Atualize `docs/references/backend-zooloo.md` aqui no mesmo ciclo.
6. **Doc desatualizado é bug.** Se o código contradiz um doc, corrija o doc no mesmo PR.

## Convenções rápidas

- Imports pelo alias `@/` (`@/services/auth`), nunca `../../`.
- Chamadas REST só via `apiCall` (`@/services/apiClient`); `fetch` cru só para endpoints sem
  auth (login/refresh) com `{ skipAuth: true }`.
- Sessão só via `useAuth()` (`@/context/AuthContext`). Carrinho via `useCarrinho()` — limite de
  150 itens lança erro; a UI precisa tratar.
- Sem cor hex nas telas: tokens de `assets/styles/colors.ts` / `fontFamily.ts` + `StyleSheet.create` local.
- `palpites` é string posicional por modalidade — não parseie sem as amostras de `regras-jogo.md`.
- Datas do Adianti (`system_*`) chegam como string — converta explicitamente.
- Dev: **não** defina `expo.extra.apiBaseUrl` (o `apiConfig` deriva o IP do `hostUri`).
  Produção: defina com HTTPS (o `apiConfig` lança erro fora de dev com HTTP).

## Repositórios relacionados

- `../zooloo` — backend PHP 8.2 / Adianti 8.1 / Postgres (dono do contrato e das regras).
  Mapa dele: `../zooloo/AGENTS.md`.
- `../jballsystem/allsystem` — sistema legado (JHipster/Java). Só referência de regra; não roda.
- `../app-base` — APK legado decompilado. Só referência de UX/impressão.

## Artefatos gerados (não editar à mão)

`graphify-out/` (grafo para IA — ver `.agents/rules/graphify.md`), `coverage/`, `android/build/`.
