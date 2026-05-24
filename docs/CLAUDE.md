# CLAUDE.md — App Zooloo (mobile)

PDV móvel (Expo / React Native + TypeScript) para registrar apostas de **Jogo do
Bicho, Lotinha, Quininha e Seninha**, integrado ao backend PHP/Adianti via REST + JWT.
Roda em **celular do vendedor** e em **maquinetas POS Android** (impressora térmica).

> Este arquivo é o índice operacional. Para detalhes, siga os ponteiros:
> - **Escopo, domínio, modelagem do banco, roadmap:** [[/docs/plano.md]]
> - **Autenticação (fluxo de tokens, testes, produção):** [[/docs/README-AUTH.md]]
> - **Backend:** [[C:/desenvolvimento/zooloo/zooloo/CLAUDE.md]]

---

## Regra de ouro (inegociável)

**O app é interface operacional. NUNCA calcula prêmio, comissão, limite ou ganhador.**
Toda precificação e verificação é feita por triggers no PostgreSQL e exposta via
endpoints REST. O app envia dados brutos e **relê** os valores que o backend devolve.
Ver [plano.md](plano.md) seção 2.4. Se você se pegar somando prêmios no app, pare.

---

## Stack

| Item | Valor |
|---|---|
| Runtime | Expo SDK 54, React Native 0.81, React 19 |
| Linguagem | TypeScript (strict), alias `@/*` → raiz |
| Navegação | Expo Router (file-based, `app/`) |
| Estilo | NativeWind (Tailwind) |
| Storage seguro | `expo-secure-store` (token/refresh) + `@react-native-async-storage` (user, cache) |
| HTTP | `fetch` encapsulado em `services/apiClient.ts` |
| Testes | Jest (`jest-expo`) + React Native Testing Library |

---

## Comandos

```bash
npm start              # Expo dev server
npm run android        # abre no Android
npm test               # roda a suíte Jest
npm run test:coverage  # cobertura (threshold 80% linhas/funcs/stmts, 70% branches)
npm run lint           # eslint (expo)
```

Backend (em `C:/desenvolvimento/zooloo/zooloo`, via Docker):
```bash
docker exec -i applications_www sh -lc "cd /var/www/html && composer test"
```

---

## Arquitetura

```
app/                  Expo Router
  _layout.tsx         AuthProvider + guard de navegação (login ↔ tabs)
  login.tsx           tela de login
  (tabs)/             áreas principais (dashboard etc.)
context/
  AuthContext.tsx     ÚNICA fonte do estado de sessão (useAuth)
services/
  apiClient.ts        fetch wrapper: Bearer, refresh proativo, retry 401, ApiError
  apiConfig.ts        baseURL (expo.extra.apiBaseUrl) + enforcement HTTPS em prod
  auth.ts             AuthService: login/logout/refresh/isAuthenticated
  secureStorage.ts    token/refresh em SecureStore; user em AsyncStorage; migração legada
components/, src/     UI e módulos (em construção)
__tests__/            espelha a estrutura: services/, context/, app/
```

### Como falar com o backend
Sempre via `apiCall` — nunca `fetch` cru:
```ts
import { apiCall } from '@/services/apiClient';
const dados = await apiCall<Tipo>({ class: 'XxxRestService', method: 'listar', data: {...} });
```
`apiCall` injeta `Authorization: Bearer`, faz refresh proativo (<60s p/ expirar),
retry transparente em 401, e lança `ApiError` (com `httpStatus`/`message`) em erro.
Para login/refresh use `{ skipAuth: true }`.

---

## Convenções

- **Envelope Adianti:** toda resposta REST é `{ status: 'success'|'error', data }`.
  `apiClient` já desembrulha e normaliza erros.
- **Sessão:** só leia/escreva sessão via `useAuth()`. Não chame `AuthService` direto
  de telas (exceto onde o contexto não alcança).
- **Token:** access curto (15 min) em SecureStore; refresh (30 dias) separado.
  Detalhes e diagrama em [README-AUTH.md](README-AUTH.md).
- **Offline:** o app deve abrir sem rede se o JWT local ainda é válido (maquinetas).
  `isAuthenticated()` decodifica o JWT localmente antes de bater no servidor.
- **Sem cores hardcoded** em telas novas — usar tokens de tema (`src/theme`).
- **Imports:** use o alias `@/` (ex.: `@/services/auth`), não caminhos relativos longos.

---

## Estado atual (o que já existe)

- ✅ **Autenticação** completa e testada (Etapas 1–4): SecureStore, refresh rotativo
  com `jti` revogável no backend, refresh proativo + retry no app, rate-limit,
  CORS restrito, suíte de testes verde (FE 55, BE 86). Ver [README-AUTH.md](README-AUTH.md).
- 🚧 **Apostas, impressão, histórico, caixa:** ainda não implementados. Ver roadmap
  em [plano.md](plano.md) seção 12 (Fases 0–6). Fase 0 (regras das modalidades) é
  bloqueante para apostas.

---

## Armadilhas conhecidas

- **`services/auth.ts.tmp.*`** — arquivo temporário órfão no diretório; ignore/remova,
  não é fonte.
- **`hooks/use-auth.ts` foi removido** — era duplicata do `AuthContext`. Use só `useAuth`
  de `@/context/AuthContext`.
- **Não definir `apiBaseUrl` em `app.json` (dev):** deixar `"extra": {}` vazio é o
  comportamento correto em desenvolvimento. O fallback de `apiConfig` lê o `hostUri` do
  Expo (IP real da máquina, ex: `192.168.1.10`) e monta a URL automaticamente — funciona
  para emulador e dispositivo físico. Setar `"http://localhost"` explicitamente quebra o
  login no Android (localhost não resolve para a máquina host dentro do emulador).
- **Produção exige HTTPS:** `apiConfig` lança erro se a URL for HTTP em build não-dev.
  Nesse caso sim, definir `expo.extra.apiBaseUrl` com URL HTTPS em `app.json`.
- **Adianti retorna datas como string** em tabelas `system_*` — tratar conversão.
- **`palpites` é string posicional**, não relacional — não tente parsear no app sem as
  amostras da Fase 0 (ver [plano.md](plano.md) seção 2.7).
