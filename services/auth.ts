import { ApiError, apiCall, decodeJwt, isTokenExpiringSoon, setRefreshHandler } from './apiClient';
import { getDeviceSerial } from './deviceSerial';
import {
  clearRefreshToken,
  clearTerminal,
  clearToken,
  clearUser,
  getRefreshToken,
  getTerminal,
  getToken,
  getUser,
  saveRefreshToken,
  saveTerminal,
  saveToken,
  saveUser,
  type StoredTerminal,
} from './secureStorage';

export interface LoginCredentials {
  login: string;
  password: string;
  /** Serial do dispositivo; se omitido, resolve via getDeviceSerial(). */
  serial?: string;
}

export type { StoredTerminal };

export interface User {
  id: string;
  login: string;
  name: string;
  email: string;
  active: string;
}

export interface VendedorPayload {
  vendedor_id: number;
  area_id: number | null;
  coletor_id: number | null;
  nome: string;
  comissao: number;
  limite_venda: number;
  tipo_limite: string | null;
  treinamento: string;
  ativo: string;
}

export interface PermissoesPayload {
  exibe_comissao: string;
  exibe_premiacao: string;
  pode_cancelar: string;
  pode_cancelar_qtde: number;
  pode_cancelar_tempo: string | null;
  pode_reimprimir: string;
  pode_reimprimir_qtde: number;
  pode_reimprimir_tempo: string | null;
  pode_reimprimir_outro: string;
  pode_reimprimir_sort_pago: string;
  pode_reimprimir_sort_naopg: string;
  pode_reimprimir_sort_pago_outro: string;
  pode_reimprimir_sort_naopg_outro: string;
  pode_pagar: string;
  pode_pagar_outro: string;
}

export interface TerminalPayload {
  terminal_id: number;
  serial: string;
  tipo?: string;
  multi_usuario?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  expires_at?: string;
  refresh_token?: string;
  refresh_expires_at?: string;
  vendedor?: VendedorPayload | null;
  permissoes?: PermissoesPayload | null;
  terminal?: TerminalPayload | null;
  warning?: string;
}

function isJwtExpired(token: string, skewSeconds = 30): boolean {
  const p = decodeJwt(token);
  if (!p) return true;
  const exp = (p.exp ?? p.expires) as number | undefined;
  if (!exp) return true;
  return exp - skewSeconds < Math.floor(Date.now() / 1000);
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const serial =
      (credentials.serial && credentials.serial.trim()) || (await getDeviceSerial());

    let payload: LoginResponse;
    try {
      payload = await apiCall<LoginResponse>(
        {
          class: 'ApplicationAuthenticationRestService',
          method: 'login',
          data: {
            login: credentials.login,
            password: credentials.password,
            serial,
          },
        },
        { skipAuth: true },
      );
    } catch (e) {
      if (e instanceof ApiError) throw new Error(e.message);
      throw new Error('Erro inesperado ao autenticar.');
    }

    if (!payload?.success) {
      throw new Error(
        payload?.message || 'Não foi possível autenticar. Verifique suas credenciais.',
      );
    }

    if (payload.token) await saveToken(payload.token);
    if (payload.refresh_token) await saveRefreshToken(payload.refresh_token);
    if (payload.user) await saveUser(payload.user);
    if (payload.terminal?.terminal_id) {
      await saveTerminal({
        terminal_id: payload.terminal.terminal_id,
        serial: payload.terminal.serial,
        tipo: payload.terminal.tipo,
        multi_usuario: payload.terminal.multi_usuario,
      });
    } else {
      await clearTerminal();
    }
    return payload;
  }

  async validateToken(token: string): Promise<boolean> {
    if (isJwtExpired(token)) return false;
    try {
      const data = await apiCall<{ success?: boolean }>(
        {
          class: 'ApplicationAuthenticationRestService',
          method: 'validateToken',
          token,
        },
        { skipAuth: true },
      );
      return Boolean(data?.success);
    } catch {
      // Sem rede: confia no JWT local (importante para maquinetas offline).
      return !isJwtExpired(token);
    }
  }

  async refreshToken(): Promise<string | null> {
    const refresh = await getRefreshToken();
    if (!refresh) return null;
    try {
      const data = await apiCall<LoginResponse>(
        {
          class: 'ApplicationAuthenticationRestService',
          method: 'refreshToken',
          refresh_token: refresh,
        },
        { skipAuth: true, skipRetry: true },
      );
      if (data?.success && data.token) {
        await saveToken(data.token);
        if (data.refresh_token) await saveRefreshToken(data.refresh_token);
        return data.token;
      }
    } catch {
      // fallthrough — limpa abaixo
    }
    // refresh inválido/revogado: limpa estado local
    await clearToken();
    await clearRefreshToken();
    return null;
  }

  async logout(): Promise<void> {
    const token = await getToken();
    const refresh = await getRefreshToken();
    if (token || refresh) {
      try {
        await apiCall<unknown>(
          {
            class: 'ApplicationAuthenticationRestService',
            method: 'logout',
            token: token ?? undefined,
            refresh_token: refresh ?? undefined,
          },
          { skipAuth: true, skipRetry: true },
        );
      } catch {
        // logout local prossegue mesmo se servidor inacessível
      }
    }
    await clearToken();
    await clearRefreshToken();
    await clearUser();
    await clearTerminal();
  }

  async getStoredToken(): Promise<string | null> {
    return getToken();
  }

  async getStoredUser(): Promise<User | null> {
    return getUser<User>();
  }

  async getStoredTerminal(): Promise<StoredTerminal | null> {
    return getTerminal();
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await getToken();
    if (!token) return false;
    if (isJwtExpired(token)) {
      const refreshed = await this.refreshToken();
      return refreshed !== null;
    }
    if (isTokenExpiringSoon(token)) {
      await this.refreshToken();
    }
    return this.validateToken((await getToken()) ?? token);
  }
}

const authService = new AuthService();

// Quebra a dependência circular: apiClient chama refresh sem importar auth.ts.
setRefreshHandler(() => authService.refreshToken());

export default authService;
