/**
 * R5G.96 CLASS A TEST-ONLY / DRAFT HOLD
 *
 * Executes the actual runEditorialTurn -> governed runStructured -> actual
 * installed Anthropic SDK -> ephemeral FICTIONAL 127.0.0.1 HTTP server.
 * Only the data/consent and editorial persistence dependencies are mocked:
 * no production DB, real author, credential, provider request or Work data.
 *
 * Asserts an HTTP 200 with unverified usage does not create a MAIA-authored
 * persisted outcome, while correctly confirming the provider crossing.
 * A post-send reset stays UNKNOWN/attempted and is not auto retried.
 * Green is functional evidence ONLY, not Class A authorization.
 */
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';

let mockOrigin = '';
let mockConstructed = 0;
jest.mock('@anthropic-ai/sdk', () => {
  const loaded = jest.requireActual('@anthropic-ai/sdk');
  const ActualSDK = loaded.default ?? loaded;
  class FictionalLoopbackSDK extends ActualSDK {
    constructor(opts: Record<string, unknown> = {}) {
      super({
        ...opts,
        apiKey: 'R5G96_BOGUS_LOCAL_ONLY_KEY',
        baseURL: mockOrigin,
        maxRetries: 2, // The real adapter must override per request with 0.
        timeout: 8000,
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          const url = new URL(input instanceof Request ? input.url : String(input));
          if (url.origin !== mockOrigin || url.hostname !== '127.0.0.1') {
            throw new Error('R5G96 external provider dispatch forbidden');
          }
          return fetch(input, init);
        },
      });
      mockConstructed += 1;
    }
  }
  return { __esModule: true, default: FictionalLoopbackSDK };
});

const fakeQuery = jest.fn();
const fakeAssemble = jest.fn();
const fakeBoundary = jest.fn();
const fakeConfirm = jest.fn();
const fakePersist = jest.fn();

// IMPORTANT: @/lib/ai/structured/router is intentionally NOT mocked.
// The router, policy, SDK adapter, dispatch classifier, disclosure decision,
// and entire runEditorialTurn runtime are the real reviewed source.
jest.mock('@/lib/db/postgres', () => ({ query: (...a: unknown[]) => fakeQuery(...a) }));
jest.mock('@/lib/disclosure/disclosureBoundary', () => ({
  establishDisclosureBoundary: (...a: unknown[]) => fakeBoundary(...a),
  mayCrossBoundary: (r: { kind: string }) => r.kind === 'may_cross',
}));
jest.mock('@/lib/disclosure/contextDisclosureReceipt', () => ({
  confirmDisclosureCrossed: (...a: unknown[]) => fakeConfirm(...a),
}));
jest.mock('@/lib/maia/teaching/TeachingRuntimeBridge', () => ({
  buildTeachingRuntimeBridge: () => ({ active: false }),
}));
jest.mock('@/lib/writersStudio/writerUnderstandingServer', () => ({
  writerUnderstandingContextForManuscript: () => Promise.resolve(null),
}));
jest.mock('@/lib/writers-studio/canonicalWriterTurn', () => ({
  constructEditorialWriterTurn: () => ({ fictional: 'canonical-turn' }),
  renderEditorialTurn: () => ({ systemPrompt: 'Fictional MAIA system instructions.' }),
}));
jest.mock('../assembly', () => ({
  assembleEditorialCognition: (...a: unknown[]) => fakeAssemble(...a),
}));
jest.mock('../maiaOutcome', () => ({
  persistMaiaEditorialOutcome: (...a: unknown[]) => fakePersist(...a),
}));

import { runEditorialTurn, EDITORIAL_MODEL } from '../turn';

const AUTHOR_WORDS = 'R5G96_FICTIONAL_AUTHOR_CONTEXT_ONLY_NOT_FOR_LOGS';
const POISON = 'R5G96_FICTIONAL_UNTRUSTED_USAGE_NOT_FOR_LOGS';
const ACT = {
  identity: { status: 'verified' as const, memberId: 'fictional-writer-r5g96' },
  threadId: 'fictional-author-owned-thread-96',
  currentTurnIndex: 1,
  declaredAct: 'discourse' as const,
  currentDirectionId: null,
  exchangeId: 'fictional-exchange-96',
  sanctuary: false,
};

type Scenario =
  | 'usage_missing' | 'usage_partial' | 'usage_text' | 'usage_negative'
  | 'usage_fractional' | 'valid_but_model_mismatch' | 'postsend_reset' | 'valid';
function usageFor(which: Scenario): unknown {
  if (which === 'usage_missing') return undefined;
  if (which === 'usage_partial') return { input_tokens: 3 };
  if (which === 'usage_text') return { input_tokens: POISON, output_tokens: 2 };
  if (which === 'usage_negative') return { input_tokens: -5, output_tokens: 2 };
  if (which === 'usage_fractional') return { input_tokens: 3.5, output_tokens: 2 };
  return { input_tokens: 3, output_tokens: 2 };
}

const originalMode = process.env.MAIA_INFERENCE_MODE;
const originalEditorialModel = process.env.MAIA_EDITORIAL_MODEL;
beforeEach(() => {
  jest.clearAllMocks();
  fakeQuery.mockResolvedValue({ rows: [{ body: AUTHOR_WORDS }] });
  fakeAssemble.mockResolvedValue({
    ok: true,
    chainId: 'fictional-chain',
    manuscriptId: 'fictional-manuscript',
    blocks: [],
    invokedAgainstVersionId: null,
    locusText: 'Invented passage only.',
    locusScopeKind: 'passage',
    authorSample: 'Invented author sample only.',
    hasPriorMaiaTurn: false,
  });
  fakeBoundary.mockResolvedValue({
    kind: 'may_cross',
    disclosureId: 'fictional-disclosure-id',
    receiptId: 'fictional-receipt-id',
  });
  fakeConfirm.mockResolvedValue(true);
  process.env.MAIA_INFERENCE_MODE = 'primary';
  mockConstructed = 0;
});
afterEach(() => {
  jest.restoreAllMocks();
  if (originalMode === undefined) delete process.env.MAIA_INFERENCE_MODE;
  else process.env.MAIA_INFERENCE_MODE = originalMode;
  if (originalEditorialModel === undefined) delete process.env.MAIA_EDITORIAL_MODEL;
  else process.env.MAIA_EDITORIAL_MODEL = originalEditorialModel;
});
jest.setTimeout(30000);

async function withFictionalSdkServer(
  scenario: Scenario,
  assess: (wires: Array<Record<string, any>>) => Promise<void>,
): Promise<void> {
  const wires: Array<Record<string, any>> = [];
  const server = createServer(async (incoming, response) => {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of incoming) chunks.push(Buffer.from(chunk));
      const wire = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      wires.push(wire);
      if (scenario === 'postsend_reset') {
        // Entire fictional author text arrived before the HTTP response vanished.
        incoming.socket.destroy();
        return;
      }
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify({
        id: 'msg_r5g96_fictional',
        type: 'message',
        role: 'assistant',
        model: scenario === 'valid_but_model_mismatch'
          ? 'fictional-different-reported-model' : wire.model,
        content: [{
          type: 'tool_use', id: 'toolu_r5g96_fictional', name: 'editorial_outcome',
          input: { kind: 'reply_only', reply: 'Entirely invented feedback.' },
        }],
        stop_reason: 'tool_use',
        stop_sequence: null,
        ...(scenario === 'usage_missing' ? {} : { usage: usageFor(scenario) }),
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
  try { await assess(wires); }
  finally {
    server.closeAllConnections?.();
    await new Promise<void>(resolve => server.close(() => resolve()));
    mockOrigin = '';
  }
}

describe('R5G.96 real SDK -> actual editorial runtime cannot persist unverified usage', () => {
  it.each([
    'usage_missing', 'usage_partial', 'usage_text',
    'usage_negative', 'usage_fractional',
  ] as const)(
    'HTTP200 %s refuses before MAIA persistence while confirming external crossing',
    async (kind) => withFictionalSdkServer(kind, async wires => {
      const logs = jest.spyOn(console, 'error').mockImplementation(() => {});
      const result = await runEditorialTurn(ACT);
      expect(result).toEqual({
        ok: false,
        reason: 'structured_refused',
        detail: 'provider_unavailable',
        dispatch: 'response_observed',
      });
      expect(wires).toHaveLength(1);
      expect(wires[0].messages?.[0]?.content).toBe(AUTHOR_WORDS);
      expect(wires[0].model).toBe(EDITORIAL_MODEL);
      expect(mockConstructed).toBe(1);
      expect(fakeBoundary).toHaveBeenCalledTimes(1);
      expect(fakeConfirm).toHaveBeenCalledTimes(1);
      expect(fakeConfirm).toHaveBeenCalledWith(expect.any(String));
      expect(fakePersist).not.toHaveBeenCalled();
      expect(JSON.stringify([result, logs.mock.calls])).not.toContain(AUTHOR_WORDS);
      expect(JSON.stringify([result, logs.mock.calls])).not.toContain(POISON);
      expect(logs.mock.calls).toEqual([
        ['[structured] provider_unavailable', { dispatch: 'response_observed', status: null }],
      ]);
    }),
  );

  it('positive wire/control: valid usage crosses and mismatched reported model refuses later', async () =>
    withFictionalSdkServer('valid_but_model_mismatch', async wires => {
      const logs = jest.spyOn(console, 'error').mockImplementation(() => {});
      const result = await runEditorialTurn(ACT);
      expect(result).toEqual({
        ok: false, reason: 'model_unattributable',
        detail: 'editorial_model_attribution_unverified',
      });
      expect(wires).toHaveLength(1);
      expect(fakeConfirm).toHaveBeenCalledTimes(1);
      expect(fakePersist).not.toHaveBeenCalled();
      expect(JSON.stringify([result, logs.mock.calls])).not.toContain(AUTHOR_WORDS);
    }),
  );

  it('post-send reset: sender remains UNKNOWN, no confirmed crossing, no automatic retry', async () =>
    withFictionalSdkServer('postsend_reset', async wires => {
      const logs = jest.spyOn(console, 'error').mockImplementation(() => {});
      const result = await runEditorialTurn(ACT);
      expect(result).toEqual({
        ok: false, reason: 'structured_refused',
        detail: 'provider_unavailable', dispatch: 'unknown',
      });
      expect(wires).toHaveLength(1);
      expect(mockConstructed).toBe(1);
      expect(fakeConfirm).not.toHaveBeenCalled();
      expect(fakePersist).not.toHaveBeenCalled();
      expect(JSON.stringify([result, logs.mock.calls])).not.toContain(AUTHOR_WORDS);
    }),
  );

  it.each(['sovereign', 'local_only'] as const)(
    '%s refuses before SDK construction or external disclosure confirmation',
    async mode => withFictionalSdkServer('valid', async wires => {
      process.env.MAIA_INFERENCE_MODE = mode;
      const result = await runEditorialTurn(ACT);
      expect(result).toMatchObject({
        ok: false, reason: 'structured_refused',
        detail: 'structured_inference_unavailable',
      });
      expect(wires).toHaveLength(0);
      expect(mockConstructed).toBe(0);
      expect(fakeConfirm).not.toHaveBeenCalled();
      expect(fakePersist).not.toHaveBeenCalled();
    }),
  );
});
