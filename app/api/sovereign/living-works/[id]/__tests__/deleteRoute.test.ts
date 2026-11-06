/**
 * DELETE /api/sovereign/living-works/[id] — Remove this Work (hermetic: no database).
 *
 * The PostgreSQL probes (tests/constitutional/ws-delete/dynamic) prove what the database does with this route. This file runs in
 * the ordinary jest run and pins the HTTP contract the client's `removeWork` depends on, and the shape of the transaction that
 * makes the Work's image safe:
 *
 *   - the Work's own image is read FOR UPDATE before the Work is deleted (so a concurrent replacement cannot slip a new image in
 *     between the read and the cascade and leave bytes nothing names);
 *   - its queue row is created with RETURNING id, and the sweep is told to take THAT row first (`first`);
 *   - the answer depends only on THAT row: someone else's stuck queue row is not this member's, and this Work's own is.
 */
jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('@/lib/cabin/request', () => ({ cabinStore: jest.fn(), cabinMemberFromRequest: jest.fn(), setCabinSessionCookie: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), transaction: jest.fn() }));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/manuscript/source/eraseManuscript', () => ({ sweepVaultErasureQueue: jest.fn() }));

import { NextRequest } from 'next/server';
import { query, transaction } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { sweepVaultErasureQueue } from '@/lib/manuscript/source/eraseManuscript';
import { DELETE } from '../route';

const member = getMemberIdFromRequest as jest.Mock;
const tx = transaction as jest.Mock;
const q = query as jest.Mock;
const sweep = sweepVaultErasureQueue as jest.Mock;

const MEMBER = '11111111-1111-4111-8111-111111111111';
const WORK = 'a0000000-0000-4000-8000-00000000000a';
const QUEUE = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

/** A scripted transaction client: `visual` is what the image read returns; `workRow` what the DELETE returns. */
function scriptTx(opts: { visual?: string | null; workRow?: boolean }) {
  const statements: Array<{ sql: string; params: unknown[] }> = [];
  const client = {
    query: jest.fn(async (sql: string, params: unknown[] = []) => {
      statements.push({ sql, params });
      if (/^\s*SELECT id FROM living_works/i.test(sql)) return { rows: opts.workRow === false ? [] : [{ id: WORK }] };
      if (/FROM living_work_visuals/i.test(sql)) return { rows: opts.visual ? [{ storage_path: opts.visual }] : [] };
      if (/DELETE FROM living_works/i.test(sql)) return { rows: opts.workRow === false ? [] : [{ id: WORK }] };
      if (/INSERT INTO vault_erasure_queue/i.test(sql)) return { rows: [{ id: QUEUE }] };
      throw new Error(`unexpected statement: ${sql}`);
    }),
  };
  tx.mockImplementation(async (fn: (c: typeof client) => Promise<unknown>) => fn(client));
  return statements;
}

const del = async () => {
  const res = await DELETE(new NextRequest(`http://localhost/api/sovereign/living-works/${WORK}`, { method: 'DELETE' }), { params: Promise.resolve({ id: WORK }) });
  return { status: res.status, body: await res.json() };
};

beforeEach(() => {
  jest.clearAllMocks();
  member.mockResolvedValue(MEMBER);
  sweep.mockResolvedValue(undefined);
  q.mockResolvedValue({ rows: [] });
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => jest.restoreAllMocks());

describe('Remove this Work', () => {
  it('no session: 401, and the database is never touched', async () => {
    member.mockResolvedValue(null);
    const out = await del();
    expect(out.status).toBe(401);
    expect(tx).not.toHaveBeenCalled();
  });

  it('a Work that is not this member\'s (or is already gone): 404, which the client reads as done, and nothing else is read, deleted, queued or swept', async () => {
    const statements = scriptTx({ workRow: false });
    const out = await del();
    expect(out.status).toBe(404);
    expect(statements).toHaveLength(1);                                   // the Work lock, then nothing
    expect(statements[0]!.sql).toMatch(/SELECT id FROM living_works/i);
    expect(sweep).not.toHaveBeenCalled();
  });

  it('LOCK ORDER: the Work row is locked FIRST (as eraseManuscript does), then the image row, then the delete: the opposite order deadlocks with a Delete of the Work\'s writing', async () => {
    const statements = scriptTx({ visual: 'work-visuals/own.png' });
    await del();
    const at = (re: RegExp) => statements.findIndex((s) => re.test(s.sql));
    const workLock = at(/^\s*SELECT id FROM living_works/i);
    const imageRead = at(/FROM living_work_visuals/i);
    const deletion = at(/DELETE FROM living_works/i);
    expect(workLock).toBe(0);
    expect(statements[workLock]!.sql).toMatch(/FOR UPDATE\s*$/);
    expect(workLock).toBeLessThan(imageRead);
    expect(imageRead).toBeLessThan(deletion);
    expect(statements[workLock]!.params).toEqual([WORK, MEMBER]);
  });

  it('the delete is scoped to the member in the same statement (a member cannot remove another member\'s Work by id)', async () => {
    const statements = scriptTx({});
    await del();
    expect(statements.find((s) => /^\s*SELECT id FROM living_works/i.test(s.sql))!.params).toEqual([WORK, MEMBER]);
    const deletion = statements.find((s) => /DELETE FROM living_works/i.test(s.sql))!;
    expect(deletion.sql).toMatch(/member_id\s*=\s*\$2/);
    expect(deletion.params).toEqual([WORK, MEMBER]);
  });

  it('a Work with no image: 200 { withdrawn }, nothing queued, no sweep', async () => {
    const statements = scriptTx({ visual: null });
    const out = await del();
    expect(out).toEqual({ status: 200, body: { withdrawn: WORK } });
    expect(statements.some((s) => /INSERT INTO vault_erasure_queue/i.test(s.sql))).toBe(false);
    expect(sweep).not.toHaveBeenCalled();
  });

  it('the image is read FOR UPDATE and BEFORE the Work is deleted (a replacement image cannot slip in between)', async () => {
    const statements = scriptTx({ visual: 'work-visuals/own.png' });
    q.mockResolvedValue({ rows: [] });
    await del();
    const read = statements.findIndex((s) => /FROM living_work_visuals/i.test(s.sql));
    const deletion = statements.findIndex((s) => /DELETE FROM living_works/i.test(s.sql));
    expect(read).toBeGreaterThanOrEqual(0);
    expect(read).toBeLessThan(deletion);
    expect(statements[read]!.sql).toMatch(/FOR UPDATE/i);
  });

  it('the queue row is created in the SAME transaction with RETURNING id, and the sweep is told to take THAT row first', async () => {
    const statements = scriptTx({ visual: 'work-visuals/own.png' });
    await del();
    const insert = statements.find((s) => /INSERT INTO vault_erasure_queue/i.test(s.sql))!;
    expect(insert.sql).toMatch(/RETURNING id/i);
    expect(insert.params).toEqual(['work-visuals/own.png']);
    expect(sweep).toHaveBeenCalledTimes(1);
    expect(sweep).toHaveBeenCalledWith(100, [QUEUE]);
  });

  it('the image was destroyed (its queue row is gone): 200 { withdrawn }', async () => {
    scriptTx({ visual: 'work-visuals/own.png' });
    q.mockResolvedValue({ rows: [] });
    expect(await del()).toEqual({ status: 200, body: { withdrawn: WORK } });
    expect(q).toHaveBeenCalledWith(expect.stringMatching(/FROM vault_erasure_queue WHERE id = \$1/i), [QUEUE]);
  });

  it('the image is still owed: the Work IS removed but the answer is 500 { removed, image_bytes_owed, unconfirmed.image }, never a plain success', async () => {
    scriptTx({ visual: 'work-visuals/own.png' });
    q.mockResolvedValue({ rows: [{ id: QUEUE }] });
    const out = await del();
    expect(out.status).toBe(500);
    expect(out.body).toEqual({ removed: true, refusal: 'image_bytes_owed', unconfirmed: { image: true } });
  });

  it('the answer depends only on THIS Work\'s queue row: the check is by id, never a count of the whole shared queue', async () => {
    scriptTx({ visual: 'work-visuals/own.png' });
    await del();
    const sqls = q.mock.calls.map((c) => String(c[0]));
    expect(sqls.some((s) => /FROM vault_erasure_queue/i.test(s) && /WHERE id = \$1/i.test(s))).toBe(true);
    expect(sqls.some((s) => /count\(\*\)/i.test(s))).toBe(false);
  });

  it('an exception inside the transaction: 500 with a bare body (the client reads that as "could not confirm", never "nothing was removed")', async () => {
    tx.mockRejectedValue(new Error('fictional failure'));
    const out = await del();
    expect(out.status).toBe(500);
    expect(out.body).toEqual({ error: 'Could not withdraw that declaration' });
    expect(out.body.removed).toBeUndefined();
  });
});
