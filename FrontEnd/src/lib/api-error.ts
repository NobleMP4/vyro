import type { ApiErrorBody } from '@/types/api';

/** Client-side codes for failures that never reached the API. */
export const ClientErrorCode = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
} as const;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;
  /** Raw response body, when the server sent one. */
  readonly payload?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.payload = payload;
  }

  static fromBody(status: number, body: unknown): ApiError {
    if (isApiErrorBody(body)) {
      return new ApiError(status, body.code, body.message, body.details, body);
    }
    return new ApiError(
      status,
      `HTTP_${status}`,
      `Request failed with status ${status}`,
      undefined,
      body,
    );
  }
}

export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ApiErrorBody).code === 'string' &&
    typeof (value as ApiErrorBody).message === 'string'
  );
}
