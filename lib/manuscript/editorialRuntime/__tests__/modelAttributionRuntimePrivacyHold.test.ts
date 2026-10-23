/**
 * Class A source-level negative: the ACTUAL runEditorialTurn refuses when the
 * provider-reported model differs, but its refusal detail must be content-free.
 *
 * The local query, consent/receipt, teaching, canonical renderer and structured
 * provider are mocked. No real database, author Work, network or provider.
 * The writer-runtime turn.ts itself is NOT mocked.
 */
const fakeQuery = jest.fn();
const fakeAssemble = jest.fn();
const fakeBoundary = jest.fn();
const fakeStructured = jest.fn();
const fakeConfirm = jest.fn();
const fakePersist = jest.fn();

jest.mock('@/lib/db/postgres', () => ({
  query: (...args: unknown[]) => fakeQuery(...args),
}));
jest.mock('@/lib/ai/structured/router', () => ({
  runStructured: (...args: unknown[]) => fakeStructured(...args),
}));
jest.mock('@/lib/disclosure/disclosureBoundary', () => ({
  establishDisclosureBoundary: (...args: unknown[]) => fakeBoundary(...args),
  mayCrossBoundary: (result: {kind:string}) => result.kind === 'may_cross',
}));
jest.mock('@/lib/disclosure/contextDisclosureReceipt', () => ({
  confirmDisclosureCrossed: (...args: unknown[]) => fakeConfirm(...args),
}));
jest.mock('@/lib/maia/teaching/TeachingRuntimeBridge', () => ({
  buildTeachingRuntimeBridge: () => ({active:false}),
}));
jest.mock('@/lib/writersStudio/writerUnderstandingServer', () => ({
  writerUnderstandingContextForManuscript: () => Promise.resolve(null),
}));
jest.mock('@/lib/writers-studio/canonicalWriterTurn', () => ({
  constructEditorialWriterTurn: () => ({fictional:'canonical-turn'}),
  renderEditorialTurn: () => ({systemPrompt:'fictional canonical system prompt'}),
}));
jest.mock('../assembly', () => ({
  assembleEditorialCognition: (...args: unknown[]) => fakeAssemble(...args),
}));
jest.mock('../maiaOutcome', () => ({
  persistMaiaEditorialOutcome: (...args: unknown[]) => fakePersist(...args),
}));

import { runEditorialTurn } from '../turn';

const MARKER = 'FICTIONAL_PRIVATE_WRITER_MODEL_METADATA_NEVER_ECHO_716';
const ACT = {
  identity: {status: 'verified' as const, memberId:'fictional-member'},
  threadId:'fictional-owned-thread',
  currentTurnIndex:1,
  declaredAct:'discourse' as const,
  currentDirectionId:null,
  exchangeId:'fictional-exchange-716',
  sanctuary:false,
};

beforeEach(() => {
  jest.clearAllMocks();
  fakeQuery.mockResolvedValue({rows:[{body:'Fictional durable author act.'}]});
  fakeAssemble.mockResolvedValue({
    ok:true, chainId:'fictional-chain',manuscriptId:'fictional-work',
    blocks:[],invokedAgainstVersionId:null,
    locusText:'Fictional author prose.',locusScopeKind:'passage',
    authorSample:'Fictional words.',hasPriorMaiaTurn:false,
  });
  fakeBoundary.mockResolvedValue({kind:'may_cross', disclosureId:'fictional-disclosure',receiptId:'fictional-receipt'});
  fakeConfirm.mockResolvedValue(true);
  fakeStructured.mockResolvedValue({
    ok:true,
    result:{
      content:[],
      usage:{inputTokens:4,outputTokens:2},
      provenance:{
        provider:'anthropic',model:'fictional-requested-model',
        reportedModel:MARKER,modelAgreement:'differs',latencyMs:1,
      },
    },
  });
});

describe('Class A HOLD: actual Writer editorial runtime model-attribution refusal', () => {
  test('EXPECTED RED: provider-reported arbitrary model string may not appear in refusal detail', async () => {
    const result = await runEditorialTurn(ACT);
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('model_unattributable');
    expect(JSON.stringify(result)).not.toContain(MARKER);
  });

  test('GREEN control: mismatch refuses without creating durable model-authored turn', async () => {
    const result = await runEditorialTurn(ACT);
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('model_unattributable');
    expect(fakeStructured).toHaveBeenCalledTimes(1);
    expect(fakePersist).not.toHaveBeenCalled();
    expect(fakeConfirm).toHaveBeenCalledTimes(1);
  });

  test('GREEN control: provider model identity missing refuses and does not persist', async () => {
    fakeStructured.mockResolvedValueOnce({
      ok:true,
      result:{
        content:[],usage:{inputTokens:1,outputTokens:1},
        provenance:{
          provider:'anthropic',model:'fictional-requested-model',
          reportedModel:null,modelAgreement:'unreported',latencyMs:1,
        },
      },
    });
    const result = await runEditorialTurn(ACT);
    expect(result).toMatchObject({ok:false,reason:'model_unattributable'});
    expect(fakePersist).not.toHaveBeenCalled();
  });
});
