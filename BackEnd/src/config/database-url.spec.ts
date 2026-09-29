import { resolveDatabaseUrl } from './database-url';

describe('resolveDatabaseUrl', () => {
  it('builds the URL from DB_* variables', () => {
    expect(
      resolveDatabaseUrl({
        DB_HOST: '192.168.1.20',
        DB_PORT: '3307',
        DB_USER: 'vyro',
        DB_PASSWORD: 'secret',
        DB_NAME: 'vyro',
      }),
    ).toBe('mysql://vyro:secret@192.168.1.20:3307/vyro');
  });

  it('defaults the port to 3306', () => {
    expect(
      resolveDatabaseUrl({ DB_HOST: 'db', DB_USER: 'u', DB_PASSWORD: 'p', DB_NAME: 'n' }),
    ).toBe('mysql://u:p@db:3306/n');
  });

  it('URL-encodes passwords with special characters', () => {
    expect(
      resolveDatabaseUrl({ DB_HOST: 'db', DB_USER: 'u', DB_PASSWORD: 'p@ss:w/rd#1', DB_NAME: 'n' }),
    ).toBe('mysql://u:p%40ss%3Aw%2Frd%231@db:3306/n');
  });

  it('prefers an explicit DATABASE_URL', () => {
    expect(
      resolveDatabaseUrl({
        DATABASE_URL: 'mysql://a:b@c:1/d',
        DB_HOST: 'ignored',
        DB_USER: 'u',
        DB_NAME: 'n',
      }),
    ).toBe('mysql://a:b@c:1/d');
  });

  it('returns undefined when the configuration is incomplete', () => {
    expect(resolveDatabaseUrl({ DB_HOST: 'db' })).toBeUndefined();
    expect(resolveDatabaseUrl({})).toBeUndefined();
  });
});
