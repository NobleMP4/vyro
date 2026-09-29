import { SetMetadata } from '@nestjs/common';

export const SENSITIVE_THROTTLE_KEY = 'vyro:sensitive-throttle';

/**
 * Applies the stricter "sensitive" rate limit (AUTH_RATE_LIMIT per minute per IP)
 * on top of the default one. Use on credential endpoints (login, register…).
 */
export const SensitiveThrottle = () => SetMetadata(SENSITIVE_THROTTLE_KEY, true);
