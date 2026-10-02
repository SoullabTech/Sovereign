import {
  writerCorrectionContext,
  WRITER_CORRECTION_KINDS,
} from '../writerCorrections';

describe('writer correction succession', () => {
  it('keeps the prior MAIA claim visible while naming the writer correction as current', () => {
    const text = writerCorrectionContext([{
      id: 'c1', workId: 'w1', threadId: 't1', maiaTurnIndex: 3,
      kind: 'intent',
      priorClaim: 'This passage is mainly about grief.',
      correction: 'It is about relief; the grief language is deliberate misdirection.',
      createdAt: '2026-09-29T18:00:00.000Z',
    }]);
    expect(text).toContain('MAIA previously said: This passage is mainly about grief.');
    expect(text).toContain('Writer correction / current working understanding: It is about relief');
    expect(text).toContain('without rewriting the historical turn');
    expect(text).toContain('not as automatic manuscript facts or editing permission');
  });

  it('distinguishes the six beta correction kinds rather than collapsing them into feedback', () => {
    expect(WRITER_CORRECTION_KINDS).toEqual([
      'fact', 'intent', 'interpretation_rejection', 'intentional_ambiguity',
      'developmental_revision', 'preference',
    ]);
  });
});
