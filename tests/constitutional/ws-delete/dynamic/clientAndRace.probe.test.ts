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
import { existsSync, mkdtempSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

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
import { DELETE as deleteExpressionRoute } from '@/app/api/sovereign/living-works/[id]/expressions/route';
import { closePool, query } from '@/lib/db/postgres';
import { DeletionNotice, DeletionSharedMaterial, DeletionUnconfirmed, runDeleteWork, runRemoveWork } from '@/lib/writersStudio/deleteWork';

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
/** The comment at the head of the statement that takes the Work rows first (eraseManuscript.ts); a backend waiting in it is waiting on a Work row. */
const LOCK_WORKS_FIRST = 'ws-delete:lock-works-first';
const W_IMG = '99999999-0000-4000-8000-0000000000a1';
const W_STUCK = '99999999-0000-4000-8000-0000000000a2';
const W_STAY = '99999999-0000-4000-8000-0000000000a3';
const W_KEEP = '99999999-0000-4000-8000-0000000000a4';             // holds a LIVE writing and a second part
const MS_KEEP = 'cccccccc-cccc-4ccc-8ccc-cccccccccc03';
const MS_GHOST2 = 'dddddddd-dddd-4ddd-8ddd-ddddddddddd2';        // a second gone writing, declared by a Work that holds something else too

const asMember = (id: string | null) => { (globalThis as any).__probeMember = id; };
const sealMode = (mode: 'sealed' | 'throws') => { (globalThis as any).__sealMode = mode; };
const count = async (sql: string, params: unknown[] = []) => Number((await query<{ n: string }>(`SELECT count(*)::int AS n FROM ${sql}`, params as any[])).rows[0]!.n);
const manuscriptExists = (id: string) => count('member_manuscripts WHERE id = $1', [id]).then((n) => n === 1);
const workExists = (id: string) => count('living_works WHERE id = $1', [id]).then((n) => n === 1);
/** Declarations naming a writing that no longer exists, EXCLUDING the one Work this file seeds as already dangling (W_GHOST). */
const dangling = () => count(`living_work_expressions e WHERE e.expression_type = 'manuscript' AND e.expression_id NOT IN ($1, $2) AND NOT EXISTS (SELECT 1 FROM member_manuscripts m WHERE m.id = e.expression_id)`, [MS_GHOST, MS_GHOST2]);
const danglingGhost = () => count(`living_work_expressions e WHERE e.expression_type = 'manuscript' AND e.expression_id = $1 AND NOT EXISTS (SELECT 1 FROM member_manuscripts m WHERE m.id = e.expression_id)`, [MS_GHOST]);

/** The client's fetcher, pointed at the real route handlers. Every request it makes is recorded. */
const calls: string[] = [];
const serverFetcher = async (url: string, init: RequestInit): Promise<Response> => {
  calls.push(`${init.method} ${url}`);
  const manuscript = url.match(/^\/api\/sovereign\/manuscripts\/([^/?]+)/);
  if (manuscript) {
    return deleteManuscriptRoute(new NextRequest(`http://localhost${url}`, { method: init.method }), { params: Promise.resolve({ id: manuscript[1]! }) }) as Promise<Response>;
  }
  const expression = url.match(/^\/api\/sovereign\/living-works\/([^/?]+)\/expressions\?/);
  if (expression) {
    return deleteExpressionRoute(new NextRequest(`http://localhost${url}`, { method: init.method }), { params: Promise.resolve({ id: expression[1]! }) }) as Promise<Response>;
  }
  const work = url.match(/^\/api\/sovereign\/living-works\/([^/?]+)$/);
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
  for (const [id, title] of [[MS_SHARED, 'The Shared Fictional Writing'], [MS_SOLO, 'A Solo Fictional Writing'], [MS_M1, 'Many One'], [MS_M2, 'Many Two'], [MS_KEEP, 'A Fictional Writing In A Work That Stays']]) {
    await query('INSERT INTO member_manuscripts(id, member_id, title) VALUES ($1, $2, $3)', [id, MEMBER_A, title]);
  }
  for (const id of [W_A, W_B, W_SOLO, W_EMPTY, W_MANY, W_GHOST, W_IMG, W_STUCK, W_STAY, W_KEEP]) await query('INSERT INTO living_works(id, member_id) VALUES ($1, $2)', [id, MEMBER_A]);
  const declare = (w: string, m: string) => query(`INSERT INTO living_work_expressions(living_work_id, expression_type, expression_id) VALUES ($1, 'manuscript', $2)`, [w, m]);
  await declare(W_A, MS_SHARED); await declare(W_B, MS_SHARED);
  await declare(W_SOLO, MS_SOLO);
  await declare(W_MANY, MS_M1); await declare(W_MANY, MS_M2);
  await declare(W_GHOST, MS_GHOST);
  await declare(W_STAY, MS_GHOST2);
  await declare(W_KEEP, MS_KEEP);
  await query(`INSERT INTO living_work_expressions(living_work_id, expression_type, expression_id) VALUES ($1, 'material', $2)`, [W_KEEP, 'f0000000-0000-4000-8000-0000000000f3']);
  await query(`INSERT INTO living_work_expressions(living_work_id, expression_type, expression_id) VALUES ($1, 'material', $2)`, [W_STAY, 'f0000000-0000-4000-8000-0000000000f2']);
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


/** A vault-relative path the sweep can never destroy (a symlinked parent is refused), so its queue row stays owed. */
const stuckPath = (name: string) => {
  const root = process.env.FILE_STORAGE_PATH;
  if (!root) throw new Error('FILE_STORAGE_PATH must point at the disposable vault');
  const link = join(root, 'stuck-link');
  if (!existsSync(link)) symlinkSync(mkdtempSync(join(tmpdir(), 'ws-stuck-target-')), link);
  return `stuck-link/${name}`;
};
/** An artifact-backed source arrival for `manuscriptId` whose original file the sweep can never destroy: this deletion's OWN original stays owed. */
const addStuckOriginal = (manuscriptId: string, name: string) => query(
  `INSERT INTO manuscript_source_arrivals(member_id, manuscript_id, source_kind, artifact_ref, artifact_hash, artifact_size, original_filename, source_text, source_text_hash, extraction_method, extractor_version)
   VALUES ($1, $2, 'artifact_extraction', $3, 'fictional-hash', 10, 'fictional.docx', 'fictional source text', 'fictional-text-hash', 'fictional', '1')`,
  [MEMBER_A, manuscriptId, stuckPath(name)],
);
/** An artifact-backed arrival whose original the sweep CAN destroy (an absent path is destroyed idempotently). */
const addDestroyableOriginal = (manuscriptId: string, name: string) => query(
  `INSERT INTO manuscript_source_arrivals(member_id, manuscript_id, source_kind, artifact_ref, artifact_hash, artifact_size, original_filename, source_text, source_text_hash, extraction_method, extractor_version)
   VALUES ($1, $2, 'artifact_extraction', $3, 'fictional-hash', 10, 'fictional.docx', 'fictional source text', 'fictional-text-hash', 'fictional', '1')`,
  [MEMBER_A, manuscriptId, `manuscript-sources/${name}`],
);
const queueRow = (artifactRef: string) => query(`INSERT INTO vault_erasure_queue(artifact_ref) VALUES ($1)`, [artifactRef]);
const addVisual = (workId: string, storagePath: string) => query(
  `INSERT INTO living_work_visuals(living_work_id, member_id, kind, storage_path, mime_type, byte_size) VALUES ($1, $2, 'cover', $3, 'image/png', 10)`,
  [workId, MEMBER_A, storagePath],
);

let errSpy: jest.SpiedFunction<typeof console.error>;
let logSpy: jest.SpiedFunction<typeof console.log>;

suite('WS-DELETE-01 R-SHARED: the client\'s real functions against the real routes, and deterministic interleavings (PostgreSQL 16, fictional rows)', () => {
  beforeAll(async () => {
    const url = process.env.DATABASE_URL ?? '';
    if (!/@(127\.0\.0\.1|localhost)[:/]/.test(url)) throw new Error('refusing: the probe database must be loopback');
    // These probes TRUNCATE members CASCADE: only the throwaway database the runner creates may be touched.
    if (!/\/ws_delete_fictional(\?|$)/.test(url)) throw new Error('refusing: the probe database must be the disposable ws_delete_fictional database');
    // The witness stub schema gives living_work_expressions three columns; the real table also has `id` (and `declared_by`), which the
    // expression-level DELETE route returns. Add it to the DISPOSABLE stub so that route can run; nothing else here reads it.
    await query(`ALTER TABLE living_work_expressions ADD COLUMN IF NOT EXISTS id uuid NOT NULL DEFAULT gen_random_uuid()`);
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
      expect(trace).toEqual(['refresh', 'rejected']);           // the server knows an other Work this page may not: re-read, then ask
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
      expect(err).toBeInstanceOf(DeletionNotice);               // the page carries the message: the re-read may already have changed the card
      expect(err).not.toBeInstanceOf(DeletionSharedMaterial);
      expect(err).not.toBeInstanceOf(DeletionUnconfirmed);
      expect(err!.message).toContain('Nothing was deleted');
      expect(err!.message).toContain('Home now shows what is current');
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
      expect(err!.message).toContain('independent record of the deletion has been sealed');   // the one thing actually owed, and nothing else
      expect(err!.message).not.toContain('original file');
      expect(err!.message).not.toContain('image');
      expect(await manuscriptExists(MS_SOLO)).toBe(false);
      expect(await workExists(W_SOLO)).toBe(false);
    });

    it('CE-4 an exception inside the erase (500 with a bare body): the member is told we could not confirm, the page is re-read, and the re-read will show the Work still there because nothing was deleted', async () => {
      await query(`CREATE OR REPLACE FUNCTION r20_erase_writer_editorial_history(manifest_id uuid, member_id uuid, manuscript_id uuid) RETURNS void AS $$ BEGIN RAISE EXCEPTION 'fictional failure'; END; $$ LANGUAGE plpgsql`);
      try {
        const err = await settle(runDeleteWork({ workId: W_SOLO, manuscriptId: MS_SOLO }, serverFetcher, refresh));
        expect(trace).toEqual(['refresh', 'rejected']);
        expect(err).toBeInstanceOf(DeletionNotice);
        expect(err!.message).toContain('could not confirm');
        expect(err!.message).toContain('check it before you try again');
        expect(err!.message).not.toContain('Nothing was removed');
        expect(await manuscriptExists(MS_SOLO)).toBe(true);
        expect(await workExists(W_SOLO)).toBe(true);
      } finally {
        await query(`CREATE OR REPLACE FUNCTION r20_erase_writer_editorial_history(manifest_id uuid, member_id uuid, manuscript_id uuid) RETURNS void AS $$ BEGIN IF manifest_id IS NULL OR member_id IS NULL OR manuscript_id IS NULL THEN RAISE EXCEPTION 'fictional R20 editorial erasure requires exact authority'; END IF; END; $$ LANGUAGE plpgsql`);
      }
    });

    it('CE-5 a Work whose writing is already gone (declared, present in no table): ONE request, and the server finishes it in the same transaction, so no empty Work is left behind', async () => {
      expect(await danglingGhost()).toBe(1);
      const err = await settle(runDeleteWork({ workId: W_GHOST, manuscriptId: MS_GHOST }, serverFetcher, refresh));
      expect(err).toBeNull();
      expect(calls).toEqual([`DELETE /api/sovereign/manuscripts/${MS_GHOST}?workId=${W_GHOST}`]);   // the client never sends a second request
      expect(await workExists(W_GHOST)).toBe(false);
      expect(await danglingGhost()).toBe(0);
      expect(await count('deletion_manifests')).toBe(0);          // nothing was erased: no manifest, no tombstone
      expect(await count('provenance_tombstones')).toBe(0);
    });

    it('CE-5b a Work that was to STAY (it holds something else too) and whose writing is already gone: ONE request; only the dangling declaration is withdrawn, the Work and its other part survive', async () => {
      const err = await settle(runDeleteWork({ workId: W_STAY, manuscriptId: MS_GHOST2 }, serverFetcher, refresh));
      expect(err).toBeNull();
      expect(calls).toEqual([`DELETE /api/sovereign/manuscripts/${MS_GHOST2}?workId=${W_STAY}`]);
      expect(await workExists(W_STAY)).toBe(true);
      expect(await count(`living_work_expressions WHERE living_work_id = $1 AND expression_type = 'manuscript'`, [W_STAY])).toBe(0);
      expect(await count(`living_work_expressions WHERE living_work_id = $1 AND expression_type = 'material'`, [W_STAY])).toBe(1);
    });

    it('CE-5c the cleanup is the SERVER\'s answer, not a guess: the route says removed:true for a gone writing only when its declaration existed; a repeat of the same Delete is a plain 404 (done)', async () => {
      const first = await serverFetcher(`/api/sovereign/manuscripts/${MS_GHOST}?workId=${W_GHOST}`, { method: 'DELETE' });
      expect(first.status).toBe(200);
      expect(await first.json()).toEqual({ removed: true, workRemoved: true });
      const again = await serverFetcher(`/api/sovereign/manuscripts/${MS_GHOST}?workId=${W_GHOST}`, { method: 'DELETE' });
      expect(again.status).toBe(404);
    });

    it('CE-5d another member cannot use a gone-writing request to remove this member\'s Work: 404, and the Work survives', async () => {
      asMember(MEMBER_B);
      const res = await serverFetcher(`/api/sovereign/manuscripts/${MS_GHOST}?workId=${W_GHOST}`, { method: 'DELETE' });
      expect(res.status).toBe(404);
      expect(await workExists(W_GHOST)).toBe(true);
      expect(await danglingGhost()).toBe(1);
    });

    it('CE-5e a gone writing named through a Work that does not declare it is a plain 404: the declaration of a DIFFERENT Work is never touched', async () => {
      const res = await serverFetcher(`/api/sovereign/manuscripts/${MS_GHOST}?workId=${W_SOLO}`, { method: 'DELETE' });
      expect(res.status).toBe(404);
      expect(await workExists(W_GHOST)).toBe(true);
      expect(await danglingGhost()).toBe(1);
      expect(await workExists(W_SOLO)).toBe(true);
    });

    it('KEEP-1 a LIVE writing in a Work that holds a second part: the writing goes, the Work STAYS with its other part, and the server says so (workRemoved:false)', async () => {
      const res = await serverFetcher(`/api/sovereign/manuscripts/${MS_KEEP}?workId=${W_KEEP}`, { method: 'DELETE' });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ removed: true, workRemoved: false });
      expect(await manuscriptExists(MS_KEEP)).toBe(false);
      expect(await workExists(W_KEEP)).toBe(true);
      expect(await count(`living_work_expressions WHERE living_work_id = $1 AND expression_type = 'manuscript'`, [W_KEEP])).toBe(0);
      expect(await count(`living_work_expressions WHERE living_work_id = $1 AND expression_type = 'material'`, [W_KEEP])).toBe(1);
      expect(await count(`provenance_tombstones WHERE object_kind = 'living_works' AND object_id = $1`, [W_KEEP])).toBe(0);   // the Work did not go: no tombstone for it
    });

    it('KEEP-2 the same, with custody NOT confirmed (the seal throws): 500 says the Work STAYS, and through the client that is DeletionUnconfirmed with workRemoved:false', async () => {
      sealMode('throws');
      const err = await settle(runDeleteWork({ workId: W_KEEP, manuscriptId: MS_KEEP }, serverFetcher, refresh));
      expect(err).toBeInstanceOf(DeletionUnconfirmed);
      expect((err as DeletionUnconfirmed).workRemoved).toBe(false);
      expect(err!.message).toMatch(/^This writing was deleted from your studio, but/);         // the Work was NOT removed: the sentence must not say so
      expect(await workExists(W_KEEP)).toBe(true);
      expect(await manuscriptExists(MS_KEEP)).toBe(false);
    });

    it('KEEP-3 through the client, a Work that stays reports workRemoved:false, and one that goes reports true', async () => {
      const stays = await runDeleteWork({ workId: W_KEEP, manuscriptId: MS_KEEP }, serverFetcher, refresh);
      expect(stays).toEqual({ refreshed: true, workRemoved: false });
      const goes = await runDeleteWork({ workId: W_SOLO, manuscriptId: MS_SOLO }, serverFetcher, refresh);
      expect(goes).toEqual({ refreshed: true, workRemoved: true });
      const gone = await runDeleteWork({ workId: W_SOLO, manuscriptId: MS_SOLO }, serverFetcher, refresh);      // again: the writing is gone, nothing is said about the Work
      expect(gone).toEqual({ refreshed: true });
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
        await waitForLockWait(LOCK_WORKS_FIRST);
        await removal.query('COMMIT');
        const res = await pending;
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ removed: true, workRemoved: true });
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
        await waitForLockWait(LOCK_WORKS_FIRST);
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
        await waitForLockWait(LOCK_WORKS_FIRST);
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
        expect(await res.json()).toEqual({ removed: true, workRemoved: true });
      } finally { await capture.end().catch(() => undefined); }
      expect(await manuscriptExists(MS_SHARED)).toBe(false);
      expect(await workExists(W_B)).toBe(false);
      expect(await dangling()).toBe(0);
    });

    it('DR-5 two Deletes of the same writing from its only Work, at the same moment: exactly one erases it and the other is told it is already gone (404, which the client reads as done), and nothing is left half-way', async () => {
      await runRemoveWork(W_A, serverFetcher, refresh);
      const capture = await holder((c) => c.query(`SELECT pg_advisory_xact_lock(hashtextextended('${ADVISORY_KEY}', 0))`).then(() => undefined));
      try {
        const one = serverFetcher(`/api/sovereign/manuscripts/${MS_SHARED}?workId=${W_B}`, { method: 'DELETE' });
        const two = serverFetcher(`/api/sovereign/manuscripts/${MS_SHARED}?workId=${W_B}`, { method: 'DELETE' });
        await waitForLockWait('pg_advisory_xact_lock');
        await capture.query('COMMIT');
        const [a, b] = await Promise.all([one, two]);
        expect([a.status, b.status].sort()).toEqual([200, 404]);   // the loser finds the writing already gone
      } finally { await capture.end().catch(() => undefined); }
      expect(await manuscriptExists(MS_SHARED)).toBe(false);
      expect(await workExists(W_B)).toBe(false);
      expect(await count(`deletion_manifests WHERE reason_class = 'member_deletion'`)).toBe(1);
      expect(await dangling()).toBe(0);
    });
  });

  describe('the same Work and writing, two requests at once: no deadlock, whichever order', () => {
    it('DL-1 a Delete queued behind a removal that holds the Work row takes the Work row BEFORE any expression row, so the removal can finish its own cascade (no 40P01, no 500)', async () => {
      // The holder plays a Remove in flight, in the order the route takes: the Work row, then the Work\'s image row, and it has not yet
      // reached that Work\'s expression rows. The Work HAS an image: the order of those two locks is the whole point.
      await addVisual(W_A, 'work-visuals/dl1-image.png');
      const removal = await holder(async (c) => {
        await c.query('SELECT id FROM living_works WHERE id = $1 FOR UPDATE', [W_A]);
        await c.query('SELECT storage_path FROM living_work_visuals WHERE living_work_id = $1 FOR UPDATE', [W_A]);
      });
      let removalError: unknown = null;
      try {
        const pending = serverFetcher(`/api/sovereign/manuscripts/${MS_SHARED}`, { method: 'DELETE' });
        await waitForLockWait(LOCK_WORKS_FIRST);
        try {
          await removal.query('DELETE FROM living_work_expressions WHERE living_work_id = $1', [W_A]);
          await removal.query('DELETE FROM living_works WHERE id = $1', [W_A]);
          await removal.query('COMMIT');
        } catch (e) { removalError = e; }
        const res = await pending;
        expect(removalError).toBeNull();
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ removed: true, workRemoved: true });
      } finally { await removal.end().catch(() => undefined); }
      expect(await manuscriptExists(MS_SHARED)).toBe(false);
      expect(await dangling()).toBe(0);
    });

    it('DL-3 a Delete that holds the Work row while a Remove of the same Work arrives: the Remove waits for the WORK row (not the image row), so the pair cannot deadlock; the Delete finishes and the Remove finds the Work gone', async () => {
      await addVisual(W_SOLO, 'work-visuals/dl3-image.png');
      await addDestroyableOriginal(MS_SOLO, 'dl3-original.bin');
      // Hold the Delete part-way: it will have taken the Work row, and wait at the writing\'s source arrival.
      const gate = await holder((c) => c.query('SELECT id FROM manuscript_source_arrivals WHERE manuscript_id = $1 FOR UPDATE', [MS_SOLO]).then(() => undefined));
      try {
        const deletion = serverFetcher(`/api/sovereign/manuscripts/${MS_SOLO}?workId=${W_SOLO}`, { method: 'DELETE' });
        await waitForLockWait('manuscript_source_arrivals');
        // The Remove arrives now. In the old order it read (and locked) the image row first and then waited for the Work row, which the
        // Delete holds while it needs that image row: a cycle PostgreSQL broke with a 500.
        const removal = serverFetcher(`/api/sovereign/living-works/${W_SOLO}`, { method: 'DELETE' });
        await waitForLockWait('FROM living_works');
        await gate.query('COMMIT');
        const [d, r] = await Promise.all([deletion, removal]);
        expect(d.status).toBe(200);
        expect(await d.json()).toEqual({ removed: true, workRemoved: true });
        expect(r.status).toBe(404);                                   // the Work was already gone when its lock was granted
      } finally { await gate.end().catch(() => undefined); }
      expect(await manuscriptExists(MS_SOLO)).toBe(false);
      expect(await workExists(W_SOLO)).toBe(false);
    });

    it('DL-2 400 simultaneous Delete/Remove pairs: no request ever answers 5xx (the pairs that used to deadlock about 1 in 80)', async () => {
      let fiveHundreds = 0;
      let pairs = 0;
      let withImage = 0;
      // Bounded: the first 5xx is the answer (no need to keep going), and a run that cannot finish 400 pairs inside the deadline FAILS
      // (it never passes on fewer pairs than it says).
      const deadline = Date.now() + 100_000;
      for (; pairs < 400 && fiveHundreds === 0; pairs += 1) {
        if (Date.now() > deadline) throw new Error(`DL-2 deadline exceeded after ${pairs} of 400 pairs`);
        await reset();
        // Half of the pairs carry an image on the Work: the image row is a lock of its own, and the pairs that used to deadlock on it
        // (a Remove taking the image row before the Work row) only exist for a Work that has one.
        if (pairs % 2 === 0) { await addVisual(W_A, 'work-visuals/dl2-image.png'); withImage += 1; }
        const [d, r] = await Promise.all([
          serverFetcher(`/api/sovereign/manuscripts/${MS_SHARED}`, { method: 'DELETE' }),
          serverFetcher(`/api/sovereign/living-works/${W_A}`, { method: 'DELETE' }),
        ]);
        if (d.status >= 500 || r.status >= 500) fiveHundreds += 1;
      }
      expect(fiveHundreds).toBe(0);
      expect(pairs).toBe(400);
      expect(withImage).toBe(200);
    });
  });

  describe('custody is about THIS deletion\'s own obligations', () => {
    it('FQ-1 another member\'s stuck queue row does not make this Delete read as unconfirmed', async () => {
      await queueRow(stuckPath('someone-elses-original.bin'));
      const res = await serverFetcher(`/api/sovereign/manuscripts/${MS_SOLO}?workId=${W_SOLO}`, { method: 'DELETE' });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ removed: true, workRemoved: true });
      expect(await count('vault_erasure_queue')).toBe(1);           // the foreign row is still owed, and still not this member\'s concern
      expect(await manuscriptExists(MS_SOLO)).toBe(false);
    });

    it('FQ-2 a backlog of 120 stuck rows ahead of it does not starve this Work\'s image or turn its removal into an alarm', async () => {
      for (let i = 0; i < 120; i += 1) await queueRow(stuckPath(`backlog-${i}.bin`));
      await addVisual(W_IMG, 'work-visuals/own-image-absent.png');       // an absent path is destroyed by the sweep (idempotent)
      const res = await serverFetcher(`/api/sovereign/living-works/${W_IMG}`, { method: 'DELETE' });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ withdrawn: W_IMG });
      expect(await count('vault_erasure_queue')).toBe(120);               // only the foreign rows remain
    });

    it('WI-1 a removed Work whose OWN image cannot be destroyed is not reported as plain success: 500, removed:true, image_bytes_owed; the row is gone and the bytes stay queued', async () => {
      await addVisual(W_STUCK, stuckPath('own-image.png'));
      const res = await serverFetcher(`/api/sovereign/living-works/${W_STUCK}`, { method: 'DELETE' });
      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ removed: true, refusal: 'image_bytes_owed', unconfirmed: { image: true } });
      expect(await workExists(W_STUCK)).toBe(false);
      expect(await count('vault_erasure_queue')).toBe(1);
    });

    it('WI-2 the client turns that into the unconfirmed notice, re-reads the page first, and the Work is gone', async () => {
      await addVisual(W_STUCK, stuckPath('own-image.png'));
      const err = await settle(runRemoveWork(W_STUCK, serverFetcher, refresh));
      expect(err).toBeInstanceOf(DeletionUnconfirmed);
      expect(trace).toEqual(['refresh', 'rejected']);
      expect(err!.message).toContain('image');
      expect(err!.message).toContain('we are not going to tell you it is gone');
      expect(await workExists(W_STUCK)).toBe(false);
    });

    it('SB-1 a deletion whose OWN original file cannot be destroyed is not reported as plain success: 500, removed:true, unconfirmed.originalFile only (the record IS sealed, there is no image)', async () => {
      await addStuckOriginal(MS_SOLO, 'own-original.bin');
      const res = await serverFetcher(`/api/sovereign/manuscripts/${MS_SOLO}?workId=${W_SOLO}`, { method: 'DELETE' });
      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ removed: true, refusal: 'custody_incomplete', unconfirmed: { originalFile: true, image: false, deletionRecord: false }, workRemoved: true });
      expect(await manuscriptExists(MS_SOLO)).toBe(false);
      expect(await workExists(W_SOLO)).toBe(false);
      expect(await count('vault_erasure_queue')).toBe(1);          // the bytes stay queued: owed, not forgotten
    });

    it('SB-2 through the client that is DeletionUnconfirmed naming the original file, after the re-read, and only the original file', async () => {
      await addStuckOriginal(MS_SOLO, 'own-original-2.bin');
      const err = await settle(runDeleteWork({ workId: W_SOLO, manuscriptId: MS_SOLO }, serverFetcher, refresh));
      expect(err).toBeInstanceOf(DeletionUnconfirmed);
      expect(trace).toEqual(['refresh', 'rejected']);
      expect(err!.message).toContain('its original file has been destroyed');
      expect(err!.message).not.toContain('independent record');
      expect(err!.message).not.toContain('image');
    });

    it('SB-3 both owed at once (stuck original AND an unsealed record) are both named', async () => {
      sealMode('throws');
      await addStuckOriginal(MS_SOLO, 'own-original-3.bin');
      const res = await serverFetcher(`/api/sovereign/manuscripts/${MS_SOLO}?workId=${W_SOLO}`, { method: 'DELETE' });
      expect(res.status).toBe(500);
      expect((await res.json()).unconfirmed).toEqual({ originalFile: true, image: false, deletionRecord: true });
    });

    it('SB-4 a foreign stuck row in the queue does not change what THIS deletion owes, even when this deletion also has a stuck original of its own', async () => {
      await queueRow(stuckPath('someone-elses.bin'));
      await addStuckOriginal(MS_SOLO, 'own-original-4.bin');
      const res = await serverFetcher(`/api/sovereign/manuscripts/${MS_SOLO}?workId=${W_SOLO}`, { method: 'DELETE' });
      expect(res.status).toBe(500);
      expect((await res.json()).unconfirmed).toEqual({ originalFile: true, image: false, deletionRecord: false });
      expect(await count('vault_erasure_queue')).toBe(2);
    });

    it('SB-5 the gone-writing cleanup owes nothing of its own: a stuck FOREIGN row does not turn it into an alarm', async () => {
      await queueRow(stuckPath('someone-elses-2.bin'));
      const res = await serverFetcher(`/api/sovereign/manuscripts/${MS_GHOST}?workId=${W_GHOST}`, { method: 'DELETE' });
      expect(res.status).toBe(200);
      expect(await workExists(W_GHOST)).toBe(false);
    });
  });

  describe('a repeat Delete, and the order of the two refusals', () => {
    it('GONE-1 Delete again from the same Work card after the writing has gone: 404 (done), not a stale-card refusal', async () => {
      expect((await serverFetcher(`/api/sovereign/manuscripts/${MS_SOLO}?workId=${W_SOLO}`, { method: 'DELETE' })).status).toBe(200);
      const again = await serverFetcher(`/api/sovereign/manuscripts/${MS_SOLO}?workId=${W_SOLO}`, { method: 'DELETE' });
      expect(again.status).toBe(404);
    });

    it('GONE-2 through the client a repeat Delete is simply done, with no scary message', async () => {
      await runDeleteWork({ workId: W_SOLO, manuscriptId: MS_SOLO }, serverFetcher, refresh);
      trace.length = 0;
      expect(await settle(runDeleteWork({ workId: W_SOLO, manuscriptId: MS_SOLO }, serverFetcher, refresh))).toBeNull();
    });
  });

  describe('another member', () => {
    it('CE-9 cannot reach this member\'s Work or writing through the client\'s functions: both routes answer 404 (no existence leak), which the client reads as "already gone", and nothing changes', async () => {
      asMember(MEMBER_B);
      expect(await settle(runDeleteWork({ workId: W_SOLO, manuscriptId: MS_SOLO }, serverFetcher, refresh))).toBeNull();
      expect(await manuscriptExists(MS_SOLO)).toBe(true);
      expect(await workExists(W_SOLO)).toBe(true);
      expect(await count('deletion_manifests')).toBe(0);
    });
  });
});
