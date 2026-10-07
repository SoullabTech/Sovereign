const resolveIdentity = jest.fn();
const persistAct = jest.fn();
const runTurn = jest.fn();
const preflightRelationship = jest.fn();
const resolvePriorCarry = jest.fn();
const resolveWorkCarry = jest.fn();

jest.mock('@/lib/maia/canonical-turn', () => ({
  resolveCanonicalIdentity: (...a: unknown[]) => resolveIdentity(...a),
}));
jest.mock('@/lib/manuscript/editorialRuntime/memberAct', () => ({
  persistMemberEditorialAct: (...a: unknown[]) => persistAct(...a),
}));
jest.mock('@/lib/manuscript/editorialRuntime/turn', () => ({
  runEditorialTurn: (...a: unknown[]) => runTurn(...a),
}));
jest.mock('@/lib/writers-studio/relationshipCarriage', () => ({
  preflightEditorialRelationshipCarriage: (...a: unknown[]) => preflightRelationship(...a),
  resolvePriorMaiaEditorialCarry: (...a: unknown[]) => resolvePriorCarry(...a),
}));
jest.mock('@/lib/writers-studio/workConversationCraftCarry', () => ({
  resolveWorkConversationCraftCarry: (...a: unknown[]) => resolveWorkCarry(...a),
}));

import { POST } from '../route';

const resolvedWorkCarry = {
  kind: 'WORK_CONVERSATION_CRAFT' as const,
  sourceThreadId: 'work-th-1',
  sourceMaiaTurnIndex: 3,
  manuscriptId: 'ms-1',
  memberTurns: [{ turnIndex: 2, body: 'I want this to feel lived.' }],
  maiaTurns: [{ turnIndex: 3, body: 'Then let us work from embodiment.' }],
  sourceTurnCount: 4,
  producerIds: [
    'member.writer_prior_work_conversation',
    'system.writer_prior_work_conversation',
  ] as const,
};

const request = (body: unknown) => ({ json: async () => body }) as never;

beforeEach(() => {
  process.env.WRITERS_STUDIO_EDITORIAL_ENABLED = '1';
  jest.clearAllMocks();
  resolveIdentity.mockResolvedValue({ status: 'verified', memberId: 'member-1' });
  persistAct.mockResolvedValue({ ok: true, turnIndex: 0, direction: null });
  resolveWorkCarry.mockResolvedValue({ ok: true, carry: resolvedWorkCarry });
  runTurn.mockResolvedValue({ ok: false, reason: 'structured_refused', detail: 'not_configured' });
});

describe('R8G Work conversation → Craft editorial ingress', () => {
  const base = {
    threadId: 'editorial-th-1',
    sanctuary: false,
    act: { act: 'discourse', text: 'Show me examples.', refersTo: null },
    proposalPolicy: 'reply_only',
    workConversationThreadId: 'work-th-1',
    workConversationMaiaTurnIndex: 3,
  };

  it('resolves the source conversation before persisting and passes only server-resolved carry to runtime', async () => {
    const res = await POST(request(base));
    expect(res.status).toBe(502);
    expect(resolveWorkCarry).toHaveBeenCalledWith({
      memberId: 'member-1',
      receiverThreadId: 'editorial-th-1',
      sourceThreadId: 'work-th-1',
      sourceMaiaTurnIndex: 3,
    });
    expect(resolveWorkCarry.mock.invocationCallOrder[0]).toBeLessThan(persistAct.mock.invocationCallOrder[0]);
    expect(persistAct.mock.invocationCallOrder[0]).toBeLessThan(runTurn.mock.invocationCallOrder[0]);
    expect(runTurn).toHaveBeenCalledWith(expect.objectContaining({
      threadId: 'editorial-th-1',
      workConversationCarry: resolvedWorkCarry,
      currentTurnIndex: 0,
    }));
  });

  it('carries an explicit required-proposal policy to the runtime', async () => {
    const res = await POST(request({ ...base, proposalPolicy: 'require' }));
    expect(res.status).toBe(502);
    expect(runTurn).toHaveBeenCalledWith(expect.objectContaining({
      proposalPolicy: 'require',
    }));
  });

  it('requires source thread and boundary turn together', async () => {
    const { workConversationMaiaTurnIndex: _drop, ...missingTurn } = base;
    const res = await POST(request(missingTurn));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({
      error: 'workConversationThreadId and workConversationMaiaTurnIndex must be provided together',
    });
    expect(resolveWorkCarry).not.toHaveBeenCalled();
    expect(persistAct).not.toHaveBeenCalled();
  });

  it('refuses an unresolved source before the member editorial act is persisted', async () => {
    resolveWorkCarry.mockResolvedValue({ ok: false, reason: 'source_turn_not_maia' });
    const res = await POST(request(base));
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: 'source_turn_not_maia', persisted: false });
    expect(persistAct).not.toHaveBeenCalled();
    expect(runTurn).not.toHaveBeenCalled();
  });

  it('still refuses Sanctuary before source-conversation resolution or persistence', async () => {
    const res = await POST(request({ ...base, sanctuary: true }));
    expect(res.status).toBe(409);
    expect(resolveWorkCarry).not.toHaveBeenCalled();
    expect(persistAct).not.toHaveBeenCalled();
  });
});
