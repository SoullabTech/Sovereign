import {
  DecryptCommand,
  GenerateDataKeyCommand,
  KMSClient,
  type KMSClientConfig,
} from '@aws-sdk/client-kms';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const KEY_BYTES = 32;
const WRAP_IV_BYTES = 12;
const TAG_BYTES = 16;
const LOCAL_WRAP_ALGORITHM = 'aes-256-gcm-local-test' as const;
const AWS_WRAP_ALGORITHM = 'aws-kms-generate-data-key-v1' as const;

export type SourceKeyProvider = 'aws-kms' | 'local-test';
export type SourceKeyWrapAlgorithm =
  | typeof AWS_WRAP_ALGORITHM
  | typeof LOCAL_WRAP_ALGORITHM;

export interface WrappedSourceDataKey {
  keyProvider: SourceKeyProvider;
  keyWrapAlgorithm: SourceKeyWrapAlgorithm;
  keyId: string;
  wrappedDek: string;
  wrapIv: string | null;
  wrapTag: string | null;
}

export interface UnwrappedSourceDataKey {
  plaintextKey: Buffer;
  keyId: string;
}

let localKeyRingCache: Map<string, Buffer> | null = null;
let kmsClientCache: KMSClient | null = null;
let kmsClientFactory: ((config: KMSClientConfig) => KMSClient) | null = null;

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

function requireKeyId(value: string | undefined, label: string): string {
  if (!value || value.length > 2048 || /[\u0000-\u001f\u007f]/.test(value)) {
    throw new Error(`${label}_missing_or_invalid`);
  }
  return value;
}

function selectedProvider(): SourceKeyProvider {
  const provider = process.env.WRITER_SOURCE_KEY_PROVIDER;
  if (provider === 'aws-kms') return provider;
  if (provider === 'local-test') {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('writer_source_local_key_provider_forbidden');
    }
    return provider;
  }
  throw new Error('writer_source_key_provider_missing');
}

function parseLocalKey(value: string, label: string): Buffer {
  const key = decodeBase64(value, KEY_BYTES, label);
  return key;
}

function loadLocalKeyRing(): Map<string, Buffer> {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('writer_source_local_key_provider_forbidden');
  }
  const ring = new Map<string, Buffer>();
  const encodedRing = process.env.WRITER_SOURCE_KEK_RING_JSON;
  if (encodedRing) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(encodedRing);
    } catch {
      throw new Error('writer_source_kek_ring_invalid_json');
    }
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
      throw new Error('writer_source_kek_ring_invalid_shape');
    }
    for (const [id, encoded] of Object.entries(parsed)) {
      const keyId = requireKeyId(id, 'writer_source_kek_id');
      if (typeof encoded !== 'string') {
        throw new Error('writer_source_kek_ring_value_invalid');
      }
      ring.set(keyId, parseLocalKey(encoded, `writer_source_kek_${keyId}`));
    }
  }

  const currentId = requireKeyId(process.env.WRITER_SOURCE_KEK_ID, 'writer_source_kek_id');
  const current = process.env.WRITER_SOURCE_KEK;
  if (!current) throw new Error('writer_source_kek_missing');
  ring.set(currentId, parseLocalKey(current, 'writer_source_kek'));
  return ring;
}

function localKeyById(keyId: string): Buffer {
  if (!localKeyRingCache) localKeyRingCache = loadLocalKeyRing();
  const key = localKeyRingCache.get(keyId);
  if (!key) throw new Error('writer_source_kek_unavailable');
  return key;
}

function currentLocalKey(): { id: string; key: Buffer } {
  const id = requireKeyId(process.env.WRITER_SOURCE_KEK_ID, 'writer_source_kek_id');
  return { id, key: localKeyById(id) };
}

function kmsEncryptionContext(contextSha256: string): Record<string, string> {
  if (!/^[0-9a-f]{64}$/.test(contextSha256)) {
    throw new Error('writer_source_kms_context_invalid');
  }
  // KMS encryption context is recorded in CloudTrail and is therefore strictly
  // content-free. Member IDs, Work IDs, filenames and prose never enter it.
  return {
    'soullab:domain': 'writer-source-v1',
    'soullab:context-sha256': contextSha256,
  };
}

function kmsClient(): KMSClient {
  if (kmsClientCache) return kmsClientCache;
  const region = process.env.WRITER_SOURCE_KMS_REGION
    ?? process.env.AWS_REGION
    ?? process.env.AWS_DEFAULT_REGION;
  if (!region || !/^[a-z]{2}(?:-gov)?-[a-z]+-\d$/.test(region)) {
    throw new Error('writer_source_kms_region_missing_or_invalid');
  }
  const factory = kmsClientFactory ?? ((config: KMSClientConfig) => new KMSClient(config));
  kmsClientCache = factory({ region, maxAttempts: 3 });
  return kmsClientCache;
}

async function generateAwsDataKey(contextSha256: string): Promise<{
  plaintextKey: Buffer;
  wrapped: WrappedSourceDataKey;
}> {
  const configuredKeyId = requireKeyId(
    process.env.WRITER_SOURCE_KMS_KEY_ARN,
    'writer_source_kms_key_arn',
  );
  const result = await kmsClient().send(new GenerateDataKeyCommand({
    KeyId: configuredKeyId,
    KeySpec: 'AES_256',
    EncryptionContext: kmsEncryptionContext(contextSha256),
  }));
  if (!result.Plaintext || result.Plaintext.byteLength !== KEY_BYTES ||
      !result.CiphertextBlob || result.CiphertextBlob.byteLength === 0) {
    throw new Error('writer_source_kms_generate_data_key_incomplete');
  }

  const plaintextKey = Buffer.from(result.Plaintext);
  result.Plaintext.fill(0);
  const keyId = requireKeyId(result.KeyId ?? configuredKeyId, 'writer_source_kms_key_id');
  return {
    plaintextKey,
    wrapped: {
      keyProvider: 'aws-kms',
      keyWrapAlgorithm: AWS_WRAP_ALGORITHM,
      keyId,
      wrappedDek: Buffer.from(result.CiphertextBlob).toString('base64'),
      wrapIv: null,
      wrapTag: null,
    },
  };
}

function generateLocalDataKey(contextSha256: string): {
  plaintextKey: Buffer;
  wrapped: WrappedSourceDataKey;
} {
  const plaintextKey = randomBytes(KEY_BYTES);
  const wrapIv = randomBytes(WRAP_IV_BYTES);
  const { id: keyId, key } = currentLocalKey();
  const wrapper = createCipheriv('aes-256-gcm', key, wrapIv, { authTagLength: TAG_BYTES });
  wrapper.setAAD(Buffer.from(contextSha256, 'hex'));
  const wrappedDek = Buffer.concat([wrapper.update(plaintextKey), wrapper.final()]);
  return {
    plaintextKey,
    wrapped: {
      keyProvider: 'local-test',
      keyWrapAlgorithm: LOCAL_WRAP_ALGORITHM,
      keyId,
      wrappedDek: wrappedDek.toString('base64'),
      wrapIv: wrapIv.toString('base64'),
      wrapTag: wrapper.getAuthTag().toString('base64'),
    },
  };
}

export async function generateSourceDataKey(contextSha256: string): Promise<{
  plaintextKey: Buffer;
  wrapped: WrappedSourceDataKey;
}> {
  return selectedProvider() === 'aws-kms'
    ? generateAwsDataKey(contextSha256)
    : generateLocalDataKey(contextSha256);
}

async function unwrapAwsDataKey(
  wrapped: WrappedSourceDataKey,
  contextSha256: string,
): Promise<UnwrappedSourceDataKey> {
  if (wrapped.keyProvider !== 'aws-kms' ||
      wrapped.keyWrapAlgorithm !== AWS_WRAP_ALGORITHM ||
      wrapped.wrapIv !== null || wrapped.wrapTag !== null) {
    throw new Error('writer_source_kms_envelope_invalid');
  }
  const keyId = requireKeyId(wrapped.keyId, 'writer_source_kms_key_id');
  const result = await kmsClient().send(new DecryptCommand({
    CiphertextBlob: decodeBase64(wrapped.wrappedDek, null, 'writer_source_wrapped_dek'),
    KeyId: keyId,
    EncryptionAlgorithm: 'SYMMETRIC_DEFAULT',
    EncryptionContext: kmsEncryptionContext(contextSha256),
  }));
  if (!result.Plaintext || result.Plaintext.byteLength !== KEY_BYTES) {
    throw new Error('writer_source_kms_decrypt_incomplete');
  }
  if (result.KeyId && result.KeyId !== keyId) {
    result.Plaintext.fill(0);
    throw new Error('writer_source_kms_key_mismatch');
  }
  const plaintextKey = Buffer.from(result.Plaintext);
  result.Plaintext.fill(0);
  return { plaintextKey, keyId };
}

function unwrapLocalDataKey(
  wrapped: WrappedSourceDataKey,
  contextSha256: string,
): UnwrappedSourceDataKey {
  if (process.env.NODE_ENV !== 'test' || wrapped.keyProvider !== 'local-test' ||
      wrapped.keyWrapAlgorithm !== LOCAL_WRAP_ALGORITHM ||
      !wrapped.wrapIv || !wrapped.wrapTag) {
    throw new Error('writer_source_local_envelope_invalid');
  }
  const key = localKeyById(wrapped.keyId);
  const unwrapper = createDecipheriv(
    'aes-256-gcm',
    key,
    decodeBase64(wrapped.wrapIv, WRAP_IV_BYTES, 'writer_source_wrap_iv'),
    { authTagLength: TAG_BYTES },
  );
  unwrapper.setAAD(Buffer.from(contextSha256, 'hex'));
  unwrapper.setAuthTag(decodeBase64(wrapped.wrapTag, TAG_BYTES, 'writer_source_wrap_tag'));
  const plaintextKey = Buffer.concat([
    unwrapper.update(decodeBase64(wrapped.wrappedDek, KEY_BYTES, 'writer_source_wrapped_dek')),
    unwrapper.final(),
  ]);
  if (plaintextKey.length !== KEY_BYTES) {
    plaintextKey.fill(0);
    throw new Error('writer_source_local_dek_invalid');
  }
  return { plaintextKey, keyId: wrapped.keyId };
}

export async function unwrapSourceDataKey(
  wrapped: WrappedSourceDataKey,
  contextSha256: string,
): Promise<UnwrappedSourceDataKey> {
  if (wrapped.keyProvider === 'aws-kms') {
    return unwrapAwsDataKey(wrapped, contextSha256);
  }
  return unwrapLocalDataKey(wrapped, contextSha256);
}

export function clearSourceKeyAuthorityCachesForTests(): void {
  if (localKeyRingCache) {
    for (const key of localKeyRingCache.values()) key.fill(0);
  }
  localKeyRingCache = null;
  kmsClientCache?.destroy();
  kmsClientCache = null;
  kmsClientFactory = null;
}

export function setSourceKmsClientFactoryForTests(
  factory: ((config: KMSClientConfig) => KMSClient) | null,
): void {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('writer_source_kms_test_factory_forbidden');
  }
  kmsClientCache?.destroy();
  kmsClientCache = null;
  kmsClientFactory = factory;
}
