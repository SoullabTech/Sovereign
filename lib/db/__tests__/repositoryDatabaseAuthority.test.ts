import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const EXECUTABLE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.sh', '.zsh', '.py',
]);

function trackedExecutableFiles(): string[] {
  return execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8' })
    .split('\0')
    .filter(Boolean)
    .filter((file) => EXECUTABLE_EXTENSIONS.has(path.extname(file)))
    .filter((file) => !file.includes('/__tests__/'))
    .filter((file) => !/\.(?:test|spec)\.[^.]+$/.test(file));
}

function source(file: string): string {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

const files = trackedExecutableFiles();

describe('repository database authority census', () => {
  it('contains no populated local database credential or production-named fallback', () => {
    const forbidden = [
      'postgresql://soullab@localhost:5432/maia_consciousness',
      'postgresql://postgres:@localhost:5432/maia_consciousness',
      'postgresql://maia:maia_dev_password@localhost:5433/maia_sovereign',
      'sovereign_consciousness_2024',
    ];
    const findings = files.flatMap((file) =>
      forbidden.filter((needle) => source(file).includes(needle)).map((needle) => ({ file, needle })),
    );
    expect(findings).toEqual([]);
  });

  it('contains no DATABASE_URL operator that substitutes a PostgreSQL URL', () => {
    const fallbackPatterns = [
      /process\.env\.DATABASE_URL\s*(?:\|\||\?\?)\s*[`'"]postgres(?:ql)?:\/\//,
      /\$\{DATABASE_URL:-postgres(?:ql)?:\/\//,
      /DATABASE_URL=\$\{DATABASE_URL:-/,
    ];
    const findings = files.flatMap((file) => {
      const text = source(file);
      return fallbackPatterns
        .filter((pattern) => pattern.test(text))
        .map((pattern) => ({ file, pattern: String(pattern) }));
    });
    expect(findings).toEqual([]);
  });

  it('guards every direct process.env.DATABASE_URL pg connection', () => {
    const directConnection = /(?:connectionString\s*:\s*process\.env\.DATABASE_URL|new\s+(?:Client|Pool)\s*\(\s*process\.env\.DATABASE_URL)/;
    const explicitAuthority = /(?:requireDatabaseUrl\s*\(|DATABASE_URL_REQUIRED|if\s*\(\s*!process\.env\.DATABASE_URL\s*\)|:\s*"\$\{DATABASE_URL:\?)/;
    const findings = files
      .filter((file) => directConnection.test(source(file)))
      .filter((file) => !explicitAuthority.test(source(file)));
    expect(findings).toEqual([]);
  });
});
