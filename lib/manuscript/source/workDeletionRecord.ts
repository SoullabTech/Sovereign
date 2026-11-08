/**
 * WS-DELETE-01 follow-up — the deletion record for a Work that goes WITHOUT its writing being erased in the same act.
 *
 * Two paths end a Work row and write no manuscript record of their own:
 *
 *   - Remove this Work (DELETE /api/sovereign/living-works/[id]): the member removes the container and keeps the writing.
 *   - X8 (lib/manuscript/source/eraseManuscript.ts): a declaration that outlived its writing is ended, and the Work with it when it
 *     then declares nothing.
 *
 * Before this module neither wrote the content-free refusal authority that the normal Delete writes (a `member_deletion` manifest and a
 * tombstone per erased object). A governed restore (scripts/restore-governed.sh) deletes a restored row only where a tombstone names
 * it, so a Work removed by either path could come back, with its conversations, from a backup taken before the removal. The record
 * written here is that tombstone: one manifest, one `living_works` tombstone, in the SAME transaction as the Work's deletion, so the
 * Work and its record commit together or not at all.
 *
 * ── What this does NOT do ────────────────────────────────────────────────────
 * It does not seal the independent R20 ledger (sealR20DeletionLedger). Sealing is a member-visible outcome (a failed seal answers
 * `custody_incomplete`), and in the current production configuration the ledger is not configured at all (no `R20_*` variable on the
 * app container), so a seal here would turn today's success into a failure for no protection gained. Sealing Remove needs its own
 * ruling and a client change (lib/writersStudio/deleteWork.ts reads any 500 with `removed: true` from this route as an owed image).
 * The manifest and tombstone are committed in the database, and any later successful seal mirrors every row, so the record is
 * recoverable into the ledger once it is configured. See the R-SHARED lane record, sections 6.9 and 6.10.
 *
 * It does not tombstone the writing: neither path erases one. It does not call `r20_erase_writer_editorial_history`: that function
 * is the erasure of a MANUSCRIPT's editorial history and requires a manuscript tombstone under the manifest it is given.
 *
 * ── Lock order ───────────────────────────────────────────────────────────────
 * A coherent R20 backup is documented (eraseManuscript.ts, header of the lock statement) to hold the `soullab:r20:recovery-capture`
 * advisory key while it seals the ledger, dumps PostgreSQL and captures the vault; no such backup caller is in this tree, so the
 * only holder known here is a writing Delete's own transaction. The deletion of a writing takes that key FIRST, then the Work rows. Anything else that takes both must take them
 * in the same order, or the two can wait on each other (PostgreSQL then aborts one of them with a 500 for an act that did not
 * happen). `takeRecoveryCaptureLock` is therefore the first statement of the Remove transaction, before it reads the Work row, and
 * it is taken even for a Work that turns out not to exist: a conditional lock would be taken after a row lock on some paths.
 *
 * The SQL below is deliberately a second spelling of the normal Delete's statements and not a call into them: eraseManuscript.ts is
 * pinned by source-text law tests (the order of its statements is part of the erasure law), and moving them would reopen those. The
 * two spellings are held together by lib/manuscript/source/__tests__/workDeletionRecord.test.ts, which fails if they diverge.
 */

import type { TransactionClient } from '@/lib/db/postgres';

/** One source for the key and the statement. Same text as the first statement of `eraseManuscript`. */
export const RECOVERY_CAPTURE_LOCK_SQL =
  `SELECT pg_advisory_xact_lock(hashtextextended('soullab:r20:recovery-capture', 0))`;

/** What the record says happened. The only thing that varies between the two callers. */
export type WorkDeletionRecordNote =
  | 'Writer Work removed by verified member request'
  | 'Writer Work ended after its writing was already gone, by verified member request';

/**
 * Blocks, with no timeout, until nothing else holds the key (a writing Delete; a coherent R20 backup, where one exists), and then
 * holds it to the end of the transaction. MUST be the first statement of a transaction that also locks Work rows. A bounded wait is
 * owed (lane record 6.9.5).
 */
export async function takeRecoveryCaptureLock(tx: TransactionClient): Promise<void> {
  await tx.query(RECOVERY_CAPTURE_LOCK_SQL);
}

/**
 * Writes the manifest and the `living_works` tombstone for a Work row THIS transaction has just deleted.
 *
 * `removedWorkId` must be the id the DELETE ... RETURNING handed back, never the id from the URL or the request: the tombstone is
 * compared against the database's own spelling of a uuid, and a caller's spelling (upper case, braces) would not match it.
 * Returns the manifest id. Throws (rolling the Work's deletion back with it) if the manifest cannot be created.
 */
export async function writeWorkDeletionRecord(
  tx: TransactionClient,
  removedWorkId: string,
  note: WorkDeletionRecordNote,
): Promise<string> {
  const manifest = await tx.query<{ id: string }>(
    `INSERT INTO deletion_manifests
       (reason_class, authorized_by, executed_at, note)
     VALUES ('member_deletion', 'verified-member-self-service', now(), $1)
     RETURNING id`,
    [note],
  );
  const manifestId = manifest.rows[0]?.id;
  if (!manifestId) throw new Error('r20_manifest_not_created');
  await tx.query(
    `INSERT INTO provenance_tombstones (manifest_id, object_kind, object_id)
     VALUES ($1::uuid, 'living_works', $2)
     ON CONFLICT (object_kind, object_id) DO NOTHING`,
    [manifestId, removedWorkId],
  );
  return manifestId;
}
