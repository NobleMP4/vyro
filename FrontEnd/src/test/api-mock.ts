import { vi } from 'vitest';
import { authResponse, healthy } from './fixtures';
import type { User } from '@/types/user';

export interface MockRequest {
  url: URL;
  body: unknown;
  headers: Record<string, string>;
}

type Handler = (request: MockRequest) => Response | Promise<Response>;
export type Routes = Record<string, Handler>;

export const json = (body: unknown, status = 200) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const apiError = (status: number, code: string, message = code) =>
  json({ statusCode: status, code, message }, status);

/** Default API for a signed-in user (or anonymous when user is null). */
export function sessionRoutes(user: User | null): Routes {
  return {
    'POST /auth/refresh': () =>
      user ? json(authResponse(user)) : apiError(401, 'INVALID_REFRESH_TOKEN'),
    'GET /users/me': () => (user ? json(user) : apiError(401, 'UNAUTHORIZED')),
    'GET /health': () => json(healthy),
  };
}

/**
 * Routes fetch calls by "METHOD /path" (path relative to /api/v1).
 * Unknown routes answer 404 so a missing mock fails loudly.
 */
export function mockApi(routes: Routes) {
  const calls: { key: string; request: MockRequest }[] = [];
  const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = new URL(String(input));
    const key = `${init?.method ?? 'GET'} ${url.pathname.replace(/^\/api\/v1/, '')}`;
    const request: MockRequest = {
      url,
      body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
      headers: (init?.headers ?? {}) as Record<string, string>,
    };
    calls.push({ key, request });
    const handler = routes[key];
    return handler ? handler(request) : apiError(404, 'ROUTE_NOT_FOUND', `No mock for ${key}`);
  });
  const callsTo = (key: string) => calls.filter((c) => c.key === key).map((c) => c.request);
  return { fetchMock, calls, callsTo };
}
