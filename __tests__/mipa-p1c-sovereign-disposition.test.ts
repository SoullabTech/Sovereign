/**
 * MIPA PHASE 0 — P1c CERTIFICATION: SOVEREIGN CORPUS DISPOSITION
 *
 * Authority: docs/specs/MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md — P1c
 *
 *   MAIA may not have durable participatory access to a representation about
 *   the member that the member has neither meaningful access to nor meaningful
 *   sovereignty over.
 *
 * P1b said what the 40 representations are. This suite proves that each one now
 * carries an ENFORCEABLE disposition, that no disposition is a permissive
 * default, and that the export is built from the ledger rather than beside it.
 *
 * ── THE TWO INSTRUMENTS, AND WHAT EACH CAN AND CANNOT PROVE ─────────────────
 *
 * `not_reachable` is computed here from the import closure of the declared live
 * composition entry points. It is sound in the SAFE direction: if no import
 * path reaches a module, no call can. It is NOT sound in the other direction —
 * a module being in the closure does not prove it composes. That asymmetry is
 * the P3 Closed-Set Certification ceiling (outcome C), and this suite never
 * converts in-closure into an exclusion claim.
 *
 * `certified_gate` requires the named suite to exist on disk. A refusal cited
 * without its certification is a claim, not a gate.
 */

import * as fs from 'fs';
import * as path from 'path';

import { SOVEREIGN_CORPUS, type CorpusKey } from '@/lib/maia/sovereignCorpus';
import {
  SOVEREIGN_DISPOSITION,
  OWED_LOGICAL_EXPORTS,
  LEGACY_SERVED_EXPORTS,
  UNRESOLVED_P1_BLOCKERS,
  FORBIDDEN_EXPORT_COLUMNS,
  LIVE_COMPOSITION_ENTRY_POINTS,
  EXPORT_ROW_CAP,
  covenantOpenRepresentations,
  p1ClosureState,
  type Disposition,
} from '@/lib/maia/sovereignDisposition';
import { buildSelect } from '@/lib/maia/sovereignExport';

const REPO = path.resolve(__dirname, '..');
const BASELINE = path.join(REPO, 'database/baseline/0001_baseline_2026-09-01.sql');
const MIGRATIONS = path.join(REPO, 'database/migrations');
const EXPORT_ROUTE = path.join(REPO, 'app/api/members/export-data/route.ts');
const EXPORT_BUILDER = path.join(REPO, 'lib/maia/sovereignExport.ts');
const RELATIONSHIP_SERVICE = path.join(REPO, 'lib/memory/RelationshipMemoryService.ts');

const keys = Object.keys(SOVEREIGN_DISPOSITION) as CorpusKey[];

// ── SCHEMA TRUTH ─────────────────────────────────────────────────────────────

/**
 * Real columns for a table.
 *
 * The baseline CREATE TABLE block is read line-oriented and terminated on the
 * closing `);` at column 0 — a brace-counting slice over a file this size walks
 * into DEFAULT expressions and returns nonsense. Migration ALTERs are unioned
 * in so a column added after the baseline is not read as fictional.
 */
function schemaColumns(table: string): Set<string> {
  const out = new Set<string>();
  const lines = fs.readFileSync(BASELINE, 'utf8').split('\n');
  const start = lines.findIndex((l) =>
    new RegExp(`^CREATE TABLE (?:IF NOT EXISTS )?"public"\\."${table}" \\($`).test(l),
  );
  if (start >= 0) {
    for (let i = start + 1; i < lines.length; i++) {
      if (/^\);/.test(lines[i])) break;
      if (/^\s+CONSTRAINT/.test(lines[i])) continue;
      const m = /^\s+"([a-z0-9_]+)"\s+/.exec(lines[i]);
      if (m) out.add(m[1]);
    }
  }
  for (const f of fs.readdirSync(MIGRATIONS).filter((x) => x.endsWith('.sql'))) {
    const body = fs.readFileSync(path.join(MIGRATIONS, f), 'utf8');
    const re = new RegExp(
      `ALTER TABLE\\s+(?:IF EXISTS\\s+)?"?(?:public"?\\."?)?${table}"?[\\s\\S]{0,400}?ADD COLUMN\\s+(?:IF NOT EXISTS\\s+)?"?([a-z0-9_]+)"?`,
      'gi',
    );
    for (const m of body.matchAll(re)) out.add(m[1]);
  }
  return out;
}

// ── THE LIVE COMPOSITION CLOSURE ─────────────────────────────────────────────

const RESOLVE_EXT = ['.ts', '.tsx', '/index.ts', '/index.tsx'];

function resolveSpec(spec: string, fromFile: string): string | null {
  let base: string;
  if (spec.startsWith('@/')) base = path.join(REPO, spec.slice(2));
  else if (spec.startsWith('.')) base = path.resolve(path.dirname(fromFile), spec);
  else return null;
  for (const e of RESOLVE_EXT) {
    const c = base + e;
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;
  return null;
}

/**
 * Modules reachable by import from the declared live composition entry points.
 *
 * Static `import`/`export … from`, side-effect imports and dynamic `import()`
 * are all followed. The patterns are written `[\s\S]*?` rather than line-
 * oriented on purpose: P3e caught a line-oriented import scan reporting ZERO
 * the moment an import was reformatted across lines, which let a FORMATTING
 * change decide a sovereignty verdict.
 */
function liveClosure(entries: readonly string[] = LIVE_COMPOSITION_ENTRY_POINTS): Set<string> {
  const seen = new Set<string>();
  const stack: string[] = [];
  for (const e of entries) {
    const f = path.join(REPO, e);
    if (fs.existsSync(f)) stack.push(f);
  }
  const patterns = [
    /(?:^|\n)\s*(?:import|export)[\s\S]*?from\s+['"]([^'"]+)['"]/g,
    /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
    /(?:^|\n)\s*import\s+['"]([^'"]+)['"]/g,
  ];
  while (stack.length) {
    const f = stack.pop()!;
    if (seen.has(f)) continue;
    seen.add(f);
    let src: string;
    try {
      src = fs.readFileSync(f, 'utf8');
    } catch {
      continue;
    }
    for (const re of patterns) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(src))) {
        const r = resolveSpec(m[1], f);
        if (r && !seen.has(r)) stack.push(r);
      }
    }
  }
  return new Set([...seen].map((f) => path.relative(REPO, f)));
}

const CLOSURE = liveClosure();

const SKIP_DIR = /__tests__|\.test\.ts|node_modules|\.next/;

/** Every module that reads a representation, anywhere in lib/ or app/. */
function readersOf(table: string): string[] {
  const found: string[] = [];
  const re = new RegExp(`(FROM|JOIN)\\s+${table}\\b`, 'i');
  const walk = (p: string): void => {
    let st: fs.Stats;
    try {
      st = fs.statSync(p);
    } catch {
      return;
    }
    if (st.isDirectory()) {
      for (const f of fs.readdirSync(p)) {
        const q = path.join(p, f);
        if (!SKIP_DIR.test(q)) walk(q);
      }
      return;
    }
    if (!/\.tsx?$/.test(p) || SKIP_DIR.test(p)) return;
    const rel = path.relative(REPO, p);
    // The ledger and the census NAME every table. Naming is not reading.
    if (rel === 'lib/maia/sovereignCorpus.ts' || rel === 'lib/maia/sovereignDisposition.ts') return;
    if (re.test(fs.readFileSync(p, 'utf8'))) found.push(rel);
  };
  walk(path.join(REPO, 'lib'));
  walk(path.join(REPO, 'app'));
  return found;
}

// ── §0 — META-INVARIANT: THE INSTRUMENT FOUND ITS SUBJECT ────────────────────

describe('P1c §0 — the instrument found its subject', () => {
  it('the ledger covers a real, nonzero corpus', () => {
    // Zero would make every "every entry …" assertion vacuously true.
    expect(keys.length).toBeGreaterThan(35);
    expect(keys.length).toBe(Object.keys(SOVEREIGN_CORPUS).length);
  });

  it('the closure instrument reaches a real, nonzero module set', () => {
    expect(CLOSURE.size).toBeGreaterThan(200);
    // It must contain the entry points themselves and the known live composers.
    expect(CLOSURE.has('lib/sovereign/maiaService.ts')).toBe(true);
    expect(CLOSURE.has('lib/memory/MemoryBundle.ts')).toBe(true);
    // …and must NOT be the whole repository, or "not reachable" means nothing.
    expect(CLOSURE.has('lib/memory/selflet/SelfletChain.ts')).toBe(false);
  });

  it('the schema reader finds real columns, and does not invent them', () => {
    const cols = schemaColumns('episodic_memories');
    expect(cols.size).toBeGreaterThan(15);
    expect(cols.has('marked_by_member')).toBe(true);
    expect(cols.has('verbatim_text')).toBe(true);
    expect(cols.has('cognitive_level')).toBe(false); // one of P1a's five fictions
    expect(schemaColumns('a_table_that_does_not_exist').size).toBe(0);
  });

  it('the reader scan finds readers, and does not count the ledger as one', () => {
    expect(readersOf('breakthrough_moments').length).toBeGreaterThan(2);
    expect(readersOf('selflet_nodes')).not.toContain('lib/maia/sovereignDisposition.ts');
  });
});

// ── §1 — PROOF 1: every representation receives an explicit disposition ──────

describe('P1c §1 — total coverage of the P1b corpus', () => {
  it('the ledger key set equals the corpus key set, exactly', () => {
    // Compile-time this is already enforced: SOVEREIGN_DISPOSITION is typed
    // Record<CorpusKey, …>, so a missing key fails the build. This pins the
    // other direction — a disposition for something the census never classified.
    expect([...keys].sort()).toEqual([...Object.keys(SOVEREIGN_CORPUS)].sort());
  });

  it('every entry carries at least one disposition', () => {
    for (const k of keys) {
      expect({ k, n: SOVEREIGN_DISPOSITION[k].dispositions.length }).toEqual({
        k,
        n: expect.any(Number),
      });
      expect(SOVEREIGN_DISPOSITION[k].dispositions.length).toBeGreaterThan(0);
    }
  });

  it('every disposition is drawn from the ratified vocabulary', () => {
    const allowed: Disposition[] = ['EXPORT', 'INSPECT', 'EXCLUDE', 'EXEMPT'];
    for (const k of keys) {
      for (const d of SOVEREIGN_DISPOSITION[k].dispositions) {
        expect({ k, d, ok: allowed.includes(d) }).toEqual({ k, d, ok: true });
      }
    }
  });

  it('every entry states a rationale of substance', () => {
    for (const k of keys) {
      expect({ k, len: SOVEREIGN_DISPOSITION[k].rationale.length > 40 }).toEqual({ k, len: true });
    }
  });
});

// ── §2 — PROOF 2: no permissive default ──────────────────────────────────────

describe('P1c §2 — no disposition is a permissive default', () => {
  it('EXCLUDE always names a basis, and the basis is one of the two provable kinds', () => {
    for (const k of keys) {
      const e = SOVEREIGN_DISPOSITION[k];
      if (!e.dispositions.includes('EXCLUDE')) continue;
      expect({ k, basis: e.exclusion?.kind }).toEqual({
        k,
        basis: expect.stringMatching(/^(certified_gate|not_reachable|unresolved)$/),
      });
    }
  });

  it('EXEMPT requires all three proofs, never one or two', () => {
    for (const k of keys) {
      const e = SOVEREIGN_DISPOSITION[k];
      if (!e.dispositions.includes('EXEMPT')) continue;
      const p = e.exemption;
      expect({ k, present: !!p }).toEqual({ k, present: true });
      expect({
        k,
        regenerable: (p!.regenerableFrom ?? '').length > 20,
        noClaim: (p!.noIndependentClaim ?? '').length > 20,
        noAuthority: (p!.noParticipationAuthority ?? '').length > 20,
      }).toEqual({ k, regenerable: true, noClaim: true, noAuthority: true });
    }
  });

  it('EXPORT always carries a logical spec', () => {
    for (const k of keys) {
      const e = SOVEREIGN_DISPOSITION[k];
      if (!e.dispositions.includes('EXPORT')) continue;
      expect({ k, spec: !!e.export }).toEqual({ k, spec: true });
    }
  });

  it('INSPECT is claimed only where an authenticated member-scoped route exists', () => {
    let claimed = 0;
    for (const k of keys) {
      const e = SOVEREIGN_DISPOSITION[k];
      if (!e.dispositions.includes('INSPECT')) continue;
      claimed++;
      expect({ k, surface: !!e.inspect }).toEqual({ k, surface: true });
      const route = path.join(REPO, e.inspect!.route);
      expect({ k, exists: fs.existsSync(route) }).toEqual({ k, exists: true });
      const src = fs.readFileSync(route, 'utf8');
      // Authenticated AND bound to the session subject, not a query parameter.
      expect({ k, session: /getCurrentSession\(/.test(src) }).toEqual({ k, session: true });
      expect({ k, bound: /session\??\.memberId/.test(src) }).toEqual({ k, bound: true });
    }
    // If this ever reads zero, the assertions above are vacuous.
    expect(claimed).toBeGreaterThan(0);
  });

  it('EXEMPT and EXPORT are not claimed for the same representation', () => {
    for (const k of keys) {
      const d = SOVEREIGN_DISPOSITION[k].dispositions;
      expect({ k, contradiction: d.includes('EXEMPT') && d.includes('EXPORT') }).toEqual({
        k,
        contradiction: false,
      });
    }
  });
});

// ── §3 — PROOF 3 & 10: owed exports cannot disappear silently ────────────────

describe('P1c §3 — the export is built FROM the ledger', () => {
  it('every canonical member record is EXPORT with a spec', () => {
    const canonical = keys.filter(
      (k) => SOVEREIGN_CORPUS[k].class === 'CANONICAL_MEMBER_RECORD',
    );
    expect(canonical.length).toBe(16);
    for (const k of canonical) {
      expect({ k, exported: SOVEREIGN_DISPOSITION[k].dispositions.includes('EXPORT') }).toEqual({
        k,
        exported: true,
      });
      expect({ k, spec: !!SOVEREIGN_DISPOSITION[k].export }).toEqual({ k, spec: true });
    }
  });

  it('the route builds from the ledger, not from a hand-kept second list', () => {
    const src = fs.readFileSync(EXPORT_ROUTE, 'utf8');
    expect(src).toMatch(/buildSovereignExport\(memberId\)/);
    expect(src).toMatch(/sovereignCorpus:\s*sovereignObjects/);
  });

  it('the builder iterates the derived owed set — not a literal it could drift from', () => {
    const src = fs.readFileSync(EXPORT_BUILDER, 'utf8');
    expect(src).toMatch(/OWED_LOGICAL_EXPORTS\.map\(/);
    // A hardcoded table list in the builder would be exactly the drift the
    // ledger exists to prevent.
    expect(/const\s+TABLES\s*(:|=)\s*\[/.test(src)).toBe(false);
  });

  it('the owed set is nonzero and matches what the ledger says is owed', () => {
    const derived = keys.filter((k) => {
      const e = SOVEREIGN_DISPOSITION[k];
      return (
        e.dispositions.includes('EXPORT') && !!e.export && e.export.servedBy !== 'legacy_section'
      );
    });
    expect(OWED_LOGICAL_EXPORTS.length).toBeGreaterThan(20);
    expect([...OWED_LOGICAL_EXPORTS].sort()).toEqual(derived.sort());
  });

  it('legacy-served exports are still counted as owed, not quietly dropped', () => {
    expect([...LEGACY_SERVED_EXPORTS].sort()).toEqual(
      [
        'developmental_memories',
        'member_sessions',
        'member_settings',
        'members',
      ].sort(),
    );
    const src = fs.readFileSync(EXPORT_ROUTE, 'utf8');
    // Each legacy-served representation must still be queried by the route.
    for (const t of LEGACY_SERVED_EXPORTS) {
      if (t === 'members' || t === 'member_settings') {
        expect({ t, present: new RegExp(`FROM ${t}\\b`).test(src) }).toEqual({ t, present: true });
      } else {
        expect({ t, present: new RegExp(`FROM ${t}\\b`).test(src) }).toEqual({ t, present: true });
      }
    }
  });

  it('the member is told what the export does NOT cover', () => {
    const src = fs.readFileSync(EXPORT_ROUTE, 'utf8');
    expect(src).toMatch(/coverage:/);
    expect(src).toMatch(/notExported/);
  });
});

// ── §4 — PROOF 4: no non-governable participatory representation ─────────────

describe('P1c §4 — the covenant closes on one side or the other', () => {
  it('no SYSTEM or UNKNOWN representation is left open', () => {
    expect(covenantOpenRepresentations()).toEqual([]);
  });

  it('every not_reachable claim is verified against the recomputed closure', () => {
    let checked = 0;
    for (const k of keys) {
      const e = SOVEREIGN_DISPOSITION[k];
      if (e.exclusion?.kind !== 'not_reachable') continue;
      checked++;
      for (const reader of readersOf(k)) {
        // The claim is falsified the moment ANY reader enters the closure —
        // including a reader the ledger never listed.
        expect({ representation: k, reader, inClosure: CLOSURE.has(reader) }).toEqual({
          representation: k,
          reader,
          inClosure: false,
        });
      }
    }
    expect(checked).toBeGreaterThan(5);
  });

  it('every certified_gate claim names a suite that exists on disk', () => {
    let checked = 0;
    for (const k of keys) {
      const e = SOVEREIGN_DISPOSITION[k];
      if (e.exclusion?.kind !== 'certified_gate') continue;
      checked++;
      expect({ k, gates: e.exclusion.gates.length > 0 }).toEqual({ k, gates: true });
      for (const suite of e.exclusion.suites) {
        expect({ k, suite, exists: fs.existsSync(path.join(REPO, suite)) }).toEqual({
          k,
          suite,
          exists: true,
        });
      }
      expect({ k, scoped: e.exclusion.scope.length > 30 }).toEqual({ k, scoped: true });
    }
    expect(checked).toBeGreaterThan(0);
  });

  it('a partial gate is recorded as partial, never as an exclusion', () => {
    for (const k of keys) {
      const e = SOVEREIGN_DISPOSITION[k];
      if (!e.partialGates?.length) continue;
      // Something with only PARTIAL coverage must close on the access side.
      expect({ k, exported: e.dispositions.includes('EXPORT') }).toEqual({ k, exported: true });
      expect({ k, claimsExclusion: e.dispositions.includes('EXCLUDE') }).toEqual({
        k,
        claimsExclusion: false,
      });
    }
    // The three representations whose gates are real but incomplete.
    const partial = keys.filter((k) => SOVEREIGN_DISPOSITION[k].partialGates?.length);
    expect(partial.sort()).toEqual(
      ['breakthrough_moments', 'developmental_memories', 'member_theme_signals'].sort(),
    );
  });

  it('the P1c relationship-memory partition is structural, not a filter', () => {
    const src = fs.readFileSync(RELATIONSHIP_SERVICE, 'utf8');
    // The formatter takes the CERTIFIED view. Reaching a machine inference from
    // it is a type error, not an omission a reviewer has to notice.
    expect(src).toMatch(
      /export function formatRelationshipMemoryForPrompt\(\s*memory:\s*CertifiedRelationshipMemory/,
    );
    const iface = /export interface CertifiedRelationshipMemory \{([\s\S]*?)\n\}/.exec(src);
    expect(iface).not.toBeNull();
    for (const field of ['themes', 'recentBreakthrough', 'emergingPatterns']) {
      expect({ field, declared: new RegExp(`\\n\\s+${field}[?:]`).test(iface![1]) }).toEqual({
        field,
        declared: false,
      });
    }
    // …and it converges on the shared adjudicator rather than a local rule.
    expect(src).toMatch(/adjudicateParticipation\(/);
    expect(src).toMatch(/adjudicateDerivation\(/);
  });

  it('both live call sites pass through the certification', () => {
    for (const f of ['lib/sovereign/maiaService.ts', 'lib/sovereign/maiaVoice.ts']) {
      const src = fs.readFileSync(path.join(REPO, f), 'utf8');
      const calls = [...src.matchAll(/formatRelationshipMemoryForPrompt\(/g)];
      // Every call site, not just the first one found.
      expect({ f, calls: calls.length }).toEqual({ f, calls: 1 });
      expect({
        f,
        certified: /formatRelationshipMemoryForPrompt\(\s*\n?\s*certifyRelationshipMemory\(/.test(
          src,
        ),
      }).toEqual({ f, certified: true });
    }
  });
});

// ── §5 — PROOF 5: UNKNOWN cannot silently become participatory ───────────────

describe('P1c §5 — UNKNOWN fails closed, and the closure is enforced', () => {
  it('every UNKNOWN representation is either certifiably non-participatory or exported', () => {
    const unknown = keys.filter((k) => SOVEREIGN_CORPUS[k].class === 'UNKNOWN');
    expect(unknown.length).toBeGreaterThan(5);
    for (const k of unknown) {
      const e = SOVEREIGN_DISPOSITION[k];
      const certifiedClosed =
        e.dispositions.includes('EXCLUDE') &&
        (e.exclusion?.kind === 'not_reachable' || e.exclusion?.kind === 'certified_gate');
      const accessible = e.dispositions.includes('EXPORT') && !!e.export;
      expect({ k, closed: certifiedClosed || accessible }).toEqual({ k, closed: true });
    }
  });

  it('an UNKNOWN representation that IS exported states its uncertainty to the member', () => {
    let checked = 0;
    for (const k of keys) {
      if (SOVEREIGN_CORPUS[k].class !== 'UNKNOWN') continue;
      const spec = SOVEREIGN_DISPOSITION[k].export;
      if (!spec) continue;
      checked++;
      expect({ k, stated: (spec.uncertainty ?? '').length > 40 }).toEqual({ k, stated: true });
      expect({ k, unresolved: spec.authorityClass }).toEqual({ k, unresolved: 'unresolved' });
    }
    expect(checked).toBeGreaterThan(0);
  });

  it('no UNKNOWN representation is granted a participation gate implying eligibility', () => {
    for (const k of keys) {
      if (SOVEREIGN_CORPUS[k].class !== 'UNKNOWN') continue;
      expect({ k, partial: SOVEREIGN_DISPOSITION[k].partialGates ?? [] }).toEqual({
        k,
        partial: [],
      });
    }
  });

  it('P1 closure is computed, not asserted, and reports its blockers', () => {
    const state = p1ClosureState();
    expect(state.blockers).toEqual([]);
    expect(state.closable).toBe(true);
    expect(UNRESOLVED_P1_BLOCKERS).toEqual([]);
  });
});

// ── §6 — PROOF 6: EXEMPT acquires no epistemic authority ─────────────────────

describe('P1c §6 — exemption confers nothing', () => {
  it('an EXEMPT artifact is not exported, not gated, and not reachable', () => {
    const exempt = keys.filter((k) => SOVEREIGN_DISPOSITION[k].dispositions.includes('EXEMPT'));
    expect(exempt.length).toBeGreaterThan(0);
    for (const k of exempt) {
      const e = SOVEREIGN_DISPOSITION[k];
      expect({ k, spec: !!e.export }).toEqual({ k, spec: false });
      expect({ k, partial: e.partialGates ?? [] }).toEqual({ k, partial: [] });
      for (const reader of readersOf(k)) {
        expect({ k, reader, inClosure: CLOSURE.has(reader) }).toEqual({
          k,
          reader,
          inClosure: false,
        });
      }
    }
  });

  it('a derived artifact that is NOT regenerable is refused exemption', () => {
    // conversation_memory_uses and memory_links are historical records: they
    // cannot be rebuilt from a sovereign source, so EXEMPT is not available to
    // them and they are exported instead.
    for (const k of ['conversation_memory_uses', 'memory_links'] as CorpusKey[]) {
      expect({ k, class: SOVEREIGN_CORPUS[k].class }).toEqual({
        k,
        class: 'DERIVED_IMPLEMENTATION_ARTIFACT',
      });
      expect({ k, d: [...SOVEREIGN_DISPOSITION[k].dispositions] }).toEqual({ k, d: ['EXPORT'] });
    }
  });
});

// ── §7 — PROOF 7: security material is never autobiography ───────────────────

describe('P1c §7 — credentials do not leave as memory', () => {
  it('no export spec names a forbidden column', () => {
    for (const k of keys) {
      const spec = SOVEREIGN_DISPOSITION[k].export;
      if (!spec) continue;
      for (const c of spec.select) {
        expect({ k, c, forbidden: FORBIDDEN_EXPORT_COLUMNS.includes(c) }).toEqual({
          k,
          c,
          forbidden: false,
        });
      }
      for (const c of spec.computed ?? []) {
        for (const bad of FORBIDDEN_EXPORT_COLUMNS) {
          expect({ k, as: c.as, bad, present: c.expr.includes(bad) }).toEqual({
            k,
            as: c.as,
            bad,
            present: false,
          });
        }
      }
    }
  });

  it('the builder REFUSES a forbidden column rather than filtering it out', () => {
    // Silently dropping it would let a future spec carry a credential and look
    // fine. The build must fail.
    expect(() =>
      buildSelect({
        logicalType: 'x',
        authorship: 'system',
        authorityClass: 'inference',
        table: 'google_calendar_credentials',
        memberKey: 'user_id',
        select: ['id', 'access_token'],
        temporalField: 'created_at',
      }),
    ).toThrow(/forbidden column/);
  });

  it('the credential store is EXEMPT and reports STATE, not secrets', () => {
    expect([...SOVEREIGN_DISPOSITION.google_calendar_credentials.dispositions]).toEqual(['EXEMPT']);
    const src = fs.readFileSync(EXPORT_ROUTE, 'utf8');
    expect(src).not.toMatch(/SELECT[^;]*access_token/);
    expect(src).toMatch(/connected:\s*'unknown'/);
  });
});

// ── §8 — PROOF 8: a failed read cannot impersonate absence ───────────────────

describe('P1c §8 — empty and unreadable are different answers', () => {
  it('a failed logical read returns null records WITH an error, never []', () => {
    const src = fs.readFileSync(EXPORT_BUILDER, 'utf8');
    // Tolerant of the annotation, the binding name and the brace column: a
    // `catch (err)` vs `catch (err: unknown)` difference is formatting, and
    // formatting must not decide whether this check runs at all. A slice that
    // silently misses would pass the two "does contain" assertions vacuously.
    const catchBlock = /\bcatch\s*\([A-Za-z0-9_]+(?:\s*:\s*[A-Za-z]+)?\)\s*\{([\s\S]*)$/.exec(src);
    expect(catchBlock).not.toBeNull();
    expect(catchBlock![1].length).toBeGreaterThan(80);
    expect(catchBlock![1]).toMatch(/records:\s*null/);
    expect(catchBlock![1]).toMatch(/error:/);
    expect(catchBlock![1]).not.toMatch(/records:\s*\[\]/);
  });

  it('the null-means-failure contract is stated in the type, not just the prose', () => {
    const src = fs.readFileSync(EXPORT_BUILDER, 'utf8');
    expect(src).toMatch(/records:\s*Record<string,\s*unknown>\[\]\s*\|\s*null/);
  });

  it('truncation is reported rather than silent', () => {
    const src = fs.readFileSync(EXPORT_BUILDER, 'utf8');
    expect(src).toMatch(/truncatedAt/);
    expect(src).toMatch(/EXPORT_ROW_CAP/);
    expect(EXPORT_ROW_CAP).toBeGreaterThan(1000);
  });

  it('the pre-existing sections still cannot lie (P1a, re-pinned)', () => {
    const src = fs.readFileSync(EXPORT_ROUTE, 'utf8');
    expect(src).toMatch(/memoriesError/);
    expect(src).toMatch(/connected:\s*'unknown'/);
    // The operative discriminant, not merely the presence of the words.
    expect(src).toMatch(/googleResult\.rows === null/);
    expect(src).toMatch(/memoriesResult\.rows === null/);
  });
});

// ── §9 — PROOF 9 & 10: the ledger fails on drift in either direction ─────────

describe('P1c §9 — drift fails certification', () => {
  it('every export spec names only columns the schema actually has', () => {
    let checked = 0;
    for (const k of keys) {
      const spec = SOVEREIGN_DISPOSITION[k].export;
      if (!spec || spec.servedBy === 'legacy_section') continue;
      const cols = schemaColumns(spec.table);
      expect({ table: spec.table, found: cols.size > 0 }).toEqual({
        table: spec.table,
        found: true,
      });
      expect({ table: spec.table, key: cols.has(spec.memberKey) }).toEqual({
        table: spec.table,
        key: true,
      });
      expect({ table: spec.table, temporal: cols.has(spec.temporalField) }).toEqual({
        table: spec.table,
        temporal: true,
      });
      for (const c of spec.select) {
        checked++;
        expect({ table: spec.table, column: c, exists: cols.has(c) }).toEqual({
          table: spec.table,
          column: c,
          exists: true,
        });
      }
      for (const c of spec.computed ?? []) {
        const referenced = /^([a-z0-9_]+)\s+IS\s+(NOT\s+)?NULL$/i.exec(c.expr.trim());
        if (referenced) {
          expect({ table: spec.table, column: referenced[1], exists: cols.has(referenced[1]) })
            .toEqual({ table: spec.table, column: referenced[1], exists: true });
        }
      }
    }
    // P1a shipped five fictional columns. Zero checks would ship them again.
    expect(checked).toBeGreaterThan(100);
  });

  it('the class distribution is pinned, so a reclassification must be deliberate', () => {
    const dist: Record<string, number> = {};
    for (const k of keys) dist[SOVEREIGN_CORPUS[k].class] = (dist[SOVEREIGN_CORPUS[k].class] ?? 0) + 1;
    expect(dist).toEqual({
      CANONICAL_MEMBER_RECORD: 16,
      SYSTEM_REPRESENTATION_ABOUT_MEMBER: 11,
      DERIVED_IMPLEMENTATION_ARTIFACT: 3,
      OPERATIONAL_OR_SECURITY: 1,
      UNKNOWN: 9,
    });
  });

  it('state_vectors carries its corrected classification and its correction record', () => {
    // Reclassified in P1c: the P1b writer search matched `INSERT INTO` and was
    // blind to the insertOne() helper family, so a MAIA-authored inference was
    // recorded as having no writer at all.
    expect(SOVEREIGN_CORPUS.state_vectors.class).toBe('SYSTEM_REPRESENTATION_ABOUT_MEMBER');
    expect(SOVEREIGN_CORPUS.state_vectors.evidence).toMatch(/insertOne/);
    const store = fs.readFileSync(path.join(REPO, 'lib/maia/state-vector/store.ts'), 'utf8');
    expect(store).toMatch(/insertOne<StateVectorRow>\('state_vectors'/);
  });

  it('episode_links remains writer-less under the WIDENED search', () => {
    // The correction that found state_vectors' writer had to be applied to the
    // whole UNKNOWN set, not only to the one that improved the numbers.
    expect(SOVEREIGN_CORPUS.episode_links.class).toBe('UNKNOWN');
    let writer = false;
    const walk = (p: string): void => {
      let st: fs.Stats;
      try {
        st = fs.statSync(p);
      } catch {
        return;
      }
      if (st.isDirectory()) {
        for (const f of fs.readdirSync(p)) {
          const q = path.join(p, f);
          if (!SKIP_DIR.test(q)) walk(q);
        }
        return;
      }
      if (!/\.tsx?$/.test(p) || SKIP_DIR.test(p)) return;
      const src = fs.readFileSync(p, 'utf8');
      if (/INSERT\s+INTO\s+episode_links\b/i.test(src)) writer = true;
      if (/insertOne[^(]*\(\s*['"]episode_links['"]/.test(src)) writer = true;
      if (/upsert[A-Za-z]*\(\s*['"]episode_links['"]/.test(src)) writer = true;
    };
    walk(path.join(REPO, 'lib'));
    walk(path.join(REPO, 'app'));
    expect(writer).toBe(false);
  });
});

// ── §10 — INNOCENT NEGATIVE CONTROLS ─────────────────────────────────────────

describe('P1c §10 — innocent negative controls', () => {
  it('prose in the ledger naming a table is not a read of it', () => {
    // The ledger names every table in the corpus. If naming counted as reading,
    // every not_reachable claim would falsify itself.
    expect(readersOf('teloi')).not.toContain('lib/maia/sovereignDisposition.ts');
    expect(readersOf('teloi').length).toBeGreaterThan(0);
  });

  it('a representation with no in-closure reader is not thereby exported', () => {
    // "Not reachable" closes participation. It does not, by itself, create an
    // export obligation — that is a class question, not a reachability one.
    expect(SOVEREIGN_DISPOSITION.selflet_nodes.export).toBeUndefined();
    expect([...SOVEREIGN_DISPOSITION.selflet_nodes.dispositions]).toEqual(['EXCLUDE']);
  });

  it('a mixed-authorship row keeps its member field, and says which one it is', () => {
    for (const k of ['member_daily_anchors', 'member_lens_passes', 'bardic_cues'] as CorpusKey[]) {
      const spec = SOVEREIGN_DISPOSITION[k].export!;
      expect({ k, mixed: spec.authorship }).toEqual({ k, mixed: 'mixed' });
      const fa = spec.fieldAuthorship ?? {};
      expect({ k, hasMember: Object.values(fa).includes('member') }).toEqual({
        k,
        hasMember: true,
      });
      expect({ k, hasSystem: Object.values(fa).includes('system') }).toEqual({
        k,
        hasSystem: true,
      });
      // …and every field named actually appears in the projection.
      for (const f of Object.keys(fa)) {
        expect({ k, f, selected: spec.select.includes(f) }).toEqual({ k, f, selected: true });
      }
    }
  });

  it('the generated SELECT is well-formed and member-scoped', () => {
    const sql = buildSelect(SOVEREIGN_DISPOSITION.conversation_turns.export!);
    expect(sql).toMatch(/WHERE user_id = \$1/);
    expect(sql).toMatch(/ORDER BY created_at DESC/);
    expect(sql).toMatch(new RegExp(`LIMIT ${EXPORT_ROW_CAP}`));
    expect(sql).toContain('role');
  });

  it('a computed column renders as an expression, not as a raw column name', () => {
    const sql = buildSelect(SOVEREIGN_DISPOSITION.user_relationship_context.export!);
    expect(sql).toMatch(/relationship_embedding IS NOT NULL AS has_relationship_embedding/);
    // The raw vector itself is never projected.
    expect(sql).not.toMatch(/SELECT[^]*?,\s*relationship_embedding\s*,/);
  });
});

// ── §11 — BOUNDARY NEGATIVE CONTROLS ─────────────────────────────────────────

describe('P1c §11 — boundary negative controls', () => {
  it('the closure scan is multiline- and modifier-tolerant', () => {
    // A line-oriented import scan reported ZERO the moment an import was
    // reformatted across lines (P3e). Reformatting must not move a verdict.
    // `RelationshipMemoryService` is imported by maiaService across one line and
    // by maiaVoice across several; both must be found.
    expect(CLOSURE.has('lib/memory/RelationshipMemoryService.ts')).toBe(true);
    // A `import type { … }` only edge must still resolve.
    expect(CLOSURE.has('lib/maia/participationGate.ts')).toBe(true);
  });

  it('the closure follows dynamic imports, not only static ones', () => {
    // formatMultiSpiralState reaches SpiralStateService through
    // `await import("./SpiralStateService")`. A scan that missed it would hand
    // out a false "not reachable".
    expect(CLOSURE.has('lib/consciousness/spiral/SpiralStateService.ts')).toBe(true);
  });

  it('the closure is entry-point-relative, and a narrower entry set is a subset', () => {
    const narrow = liveClosure(['lib/sovereign/maiaVoice.ts']);
    expect(narrow.size).toBeGreaterThan(0);
    expect(narrow.size).toBeLessThan(CLOSURE.size);
    for (const m of narrow) expect({ m, inFull: CLOSURE.has(m) }).toEqual({ m, inFull: true });
  });

  it('the schema reader is not fooled by a table whose name is a prefix of another', () => {
    const memberCols = schemaColumns('members');
    const settingCols = schemaColumns('member_settings');
    expect(memberCols.has('passkey')).toBe(true);
    expect(settingCols.has('passkey')).toBe(false);
    expect(settingCols.has('voice_model')).toBe(true);
  });

  it('a comment mentioning a forbidden column is not an export of it', () => {
    const spec = SOVEREIGN_DISPOSITION.google_calendar_credentials;
    expect(spec.rationale).toMatch(/token/i);
    expect(spec.export).toBeUndefined();
  });
});
