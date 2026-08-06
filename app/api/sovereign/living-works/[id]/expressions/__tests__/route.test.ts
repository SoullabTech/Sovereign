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
 *     through the owning work in the predicate.
 */
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));

import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { DELETE, POST } from '../route';

const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockQuery = query as jest.Mock;

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
  mockAuth.mockReset();
});

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
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: WORK, member_id: MEMBER }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const res = await POST(postRequest(declaration), ctx);
    expect(res.status).toBe(404);
  });

  it('declares (201) with the member as declared_by', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: WORK, member_id: MEMBER }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ id: MANUSCRIPT }], rowCount: 1 })
      .mockResolvedValueOnce({
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
    const insert = mockQuery.mock.calls.find((c) =>
      String(c[0]).includes('INSERT INTO living_work_expressions')
    );
    expect(insert).toBeDefined();
    expect(insert![1]).toEqual([WORK, 'manuscript', MANUSCRIPT, MEMBER]);
  });

  it('declaring twice answers 200 alreadyDeclared — the original act is preserved', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: WORK, member_id: MEMBER }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ id: MANUSCRIPT }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // ON CONFLICT DO NOTHING
    const res = await POST(postRequest(declaration), ctx);
    expect(res.status).toBe(200);
    expect((await res.json()).alreadyDeclared).toBe(true);
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
