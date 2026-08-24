import { query } from '@/lib/db/postgres';
import { readVaultBytes, writeVaultBytes } from '@/lib/storage/fileVault';
import {
  ARTIFACT_EXTRACTION,
  artifactExt,
  buildArrival,
  certifiesCustody,
  hashBytes,
  MEMBER_SUPPLIED_TEXT,
  type ArrivalInput,
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
 * Bytes are written to the vault BEFORE the row is inserted. The failure that
 * ordering prevents is the one the founder's negative control names: a row
 * asserting custody over bytes that were never durably written. The reverse
 * leak — bytes with no row — is a harmless orphan a sweep can collect, and is
 * strictly preferable to a false claim of custody.
 */

const VAULT_NAMESPACE = 'manuscript-sources';

export interface StoredArrival {
  id: string;
  sourceKind: SourceKind;
  sourceText: string;
  sourceTextHash: string;
  artifactRef: string | null;
  artifactHash: string | null;
}

/** Persist a file-backed arrival: bytes to the vault, then the governing row. */
export async function recordArtifactArrival(params: {
  memberId: string;
  bytes: Buffer;
  originalFilename: string;
  mimeType: string | null;
  sourceText: string;
  extractor: ExtractorKey;
}): Promise<StoredArrival> {
  const artifactHash = hashBytes(params.bytes);
  const fileId = `${Date.now().toString(36)}-${artifactHash.slice(0, 16)}`;
  const artifactRef = await writeVaultBytes(
    VAULT_NAMESPACE,
    fileId,
    artifactExt(params.originalFilename),
    params.bytes,
  );

  const record = buildArrival({
    kind: ARTIFACT_EXTRACTION,
    artifactRef,
    artifactHash,
    artifactSize: params.bytes.byteLength,
    originalFilename: params.originalFilename,
    mimeType: params.mimeType,
    sourceText: params.sourceText,
    extractor: params.extractor,
  } satisfies ArrivalInput);

  return insertArrival(params.memberId, record);
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

async function insertArrival(
  memberId: string,
  record: ReturnType<typeof buildArrival>,
): Promise<StoredArrival> {
  const res = await query<{ id: string }>(
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
 * Attach an unclaimed arrival to the manuscript the member just confirmed, and
 * mark that manuscript as carrying real source custody.
 *
 * Member-scoped and single-claim by the same predicate: an arrival belonging to
 * someone else, or already claimed by another manuscript, matches zero rows.
 */
export async function claimArrival(
  arrivalId: string,
  manuscriptId: string,
  memberId: string,
): Promise<boolean> {
  const res = await query(
    `UPDATE manuscript_source_arrivals
        SET manuscript_id = $2
      WHERE id = $1 AND member_id = $3 AND manuscript_id IS NULL`,
    [arrivalId, manuscriptId, memberId],
  );
  if ((res.rowCount ?? 0) === 0) return false;
  await query(
    `UPDATE member_manuscripts SET source_custody = 'source_custodied'
      WHERE id = $1 AND member_id = $2`,
    [manuscriptId, memberId],
  );
  return true;
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
    source_kind: string;
    artifact_ref: string | null;
    artifact_hash: string | null;
  }>(
    `SELECT source_kind, artifact_ref, artifact_hash
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
    const bytes = await readVaultBytes(row.artifact_ref!);
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
