import { vi } from 'vitest';
import { apiError, json, mockApi } from '@/test/api-mock';
import { authResponse } from '@/test/fixtures';
import { apiRequest } from './api-client';
import { ApiError } from './api-error';
import { getAccessToken, onSessionExpired, setSession } from './auth-session';

describe('apiRequest', () => {
  it('calls the configured API URL and returns the JSON body', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(json({ ok: true }));

    await expect(
      apiRequest('/health', { query: { period: '7d', skip: undefined } }),
    ).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/api/v1/health?period=7d',
      expect.objectContaining({ method: 'GET', credentials: 'include' }),
    );
  });

  it('sends JSON bodies with the right content type', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 204 }));

    await expect(
      apiRequest('/weight', { method: 'POST', body: { value: 78.4 } }),
    ).resolves.toBeUndefined();
    const init = fetchMock.mock.calls[0][1]!;
    expect(init.body).toBe('{"value":78.4}');
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json' });
  });

  it('throws an ApiError carrying the API error code', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(apiError(400, 'INVALID_WEIGHT'));

    const error = await apiRequest('/weight').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 400, code: 'INVALID_WEIGHT' });
  });

  it('falls back to an HTTP_<status> code for non-standard error bodies', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('Bad gateway', { status: 502 }));
    await expect(apiRequest('/health')).rejects.toMatchObject({ status: 502, code: 'HTTP_502' });
  });

  it('turns network failures into NETWORK_ERROR', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(apiRequest('/health')).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' });
  });
});

describe('apiRequest authentication', () => {
  it('sends the access token as a Bearer header', async () => {
    setSession(authResponse(undefined, 'token-A'));
    const { callsTo } = mockApi({ 'GET /users/me': () => json({}) });

    await apiRequest('/users/me');
    expect(callsTo('GET /users/me')[0].headers).toMatchObject({ Authorization: 'Bearer token-A' });
  });

  it('refreshes an expired token once and retries the request', async () => {
    setSession(authResponse(undefined, 'expired'));
    const { callsTo } = mockApi({
      'GET /users/me': ({ headers }) =>
        headers.Authorization === 'Bearer fresh'
          ? json({ ok: true })
          : apiError(401, 'TOKEN_EXPIRED'),
      'POST /auth/refresh': () => json(authResponse(undefined, 'fresh')),
    });

    await expect(apiRequest('/users/me')).resolves.toEqual({ ok: true });
    expect(callsTo('POST /auth/refresh')).toHaveLength(1);
    expect(callsTo('POST /auth/refresh')[0].headers).toMatchObject({ 'X-VYRO-Client': 'web' });
    expect(getAccessToken()).toBe('fresh');
  });

  it('refreshes only once for concurrent requests', async () => {
    setSession(authResponse(undefined, 'expired'));
    const { callsTo } = mockApi({
      'GET /a': ({ headers }) =>
        headers.Authorization === 'Bearer fresh' ? json(1) : apiError(401, 'TOKEN_EXPIRED'),
      'GET /b': ({ headers }) =>
        headers.Authorization === 'Bearer fresh' ? json(2) : apiError(401, 'TOKEN_EXPIRED'),
      'POST /auth/refresh': () => json(authResponse(undefined, 'fresh')),
    });

    await expect(Promise.all([apiRequest('/a'), apiRequest('/b')])).resolves.toEqual([1, 2]);
    expect(callsTo('POST /auth/refresh')).toHaveLength(1);
  });

  it('ends the session when the refresh fails', async () => {
    setSession(authResponse(undefined, 'expired'));
    const expired = vi.fn();
    const unsubscribe = onSessionExpired(expired);
    mockApi({
      'GET /users/me': () => apiError(401, 'TOKEN_EXPIRED'),
      'POST /auth/refresh': () => apiError(401, 'INVALID_REFRESH_TOKEN'),
    });

    await expect(apiRequest('/users/me')).rejects.toMatchObject({ code: 'TOKEN_EXPIRED' });
    expect(expired).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBeNull();
    unsubscribe();
  });

  it('does not try to refresh on other errors', async () => {
    const { callsTo } = mockApi({ 'GET /users/me': () => apiError(403, 'FORBIDDEN') });
    await expect(apiRequest('/users/me')).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(callsTo('POST /auth/refresh')).toHaveLength(0);
  });
});
