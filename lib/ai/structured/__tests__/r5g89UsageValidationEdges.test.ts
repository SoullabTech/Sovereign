/**
 * R5G.89 — supplemental edge/negative checks for a Class A REVIEW CANDIDATE.
 * All payloads are fictional; injected clients exercise the actual adapter
 * with no model/network/credential. Exact real-SDK localhost falsifiers from
 * the independent R5G.88 source remain unchanged and run in the same CI job.
 */
import { inspect } from 'node:util';
import Anthropic from '@anthropic-ai/sdk';
import { anthropicStructuredProvider } from '../anthropicStructuredAdapter';
import { StructuredDispatchError, dispatchOf } from '../dispatch';
import type { StructuredRequest } from '../types';

const PRIVATE = 'R5G89_FICTIONAL_PRIVATE_TEXT_NEVER_LOGGED';
const request: StructuredRequest = {
  model: 'fictional-model-local-only',
  maxTokens: 16,
  system: 'Fictional system.',
  messages: [{ role: 'user', content: 'Only invented words.' }],
};
function fakeMessage(usage: unknown) {
  return {
    model: request.model,
    content: [{ type: 'text', text: 'Only invented answer.' }],
    stop_reason: 'end_turn',
    usage,
  };
}
function withFakeClient(usage: unknown, stream = false) {
  const message = fakeMessage(usage);
  const create = jest.fn().mockResolvedValue(message);
  const finalMessage = jest.fn().mockResolvedValue(message);
  const streamFn = jest.fn().mockReturnValue({ finalMessage });
  const client = { messages: { create, stream: streamFn } } as unknown as Anthropic;
  const provider = anthropicStructuredProvider({ client });
  return { provider, create, finalMessage, streamFn, req: stream
    ? { ...request, execution: { completion: 'long-running' as const } }
    : request };
}
async function expectRedactedObserved(provider: ReturnType<typeof anthropicStructuredProvider>, req: StructuredRequest) {
  let err: unknown = null;
  try { await provider.execute(req); } catch (e) { err = e; }
  expect(err).toBeInstanceOf(StructuredDispatchError);
  const wrapped = err as StructuredDispatchError;
  expect(dispatchOf(wrapped)).toBe('response_observed');
  expect(wrapped.message).toBe('structured_provider_error_redacted');
  expect('original' in wrapped).toBe(false);
  expect('cause' in wrapped).toBe(false);
  expect(inspect(wrapped, { depth: 9, showHidden: true })).not.toContain(PRIVATE);
  expect(JSON.stringify(Object.getOwnPropertyDescriptors(wrapped))).not.toContain(PRIVATE);
}

describe('R5G.89 optional edges — do not invent zero usage', () => {
  test('positive true 0/0 is valid and remains numeric zero', async () => {
    const { provider, create, req } = withFakeClient({ input_tokens: 0, output_tokens: 0 });
    const result = await provider.execute(req);
    expect(result.usage).toEqual({ inputTokens: 0, outputTokens: 0 });
    expect(result.provenance.modelAgreement).toBe('agreed');
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0][1]).toEqual({ maxRetries: 0 });
  });

  test('positive long-running full usage retains real-valued token counts', async () => {
    const { provider, finalMessage, streamFn, req } = withFakeClient({
      input_tokens: 20, output_tokens: 8,
    }, true);
    const result = await provider.execute(req);
    expect(result.usage).toEqual({ inputTokens: 20, outputTokens: 8 });
    expect(finalMessage).toHaveBeenCalledTimes(1);
    expect(streamFn.mock.calls[0][1]).toEqual({ maxRetries: 0 });
  });

  test.each([NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'invalid JS runtime count %s cannot become successful validated usage',
    async (invalid) => {
      const { provider, req } = withFakeClient({
        input_tokens: invalid, output_tokens: 8,
      });
      await expectRedactedObserved(provider, req);
    },
  );

  test('a throwing usage getter cannot echo fictional author text or erase observed receipt', async () => {
    const message = Object.defineProperty({
      model: request.model, content: [], stop_reason: 'end_turn',
    }, 'usage', {
      get() { throw new Error(PRIVATE); },
    });
    const client = { messages: {
      create: jest.fn().mockResolvedValue(message),
    } } as unknown as Anthropic;
    const provider = anthropicStructuredProvider({ client });
    await expectRedactedObserved(provider, request);
  });

  test('stream finalMessage with absent usage refuses after response was observed', async () => {
    const { provider, finalMessage, req } = withFakeClient(undefined, true);
    await expectRedactedObserved(provider, req);
    expect(finalMessage).toHaveBeenCalledTimes(1);
  });

  test('safe integer upper bound remains a valid measured count', async () => {
    const { provider, req } = withFakeClient({
      input_tokens: Number.MAX_SAFE_INTEGER, output_tokens: 0,
    });
    const result = await provider.execute(req);
    expect(result.usage).toEqual({
      inputTokens: Number.MAX_SAFE_INTEGER, outputTokens: 0,
    });
  });
});
