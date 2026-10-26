import type { KMSClient } from '@aws-sdk/client-kms';
import {
  clearSourceKeyAuthorityCachesForTests,
  generateSourceDataKey,
  setSourceKmsClientFactoryForTests,
  unwrapSourceDataKey,
} from '../sourceKeyAuthority';

const ENV = {
  provider: process.env.WRITER_SOURCE_KEY_PROVIDER,
  key: process.env.WRITER_SOURCE_KMS_KEY_ARN,
  region: process.env.WRITER_SOURCE_KMS_REGION,
};

const KEY_ARN = 'arn:aws:kms:us-east-1:000000000000:key/00000000-0000-4000-8000-000000000001';
const OTHER_KEY_ARN = 'arn:aws:kms:us-east-1:000000000000:key/00000000-0000-4000-8000-000000000002';
const CONTEXT_HASH = 'ab'.repeat(32);
const DATA_KEY = Buffer.alloc(32, 0x42);
const WRAPPED = Buffer.from('fictional-kms-ciphertext-blob');

beforeEach(() => {
  process.env.WRITER_SOURCE_KEY_PROVIDER = 'aws-kms';
  process.env.WRITER_SOURCE_KMS_KEY_ARN = KEY_ARN;
  process.env.WRITER_SOURCE_KMS_REGION = 'us-east-1';
  clearSourceKeyAuthorityCachesForTests();
});

afterEach(() => {
  clearSourceKeyAuthorityCachesForTests();
});

afterAll(() => {
  if (ENV.provider === undefined) delete process.env.WRITER_SOURCE_KEY_PROVIDER;
  else process.env.WRITER_SOURCE_KEY_PROVIDER = ENV.provider;
  if (ENV.key === undefined) delete process.env.WRITER_SOURCE_KMS_KEY_ARN;
  else process.env.WRITER_SOURCE_KMS_KEY_ARN = ENV.key;
  if (ENV.region === undefined) delete process.env.WRITER_SOURCE_KMS_REGION;
  else process.env.WRITER_SOURCE_KMS_REGION = ENV.region;
  clearSourceKeyAuthorityCachesForTests();
});

function fakeClient(send: jest.Mock): KMSClient {
  return {
    send,
    destroy: jest.fn(),
  } as unknown as KMSClient;
}

it('uses GenerateDataKey and Decrypt with only a content-free hashed encryption context', async () => {
  const send = jest.fn(async (command: { constructor: { name: string }; input: Record<string, unknown> }) => {
    if (command.constructor.name === 'GenerateDataKeyCommand') {
      return {
        Plaintext: Uint8Array.from(DATA_KEY),
        CiphertextBlob: Uint8Array.from(WRAPPED),
        KeyId: KEY_ARN,
      };
    }
    if (command.constructor.name === 'DecryptCommand') {
      return {
        Plaintext: Uint8Array.from(DATA_KEY),
        KeyId: KEY_ARN,
      };
    }
    throw new Error('unexpected KMS command');
  });
  setSourceKmsClientFactoryForTests(() => fakeClient(send));

  const generated = await generateSourceDataKey(CONTEXT_HASH);
  expect(generated.plaintextKey).toEqual(DATA_KEY);
  expect(generated.wrapped).toEqual({
    keyProvider: 'aws-kms',
    keyWrapAlgorithm: 'aws-kms-generate-data-key-v1',
    keyId: KEY_ARN,
    wrappedDek: WRAPPED.toString('base64'),
    wrapIv: null,
    wrapTag: null,
  });

  const unwrapped = await unwrapSourceDataKey(generated.wrapped, CONTEXT_HASH);
  expect(unwrapped).toEqual({ plaintextKey: DATA_KEY, keyId: KEY_ARN });
  expect(send).toHaveBeenCalledTimes(2);

  const generateInput = send.mock.calls[0][0].input;
  const decryptInput = send.mock.calls[1][0].input;
  const expectedContext = {
    'soullab:domain': 'writer-source-v1',
    'soullab:context-sha256': CONTEXT_HASH,
  };
  expect(generateInput).toMatchObject({
    KeyId: KEY_ARN,
    KeySpec: 'AES_256',
    EncryptionContext: expectedContext,
  });
  expect(decryptInput).toMatchObject({
    KeyId: KEY_ARN,
    EncryptionAlgorithm: 'SYMMETRIC_DEFAULT',
    EncryptionContext: expectedContext,
  });
  expect(JSON.stringify(expectedContext)).not.toMatch(/member|manuscript|filename|prose/i);
});

it('refuses a KMS decrypt response attributed to a different key', async () => {
  const send = jest.fn(async (command: { constructor: { name: string } }) => {
    if (command.constructor.name === 'DecryptCommand') {
      return { Plaintext: Uint8Array.from(DATA_KEY), KeyId: OTHER_KEY_ARN };
    }
    throw new Error('unexpected KMS command');
  });
  setSourceKmsClientFactoryForTests(() => fakeClient(send));

  await expect(unwrapSourceDataKey({
    keyProvider: 'aws-kms',
    keyWrapAlgorithm: 'aws-kms-generate-data-key-v1',
    keyId: KEY_ARN,
    wrappedDek: WRAPPED.toString('base64'),
    wrapIv: null,
    wrapTag: null,
  }, CONTEXT_HASH)).rejects.toThrow('writer_source_kms_key_mismatch');
});

it('fails closed when production KMS configuration is incomplete', async () => {
  delete process.env.WRITER_SOURCE_KMS_KEY_ARN;
  setSourceKmsClientFactoryForTests(() => fakeClient(jest.fn()));
  await expect(generateSourceDataKey(CONTEXT_HASH))
    .rejects.toThrow('writer_source_kms_key_arn_missing_or_invalid');
});
