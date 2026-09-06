/**
 * Working Draft revisions route — append-only guarantees at the route layer:
 * listing never mutates, restore writes a NEW revision and never UPDATEs or
 * DELETEs an existing one.
 */
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
/* `transaction()` must be mocked, not omitted. The routes import it alongside
   query(); a mock that supplies only query() makes every transactional write
   throw "(0, postgres_1.transaction) is not a function", which the handler
   catches and answers 500 — so the suite reported a broken write path when the
   real defect was the mock's shape. The callback is run against the SAME query
   mock so existing assertions over query calls still see statements issued
   inside a transaction. Rejection propagates, matching rollback-on-throw. */
jest.mock('@/lib/db/postgres', () => {
  const query = jest.fn();
  return {
    query,
    transaction: jest.fn(async (callback: (tx: { query: unknown }) => unknown) =>
      callback({ query })
    ),
  };
});

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

const GUARD = { baseRevisionId: 7, idempotencyKey: 'key-r1' };

function guardRow(over: Record<string, unknown> = {}) {
  return {
    rows: [
      {
        id: DRAFT,
        version: 7,
        last_idempotency_key: null,
        last_idempotency_op: null,
        last_idempotency_payload_hash: null,
        last_idempotency_response: null,
        ...over,
      },
    ],
    rowCount: 1,
  };
}

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

  it('refuses a restore that carries no guard', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    const res = await POST(jsonRequest('POST', { revisionNumber: 2 }), ctx);
    expect(res.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('refuses a stale base rather than discarding newer work', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce(guardRow({ version: 12 }));
    const res = await POST(jsonRequest('POST', { revisionNumber: 2, ...GUARD }), ctx);
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ reason: 'stale_base', currentRevisionId: 12 });
    expect(mockQuery.mock.calls.filter((c) => /UPDATE|INSERT/.test(String(c[0])))).toHaveLength(0);
  });

  it('returns 404 when the revision does not exist', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce(guardRow()).mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const res = await POST(jsonRequest('POST', { revisionNumber: 9, ...GUARD }), ctx);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Revision not found' });
  });

  it('restores by writing a NEW revision — never UPDATE/DELETE on revisions', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce(guardRow()) // draft gate + concurrency guard
      .mockResolvedValueOnce({ rows: [{ content: 'older words' }], rowCount: 1 }) // revision fetch
      .mockResolvedValueOnce({
        rows: [
          {
            revision_count: 5,
            last_idempotency_response: { revisionCount: 5, revisionId: 8, restoredFrom: 2, updatedAt: 't5' },
          },
        ],
        rowCount: 1,
      }) // guarded update, idempotency recorded in the same statement
      .mockResolvedValueOnce({ rows: [], rowCount: 1 }); // new revision insert

    const res = await POST(jsonRequest('POST', { revisionNumber: 2, ...GUARD }), ctx);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ revisionCount: 5, revisionId: 8, restoredFrom: 2, updatedAt: 't5' });

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
    expect(draftUpdate![1].slice(0, 3)).toEqual([DRAFT, 'older words', GUARD.baseRevisionId]);
  });
});
