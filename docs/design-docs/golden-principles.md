# Princípios de ouro

Invariantes que todo código do app respeita. Cada item diz **como é verificado**. Item marcado
"manual" ainda não tem checagem automática — é candidato a virar regra de lint ou teste
(ver `docs/exec-plans/tech-debt.md`).

## 1. O app não calcula dinheiro oficial

Prêmio, comissão, limite de aposta e validação de ganhador são calculados no backend
(triggers PostgreSQL do banco `applications`; `teste` nos testes automatizados do backend;
`jb` é só referência legada). O app envia dados brutos e relê os valores calculados.

- **Permitido:** total *estimado* do carrinho para UX (soma de valores apostados digitados
  pelo vendedor), formatação de moeda, máscaras de entrada. Fica em `utils/apostaHelpers.ts`
  e nunca vai para o comprovante como valor oficial.
- **Proibido:** multiplicar por cotação, aplicar comissão, decidir se uma aposta passa do
  limite, decidir ganhador. O comprovante usa só valores da resposta do backend.
- **Verificação:** manual (revisão).

## 2. Toda chamada REST passa pelo `apiCall`

`fetch` só existe em `services/apiClient.ts`. Login/refresh usam `{ skipAuth: true }`.

- **Verificação:** manual.

## 3. Sessão só via `useAuth()`

Nenhuma tela lê token direto do storage nem chama `AuthService` (exceto boot muito cedo).

- **Verificação:** manual.

## 4. Sem cor hex nas telas

Cores vêm de `assets/styles/colors.ts`; fontes de `fontFamily.ts`.

- **Verificação:** manual. **Hoje violado** em `components/themed-text.tsx` e
  `components/PuleTermica.tsx`.

## 5. Imports pelo alias `@/`

Nada de `../../`.

- **Verificação:** manual.

## 6. `palpites` não é reinterpretado no cliente

A string posicional é montada conforme `docs/product-specs/regras-jogo.md`. O app não a
parseia para tirar conclusões de negócio.

- **Verificação:** testes de `utils/apostaHelpers.ts` cobrem a montagem.

## 7. Contrato REST tem dono: o backend

Classe/método novo ou renomeado nasce em `../zooloo` e é registrado em
`docs/references/backend-zooloo.md` no mesmo ciclo.

- **Verificação:** manual.

## 8. Documentação é código

Links da base de conhecimento resolvem; `AGENTS.md` fica curto (mapa).

- **Verificação:** `npm run docs:check`.
