import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import { requireConsentState } from '@/lib/provenance/requireConsentState';
jest.mock('@/lib/provenance/requireConsentState', () => ({
  requireConsentState: jest.fn(async () => ({ kind: 'ready' })),
  consentEstablished: (o: { kind: string }) => o.kind === 'ready',
}));
import { runDisclosedEditorial } from '../disclosure';
import { mintDisclosureAttempt, confirmDisclosureCrossed } from '@/lib/disclosure/contextDisclosureReceipt';
import { runStructured } from '@/lib/ai/structured/router';
jest.mock('@/lib/disclosure/contextDisclosureReceipt', () => ({
  mintDisclosureAttempt: jest.fn(), confirmDisclosureCrossed: jest.fn(),
  mayCross: (o: { kind: string }) => o.kind === 'minted',
}));
jest.mock('@/lib/ai/structured/router', () => ({ runStructured: jest.fn() }));
const mint = jest.mocked(mintDisclosureAttempt);
const confirm = jest.mocked(confirmDisclosureCrossed);
const run = jest.mocked(runStructured);
const request = { model: 'synthetic-model', system: 'PRIVATE_SYNTHETIC_TEXT',
  messages: [{ role: 'user' as const, content: 'PRIVATE_SYNTHETIC_TEXT' }], maxTokens: 1 };
const input = { authorization: 'anthropic' as const, memberId: 'member', workId: 'work', requestRef: 'request', request, posture: TurnPosture.resolve({ sanctuary: false }), threadId: 'thread' };
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(requireConsentState).mockResolvedValue({ kind: 'ready', requestId: 'request' });
  mint.mockResolvedValue({ kind: 'minted', id: 'row', disclosureId: 'attempt' });
  confirm.mockResolvedValue(true);
  run.mockResolvedValue({ ok: false, refusal: 'provider_unavailable', dispatch: 'unknown' });
});
it('F1: absent authorization reaches neither receipt nor provider', async () => {
  expect(await runDisclosedEditorial({ ...input, authorization: undefined })).toEqual({ ok: false, reason: 'external_authorization_required' });
  expect(mint).not.toHaveBeenCalled(); expect(run).not.toHaveBeenCalled();
});
it.each(['unavailable', 'existing', 'identity_mismatch'])('F2: %s receipt cannot dispatch', async kind => {
  mint.mockResolvedValue({ kind } as never);
  expect((await runDisclosedEditorial(input)).ok).toBe(false);
  expect(run).not.toHaveBeenCalled();
});
it('F2: durable mint precedes dispatch', async () => {
  await runDisclosedEditorial(input);
  expect(mint.mock.invocationCallOrder[0]).toBeLessThan(run.mock.invocationCallOrder[0]!);
});
it('F3: observed API refusal confirms a crossing independently of editorial success', async () => {
  run.mockResolvedValue({ ok: false, refusal: 'provider_unavailable', dispatch: 'response_observed' });
  expect((await runDisclosedEditorial(input)).ok).toBe(true);
  expect(confirm).toHaveBeenCalledWith(mint.mock.calls[0]![0].disclosureId);
});
it.each(['unknown', 'no_response_observed', undefined] as const)('F4: %s stays attempted', async dispatch => {
  run.mockResolvedValue({ ok: false, refusal: 'provider_unavailable', dispatch });
  await runDisclosedEditorial(input); expect(confirm).not.toHaveBeenCalled();
});
it('F5: receipt has destination and source identity, no manuscript prose or locators', async () => {
  await runDisclosedEditorial(input);
  const receipt = mint.mock.calls[0]![0];
  expect(Object.keys(receipt).sort()).toEqual(['disclosureId','memberId','requestRef','boundary','sourceClass','participationBasis','sourceRef','scopeKind','gesture','destination'].sort());
  expect(receipt.destination).toBe('anthropic');
  expect(JSON.stringify(receipt)).not.toContain('PRIVATE_SYNTHETIC_TEXT');
});
it('confirmation failure cannot be presented as accountable success', async () => {
  run.mockResolvedValue({ ok: false, refusal: 'provider_unavailable', dispatch: 'response_observed' });
  confirm.mockResolvedValue(false);
  expect(await runDisclosedEditorial(input)).toEqual({ ok: false, reason: 'disclosure_confirmation_failed' });
});

it('consent precondition failure prevents receipt and dispatch', async () => {
  jest.mocked(requireConsentState).mockResolvedValue({ kind: 'unavailable', reason: 'synthetic' });
  expect((await runDisclosedEditorial(input)).ok).toBe(false);
  expect(mint).not.toHaveBeenCalled(); expect(run).not.toHaveBeenCalled();
});
it('Sanctuary blocks the helper itself', async () => {
  expect((await runDisclosedEditorial({ ...input, posture: TurnPosture.resolve({ sanctuary: true }) })).ok).toBe(false);
  expect(mint).not.toHaveBeenCalled(); expect(run).not.toHaveBeenCalled();
});

it('a successful structured response confirms before returning to editorial admission', async () => {
  run.mockResolvedValue({ ok: true, result: { content: [], stopReason: 'end_turn',
    usage: { inputTokens: 1, outputTokens: 1 }, provenance: { provider: 'anthropic',
      model: 'synthetic', reportedModel: 'synthetic', modelAgreement: 'agreed', latencyMs: 0 } } });
  const result = await runDisclosedEditorial(input);
  expect(result.ok).toBe(true); expect(confirm).toHaveBeenCalledTimes(1);
  expect(run.mock.invocationCallOrder[0]).toBeLessThan(confirm.mock.invocationCallOrder[0]!);
});
