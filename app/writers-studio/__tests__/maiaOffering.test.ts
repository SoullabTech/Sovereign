import {
  assertNoMemberFacingScore,
  evidenceCount,
  goalProgress,
  type MaiaInsight,
  type WriterDeclaredGoal,
} from '../maiaOffering';

/**
 * The quantification rule, executable.
 *
 * The failure this guards is quiet: a `confidence` field added for internal
 * sorting is one render away from being shown to a writer as a verdict on
 * their work. By the time anyone notices, writers are writing for the number.
 */
describe('MAIA may offer a reading, never a score', () => {
  const insight: MaiaInsight = {
    id: 'i1',
    type: 'repetition',
    reading: 'The word "suddenly" carries three separate turns in chapter two.',
    evidence: [
      { expressionId: 'm1', anchor: 'p12', excerpt: 'Suddenly the door gave.' },
      { expressionId: 'm1', anchor: 'p31', excerpt: 'Suddenly she understood.' },
    ],
  };

  it('refuses a machine-authored score on an offering', () => {
    expect(() => assertNoMemberFacingScore({ ...insight, score: 62 })).toThrow(
      /machine-authored score/,
    );
  });

  /*
   * Confidence is refused HERE, at the boundary, and is legitimate upstream.
   * lib/journal/chartIntegrationService.ts persists a confidence column on
   * pattern findings and lib/consciousness/* reasons over insight.confidence
   * to decide what is worth surfacing. That is a claim about the reading, not
   * about the writing, and this guard is not a repository-wide lint — it is
   * called on what crosses to the member. See maiaOffering.ts.
   */
  it('refuses the euphemisms too — confidence, strength, quality, severity', () => {
    for (const key of ['confidence', 'strength', 'quality', 'severity', 'grade']) {
      expect(() => assertNoMemberFacingScore({ ...insight, [key]: 0.8 })).toThrow(
        /machine-authored score/,
      );
    }
  });

  it('refuses a score hidden behind a compound name', () => {
    expect(() => assertNoMemberFacingScore({ ...insight, pacingScore: 41 })).toThrow();
    expect(() => assertNoMemberFacingScore({ ...insight, overall_rating: 3 })).toThrow();
  });

  it('allows a legitimate offering through untouched', () => {
    expect(() => assertNoMemberFacingScore(insight)).not.toThrow();
  });

  it('leaves non-numeric ordering alone — a member may prioritise their own work', () => {
    expect(() => assertNoMemberFacingScore({ ...insight, priority: 'later' })).not.toThrow();
  });

  it('counts evidence as citations to open, not as strength of finding', () => {
    expect(evidenceCount(insight)).toBe(2);
  });
});

describe('Writer-declared goals may be quantified — both ends are the writer’s', () => {
  const goal: WriterDeclaredGoal = {
    id: 'g1',
    label: 'First draft',
    target: 90000,
    current: 45000,
    unit: 'words',
    declaredBy: 'member-1',
    declaredAt: '2026-08-28T00:00:00Z',
  };

  it('reports progress against the target the writer set', () => {
    expect(goalProgress(goal)).toBeCloseTo(0.5);
  });

  it('reads passing the target as done, not as exceeding a quota', () => {
    expect(goalProgress({ ...goal, current: 120000 })).toBe(1);
  });

  it('does not divide by a target of zero', () => {
    expect(goalProgress({ ...goal, target: 0 })).toBe(0);
  });
});
