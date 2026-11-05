/**
 * R2 "MAIA opens" (O1(a)) — the REAL runEditorialTurn with opening, providers mocked.
 * Laws: MAIA speaks first; no author row is read or written; the outcome is reply_only
 * whatever the caller says; a proposal that comes back is refused and never persisted;
 * the typed gesture rides in the provenance and the relationship admission.
 */
const fakeQuery = jest.fn();
const fakeAssemble = jest.fn();
const fakeBoundary = jest.fn();
const fakeStructured = jest.fn();
const fakeConfirm = jest.fn();
const fakePersist = jest.fn();

jest.mock('@/lib/db/postgres', () => ({ query: (...a: unknown[]) => fakeQuery(...a) }));
jest.mock('@/lib/ai/structured/router', () => ({ runStructured: (...a: unknown[]) => fakeStructured(...a) }));
jest.mock('@/lib/disclosure/disclosureBoundary', () => ({
  establishDisclosureBoundary: (...a: unknown[]) => fakeBoundary(...a),
  mayCrossBoundary: (r: { kind: string }) => r.kind === 'may_cross',
}));
jest.mock('@/lib/disclosure/contextDisclosureReceipt', () => ({ confirmDisclosureCrossed: (...a: unknown[]) => fakeConfirm(...a) }));
jest.mock('@/lib/maia/teaching/TeachingRuntimeBridge', () => ({ buildTeachingRuntimeBridge: () => ({ active: false }) }));
jest.mock('@/lib/writersStudio/writerUnderstandingServer', () => ({ writerUnderstandingContextForManuscript: () => Promise.resolve(null) }));
jest.mock('@/lib/writers-studio/canonicalWriterTurn', () => ({
  constructEditorialWriterTurn: () => ({ fictional: 'canonical-turn' }),
  renderEditorialTurn: () => ({ systemPrompt: 'canonical system prompt' }),
}));
jest.mock('../assembly', () => ({ assembleEditorialCognition: (...a: unknown[]) => fakeAssemble(...a) }));
jest.mock('../maiaOutcome', () => ({ persistMaiaEditorialOutcome: (...a: unknown[]) => fakePersist(...a) }));

import { runEditorialTurn } from '../turn';

const OPEN = {
  identity: { status: 'verified' as const, memberId: 'm1' },
  threadId: 'th1', relationshipId: 'rel1', currentTurnIndex: 0,
  declaredAct: 'discourse' as const, currentDirectionId: null, exchangeId: 'ex1', sanctuary: false,
  opening: { gesture: 'opened_conversation_on_passage' as const },
};
const prov = { provider: 'anthropic', model: 'mdl', reportedModel: 'mdl', modelAgreement: 'agreed', latencyMs: 1 };
const reply = (input: unknown) => ({
  ok: true,
  result: { content: [{ type: 'tool_use', name: 'editorial_outcome', input }], usage: { inputTokens: 1, outputTokens: 1 }, provenance: prov },
});

beforeEach(() => {
  jest.clearAllMocks();
  fakeQuery.mockResolvedValue({ rows: [] });
  fakeAssemble.mockResolvedValue({
    ok: true, chainId: 'c1', manuscriptId: 'w1', blocks: [], invokedAgainstVersionId: null,
    locusText: 'A loud ending.', locusScopeKind: 'passage', authorSample: '', hasPriorMaiaTurn: false,
  });
  fakeBoundary.mockResolvedValue({ kind: 'may_cross' });
  fakeConfirm.mockResolvedValue(true);
  fakePersist.mockResolvedValue({ ok: true, turnIndex: 0, reply: 'I notice X. What are you after?', direction: null, version: null });
});

describe('MAIA opens — runtime', () => {
  test('speaks first: no author row is read, one model call, persisted with the typed gesture and no member turn index', async () => {
    fakeStructured.mockResolvedValue(reply({ kind: 'reply_only', reply: 'I notice X. What are you after?' }));
    const r = await runEditorialTurn(OPEN);
    expect(r.ok).toBe(true);
    expect(fakeQuery).not.toHaveBeenCalled();                    // no ask_turns read
    expect(fakeStructured).toHaveBeenCalledTimes(1);
    const sent = fakeStructured.mock.calls[0]![0];
    expect(sent.system).toContain('HAS NOT SAID ANYTHING YET');
    expect(sent.messages[0].content).toContain('has not said anything yet');
    const persist = fakePersist.mock.calls[0]![0];
    expect(persist.relationshipAdmission).toEqual({ relationshipId: 'rel1', manuscriptLocusScope: 'passage', opening: { gesture: 'opened_conversation_on_passage' } });
    expect('memberTurnIndex' in persist.relationshipAdmission).toBe(false);
    expect(persist.answerProvenance.opening).toEqual({ gesture: 'opened_conversation_on_passage' });
  });

  test('reply_only is forced even when the caller asks for allow / immediate proposals; the schema offers no proposal kind', async () => {
    fakeStructured.mockResolvedValue(reply({ kind: 'reply_only', reply: 'Hello? Why?' }));
    await runEditorialTurn({ ...OPEN, proposalPolicy: 'allow', mayProposeImmediately: true });
    const schema = fakeStructured.mock.calls[0]![0].tools[0].inputSchema;
    expect(schema.properties.kind.enum).toEqual(['reply_only']);
  });

  test('a proposal that comes back is refused and NEVER persisted (defeat: opening that lets a proposal through)', async () => {
    fakeStructured.mockResolvedValue(reply({
      kind: 'reply_with_proposal', reply: 'Try this.',
      proposal: { replacementText: 'A quiet ending.', rationale: 'Editorial purpose: Quiet. Because.' },
    }));
    const r = await runEditorialTurn({ ...OPEN, proposalPolicy: 'allow', mayProposeImmediately: true });
    expect(r).toMatchObject({ ok: false, reason: 'proposal_policy_reply_only' });
    expect(fakePersist).not.toHaveBeenCalled();
  });

  test('an opening needs a relationship and index 0; otherwise nothing is sent', async () => {
    expect(await runEditorialTurn({ ...OPEN, relationshipId: undefined })).toMatchObject({ ok: false });
    expect(await runEditorialTurn({ ...OPEN, currentTurnIndex: 3 })).toMatchObject({ ok: false, reason: 'current_turn_not_found' });
    expect(fakeStructured).not.toHaveBeenCalled();
  });

  test('a refused consent boundary sends nothing', async () => {
    fakeBoundary.mockResolvedValue({ kind: 'consent_unavailable', reason: 'x' });
    const r = await runEditorialTurn(OPEN);
    expect(r).toMatchObject({ ok: false, reason: 'disclosure_unavailable' });
    expect(fakeStructured).not.toHaveBeenCalled();
  });
});
