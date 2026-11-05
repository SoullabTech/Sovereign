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

async function reset() {
  await query('TRUNCATE members, deletion_manifests, provenance_tombstones, vault_erasure_queue CASCADE');
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
  });
  beforeEach(async () => {
    await reset();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => { logSpy.mockRestore(); errSpy.mockRestore(); });
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
      expect(out).toEqual({ status: 200, body: { removed: true } });
      expect(await manuscriptExists(MS_SHARED)).toBe(false);
      expect(await workExists(W_B)).toBe(false);
      expect(await dangling()).toBe(0);
      expect(await count(`deletion_manifests WHERE reason_class = 'member_deletion'`)).toBe(1);
      expect(await count(`provenance_tombstones WHERE object_kind = 'member_manuscripts' AND object_id = $1`, [MS_SHARED])).toBe(1);
      expect(await count(`provenance_tombstones WHERE object_kind = 'living_works' AND object_id = $1`, [W_B])).toBe(1);
    });

    it('SH-5 Remove records NO deletion manifest and NO tombstone (it deletes nothing of the writing), which is the truth the copy must match', async () => {
      await delWork(W_A);
      expect(await count('deletion_manifests')).toBe(0);
      expect(await count('provenance_tombstones')).toBe(0);
      expect(await count('vault_erasure_queue')).toBe(0);
    });

    it('SH-6 removing BOTH Works never destroys the writing: it stays, declared by nobody, and can still be deleted as loose writing', async () => {
      expect((await delWork(W_A)).status).toBe(200);
      expect((await delWork(W_B)).status).toBe(200);
      expect(await manuscriptExists(MS_SHARED)).toBe(true);
      expect(await count(`living_work_expressions WHERE expression_id = $1`, [MS_SHARED])).toBe(0);
      const out = await delManuscript(MS_SHARED);
      expect(out).toEqual({ status: 200, body: { removed: true } });
      expect(await manuscriptExists(MS_SHARED)).toBe(false);
    });

    it('SH-7 removing both Works at the same time ends both and keeps the writing', async () => {
      const [a, b] = await Promise.all([delWork(W_A), delWork(W_B)]);
      expect([a.status, b.status]).toEqual([200, 200]);
      expect(await manuscriptExists(MS_SHARED)).toBe(true);
      expect(await dangling()).toBe(0);
    });

    it('SH-8 RACE: Delete and Remove at the same moment, 40 times. Every outcome is one of the two lawful ones; the writing is never erased while the other Work still declares it', async () => {
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
      expect(await count('deletion_manifests')).toBe(0);
      expect(await count('provenance_tombstones')).toBe(0);
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
      expect(out).toEqual({ status: 200, body: { removed: true } });
      expect(await manuscriptExists(MS_SHARED)).toBe(false);
      expect(await workExists(W_B)).toBe(false);
    });

    it('ST-4 while both Works still hold the writing the refusal is still the shared one (the guard does not pre-empt it)', async () => {
      const out = await delManuscript(MS_SHARED, W_A);
      expect(out).toEqual({ status: 409, body: { refusal: 'declared_in_other_works', works: 2 } });
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
      expect(out).toEqual({ status: 200, body: { removed: true } });
    });
  });

  describe('the ordinary cases the new step must not disturb', () => {
    it('OR-1 an unshared Work: Delete ends the writing and the Work, and records the erasure', async () => {
      const out = await delManuscript(MS_SOLO);
      expect(out).toEqual({ status: 200, body: { removed: true } });
      expect(await manuscriptExists(MS_SOLO)).toBe(false);
      expect(await workExists(W_SOLO)).toBe(false);
      expect(await count('deletion_manifests')).toBe(1);
    });

    it('OR-2 a Work with no writing: only the declaration is withdrawn (this is the route that card uses, and nothing else exists to erase)', async () => {
      const out = await delWork(W_EMPTY);
      expect(out).toEqual({ status: 200, body: { withdrawn: W_EMPTY } });
      expect(await workExists(W_EMPTY)).toBe(false);
      expect(await count('deletion_manifests')).toBe(0);
    });

    it('OR-3 a Work that names the writing AND something else loses only the expression that died, and survives', async () => {
      const out = await delManuscript(MS_TWO);
      expect(out).toEqual({ status: 200, body: { removed: true } });
      expect(await manuscriptExists(MS_TWO)).toBe(false);
      expect(await workExists(W_TWO)).toBe(true);
      expect(await count(`living_work_expressions WHERE living_work_id = $1`, [W_TWO])).toBe(1);
    });

    it('OR-4 member scoping: another member gets 404 from BOTH routes and nothing changes', async () => {
      asMember(MEMBER_B);
      expect((await delManuscript(MS_SOLO)).status).toBe(404);
      expect((await delWork(W_A)).status).toBe(404);
      expect(await manuscriptExists(MS_SOLO)).toBe(true);
      expect(await workExists(W_A)).toBe(true);
    });

    it('OR-5 no session: both routes answer 401 and change nothing', async () => {
      asMember(null);
      expect((await delManuscript(MS_SOLO)).status).toBe(401);
      expect((await delWork(W_A)).status).toBe(401);
      expect(await manuscriptExists(MS_SOLO)).toBe(true);
    });
  });

  describe('the two different 500s, with the exact signature each leaves', () => {
    it('F-1 custody NOT confirmed (the recovery seal throws): rows ARE gone, status 500, body {removed:true, refusal:custody_incomplete}, and the "manuscript erased ... sweptAll: false" line is logged', async () => {
      sealMode('throws');
      const out = await delManuscript(MS_SOLO);
      expect(out.status).toBe(500);
      expect(out.body).toEqual({ removed: true, refusal: 'custody_incomplete' });
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
