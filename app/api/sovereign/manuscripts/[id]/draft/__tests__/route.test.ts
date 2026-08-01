/**
 * Working Draft route — auth, isolation, source-immutability, and revision
 * preservation. Mirrors the render route's test conventions.
 */
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/manuscript/render/renderMemberBook', () => ({
  assembleManuscriptMarkdown: jest.fn(
    (sections: Array<{ heading: string | null; body: string }>) =>
      sections.map((s) => (s.heading ? `# ${s.heading}\n\n${s.body}` : s.body)).join('\n\n')
  ),
  computeSourceHash: jest.fn(() => 'hash-abc123'),
}));

import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { GET, POST, PUT } from '../route';

const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockQuery = query as jest.Mock;

const MEMBER = '11111111-1111-1111-1111-111111111111';
const MANUSCRIPT = '22222222-2222-2222-2222-222222222222';
const DRAFT = '33333333-3333-3333-3333-333333333333';

const ctx = { params: Promise.resolve({ id: MANUSCRIPT }) };

function jsonRequest(method: string, body?: unknown): NextRequest {
  return new NextRequest(`http://localhost/api/sovereign/manuscripts/${MANUSCRIPT}/draft`, {
    method,
    headers: { 'content-type': 'application/json' },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

// clearAllMocks leaves queued mockResolvedValueOnce values in place, so a test
// that stops early silently shifts the next one. Reset the two mocks that queue
// values — but not the whole registry, which would wipe the module factories.
beforeEach(() => {
  jest.clearAllMocks();
  mockQuery.mockReset();
  mockAuth.mockReset();
});

/** Every save now carries the concurrency guard. */
const GUARD = { baseRevisionId: 7, idempotencyKey: 'key-1' };

/** The SELECT that precedes every save: current version + idempotency record. */
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

describe('draft routes — auth & isolation', () => {
  it('POST returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(jsonRequest('POST'), ctx);
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('GET returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET(jsonRequest('GET'), ctx);
    expect(res.status).toBe(401);
  });

  it('PUT returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await PUT(jsonRequest('PUT', { content: 'x', ...GUARD }), ctx);
    expect(res.status).toBe(401);
  });

  it('POST returns 404 (no existence leak) for a cross-member manuscript', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // ownership gate
    const res = await POST(jsonRequest('POST'), ctx);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not found' });
  });

  it('GET returns 404 for a cross-member draft', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const res = await GET(jsonRequest('GET'), ctx);
    expect(res.status).toBe(404);
  });

  it('PUT returns 404 for a cross-member draft', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // member-scoped SELECT finds nothing
    const res = await PUT(jsonRequest('PUT', { content: 'x', ...GUARD }), ctx);
    expect(res.status).toBe(404);
  });
});

describe('POST — create from source', () => {
  it('initializes the draft verbatim from source sections and writes revision 1', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: MANUSCRIPT }], rowCount: 1 }) // ownership
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // no existing draft
      .mockResolvedValueOnce({
        rows: [
          { heading: 'One', body: 'First words.' },
          { heading: null, body: 'Second words.' },
        ],
        rowCount: 2,
      }) // sections
      .mockResolvedValueOnce({ rows: [{ id: DRAFT }], rowCount: 1 }) // insert draft
      .mockResolvedValueOnce({ rows: [], rowCount: 1 }); // insert revision 1

    const res = await POST(jsonRequest('POST'), ctx);
    expect(res.status).toBe(201);
    const payload = await res.json();
    expect(payload.id).toBe(DRAFT);
    expect(payload.revisionCount).toBe(1);
    expect(payload.baseSourceHash).toBe('hash-abc123');
    expect(payload.content).toBe('# One\n\nFirst words.\n\nSecond words.');

    // Source sections were only ever SELECTed — never INSERT/UPDATE/DELETEd.
    const sectionWrites = mockQuery.mock.calls.filter(
      (c) => String(c[0]).includes('manuscript_sections') && !String(c[0]).trim().startsWith('SELECT')
    );
    expect(sectionWrites).toHaveLength(0);

    // Revision 1 was written with the initialized content.
    const revisionInsert = mockQuery.mock.calls.find((c) =>
      String(c[0]).includes('INSERT INTO working_draft_revisions')
    );
    expect(revisionInsert).toBeDefined();
    expect(revisionInsert![1][0]).toBe(DRAFT);
    expect(revisionInsert![1][1]).toBe('# One\n\nFirst words.\n\nSecond words.');
  });

  it('returns 409 when a draft already exists', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: MANUSCRIPT }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ id: DRAFT }], rowCount: 1 });
    const res = await POST(jsonRequest('POST'), ctx);
    expect(res.status).toBe(409);
  });

  it('returns 409 when the manuscript has no sections', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: MANUSCRIPT }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const res = await POST(jsonRequest('POST'), ctx);
    expect(res.status).toBe(409);
  });
});

describe('PUT — autosave and checkpoint', () => {
  it('rejects a non-string content with 400', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    const res = await PUT(jsonRequest('PUT', { content: 42, ...GUARD }), ctx);
    expect(res.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('refuses a save that carries no guard — an unguarded write cannot be safe', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    const res = await PUT(jsonRequest('PUT', { content: 'x' }), ctx);
    expect(res.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('autosave updates content without writing a revision', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce(guardRow()).mockResolvedValueOnce({
      rows: [
        {
          revision_count: 3,
          version: 8,
          last_idempotency_response: { revisionCount: 3, revisionId: 8, updatedAt: 't1', checkpointed: false },
        },
      ],
      rowCount: 1,
    });
    const res = await PUT(jsonRequest('PUT', { content: 'new words', ...GUARD }), ctx);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ revisionCount: 3, revisionId: 8, updatedAt: 't1', checkpointed: false });
    const revisionInserts = mockQuery.mock.calls.filter((c) =>
      String(c[0]).includes('INSERT INTO working_draft_revisions')
    );
    expect(revisionInserts).toHaveLength(0);
  });

  it('checkpoint increments revision_count and appends a revision with the note', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce(guardRow())
      .mockResolvedValueOnce({
        rows: [
          {
            revision_count: 4,
            version: 8,
            last_idempotency_response: { revisionCount: 4, revisionId: 8, updatedAt: 't2', checkpointed: true },
          },
        ],
        rowCount: 1,
      })
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });
    const res = await PUT(
      jsonRequest('PUT', {
        content: 'kept words',
        checkpoint: true,
        note: 'End of chapter 2',
        ...GUARD,
      }),
      ctx
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ revisionCount: 4, revisionId: 8, updatedAt: 't2', checkpointed: true });

    const revisionInsert = mockQuery.mock.calls.find((c) =>
      String(c[0]).includes('INSERT INTO working_draft_revisions')
    );
    expect(revisionInsert).toBeDefined();
    expect(revisionInsert![1]).toEqual([DRAFT, 4, 'kept words', MEMBER, 'End of chapter 2']);
  });
});

describe('GET — load draft', () => {
  it('returns the draft for its owner', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: DRAFT,
          content: 'the words',
          base_source_hash: 'hash-abc123',
          revision_count: 2,
          version: 6,
          created_at: 'c1',
          updated_at: 'u1',
        },
      ],
      rowCount: 1,
    });
    const res = await GET(jsonRequest('GET'), ctx);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      id: DRAFT,
      manuscriptId: MANUSCRIPT,
      content: 'the words',
      baseSourceHash: 'hash-abc123',
      revisionCount: 2,
      revisionId: 6,
      createdAt: 'c1',
      updatedAt: 'u1',
    });
  });
});

describe('PUT — the stale-write path, through the handler', () => {
  it('refuses a stale base and writes nothing', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce(guardRow({ version: 9 })); // another tab advanced it
    const res = await PUT(jsonRequest('PUT', { content: 'mine', ...GUARD }), ctx);
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ reason: 'stale_base', currentRevisionId: 9 });
    expect(mockQuery.mock.calls.filter((c) => /UPDATE|INSERT/.test(String(c[0])))).toHaveLength(0);
  });

  it('refuses when the guarded UPDATE loses a race the pre-check could not see', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce(guardRow())
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [{ version: 11 }], rowCount: 1 });
    const res = await PUT(jsonRequest('PUT', { content: 'mine', ...GUARD }), ctx);
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ reason: 'stale_base', currentRevisionId: 11 });
  });

  it('carries the base version in the UPDATE predicate', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce(guardRow())
      .mockResolvedValueOnce({
        rows: [{ revision_count: 3, version: 8, last_idempotency_response: {} }],
        rowCount: 1,
      });
    await PUT(jsonRequest('PUT', { content: 'x', ...GUARD }), ctx);
    const update = mockQuery.mock.calls.find(
      (c) => String(c[0]).includes('UPDATE manuscript_working_drafts') && String(c[0]).includes('version = $4')
    );
    expect(update).toBeDefined();
    expect(update![1]).toContain(GUARD.baseRevisionId);
  });

  it('records idempotency in the SAME statement as the content write', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce(guardRow())
      .mockResolvedValueOnce({
        rows: [{ revision_count: 3, version: 8, last_idempotency_response: {} }],
        rowCount: 1,
      });
    await PUT(jsonRequest('PUT', { content: 'x', ...GUARD }), ctx);
    const writes = mockQuery.mock.calls.filter((c) => String(c[0]).includes('UPDATE manuscript_working_drafts'));
    expect(writes).toHaveLength(1);
    expect(String(writes[0][0])).toContain('last_idempotency_response');
  });
});

describe('PUT — retries, through the handler', () => {
  it('replays the first result instead of writing twice', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    const { payloadHash } = jest.requireActual('@/lib/manuscript/draftConcurrency');
    const hash = payloadHash('save', { content: 'once', checkpoint: false, note: null });
    mockQuery.mockResolvedValueOnce(
      guardRow({
        version: 8,
        last_idempotency_key: GUARD.idempotencyKey,
        last_idempotency_op: 'save',
        last_idempotency_payload_hash: hash,
        last_idempotency_response: { revisionCount: 3, revisionId: 8, updatedAt: 't', checkpointed: false },
      })
    );
    const res = await PUT(jsonRequest('PUT', { content: 'once', ...GUARD }), ctx);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ revisionCount: 3, revisionId: 8, updatedAt: 't', checkpointed: false });
    expect(mockQuery.mock.calls.filter((c) => /UPDATE|INSERT/.test(String(c[0])))).toHaveLength(0);
  });

  it('refuses the same key carrying different content', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce(
      guardRow({
        last_idempotency_key: GUARD.idempotencyKey,
        last_idempotency_op: 'save',
        last_idempotency_payload_hash: 'a-different-payload',
      })
    );
    const res = await PUT(jsonRequest('PUT', { content: 'changed', ...GUARD }), ctx);
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ reason: 'idempotency_key_reuse' });
  });
});
