import {
  FOUNDER_WITNESS_STEPS,
  WRITER_STUDIO_METRICS,
  WRITER_STUDIO_RELEASE_GATES,
} from '../releaseEvidence';

describe('Writer Studio stewardship evidence contract', () => {
  it('defines the complete G0-G10 release gate set exactly once', () => {
    expect(WRITER_STUDIO_RELEASE_GATES.map((gate) => gate.id)).toEqual(
      ['G0','G1','G2','G3','G4','G5','G6','G7','G8','G9','G10'],
    );
    expect(new Set(WRITER_STUDIO_RELEASE_GATES.map((gate) => gate.id)).size).toBe(11);
    expect(WRITER_STUDIO_RELEASE_GATES.every((gate) => gate.stopOnFail)).toBe(true);
  });

  it('keeps hard-red authorship/data-loss metrics explicit', () => {
    const hardRed = WRITER_STUDIO_METRICS.filter((metric) => metric.hardRed).map((metric) => metric.id);
    expect(hardRed).toEqual(['lost_writing_incidents', 'silent_mutation_incidents']);
  });

  it('makes the founder witness a first-falsifier ordinary-use walk', () => {
    expect(FOUNDER_WITNESS_STEPS.length).toBeGreaterThanOrEqual(10);
    expect(FOUNDER_WITNESS_STEPS.join(' ')).toContain('without developer tools');
    expect(FOUNDER_WITNESS_STEPS.join(' ')).toContain('first falsifier');
  });
});
