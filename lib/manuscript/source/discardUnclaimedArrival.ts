/**
 * Explicit abandonment of an upload BEFORE manuscript confirmation.
 *
 * The row lock serializes this member gesture against claimArrival's UPDATE:
 * once a file is attached to a manuscript we can never discard it here.
 * Commit an erasure debt alongside deleting the unclaimed row; finish bytes
 * afterward. If filesystem work fails, the existing durable queue survives.
 *
 * No clock-based expiration is inferred here. Scheduled retention requires a
 * separate, member-approved policy and backup/deletion contract.
 */
import { query, transaction } from '@/lib/db/postgres';
import { r20LedgerErrorCode, sealR20DeletionLedger } from '@/lib/recovery/r20DeletionLedger';
import { destroyVaultBytes } from '@/lib/storage/fileVault';

export type DiscardArrivalOutcome =
  | { kind: 'discarded'; bytesDestroyed: true }
  | { kind: 'not_found' }
  | { kind: 'already_claimed' }
  | { kind: 'erasure_pending' };

export async function discardUnclaimedArrival(
  arrivalId: string,
  memberId: string,
): Promise<DiscardArrivalOutcome> {
  const locked = await transaction(async (tx) => {
    const arrival = await tx.query<{
      artifact_ref: string | null;
      manuscript_id: string | null;
    }>(
      `SELECT artifact_ref, manuscript_id
         FROM manuscript_source_arrivals
        WHERE id = $1 AND member_id = $2
        FOR UPDATE`,
      [arrivalId, memberId],
    );
    if (arrival.rows.length === 0) return { kind: 'not_found' as const };
    const row = arrival.rows[0];
    if (row.manuscript_id !== null) return { kind: 'already_claimed' as const };

    const landing = await tx.query<{ id: string }>(
      `SELECT id FROM writer_source_landing_intents
        WHERE arrival_id = $1::uuid AND member_id = $2::uuid
        FOR UPDATE`,
      [arrivalId, memberId],
    );
    if (landing.rows.length > 1) throw new Error('multiple landing intents for one arrival');
    const landingIntentId = landing.rows[0]?.id ?? null;

    const deleted = await tx.query<{ id: string }>(
      `DELETE FROM manuscript_source_arrivals
        WHERE id = $1 AND member_id = $2 AND manuscript_id IS NULL
        RETURNING id`,
      [arrivalId, memberId],
    );
    if (deleted.rows.length !== 1) throw new Error('unclaimed arrival changed under lock');

    // An explicit member discard is a sovereignty deletion, not merely live-row
    // cleanup. Preserve exact refusal markers so an older SQL snapshot cannot
    // reintroduce the arrival or its wrapped encryption key.
    const manifest = await tx.query<{ id: string }>(
      `INSERT INTO deletion_manifests
         (reason_class, authorized_by, executed_at, note)
       VALUES ('member_deletion', 'verified-member-self-service', now(),
               'Unclaimed Writer original discarded by verified member request')
       RETURNING id`,
    );
    const manifestId = manifest.rows[0]?.id;
    if (!manifestId) throw new Error('unclaimed_discard_manifest_not_created');
    const kinds = ['manuscript_source_arrivals'];
    const ids = [arrivalId];
    if (landingIntentId) {
      kinds.push('writer_source_landing_intents');
      ids.push(landingIntentId);
    }
    await tx.query(
      `INSERT INTO provenance_tombstones (manifest_id, object_kind, object_id)
       SELECT $1::uuid, item.kind, item.id
         FROM unnest($2::text[], $3::text[]) AS item(kind, id)
       ON CONFLICT (object_kind, object_id) DO NOTHING`,
      [manifestId, kinds, ids],
    );

    // Source artifacts are named by a unique vault-relative reference. Refuse
    // a deletion if another arrival still owns the same bytes.
    if (row.artifact_ref) {
      const shared = await tx.query<{ id: string }>(
        `SELECT id FROM manuscript_source_arrivals
          WHERE artifact_ref = $1 LIMIT 1`,
        [row.artifact_ref],
      );
      if (shared.rows.length) throw new Error('shared original artifact reference');

      const obligation = await tx.query<{ id: string }>(
        `INSERT INTO vault_erasure_queue (artifact_ref)
          VALUES ($1) RETURNING id`,
        [row.artifact_ref],
      );
      if (obligation.rows.length !== 1) throw new Error('erasure obligation not recorded');
      return { kind: 'owed' as const, ref: row.artifact_ref, queueId: obligation.rows[0].id };
    }
    return { kind: 'without_bytes' as const };
  });

  if (locked.kind === 'not_found' || locked.kind === 'already_claimed') return locked;

  // Do not physically finish or report the discard while the independent
  // rollback-refusal ledger is unavailable. The database tombstones and any
  // queued byte obligation remain durable for a later retry.
  try {
    const sealed = await sealR20DeletionLedger();
    if (!sealed.sealed) return { kind: 'erasure_pending' };
  } catch (error) {
    console.error('[MAIA/press] unclaimed Source R20 seal still owed', {
      code: r20LedgerErrorCode(error),
    });
    return { kind: 'erasure_pending' };
  }

  if (locked.kind === 'without_bytes') return { kind: 'discarded', bytesDestroyed: true };

  try {
    await destroyVaultBytes(locked.ref);
  } catch {
    // Owed deletion stays durable. Never claim the original was destroyed.
    return { kind: 'erasure_pending' };
  }
  // If this DELETE fails the queued operation is safe to retry: destroying an
  // already-absent vault artifact is idempotent.
  await query('DELETE FROM vault_erasure_queue WHERE id = $1', [locked.queueId]);
  return { kind: 'discarded', bytesDestroyed: true };
}
