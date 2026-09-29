import { generateToken, hashToken } from './tokens';

describe('tokens', () => {
  it('generates unique URL-safe tokens', () => {
    const a = generateToken();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(generateToken()).not.toBe(a);
  });

  it('hashes deterministically per secret', () => {
    expect(hashToken('t', 's1')).toHaveLength(64);
    expect(hashToken('t', 's1')).toBe(hashToken('t', 's1'));
    expect(hashToken('t', 's1')).not.toBe(hashToken('t', 's2'));
  });
});
