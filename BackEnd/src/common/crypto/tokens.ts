import { createHmac, randomBytes } from 'node:crypto';

/** Opaque, URL-safe random token (256 bits). */
export function generateToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Keyed hash used to store tokens: a database leak alone is not enough
 * to forge or replay them. Hex output = 64 chars (CHAR(64) column).
 */
export function hashToken(token: string, secret: string): string {
  return createHmac('sha256', secret).update(token).digest('hex');
}
