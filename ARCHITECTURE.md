# ARCHITECTURE.md — App Zooloo

Visão de camadas do app. Para regras de negócio veja `docs/product-specs/`; para invariantes,
`docs/design-docs/golden-principles.md`.

## Camadas e direção de dependência

```
types/  →  utils/  →  services/  →  context/  →  components/  →  app/ (telas)
```

Uma camada só importa das que estão à esquerda. Telas não falam com `fetch` nem com
`AuthService` direto: passam por `context/` (sessão, carrinho) e `services/` (REST, impressão).

## Pastas

```
app/                     Expo Router (rotas por arquivo)
  _layout.tsx            AuthProvider + guard de navegação (login <-> (tabs))
  login.tsx              login
  terminal.tsx           vínculo do terminal / sessão
  (tabs)/                abas principais (dashboard, configurações)
  aposta/                fluxo de aposta: modalidades -> milhar -> premios -> preview
context/
  AuthContext.tsx        fonte única do estado de sessão (useAuth)
  CarrinhoContext.tsx    carrinho em memória (useCarrinho); limite de 150 itens
services/
  apiClient.ts           wrapper de fetch: Bearer, refresh proativo, retry em 401, ApiError
  apiConfig.ts           resolve baseURL (expo.extra.apiBaseUrl ou hostUri do Expo); HTTPS fora de dev
  auth.ts                AuthService: login/logout/refresh/isAuthenticated (JWT decodificado local)
  secureStorage.ts       tokens no expo-secure-store; usuário/cache no AsyncStorage; migração legada
  apostaService.ts       envio/consulta de apostas no backend
  deviceSerial.ts        identidade do device (terminais POS)
  PrinterService.ts      orquestra impressão do comprovante
modules/zooloo-printer/  módulo nativo Expo: Bluetooth ESC/POS + ponte para impressora interna (CloudPOS)
types/aposta.ts          tipos de domínio: Modalidade, ApostaItem, JogoPayload, BilheteRegistro*
utils/apostaHelpers.ts   helpers puros de formatação/exibição (nunca autoritativos)
utils/routeParams.ts     validação de parâmetros de rota
__tests__/               espelha a árvore: app/, context/, services/, utils/
```

## Falando com o backend

Toda chamada autenticada passa por `apiCall` (`services/apiClient.ts`):

```ts
import { apiCall } from '@/services/apiClient';
const dados = await apiCall<Tipo>({ class: 'XxxRestService', method: 'listar', data: {...} });
```

- Injeta `Authorization: Bearer`, faz refresh proativo quando faltam < 60 s, repete uma vez
  em 401 e lança `ApiError` (`httpStatus`, `message`).
- Toda resposta Adianti vem no envelope `{ status: 'success'|'error', data }`; o `apiClient`
  desembrulha. Quem chama recebe só `data` ou uma exceção.
- Login e refresh usam `{ skipAuth: true }`.
- Classes/métodos REST usados hoje: `docs/references/backend-zooloo.md`.

## Sessão e offline

- Access token curto em SecureStore; refresh token rotativo com revogação no servidor (`jti`).
  O TTL é definido no backend (`ACCESS_TTL_SECONDS`) — ver `docs/design-docs/autenticacao.md`.
- O app abre offline se o JWT local ainda decodifica como válido (maquinetas sem rede estável).
- Permissões operacionais (cancelar, reimprimir, exibir comissão) vêm de `cad_vendedor` no
  payload de login; a UI se adapta, o backend continua validando.

## Impressão (Bluetooth + interna/CloudPOS)

`PrinterService.printReceipt(lines, { backend })`:

- `'auto'` (padrão): tenta a impressora interna se `isInternalPrinterAvailable()`; se falhar, Bluetooth.
- `'internal'`: só interna; falha se indisponível.
- `'bluetooth'`: sempre a impressora pareada/preferida.

O caminho interno (`isInternalPrinterAvailable` / `printInternal`) ainda é stub (retorna
`false`/no-op) até o módulo nativo integrar o SDK real — contrato em
`docs/design-docs/2026-08-04-cloudpos-printer.md`, execução em
`docs/exec-plans/active/2026-08-04-printer-hardening.md`.
Bluetooth prefere o `printLines` nativo em lote; sem ele, cai no loop por linha com init
ESC/POS manual (`0x1b 0x40`). Permissões BLUETOOTH_CONNECT/SCAN só no Android API 31+.

## Testes

Jest (`jest-expo`) + React Native Testing Library, tudo mockado (sem backend real).
O gate de cobertura (`jest.coverageThreshold` no `package.json`) vale só para `services/`,
`context/`, `app/login.tsx` e `app/terminal.tsx`.
