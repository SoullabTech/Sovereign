import { MAIASafetyPipeline } from '../../safety-pipeline';
import { alertSoullabTeam } from '../teenSupportIntegration';

describe('safety consequence delivery integration', () => {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

  afterAll(() => {
    errorSpy.mockRestore();
    logSpy.mockRestore();
  });

  it('exposes DELIVERY_UNAVAILABLE when the member-turn crisis path has no alert service', async () => {
    const pipeline = new MAIASafetyPipeline();

    const result = await pipeline.processMessage(
      'synthetic-member',
      'I want to kill myself',
      'synthetic-session',
      { emotionalIntensity: 1, messageCount: 1, breakthroughMoments: 0 }
    );

    expect(result.action).toBe('lock_session');
    expect(result.metadata.consequence_delivery).toEqual(
      expect.objectContaining({
        state: 'DELIVERY_UNAVAILABLE',
        witness: 'failure',
      })
    );
    expect(result.message).toContain("I can't confirm that a human has been reached");
    expect(result.message).not.toContain('connect you with immediate support');
  });

  it('returns DELIVERY_UNAVAILABLE from the unwired teen-team alert instead of implying delivery', async () => {
    const result = await alertSoullabTeam({
      userId: 'synthetic-teen',
      age: 16,
      crisisType: 'synthetic-test',
    });

    expect(result).toEqual(
      expect.objectContaining({
        state: 'DELIVERY_UNAVAILABLE',
        witness: 'failure',
      })
    );
  });
});
