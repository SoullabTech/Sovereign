/**
 * WS-DELETE-01 / R-SHARED — physical probes of the two delete routes against a real PostgreSQL 16.
 *
 * WHAT THIS IS. The REAL route handlers (DELETE /api/sovereign/manuscripts/[id] and DELETE /api/sovereign/living-works/[id])
 * and the real eraseManuscript library, run against a real PostgreSQL 16 holding fictional rows. It answers what static
 * reading could only claim: what the server does when two Works hold one writing, what "Remove this Work" leaves behind, what
 * a concurrent remove-and-delete can and cannot produce, and exactly which status, body and log line each kind of 500 carries.
 *
 * WHAT THIS IS NOT. Not production (stub schema plus real migrations), not the real R20 ledger (its seal is replaced by a
 * switch that either seals or throws), not a browser, not real vault bytes. It carries no evidence about production's
 * environment, which is exactly what decides which 500 a real delete returns (see the diagnosis in the lane record).
 *
 * STYLE. Each probe asserts today's behaviour and says why it matters. If someone changes the behaviour the probe fails
 * with a named obligation, and the lane record must then be updated rather than silently outdated.
 *
 * SAFETY. Disabled unless WS_DELETE_DYNAMIC=fictional-only. Refuses a non-loopback database. Fictional data only.
 *
 * LAW CHANGED ON PURPOSE (WS-DELETE-01 follow-up, 2026-11-06). Until then "Remove this Work" (DELETE /api/sovereign/living-works/[id])
 * and the X8 cleanup (a declaration whose writing is already gone) deleted a Work row and wrote NO deletion record, and the probes
 * below pinned that ("Remove records NO deletion manifest and NO tombstone"). They now write exactly one `member_deletion` manifest
 * and one `living_works` tombstone, in the same transaction as the Work's deletion, and take the recovery-capture advisory lock first
 * (lib/manuscript/source/workDeletionRecord.ts). Every probe that used to pin "no record" was rewritten to pin the NEW law, and each
 * says so where it changed. The independent R20 ledger is deliberately NOT sealed by either path (also pinned: the seal mock must
 * stay uncalled). What did NOT change: a 404, a second Remove, another member's Work and a Work that stays still write nothing.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

(globalThis as any).__probeMember = null as string | null;
(globalThis as any).__sealMode = 'sealed' as 'sealed' | 'throws';

// The routes import the offline-cabin store only for MAIA_CABIN_MODE=offline, which this probe never sets. Its module pulls in
// 'server-only' and a native store, neither of which can load under jest, so it is replaced by inert stubs.
jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('@/lib/cabin/request', () => ({
  cabinStore: jest.fn(() => { throw new Error('cabin mode is not exercised by this probe'); }),
  cabinMemberFromRequest: jest.fn(() => { throw new Error('cabin mode is not exercised by this probe'); }),
  setCabinSessionCookie: jest.fn(),
}));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(async () => (globalThis as any).__probeMember ?? null),
}));
jest.mock('@/lib/recovery/r20DeletionLedger', () => ({
  sealR20DeletionLedger: jest.fn(async () => {
    if ((globalThis as any).__sealMode === 'throws') throw new Error('R20_LEDGER_FILE_MISSING');
    return { sealed: true };
  }),
  r20LedgerErrorCode: jest.fn(() => 'R20_LEDGER_FILE_MISSING'),
}));

import { DELETE as deleteManuscriptRoute } from '@/app/api/sovereign/manuscripts/[id]/route';
import { DELETE as deleteWorkRoute } from '@/app/api/sovereign/living-works/[id]/route';
import { closePool, query } from '@/lib/db/postgres';
// The mocked seal (see jest.mock above): Remove and X8 must never call it; only a Delete of a writing does.
import { sealR20DeletionLedger } from '@/lib/recovery/r20DeletionLedger';

const enabled = process.env.WS_DELETE_DYNAMIC === 'fictional-only';
const suite = enabled ? describe : describe.skip;
jest.setTimeout(120_000);

const MEMBER_A = '11111111-1111-4111-8111-111111111111';
const MEMBER_B = '22222222-2222-4222-8222-222222222222';
const MS_SHARED = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const MS_SOLO = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const MS_TWO = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const W_A = 'a0000000-0000-4000-8000-00000000000a';
const W_B = 'b0000000-0000-4000-8000-00000000000b';
const W_SOLO = 'c0000000-0000-4000-8000-00000000000c';
const W_EMPTY = 'd0000000-0000-4000-8000-00000000000d';
const W_TWO = 'e0000000-0000-4000-8000-00000000000e';

const asMember = (id: string | null) => { (globalThis as any).__probeMember = id; };
const sealMode = (mode: 'sealed' | 'throws') => { (globalThis as any).__sealMode = mode; };
const request = (path: string) => new NextRequest(`http://localhost${path}`, { method: 'DELETE' });
const delManuscript = async (id: string, viaWork?: string) => {
  const res = await deleteManuscriptRoute(request(`/api/sovereign/manuscripts/${id}${viaWork === undefined ? '' : `?workId=${viaWork}`}`), { params: Promise.resolve({ id }) });
  return { status: res.status, body: await res.json().catch(() => null) as any };
};
const delWork = async (id: string) => {
  const res = await deleteWorkRoute(request(`/api/sovereign/living-works/${id}`), { params: Promise.resolve({ id }) });
  return { status: res.status, body: await res.json().catch(() => null) as any };
};
const count = async (sql: string, params: unknown[] = []) => Number((await query<{ n: string }>(`SELECT count(*)::int AS n FROM ${sql}`, params as any[])).rows[0]!.n);
const manuscriptExists = (id: string) => count('member_manuscripts WHERE id = $1', [id]).then((n) => n === 1);
const workExists = (id: string) => count('living_works WHERE id = $1', [id]).then((n) => n === 1);
const declares = (workId: string, manuscriptId: string) =>
  count(`living_work_expressions WHERE living_work_id = $1 AND expression_type = 'manuscript' AND expression_id = $2`, [workId, manuscriptId]).then((n) => n === 1);
const dangling = () => count(`living_work_expressions e WHERE e.expression_type = 'manuscript' AND NOT EXISTS (SELECT 1 FROM member_manuscripts m WHERE m.id = e.expression_id)`);

/** The act labels the three writers of a deletion record use. Spelled out here on purpose: a probe must not import the text it checks. */
const REMOVE_NOTE = 'Writer Work removed by verified member request';
const DELETE_NOTE = 'Writer manuscript custody ended by verified member request';
const sealCalls = () => (sealR20DeletionLedger as unknown as { mock: { calls: unknown[] } }).mock.calls.length;
const clearSealCalls = () => (sealR20DeletionLedger as unknown as { mockClear: () => void }).mockClear();
type ManifestRow = { id: string; reason_class: string; authorized_by: string; note: string | null; executed_at: Date | null };
const manifests = async () => (await query<ManifestRow>(`SELECT id, reason_class, authorized_by, note, executed_at FROM deletion_manifests ORDER BY created_at, id`)).rows;
const tombstones = async () => (await query<{ manifest_id: string; object_kind: string; object_id: string }>(`SELECT manifest_id, object_kind, object_id FROM provenance_tombstones ORDER BY object_kind, object_id`)).rows;
const tombstoneKeys = async () => (await tombstones()).map((t) => `${t.object_kind}:${t.object_id}`);
async function expectNoRecords() {
  expect(await count('deletion_manifests')).toBe(0);
  expect(await count('provenance_tombstones')).toBe(0);
}
/**
 * Exactly ONE Remove record and nothing else: one `member_deletion` manifest by the self-service authority with the Remove label and an
 * execution time, and exactly one tombstone, of kind `living_works`, for `workId`, hanging off that manifest. `toEqual` on the whole
 * tombstone list is what proves there is no `member_manuscripts` tombstone (Remove erases no writing) and no second tombstone.
 */
async function expectOneRemoveRecord(workId: string) {
  const m = await manifests();
  expect(m).toHaveLength(1);
  expect(m[0]).toMatchObject({ reason_class: 'member_deletion', authorized_by: 'verified-member-self-service', note: REMOVE_NOTE });
  expect(m[0]!.executed_at).not.toBeNull();
  expect(await tombstones()).toEqual([{ manifest_id: m[0]!.id, object_kind: 'living_works', object_id: workId }]);
}
const addVisual = (workId: string, storagePath: string) => query(
  `INSERT INTO living_work_visuals(living_work_id, member_id, kind, storage_path, mime_type, byte_size) VALUES ($1, $2, 'cover', $3, 'image/png', 10)`,
  [workId, MEMBER_A, storagePath],
);
/**
 * Shadow-only fault injection: a BEFORE INSERT trigger on `table` that RAISEs (always, or only where `when` holds on NEW). It lives only
 * while `body` runs and is dropped in a finally, so a failing probe cannot leave it behind for the next one.
 */
async function withFault(table: 'provenance_tombstones' | 'deletion_manifests', when: string, body: () => Promise<void>) {
  await query(`CREATE OR REPLACE FUNCTION fictional_record_fault() RETURNS trigger AS $$ BEGIN IF ${when} THEN RAISE EXCEPTION 'fictional record fault'; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql`);
  await query(`DROP TRIGGER IF EXISTS fictional_record_fault ON ${table}`);
  await query(`CREATE TRIGGER fictional_record_fault BEFORE INSERT ON ${table} FOR EACH ROW EXECUTE FUNCTION fictional_record_fault()`);
  try { await body(); } finally {
    await query(`DROP TRIGGER IF EXISTS fictional_record_fault ON ${table}`);
    await query(`DROP FUNCTION IF EXISTS fictional_record_fault()`);
  }
}
/**
 * Shadow-only fault injection for a LOST RACE: a BEFORE DELETE trigger on `living_works` that skips the row (returns NULL), so a
 * `DELETE ... RETURNING` finds the row, deletes nothing and returns zero rows. In a real database the Remove route can never reach that
 * branch by timing alone: it holds the Work row FOR UPDATE from its lookup to its DELETE, so no other request can remove the row in
 * between. The branch still exists (a request whose DELETE removes nothing must write nothing), and without this fault no physical
 * probe could tell a route that records before that guard from one that records after it (defeat candidate RR10p survived until this
 * existed). Dropped in a finally, like withFault.
 */
async function withSkippedWorkDelete(body: () => Promise<void>) {
  await query(`CREATE OR REPLACE FUNCTION fictional_skip_work_delete() RETURNS trigger AS $$ BEGIN RETURN NULL; END; $$ LANGUAGE plpgsql`);
  await query(`DROP TRIGGER IF EXISTS fictional_skip_work_delete ON living_works`);
  await query(`CREATE TRIGGER fictional_skip_work_delete BEFORE DELETE ON living_works FOR EACH ROW EXECUTE FUNCTION fictional_skip_work_delete()`);
  try { await body(); } finally {
    await query(`DROP TRIGGER IF EXISTS fictional_skip_work_delete ON living_works`);
    await query(`DROP FUNCTION IF EXISTS fictional_skip_work_delete()`);
  }
}
/** Invariants that hold after EVERY probe, whatever it did. They sit under each probe's own assertions and fail the probe that broke them. */
async function assertRecordInvariants() {
  // A manifest is never left without the tombstone that gives it meaning.
  expect(await count(`deletion_manifests m WHERE NOT EXISTS (SELECT 1 FROM provenance_tombstones t WHERE t.manifest_id = m.id)`)).toBe(0);
  // A writing that still exists is never tombstoned: Remove and X8 erase no writing, and a Delete tombstones only the writing it erased.
  expect(await count(`provenance_tombstones t JOIN member_manuscripts m ON t.object_kind = 'member_manuscripts' AND t.object_id = m.id::text`)).toBe(0);
  // Likewise a Work that still exists (a Work that stays after a Delete, or a rolled-back Remove, gets no tombstone).
  expect(await count(`provenance_tombstones t JOIN living_works w ON t.object_kind = 'living_works' AND t.object_id = w.id::text`)).toBe(0);
}

async function reset() {
  await query('TRUNCATE members, deletion_manifests, provenance_tombstones, vault_erasure_queue CASCADE');
  clearSealCalls();
  await query('INSERT INTO members(id) VALUES ($1), ($2)', [MEMBER_A, MEMBER_B]);
  for (const [id, title] of [[MS_SHARED, 'The Shared Fictional Writing'], [MS_SOLO, 'A Solo Fictional Writing'], [MS_TWO, 'A Two-Part Fictional Writing']]) {
    await query('INSERT INTO member_manuscripts(id, member_id, title) VALUES ($1, $2, $3)', [id, MEMBER_A, title]);
  }
  for (const id of [W_A, W_B, W_SOLO, W_EMPTY, W_TWO]) await query('INSERT INTO living_works(id, member_id) VALUES ($1, $2)', [id, MEMBER_A]);
  const declare = (w: string, m: string) => query(`INSERT INTO living_work_expressions(living_work_id, expression_type, expression_id) VALUES ($1, 'manuscript', $2)`, [w, m]);
  await declare(W_A, MS_SHARED); await declare(W_B, MS_SHARED);   // one writing, two Works
  await declare(W_SOLO, MS_SOLO);                                   // an ordinary Work
  await declare(W_TWO, MS_TWO);                                     // a Work that also names something else
  await query(`INSERT INTO living_work_expressions(living_work_id, expression_type, expression_id) VALUES ($1, 'material', $2)`, [W_TWO, 'f0000000-0000-4000-8000-00000000000f']);
  // W_EMPTY declares nothing: a Work with no writing yet.
  asMember(MEMBER_A);
  sealMode('sealed');
}

let logSpy: jest.SpiedFunction<typeof console.log>;
let errSpy: jest.SpiedFunction<typeof console.error>;
const lines = (spy: jest.SpiedFunction<any>) => spy.mock.calls.map((c) => c.map((x: unknown) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' '));

suite('WS-DELETE-01 R-SHARED physical probes (real PostgreSQL 16, real routes, fictional rows)', () => {
  beforeAll(async () => {
    const url = process.env.DATABASE_URL ?? '';
    if (!/@(127\.0\.0\.1|localhost)[:/]/.test(url)) throw new Error('refusing: the probe database must be loopback');
    // These probes TRUNCATE members CASCADE: only the throwaway database the runner creates may be touched.
    if (!/\/ws_delete_fictional(\?|$)/.test(url)) throw new Error('refusing: the probe database must be the disposable ws_delete_fictional database');
  });
  beforeEach(async () => {
    await reset();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(async () => {
    logSpy.mockRestore(); errSpy.mockRestore();
    await assertRecordInvariants();
  });
  afterAll(async () => { await closePool(); });

  describe('two Works hold one writing', () => {
    it('SH-1 Delete is refused with 409 declared_in_other_works, and NOTHING is touched', async () => {
      const out = await delManuscript(MS_SHARED);
      expect(out.status).toBe(409);
      expect(out.body).toEqual({ refusal: 'declared_in_other_works', works: 2 });
      expect(await manuscriptExists(MS_SHARED)).toBe(true);
      expect(await declares(W_A, MS_SHARED)).toBe(true);
      expect(await declares(W_B, MS_SHARED)).toBe(true);
      expect(await workExists(W_A)).toBe(true);
      expect(await workExists(W_B)).toBe(true);
      expect(await count('deletion_manifests')).toBe(0);
      expect(await count('provenance_tombstones')).toBe(0);
      expect(await count('vault_erasure_queue')).toBe(0);
    });

    it('SH-2 the refusal is a deadlock on its own: Delete from EITHER Work is refused while both claim the writing', async () => {
      expect((await delManuscript(MS_SHARED)).status).toBe(409);
      expect((await delManuscript(MS_SHARED)).status).toBe(409);
      expect(await manuscriptExists(MS_SHARED)).toBe(true);
    });

    it('SH-3 Remove this Work (living-works DELETE) removes ONE Work, keeps the writing and the other Work intact', async () => {
      const out = await delWork(W_A);
      expect(out).toEqual({ status: 200, body: { withdrawn: W_A } });
      expect(await workExists(W_A)).toBe(false);
      expect(await declares(W_A, MS_SHARED)).toBe(false);
      expect(await manuscriptExists(MS_SHARED)).toBe(true);
      expect(await workExists(W_B)).toBe(true);
      expect(await declares(W_B, MS_SHARED)).toBe(true);
      expect(await dangling()).toBe(0);
    });

    it('SH-4 after the removal, Delete from the other Work goes through and ends the writing and that Work, with its erasure record', async () => {
      await delWork(W_A);
      const out = await delManuscript(MS_SHARED);
      expect(out).toEqual({ status: 200, body: { removed: true, workRemoved: true } });
      expect(await manuscriptExists(MS_SHARED)).toBe(false);
      expect(await workExists(W_B)).toBe(false);
      expect(await dangling()).toBe(0);
      // LAW CHANGED (follow-up 2026-11-06): the Remove of W_A now writes its OWN member_deletion manifest, so after Remove + Delete there are
      // TWO (this said toBe(1) while Remove wrote no record). Exactly one of them is the Delete's, and that one tombstones the writing.
      expect(await count(`deletion_manifests WHERE reason_class = 'member_deletion'`)).toBe(2);
      expect(await count(`deletion_manifests WHERE note = $1`, [DELETE_NOTE])).toBe(1);
      expect(await count(`deletion_manifests WHERE note = $1`, [REMOVE_NOTE])).toBe(1);
      expect(await count(`provenance_tombstones WHERE object_kind = 'member_manuscripts' AND object_id = $1`, [MS_SHARED])).toBe(1);
      expect(await count(`provenance_tombstones WHERE object_kind = 'living_works' AND object_id = $1`, [W_B])).toBe(1);
      expect(await count(`provenance_tombstones WHERE object_kind = 'living_works' AND object_id = $1`, [W_A])).toBe(1);   // the Remove's
      expect(sealCalls()).toBe(1);   // only the Delete seals the independent ledger; the Remove before it did not
    });

    it('SH-5 Remove records exactly ONE member_deletion manifest and ONE living_works tombstone for the removed Work, NO tombstone for any writing, and seals nothing (LAW CHANGED: it used to record nothing)', async () => {
      // LAW CHANGED (follow-up 2026-11-06). This probe used to pin "Remove records NO deletion manifest and NO tombstone". A governed restore from
      // a backup taken before the removal would then have brought the Work back, so Remove now writes the record (workDeletionRecord.ts).
      const out = await delWork(W_A);
      expect(out).toEqual({ status: 200, body: { withdrawn: W_A } });
      await expectOneRemoveRecord(W_A);
      // Remove erases no writing: all three writings are still there, and none of them is tombstoned (expectOneRemoveRecord proved the tombstone list).
      for (const ms of [MS_SHARED, MS_SOLO, MS_TWO]) expect(await manuscriptExists(ms)).toBe(true);
      expect(await workExists(W_B)).toBe(true);
      expect(await count('vault_erasure_queue')).toBe(0);
      // The independent R20 ledger is deliberately NOT sealed on this path (see workDeletionRecord.ts); a seal here would turn a success into custody_incomplete.
      expect(sealCalls()).toBe(0);
    });

    it('SH-6 removing BOTH Works never destroys the writing: it stays, declared by nobody, and can still be deleted as loose writing', async () => {
      expect((await delWork(W_A)).status).toBe(200);
      expect((await delWork(W_B)).status).toBe(200);
      expect(await manuscriptExists(MS_SHARED)).toBe(true);
      expect(await count(`living_work_expressions WHERE expression_id = $1`, [MS_SHARED])).toBe(0);
      const out = await delManuscript(MS_SHARED);
      expect(out).toEqual({ status: 200, body: { removed: true, workRemoved: false } });
      expect(await manuscriptExists(MS_SHARED)).toBe(false);
    });

    it('SH-7 removing both Works at the same time ends both and keeps the writing', async () => {
      const [a, b] = await Promise.all([delWork(W_A), delWork(W_B)]);
      expect([a.status, b.status]).toEqual([200, 200]);
      expect(await manuscriptExists(MS_SHARED)).toBe(true);
      expect(await dangling()).toBe(0);
      // Two Works removed, so two records, each for its own Work (LAW CHANGED: there used to be none).
      expect(await count(`deletion_manifests WHERE note = $1`, [REMOVE_NOTE])).toBe(2);
      expect(await tombstoneKeys()).toEqual([`living_works:${W_A}`, `living_works:${W_B}`]);
      expect(sealCalls()).toBe(0);
    });

    it('SH-8 RACE: Delete and Remove at the same moment, 40 times. Every outcome is one of the two lawful ones; the writing is never erased while the other Work still declares it', async () => {
      // The recovery-capture key serialises this pair (both routes take it first), so SH-8 pins outcomes and no 5xx, not row order.
      const outcomes = new Map<string, number>();
      for (let i = 0; i < 40; i += 1) {
        await reset();
        const jitter = i % 3;
        const del = (async () => { if (jitter === 1) await new Promise((r) => setTimeout(r, 2)); return delManuscript(MS_SHARED); })();
        const rem = (async () => { if (jitter === 2) await new Promise((r) => setTimeout(r, 2)); return delWork(W_A); })();
        const [d, r] = await Promise.all([del, rem]);
        const msGone = !(await manuscriptExists(MS_SHARED));
        const bAlive = await workExists(W_B);
        const key = `delete=${d.status} remove=${r.status} writingGone=${msGone} otherWorkAlive=${bAlive}`;
        outcomes.set(key, (outcomes.get(key) ?? 0) + 1);
        expect(await dangling()).toBe(0);
        // The forbidden states: the writing erased while the other Work still names it; or a 5xx.
        expect(msGone && bAlive).toBe(false);
        expect(d.status === 500 || r.status === 500).toBe(false);
        // Lawful: refused AND removed (writing and B survive), or removed first and then erased (writing and B both gone).
        const lawful = (d.status === 409 && r.status === 200 && !msGone && bAlive) || (d.status === 200 && r.status === 200 && msGone && !bAlive);
        expect({ key, lawful }).toEqual({ key, lawful: true });
        // The records are exactly what the winner(s) wrote (LAW CHANGED: the Remove's record is part of it now).
        const keys = await tombstoneKeys();
        if (d.status === 409) {
          // Refused and removed: only the Remove wrote anything.
          expect({ key, manifests: (await manifests()).length, keys }).toEqual({ key, manifests: 1, keys: [`living_works:${W_A}`] });
        } else {
          // Removed first and then erased: the Remove's record plus the Delete's (the writing and the Work that held it last).
          expect({ key, manifests: (await manifests()).length, keys }).toEqual({ key, manifests: 2, keys: [`living_works:${W_A}`, `living_works:${W_B}`, `member_manuscripts:${MS_SHARED}`] });
        }
      }
      // The observed mix is part of the record, whatever it is.
      console.warn('[probe SH-8 outcomes]', JSON.stringify(Object.fromEntries(outcomes)));
    });
  });

  describe('a stale card (the Work the member pressed Delete on no longer holds the writing)', () => {
    it('ST-1 after Work A is removed, Delete from the STALE card of A is refused and touches nothing: the writing and Work B survive', async () => {
      await delWork(W_A);
      const out = await delManuscript(MS_SHARED, W_A);
      expect(out).toEqual({ status: 409, body: { refusal: 'work_no_longer_holds_it' } });
      expect(await manuscriptExists(MS_SHARED)).toBe(true);
      expect(await workExists(W_B)).toBe(true);
      expect(await declares(W_B, MS_SHARED)).toBe(true);
      // LAW CHANGED (follow-up 2026-11-06): the Remove that PRECEDED the stale-card Delete now left its own record (this said 0 and 0). The
      // refusal itself wrote nothing: the one Remove record is all there is, and there is no tombstone for the writing.
      await expectOneRemoveRecord(W_A);
      expect(sealCalls()).toBe(0);
    });

    it('ST-2 the SAME request without the guard erases the other Work and the writing (this is the harm the guard closes)', async () => {
      await delWork(W_A);
      const out = await delManuscript(MS_SHARED);
      expect(out.status).toBe(200);
      expect(await manuscriptExists(MS_SHARED)).toBe(false);
      expect(await workExists(W_B)).toBe(false);
    });

    it('ST-3 Delete from the card of the sole remaining claimant goes through', async () => {
      await delWork(W_A);
      const out = await delManuscript(MS_SHARED, W_B);
      expect(out).toEqual({ status: 200, body: { removed: true, workRemoved: true } });
      expect(await manuscriptExists(MS_SHARED)).toBe(false);
      expect(await workExists(W_B)).toBe(false);
    });

    it('ST-4 while both Works still hold the writing the refusal is still the shared one (the guard does not pre-empt it)', async () => {
      const out = await delManuscript(MS_SHARED, W_A);
      expect(out).toEqual({ status: 409, body: { refusal: 'declared_in_other_works', works: 2 } });
    });

    it('ST-8 three Works hold the writing and one is removed: Delete from the REMOVED Work\'s stale card gets the stale-card refusal, not the shared one (the guard is evaluated first)', async () => {
      const W_C = 'c1000000-0000-4000-8000-0000000000c1';
      await query('INSERT INTO living_works(id, member_id) VALUES ($1, $2)', [W_C, MEMBER_A]);
      await query(`INSERT INTO living_work_expressions(living_work_id, expression_type, expression_id) VALUES ($1, 'manuscript', $2)`, [W_C, MS_SHARED]);
      await delWork(W_A);
      const out = await delManuscript(MS_SHARED, W_A);
      expect(out).toEqual({ status: 409, body: { refusal: 'work_no_longer_holds_it' } });
      expect(await manuscriptExists(MS_SHARED)).toBe(true);
      expect(await workExists(W_B)).toBe(true);
      expect(await workExists(W_C)).toBe(true);
    });

    it('ST-5 a Work id that is not this member\'s, or does not exist, is refused exactly like a stale one (no existence leak) and nothing changes', async () => {
      const stranger = '99999999-9999-4999-8999-999999999999';
      const a = await delManuscript(MS_SOLO, stranger);
      const b = await delManuscript(MS_SOLO, W_B);
      expect(a).toEqual({ status: 409, body: { refusal: 'work_no_longer_holds_it' } });
      expect(b).toEqual(a);
      expect(await manuscriptExists(MS_SOLO)).toBe(true);
      expect(await workExists(W_SOLO)).toBe(true);
    });

    it('ST-6 a malformed Work id is refused 400 rather than silently ignored (ignoring it would turn a guarded delete into an unguarded one)', async () => {
      const out = await delManuscript(MS_SOLO, 'not-a-uuid');
      expect(out.status).toBe(400);
      expect(await manuscriptExists(MS_SOLO)).toBe(true);
    });

    it('ST-7 an uppercase Work id is the same Work (UUIDs are case-insensitive)', async () => {
      const out = await delManuscript(MS_SOLO, W_SOLO.toUpperCase());
      expect(out).toEqual({ status: 200, body: { removed: true, workRemoved: true } });
    });
  });

  describe('the ordinary cases the new step must not disturb', () => {
    it('OR-1 an unshared Work: Delete ends the writing and the Work, and records the erasure', async () => {
      const out = await delManuscript(MS_SOLO);
      expect(out).toEqual({ status: 200, body: { removed: true, workRemoved: true } });
      expect(await manuscriptExists(MS_SOLO)).toBe(false);
      expect(await workExists(W_SOLO)).toBe(false);
      expect(await count('deletion_manifests')).toBe(1);
    });

    it('OR-2 a Work with no writing: the Work row is removed, and that removal is RECORDED like any other (LAW CHANGED: it used to leave no record)', async () => {
      const out = await delWork(W_EMPTY);
      expect(out).toEqual({ status: 200, body: { withdrawn: W_EMPTY } });
      expect(await workExists(W_EMPTY)).toBe(false);
      // LAW CHANGED (follow-up 2026-11-06): this said deletion_manifests toBe(0). The Work row really went, so its record is written.
      await expectOneRemoveRecord(W_EMPTY);
      expect(sealCalls()).toBe(0);
    });

    it('OR-3 a Work that names the writing AND something else loses only the expression that died, and survives', async () => {
      const out = await delManuscript(MS_TWO);
      expect(out).toEqual({ status: 200, body: { removed: true, workRemoved: false } });
      expect(await manuscriptExists(MS_TWO)).toBe(false);
      expect(await workExists(W_TWO)).toBe(true);
      expect(await count(`living_work_expressions WHERE living_work_id = $1`, [W_TWO])).toBe(1);
      // A Work that STAYS gets no Work record (the Delete's own manifest tombstones the writing, nothing else).
      expect(await tombstoneKeys()).toEqual([`member_manuscripts:${MS_TWO}`]);
    });

    it('OR-4 member scoping: another member gets 404 from BOTH routes and nothing changes (no record, no seal)', async () => {
      asMember(MEMBER_B);
      expect((await delManuscript(MS_SOLO)).status).toBe(404);
      expect((await delWork(W_A)).status).toBe(404);
      expect(await manuscriptExists(MS_SOLO)).toBe(true);
      expect(await workExists(W_A)).toBe(true);
      await expectNoRecords();
      expect(sealCalls()).toBe(0);
    });

    it('OR-5 no session: both routes answer 401 and change nothing (no record)', async () => {
      asMember(null);
      expect((await delManuscript(MS_SOLO)).status).toBe(401);
      expect((await delWork(W_A)).status).toBe(401);
      expect(await manuscriptExists(MS_SOLO)).toBe(true);
      expect(await workExists(W_A)).toBe(true);
      await expectNoRecords();
    });
  });

  describe('Remove writes its own deletion record, once, for the right id, in the same transaction as the removal (follow-up 2026-11-06)', () => {
    it('REC-1 an id that does not exist is a 404 and writes NOTHING (the record is written only for a row this statement really deleted)', async () => {
      const out = await delWork('99999999-9999-4999-8999-999999999999');
      expect(out.status).toBe(404);
      await expectNoRecords();
      expect(sealCalls()).toBe(0);
    });

    it('REC-2 a second Remove of the same id is a 404 and writes nothing more: there is still exactly one record', async () => {
      expect((await delWork(W_A)).status).toBe(200);
      expect((await delWork(W_A)).status).toBe(404);
      await expectOneRemoveRecord(W_A);
      expect(sealCalls()).toBe(0);
    });

    it('REC-3 another member\'s Work: 404, the Work is untouched and NO record exists, for either member', async () => {
      asMember(MEMBER_B);
      const out = await delWork(W_A);
      expect(out.status).toBe(404);
      expect(await workExists(W_A)).toBe(true);
      expect(await declares(W_A, MS_SHARED)).toBe(true);
      await expectNoRecords();
    });

    it('REC-4 the tombstone carries the id THE DATABASE returned, not the spelling in the URL: an upper-case id removes the Work and tombstones the lower-case uuid', async () => {
      const out = await delWork(W_A.toUpperCase());
      expect(out).toEqual({ status: 200, body: { withdrawn: W_A } });
      expect(await workExists(W_A)).toBe(false);
      // expectOneRemoveRecord compares object_id to the canonical lower-case id with strict equality, so an upper-case tombstone fails here.
      await expectOneRemoveRecord(W_A);
    });

    it('REC-5 a Work with an image: the record, the queued bytes and the removal are one transaction, and the sweep still destroys the bytes', async () => {
      await addVisual(W_A, 'work-visuals/rec5-image-absent.png');   // an absent path is destroyed by the sweep (idempotent)
      const out = await delWork(W_A);
      expect(out).toEqual({ status: 200, body: { withdrawn: W_A } });
      await expectOneRemoveRecord(W_A);
      expect(await count('living_work_visuals WHERE living_work_id = $1', [W_A])).toBe(0);
      expect(await count('vault_erasure_queue')).toBe(0);
      expect(sealCalls()).toBe(0);
    });

    it('REC-6 the record is content-free: ids, a fixed act label and the self-service authority only (no title, no text of the writing)', async () => {
      await delWork(W_A);
      const m = await manifests();
      expect(m).toHaveLength(1);
      expect(Object.keys(m[0]!).sort()).toEqual(['authorized_by', 'executed_at', 'id', 'note', 'reason_class']);
      expect(m[0]!.note).toBe(REMOVE_NOTE);
      const everything = JSON.stringify({ m, t: await tombstones() });
      for (const title of ['The Shared Fictional Writing', 'A Solo Fictional Writing', 'A Two-Part Fictional Writing']) expect(everything).not.toContain(title);
    });

    it('ROLL-1 if the Work tombstone cannot be written the Remove ROLLS BACK: generic 500, the Work, its declaration and its image row survive, no manifest, nothing queued, nothing sealed; and the same Remove succeeds once the fault is gone', async () => {
      await addVisual(W_A, 'work-visuals/roll1-image-absent.png');
      await withFault('provenance_tombstones', `NEW.object_kind = 'living_works'`, async () => {
        const out = await delWork(W_A);
        // The existing generic failure, byte for byte. It carries no removed:true: the client reads that as "gone, but image bytes owed".
        expect(out).toEqual({ status: 500, body: { error: 'Could not withdraw that declaration' } });
        expect(lines(errSpy).some((l) => l.includes('[living-works] withdraw failed'))).toBe(true);
        expect(await workExists(W_A)).toBe(true);
        expect(await declares(W_A, MS_SHARED)).toBe(true);
        expect(await count('living_work_visuals WHERE living_work_id = $1', [W_A])).toBe(1);
        await expectNoRecords();
        expect(await count('vault_erasure_queue')).toBe(0);
        expect(sealCalls()).toBe(0);
      });
      // The fault is gone: nothing was left in the way, so the same act now completes and is recorded.
      const again = await delWork(W_A);
      expect(again).toEqual({ status: 200, body: { withdrawn: W_A } });
      await expectOneRemoveRecord(W_A);
    });

    it('ROLL-2 the same when the MANIFEST cannot be written: the Work is not removed', async () => {
      await withFault('deletion_manifests', 'true', async () => {
        const out = await delWork(W_A);
        expect(out).toEqual({ status: 500, body: { error: 'Could not withdraw that declaration' } });
        expect(await workExists(W_A)).toBe(true);
        expect(await declares(W_A, MS_SHARED)).toBe(true);
        await expectNoRecords();
        expect(await count('vault_erasure_queue')).toBe(0);
      });
    });

    it('ROLL-3 a lost race, made physical: the lookup finds the Work but the DELETE then removes NOTHING (a shadow-only trigger skips the row): 404, the Work and its image row are untouched, and NO manifest, tombstone, queue row or seal is written; once the fault is gone the same Remove completes and records exactly once', async () => {
      await addVisual(W_A, 'work-visuals/roll3-image-absent.png');
      await withSkippedWorkDelete(async () => {
        const out = await delWork(W_A);
        expect(out).toEqual({ status: 404, body: { error: 'Not found' } });
        expect(await workExists(W_A)).toBe(true);
        expect(await declares(W_A, MS_SHARED)).toBe(true);
        expect(await count('living_work_visuals WHERE living_work_id = $1', [W_A])).toBe(1);
        await expectNoRecords();   // a route that records BEFORE checking that its own DELETE removed a row fails here
        expect(await count('vault_erasure_queue')).toBe(0);
        expect(sealCalls()).toBe(0);
      });
      const again = await delWork(W_A);
      expect(again).toEqual({ status: 200, body: { withdrawn: W_A } });
      await expectOneRemoveRecord(W_A);
    });

    it('BEH-1 the Work tombstone is read by the ordinary-lane R20 refusal trigger: after Remove, re-inserting that Work id is refused (same object_kind and id spelling), while an untouched id is accepted', async () => {
      // Does NOT exercise the governed restore lane (s5.restore_lane = \'governed\'), where the trigger lets the row in, or the post-restore
      // sweep of scripts/restore-governed.sh, which is what removes it there. Lane record 6.9.5: the governed-restore witness covers a Delete
      // with its Work, and a restore witness for the Remove case is not done. What this shows is only that the tombstone Remove writes is
      // the row the ordinary-lane trigger looks up.
      // Needs database/migrations/20261021000001_writer_r20_restore_refusal.sql, which run-local-pg16.sh applies. If it is missing this fails
      // loudly instead of passing for nothing.
      expect(await count(`pg_trigger WHERE tgname = 'r20_refuse_writer_tombstoned' AND NOT tgisinternal`)).toBeGreaterThanOrEqual(2);
      await delWork(W_A);
      await expect(query('INSERT INTO living_works(id, member_id) VALUES ($1, $2)', [W_A, MEMBER_A])).rejects.toThrow(/r20_writer_tombstone_refusal/);
      expect(await workExists(W_A)).toBe(false);
      // Control: a Work id nobody removed is accepted, so the refusal above is the tombstone and not a blanket refusal.
      const W_NEW = 'a1000000-0000-4000-8000-0000000000a1';
      await query('INSERT INTO living_works(id, member_id) VALUES ($1, $2)', [W_NEW, MEMBER_A]);
      expect(await workExists(W_NEW)).toBe(true);
      // Control: the Work that STAYED (W_B) has no tombstone, so it could be re-inserted if it were ever absent: removing W_A did not tombstone it.
      expect(await count(`provenance_tombstones WHERE object_id = $1`, [W_B])).toBe(0);
    });
  });

  describe('the two different 500s, with the exact signature each leaves', () => {
    it('F-1 custody NOT confirmed (the recovery seal throws): rows ARE gone, status 500, body {removed:true, refusal:custody_incomplete, unconfirmed:{deletionRecord:true}, workRemoved}, and the "manuscript erased ... sweptAll: false" line is logged', async () => {
      sealMode('throws');
      const out = await delManuscript(MS_SOLO);
      expect(out.status).toBe(500);
      expect(out.body).toEqual({ removed: true, refusal: 'custody_incomplete', unconfirmed: { originalFile: false, image: false, deletionRecord: true }, workRemoved: true });
      expect(await manuscriptExists(MS_SOLO)).toBe(false);
      expect(await workExists(W_SOLO)).toBe(false);
      expect(lines(logSpy).some((l) => l.includes('manuscript erased') && l.includes('sweptAll: false'))).toBe(true);
      expect(lines(errSpy).some((l) => l.includes('R20 recovery seal still owed'))).toBe(true);
      expect(lines(errSpy).some((l) => l.includes('DELETE error'))).toBe(false);
    });

    it('F-2 an exception inside the erase transaction: status 500 with a BARE body, NOTHING deleted (rolled back), and "[press/manuscripts/:id] DELETE error:" is logged', async () => {
      await query(`CREATE OR REPLACE FUNCTION r20_erase_writer_editorial_history(manifest_id uuid, member_id uuid, manuscript_id uuid) RETURNS void AS $$ BEGIN RAISE EXCEPTION 'fictional failure'; END; $$ LANGUAGE plpgsql`);
      try {
        const out = await delManuscript(MS_SOLO);
        expect(out.status).toBe(500);
        expect(out.body).toEqual({ error: 'Failed to remove manuscript' });
        expect(out.body.removed).toBeUndefined();
        expect(await manuscriptExists(MS_SOLO)).toBe(true);
        expect(await workExists(W_SOLO)).toBe(true);
        expect(await count('deletion_manifests')).toBe(0);
        expect(lines(errSpy).some((l) => l.includes('DELETE error'))).toBe(true);
        expect(lines(logSpy).some((l) => l.includes('manuscript erased'))).toBe(false);
      } finally {
        await query(`CREATE OR REPLACE FUNCTION r20_erase_writer_editorial_history(manifest_id uuid, member_id uuid, manuscript_id uuid) RETURNS void AS $$ BEGIN IF manifest_id IS NULL OR member_id IS NULL OR manuscript_id IS NULL THEN RAISE EXCEPTION 'fictional R20 editorial erasure requires exact authority'; END IF; END; $$ LANGUAGE plpgsql`);
      }
    });

    it('F-3 the two 500s are distinguishable by body alone: only custody_incomplete carries removed:true (this is what makes the browser refresh the list)', async () => {
      sealMode('throws');
      const custody = await delManuscript(MS_SOLO);
      expect(custody.body.removed).toBe(true);
      expect(custody.body.error).toBeUndefined();
    });
  });
});
