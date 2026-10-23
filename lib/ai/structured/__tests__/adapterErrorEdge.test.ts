/**
 * Class A privacy proof at the REAL structured provider adapter boundary.
 *
 * Invented marker only; injected fake client, no Anthropic HTTP, no SDK key,
 * no database and no member text. SDK error prototypes simulate classification
 * while rejecting the raw vendor body and its nested causes.
 */
import Anthropic from '@anthropic-ai/sdk';
import { inspect } from 'node:util';
import { anthropicStructuredProvider } from '../anthropicStructuredAdapter';
import { StructuredDispatchError, dispatchOf } from '../dispatch';
import type { StructuredRequest } from '../types';

const PRIVATE_MARKER = 'FICTIONAL_WRITER_CONTEXT_DO_NOT_DISCLOSE_482';
const request: StructuredRequest = {
  model: 'fictional-model-not-sent',
  system: 'Fictional editorial prompt.',
  messages: [{ role: 'user', content: 'Fictional sentence.' }],
  maxTokens: 25,
};

function syntheticSdkError(
  prototype: object,
  status?: number,
): Error {
  const raw = new Error(PRIVATE_MARKER);
  Object.assign(raw, {
    response: { error: PRIVATE_MARKER },
    cause: new Error('NESTED_' + PRIVATE_MARKER),
    ...(status === undefined ? {} : { status }),
  });
  // Only instanceof classification is being tested. No SDK constructors or
  // network requests are invoked by this synthetic error object.
  Object.setPrototypeOf(raw, prototype);
  return raw;
}

function assertRedactedFailure(error: unknown, expectedDispatch: string, status?: number) {
  expect(error).toBeInstanceOf(StructuredDispatchError);
  const wrapped = error as StructuredDispatchError;
  expect(wrapped.dispatch).toBe(expectedDispatch);
  expect(dispatchOf(wrapped)).toBe(expectedDispatch);
  expect(wrapped.message).toBe('structured_provider_error_redacted');
  expect(wrapped.status).toBe(status);
  expect('original' in wrapped).toBe(false);
  expect('cause' in wrapped).toBe(false);
  expect(JSON.stringify(wrapped)).not.toContain(PRIVATE_MARKER);
  expect(inspect(wrapped, { showHidden: true, depth: 8 }))
    .not.toContain(PRIVATE_MARKER);
  expect(JSON.stringify(Object.getOwnPropertyDescriptors(wrapped)))
    .not.toContain(PRIVATE_MARKER);
}

describe('real structured Anthropic adapter: fictional delivery failures', () => {
  it.each([
    ['API HTTP 400', Anthropic.APIError.prototype, 400, 'response_observed'],
    ['connection timeout', Anthropic.APIConnectionTimeoutError.prototype, undefined, 'unknown'],
    ['connection refused', Anthropic.APIConnectionError.prototype, undefined, 'no_response_observed'],
  ] as const)('%s is classified without retaining provider text',
    async (_label, prototype, status, dispatch) => {
      const raw = syntheticSdkError(prototype, status);
      const send = jest.fn().mockRejectedValueOnce(raw);
      const client = { messages: { create: send } } as never;
      const provider = anthropicStructuredProvider({ client });
      let failure: unknown = null;
      try {
        await provider.execute(request);
      } catch (error) {
        failure = error;
      }
      assertRedactedFailure(failure, dispatch, status);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0]).toMatchObject({
        model: request.model,
        messages: request.messages,
      });
    },
  );

  it('long-running streaming failure uses the same redacted wrapper', async () => {
    const raw = syntheticSdkError(Anthropic.APIError.prototype, 503);
    const finish = jest.fn().mockRejectedValueOnce(raw);
    const stream = jest.fn().mockReturnValue({ finalMessage: finish });
    const client = { messages: { stream } } as never;
    const provider = anthropicStructuredProvider({ client });
    let failure: unknown;
    try {
      await provider.execute({
        ...request, execution: { completion: 'long-running' },
      });
    } catch (error) {
      failure = error;
    }
    assertRedactedFailure(failure, 'response_observed', 503);
    expect(stream).toHaveBeenCalledTimes(1);
    expect(finish).toHaveBeenCalledTimes(1);
  });

  it('a forged SDK status getter cannot reveal text or crash error redaction', async () => {
    const raw = syntheticSdkError(Anthropic.APIError.prototype);
    Object.defineProperty(raw, 'status', {
      get() { throw new Error('GETTER_' + PRIVATE_MARKER); },
    });
    const client = {
      messages: { create: jest.fn().mockRejectedValueOnce(raw) },
    } as never;
    const provider = anthropicStructuredProvider({ client });
    let failure: unknown;
    try {
      await provider.execute(request);
    } catch (error) {
      failure = error;
    }
    assertRedactedFailure(failure, 'unknown');
  });

  it('unrecognized thrown vendor error is redacted and dispatch remains unknown', async () => {
    const raw = syntheticSdkError(Error.prototype);
    const client = {
      messages: { create: jest.fn().mockRejectedValueOnce(raw) },
    } as never;
    const provider = anthropicStructuredProvider({ client });
    let failure: unknown;
    try {
      await provider.execute(request);
    } catch (error) {
      failure = error;
    }
    assertRedactedFailure(failure, 'unknown');
  });
});


/**
 * CLASS A INTENTIONALLY RED NEGATIVE: issue #1928.
 * This checks the real SDK default retry layer, unlike the injected
 * messages.create jest mocks above. An injected content-free fake fetch is
 * the only transport, so no outbound connection or real credential exists.
 *
 * The production adapter currently constructs an Anthropic client without
 * disabling the SDK default retries. The custom client here preserves
 * that default and illustrates why a top-level single execute call is not
 * proof of a single wire attempt. This is a falsifier, not a release test.
 */
describe('Class A intentional HOLD: implicit SDK retry truth (#1928)', () => {
  it('RED: one structured invocation must not make hidden second HTTP attempts on 503', async () => {
    const calls = jest.fn(async () => new Response(
      JSON.stringify({
        type: 'error',
        error: { type: 'api_error', message: 'FICTIONAL_503_NO_MEMBER_DATA' },
      }),
      { status: 503, headers: { 'content-type': 'application/json' } },
    ));

    // SDK created with its default retry settings; fake fetch is the ONLY
    // network entry point, and always returns a synthetic 503 in-process.
    const sdk = new Anthropic({
      apiKey: 'FICTIONAL_LOCAL_TEST_KEY_NOT_A_CREDENTIAL',
      fetch: calls as never,
    });
    const provider = anthropicStructuredProvider({ client: sdk });

    let failure: unknown;
    try {
      await provider.execute(request);
    } catch (err) {
      failure = err;
    }
    assertRedactedFailure(failure, 'response_observed', 503);
    // Expected security contract: ONE attempted request, zero silent SDK
    // retries. Currently this is intentionally RED because defaults retry.
    expect(calls).toHaveBeenCalledTimes(1);
  });
});


/**
 * CLASS A GREEN CONTROLS — SDK transport in-process only.
 * These tests prove the available no-retry mechanisms; they do NOT change
 * the still-unsafe governed production adapter and do NOT authorize dispatch.
 */
describe('Class A no-hidden-retry configuration controls (#1928)', () => {
  const testKey = 'FICTIONAL_LOCAL_KEY_NEVER_VALID';

  function fakeHttpFailure(status: number) {
    const fakeFetch = jest.fn(async () => new Response(
      JSON.stringify({
        type: 'error',
        error: { type: 'api_error', message: 'FICTIONAL_HTTP_ERROR_NO_MEMBER_DATA' },
      }),
      { status, headers: { 'content-type': 'application/json' } },
    ));
    return fakeFetch;
  }

  it.each([408, 409, 429, 503] as const)(
    'client maxRetries:0 sends exactly one normal request on HTTP %s',
    async (status) => {
      const fakeFetch = fakeHttpFailure(status);
      const sdk = new Anthropic({
        apiKey: testKey,
        maxRetries: 0,
        fetch: fakeFetch as never,
      });
      const provider = anthropicStructuredProvider({ client: sdk });

      let failure: unknown;
      try {
        await provider.execute(request);
      } catch (err) {
        failure = err;
      }
      assertRedactedFailure(failure, 'response_observed', status);
      expect(fakeFetch).toHaveBeenCalledTimes(1);
    },
  );

  it('client maxRetries:0 makes one failed connection attempt, without quoting failure text', async () => {
    const fakeFetch = jest.fn(async () => {
      throw new TypeError('FICTIONAL_CONNECTION_REFUSED_NO_MEMBER_DATA');
    });
    const sdk = new Anthropic({
      apiKey: testKey,
      maxRetries: 0,
      fetch: fakeFetch as never,
    });
    const provider = anthropicStructuredProvider({ client: sdk });
    let failure: unknown;
    try {
      await provider.execute(request);
    } catch (err) {
      failure = err;
    }
    assertRedactedFailure(failure, 'no_response_observed');
    expect(fakeFetch).toHaveBeenCalledTimes(1);
  });

  it('client maxRetries:0 makes only one streaming attempt on HTTP 503', async () => {
    const fakeFetch = fakeHttpFailure(503);
    const sdk = new Anthropic({
      apiKey: testKey,
      maxRetries: 0,
      fetch: fakeFetch as never,
    });
    const provider = anthropicStructuredProvider({ client: sdk });
    let failure: unknown;
    try {
      await provider.execute({
        ...request,
        execution: { completion: 'long-running' },
      });
    } catch (err) {
      failure = err;
    }
    assertRedactedFailure(failure, 'response_observed', 503);
    expect(fakeFetch).toHaveBeenCalledTimes(1);
  });

  it('client maxRetries:0 refuses 503 rather than silently accepting a later 200', async () => {
    const fakeFetch = jest.fn(async () => {
      if (fakeFetch.mock.calls.length === 1) {
        return new Response(
          JSON.stringify({
            type: 'error',
            error: { type: 'api_error', message: 'FICTIONAL_TEMPORARY_FAILURE' },
          }),
          { status: 503, headers: { 'content-type': 'application/json' } },
        );
      }
      return new Response(
        JSON.stringify({
          id: 'fictional-message', type: 'message', role: 'assistant',
          model: request.model,
          content: [{ type: 'text', text: 'FICTIONAL_UNREACHABLE_200' }],
          stop_reason: 'end_turn', usage: { input_tokens: 1, output_tokens: 1 },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    });
    const sdk = new Anthropic({
      apiKey: testKey,
      maxRetries: 0,
      fetch: fakeFetch as never,
    });
    const provider = anthropicStructuredProvider({ client: sdk });
    let failure: unknown;
    try {
      await provider.execute(request);
    } catch (err) {
      failure = err;
    }
    assertRedactedFailure(failure, 'response_observed', 503);
    expect(fakeFetch).toHaveBeenCalledTimes(1);
  });

  it('request-scoped maxRetries:0 overrides a retry-enabled SDK client for ordinary use', async () => {
    const fakeFetch = fakeHttpFailure(503);
    // Intentionally retain SDK defaults to simulate an injected client
    // configured elsewhere. The per-request override must still prevail.
    const sdk = new Anthropic({ apiKey: testKey, fetch: fakeFetch as never });
    let failure: unknown;
    try {
      await sdk.messages.create({
        model: request.model,
        system: request.system,
        messages: request.messages,
        max_tokens: request.maxTokens,
      } as never, { maxRetries: 0 });
    } catch (err) {
      failure = err;
    }
    expect(failure).toBeInstanceOf(Anthropic.APIError);
    expect((failure as { status: number }).status).toBe(503);
    expect(fakeFetch).toHaveBeenCalledTimes(1);
  });

  it('request-scoped maxRetries:0 overrides a retry-enabled SDK client for streaming', async () => {
    const fakeFetch = fakeHttpFailure(503);
    const sdk = new Anthropic({ apiKey: testKey, fetch: fakeFetch as never });
    let failure: unknown;
    try {
      await sdk.messages.stream({
        model: request.model,
        system: request.system,
        messages: request.messages,
        max_tokens: request.maxTokens,
      } as never, { maxRetries: 0 }).finalMessage();
    } catch (err) {
      failure = err;
    }
    expect(failure).toBeInstanceOf(Anthropic.APIError);
    expect((failure as { status: number }).status).toBe(503);
    expect(fakeFetch).toHaveBeenCalledTimes(1);
  });

  it('SDK defaults can hide an initial 503 behind a later successful synthetic 200', async () => {
    const fakeFetch = jest.fn(async () => {
      if (fakeFetch.mock.calls.length === 1) {
        return new Response(
          JSON.stringify({
            type: 'error', error: { type: 'api_error', message: 'FICTIONAL_503_FIRST' },
          }),
          { status: 503, headers: { 'content-type': 'application/json' } },
        );
      }
      return new Response(
        JSON.stringify({
          id: 'fictional-retry-message', type: 'message', role: 'assistant',
          model: request.model,
          content: [{ type: 'text', text: 'FICTIONAL_RETRY_RECOVERY' }],
          stop_reason: 'end_turn', usage: { input_tokens: 1, output_tokens: 1 },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    });
    const sdk = new Anthropic({ apiKey: testKey, fetch: fakeFetch as never });
    const result = await anthropicStructuredProvider({ client: sdk }).execute(request);
    expect(fakeFetch).toHaveBeenCalledTimes(2);
    expect(result.content[0]).toEqual({ type: 'text', text: 'FICTIONAL_RETRY_RECOVERY' });
    expect(result.provenance.modelAgreement).toBe('agreed');
  });
});
