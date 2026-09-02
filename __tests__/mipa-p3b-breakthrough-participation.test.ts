/**
 * MIPA PHASE 0 — P3b CERTIFICATION: BREAKTHROUGH PROVENANCE / PARTICIPATION
 *
 * Authority: docs/specs/MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md — P3b
 *
 * P3's constitutional claim is not "this one composer no longer leaks
 * inference." It is:
 *
 *   Material whose authorship/authority cannot be certified may not acquire
 *   participation merely by travelling through a memory composer.
 *
 * R24 closed the memoryOrchestrator path. `breakthrough_moments` is a second
 * live instance of the same failure class on a different composer, so it is
 * inside the same prerequisite rather than a later enhancement.
 *
 * ── THE TOPOLOGY, FROM SOURCE ───────────────────────────────────────────────
 *
 * SCHEMA — no provenance column of any kind. id, user_id, timestamp, insight,
 * element, integrated, related_themes, conversation_id, created_at, updated_at.
 * Row-level authorship is therefore not certifiable at read time.
 *
 * WRITERS — three exist; exactly one is live:
 *   BreakthroughStore.addBreakthrough        0 callers
 *   RelationshipMemoryService.saveBreakthroughMoment  0 callers (tests only)
 *   MemoryWriteback.writeBreakthroughMoment  1 caller — MemoryWriteback:384-390,
 *     firing on `significance >= 0.5 || isBreakthroughPattern(...)` and storing
 *     a machine-`extractInsight`ed string. System inference end to end.
 *
 * Both branches converge on EXCLUDED, which is why the verdict is robust rather
 * than resting on the ambiguity: the live writer would be maia/inference even
 * with a provenance column (excluded as unendorsed), and legacy rows are
 * indeterminate (excluded rather than guessed).
 *
 * COMPOSERS — three channels reached the prompt, not one:
 *   1  memoryBullets            `• [breakthrough] <insight>`   verbatim
 *   2  recentBreakthroughs      `⭐ RECENT BREAKTHROUGHS`       verbatim again
 *   3  breakthroughCount +      `N breakthroughs recorded      an aggregate
 *      dominantElement           (water dominant)`              CLAIM
 *
 * ── NOTHING MEMBER-AUTHORED IS EXCLUDED BY THIS ─────────────────────────────
 *
 * No writer in the repository can express member marking for this table. The
 * member-marked breakthrough class is `member_memory_atoms.is_breakthrough` —
 * schema-constrained member-only, on the atoms path, untouched here. §3 pins
 * that separation.
 *
 * ── DETECTOR DISCIPLINE (founder rule, 2026-09-02) ──────────────────────────
 *
 *   Constitutional detectors require both hostile positive mutations AND
 *   innocent negative controls.
 *
 * Twice a certification first discovered a false positive in itself: P2 read
 * `setPreferences(` as a SQL `SET`; P3a's check failed on the docblock that
 * *described* the forbidden property. A detector that rejects valid lookalikes
 * is not a stronger gate — it is an eventual disablement risk, the same social
 * failure that ruled out pinning 75 `members` call sites. §5 is this suite's
 * negative-control corpus.
 */

import * as fs from 'fs';
import * as path from 'path';

import {
  MemoryBundleService,
  type BreakthroughSnapshot,
  type AdmittedBreakthrough,
} from '@/lib/memory/MemoryBundle';

const REPO = path.resolve(__dirname, '..');
const BUNDLE = path.join(REPO, 'lib/memory/MemoryBundle.ts');

const excluded = (id: string): BreakthroughSnapshot => ({
  id,
  integrated: false,
  timestamp: new Date('2026-01-01'),
  relatedThemes: ['abandonment'],
  participation: 'excluded',
  exclusionReason: 'uncertified_provenance',
});

const admitted = (id: string, insight: string, element?: string): AdmittedBreakthrough => ({
  id,
  integrated: false,
  timestamp: new Date('2026-01-01'),
  relatedThemes: [],
  participation: 'admitted',
  insight,
  element,
});

const relData = { encounterCount: 40, firstSeen: new Date(), lastSeen: new Date(), sessionCount: 5 };

/**
 * Extract one object-literal method body by name.
 *
 * Written after this suite's own third detector failure: slicing "from method A
 * to method B" silently assumed a file ordering that does not hold
 * (`compress` sits at 544, `buildRelationshipSnapshot` at 603,
 * `breakthroughsToCandidate` at 665). The wrong-order slice returned an empty
 * string and the assertion failed — this time loudly. A slice that happened to
 * span TOO MUCH would have passed spuriously, which is the same instrument
 * defect pointing the other way.
 *
 * Terminating on the method's own closing `\n  },` is position-independent.
 */
function methodBody(src: string, name: string): string {
  const start = src.indexOf(`\n  ${name}(`);
  expect({ method: name, found: start >= 0 }).toEqual({ method: name, found: true });
  const end = src.indexOf('\n  },', start);
  expect({ method: name, terminated: end > start }).toEqual({ method: name, terminated: true });
  return src.slice(start, end);
}

// ── §1 — ambiguous provenance cannot silently compose ────────────────────────

describe('P3b §1 — ambiguous provenance cannot reach the speaking context', () => {
  it('an excluded breakthrough produces no memory candidate', () => {
    const candidates = MemoryBundleService.breakthroughsToCandidate([
      excluded('a'), excluded('b'),
    ]);
    expect(candidates).toEqual([]);
  });

  it('excluded breakthroughs contribute nothing to the relationship snapshot', () => {
    const snap = MemoryBundleService.buildRelationshipSnapshot(relData, [
      excluded('a'), excluded('b'), excluded('c'),
    ]);
    expect(snap.recentBreakthroughs).toEqual([]);
    // The COUNT too — an aggregate over uncertified inference is still
    // uncertified inference, and reads as established fact.
    expect(snap.breakthroughCount).toBe(0);
    expect(snap.dominantElement).toBeUndefined();
  });

  it('the rendered prompt omits the breakthrough clause rather than asserting zero', () => {
    const snap = MemoryBundleService.buildRelationshipSnapshot(relData, [excluded('a')]);
    const text = MemoryBundleService.formatForPrompt({
      recentContinuity: '',
      memoryBullets: [],
      relationshipSnapshot: snap,
      selectionTrace: [],
      retrievalStats: {
        turnsRetrieved: 0, turnsSameSession: 0, turnsCrossSession: 0,
        semanticHits: 0, breakthroughsFound: 0, breakthroughsExcluded: 1,
        totalCandidates: 0, afterRanking: 0,
      },
    });
    expect(text).not.toMatch(/breakthroughs recorded/);
    expect(text).not.toMatch(/RECENT BREAKTHROUGHS/);
    expect(text).not.toMatch(/0 breakthroughs/);
    // the honest part survives
    expect(text).toMatch(/40 turns across sessions/);
  });

  it('the excluded arm carries no insight or element at runtime either', () => {
    const b = excluded('a');
    expect(Object.prototype.hasOwnProperty.call(b, 'insight')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(b, 'element')).toBe(false);
  });
});

// ── §2 — no heuristic or default provenance backfill ─────────────────────────

describe('P3b §2 — provenance is never guessed, and never defaulted to member', () => {
  it('the loader asserts a null claim, not an inferred one', () => {
    const src = fs.readFileSync(BUNDLE, 'utf8');
    expect(src).toMatch(/const provenance: ProvenanceClaim = null;/);
  });

  it('NO code path assigns member authorship to a breakthrough row', () => {
    const src = fs.readFileSync(BUNDLE, 'utf8');
    const code = src.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
    // The most dangerous future "compatibility fix": unknown provenance
    // defaulting to member authority would convert machine inference into
    // member testimony at the top of the authority lattice.
    expect(code).not.toMatch(/authoredBy:\s*'member'/);
    expect(code).not.toMatch(/authoredBy:\s*'practitioner'/);
    expect(code).not.toMatch(/authorityClass:\s*'testimony'/);
    expect(code).not.toMatch(/authorityClass:\s*'member_act'/);
  });

  it('provenance is not derived from content, wording, timestamps or writer identity', () => {
    const src = fs.readFileSync(BUNDLE, 'utf8');
    const gateRegion = src.slice(
      src.indexOf('const provenance: ProvenanceClaim'),
      src.indexOf('const verdict = adjudicateParticipation'),
    );
    for (const heuristic of ['insight.', 'includes(', 'match(', 'test(', 'length >', 'timestamp']) {
      expect({ heuristic, present: gateRegion.includes(heuristic) })
        .toEqual({ heuristic, present: false });
    }
  });
});

// ── §3 — certifiable member-marked material is NOT collapsed ─────────────────

describe('P3b §3 — the member-marked breakthrough class is untouched', () => {
  it('lives in member_memory_atoms, not breakthrough_moments', () => {
    const atoms = fs.readFileSync(path.join(REPO, 'lib/maia/memoryAtomsLoader.ts'), 'utf8');
    // Still selected, still member-only, still ordered breakthrough-first.
    expect(atoms).toMatch(/is_breakthrough/);
    expect(atoms).toMatch(/ORDER BY is_breakthrough DESC/);
    // P3b changed nothing on this path.
    expect(atoms).not.toMatch(/breakthrough_moments/);
  });

  it('no writer in the repository can express member marking for breakthrough_moments', () => {
    const skip = /node_modules|\.next|__tests__|\.test\.tsx?$/;
    const writers: string[] = [];
    const walk = (p: string) => {
      const st = fs.statSync(p);
      if (st.isDirectory()) {
        for (const f of fs.readdirSync(p)) {
          const q = path.join(p, f);
          if (!skip.test(q)) walk(q);
        }
        return;
      }
      if (!/\.tsx?$/.test(p)) return;
      const body = fs.readFileSync(p, 'utf8');
      if (/INSERT INTO breakthrough_moments/i.test(body)) writers.push(path.relative(REPO, p));
    };
    for (const r of ['lib', 'app']) walk(path.join(REPO, r));
    // Three writers exist; none takes a member-marked input. If a future writer
    // adds one, this list changes and the classification must be revisited —
    // that is the point of pinning it.
    expect(writers.sort()).toEqual([
      'lib/memory/MemoryWriteback.ts',
      'lib/memory/RelationshipMemoryService.ts',
      'lib/memory/stores/BreakthroughStore.ts',
    ]);
    for (const w of writers) {
      const body = fs.readFileSync(path.join(REPO, w), 'utf8');
      const stmt = body.slice(body.search(/INSERT INTO breakthrough_moments/i));
      expect(stmt.slice(0, 600)).not.toMatch(/marked_by_member|authored_by|member_marked/);
    }
  });
});

// ── §4 — the raw-composer bypass fails ───────────────────────────────────────

describe('P3b §4 — a raw bypass into the composer cannot be written', () => {
  it('breakthroughsToCandidate narrows before reading insight', () => {
    const src = fs.readFileSync(BUNDLE, 'utf8');
    expect(methodBody(src, 'breakthroughsToCandidate')).toMatch(/participation === 'admitted'/);
  });

  it('buildRelationshipSnapshot narrows before reading insight or element', () => {
    const src = fs.readFileSync(BUNDLE, 'utf8');
    expect(methodBody(src, 'buildRelationshipSnapshot')).toMatch(/participation === 'admitted'/);
  });

  it('the excluded arm of the union declares no insight', () => {
    const src = fs.readFileSync(BUNDLE, 'utf8');
    const start = src.indexOf('export interface ExcludedBreakthrough');
    // Read the interface BODY, not the prose around it — the P3a lesson.
    const arm = src.slice(start, src.indexOf('\n}', start));
    expect(arm).not.toMatch(/insight/);
    expect(arm).not.toMatch(/element/);
  });

  it('an admitted breakthrough still composes — the gate excludes, it does not disable', () => {
    const cands = MemoryBundleService.breakthroughsToCandidate([
      admitted('a', 'the pattern was protection, not fear', 'water'),
    ]);
    expect(cands).toHaveLength(1);
    expect(cands[0].content).toBe('the pattern was protection, not fear');

    const snap = MemoryBundleService.buildRelationshipSnapshot(relData, [
      admitted('a', 'the pattern was protection, not fear', 'water'),
    ]);
    expect(snap.breakthroughCount).toBe(1);
    expect(snap.dominantElement).toBe('water');
  });

  it('a mixed set admits only the admitted rows', () => {
    const snap = MemoryBundleService.buildRelationshipSnapshot(relData, [
      admitted('a', 'certified insight', 'fire'),
      excluded('b'),
      excluded('c'),
    ]);
    expect(snap.breakthroughCount).toBe(1);
    expect(snap.recentBreakthroughs).toEqual(['certified insight']);
  });
});

// ── §5 — NEGATIVE CONTROLS (innocent lookalikes must pass) ───────────────────

describe('P3b §5 — detector negative controls: innocent lookalikes must NOT trip', () => {
  const src = fs.readFileSync(BUNDLE, 'utf8');
  const codeOnly = src.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');

  it('prose describing a forbidden pattern is not the forbidden pattern', () => {
    // The module's docblock legitimately mentions `member`, `marked_by_member`
    // and `authored_by` while EXPLAINING why they are absent. A detector that
    // reads its own explanation as a violation is the P3a failure.
    expect(src).toMatch(/marked_by_member/);        // present in prose
    expect(codeOnly).not.toMatch(/marked_by_member/); // absent in code
  });

  it('a variable or method whose name merely contains a SQL keyword is not SQL', () => {
    // The P2 failure in miniature: `setPreferences(` is not an UPDATE ... SET.
    const sqlish = /\b(SELECT|UPDATE|WHERE|SET|INSERT)\b/;
    expect(sqlish.test('setPreferences({ ...prev })')).toBe(false);
    expect(sqlish.test('const inserted = items.length')).toBe(false);
    expect(sqlish.test('SELECT id FROM breakthrough_moments')).toBe(true);
  });

  it('reading `integrated` or `relatedThemes` from an excluded row is legitimate', () => {
    // These live on the BASE arm deliberately: they are not claims about the
    // member's development and they do not compose. A gate that forbade all
    // access to an excluded row would be overbroad, and overbroad gates get
    // switched off.
    const b = excluded('a');
    expect(b.integrated).toBe(false);
    expect(b.relatedThemes).toEqual(['abandonment']);
  });

  it('counting excluded rows for observability is not composing them', () => {
    const all = [admitted('a', 'x'), excluded('b'), excluded('c')];
    const excludedCount = all.filter((b) => b.participation === 'excluded').length;
    expect(excludedCount).toBe(2);
    // Reported after the decision, never an input to it — the selectionTrace
    // discipline. Distinguishes "nothing existed" from "nothing participated".
    const snap = MemoryBundleService.buildRelationshipSnapshot(relData, all);
    expect(snap.breakthroughCount).toBe(1);
  });
});
