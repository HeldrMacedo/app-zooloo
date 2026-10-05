# Planos de execução

Todo trabalho com mais de um passo tem um plano versionado aqui. O agente lê o plano antes
de codar e registra o progresso nele.

```
active/      em andamento (um arquivo por iniciativa: AAAA-MM-DD-assunto.md)
completed/   concluídos — histórico, não editar além de correções de link
tech-debt.md dívida técnica conhecida (fila para limpeza)
roadmap.md   quadro Kanban do Obsidian — visão resumida, aponta para os planos
```

## Ciclo

1. Crie `active/AAAA-MM-DD-assunto.md` a partir de `templates/nova-tarefa.md`.
2. Coloque no roadmap (coluna "Em Andamento") com link para o plano.
3. Atualize o **Log de progresso** no fim do plano a cada sessão.
4. Ao terminar: `npm run check` verde, `status: concluido`, `git mv` para `completed/`,
   mova o card no roadmap.

## Ativos

- [2026-08-04-printer-hardening](active/2026-08-04-printer-hardening.md) — Tasks 1–8 feitas;
  falta a Task 9 (smoke test no device).

## Concluídos

- [fase-1-autenticacao](completed/fase-1-autenticacao.md)
- [fase-2-aposta-bicho](completed/fase-2-aposta-bicho.md)
- [logica-tela-premios](completed/logica-tela-premios.md)
- [btn-resetar-premios](completed/btn-resetar-premios.md)
- [BUG-001 — data de sorteio hardcoded](completed/BUG-001-aposta-service-data-hardcoded.md)
