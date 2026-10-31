import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (relative: string) => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const clients = [
  'apps/api/src/db/postgres.ts',
  'packages/shared/src/db/postgres.ts',
  'lib/database/postgres.ts',
] as const;

describe('all active PostgreSQL clients require explicit authority', () => {
  it.each(clients)('%s contains no populated local database fallback', (relative) => {
    const source = read(relative);
    expect(source).not.toMatch(/postgres(?:ql)?:\/\/[^\s'\"]*(?:localhost|127\.0\.0\.1)[^\s'\"]*maia_consciousness/);
    expect(source).not.toMatch(/process\.env\.DATABASE_URL\s*(?:\|\||\?\?)/);
  });

  it.each(clients)('%s names an explicit configuration refusal', (relative) => {
    const source = read(relative);
    expect(source).toContain('DATABASE_URL');
    expect(source).toMatch(/requireDatabaseUrl|DATABASE_URL_REQUIRED/);
  });
});
