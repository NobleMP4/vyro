#!/usr/bin/env node
/**
 * Prepares BackEnd/.env for local development:
 * - creates it from .env.example if it does not exist;
 * - fills JWT_SECRET / JWT_REFRESH_SECRET with strong random values when empty
 *   or too short. Existing valid values and every other variable are kept.
 *
 * Usage: npm run setup:env
 */
import { randomBytes } from 'node:crypto';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env');
const examplePath = join(root, '.env.example');
const SECRETS = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];
const MIN_LENGTH = 32;

if (!existsSync(envPath)) {
  copyFileSync(examplePath, envPath);
  console.log('Created .env from .env.example — remember to set your DB_* values.');
}

let content = readFileSync(envPath, 'utf8');
const generated = [];

for (const name of SECRETS) {
  const pattern = new RegExp(`^${name}=(.*)$`, 'm');
  const current =
    pattern
      .exec(content)?.[1]
      ?.trim()
      .replace(/^["']|["']$/g, '') ?? '';
  if (current.length >= MIN_LENGTH) continue;

  const line = `${name}=${randomBytes(48).toString('base64')}`;
  content = pattern.test(content)
    ? content.replace(pattern, line)
    : `${content.replace(/\n?$/, '\n')}${line}\n`;
  generated.push(name);
}

writeFileSync(envPath, content);
console.log(
  generated.length
    ? `Generated ${generated.join(' and ')} in .env`
    : 'JWT secrets already set — nothing to do.',
);
