/**
 * R5G.87 Class A DRAFT / test-only witness.
 *
 * Exercise the unmocked governed router through the real Anthropic SDK with
 * local-only guarded transport. A receiving server consumes the complete
 * FICTIONAL request body then resets the socket before replying. That is
 * ambiguous from the sender's perspective even though this fixture knows
 * the server received it. It must never be reported as proven non-arrival.
 *
 * No real endpoint, credential, model, Work, original Source or member text.
 * Green here is functional evidence, never constitutional acceptance.
 */
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { shouldConfirmCrossing } from '../../../disclosure/crossingConfirmation';
import type { StructuredRequest } from '../types';

let mockOrigin = '';
let mockConstructed = 0;
jest.mock('@anthropic-ai/sdk', () => {
  const original = jest.requireActual('@anthropic-ai/sdk');
  const ActualSDK = original.default ?? original;
  class GuardedActualSDK extends ActualSDK {
    constructor(opts: Record<string, unknown> = {}) {
      super({
        ...opts,
        apiKey: 'R5G87_FAKE_KEY_NEVER_SENT_EXTERNALLY',
        baseURL: mockOrigin,
        maxRetries: 2, // The governed adapter must override this with zero.
        timeout: 8000,
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          const url = new URL(input instanceof Request ? input.url : String(input));
          if (url.origin !== mockOrigin) throw new Error('R5G87 outbound HTTP forbidden');
          return fetch(input, init);
        },
      });
      mockConstructed += 1;
    }
  }
  return { __esModule: true, default: GuardedActualSDK };
});
// The actual router, policy and structured adapter are deliberately unmocked.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { runStructured } = require('../router') as typeof import('../router');

const FICTIONAL = 'R5G87_FICTIONAL_PASSAGE_ONLY_002';
const request: StructuredRequest = {
  model: 'fictional-model-never-contacted',
  system: 'This is invented system text.',
  maxTokens: 16,
  messages: [{ role: 'user', content: FICTIONAL }],
};

const originalMode = process.env.MAIA_INFERENCE_MODE;
afterEach(() => {
  if (originalMode === undefined) delete process.env.MAIA_INFERENCE_MODE;
  else process.env.MAIA_INFERENCE_MODE = originalMode;
  jest.restoreAllMocks();
});
jest.setTimeout(30000);

async function withResetServer(
  check: (received: Array<{ method: string | undefined; body: any }>) => Promise<void>,
): Promise<void> {
  const received: Array<{ method: string | undefined; body: any }> = [];
  const server = createServer(async (incoming, response) => {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of incoming) chunks.push(Buffer.from(chunk));
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      received.push({ method: incoming.method, body });
      // The server has now received the entire fictional body; there is
      // deliberately NO HTTP response, only a post-receipt connection reset.
      incoming.socket.destroy();
    } catch {
      // Test transport cannot turn an accidental fixture error into evidence.
      if (!response.destroyed) response.destroy();
    }
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  mockOrigin = 'http://127.0.0.1:' + (server.address() as AddressInfo).port;
  try {
    await check(received);
  } finally {
    server.closeAllConnections?.();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    mockOrigin = '';
  }
}

describe('R5G.87 full-router real SDK post-send reset, fictional localhost', () => {
  it.each(['ordinary', 'long-running'] as const)(
    '%s: response absence after completed send cannot prove non-arrival',
    async (completion) => {
      await withResetServer(async (received) => {
        process.env.MAIA_INFERENCE_MODE = 'primary';
        mockConstructed = 0;
        const logs = jest.spyOn(console, 'error').mockImplementation(() => {});
        const req = completion === 'long-running'
          ? { ...request, execution: { completion } as const }
          : request;
        const result = await runStructured(req);
        expect(result).toEqual({
          ok: false,
          refusal: 'provider_unavailable',
          detail: 'structured_provider_error_redacted',
          dispatch: 'unknown',
        });
        expect(received).toHaveLength(1); // NO hidden SDK retry.
        expect(received[0].method).toBe('POST');
        expect(received[0].body.messages[0].content).toBe(FICTIONAL);
        expect(received[0].body.model).toBe(request.model);
        expect(mockConstructed).toBe(1);
        expect(logs.mock.calls).toEqual([
          ['[structured] provider_unavailable', { dispatch: 'unknown', status: null }],
        ]);
        expect(JSON.stringify([result, logs.mock.calls])).not.toContain(FICTIONAL);
        if (result.ok === false) {
          // A conservative receipt remains attempted, not crossed or "didn't cross".
          expect(shouldConfirmCrossing({ kind: 'refusal', dispatch: result.dispatch })).toBe(false);
        }
      });
    },
  );
  it.each(['sovereign', 'local_only'] as const)(
    '%s: refuses without constructing SDK client or dispatching',
    async (mode) => {
      await withResetServer(async (received) => {
        process.env.MAIA_INFERENCE_MODE = mode;
        mockConstructed = 0;
        const result = await runStructured(request);
        expect(result).toMatchObject({
          ok: false, refusal: 'structured_inference_unavailable',
        });
        expect('dispatch' in result).toBe(false);
        expect(mockConstructed).toBe(0);
        expect(received).toHaveLength(0);
      });
    },
  );
});
