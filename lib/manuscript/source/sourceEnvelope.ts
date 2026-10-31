import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';
import {
  clearSourceKeyAuthorityCachesForTests,
  generateSourceDataKey,
  unwrapSourceDataKey,
  type SourceKeyProvider,
  type SourceKeyWrapAlgorithm,
  type WrappedSourceDataKey,
} from './sourceKeyAuthority';

const ALGORITHM = 'aes-256-gcm' as const;
const VERSION = 1 as const;
const IV_BYTES = 12;
const TAG_BYTES = 16;

export type SourceArtifactFormat = 'docx' | 'pdf' | 'epub' | 'text';

export interface SourceEnvelopeContext {
  memberId: string;
  intentId: string;
  artifactRef: string;
  originalSha256: string;
  originalBytes: number;
  originalFormat: SourceArtifactFormat;
}

export interface SourceEnvelopeMetadata {
  version: typeof VERSION;
  algorithm: typeof ALGORITHM;
  keyProvider: SourceKeyProvider;
  keyWrapAlgorithm: SourceKeyWrapAlgorithm;
  keyId: string;
  cipherIv: string;
  cipherTag: string;
  wrappedDek: string;
  wrapIv: string | null;
  wrapTag: string | null;
  ciphertextSha256: string;
  ciphertextBytes: number;
}

export interface EncryptedSourceEnvelope {
  ciphertext: Buffer;
  metadata: SourceEnvelopeMetadata;
}

function sha256(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function validBase64(value: string): boolean {
  return /^[A-Za-z0-9+/]+={0,2}$/.test(value);
}

function decodeBase64(value: string, bytes: number | null, label: string): Buffer {
  if (!validBase64(value)) throw new Error(`${label}_invalid`);
  const decoded = Buffer.from(value, 'base64');
  if (decoded.toString('base64') !== value || (bytes !== null && decoded.length !== bytes)) {
    throw new Error(`${label}_invalid`);
  }
  return decoded;
}

function assertContext(context: SourceEnvelopeContext): void {
  if (!context.memberId || !context.intentId || !context.artifactRef) {
    throw new Error('source_envelope_context_missing');
  }
  if (!/^[0-9a-f]{64}$/.test(context.originalSha256)) {
    throw new Error('source_envelope_original_hash_invalid');
  }
  if (!Number.isSafeInteger(context.originalBytes) || context.originalBytes <= 0) {
    throw new Error('source_envelope_original_size_invalid');
  }
  if (!['docx', 'pdf', 'epub', 'text'].includes(context.originalFormat)) {
    throw new Error('source_envelope_format_invalid');
  }
}

function aad(context: SourceEnvelopeContext, purpose: 'source-bytes' | 'dek-wrap'): Buffer {
  assertContext(context);
  return Buffer.from(JSON.stringify([
    'soullab.writer.source-envelope.v1',
    purpose,
    context.memberId,
    context.intentId,
    context.artifactRef,
    context.originalSha256,
    context.originalBytes,
    context.originalFormat,
  ]), 'utf8');
}

function keyContextSha256(context: SourceEnvelopeContext): string {
  return sha256(aad(context, 'dek-wrap'));
}

function wrappedKey(metadata: SourceEnvelopeMetadata): WrappedSourceDataKey {
  if (!metadata.keyId || metadata.keyId.length > 2048 ||
      !validBase64(metadata.wrappedDek)) {
    throw new Error('source_envelope_wrapped_key_invalid');
  }
  if (metadata.keyProvider === 'aws-kms') {
    if (metadata.keyWrapAlgorithm !== 'aws-kms-generate-data-key-v1' ||
        metadata.wrapIv !== null || metadata.wrapTag !== null) {
      throw new Error('source_envelope_aws_key_metadata_invalid');
    }
  } else if (metadata.keyProvider === 'local-test') {
    if (metadata.keyWrapAlgorithm !== 'aes-256-gcm-local-test' ||
        !metadata.wrapIv || !metadata.wrapTag) {
      throw new Error('source_envelope_local_key_metadata_invalid');
    }
  } else {
    throw new Error('source_envelope_key_provider_invalid');
  }
  return {
    keyProvider: metadata.keyProvider,
    keyWrapAlgorithm: metadata.keyWrapAlgorithm,
    keyId: metadata.keyId,
    wrappedDek: metadata.wrappedDek,
    wrapIv: metadata.wrapIv,
    wrapTag: metadata.wrapTag,
  };
}

function assertMetadata(metadata: SourceEnvelopeMetadata): void {
  if (metadata.version !== VERSION || metadata.algorithm !== ALGORITHM) {
    throw new Error('source_envelope_version_or_algorithm_refused');
  }
  if (!Number.isSafeInteger(metadata.ciphertextBytes) || metadata.ciphertextBytes < 0 ||
      !/^[0-9a-f]{64}$/.test(metadata.ciphertextSha256)) {
    throw new Error('source_envelope_ciphertext_metadata_invalid');
  }
  decodeBase64(metadata.cipherIv, IV_BYTES, 'source_envelope_cipher_iv');
  decodeBase64(metadata.cipherTag, TAG_BYTES, 'source_envelope_cipher_tag');
  wrappedKey(metadata);
}

export async function encryptOriginalSource(
  plaintext: Buffer,
  context: SourceEnvelopeContext,
): Promise<EncryptedSourceEnvelope> {
  assertContext(context);
  if (!Buffer.isBuffer(plaintext) || plaintext.length !== context.originalBytes ||
      sha256(plaintext) !== context.originalSha256) {
    throw new Error('source_envelope_plaintext_mismatch');
  }

  const generated = await generateSourceDataKey(keyContextSha256(context));
  const dek = generated.plaintextKey;
  const cipherIv = randomBytes(IV_BYTES);
  try {
    const cipher = createCipheriv(ALGORITHM, dek, cipherIv, { authTagLength: TAG_BYTES });
    cipher.setAAD(aad(context, 'source-bytes'));
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    return {
      ciphertext,
      metadata: {
        version: VERSION,
        algorithm: ALGORITHM,
        ...generated.wrapped,
        cipherIv: cipherIv.toString('base64'),
        cipherTag: cipher.getAuthTag().toString('base64'),
        ciphertextSha256: sha256(ciphertext),
        ciphertextBytes: ciphertext.length,
      },
    };
  } finally {
    dek.fill(0);
  }
}

export async function materializeOriginalSourceCiphertext(
  plaintext: Buffer,
  metadata: SourceEnvelopeMetadata,
  context: SourceEnvelopeContext,
): Promise<Buffer> {
  assertContext(context);
  assertMetadata(metadata);
  if (plaintext.length !== context.originalBytes || sha256(plaintext) !== context.originalSha256) {
    throw new Error('source_envelope_rematerialization_refused');
  }

  let dek: Buffer | null = null;
  try {
    const unwrapped = await unwrapSourceDataKey(wrappedKey(metadata), keyContextSha256(context));
    dek = unwrapped.plaintextKey;
    const cipher = createCipheriv(
      ALGORITHM,
      dek,
      decodeBase64(metadata.cipherIv, IV_BYTES, 'source_envelope_cipher_iv'),
      { authTagLength: TAG_BYTES },
    );
    cipher.setAAD(aad(context, 'source-bytes'));
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const expectedTag = decodeBase64(metadata.cipherTag, TAG_BYTES, 'source_envelope_cipher_tag');
    if (!cipher.getAuthTag().equals(expectedTag) ||
        ciphertext.length !== metadata.ciphertextBytes ||
        sha256(ciphertext) !== metadata.ciphertextSha256) {
      throw new Error('source_envelope_rematerialized_ciphertext_mismatch');
    }
    return ciphertext;
  } catch {
    throw new Error('source_envelope_rematerialization_refused');
  } finally {
    if (dek) dek.fill(0);
  }
}

export async function decryptOriginalSource(
  ciphertext: Buffer,
  metadata: SourceEnvelopeMetadata,
  context: SourceEnvelopeContext,
): Promise<Buffer> {
  assertContext(context);
  assertMetadata(metadata);
  if (ciphertext.length !== metadata.ciphertextBytes ||
      sha256(ciphertext) !== metadata.ciphertextSha256) {
    throw new Error('source_envelope_ciphertext_mismatch');
  }

  let dek: Buffer | null = null;
  try {
    const unwrapped = await unwrapSourceDataKey(wrappedKey(metadata), keyContextSha256(context));
    dek = unwrapped.plaintextKey;
    const decipher = createDecipheriv(
      ALGORITHM,
      dek,
      decodeBase64(metadata.cipherIv, IV_BYTES, 'source_envelope_cipher_iv'),
      { authTagLength: TAG_BYTES },
    );
    decipher.setAAD(aad(context, 'source-bytes'));
    decipher.setAuthTag(decodeBase64(metadata.cipherTag, TAG_BYTES, 'source_envelope_cipher_tag'));
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    if (plaintext.length !== context.originalBytes || sha256(plaintext) !== context.originalSha256) {
      throw new Error('source_envelope_plaintext_mismatch');
    }
    return plaintext;
  } catch {
    throw new Error('source_envelope_decryption_refused');
  } finally {
    if (dek) dek.fill(0);
  }
}

export function clearSourceEnvelopeKeyCacheForTests(): void {
  clearSourceKeyAuthorityCachesForTests();
}
