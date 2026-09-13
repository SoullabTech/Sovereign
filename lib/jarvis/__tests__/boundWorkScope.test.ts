/**
 * BW-F1 … BW-F7 — the falsifier set for `BoundWorkScope` (A1 + R1).
 *
 * FR-14 applies: PASS = zero failed AND every named obligation present AND
 * discharged by PASS. The set is named, never a count.
 *
 * ⛔ The database and the identity resolver are reached by MOCKING THEIR MODULES,
 * never by a test-only parameter on the binder. `runStructured` removed its
 * second entry point rather than discouraging it, and for the same reason: a
 * seam whose name asks callers not to use it makes sovereignty a convention.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));

import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn/identity';
import {
  bindWorkScope, isBoundWorkScope, WORK_SCOPE_UNAVAILABLE, type BoundWorkScope,
} from '../boundWorkScope';

const MEMBER = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const WORK = '33333333-3333-4333-8333-333333333333';

const owns = (yes: boolean) => (query as jest.Mock).mockResolvedValue({ rows: yes ? [{ '?column?': 1 }] : [] });

async function mintedIdentity(memberId: string | null = MEMBER) {
  (getMemberIdFromRequest as jest.Mock).mockResolvedValue(memberId);
  return resolveCanonicalIdentity({ headers: new Headers() } as never);
}

beforeEach(() => jest.clearAllMocks());

/* ───────────────────────────────────────────────────────────────────────── */

describe('BW-F1 · a wrong string is not authority', () => {
  it('refuses an identity-shaped literal carrying valid-looking identifiers', async () => {
    owns(true);
    const forged = { status: 'verified', memberId: MEMBER, memberRef: 'ref' } as never;
    const r = await bindWorkScope(forged, WORK);
    expect(r.ok).toBe(false);
    expect(r.ok === false && r.reason).toBe('identity_not_minted');
  });

  it('does not read the database at all on that path — refusal precedes authorization', async () => {
    owns(true);
    await bindWorkScope({ status: 'verified', memberId: MEMBER, memberRef: 'r' } as never, WORK);
    expect(query as jest.Mock).not.toHaveBeenCalled();
  });
});

describe('BW-F2 · client identity cannot mint scope', () => {
  it('an unverified caller yields an identity that cannot bind (BW-AUTH-1)', async () => {
    owns(true);
    const anon = await mintedIdentity(null);          // minted, but anonymous
    const r = await bindWorkScope(anon, WORK);
    expect(r.ok === false && r.reason).toBe('identity_not_verified');
    expect(query as jest.Mock).not.toHaveBeenCalled();
  });

  it('the binder derives from the minted OBJECT, never an extracted branded string', () => {
    const src = readFileSync(join(__dirname, '..', 'boundWorkScope.ts'), 'utf8');
    /* The signature must take MemberIdentity. A `VerifiedMemberId` first parameter
       would keep the brand and lose the runtime provenance — the R1 trap. */
    expect(/export async function bindWorkScope\(\s*identity: MemberIdentity/.test(src)).toBe(true);
    expect(src).toContain('isMintedIdentity(identity)');
  });
});

describe('BW-F3 · no raw-scope substitute', () => {
  it('a plain object structurally resembling the scope is not a bound scope', async () => {
    owns(true);
    const real = await bindWorkScope(await mintedIdentity(), WORK);
    expect(real.ok).toBe(true);

    const lookalike = { memberId: MEMBER, workRef: WORK, minted: true };
    expect(isBoundWorkScope(lookalike)).toBe(false);
    expect(isBoundWorkScope(real.ok === true ? real.value : null)).toBe(true);
  });

  it('a structural copy of a REAL scope is refused — identity of the object, not its shape', async () => {
    owns(true);
    const real = await bindWorkScope(await mintedIdentity(), WORK);
    const copy = { ...(real.ok === true ? (real.value as unknown as object) : {}) };
    expect(isBoundWorkScope(copy)).toBe(false);
  });
});

describe('BW-F4 · ownership failure produces no capability, and no existence oracle', () => {
  it('a verified member asking for another member\'s Work gets no scope', async () => {
    owns(false);
    const r = await bindWorkScope(await mintedIdentity(OTHER), WORK);
    expect(r.ok).toBe(false);
  });

  it('unauthorized and nonexistent are BYTE-IDENTICAL refusals (BW-AUTH-3)', async () => {
    owns(false);
    const notMine = await bindWorkScope(await mintedIdentity(OTHER), WORK);
    owns(false);
    const notThere = await bindWorkScope(await mintedIdentity(MEMBER), '44444444-4444-4444-8444-444444444444');
    expect(JSON.stringify(notMine)).toBe(JSON.stringify(notThere));
    expect(notMine.ok === false && notMine.external).toBe(WORK_SCOPE_UNAVAILABLE);
  });

  it('the binder never acquires the distinction: exactly one ownership read, no second query', async () => {
    owns(false);
    await bindWorkScope(await mintedIdentity(OTHER), WORK);
    expect((query as jest.Mock).mock.calls).toHaveLength(1);
    const sql = (query as jest.Mock).mock.calls[0][0] as string;
    expect(sql).toContain('member_id = $2');       // ownership IS the predicate
    expect(sql).not.toMatch(/\bbody\b|\bcontent\b/); // a predicate, never a loader
  });
});

describe('BW-F6 · serialization does not manufacture authority (BW-AUTH-2)', () => {
  it('serializing a scope throws rather than producing a portable lookalike', async () => {
    owns(true);
    const r = await bindWorkScope(await mintedIdentity(), WORK);
    const scope = (r as { ok: true; value: BoundWorkScope }).value;
    expect(() => JSON.stringify(scope)).toThrow(/must not be serialized/);
  });

  it('a revived object is a DIFFERENT object and carries no authority', async () => {
    owns(true);
    const r = await bindWorkScope(await mintedIdentity(), WORK);
    const scope = (r as { ok: true; value: BoundWorkScope }).value;
    const revived = JSON.parse(JSON.stringify({ memberId: scope.memberId, workRef: scope.workRef }));
    expect(isBoundWorkScope(revived)).toBe(false);
  });

  it('the minted scope is frozen', async () => {
    owns(true);
    const r = await bindWorkScope(await mintedIdentity(), WORK);
    expect(Object.isFrozen((r as { ok: true; value: BoundWorkScope }).value)).toBe(true);
  });
});

/* ───────────────────────────────────────────────────────────────────────── */
/* BW-F7 · ONE AUTHORIZED MINTING AUTHORITY — not one textual call site.      */

const ROOT = join(__dirname, '..', '..', '..');
const PERMITTED_MINTERS = ['lib/writers-studio/focusCrossing.ts'];

const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

function sourceFiles(): { rel: string; code: string }[] {
  const out: { rel: string; code: string }[] = [];
  const skip = new Set(['node_modules', '.next', '.git', 'dist', 'build', '__tests__']);
  const walk = (dir: string) => {
    for (const e of readdirSync(dir)) {
      if (skip.has(e)) continue;
      const p = join(dir, e);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.tsx?$/.test(e)) out.push({ rel: p.slice(ROOT.length + 1), code: stripComments(readFileSync(p, 'utf8')) });
    }
  };
  for (const d of ['lib', 'app']) walk(join(ROOT, d));
  return out;
}

describe('BW-F7 · binder cardinality is closed', () => {
  const files = sourceFiles().filter((f) => !f.rel.startsWith('lib/jarvis/'));

  it('only the permitted minters import bindWorkScope', () => {
    const importers = files
      .filter((f) => /from\s+['"][^'"]*boundWorkScope['"]/.test(f.code) && f.code.includes('bindWorkScope'))
      .map((f) => f.rel)
      .sort();
    expect(importers).toEqual([...PERMITTED_MINTERS].sort());
  });

  /* ⭐ R1 · THE ADVERSARIAL HALF. A textual count is defeated by relocating the
     minting authority rather than calling it. If these pass because the test only
     counts call sites, the test measures syntax, not authority. */
  it('no module re-exports the binder', () => {
    const offenders = files.filter((f) =>
      /export\s*\{[^}]*\bbindWorkScope\b[^}]*\}\s*from/.test(f.code)
      || /export\s*\*\s*from\s+['"][^'"]*boundWorkScope['"]/.test(f.code));
    expect(offenders.map((f) => f.rel)).toEqual([]);
  });

  it('no module aliases the binder into another name', () => {
    const offenders = files.filter((f) =>
      /(?:const|let|var)\s+\w+\s*=\s*bindWorkScope\s*[;,\n)]/.test(f.code)
      || /import\s*\{[^}]*\bbindWorkScope\s+as\s+\w+/.test(f.code));
    expect(offenders.map((f) => f.rel)).toEqual([]);
  });

  it('a permitted minter does not wrap the binder into an exported minting helper', () => {
    for (const rel of PERMITTED_MINTERS) {
      const f = files.find((x) => x.rel === rel);
      if (!f) continue;
      /* An exported function whose body mints would relocate the authority while
         keeping the import count at one. */
      const exportedFns = [...f.code.matchAll(/export\s+(?:async\s+)?function\s+(\w+)[\s\S]*?\n\}/g)];
      const relocators = exportedFns
        .filter((m) => m[0].includes('bindWorkScope') && m[1] !== 'performFocusCrossing')
        .map((m) => `${rel}:${m[1]}`);
      expect(relocators).toEqual([]);
    }
  });
});
