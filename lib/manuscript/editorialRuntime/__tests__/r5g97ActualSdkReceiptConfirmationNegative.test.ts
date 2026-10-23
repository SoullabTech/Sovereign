/**
 * R5G.97 — CLASS A EXPECTED-RED post-provider disclosure confirmation tests.
 *
 * Frozen source: R5G.96 exact actual runEditorialTurn -> runStructured ->
 * installed Anthropic SDK -> invented localhost-only server.
 *
 * A successful provider response / explicit HTTP 503 refusal is proof the
 * provider received the fictional payload. If confirmDisclosureCrossed()
 * is false or throws, the author must not be told this was a pre-dispatch
 * consent refusal or an ordinary final provider refusal. The receipt remains
 * attempted/accountability unresolved and no MAIA response can be persisted.
 *
 * Deliberately RED until single JARVIS source owner accepts V4 + both HTTP
 * and runtime changes. No real provider, member data, SQL or production.
 */
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';

let mockOrigin = '';
let sdkInstances = 0;
jest.mock('@anthropic-ai/sdk', () => {
  const sdk = jest.requireActual('@anthropic-ai/sdk');
  const ActualSDK = sdk.default ?? sdk;
  class LoopbackSDK extends ActualSDK {
    constructor(opts: Record<string, unknown> = {}) {
      super({
        ...opts,
        apiKey: 'R5G97_FICTIONAL_KEY_NEVER_SENT_EXTERNALLY',
        baseURL: mockOrigin,
        maxRetries: 2,
        timeout: 8000,
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          const url = new URL(input instanceof Request ? input.url : String(input));
          if (url.origin !== mockOrigin || url.hostname !== '127.0.0.1') {
            throw new Error('R5G97 external provider request FORBIDDEN');
          }
          return fetch(input, init);
        },
      });
      sdkInstances += 1;
    }
  }
  return { __esModule: true, default: LoopbackSDK };
});

const fakeQuery = jest.fn();
const fakeAssemble = jest.fn();
const fakeBoundary = jest.fn();
const fakeConfirm = jest.fn();
const fakePersist = jest.fn();
jest.mock('@/lib/db/postgres', () => ({query: (...x: unknown[]) => fakeQuery(...x)}));
// Actual structured router, policy, adapter and editorial turn are NOT mocked.
jest.mock('@/lib/disclosure/disclosureBoundary', () => ({
  establishDisclosureBoundary: (...x: unknown[]) => fakeBoundary(...x),
  mayCrossBoundary: (r: {kind: string}) => r.kind === 'may_cross',
}));
jest.mock('@/lib/disclosure/contextDisclosureReceipt', () => ({
  confirmDisclosureCrossed: (...x: unknown[]) => fakeConfirm(...x),
}));
jest.mock('@/lib/maia/teaching/TeachingRuntimeBridge', () => ({
  buildTeachingRuntimeBridge: () => ({active:false}),
}));
jest.mock('@/lib/writersStudio/writerUnderstandingServer', () => ({
  writerUnderstandingContextForManuscript: () => Promise.resolve(null),
}));
jest.mock('@/lib/writers-studio/canonicalWriterTurn', () => ({
  constructEditorialWriterTurn: () => ({fictional: 'canonical-turn'}),
  renderEditorialTurn: () => ({systemPrompt:'Invented editorial system.'}),
}));
jest.mock('../assembly', () => ({
  assembleEditorialCognition: (...x: unknown[]) => fakeAssemble(...x),
}));
jest.mock('../maiaOutcome', () => ({
  persistMaiaEditorialOutcome: (...x: unknown[]) => fakePersist(...x),
}));
import { runEditorialTurn, EDITORIAL_MODEL } from '../turn';

const PRIVATE = 'R5G97_FICTIONAL_PRIVATE_PROVIDER_ERROR_TEXT_621';
const AUTHOR = 'R5G97_FICTIONAL_AUTHOR_WORDS_621';
const ACT = {
  identity: {status:'verified' as const,memberId:'fictional-member-97'},
  threadId:'fictional-thread-97',
  currentTurnIndex:1,
  declaredAct:'discourse' as const,
  currentDirectionId:null,
  exchangeId:'fictional-exchange-97',
  sanctuary:false,
};

type Scenario = 'agreed' | 'mismatch' | 'http503' | 'reset';
const originalMode = process.env.MAIA_INFERENCE_MODE;

beforeEach(() => {
  jest.clearAllMocks();
  sdkInstances = 0;
  process.env.MAIA_INFERENCE_MODE = 'primary';
  fakeQuery.mockResolvedValue({rows:[{body:AUTHOR}]});
  fakeAssemble.mockResolvedValue({
    ok:true,chainId:'fictional-chain-97',manuscriptId:'fictional-work-97',
    blocks:[],invokedAgainstVersionId:null,locusText:'Imagined passage.',
    locusScopeKind:'passage',authorSample:'Imagined sample.',
    hasPriorMaiaTurn:false,
  });
  fakeBoundary.mockResolvedValue({
    kind:'may_cross',disclosureId:'fictional-disclosure-97',
    receiptId:'fictional-receipt-97',
  });
  fakeConfirm.mockResolvedValue(true);
});
afterEach(() => {
  jest.restoreAllMocks();
  if (originalMode === undefined) delete process.env.MAIA_INFERENCE_MODE;
  else process.env.MAIA_INFERENCE_MODE = originalMode;
});
jest.setTimeout(30000);

async function withServer(
  scenario: Scenario,
  callback: (wires: Array<Record<string, any>>) => Promise<void>,
): Promise<void> {
  const wires: Array<Record<string, any>> = [];
  const server = createServer(async (req, res) => {
    try {
      const chunks: Buffer[] = [];
      for await (const c of req) chunks.push(Buffer.from(c));
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      wires.push(body);
      if (scenario === 'reset') {
        req.socket.destroy();
        return;
      }
      if (scenario === 'http503') {
        res.writeHead(503, {'content-type':'application/json'});
        res.end(JSON.stringify({
          type:'error',error:{type:'overloaded_error',message:PRIVATE},
        }));
        return;
      }
      res.writeHead(200, {'content-type':'application/json'});
      res.end(JSON.stringify({
        id:'msg_r5g97',type:'message',role:'assistant',
        model:scenario === 'agreed' ? body.model : 'fictional-reported-model-other-than-requested',
        content:[{type:'tool_use',id:'toolu_r5g97',name:'editorial_outcome',
          input:{kind:'reply_only',reply:'Invented feedback only.'}}],
        stop_reason:'tool_use',stop_sequence:null,
        usage:{input_tokens:10,output_tokens:3},
      }));
    } catch {
      if (!res.destroyed) res.destroy();
    }
  });
  await new Promise<void>((resolve,reject) => {
    server.once('error',reject);
    server.listen(0,'127.0.0.1',resolve);
  });
  mockOrigin = 'http://127.0.0.1:'+(server.address() as AddressInfo).port;
  try {await callback(wires);}
  finally {
    server.closeAllConnections?.();
    await new Promise<void>(resolve=>server.close(()=>resolve()));
    mockOrigin='';
  }
}

describe('R5G.97 original V4 receipt-accountability negatives with real SDK', () => {
  it.each([
    ['agreed','false'], ['agreed','throw'],
    ['mismatch','false'], ['mismatch','throw'],
    ['http503','false'], ['http503','throw'],
  ] as const)(
    'EXPECTED RED: provider %s + receipt confirmation %s is accountability_unresolved, not ordinary refusal',
    async (scenario,confirmation) => withServer(scenario,async wires => {
      const diagnostics = jest.spyOn(console,'error').mockImplementation(()=>{});
      if (confirmation === 'false') fakeConfirm.mockResolvedValue(false);
      else fakeConfirm.mockRejectedValue(new Error(PRIVATE));
      // An observed provider reply/refusal can already have incurred cost and
      // disclosed writing. A bad receipt cannot assert "no external crossing".
      const result = await runEditorialTurn(ACT);
      expect(result).toEqual({
        ok:false,reason:'disclosure_confirmation_unresolved',
        detail:'accountability_unresolved',
      });
      expect(wires).toHaveLength(1);
      expect(wires[0].model).toBe(EDITORIAL_MODEL);
      expect(wires[0].messages[0].content).toBe(AUTHOR);
      expect(fakeConfirm).toHaveBeenCalledTimes(1);
      expect(fakeConfirm).toHaveBeenCalledWith(expect.any(String));
      expect(fakePersist).not.toHaveBeenCalled();
      expect(sdkInstances).toBe(1);
      expect(JSON.stringify([result,diagnostics.mock.calls])).not.toContain(AUTHOR);
      expect(JSON.stringify([result,diagnostics.mock.calls])).not.toContain(PRIVATE);
    }),
  );

  it('GREEN: an agreed model with confirmed crossing reaches the governed persistence seam once',async () =>
    withServer('agreed',async wires=>{
      const diagnostics=jest.spyOn(console,'error').mockImplementation(()=>{});
      // Mock the durable seam with an explicit fictional refusal: prove that
      // this otherwise-successful response would reach it exactly once.
      fakePersist.mockResolvedValueOnce({ok:false,reason:'fictional_persistence_hold',
        detail:'fictional_custody_unavailable'});
      const result=await runEditorialTurn(ACT);
      expect(result).toEqual({ok:false,reason:'fictional_persistence_hold',
        detail:'fictional_custody_unavailable'});
      expect(wires).toHaveLength(1);
      expect(fakeConfirm).toHaveBeenCalledTimes(1);
      expect(fakePersist).toHaveBeenCalledTimes(1);
      expect(sdkInstances).toBe(1);
      expect(JSON.stringify([result,diagnostics.mock.calls])).not.toContain(AUTHOR);
      expect(JSON.stringify([result,diagnostics.mock.calls])).not.toContain(PRIVATE);
    }),
  );

  it('GREEN: confirmed response with mismatched model produces safe attribution refusal',async () =>
    withServer('mismatch',async wires => {
      const diagnostic=jest.spyOn(console,'error').mockImplementation(()=>{});
      const result=await runEditorialTurn(ACT);
      expect(result).toEqual({ok:false,reason:'model_unattributable',
        detail:'editorial_model_attribution_unverified'});
      expect(wires).toHaveLength(1);
      expect(fakeConfirm).toHaveBeenCalledTimes(1);
      expect(fakePersist).not.toHaveBeenCalled();
      expect(JSON.stringify([result,diagnostic.mock.calls])).not.toContain(PRIVATE);
    }),
  );
  it('GREEN: observed HTTP 503 with confirmed crossing remains provider refusal',async () =>
    withServer('http503',async wires=>{
      const diagnostic=jest.spyOn(console,'error').mockImplementation(()=>{});
      const result=await runEditorialTurn(ACT);
      expect(result).toEqual({ok:false,reason:'structured_refused',
        detail:'provider_unavailable',dispatch:'response_observed'});
      expect(wires).toHaveLength(1);
      expect(fakeConfirm).toHaveBeenCalledTimes(1);
      expect(fakePersist).not.toHaveBeenCalled();
      expect(JSON.stringify([result,diagnostic.mock.calls])).not.toContain(PRIVATE);
    }),
  );
  it('GREEN: post-send reset remains UNKNOWN with no receipt confirmation or SDK retry',async () =>
    withServer('reset',async wires=>{
      const diagnostic=jest.spyOn(console,'error').mockImplementation(()=>{});
      const result=await runEditorialTurn(ACT);
      expect(result).toEqual({ok:false,reason:'structured_refused',
        detail:'provider_unavailable',dispatch:'unknown'});
      expect(wires).toHaveLength(1);
      expect(fakeConfirm).not.toHaveBeenCalled();
      expect(fakePersist).not.toHaveBeenCalled();
      expect(JSON.stringify([result,diagnostic.mock.calls])).not.toContain(PRIVATE);
    }),
  );
  it.each(['sovereign','local_only'] as const)(
    'GREEN: %s refuses before SDK construction, provider/confirmation and persistence',
    async mode=>withServer('mismatch',async wires=>{
      process.env.MAIA_INFERENCE_MODE=mode;
      const result=await runEditorialTurn(ACT);
      expect(result).toMatchObject({ok:false,reason:'structured_refused',
        detail:'structured_inference_unavailable'});
      expect(wires).toHaveLength(0);
      expect(sdkInstances).toBe(0);
      expect(fakeConfirm).not.toHaveBeenCalled();
      expect(fakePersist).not.toHaveBeenCalled();
    }),
  );
});
