# Nota de qualidade por área

Nota de A (sólido, testado, documentado) a D (frágil ou sem teste). Revise ao fechar um
exec-plan que mexe na área. Última revisão: 2026-10-05.

| Área | Nota | Por quê | Próximo passo |
|---|---|---|---|
| Autenticação / sessão | A- | Fluxo completo, testes, doc dedicada | Alinhar TTL do token (tech-debt) |
| Cliente REST (`apiClient`) | A | Refresh, retry e erros testados | Lint contra `fetch` cru |
| Aposta Jogo do Bicho | B | Fluxo completo com carrinho; telas fora do gate de cobertura | Cobertura de `app/aposta/*` |
| Lotinha / Quininha / Seninha | D | Ainda não implementados no app | Exec-plan próprio |
| Impressão Bluetooth | B | Hardening feito; falta smoke no device | Task 9 do printer-hardening |
| Impressão interna (CloudPOS) | D | Stub | Integrar SDK real |
| Histórico / caixa / cancelamento | D | Endpoints existem no backend, sem tela | Exec-plan próprio |
| Design system | C | Tokens existem; hex ainda em componentes | Regra de lint + corrigir |
| Base de conhecimento | B | Reorganizada em 2026-10-05; `docs:check` | Agente de doc-gardening |
