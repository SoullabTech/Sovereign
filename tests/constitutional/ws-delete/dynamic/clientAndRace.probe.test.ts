/**
 * WS-DELETE-01 / R-SHARED — the client's real delete functions driven against the real routes on a real PostgreSQL 16, and
 * deterministic (lock-held, not sleep-timed) interleavings of Delete and Remove.
 *
 * WHAT THIS ADDS TO sharedWriting.probe.test.ts. That file proves what the SERVER does. The browser-side logic (lib/writersStudio/
 * deleteWork.ts: deleteWork, removeWork, runDeleteWork, runRemoveWork) is proven against faked responses elsewhere. Here the two
 * meet: the client's own functions are given a fetcher that calls the real route handlers, so what the member's page would do with
 * what the database really did is exercised end to end (short of a browser and the network).
 *
 * DETERMINISM. The interleavings below do not rely on timing. A second connection holds a lock the server's statement needs, the
 * test waits until PostgreSQL itself reports that statement as waiting on a lock, and only then lets go. The statement that was
 * waiting must act on what is true AFTER the other act committed.
 *
 * NOT PRODUCTION. Stub schema plus real migrations, the R20 seal replaced by a switch, no browser, no real vault bytes, no KMS.
 * Safety: disabled unless WS_DELETE_DYNAMIC=fictional-only; refuses a non-loopback database; fictional data only.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { Client } from 'pg';

(globalThis as any).__probeMember = null as string | null;
(globalThis as any).__sealMode = 'sealed' as 'sealed' | 'throws';

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
import { DeletionSharedMaterial, DeletionUnconfirmed, runDeleteWork, runRemoveWork } from '@/lib/writersStudio/deleteWork';

const enabled = process.env.WS_DELETE_DYNAMIC === 'fictional-only';
const suite = enabled ? describe : describe.skip;
jest.setTimeout(120_000);

const MEMBER_A = '11111111-1111-4111-8111-111111111111';
const MEMBER_B = '22222222-2222-4222-8222-222222222222';
const MS_SHARED = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const MS_SOLO = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const MS_M1 = 'cccccccc-cccc-4ccc-8ccc-cccccccccc01';
const MS_M2 = 'cccccccc-cccc-4ccc-8ccc-cccccccccc02';
const MS_GHOST = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'; // declared by a Work, present in no table
const W_A = 'a0000000-0000-4000-8000-00000000000a';
const W_B = 'b0000000-0000-4000-8000-00000000000b';
const W_SOLO = 'c0000000-0000-4000-8000-00000000000c';
const W_EMPTY = 'd0000000-0000-4000-8000-00000000000d';
const W_MANY = 'e0000000-0000-4000-8000-00000000000e';
const W_GHOST = 'f0000000-0000-4000-8000-00000000000f';
const ADVISORY_KEY = 'soullab:r20:recovery-capture';

const asMember = (id: string | null) => { (globalThis as any).__probeMember = id; };
const sealMode = (mode: 'sealed' | 'throws') => { (globalThis as any).__sealMode = mode; };
const count = async (sql: string, params: unknown[] = []) => Number((await query<{ n: string }>(`SELECT count(*)::int AS n FROM ${sql}`, params as any[])).rows[0]!.n);
const manuscriptExists = (id: string) => count('member_manuscripts WHERE id = $1', [id]).then((n) => n === 1);
const workExists = (id: string) => count('living_works WHERE id = $1', [id]).then((n) => n === 1);
/** Declarations naming a writing that no longer exists, EXCLUDING the one Work this file seeds as already dangling (W_GHOST). */
const dangling = () => count(`living_work_expressions e WHERE e.expression_type = 'manuscript' AND e.expression_id <> $1 AND NOT EXISTS (SELECT 1 FROM member_manuscripts m WHERE m.id = e.expression_id)`, [MS_GHOST]);
const danglingGhost = () => count(`living_work_expressions e WHERE e.expression_type = 'manuscript' AND e.expression_id = $1 AND NOT EXISTS (SELECT 1 FROM member_manuscripts m WHERE m.id = e.expression_id)`, [MS_GHOST]);

/** The client's fetcher, pointed at the real route handlers. Every request it makes is recorded. */
const calls: string[] = [];
const serverFetcher = async (url: string, init: RequestInit): Promise<Response> => {
  calls.push(`${init.method} ${url}`);
  const manuscript = url.match(/^\/api\/sovereign\/manuscripts\/([^/?]+)/);
  if (manuscript) {
    return deleteManuscriptRoute(new NextRequest(`http://localhost${url}`, { method: init.method }), { params: Promise.resolve({ id: manuscript[1]! }) }) as Promise<Response>;
  }
  const work = url.match(/^\/api\/sovereign\/living-works\/([^/?]+)/);
  if (work) {
    return deleteWorkRoute(new NextRequest(`http://localhost${url}`, { method: init.method }), { params: Promise.resolve({ id: work[1]! }) }) as Promise<Response>;
  }
  throw new Error(`unexpected request ${url}`);
};

const trace: string[] = [];
const refresh = async () => { trace.push('refresh'); };
const settle = async (p: Promise<void>): Promise<Error | null> => {
  try { await p; trace.push('resolved'); return null; } catch (e) { trace.push('rejected'); return e as Error; }
};

async function reset() {
  await query('TRUNCATE members, deletion_manifests, provenance_tombstones, vault_erasure_queue CASCADE');
  await query('INSERT INTO members(id) VALUES ($1), ($2)', [MEMBER_A, MEMBER_B]);
  for (const [id, title] of [[MS_SHARED, 'The Shared Fictional Writing'], [MS_SOLO, 'A Solo Fictional Writing'], [MS_M1, 'Many One'], [MS_M2, 'Many Two']]) {
    await query('INSERT INTO member_manuscripts(id, member_id, title) VALUES ($1, $2, $3)', [id, MEMBER_A, title]);
  }
  for (const id of [W_A, W_B, W_SOLO, W_EMPTY, W_MANY, W_GHOST]) await query('INSERT INTO living_works(id, member_id) VALUES ($1, $2)', [id, MEMBER_A]);
  const declare = (w: string, m: string) => query(`INSERT INTO living_work_expressions(living_work_id, expression_type, expression_id) VALUES ($1, 'manuscript', $2)`, [w, m]);
  await declare(W_A, MS_SHARED); await declare(W_B, MS_SHARED);
  await declare(W_SOLO, MS_SOLO);
  await declare(W_MANY, MS_M1); await declare(W_MANY, MS_M2);
  await declare(W_GHOST, MS_GHOST);
  asMember(MEMBER_A);
  sealMode('sealed');
  calls.length = 0;
  trace.length = 0;
}

/** Open a second connection, begin a transaction, and run the given setup inside it. The caller commits. */
async function holder(setup: (c: Client) => Promise<void>): Promise<Client> {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  await c.query('BEGIN');
  await setup(c);
  return c;
}
/** Wait until PostgreSQL itself reports a backend waiting on a lock in a statement containing `needle`. */
async function waitForLockWait(needle: string): Promise<void> {
  for (let i = 0; i < 200; i += 1) {
    const r = await query<{ n: string }>(
      `SELECT count(*)::int AS n FROM pg_stat_activity WHERE wait_event_type = 'Lock' AND query LIKE $1 AND pid <> pg_backend_pid()`,
      [`%${needle}%`],
    );
    if (Number(r.rows[0]!.n) > 0) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`no backend ever waited on a lock in a statement containing: ${needle}`);
}

let errSpy: jest.SpiedFunction<typeof console.error>;
let logSpy: jest.SpiedFunction<typeof console.log>;

suite('WS-DELETE-01 R-SHARED: the client\'s real functions against the real routes, and deterministic interleavings (PostgreSQL 16, fictional rows)', () => {
  beforeAll(async () => {
    const url = process.env.DATABASE_URL ?? '';
    if (!/@(127\.0\.0\.1|localhost)[:/]/.test(url)) throw new Error('refusing: the probe database must be loopback');
  });
  beforeEach(async () => {
    await reset();
    errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });
  afterEach(() => { errSpy.mockRestore(); logSpy.mockRestore(); });
  afterAll(async () => { await closePool(); });

  describe('end to end: what the member\'s page does with what the database really did', () => {
    it('CE-1 shared writing: Delete is refused and offers the other act; Remove keeps the writing; Delete from the last Work then ends it', async () => {
      const first = await settle(runDeleteWork({ workId: W_A, manuscriptId: MS_SHARED }, serverFetcher, refresh));
      expect(first).toBeInstanceOf(DeletionSharedMaterial);
      expect(trace).toEqual(['rejected']);                      // nothing changed, so nothing is re-read
      expect(await manuscriptExists(MS_SHARED)).toBe(true);
      expect(await workExists(W_A)).toBe(true);
      expect(await workExists(W_B)).toBe(true);

      trace.length = 0;
      expect(await settle(runRemoveWork(W_A, serverFetcher, refresh))).toBeNull();
      expect(trace).toEqual(['refresh', 'resolved']);
      expect(await workExists(W_A)).toBe(false);
      expect(await manuscriptExists(MS_SHARED)).toBe(true);     // the writing is kept
      expect(await workExists(W_B)).toBe(true);
      expect(await count('deletion_manifests')).toBe(0);

      trace.length = 0;
      expect(await settle(runDeleteWork({ workId: W_B, manuscriptId: MS_SHARED }, serverFetcher, refresh))).toBeNull();
      expect(await manuscriptExists(MS_SHARED)).toBe(false);
      expect(await workExists(W_B)).toBe(false);
      expect(await dangling()).toBe(0);
    });

    it('CE-2 a stale card: the page is re-read, then the member is told nothing was deleted; the writing and the other Work survive', async () => {
      await runRemoveWork(W_A, serverFetcher, refresh);
      trace.length = 0; calls.length = 0;
      const err = await settle(runDeleteWork({ workId: W_A, manuscriptId: MS_SHARED }, serverFetcher, refresh));
      expect(trace).toEqual(['refresh', 'rejected']);
      expect(err).not.toBeInstanceOf(DeletionSharedMaterial);
      expect(err).not.toBeInstanceOf(DeletionUnconfirmed);
      expect(err!.message).toContain('Nothing was deleted');
      expect(calls).toEqual([`DELETE /api/sovereign/manuscripts/${MS_SHARED}?workId=${W_A}`]);
      expect(await manuscriptExists(MS_SHARED)).toBe(true);
      expect(await workExists(W_B)).toBe(true);
    });

    it('CE-3 custody not confirmed (500 custody_incomplete): the rows ARE gone, the page is re-read first, and the member is told what could not be confirmed', async () => {
      sealMode('throws');
      const err = await settle(runDeleteWork({ workId: W_SOLO, manuscriptId: MS_SOLO }, serverFetcher, refresh));
      expect(err).toBeInstanceOf(DeletionUnconfirmed);
      expect(trace).toEqual(['refresh', 'rejected']);
      expect(err!.message).toContain('we are not going to tell you it is gone');
      expect(await manuscriptExists(MS_SOLO)).toBe(false);
      expect(await workExists(W_SOLO)).toBe(false);
    });

    it('CE-4 an exception inside the erase (500 with a bare body): the member is told we could not confirm, the page is re-read, and the re-read will show the Work still there because nothing was deleted', async () => {
      await query(`CREATE OR REPLACE FUNCTION r20_erase_writer_editorial_history(manifest_id uuid, member_id uuid, manuscript_id uuid) RETURNS void AS $$ BEGIN RAISE EXCEPTION 'fictional failure'; END; $$ LANGUAGE plpgsql`);
      try {
        const err = await settle(runDeleteWork({ workId: W_SOLO, manuscriptId: MS_SOLO }, serverFetcher, refresh));
        expect(trace).toEqual(['refresh', 'rejected']);
        expect(err!.message).toContain('could not confirm');
        expect(err!.message).not.toContain('Nothing was removed');
        expect(await manuscriptExists(MS_SOLO)).toBe(true);
        expect(await workExists(W_SOLO)).toBe(true);
      } finally {
        await query(`CREATE OR REPLACE FUNCTION r20_erase_writer_editorial_history(manifest_id uuid, member_id uuid, manuscript_id uuid) RETURNS void AS $$ BEGIN IF manifest_id IS NULL OR member_id IS NULL OR manuscript_id IS NULL THEN RAISE EXCEPTION 'fictional R20 editorial erasure requires exact authority'; END IF; END; $$ LANGUAGE plpgsql`);
      }
    });

    it('CE-5 a Work whose writing is already gone (declared, present in no table): Delete follows through and withdraws the Work, so no empty Work is left behind', async () => {
      expect(await danglingGhost()).toBe(1);
      const err = await settle(runDeleteWork({ workId: W_GHOST, manuscriptId: MS_GHOST }, serverFetcher, refresh));
      expect(err).toBeNull();
      expect(calls).toEqual([`DELETE /api/sovereign/manuscripts/${MS_GHOST}?workId=${W_GHOST}`, `DELETE /api/sovereign/living-works/${W_GHOST}`]);
      expect(await workExists(W_GHOST)).toBe(false);
      expect(await danglingGhost()).toBe(0);
    });

    it('CE-6 a Work with several writings: Remove ends the Work and deletes NONE of the writings (the sentence the confirmation says)', async () => {
      expect(await settle(runRemoveWork(W_MANY, serverFetcher, refresh))).toBeNull();
      expect(await workExists(W_MANY)).toBe(false);
      expect(await manuscriptExists(MS_M1)).toBe(true);
      expect(await manuscriptExists(MS_M2)).toBe(true);
      expect(await count('deletion_manifests')).toBe(0);
      expect(await count('provenance_tombstones')).toBe(0);
      expect(await count('vault_erasure_queue')).toBe(0);
    });

    it('CE-7 a Work with no writing: Delete withdraws it through the Work route, with no manuscript request at all', async () => {
      expect(await settle(runDeleteWork({ workId: W_EMPTY, manuscriptId: null }, serverFetcher, refresh))).toBeNull();
      expect(calls).toEqual([`DELETE /api/sovereign/living-works/${W_EMPTY}`]);
      expect(await workExists(W_EMPTY)).toBe(false);
    });

    it('CE-8 no session: the member is told to sign in, nothing is re-read, nothing changes', async () => {
      asMember(null);
      const err = await settle(runDeleteWork({ workId: W_SOLO, manuscriptId: MS_SOLO }, serverFetcher, refresh));
      expect(trace).toEqual(['rejected']);
      expect(err!.message).toContain('Sign in again');
      expect(await manuscriptExists(MS_SOLO)).toBe(true);
      expect(await workExists(W_SOLO)).toBe(true);
    });
  });

  describe('deterministic interleavings: a held lock, not a sleep', () => {
    it('DR-1 a Delete that arrives while the other Work\'s removal is in flight WAITS for it and then acts on what is true: it ends the writing and its only Work (never a stale refusal, never a 5xx)', async () => {
      const removal = await holder((c) => c.query('DELETE FROM living_works WHERE id = $1', [W_A]).then(() => undefined));
      try {
        const pending = serverFetcher(`/api/sovereign/manuscripts/${MS_SHARED}`, { method: 'DELETE' });
        await waitForLockWait('FOR UPDATE OF e, w');
        await removal.query('COMMIT');
        const res = await pending;
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ removed: true });
      } finally { await removal.end().catch(() => undefined); }
      expect(await manuscriptExists(MS_SHARED)).toBe(false);
      expect(await workExists(W_A)).toBe(false);
      expect(await workExists(W_B)).toBe(false);   // B held it alone once A was gone, so the writing and B end together
      expect(await dangling()).toBe(0);
    });

    it('DR-2 the same, with the removal rolled back instead: the Delete is refused as shared and NOTHING is destroyed', async () => {
      const removal = await holder((c) => c.query('DELETE FROM living_works WHERE id = $1', [W_A]).then(() => undefined));
      try {
        const pending = serverFetcher(`/api/sovereign/manuscripts/${MS_SHARED}`, { method: 'DELETE' });
        await waitForLockWait('FOR UPDATE OF e, w');
        await removal.query('ROLLBACK');
        const res = await pending;
        expect(res.status).toBe(409);
        expect(await res.json()).toEqual({ refusal: 'declared_in_other_works', works: 2 });
      } finally { await removal.end().catch(() => undefined); }
      expect(await manuscriptExists(MS_SHARED)).toBe(true);
      expect(await workExists(W_A)).toBe(true);
      expect(await workExists(W_B)).toBe(true);
    });

    it('DR-3 a STALE card whose Work is being removed at that moment: the guard is evaluated on what the removal committed, so the other Work\'s writing is NOT erased', async () => {
      const removal = await holder((c) => c.query('DELETE FROM living_works WHERE id = $1', [W_A]).then(() => undefined));
      try {
        const pending = serverFetcher(`/api/sovereign/manuscripts/${MS_SHARED}?workId=${W_A}`, { method: 'DELETE' });
        await waitForLockWait('FOR UPDATE OF e, w');
        await removal.query('COMMIT');
        const res = await pending;
        expect(res.status).toBe(409);
        expect(await res.json()).toEqual({ refusal: 'work_no_longer_holds_it' });
      } finally { await removal.end().catch(() => undefined); }
      expect(await manuscriptExists(MS_SHARED)).toBe(true);
      expect(await workExists(W_B)).toBe(true);
      expect(await count('deletion_manifests')).toBe(0);
    });

    it('DR-4 a Remove that arrives while a Delete holds the recovery-capture lock completes, and the Delete then acts on the committed truth', async () => {
      const capture = await holder((c) => c.query(`SELECT pg_advisory_xact_lock(hashtextextended('${ADVISORY_KEY}', 0))`).then(() => undefined));
      try {
        const deletion = serverFetcher(`/api/sovereign/manuscripts/${MS_SHARED}`, { method: 'DELETE' });
        await waitForLockWait('pg_advisory_xact_lock');
        const removed = await serverFetcher(`/api/sovereign/living-works/${W_A}`, { method: 'DELETE' });
        expect(removed.status).toBe(200);           // the Work route does not queue behind the recovery-capture lock
        await capture.query('COMMIT');
        const res = await deletion;
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ removed: true });
      } finally { await capture.end().catch(() => undefined); }
      expect(await manuscriptExists(MS_SHARED)).toBe(false);
      expect(await workExists(W_B)).toBe(false);
      expect(await dangling()).toBe(0);
    });

    it('DR-5 two Deletes of the same writing from its only Work, at the same moment: exactly one erases it, the other is told it is gone (404 is "done"), and nothing is left half-way', async () => {
      await runRemoveWork(W_A, serverFetcher, refresh);
      const capture = await holder((c) => c.query(`SELECT pg_advisory_xact_lock(hashtextextended('${ADVISORY_KEY}', 0))`).then(() => undefined));
      try {
        const one = serverFetcher(`/api/sovereign/manuscripts/${MS_SHARED}?workId=${W_B}`, { method: 'DELETE' });
        const two = serverFetcher(`/api/sovereign/manuscripts/${MS_SHARED}?workId=${W_B}`, { method: 'DELETE' });
        await waitForLockWait('pg_advisory_xact_lock');
        await capture.query('COMMIT');
        const [a, b] = await Promise.all([one, two]);
        expect([a.status, b.status].sort()).toEqual([200, 409]);   // the loser finds the Work no longer holds it
      } finally { await capture.end().catch(() => undefined); }
      expect(await manuscriptExists(MS_SHARED)).toBe(false);
      expect(await workExists(W_B)).toBe(false);
      expect(await count(`deletion_manifests WHERE reason_class = 'member_deletion'`)).toBe(1);
      expect(await dangling()).toBe(0);
    });
  });

  describe('another member', () => {
    it('CE-9 cannot reach this member\'s Work or writing through the client\'s functions: the server answers as it does for a stale card (no existence leak), the member is told nothing was deleted, and nothing changes', async () => {
      asMember(MEMBER_B);
      const err = await settle(runDeleteWork({ workId: W_SOLO, manuscriptId: MS_SOLO }, serverFetcher, refresh));
      expect(err!.message).toContain('Nothing was deleted');
      expect(await manuscriptExists(MS_SOLO)).toBe(true);
      expect(await workExists(W_SOLO)).toBe(true);
      expect(await count('deletion_manifests')).toBe(0);
    });
  });
});
