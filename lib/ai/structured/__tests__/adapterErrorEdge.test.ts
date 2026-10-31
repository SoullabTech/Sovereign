/**
 * Class A privacy proof at the REAL structured provider adapter boundary.
 *
 * Invented marker only; injected fake client, no Anthropic HTTP, no SDK key,
 * no database and no member text. SDK error prototypes simulate classification
 * while rejecting the raw vendor body and its nested causes.
 */
jest.mock('@anthropic-ai/sdk', () => {
  class APIError extends Error {}
  class APIConnectionError extends Error {}
  class APIConnectionTimeoutError extends APIConnectionError {}
  class MockAnthropic {}
  Object.assign(MockAnthropic, {
    APIError, APIConnectionError, APIConnectionTimeoutError,
  });
  return { __esModule: true, default: MockAnthropic };
});

const MockAnthropic = jest.requireMock('@anthropic-ai/sdk').default as {
  APIError: { prototype: object };
  APIConnectionError: { prototype: object };
  APIConnectionTimeoutError: { prototype: object };
};
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
    ['API HTTP 400', MockAnthropic.APIError.prototype, 400, 'response_observed'],
    ['connection timeout', MockAnthropic.APIConnectionTimeoutError.prototype, undefined, 'unknown'],
    // Class A candidate: transport errors cannot prove absence of server receipt.
    // This historical expectation change requires independent ratification.
    ['ambiguous connection failure', MockAnthropic.APIConnectionError.prototype, undefined, 'unknown'],
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
    const raw = syntheticSdkError(MockAnthropic.APIError.prototype, 503);
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
    const raw = syntheticSdkError(MockAnthropic.APIError.prototype);
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
