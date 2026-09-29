import { resolveDatabaseUrl } from '../../src/config/database-url';

/**
 * Integration tests run against a dedicated database whose name must end with
 * `_test`, so they can never touch a real database. Configure it with
 * TEST_DATABASE_URL; otherwise the DB_* settings are reused with `vyro_test`.
 */
export function getTestDatabaseUrl(): string {
  const url =
    process.env.TEST_DATABASE_URL ??
    resolveDatabaseUrl({
      DB_HOST: process.env.DB_HOST ?? 'localhost',
      DB_PORT: process.env.DB_PORT,
      DB_USER: process.env.DB_USER ?? 'vyro',
      DB_PASSWORD: process.env.DB_PASSWORD ?? 'vyro',
      DB_NAME: 'vyro_test',
    });
  if (!url) throw new Error('No test database configured (TEST_DATABASE_URL).');

  const name = new URL(url).pathname.slice(1);
  if (!name.endsWith('_test')) {
    throw new Error(
      `Refusing to run integration tests on "${name}": its name must end with _test.`,
    );
  }
  return url;
}
