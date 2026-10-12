/**
 * R20-R2 deletion-authority candidate (not deployed).
 *
 * Called INSIDE the same SQL transaction as a successful member Work erasure.
 * Missing manifest/tombstone/outbox writes throw and roll back that erasure.
 * Identifiers only: never store source text, titles, filenames, vault paths,
 * uploaded hashes or derived prose in this authority record.
 *
 * Committed outbox obligations are not signed independent checkpoints.
 * Production recovery is held until those are independently attested.
 */
import type { TransactionClient } from '@/lib/db/postgres';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type WorkDeletionAuthority = Readonly<{
  manifestId: string;
  outboxSequence: string;
}>;

export async function recordWorkDeletionAuthority(
  tx: TransactionClient,
  manuscriptId: string,
  deletedWorkId?: string,
): Promise<WorkDeletionAuthority> {
  if (!UUID.test(manuscriptId) || (deletedWorkId && !UUID.test(deletedWorkId))) {
    throw new Error('R20 refusal: invalid deleted-object identity');
  }

  // Serializes sequence assignment with transaction commit.
  // Identity values can have gaps; independent signed high-water is required.
  await tx.query(
    "SELECT pg_advisory_xact_lock(hashtextextended('r20:deletion-authority', 0))",
  );

  const manifest = await tx.query<{ id: string }>(
    `INSERT INTO deletion_manifests
       (reason_class, incident_ref, authorized_by, executed_at, note)
     VALUES ('member_deletion', 'WS-DELETE-01', 'authenticated-member-act',
             clock_timestamp(), 'Member-selected Work erasure; no source content')
     RETURNING id`,
  );
  const manifestId = manifest.rows[0]?.id;
  if (!manifestId || !UUID.test(manifestId) || manifest.rows.length !== 1) {
    throw new Error('R20 refusal: deletion manifest not durably minted');
  }

  // Parent tombstone and cascading FKs protect linked relational rows in the
  // governed restore sweep. Independent media/vault derivatives still require
  // a separate, exhaustive custody inventory and verified deletion.
  const identities: ReadonlyArray<readonly [string, string]> = [
    ['member_manuscripts', manuscriptId],
    ...(deletedWorkId ? [['living_works', deletedWorkId] as const] : []),
  ];
  for (const [objectKind, objectId] of identities) {
    const inserted = await tx.query<{ object_id: string }>(
      `INSERT INTO provenance_tombstones (manifest_id, object_kind, object_id)
       VALUES ($1, $2, $3)
       RETURNING object_id`,
      [manifestId, objectKind, objectId],
    );
    if (inserted.rows.length !== 1 || inserted.rows[0].object_id !== objectId) {
      throw new Error('R20 refusal: deletion tombstone not durably minted');
    }
  }

  const committedObligation = await tx.query<{ sequence_id: string }>(
    `INSERT INTO r20_deletion_authority_outbox (manifest_id, subject_kind)
     VALUES ($1, 'member_manuscripts')
     RETURNING sequence_id::text AS sequence_id`,
    [manifestId],
  );
  const outboxSequence = committedObligation.rows[0]?.sequence_id;
  if (!outboxSequence || !/^[1-9][0-9]*$/.test(outboxSequence) ||
      committedObligation.rows.length !== 1) {
    throw new Error('R20 refusal: independent authority obligation not recorded');
  }
  return { manifestId, outboxSequence };
}
