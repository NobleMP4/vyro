export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_DAYS = 30;
export const PASSWORD_RESET_TTL_MINUTES = 60;

/**
 * A refresh token revoked less than this long ago is treated as a benign race
 * (two tabs refreshing at once), not as token theft.
 */
export const REFRESH_REUSE_GRACE_MS = 20_000;

export const REFRESH_COOKIE_NAME = 'vyro_refresh';
/** Cookie only sent to the auth routes, never to the rest of the API. */
export const REFRESH_COOKIE_PATH = '/api/v1/auth';

/**
 * Header required on cookie-authenticated routes (refresh, logout). Browsers
 * can't send custom headers cross-site without a CORS preflight, which blocks CSRF.
 */
export const CLIENT_HEADER = 'x-vyro-client';
