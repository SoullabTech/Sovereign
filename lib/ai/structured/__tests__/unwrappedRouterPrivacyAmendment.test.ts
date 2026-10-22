/**
 * CLASS A amendment REVIEW CANDIDATE. Do not merge unless the founder and
 * governed structured-seam reviewers explicitly ratify router source+pins.
 *
 * Assertions are copied from the independent intentional-red PR #1920.
 * NO test assertions are inverted or weakened to obtain a PASS.
 * All text and sessions are fictional; no provider, network or member data.
 */
import { StructuredDispatchError } from '../dispatch';
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
  test('PRIVACY: unwrapped provider Error must not reveal author text in refusal detail', async () => {
    mockExecute.mockRejectedValueOnce(new Error(PRIVATE_MARKER));
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const outcome = await runStructured(req);

    expect(outcome).toMatchObject({
      ok: false, refusal: 'provider_unavailable', dispatch: 'unknown',
    });
    expect(mockExecute).toHaveBeenCalledTimes(1);
    // Historically observed vulnerability; must remain corrected: detail copies raw err.message.
    expect(JSON.stringify(outcome)).not.toContain(PRIVATE_MARKER);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('PRIVACY: unwrapped provider Error must not reveal author text in diagnostics', async () => {
    mockExecute.mockRejectedValueOnce(new Error(PRIVATE_MARKER));
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await runStructured(req);

    // Historically observed vulnerability; must remain corrected: preflightMessage copies raw err.message.
    expect(JSON.stringify(spy.mock.calls)).not.toContain(PRIVATE_MARKER);
  });

  test('PRIVACY: nested untrusted name, code and type cannot enter diagnostics', async () => {
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
    // Historically observed vulnerability; must remain corrected: name/providerErrorType/code are accepted as arbitrary
    // strings from the exception rather than a fixed safe vocabulary.
    expect(JSON.stringify(spy.mock.calls)).not.toContain(PRIVATE_MARKER);
  });

  test('PRIVACY: adapter factory/loading Error must not echo writer prose in detail', async () => {
    mockFactoryFailure = true;
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const outcome = await runStructured(req);
    expect(outcome.ok).toBe(false);
    expect(outcome.ok === false && outcome.refusal).toBe('not_configured');
    expect(outcome.ok === false && outcome.dispatch).toBeUndefined();
    expect(mockExecute).not.toHaveBeenCalled();
    // Historically observed vulnerability; must remain corrected: loader catch returns String(err).
    expect(JSON.stringify(outcome)).not.toContain(PRIVATE_MARKER);
    expect(spy).not.toHaveBeenCalled();
  });

  test('PRIVACY: hostile unwrapped status getter must remain a structured refusal', async () => {
    const raw = Object.defineProperty(new Error('fictional failure'), 'status', {
      get() { throw new Error('getter-' + PRIVATE_MARKER); },
    });
    mockExecute.mockRejectedValueOnce(raw);
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // Historically observed vulnerability; must remain corrected: typeof e.status can itself throw, escaping the refusal
    // path and making behavior dependent on an untrusted object's getter.
    await expect(runStructured(req)).resolves.toMatchObject({
      ok: false, refusal: 'provider_unavailable', dispatch: 'unknown',
    });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('wrapped HTTP error still carries response-observed dispatch without body', async () => {
    const wrapped = new StructuredDispatchError('response_observed',
      Object.assign(new Error(PRIVATE_MARKER), { status: 400 }));
    mockExecute.mockRejectedValueOnce(wrapped);
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const outcome = await runStructured(req);
    expect(outcome).toEqual({
      ok: false, refusal: 'provider_unavailable',
      detail: 'structured_provider_error_redacted',
      dispatch: 'response_observed',
    });
    expect(spy.mock.calls[0]).toEqual([
      '[structured] provider_unavailable',
      { dispatch: 'response_observed', status: 400 },
    ]);
    expect(JSON.stringify(spy.mock.calls)).not.toContain(PRIVATE_MARKER);
  });

  test.each(['unknown', 'no_response_observed'] as const)(
    'wrapped %s error preserves nonconfirming dispatch', async (dispatch) => {
      mockExecute.mockRejectedValueOnce(new StructuredDispatchError(
        dispatch, new Error(PRIVATE_MARKER),
      ));
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const outcome = await runStructured(req);
      expect(outcome).toMatchObject({
        ok: false, refusal: 'provider_unavailable',
        detail: 'structured_provider_error_redacted', dispatch,
      });
      expect(JSON.stringify(spy.mock.calls)).not.toContain(PRIVATE_MARKER);
      expect(spy.mock.calls[0][1]).toMatchObject({ dispatch, status: null });
    },
  );

  test('provenance cannot be forged by spoofing the wrapper prototype', async () => {
    const raw = Object.assign(new Error(PRIVATE_MARKER), {
      dispatch: 'response_observed', status: 200,
    });
    // The caller did NOT go through the trusted provider adapter or wrapper
    // constructor. instanceof alone would falsely label the raw error as
    // proof that the provider received a request.
    Object.setPrototypeOf(raw, StructuredDispatchError.prototype);
    mockExecute.mockRejectedValueOnce(raw);
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const outcome = await runStructured(req);
    expect(outcome).toMatchObject({
      ok: false, refusal: 'provider_unavailable',
      detail: 'structured_provider_error_redacted',
      dispatch: 'unknown',
    });
    expect(spy.mock.calls[0][1]).toMatchObject({
      dispatch: 'unknown', status: null,
    });
  });

  test('a minted response-observed fact cannot be changed after construction', async () => {
    const wrapped = new StructuredDispatchError('response_observed',
      Object.assign(new Error(PRIVATE_MARKER), { status: 400 }));
    // An error's delivery fact must remain the one the trusted adapter
    // classified. This mutation MUST NOT downgrade a confirmed crossing.
    try {
      Object.defineProperty(wrapped, 'dispatch', {
        value: 'no_response_observed',
      });
    } catch {
      // A frozen/nonconfigurable descriptor is the intended protection.
    }
    mockExecute.mockRejectedValueOnce(wrapped);
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const outcome = await runStructured(req);
    expect(outcome.ok === false && outcome.dispatch).toBe('response_observed');
    expect(spy.mock.calls[0][1]).toMatchObject({
      dispatch: 'response_observed', status: 400,
    });
  });

  test.each(['sovereign', 'local_only'])(
    'SOVEREIGN CONTROL: %s refuses without reaching the adapter',
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
