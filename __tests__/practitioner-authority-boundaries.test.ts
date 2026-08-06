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

const REPO_ROOT = path.resolve(__dirname, '..');

/**
 * Search the tracked source tree for a pattern. Uses git grep so that
 * node_modules, build output, and — critically — the ~100 sibling worktrees
 * under .claude/worktrees are all excluded automatically. A plain filesystem
 * walk here would report other lanes' code as if it were this tree's state.
 */
function search(pattern: string, pathspecs: string[]): string[] {
  try {
    const out = execSync(
      `git grep -l -E ${JSON.stringify(pattern)} -- ${pathspecs.map((p) => JSON.stringify(p)).join(' ')}`,
      { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    );
    return out.split('\n').filter(Boolean).sort();
  } catch {
    // git grep exits 1 when there are no matches — that is a valid empty result,
    // not an error. Any other failure also surfaces as [] and will be caught by
    // the sanity test below, which asserts the harness can still find things.
    return [];
  }
}

const SOURCE = ['app/**/*.ts', 'app/**/*.tsx', 'lib/**/*.ts', 'lib/**/*.tsx', 'components/**/*.tsx'];

/**
 * Modules that compose context handed to MAIA for reasoning. Anything imported
 * here becomes epistemic input, not merely data the practitioner can look at.
 */
const MAIA_CONTEXT_SURFACES = [
  'lib/maia/**/*.ts',
  'lib/sovereign/**/*.ts',
  'lib/consciousness/**/*.ts',
  'lib/oracle/**/*.ts',
  'app/api/sovereign/**/*.ts',
  'app/api/oracle/**/*.ts',
  'app/api/maia/**/*.ts',
];

describe('harness sanity', () => {
  it('git grep reaches the source tree (guards against silently-empty pins)', () => {
    // If this fails, every pin below is vacuously passing and proves nothing.
    const hits = search('practitioner_growth', SOURCE);
    expect(hits.length).toBeGreaterThan(0);
  });

  it('does not read sibling worktrees', () => {
    const hits = search('practitioner_growth', SOURCE);
    expect(hits.filter((f) => f.includes('.claude/worktrees'))).toEqual([]);
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
      ['lib/caseload/**/*.ts', 'app/api/caseload/**/*.ts']
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
      ['components/**/*.tsx', 'app/**/page.tsx', 'app/**/layout.tsx']
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
      ['components/**/*.tsx', 'app/**/page.tsx']
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
      ['app/api/studio/**/*.ts', 'app/api/practice/**/*.ts', 'app/api/caseload/**/*.ts']
    );
    expect(offenders).toEqual([]);
  });

  it('inferred-status member material does not reach a cross-client practitioner surface', () => {
    // The single-relationship case is baselined above. The CROSS-CLIENT case —
    // the literal "belonging appeared across seven clients" shape — has no
    // instance today. This pin keeps it that way.
    const offenders = search('pattern_ledger', ['app/api/caseload/**/*.ts', 'lib/caseload/**/*.ts']);
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
      ['app/api/studio/**/*.ts', 'app/api/practice/**/*.ts', 'app/api/caseload/**/*.ts']
    );
    expect(offenders).toEqual([]);
  });

  it('the practice-field service does not read member memory atoms', () => {
    // practice_fields is practitioner-authored context flowing OUTWARD to members.
    // It must never become a read path back into member material.
    const offenders = search('member_memory_atoms', ['lib/practiceField/**/*.ts']);
    expect(offenders).toEqual([]);
  });

  it('no practitioner surface aggregates across members for interpretation', () => {
    // Cross-member GROUP BY / COUNT over member material inside a practitioner
    // route is the "belonging appeared across seven clients" shape.
    const offenders = search(
      'GROUP BY.*member_id|COUNT\\(.*\\).*FROM member_memory_atoms',
      ['app/api/studio/**/*.ts', 'app/api/practice/**/*.ts']
    );
    expect(offenders).toEqual([]);
  });
});
