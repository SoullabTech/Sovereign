/**
 * Work-wide "MAIA asks, never rewrites" (founder authorization 2026-11-13, ledger #1938).
 * The REAL runEditorialTurn, providers mocked. Laws:
 *  - when the writer has paused revisions on the Work, the turn is reply_only whatever
 *    the client declares (a client cannot send 'allow' past the writer's setting);
 *  - the schema offers MAIA no proposal kind;
 *  - a proposal that comes back anyway is refused and NEVER persisted;
 *  - an unpaused Work keeps today's behaviour (proposals still offered);
 *  - an unreadable setting fails closed to reply_only.
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
jest.mock('@/lib/writersStudio/decisionRecord', () => ({ decisionContextForManuscript: () => Promise.resolve('') }));
jest.mock('@/lib/writers-studio/canonicalWriterTurn', () => ({
  constructEditorialWriterTurn: () => ({ fictional: 'canonical-turn' }),
  renderEditorialTurn: () => ({ systemPrompt: 'canonical system prompt' }),
}));
jest.mock('../assembly', () => ({ assembleEditorialCognition: (...a: unknown[]) => fakeAssemble(...a) }));
jest.mock('../maiaOutcome', () => ({ persistMaiaEditorialOutcome: (...a: unknown[]) => fakePersist(...a) }));

import { runEditorialTurn } from '../turn';
import { WORK_REVISION_PAUSE_SQL } from '../workRevisionPause';

const TURN = {
  identity: { status: 'verified' as const, memberId: 'm1' },
  threadId: 'th1', currentTurnIndex: 2,
  declaredAct: 'discourse' as const, currentDirectionId: null, exchangeId: 'ex1', sanctuary: false,
  scope: { latitude: 3 as const, mayRemoveParagraphs: false },
  mayProposeImmediately: true,
};
const prov = { provider: 'anthropic', model: 'mdl', reportedModel: 'mdl', modelAgreement: 'agreed', latencyMs: 1 };
const reply = (input: unknown) => ({
  ok: true,
  result: { content: [{ type: 'tool_use', name: 'editorial_outcome', input }], usage: { inputTokens: 1, outputTokens: 1 }, provenance: prov },
});
const PROPOSAL = {
  kind: 'reply_with_proposal', reply: 'Try this.',
  proposal: { replacementText: 'My grandfather taught me patience.', rationale: 'Editorial purpose: Clarity. Because.' },
};

/** The author turn read, then the Work pause read. */
function dbWithPause(paused: boolean | Error) {
  fakeQuery.mockImplementation((sql: string) => {
    if (sql === WORK_REVISION_PAUSE_SQL) {
      return paused instanceof Error ? Promise.reject(paused) : Promise.resolve({ rows: [{ paused }] });
    }
    return Promise.resolve({ rows: [{ body: 'What is unclear in this paragraph?' }] });
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  fakeAssemble.mockResolvedValue({
    ok: true, chainId: 'c1', manuscriptId: 'w1', blocks: [], invokedAgainstVersionId: null,
    locusText: 'My grandfather taught me patience one crooked nail at a time.',
    locusScopeKind: 'passage', authorSample: '', hasPriorMaiaTurn: true,
  });
  fakeBoundary.mockResolvedValue({ kind: 'may_cross' });
  fakeConfirm.mockResolvedValue(true);
  fakePersist.mockResolvedValue({ ok: true, turnIndex: 3, reply: 'What do you want the reader to feel?', direction: null, version: null });
});

describe('Work-wide "MAIA asks, never rewrites"', () => {
  test('paused Work: reply_only even when the client declares allow; schema offers no proposal kind', async () => {
    dbWithPause(true);
    fakeStructured.mockResolvedValue(reply({ kind: 'reply_only', reply: 'What do you want the reader to feel?' }));
    const r = await runEditorialTurn({ ...TURN, proposalPolicy: 'allow' });
    expect(r.ok).toBe(true);
    const pauseCall = fakeQuery.mock.calls.find(c => c[0] === WORK_REVISION_PAUSE_SQL)!;
    expect(pauseCall[1]).toEqual(['c1', 'm1', 'w1']);          // chain, member, manuscript: member-scoped
    const schema = fakeStructured.mock.calls[0]![0].tools[0].inputSchema;
    expect(schema.properties.kind.enum).toEqual(['reply_only']);
  });

  test('NEGATIVE: paused Work, a proposal that comes back anyway is refused and never persisted', async () => {
    dbWithPause(true);
    fakeStructured.mockResolvedValue(reply(PROPOSAL));
    const r = await runEditorialTurn({ ...TURN, proposalPolicy: 'allow' });
    expect(r).toMatchObject({ ok: false, reason: 'proposal_policy_reply_only' });
    expect(fakePersist).not.toHaveBeenCalled();
  });

  test('unpaused Work: today\'s behaviour is unchanged, MAIA may still be offered a proposal', async () => {
    dbWithPause(false);
    fakeStructured.mockResolvedValue(reply({ kind: 'reply_only', reply: 'Here is what I notice.' }));
    await runEditorialTurn({ ...TURN, proposalPolicy: 'allow' });
    const schema = fakeStructured.mock.calls[0]![0].tools[0].inputSchema;
    expect(schema.properties.kind.enum).toContain('reply_with_proposal');
  });

  test('an unreadable setting fails closed to reply_only', async () => {
    dbWithPause(new Error('column "maia_revisions_paused" does not exist'));
    fakeStructured.mockResolvedValue(reply(PROPOSAL));
    const r = await runEditorialTurn({ ...TURN, proposalPolicy: 'allow' });
    expect(r).toMatchObject({ ok: false, reason: 'proposal_policy_reply_only' });
    expect(fakePersist).not.toHaveBeenCalled();
  });

  test('a client that already declared reply_only needs no lookup', async () => {
    dbWithPause(false);
    fakeStructured.mockResolvedValue(reply({ kind: 'reply_only', reply: 'Hmm.' }));
    await runEditorialTurn({ ...TURN, proposalPolicy: 'reply_only' });
    expect(fakeQuery.mock.calls.some(c => c[0] === WORK_REVISION_PAUSE_SQL)).toBe(false);
  });
});
