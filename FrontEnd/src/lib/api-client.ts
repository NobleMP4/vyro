import { ApiError, ClientErrorCode } from './api-error';
import { env } from './env';

const DEFAULT_TIMEOUT_MS = 15_000;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Hooks installed by the auth layer (see lib/auth-session.ts). Kept as an
 * injection point so the HTTP client has no dependency on auth state.
 */
export interface AuthHandlers {
  getAccessToken: () => string | null;
  /** Obtains a new access token; rejects when the session is over. */
  refresh: () => Promise<void>;
  onSessionExpired: () => void;
}

let authHandlers: AuthHandlers | null = null;

export function setAuthHandlers(handlers: AuthHandlers | null): void {
  authHandlers = handlers;
}

const EXPIRED_TOKEN_CODES = new Set(['TOKEN_EXPIRED', 'UNAUTHORIZED']);

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  timeoutMs?: number;
  headers?: Record<string, string>;
  /** Attach the access token and refresh it when expired (default true). */
  auth?: boolean;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(`${env.apiUrl}${path.startsWith('/') ? path : `/${path}`}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

/**
 * Single entry point for every call to the VYRO API.
 * Components never call fetch directly: they go through services + TanStack Query.
 * Throws an ApiError for network failures, timeouts and non-2xx responses.
 * An expired access token is refreshed transparently and the request retried once.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    return await send<T>(path, options);
  } catch (error) {
    const canRefresh =
      options.auth !== false &&
      authHandlers !== null &&
      error instanceof ApiError &&
      error.status === 401 &&
      EXPIRED_TOKEN_CODES.has(error.code);
    if (!canRefresh) throw error;

    try {
      await authHandlers!.refresh();
    } catch {
      authHandlers?.onSessionExpired();
      throw error;
    }
    return send<T>(path, options);
  }
}

async function send<T>(path: string, options: RequestOptions): Promise<T> {
  const { method = 'GET', body, query, signal, timeoutMs = DEFAULT_TIMEOUT_MS, headers } = options;
  const timeout = AbortSignal.timeout(timeoutMs);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  const token = options.auth !== false ? authHandlers?.getAccessToken() : null;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      signal: combined,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    // Caller-initiated aborts (e.g. TanStack Query cancellation) are rethrown untouched.
    if (signal?.aborted) throw error;
    if (timeout.aborted) {
      throw new ApiError(0, ClientErrorCode.TIMEOUT, 'Request timed out');
    }
    throw new ApiError(0, ClientErrorCode.NETWORK_ERROR, 'Network request failed');
  }

  const payload = await parseBody(response);
  if (!response.ok) {
    throw ApiError.fromBody(response.status, payload);
  }
  return payload as T;
}
