import { randomUUID } from 'node:crypto';
import { query, transaction } from '@/lib/db/postgres';
import { readVaultBytes, writeDurableVaultBytes } from '@/lib/storage/fileVault';
import {
  ARTIFACT_EXTRACTION,
  buildArrival,
  hashBytes,
  type ExtractorKey,
  type SourceKind,
} from './custody';
import {
  decryptOriginalSource,
  encryptOriginalSource,
  materializeOriginalSourceCiphertext,
  type SourceArtifactFormat,
  type SourceEnvelopeContext,
  type SourceEnvelopeMetadata,
} from './sourceEnvelope';

const VAULT_NAMESPACE = 'manuscript-sources';
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const REF_PATTERN = /^manuscript-sources\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.source\.enc$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type LandingState =
  | 'PENDING_BYTES'
  | 'WRITING_BYTES'
  | 'BYTES_VERIFIED'
  | 'ARRIVAL_RECORDED';

export type LandingObjectStatus =
  | 'MATCHED'
  | 'ABSENT'
  | 'CORRUPT_CIPHERTEXT'
  | 'CRYPTO_REFUSED'
  | 'INVALID_OBJECT';

export interface EncryptedLandingRow {
  id: string;
  member_id: string;
  idempotency_key: string | null;
  artifact_ref: string;
  original_sha256: string;
  original_bytes: string | number;
  original_format: SourceArtifactFormat;
  state: LandingState;
  write_epoch: string | number;
  lease_token: string | null;
  lease_expires_at: Date | string | null;
  verified_at: Date | string | null;
  arrival_id: string | null;
  encryption_version: number | null;
  encryption_algorithm: string | null;
  key_provider: string | null;
  key_wrap_algorithm: string | null;
  key_id: string | null;
  cipher_iv: string | null;
  cipher_tag: string | null;
  wrapped_dek: string | null;
  wrap_iv: string | null;
  wrap_tag: string | null;
  ciphertext_sha256: string | null;
  ciphertext_bytes: string | number | null;
}

export interface LandingLease {
  intentId: string;
  memberId: string;
  epoch: number;
  token: string;
  artifactRef: string;
}

export interface PreparedEncryptedWrite {
  lease: LandingLease;
  ciphertext: Buffer;
  metadata: SourceEnvelopeMetadata;
}

export interface RecordedEncryptedArrival {
  id: string;
  sourceKind: SourceKind;
  sourceText: string;
  sourceTextHash: string;
  artifactRef: string;
  artifactHash: string;
  landingIntentId: string;
}

export class SourceLandingIncompleteError extends Error {
  readonly intentId: string | null;
  readonly code: string;

  constructor(code: string, intentId: string | null, cause?: unknown) {
    super(code, cause === undefined ? undefined : { cause });
    this.name = 'SourceLandingIncompleteError';
    this.code = code;
    this.intentId = intentId;
  }
}

function numberOf(value: string | number | null, label: string): number {
  const n = typeof value === 'string' && /^(0|[1-9][0-9]*)$/.test(value)
    ? Number(value)
    : value;
  if (!Number.isSafeInteger(n) || n === null || n < 0) {
    throw new Error(`${label}_invalid`);
  }
  return n;
}

function validateOriginal(bytes: Buffer, format: SourceArtifactFormat): void {
  if (!Buffer.isBuffer(bytes) || bytes.length <= 0 || bytes.length > MAX_FILE_BYTES) {
    throw new Error('source_landing_bytes_out_of_range');
  }
  if (!['docx', 'pdf', 'epub', 'text'].includes(format)) {
    throw new Error('source_landing_format_refused');
  }
}

function contextFromRow(row: EncryptedLandingRow): SourceEnvelopeContext {
  return {
    memberId: row.member_id,
    intentId: row.id,
    artifactRef: row.artifact_ref,
    originalSha256: row.original_sha256,
    originalBytes: numberOf(row.original_bytes, 'source_landing_original_bytes'),
    originalFormat: row.original_format,
  };
}

function metadataFromRow(row: EncryptedLandingRow): SourceEnvelopeMetadata {
  if (row.encryption_version !== 1 || row.encryption_algorithm !== 'aes-256-gcm' ||
      (row.key_provider !== 'aws-kms' && row.key_provider !== 'local-test') ||
      (row.key_wrap_algorithm !== 'aws-kms-generate-data-key-v1' &&
       row.key_wrap_algorithm !== 'aes-256-gcm-local-test') ||
      !row.key_id || !row.cipher_iv || !row.cipher_tag || !row.wrapped_dek ||
      !row.ciphertext_sha256 || row.ciphertext_bytes === null) {
    throw new Error('source_landing_envelope_incomplete');
  }
  return {
    version: 1,
    algorithm: 'aes-256-gcm',
    keyProvider: row.key_provider,
    keyWrapAlgorithm: row.key_wrap_algorithm,
    keyId: row.key_id,
    cipherIv: row.cipher_iv,
    cipherTag: row.cipher_tag,
    wrappedDek: row.wrapped_dek,
    wrapIv: row.wrap_iv,
    wrapTag: row.wrap_tag,
    ciphertextSha256: row.ciphertext_sha256,
    ciphertextBytes: numberOf(row.ciphertext_bytes, 'source_landing_ciphertext_bytes'),
  };
}

function validateIdempotencyKey(value: string | null | undefined): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (!UUID_PATTERN.test(value)) throw new Error('source_landing_idempotency_key_invalid');
  return value.toLowerCase();
}

function leaseFromRow(row: EncryptedLandingRow): LandingLease {
  if (!row.lease_token || numberOf(row.write_epoch, 'source_landing_write_epoch') <= 0) {
    throw new Error('source_landing_lease_incomplete');
  }
  return {
    intentId: row.id,
    memberId: row.member_id,
    epoch: numberOf(row.write_epoch, 'source_landing_write_epoch'),
    token: row.lease_token,
    artifactRef: row.artifact_ref,
  };
}

function errorCode(error: unknown): string | null {
  if (!error || typeof error !== 'object' || !('code' in error)) return null;
  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' ? code : null;
}

async function renewExpiredWritingLease(
  intent: EncryptedLandingRow,
): Promise<EncryptedLandingRow> {
  if (intent.state !== 'WRITING_BYTES') return intent;
  const token = randomUUID();
  const renewed = await query<EncryptedLandingRow>(
    `UPDATE writer_source_landing_intents
        SET write_epoch = write_epoch + 1,
            lease_token = $3::uuid,
            lease_expires_at = clock_timestamp() + interval '10 minutes',
            modified_at = clock_timestamp()
      WHERE id = $1::uuid AND member_id = $2::uuid
        AND state = 'WRITING_BYTES'
        AND lease_expires_at <= clock_timestamp()
      RETURNING *`,
    [intent.id, intent.member_id, token],
  );
  return renewed.rows[0] ?? reloadLanding(intent.id, intent.member_id);
}

export async function beginEncryptedLanding(input: {
  memberId: string;
  bytes: Buffer;
  format: SourceArtifactFormat;
  idempotencyKey?: string | null;
}): Promise<EncryptedLandingRow> {
  validateOriginal(input.bytes, input.format);
  const idempotencyKey = validateIdempotencyKey(input.idempotencyKey);
  const id = randomUUID();
  const artifactRef = `${VAULT_NAMESPACE}/${id}.source.enc`;
  const originalSha256 = hashBytes(input.bytes);

  return transaction(async (tx) => {
    const inserted = await tx.query<EncryptedLandingRow>(
      `INSERT INTO writer_source_landing_intents
         (id, member_id, idempotency_key, artifact_ref, original_sha256,
          original_bytes, original_format)
       VALUES ($1::uuid,$2::uuid,$3::uuid,$4,$5,$6,$7)
       ON CONFLICT (member_id, idempotency_key) DO NOTHING
       RETURNING *`,
      [id, input.memberId, idempotencyKey, artifactRef, originalSha256, input.bytes.length, input.format],
    );
    if (inserted.rows[0]) return inserted.rows[0];
    if (!idempotencyKey) throw new Error('source_landing_intent_insert_failed');

    const existing = await tx.query<EncryptedLandingRow>(
      `SELECT * FROM writer_source_landing_intents
        WHERE member_id = $1::uuid AND idempotency_key = $2::uuid
        FOR UPDATE`,
      [input.memberId, idempotencyKey],
    );
    const row = existing.rows[0];
    if (!row || row.original_sha256 !== originalSha256 ||
        numberOf(row.original_bytes, 'source_landing_original_bytes') !== input.bytes.length ||
        row.original_format !== input.format) {
      throw new Error('source_landing_idempotency_conflict');
    }
    return row;
  });
}

export async function prepareEncryptedWrite(input: {
  memberId: string;
  intentId: string;
  bytes: Buffer;
}): Promise<PreparedEncryptedWrite> {
  const found = await query<EncryptedLandingRow>(
    `SELECT * FROM writer_source_landing_intents
      WHERE id = $1::uuid AND member_id = $2::uuid`,
    [input.intentId, input.memberId],
  );
  const row = found.rows[0];
  if (!row || row.state !== 'PENDING_BYTES') {
    throw new Error('source_landing_not_pending');
  }
  validateOriginal(input.bytes, row.original_format);
  if (hashBytes(input.bytes) !== row.original_sha256 ||
      input.bytes.length !== numberOf(row.original_bytes, 'source_landing_original_bytes')) {
    throw new Error('source_landing_original_mismatch');
  }

  const envelope = await encryptOriginalSource(input.bytes, contextFromRow(row));
  const token = randomUUID();
  const updated = await query<EncryptedLandingRow>(
    `UPDATE writer_source_landing_intents
        SET state = 'WRITING_BYTES',
            write_epoch = write_epoch + 1,
            lease_token = $3::uuid,
            lease_expires_at = clock_timestamp() + interval '10 minutes',
            encryption_version = $4,
            encryption_algorithm = $5,
            key_provider = $6,
            key_wrap_algorithm = $7,
            key_id = $8,
            cipher_iv = $9,
            cipher_tag = $10,
            wrapped_dek = $11,
            wrap_iv = $12,
            wrap_tag = $13,
            ciphertext_sha256 = $14,
            ciphertext_bytes = $15,
            modified_at = clock_timestamp()
      WHERE id = $1::uuid AND member_id = $2::uuid AND state = 'PENDING_BYTES'
      RETURNING *`,
    [
      input.intentId,
      input.memberId,
      token,
      envelope.metadata.version,
      envelope.metadata.algorithm,
      envelope.metadata.keyProvider,
      envelope.metadata.keyWrapAlgorithm,
      envelope.metadata.keyId,
      envelope.metadata.cipherIv,
      envelope.metadata.cipherTag,
      envelope.metadata.wrappedDek,
      envelope.metadata.wrapIv,
      envelope.metadata.wrapTag,
      envelope.metadata.ciphertextSha256,
      envelope.metadata.ciphertextBytes,
    ],
  );
  const current = updated.rows[0];
  if (!current) throw new Error('source_landing_prepare_race');
  return {
    lease: {
      intentId: current.id,
      memberId: current.member_id,
      epoch: numberOf(current.write_epoch, 'source_landing_write_epoch'),
      token,
      artifactRef: current.artifact_ref,
    },
    ciphertext: envelope.ciphertext,
    metadata: envelope.metadata,
  };
}

export async function writePreparedCiphertext(prepared: PreparedEncryptedWrite): Promise<string> {
  const current = await query<EncryptedLandingRow>(
    `SELECT * FROM writer_source_landing_intents
      WHERE id = $1::uuid AND member_id = $2::uuid
        AND state = 'WRITING_BYTES' AND write_epoch = $3
        AND lease_token = $4::uuid AND lease_expires_at > clock_timestamp()`,
    [prepared.lease.intentId, prepared.lease.memberId, prepared.lease.epoch, prepared.lease.token],
  );
  const row = current.rows[0];
  if (!row || row.artifact_ref !== prepared.lease.artifactRef ||
      row.ciphertext_sha256 !== prepared.metadata.ciphertextSha256 ||
      numberOf(row.ciphertext_bytes, 'source_landing_ciphertext_bytes') !== prepared.ciphertext.length ||
      row.key_id !== prepared.metadata.keyId) {
    throw new Error('source_landing_writer_fenced');
  }
  const match = REF_PATTERN.exec(row.artifact_ref);
  if (!match) throw new Error('source_landing_ref_invalid');
  const written = await writeDurableVaultBytes(
    VAULT_NAMESPACE,
    match[1],
    'source.enc',
    prepared.ciphertext,
  );
  if (written !== row.artifact_ref) throw new Error('source_landing_written_ref_mismatch');
  return written;
}

export async function recoverEncryptedLandingBytes(row: EncryptedLandingRow): Promise<Buffer> {
  const ciphertext = await readVaultBytes(row.artifact_ref);
  return decryptOriginalSource(ciphertext, metadataFromRow(row), contextFromRow(row));
}

export async function inspectEncryptedStoredObject(
  row: EncryptedLandingRow,
): Promise<LandingObjectStatus> {
  try {
    const ciphertext = await readVaultBytes(row.artifact_ref);
    const metadata = metadataFromRow(row);
    if (ciphertext.length !== metadata.ciphertextBytes ||
        hashBytes(ciphertext) !== metadata.ciphertextSha256) {
      return 'CORRUPT_CIPHERTEXT';
    }
    try {
      await decryptOriginalSource(ciphertext, metadata, contextFromRow(row));
      return 'MATCHED';
    } catch {
      return 'CRYPTO_REFUSED';
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') return 'ABSENT';
    return 'INVALID_OBJECT';
  }
}

export async function markEncryptedBytesVerified(
  lease: LandingLease,
): Promise<{ accepted: boolean; reason: string }> {
  const found = await query<EncryptedLandingRow>(
    `SELECT * FROM writer_source_landing_intents
      WHERE id = $1::uuid AND member_id = $2::uuid`,
    [lease.intentId, lease.memberId],
  );
  const row = found.rows[0];
  if (!row || row.state !== 'WRITING_BYTES' ||
      numberOf(row.write_epoch, 'source_landing_write_epoch') !== lease.epoch ||
      row.lease_token !== lease.token) {
    return { accepted: false, reason: 'fenced' };
  }
  const status = await inspectEncryptedStoredObject(row);
  if (status !== 'MATCHED') return { accepted: false, reason: status };

  const advanced = await query(
    `UPDATE writer_source_landing_intents
        SET state = 'BYTES_VERIFIED', verified_at = clock_timestamp(),
            modified_at = clock_timestamp()
      WHERE id = $1::uuid AND member_id = $2::uuid
        AND state = 'WRITING_BYTES' AND write_epoch = $3
        AND lease_token = $4::uuid AND lease_expires_at > clock_timestamp()
      RETURNING id`,
    [lease.intentId, lease.memberId, lease.epoch, lease.token],
  );
  return {
    accepted: advanced.rowCount === 1,
    reason: advanced.rowCount === 1 ? 'BYTES_VERIFIED' : 'fenced',
  };
}

export async function commitEncryptedArrival(input: {
  lease: LandingLease;
  originalFilename: string;
  mimeType: string | null;
  sourceText: string;
  extractor: ExtractorKey;
}): Promise<RecordedEncryptedArrival> {
  if (!input.originalFilename || typeof input.sourceText !== 'string' ||
      input.sourceText.length === 0 || input.sourceText.length > 2_000_000) {
    throw new Error('source_landing_arrival_input_refused');
  }
  const found = await query<EncryptedLandingRow>(
    `SELECT * FROM writer_source_landing_intents
      WHERE id = $1::uuid AND member_id = $2::uuid`,
    [input.lease.intentId, input.lease.memberId],
  );
  const row = found.rows[0];
  if (!row || row.state !== 'BYTES_VERIFIED' || row.lease_token !== input.lease.token ||
      numberOf(row.write_epoch, 'source_landing_write_epoch') !== input.lease.epoch) {
    throw new Error('source_landing_not_verified');
  }
  if (await inspectEncryptedStoredObject(row) !== 'MATCHED') {
    throw new Error('source_landing_artifact_changed');
  }

  return transaction(async (tx) => {
    const locked = await tx.query<EncryptedLandingRow>(
      `SELECT * FROM writer_source_landing_intents
        WHERE id = $1::uuid AND member_id = $2::uuid
        FOR UPDATE`,
      [input.lease.intentId, input.lease.memberId],
    );
    const current = locked.rows[0];
    if (!current || current.state !== 'BYTES_VERIFIED' ||
        current.lease_token !== input.lease.token ||
        numberOf(current.write_epoch, 'source_landing_write_epoch') !== input.lease.epoch) {
      throw new Error('source_landing_commit_fenced');
    }

    const record = buildArrival({
      kind: ARTIFACT_EXTRACTION,
      artifactRef: current.artifact_ref,
      artifactHash: current.original_sha256,
      artifactSize: numberOf(current.original_bytes, 'source_landing_original_bytes'),
      originalFilename: input.originalFilename,
      mimeType: input.mimeType,
      sourceText: input.sourceText,
      extractor: input.extractor,
    });
    const inserted = await tx.query<{ id: string }>(
      `INSERT INTO manuscript_source_arrivals
         (member_id, source_kind, artifact_ref, artifact_hash, artifact_size,
          original_filename, mime_type, source_text, source_text_hash,
          extraction_method, extractor_version)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id`,
      [
        input.lease.memberId,
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
    const arrivalId = inserted.rows[0]?.id;
    if (!arrivalId) throw new Error('source_landing_arrival_missing');

    const advanced = await tx.query(
      `UPDATE writer_source_landing_intents
          SET state = 'ARRIVAL_RECORDED', arrival_id = $5::uuid,
              modified_at = clock_timestamp()
        WHERE id = $1::uuid AND member_id = $2::uuid
          AND state = 'BYTES_VERIFIED' AND write_epoch = $3
          AND lease_token = $4::uuid
        RETURNING id`,
      [
        input.lease.intentId,
        input.lease.memberId,
        input.lease.epoch,
        input.lease.token,
        arrivalId,
      ],
    );
    if (advanced.rowCount !== 1) throw new Error('source_landing_arrival_not_bound');

    return {
      id: arrivalId,
      sourceKind: record.sourceKind,
      sourceText: record.sourceText,
      sourceTextHash: record.sourceTextHash,
      artifactRef: current.artifact_ref,
      artifactHash: current.original_sha256,
      landingIntentId: current.id,
    };
  });
}

async function loadRecordedArrival(
  intent: EncryptedLandingRow,
): Promise<RecordedEncryptedArrival> {
  if (intent.state !== 'ARRIVAL_RECORDED' || !intent.arrival_id) {
    throw new Error('source_landing_arrival_not_recorded');
  }
  const existing = await query<{
    id: string;
    source_kind: SourceKind;
    source_text: string;
    source_text_hash: string;
    artifact_ref: string;
    artifact_hash: string;
  }>(
    `SELECT id, source_kind, source_text, source_text_hash, artifact_ref, artifact_hash
       FROM manuscript_source_arrivals
      WHERE id = $1::uuid AND member_id = $2::uuid`,
    [intent.arrival_id, intent.member_id],
  );
  const row = existing.rows[0];
  if (!row) throw new Error('source_landing_idempotent_arrival_missing');
  return {
    id: row.id,
    sourceKind: row.source_kind,
    sourceText: row.source_text,
    sourceTextHash: row.source_text_hash,
    artifactRef: row.artifact_ref,
    artifactHash: row.artifact_hash,
    landingIntentId: intent.id,
  };
}

async function reloadLanding(intentId: string, memberId: string): Promise<EncryptedLandingRow> {
  const found = await query<EncryptedLandingRow>(
    `SELECT * FROM writer_source_landing_intents
      WHERE id = $1::uuid AND member_id = $2::uuid`,
    [intentId, memberId],
  );
  const row = found.rows[0];
  if (!row) throw new Error('source_landing_intent_missing');
  return row;
}

async function resumeWritingLanding(
  intent: EncryptedLandingRow,
  bytes: Buffer,
): Promise<LandingLease> {
  const lease = leaseFromRow(intent);
  const metadata = metadataFromRow(intent);
  const ciphertext = await materializeOriginalSourceCiphertext(
    bytes,
    metadata,
    contextFromRow(intent),
  );
  const prepared: PreparedEncryptedWrite = { lease, metadata, ciphertext };
  try {
    await writePreparedCiphertext(prepared);
  } catch (error) {
    // A prior attempt may have completed the exclusive durable publication and
    // crashed before the state advance. Reuse only an exactly authenticated
    // ciphertext; never overwrite or treat EEXIST alone as success.
    if (errorCode(error) !== 'EEXIST' ||
        await inspectEncryptedStoredObject(intent) !== 'MATCHED') {
      throw error;
    }
  }
  return lease;
}

export async function recordEncryptedArtifactArrival(input: {
  memberId: string;
  bytes: Buffer;
  originalFilename: string;
  mimeType: string | null;
  sourceText: string;
  extractor: ExtractorKey;
  format: SourceArtifactFormat;
  idempotencyKey?: string | null;
}): Promise<RecordedEncryptedArrival> {
  let intentId: string | null = null;
  try {
    let intent = await beginEncryptedLanding({
      memberId: input.memberId,
      bytes: input.bytes,
      format: input.format,
      idempotencyKey: input.idempotencyKey,
    });
    intentId = intent.id;
    if (intent.state === 'ARRIVAL_RECORDED') return loadRecordedArrival(intent);
    if (intent.state === 'WRITING_BYTES') {
      intent = await renewExpiredWritingLease(intent);
      if (intent.state === 'ARRIVAL_RECORDED') return loadRecordedArrival(intent);
    }

    let lease: LandingLease;
    if (intent.state === 'PENDING_BYTES') {
      const prepared = await prepareEncryptedWrite({
        memberId: input.memberId,
        intentId: intent.id,
        bytes: input.bytes,
      });
      await writePreparedCiphertext(prepared);
      lease = prepared.lease;
    } else if (intent.state === 'WRITING_BYTES') {
      lease = await resumeWritingLanding(intent, input.bytes);
    } else if (intent.state === 'BYTES_VERIFIED') {
      lease = leaseFromRow(intent);
    } else {
      throw new Error('source_landing_state_refused');
    }

    intent = await reloadLanding(intent.id, input.memberId);
    if (intent.state === 'WRITING_BYTES') {
      const verified = await markEncryptedBytesVerified(lease);
      if (!verified.accepted) {
        intent = await reloadLanding(intent.id, input.memberId);
        if (intent.state === 'ARRIVAL_RECORDED') return loadRecordedArrival(intent);
        if (intent.state !== 'BYTES_VERIFIED') {
          throw new Error('source_landing_verification_refused');
        }
      } else {
        intent = await reloadLanding(intent.id, input.memberId);
      }
    }
    if (intent.state === 'ARRIVAL_RECORDED') return loadRecordedArrival(intent);
    if (intent.state !== 'BYTES_VERIFIED') {
      throw new Error('source_landing_not_ready_for_arrival');
    }

    try {
      return await commitEncryptedArrival({
        lease: leaseFromRow(intent),
        originalFilename: input.originalFilename,
        mimeType: input.mimeType,
        sourceText: input.sourceText,
        extractor: input.extractor,
      });
    } catch (error) {
      // A concurrent retry may have committed the same member-bound arrival.
      // Return it only after re-reading the intent's authoritative state.
      const final = await reloadLanding(intent.id, input.memberId);
      if (final.state === 'ARRIVAL_RECORDED') return loadRecordedArrival(final);
      throw error;
    }
  } catch (error) {
    throw new SourceLandingIncompleteError('source_landing_incomplete', intentId, error);
  }
}

export async function getEncryptedLandingForArrival(
  arrivalId: string,
  memberId: string,
): Promise<EncryptedLandingRow | null> {
  const result = await query<EncryptedLandingRow>(
    `SELECT * FROM writer_source_landing_intents
      WHERE arrival_id = $1::uuid AND member_id = $2::uuid
        AND state = 'ARRIVAL_RECORDED'`,
    [arrivalId, memberId],
  );
  return result.rows[0] ?? null;
}

export async function inspectMemberIncompleteLandings(memberId: string): Promise<Array<{
  id: string;
  state: LandingState;
  objectStatus: LandingObjectStatus | 'NOT_WRITTEN';
}>> {
  const rows = await query<EncryptedLandingRow>(
    `SELECT * FROM writer_source_landing_intents
      WHERE member_id = $1::uuid AND state <> 'ARRIVAL_RECORDED'
      ORDER BY created_at, id`,
    [memberId],
  );
  const result: Array<{
    id: string;
    state: LandingState;
    objectStatus: LandingObjectStatus | 'NOT_WRITTEN';
  }> = [];
  for (const row of rows.rows) {
    result.push({
      id: row.id,
      state: row.state,
      objectStatus: row.state === 'PENDING_BYTES'
        ? 'NOT_WRITTEN'
        : await inspectEncryptedStoredObject(row),
    });
  }
  return result;
}
