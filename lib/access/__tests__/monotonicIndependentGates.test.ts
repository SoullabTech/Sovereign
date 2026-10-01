/**
 * MONOTONIC-INDEPENDENT-GATES-01 — guard (ratified founder law, 2026-10-01).
 *
 *   Each admission decision is a function only of its own gate's authority
 *   inputs plus authenticated member identity; no admission path may consult
 *   another independent gate's state, membership, configuration, or result.
 *
 * An admission PATH is the authority module, its admission endpoint and the
 * client hook that reflects the endpoint — plus everything those files reach
 * through local imports. Scanning only the two authority modules would let
 * coupling migrate into a route, a hook or a shared helper while the
 * authority files still look clean, so the guard walks the whole graph.
 *
 * Lethality: every check is also run against named defeat candidates (source
 * mutations, including a coupling moved into a shared helper and into a new
 * intermediate file). A guard that only ever saw the conforming source would
 * not be evidence. Vacuity is guarded too: each graph must actually contain
 * its known members, so a broken resolver cannot pass by finding nothing.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

type Gate = {
  name: string;
  entries: string[];
  authority: string;
  ownEnv: string[];
  /** Identifiers that belong to this gate alone. Another path naming one is coupling. */
  tokens: string[];
};

const EARLY_FIELD: Gate = {
  name: 'EARLY-FIELD-01',
  authority: 'lib/access/earlyFieldAccess.ts',
  entries: [
    'lib/access/earlyFieldAccess.ts',
    'app/api/early-field/admission/route.ts',
    'components/maia/living-field/useEarlyFieldAdmission.ts',
  ],
  ownEnv: ['EARLY_FIELD_ENABLED', 'EARLY_FIELD_MEMBER_IDS'],
  tokens: [
    'earlyFieldAccess', 'EARLY_FIELD_', '/api/early-field/', 'useEarlyFieldAdmission',
    'canEnterEarlyField', 'decideEarlyField', 'earlyFieldConfigFromEnv',
  ],
};

const H1: Gate = {
  name: 'H1',
  authority: 'lib/access/houseStudioH1Access.ts',
  entries: [
    'lib/access/houseStudioH1Access.ts',
    'app/api/house-studio/admission/route.ts',
    'app/writers-studio/useHouseStudioH1WorkClaim.ts',
  ],
  ownEnv: ['HOUSE_STUDIO_H1_ENABLED', 'HOUSE_STUDIO_H1_MEMBER_IDS'],
  tokens: [
    'houseStudioH1Access', 'HOUSE_STUDIO_H1_', '/api/house-studio/', 'useHouseStudioH1WorkClaim',
    'canUseHouseStudioH1', 'decideHouseStudioH1', 'houseStudioH1ConfigFromEnv',
  ],
};

const GATES = [EARLY_FIELD, H1];

/* ── source access with overrides (overrides model mutations) ─────────────── */

type Sources = Record<string, string>;

function reader(overrides: Sources) {
  return (rel: string): string | null => {
    if (rel in overrides) return overrides[rel];
    const abs = path.join(ROOT, rel);
    return fs.existsSync(abs) && fs.statSync(abs).isFile() ? fs.readFileSync(abs, 'utf8') : null;
  };
}

/** Comments are stripped first: a file documenting its own independence must not fail for saying so. */
const code = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const EXTS = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js'];

function resolve(fromRel: string, spec: string, read: (r: string) => string | null): string | null {
  let base: string;
  if (spec.startsWith('@/')) base = spec.slice(2);
  else if (spec.startsWith('.')) base = path.posix.normalize(path.posix.join(path.posix.dirname(fromRel), spec));
  else return null; // package import: outside the repository's admission logic
  for (const ext of EXTS) if (read(base + ext) !== null) return base + ext;
  return null;
}

const SPEC = /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|require\(\s*['"]([^'"]+)['"]\s*\)/g;

/** The admission path: entries plus every local file they transitively import. */
function graph(gate: Gate, overrides: Sources = {}): Map<string, string> {
  const read = reader(overrides);
  const seen = new Map<string, string>();
  const stack = [...gate.entries];
  while (stack.length) {
    const rel = stack.pop()!;
    if (seen.has(rel)) continue;
    const src = read(rel);
    if (src === null) throw new Error(`${gate.name}: admission-path file missing: ${rel}`);
    const c = code(src);
    seen.set(rel, c);
    for (const m of c.matchAll(SPEC)) {
      const spec = m[1] ?? m[2] ?? m[3] ?? m[4];
      const next = spec ? resolve(rel, spec, read) : null;
      if (next && !seen.has(next)) stack.push(next);
    }
  }
  return seen;
}

/** Every place in `gate`'s admission path that names another gate's identity. */
function couplings(gate: Gate, overrides: Sources = {}): string[] {
  const others = GATES.filter((g) => g !== gate);
  const hits: string[] = [];
  for (const [rel, c] of graph(gate, overrides)) {
    for (const other of others) {
      for (const t of other.tokens) if (c.includes(t)) hits.push(`${rel} → ${other.name}:${t}`);
    }
  }
  return hits;
}

/** The authority reads the environment only through its own named keys, never a computed key. */
function envViolations(gate: Gate, overrides: Sources = {}): string[] {
  const src = reader(overrides)(gate.authority);
  if (src === null) return [`missing ${gate.authority}`];
  const c = code(src);
  const out: string[] = [];
  for (const m of c.matchAll(/process\.env\.([A-Z0-9_]+)/g)) {
    if (!gate.ownEnv.includes(m[1])) out.push(`reads foreign env ${m[1]}`);
  }
  if (/process\.env\s*\[/.test(c)) out.push('computed process.env[...] access');
  if (/(?:const|let|var)\s*\{[^}]*\}\s*=\s*process\.env/.test(c)) out.push('destructured process.env');
  if (/=\s*process\.env\s*[;\n]/.test(c)) out.push('process.env aliased');
  return out;
}

const holds = (overrides: Sources = {}) =>
  GATES.every((g) => couplings(g, overrides).length === 0 && envViolations(g, overrides).length === 0);

/* ── the law on the real source ───────────────────────────────────────────── */

describe('MONOTONIC-INDEPENDENT-GATES-01 — real source', () => {
  for (const gate of GATES) {
    it(`${gate.name}: no admission-path file names another gate`, () => {
      expect(couplings(gate)).toEqual([]);
    });
    it(`${gate.name}: authority reads only its own environment keys`, () => {
      expect(envViolations(gate)).toEqual([]);
    });
  }

  it('graphs are not vacuous: each reaches its route, hook, authority and the shared session reader', () => {
    for (const gate of GATES) {
      const files = [...graph(gate).keys()];
      for (const e of gate.entries) expect(files).toContain(e);
      expect(files).toContain('lib/auth/getMemberFromRequest.ts');
      expect(files.length).toBeGreaterThan(gate.entries.length);
    }
  });

  it('each authority still reads its own keys (the env rule is not vacuous)', () => {
    for (const gate of GATES) {
      const c = code(fs.readFileSync(path.join(ROOT, gate.authority), 'utf8'));
      for (const k of gate.ownEnv) expect(c).toContain(`process.env.${k}`);
    }
  });
});

/* ── defeat candidates: each coupling must be caught ──────────────────────── */

const src = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const CANDIDATES: Record<string, Sources> = {
  'DC1 early-field authority imports the H1 authority': {
    'lib/access/earlyFieldAccess.ts':
      `import { canUseHouseStudioH1 } from './houseStudioH1Access';\n${src('lib/access/earlyFieldAccess.ts')}`,
  },
  'DC2 H1 authority reads EARLY_FIELD_ENABLED': {
    'lib/access/houseStudioH1Access.ts': src('lib/access/houseStudioH1Access.ts').replace(
      'enabled: process.env.HOUSE_STUDIO_H1_ENABLED,',
      "enabled: process.env.EARLY_FIELD_ENABLED === 'true' ? 'true' : process.env.HOUSE_STUDIO_H1_ENABLED,",
    ),
  },
  'DC3 early-field route consults the H1 decision': {
    'app/api/early-field/admission/route.ts': src('app/api/early-field/admission/route.ts')
      .replace("import { canEnterEarlyField } from '@/lib/access/earlyFieldAccess';",
        "import { canEnterEarlyField } from '@/lib/access/earlyFieldAccess';\nimport { canUseHouseStudioH1 } from '@/lib/access/houseStudioH1Access';")
      .replace('canEnterEarlyField(memberId)', '(canEnterEarlyField(memberId) || canUseHouseStudioH1(memberId))'),
  },
  'DC4 H1 hook asks the early-field endpoint': {
    'app/writers-studio/useHouseStudioH1WorkClaim.ts': src('app/writers-studio/useHouseStudioH1WorkClaim.ts')
      .replace("apiFetch('/api/house-studio/admission'", "apiFetch('/api/early-field/admission'"),
  },
  'DC5 coupling moved into the shared session reader (transitive)': {
    'lib/auth/getMemberFromRequest.ts':
      `import { canEnterEarlyField } from '@/lib/access/earlyFieldAccess';\nexport const __c = canEnterEarlyField;\n${src('lib/auth/getMemberFromRequest.ts')}`,
  },
  'DC6 coupling hidden in a new intermediate file': {
    'app/api/house-studio/admission/route.ts':
      `import './gateBridge';\n${src('app/api/house-studio/admission/route.ts')}`,
    'app/api/house-studio/admission/gateBridge.ts':
      "export const bridged = process.env.EARLY_FIELD_MEMBER_IDS;\n",
  },
  'DC7 computed env key in the H1 authority': {
    'lib/access/houseStudioH1Access.ts': src('lib/access/houseStudioH1Access.ts').replace(
      'memberIds: process.env.HOUSE_STUDIO_H1_MEMBER_IDS,',
      "memberIds: process.env['EARLY' + '_FIELD_MEMBER_IDS'] ?? process.env.HOUSE_STUDIO_H1_MEMBER_IDS,",
    ),
  },
  'DC8 early-field hook defers to H1 admission': {
    'components/maia/living-field/useEarlyFieldAdmission.ts': src('components/maia/living-field/useEarlyFieldAdmission.ts')
      .replace("apiFetch('/api/early-field/admission'", "apiFetch('/api/house-studio/admission'"),
  },
};

describe('MONOTONIC-INDEPENDENT-GATES-01 — every defeat candidate is caught', () => {
  for (const [name, overrides] of Object.entries(CANDIDATES)) {
    it(name, () => {
      // The mutation must actually apply, or a "catch" would be vacuous.
      for (const [rel, s] of Object.entries(overrides)) {
        const original = reader({})(rel);
        expect(s).not.toBe(original);
      }
      expect(holds(overrides)).toBe(false);
    });
  }

  it('a comment that names the other gate is not coupling', () => {
    const overrides = {
      'lib/access/earlyFieldAccess.ts':
        `/* separate from houseStudioH1Access and HOUSE_STUDIO_H1_* by law */\n${src('lib/access/earlyFieldAccess.ts')}`,
    };
    expect(holds(overrides)).toBe(true);
  });
});
