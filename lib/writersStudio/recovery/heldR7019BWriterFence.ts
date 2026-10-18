/**
 * R70.19B — explicitly fictional, default-off SQL/vault mutation interlock.
 *
 * This is not a deployed or complete backup system. Every normal invocation
 * goes straight to its existing production action, once, unchanged.
 * When opted in, it refuses unless using a marked, disposable loopback PG16
 * and fixture vault, then coordinates actual R65, section and file writers
 * using the same PG session-advisory key as the held R70.17 Source checkpoint.
 *
 * Any unparticipating writer or missing vault byte defeats backup readiness.
 */
import { Client } from 'pg';
import { AsyncLocalStorage } from 'node:async_hooks';
import { lstat, readFile, realpath, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import type { Dirent } from 'node:fs';
import path from 'node:path';
import type { TransactionClient } from '@/lib/db/postgres';

export const R7019B_PRODUCTION_WRITER_FENCE_ENABLED = false as const;
export const R7019B_REAL_BACKUP_AND_RESTORE_APPROVED = false as const;
const LOCK = 'soullab.ws.r70.17.writer-and-source-capture.v1';
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const DB = /^postgresql:\/\/fict@127\.0\.0\.1:\d{2,5}\/ws_atomic$/;
const VAULT = /^\/private\/tmp\/ws-r7019b-fixture-([a-f0-9]{12})\/vault$/;
type Writer =
  | 'confirmed_paste'
  | 'studio_file_upload'
  | 'source_arrival'
  | 'source_claim'
  | 'source_discard'
  | 'member_keep'
  | 'member_unkeep'
  | 'source_erasure'
  | 'studio_file_metadata'
  | 'studio_file_soft_delete'
  | 'studio_file_share'
  | 'legacy_revision_restore';
type Ident = { nonce: string; member_id: string; practitioner_id: string };

export class R7019BRefusal extends Error {
  constructor(readonly code: string) {
    super('r7019b_' + code);
    this.name = 'R7019BRefusal';
  }
}
const stop = (code: string): never => { throw new R7019BRefusal(code); };
// Two separate PostgreSQL clients must never recursively wait on our own
// session lease. Fictitious nesting fails closed rather than hanging.
const fixtureWriterScope=new AsyncLocalStorage<boolean>();

async function fixtureScope(memberId: string): Promise<{
  url: string; vault: string; nonce: string;
}> {
  if (R7019B_PRODUCTION_WRITER_FENCE_ENABLED !== false ||
      process.env.R7019B_WRITER_FIXTURE !== 'fictional-only' ||
      !UUID.test(memberId) || process.env.PGHOST ||
      process.env.PGUSER || process.env.PGSERVICE) stop('not_fictional');
  const url = process.env.DATABASE_URL ?? '';
  if (!DB.test(url)) stop('untrusted_database_url');
  const vault = process.env.FILE_STORAGE_PATH ?? '';
  const nonce = VAULT.exec(vault)?.[1];
  if (typeof nonce !== 'string' || process.env.R7019B_FIXTURE_NONCE !== nonce) {
    throw new R7019BRefusal('untrusted_fixture_vault');
  }
  const parent = path.dirname(vault);
  const [vstat, pstat, vre, pre, marker] = await Promise.all([
    lstat(vault).catch(() => null),
    lstat(parent).catch(() => null),
    realpath(vault).catch(() => null),
    realpath(parent).catch(() => null),
    readFile(path.join(parent, 'R7019B_FICTIONAL_ONLY.marker'), 'utf8')
      .catch(() => null),
  ]);
  if (!vstat?.isDirectory() || vstat.isSymbolicLink() ||
      !pstat?.isDirectory() || pstat.isSymbolicLink() ||
      vre !== vault || pre !== parent ||
      marker !== 'fictional-whole-writer-' + nonce + '\n') {
    stop('untrusted_marker_or_symlink');
  }
  return { url, vault, nonce };
}

async function verifiedIdentity(
  client: { query: (sql: string) => Promise<{ rows: unknown[] }> },
  memberId: string, nonce: string, practitionerId?: string,
): Promise<void> {
  let rows: Ident[] = [];
  try {
    const r = await client.query(
      'SELECT nonce,member_id,practitioner_id FROM r7019b_fixture_identity LIMIT 2',
    );
    rows = r.rows as Ident[];
    const v = await client.query(
      "SELECT current_setting('server_version_num') AS n",
    );
    const version = (v.rows[0] as { n?: string } | undefined)?.n;
    if (!/^16\d{4}$/.test(version || '')) stop('postgres16_required');
  } catch (error) {
    if (error instanceof R7019BRefusal) throw error;
    stop('untrusted_fixture_identity_table');
  }
  if (rows.length !== 1 || rows[0].nonce !== nonce ||
      rows[0].member_id !== memberId ||
      (practitionerId && rows[0].practitioner_id !== practitionerId)) {
    stop('untrusted_member_or_practitioner');
  }
}

/** Session lock covers the real action's separate SQL pool transaction AND
 * all writes to the attached filesystem. The explicit fixture owns only
 * the lock; original action rollback/error contracts are unchanged. */
export async function withHeldR7019BWriter<T>(
  memberId: string, kind: Writer, action: () => Promise<T>,
  practitionerId?: string,
): Promise<T> {
  if (process.env.R7019B_WRITER_FIXTURE === undefined) return action();
  if(fixtureWriterScope.getStore())stop('nested_cross_client_writer_lease');
  if (!(['confirmed_paste','studio_file_upload','source_arrival',
          'source_claim','source_discard','member_keep','member_unkeep',
          'source_erasure','studio_file_metadata',
          'studio_file_soft_delete','studio_file_share',
          'legacy_revision_restore'] as Writer[]).includes(kind)) {
    stop('unknown_writer');
  }
  const scope = await fixtureScope(memberId);
  const client = new Client({
    connectionString: scope.url, connectionTimeoutMillis: 2000,
  });
  await client.connect();
  let locked = false;
  try {
    await verifiedIdentity(client, memberId, scope.nonce, practitionerId);
    await client.query("SET statement_timeout='8000ms'");
    await client.query(
      'SELECT pg_advisory_lock(hashtextextended($1::text,0))', [LOCK],
    );
    locked = true;
    return await fixtureWriterScope.run(true,action);
  } finally {
    try {
      if (locked) {
        const r = await client.query<{ unlocked: boolean }>(
          'SELECT pg_advisory_unlock(hashtextextended($1::text,0)) AS unlocked',
          [LOCK],
        );
        if (r.rows[0]?.unlocked !== true) stop('lock_release_unverified');
      }
    } finally { await client.end(); }
  }
}

/** THIS call is inside the caller's existing transaction, BEFORE section
 * DML. Transaction-level PG lock survives until the outer COMMIT/ROLLBACK.
 * It covers direct saveSectionInTransaction callers, not just saveSection.
 * A higher-level caller writing other data BEFORE this call is NOT protected:
 * those callers remain in the R70.19 unqualified inventory. */
export async function holdR7019BDirectSectionTransaction(
  tx: TransactionClient, memberId: string,
): Promise<void> {
  if (process.env.R7019B_WRITER_FIXTURE === undefined) return;
  if(fixtureWriterScope.getStore())stop('nested_cross_client_section_lease');
  const scope = await fixtureScope(memberId);
  await verifiedIdentity(tx, memberId, scope.nonce);
  await tx.query("SET LOCAL statement_timeout='8000ms'");
  await tx.query(
    'SELECT pg_advisory_xact_lock(hashtextextended($1::text,0))', [LOCK],
  );
}

/**
 * Count-only/hashed verification of the fixture's practitioner vault.
 * Every published fixture file must have an exact database-owned row;
 * every row must have its original bytes. This does not cover other vault
 * namespaces and never supplies complete-Work backup approval.
 */
async function verifyFixturePractitionerFiles(
  client: Client, root: string, practitionerId: string,
): Promise<{ files: number; digests: readonly string[] }> {
  const base = path.join(root, practitionerId);
  let entries: Dirent[] = [];
  try {
    entries = await readdir(base, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      stop('unreadable_practitioner_storage');
    }
  }
  if (entries.some((entry) => !entry.isFile() || entry.isSymbolicLink())) {
    stop('non_regular_practitioner_file');
  }
  const rows = await client.query<{
    storage_path: string; size_bytes: string;
  }>(
    'SELECT storage_path, size_bytes FROM practitioner_files WHERE practitioner_id=$1',
    [practitionerId],
  );
  const stored = new Map<string, string>();
  for (const row of rows.rows) {
    const ref = row.storage_path;
    const name = path.basename(ref);
    if (path.dirname(ref) !== practitionerId ||
        !/^[a-f0-9-]{36}\.[a-z0-9]{1,10}$/i.test(name) ||
        stored.has(name)) stop('foreign_duplicate_or_unsafe_path');
    stored.set(name, row.size_bytes);
  }
  if (stored.size !== entries.length ||
      entries.some((entry) => !stored.has(entry.name))) {
    stop('unlinked_or_missing_original_bytes');
  }
  const hashes: string[] = [];
  for (const entry of entries) {
    const bytes = await readFile(path.join(base, entry.name));
    if (BigInt(bytes.length) !== BigInt(stored.get(entry.name) ?? '-1')) {
      stop('original_file_size_mismatch');
    }
    hashes.push(createHash('sha256').update(bytes).digest('hex'));
  }
  return { files: rows.rows.length, digests: hashes.sort() };
}

/** Code-only fixture capture lease. The reader receives the *same*
 * transaction client that owns the advisory lock; no caller-created pooled
 * SQL session can masquerade as a consistent snapshot. This does not approve
 * offsite key custody, encryption or any production release. */
export async function withHeldR7019BCapture<T>(
  memberId: string,
  readSnapshot: (client: Client, vault: string) => Promise<T>,
): Promise<{ snapshot: T; fileCoverage: { files: number; digests: readonly string[] };
  releaseApproved: false; wholeWriterBackupComplete: false }> {
  const scope = await fixtureScope(memberId);
  const client = new Client({
    connectionString: scope.url, connectionTimeoutMillis: 2000,
  });
  await client.connect();
  let locked = false;
  let begun = false;
  try {
    await verifiedIdentity(client, memberId, scope.nonce);
    const r = await client.query<{ locked: boolean }>(
      'SELECT pg_try_advisory_lock(hashtextextended($1::text,0)) AS locked',
      [LOCK],
    );
    if (r.rows[0]?.locked !== true) stop('participating_writer_active');
    locked = true;
    await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    begun = true;
    await client.query("SET LOCAL statement_timeout='8000ms'");
    // Caller must inspect canonical table rows and every linked vault byte,
    // refuse unknown/orphaned objects, and keep unqualified families visible.
    const identity = await client.query<{ practitioner_id: string }>(
      'SELECT practitioner_id FROM r7019b_fixture_identity',
    );
    if (identity.rows.length !== 1) stop('missing_practitioner_identity');
    const fileCoverage = await verifyFixturePractitionerFiles(
      client, scope.vault, identity.rows[0].practitioner_id,
    );
    const snapshot = await readSnapshot(client, scope.vault);
    await client.query('COMMIT'); begun = false;
    return { snapshot, fileCoverage, releaseApproved: false,
      wholeWriterBackupComplete: false };
  } finally {
    try {
      if (begun) await client.query('ROLLBACK').catch(() => undefined);
      if (locked) {
        const r = await client.query<{ unlocked: boolean }>(
          'SELECT pg_advisory_unlock(hashtextextended($1::text,0)) AS unlocked',
          [LOCK],
        );
        if (r.rows[0]?.unlocked !== true) stop('capture_lock_release_unverified');
      }
    } finally { await client.end(); }
  }
}
