import { computeTranscriptShadow } from '../transcriptShadow';

const t = (id: string, role: 'user' | 'assistant', content: string, createdAt: string) =>
  ({ id, role, content, createdAt });

const standing = (result: ReturnType<typeof computeTranscriptShadow>, id: string) =>
  result.field.standing.find((item) => item.objectId === `turn:${id}`)!;

describe('shadow transcript adapter', () => {
  test('explicit member confirmation adopts the preceding MAIA turn without rewriting origin', () => {
    const result = computeTranscriptShadow([
      t('u1', 'user', 'what was that phrase?', '2026-09-15T20:16:44.000Z'),
      t('a1', 'assistant', 'You said: the silver cedar.', '2026-09-15T20:16:49.000Z'),
      t('u2', 'user', 'that is exactly it. MAIA!', '2026-09-15T20:17:25.000Z'),
    ], 'session-A');

    expect(standing(result, 'a1').useAs).toBe('adopted');
    expect(standing(result, 'a1').origin).toBe('maia');
  });

  test('explicit restart protest contests the preceding MAIA turn', () => {
    const result = computeTranscriptShadow([
      t('u1', 'user', 'the silver cedar', '2026-09-16T14:46:41.000Z'),
      t('a1', 'assistant', 'What does it hold for you?', '2026-09-16T14:46:48.000Z'),
      t('u2', 'user', 'I already told you', '2026-09-16T14:46:57.000Z'),
    ], 'session-B');

    expect(standing(result, 'a1').useAs).toBe('unresolved');
    expect(standing(result, 'u2').useAs).toBe('established');
  });
  test('ordinary member continuation does not silently adopt MAIA interpretation', () => {
    const result = computeTranscriptShadow([
      t('u1', 'user', 'I am thinking about silver cedar.', '2026-09-16T14:43:12.000Z'),
      t('a1', 'assistant', 'Perhaps it represents resilience.', '2026-09-16T14:43:17.000Z'),
      t('u2', 'user', 'It feels ancient and medicinal.', '2026-09-16T14:43:51.000Z'),
    ], 'session-C');

    expect(standing(result, 'a1').useAs).toBe('provisional');
    expect(standing(result, 'u2').useAs).toBe('established');
  });
});

// Ambiguous backward gestures must not manufacture antecedent identity.
describe('standing-act antecedent ambiguity', () => {
  test('multi-unit MAIA target is not adopted or contested as a whole turn', () => {
    const result = computeTranscriptShadow([
      t('u1', 'user', 'what was that phrase?', '2026-09-15T20:16:44.000Z'),
      t('a1', 'assistant', 'You said: the silver cedar. Does that sound like the one?', '2026-09-15T20:16:49.000Z'),
      t('u2', 'user', 'that is exactly it. MAIA!', '2026-09-15T20:17:25.000Z'),
    ], 'session-D');

    expect(standing(result, 'a1').useAs).toBe('provisional');
    expect(result.ambiguousStandingActs).toEqual([
      expect.objectContaining({ predicateCandidate: 'CONFIRMS', reason: 'multi-unit-target' }),
    ]);
  });
});
