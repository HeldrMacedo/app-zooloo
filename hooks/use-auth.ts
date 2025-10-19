import { useState, useEffect } from 'react';
import AuthService from '@/services/auth';
import type { User } from '@/services/auth';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
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
        setUser(null);
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
    const response = await AuthService.login(credentials);
    if (response.success && response.user) {
      setIsAuthenticated(true);
      setUser(response.user);
    }
    return response;
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const refreshAuth = async () => {
    await checkAuthStatus();
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    refreshAuth,
  };
}