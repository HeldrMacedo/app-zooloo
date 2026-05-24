---
created: 2025-05-23
concluida: 2026-05-24
fase: 1
status: concluida
---

# Fase 1 — Autenticação Completa

## Objetivo

Implementar o sistema completo de autenticação JWT entre o app mobile e o backend PHP/Adianti,
incluindo login, refresh rotativo, revogação por JTI e suporte offline.

## Resultado

Fase concluída. Suíte de testes verde: **55 testes no frontend**, **86 no backend**.

## O que foi entregue

- [x] `services/secureStorage.ts` — armazenamento seguro de tokens (Keychain/Keystore + AsyncStorage fallback)
- [x] `services/auth.ts` — AuthService: login, refreshToken, logout, isAuthenticated
- [x] `services/apiClient.ts` — fetch wrapper com Bearer, refresh proativo (<60s), retry 401, single-flight
- [x] `services/apiConfig.ts` — resolução de baseURL com detecção de host dev e enforcement HTTPS em prod
- [x] `context/AuthContext.tsx` — única fonte de verdade do estado de sessão
- [x] `app/_layout.tsx` — guard de navegação (splash → login ↔ tabs)
- [x] `app/login.tsx` — tela de login com validação e feedback de erro
- [x] Migração de tokens legados (`userToken` / `userData` → `zooloo.auth.*`)
- [x] Backend: tabela `mob_auth_token` com revogação por JTI (etapa2_auth.sql)
- [x] Backend: `ApplicationAuthenticationRestService` com endpoints login/refresh/logout/validate

## Armadilhas encontradas

### `app.json → extra` deve ficar vazio em desenvolvimento

**Sintoma:** login quebrava quando `apiBaseUrl` era definido com `"http://localhost"`.

**Causa:** no Android (emulador e dispositivo físico), `localhost` aponta para o próprio
aparelho — não para a máquina de desenvolvimento. Definir `apiBaseUrl` explicitamente com
`localhost` impede que o app alcance o backend.

**Comportamento correto:** deixar `"extra": {}` vazio. O fallback de `apiConfig.ts` resolve
o host lendo `Constants.expoConfig.hostUri`, que o Expo popula automaticamente com o IP
real da máquina na rede (ex: `192.168.1.10`). Funciona para emulador e dispositivo físico
sem nenhuma configuração manual.

```
extra: {}  →  resolveDevHost() lê hostUri → "192.168.1.10" → http://192.168.1.10/rest.php ✅
extra: { apiBaseUrl: "http://localhost" }  →  http://localhost/rest.php (aponta pro celular) ❌
```

**Exceção (produção):** em build de produção, `apiConfig` exige `apiBaseUrl` com HTTPS.
Nesse caso definir explicitamente: `"apiBaseUrl": "https://api.seudominio.com"`.

Documentado também em [[CLAUDE#Armadilhas-conhecidas]].

---

### `hooks/use-auth.ts` foi removido

Havia uma duplicata do hook de autenticação. Foi removida. Usar apenas `useAuth` de
`@/context/AuthContext`.

## Referências

- [[docs/README-AUTH]] — fluxo completo de tokens, diagramas, produção
- [[docs/CLAUDE]] — convenções e arquitetura do app
- [[tasks/roadmap]]
