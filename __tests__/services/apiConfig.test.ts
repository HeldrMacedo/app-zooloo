// @ts-nocheck
import { getApiBaseUrl } from '../../services/apiConfig';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { hostUri: '192.168.1.10:8081', extra: {} } },
}));

const Constants = require('expo-constants').default;
const originalDev = (global as any).__DEV__;

afterEach(() => {
  (global as any).__DEV__ = originalDev;
  Constants.expoConfig = { hostUri: '192.168.1.10:8081', extra: {} };
});

describe('apiConfig.getApiBaseUrl', () => {
  it('usa hostUri do Metro quando não há extra.apiBaseUrl', () => {
    (global as any).__DEV__ = true;
    expect(getApiBaseUrl()).toBe('http://192.168.1.10/rest.php');
  });

  it('ignora hostUri de tunnel (.exp.direct) e usa fallback local', () => {
    (global as any).__DEV__ = true;
    Constants.expoConfig = { hostUri: 'caybdba-anonymous-8081.exp.direct', extra: {} };
    expect(getApiBaseUrl()).toMatch(/^http:\/\/(localhost|10\.0\.2\.2)\/rest\.php$/);
  });

  it('respeita expo.extra.apiBaseUrl quando definido', () => {
    (global as any).__DEV__ = true;
    Constants.expoConfig = { hostUri: '', extra: { apiBaseUrl: 'https://api.zooloo.com.br' } };
    expect(getApiBaseUrl()).toBe('https://api.zooloo.com.br/rest.php');
  });

  it('remove barras finais do apiBaseUrl', () => {
    (global as any).__DEV__ = true;
    Constants.expoConfig = { hostUri: '', extra: { apiBaseUrl: 'https://api.zooloo.com.br//' } };
    expect(getApiBaseUrl()).toBe('https://api.zooloo.com.br/rest.php');
  });

  it('lança erro em produção quando a URL é HTTP sem override', () => {
    (global as any).__DEV__ = false;
    Constants.expoConfig = { hostUri: '', extra: { apiBaseUrl: 'http://api.zooloo.com.br' } };
    expect(() => getApiBaseUrl()).toThrow(/HTTP/);
  });

  it('permite HTTP em produção quando allowInsecureHttp=true', () => {
    (global as any).__DEV__ = false;
    Constants.expoConfig = {
      hostUri: '',
      extra: { apiBaseUrl: 'http://api.zooloo.local', allowInsecureHttp: true },
    };
    expect(getApiBaseUrl()).toBe('http://api.zooloo.local/rest.php');
  });

  it('aceita HTTPS em produção', () => {
    (global as any).__DEV__ = false;
    Constants.expoConfig = { hostUri: '', extra: { apiBaseUrl: 'https://api.zooloo.com.br' } };
    expect(getApiBaseUrl()).toBe('https://api.zooloo.com.br/rest.php');
  });
});
