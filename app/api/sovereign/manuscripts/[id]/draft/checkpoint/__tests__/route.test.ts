/**
 * Bodyless section-native checkpoint.
 *
 * The transport regression is part of the contract: Keep a version must not
 * send manuscript bytes through middleware. The route freezes server-held
 * sections under the draft lock and writes one append-only revision.
 */
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ transaction: jest.fn() }));

import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { transaction } from '@/lib/db/postgres';
import { payloadHash } from '@/lib/manuscript/draftConcurrency';
import { POST } from '../route';

const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockTransaction = transaction as jest.Mock;
const txQuery = jest.fn();

const MEMBER = '11111111-1111-1111-1111-111111111111';
const MANUSCRIPT = '22222222-2222-2222-2222-222222222222';
const DRAFT = '33333333-3333-3333-3333-333333333333';
const A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const ctx = { params: Promise.resolve({ id: MANUSCRIPT }) };

function request(base = 7, key = 'checkpoint-key'): NextRequest {
  return new NextRequest(
    `http://localhost/api/sovereign/manuscripts/${MANUSCRIPT}/draft/checkpoint`,
    {
      method: 'POST',
      headers: {
        'x-draft-base-revision': String(base),
        'idempotency-key': key,
      },
    },
  );
}

function locked(over: Record<string, unknown> = {}) {
  return {
    rows: [{
      id: DRAFT,
      content: 'alphaβ',
      revision_count: 3,
      version: '7',
      section_addressable_at: '2026-09-06T01:21:22.370Z',
      last_idempotency_key: null,
      last_idempotency_op: null,
      last_idempotency_payload_hash: null,
      last_idempotency_response: null,
      ...over,
    }],
    rowCount: 1,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  txQuery.mockReset();
  mockAuth.mockReset();
  mockTransaction.mockReset();
  mockTransaction.mockImplementation(async (fn: (tx: { query: typeof txQuery }) => Promise<unknown>) =>
    fn({ query: txQuery }));
});

describe('POST /draft/checkpoint', () => {
  it('requires a verified member before opening a transaction', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(request(), ctx);
    expect(res.status).toBe(401);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('requires both guard headers and reads no request body', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    const noHeaders = new NextRequest(
      `http://localhost/api/sovereign/manuscripts/${MANUSCRIPT}/draft/checkpoint`,
      { method: 'POST' },
    );
    const res = await POST(noHeaders, ctx);
    expect(res.status).toBe(400);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('does not leak a cross-member draft', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    txQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const res = await POST(request(), ctx);
    expect(res.status).toBe(404);
  });

  it('refuses a legacy draft rather than inventing section state', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    txQuery.mockResolvedValueOnce(locked({ section_addressable_at: null }));
    const res = await POST(request(), ctx);
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ refusal: 'not_section_addressable' });
    expect(txQuery.mock.calls.filter((c) => /^\s*(UPDATE|INSERT)\b/.test(String(c[0])))).toHaveLength(0);
  });

  it('freezes the server-held sections without updating manuscript content', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    txQuery
      .mockResolvedValueOnce(locked())
      .mockResolvedValueOnce({ rows: [{ id: A, text: 'alpha' }, { id: B, text: 'β' }], rowCount: 2 })
      .mockResolvedValueOnce({
        rows: [{
          revision_count: 4,
          version: 8,
          last_idempotency_response: {
            revisionCount: 4,
            revisionId: 8,
            updatedAt: 't',
            checkpointed: true,
          },
        }],
        rowCount: 1,
      })
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const res = await POST(request(), ctx);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      revisionCount: 4,
      revisionId: 8,
      updatedAt: 't',
      checkpointed: true,
    });

    const update = txQuery.mock.calls.find((c) => String(c[0]).includes('UPDATE manuscript_working_drafts'))!;
    expect(String(update[0])).not.toMatch(/SET\s+content\s*=/);
    expect(update[1]).toEqual([DRAFT, MEMBER, 7, 'checkpoint-key', expect.any(String)]);

    const insert = txQuery.mock.calls.find((c) => String(c[0]).includes('INSERT INTO working_draft_revisions'))!;
    expect(insert[1][0]).toBe(DRAFT);
    expect(insert[1][1]).toBe(4);
    expect(insert[1][2]).toBe('alphaβ');
    expect(insert[1][3]).toBe(MEMBER);
    expect(JSON.parse(insert[1][4])).toEqual([
      { sectionId: A, start: 0, end: 5 },
      { sectionId: B, start: 5, end: 6 },
    ]);
  });

  it('refuses a moved draft and writes nothing', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    txQuery.mockResolvedValueOnce(locked({ version: '8' }));
    const res = await POST(request(7), ctx);
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ reason: 'stale_base', currentRevisionId: 8 });
    expect(txQuery.mock.calls.filter((c) => /^\s*(UPDATE|INSERT)\b/.test(String(c[0])))).toHaveLength(0);
  });

  it('replays the same checkpoint key instead of appending a second revision', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    const response = { revisionCount: 4, revisionId: 8, updatedAt: 't', checkpointed: true };
    txQuery.mockResolvedValueOnce(locked({
      version: '8',
      last_idempotency_key: 'checkpoint-key',
      last_idempotency_op: 'save',
      last_idempotency_payload_hash: payloadHash('save', { checkpoint: true, source: 'server' }),
      last_idempotency_response: response,
    }));

    const res = await POST(request(7), ctx);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(response);
    expect(txQuery.mock.calls.filter((c) => /^\s*(UPDATE|INSERT)\b/.test(String(c[0])))).toHaveLength(0);
  });
});
