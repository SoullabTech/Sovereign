/**
 * Gate 3 Class A negative review: current unmerged PR #1942 Writer POST has no
 * server-visible per-gesture idempotency identity.
 *
 * The real PR #1942 HTTP route executes with mock identity, relationship,
 * author-act persistence and MAIA outcome. ZERO real PG/provider/network.
 * "Same gesture" is test-harness intent: the current wire format cannot
 * tell a genuine new equal-text act from a transport retry. That missing
 * distinction is the precise requirement to design, not a permission to
 * deduplicate by author text (which would lose valid distinct gestures).
 */
const identity = jest.fn();
const preflight = jest.fn();
const persist = jest.fn();
const model = jest.fn();
const carry = jest.fn();
let index = 0;

jest.mock('@/lib/maia/canonical-turn', () => ({
  resolveCanonicalIdentity: (...args: unknown[]) => identity(...args),
}));
jest.mock('@/lib/manuscript/editorialRuntime/memberAct', () => ({
  persistMemberEditorialAct: (...args: unknown[]) => persist(...args),
}));
jest.mock('@/lib/manuscript/editorialRuntime/turn', () => ({
  runEditorialTurn: (...args: unknown[]) => model(...args),
}));
jest.mock('@/lib/writers-studio/relationshipCarriage', () => ({
  preflightEditorialRelationshipCarriage: (...args: unknown[]) => preflight(...args),
  resolvePriorMaiaEditorialCarry: (...args: unknown[]) => carry(...args),
}));

import { POST } from '../route';

const payload = {
  threadId: 'fictional-member-owned-thread',
  relationshipId: 'fictional-original-A2-work-epoch',
  sanctuary: false,
  act: {
    act: 'discourse',
    text: 'FICTIONAL_SAME_AUTHOR_WORDS_NO_MEMBER_PROSE',
    refersTo: null,
  },
};
const request = (body: unknown) => ({ json: async () => body }) as never;

beforeEach(() => {
  index = 0;
  jest.clearAllMocks();
  process.env.WRITERS_STUDIO_EDITORIAL_ENABLED = '1';
  identity.mockResolvedValue({ status: 'verified', memberId: 'fictional-member' });
  preflight.mockResolvedValue({
    ok: true, relationshipId: payload.relationshipId,
    manuscriptId: 'fictional-manuscript',
    proposalChainId: 'fictional-chain', manuscriptLocusScope: 'passage',
  });
  persist.mockImplementation(async () => ({
    ok: true, turnIndex: index++, direction: null,
  }));
  model.mockResolvedValue({ ok: false, reason: 'structured_refused', detail: 'not_configured' });
});

describe('same author gesture retried after unknown transport completion', () => {
  test('EXPECTED RED: sequential replay of one gesture must not write or dispatch twice', async () => {
    const first = await POST(request(payload));
    // Fictional client loses the first 502 status and resends same payload.
    const repeat = await POST(request(payload));
    expect(first.status).toBe(502);
    expect(repeat.status).toBe(502);
    expect(persist).toHaveBeenCalledTimes(1);
    expect(model).toHaveBeenCalledTimes(1);
  });

  test('EXPECTED RED: immediate concurrent same-gesture POST must not create two author acts', async () => {
    const res = await Promise.all([POST(request(payload)), POST(request(payload))]);
    expect(res.map(x => x.status)).toEqual([502, 502]);
    expect(persist).toHaveBeenCalledTimes(1);
    expect(model).toHaveBeenCalledTimes(1);
  });
});

describe('current protected server still holds other fail-closed protections', () => {
  test('GREEN: a single authorized gesture persists once before one model call', async () => {
    const res = await POST(request(payload));
    expect(res.status).toBe(502);
    expect(preflight).toHaveBeenCalledTimes(1);
    expect(persist).toHaveBeenCalledTimes(1);
    expect(model).toHaveBeenCalledTimes(1);
    expect(model).toHaveBeenCalledWith(expect.objectContaining({
      relationshipId: payload.relationshipId,
      currentTurnIndex: 0,
    }));
  });

  test('GREEN: Sanctuary refuses both repeat calls with zero author writes', async () => {
    const denied = { ...payload, sanctuary: true };
    const results = await Promise.all([POST(request(denied)), POST(request(denied))]);
    expect(results.map(x => x.status)).toEqual([409, 409]);
    expect(preflight).not.toHaveBeenCalled();
    expect(persist).not.toHaveBeenCalled();
    expect(model).not.toHaveBeenCalled();
  });

  test('GREEN: foreign original relationship refuses before persistence', async () => {
    preflight.mockResolvedValue({ ok: false, reason: 'relationship_mismatch' });
    const res = await POST(request({ ...payload, relationshipId: 'fictional-foreign-A2' }));
    expect(res.status).toBe(409);
    expect(persist).not.toHaveBeenCalled();
    expect(model).not.toHaveBeenCalled();
  });

  test('GREEN: arbitrary client-made gesture identity is not silently accepted as authority', async () => {
    const res = await POST(request({
      ...payload, gestureId: 'fictional-opaque-gesture-unruled',
    }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('unknown');
    expect(persist).not.toHaveBeenCalled();
    expect(model).not.toHaveBeenCalled();
  });

  test('GREEN: anonymous caller does not get deduplication or author-write rights', async () => {
    identity.mockResolvedValue({ status: 'anonymous' });
    const res = await POST(request(payload));
    expect(res.status).toBe(401);
    expect(preflight).not.toHaveBeenCalled();
    expect(persist).not.toHaveBeenCalled();
    expect(model).not.toHaveBeenCalled();
  });
});
