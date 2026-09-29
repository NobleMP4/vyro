import { apiRequest } from '@/lib/api-client';
import { ApiError } from '@/lib/api-error';
import type { HealthResponse } from '@/types/api';

function isHealthResponse(value: unknown): value is HealthResponse {
  return typeof value === 'object' && value !== null && 'database' in value && 'status' in value;
}

export const healthService = {
  /** The API answers 503 with a regular health body when the database is down. */
  async get(signal?: AbortSignal): Promise<HealthResponse> {
    try {
      return await apiRequest<HealthResponse>('/health', { signal, timeoutMs: 8_000 });
    } catch (error) {
      if (error instanceof ApiError && error.status === 503 && isHealthResponse(error.payload)) {
        return error.payload;
      }
      throw error;
    }
  },
};
