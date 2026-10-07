/**
 * AIN-STRUCTURED-INFERENCE-SEAM-01 — the ruling, driven through the PRODUCTION API.
 *
 * These used to run through an exported `__runStructuredWithPolicyForTest(req,
 * { mode, provider })`. That export was the last place a cognitive caller could
 * still choose its own inference mode, so it is gone; the tests now reach the
 * provider by mocking the adapter MODULE and the mode by setting the platform
 * variable. Neither is a callable routing path that ships.
 */

import type { StructuredProvider, StructuredRequest } from '../types';
import { StructuredDispatchError } from '../dispatch';

const execute = jest.fn();
jest.mock('../anthropicStructuredAdapter', () => ({
  anthropicStructuredProvider: (): StructuredProvider => ({
    name: 'anthropic', execute: (req: StructuredRequest) => execute(req),
  }),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { runStructured } = require('../router') as typeof import('../router');

const req: StructuredRequest = {
  model: 'claude-opus-5', system: 'S',
  messages: [{ role: 'user', content: 'q' }], maxTokens: 100,
};

function withMode<T>(mode: string | undefined, fn: () => Promise<T>): Promise<T> {
  const prev = process.env.MAIA_INFERENCE_MODE;
  if (mode === undefined) delete process.env.MAIA_INFERENCE_MODE;
  else process.env.MAIA_INFERENCE_MODE = mode;
  return fn().finally(() => {
    if (prev === undefined) delete process.env.MAIA_INFERENCE_MODE;
    else process.env.MAIA_INFERENCE_MODE = prev;
  });
}

beforeEach(() => execute.mockReset());

describe('primary: executed exactly, and never fallen back from', () => {
  it('returns the exact structured result', async () => {
    execute.mockResolvedValue({
      content: [{ type: 'tool_use', id: 't', name: 'propose_structure', input: { form: 'flat' } }],
      stopReason: 'tool_use', usage: { inputTokens: 1, outputTokens: 2 },
      provenance: {
        provider: 'anthropic', model: 'claude-opus-5',
        reportedModel: 'claude-opus-5', modelAgreement: 'agreed', latencyMs: 1,
      },
    });
    const r = await withMode(undefined, () => runStructured(req));
    expect(r.ok).toBe(true);
    expect(r.ok && r.result.content[0]).toEqual(
      { type: 'tool_use', id: 't', name: 'propose_structure', input: { form: 'flat' } });
  });

  it('a provider failure REFUSES — nothing else is called', async () => {
    execute.mockRejectedValue(new Error('529 overloaded'));
    const r = await withMode('primary', () => runStructured(req));
    /* ⭐ `dispatch: 'unknown'` is the deliberate answer for a failure the adapter
       did not classify (a bare Error carries no observation). It is the value that
       does NOT confirm a disclosure crossing — absent is never read as arrived. */
    expect(r).toEqual({
      ok: false, refusal: 'provider_unavailable', detail: '529 overloaded', dispatch: 'unknown',
    });
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('reports insufficient API credits without retrying or switching providers', async () => {
    const error = Object.assign(new Error('Your credit balance is too low to access the Anthropic API.'), { status: 400 });
    execute.mockRejectedValue(new StructuredDispatchError('response_observed', error));
    const result = await withMode('primary', () => runStructured(req));
    expect(result).toMatchObject({ ok: false, refusal: 'provider_billing_required', dispatch: 'response_observed' });
    expect(execute).toHaveBeenCalledTimes(1);
    expect('result' in result).toBe(false);
  });

  it('refuses rather than returning a degraded or templated answer', async () => {
    execute.mockRejectedValue(new Error('timeout'));
    const r = await withMode('primary', () => runStructured(req));
    expect('result' in r).toBe(false);
  });
});

describe('sovereign / local_only: refused before any provider is reached', () => {
  it.each(['sovereign', 'local_only'])('refuses in %s', async (mode) => {
    const r = await withMode(mode, () => runStructured(req));
    expect(r).toEqual({
      ok: false,
      refusal: 'structured_inference_unavailable',
      detail: `mode=${mode}: no local provider can honour a structured contract`,
    });
    /* The mode is HONOURED, not merely unserved: the vendor adapter is never
       reached, so there is no path by which Anthropic answers behind it. */
    expect(execute).not.toHaveBeenCalled();
  });
});
