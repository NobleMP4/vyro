import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'prisma/config';
import { resolveDatabaseUrl } from './src/config/database-url';

// The schema reads env("DATABASE_URL"): derive it from DB_* when not given directly.
// Child processes (e.g. the seed) inherit it.
const databaseUrl = resolveDatabaseUrl();
if (databaseUrl) process.env.DATABASE_URL = databaseUrl;

// With a config file Prisma no longer loads .env on its own, hence dotenv above.
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
});
