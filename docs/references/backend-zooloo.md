# Backend zooloo — contrato consumido pelo app

O backend (`../zooloo`, PHP 8.2 / Adianti 8.1) é **dono do contrato**. Este arquivo registra
o que o app usa hoje, para o agente não precisar abrir o outro repo para cada pergunta.
Fonte da verdade: `app/service/rest/` e `app/service/auth/` no backend.

Roteamento: `rest.php` chama `Classe::metodo`. `login` e `refreshToken` são públicos; o resto
exige `Authorization: Bearer <jwt>`. Resposta sempre no envelope
`{ status: 'success'|'error', data }`.

## Usado pelo app

| Classe | Método | Chamado em |
|---|---|---|
| `ApplicationAuthenticationRestService` | `login`, `validateToken`, `refreshToken`, `logout` | `services/auth.ts` |
| `ModalidadeRestService` | `listar` | `services/apostaService.ts` |
| `BilheteRestService` | `registrar` | `services/apostaService.ts` |
| `SorteioRestService` | `abertos` | `services/apostaService.ts` |

Tipos do lado do app: `types/aposta.ts` (escritos à mão — não há geração a partir do PHP).

## Disponível no backend, ainda não usado pelo app

- `ModalidadeRestService::disponiveis`
- `BilheteRestService::cancelar`, `detalhe`, `lista` (é `lista`, não `listar`)
- `VendedorRestService::me`
- `TerminalRestService::registrar`
- `ResultadoRestService::recentes`
- `CaixaRestService::resumo`
- `VendasJbRestService` (relatórios de vendas JB)

## Como mudar o contrato

1. Mude no backend primeiro (com teste em `tests/` do backend).
2. Atualize esta tabela e `types/aposta.ts`.
3. Ajuste o service do app e os testes em `__tests__/services/`.

Última verificação contra o código do backend: 2026-10-05.
