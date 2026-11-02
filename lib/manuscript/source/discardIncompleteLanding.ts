/**
 * The member's door for an upload that never finished (D3).
 *
 * WHY THIS EXISTS. An upload that lands encrypted bytes but never reaches a recorded arrival leaves, in the vault and the
 * database, a ciphertext file and the wrapped key that opens it. Measured against the real library: no existing door
 * reaches them. `discardUnclaimedArrival` and Delete Work key on an ARRIVAL, and an incomplete intent has none
 * (arrival_id is NULL by CHECK in every state before ARRIVAL_RECORDED); `inspectMemberIncompleteLandings` had no caller; the
 * 24-hour sweep named in a migration comment was never written. So a member's encrypted file and key could sit there with
 * no way for the member to remove them. That is a held-data-with-no-removal-door state, which the project's consent
 * vows forbid.
 *
 * WHAT IT DOES. It follows `discardUnclaimedArrival` exactly: lock the row, tombstone it under a member-deletion manifest
 * so an older snapshot cannot reintroduce it, delete the row (which deletes the wrapped key with it), commit a durable
 * erasure obligation for the ciphertext, then seal the R20 ledger, destroy the bytes and clear the obligation. If any later
 * step fails the obligation stays durable and the outcome says so; it never claims the bytes are gone when they are not.
 *
 * WHAT IT REFUSES, AND WHY.
 *   - an intent whose write lease is still live: another request may be mid-write, and deleting under it would let that
 *     writer publish a file for a row that no longer exists. The member can retry once the lease has lapsed.
 *   - an intent that has become a RECORDED arrival: that is `discardUnclaimedArrival`'s territory, and the answer tells
 *     the caller so instead of guessing.
 *
 * RESIDUAL, stated plainly: a writer whose lease expired but whose process is merely slow could still publish a file after
 * this commits. The fencing epoch makes that writer's own database update fail, so it is detected by the writer, but the
 * unreferenced file would remain until an operator sweep. The window is the gap between lease expiry and a stalled process
 * and is not closed here.
 *
 * Removal is never refused for Sanctuary or for roster membership: a member who is no longer in the pilot, or who is in
 * Sanctuary, must still be able to remove what is held for them.
 */
import { query, transaction } from '@/lib/db/postgres';
import { r20LedgerErrorCode, sealR20DeletionLedger } from '@/lib/recovery/r20DeletionLedger';
import { destroyVaultBytes } from '@/lib/storage/fileVault';

export type DiscardIncompleteOutcome =
  | { kind: 'discarded'; bytesDestroyed: boolean }
  | { kind: 'not_found' }
  | { kind: 'already_recorded' }
  | { kind: 'in_progress' }
  | { kind: 'erasure_pending' };

export async function discardIncompleteLanding(
  intentId: string,
  memberId: string,
): Promise<DiscardIncompleteOutcome> {
  const locked = await transaction(async (tx) => {
    const found = await tx.query<{
      state: string;
      artifact_ref: string;
      lease_live: boolean;
    }>(
      `SELECT state, artifact_ref,
              (lease_expires_at IS NOT NULL AND lease_expires_at > clock_timestamp()) AS lease_live
         FROM writer_source_landing_intents
        WHERE id = $1::uuid AND member_id = $2::uuid
        FOR UPDATE`,
      [intentId, memberId],
    );
    const row = found.rows[0];
    if (!row) return { kind: 'not_found' as const };
    if (row.state === 'ARRIVAL_RECORDED') return { kind: 'already_recorded' as const };
    if (row.lease_live) return { kind: 'in_progress' as const };

    const deleted = await tx.query<{ id: string }>(
      `DELETE FROM writer_source_landing_intents
        WHERE id = $1::uuid AND member_id = $2::uuid AND state <> 'ARRIVAL_RECORDED'
        RETURNING id`,
      [intentId, memberId],
    );
    if (deleted.rows.length !== 1) throw new Error('incomplete_landing_changed_under_lock');

    // A sovereignty deletion, not live-row cleanup: leave an exact refusal marker so an older SQL snapshot cannot
    // reintroduce this intent or the wrapped key it carried.
    const manifest = await tx.query<{ id: string }>(
      `INSERT INTO deletion_manifests (reason_class, authorized_by, executed_at, note)
       VALUES ('member_deletion', 'verified-member-self-service', now(),
               'Unfinished Writer upload discarded by verified member request')
       RETURNING id`,
    );
    const manifestId = manifest.rows[0]?.id;
    if (!manifestId) throw new Error('incomplete_discard_manifest_not_created');
    await tx.query(
      `INSERT INTO provenance_tombstones (manifest_id, object_kind, object_id)
       VALUES ($1::uuid, 'writer_source_landing_intents', $2)
       ON CONFLICT (object_kind, object_id) DO NOTHING`,
      [manifestId, intentId],
    );

    // PENDING_BYTES never published a file (WRITING_BYTES is set BEFORE the first byte is written), so there is
    // nothing physical to owe. Every later state may have ciphertext on disk.
    if (row.state === 'PENDING_BYTES') return { kind: 'without_bytes' as const };

    const shared = await tx.query<{ id: string }>(
      `SELECT id FROM manuscript_source_arrivals WHERE artifact_ref = $1 LIMIT 1`,
      [row.artifact_ref],
    );
    if (shared.rows.length) throw new Error('shared original artifact reference');

    const obligation = await tx.query<{ id: string }>(
      `INSERT INTO vault_erasure_queue (artifact_ref) VALUES ($1) RETURNING id`,
      [row.artifact_ref],
    );
    if (obligation.rows.length !== 1) throw new Error('erasure obligation not recorded');
    return { kind: 'owed' as const, ref: row.artifact_ref, queueId: obligation.rows[0].id };
  });

  if (locked.kind === 'not_found' || locked.kind === 'already_recorded' || locked.kind === 'in_progress') {
    return locked;
  }

  // Do not finish or report the discard while the independent rollback-refusal ledger is unavailable. The database
  // tombstone and any queued byte obligation stay durable for a later retry.
  try {
    const sealed = await sealR20DeletionLedger();
    if (!sealed.sealed) return { kind: 'erasure_pending' };
  } catch (error) {
    console.error('[MAIA/press] unfinished Source discard: R20 seal still owed', {
      code: r20LedgerErrorCode(error),
    });
    return { kind: 'erasure_pending' };
  }

  if (locked.kind === 'without_bytes') return { kind: 'discarded', bytesDestroyed: false };

  try {
    await destroyVaultBytes(locked.ref);
  } catch {
    // The owed deletion stays durable. Never claim the original was destroyed.
    return { kind: 'erasure_pending' };
  }
  // Destroying an already-absent artifact is idempotent, so a failure here is safe to retry.
  await query('DELETE FROM vault_erasure_queue WHERE id = $1', [locked.queueId]);
  return { kind: 'discarded', bytesDestroyed: true };
}

/* ------------------------------------------------------------------------------------------------------------------ */

export interface UnfinishedUpload {
  id: string;
  /** `incomplete`: never reached a recorded arrival. `unclaimed`: recorded, but not attached to any Work. */
  kind: 'incomplete' | 'unclaimed';
  createdAt: string;
  /** Present only for an unclaimed original, where the member's own filename is already stored. */
  filename: string | null;
  bytes: number | null;
}

/**
 * Everything held for this member that is not part of a Work: unfinished uploads and recorded-but-unclaimed originals.
 * Content-free by construction: no extracted text, no key material, no object path.
 */
export async function listMemberUnfinishedUploads(memberId: string): Promise<UnfinishedUpload[]> {
  const incomplete = await query<{ id: string; created_at: Date | string; original_bytes: string | number }>(
    `SELECT id, created_at, original_bytes
       FROM writer_source_landing_intents
      WHERE member_id = $1::uuid AND state <> 'ARRIVAL_RECORDED'
      ORDER BY created_at, id`,
    [memberId],
  );
  const unclaimed = await query<{
    id: string; created_at: Date | string; original_filename: string | null; artifact_size: string | number | null;
  }>(
    `SELECT id, created_at, original_filename, artifact_size
       FROM manuscript_source_arrivals
      WHERE member_id = $1::uuid AND manuscript_id IS NULL AND source_kind = 'artifact_extraction'
      ORDER BY created_at, id`,
    [memberId],
  );
  const iso = (v: Date | string) => (v instanceof Date ? v.toISOString() : new Date(v).toISOString());
  return [
    ...incomplete.rows.map((r) => ({
      id: r.id, kind: 'incomplete' as const, createdAt: iso(r.created_at), filename: null, bytes: Number(r.original_bytes),
    })),
    ...unclaimed.rows.map((r) => ({
      id: r.id, kind: 'unclaimed' as const, createdAt: iso(r.created_at), filename: r.original_filename,
      bytes: r.artifact_size === null ? null : Number(r.artifact_size),
    })),
  ];
}
