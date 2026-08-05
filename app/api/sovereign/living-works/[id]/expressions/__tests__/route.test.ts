/**
 * Expression declaration route — Guard 1's first caller. Auth, ownership (of
 * BOTH the work and the declared thing), no existence leak, duplicate-benign.
 * Mirrors the draft route's test conventions.
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

function jsonRequest(method: string, body?: unknown): NextRequest {
  return new NextRequest(`http://localhost/api/sovereign/living-works/${WORK}/expressions`, {
    method,
    headers: { 'content-type': 'application/json' },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
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
    const res = await POST(jsonRequest('POST', declaration), ctx);
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("answers 404 for a work that is not the member's — no existence leak", async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // ownedWork: none
    const res = await POST(jsonRequest('POST', declaration), ctx);
    expect(res.status).toBe(404);
  });

  it("refuses a manuscript that is not the member's own (400 missing_expression)", async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: WORK, member_id: MEMBER }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // manuscript ownership: none
    const res = await POST(jsonRequest('POST', declaration), ctx);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('missing_expression');
  });

  it('refuses a blank expression type before touching ownership of the thing', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [{ id: WORK, member_id: MEMBER }], rowCount: 1 });
    const res = await POST(jsonRequest('POST', { expressionType: '  ', expressionId: MANUSCRIPT }), ctx);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('blank_expression_type');
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
    const res = await POST(jsonRequest('POST', declaration), ctx);
    expect(res.status).toBe(201);
    const insert = mockQuery.mock.calls.find((c) =>
      String(c[0]).includes('INSERT INTO living_work_expressions')
    );
    expect(insert).toBeDefined();
    expect(insert![1]).toEqual([WORK, 'manuscript', MANUSCRIPT, MEMBER]);
  });

  it('treats declaring twice as re-affirmation (200), preserving the original', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: WORK, member_id: MEMBER }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ id: MANUSCRIPT }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // ON CONFLICT DO NOTHING
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'e-1',
            expression_type: 'manuscript',
            expression_id: MANUSCRIPT,
            declared_at: '2026-08-01T00:00:00Z',
          },
        ],
        rowCount: 1,
      });
    const res = await POST(jsonRequest('POST', declaration), ctx);
    expect(res.status).toBe(200);
    expect((await res.json()).expression.declaredAt).toBe('2026-08-01T00:00:00Z');
  });
});

describe('DELETE /living-works/[id]/expressions — un-declaring', () => {
  it('removes the declaration, member-scoped through the work', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'e-1' }], rowCount: 1 });
    const res = await DELETE(jsonRequest('DELETE', declaration), ctx);
    expect(res.status).toBe(200);
    const del = mockQuery.mock.calls[0];
    expect(String(del[0])).toContain('living_works w');
    expect(del[1]).toEqual([WORK, MEMBER, 'manuscript', MANUSCRIPT]);
  });

  it('404 when nothing matched — including the not-owned case', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const res = await DELETE(jsonRequest('DELETE', declaration), ctx);
    expect(res.status).toBe(404);
  });
});
