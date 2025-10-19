import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export interface LoginCredentials {
  login: string;
  password: string;
}

export interface User {
  id: string;
  login: string;
  name: string;
  email: string;
  active: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  expires_at?: string;
}

export interface ApiResponse {
  status: string;
  data: LoginResponse;
}

class AuthService {
  // Detecta o IP do servidor (Metro) para montar a URL da API automaticamente
  private getBaseURL() {
    const hostUri = Constants.expoConfig?.hostUri || '';
    const host = hostUri ? hostUri.split(':')[0] : null; // ex: 192.168.100.234
    const defaultHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    const resolvedHost = host || defaultHost;
    return `http://${resolvedHost}/rest.php`;
  }
  private baseURL = this.getBaseURL();

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log("CREDENCIAIS ", credentials);
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          class: 'ApplicationAuthenticationRestService',
          method: 'login',
          data: {
            login: credentials.login,
            password: credentials.password
          }
        })
      });

      

      const data: ApiResponse = await response.json();
      console.log('Resposta da API:', data);
      if (data.status === 'success' && data.data.success) {
        console.log('Login bem-sucedido:', data.data);
        if (data.data.token) {
          await AsyncStorage.setItem('userToken', data.data.token);
        }
        if (data.data.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(data.data.user));
        }
        return data.data;
      } else {
       
        throw new Error(data.data.message || 'Erro no login');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro de conexão');
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          class: 'ApplicationAuthenticationRestService',
          method: 'validateToken',
          token: token
        })
      });

      const data: ApiResponse = await response.json();
      return data.status === 'success' && data.data.success;
    } catch (error) {
      return false;
    }
  }

  async refreshToken(token: string): Promise<string | null> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          class: 'ApplicationAuthenticationRestService',
          method: 'refreshToken',
          token: token
        })
      });

      const data: ApiResponse = await response.json();
      
      if (data.status === 'success' && data.data.success && data.data.token) {
        await AsyncStorage.setItem('userToken', data.data.token);
        return data.data.token;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (token) {
        await fetch(this.baseURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            class: 'ApplicationAuthenticationRestService',
            method: 'logout',
            token: token
          })
        });
      }

      // Limpar dados locais
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  }

  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('userToken');
    } catch (error) {
      return null;
    }
  }

  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      if (!token) return false;
      
      return await this.validateToken(token);
    } catch (error) {
      return false;
    }
  }
}

export default new AuthService();