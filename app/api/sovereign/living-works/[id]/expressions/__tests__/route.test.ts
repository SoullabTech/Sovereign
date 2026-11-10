/**
 * Expression declaration route — Guard 1's first caller. Tests the SHIPPED
 * semantics (Work Home, Slice 6 — this route arrived on trunk in parallel
 * with the relationship-loop slice; the two implementations were reconciled
 * to trunk's, which is stricter where they differed):
 *
 *   - the type gate fires before any query (only 'manuscript' today);
 *   - no-such-work, someone-else's-work, and someone-else's-manuscript all
 *     answer 404 — a foreign id learns nothing;
 *   - declaring twice answers 200 { alreadyDeclared } and preserves the
 *     original act;
 *   - DELETE identifies the declaration by query params, member-scoped
 *     through the owning work in the predicate;
 *   - WS-DELETE-01: the manuscript check and the insert are ONE transaction that
 *     first holds the writing (advisory lock → Work row → manuscript row → insert),
 *     so a Delete of the writing cannot commit between them. The order asserted
 *     here is only a guard on the statement sequence; the behaviour under real
 *     concurrency is proved against PostgreSQL by
 *     tests/constitutional/ws-delete/dynamic/declarationRace.probe.test.ts.
 */
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), transaction: jest.fn() }));
// lib/cabin/request imports 'server-only', which throws outside a Server Component; the cabin (offline) branch
// is not under test here. Same convention as the other route tests that import a route carrying the cabin branch.
jest.mock('@/lib/cabin/request', () => ({
  cabinStore: jest.fn(),
  cabinMemberFromRequest: jest.fn(),
  setCabinSessionCookie: jest.fn(),
}));

import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query, transaction } from '@/lib/db/postgres';
import { DELETE, POST } from '../route';

const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockQuery = query as jest.Mock;
const mockTransaction = transaction as jest.Mock;
/** The transaction client: every statement the declaration makes INSIDE its one transaction lands here. */
const mockTx = jest.fn();

const MEMBER = '11111111-1111-1111-1111-111111111111';
const WORK = '22222222-2222-2222-2222-222222222222';
const MANUSCRIPT = '33333333-3333-3333-3333-333333333333';

const ctx = { params: Promise.resolve({ id: WORK }) };

function postRequest(body: unknown): NextRequest {
  return new NextRequest(`http://localhost/api/sovereign/living-works/${WORK}/expressions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}
function deleteRequest(params: string): NextRequest {
  return new NextRequest(
    `http://localhost/api/sovereign/living-works/${WORK}/expressions${params}`,
    { method: 'DELETE' }
  );
}

const declaration = { expressionType: 'manuscript', expressionId: MANUSCRIPT };

beforeEach(() => {
  jest.clearAllMocks();
  mockQuery.mockReset();
  mockTx.mockReset();
  mockAuth.mockReset();
  mockTransaction.mockReset();
  mockTransaction.mockImplementation(async (callback: (tx: { query: jest.Mock }) => unknown) => callback({ query: mockTx }));
});

/** Statements inside the transaction, in order: advisory lock, Work row, manuscript row, [insert]. */
const tx = {
  locked: () => mockTx.mockResolvedValueOnce({ rows: [{ pg_advisory_xact_lock_shared: '' }], rowCount: 1 }),
  work: (found: boolean) =>
    mockTx.mockResolvedValueOnce({ rows: found ? [{ id: WORK }] : [], rowCount: found ? 1 : 0 }),
  manuscript: (found: boolean) =>
    mockTx.mockResolvedValueOnce({ rows: found ? [{ id: MANUSCRIPT }] : [], rowCount: found ? 1 : 0 }),
};

describe('POST /living-works/[id]/expressions — the declaration', () => {
  it('refuses without a member (401)', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(postRequest(declaration), ctx);
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('the type gate fires before any query touches the database', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    const res = await POST(postRequest({ expressionType: 'journal', expressionId: MANUSCRIPT }), ctx);
    expect(res.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('answers 404 for no-such-work — a foreign id learns nothing', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const res = await POST(postRequest(declaration), ctx);
    expect(res.status).toBe(404);
  });

  it("answers 404 for someone else's work — same silence as absence", async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: WORK, member_id: 'someone-else' }],
      rowCount: 1,
    });
    const res = await POST(postRequest(declaration), ctx);
    expect(res.status).toBe(404);
  });

  it("answers 404 for a manuscript that is not the member's own", async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [{ id: WORK, member_id: MEMBER }], rowCount: 1 });
    tx.locked(); tx.work(true); tx.manuscript(false);
    const res = await POST(postRequest(declaration), ctx);
    expect(res.status).toBe(404);
    // Refused inside the transaction, before any insert.
    expect(mockTx.mock.calls.some((c) => String(c[0]).includes('INSERT INTO living_work_expressions'))).toBe(false);
  });

  it('answers 404 when the Work is deleted between the ownership read and the lock — not an FK error', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [{ id: WORK, member_id: MEMBER }], rowCount: 1 });
    tx.locked(); tx.work(false);
    const res = await POST(postRequest(declaration), ctx);
    expect(res.status).toBe(404);
    expect(mockTx.mock.calls.some((c) => String(c[0]).includes('FROM member_manuscripts'))).toBe(false);
  });

  it('declares (201) with the member as declared_by', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [{ id: WORK, member_id: MEMBER }], rowCount: 1 });
    tx.locked(); tx.work(true); tx.manuscript(true);
    mockTx.mockResolvedValueOnce({
      rows: [
        {
          id: 'e-1',
          expression_type: 'manuscript',
          expression_id: MANUSCRIPT,
          declared_at: '2026-08-05T00:00:00Z',
        },
      ],
      rowCount: 1,
    });
    const res = await POST(postRequest(declaration), ctx);
    expect(res.status).toBe(201);
    const insert = mockTx.mock.calls.find((c) =>
      String(c[0]).includes('INSERT INTO living_work_expressions')
    );
    expect(insert).toBeDefined();
    expect(insert![1]).toEqual([WORK, MANUSCRIPT, MEMBER]);
    expect((await res.json()).expression).toEqual({
      id: 'e-1',
      expressionType: 'manuscript',
      expressionId: MANUSCRIPT,
      declaredAt: '2026-08-05T00:00:00Z',
    });
  });

  it('declaring twice answers 200 alreadyDeclared — the original act is preserved', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [{ id: WORK, member_id: MEMBER }], rowCount: 1 });
    tx.locked(); tx.work(true); tx.manuscript(true);
    mockTx.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // ON CONFLICT DO NOTHING
    const res = await POST(postRequest(declaration), ctx);
    expect(res.status).toBe(200);
    expect((await res.json()).alreadyDeclared).toBe(true);
  });

  it('WS-DELETE-01 · the writing is held before it is checked: advisory lock → Work row → manuscript row → insert, all in ONE transaction', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [{ id: WORK, member_id: MEMBER }], rowCount: 1 });
    tx.locked(); tx.work(true); tx.manuscript(true);
    mockTx.mockResolvedValueOnce({ rows: [{ id: 'e-1', expression_type: 'manuscript', expression_id: MANUSCRIPT, declared_at: 'x' }], rowCount: 1 });
    await POST(postRequest(declaration), ctx);

    const sql = mockTx.mock.calls.map((c) => String(c[0]).replace(/\s+/g, ' ').trim());
    expect(sql).toHaveLength(4);
    expect(sql[0]).toMatch(/pg_advisory_xact_lock_shared\(/);
    expect(sql[1]).toMatch(/FROM living_works .* FOR SHARE$/);
    expect(sql[2]).toMatch(/FROM member_manuscripts .* FOR SHARE$/);
    expect(sql[3]).toMatch(/^INSERT INTO living_work_expressions/);
    // One transaction, and the only statement outside it is the by-id Work read the domain guard needs.
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(String(mockQuery.mock.calls[0][0])).toContain('FROM living_works');
  });
});

describe('DELETE /living-works/[id]/expressions — un-declaring', () => {
  it('removes the declaration by query params, member-scoped through the work', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'e-1' }], rowCount: 1 });
    const res = await DELETE(
      deleteRequest(`?expressionType=manuscript&expressionId=${MANUSCRIPT}`),
      ctx
    );
    expect(res.status).toBe(200);
    const del = mockQuery.mock.calls[0];
    expect(String(del[0])).toContain('living_works w');
    expect(del[1]).toEqual([WORK, MEMBER, 'manuscript', MANUSCRIPT]);
  });

  it('400 when the identifiers are missing', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    const res = await DELETE(deleteRequest(''), ctx);
    expect(res.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('404 when nothing matched — including the not-owned case', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const res = await DELETE(
      deleteRequest(`?expressionType=manuscript&expressionId=${MANUSCRIPT}`),
      ctx
    );
    expect(res.status).toBe(404);
  });
});
