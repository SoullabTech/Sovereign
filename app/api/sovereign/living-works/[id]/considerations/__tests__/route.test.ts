/**
 * Material consideration route — WS2-SUBSTRATE-01 Repair 2.
 *
 * FALSIFICATION TESTS. Each one names the thing that must NOT be true, so a
 * future change that reintroduces it fails here rather than in production:
 *
 *   - 'belongs' is not an accepted state — belonging is the declaration row's
 *     existence, and a route that accepted it would put the assertion in two
 *     places;
 *   - a consideration never arrives without a member act (401 before any
 *     query);
 *   - no-such-work, someone-else's-work and someone-else's-material all answer
 *     404 — a foreign id learns nothing;
 *   - the Belongs → Maybe transition happens in ONE transaction, and the
 *     withdrawal of belonging is part of it, not a separate hopeful write;
 *   - re-considering moves the CURRENT stance and does not append history;
 *   - DELETE is member-scoped through the owning work in the predicate.
 */
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), transaction: jest.fn() }));
jest.mock('@/lib/privacy/memberRef', () => ({ memberRef: () => 'ref' }));

import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query, transaction } from '@/lib/db/postgres';
import { DELETE, POST } from '../route';

const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockQuery = query as jest.Mock;
const mockTx = transaction as jest.Mock;

const MEMBER = '11111111-1111-1111-1111-111111111111';
const WORK = '22222222-2222-2222-2222-222222222222';
const MANUSCRIPT = '33333333-3333-3333-3333-333333333333';

const ctx = { params: Promise.resolve({ id: WORK }) };
const pair = { materialType: 'manuscript', materialId: MANUSCRIPT };

function req(method: string, body: unknown): NextRequest {
  return new NextRequest(`http://localhost/api/sovereign/living-works/${WORK}/considerations`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** Work is owned, material is owned — the happy preamble. */
function ownsBoth() {
  mockQuery
    .mockResolvedValueOnce({ rows: [{ id: WORK }] })
    .mockResolvedValueOnce({ rows: [{ id: MANUSCRIPT }] });
}

/** A transaction client whose queries return the given results in order. */
function txReturning(...results: Array<{ rows: unknown[] }>) {
  mockTx.mockImplementation(async (cb: (c: { query: jest.Mock }) => unknown) => {
    const client = { query: jest.fn() };
    for (const r of results) client.query.mockResolvedValueOnce(r);
    const out = await cb(client);
    (txReturning as unknown as { lastClient: jest.Mock }).lastClient = client.query;
    return out;
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockQuery.mockReset();
  mockAuth.mockReset();
  mockTx.mockReset();
});

describe('POST — the state gate', () => {
  it("REFUSES 'belongs' as a state — belonging is the declaration, not a value here", async () => {
    mockAuth.mockResolvedValue(MEMBER);
    const res = await POST(req('POST', { ...pair, state: 'belongs' }), ctx);
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: "state must be 'maybe' or 'not_now'",
    });
    // The gate fires before anything is read or written.
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockTx).not.toHaveBeenCalled();
  });

  it.each(['', 'considered', 'not-now', 'MAYBE', 'resolved'])(
    'refuses the unknown state %p without touching the database',
    async (state) => {
      mockAuth.mockResolvedValue(MEMBER);
      const res = await POST(req('POST', { ...pair, state }), ctx);
      expect(res.status).toBe(400);
      expect(mockTx).not.toHaveBeenCalled();
    }
  );

  it.each(['maybe', 'not_now'])('accepts %p', async (state) => {
    mockAuth.mockResolvedValue(MEMBER);
    ownsBoth();
    txReturning(
      { rows: [] },
      { rows: [{ id: 'c1', material_type: 'manuscript', material_id: MANUSCRIPT, state, acted_at: 'T' }] }
    );
    const res = await POST(req('POST', { ...pair, state }), ctx);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({
      consideration: { state },
      withdrewBelonging: false,
    });
  });
});

describe('POST — nothing considers on the member\'s behalf', () => {
  it('refuses without a member (401), before any query', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(req('POST', { ...pair, state: 'maybe' }), ctx);
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockTx).not.toHaveBeenCalled();
  });

  it("answers 404 for someone else's work, and writes nothing", async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [] }); // work not owned
    const res = await POST(req('POST', { ...pair, state: 'maybe' }), ctx);
    expect(res.status).toBe(404);
    expect(mockTx).not.toHaveBeenCalled();
  });

  it("answers 404 for someone else's material, and writes nothing", async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: WORK }] })
      .mockResolvedValueOnce({ rows: [] }); // material not owned
    const res = await POST(req('POST', { ...pair, state: 'maybe' }), ctx);
    expect(res.status).toBe(404);
    expect(mockTx).not.toHaveBeenCalled();
  });

  it('refuses an unverifiable material type rather than trusting it', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [{ id: WORK }] });
    const res = await POST(
      req('POST', { materialType: 'transcript', materialId: MANUSCRIPT, state: 'maybe' }),
      ctx
    );
    expect(res.status).toBe(404);
    expect(mockTx).not.toHaveBeenCalled();
  });
});

describe('POST — Belongs → Maybe is one transaction', () => {
  it('withdraws the belonging and records the consideration inside a single transaction', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    ownsBoth();
    txReturning(
      { rows: [{ id: 'm1' }] }, // a belonging existed and was withdrawn
      { rows: [{ id: 'c1', material_type: 'manuscript', material_id: MANUSCRIPT, state: 'maybe', acted_at: 'T' }] }
    );

    const res = await POST(req('POST', { ...pair, state: 'maybe' }), ctx);

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ withdrewBelonging: true });
    expect(mockTx).toHaveBeenCalledTimes(1);

    const calls = (txReturning as unknown as { lastClient: jest.Mock }).lastClient.mock.calls;
    // Both halves ran, in order, on the SAME client — never as separate writes.
    expect(String(calls[0][0])).toContain('DELETE FROM living_work_materials');
    expect(String(calls[1][0])).toContain('INSERT INTO living_work_material_considerations');
    // The withdrawal is scoped to this pair, not the whole work.
    expect(calls[0][1]).toEqual([WORK, 'manuscript', MANUSCRIPT]);
  });

  it('reports withdrewBelonging false when there was no belonging to withdraw', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    ownsBoth();
    txReturning(
      { rows: [] },
      { rows: [{ id: 'c1', material_type: 'manuscript', material_id: MANUSCRIPT, state: 'not_now', acted_at: 'T' }] }
    );
    const res = await POST(req('POST', { ...pair, state: 'not_now' }), ctx);
    await expect(res.json()).resolves.toMatchObject({ withdrewBelonging: false });
  });
});

describe('POST — current stance, not a history', () => {
  it('UPDATES the existing row rather than appending a second one', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    ownsBoth();
    txReturning(
      { rows: [] },
      { rows: [{ id: 'c1', material_type: 'manuscript', material_id: MANUSCRIPT, state: 'not_now', acted_at: 'T2' }] }
    );

    await POST(req('POST', { ...pair, state: 'not_now' }), ctx);

    const calls = (txReturning as unknown as { lastClient: jest.Mock }).lastClient.mock.calls;
    const insert = String(calls[1][0]);
    // One row per pair: the conflict target is the pair, and it updates.
    expect(insert).toContain('ON CONFLICT (living_work_id, material_type, material_id)');
    expect(insert).toContain('DO UPDATE SET');
    // acted_by and acted_at move to the latest act — the stance is current.
    expect(insert).toContain('acted_by = EXCLUDED.acted_by');
    expect(insert).toContain('acted_at = now()');
    // No history table is written. If one is ever wanted, it is its own model.
    expect(calls.every((c: unknown[]) => !String(c[0]).match(/_history|_events|_log\b/))).toBe(true);
  });
});

describe('DELETE — withdrawing the consideration', () => {
  it('refuses without a member (401)', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await DELETE(req('DELETE', pair), ctx);
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('scopes the delete through the owning work in the predicate', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'c1' }] });
    const res = await DELETE(req('DELETE', pair), ctx);
    expect(res.status).toBe(200);
    const sql = String(mockQuery.mock.calls[0][0]);
    expect(sql).toContain('USING living_works w');
    expect(sql).toContain('w.member_id = $2');
    // It removes the statement, never the thing stated about.
    expect(sql).not.toMatch(/DELETE FROM (studio_materials|member_manuscripts)/);
  });

  it("answers 404 when there is nothing of the member's to withdraw", async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const res = await DELETE(req('DELETE', pair), ctx);
    expect(res.status).toBe(404);
  });

  it('requires both halves of the pair', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    const res = await DELETE(req('DELETE', { materialType: 'manuscript' }), ctx);
    expect(res.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });
});


describe('POST — a lost race is a 409, never a 500', () => {
  /* Once the pair lock serializes two contradictory member acts, one of them
     legitimately loses. That is a real outcome and must reach the member in
     words (D-014), not as "Something went wrong". */
  function conflict() {
    const e = new Error(
      'material_relationship_conflict: this material already belongs to that work.'
    ) as Error & { code?: string };
    e.code = '23001'; // restrict_violation
    return e;
  }

  it('answers 409 with an actionable message when the guard refuses', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    ownsBoth();
    mockTx.mockRejectedValue(conflict());
    const res = await POST(req('POST', { ...pair, state: 'maybe' }), ctx);
    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toEqual({
      error: 'That relationship changed while you were acting. Refresh it and choose again.',
    });
  });

  it('does NOT retry and pick a winner — one attempt, then the refusal', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    ownsBoth();
    mockTx.mockRejectedValue(conflict());
    await POST(req('POST', { ...pair, state: 'maybe' }), ctx);
    expect(mockTx).toHaveBeenCalledTimes(1);
  });

  it('still answers 500 for an unrelated failure — the 409 is specific', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    ownsBoth();
    mockTx.mockRejectedValue(new Error('connection terminated'));
    const res = await POST(req('POST', { ...pair, state: 'maybe' }), ctx);
    expect(res.status).toBe(500);
  });

  it('does not treat a bare restrict_violation from elsewhere as this conflict', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    ownsBoth();
    const other = new Error('some other restriction') as Error & { code?: string };
    other.code = '23001';
    mockTx.mockRejectedValue(other);
    const res = await POST(req('POST', { ...pair, state: 'maybe' }), ctx);
    expect(res.status).toBe(500);
  });
});
