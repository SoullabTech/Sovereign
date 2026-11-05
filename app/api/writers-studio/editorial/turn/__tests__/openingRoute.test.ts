const resolveIdentity = jest.fn();
const persistAct = jest.fn();
const runTurn = jest.fn();
const preflightRelationship = jest.fn();
const fakeQuery = jest.fn();

jest.mock('@/lib/maia/canonical-turn', () => ({ resolveCanonicalIdentity: (...a: unknown[]) => resolveIdentity(...a) }));
jest.mock('@/lib/manuscript/editorialRuntime/memberAct', () => ({ persistMemberEditorialAct: (...a: unknown[]) => persistAct(...a) }));
jest.mock('@/lib/manuscript/editorialRuntime/turn', () => ({ runEditorialTurn: (...a: unknown[]) => runTurn(...a) }));
jest.mock('@/lib/writers-studio/relationshipCarriage', () => ({
  preflightEditorialRelationshipCarriage: (...a: unknown[]) => preflightRelationship(...a),
  resolvePriorMaiaEditorialCarry: jest.fn(),
}));
jest.mock('@/lib/db/postgres', () => ({ query: (...a: unknown[]) => fakeQuery(...a) }));

import { POST } from '../route';

const request = (body: unknown) => ({ json: async () => body }) as never;
const base = { threadId: 'th1', relationshipId: 'rel1', sanctuary: false, opening: true };

beforeEach(() => {
  process.env.WRITERS_STUDIO_EDITORIAL_ENABLED = '1';
  jest.clearAllMocks();
  resolveIdentity.mockResolvedValue({ status: 'verified', memberId: 'm1' });
  preflightRelationship.mockResolvedValue({ ok: true, relationshipId: 'rel1', manuscriptId: 'ms', proposalChainId: 'pc', manuscriptLocusScope: 'passage' });
  fakeQuery.mockResolvedValue({ rows: [{ turns: '0' }] });
  runTurn.mockResolvedValue({ ok: true, persisted: { turnIndex: 0, reply: 'I notice X. What are you after?' }, voice: null });
});

describe('MAIA opens — route', () => {
  test('a new thread: ONE model call, NO writer turn written, gesture passed, reply_only, index 0', async () => {
    const res = await POST(request(base));
    expect(res.status).toBe(200);
    expect(persistAct).not.toHaveBeenCalled();                       // defeat: a fixed author turn "Let's look at this passage"
    expect(runTurn).toHaveBeenCalledTimes(1);
    expect(runTurn).toHaveBeenCalledWith(expect.objectContaining({
      currentTurnIndex: 0, proposalPolicy: 'reply_only', sanctuary: false,
      opening: { gesture: 'opened_conversation_on_passage' },
    }));
    expect(await res.json()).toMatchObject({ opening: true, memberTurnIndex: null, maiaTurnIndex: 0, persisted: true, version: null });
  });

  test('a thread that already has ANY turn is refused 409 with no model call and no write', async () => {
    fakeQuery.mockResolvedValue({ rows: [{ turns: '1' }] });
    const res = await POST(request(base));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe('opening_thread_not_new');
    expect(runTurn).not.toHaveBeenCalled();
    expect(persistAct).not.toHaveBeenCalled();
  });

  test('Sanctuary refuses before anything is read, written or sent', async () => {
    const res = await POST(request({ ...base, sanctuary: true }));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe('sanctuary_unavailable');
    expect(fakeQuery).not.toHaveBeenCalled();
    expect(runTurn).not.toHaveBeenCalled();
  });

  test('unresolved posture and missing relationship refuse (gates first)', async () => {
    expect((await POST(request({ threadId: 'th1', relationshipId: 'rel1', opening: true }))).status).toBe(400);
    expect((await POST(request({ threadId: 'th1', sanctuary: false, opening: true }))).status).toBe(400);
    expect(runTurn).not.toHaveBeenCalled();
  });

  test('exclusive shape: act, passageAct, teachingAnchor, turnShape, carry all refuse; so does opening:false and a proposal-allowing policy', async () => {
    const act = { act: 'discourse', text: 'hi', refersTo: null };
    for (const extra of [
      { act }, { passageAct: 'discuss' }, { teachingAnchor: 'passage' }, { turnShape: 'conversation' },
      { carry: { kind: 'prior_maia_editorial_turn', sourceEpisodeSequence: 1 } },
      { proposalPolicy: 'allow' },
    ]) {
      expect((await POST(request({ ...base, ...extra }))).status).toBe(400);
    }
    expect((await POST(request({ ...base, opening: false }))).status).toBe(400);
    expect(runTurn).not.toHaveBeenCalled();
  });

  test('another member’s or unknown thread is 404, no model call', async () => {
    fakeQuery.mockResolvedValue({ rows: [] });
    expect((await POST(request(base))).status).toBe(404);
    expect(runTurn).not.toHaveBeenCalled();
  });

  test('a runtime refusal is not persisted and reports persisted:false', async () => {
    runTurn.mockResolvedValue({ ok: false, reason: 'proposal_policy_reply_only', detail: 'x' });
    const res = await POST(request(base));
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ persisted: false });
  });
});
