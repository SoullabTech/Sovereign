/**
 * R5G.85 CLASS A NEGATIVE TEST — intentionally RED if a complete request body
 * reached the fictional server but the SDK classifies a subsequent socket
 * reset as "no_response_observed" instead of "unknown".
 *
 * Review-only, no production provider, no secret, no author manuscript.
 * The only transport is an injected fetch restricted to 127.0.0.1.
 * Do not weaken this test or use its failure to approve a source-pin move.
 */
import Anthropic from '@anthropic-ai/sdk';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { inspect } from 'node:util';
import { anthropicStructuredProvider } from '../anthropicStructuredAdapter';
import { StructuredDispatchError, dispatchOf } from '../dispatch';
import type { StructuredRequest } from '../types';

jest.setTimeout(30000);
const FICTIONAL = 'R5G85_FICTIONAL_WRITING_MUST_NOT_APPEAR_009';
const req: StructuredRequest = {
  model: 'fictional-model-no-provider',
  system: 'Fiction only.',
  messages: [{ role: 'user', content: FICTIONAL }],
  maxTokens: 8,
};

type Reply = 'disconnect_after_receipt' | 'http_503';
async function withLoopback(
  reply: Reply,
  check: (client: Anthropic, seen: unknown[]) => Promise<void>,
): Promise<void> {
  const seen: unknown[] = [];
  const server = createServer(async (incoming: IncomingMessage, response: ServerResponse) => {
    const chunks: Buffer[] = [];
    try {
      for await (const chunk of incoming) chunks.push(Buffer.from(chunk));
      const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      seen.push(parsed); // **the fictional server has accepted the COMPLETE body**
      if (reply === 'disconnect_after_receipt') {
        // No HTTP response: simulate a peer reset after receiving the request.
        // "No response observed" does NOT prove "nothing crossed".
        incoming.socket.destroy();
        return;
      }
      response.writeHead(503, { 'content-type': 'application/json' });
      response.end(JSON.stringify({
        type: 'error',
        error: { type: 'overloaded_error', message: 'fictional-status' },
      }));
    } catch {
      if (!response.headersSent) {
        response.writeHead(500, { 'content-type': 'application/json' });
      }
      response.end(JSON.stringify({
        type: 'error', error: { type: 'api_error', message: 'fictional' },
      }));
    }
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const baseURL = 'http://127.0.0.1:' + (server.address() as AddressInfo).port;
  const localOnly: typeof fetch = (input, init) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    if (url.origin !== baseURL) throw new Error('External HTTP forbidden in fictional test');
    return fetch(input, init);
  };
  const client = new Anthropic({
    apiKey: 'R5G85_FAKE_NO_REAL_PROVIDER_KEY',
    baseURL, fetch: localOnly, maxRetries: 2, timeout: 5000,
  });
  try {
    await check(client, seen);
  } finally {
    server.closeAllConnections?.();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

async function fail(client: Anthropic): Promise<StructuredDispatchError> {
  let error: unknown;
  try { await anthropicStructuredProvider({ client }).execute(req); }
  catch (caught) { error = caught; }
  expect(error).toBeInstanceOf(StructuredDispatchError);
  const e = error as StructuredDispatchError;
  expect(e.message).toBe('structured_provider_error_redacted');
  expect(inspect(e, { showHidden: true, depth: 5 })).not.toContain(FICTIONAL);
  return e;
}

describe('R5G.85 negative: crossing versus absence of an HTTP response', () => {
  it('CONTROL: completed HTTP error response is response_observed', async () => {
    await withLoopback('http_503', async (client, seen) => {
      const e = await fail(client);
      expect(seen).toHaveLength(1);
      expect(e.status).toBe(503);
      expect(dispatchOf(e)).toBe('response_observed');
    });
  });

  it('EXPECTED RED: peer accepted complete body then reset; arrival is uncertain to client, not proven absent', async () => {
    await withLoopback('disconnect_after_receipt', async (client, seen) => {
      const e = await fail(client);
      // Server observed the full body; no HTTP response crossed back.
      expect(seen).toHaveLength(1);
      expect((seen[0] as { messages: { content: string }[] }).messages[0].content)
        .toBe(FICTIONAL);
      // A failed transport after send must not grant a "did not cross" receipt.
      expect(dispatchOf(e)).toBe('unknown');
    });
  });
});
