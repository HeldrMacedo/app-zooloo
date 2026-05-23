import { REQUEST_TIMEOUT_MS, getApiBaseUrl } from './apiConfig';
import { getToken } from './secureStorage';

export interface ApiEnvelope<T> {
  status: 'success' | 'error';
  data: T | string;
}

export class ApiError extends Error {
  constructor(
    public httpStatus: number,
    message: string,
    public payload?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface JwtPayload {
  exp?: number;
  expires?: number;
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((input.length + 3) % 4);
  if (typeof atob === 'function') return atob(padded);
  const { Buffer } = require('buffer');
  return Buffer.from(padded, 'base64').toString('binary');
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(base64UrlDecode(parts[1])) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpiringSoon(token: string, skewSeconds = 60): boolean {
  const p = decodeJwt(token);
  if (!p) return true;
  const exp = (p.exp ?? p.expires) as number | undefined;
  if (!exp) return true;
  return exp - skewSeconds < Math.floor(Date.now() / 1000);
}

async function timedFetch(url: string, init: RequestInit, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Single-flight refresh: múltiplas chamadas concorrentes que percebem 401/expiração
 * compartilham a mesma promessa de refresh em vez de disparar várias rotações.
 */
let refreshInFlight: Promise<string | null> | null = null;
type RefreshFn = () => Promise<string | null>;
let refreshFn: RefreshFn | null = null;

/**
 * Injetado pelo módulo de auth para quebrar dependência circular
 * (apiClient não importa auth.ts diretamente).
 */
export function setRefreshHandler(fn: RefreshFn) {
  refreshFn = fn;
}

async function performRefresh(): Promise<string | null> {
  if (!refreshFn) return null;
  if (!refreshInFlight) {
    refreshInFlight = refreshFn().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

interface CallOptions {
  /** Pular auth (login, refreshToken). */
  skipAuth?: boolean;
  /** Pular retry em 401 (evita loop quando o próprio refresh dá 401). */
  skipRetry?: boolean;
  /** Timeout custom (ms). */
  timeoutMs?: number;
}

/**
 * Chamada padrão para o backend Adianti.
 * Injeta Bearer, faz refresh proativo se token expira em < 60s,
 * e retry transparente uma vez em 401.
 */
export async function apiCall<T>(
  body: Record<string, unknown>,
  opts: CallOptions = {},
): Promise<T> {
  let token: string | null = null;

  if (!opts.skipAuth) {
    token = await getToken();
    if (token && isTokenExpiringSoon(token)) {
      const refreshed = await performRefresh();
      if (refreshed) token = refreshed;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await timedFetch(getApiBaseUrl(), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }, opts.timeoutMs);
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new ApiError(0, 'Tempo de conexão esgotado.');
    }
    throw new ApiError(0, 'Não foi possível conectar ao servidor.');
  }

  // Retry transparente em 401 (token revogado server-side / clock skew)
  if (res.status === 401 && !opts.skipAuth && !opts.skipRetry) {
    const refreshed = await performRefresh();
    if (refreshed) {
      return apiCall<T>(body, { ...opts, skipRetry: true });
    }
  }

  let envelope: ApiEnvelope<T>;
  try {
    envelope = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError(res.status, `Resposta inválida (HTTP ${res.status})`);
  }

  if (envelope.status !== 'success') {
    throw new ApiError(
      res.status,
      typeof envelope.data === 'string' ? envelope.data : 'Erro na requisição',
      envelope.data,
    );
  }

  return envelope.data as T;
}
