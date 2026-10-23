/**
 * R5G84 Class A HOLD: actual locked SDK via fictional 127.0.0.1 responder.
 * No real API key, no model request, no member writing, no production network.
 * Green is NOT constitutional permission; protected SDK source remains unratified.
 */
import Anthropic from '@anthropic-ai/sdk';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { inspect } from 'node:util';
import { anthropicStructuredProvider } from '../anthropicStructuredAdapter';
import { StructuredDispatchError, dispatchOf } from '../dispatch';
import type { StructuredRequest } from '../types';

jest.setTimeout(30000);
const FAKE_PRIVATE = 'R5G84_FICTIONAL_TEXT_NEVER_RETAIN_009';
const MODEL = 'fictional-model-no-provider';
const request: StructuredRequest = {
  model: MODEL, system: 'Only fictional words.',
  maxTokens: 32,
  messages: [{ role: 'user', content: 'A fictional river flows.' }],
  tools: [{
    name: 'editorial_outcome',
    inputSchema: { type: 'object', properties: { reply: { type: 'string' } }, required: ['reply'] },
    schemaEnforcement: 'required',
  }],
  toolChoice: { type: 'tool', name: 'editorial_outcome' },
};

type Kind = '529' | '503' | '200' | 'mismatch';
async function withLocal<T>(kind: Kind, check: (client: Anthropic, requests: unknown[]) => Promise<T>): Promise<T> {
  const requests: unknown[] = [];
  const server = createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    try {
      for await (const chunk of req) chunks.push(Buffer.from(chunk));
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      requests.push({ method: req.method, path: req.url, body });
      res.setHeader('content-type', 'application/json');
      res.setHeader('request-id', 'req_r5g84_local_fictional');
      if (kind === '529' || kind === '503') {
        res.statusCode = Number(kind);
        res.end(JSON.stringify({
          type: 'error', error: { type: 'overloaded_error', message: FAKE_PRIVATE },
        }));
      } else {
        res.statusCode = 200;
        res.end(JSON.stringify({
          id: 'msg_local_fictional', type: 'message', role: 'assistant',
          model: kind === 'mismatch' ? 'different-fictional-model' : MODEL,
          content: [{ type: 'tool_use', id: 'toolu_local', name: 'editorial_outcome', input: { reply: 'A fictional suggestion.' } }],
          stop_reason: 'tool_use', stop_sequence: null,
          usage: { input_tokens: 13, output_tokens: 8 },
        }));
      }
    } catch {
      res.writeHead(500, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ type: 'error', error: { type: 'api_error', message: 'fictional' } }));
    }
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const base = 'http://127.0.0.1:' + (server.address() as AddressInfo).port;
  const onlyLocal: typeof fetch = (input, init) => {
    const target = new URL(input instanceof Request ? input.url : String(input));
    if (target.origin !== base) throw new Error('R5G84 outbound HTTP forbidden');
    return fetch(input, init);
  };
  const client = new Anthropic({
    apiKey: 'R5G84_LOCAL_BOGUS_NEVER_PRODUCTION',
    baseURL: base, fetch: onlyLocal, timeout: 8000,
    maxRetries: 2, // prove adapter's per-request override beats client defaults
  });
  try { return await check(client, requests); }
  finally {
    server.closeAllConnections?.();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
async function failure(client: Anthropic, req: StructuredRequest): Promise<StructuredDispatchError> {
  let err: unknown = null;
  try { await anthropicStructuredProvider({ client }).execute(req); }
  catch (e) { err = e; }
  expect(err).toBeInstanceOf(StructuredDispatchError);
  return err as StructuredDispatchError;
}
function redacted(e: StructuredDispatchError) {
  expect(e.message).toBe('structured_provider_error_redacted');
  expect(inspect(e, { showHidden: true, depth: 5 })).not.toContain(FAKE_PRIVATE);
  expect('original' in e).toBe(false);
  expect('cause' in e).toBe(false);
}
describe('R5G84 — real SDK loopback; review-only, no model processing', () => {
  it('positive control: SDK really retries once when explicitly permitted', async () => {
    await withLocal('529', async (client, seen) => {
      await expect(client.messages.create({
        model: MODEL, max_tokens: 8, messages: [{ role: 'user', content: 'fictional' }],
      }, { maxRetries: 1 })).rejects.toBeInstanceOf(Anthropic.APIError);
      expect(seen).toHaveLength(2);
    });
  });
  it('nonstreaming 529: exactly ONE physical call, content-free refusal and honest dispatch', async () => {
    await withLocal('529', async (client, seen) => {
      const e = await failure(client, request);
      redacted(e);
      expect(e.status).toBe(529);
      expect(dispatchOf(e)).toBe('response_observed');
      expect(seen).toHaveLength(1);
      const req = seen[0] as { method: string; path: string; body: any };
      expect(req.method).toBe('POST');
      expect(req.path?.split('?')[0]).toBe('/v1/messages');
      expect(req.body.model).toBe(MODEL);
      expect(req.body.tool_choice).toMatchObject({ name: 'editorial_outcome' });
    });
  });
  it('streaming 503: exactly ONE physical call with redacted SDK failure', async () => {
    await withLocal('503', async (client, seen) => {
      const e = await failure(client, { ...request, execution: { completion: 'long-running' } });
      redacted(e);
      expect(e.status).toBe(503);
      expect(dispatchOf(e)).toBe('response_observed');
      expect(seen).toHaveLength(1);
    });
  });
  it('real SDK JSON success preserves tool envelope, reported model and token usage', async () => {
    await withLocal('200', async (client, seen) => {
      const r = await anthropicStructuredProvider({ client }).execute(request);
      expect(seen).toHaveLength(1);
      expect(r.provenance).toMatchObject({
        model: MODEL, reportedModel: MODEL, modelAgreement: 'agreed',
      });
      expect(r.usage).toEqual({ inputTokens: 13, outputTokens: 8 });
      expect(r.content).toEqual([{
        type: 'tool_use', id: 'toolu_local', name: 'editorial_outcome',
        input: { reply: 'A fictional suggestion.' },
      }]);
    });
  });
  it('real SDK reports different model distinctly, without alias normalization', async () => {
    await withLocal('mismatch', async (client, seen) => {
      const r = await anthropicStructuredProvider({ client }).execute(request);
      expect(seen).toHaveLength(1);
      expect(r.provenance.reportedModel).toBe('different-fictional-model');
      expect(r.provenance.modelAgreement).toBe('differs');
    });
  });
});
