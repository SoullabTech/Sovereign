import { createHash, randomUUID } from "node:crypto";
import { query, transaction } from "@/lib/db/postgres";
import {
  r20LedgerErrorCode,
  sealR20DeletionLedger,
} from "@/lib/recovery/r20DeletionLedger";
import { destroyVaultBytes, readVaultBytes } from "@/lib/storage/fileVault";
import {
  recordEncryptedLegacyReplacementArrival,
  type EncryptedLandingRow,
} from "./encryptedLanding";
import { EXTRACTORS, hashBytes, hashText, type ExtractorKey } from "./custody";

const ENCRYPTED_REF = /^manuscript-sources\/[0-9a-f-]{36}[.]source[.]enc$/;
const HEX64 = /^[0-9a-f]{64}$/;
type ArtifactExtractorKey = Exclude<ExtractorKey, "supplied">;

export type LegacyRetirementState = "ERASURE_OWED" | "RETIRED";

export interface LegacySourceRetirement {
  id: string;
  legacy_arrival_id: string;
  replacement_arrival_id: string;
  replacement_landing_id: string;
  member_id: string;
  manuscript_id: string | null;
  legacy_artifact_ref_sha256: string;
  replacement_artifact_ref_sha256: string;
  original_sha256: string;
  original_bytes: string | number;
  ciphertext_sha256: string;
  ciphertext_bytes: string | number;
  migration_manifest_sha256: string;
  state: LegacyRetirementState;
  retired_at: Date | string | null;
}

interface LegacyArrival {
  id: string;
  member_id: string;
  manuscript_id: string | null;
  source_kind: string;
  artifact_ref: string | null;
  artifact_hash: string | null;
  artifact_size: string | number | null;
  original_filename: string | null;
  mime_type: string | null;
  source_text: string;
  source_text_hash: string;
  extraction_method: string;
  extractor_version: string;
}

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function stableJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`)
    .join(",")}}`;
}

function numberOf(value: string | number | null, label: string): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^(0|[1-9][0-9]*)$/.test(value)
        ? Number(value)
        : Number.NaN;
  if (!Number.isSafeInteger(parsed) || parsed <= 0)
    throw new Error(`${label}_invalid`);
  return parsed;
}

function extractorFor(row: LegacyArrival): ArtifactExtractorKey {
  for (const key of ["docx", "pdf", "epub", "text"] as const) {
    if (EXTRACTORS[key].method === row.extraction_method) return key;
  }
  const filename = row.original_filename?.toLowerCase() ?? "";
  if (filename.endsWith(".docx")) return "docx";
  if (filename.endsWith(".pdf")) return "pdf";
  if (filename.endsWith(".epub")) return "epub";
  if (/\.(txt|md|markdown)$/.test(filename)) return "text";
  throw new Error("legacy_source_extractor_unrecognized");
}

function migrationStatement(input: {
  legacy: LegacyArrival;
  replacementArrivalId: string;
  landing: EncryptedLandingRow;
}): Record<string, unknown> {
  return {
    protocol: "soullab.writer.source-legacy-retirement.v1",
    legacyArrivalId: input.legacy.id,
    replacementArrivalId: input.replacementArrivalId,
    replacementLandingId: input.landing.id,
    memberId: input.legacy.member_id,
    manuscriptId: input.legacy.manuscript_id,
    legacyArtifactRefSha256: sha256(input.legacy.artifact_ref!),
    replacementArtifactRefSha256: sha256(input.landing.artifact_ref),
    originalSha256: input.landing.original_sha256,
    originalBytes: numberOf(
      input.landing.original_bytes,
      "legacy_source_original_bytes",
    ),
    ciphertextSha256: input.landing.ciphertext_sha256,
    ciphertextBytes: numberOf(
      input.landing.ciphertext_bytes,
      "legacy_source_ciphertext_bytes",
    ),
  };
}

async function loadRetirement(
  legacyArrivalId: string,
  memberId: string,
): Promise<LegacySourceRetirement | null> {
  const result = await query<LegacySourceRetirement>(
    `SELECT * FROM writer_source_legacy_retirements
      WHERE legacy_arrival_id=$1::uuid AND member_id=$2::uuid`,
    [legacyArrivalId, memberId],
  );
  return result.rows[0] ?? null;
}

async function finishPhysicalRetirement(
  retirement: LegacySourceRetirement,
): Promise<LegacySourceRetirement> {
  if (retirement.state === "RETIRED") return retirement;
  const queued = await query<{ id: string; artifact_ref: string }>(
    `SELECT id, artifact_ref FROM vault_erasure_queue ORDER BY queued_at, id`,
  );
  const owed = queued.rows.find(
    (row) => sha256(row.artifact_ref) === retirement.legacy_artifact_ref_sha256,
  );
  if (!owed) throw new Error("legacy_source_retirement_queue_missing");

  try {
    const sealed = await sealR20DeletionLedger();
    if (!sealed.sealed) throw new Error("R20_LEDGER_NOT_SEALED");
  } catch (error) {
    throw new Error(
      `legacy_source_retirement_recovery_seal_${r20LedgerErrorCode(error)}`,
      { cause: error },
    );
  }

  await destroyVaultBytes(owed.artifact_ref);
  const completed = await transaction(async (tx) => {
    const removed = await tx.query(
      `DELETE FROM vault_erasure_queue WHERE id=$1::uuid AND artifact_ref=$2`,
      [owed.id, owed.artifact_ref],
    );
    if (removed.rowCount !== 1)
      throw new Error("legacy_source_retirement_queue_changed");
    const updated = await tx.query<LegacySourceRetirement>(
      `UPDATE writer_source_legacy_retirements
          SET state='RETIRED', retired_at=clock_timestamp()
        WHERE id=$1::uuid AND state='ERASURE_OWED'
        RETURNING *`,
      [retirement.id],
    );
    if (!updated.rows[0])
      throw new Error("legacy_source_retirement_state_changed");
    return updated.rows[0];
  });
  return completed;
}

/**
 * Replace one pre-encryption plaintext Source arrival with a ciphertext-first
 * arrival without re-parsing or rewriting the author's extracted Source text.
 *
 * A crash before the relational swap leaves an unclaimed encrypted replacement
 * that the same arrival-id idempotency key resumes. A crash after the swap leaves
 * one path-bearing erasure obligation and a content-free retirement row.
 */
export async function retireLegacyPlaintextSource(input: {
  legacyArrivalId: string;
  memberId: string;
}): Promise<LegacySourceRetirement> {
  const existing = await loadRetirement(input.legacyArrivalId, input.memberId);
  if (existing) return finishPhysicalRetirement(existing);

  const loaded = await query<LegacyArrival>(
    `SELECT id,member_id,manuscript_id,source_kind,artifact_ref,artifact_hash,
            artifact_size,original_filename,mime_type,source_text,source_text_hash,
            extraction_method,extractor_version
       FROM manuscript_source_arrivals
      WHERE id=$1::uuid AND member_id=$2::uuid`,
    [input.legacyArrivalId, input.memberId],
  );
  const legacy = loaded.rows[0];
  if (
    !legacy ||
    legacy.source_kind !== "artifact_extraction" ||
    !legacy.artifact_ref ||
    !legacy.artifact_hash ||
    legacy.artifact_size === null ||
    !legacy.original_filename
  ) {
    throw new Error("legacy_source_arrival_not_eligible");
  }
  if (ENCRYPTED_REF.test(legacy.artifact_ref)) {
    throw new Error("legacy_source_arrival_already_encrypted_or_ambiguous");
  }
  if (
    !HEX64.test(legacy.artifact_hash) ||
    hashText(legacy.source_text) !== legacy.source_text_hash
  ) {
    throw new Error("legacy_source_arrival_integrity_refused");
  }

  const original = await readVaultBytes(legacy.artifact_ref);
  const originalBytes = numberOf(
    legacy.artifact_size,
    "legacy_source_artifact_size",
  );
  if (
    original.length !== originalBytes ||
    hashBytes(original) !== legacy.artifact_hash
  ) {
    throw new Error("legacy_source_bytes_mismatch");
  }
  const extractor = extractorFor(legacy);
  const replacement = await recordEncryptedLegacyReplacementArrival({
    memberId: legacy.member_id,
    bytes: original,
    originalFilename: legacy.original_filename,
    mimeType: legacy.mime_type,
    sourceText: legacy.source_text,
    sourceTextHash: legacy.source_text_hash,
    extractionMethod: legacy.extraction_method,
    extractorVersion: legacy.extractor_version,
    extractor,
    format: extractor,
    idempotencyKey: legacy.id,
  });

  const retirement = await transaction(async (tx) => {
    const concurrent = await tx.query<LegacySourceRetirement>(
      `SELECT * FROM writer_source_legacy_retirements
        WHERE legacy_arrival_id=$1::uuid AND member_id=$2::uuid FOR UPDATE`,
      [legacy.id, legacy.member_id],
    );
    if (concurrent.rows[0]) return concurrent.rows[0];

    const old = await tx.query<LegacyArrival>(
      `SELECT id,member_id,manuscript_id,source_kind,artifact_ref,artifact_hash,
              artifact_size,original_filename,mime_type,source_text,source_text_hash,
              extraction_method,extractor_version
         FROM manuscript_source_arrivals
        WHERE id=$1::uuid AND member_id=$2::uuid FOR UPDATE`,
      [legacy.id, legacy.member_id],
    );
    const currentLegacy = old.rows[0];
    if (
      !currentLegacy ||
      currentLegacy.artifact_ref !== legacy.artifact_ref ||
      currentLegacy.artifact_hash !== legacy.artifact_hash ||
      currentLegacy.manuscript_id !== legacy.manuscript_id
    ) {
      throw new Error("legacy_source_arrival_changed_under_migration");
    }

    const shared = await tx.query<{ n: string }>(
      `SELECT count(*)::text AS n FROM manuscript_source_arrivals
        WHERE artifact_ref=$1 AND id<>$2::uuid`,
      [legacy.artifact_ref, legacy.id],
    );
    if (shared.rows[0]?.n !== "0")
      throw new Error("legacy_source_artifact_shared");

    const replacementRow = await tx.query<LegacyArrival>(
      `SELECT id,member_id,manuscript_id,source_kind,artifact_ref,artifact_hash,
              artifact_size,original_filename,mime_type,source_text,source_text_hash,
              extraction_method,extractor_version
         FROM manuscript_source_arrivals
        WHERE id=$1::uuid AND member_id=$2::uuid FOR UPDATE`,
      [replacement.id, legacy.member_id],
    );
    const next = replacementRow.rows[0];
    if (
      !next ||
      next.manuscript_id !== null ||
      next.artifact_hash !== legacy.artifact_hash ||
      next.source_text_hash !== legacy.source_text_hash ||
      next.extraction_method !== legacy.extraction_method ||
      next.extractor_version !== legacy.extractor_version
    ) {
      throw new Error("legacy_source_replacement_mismatch");
    }

    const landingRows = await tx.query<EncryptedLandingRow>(
      `SELECT * FROM writer_source_landing_intents
        WHERE arrival_id=$1::uuid AND member_id=$2::uuid
          AND state='ARRIVAL_RECORDED' FOR UPDATE`,
      [replacement.id, legacy.member_id],
    );
    const landing = landingRows.rows[0];
    if (
      !landing ||
      landing.artifact_ref !== next.artifact_ref ||
      landing.original_sha256 !== legacy.artifact_hash ||
      numberOf(landing.original_bytes, "legacy_source_original_bytes") !==
        originalBytes ||
      !landing.ciphertext_sha256 ||
      landing.ciphertext_bytes === null
    ) {
      throw new Error("legacy_source_replacement_landing_mismatch");
    }

    if (legacy.manuscript_id) {
      const owner = await tx.query(
        `SELECT id FROM member_manuscripts
          WHERE id=$1::uuid AND member_id=$2::uuid FOR UPDATE`,
        [legacy.manuscript_id, legacy.member_id],
      );
      if (owner.rowCount !== 1)
        throw new Error("legacy_source_destination_missing");
      const claimed = await tx.query(
        `UPDATE manuscript_source_arrivals SET manuscript_id=$2::uuid
          WHERE id=$1::uuid AND member_id=$3::uuid AND manuscript_id IS NULL`,
        [replacement.id, legacy.manuscript_id, legacy.member_id],
      );
      if (claimed.rowCount !== 1)
        throw new Error("legacy_source_replacement_claim_failed");
      await tx.query(
        `UPDATE member_manuscripts SET source_custody='source_custodied'
          WHERE id=$1::uuid AND member_id=$2::uuid`,
        [legacy.manuscript_id, legacy.member_id],
      );
    }

    const manifest = await tx.query<{ id: string }>(
      `INSERT INTO deletion_manifests
         (reason_class,authorized_by,executed_at,note)
       VALUES ('governance','writer-source-legacy-retirement',now(),
               'Pre-encryption Source arrival replaced by authenticated ciphertext')
       RETURNING id`,
    );
    await tx.query(
      `INSERT INTO provenance_tombstones(manifest_id,object_kind,object_id)
       VALUES ($1::uuid,'manuscript_source_arrivals',$2)
       ON CONFLICT (object_kind,object_id) DO NOTHING`,
      [manifest.rows[0]!.id, legacy.id],
    );

    const removed = await tx.query(
      `DELETE FROM manuscript_source_arrivals
        WHERE id=$1::uuid AND member_id=$2::uuid AND artifact_ref=$3`,
      [legacy.id, legacy.member_id, legacy.artifact_ref],
    );
    if (removed.rowCount !== 1)
      throw new Error("legacy_source_arrival_delete_failed");

    await tx.query(
      `INSERT INTO vault_erasure_queue(artifact_ref) VALUES ($1)`,
      [legacy.artifact_ref],
    );
    const statement = migrationStatement({
      legacy,
      replacementArrivalId: replacement.id,
      landing,
    });
    const inserted = await tx.query<LegacySourceRetirement>(
      `INSERT INTO writer_source_legacy_retirements
         (id,legacy_arrival_id,replacement_arrival_id,replacement_landing_id,
          member_id,manuscript_id,legacy_artifact_ref_sha256,
          replacement_artifact_ref_sha256,original_sha256,original_bytes,
          ciphertext_sha256,ciphertext_bytes,migration_manifest_sha256,state)
       VALUES ($1::uuid,$2::uuid,$3::uuid,$4::uuid,$5::uuid,$6::uuid,
               $7,$8,$9,$10,$11,$12,$13,'ERASURE_OWED')
       RETURNING *`,
      [
        randomUUID(),
        legacy.id,
        replacement.id,
        landing.id,
        legacy.member_id,
        legacy.manuscript_id,
        statement.legacyArtifactRefSha256,
        statement.replacementArtifactRefSha256,
        statement.originalSha256,
        statement.originalBytes,
        statement.ciphertextSha256,
        statement.ciphertextBytes,
        sha256(stableJson(statement)),
      ],
    );
    return inserted.rows[0]!;
  });

  return finishPhysicalRetirement(retirement);
}
