import 'dotenv/config';
import { execSync } from 'node:child_process';
import { getTestDatabaseUrl } from './test-database';

/**
 * Brings the test database up to date with the migrations (non-destructive).
 * Tests never depend on an empty database: each one creates its own users.
 */
export default function globalSetup(): void {
  const url = getTestDatabaseUrl();
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url },
  });
  process.env.DATABASE_URL = url;
}
