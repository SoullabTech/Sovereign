/**
 * Security regression for provider errors that can quote a writer's content.
 * Invented marker only. NO real provider SDK, network or member data.
 *
 * The adapter is mocked, but this executes the actual structured router
 * and the actual dispatch-error wrapper. Provider errors must not reach
 * diagnostics or StructuredOutcome.detail as raw prose.
 */
import { StructuredDispatchError, type DispatchObservation } from '../dispatch';
import type { StructuredProvider, StructuredRequest } from '../types';

const executeProvider = jest.fn();
jest.mock('../anthropicStructuredAdapter', () => ({
  anthropicStructuredProvider: (): StructuredProvider => ({
    name: 'anthropic',
    execute: (req: StructuredRequest) => executeProvider(req),
  }),
}));

// Deliberately import after the provider mock, like nonFallbackable.test.ts.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { runStructured } = require('../router') as typeof import('../router');

const PRIVATE_MARKER = 'FICTIONAL_WRITER_PASSAGE_NEVER_LOG_THIS_987';
const request: StructuredRequest = {
  model: 'fictional-model-for-negative-test',
  system: 'No personal information.',
  messages: [{ role: 'user', content: 'An invented sentence.' }],
  maxTokens: 20,
};
let previousMode: string | undefined;

beforeEach(() => {
  previousMode = process.env.MAIA_INFERENCE_MODE;
  process.env.MAIA_INFERENCE_MODE = 'primary';
  executeProvider.mockReset();
});

afterEach(() => {
  if (previousMode === undefined) delete process.env.MAIA_INFERENCE_MODE;
  else process.env.MAIA_INFERENCE_MODE = previousMode;
  jest.restoreAllMocks();
});

describe('untrusted structured provider error redaction', () => {
  it.each([
    ['response_observed', 400],
    ['unknown', undefined],
    ['no_response_observed', undefined],
  ] as const)('never logs or returns private error prose (%s)', async (dispatch, status) => {
    // Simulates an API error quoting rejected tool-schema text. No API call.
    const source = Object.assign(new Error(PRIVATE_MARKER),
      status === undefined ? {} : { status });
    const wrapped = new StructuredDispatchError(
      dispatch as DispatchObservation, source,
    );
    expect(wrapped.dispatch).toBe(dispatch);
    expect(wrapped.original).toBe(source);
    expect(wrapped.message).toBe('structured_provider_error_redacted');
    expect(Object.keys(wrapped)).not.toContain('original');
    expect(JSON.stringify(wrapped)).not.toContain(PRIVATE_MARKER);
    expect(wrapped.status).toBe(status);

    executeProvider.mockRejectedValueOnce(wrapped);
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
    const result = await runStructured(request);

    expect(result).toMatchObject({
      ok: false,
      refusal: 'provider_unavailable',
      detail: 'structured_provider_error_redacted',
      dispatch,
    });
    expect(JSON.stringify(result)).not.toContain(PRIVATE_MARKER);
    expect(JSON.stringify(errorLog.mock.calls)).not.toContain(PRIVATE_MARKER);
    expect(executeProvider).toHaveBeenCalledTimes(1);
    if (status !== undefined) {
      expect(errorLog.mock.calls[0][1]).toMatchObject({ status });
      expect(errorLog.mock.calls[0][1]).not.toHaveProperty('preflightMessage');
    }
  });

  it('rejects malformed or untrusted HTTP status without exposing its message', () => {
    const err = new StructuredDispatchError('response_observed',
      Object.assign(new Error(PRIVATE_MARKER), { status: '400 private text' }));
    expect(err.status).toBeUndefined();
    expect(err.message).not.toContain(PRIVATE_MARKER);
    expect(JSON.stringify(err)).not.toContain(PRIVATE_MARKER);
  });

  it.each(['sovereign', 'local_only'])(
    'never invokes an external provider in %s mode', async (mode) => {
      process.env.MAIA_INFERENCE_MODE = mode;
      const r = await runStructured(request);
      expect(r).toMatchObject({
        ok: false,
        refusal: 'structured_inference_unavailable',
      });
      expect(executeProvider).not.toHaveBeenCalled();
    },
  );
});
