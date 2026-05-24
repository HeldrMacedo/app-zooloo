# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.


## Estrutura de arquivos para o obsidian
app-zooloo/
├─ docs/                      ← Arquitetura e decisões (CLAUDE.md vai aqui)
│  ├─ CLAUDE.md               ← índice operacional do app
│  ├─ README-AUTH.md          ← autenticação (já existe)
│  ├─ plano.md                ← roadmap geral (já existe)
│  ├─ arquitetura-dados.md    ← como o banco está modelado
│  ├─ regras-negocio.md       ← cópia das regras dos jogos (regraJogos.md)
│  └─ decisoes/               ← ADRs (Architecture Decision Records)
│     └─ 001-por-que-expo-router.md
│
├─ tasks/                     ← Fases e tarefas granulares
│  ├─ roadmap.md              ← kanban board (link para as fases)
│  ├─ fase-0-regras.md        ← checkboxes das tarefas da Fase 0
│  ├─ fase-1-autenticacao.md  ← já concluída (histórico)
│  ├─ fase-2-aposta-bicho.md  ← próxima fatia (em andamento)
│  └─ backlog.md              ← ideias/melhorias futuras
│
├─ bugs/                      ← Problemas conhecidos
│  ├─ template-bug.md         ← template para novos bugs
│  └─ 2025-05-23-login-offline.md
│
├─ daily/                     ← Diário de desenvolvimento (opcional)
│  └─ 2025-05-23.md           ← "hoje fiz X, travei em Y, amanhã vou Z"
│
└─ templates/                 ← Templates Templater
   ├─ nova-tarefa.md
   ├─ novo-bug.md
   └─ nova-decisao-arquitetural.md