// @ts-nocheck
import AuthService from '../../services/auth';
import { getDeviceSerial } from '../../services/deviceSerial';
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
} from '../../services/secureStorage';

jest.mock('../../services/deviceSerial', () => ({
  getDeviceSerial: jest.fn(async () => 'device-serial-mock'),
}));

function makeJwt(expSecondsFromNow: number, extra: Record<string, unknown> = {}): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expSecondsFromNow, ...extra }),
  ).toString('base64url');
  return `${header}.${payload}.sig`;
}

beforeEach(async () => {
  await clearToken();
  await clearRefreshToken();
  await clearUser();
  await clearTerminal();
  global.fetch = jest.fn();
  (getDeviceSerial as jest.Mock).mockResolvedValue('device-serial-mock');
});

describe('AuthService.login', () => {
  it('persiste token, refresh, user e terminal; envia serial no body', async () => {
    const accessTok = makeJwt(900);
    const refreshTok = makeJwt(2592000);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        status: 'success',
        data: {
          success: true,
          message: 'ok',
          token: accessTok,
          refresh_token: refreshTok,
          user: { id: '1', login: 'admin', name: 'Admin', email: 'a@b.c', active: 'Y' },
          vendedor: { vendedor_id: 7, nome: 'V', area_id: 1, coletor_id: 1, comissao: 0, limite_venda: 0, tipo_limite: null, treinamento: 'N', ativo: 'S' },
          permissoes: null,
          terminal: { terminal_id: 12, serial: 'device-serial-mock', tipo: 'APP', multi_usuario: 'N' },
        },
      }),
    });

    const r = await AuthService.login({ login: 'admin', password: 'pass' });
    expect(r.success).toBe(true);
    expect(r.vendedor?.vendedor_id).toBe(7);
    expect(await getToken()).toBe(accessTok);
    expect(await getRefreshToken()).toBe(refreshTok);
    expect((await getUser())?.login).toBe('admin');
    expect(await getTerminal()).toEqual({
      terminal_id: 12,
      serial: 'device-serial-mock',
      tipo: 'APP',
      multi_usuario: 'N',
    });

    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.data.serial).toBe('device-serial-mock');
    expect(body.data.login).toBe('admin');
  });

  it('usa serial explícito das credentials quando informado', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        status: 'success',
        data: {
          success: true,
          message: 'ok',
          token: makeJwt(900),
          refresh_token: makeJwt(2592000),
          user: { id: '1', login: 'a', name: 'A', email: 'x', active: 'Y' },
          terminal: { terminal_id: 1, serial: 'CUSTOM-SERIAL' },
        },
      }),
    });
    await AuthService.login({ login: 'a', password: 'b', serial: 'CUSTOM-SERIAL' });
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.data.serial).toBe('CUSTOM-SERIAL');
  });

  it('propaga mensagem de terminal não cadastrado', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        status: 'success',
        data: {
          success: false,
          message: 'Terminal não cadastrado. Informe o serial ao administrador.',
        },
      }),
    });
    await expect(AuthService.login({ login: 'x', password: 'y' })).rejects.toThrow(/não cadastrado/i);
    expect(await getToken()).toBeNull();
    expect(await getTerminal()).toBeNull();
  });

  it('lança erro com mensagem genérica em credenciais inválidas', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        status: 'success',
        data: { success: false, message: 'Não foi possível autenticar. Verifique suas credenciais.' },
      }),
    });
    await expect(AuthService.login({ login: 'x', password: 'y' })).rejects.toThrow(
      /autenticar/i,
    );
    expect(await getToken()).toBeNull();
  });

  it('propaga 429 do rate-limiter como erro', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 429,
      json: async () => ({ status: 'error', data: 'Muitas tentativas. Tente novamente em 15 minuto(s).' }),
    });
    await expect(AuthService.login({ login: 'x', password: 'y' })).rejects.toThrow(/Muitas tentativas/);
  });

  it('falha de rede vira mensagem amigável', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('network down'));
    await expect(AuthService.login({ login: 'x', password: 'y' })).rejects.toThrow();
  });
});

describe('AuthService.refreshToken', () => {
  it('rotaciona access e refresh em sucesso', async () => {
    await saveRefreshToken(makeJwt(2592000));
    const newAccess = makeJwt(900);
    const newRefresh = makeJwt(2592000);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        status: 'success',
        data: { success: true, token: newAccess, refresh_token: newRefresh },
      }),
    });

    const out = await AuthService.refreshToken();
    expect(out).toBe(newAccess);
    expect(await getToken()).toBe(newAccess);
    expect(await getRefreshToken()).toBe(newRefresh);
  });

  it('limpa storage quando servidor rejeita refresh', async () => {
    await saveToken('stale');
    await saveRefreshToken(makeJwt(2592000));
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        status: 'success',
        data: { success: false, message: 'revogado' },
      }),
    });
    expect(await AuthService.refreshToken()).toBeNull();
    expect(await getToken()).toBeNull();
    expect(await getRefreshToken()).toBeNull();
  });

  it('retorna null quando não há refresh armazenado', async () => {
    expect(await AuthService.refreshToken()).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('AuthService.logout', () => {
  it('envia token+refresh ao servidor e limpa local incluindo terminal', async () => {
    await saveToken(makeJwt(900));
    await saveRefreshToken(makeJwt(2592000));
    await saveTerminal({ terminal_id: 9, serial: 'S' });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({ status: 'success', data: { success: true } }),
    });
    await AuthService.logout();
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.method).toBe('logout');
    expect(body.token).toBeDefined();
    expect(body.refresh_token).toBeDefined();
    expect(await getToken()).toBeNull();
    expect(await getRefreshToken()).toBeNull();
    expect(await getUser()).toBeNull();
    expect(await getTerminal()).toBeNull();
  });

  it('limpa local mesmo se servidor falhar', async () => {
    await saveToken(makeJwt(900));
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('offline'));
    await AuthService.logout();
    expect(await getToken()).toBeNull();
  });

  it('não chama API quando não há tokens', async () => {
    await AuthService.logout();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('AuthService.isAuthenticated', () => {
  it('retorna false sem token', async () => {
    expect(await AuthService.isAuthenticated()).toBe(false);
  });

  it('valida token não-expirado contra servidor', async () => {
    await saveToken(makeJwt(900));
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({ status: 'success', data: { success: true } }),
    });
    expect(await AuthService.isAuthenticated()).toBe(true);
  });

  it('em token expirado tenta refresh; sem refresh retorna false', async () => {
    await saveToken(makeJwt(-10));
    expect(await AuthService.isAuthenticated()).toBe(false);
  });

  it('offline: confia no JWT local válido', async () => {
    await saveToken(makeJwt(900));
    (global.fetch as jest.Mock).mockRejectedValue(new Error('offline'));
    expect(await AuthService.isAuthenticated()).toBe(true);
  });
});
