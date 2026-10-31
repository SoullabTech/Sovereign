import {
  createHash,
  createPrivateKey,
  createPublicKey,
  sign,
  verify,
  type KeyObject,
} from "node:crypto";
import { query } from "@/lib/db/postgres";
import {
  inspectEncryptedStoredObject,
  type EncryptedLandingRow,
} from "@/lib/manuscript/source/encryptedLanding";

const MANIFEST_PROTOCOL = "soullab.writer.source-recovery-manifest.v1" as const;
const AUTHORITY_PROTOCOL =
  "soullab.writer.source-recovery-authority.v1" as const;
const ZERO_SHA = "0".repeat(64);
const HEX40 = /^[0-9a-f]{40}$/;
const HEX64 = /^[0-9a-f]{64}$/;
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ENCRYPTED_REF = /^manuscript-sources\/[0-9a-f-]{36}[.]source[.]enc$/;

export interface WriterSourceRecoveryObject {
  storageClass: "writer-source-encrypted-v1";
  memberId: string;
  manuscriptId: string | null;
  arrivalId: string;
  landingIntentId: string;
  artifactRef: string;
  originalSha256: string;
  originalBytes: number;
  ciphertextSha256: string;
  ciphertextBytes: number;
  keyId: string;
}

export interface WriterSourceRecoveryManifest {
  protocol: typeof MANIFEST_PROTOCOL;
  sourceCommit: string;
  sourceTree: string;
  databaseGenerationSha256: string;
  vaultGenerationSha256: string;
  createdAt: string;
  objects: WriterSourceRecoveryObject[];
}

export interface WriterSourceRecoveryAuthorityRecord {
  protocol: typeof AUTHORITY_PROTOCOL;
  generation: number;
  previousRecordSha256: string;
  sourceCommit: string;
  sourceTree: string;
  admittedManifestSha256: string;
  retiredManifestSha256: string[];
  requestNonceSha256: string;
  issuedAt: string;
}

export interface WriterSourceRecoveryAuthorityEnvelope {
  record: WriterSourceRecoveryAuthorityRecord;
  signature: {
    algorithm: "ed25519";
    publicKeySha256: string;
    valueBase64: string;
  };
}

export class WriterSourceRecoveryError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(code);
    this.name = "WriterSourceRecoveryError";
    this.code = code;
  }
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

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function exactKeys(
  value: unknown,
  keys: string[],
  code: string,
): asserts value is Record<string, unknown> {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    throw new WriterSourceRecoveryError(code);
  }
  const actual = Object.keys(value as Record<string, unknown>).sort();
  const expected = [...keys].sort();
  if (
    actual.length !== expected.length ||
    actual.some((key, index) => key !== expected[index])
  ) {
    throw new WriterSourceRecoveryError(code);
  }
}

function iso(value: unknown, code: string): string {
  if (typeof value !== "string") throw new WriterSourceRecoveryError(code);
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString() !== value) {
    throw new WriterSourceRecoveryError(code);
  }
  return value;
}

function positiveInteger(value: unknown, code: string): number {
  if (!Number.isSafeInteger(value) || Number(value) <= 0) {
    throw new WriterSourceRecoveryError(code);
  }
  return Number(value);
}

function publicKeyFingerprint(publicKey: KeyObject): string {
  return sha256(publicKey.export({ format: "der", type: "spki" }));
}

function decodeSignature(value: unknown): Buffer {
  if (typeof value !== "string" || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) {
    throw new WriterSourceRecoveryError(
      "WRITER_SOURCE_RECOVERY_SIGNATURE_INVALID",
    );
  }
  const decoded = Buffer.from(value, "base64");
  if (decoded.length !== 64 || decoded.toString("base64") !== value) {
    throw new WriterSourceRecoveryError(
      "WRITER_SOURCE_RECOVERY_SIGNATURE_INVALID",
    );
  }
  return decoded;
}

export function writerSourceRecoveryManifestSha256(
  manifest: WriterSourceRecoveryManifest,
): string {
  validateManifest(manifest);
  return sha256(stableJson(manifest));
}

function validateObject(value: unknown): WriterSourceRecoveryObject {
  exactKeys(
    value,
    [
      "storageClass",
      "memberId",
      "manuscriptId",
      "arrivalId",
      "landingIntentId",
      "artifactRef",
      "originalSha256",
      "originalBytes",
      "ciphertextSha256",
      "ciphertextBytes",
      "keyId",
    ],
    "WRITER_SOURCE_RECOVERY_OBJECT_SHAPE_INVALID",
  );
  const row = value as unknown as WriterSourceRecoveryObject;
  if (
    row.storageClass !== "writer-source-encrypted-v1" ||
    !UUID.test(row.memberId) ||
    (row.manuscriptId !== null && !UUID.test(row.manuscriptId)) ||
    !UUID.test(row.arrivalId) ||
    !UUID.test(row.landingIntentId) ||
    !ENCRYPTED_REF.test(row.artifactRef) ||
    !HEX64.test(row.originalSha256) ||
    !HEX64.test(row.ciphertextSha256) ||
    typeof row.keyId !== "string" ||
    row.keyId.length === 0 ||
    row.keyId.length > 2048
  ) {
    throw new WriterSourceRecoveryError(
      "WRITER_SOURCE_RECOVERY_OBJECT_INVALID",
    );
  }
  positiveInteger(
    row.originalBytes,
    "WRITER_SOURCE_RECOVERY_ORIGINAL_BYTES_INVALID",
  );
  positiveInteger(
    row.ciphertextBytes,
    "WRITER_SOURCE_RECOVERY_CIPHERTEXT_BYTES_INVALID",
  );
  return row;
}

export function validateManifest(value: unknown): WriterSourceRecoveryManifest {
  exactKeys(
    value,
    [
      "protocol",
      "sourceCommit",
      "sourceTree",
      "databaseGenerationSha256",
      "vaultGenerationSha256",
      "createdAt",
      "objects",
    ],
    "WRITER_SOURCE_RECOVERY_MANIFEST_SHAPE_INVALID",
  );
  const manifest = value as unknown as WriterSourceRecoveryManifest;
  if (
    manifest.protocol !== MANIFEST_PROTOCOL ||
    !HEX40.test(manifest.sourceCommit) ||
    !HEX40.test(manifest.sourceTree) ||
    !HEX64.test(manifest.databaseGenerationSha256) ||
    !HEX64.test(manifest.vaultGenerationSha256) ||
    !Array.isArray(manifest.objects)
  ) {
    throw new WriterSourceRecoveryError(
      "WRITER_SOURCE_RECOVERY_MANIFEST_INVALID",
    );
  }
  iso(manifest.createdAt, "WRITER_SOURCE_RECOVERY_MANIFEST_TIME_INVALID");
  const ids = new Set<string>();
  const refs = new Set<string>();
  for (const object of manifest.objects) {
    const row = validateObject(object);
    if (ids.has(row.arrivalId) || refs.has(row.artifactRef)) {
      throw new WriterSourceRecoveryError(
        "WRITER_SOURCE_RECOVERY_MANIFEST_DUPLICATE",
      );
    }
    ids.add(row.arrivalId);
    refs.add(row.artifactRef);
  }
  return manifest;
}

function validateAuthorityRecord(
  value: unknown,
): WriterSourceRecoveryAuthorityRecord {
  exactKeys(
    value,
    [
      "protocol",
      "generation",
      "previousRecordSha256",
      "sourceCommit",
      "sourceTree",
      "admittedManifestSha256",
      "retiredManifestSha256",
      "requestNonceSha256",
      "issuedAt",
    ],
    "WRITER_SOURCE_RECOVERY_AUTHORITY_RECORD_SHAPE_INVALID",
  );
  const record = value as unknown as WriterSourceRecoveryAuthorityRecord;
  if (
    record.protocol !== AUTHORITY_PROTOCOL ||
    !Number.isSafeInteger(record.generation) ||
    record.generation < 1 ||
    !HEX64.test(record.previousRecordSha256) ||
    !HEX40.test(record.sourceCommit) ||
    !HEX40.test(record.sourceTree) ||
    !HEX64.test(record.admittedManifestSha256) ||
    !Array.isArray(record.retiredManifestSha256) ||
    record.retiredManifestSha256.some((digest) => !HEX64.test(digest)) ||
    new Set(record.retiredManifestSha256).size !==
      record.retiredManifestSha256.length ||
    !HEX64.test(record.requestNonceSha256)
  ) {
    throw new WriterSourceRecoveryError(
      "WRITER_SOURCE_RECOVERY_AUTHORITY_RECORD_INVALID",
    );
  }
  iso(record.issuedAt, "WRITER_SOURCE_RECOVERY_AUTHORITY_TIME_INVALID");
  if (record.retiredManifestSha256.includes(record.admittedManifestSha256)) {
    throw new WriterSourceRecoveryError(
      "WRITER_SOURCE_RECOVERY_AUTHORITY_SELF_RETIRED",
    );
  }
  return record;
}

function validateEnvelope(
  value: unknown,
): WriterSourceRecoveryAuthorityEnvelope {
  exactKeys(
    value,
    ["record", "signature"],
    "WRITER_SOURCE_RECOVERY_ENVELOPE_SHAPE_INVALID",
  );
  const envelope = value as unknown as WriterSourceRecoveryAuthorityEnvelope;
  validateAuthorityRecord(envelope.record);
  exactKeys(
    envelope.signature,
    ["algorithm", "publicKeySha256", "valueBase64"],
    "WRITER_SOURCE_RECOVERY_SIGNATURE_SHAPE_INVALID",
  );
  if (
    envelope.signature.algorithm !== "ed25519" ||
    !HEX64.test(envelope.signature.publicKeySha256)
  ) {
    throw new WriterSourceRecoveryError(
      "WRITER_SOURCE_RECOVERY_SIGNATURE_INVALID",
    );
  }
  decodeSignature(envelope.signature.valueBase64);
  return envelope;
}

export function writerSourceRecoveryAuthorityEnvelopeSha256(
  envelope: WriterSourceRecoveryAuthorityEnvelope,
): string {
  validateEnvelope(envelope);
  return sha256(stableJson(envelope));
}

export function verifyWriterSourceRecoveryAuthorityChain(input: {
  envelopes: WriterSourceRecoveryAuthorityEnvelope[];
  publicKeyPem: string | Buffer;
  expectedSourceCommit: string;
  expectedSourceTree: string;
  expectedMinimumGeneration?: number;
}): {
  latest: WriterSourceRecoveryAuthorityRecord;
  latestEnvelopeSha256: string;
  retiredManifestSha256: ReadonlySet<string>;
} {
  if (
    !HEX40.test(input.expectedSourceCommit) ||
    !HEX40.test(input.expectedSourceTree) ||
    input.envelopes.length === 0
  ) {
    throw new WriterSourceRecoveryError(
      "WRITER_SOURCE_RECOVERY_EXPECTATION_INVALID",
    );
  }
  const publicKey = createPublicKey(input.publicKeyPem);
  const fingerprint = publicKeyFingerprint(publicKey);
  let previous = ZERO_SHA;
  let expectedGeneration = 1;
  const retired = new Set<string>();
  let latest: WriterSourceRecoveryAuthorityRecord | null = null;
  for (const candidate of input.envelopes) {
    const envelope = validateEnvelope(candidate);
    const record = envelope.record;
    if (
      record.generation !== expectedGeneration ||
      record.previousRecordSha256 !== previous
    ) {
      throw new WriterSourceRecoveryError(
        "WRITER_SOURCE_RECOVERY_AUTHORITY_CHAIN_INVALID",
      );
    }
    if (
      record.sourceCommit !== input.expectedSourceCommit ||
      record.sourceTree !== input.expectedSourceTree
    ) {
      throw new WriterSourceRecoveryError(
        "WRITER_SOURCE_RECOVERY_SOURCE_NOT_ADMITTED",
      );
    }
    if (
      envelope.signature.publicKeySha256 !== fingerprint ||
      !verify(
        null,
        Buffer.from(stableJson(record)),
        publicKey,
        decodeSignature(envelope.signature.valueBase64),
      )
    ) {
      throw new WriterSourceRecoveryError(
        "WRITER_SOURCE_RECOVERY_SIGNATURE_INVALID",
      );
    }
    for (const digest of record.retiredManifestSha256) retired.add(digest);
    if (retired.has(record.admittedManifestSha256)) {
      throw new WriterSourceRecoveryError(
        "WRITER_SOURCE_RECOVERY_ADMISSION_RETIRED",
      );
    }
    previous = writerSourceRecoveryAuthorityEnvelopeSha256(envelope);
    latest = record;
    expectedGeneration += 1;
  }
  if (!latest || latest.generation < (input.expectedMinimumGeneration ?? 1)) {
    throw new WriterSourceRecoveryError(
      "WRITER_SOURCE_RECOVERY_AUTHORITY_STALE",
    );
  }
  return {
    latest,
    latestEnvelopeSha256: previous,
    retiredManifestSha256: retired,
  };
}

export function authorizeWriterSourceRecoveryManifestDigest(input: {
  manifestSha256: string;
  envelopes: WriterSourceRecoveryAuthorityEnvelope[];
  publicKeyPem: string | Buffer;
  expectedSourceCommit: string;
  expectedSourceTree: string;
  expectedMinimumGeneration?: number;
}): {
  manifestSha256: string;
  authorityGeneration: number;
  authorityEnvelopeSha256: string;
} {
  if (!HEX64.test(input.manifestSha256)) {
    throw new WriterSourceRecoveryError(
      "WRITER_SOURCE_RECOVERY_MANIFEST_DIGEST_INVALID",
    );
  }
  const authority = verifyWriterSourceRecoveryAuthorityChain(input);
  if (authority.retiredManifestSha256.has(input.manifestSha256)) {
    throw new WriterSourceRecoveryError(
      "WRITER_SOURCE_RECOVERY_MANIFEST_RETIRED",
    );
  }
  if (authority.latest.admittedManifestSha256 !== input.manifestSha256) {
    throw new WriterSourceRecoveryError(
      "WRITER_SOURCE_RECOVERY_MANIFEST_NOT_ADMITTED",
    );
  }
  return {
    manifestSha256: input.manifestSha256,
    authorityGeneration: authority.latest.generation,
    authorityEnvelopeSha256: authority.latestEnvelopeSha256,
  };
}

export function authorizeWriterSourceRecoveryManifest(input: {
  manifest: WriterSourceRecoveryManifest;
  envelopes: WriterSourceRecoveryAuthorityEnvelope[];
  publicKeyPem: string | Buffer;
  expectedSourceCommit: string;
  expectedSourceTree: string;
  expectedMinimumGeneration?: number;
}): {
  manifestSha256: string;
  authorityGeneration: number;
  authorityEnvelopeSha256: string;
} {
  const manifest = validateManifest(input.manifest);
  if (
    manifest.sourceCommit !== input.expectedSourceCommit ||
    manifest.sourceTree !== input.expectedSourceTree
  ) {
    throw new WriterSourceRecoveryError(
      "WRITER_SOURCE_RECOVERY_MANIFEST_SOURCE_MISMATCH",
    );
  }
  return authorizeWriterSourceRecoveryManifestDigest({
    ...input,
    manifestSha256: writerSourceRecoveryManifestSha256(manifest),
  });
}

interface PhysicalRecoveryRow extends EncryptedLandingRow {
  arrival_member_id: string;
  manuscript_id: string | null;
  arrival_artifact_ref: string;
  artifact_hash: string;
  artifact_size: string | number;
}

function numberValue(value: string | number | null): number {
  if (typeof value === "number" && Number.isSafeInteger(value)) return value;
  if (typeof value === "string" && /^(0|[1-9][0-9]*)$/.test(value))
    return Number(value);
  return Number.NaN;
}

export async function verifyWriterSourceRecoverySet(input: {
  manifest: WriterSourceRecoveryManifest;
  envelopes: WriterSourceRecoveryAuthorityEnvelope[];
  publicKeyPem: string | Buffer;
  expectedSourceCommit: string;
  expectedSourceTree: string;
  expectedMinimumGeneration?: number;
}): Promise<{
  manifestSha256: string;
  authorityGeneration: number;
  objectsVerified: number;
}> {
  const authorization = authorizeWriterSourceRecoveryManifest(input);
  for (const object of input.manifest.objects) {
    const result = await query<PhysicalRecoveryRow>(
      `SELECT l.*,
              a.member_id AS arrival_member_id,
              a.manuscript_id,
              a.artifact_ref AS arrival_artifact_ref,
              a.artifact_hash,
              a.artifact_size
         FROM manuscript_source_arrivals a
         JOIN writer_source_landing_intents l ON l.arrival_id=a.id
        WHERE a.id=$1::uuid AND l.id=$2::uuid
          AND l.state='ARRIVAL_RECORDED'`,
      [object.arrivalId, object.landingIntentId],
    );
    const row = result.rows[0];
    if (
      !row ||
      row.arrival_member_id !== object.memberId ||
      row.manuscript_id !== object.manuscriptId ||
      row.member_id !== object.memberId ||
      row.arrival_artifact_ref !== object.artifactRef ||
      row.artifact_ref !== object.artifactRef ||
      row.artifact_hash !== object.originalSha256 ||
      row.original_sha256 !== object.originalSha256 ||
      numberValue(row.artifact_size) !== object.originalBytes ||
      numberValue(row.original_bytes) !== object.originalBytes ||
      row.ciphertext_sha256 !== object.ciphertextSha256 ||
      numberValue(row.ciphertext_bytes) !== object.ciphertextBytes ||
      row.key_id !== object.keyId
    ) {
      throw new WriterSourceRecoveryError(
        "WRITER_SOURCE_RECOVERY_DB_BINDING_MISMATCH",
      );
    }
    const status = await inspectEncryptedStoredObject(row);
    if (status !== "MATCHED") {
      throw new WriterSourceRecoveryError(
        `WRITER_SOURCE_RECOVERY_OBJECT_${status}`,
      );
    }
  }
  return {
    manifestSha256: authorization.manifestSha256,
    authorityGeneration: authorization.authorityGeneration,
    objectsVerified: input.manifest.objects.length,
  };
}

/** Test-only signer. Production consumes a separately held public key and signed records. */
export function signWriterSourceRecoveryAuthorityForTests(input: {
  record: WriterSourceRecoveryAuthorityRecord;
  privateKeyPem: string | Buffer;
}): WriterSourceRecoveryAuthorityEnvelope {
  if (process.env.NODE_ENV !== "test") {
    throw new WriterSourceRecoveryError(
      "WRITER_SOURCE_RECOVERY_TEST_SIGNER_FORBIDDEN",
    );
  }
  const record = validateAuthorityRecord(input.record);
  const privateKey = createPrivateKey(input.privateKeyPem);
  const publicKey = createPublicKey(privateKey);
  return {
    record,
    signature: {
      algorithm: "ed25519",
      publicKeySha256: publicKeyFingerprint(publicKey),
      valueBase64: sign(
        null,
        Buffer.from(stableJson(record)),
        privateKey,
      ).toString("base64"),
    },
  };
}
