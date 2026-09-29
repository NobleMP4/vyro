import { vi } from 'vitest';
import { jsonResponse } from '@/test/render';
import { apiRequest } from './api-client';
import { ApiError } from './api-error';

describe('apiRequest', () => {
  it('calls the configured API URL and returns the JSON body', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ ok: true }));

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
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse(
        { statusCode: 400, code: 'INVALID_WEIGHT', message: 'Le poids fourni est invalide.' },
        400,
      ),
    );

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
