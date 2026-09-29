import type { AuthResponse } from '@/types/user';
import { apiRequest, setAuthHandlers } from './api-client';
import { ApiError } from './api-error';

/**
 * Session state kept outside React so the API client can use it.
 * - The access token lives in memory only (never in localStorage).
 * - The refresh token is an httpOnly cookie the page cannot read.
 */
let accessToken: string | null = null;
let inFlight: Promise<AuthResponse> | null = null;
const expiredListeners = new Set<() => void>();
const refreshedListeners = new Set<(session: AuthResponse) => void>();

/** Required by the API on cookie routes (CSRF protection). */
export const CLIENT_HEADERS = { 'X-VYRO-Client': 'web' };

const LOCK_NAME = 'vyro-auth-refresh';
const ROTATION_RETRY_DELAY_MS = 400;

export function setSession(session: AuthResponse | null): void {
  accessToken = session?.accessToken ?? null;
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function requestRefresh(): Promise<AuthResponse> {
  try {
    return await apiRequest<AuthResponse>('/auth/refresh', {
      method: 'POST',
      auth: false,
      headers: CLIENT_HEADERS,
    });
  } catch (error) {
    // Another tab rotated the cookie a moment ago: the browser now holds the new one.
    if (error instanceof ApiError && error.code === 'REFRESH_TOKEN_ROTATED') {
      await new Promise((resolve) => setTimeout(resolve, ROTATION_RETRY_DELAY_MS));
      return apiRequest<AuthResponse>('/auth/refresh', {
        method: 'POST',
        auth: false,
        headers: CLIENT_HEADERS,
      });
    }
    throw error;
  }
}

/**
 * Refreshes the session once, even if many requests (or several tabs, via the
 * Web Locks API when available) ask at the same time.
 */
export function refreshSession(): Promise<AuthResponse> {
  inFlight ??= (async () => {
    try {
      const run = () => requestRefresh();
      const session = navigator.locks ? await navigator.locks.request(LOCK_NAME, run) : await run();
      setSession(session);
      refreshedListeners.forEach((listener) => listener(session));
      return session;
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

export function onSessionExpired(listener: () => void): () => void {
  expiredListeners.add(listener);
  return () => expiredListeners.delete(listener);
}

export function onSessionRefreshed(listener: (session: AuthResponse) => void): () => void {
  refreshedListeners.add(listener);
  return () => refreshedListeners.delete(listener);
}

setAuthHandlers({
  getAccessToken,
  refresh: async () => {
    await refreshSession();
  },
  onSessionExpired: () => {
    setSession(null);
    expiredListeners.forEach((listener) => listener());
  },
});
