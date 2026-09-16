import { adaptMaaiMonoFrame } from '@/lib/voice/predictors/maaiVapAdapter';

const model = { provider: 'maai' as const, modelId: 'vap_mono_en_candidate', weightLicense: 'UNVERIFIED' };

describe('TURN-02 predictor port', () => {
  it('preserves MaAI p_now/p_future without inventing floor policy', () => {
    const frame = adaptMaaiMonoFrame({ p_now: 0.74, p_future: 0.61, vad: 0.9 }, 1234, model);
    expect(frame).toEqual({ atMs: 1234, pNow: 0.74, pFuture: 0.61, vad: 0.9, model });
    expect(frame).not.toHaveProperty('yield');
    expect(frame).not.toHaveProperty('continue');
  });

  it('fails closed on malformed model probabilities', () => {
    expect(() => adaptMaaiMonoFrame({ p_now: 1.2, p_future: 0.2 }, 0, model)).toThrow(/p_now/);
    expect(() => adaptMaaiMonoFrame({ p_now: 0.2, p_future: -0.1 }, 0, model)).toThrow(/p_future/);
  });

  it('requires an explicit MaAI model identity including weight license custody', () => {
    expect(() => adaptMaaiMonoFrame({ p_now: 0.2, p_future: 0.3 }, 0, { ...model, provider: 'other' })).toThrow(/provider=maai/);
  });
});
