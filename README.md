# App Zooloo

PDV móvel (Expo / React Native) para registrar apostas de Jogo do Bicho, Lotinha, Quininha e
Seninha, no celular do vendedor ou em maquinetas POS Android com impressora térmica.
Backend: repositório `zooloo` (PHP/Adianti).

- **Agentes de IA:** comecem por [AGENTS.md](AGENTS.md).
- **Arquitetura:** [ARCHITECTURE.md](ARCHITECTURE.md).
- **Planos e progresso:** [docs/exec-plans/](docs/exec-plans/README.md).

## Rodar

```bash
npm install
npm start            # Expo dev server
npm run check        # lint + typecheck + testes + docs:check
```

## Estrutura da documentação (Obsidian)

O repositório é um vault do Obsidian. Os links `[[...]]` resolvem pelo nome do arquivo.

```
AGENTS.md                mapa para agentes (curto, só ponteiros)
ARCHITECTURE.md          camadas e pastas do código
docs/
  product-specs/         regras dos jogos, fluxo de telas
  design-docs/           plano técnico, autenticação, specs, princípios de ouro, adr/
  exec-plans/            active/, completed/, tech-debt.md, roadmap.md (Kanban)
  references/            banco de dados, backend, app legado
  QUALITY_SCORE.md       nota por área
templates/               Templater: nova-tarefa, novo-bug, nova-decisao-arquitetural
```

## Ferramentas de IA

- **[Graphify](https://github.com/Graphify-Labs/graphify)** — grafo de conhecimento do código em
  `graphify-out/`. `python -m graphify update .` atualiza de forma incremental;
  `python -m graphify tree` gera `graphify-out/GRAPH_TREE.html`.
- **[Superpowers](https://github.com/obra/superpowers)** — skills de processo (brainstorming,
  writing-plans, TDD, systematic-debugging, verification-before-completion) em `.agents/skills/`.

## APK para a maquininha

```bash
cd android
./gradlew assembleDebug                                                         # debug
./gradlew assembleRelease -PreactNativeArchitectures=armeabi-v7a,arm64-v8a      # release 32+64-bit
adb install -r app/build/outputs/apk/release/app-release.apk
```

## Testar no celular (dev client)

```bash
npx expo start --dev-client           # celular e PC na mesma Wi-Fi; host = IP do PC, não localhost
adb reverse tcp:8081 tcp:8081         # alternativa via USB
```
