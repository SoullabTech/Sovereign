/**
 * D4 (server half) - what POST /api/sovereign/manuscripts does when the original cannot be bound to the new Work.
 *
 * The claim now runs INSIDE the transaction that creates the Work, so a failed claim rolls the whole import back: nothing is
 * saved, the answer is a 409 the client can retry, and the trace left behind is content-free. These tests drive the real route
 * with a transaction double that records whether the callback committed or rolled back, which is the substance: "nothing saved"
 * is asserted as a ROLLBACK, not inferred from a status code.
 */
import { NextRequest } from 'next/server';

const MEMBER = '11111111-1111-4111-8111-111111111111';
const CANARY = 'WSICANARYSERVERSIDE0123456789ABCDEF';

const tx = { committed: 0, rolledBack: 0, writes: [] as string[] };
jest.mock('@/lib/db/postgres', () => {
  const client = {
    query: jest.fn(async (sql: string) => {
      tx.writes.push(sql.trim().split(/\s+/).slice(0, 3).join(' '));
      if (/INSERT INTO member_manuscripts|INSERT INTO manuscript_sections|INSERT INTO living_works|INSERT INTO living_work_expressions/.test(sql)) {
        return { rows: [{ id: 'row-fictional-1' }] };
      }
      return { rows: [] };
    }),
  };
  return {
    query: jest.fn(async () => ({ rows: [] })),
    transaction: jest.fn(async (fn: (c: unknown) => unknown) => {
      try {
        const out = await fn(client);
        tx.committed++;
        return out;
      } catch (e) {
        tx.rolledBack++;
        throw e;
      }
    }),
  };
});
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn(async () => '11111111-1111-4111-8111-111111111111') }));
jest.mock('@/lib/manuscript/source/arrivals', () => ({
  prepareArrivalClaim: jest.fn(async () => null),
  claimArrivalWithClient: jest.fn(),
  recordSuppliedArrivalWithClient: jest.fn(async () => ({ id: 'supplied-arrival-1' })),
}));
jest.mock('@/lib/cabin/request', () => ({ cabinStore: jest.fn(), cabinMemberFromRequest: jest.fn(), setCabinSessionCookie: jest.fn() }));

import { POST } from '../route';
import { claimArrivalWithClient, prepareArrivalClaim, recordSuppliedArrivalWithClient } from '@/lib/manuscript/source/arrivals';

const claim = claimArrivalWithClient as jest.Mock;
const prepare = prepareArrivalClaim as jest.Mock;
const supplied = recordSuppliedArrivalWithClient as jest.Mock;
const FILE_ARRIVAL = '44444444-4444-4444-8444-444444444444';

let logged: string[];

function req(extra: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/sovereign/manuscripts', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'Fictional Work', sections: [{ heading: 'One', body: 'Fictional body text.' }], createWork: true, ...extra }),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  tx.committed = 0;
  tx.rolledBack = 0;
  tx.writes = [];
  prepare.mockResolvedValue(null);
  supplied.mockResolvedValue({ id: 'supplied-arrival-1' });
  logged = [];
  for (const m of ['log', 'info', 'warn', 'error'] as const) {
    jest.spyOn(console, m).mockImplementation((...a: unknown[]) => { logged.push(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')); });
  }
});
afterEach(() => jest.restoreAllMocks());

describe('bound', () => {
  it('file-backed: committed once, labelled source_custodied, claimed in the SAME transaction, no custody warning', async () => {
    const prepared = { envelope: 'fictional-prepared-context' };
    prepare.mockResolvedValue(prepared);
    claim.mockResolvedValue(true);
    const res = await POST(req({ sourceArrivalId: FILE_ARRIVAL }));
    expect(res.status).toBe(201);
    expect((await res.json()).sourceCustody).toBe('source_custodied');
    expect(prepare).toHaveBeenCalledWith(FILE_ARRIVAL, MEMBER);
    expect(claim.mock.calls[0]![4]).toBe(prepared); // the context read before the transaction is the one the claim uses
    expect(tx.committed).toBe(1);
    expect(tx.rolledBack).toBe(0);
    expect(claim).toHaveBeenCalledTimes(1);
    expect(claim.mock.calls[0]![1]).toBe(FILE_ARRIVAL);
    expect(typeof claim.mock.calls[0]![0].query).toBe('function'); // the transaction client, not a bare query
    expect(logged.filter((l) => l.includes('custody not bound'))).toEqual([]);
  });

  it('pasted: the supplied arrival is recorded and claimed in the SAME transaction, with no encrypted-landing context', async () => {
    claim.mockResolvedValue(true);
    const res = await POST(req({ confirmedText: 'Fictional pasted text.' }));
    expect(res.status).toBe(201);
    expect((await res.json()).sourceCustody).toBe('source_custodied');
    expect(supplied).toHaveBeenCalledTimes(1);
    expect(typeof supplied.mock.calls[0]![0].query).toBe('function'); // the transaction client
    expect(claim.mock.calls[0]![1]).toBe('supplied-arrival-1');
    expect(claim.mock.calls[0]![4]).toBeNull();
    expect(tx.committed).toBe(1);
  });

  it('both a file arrival and pasted text: the FILE arrival is claimed and the pasted text is NOT recorded as a second source', async () => {
    claim.mockResolvedValue(true);
    const res = await POST(req({ sourceArrivalId: FILE_ARRIVAL, confirmedText: 'Fictional pasted text.' }));
    expect(res.status).toBe(201);
    expect(claim).toHaveBeenCalledTimes(1);
    expect(claim.mock.calls[0]![1]).toBe(FILE_ARRIVAL);
    expect(supplied).not.toHaveBeenCalled();
  });

  it('neither a file arrival nor pasted text: saved as before, labelled legacy, no claim attempted, nothing refused', async () => {
    const res = await POST(req({}));
    expect(res.status).toBe(201);
    expect((await res.json()).sourceCustody).toBe('legacy_interpreted_import');
    expect(claim).not.toHaveBeenCalled();
    expect(tx.committed).toBe(1);
  });
});

describe('refused: the original could not be bound, so NOTHING is saved', () => {
  const body = async (res: Response) => res.json();

  it('claim RETURNS false (the KMS-outage shape): 409, retryable, the whole transaction rolled back, a content-free trace', async () => {
    claim.mockResolvedValue(false);
    const res = await POST(req({ sourceArrivalId: FILE_ARRIVAL }));
    expect(res.status).toBe(409);
    const b = await body(res);
    expect(b).toMatchObject({ code: 'source_custody_not_bound', retryable: true });
    expect(b.id).toBeUndefined(); // no manuscript id: none exists
    expect(b.sourceCustody).toBeUndefined();
    expect(tx.committed).toBe(0);
    expect(tx.rolledBack).toBe(1);
    const line = logged.find((l) => l.includes('custody not bound'));
    expect(line).toContain('claim_not_bound');
    expect(line).not.toContain(MEMBER); // identified by memberRef, never the raw member id
    expect(logged.filter((l) => l.includes('manuscript saved'))).toEqual([]); // the success marker is never emitted
  });

  it('claim THROWS: 409 and rolled back, and the log carries the error NAME but never its message or content', async () => {
    const err = new Error(`fictional failure mentioning ${CANARY}`); err.name = 'FictionalClaimError';
    claim.mockRejectedValue(err);
    const res = await POST(req({ sourceArrivalId: FILE_ARRIVAL }));
    expect(res.status).toBe(409);
    expect(tx.committed).toBe(0);
    expect(tx.rolledBack).toBe(1);
    const all = logged.join('\n');
    expect(all).toContain('claim_threw');
    expect(all).toContain('FictionalClaimError');
    expect(all).not.toContain(CANARY);
  });

  it('reading the claim context fails BEFORE anything is written: 409, no transaction was even opened', async () => {
    prepare.mockRejectedValue(Object.assign(new Error(`fictional read failure ${CANARY}`), { name: 'FictionalReadError' }));
    const res = await POST(req({ sourceArrivalId: FILE_ARRIVAL }));
    expect(res.status).toBe(409);
    expect(tx.committed + tx.rolledBack).toBe(0);
    expect(claim).not.toHaveBeenCalled();
    expect(logged.join('\n')).not.toContain(CANARY);
  });

  it('a pasted import whose text arrival cannot be bound is refused and rolled back too (the supplied arrival goes with it)', async () => {
    claim.mockResolvedValue(false);
    const res = await POST(req({ confirmedText: 'Fictional pasted text.' }));
    expect(res.status).toBe(409);
    expect(supplied).toHaveBeenCalledTimes(1); // it ran inside the transaction ...
    expect(tx.rolledBack).toBe(1);             // ... which was rolled back, so it did not persist
    expect(tx.committed).toBe(0);
    expect(logged.some((l) => l.includes('claim_not_bound'))).toBe(true);
  });

  it('recording the supplied arrival fails: refused and rolled back, never a half-saved import', async () => {
    supplied.mockRejectedValue(Object.assign(new Error('fictional db fault'), { name: 'FictionalDbFault' }));
    const res = await POST(req({ confirmedText: 'Fictional pasted text.' }));
    expect(res.status).toBe(409);
    expect(tx.committed).toBe(0);
    expect(tx.rolledBack).toBe(1);
    expect(claim).not.toHaveBeenCalled();
  });

  it('an unrelated database failure while saving sections is still a 500, not mislabelled as a custody refusal', async () => {
    const { transaction } = jest.requireMock('@/lib/db/postgres');
    transaction.mockImplementationOnce(async () => { throw new Error('fictional section write failure'); });
    const res = await POST(req({ sourceArrivalId: FILE_ARRIVAL }));
    expect(res.status).toBe(500);
    expect(logged.some((l) => l.includes('custody not bound'))).toBe(false);
  });
});
