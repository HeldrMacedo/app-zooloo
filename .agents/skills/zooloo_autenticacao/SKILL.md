---
name: zooloo-autenticacao
description: Regras para fluxo de sessão, ciclo de vida de tokens JWT, suporte offline e tratamento de permissões operacionais do app Zooloo. Use ao editar rotas protegidas ou lógica de autenticação.
---

# Fluxo de Autenticação, Offline e Permissões do Zooloo

Esta skill orienta o agente sobre como gerenciar a sessão do usuário, validar tokens e aplicar regras de segurança com base nas configurações retornadas do banco.

## 🔐 Sessão e Tokens (JWT)

1. **Estado de Sessão:**
   - O `AuthContext` (`context/AuthContext.tsx` via hook `useAuth()`) é a **única fonte de verdade** sobre a sessão do usuário no app.
   - Nunca chame o `AuthService` diretamente de componentes visuais para gerenciar estado, apenas leia as variáveis e chame os métodos expostos pelo contexto (`user`, `vendedor`, `permissoes`, `login()`, `logout()`).
2. **Tokens de Acesso e Refresh:**
   - Access token: TTL curto (15 min), guardado em SecureStore (`zooloo.auth.token`).
   - Refresh token: TTL longo (30 dias rotativo), guardado em SecureStore (`zooloo.auth.refresh`).
   - Qualquer refresh de token invalida o refresh anterior (lógica de detecção de reuso no backend). Certifique-se de que o app atualiza ambos simultaneamente.
3. **Modo Offline:**
   - Se o app não possuir conectividade, a função `isAuthenticated()` decodifica localmente o JWT existente. Se a data de expiração (`exp`) estiver no futuro, a navegação deve permitir que o vendedor continue acessando as telas operacionais (essencial para maquinetas POS).

## 🛡️ Permissões Baseadas no Vendedor (`cad_vendedor`)

O payload de login do backend Adianti retorna informações do usuário vinculadas ao vendedor em `cad_vendedor`. O app deve carregar esses campos e respeitar as regras operacionais:
- **Exibição:** Verifique `exibe_comissao` e `exibe_premiacao` para alternar a visibilidade de valores e ganhos nas telas de resumo e caixas.
- **Cancelamento:** O botão de cancelar aposta deve validar localmente as flags `pode_cancelar`, `pode_cancelar_tempo` (janela em minutos) e `pode_cancelar_qtde` (limite diário).
- **Reimpressão:** A reemissão de vias térmicas deve seguir os limites de `pode_reimprimir_tempo` e `pode_reimprimir_qtde`.

## ⚠️ Tratamento de Erros e Rate-Limit

- Chamadas que retornarem erro HTTP `429` (Rate-Limit) devem exibir feedback amigável de limitação temporária ao vendedor.
- Erros de credenciais ou tokens inválidos disparados pelo backend retornarão status `401`. O `apiClient` tentará proativamente um refresh de token e nova tentativa antes de deslogar o usuário e redirecioná-lo para `/login`.
