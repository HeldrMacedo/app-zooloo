# Dívida técnica

Fila de coisas conhecidas para limpar. Ao resolver um item, remova-o daqui no mesmo PR.

## Verificação mecânica (transformar regra escrita em checagem)

- [ ] Regra ESLint `no-restricted-syntax` contra literais hex em `app/` e `components/`.
      Corrigir antes `components/themed-text.tsx` e `components/PuleTermica.tsx`.
- [ ] Regra ESLint `no-restricted-globals` para `fetch` fora de `services/apiClient.ts`.
- [ ] Regra ESLint `no-restricted-imports` para `../../`.
- [ ] CI (GitHub Actions) rodando `npm run check` em PR.
- [ ] Hook (pre-commit ou Stop do Claude Code) rodando `npm run check`.
- [ ] Script que confere as classes/métodos usados em `apiCall` contra os services do backend.

## Docs e regras com conflito

- [ ] **TTL do access token:** docs dizem 15 min; o backend usa
      `ACCESS_TTL_SECONDS = 86400` (24 h) em `ApplicationAuthenticationRestService.php`.
      Decidir o valor certo e alinhar código + `docs/design-docs/autenticacao.md`.
- [ ] ADR sobre o limite "total estimado para UX" × "valor oficial" (rascunho em
      `docs/design-docs/golden-principles.md` §1).
- [ ] A skill `.agents/skills/zooloo_regras_negocio` manda validar valor mín/máx no app;
      `docs/design-docs/plano.md` §7 diz que o servidor valida. Definir: app valida só para
      UX, servidor é autoritativo — e registrar no ADR acima.
- [ ] `docs/design-docs/plano.md` §7 cita `VendaRestService` e `CargaInicialRestService`;
      o backend usa `BilheteRestService` e não tem carga inicial. Atualizar ou marcar como histórico.
- [ ] `README.md` antigo citava um ADR `001-por-que-expo-router` que estava vazio — escrever
      o ADR de verdade se a decisão ainda importa.

## Cobertura e verificação de app rodando

- [ ] Gate de cobertura não inclui `app/aposta/*`, `utils/` e `components/`.
- [ ] Sem e2e (Maestro) para login -> aposta -> preview; agente não consegue "ver" o app.
- [ ] Task 9 do printer-hardening (smoke no device) sem checklist reproduzível.
