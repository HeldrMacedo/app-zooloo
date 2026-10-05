# Autenticação — App Zooloo

Documento operacional da camada de autenticação do app móvel e do backend Adianti.
Reflete o estado **pós-Etapas 1–4** (correções críticas, refresh-token rotativo, refresh
proativo no app, suíte de testes).

---

## 1. Visão geral do fluxo

```
┌────────────┐  1.login(user,pass,serial) ┌────────────────────────┐
│   App RN   │ ─────────────────────────▶ │  rest.php → Auth REST  │
│            │                            │  (rate-limit + Adianti │
│            │ ◀────────────────────────  │   authenticate +       │
│            │  access + refresh + user   │   cad_terminal)        │
│            │  + vendedor + permissoes   └────────────────────────┘
│            │  + terminal                             │
│            │                       persiste jti em mob_auth_token
│            │
│  Tokens:   │
│  • access  │ → SecureStore (zooloo.auth.token)        TTL 15 min
│  • refresh │ → SecureStore (zooloo.auth.refresh)      TTL 30 dias
│  • user    │ → AsyncStorage (zooloo.auth.user)
│  • terminal│ → SecureStore (zooloo.auth.terminal)
└────────────┘

Pré-requisito operacional:
  1. No app: engrenagem no login → copiar serial do device
  2. No back-office Zooloo: Cadastros → Terminal → cadastrar serial + vendedor
  3. Só então o login com usuário/senha funciona neste aparelho

Em cada chamada protegida:
  1. apiClient injeta Authorization: Bearer <access>
  2. Se access expira em < 60s → dispara refreshToken antes
  3. Se servidor responder 401 → tenta refresh + retry 1x
  4. Refresh rotaciona AMBOS os tokens; refresh antigo fica revogado
  5. Reuso de refresh já rotacionado → revoga toda a árvore (replay detection)
```

### Tempos de vida (configuráveis em `ApplicationAuthenticationRestService.php`)

| Token   | TTL       | Onde fica no app                 | Onde fica no backend             |
| ------- | --------- | -------------------------------- | -------------------------------- |
| access  | 15 min    | SecureStore (Keychain/Keystore)  | JWT stateless + `mob_auth_token` |
| refresh | 30 dias   | SecureStore                      | JWT stateless + `mob_auth_token` |

**Por que dois tokens?** Access curto limita a janela de exposição se for roubado;
refresh longo permite UX sem reloggar a cada 15 min, e revogação server-side de
sessões individuais (botão "sair de todos os dispositivos" → `logoutAll`).

### Por que o app abre offline

`isAuthenticated()` decodifica o JWT **localmente** (sem rede). Se `exp` ainda
está no futuro, assume válido — maquinetas POS Android conseguem ligar e operar
sem internet, e o validateToken contra o servidor só roda quando há rede.

---

## 2. Endpoints do backend

Todos via `POST /rest.php` com body JSON Adianti `{ class, method, ...data }`.

| Endpoint        | Bearer? | Body                                                 | Retorno                                                                 |
| --------------- | ------- | ---------------------------------------------------- | ----------------------------------------------------------------------- |
| `login`         | Não     | `{data:{login,password,serial}}`                     | `{success, token, refresh_token, expires_at, refresh_expires_at, user, vendedor, permissoes, terminal}` |
| `refreshToken`  | Não     | `{refresh_token}`                                    | `{success, token, refresh_token, expires_at, refresh_expires_at}`       |
| `validateToken` | Sim¹    | `{token}` (ou Bearer)                                | `{success, user, expires_at}`                                           |
| `logout`        | Sim     | `{token, refresh_token}`                             | `{success}`                                                             |
| `logoutAll`     | Sim     | `{}`                                                 | `{success}` — revoga todos os tokens ativos do usuário                  |

**Validação de terminal no login** (`cad_terminal` via `TerminalAuthHelper`):

| Caso | Mensagem |
| ---- | -------- |
| `serial` vazio | `Serial do terminal é obrigatório.` |
| serial não cadastrado | `Terminal não cadastrado. Informe o serial ao administrador.` |
| `ativo = N` | `Terminal bloqueado.` |
| `multi_usuario = N` e vendedor ≠ dono | `Terminal vinculado a outro vendedor.` |
| `multi_usuario = S` | Qualquer vendedor ativo pode usar |

Resposta `terminal` em sucesso:

```json
{
  "terminal_id": 12,
  "serial": "abc123",
  "tipo": "APP",
  "multi_usuario": "N"
}
```

O access JWT inclui `terminal_id` e `serial`. O refresh preserva o binding na rotação.


¹ `validateToken` é chamado internamente por `rest.php` em cada Bearer; também é exposto.

**Códigos HTTP:**
- `200` — sucesso (success/error vem no envelope `{status,data}`)
- `401` — sem Bearer, token expirado/revogado
- `429` — rate-limit excedido
- `404` — método/classe inexistente
- `500` — erro interno (mensagem em claro só com `debug=1`)

---

## 3. Onde estão os arquivos

### Frontend
```
services/
  apiConfig.ts        baseURL + enforcement HTTPS em produção
  apiClient.ts        fetch wrapper (Bearer, refresh proativo, retry 401)
  auth.ts             AuthService (login+serial, logout, refresh, isAuthenticated)
  deviceSerial.ts     serial estável do device (Android ID / iOS vendor / UUID)
  secureStorage.ts    wrappers SecureStore/AsyncStorage (tokens, user, terminal)
context/
  AuthContext.tsx     React context (useAuth) — sessão + terminal
app/
  login.tsx           login + ícone engrenagem → /terminal
  terminal.tsx        exibe/copia serial (rota pública)
  _layout.tsx         guard de navegação (rotas públicas: login, terminal)
```

### Backend (`../zooloo/zooloo/` ou `zooloo/zooloo/`)
```
rest.php                                  router REST (CORS, Bearer guard, error envelope)
app/service/auth/
  ApplicationAuthenticationRestService.php  login(+serial)/refresh/validate/logout/logoutAll
  TerminalAuthHelper.php                    validação cad_terminal (login + bilhete)
  AuthRateLimiter.php                       rate-limit file-based (tmp/ratelimit/)
app/service/rest/
  TerminalRestService.php                   confirma serial (sem autocadastro)
  BilheteRestService.php                    exige terminal_id válido (multi_usuario)
app/control/terminal/
  TerminalList.php / TerminalForm.php       CRUD back-office (Cadastros → Terminal)
app/model/entities/MobAuthToken.php         TRecord do token revogável
app/model/entities/Terminal.php             TRecord de cad_terminal
app/migrations/etapa2_auth.sql              cria tabela mob_auth_token
app/config/application.php                  config: security.cors_allowed_origins, rate_limit
```

---

## 4. Setup inicial

### 4.1 Banco
```bash
psql -h <host> -U postgres -d applications -f app/migrations/etapa2_auth.sql
```
Idempotente — pode rodar de novo sem efeito.

### 4.2 Backend — `application.php`
```php
'security' => [
    // produção: liste origens explícitas; ['*'] só em dev
    'cors_allowed_origins' => ['https://admin.zooloo.com.br'],
],
'rate_limit' => [
    'login_max' => 5, 'login_window' => 300, 'login_lockout' => 900,
    'ip_max'    => 20, 'ip_window'   => 300,
],
```

**Trocar o `general.seed`** antes de subir em produção — é a chave HMAC dos JWTs.
Rotacionar o seed invalida **todos** os tokens emitidos. Faça com janela de manutenção.

### 4.3 Frontend — `app.json`
```json
"expo": {
  "extra": {
    "apiBaseUrl": "https://api.zooloo.com.br"
  }
}
```
Sem `apiBaseUrl`, o app auto-detecta o host do Metro (dev). Em build de produção, **HTTP
gera throw** salvo se `extra.allowInsecureHttp: true` for explicitamente setado.

### 4.4 Dependências
```bash
# frontend
npx expo install expo-secure-store expo-application expo-clipboard
npm install        # baixa devDeps: jest, jest-expo, @testing-library/react-native...

# backend
composer install   # já cobre firebase/php-jwt
```

---

## 5. Como rodar os testes

### Frontend
```bash
npm test                # roda toda a suíte
npm test -- --watch     # modo watch
npm run test:coverage   # relatório (threshold 80% lines/statements/functions)
```

**Cobertura alvo (`jest.coverageThreshold`):**
- statements / lines / functions: **80%**
- branches: **70%**

Cobertos em `__tests__/`:
- `services/secureStorage.test.ts` — persistência, migração legada, terminal
- `services/apiConfig.test.ts` — resolução de URL, enforcement HTTPS
- `services/apiClient.test.ts` — decode JWT, retry 401, refresh single-flight
- `services/auth.test.ts` — login+serial, terminal, logout, refresh, offline
- `services/deviceSerial.test.ts` — Android ID / iOS / fallback UUID
- `context/AuthContext.test.tsx` — estado, login/logout, terminal no contexto
- `app/login.test.tsx` — render, engrenagem, validação, submit, alertas
- `app/terminal.test.tsx` — exibe serial, copiar, voltar ao login

### Backend
```bash
composer test
# equivale a: php tests/run.php
```

Cobertos em `tests/`:
- `auth-rest-service.test.php` — login (credenciais + serial/terminal/multi_usuario/JWT),
  validateToken, refreshToken (rotação/replay), logout, logoutAll
- `terminal-auth-helper.test.php` — regras de cad_terminal (ativo, multi_usuario, bilhete)
- `auth-rate-limiter.test.php` — limites por login e IP, lockout, sanitização de chaves

O harness é caseiro (`tests/bootstrap.php`) — `test(nome, fn)` + `assertSameValue`,
`assertTrue`, `assertContainsText`, `assertThrows`. Não usa PHPUnit; sem nova
dependência.

---

## 6. Como adicionar uma nova rota protegida

### Backend
1. Criar a classe REST em `app/service/<dominio>/<MeuService>.php`:
   ```php
   class MeuService implements AdiantiRestService {
       public static function listar($param) {
           $userid = $param['_auth']['id'] ?? null;  // injetado por rest.php
           if (!$userid) return ['error' => 'não autenticado'];
           // ... regra de negócio
       }
   }
   ```
2. Adicionar permissão Adianti (se aplicável).
3. Não precisa mexer em `rest.php` — qualquer classe com Bearer válido funciona.

### Frontend
```ts
import { apiCall } from '@/services/apiClient';

const dados = await apiCall<MinhaResposta>({
  class: 'MeuService',
  method: 'listar',
  data: { /* filtros */ },
});
```
`apiCall` já injeta Bearer, faz refresh proativo e retry em 401. Em erro
estruturado, lança `ApiError` com `httpStatus` + `message`.

---

## 7. Configurações específicas para maquinetas POS

| Aspecto              | Configuração                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------- |
| Storage do token     | SecureStore com `AFTER_FIRST_UNLOCK` — disponível após primeiro desbloqueio do device       |
| Auto-login pós-reboot| `AuthContext.checkAuthStatus` roda no mount; refresh proativo se access expirou             |
| Operação offline     | `isAuthenticated` confia no JWT local quando rede falha; refresh tentado oportunisticamente |
| Timeout HTTP         | 15s (`REQUEST_TIMEOUT_MS` em `apiConfig.ts`); evita freeze em 4G fraco                      |
| Binding ao terminal  | Login exige `serial` pré-cadastrado; JWT carrega `terminal_id`/`serial`; app persiste terminal |

---

## 8. Checklist de produção (antes de buildar APK final)

- [ ] `general.seed` trocado para valor aleatório forte (rotacionar invalida sessões)
- [ ] `general.debug = '0'` (esconde mensagens de erro internas)
- [ ] `security.cors_allowed_origins` com hosts explícitos (sem `['*']`)
- [ ] `general.rest_key` rotacionado (também é credencial de Basic auth legada)
- [ ] `app.json` com `extra.apiBaseUrl` em `https://`
- [ ] `app/login.tsx` sem defaults de credenciais (já está)
- [ ] Terminais dos dispositivos de produção cadastrados em **Cadastros → Terminal**
- [ ] Rodar `npm run test:coverage` e `composer test` / `php tests/run.php` — verde
- [ ] Backend atrás de HTTPS; nginx/apache forçando TLS 1.2+
- [ ] Migração `etapa2_auth.sql` aplicada
- [ ] `tmp/ratelimit/` com permissão de escrita do usuário do PHP
- [ ] Verificar `php.ini`: `expose_php=Off`, `display_errors=Off` em prod

---

## 9. Binding de terminal (device ↔ sessão)

### O que é o “serial” no app

`services/deviceSerial.ts` resolve um ID estável:

| Plataforma | Fonte |
| ---------- | ----- |
| Android | `expo-application` → `getAndroidId()` |
| iOS | `getIosIdForVendorAsync()` |
| Fallback (web/emulador) | UUID gerado 1× e salvo em SecureStore (`zooloo.device.serial`) |

Esse valor é o que o operador cadastra em `cad_terminal.serial` (máx. 60 chars).
Não é necessariamente o serial de fábrica Sunmi/PAX — se no futuro houver SDK nativo,
só `deviceSerial.ts` precisa mudar.

### Fluxo de cadastro

1. Vendedor/instalador abre o app → engrenagem ao lado do label **Login** → anota/copia o serial.
2. Operador no Zooloo web: **Cadastros → Terminal** → cria registro com serial + vendedor + `ativo=S`.
3. Login envia `{ login, password, serial }`; backend valida e devolve `terminal`.
4. Emissão de bilhete usa o `terminal_id` persistido (não mais valor fixo).

### Regras `multi_usuario`

- `N` (padrão): terminal só pode ser usado pelo `vendedor_id` dono.
- `S`: qualquer vendedor ativo pode logar e vender naquele aparelho.

`TerminalRestService::registrar` **não autocria** mais terminais — apenas confirma serial já cadastrado.

---

## 10. Pendências conhecidas (próximas etapas)

1. **Logout em todos os dispositivos via UI**: endpoint `logoutAll` já existe;
   falta botão na tela de configurações.
2. **Rotação automática do `seed`**: hoje é manual; considerar versionamento
   (`seed_v1`, `seed_v2`) com aceite de tokens da geração anterior por X horas.
3. **Rate-limit distribuído**: file-based funciona em 1 servidor; em deploy
   multi-instância migrar para Redis/APCu.
4. **Auditoria estruturada**: hoje só `SystemAccessLogService::registerLogin/Logout`.
   Falta registrar refresh, logoutAll, e tentativas bloqueadas (em `data_*`).
5. **2FA opcional** (TOTP via `spomky-labs/otphp` já em `composer.json`).
6. **Revalidar terminal no refresh**: hoje o binding nasce no login e é
   copiado no JWT no refresh; não reconsulta `cad_terminal.ativo` a cada rotação.

---

## 11. Solução de problemas comuns

| Sintoma                                          | Causa provável                                              | Solução                                                                                 |
| ------------------------------------------------ | ----------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `Terminal não cadastrado` no login               | Serial do app não existe em `cad_terminal`                  | Copiar serial na engrenagem e cadastrar em Cadastros → Terminal                         |
| `Terminal bloqueado`                             | `ativo = N` no cadastro                                     | Reativar no back-office                                                                 |
| `Terminal vinculado a outro vendedor`            | `multi_usuario = N` e dono ≠ vendedor logando               | Ajustar vendedor do terminal ou marcar multi_usuario                                    |
| `Token revogado` em chamada que acabou de logar  | Migração `etapa2_auth.sql` não rodou — `MobAuthToken.find()` falha silenciosamente | Rodar a migração                                                                        |
| Login retorna 500 sem mensagem                   | `debug=0` em produção — mensagem suprimida                  | Olhar `tmp/log/error.log`                                                               |
| 401 em loop no app                               | Refresh-token também expirado/revogado                      | Forçar `await AuthService.logout()` + relogin                                           |
| 429 inesperado em dev                            | Buckets de rate-limit acumulados                            | `rm tmp/ratelimit/*.json`                                                               |
| App não abre offline                             | Token foi limpo no boot por algum motivo                    | Verificar logs do `checkAuthStatus`; SecureStore com `AFTER_FIRST_UNLOCK` exige unlock  |
| CORS bloqueando admin web                        | `cors_allowed_origins` não inclui o host                    | Adicionar origem em `application.php → security.cors_allowed_origins`                   |
| Serial mudou após reset de fábrica               | Android ID / vendor ID regenerado                           | Cadastrar o novo serial e inativar o antigo                                             |
