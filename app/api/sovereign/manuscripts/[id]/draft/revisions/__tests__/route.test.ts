/**
 * Working Draft revisions route — append-only guarantees at the route layer:
 * listing never mutates, restore writes a NEW revision and never UPDATEs or
 * DELETEs an existing one.
 */
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));

import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { GET, POST } from '../route';

const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockQuery = query as jest.Mock;

const MEMBER = '11111111-1111-1111-1111-111111111111';
const MANUSCRIPT = '22222222-2222-2222-2222-222222222222';
const DRAFT = '33333333-3333-3333-3333-333333333333';

const ctx = { params: Promise.resolve({ id: MANUSCRIPT }) };

function jsonRequest(method: string, body?: unknown): NextRequest {
  return new NextRequest(
    `http://localhost/api/sovereign/manuscripts/${MANUSCRIPT}/draft/revisions`,
    {
      method,
      headers: { 'content-type': 'application/json' },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }
  );
}

beforeEach(() => jest.clearAllMocks());

describe('revisions — auth & isolation', () => {
  it('GET returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET(jsonRequest('GET'), ctx);
    expect(res.status).toBe(401);
  });

  it('POST returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(jsonRequest('POST', { revisionNumber: 1 }), ctx);
    expect(res.status).toBe(401);
  });

  it('GET returns 404 (no existence leak) for a cross-member draft', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const res = await GET(jsonRequest('GET'), ctx);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not found' });
  });
});

describe('GET — list', () => {
  it('lists revisions newest-first without content bodies', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: DRAFT }], rowCount: 1 })
      .mockResolvedValueOnce({
        rows: [
          { revision_number: 2, note: null, content_chars: 120, created_at: 't2' },
          { revision_number: 1, note: 'Initialized verbatim from source', content_chars: 100, created_at: 't1' },
        ],
        rowCount: 2,
      });
    const res = await GET(jsonRequest('GET'), ctx);
    expect(res.status).toBe(200);
    const payload = await res.json();
    expect(payload.draftId).toBe(DRAFT);
    expect(payload.revisions).toEqual([
      { revisionNumber: 2, note: null, contentChars: 120, createdAt: 't2' },
      {
        revisionNumber: 1,
        note: 'Initialized verbatim from source',
        contentChars: 100,
        createdAt: 't1',
      },
    ]);
  });
});

describe('POST — restore', () => {
  it('rejects a non-integer revisionNumber with 400', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    const res = await POST(jsonRequest('POST', { revisionNumber: 'two' }), ctx);
    expect(res.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('returns 404 when the revision does not exist', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: DRAFT }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const res = await POST(jsonRequest('POST', { revisionNumber: 9 }), ctx);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Revision not found' });
  });

  it('restores by writing a NEW revision — never UPDATE/DELETE on revisions', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: DRAFT }], rowCount: 1 }) // draft gate
      .mockResolvedValueOnce({ rows: [{ content: 'older words' }], rowCount: 1 }) // revision fetch
      .mockResolvedValueOnce({ rows: [{ revision_count: 5, updated_at: 't5' }], rowCount: 1 }) // draft update
      .mockResolvedValueOnce({ rows: [], rowCount: 1 }); // new revision insert

    const res = await POST(jsonRequest('POST', { revisionNumber: 2 }), ctx);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ revisionCount: 5, restoredFrom: 2, updatedAt: 't5' });

    // History preservation: the ONLY write to working_draft_revisions is an INSERT.
    const revisionWrites = mockQuery.mock.calls.filter(
      (c) =>
        String(c[0]).includes('working_draft_revisions') && !String(c[0]).trim().startsWith('SELECT')
    );
    expect(revisionWrites).toHaveLength(1);
    expect(String(revisionWrites[0][0]).trim().startsWith('INSERT INTO')).toBe(true);
    expect(revisionWrites[0][1]).toEqual([DRAFT, 5, 'older words', MEMBER, 'Restored from revision 2']);

    // The restored content was written to the draft.
    const draftUpdate = mockQuery.mock.calls.find((c) =>
      String(c[0]).includes('UPDATE manuscript_working_drafts')
    );
    expect(draftUpdate![1]).toEqual([DRAFT, 'older words']);
  });
});
