/**
 * Class A SECURITY NEGATIVE PROOF ONLY — expected RED on original policy.
 * The real policy and neutral router are executed without an SDK mock:
 * invalid/sovereign modes must refuse BEFORE lazy provider initialization.
 * Invented marker, no credentials, network, Work, or external inference.
 */
import { resolveStructuredMode } from '../policy';
import { runStructured } from '../router';
import type { StructuredRequest } from '../types';

const PRIVATE_MARKER = 'FICTIONAL_WRITER_PRIVATE_NEVER_IN_REFUSAL_711';
const req: StructuredRequest = {
  model: 'fictional-model-no-inference',
  system: 'Invented system',
  messages: [{ role: 'user', content: 'Invented question' }],
  maxTokens: 8,
};
const oldMode = process.env.MAIA_INFERENCE_MODE;
afterEach(() => {
  if (oldMode === undefined) delete process.env.MAIA_INFERENCE_MODE;
  else process.env.MAIA_INFERENCE_MODE = oldMode;
});

describe('Class A HOLD: invalid mode refuses without echoing untrusted configuration', () => {
  test('EXPECTED RED: policy refusal has no arbitrary raw invalid-mode text', () => {
    const result = resolveStructuredMode('not-a-mode_' + PRIVATE_MARKER);
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.refusal).toBe('invalid_inference_mode');
    // CURRENT UNSAFE SOURCE: JSON.stringify(v) is returned in detail.
    expect(JSON.stringify(result)).not.toContain(PRIVATE_MARKER);
  });

  test('EXPECTED RED: production runStructured refuses without returning raw invalid-mode text', async () => {
    process.env.MAIA_INFERENCE_MODE = 'not-a-mode_' + PRIVATE_MARKER;
    const outcome = await runStructured(req);
    expect(outcome.ok).toBe(false);
    expect(outcome.ok === false && outcome.refusal).toBe('invalid_inference_mode');
    expect('dispatch' in outcome).toBe(false);
    expect(JSON.stringify(outcome)).not.toContain(PRIVATE_MARKER);
  });

  test.each(['sovereign', 'local_only'] as const)(
    'GREEN control: %s still refuses before any provider', async (mode) => {
      process.env.MAIA_INFERENCE_MODE = mode;
      const outcome = await runStructured(req);
      expect(outcome).toMatchObject({
        ok: false, refusal: 'structured_inference_unavailable',
      });
      expect('dispatch' in outcome).toBe(false);
    },
  );
});
