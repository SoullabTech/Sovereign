/**
 * Materials (belonging) route — the crossing is the consent event. Auth,
 * double ownership, sentence normalization (blank = unwritten, not error),
 * duplicate-benign (a repeat gesture never overwrites the earlier sentence).
 */
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), transaction: jest.fn() }));

import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query, transaction } from '@/lib/db/postgres';
import { DELETE, POST } from '../route';

const mockAuth = getMemberIdFromRequest as jest.Mock;
const mockQuery = query as jest.Mock;
const mockTx = transaction as jest.Mock;

/**
 * The write half now runs inside ONE transaction (WS2-SUBSTRATE-01 Repair 2):
 * declaring belonging also withdraws any consideration for the same pair, and
 * both halves commit together. These helpers let the existing assertions keep
 * asking the same questions of the transaction client.
 */
let txCalls: unknown[][] = [];
function txReturning(...results: Array<{ rows: unknown[] }>) {
  mockTx.mockImplementation(async (cb: (c: { query: jest.Mock }) => unknown) => {
    const q = jest.fn();
    for (const r of results) q.mockResolvedValueOnce(r);
    const out = await cb({ query: q });
    txCalls = q.mock.calls;
    return out;
  });
}

const MEMBER = '11111111-1111-1111-1111-111111111111';
const WORK = '22222222-2222-2222-2222-222222222222';
const THING = '44444444-4444-4444-4444-444444444444';

const ctx = { params: Promise.resolve({ id: WORK }) };

function jsonRequest(method: string, body?: unknown): NextRequest {
  return new NextRequest(`http://localhost/api/sovereign/living-works/${WORK}/materials`, {
    method,
    headers: { 'content-type': 'application/json' },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

const BROUGHT = {
  id: 'm-1',
  material_type: 'manuscript',
  material_id: THING,
  relationship_sentence: null,
  declared_at: '2026-08-05T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockTx.mockReset();
  txCalls = [];
  mockQuery.mockReset();
  mockAuth.mockReset();
});

describe('POST /living-works/[id]/materials — bring this to this work', () => {
  it('refuses without a member (401)', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(jsonRequest('POST', { materialType: 'manuscript', materialId: THING }), ctx);
    expect(res.status).toBe(401);
  });

  it("404 for a work that is not the member's — no existence leak", async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const res = await POST(jsonRequest('POST', { materialType: 'manuscript', materialId: THING }), ctx);
    expect(res.status).toBe(404);
  });

  it("answers 404 for a thing that is not the member's own — a foreign id learns nothing", async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: WORK, member_id: MEMBER }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const res = await POST(jsonRequest('POST', { materialType: 'manuscript', materialId: THING }), ctx);
    expect(res.status).toBe(404);
  });

  it('a blank sentence is stored as the ABSENCE of a sentence (null), not as ""', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: WORK, member_id: MEMBER }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ id: THING }], rowCount: 1 });
    txReturning({ rows: [] }, { rows: [BROUGHT] });
    const res = await POST(
      jsonRequest('POST', { materialType: 'manuscript', materialId: THING, sentence: '   ' }),
      ctx
    );
    expect(res.status).toBe(201);
    const insert = txCalls.find((c) =>
      String(c[0]).includes('INSERT INTO living_work_materials')
    );
    expect(insert![1]).toEqual([WORK, 'manuscript', THING, null, MEMBER]);
  });

  it("brings with the member's sentence and the member as declared_by (201)", async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: WORK, member_id: MEMBER }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ id: THING }], rowCount: 1 });
    txReturning(
      { rows: [] }, // no consideration to withdraw
      { rows: [{ ...BROUGHT, relationship_sentence: 'the letters this grew from' }] }
    );
    const res = await POST(
      jsonRequest('POST', {
        materialType: 'manuscript',
        materialId: THING,
        sentence: 'the letters this grew from',
      }),
      ctx
    );
    expect(res.status).toBe(201);
    const insert = txCalls.find((c) =>
      String(c[0]).includes('INSERT INTO living_work_materials')
    );
    expect(insert![1]).toEqual([WORK, 'manuscript', THING, 'the letters this grew from', MEMBER]);
  });

  it('bringing twice re-affirms (200) and never overwrites the earlier sentence', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: WORK, member_id: MEMBER }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ id: THING }], rowCount: 1 });
    txReturning(
      { rows: [] }, // no consideration to withdraw
      { rows: [] }, // ON CONFLICT DO NOTHING
      { rows: [{ ...BROUGHT, relationship_sentence: 'their first words about it' }] }
    );
    const res = await POST(
      jsonRequest('POST', { materialType: 'manuscript', materialId: THING, sentence: 'newer words' }),
      ctx
    );
    expect(res.status).toBe(200);
    expect((await res.json()).material.sentence).toBe('their first words about it');
  });

  /* WS2-SUBSTRATE-01 Repair 2 — falsification. A consideration and a
     declaration are mutually exclusive, and the database refuses to hold both.
     So declaring belonging MUST withdraw the consideration, in the same
     transaction, or the declaration is refused at the trigger. */
  it('withdraws a consideration for the same pair, in the same transaction', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: WORK, member_id: MEMBER }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ id: THING }], rowCount: 1 });
    txReturning(
      { rows: [{ state: 'maybe' }] }, // the member had been undecided
      { rows: [BROUGHT] }
    );
    const res = await POST(
      jsonRequest('POST', { materialType: 'manuscript', materialId: THING }),
      ctx
    );
    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toMatchObject({ resolvedConsideration: 'maybe' });

    // Withdrawal first, declaration second, both on the same client.
    expect(String(txCalls[0][0])).toContain(
      'DELETE FROM living_work_material_considerations'
    );
    expect(String(txCalls[1][0])).toContain('INSERT INTO living_work_materials');
    // Scoped to this pair — never the whole work.
    expect(txCalls[0][1]).toEqual([WORK, 'manuscript', THING]);
    // Neither half ran outside the transaction.
    expect(
      mockQuery.mock.calls.some((c) => String(c[0]).includes('living_work_material'))
    ).toBe(false);
  });

  it('reports no consideration resolved when there was none', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: WORK, member_id: MEMBER }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ id: THING }], rowCount: 1 });
    txReturning({ rows: [] }, { rows: [BROUGHT] });
    const res = await POST(
      jsonRequest('POST', { materialType: 'manuscript', materialId: THING }),
      ctx
    );
    await expect(res.json()).resolves.toMatchObject({ resolvedConsideration: null });
  });
});

describe('DELETE /living-works/[id]/materials — no longer feeds this work', () => {
  it('removes the relationship only, member-scoped through the work', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'm-1' }], rowCount: 1 });
    const res = await DELETE(
      jsonRequest('DELETE', { materialType: 'manuscript', materialId: THING }),
      ctx
    );
    expect(res.status).toBe(200);
    const del = mockQuery.mock.calls[0];
    expect(String(del[0])).toContain('DELETE FROM living_work_materials');
    expect(del[1]).toEqual([WORK, MEMBER, 'manuscript', THING]);
  });

  it('404 when nothing matched', async () => {
    mockAuth.mockResolvedValue(MEMBER);
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const res = await DELETE(
      jsonRequest('DELETE', { materialType: 'manuscript', materialId: THING }),
      ctx
    );
    expect(res.status).toBe(404);
  });
});
