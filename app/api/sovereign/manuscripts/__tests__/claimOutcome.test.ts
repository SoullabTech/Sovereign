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

const tx = {
  committed: 0,
  rolledBack: 0,
  writes: [] as string[],
  // What the member-bound lookup of the file arrival finds after a claim returned false.
  arrivalRows: [] as Array<{ manuscript_id: string | null }>,
  lookups: [] as unknown[][],
  lookupSql: [] as string[],
  lookupThrows: false,
};
jest.mock('@/lib/db/postgres', () => {
  const client = {
    query: jest.fn(async (sql: string, params?: unknown[]) => {
      tx.writes.push(sql.trim().split(/\s+/).slice(0, 3).join(' '));
      if (/SELECT manuscript_id FROM manuscript_source_arrivals/.test(sql)) {
        tx.lookups.push(params ?? []);
        tx.lookupSql.push(sql);
        if (tx.lookupThrows) throw Object.assign(new Error('fictional lookup fault'), { name: 'FictionalLookupFault' });
        return { rows: tx.arrivalRows };
      }
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
  tx.arrivalRows = [];
  tx.lookups = [];
  tx.lookupSql = [];
  tx.lookupThrows = false;
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

  it('claim RETURNS false and NO unclaimed original of the member is held under that id: 409, NOT retryable, rolled back, a content-free trace', async () => {
    claim.mockResolvedValue(false);
    tx.arrivalRows = []; // removed, never existed, or someone else's: indistinguishable by design
    const res = await POST(req({ sourceArrivalId: FILE_ARRIVAL }));
    expect(res.status).toBe(409);
    const b = await body(res);
    expect(b).toMatchObject({ code: 'source_original_unavailable', retryable: false });
    expect(b.error).toContain('Choose the file again');
    expect(b.error).not.toContain('You can try again'); // a retry of the same save can never work, so it is not offered
    expect(b.id).toBeUndefined(); // no manuscript id: none exists
    expect(b.sourceCustody).toBeUndefined();
    expect(tx.committed).toBe(0);
    expect(tx.rolledBack).toBe(1);
    expect(tx.lookups).toEqual([[FILE_ARRIVAL, MEMBER]]); // the lookup is member-bound: it cannot reveal anyone else's arrival
    expect(tx.lookupSql[0]).toMatch(/WHERE\s+id\s*=\s*\$1\s+AND\s+member_id\s*=\s*\$2/); // ... in the SQL itself, not just in the parameters
    const line = logged.find((l) => l.includes('custody not bound'));
    expect(line).toContain('claim_not_bound');
    expect(line).toContain('original_unavailable');
    expect(line).not.toContain(MEMBER); // identified by memberRef, never the raw member id
    expect(logged.filter((l) => l.includes('manuscript saved'))).toEqual([]); // the success marker is never emitted
  });

  it('claim RETURNS false because the member\'s own Work already holds that original (a first save landed, its response was lost): 409 source_already_attached, NOT retryable, nothing new saved', async () => {
    claim.mockResolvedValue(false);
    tx.arrivalRows = [{ manuscript_id: 'row-fictional-first-save' }];
    const res = await POST(req({ sourceArrivalId: FILE_ARRIVAL }));
    expect(res.status).toBe(409);
    const b = await body(res);
    expect(b).toMatchObject({ code: 'source_already_attached', retryable: false });
    expect(b.error).toContain('already attached to a Work in your library');
    expect(b.error).not.toContain('was not saved'); // a Work from the first save exists; the copy must not say otherwise
    expect(b.error).not.toContain('You can try again');
    expect(b.id).toBeUndefined();
    expect(tx.committed).toBe(0);
    expect(tx.rolledBack).toBe(1); // the duplicate Work this attempt created is rolled back
  });

  it('claim RETURNS false while the arrival is still unclaimed (bytes or hash no longer verify): source_original_unavailable, NOT retryable', async () => {
    claim.mockResolvedValue(false);
    tx.arrivalRows = [{ manuscript_id: null }];
    const res = await POST(req({ sourceArrivalId: FILE_ARRIVAL }));
    expect(res.status).toBe(409);
    expect(await body(res)).toMatchObject({ code: 'source_original_unavailable', retryable: false });
    expect(tx.rolledBack).toBe(1);
  });

  it('the cause lookup itself fails: still refused and rolled back, and it stays the generic RETRYABLE refusal (a cause that was not established is never presented as permanent)', async () => {
    claim.mockResolvedValue(false);
    tx.lookupThrows = true;
    const res = await POST(req({ sourceArrivalId: FILE_ARRIVAL }));
    expect(res.status).toBe(409);
    expect(await body(res)).toMatchObject({ code: 'source_custody_not_bound', retryable: true });
    expect(tx.committed).toBe(0);
    expect(tx.rolledBack).toBe(1);
    const all = logged.join('\n');
    expect(all).toContain('FictionalLookupFault');
    expect(all).not.toContain('fictional lookup fault'); // the NAME, never the message
  });

  it('claim THROWS: 409 and rolled back, and the log carries the error NAME but never its message or content', async () => {
    const err = new Error(`fictional failure mentioning ${CANARY}`); err.name = 'FictionalClaimError';
    claim.mockRejectedValue(err);
    const res = await POST(req({ sourceArrivalId: FILE_ARRIVAL }));
    expect(res.status).toBe(409);
    expect(await body(res)).toMatchObject({ code: 'source_custody_not_bound', retryable: true }); // KMS/DB hiccup: a retry may work
    expect(tx.committed).toBe(0);
    expect(tx.rolledBack).toBe(1);
    expect(tx.lookups).toEqual([]); // nothing to classify: the claim never returned
    const all = logged.join('\n');
    expect(all).toContain('claim_threw');
    expect(all).toContain('FictionalClaimError');
    expect(all).not.toContain(CANARY);
  });

  it('claim THROWS ENOENT (the held bytes are gone from the vault): permanent, source_original_unavailable, NOT retryable', async () => {
    claim.mockRejectedValue(Object.assign(new Error('fictional vault miss'), { code: 'ENOENT', name: 'Error' }));
    const res = await POST(req({ sourceArrivalId: FILE_ARRIVAL }));
    expect(res.status).toBe(409);
    expect(await body(res)).toMatchObject({ code: 'source_original_unavailable', retryable: false });
    expect(tx.rolledBack).toBe(1);
  });

  it('ENOENT on a PASTED import is not an "original is gone" signal (there is no file): it stays the generic retryable refusal', async () => {
    supplied.mockRejectedValue(Object.assign(new Error('fictional'), { code: 'ENOENT' }));
    const res = await POST(req({ confirmedText: 'Fictional pasted text.' }));
    expect(res.status).toBe(409);
    expect(await body(res)).toMatchObject({ code: 'source_custody_not_bound', retryable: true });
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
    expect(await body(res)).toMatchObject({ code: 'source_custody_not_bound', retryable: true }); // there is no file arrival to classify
    expect(tx.lookups).toEqual([]);
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
