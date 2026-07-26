// @ts-nocheck
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

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
} from '../../services/secureStorage';

beforeEach(async () => {
  (SecureStore as any).__reset?.();
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('secureStorage — token (SecureStore)', () => {
  it('salva e recupera o token via SecureStore', async () => {
    await saveToken('abc.def.ghi');
    expect(await getToken()).toBe('abc.def.ghi');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'zooloo.auth.token',
      'abc.def.ghi',
      expect.objectContaining({ keychainAccessible: 'AFTER_FIRST_UNLOCK' }),
    );
  });

  it('migra token legado de AsyncStorage para SecureStore na primeira leitura', async () => {
    await AsyncStorage.setItem('userToken', 'legacy-token');
    const tok = await getToken();
    expect(tok).toBe('legacy-token');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'zooloo.auth.token',
      'legacy-token',
      expect.any(Object),
    );
    expect(await AsyncStorage.getItem('userToken')).toBeNull();
  });

  it('clearToken remove tanto o novo quanto o legado', async () => {
    await saveToken('x');
    await AsyncStorage.setItem('userToken', 'legacy');
    await clearToken();
    expect(await getToken()).toBeNull();
    expect(await AsyncStorage.getItem('userToken')).toBeNull();
  });

  it('retorna null quando não há token armazenado', async () => {
    expect(await getToken()).toBeNull();
  });
});

describe('secureStorage — refresh token', () => {
  it('persiste e recupera refresh token separadamente do access', async () => {
    await saveToken('access');
    await saveRefreshToken('refresh');
    expect(await getToken()).toBe('access');
    expect(await getRefreshToken()).toBe('refresh');
  });

  it('clearRefreshToken não afeta access token', async () => {
    await saveToken('access');
    await saveRefreshToken('refresh');
    await clearRefreshToken();
    expect(await getRefreshToken()).toBeNull();
    expect(await getToken()).toBe('access');
  });
});

describe('secureStorage — user (AsyncStorage)', () => {
  it('salva user serializado e recupera como objeto', async () => {
    const user = { id: '1', login: 'admin', name: 'Admin', email: 'a@b.c', active: 'Y' };
    await saveUser(user);
    expect(await getUser()).toEqual(user);
  });

  it('getUser retorna null quando não há nada', async () => {
    expect(await getUser()).toBeNull();
  });

  it('getUser retorna null se conteúdo armazenado for inválido', async () => {
    await AsyncStorage.setItem('zooloo.auth.user', 'not-json');
    expect(await getUser()).toBeNull();
  });

  it('getUser faz fallback para chave legada userData', async () => {
    await AsyncStorage.setItem('userData', JSON.stringify({ id: 'legacy' }));
    expect(await getUser()).toEqual({ id: 'legacy' });
  });

  it('clearUser remove ambas as chaves', async () => {
    await saveUser({ id: '1' });
    await AsyncStorage.setItem('userData', '{}');
    await clearUser();
    expect(await getUser()).toBeNull();
  });
});

describe('secureStorage — terminal', () => {
  it('salva e recupera terminal', async () => {
    await saveTerminal({ terminal_id: 5, serial: 'ABC', tipo: 'APP', multi_usuario: 'N' });
    expect(await getTerminal()).toEqual({
      terminal_id: 5,
      serial: 'ABC',
      tipo: 'APP',
      multi_usuario: 'N',
    });
  });

  it('clearTerminal remove o registro', async () => {
    await saveTerminal({ terminal_id: 1, serial: 'X' });
    await clearTerminal();
    expect(await getTerminal()).toBeNull();
  });
});
