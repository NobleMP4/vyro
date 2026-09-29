/**
 * Stable, machine-readable error codes returned by the API in `code`.
 * The FrontEnd maps them to user-facing messages; never rename an existing one.
 * Feature modules add their own codes here (e.g. INVALID_WEIGHT).
 */
export const ErrorCode = {
  BAD_REQUEST: 'BAD_REQUEST',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
  CONFLICT: 'CONFLICT',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',

  // Auth
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_USED: 'EMAIL_ALREADY_USED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  /** A parallel request (other tab) already rotated this refresh token: retry once. */
  REFRESH_TOKEN_ROTATED: 'REFRESH_TOKEN_ROTATED',
  INVALID_RESET_TOKEN: 'INVALID_RESET_TOKEN',
  /** Wrong current password when changing password / deleting the account. */
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  UNTRUSTED_CLIENT: 'UNTRUSTED_CLIENT',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
