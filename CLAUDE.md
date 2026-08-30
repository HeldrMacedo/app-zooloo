# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

App Zooloo is a mobile PDV (point-of-sale) app built with Expo/React Native + TypeScript for registering
bets on **Jogo do Bicho, Lotinha, Quininha and Seninha**. It runs on the seller's phone and on Android POS
terminals (with a thermal printer), and talks to a PHP/Adianti backend over REST + JWT. The backend lives in
a sibling repo/folder (`../zooloo/zooloo` or similar) — it is not in this repository.

Deeper docs live in `docs/` (`docs/CLAUDE.md` is a more detailed operational index, `docs/arquitetura-dados.md`
covers the Postgres schema, `docs/README-AUTH.md` covers the auth flow in depth, `docs/regras-negocio.md` covers
game rules). `.agents/AGENTS.md` holds the same non-negotiable rules restated for other agent tools. Read the
relevant doc before touching auth, betting rules, or the database model — don't guess at those from code alone.

## The one non-negotiable rule

**The app is strictly an operational interface. It never computes prizes, commissions, betting limits, or
winner validation.** All of that logic lives in PostgreSQL triggers/backend (database `applications` for dev,
`teste` for automated tests — `jb` is a legacy reference DB, not used at runtime). The app packages raw bet
data, sends it to the backend, and re-reads the calculated values from the response to render on screen and
on the printed receipt. If you find yourself summing prize values or validating a winner in this codebase,
stop — that's a bug.

## Commands

```bash
npm start                # Expo dev server
npm run android          # open on Android (emulator or device)
npm run ios              # open on iOS
npm run web              # open on web
npm run lint             # eslint (expo config)
npm test                 # run full Jest suite
npm run test:watch       # watch mode
npm run test:coverage    # coverage; thresholds: 80% lines/functions/statements, 70% branches
```

Run a single test file: `npx jest __tests__/services/apostaService.test.ts`
Run a single test by name: `npx jest -t "nome do teste"`

Building an APK for a POS terminal:
```bash
cd android
./gradlew assembleRelease -PreactNativeArchitectures=armeabi-v7a,arm64-v8a   # 32+64-bit
adb install -r app/build/outputs/apk/release/app-release.apk
```
For iterative dev-client testing on device: `npx expo start --dev-client` (phone and PC on same Wi-Fi, or
`adb reverse tcp:8081 tcp:8081` over USB).

## Architecture

```
app/                    Expo Router (file-based routing)
  _layout.tsx           AuthProvider + navigation guard (redirects login <-> (tabs))
  login.tsx             login screen
  terminal.tsx          terminal/session screen
  (tabs)/               main tab screens (dashboard, configuracoes, ...)
  aposta/                bet-entry flow: modalidades -> milhar -> premios -> preview
context/
  AuthContext.tsx        single source of truth for session state (useAuth())
  CarrinhoContext.tsx     in-memory bet cart (useCarrinho()); enforces the 150-item cart limit
services/
  apiClient.ts           fetch wrapper: Bearer injection, proactive refresh, 401 retry, ApiError
  apiConfig.ts            resolves baseURL (expo.extra.apiBaseUrl, else derives from Expo hostUri); enforces HTTPS outside dev
  auth.ts                 AuthService: login/logout/refresh/isAuthenticated (JWT decoded locally for offline check)
  secureStorage.ts         tokens in expo-secure-store; user/cache in AsyncStorage; handles legacy migration
  apostaService.ts         bet submission/lookup against the backend
  deviceSerial.ts          device identity for POS terminals
  PrinterService.ts        receipt printing orchestration (see Printer architecture below)
modules/zooloo-printer/  local Expo native module: Bluetooth ESC/POS + internal (CloudPOS) printer bridge
types/aposta.ts          domain types: Modalidade, ApostaItem, JogoPayload, BilheteRegistroPayload/Response
utils/apostaHelpers.ts   pure helpers for bet math/formatting (client-side *display* only, never authoritative)
__tests__/               mirrors source layout: app/, context/, services/, utils/
```

### Talking to the backend

All authenticated REST calls go through `apiCall` in `services/apiClient.ts` — never call raw `fetch` directly
except for endpoints that must skip auth (login, refresh), which use `{ skipAuth: true }`.

```ts
import { apiCall } from '@/services/apiClient';
const dados = await apiCall<Tipo>({ class: 'XxxRestService', method: 'listar', data: {...} });
```

`apiCall` injects `Authorization: Bearer`, proactively refreshes when the token has <60s left, transparently
retries once on 401, and throws `ApiError` (with `httpStatus`/`message`) on failure. Every Adianti response is
enveloped as `{ status: 'success'|'error', data }`; `apiClient` unwraps this and normalizes errors — callers
just get `data` or a thrown `ApiError`.

### Session and cart state

- Read/write session only through `useAuth()` — don't call `AuthService` directly from screens except where
  the context genuinely can't reach (e.g. very early boot).
- Access tokens are short-lived (15 min) in SecureStore; refresh tokens are longer-lived and rotated with
  server-side revocation (`jti`). The app can open offline if the locally-stored JWT still decodes as valid —
  this matters for POS terminals without reliable connectivity.
- `CarrinhoContext` caps the cart at 150 items and throws if exceeded; UI code adding to the cart must handle
  that throw.
- `palpites` on `ApostaItem`/`JogoPayload` is a positional string generated per game modality — don't try to
  parse or reconstruct its semantics client-side without the modality's actual samples (see
  `docs/regras-negocio.md` / `plano.md`).

### Printer architecture (Bluetooth + internal/CloudPOS)

`services/PrinterService.ts` wraps the native module in `modules/zooloo-printer/` and exposes a single
`printReceipt(lines, { backend })` entry point:
- `backend: 'auto'` (default) — tries the internal CloudPOS printer if `isInternalPrinterAvailable()` reports
  support, falls back to Bluetooth if internal printing fails.
- `backend: 'internal'` — internal only, fails if unavailable.
- `backend: 'bluetooth'` — always uses the paired/preferred Bluetooth printer.

The internal/CloudPOS path (`isInternalPrinterAvailable` / `printInternal`) is currently a stub that returns
`false`/no-op until the native module implements the real SDK integration — see
`docs/superpowers/specs/2026-08-04-cloudpos-printer.md` and
`docs/superpowers/plans/2026-08-04-printer-hardening.md` for the intended contract before extending it.
Bluetooth printing prefers the native `printLines` batch call and falls back to a legacy per-line loop with
manual ESC/POS init (`0x1b 0x40`) when `printLines` isn't present. Bluetooth permission requests
(`ensureBluetoothPermissions`) only apply on Android API 31+ (runtime BLUETOOTH_CONNECT/SCAN).

## Conventions

- Import via the `@/` alias (e.g. `@/services/auth`) — never long relative paths (`../../services/auth`).
- No hardcoded hex colors in screens. Use tokens from `assets/styles/colors.ts` (and `fontFamily.ts`) with a
  local `StyleSheet.create` per screen.
- Don't set `expo.extra.apiBaseUrl` in `app.json` for dev — leaving it empty lets `apiConfig` derive the host
  IP from Expo's `hostUri`, which works for both emulator and physical device. Setting `http://localhost`
  breaks Android since localhost doesn't resolve to the host machine from the emulator. Production builds
  *do* need `apiBaseUrl` set to an HTTPS URL — `apiConfig` throws on non-HTTPS outside dev.
- Adianti returns dates as strings from `system_*` tables — convert explicitly, don't assume `Date` objects.

## Known traps

- `services/auth.ts.tmp.*` is a stray temp file, not source — ignore it if you see it reappear.
- There is no separate `hooks/use-auth.ts` — session access is only via `useAuth()` from `@/context/AuthContext`.
- Coverage thresholds in `package.json` (`jest.coverageThreshold`) are enforced on `services/`, `context/`,
  `app/login.tsx`, and `app/terminal.tsx` specifically, not the whole tree.

## Repo housekeeping

- `graphify-out/` is a generated knowledge-graph cache for AI tooling (see `.agents/rules/graphify.md`) — treat
  it as a build artifact, don't hand-edit it.
- `coverage/` is generated by `npm run test:coverage` — don't hand-edit it either.
