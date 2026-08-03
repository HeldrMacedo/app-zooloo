import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const REQUEST_TIMEOUT_MS = 15_000;

type Extra = {
  apiBaseUrl?: string;
  allowInsecureHttp?: boolean;
};

function getExtra(): Extra {
  return (Constants.expoConfig?.extra ?? {}) as Extra;
}

function resolveDevHost(): string {
  const hostUri = Constants.expoConfig?.hostUri || '';
  const host = hostUri ? hostUri.split(':')[0] : '';
  if (host && !host.includes('exp.direct') && !host.includes('exp.host')) return host;
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

export function getApiBaseUrl(): string {
  const extra = getExtra();
  const explicit = extra.apiBaseUrl?.trim();

  let baseUrl: string;
  if (explicit) {
    baseUrl = explicit.replace(/\/+$/, '') + '/rest.php';
  } else {
    const host = resolveDevHost();
    baseUrl = `http://${host}/rest.php`;
  }

  if (!__DEV__ && baseUrl.startsWith('http://') && !extra.allowInsecureHttp) {
    throw new Error(
      'Configuração insegura: API em HTTP não é permitida em build de produção. ' +
        'Defina expo.extra.apiBaseUrl com HTTPS em app.json.',
    );
  }

  return baseUrl;
}
