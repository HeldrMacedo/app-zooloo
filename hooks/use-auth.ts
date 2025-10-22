import type { User } from '@/services/auth';
import AuthService from '@/services/auth';
import { useEffect, useState } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  // Mantém o isLoading para o estado inicial de verificação
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const authenticated = await AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const userData = await AuthService.getStoredUser();
        setUser(userData);
      } else {
        setUser(null); // Limpa o utilizador se não estiver autenticado
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { login: string; password: string }) => {
    // Pode-se usar um estado de loading específico para o login se preferir,
    // mas reutilizar isLoading também funciona se for aceitável mostrar loading geral.
    // Para evitar conflito com o isLoading inicial, vamos usar um try/catch/finally aqui
    // e deixar o isLoading principal apenas para a verificação inicial.
    try {
      const response = await AuthService.login(credentials);

      // --- Início da Modificação ---
      if (response.success && response.user) {
        // Atualiza o estado DENTRO do hook após o sucesso da API
        setIsAuthenticated(true);
        setUser(response.user);
      } else {
        // Se a API retornar sucesso=false, garantir que o estado reflete isso
        setIsAuthenticated(false);
        setUser(null);
        // Lança um erro com a mensagem da API para o Alert na tela de login
        throw new Error(response.message || 'Credenciais inválidas informadas pela API');
      }
      // --- Fim da Modificação ---

      return response; // Retorna a resposta original da API
    } catch (error) {
       console.error('Erro detalhado no hook login:', error);
       // Garante que o estado é limpo em caso de erro na chamada ou na resposta
       setIsAuthenticated(false);
       setUser(null);
       // Re-lança o erro para que a tela de login possa tratá-lo (mostrar Alert)
       throw error;
    }
    // Não precisamos de setIsLoading aqui se o estado principal é só para a carga inicial
  };


  const logout = async () => {
    try {
      await AuthService.logout();
      // Atualiza o estado local imediatamente
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
      // Mesmo com erro na API, força o logout local
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // Função para re-verificar o status (pode ser útil em alguns cenários)
  const refreshAuth = async () => {
    await checkAuthStatus();
  };

  return {
    isAuthenticated,
    user,
    isLoading, // Exporta o isLoading para saber quando a verificação inicial terminou
    login,
    logout,
    refreshAuth,
  };
}