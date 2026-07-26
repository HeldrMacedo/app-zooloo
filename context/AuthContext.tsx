import type { StoredTerminal, User } from '@/services/auth';
import AuthService from '@/services/auth';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  terminal: StoredTerminal | null;
  isLoading: boolean;
  login: (credentials: { login: string; password: string; serial?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [terminal, setTerminal] = useState<StoredTerminal | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const authenticated = await AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        setUser(await AuthService.getStoredUser());
        setTerminal(await AuthService.getStoredTerminal());
      } else {
        setUser(null);
        setTerminal(null);
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
      setTerminal(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(async (credentials: { login: string; password: string; serial?: string }) => {
    try {
      const response = await AuthService.login(credentials);
      if (!response.success || !response.user) {
        throw new Error(response.message || 'Credenciais inválidas');
      }
      setIsAuthenticated(true);
      setUser(response.user);
      setTerminal(
        response.terminal
          ? {
              terminal_id: response.terminal.terminal_id,
              serial: response.terminal.serial,
              tipo: response.terminal.tipo,
              multi_usuario: response.terminal.multi_usuario,
            }
          : null,
      );
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      setTerminal(null);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } catch {
      // logout nunca deve lançar para a UI — estado local é limpo de qualquer forma
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setTerminal(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        terminal,
        isLoading,
        login,
        logout,
        refreshAuth: checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
