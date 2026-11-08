/**
 * eraseManuscript — its refusals, its locks, its cleanup of a dangling declaration, and its custody arithmetic, over a scripted
 * transaction and an in-memory erasure queue (hermetic: no database).
 *
 * The PostgreSQL probes prove what the database does with these statements. This file pins the DECISIONS in the ordinary jest run:
 * which statement comes first, what each refusal answers, that nothing is deleted before a refusal, which queue rows count as THIS
 * deletion's, and when a deletion may read as fully confirmed. The fake transaction throws on any statement it was not told about.
 */
jest.mock('@/lib/db/postgres', () => ({ transaction: jest.fn(), query: jest.fn() }));
jest.mock('@/lib/storage/fileVault', () => ({ destroyVaultBytes: jest.fn() }));
jest.mock('@/lib/recovery/r20DeletionLedger', () => ({ sealR20DeletionLedger: jest.fn(), r20LedgerErrorCode: jest.fn(() => 'R20_X') }));

import { query, transaction } from '@/lib/db/postgres';
import { destroyVaultBytes } from '@/lib/storage/fileVault';
import { sealR20DeletionLedger } from '@/lib/recovery/r20DeletionLedger';
import { eraseManuscript } from '../eraseManuscript';

const MS = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const MEMBER = '11111111-1111-4111-8111-111111111111';
const W_A = 'a0000000-0000-4000-8000-00000000000a';
const W_B = 'b0000000-0000-4000-8000-00000000000b';
const W_C = 'c0000000-0000-4000-8000-00000000000c';
const OWN_FILE = 'manuscript-sources/own-original.docx';
const OWN_IMAGE = 'work-visuals/own-image.png';

/** The erasure queue the tail talks to (through the mocked `query`), shared with the scripted transaction's inserts. */
type QueueRow = { id: string; artifact_ref: string };
let queue: QueueRow[] = [];
let nextQueueId = 0;
const stuck = new Set<string>();
const destroyed: string[] = [];

interface World {
  claims: string[];
  writingHeld: boolean;
  arrivalRef?: string | null;
  visualPath?: string | null;
  /** After removing the named expression, does the Work still declare something else? */
  workHoldsMore?: boolean;
  /** The id the Work DELETE ... RETURNING hands back (default: the id it was asked to delete). */
  returnedWorkId?: string;
  /** The deletion manifest cannot be written. */
  failManifest?: boolean;
  /** The tombstone cannot be written. */
  failTombstone?: boolean;
}
const seen: Array<{ sql: string; params: unknown[] }> = [];

function install(world: World) {
  seen.length = 0;
  const tx = {
    query: jest.fn(async (sql: string, params: unknown[] = []) => {
      seen.push({ sql, params });
      if (sql.includes('pg_advisory_xact_lock')) return { rows: [] };
      if (sql.includes('ws-delete:lock-works-first')) return { rows: world.claims.map((id) => ({ id })) };
      if (sql.includes('FROM living_work_expressions e') && sql.includes('JOIN living_works')) return { rows: world.claims.map((id) => ({ living_work_id: id })) };
      if (sql.includes('SELECT id FROM member_manuscripts')) return { rows: world.writingHeld ? [{ id: MS }] : [] };
      if (sql.includes('FROM manuscript_source_arrivals')) return { rows: world.arrivalRef ? [{ id: 'arr-1', artifact_ref: world.arrivalRef }] : [] };
      if (sql.includes('FROM writer_source_landing_intents')) return { rows: [] };
      if (sql.includes('DELETE FROM member_manuscripts')) return { rows: [{ id: MS }] };
      if (sql.includes('DELETE FROM living_work_expressions')) return { rows: [] };
      if (sql.includes('SELECT storage_path FROM living_work_visuals')) return { rows: world.visualPath ? [{ storage_path: world.visualPath }] : [] };
      if (sql.includes('DELETE FROM living_works')) return { rows: world.workHoldsMore ? [] : [{ id: world.returnedWorkId ?? params[0] }] };
      if (sql.includes('INSERT INTO deletion_manifests')) {
        if (world.failManifest) throw new Error('fictional manifest failure');
        return { rows: [{ id: 'manifest-1' }] };
      }
      if (sql.includes('INSERT INTO provenance_tombstones')) {
        if (world.failTombstone) throw new Error('fictional tombstone failure');
        return { rows: [] };
      }
      if (sql.includes('r20_erase_writer_editorial_history')) return { rows: [] };
      if (sql.includes('INSERT INTO vault_erasure_queue')) {
        const refs = sql.includes('unnest') ? (params[0] as string[]) : [params[0] as string];
        return { rows: refs.map((artifact_ref) => { const id = `q${++nextQueueId}`; queue.push({ id, artifact_ref }); return { id }; }) };
      }
      throw new Error(`unexpected statement: ${sql.slice(0, 70)}`);
    }),
  };
  (transaction as jest.Mock).mockImplementation(async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx));
  return tx;
}

beforeEach(() => {
  jest.clearAllMocks();
  queue = []; nextQueueId = 0; stuck.clear(); destroyed.length = 0;
  (sealR20DeletionLedger as jest.Mock).mockResolvedValue({ sealed: true });
  (destroyVaultBytes as jest.Mock).mockImplementation(async (ref: string) => {
    if (stuck.has(ref)) throw Object.assign(new Error('EACCES'), { code: 'EACCES' });
    destroyed.push(ref);
  });
  // The tail's own statements (the sweep and the count of this deletion's rows), against the in-memory queue.
  (query as jest.Mock).mockImplementation(async (sql: string, params: unknown[] = []) => {
    if (sql.includes('SELECT id, artifact_ref FROM vault_erasure_queue')) {
      const [limit, first] = params as [number, string[]];
      const ordered = [...queue].sort((a, b) => Number(first.includes(b.id)) - Number(first.includes(a.id)));   // this deletion's rows first, otherwise oldest first
      return { rows: ordered.slice(0, limit) };
    }
    if (sql.includes('DELETE FROM vault_erasure_queue WHERE id')) { queue = queue.filter((row) => row.id !== params[0]); return { rows: [] }; }
    if (sql.includes('UPDATE vault_erasure_queue')) return { rows: [] };
    if (sql.includes('SELECT count(*)')) return { rows: [{ n: String(queue.length) }] };
    if (sql.includes('SELECT id FROM vault_erasure_queue WHERE id = ANY')) return { rows: queue.filter((row) => (params[0] as string[]).includes(row.id)).map((row) => ({ id: row.id })) };
    throw new Error(`unexpected tail statement: ${sql.slice(0, 70)}`);
  });
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => jest.restoreAllMocks());

describe('the Work rows are locked before the expression rows (the order a Work\'s removal takes them)', () => {
  it('the advisory lock, then the Work rows FOR UPDATE, then the expression rows FOR UPDATE OF e only', async () => {
    install({ claims: [W_A, W_B], writingHeld: true });
    await eraseManuscript(MS, MEMBER);
    // Statements are found by CONTENT, not by position, so the law is "Work rows before expression rows" and not "exactly
    // two statements precede the Work rows". The erase takes two advisory locks (the R20 recovery key, then the per-writing
    // declaration key that serialises it against POST …/expressions); what must hold is that EVERY advisory lock comes
    // before ANY row lock, so an advisory wait can never be held while a row is.
    const advisory = seen.map((q, i) => (q.sql.includes('pg_advisory_xact_lock') ? i : -1)).filter((i) => i >= 0);
    const worksFirst = seen.findIndex((q) => q.sql.includes('ws-delete:lock-works-first'));
    const expressionRows = seen.findIndex((q) => /FOR UPDATE OF e\b/.test(q.sql));
    expect(advisory.length).toBeGreaterThanOrEqual(1);
    expect(advisory[0]).toBe(0);
    expect(worksFirst).toBeGreaterThan(-1);
    expect(Math.max(...advisory)).toBeLessThan(worksFirst);
    expect(worksFirst).toBeLessThan(expressionRows);
    expect(seen[worksFirst]!.sql).toMatch(/FROM living_works w[\s\S]*ORDER BY w\.id[\s\S]*FOR UPDATE\s*$/);
    expect(seen[expressionRows]!.sql).toContain('FOR UPDATE OF e');
    expect(seen[expressionRows]!.sql).not.toMatch(/FOR UPDATE OF e, w/);
  });
  it('the writing\'s own visual row is locked when its path is read, so a replacement cannot slip between the read and the delete', async () => {
    install({ claims: [W_A], writingHeld: true, visualPath: OWN_IMAGE });
    await eraseManuscript(MS, MEMBER, { viaWorkId: W_A });
    const read = seen.find((q) => q.sql.includes('SELECT storage_path FROM living_work_visuals'))!;
    expect(read.sql).toMatch(/FOR UPDATE\s*$/);
  });
});

describe('the refusals, and that nothing is deleted before them', () => {
  it('no Work named, two holders: shared-writing refusal with the count', async () => {
    install({ claims: [W_A, W_B], writingHeld: true });
    expect(await eraseManuscript(MS, MEMBER)).toEqual({ ok: false, refusal: 'declared_in_other_works', works: 2 });
    expect(seen.some((q) => /DELETE/.test(q.sql))).toBe(false);
  });
  it('the named Work is a holder but not the only one: still the shared-writing refusal', async () => {
    install({ claims: [W_A, W_B], writingHeld: true });
    expect(await eraseManuscript(MS, MEMBER, { viaWorkId: W_A })).toEqual({ ok: false, refusal: 'declared_in_other_works', works: 2 });
  });
  it('a stale card whose writing still exists: refused as stale, and no statement after the check runs', async () => {
    install({ claims: [W_B], writingHeld: true });
    expect(await eraseManuscript(MS, MEMBER, { viaWorkId: W_A })).toEqual({ ok: false, refusal: 'work_no_longer_holds_it' });
    expect(seen.every((q) => !/DELETE|manuscript_source_arrivals/.test(q.sql))).toBe(true);
  });
  it('ORDER: with three holders and a named Work that is not one of them, the stale-card refusal wins over the shared refusal', async () => {
    install({ claims: [W_B, W_C], writingHeld: true });
    expect(await eraseManuscript(MS, MEMBER, { viaWorkId: W_A })).toEqual({ ok: false, refusal: 'work_no_longer_holds_it' });
  });
});

describe('the writing is ALREADY GONE: the retry "finds it gone and continues", inside the transaction', () => {
  it('no Work named: not found (done), nothing deleted', async () => {
    install({ claims: [], writingHeld: false });
    expect(await eraseManuscript(MS, MEMBER)).toEqual({ ok: false, refusal: 'not_found' });
    expect(seen.some((q) => /DELETE/.test(q.sql))).toBe(false);
  });
  it('the named Work no longer declares it: not found, and that Work is NOT touched', async () => {
    install({ claims: [], writingHeld: false });
    expect(await eraseManuscript(MS, MEMBER, { viaWorkId: W_A })).toEqual({ ok: false, refusal: 'not_found' });
    expect(seen.some((q) => /DELETE/.test(q.sql))).toBe(false);
  });
  it('the shared refusal is NOT given about a writing that does not exist (two Works hold dangling declarations)', async () => {
    install({ claims: [W_A, W_B], writingHeld: false });
    const out = await eraseManuscript(MS, MEMBER);
    expect(out).toEqual({ ok: false, refusal: 'not_found' });
  });
  it('the named Work still declares the gone writing and declares nothing else: the declaration AND the Work go, and the Work\'s removal is RECORDED (one manifest, one living_works tombstone, on the transaction client); no writing is deleted and no ledger is sealed', async () => {
    install({ claims: [W_A], writingHeld: false });
    const out = await eraseManuscript(MS, MEMBER, { viaWorkId: W_A });
    expect(out).toMatchObject({ ok: true, artifactsQueued: 0, sweptAll: true, recoverySealed: true, workRemoved: true, owed: { originalFile: false, image: false } });
    expect(seen.some((q) => q.sql.includes('DELETE FROM living_work_expressions') && q.params.includes(W_A))).toBe(true);
    expect(seen.some((q) => q.sql.includes('DELETE FROM living_works'))).toBe(true);
    expect(seen.some((q) => q.sql.includes('DELETE FROM member_manuscripts'))).toBe(false);
    // The record: exactly one manifest and exactly one tombstone, for the Work and only the Work.
    const manifests = seen.filter((q) => q.sql.includes('INSERT INTO deletion_manifests'));
    const tombstones = seen.filter((q) => q.sql.includes('INSERT INTO provenance_tombstones'));
    expect(manifests).toHaveLength(1);
    expect(tombstones).toHaveLength(1);
    expect(manifests[0]!.sql).toContain(`'member_deletion'`);
    expect(manifests[0]!.sql).toContain(`'verified-member-self-service'`);
    expect(manifests[0]!.params).toEqual(['Writer Work ended after its writing was already gone, by verified member request']);
    expect(tombstones[0]!.sql).toContain(`'living_works'`);
    expect(tombstones[0]!.params).toEqual(['manifest-1', W_A]);
    // Nothing about the WRITING is recorded or erased: no writing was erased here.
    expect(seen.some((q) => q.sql.includes('member_manuscripts') && q.sql.includes('INSERT'))).toBe(false);
    expect(seen.some((q) => q.sql.includes('r20_erase_writer_editorial_history'))).toBe(false);
    // On the TRANSACTION client, never on the module-level query (which would commit outside the transaction).
    expect((query as jest.Mock).mock.calls.some(([sql]) => /deletion_manifests|provenance_tombstones/.test(String(sql)))).toBe(false);
    // The independent ledger is not sealed on this path (declared state; see workDeletionRecord.ts), and the outcome still reads sealed.
    expect(sealR20DeletionLedger).not.toHaveBeenCalled();
  });
  it('the record is written AFTER the Work\'s own delete (only once the row is really gone), manifest before tombstone, inside the one transaction', async () => {
    install({ claims: [W_A], writingHeld: false, visualPath: OWN_IMAGE });
    await eraseManuscript(MS, MEMBER, { viaWorkId: W_A });
    const at = (needle: string) => seen.findIndex((q) => q.sql.includes(needle));
    expect(at('DELETE FROM living_works')).toBeGreaterThan(-1);
    expect(at('INSERT INTO deletion_manifests')).toBeGreaterThan(at('DELETE FROM living_works'));
    expect(at('INSERT INTO provenance_tombstones')).toBeGreaterThan(at('INSERT INTO deletion_manifests'));
    expect(transaction).toHaveBeenCalledTimes(1);
  });
  it('the tombstone names the id the Work DELETE RETURNED, not the id the caller passed in', async () => {
    const RETURNED = 'd0000000-0000-4000-8000-00000000000d';
    install({ claims: [W_A], writingHeld: false, returnedWorkId: RETURNED });
    await eraseManuscript(MS, MEMBER, { viaWorkId: W_A });
    const tomb = seen.find((q) => q.sql.includes('INSERT INTO provenance_tombstones'))!;
    expect(tomb.params).toEqual(['manifest-1', RETURNED]);
    expect(tomb.params).not.toContain(W_A);
  });
  it('a manifest that cannot be written makes the whole call fail (the transaction callback throws, so the Work\'s delete and its queue row roll back with it): nothing is swept, nothing is sealed, nothing is destroyed', async () => {
    // The scripted transaction cannot roll back, so this proves the failure PROPAGATES out of the transaction and that nothing after
    // the transaction runs; that the database undoes the delete is the transaction\'s own contract (and probe CE-5b territory).
    install({ claims: [W_A], writingHeld: false, visualPath: OWN_IMAGE, failManifest: true });
    await expect(eraseManuscript(MS, MEMBER, { viaWorkId: W_A })).rejects.toThrow('fictional manifest failure');
    expect(seen.some((q) => q.sql.includes('INSERT INTO provenance_tombstones'))).toBe(false);
    expect(query as jest.Mock).not.toHaveBeenCalled();
    expect(sealR20DeletionLedger).not.toHaveBeenCalled();
    expect(destroyed).toEqual([]);
  });
  it('a tombstone that cannot be written makes the whole call fail the same way: no sweep, no seal, nothing destroyed', async () => {
    install({ claims: [W_A], writingHeld: false, visualPath: OWN_IMAGE, failTombstone: true });
    await expect(eraseManuscript(MS, MEMBER, { viaWorkId: W_A })).rejects.toThrow('fictional tombstone failure');
    expect(query as jest.Mock).not.toHaveBeenCalled();
    expect(sealR20DeletionLedger).not.toHaveBeenCalled();
    expect(destroyed).toEqual([]);
  });
  it('the named Work declares something else too: only the dangling declaration goes, the Work STAYS, and NO manifest, tombstone or seal is written (no Work was deleted)', async () => {
    install({ claims: [W_A], writingHeld: false, workHoldsMore: true });
    const out = await eraseManuscript(MS, MEMBER, { viaWorkId: W_A });
    expect(out).toMatchObject({ ok: true, workRemoved: false });
    expect(seen.some((q) => q.sql.includes('deletion_manifests') || q.sql.includes('provenance_tombstones'))).toBe(false);
    expect(sealR20DeletionLedger).not.toHaveBeenCalled();
  });
  it('the normal Delete (the writing is alive) is untouched by the follow-up: still exactly ONE manifest, its own note, the Work folded into the same tombstone batch, and the ledger sealed once', async () => {
    install({ claims: [W_A], writingHeld: true });
    const out = await eraseManuscript(MS, MEMBER, { viaWorkId: W_A });
    expect(out).toMatchObject({ ok: true, workRemoved: true, recoverySealed: true });
    const manifests = seen.filter((q) => q.sql.includes('INSERT INTO deletion_manifests'));
    expect(manifests).toHaveLength(1);
    expect(manifests[0]!.sql).toContain('Writer manuscript custody ended by verified member request');
    const tombstones = seen.filter((q) => q.sql.includes('INSERT INTO provenance_tombstones'));
    expect(tombstones).toHaveLength(1);
    expect(tombstones[0]!.sql).toContain('unnest');
    expect(tombstones[0]!.params).toEqual(['manifest-1', ['member_manuscripts', 'living_works'], [MS, W_A]]);
    expect(sealR20DeletionLedger).toHaveBeenCalledTimes(1);
  });
  it('(textual guard) the Work is deleted only WHERE it declares nothing else, and only the named member\'s (the behaviour itself is proved by probe CE-5b)', async () => {
    install({ claims: [W_A], writingHeld: false, workHoldsMore: true });
    await eraseManuscript(MS, MEMBER, { viaWorkId: W_A });
    const workDelete = seen.find((q) => q.sql.includes('DELETE FROM living_works'))!;
    expect(workDelete.sql).toMatch(/AND NOT EXISTS\s*\(\s*SELECT 1 FROM living_work_expressions e WHERE e\.living_work_id = w\.id\s*\)/);
    expect(workDelete.sql).toMatch(/w\.member_id = \$2/);
  });
  it('only the NAMED Work is cleaned when two hold dangling declarations', async () => {
    install({ claims: [W_A, W_B], writingHeld: false });
    await eraseManuscript(MS, MEMBER, { viaWorkId: W_B });
    const deletions = seen.filter((q) => q.sql.includes('DELETE FROM living_work_expressions') || q.sql.includes('DELETE FROM living_works'));
    expect(deletions.every((q) => q.params.includes(W_B) && !q.params.includes(W_A))).toBe(true);
  });
  it('the Work\'s image is owed through the queue, and a stuck image is reported as the IMAGE (not as the original file)', async () => {
    stuck.add(OWN_IMAGE);
    install({ claims: [W_A], writingHeld: false, visualPath: OWN_IMAGE });
    const out = await eraseManuscript(MS, MEMBER, { viaWorkId: W_A });
    expect(out).toMatchObject({ ok: true, sweptAll: false, owed: { originalFile: false, image: true } });
  });
});

describe('custody is about THIS deletion\'s own obligations, in both directions', () => {
  const world = (over: Partial<World> = {}): World => ({ claims: [W_A], writingHeld: true, arrivalRef: OWN_FILE, visualPath: OWN_IMAGE, ...over });

  it('everything this deletion owed was destroyed and the record sealed: fully confirmed', async () => {
    install(world());
    const out = await eraseManuscript(MS, MEMBER, { viaWorkId: W_A });
    expect(out).toMatchObject({ ok: true, sweptAll: true, recoverySealed: true, owed: { originalFile: false, image: false }, workRemoved: true, artifactsQueued: 1 });
    expect(destroyed.sort()).toEqual([OWN_FILE, OWN_IMAGE].sort());
  });
  it('SAFETY DIRECTION: the original file cannot be destroyed -> NOT confirmed, and it is the ORIGINAL FILE that is owed', async () => {
    stuck.add(OWN_FILE);
    install(world());
    expect(await eraseManuscript(MS, MEMBER, { viaWorkId: W_A })).toMatchObject({ sweptAll: false, owed: { originalFile: true, image: false } });
  });
  it('SAFETY DIRECTION: the Work\'s image cannot be destroyed -> NOT confirmed, and it is the IMAGE that is owed', async () => {
    stuck.add(OWN_IMAGE);
    install(world());
    expect(await eraseManuscript(MS, MEMBER, { viaWorkId: W_A })).toMatchObject({ sweptAll: false, owed: { originalFile: false, image: true } });
  });
  it('SAFETY DIRECTION: the deletion record cannot be sealed -> NOT confirmed, with nothing owed in bytes', async () => {
    (sealR20DeletionLedger as jest.Mock).mockRejectedValue(new Error('R20_LEDGER_FILE_MISSING'));
    install(world());
    expect(await eraseManuscript(MS, MEMBER, { viaWorkId: W_A })).toMatchObject({ sweptAll: false, recoverySealed: false, owed: { originalFile: false, image: false } });
  });
  it('SAFETY DIRECTION: a seal that answers "not sealed" is not confirmed either', async () => {
    (sealR20DeletionLedger as jest.Mock).mockResolvedValue({ sealed: false });
    install(world());
    expect(await eraseManuscript(MS, MEMBER, { viaWorkId: W_A })).toMatchObject({ sweptAll: false, recoverySealed: false });
  });
  it('ANOTHER member\'s stuck row never makes this deletion read as unconfirmed', async () => {
    queue.push({ id: 'foreign-1', artifact_ref: 'someone-elses/original.bin' });
    stuck.add('someone-elses/original.bin');
    install(world());
    expect(await eraseManuscript(MS, MEMBER, { viaWorkId: W_A })).toMatchObject({ sweptAll: true, owed: { originalFile: false, image: false } });
    expect(queue.map((row) => row.id)).toEqual(['foreign-1']);               // it stays owed, and stays an operator\'s concern
  });
  it('a backlog of 150 older rows does not starve this deletion\'s own obligations: they are worked first', async () => {
    for (let i = 0; i < 150; i += 1) { queue.push({ id: `old-${i}`, artifact_ref: `backlog/${i}.bin` }); stuck.add(`backlog/${i}.bin`); }
    install(world());
    const out = await eraseManuscript(MS, MEMBER, { viaWorkId: W_A });
    expect(out).toMatchObject({ sweptAll: true, owed: { originalFile: false, image: false } });
    expect(destroyed).toEqual(expect.arrayContaining([OWN_FILE, OWN_IMAGE]));
  });
  it('the count of what is owed asks about THIS deletion\'s ids only', async () => {
    install(world());
    await eraseManuscript(MS, MEMBER, { viaWorkId: W_A });
    const asked = (query as jest.Mock).mock.calls.find(([sql]) => String(sql).includes('WHERE id = ANY'))!;
    expect((asked[1][0] as string[]).length).toBe(2);
  });
  it('workRemoved is the SERVER\'s word on whether the Work went: a live writing whose Work declares something else too leaves the Work standing, and says so', async () => {
    install(world({ workHoldsMore: true, visualPath: null }));
    const out = await eraseManuscript(MS, MEMBER, { viaWorkId: W_A });
    expect(out).toMatchObject({ ok: true, workRemoved: false, sweptAll: true });
    // The Work stays, so its image is NOT queued for destruction: it is still on display.
    const imageQueue = seen.filter((q) => q.sql.includes('INSERT INTO vault_erasure_queue') && q.params[0] === OWN_IMAGE);
    expect(imageQueue).toHaveLength(0);
  });
  it('and the same Work-stays answer is given when custody is NOT confirmed (the case that decides which sentence the member reads)', async () => {
    stuck.add(OWN_FILE);
    install(world({ workHoldsMore: true, visualPath: null }));
    expect(await eraseManuscript(MS, MEMBER, { viaWorkId: W_A })).toMatchObject({ sweptAll: false, workRemoved: false, owed: { originalFile: true, image: false } });
  });
  it('a Work that held only this writing goes with it, and the answer says so', async () => {
    install(world({ visualPath: null }));
    expect(await eraseManuscript(MS, MEMBER, { viaWorkId: W_A })).toMatchObject({ ok: true, workRemoved: true });
  });
  it('a loose writing with no original file and no Work owes nothing and needs only the seal', async () => {
    install({ claims: [], writingHeld: true });
    const out = await eraseManuscript(MS, MEMBER);
    expect(out).toMatchObject({ ok: true, sweptAll: true, workRemoved: false, owed: { originalFile: false, image: false } });
    expect(sealR20DeletionLedger).toHaveBeenCalledTimes(1);
  });
});
