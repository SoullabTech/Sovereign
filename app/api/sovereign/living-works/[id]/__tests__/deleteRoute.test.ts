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
 *   - the answer depends only on THAT row: someone else's stuck queue row is not this member's, and this Work's own is;
 *   - the removal is RECORDED in the same transaction (WS-DELETE-01 follow-up): the recovery-capture advisory lock is the FIRST
 *     statement (taken even for an id that turns out not to be this member's), then the Work row, then the image row, then the
 *     delete; once the delete really removed a row, a `member_deletion` manifest and a `living_works` tombstone for the id the
 *     DELETE returned, all on the transaction client; and the independent R20 ledger is NOT sealed (a declared state, see below).
 */
jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('@/lib/cabin/request', () => ({ cabinStore: jest.fn(), cabinMemberFromRequest: jest.fn(), setCabinSessionCookie: jest.fn() }));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), transaction: jest.fn() }));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));
jest.mock('@/lib/manuscript/source/eraseManuscript', () => ({ sweepVaultErasureQueue: jest.fn() }));
// Mocked only so the test can say the route never calls it: the route does not import the ledger at all.
jest.mock('@/lib/recovery/r20DeletionLedger', () => ({ sealR20DeletionLedger: jest.fn(), r20LedgerErrorCode: jest.fn(() => 'R20_X') }));

import { NextRequest } from 'next/server';
import { query, transaction } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { sweepVaultErasureQueue } from '@/lib/manuscript/source/eraseManuscript';
import { sealR20DeletionLedger } from '@/lib/recovery/r20DeletionLedger';
import { DELETE } from '../route';

const member = getMemberIdFromRequest as jest.Mock;
const tx = transaction as jest.Mock;
const q = query as jest.Mock;
const sweep = sweepVaultErasureQueue as jest.Mock;
const seal = sealR20DeletionLedger as jest.Mock;

const MEMBER = '11111111-1111-4111-8111-111111111111';
const WORK = 'a0000000-0000-4000-8000-00000000000a';
const QUEUE = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const MANIFEST = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const NOTE = 'Writer Work removed by verified member request';

/**
 * A scripted transaction client: `visual` is what the image read returns; `workRow` whether the Work exists for this member at all;
 * `lostRace` whether the Work was found but the DELETE then removed nothing (another request took it between the two statements);
 * `returnedId` the id the DELETE ... RETURNING hands back; `failManifest` / `failTombstone` / `manifestEmpty` make the record fail.
 */
function scriptTx(opts: { visual?: string | null; workRow?: boolean; lostRace?: boolean; returnedId?: string; failManifest?: boolean; failTombstone?: boolean; manifestEmpty?: boolean }) {
  const statements: Array<{ sql: string; params: unknown[] }> = [];
  const client = {
    query: jest.fn(async (sql: string, params: unknown[] = []) => {
      statements.push({ sql, params });
      if (/pg_advisory_xact_lock/i.test(sql)) return { rows: [] };
      if (/^\s*SELECT id FROM living_works/i.test(sql)) return { rows: opts.workRow === false ? [] : [{ id: WORK }] };
      if (/FROM living_work_visuals/i.test(sql)) return { rows: opts.visual ? [{ storage_path: opts.visual }] : [] };
      if (/DELETE FROM living_works/i.test(sql)) return { rows: opts.workRow === false || opts.lostRace ? [] : [{ id: opts.returnedId ?? WORK }] };
      if (/INSERT INTO deletion_manifests/i.test(sql)) {
        if (opts.failManifest) throw new Error('fictional manifest failure');
        return { rows: opts.manifestEmpty ? [] : [{ id: MANIFEST }] };
      }
      if (/INSERT INTO provenance_tombstones/i.test(sql)) {
        if (opts.failTombstone) throw new Error('fictional tombstone failure');
        return { rows: [] };
      }
      if (/INSERT INTO vault_erasure_queue/i.test(sql)) return { rows: [{ id: QUEUE }] };
      throw new Error(`unexpected statement: ${sql}`);
    }),
  };
  tx.mockImplementation(async (fn: (c: typeof client) => Promise<unknown>) => fn(client));
  return statements;
}

const del = async (urlId: string = WORK) => {
  const res = await DELETE(new NextRequest(`http://localhost/api/sovereign/living-works/${urlId}`, { method: 'DELETE' }), { params: Promise.resolve({ id: urlId }) });
  return { status: res.status, body: await res.json() };
};

/** The statement indexes of one transaction, by kind, so an order can be asserted without counting by hand. */
const indexes = (statements: Array<{ sql: string }>) => {
  const at = (re: RegExp) => statements.findIndex((s) => re.test(s.sql));
  return {
    advisoryLock: at(/pg_advisory_xact_lock/i),
    workLock: at(/^\s*SELECT id FROM living_works/i),
    imageRead: at(/FROM living_work_visuals/i),
    deletion: at(/DELETE FROM living_works/i),
    manifest: at(/INSERT INTO deletion_manifests/i),
    tombstone: at(/INSERT INTO provenance_tombstones/i),
    queue: at(/INSERT INTO vault_erasure_queue/i),
  };
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

  it('a Work that is not this member\'s (or is already gone): 404, which the client reads as done, and nothing is read further, deleted, recorded, queued or swept', async () => {
    const statements = scriptTx({ workRow: false });
    const out = await del();
    expect(out.status).toBe(404);
    // The advisory lock (unconditional, see below), the Work lookup, then nothing. (Before the follow-up this was the lookup alone.)
    expect(statements).toHaveLength(2);
    expect(statements[0]!.sql).toMatch(/pg_advisory_xact_lock/i);
    expect(statements[1]!.sql).toMatch(/SELECT id FROM living_works/i);
    expect(statements.some((s) => /^\s*(DELETE|INSERT|UPDATE)\b/i.test(s.sql))).toBe(false);
    expect(sweep).not.toHaveBeenCalled();
  });

  it('LOCK ORDER (follow-up): the recovery-capture advisory lock is statement 0, taken even for a Work that turns out not to exist, and nothing but the lookup follows a 404', async () => {
    // A lock taken only after the row was found would come AFTER a row lock on some paths, and a Delete of the Work\'s writing
    // takes the advisory lock first and the Work row second: the opposite order is a real cycle (PostgreSQL aborts one side with a 500).
    const statements = scriptTx({ workRow: false });
    await del();
    expect(statements[0]!.sql).toContain(`pg_advisory_xact_lock(hashtextextended('soullab:r20:recovery-capture', 0))`);
    expect(statements[0]!.params).toEqual([]);
    expect(statements.slice(1).map((s) => s.sql.trim().split(/\s+/).slice(0, 4).join(' '))).toEqual(['SELECT id FROM living_works']);
    expect(q).not.toHaveBeenCalled();
  });

  it('LOCK ORDER: the advisory lock FIRST, then the Work row, then the image row, then the delete: any other order deadlocks with a Delete of the Work\'s writing', async () => {
    // Stale until 2026-11-06: this used to say "the Work row is locked FIRST". The recovery-capture key now comes before it, because
    // eraseManuscript takes the key first and a coherent R20 backup holds it while it captures.
    const statements = scriptTx({ visual: 'work-visuals/own.png' });
    await del();
    const at = indexes(statements);
    expect(at.advisoryLock).toBe(0);
    expect(at.workLock).toBe(1);
    expect(statements[at.workLock]!.sql).toMatch(/FOR UPDATE\s*$/);
    expect(at.workLock).toBeLessThan(at.imageRead);
    expect(at.imageRead).toBeLessThan(at.deletion);
    expect(statements[at.workLock]!.params).toEqual([WORK, MEMBER]);
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

describe('the removal is RECORDED, in the same transaction (a restore from an older backup must not bring the Work back)', () => {
  it('ORDER: advisory lock, Work lock, image read, delete, manifest, tombstone, then (only with an image) the queue row: one transaction, one pass', async () => {
    const statements = scriptTx({ visual: 'work-visuals/own.png' });
    await del();
    const at = indexes(statements);
    expect([at.advisoryLock, at.workLock, at.imageRead, at.deletion, at.manifest, at.tombstone, at.queue]).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(statements).toHaveLength(7);
    expect(tx).toHaveBeenCalledTimes(1);
  });

  it('without an image the record is still written: lock, Work, image read, delete, manifest, tombstone, and no queue row', async () => {
    const statements = scriptTx({ visual: null });
    const out = await del();
    expect(out).toEqual({ status: 200, body: { withdrawn: WORK } });
    const at = indexes(statements);
    expect([at.advisoryLock, at.workLock, at.imageRead, at.deletion, at.manifest, at.tombstone, at.queue]).toEqual([0, 1, 2, 3, 4, 5, -1]);
  });

  it('the manifest and the tombstone are issued on the TRANSACTION client, never on the module-level query (which would commit outside the transaction)', async () => {
    const statements = scriptTx({ visual: 'work-visuals/own.png' });
    await del();
    expect(statements.some((s) => /INSERT INTO deletion_manifests/i.test(s.sql))).toBe(true);
    expect(statements.some((s) => /INSERT INTO provenance_tombstones/i.test(s.sql))).toBe(true);
    const outside = q.mock.calls.map((c) => String(c[0]));
    expect(outside.some((sql) => /deletion_manifests|provenance_tombstones|pg_advisory_xact_lock/i.test(sql))).toBe(false);
    // Only the post-commit check of THIS Work\'s queue row ran outside the transaction.
    expect(outside).toHaveLength(1);
    expect(outside[0]).toMatch(/FROM vault_erasure_queue WHERE id = \$1/i);
  });

  it('the manifest says what happened and who authorized it: a member_deletion by verified member self-service, with the Work-removal note and nothing else', async () => {
    const statements = scriptTx({});
    await del();
    const manifest = statements.find((s) => /INSERT INTO deletion_manifests/i.test(s.sql))!;
    expect(manifest.sql).toContain(`'member_deletion'`);
    expect(manifest.sql).toContain(`'verified-member-self-service'`);
    expect(manifest.params).toEqual([NOTE]);
  });

  it('the tombstone names exactly the manifest, the kind living_works, and the id the DELETE RETURNED (a returned spelling that differs from the URL\'s proves which one is used)', async () => {
    // The URL carries the id in upper case; the database returns its own (lower case) spelling. A tombstone is compared against the
    // database\'s spelling, so the URL\'s would never match the row it was meant to name.
    const urlId = WORK.toUpperCase();
    expect(urlId).not.toBe(WORK);
    const statements = scriptTx({ returnedId: WORK });
    const out = await del(urlId);
    const tomb = statements.find((s) => /INSERT INTO provenance_tombstones/i.test(s.sql))!;
    expect(tomb.params).toEqual([MANIFEST, WORK]);
    expect(tomb.params).not.toContain(urlId);
    expect(tomb.sql).toContain(`'living_works'`);
    expect(tomb.sql).toMatch(/ON CONFLICT \(object_kind, object_id\) DO NOTHING/);
    // The member is told the id the database removed, as before.
    expect(out).toEqual({ status: 200, body: { withdrawn: WORK } });
  });

  it('a lost race (the Work was found, then the DELETE removed nothing): 404, and NO manifest, tombstone, queue row or sweep is written', async () => {
    const statements = scriptTx({ lostRace: true, visual: 'work-visuals/own.png' });
    const out = await del();
    expect(out.status).toBe(404);
    const at = indexes(statements);
    expect(at.deletion).toBeGreaterThan(-1);
    expect([at.manifest, at.tombstone, at.queue]).toEqual([-1, -1, -1]);
    expect(statements.some((s) => /deletion_manifests|provenance_tombstones|vault_erasure_queue/i.test(s.sql))).toBe(false);
    expect(sweep).not.toHaveBeenCalled();
    expect(q).not.toHaveBeenCalled();
  });

  it('a Work that is not this member\'s writes no record at all', async () => {
    const statements = scriptTx({ workRow: false });
    await del();
    expect(statements.some((s) => /deletion_manifests|provenance_tombstones/i.test(s.sql))).toBe(false);
  });

  it('a manifest that cannot be written fails the WHOLE request with the generic 500 (the Work stays; the client reads it as "could not confirm"), and nothing after it runs', async () => {
    const statements = scriptTx({ failManifest: true, visual: 'work-visuals/own.png' });
    const out = await del();
    expect(out.status).toBe(500);
    expect(out.body).toEqual({ error: 'Could not withdraw that declaration' });
    expect(out.body.removed).toBeUndefined();
    const at = indexes(statements);
    expect(at.manifest).toBeGreaterThan(-1);                    // it was attempted, after the delete, inside the transaction
    expect(at.manifest).toBeGreaterThan(at.deletion);
    expect([at.tombstone, at.queue]).toEqual([-1, -1]);
    expect(sweep).not.toHaveBeenCalled();
    expect(q).not.toHaveBeenCalled();
    expect(seal).not.toHaveBeenCalled();
  });

  it('a manifest insert that returns no id is the same failure (the helper throws rather than writing a tombstone for nothing)', async () => {
    const statements = scriptTx({ manifestEmpty: true, visual: 'work-visuals/own.png' });
    const out = await del();
    expect(out).toEqual({ status: 500, body: { error: 'Could not withdraw that declaration' } });
    expect(indexes(statements).tombstone).toBe(-1);
    expect(indexes(statements).queue).toBe(-1);
    expect(sweep).not.toHaveBeenCalled();
  });

  it('a tombstone that cannot be written fails the WHOLE request with the same generic 500, with no queue row and no sweep', async () => {
    const statements = scriptTx({ failTombstone: true, visual: 'work-visuals/own.png' });
    const out = await del();
    expect(out.status).toBe(500);
    expect(out.body).toEqual({ error: 'Could not withdraw that declaration' });
    expect(out.body.removed).toBeUndefined();
    const at = indexes(statements);
    expect(at.tombstone).toBeGreaterThan(at.manifest);          // attempted, and it is the last statement that ran
    expect(statements).toHaveLength(at.tombstone + 1);
    expect(at.queue).toBe(-1);
    expect(sweep).not.toHaveBeenCalled();
    expect(q).not.toHaveBeenCalled();
    expect(seal).not.toHaveBeenCalled();
  });

  // DECLARED STATE, not an oversight. Production has no R20_* variable on the app container, so sealing here would turn today's
  // success into `custody_incomplete`; and the client reads any 500 with `removed: true` from this route as an owed IMAGE, so a
  // failed seal could not be reported truthfully without a client change. The manifest and tombstone are committed in the database
  // and any later successful seal mirrors every row. Changing this is a member-visible outcome decision, not a refactor.
  it('DECLARED STATE: the independent R20 ledger is NOT sealed by a Remove (not sealed, deliberately), on the plain path and on the image path', async () => {
    scriptTx({ visual: null });
    expect((await del()).status).toBe(200);
    scriptTx({ visual: 'work-visuals/own.png' });
    expect((await del()).status).toBe(200);
    expect(seal).not.toHaveBeenCalled();
  });
});
