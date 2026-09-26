/**
 * PRACTITIONER AUTHORITY BOUNDARIES — static containment pins
 *
 * Lane: Practitioner Perspective and Authority — Live Substrate Reconciliation
 * Founder directive 2026-08-06: "That should be testable, not merely documented."
 *
 * These are CONTAINMENT pins, not the ruling. They freeze the current boundary
 * so that live-but-dormant hazardous substrate cannot be quietly wired up while
 * the perspective ruling is still open. Each pin encodes one interim law:
 *
 *   1. Caseload visibility is OPERATIONAL SCOPE, not EPISTEMIC AUTHORITY.
 *      /api/caseload must not become a MAIA context source.
 *
 *   2. practitioner_growth is LIVE BUT DORMANT HAZARDOUS SUBSTRATE.
 *      The schema encodes "system concludes → practitioner acknowledges".
 *      No generator, no UI, no MAIA context path may connect to it before
 *      the ruling. `acknowledged` proves exposure, never agreement.
 *
 *   3. Member private material must not reach practitioner-development surfaces.
 *
 * ⛔ These tests do NOT rule on what the boundary SHOULD be. They pin what it
 *    IS, so that changing it becomes a deliberate act with a failing test
 *    attached — never a silent import.
 *
 * If a pin fails: do not edit the allowlist to make it green. The failure means
 * something crossed a boundary that is still under founder review. Take it to
 * the ruling.
 *
 * Reference: docs/architecture/PRACTITIONER_INFERENCE_CONTAINMENT_2026-08-06.md
 */

import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const REPO_ROOT = path.resolve(__dirname, '..');

/**
 * ⚠️ WHY THIS IS NOT A GLOB PATHSPEC (finding F1, 2026-08-06)
 *
 * This helper previously passed pathspecs of the form `lib/maia/**\/*.ts`.
 * Git pathspec globbing WITHOUT `:(glob)` magic does not treat `**` the way a
 * shell globstar does: `X/**\/*.ts` matches only files at least one directory
 * BELOW X, and silently skips every file sitting directly in X.
 *
 * Measured cost of that bug at 95e7f5fdf — the pins were scanning ~27% of the
 * intended surface while reporting green:
 *
 *     lib/maia          50 of 165 .ts files    (115 skipped)
 *     lib/consciousness 77 of 347 .ts files    (270 skipped)
 *     lib/oracle        34 of  75 .ts files    ( 41 skipped)
 *     lib/sovereign      6 of  23 .ts files    ( 17 skipped)
 *
 * The fix is deliberately NOT `:(glob)` magic — it is plain DIRECTORY
 * pathspecs (which git recurses fully) plus an explicit extension filter
 * applied here in JS. That keeps the scanned surface enumerable and auditable
 * rather than dependent on pathspec-magic subtleties, and it lets
 * `enumerate()` below report exactly what was covered.
 */
const CODE_EXT = /\.(ts|tsx)$/;

/**
 * UI surfaces only. Rendering happens in .tsx; .ts under app/ is API-route code,
 * which PIN 2's first assertion already governs. Using an extension filter rather
 * than a page.tsx-style glob pathspec keeps FULL directory depth (the F1 fix)
 * while preserving the UI-only INTENT of these two pins.
 *
 * Caught during the F1 fix itself: mechanically rewriting the old pathspec to a
 * bare 'app/' directory silently widened these pins to include .ts API routes,
 * which surfaced the already-quarantined growth route as a false "UI violation".
 * Widening coverage and widening SCOPE are different changes.
 */
const UI_EXT = /\.tsx$/;

/** Untracked-but-not-ignored sibling worktrees would otherwise leak in via --untracked. */
const FOREIGN = /(^|\/)\.claude\/worktrees\//;

function gitLines(cmd: string): string[] {
  try {
    return execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
      .split('\n')
      .filter(Boolean);
  } catch {
    // git grep exits 1 on "no matches" — a valid empty result, not an error.
    // Genuine harness breakage is caught by the coverage + mutation tests below,
    // which assert positively that real files are scanned and real violations found.
    return [];
  }
}

/**
 * Search the source tree for a pattern within the given DIRECTORIES (recursive,
 * including files directly inside them).
 *
 * `--untracked` is required so the F2 mutation fixtures — files created during
 * the test run and never committed — are actually visible to the verifier. It
 * respects .gitignore, so node_modules and build output stay out; sibling
 * worktrees are not gitignored, so they are filtered explicitly.
 */
function search(pattern: string, dirs: string[], ext: RegExp = CODE_EXT): string[] {
  const spec = dirs.map((d) => JSON.stringify(d)).join(' ');
  return gitLines(`git grep -l --untracked -E ${JSON.stringify(pattern)} -- ${spec}`)
    .filter((f) => ext.test(f) && !FOREIGN.test(f))
    .sort();
}

/** Every file the verifier WOULD scan for these directories — the covered surface. */
function enumerate(dirs: string[], ext: RegExp = CODE_EXT): string[] {
  const spec = dirs.map((d) => JSON.stringify(d)).join(' ');
  return [
    ...gitLines(`git ls-files -- ${spec}`),
    ...gitLines(`git ls-files --others --exclude-standard -- ${spec}`),
  ]
    .filter((f) => ext.test(f) && !FOREIGN.test(f))
    .sort();
}

const SOURCE = ['app/', 'lib/', 'components/'];

/**
 * Modules that compose context handed to MAIA for reasoning. Anything imported
 * here becomes epistemic input, not merely data the practitioner can look at.
 */
const MAIA_CONTEXT_SURFACES = [
  'lib/maia/',
  'lib/sovereign/',
  'lib/consciousness/',
  'lib/oracle/',
  'app/api/sovereign/',
  'app/api/oracle/',
  'app/api/maia/',
];

/** Fixture paths for the F2 mutation check. Removed in afterAll. */
const FIXTURE_MARKER = 'CONTAINMENT_VERIFIER_SELFTEST_MARKER';
const FIXTURE_TOP = 'lib/maia/__containment_verifier_selftest.ts';
const FIXTURE_NESTED = 'lib/maia/__containment_verifier_selftest_dir/nested.ts';

describe('harness sanity — the verifier must prove what it scanned', () => {
  beforeAll(() => {
    for (const rel of [FIXTURE_TOP, FIXTURE_NESTED]) {
      const abs = path.join(REPO_ROOT, rel);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, `export const selftest = '${FIXTURE_MARKER}';\n`);
    }
  });

  afterAll(() => {
    fs.rmSync(path.join(REPO_ROOT, FIXTURE_TOP), { force: true });
    fs.rmSync(path.join(REPO_ROOT, path.dirname(FIXTURE_NESTED)), { recursive: true, force: true });
  });

  /**
   * F2 — the anti-vacuity check must be able to detect the F1 failure class.
   *
   * The previous guard only asserted "some pattern returns a nonzero count",
   * which passed happily while four pathspecs under-scanned. These assert
   * positively that BOTH file depths are reachable. Under the old glob
   * pathspec the TOP-LEVEL fixture is invisible and this test fails — which is
   * exactly the regression it exists to catch.
   */
  it('detects a forbidden reference in a TOP-LEVEL file (lib/maia/x.ts)', () => {
    expect(search(FIXTURE_MARKER, ['lib/maia/'])).toContain(FIXTURE_TOP);
  });

  it('detects a forbidden reference in a NESTED file (lib/maia/sub/x.ts)', () => {
    expect(search(FIXTURE_MARKER, ['lib/maia/'])).toContain(FIXTURE_NESTED);
  });

  it('detects BOTH depths in one search — neither class may be omitted', () => {
    expect(search(FIXTURE_MARKER, ['lib/maia/'])).toEqual([FIXTURE_NESTED, FIXTURE_TOP].sort());
  });

  it('the same holds through the SOURCE surface used by PIN 2', () => {
    const hits = search(FIXTURE_MARKER, SOURCE);
    expect(hits).toContain(FIXTURE_TOP);
    expect(hits).toContain(FIXTURE_NESTED);
  });

  /**
   * F1 — report the enumerated surface. A pin that scans nothing is vacuous;
   * this makes the covered surface an explicit, reviewable number rather than
   * an assumption.
   */
  it('scans the full enumerated surface of every governed directory', () => {
    const coverage: Record<string, number> = {};
    for (const dir of MAIA_CONTEXT_SURFACES) {
      const files = enumerate([dir]);
      coverage[dir] = files.length;
      // Every governed directory must contribute real files, and the count must
      // match git's own enumeration — no silent under-scan.
      expect(files.length).toBeGreaterThan(0);
    }
    // Printed so CI logs carry the proof of covered surface.
    console.log('[containment verifier] scanned surface:', JSON.stringify(coverage, null, 2));

    // lib/maia is the directory F1 was measured against; assert the corrected
    // count is the FULL .ts inventory, not the ~30% the glob pathspec returned.
    const maiaAll = enumerate(['lib/maia/']).filter((f) => f.endsWith('.ts'));
    const maiaTopLevel = maiaAll.filter((f) => f.split('/').length === 3);
    expect(maiaTopLevel.length).toBeGreaterThan(50); // the class the old pathspec skipped entirely
    expect(maiaAll.length).toBeGreaterThan(maiaTopLevel.length); // nested included too
  });

  it('finds real violations in the tracked tree (not vacuously empty)', () => {
    expect(search('practitioner_growth', SOURCE).length).toBeGreaterThan(0);
  });

  it('does not read sibling worktrees', () => {
    expect(search('practitioner_growth', SOURCE).filter((f) => FOREIGN.test(f))).toEqual([]);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * PIN 1 — Caseload is operational scope, not epistemic authority
 * ──────────────────────────────────────────────────────────────────────────── */

describe('PIN 1 — /api/caseload must not become a MAIA context source', () => {
  it('no MAIA context surface imports the caseload store', () => {
    const offenders = search("from ['\"]@/lib/caseload", MAIA_CONTEXT_SURFACES);
    expect(offenders).toEqual([]);
  });

  it('no MAIA context surface queries caseload tables directly', () => {
    const offenders = search('FROM (practitioner_)?cases\\b|INTO (practitioner_)?cases\\b', MAIA_CONTEXT_SURFACES);
    expect(offenders).toEqual([]);
  });

  it('no MAIA context surface fetches the caseload endpoint', () => {
    const offenders = search('/api/caseload', MAIA_CONTEXT_SURFACES);
    expect(offenders).toEqual([]);
  });

  it('the caseload store itself does not reach into MAIA prompt building', () => {
    // The inverse direction: caseload must not push itself into context either.
    const offenders = search(
      "from ['\"]@/lib/(maia|sovereign|oracle)/",
      ['lib/caseload/', 'app/api/caseload/']
    );
    expect(offenders).toEqual([]);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * PIN 2 — practitioner_growth quarantine
 *
 * Measured 2026-08-06 at f5c5b7ab9: the read/write/acknowledge endpoints exist
 * and are live code; NO generator feeds the write path. This pin freezes that
 * "no generator" state.
 * ──────────────────────────────────────────────────────────────────────────── */

/** The only files permitted to reference practitioner_growth today. */
const GROWTH_ALLOWLIST = [
  'app/api/practice/growth/route.ts',
  'lib/practice/PracticeStore.ts',
];

describe('PIN 2 — practitioner_growth is quarantined pending the perspective ruling', () => {
  it('has not spread beyond the two known files', () => {
    const hits = search('practitioner_growth|addGrowthObservation', SOURCE);
    expect(hits).toEqual(GROWTH_ALLOWLIST.slice().sort());
  });

  it('no MAIA context surface references practitioner growth claims', () => {
    const offenders = search('practitioner_growth|addGrowthObservation', MAIA_CONTEXT_SURFACES);
    expect(offenders).toEqual([]);
  });

  it('no generator writes MAIA-authored developmental claims about a practitioner', () => {
    // InsightGenerator is the natural place a generator would land. Pin it empty.
    const offenders = search(
      'addGrowthObservation|pattern_identified|client_type_affinity|style_evolution',
      ['lib/practice/InsightGenerator.ts']
    );
    expect(offenders).toEqual([]);
  });

  it('no UI surface renders practitioner growth claims', () => {
    const offenders = search(
      'practitioner_growth|/api/practice/growth',
      ['components/', 'app/'],
      UI_EXT
    );
    expect(offenders).toEqual([]);
  });

  it('the practitioner-facing insight vocabulary has no NEW UI surface', () => {
    // blind_spot / growth_edge / strength_spotted / practitioner_pattern are the
    // session_insights sibling of the same hazard: system-authored claims about
    // a person, controlled only by an "acknowledged" boolean.
    //
    // ⚠️ This pin is NOT green-because-clean. It is green because one existing
    // violation is baselined below (see PIN 4). The list may SHRINK when the
    // ruling lands; it may never GROW.
    const offenders = search(
      "'blind_spot'|'growth_edge'|'strength_spotted'|'practitioner_pattern'",
      ['components/', 'app/'],
      UI_EXT
    );
    expect(offenders).toEqual(KNOWN_UNRULED_VIOLATIONS);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * PIN 4 — pattern_ledger → practitioner: a LIVE, RENDERED instance of the
 *         boundary this lane exists to rule on.
 *
 * Found 2026-08-06 by PIN 2 failing. Not hypothetical, not dormant:
 *
 *   lib/patterns/PatternDetectionService.ts  writes pattern_ledger (SYSTEM-inferred)
 *     → app/api/studio/clients/[id]/pattern-ledger/route.ts  reads WHERE member_id = $1
 *       filtered to status IN ('emerging','offered','confirmed','partial','active')
 *       and computes weightedScore = avgSig*0.4 + maxSig*0.2 + log(count+1)*0.25 + recency
 *     → components/studio/PatternLedgerEvolutionPanel.tsx  renders recurrenceCount +
 *       significance scores + 'Growth Edge' labels
 *     → app/studio/clients/[id]/page.tsx  the practitioner's client page
 *
 * Two constitutional problems, both structural:
 *
 *   1. It is system-INFERRED pattern material about a member, surfaced to the
 *      practitioner. The founder's own never-cross list names "inferred patterns"
 *      explicitly.
 *   2. It includes status 'emerging' — patterns the system detected but has NOT
 *      offered to the member, and which the member has therefore never accepted.
 *      Per the Corpus Callosum grammar rulings, only the member creates 'adopted'.
 *      The practitioner is currently positioned UPSTREAM of the member's own
 *      recognition of a pattern about themselves.
 *
 * ⛔ Baselined, NOT accepted. ⛔ Do not "fix" this by editing the allowlist.
 *    ⛔ Do not fix it by deleting the panel either — that is a founder call
 *    inside the perspective ruling (question 3: what may never cross).
 * ⚠️ [I] NOT VERIFIED: whether production pattern_ledger holds rows for any real
 *    client. Schema + route + UI are observed; live data volume is not. Check with:
 *      SELECT status, count(*) FROM pattern_ledger GROUP BY 1;
 * ──────────────────────────────────────────────────────────────────────────── */

/** Live violations found by these pins, awaiting the perspective ruling. MAY SHRINK, MAY NOT GROW. */
const KNOWN_UNRULED_VIOLATIONS = ['components/studio/PatternLedgerEvolutionPanel.tsx'];

/* ────────────────────────────────────────────────────────────────────────────
 * PIN 5 — the containment itself (founder ruling, 2026-08-06)
 *
 * PIN 4 records that the crossing EXISTS. These assert that it is CLOSED.
 * They fail if anyone re-opens the read path, filters instead of failing closed,
 * or re-admits field signals into consultation.
 * ──────────────────────────────────────────────────────────────────────────── */

describe('PIN 5 — Practitioner Inference Containment is in force', () => {
  it('the pattern-ledger practitioner route fails closed before any read', () => {
    const contained = search(
      'PATTERN_LEDGER_PRACTITIONER_READ_CONTAINED',
      ['app/api/studio/clients/']
    );
    expect(contained).toEqual(['app/api/studio/clients/[id]/pattern-ledger/route.ts']);
  });

  it('both consult routes route field signals through the admission filter', () => {
    const guarded = search('admitFieldSignalsForConsult', ['app/api/studio/']);
    expect(guarded).toEqual([
      'app/api/studio/changes/[id]/consult/route.ts',
      'app/api/studio/decisions/[id]/consult/route.ts',
    ]);
  });

  it('no consult route reads studio_field_signals into a bundle unguarded', () => {
    // If a third consult-style route appears, it must go through the filter too.
    const readers = search('studio_field_signals', ['app/api/studio/']);
    const guarded = new Set(search('admitFieldSignalsForConsult', ['app/api/studio/']));
    const unguarded = readers.filter(
      (f) => !guarded.has(f) && !f.includes('field-signals/') // the CRUD route itself is not composition
    );
    expect(unguarded).toEqual([]);
  });

  it('the containment module holds the rule and admits nothing today', async () => {
    const mod = await import('@/lib/studio/containment/inferenceContainment');
    expect(mod.PATTERN_LEDGER_PRACTITIONER_READ_CONTAINED).toBe(true);
    // Even a well-formed practitioner-sourced row is refused: `source` is a
    // category, not a provenance.
    expect(mod.admitFieldSignalsForConsult([{ source: 'practitioner' }])).toEqual([]);
    expect(mod.admitFieldSignalsForConsult([{ source: 'client' }])).toEqual([]);
    expect(mod.admitFieldSignalsForConsult([{ source: 'maia' }])).toEqual([]);
  });

  it('client and maia sources are refused CATEGORICALLY, not just for now', () => {
    const mod = require('@/lib/studio/containment/inferenceContainment');
    // These must stay refused even after a provenance column re-opens 'practitioner'.
    expect(mod.isCategoricallyRefusedSource('client')).toBe(true);
    expect(mod.isCategoricallyRefusedSource('maia')).toBe(true);
    expect(mod.isCategoricallyRefusedSource('practitioner')).toBe(false);
  });

  it('the panel does not report containment as emptiness', () => {
    // "No patterns recorded yet" while the read path is closed would assert
    // something unestablished. The containment branch must exist separately.
    const hits = search('containment', ['components/studio/PatternLedgerEvolutionPanel.tsx']);
    expect(hits).toEqual(['components/studio/PatternLedgerEvolutionPanel.tsx']);
  });
});

describe('PIN 4 — inferred member patterns reaching practitioner surfaces', () => {
  it('has exactly the one known violation — no new ones', () => {
    // NOTE: plain directory pathspecs, not '<dir>/**/*.tsx'. Git pathspec
    // globbing does not behave like shell globstar here and silently misses
    // files sitting directly in the directory — which would make this pin
    // vacuously green. Verified 2026-08-06.
    const offenders = search('pattern_ledger|pattern-ledger', [
      'app/api/studio/',
      'app/studio/',
      'components/studio/',
    ]);
    expect(offenders).toEqual([
      'app/api/studio/clients/[id]/pattern-ledger/route.ts',
      'components/studio/PatternLedgerEvolutionPanel.tsx',
    ]);
  });

  it('no OTHER practitioner surface reads system-inferred pattern services', () => {
    const offenders = search(
      "from ['\"]@/lib/patterns/(PatternDetectionService|generatePatternIntelligence|getTopHypotheses)",
      ['app/api/studio/', 'app/api/practice/', 'app/api/caseload/']
    );
    expect(offenders).toEqual([]);
  });

  it('inferred-status member material does not reach a cross-client practitioner surface', () => {
    // The single-relationship case is baselined above. The CROSS-CLIENT case —
    // the literal "belonging appeared across seven clients" shape — has no
    // instance today. This pin keeps it that way.
    const offenders = search('pattern_ledger', ['app/api/caseload/', 'lib/caseload/']);
    expect(offenders).toEqual([]);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * PIN 3 — member private material must not reach practitioner development
 * ──────────────────────────────────────────────────────────────────────────── */

describe('PIN 3 — the member/practitioner authority boundary', () => {
  it('practitioner surfaces do not read member sanctuary material', () => {
    const offenders = search(
      'sanctuary',
      ['app/api/studio/', 'app/api/practice/', 'app/api/caseload/']
    );
    expect(offenders).toEqual([]);
  });

  it('the practice-field service does not read member memory atoms', () => {
    // practice_fields is practitioner-authored context flowing OUTWARD to members.
    // It must never become a read path back into member material.
    const offenders = search('member_memory_atoms', ['lib/practiceField/']);
    expect(offenders).toEqual([]);
  });

  it('no practitioner surface aggregates across members for interpretation', () => {
    // Cross-member GROUP BY / COUNT over member material inside a practitioner
    // route is the "belonging appeared across seven clients" shape.
    const offenders = search(
      'GROUP BY.*member_id|COUNT\\(.*\\).*FROM member_memory_atoms',
      ['app/api/studio/', 'app/api/practice/']
    );
    expect(offenders).toEqual([]);
  });
});
