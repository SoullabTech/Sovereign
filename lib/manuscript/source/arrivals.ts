import { query, transaction, type TransactionClient } from '@/lib/db/postgres';
import { readVaultBytes } from '@/lib/storage/fileVault';
import {
  getEncryptedLandingForArrival,
  recordEncryptedArtifactArrival,
  recoverEncryptedLandingBytes,
} from './encryptedLanding';
import {
  ARTIFACT_EXTRACTION,
  buildArrival,
  certifiesCustody,
  hashBytes,
  hashText,
  MEMBER_SUPPLIED_TEXT,
  type ExtractorKey,
  type SourceKind,
} from './custody';

/**
 * WS-01 — persistence for source arrivals.
 *
 * Relational data identifies and governs the source; the shared file vault holds
 * the immutable bytes. This module is the only place those two are joined, so
 * "the bytes exist" and "a row says they do" cannot drift apart silently.
 *
 * File-backed arrivals now begin with a committed member-bound landing intent.
 * A random per-arrival key encrypts the original in memory; only ciphertext is
 * written durably. The immutable arrival row is inserted only after independent
 * read-back, authenticated decryption and exact original hash/length checks.
 * Existing pre-migration arrivals retain their legacy plaintext read path.
 */


export interface StoredArrival {
  id: string;
  sourceKind: SourceKind;
  sourceText: string;
  sourceTextHash: string;
  artifactRef: string | null;
  artifactHash: string | null;
  landingIntentId?: string;
}

/** Persist a file-backed arrival: bytes to the vault, then the governing row. */
export async function recordArtifactArrival(params: {
  memberId: string;
  bytes: Buffer;
  originalFilename: string;
  mimeType: string | null;
  sourceText: string;
  extractor: ExtractorKey;
  idempotencyKey?: string | null;
}): Promise<StoredArrival> {
  if (params.extractor === 'supplied') {
    throw new Error('artifact_arrival_cannot_use_supplied_extractor');
  }
  return recordEncryptedArtifactArrival({
    memberId: params.memberId,
    bytes: params.bytes,
    originalFilename: params.originalFilename,
    mimeType: params.mimeType,
    sourceText: params.sourceText,
    extractor: params.extractor,
    format: params.extractor,
    idempotencyKey: params.idempotencyKey,
  });
}

/**
 * Persist a member-supplied arrival: the exact text at the confirmation act.
 *
 * No artifact is invented, and none is captured earlier — a paste gesture does
 * not become hidden clipboard capture. The authoritative source is what the
 * member submitted when they confirmed the import.
 */
export async function recordSuppliedArrival(params: {
  memberId: string;
  sourceText: string;
}): Promise<StoredArrival> {
  return insertArrival(
    params.memberId,
    buildArrival({ kind: MEMBER_SUPPLIED_TEXT, sourceText: params.sourceText }),
  );
}

/**
 * The same insert, run inside a transaction the CALLER owns, so that a rolled-back import takes the supplied arrival with it
 * instead of leaving an orphan row of the member's pasted text that no screen lists and no door removes.
 */
export async function recordSuppliedArrivalWithClient(
  tx: TransactionClient,
  params: { memberId: string; sourceText: string },
): Promise<StoredArrival> {
  return insertArrival(
    params.memberId,
    buildArrival({ kind: MEMBER_SUPPLIED_TEXT, sourceText: params.sourceText }),
    tx,
  );
}

async function insertArrival(
  memberId: string,
  record: ReturnType<typeof buildArrival>,
  tx?: TransactionClient,
): Promise<StoredArrival> {
  const run: (sql: string, params: unknown[]) => Promise<{ rows: Array<{ id: string }> }> = tx
    ? (sql, params) => tx.query<{ id: string }>(sql, params as any[])
    : (sql, params) => query<{ id: string }>(sql, params as any[]);
  const res = await run(
    `INSERT INTO manuscript_source_arrivals
       (member_id, source_kind, artifact_ref, artifact_hash, artifact_size,
        original_filename, mime_type, source_text, source_text_hash,
        extraction_method, extractor_version)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING id`,
    [
      memberId,
      record.sourceKind,
      record.artifactRef,
      record.artifactHash,
      record.artifactSize,
      record.originalFilename,
      record.mimeType,
      record.sourceText,
      record.sourceTextHash,
      record.extractionMethod,
      record.extractorVersion,
    ],
  );
  return {
    id: res.rows[0].id,
    sourceKind: record.sourceKind,
    sourceText: record.sourceText,
    sourceTextHash: record.sourceTextHash,
    artifactRef: record.artifactRef,
    artifactHash: record.artifactHash,
  };
}

/**
 * R12 isolated beta candidate — atomically bind a pending Source arrival to a
 * SAME-MEMBER manuscript. Do not grant custody from the arrival owner alone.
 *
 * Lock order is arrival first, then destination. discardUnclaimedArrival()
 * locks the same arrival before deletion, serializing claim vs member discard.
 * A failed destination update aborts both changes in ONE transaction.
 *
 * This does NOT activate encrypted backup, change imported text, assert that
 * historical unreferenced vault bytes are abandoned, or transfer a pending
 * arrival's future encryption key. Those remain separate release gates.
 */
export async function claimArrival(
  arrivalId: string,
  manuscriptId: string,
  memberId: string,
): Promise<boolean> {
  const context = await prepareArrivalClaim(arrivalId, memberId);
  return transaction((tx) => claimArrivalWithClient(tx, arrivalId, manuscriptId, memberId, context));
}

/** What a claim needs that is read OUTSIDE its transaction: the arrival's encrypted-landing envelope, or null. */
export type ArrivalClaimContext = Awaited<ReturnType<typeof getEncryptedLandingForArrival>>;

/**
 * Read the claim context for an arrival. New arrivals are ciphertext-first and carry a DB-bound envelope; existing
 * pre-migration arrivals remain readable through the legacy plaintext path (context null).
 */
export async function prepareArrivalClaim(arrivalId: string, memberId: string): Promise<ArrivalClaimContext> {
  return getEncryptedLandingForArrival(arrivalId, memberId);
}

/**
 * The claim, run inside a transaction the CALLER owns.
 *
 * Exactly the checks and writes `claimArrival` has always made; the only difference is who commits. A caller that creates the
 * destination in the same transaction (the import route) gets all-or-nothing: a `false` return, or a throw, means NOTHING was
 * changed by the claim, and the caller decides to roll the whole transaction back. The destination row may be uncommitted: it is
 * visible to this client, and the foreign key and the same-member check are evaluated against it.
 *
 * `false` is returned before any write, so it is safe to treat as "refuse and roll back".
 */
export async function claimArrivalWithClient(
  tx: TransactionClient,
  arrivalId: string,
  manuscriptId: string,
  memberId: string,
  encryptedLanding: ArrivalClaimContext,
): Promise<boolean> {
  {
    const arrival = await tx.query<{
      source_kind: string;
      source_text: string;
      source_text_hash: string;
      artifact_ref: string | null;
      artifact_hash: string | null;
    }>(
      `SELECT source_kind, source_text, source_text_hash, artifact_ref, artifact_hash
         FROM manuscript_source_arrivals
        WHERE id = $1 AND member_id = $2 AND manuscript_id IS NULL
        FOR UPDATE`,
      [arrivalId, memberId],
    );
    if (arrival.rows.length !== 1) return false;

    // Independently authorize the DESTINATION inside this same transaction.
    // The foreign key on manuscript_id alone does not require same-member
    // ownership. A missing, foreign or already-deleted Work must be refused.
    const destination = await tx.query<{ id: string }>(
      `SELECT id FROM member_manuscripts
        WHERE id = $1 AND member_id = $2 FOR UPDATE`,
      [manuscriptId, memberId],
    );
    if (destination.rows.length !== 1) return false;

    const source = arrival.rows[0];
    if (hashText(source.source_text) !== source.source_text_hash) return false;
    if (source.source_kind === ARTIFACT_EXTRACTION) {
      if (!source.artifact_ref || !source.artifact_hash) return false;
      // A stored hash alone does not certify custody. The original bytes must
      // still be present and identical when this member claims the arrival.
      const bytes = encryptedLanding
        ? await recoverEncryptedLandingBytes(encryptedLanding)
        : await readVaultBytes(source.artifact_ref);
      if (hashBytes(bytes) !== source.artifact_hash) return false;
    } else if (source.source_kind === MEMBER_SUPPLIED_TEXT) {
      if (source.artifact_ref !== null || source.artifact_hash !== null) return false;
    } else {
      return false;
    }

    const claimed = await tx.query(
      `UPDATE manuscript_source_arrivals
          SET manuscript_id = $2
        WHERE id = $1 AND member_id = $3 AND manuscript_id IS NULL`,
      [arrivalId, manuscriptId, memberId],
    );
    if (claimed.rowCount !== 1) {
      throw new Error('source_claim_changed_under_lock');
    }
    const marked = await tx.query(
      `UPDATE member_manuscripts
          SET source_custody = 'source_custodied'
        WHERE id = $1 AND member_id = $2`,
      [manuscriptId, memberId],
    );
    if (marked.rowCount !== 1) {
      throw new Error('source_destination_changed_under_lock');
    }
    return true;
  }
}

/**
 * Whether a manuscript's arrival can still be recovered — bytes and all.
 *
 * This is P0's evidence, and it deliberately does NOT take the row's word for
 * it: for a file-backed arrival the bytes are read back from the vault and
 * re-hashed. A reference whose bytes have been deleted or corrupted fails,
 * which is exactly the founder's negative control:
 *
 *   "Delete/corrupt the stored artifact reference while retaining its hash.
 *    Expected: P0 FAIL. A hash without recoverable bytes must never be
 *    accepted as Source custody."
 */
export async function verifyCustody(manuscriptId: string, memberId: string): Promise<{
  custodied: boolean;
  reason: string;
}> {
  const res = await query<{
    id: string;
    source_kind: string;
    artifact_ref: string | null;
    artifact_hash: string | null;
  }>(
    `SELECT id, source_kind, artifact_ref, artifact_hash
       FROM manuscript_source_arrivals
      WHERE manuscript_id = $1 AND member_id = $2
      ORDER BY created_at ASC LIMIT 1`,
    [manuscriptId, memberId],
  );
  if (res.rows.length === 0) {
    return { custodied: false, reason: 'no_arrival_recorded' };
  }
  const row = res.rows[0];
  const shape = {
    sourceKind: row.source_kind as SourceKind,
    artifactRef: row.artifact_ref,
    artifactHash: row.artifact_hash,
  };

  if (row.source_kind === MEMBER_SUPPLIED_TEXT) {
    return { custodied: certifiesCustody(shape, false), reason: 'member_supplied_text' };
  }

  let recoverable = false;
  let reason = 'artifact_unreadable';
  try {
    const encryptedLanding = await getEncryptedLandingForArrival(row.id, memberId);
    const bytes = encryptedLanding
      ? await recoverEncryptedLandingBytes(encryptedLanding)
      : await readVaultBytes(row.artifact_ref!);
    if (hashBytes(bytes) === row.artifact_hash) {
      recoverable = true;
      reason = 'artifact_recovered';
    } else {
      reason = 'artifact_hash_mismatch';
    }
  } catch {
    reason = 'artifact_missing';
  }
  return { custodied: certifiesCustody(shape, recoverable), reason };
}
