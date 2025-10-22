import type { User } from '@/services/auth';
import AuthService from '@/services/auth';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (credentials: { login: string; password: string }) => Promise<any>; // Ajuste o tipo de retorno se necessário
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Apenas para o carregamento inicial

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    console.log("AuthProvider: Verificando status de autenticação...");
    try {
      setIsLoading(true);
      const authenticated = await AuthService.isAuthenticated();
      console.log("AuthProvider: Status verificado - ", authenticated);
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const userData = await AuthService.getStoredUser();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('AuthProvider: Erro ao verificar autenticação:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
      console.log("AuthProvider: Verificação de status concluída.");
    }
  };

  const login = async (credentials: { login: string; password: string }) => {
    try {
      // Opcional: pode ter um estado de loading específico para o login aqui se quiser
      const response = await AuthService.login(credentials);
      if (response.success && response.user) {
        console.log("AuthProvider: Login bem-sucedido, atualizando estado.");
        setIsAuthenticated(true);
        setUser(response.user);
        // A navegação será tratada pelas telas que usam o contexto
      } else {
        setIsAuthenticated(false);
        setUser(null);
        throw new Error(response.message || 'Credenciais inválidas informadas pela API');
      }
      return response;
    } catch (error) {
      console.error('AuthProvider: Erro no login:', error);
      setIsAuthenticated(false);
      setUser(null);
      throw error; // Re-lança para a tela de login
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('AuthProvider: Erro na chamada de logout da API:', error);
    } finally {
      // Sempre faça logout localmente
      console.log("AuthProvider: Fazendo logout, atualizando estado.");
      setIsAuthenticated(false);
      setUser(null);
      // A navegação será tratada pelas telas que usam o contexto
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};