import { NodeEnv, validateEnv } from './env.validation';

const base = { DATABASE_URL: 'mysql://u:p@localhost:3306/vyro' };
const secret = 'x'.repeat(32);

describe('validateEnv', () => {
  it('applies defaults for a minimal development environment', () => {
    const env = validateEnv(base);
    expect(env.NODE_ENV).toBe(NodeEnv.Development);
    expect(env.PORT).toBe(3000);
    expect(env.FRONTEND_URL).toBe('http://localhost:5173');
  });

  it('coerces PORT and SWAGGER_ENABLED from strings', () => {
    const env = validateEnv({ ...base, PORT: '4000', SWAGGER_ENABLED: 'false' });
    expect(env.PORT).toBe(4000);
    expect(env.SWAGGER_ENABLED).toBe(false);
  });

  it('builds DATABASE_URL from DB_* variables', () => {
    const env = validateEnv({
      DB_HOST: '10.0.0.5',
      DB_USER: 'vyro',
      DB_PASSWORD: 'x',
      DB_NAME: 'vyro',
    });
    expect(env.DATABASE_URL).toBe('mysql://vyro:x@10.0.0.5:3306/vyro');
  });

  it('rejects a missing DATABASE_URL', () => {
    expect(() => validateEnv({})).toThrow(/DB_HOST/);
  });

  it('requires strong JWT secrets in production', () => {
    expect(() => validateEnv({ ...base, NODE_ENV: 'production' })).toThrow(/JWT_SECRET/);
    expect(() =>
      validateEnv({
        ...base,
        NODE_ENV: 'production',
        JWT_SECRET: secret,
        JWT_REFRESH_SECRET: secret,
      }),
    ).not.toThrow();
  });

  it('rejects a weak JWT secret even in development', () => {
    expect(() => validateEnv({ ...base, JWT_SECRET: 'short' })).toThrow(/JWT_SECRET/);
  });
});
