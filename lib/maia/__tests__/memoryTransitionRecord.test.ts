/**
 * Memory Transition Record — Sprint 1 (Truth Layer) unit tests.
 *
 * Locks the three hard rules from the founder-authorized scope (2026-08-04):
 *   1. Reasons are sentences describing decisions — never numeric scores.
 *   2. Unknown is a valid state — unmeasured counts are null, never guessed;
 *      injected_count is null for every source until injection observability exists.
 *   3. The record carries the versioned selection policy, so a future policy
 *      change is visible as a version change, never a silent drift.
 *
 * Pure-builder tests only — no DB. Persistence is fire-and-forget by design
 * and deliberately untested here (observability must never block conversation).
 */
import {
  buildTransitionRecords,
  looksLikeScore,
  type TransitionInputs,
} from '../memoryTransitionRecord';
import {
  MEMORY_SELECTION_POLICY_VERSION,
  OPERATIONAL_CONTINUITY_DECLARATION,
} from '../memorySelectionPolicy';

function inputs(overrides: Partial<TransitionInputs> = {}): TransitionInputs {
  return {
    memberId: 'member-1',
    sessionId: 'session-1',
    atoms: { retrieved: 8, offered: 8 },
    conversational: { retrieved: 6, offered: 6 },
    episodic: { retrieved: 2, offered: 2 },
    developmental: { retrieved: 3, offered: 3 },
    ...overrides,
  };
}

describe('buildTransitionRecords', () => {
  it('produces one record per memory source, all carrying the policy version', () => {
    const records = buildTransitionRecords(inputs(), { stored: 133, eligible: 128 });
    expect(records.map((r) => r.sourceType).sort()).toEqual([
      'conversational',
      'developmental',
      'episodic',
      'member_memory_atoms',
    ]);
    for (const r of records) {
      expect(r.selectionPolicyVersion).toBe(MEMORY_SELECTION_POLICY_VERSION);
    }
  });

  it('makes the ELIGIBLE→OFFERED gap visible for atoms (the invisible transition)', () => {
    const records = buildTransitionRecords(inputs(), { stored: 133, eligible: 128 });
    const atoms = records.find((r) => r.sourceType === 'member_memory_atoms')!;
    expect(atoms.availableCount).toBe(133);
    expect(atoms.eligibleCount).toBe(128);
    expect(atoms.retrievedCount).toBe(8);
    expect(atoms.offeredCount).toBe(8);
  });

  it('rule 2 — records unknown as null, never a guess', () => {
    // Count query failed → atom available/eligible unknown.
    const records = buildTransitionRecords(inputs(), null);
    const atoms = records.find((r) => r.sourceType === 'member_memory_atoms')!;
    expect(atoms.availableCount).toBeNull();
    expect(atoms.eligibleCount).toBeNull();
    // Non-atom sources have no availability measurement in Sprint 1.
    const conv = records.find((r) => r.sourceType === 'conversational')!;
    expect(conv.availableCount).toBeNull();
    expect(conv.eligibleCount).toBeNull();
    // Injection is tier-dependent and unobserved at this layer — null everywhere.
    for (const r of records) {
      expect(r.injectedCount).toBeNull();
      expect(r.selectionReasons.some((s) => /unknown is recorded as null/i.test(s))).toBe(true);
    }
  });

  it('rule 1 — every reason is a descriptive sentence, never a score', () => {
    const records = buildTransitionRecords(inputs(), { stored: 133, eligible: 128 });
    for (const r of records) {
      expect(r.selectionReasons.length).toBeGreaterThan(0);
      for (const reason of r.selectionReasons) {
        expect(looksLikeScore(reason)).toBe(false);
        // Sentences, not labels: multi-word prose ending in a period.
        expect(reason.trim().endsWith('.')).toBe(true);
        expect(reason.split(/\s+/).length).toBeGreaterThan(4);
      }
    }
  });

  it('records formatter suppression as a stated decision, not a silent drop', () => {
    const records = buildTransitionRecords(
      inputs({
        atoms: { retrieved: 8, offered: 0 },
        conversational: { retrieved: 6, offered: 0 },
      }),
      { stored: 133, eligible: 128 },
    );
    const atoms = records.find((r) => r.sourceType === 'member_memory_atoms')!;
    expect(atoms.selectionReasons.some((s) => /not offered|no atoms block/i.test(s))).toBe(true);
    const conv = records.find((r) => r.sourceType === 'conversational')!;
    expect(conv.selectionReasons.some((s) => /suppressed/i.test(s))).toBe(true);
  });

  it('carries the operational-continuity declaration on the conversational source', () => {
    const records = buildTransitionRecords(inputs(), null);
    const conv = records.find((r) => r.sourceType === 'conversational')!;
    expect(conv.selectionReasons).toContain(OPERATIONAL_CONTINUITY_DECLARATION);
  });
});

describe('looksLikeScore', () => {
  it('flags the named anti-patterns', () => {
    expect(looksLikeScore('Importance: 0.87')).toBe(true);
    expect(looksLikeScore('relevance = 0.9')).toBe(true);
    expect(looksLikeScore('memory rank: 3')).toBe(true);
  });

  it('accepts decision sentences that merely contain numbers', () => {
    expect(
      looksLikeScore('Cap applied: the first 8 atoms in policy order enter; remaining eligible atoms are not offered this turn.'),
    ).toBe(false);
  });
});
