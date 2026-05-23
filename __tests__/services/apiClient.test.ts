// @ts-nocheck
import { ApiError, apiCall, decodeJwt, isTokenExpiringSoon, setRefreshHandler } from '../../services/apiClient';
import { clearToken, saveToken } from '../../services/secureStorage';

// helper: gera JWT sintático (header.payload.sig) com exp configurável.
function makeJwt(expSecondsFromNow: number): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expSecondsFromNow }),
  ).toString('base64url');
  return `${header}.${payload}.sig`;
}

beforeEach(async () => {
  await clearToken();
  setRefreshHandler(async () => null);
  global.fetch = jest.fn();
});

describe('decodeJwt / isTokenExpiringSoon', () => {
  it('decodifica payload válido', () => {
    const t = makeJwt(600);
    expect(decodeJwt(t)?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('retorna null para token malformado', () => {
    expect(decodeJwt('not-a-jwt')).toBeNull();
  });

  it('isTokenExpiringSoon=true quando exp dentro da janela skew', () => {
    expect(isTokenExpiringSoon(makeJwt(10))).toBe(true);
  });

  it('isTokenExpiringSoon=false quando exp distante', () => {
    expect(isTokenExpiringSoon(makeJwt(600))).toBe(false);
  });
});

describe('apiCall — envelope', () => {
  it('retorna data em resposta de sucesso', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({ status: 'success', data: { hello: 'world' } }),
    });
    const out = await apiCall<{ hello: string }>({ class: 'X', method: 'y' }, { skipAuth: true });
    expect(out).toEqual({ hello: 'world' });
  });

  it('lança ApiError quando envelope.status=error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 400,
      json: async () => ({ status: 'error', data: 'Bad request' }),
    });
    await expect(apiCall({ class: 'X', method: 'y' }, { skipAuth: true })).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Bad request',
      httpStatus: 400,
    });
  });

  it('lança ApiError de timeout quando fetch aborta', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => {
      const err: any = new Error('aborted');
      err.name = 'AbortError';
      return Promise.reject(err);
    });
    await expect(apiCall({}, { skipAuth: true })).rejects.toMatchObject({
      name: 'ApiError',
      httpStatus: 0,
      message: expect.stringMatching(/Tempo de conex/),
    });
  });

  it('injeta Authorization: Bearer com token armazenado', async () => {
    await saveToken(makeJwt(600));
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({ status: 'success', data: {} }),
    });
    await apiCall({ class: 'X', method: 'y' });
    const init = (global.fetch as jest.Mock).mock.calls[0][1];
    expect(init.headers.Authorization).toMatch(/^Bearer /);
  });
});

describe('apiCall — refresh proativo e retry em 401', () => {
  it('chama refreshHandler quando token está prestes a expirar', async () => {
    await saveToken(makeJwt(5)); // expira em 5s
    const refreshed = makeJwt(600);
    const handler = jest.fn(async () => refreshed);
    setRefreshHandler(handler);

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({ status: 'success', data: {} }),
    });

    await apiCall({ class: 'X', method: 'y' });
    expect(handler).toHaveBeenCalledTimes(1);
    const init = (global.fetch as jest.Mock).mock.calls[0][1];
    expect(init.headers.Authorization).toBe(`Bearer ${refreshed}`);
  });

  it('em 401, tenta refresh e refaz a request uma vez', async () => {
    await saveToken(makeJwt(600));
    setRefreshHandler(async () => makeJwt(600));

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ status: 401, json: async () => ({ status: 'error', data: 'expired' }) })
      .mockResolvedValueOnce({ status: 200, json: async () => ({ status: 'success', data: { ok: 1 } }) });

    const out = await apiCall({ class: 'X', method: 'y' });
    expect(out).toEqual({ ok: 1 });
    expect((global.fetch as jest.Mock).mock.calls.length).toBe(2);
  });

  it('em 401 sem refresh disponível, retorna erro original', async () => {
    await saveToken(makeJwt(600));
    setRefreshHandler(async () => null);

    (global.fetch as jest.Mock).mockResolvedValue({
      status: 401,
      json: async () => ({ status: 'error', data: 'unauthorized' }),
    });

    await expect(apiCall({ class: 'X', method: 'y' })).rejects.toMatchObject({
      httpStatus: 401,
      message: 'unauthorized',
    });
  });

  it('skipAuth=true não chama refresh nem injeta Authorization', async () => {
    await saveToken(makeJwt(5));
    const handler = jest.fn();
    setRefreshHandler(handler);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({ status: 'success', data: {} }),
    });
    await apiCall({}, { skipAuth: true });
    expect(handler).not.toHaveBeenCalled();
    const init = (global.fetch as jest.Mock).mock.calls[0][1];
    expect(init.headers.Authorization).toBeUndefined();
  });

  it('single-flight: múltiplas chamadas concorrentes disparam apenas 1 refresh', async () => {
    await saveToken(makeJwt(5));
    const handler = jest.fn(async () => makeJwt(600));
    setRefreshHandler(handler);

    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: async () => ({ status: 'success', data: {} }),
    });

    await Promise.all([
      apiCall({ a: 1 }),
      apiCall({ a: 2 }),
      apiCall({ a: 3 }),
    ]);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe('ApiError', () => {
  it('preserva name e payload', () => {
    const e = new ApiError(500, 'boom', { extra: true });
    expect(e.name).toBe('ApiError');
    expect(e.httpStatus).toBe(500);
    expect(e.payload).toEqual({ extra: true });
  });
});
