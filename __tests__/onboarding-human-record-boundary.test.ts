/**
 * SOURCE-CUSTODY-PII-01 · ACT 2 — the client/human-record boundary.
 *
 * THE LAW: no module that reaches the browser may import `lib/ganesha/contacts`.
 * That file holds identified human records — name, email, joinDate, status,
 * groups, tags and 48 passcodes. Until 2026-09-15 two `'use client'` onboarding
 * components value-imported it, which placed all of it in the client bundle and
 * decided admission against data the visitor already held.
 *
 * ⛔ `import 'server-only'` IS THE MECHANISM; THIS TEST IS THE WITNESS.
 * The mechanism alone is an assertion until something demonstrates it bites —
 * so T3 below reintroduces the violation on purpose and REQUIRES the walker to
 * catch it. A guard that cannot fail is not a guard.
 *
 * ⭐ COMMENTS ARE STRIPPED BEFORE SCANNING. The repaired components and this
 * file both NAME the forbidden module in prose, to say why it must not be
 * imported. A raw-source scan would read that prose as the violation and fail
 * the very files that document their own compliance. (Same lesson as the
 * Circles C21 instrument repair, applied before it could bite.)
 */
import * as fs from 'fs';
import * as path from 'path';

const REPO = path.resolve(__dirname, '..');
const PROTECTED = 'lib/ganesha/contacts';
const CLIENT_ROOTS = ['app', 'components'];
const EXTS = ['.ts', '.tsx'];

/** Remove block and line comments so prose naming a module is never a hit. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function read(file: string): string | null {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

function isClientModule(src: string): boolean {
  const head = stripComments(src).trimStart().slice(0, 200);
  return /^['"]use client['"]/.test(head);
}

/** Value imports only. `import type {...}` is erased and never reaches a bundle. */
function importSpecifiers(src: string): string[] {
  const clean = stripComments(src);
  const out: string[] = [];
  const re = /import\s+(?!type\s)([\s\S]*?)from\s*['"]([^'"]+)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(clean)) !== null) out.push(m[2]);
  const bare = /import\s*['"]([^'"]+)['"]/g;
  while ((m = bare.exec(clean)) !== null) out.push(m[1]);
  const dyn = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((m = dyn.exec(clean)) !== null) out.push(m[1]);
  return out;
}

function resolveSpec(spec: string, fromFile: string): string | null {
  let base: string;
  if (spec.startsWith('@/')) base = path.join(REPO, spec.slice(2));
  else if (spec.startsWith('.')) base = path.resolve(path.dirname(fromFile), spec);
  else return null; // node_modules — cannot reach the protected module
  for (const ext of EXTS) {
    if (fs.existsSync(base + ext)) return base + ext;
    const idx = path.join(base, 'index' + ext);
    if (fs.existsSync(idx)) return idx;
  }
  return fs.existsSync(base) && fs.statSync(base).isFile() ? base : null;
}

function walkFiles(dir: string, acc: string[] = []): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkFiles(full, acc);
    else if (EXTS.includes(path.extname(e.name))) acc.push(full);
  }
  return acc;
}

/**
 * Transitively walk value imports from `entry` and return the path by which the
 * protected module is reached, or null. Returns the full chain so a failure
 * names the route, not just the fact.
 */
function reachesProtected(entry: string, seen = new Set<string>()): string[] | null {
  if (seen.has(entry)) return null;
  seen.add(entry);
  const src = read(entry);
  if (src === null) return null;
  for (const spec of importSpecifiers(src)) {
    const resolved = resolveSpec(spec, entry);
    if (!resolved) continue;
    const rel = path.relative(REPO, resolved).replace(/\.(ts|tsx)$/, '');
    if (rel === PROTECTED) return [path.relative(REPO, entry), rel];
    const deeper = reachesProtected(resolved, seen);
    if (deeper) return [path.relative(REPO, entry), ...deeper];
  }
  return null;
}

describe('SOURCE-CUSTODY-PII-01 · client/human-record boundary', () => {
  test('T1 — the protected module declares the server-only boundary', () => {
    const src = read(path.join(REPO, PROTECTED + '.ts'));
    expect(src).not.toBeNull();
    expect(stripComments(src!)).toMatch(/import\s*['"]server-only['"]/);
  });

  test('T2 — no client module reaches the human records, transitively', () => {
    const clientEntries = CLIENT_ROOTS.flatMap((r) => walkFiles(path.join(REPO, r))).filter(
      (f) => {
        const src = read(f);
        return src !== null && isClientModule(src);
      },
    );

    // The corpus must be non-empty, or T2 passes by having nothing to check.
    expect(clientEntries.length).toBeGreaterThan(0);

    const violations = clientEntries
      .map((f) => reachesProtected(f))
      .filter((chain): chain is string[] => chain !== null)
      .map((chain) => chain.join('  →  '));

    expect(violations).toEqual([]);
  });

  test('T3 — MUTANT: the walker kills a reintroduced client import', () => {
    const mutant = path.join(REPO, 'components', '__pii_boundary_mutant__.tsx');
    fs.writeFileSync(
      mutant,
      `'use client';\nimport { ganeshaContacts } from '@/lib/ganesha/contacts';\nexport default function M() { return ganeshaContacts.length; }\n`,
      'utf8',
    );
    try {
      const chain = reachesProtected(mutant);
      // If this is null the guard is a tautology and T2 proves nothing.
      expect(chain).not.toBeNull();
      expect(chain!.join(' → ')).toContain(PROTECTED);
    } finally {
      fs.unlinkSync(mutant);
    }
  });

  test('T4 — admission is not decided in the browser', () => {
    for (const rel of [
      'components/onboarding/SacredSoulInduction.tsx',
      'components/onboarding/BetaTesterGateway.tsx',
    ]) {
      const clean = stripComments(read(path.join(REPO, rel))!);
      // No local passcode corpus, and no format-only admission predicate.
      expect(clean).not.toMatch(/metadata\.passcode/);
      expect(clean).not.toMatch(/isValidSoullabFormat/);
      // The decision is fetched.
      expect(clean).toMatch(/\/api\/onboarding\/recognize-key/);
    }
  });
});
