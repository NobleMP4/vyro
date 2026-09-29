import { NodeEnv, validateEnv } from './env.validation';

const secret = 'x'.repeat(32);
const base = {
  DATABASE_URL: 'mysql://u:p@localhost:3306/vyro',
  JWT_SECRET: secret,
  JWT_REFRESH_SECRET: secret,
};

describe('validateEnv', () => {
  it('applies defaults for a minimal development environment', () => {
    const env = validateEnv(base);
    expect(env.NODE_ENV).toBe(NodeEnv.Development);
    expect(env.PORT).toBe(3000);
    expect(env.FRONTEND_URL).toBe('http://localhost:5173');
    expect(env.AUTH_RATE_LIMIT).toBe(10);
  });

  it('coerces numbers and booleans from strings', () => {
    const env = validateEnv({ ...base, PORT: '4000', SWAGGER_ENABLED: 'false', SMTP_PORT: '587' });
    expect(env.PORT).toBe(4000);
    expect(env.SWAGGER_ENABLED).toBe(false);
    expect(env.SMTP_PORT).toBe(587);
  });

  it('builds DATABASE_URL from DB_* variables', () => {
    const { DATABASE_URL: _unused, ...rest } = base;
    const env = validateEnv({
      ...rest,
      DB_HOST: '10.0.0.5',
      DB_USER: 'vyro',
      DB_PASSWORD: 'x',
      DB_NAME: 'vyro',
    });
    expect(env.DATABASE_URL).toBe('mysql://vyro:x@10.0.0.5:3306/vyro');
  });

  it('rejects a missing database configuration', () => {
    const { DATABASE_URL: _unused, ...rest } = base;
    expect(() => validateEnv(rest)).toThrow(/DB_HOST/);
  });

  it('requires strong JWT secrets', () => {
    expect(() => validateEnv({ ...base, JWT_SECRET: undefined })).toThrow(/JWT_SECRET/);
    expect(() => validateEnv({ ...base, JWT_REFRESH_SECRET: 'short' })).toThrow(
      /JWT_REFRESH_SECRET/,
    );
  });
});
