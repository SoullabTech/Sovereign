/**
 * Class A NEGATIVE / intentionally red on the currently governed router.
 *
 * These tests encode five independently falsifiable gaps on unwrapped errors.
 * No runtime router change is authorized here; do not invert the assertions
 * or mark this intentionally red draft as safe to merge. See issue #1917.
 *
 * Every string is fictional. The neutral structured router is REAL; only
 * the provider adapter is mocked. NO provider, network, key, member or Work.
 */
import type { StructuredProvider, StructuredRequest } from '../types';

const mockExecute = jest.fn();
let mockFactoryFailure = false;
const PRIVATE_MARKER = 'FICTIONAL_AUTHOR_TEXT_NEVER_RETURN_OR_LOG_629';

jest.mock('../anthropicStructuredAdapter', () => ({
  anthropicStructuredProvider: (): StructuredProvider => {
    if (mockFactoryFailure) throw new Error(PRIVATE_MARKER);
    return {
      name: 'anthropic',
      execute: (req: StructuredRequest) => mockExecute(req),
    };
  },
}));

// Deliberately import AFTER Jest's adapter module mock.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { runStructured } = require('../router') as typeof import('../router');

const req: StructuredRequest = {
  model: 'fictional-model-never-sent',
  system: 'Fictional system text',
  messages: [{ role: 'user', content: 'Entirely invented text.' }],
  maxTokens: 8,
};
let originalMode: string | undefined;
beforeEach(() => {
  originalMode = process.env.MAIA_INFERENCE_MODE;
  process.env.MAIA_INFERENCE_MODE = 'primary';
  mockFactoryFailure = false;
  mockExecute.mockReset();
});
afterEach(() => {
  if (originalMode === undefined) delete process.env.MAIA_INFERENCE_MODE;
  else process.env.MAIA_INFERENCE_MODE = originalMode;
  jest.restoreAllMocks();
});

describe('Class A security HOLD: unwrapped router refuses without leaking', () => {
  test('RED: unwrapped provider Error must not reveal author text in refusal detail', async () => {
    mockExecute.mockRejectedValueOnce(new Error(PRIVATE_MARKER));
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const outcome = await runStructured(req);

    expect(outcome).toMatchObject({
      ok: false, refusal: 'provider_unavailable', dispatch: 'unknown',
    });
    expect(mockExecute).toHaveBeenCalledTimes(1);
    // CURRENT BUG: detail copies raw err.message.
    expect(JSON.stringify(outcome)).not.toContain(PRIVATE_MARKER);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('RED: unwrapped provider Error must not reveal author text in diagnostics', async () => {
    mockExecute.mockRejectedValueOnce(new Error(PRIVATE_MARKER));
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await runStructured(req);

    // CURRENT BUG: preflightMessage copies raw err.message.
    expect(JSON.stringify(spy.mock.calls)).not.toContain(PRIVATE_MARKER);
  });

  test('RED: nested untrusted name, code and type cannot enter diagnostics', async () => {
    const raw = Object.assign(new Error('fictional generic failure'), {
      name: 'name-' + PRIVATE_MARKER,
      code: 'code-' + PRIVATE_MARKER,
      cause: { code: 'cause-' + PRIVATE_MARKER },
      error: { type: 'type-' + PRIVATE_MARKER },
    });
    mockExecute.mockRejectedValueOnce(raw);
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const outcome = await runStructured(req);
    expect(outcome.ok).toBe(false);
    expect(outcome.ok === false && outcome.dispatch).toBe('unknown');
    // CURRENT BUG: name/providerErrorType/code are accepted as arbitrary
    // strings from the exception rather than a fixed safe vocabulary.
    expect(JSON.stringify(spy.mock.calls)).not.toContain(PRIVATE_MARKER);
  });

  test('RED: adapter factory/loading Error must not echo writer prose in detail', async () => {
    mockFactoryFailure = true;
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const outcome = await runStructured(req);
    expect(outcome.ok).toBe(false);
    expect(outcome.ok === false && outcome.refusal).toBe('not_configured');
    expect(outcome.ok === false && outcome.dispatch).toBeUndefined();
    expect(mockExecute).not.toHaveBeenCalled();
    // CURRENT BUG: loader catch returns String(err).
    expect(JSON.stringify(outcome)).not.toContain(PRIVATE_MARKER);
    expect(spy).not.toHaveBeenCalled();
  });

  test('RED: hostile unwrapped status getter must remain a structured refusal', async () => {
    const raw = Object.defineProperty(new Error('fictional failure'), 'status', {
      get() { throw new Error('getter-' + PRIVATE_MARKER); },
    });
    mockExecute.mockRejectedValueOnce(raw);
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // CURRENT BUG: typeof e.status can itself throw, escaping the refusal
    // path and making behavior dependent on an untrusted object's getter.
    await expect(runStructured(req)).resolves.toMatchObject({
      ok: false, refusal: 'provider_unavailable', dispatch: 'unknown',
    });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test.each(['sovereign', 'local_only'])(
    'GREEN CONTROL: %s refuses without reaching the adapter',
    async (mode) => {
      process.env.MAIA_INFERENCE_MODE = mode;
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const outcome = await runStructured(req);
      expect(outcome).toMatchObject({
        ok: false, refusal: 'structured_inference_unavailable',
      });
      expect('dispatch' in outcome).toBe(false);
      expect(mockExecute).not.toHaveBeenCalled();
      expect(spy).not.toHaveBeenCalled();
    },
  );
});
