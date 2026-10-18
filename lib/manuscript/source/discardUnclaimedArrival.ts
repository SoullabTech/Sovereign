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
import { destroyVaultBytes } from '@/lib/storage/fileVault';
import { withHeldR7019BWriter } from '@/lib/writersStudio/recovery/heldR7019BWriterFence';

export type DiscardArrivalOutcome =
  | { kind: 'discarded'; bytesDestroyed: true }
  | { kind: 'not_found' }
  | { kind: 'already_claimed' }
  | { kind: 'erasure_pending' };

async function discardUnclaimedArrivalUnfenced(
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

    const deleted = await tx.query<{ id: string }>(
      `DELETE FROM manuscript_source_arrivals
        WHERE id = $1 AND member_id = $2 AND manuscript_id IS NULL
        RETURNING id`,
      [arrivalId, memberId],
    );
    if (deleted.rows.length !== 1) throw new Error('unclaimed arrival changed under lock');

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


/** Covers the original durable erasure debt AND file deletion in the same
 * fictitious lease. No production erasure schedule is inferred. */
export async function discardUnclaimedArrival(
  arrivalId: string, memberId: string,
): Promise<DiscardArrivalOutcome> {
  return withHeldR7019BWriter(memberId, 'source_discard',
    () => discardUnclaimedArrivalUnfenced(arrivalId, memberId));
}
