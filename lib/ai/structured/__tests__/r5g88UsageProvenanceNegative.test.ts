/**
 * R5G.88 — Class A usage/accounting NEGATIVE qualification (EXPECTED RED).
 *
 * A structured provider response containing no usage fields or malformed token
 * counts must not become a truthful-seeming successful zero-token accounting
 * record. The production router, adapter and actual installed Anthropic SDK
 * execute against ONLY a local fictional 127.0.0.1 HTTP responder.
 *
 * This changes no production logic, source pin, member record or API credential.
 * These intentionally RED expectations are independent review evidence.
 */
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { StructuredRequest } from '../types';

let mockOrigin = '';
jest.mock('@anthropic-ai/sdk', () => {
  const loaded = jest.requireActual('@anthropic-ai/sdk');
  const ActualSDK = loaded.default ?? loaded;
  class LoopbackOnlySDK extends ActualSDK {
    constructor(opts: Record<string, unknown> = {}) {
      super({
        ...opts, apiKey: 'R5G88_BOGUS_LOCAL_ONLY_KEY',
        baseURL: mockOrigin, maxRetries: 2, timeout: 8000,
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          const target = new URL(input instanceof Request ? input.url : String(input));
          if (target.origin !== mockOrigin) throw new Error('R5G88 external egress forbidden');
          return fetch(input, init);
        },
      });
    }
  }
  return { __esModule: true, default: LoopbackOnlySDK };
});
// Actual policy/router and actual adapter; no mocked provider.execute.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { runStructured } = require('../router') as typeof import('../router');

const PRIVATE = 'R5G88_FICTIONAL_USAGE_TEXT_MUST_NOT_BECOME_ACCOUNTING';
const model = 'fictional-model-never-sent';
const request: StructuredRequest = {
  model, system: 'Invented words only.',
  messages: [{ role: 'user', content: 'An invented stream.' }],
  maxTokens: 24,
  tools: [{ name: 'editorial_outcome',
    inputSchema: { type: 'object', properties: { reply: { type: 'string' } }, required: ['reply'] },
    schemaEnforcement: 'required',
  }],
  toolChoice: { type: 'tool', name: 'editorial_outcome' },
};
type UsageShape = 'valid' | 'missing' | 'partial' | 'text' | 'negative' | 'fractional';
const usageFor = (kind: UsageShape): unknown => {
  switch (kind) {
    case 'valid': return { input_tokens: 13, output_tokens: 8 };
    case 'missing': return undefined;
    case 'partial': return { input_tokens: 13 };
    case 'text': return { input_tokens: PRIVATE, output_tokens: 8 };
    case 'negative': return { input_tokens: -7, output_tokens: 8 };
    case 'fractional': return { input_tokens: 1.5, output_tokens: 8 };
  }
};

const initialMode = process.env.MAIA_INFERENCE_MODE;
afterEach(() => {
  if (initialMode === undefined) delete process.env.MAIA_INFERENCE_MODE;
  else process.env.MAIA_INFERENCE_MODE = initialMode;
  jest.restoreAllMocks();
});
jest.setTimeout(30000);

async function withFictionalResponse(
  kind: UsageShape,
  assess: (seen: { count: number }) => Promise<void>,
) {
  const seen = { count: 0 };
  const server = createServer(async (incoming, response) => {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of incoming) chunks.push(Buffer.from(chunk));
      const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (parsed.model !== model) throw new Error('not the fictional pinned model');
      seen.count += 1;
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify({
        id: 'msg_r5g88_local', type: 'message', role: 'assistant', model,
        content: [{ type: 'tool_use', id: 'toolu_r5g88',
          name: 'editorial_outcome', input: { reply: 'Only invented feedback.' } }],
        stop_reason: 'tool_use', stop_sequence: null,
        ...(kind === 'missing' ? {} : { usage: usageFor(kind) }),
      }));
    } catch {
      if (!response.destroyed) response.destroy();
    }
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  mockOrigin = 'http://127.0.0.1:' + (server.address() as AddressInfo).port;
  try { await assess(seen); }
  finally {
    server.closeAllConnections?.();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    mockOrigin = '';
  }
}

describe('R5G.88 Class A — provider usage truth must not be invented', () => {
  it('GREEN CONTROL: full numeric usage and provider model are preserved', async () => {
    await withFictionalResponse('valid', async (seen) => {
      process.env.MAIA_INFERENCE_MODE = 'primary';
      const response = await runStructured(request);
      expect(seen.count).toBe(1);
      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(response.result.usage).toEqual({ inputTokens: 13, outputTokens: 8 });
        expect(response.result.provenance).toMatchObject({
          model, reportedModel: model, modelAgreement: 'agreed',
        });
      }
    });
  });

  it.each(['missing', 'partial', 'text', 'negative', 'fractional'] as const)(
    'EXPECTED RED: %s provider usage cannot persist as successful verified accounting',
    async (kind) => {
      await withFictionalResponse(kind, async (seen) => {
        process.env.MAIA_INFERENCE_MODE = 'primary';
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const response = await runStructured(request);
        expect(seen.count).toBe(1);
        // A full response was observed; malformed/missing usage is NOT a zero
        // token measurement. A downstream authoring result must fail closed or
        // explicitly distinguish unknown, never silently invent zero counters.
        expect(response.ok).toBe(false);
        if (response.ok === false) {
          // A rejected successful-HTTP envelope does not undo provider arrival.
          expect(response.dispatch).toBe('response_observed');
        }
        expect(JSON.stringify(consoleSpy.mock.calls)).not.toContain(PRIVATE);
      });
    },
  );
});
