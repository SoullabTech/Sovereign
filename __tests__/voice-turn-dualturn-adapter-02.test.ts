import { adaptDualTurnFrame } from '@/lib/voice/predictors/dualTurnAdapter';

const model = {
  provider: 'dualturn' as const,
  modelId: 'anyreach-ai/dualturn-endpointing',
  modelVersion: 'c3860ed71210fe0144af35af340fd7a4dec3d2d3',
  weightLicense: 'Apache-2.0; base Mimi CC-BY-4.0',
};

describe('TURN-02 DualTurn evidence adapter', () => {
  it('maps EOT directly to yield and future-user activity to continuation', () => {
    const frame = adaptDualTurnFrame({ eot: 0.91, userVad: 0.2, userFutureActivity: [0.1, 0.75, 0.3, 0.2] }, 2400, model);
    expect(frame).toEqual({ atMs: 2400, acousticContinue: 0.75, acousticYield: 0.91, vad: 0.2, model });
  });

  it('preserves conflicting evidence for the arbiter rather than resolving it here', () => {
    const frame = adaptDualTurnFrame({ eot: 0.95, userFutureActivity: [0.8, 0.7, 0.2, 0.1] }, 1, model);
    expect(frame.acousticYield).toBe(0.95);
    expect(frame.acousticContinue).toBe(0.8);
  });

  it('fails closed on malformed probabilities or wrong provider identity', () => {
    expect(() => adaptDualTurnFrame({ eot: 1.1, userFutureActivity: [0, 0, 0, 0] }, 0, model)).toThrow(/eot/);
    expect(() => adaptDualTurnFrame({ eot: 0.1, userFutureActivity: [0, -0.1, 0, 0] }, 0, model)).toThrow(/fvad/);
    expect(() => adaptDualTurnFrame({ eot: 0.1, userFutureActivity: [0, 0, 0, 0] }, 0, { ...model, provider: 'other' })).toThrow(/provider=dualturn/);
  });
});
