import {
  assessClosureResponse, displayStateForRestoredClosureHint,
  QUALIFIED_R2_CLOSE_PATH, requestQualifiedClosure, clearConfirmedContinuityHint,
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


describe('R2 closure dispatch — fictional transport and crash recovery', () => {
  let values: Map<string, string>;
  let storage: {
    setItem: (key: string, val: string) => void;
    getItem: (key: string) => string | null;
    removeItem: (key: string) => void;
  };
  const requestTime = '2026-10-22T12:00:00Z';

  beforeEach(() => {
    values = new Map();
    storage = {
      setItem: (key, val) => { values.set(key, val); },
      getItem: (key) => values.get(key) ?? null,
      removeItem: (key) => { values.delete(key); },
    };
  });

  it('default-off capability gate sends NOTHING and creates no hint', async () => {
    const send = jest.fn(async () => ({ status: 200, json: async () => continuity }));
    const result = await requestQualifiedClosure({
      enabled: false, claimedMemberId: A, currentMemberClaim: A,
      sessionId: SID, expectedPrivacy: 'continuity', storage, send, requestTime,
    });
    expect(result.kind).toBe('unavailable');
    expect(send).not.toHaveBeenCalled();
    expect(values.size).toBe(0);
  });

  it('rejects member/account mismatch before writing or sending', async () => {
    const send = jest.fn(async () => ({ status: 200, json: async () => continuity }));
    const result = await requestQualifiedClosure({
      enabled: true, claimedMemberId: A, currentMemberClaim: B,
      sessionId: SID, expectedPrivacy: 'continuity', storage, send, requestTime,
    });
    expect(result.kind).toBe('unverified');
    expect(send).not.toHaveBeenCalled();
    expect(values.size).toBe(0);
  });

  it('if recovery storage fails, never sends potentially destructive close', async () => {
    const send = jest.fn(async () => ({ status: 200, json: async () => continuity }));
    const result = await requestQualifiedClosure({
      enabled: true, claimedMemberId: A, currentMemberClaim: A,
      sessionId: SID, expectedPrivacy: 'continuity',
      storage: {
        setItem: () => { throw Error('QuotaExceeded'); },
        removeItem: () => {},
      },
      send, requestTime,
    });
    expect(result.kind).toBe('unavailable');
    expect(send).not.toHaveBeenCalled();
  });

  it('exact 200 Continuity receipt clears ONLY that close hint', async () => {
    const send = jest.fn(async () => ({ status: 200, json: async () => continuity }));
    const result = await requestQualifiedClosure({
      enabled: true, claimedMemberId: A, currentMemberClaim: A,
      sessionId: SID, expectedPrivacy: 'continuity', storage, send, requestTime,
    });
    expect(result).toEqual({ kind: 'continuity_closed', sessionId: SID });
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({
      memberId: A, sessionId: SID, isSanctuary: false, endedAt: requestTime,
    });
    expect(readClosureHint(storage, A, SID)).toBeNull();
  });

  it('202 Sanctuary creates a pending obligation pointer, NOT erased=true', async () => {
    const send = jest.fn(async () => ({ status: 202, json: async () => sanctuary }));
    const result = await requestQualifiedClosure({
      enabled: true, claimedMemberId: A, currentMemberClaim: A,
      sessionId: SID, expectedPrivacy: 'sanctuary', storage, send, requestTime,
    });
    expect(result).toEqual({ kind: 'sanctuary_erasure_pending', sessionId: SID });
    expect(readClosureHint(storage, A, SID)?.state).toBe('sanctuary_erasure_pending');
    expect(readClosureHint(storage, B, SID)).toBeNull();
  });

  it('legacy 200, refused 409, and transport failure retain unverified hint', async () => {
    for (const response of [
      async () => ({ status: 200, json: async () => ({ ok: true, sanctuary: true }) }),
      async () => ({ status: 409, json: async () => ({ code: 'CONFLICT' }) }),
      async (): Promise<{status:number;json:()=>Promise<unknown>}> => { throw Error('lost connection'); },
    ]) {
      values.clear();
      const result = await requestQualifiedClosure({
        enabled: true, claimedMemberId: A, currentMemberClaim: A,
        sessionId: SID, expectedPrivacy: 'sanctuary', storage, send: response,
        requestTime,
      });
      expect(['unverified', 'refused', 'unavailable']).toContain(result.kind);
      expect(readClosureHint(storage, A, SID)?.state).toBe('request_unverified');
    }
  });
});


describe('browser restart cannot promote local storage to erasure authority', () => {
  it('presents an unresolved or even pending stored hint ONLY as unverified', () => {
    const prior: PendingClosureHint = {
      version: 1,
      sessionId: SID,
      claimedMemberId: A,
      expectedPrivacy: 'sanctuary',
      state: 'sanctuary_erasure_pending',
      createdAt: '2026-10-22T12:00:00Z',
    };
    expect(displayStateForRestoredClosureHint(null)).toBe('ready');
    expect(displayStateForRestoredClosureHint(prior)).toBe('unverified');
    expect(displayStateForRestoredClosureHint({
      ...prior, state: 'request_unverified',
    })).toBe('unverified');
  });
});

describe('legacy-destructive-endpoint cannot be selected by client flag', () => {
  it('uses a NEW guarded route with no legacy finalize fallthrough', () => {
    expect(QUALIFIED_R2_CLOSE_PATH).toBe('/api/sovereign/session/finalize-r2');
    // The separately governed R2 endpoint is NOT implemented by this PR.
    // Until it is approved, attempting a request must fail, never run legacy.
    const fs = require('fs') as typeof import('fs');
    const path = require('path') as typeof import('path');
    const oracle = fs.readFileSync(
      path.join(process.cwd(), 'components/OracleConversation.tsx'), 'utf8',
    );
    expect(oracle).toContain('send: (payload) => apiFetch(QUALIFIED_R2_CLOSE_PATH');
    expect(oracle).not.toContain(
      "send: (payload) => apiFetch('/api/sovereign/session/finalize'",
    );
  });
});
