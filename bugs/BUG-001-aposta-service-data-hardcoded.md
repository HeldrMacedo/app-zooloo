---
id: BUG-001
titulo: Data de Sorteio Hardcoded em ApostaService.listarExtracoes
data_descoberta: 2026-05-27
status: resolvido
responsavel: Antigravity
tags: [bug, services, aposta, resolvido]
---

# BUG-001: Data de Sorteio Hardcoded em `ApostaService.listarExtracoes`

## Descrição do Problema
O método `listarExtracoes(dataSorteio: string)` em `services/apostaService.ts` estava enviando uma data fixa (`2026-05-27`) na requisição para o backend, em vez de repassar o parâmetro `dataSorteio`.

## Sintomas
- Teste unitário `__tests__/services/apostaService.test.ts` falhando quando rodado em datas diferentes de `2026-05-27` ou quando testado com mocks específicos (ex: `2023-10-10`).
- No aplicativo, tentar filtrar extrações por outra data de sorteio continuaria enviando `2026-05-27` ao backend.

## Arquivos Afetados
- [apostaService.ts](file:///c:/desenvolvimento/app-zooloo/services/apostaService.ts)

## Resolução
Modificado o objeto `data` da requisição `apiCall` de:
```typescript
data: { data_sorteio: '2026-05-27' }
```
para:
```typescript
data: { data_sorteio: dataSorteio }
```

Após a modificação, todos os testes unitários da suíte (`npm test`) passaram com sucesso.
