type Env = Record<string, string | undefined>;

/**
 * Resolves the MySQL connection string.
 *
 * - `DATABASE_URL` wins when set (handy for hosted providers giving a full URL).
 * - Otherwise it is built from `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`,
 *   URL-encoding credentials so passwords may contain any character.
 *
 * Returns undefined when neither form is complete.
 */
export function resolveDatabaseUrl(env: Env = process.env): string | undefined {
  if (env.DATABASE_URL?.trim()) return env.DATABASE_URL.trim();

  const host = env.DB_HOST?.trim();
  const user = env.DB_USER?.trim();
  const name = env.DB_NAME?.trim();
  if (!host || !user || !name) return undefined;

  const port = env.DB_PORT?.trim() || '3306';
  const password = env.DB_PASSWORD ?? '';
  const credentials = password
    ? `${encodeURIComponent(user)}:${encodeURIComponent(password)}`
    : encodeURIComponent(user);
  return `mysql://${credentials}@${host}:${port}/${encodeURIComponent(name)}`;
}
