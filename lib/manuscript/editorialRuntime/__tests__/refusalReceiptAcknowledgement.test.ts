/**
 * REVIEW-ONLY / Class A negative regression: consented editorial crossing
 * metadata must not silently lose a failed receipt confirmation.
 * Real runEditorialTurn implementation; all collaborators mocked; zero network,
 * no real Work, no PostgreSQL, no model, and no persistence.
 */
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/ai/structured/router', () => ({ runStructured: jest.fn() }));
jest.mock('../assembly', () => ({ assembleEditorialCognition: jest.fn() }));
jest.mock('@/lib/disclosure/disclosureBoundary', () => ({
  establishDisclosureBoundary: jest.fn(),
  mayCrossBoundary: jest.fn(() => true),
}));
jest.mock('@/lib/disclosure/contextDisclosureReceipt', () => ({
  confirmDisclosureCrossed: jest.fn(),
}));
jest.mock('@/lib/writersStudio/writerUnderstandingServer', () => ({
  writerUnderstandingContextForManuscript: jest.fn(async () => null),
}));
jest.mock('@/lib/maia/teaching/TeachingRuntimeBridge', () => ({
  buildTeachingRuntimeBridge: jest.fn(() => ({ active: false, directive: '' })),
}));
jest.mock('@/lib/writers-studio/canonicalWriterTurn', () => ({
  constructEditorialWriterTurn: jest.fn(() => ({ synthetic: true })),
  renderEditorialTurn: jest.fn(() => ({ systemPrompt: 'FICTIONAL_SYSTEM_NO_CONTENT' })),
}));
jest.mock('../maiaOutcome', () => ({ persistMaiaEditorialOutcome: jest.fn() }));

import { query } from '@/lib/db/postgres';
import { runStructured } from '@/lib/ai/structured/router';
import { assembleEditorialCognition } from '../assembly';
import { establishDisclosureBoundary } from '@/lib/disclosure/disclosureBoundary';
import { confirmDisclosureCrossed } from '@/lib/disclosure/contextDisclosureReceipt';
import { persistMaiaEditorialOutcome } from '../maiaOutcome';
import { runEditorialTurn } from '../turn';

const db = query as jest.Mock;
const structured = runStructured as jest.Mock;
const assembled = assembleEditorialCognition as jest.Mock;
const boundary = establishDisclosureBoundary as jest.Mock;
const confirm = confirmDisclosureCrossed as jest.Mock;
const persist = persistMaiaEditorialOutcome as jest.Mock;

const input = {
  identity: { status: 'verified', memberId: 'fictional-member' },
  threadId: 'fictional-thread',
  currentTurnIndex: 7,
  declaredAct: 'discourse',
  currentDirectionId: null,
  exchangeId: 'fictional-exchange',
  sanctuary: false,
} as Parameters<typeof runEditorialTurn>[0];

beforeEach(() => {
  jest.clearAllMocks();
  db.mockResolvedValue({ rows: [{ body: 'INVENTED_UTTERANCE_NO_MEMBER_DATA' }], rowCount: 1 });
  assembled.mockResolvedValue({
    ok: true,
    blocks: [],
    chainId: 'fictional-chain',
    manuscriptId: 'fictional-work',
    invokedAgainstVersionId: null,
    locusText: 'INVENTED_LOCUS_NO_MEMBER_DATA',
    hasPriorMaiaTurn: false,
    locusScopeKind: 'passage',
  });
  boundary.mockResolvedValue({ kind: 'permitted', synthetic: true });
  confirm.mockResolvedValue(true);
});

describe('Class A: observed provider errors require acknowledged receipt', () => {
  test('RED: observed provider error with failed receipt confirmation is a separate accountability refusal', async () => {
    structured.mockResolvedValue({
      ok: false, refusal: 'provider_unavailable', dispatch: 'response_observed',
      detail: 'structured_provider_error_redacted',
    });
    confirm.mockResolvedValue(false);
    const result = await runEditorialTurn(input);
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      ok: false, reason: 'disclosure_confirmation_unresolved',
      dispatch: 'response_observed',
    });
    expect(persist).not.toHaveBeenCalled();
  });

  test('GREEN: observed provider refusal with confirmed receipt remains an ordinary structured refusal', async () => {
    structured.mockResolvedValue({
      ok: false, refusal: 'provider_unavailable', dispatch: 'response_observed',
    });
    const result = await runEditorialTurn(input);
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      ok: false, reason: 'structured_refused', dispatch: 'response_observed',
    });
    expect(persist).not.toHaveBeenCalled();
  });

  test.each(['unknown', 'no_response_observed', undefined] as const)(
    'GREEN: refusal dispatch %s never fabricates confirmed arrival', async dispatch => {
      structured.mockResolvedValue({
        ok: false, refusal: 'provider_unavailable', dispatch,
      });
      const result = await runEditorialTurn(input);
      expect(confirm).not.toHaveBeenCalled();
      expect(result).toMatchObject({ ok: false, reason: 'structured_refused' });
      expect(persist).not.toHaveBeenCalled();
    },
  );

  test('RED: genuine provider response with failed receipt confirmation is not misclassified as pre-dispatch denial', async () => {
    structured.mockResolvedValue({ ok: true, result: { synthetic: true } });
    confirm.mockResolvedValue(false);
    const result = await runEditorialTurn(input);
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      ok: false, reason: 'disclosure_confirmation_unresolved',
    });
    expect(persist).not.toHaveBeenCalled();
  });
});

describe('Class A: exceptional receipt-confirmation failures do not escape to callers', () => {
  test.each([
    [
      'observed refusal',
      { ok: false, refusal: 'provider_unavailable', dispatch: 'response_observed' },
    ],
    [
      'successful provider response',
      { ok: true, result: { synthetic: true } },
    ],
  ])('RED: %s with a rejected confirmation promise still produces a content-free accountability refusal',
    async (_case, providerOutcome) => {
      structured.mockResolvedValue(providerOutcome);
      confirm.mockRejectedValueOnce(new Error('FICTIONAL_DATABASE_PRIVATE_PAYLOAD_991'));
      await expect(runEditorialTurn(input)).resolves.toMatchObject({
        ok: false, reason: 'disclosure_confirmation_unresolved',
        dispatch: 'response_observed',
      });
      expect(confirm).toHaveBeenCalledTimes(1);
      expect(persist).not.toHaveBeenCalled();
    });
});
