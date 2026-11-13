/** @jest-environment node */
/**
 * Tier 1 of the "how do I…" evaluation (scripts/eval/studio-guide/questions.ts): what MAIA is given can answer every question.
 * A question whose expected control is missing from her guide fails here before any model is asked.
 */
import { GUIDE_QUESTIONS } from '@/scripts/eval/studio-guide/questions';
import { studioGuideInstruction } from '../studioGuide';

describe('the guide MAIA is given can answer every evaluation question', () => {
  it('has about 25 questions or more, with unique ids', () => {
    expect(GUIDE_QUESTIONS.length).toBeGreaterThanOrEqual(25);
    expect(new Set(GUIDE_QUESTIONS.map((q) => q.id)).size).toBe(GUIDE_QUESTIONS.length);
  });

  it.each(GUIDE_QUESTIONS.map((q) => [q.id, q]))('%s', (_id, q) => {
    const guide = studioGuideInstruction({ sanctuary: q.sanctuary === true, runtime: { developStage: true, autoRead: true, proGate: false, exportsCertified: false, ...(q.runtime ?? {}) } });
    for (const group of q.mustName ?? []) expect(group.some((g) => guide.includes(g))).toBe(true);
    for (const bad of q.mustNot ?? []) if (typeof bad === 'string') expect(guide).not.toContain(bad);
  });

  it('the check can fail: a control the guide does not have is not found', () => {
    expect(studioGuideInstruction().includes('Track changes')).toBe(false);
  });
});
