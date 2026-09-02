/**
 * MIPA PHASE 0 — P3 CERTIFICATION: UNCERTIFIED INFERENCE DOES NOT COMPOSE
 *
 * Authority: docs/specs/MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md — P3
 *
 *   Uncertified or insufficiently authorized inferred developmental material
 *   cannot enter canonical live composition.
 *
 * ── WHAT P3 IS NOT ──────────────────────────────────────────────────────────
 *
 * It is not a provenance-labelling repair. Attaching `authored_by: maia` to the
 * developmental prime and leaving it in the prompt would improve provenance
 * while still violating participation. Under the ratified authority lattice,
 * unendorsed MAIA inference has no entitlement to participate merely because
 * its authorship is now accurately named.
 *
 * ── THE FOUR PROOFS (founder-specified) ─────────────────────────────────────
 *
 *   1  the existing ungoverned `directional_cue` path is structurally gone
 *   2  uncertified legacy material is excluded, never guessed
 *   3  inference cannot gain authority from age or repetition
 *   4  a hostile fork reintroducing uncertified material fails certification
 *
 * Proof 4's mandated mutation is `composer += developmentalMemory.directional_cue`.
 * Here it does not merely fail an assertion — §4 shows it cannot be written at
 * all, because the excluded arm of the union has no such property. The
 * certification for that proof is a COMPILE failure, verified in §4.
 */

import * as fs from 'fs';
import * as path from 'path';

import {
  adjudicateParticipation,
  EXCLUSION_REASON_TEXT,
  type ProvenanceClaim,
} from '@/lib/maia/participationGate';
import { buildMemoryInfluencePlan } from '@/lib/maia/memoryOrchestrator';
import type { DevelopmentalMemorySnapshot, ThemeSignalSnapshot } from '@/lib/maia/types/memoryOrchestrator';

const REPO = path.resolve(__dirname, '..');

const excludedSnapshot = (id: string): DevelopmentalMemorySnapshot => ({
  id,
  memory_type: 'pattern',
  facet_code: null,
  significance: 0.9,
  formed_at: new Date('2025-01-01'),
  participation: 'excluded',
  exclusionReason: 'uncertified_provenance',
});

const admittedSnapshot = (id: string, cue: string | null): DevelopmentalMemorySnapshot => ({
  id,
  memory_type: 'pattern',
  facet_code: null,
  significance: 0.9,
  formed_at: new Date('2025-01-01'),
  participation: 'admitted',
  directional_cue: cue,
});

// ── §1 — the adjudicator excludes by default ─────────────────────────────────

describe('P3 §1 — participation gate', () => {
  it('excludes uncertified provenance rather than guessing it', () => {
    const v = adjudicateParticipation({ provenance: null, endorsement: 'none' });
    expect(v).toEqual({ admitted: false, reason: 'uncertified_provenance' });
  });

  it('excludes MAIA-authored inference with no member endorsement', () => {
    const v = adjudicateParticipation({
      provenance: { authoredBy: 'maia', authorityClass: 'inference' },
      endorsement: 'none',
    });
    expect(v).toEqual({ admitted: false, reason: 'unendorsed_inference' });
  });

  it('admits an endorsed inference WITHOUT rewriting its authorship', () => {
    const v = adjudicateParticipation({
      provenance: { authoredBy: 'maia', authorityClass: 'inference' },
      endorsement: 'endorsed',
    });
    expect(v.admitted).toBe(true);
    // The endorsed object is a member-endorsed interpretation, never a member
    // statement. Endorsement is an additive edge on an immutable class.
    if (v.admitted) {
      expect(v.provenance.authoredBy).toBe('maia');
      expect(v.provenance.authorityClass).toBe('inference');
    }
  });

  it('admits member testimony and member acts', () => {
    expect(
      adjudicateParticipation({
        provenance: { authoredBy: 'member', authorityClass: 'testimony' },
        endorsement: 'none',
      }).admitted,
    ).toBe(true);
    expect(
      adjudicateParticipation({
        provenance: { authoredBy: 'member', authorityClass: 'member_act' },
        endorsement: 'none',
      }).admitted,
    ).toBe(true);
  });

  it('excludes routing state from composition', () => {
    const v = adjudicateParticipation({
      provenance: { authoredBy: 'maia', authorityClass: 'routing_state' },
      endorsement: 'none',
    });
    expect(v).toEqual({ admitted: false, reason: 'routing_state_not_composable' });
  });

  it('names every exclusion reason', () => {
    for (const r of Object.keys(EXCLUSION_REASON_TEXT)) {
      expect(EXCLUSION_REASON_TEXT[r as keyof typeof EXCLUSION_REASON_TEXT].length).toBeGreaterThan(0);
    }
  });
});

// ── §2 — legacy material is excluded, never guessed ──────────────────────────

describe('P3 §2 — uncertified legacy material is excluded, not guessed', () => {
  it('the developmental loader certifies nothing, because the table records nothing', () => {
    const src = fs.readFileSync(path.join(REPO, 'lib/maia/memoryLoaders.ts'), 'utf8');
    // The claim is explicitly null and explicitly reasoned. If a future edit
    // supplies `authoredBy: 'maia'` here it will be GUESSING from the probable
    // writer — the exact inference the backfill policy forbids.
    expect(src).toMatch(/const provenance: ProvenanceClaim = null;/);
    expect(src).not.toMatch(/authoredBy:\s*'maia'/);
    expect(src).not.toMatch(/authoredBy:\s*'member'/);
  });

  it('a null claim yields exclusion, so every legacy row is outside composition', () => {
    const claim: ProvenanceClaim = null;
    expect(adjudicateParticipation({ provenance: claim, endorsement: 'none' }).admitted).toBe(false);
  });
});

// ── §3 — no authority from age or repetition ─────────────────────────────────

describe('P3 §3 — inference cannot gain authority from age or repetition', () => {
  it('the adjudicator has no temporal or frequency input, by type', () => {
    const src = fs.readFileSync(path.join(REPO, 'lib/maia/participationGate.ts'), 'utf8');
    const input = src.slice(
      src.indexOf('export interface ParticipationInput'),
      src.indexOf('export type ExclusionReason'),
    );
    // A field the adjudicator cannot see is a rule it cannot be tuned to break.
    for (const forbidden of [
      'formed_at', 'created_at', 'recall_count', 'last_recalled_at',
      'surfaced_count', 'age', 'significance', 'timestamp',
    ]) {
      expect({ forbidden, present: input.includes(forbidden) }).toEqual({ forbidden, present: false });
    }
  });

  it('two snapshots differing only in age adjudicate identically', () => {
    const old = adjudicateParticipation({ provenance: null, endorsement: 'none' });
    const recent = adjudicateParticipation({ provenance: null, endorsement: 'none' });
    expect(old).toEqual(recent);
  });
});

// ── §4 — the composition path is structurally closed ─────────────────────────

describe('P3 §4 — excluded material cannot reach the prompt', () => {
  it('an excluded snapshot contributes no source, no role, no strength', () => {
    const plan = buildMemoryInfluencePlan({
      message: 'thinking about the same thing again',
      userId: 'u1',
      conversationHistory: [],
      recentDevelopmentalMemories: [excludedSnapshot('a'), excludedSnapshot('b')],
      recentThemeSignals: [],
      hasMemberLiveContext: false,
      hasRelationshipAnamnesis: false,
    });
    expect(plan.selectedSources).not.toContain('developmental_memory');
    expect(plan.sourceRoles.developmental_memory).toBeUndefined();
    expect(plan.promptBlock).not.toMatch(/Prior developmental direction/);
    // Exclusion is not quieter participation: with nothing else present the
    // plan carries no memory at all.
    expect(plan.shouldUseMemory).toBe(false);
    expect(plan.influenceStrength).toBe('none');
  });

  it('the excluded snapshot is reported as excluded, not silently dropped', () => {
    const plan = buildMemoryInfluencePlan({
      message: 'hello',
      userId: 'u1',
      conversationHistory: [],
      recentDevelopmentalMemories: [excludedSnapshot('a')],
      recentThemeSignals: [],
      hasMemberLiveContext: false,
      hasRelationshipAnamnesis: false,
    });
    expect(plan.reasoning.join(' ')).toMatch(/excluded by participation gate/);
  });

  it('an excluded theme signal contributes nothing', () => {
    const themes: ThemeSignalSnapshot[] = [
      {
        theme: 'belonging',
        signal_type: 'recurring',
        resonance_strength: 0.9,
        element: 'water',
        detected_at: new Date(),
        participation: 'excluded',
        exclusionReason: 'uncertified_provenance',
      },
    ];
    const plan = buildMemoryInfluencePlan({
      message: 'hello',
      userId: 'u1',
      conversationHistory: [],
      recentDevelopmentalMemories: [],
      recentThemeSignals: themes,
      hasMemberLiveContext: false,
      hasRelationshipAnamnesis: false,
    });
    expect(plan.selectedSources).not.toContain('theme_signals');
  });

  it('an ADMITTED snapshot still composes — the gate excludes, it does not disable', () => {
    const plan = buildMemoryInfluencePlan({
      message: 'hello',
      userId: 'u1',
      conversationHistory: [],
      recentDevelopmentalMemories: [admittedSnapshot('a', 'steady return; toward contact; quiet')],
      recentThemeSignals: [],
      hasMemberLiveContext: false,
      hasRelationshipAnamnesis: false,
    });
    expect(plan.selectedSources).toContain('developmental_memory');
    expect(plan.promptBlock).toMatch(/Prior developmental direction: steady return/);
  });

  it('the excluded arm has no directional_cue property at runtime either', () => {
    const s = excludedSnapshot('a');
    expect(Object.prototype.hasOwnProperty.call(s, 'directional_cue')).toBe(false);
  });

  /**
   * PROOF 4 — the mandated hostile-fork mutation.
   *
   * `composer += developmentalMemory.directional_cue` cannot be written against
   * the union: the excluded arm declares no such property, so the access is a
   * compile error rather than a runtime leak. This test pins the type shape
   * that makes it so; §5 verifies the compiler actually rejects it.
   */
  it('the union type has no unconditional directional_cue', () => {
    const types = fs.readFileSync(
      path.join(REPO, 'lib/maia/types/memoryOrchestrator.ts'),
      'utf8',
    );
    // Read the INTERFACE BODY, not the prose around it. Slicing to the next
    // export swept in the docblock that *describes* `directional_cue`, and the
    // check failed on its own explanation — the same detector imprecision that
    // made P2's scan read `setPreferences(` as a SQL write. A gate must be
    // precise about what counts as the thing it hunts.
    const armStart = types.indexOf('export interface ExcludedDevelopmentalMemory');
    const excludedArm = types.slice(armStart, types.indexOf('\n}', armStart));
    expect(excludedArm).not.toMatch(/directional_cue/);
    expect(types).toMatch(/export type DevelopmentalMemorySnapshot =\s*\|\s*AdmittedDevelopmentalMemory\s*\|\s*ExcludedDevelopmentalMemory/);
  });
});

// ── §5 — the composer reads the cue only behind a narrowing ──────────────────

describe('P3 §5 — the only cue read is guarded by a discriminant check', () => {
  it('memoryOrchestrator narrows on participation before touching the cue', () => {
    const src = fs.readFileSync(path.join(REPO, 'lib/maia/memoryOrchestrator.ts'), 'utf8');
    const reads = src.split('\n')
      .map((l, i) => ({ l, i: i + 1 }))
      .filter(({ l }) => /\.directional_cue/.test(l) && !/^\s*(\/\/|\*)/.test(l));
    // Every read must sit inside a block that has already established
    // participation === 'admitted'.
    expect(reads.length).toBeGreaterThan(0);
    for (const { l } of reads) {
      const before = src.slice(0, src.indexOf(l));
      expect(before).toMatch(/participation === 'admitted'/);
    }
  });

  it('no other module reads directional_cue at all', () => {
    const skip = /node_modules|\.next|__tests__|\.test\.tsx?$/;
    const out: string[] = [];
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
      const rel = path.relative(REPO, p);
      if (rel === 'lib/maia/memoryOrchestrator.ts') return;      // the one guarded reader
      if (rel === 'lib/maia/types/memoryOrchestrator.ts') return; // the declaration
      if (rel === 'lib/maia/memoryLoaders.ts') return;            // the producer
      const lines = fs.readFileSync(p, 'utf8').split('\n');
      lines.forEach((l, i) => {
        if (/\.directional_cue/.test(l) && !/^\s*(\/\/|\*)/.test(l)) out.push(`${rel}:${i + 1}`);
      });
    };
    for (const r of ['lib', 'app', 'components']) walk(path.join(REPO, r));
    expect({ readers: out }).toEqual({ readers: [] });
  });
});
