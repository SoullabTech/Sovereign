/**
 * CLASS A PRIVACY HOLD — executable negative tests for the EXISTING router.
 *
 * THESE ARE INTENTIONALLY RED ON THE GOVERNED CURRENT ROUTER.
 * Do not invert the assertions to make a green fixture; no runtime change
 * is authorized by this branch. See security issue #1917.
 *
 * No model call or real writer words are used. The Anthropic adapter module
 * is replaced with an injected fake to exercise the real runStructured()
 * catch paths, including a factory/load failure. A future separately
 * authorized router amendment must make both tests pass while preserving
 * exact mode policy and dispatch honesty.
 */
import type { StructuredProvider, StructuredRequest } from '../types';

const mockExecute = jest.fn();
let mockFactoryFailure = false;
const PRIVATE_MARKER = 'FICTIONAL_AUTHOR_SENTENCE_NEVER_IN_LOG_OR_RESPONSE_629';

jest.mock('../anthropicStructuredAdapter', () => ({
  anthropicStructuredProvider: (): StructuredProvider => {
    if (mockFactoryFailure) throw new Error(PRIVATE_MARKER);
    return {
      name: 'anthropic',
      execute: (req: StructuredRequest) => mockExecute(req),
    };
  },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { runStructured } = require('../router') as typeof import('../router');

const request: StructuredRequest = {
  model: 'fictional-model-never-sent',
  system: 'Fictional prompt',
  messages: [{ role: 'user', content: 'Entirely invented content.' }],
  maxTokens: 8,
};
let priorMode: string | undefined;

beforeEach(() => {
  priorMode = process.env.MAIA_INFERENCE_MODE;
  process.env.MAIA_INFERENCE_MODE = 'primary';
  mockFactoryFailure = false;
  mockExecute.mockReset();
});
afterEach(() => {
  if (priorMode === undefined) delete process.env.MAIA_INFERENCE_MODE;
  else process.env.MAIA_INFERENCE_MODE = priorMode;
  jest.restoreAllMocks();
});

describe('CLASS A HOLD: unwrapped structured router errors cannot disclose text', () => {
  test('unclassified provider Error must neither return nor log free-form text', async () => {
    mockExecute.mockRejectedValueOnce(new Error(PRIVATE_MARKER));
    const diagnostics = jest.spyOn(console, 'error').mockImplementation(() => {});
    const outcome = await runStructured(request);

    // An unwrapped error has NO proved dispatch fact: this stays unknown.
    // The failure is not permission to retry, fall back or persist a result.
    expect(outcome.ok).toBe(false);
    expect(outcome.ok === false && outcome.refusal).toBe('provider_unavailable');
    expect(outcome.ok === false && outcome.dispatch).toBe('unknown');
    expect(mockExecute).toHaveBeenCalledTimes(1);

    // CURRENT GOVERNED ROUTER FAILS THE NEXT TWO ASSERTIONS:
    // detail and preflightMessage still expose raw unwrapped err.message.
    expect(JSON.stringify(outcome)).not.toContain(PRIVATE_MARKER);
    expect(JSON.stringify(diagnostics.mock.calls)).not.toContain(PRIVATE_MARKER);
  });

  test('adapter factory/load refusal must not echo an arbitrary thrown message', async () => {
    mockFactoryFailure = true;
    const diagnostics = jest.spyOn(console, 'error').mockImplementation(() => {});
    const outcome = await runStructured(request);

    expect(mockExecute).not.toHaveBeenCalled();
    expect(outcome.ok).toBe(false);
    expect(outcome.ok === false && outcome.refusal).toBe('not_configured');
    // Refusal before adapter construction has no provider dispatch.
    expect(outcome.ok === false && outcome.dispatch).toBeUndefined();

    // CURRENT GOVERNED ROUTER RETURNS String(err) IN detail: PRIVACY HOLD.
    expect(JSON.stringify(outcome)).not.toContain(PRIVATE_MARKER);
    expect(JSON.stringify(diagnostics.mock.calls)).not.toContain(PRIVATE_MARKER);
  });
});
