import {
  assessClosureResponse, clearConfirmedContinuityHint,
  preserveClosureHint, readClosureHint,
  type PendingClosureHint,
} from '../closureReceipt';

const SID = 'session_a24d5571-42b7-43f7-a6f9-e37ab3722917';
const FOREIGN = 'session_f9b1c531-0224-4c89-aadd-9c8f99058723';
const A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

const continuity = {
  ok: true, code: 'SESSION_CLOSED', sessionId: SID, mode: 'continuity',
  state: 'completed', closureConfirmed: true, erasureConfirmed: false,
};
const sanctuary = {
  ok: false, code: 'ERASURE_WITNESS_PENDING', sessionId: SID,
  mode: 'sanctuary', state: 'erasure_pending', closureConfirmed: false,
  erasureConfirmed: false,
};

describe('original iOS R2 closure receipts (content free)', () => {
  it('requires exact positive Continuity R2 receipt; legacy ok=true is not proof', () => {
    expect(assessClosureResponse(200, continuity, SID, 'continuity')).toEqual({
      kind: 'continuity_closed', sessionId: SID,
    });
    expect(assessClosureResponse(200, { ok: true, sanctuary: false }, SID, 'continuity').kind)
      .toBe('unverified');
    expect(assessClosureResponse(200, { ...continuity, closureConfirmed: false }, SID, 'continuity').kind)
      .toBe('unverified');
    expect(assessClosureResponse(200, { ...continuity, sessionId: FOREIGN }, SID, 'continuity').kind)
      .toBe('unverified');
  });

  it('202 Sanctuary is pending, NEVER erased or completed', () => {
    expect(assessClosureResponse(202, sanctuary, SID, 'sanctuary')).toEqual({
      kind: 'sanctuary_erasure_pending', sessionId: SID,
    });
    expect(assessClosureResponse(200, { ok: true, sanctuary: true }, SID, 'sanctuary').kind)
      .toBe('unverified');
    expect(assessClosureResponse(200, { ...sanctuary, erasureConfirmed: true }, SID, 'sanctuary').kind)
      .toBe('unverified');
    expect(assessClosureResponse(202, { ...sanctuary, closureConfirmed: true }, SID, 'sanctuary').kind)
      .toBe('unverified');
    expect(assessClosureResponse(202, sanctuary, SID, 'continuity').kind)
      .toBe('unverified');
  });

  it('HTTP refusals, unavailable services and unparseable replies never mean success', () => {
    for (const code of [400, 401, 403, 404, 409, 428]) {
      expect(assessClosureResponse(code, continuity, SID, 'continuity').kind).toBe('refused');
    }
    for (const code of [500, 502, 503, 504]) {
      expect(assessClosureResponse(code, continuity, SID, 'continuity').kind).toBe('unavailable');
    }
    expect(assessClosureResponse(200, '<html/>', SID, 'continuity').kind).toBe('unverified');
  });
});

describe('content-free closure hints cannot grant account/erasure authority', () => {
  const storage = new Map<string,string>();
  const mockStorage = {
    setItem: (k: string, v: string) => { storage.set(k, v); },
    getItem: (k: string) => storage.get(k) ?? null,
    removeItem: (k: string) => { storage.delete(k); },
  };
  beforeEach(() => storage.clear());

  const hint = (): PendingClosureHint => ({
    version: 1, sessionId: SID, claimedMemberId: A,
    expectedPrivacy: 'sanctuary', state: 'sanctuary_erasure_pending',
    createdAt: '2026-10-22T12:00:00Z',
  });

  it('restores ONLY exact claimant + session, never confirmed erasure', () => {
    expect(preserveClosureHint(mockStorage, hint())).toBe(true);
    expect(readClosureHint(mockStorage, A, SID)).toEqual(hint());
    expect(readClosureHint(mockStorage, B, SID)).toBeNull();
    expect(readClosureHint(mockStorage, A, FOREIGN)).toBeNull();
  });

  it('does not clear a Sanctuary pending hint with Continuity cleanup for another SID', () => {
    expect(preserveClosureHint(mockStorage, hint())).toBe(true);
    clearConfirmedContinuityHint(mockStorage, A, FOREIGN);
    expect(readClosureHint(mockStorage, A, SID)).not.toBeNull();
  });

  it('fails closed if local recovery storage cannot write', () => {
    expect(preserveClosureHint({ setItem: () => { throw Error('quota exceeded'); } }, hint()))
      .toBe(false);
    expect(storage.size).toBe(0);
  });

  it('never stores message content and rejects invalid identity', () => {
    const invalid = { ...hint(), claimedMemberId: 'local_guest' };
    expect(preserveClosureHint(mockStorage, invalid)).toBe(false);
    expect(storage.size).toBe(0);
    expect(JSON.stringify(hint())).not.toContain('memberWords');
  });
});
