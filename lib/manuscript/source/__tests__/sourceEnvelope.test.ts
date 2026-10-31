import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import { createHash } from 'node:crypto';
import {
  clearSourceEnvelopeKeyCacheForTests,
  decryptOriginalSource,
  encryptOriginalSource,
  materializeOriginalSourceCiphertext,
  type SourceEnvelopeContext,
} from '../sourceEnvelope';

const ORIGINAL_PROVIDER = process.env.WRITER_SOURCE_KEY_PROVIDER;
const ORIGINAL_KEK = process.env.WRITER_SOURCE_KEK;
const ORIGINAL_KEK_ID = process.env.WRITER_SOURCE_KEK_ID;
const ORIGINAL_RING = process.env.WRITER_SOURCE_KEK_RING_JSON;

const KEY_ONE = Buffer.alloc(32, 0x11).toString('base64');
const KEY_TWO = Buffer.alloc(32, 0x22).toString('base64');
const plaintext = Buffer.from(
  'Fictional manuscript original. The author keeps every word.\n\u0000\ud83c\udf19',
  'utf8',
);
const originalSha256 = createHash('sha256').update(plaintext).digest('hex');

const context: SourceEnvelopeContext = {
  memberId: '11111111-1111-4111-8111-111111111111',
  intentId: '22222222-2222-4222-8222-222222222222',
  artifactRef: 'manuscript-sources/22222222-2222-4222-8222-222222222222.source.enc',
  originalSha256,
  originalBytes: plaintext.length,
  originalFormat: 'docx',
};

beforeEach(() => {
  process.env.WRITER_SOURCE_KEY_PROVIDER = 'local-test';
  process.env.WRITER_SOURCE_KEK_ID = 'source-k1';
  process.env.WRITER_SOURCE_KEK = KEY_ONE;
  delete process.env.WRITER_SOURCE_KEK_RING_JSON;
  clearSourceEnvelopeKeyCacheForTests();
});

afterAll(() => {
  if (ORIGINAL_PROVIDER === undefined) delete process.env.WRITER_SOURCE_KEY_PROVIDER;
  else process.env.WRITER_SOURCE_KEY_PROVIDER = ORIGINAL_PROVIDER;
  if (ORIGINAL_KEK === undefined) delete process.env.WRITER_SOURCE_KEK;
  else process.env.WRITER_SOURCE_KEK = ORIGINAL_KEK;
  if (ORIGINAL_KEK_ID === undefined) delete process.env.WRITER_SOURCE_KEK_ID;
  else process.env.WRITER_SOURCE_KEK_ID = ORIGINAL_KEK_ID;
  if (ORIGINAL_RING === undefined) delete process.env.WRITER_SOURCE_KEK_RING_JSON;
  else process.env.WRITER_SOURCE_KEK_RING_JSON = ORIGINAL_RING;
  clearSourceEnvelopeKeyCacheForTests();
});

function flipFirstByte(input: Buffer): Buffer {
  const changed = Buffer.from(input);
  changed[0] ^= 0xff;
  return changed;
}

function flipBase64(input: string): string {
  return flipFirstByte(Buffer.from(input, 'base64')).toString('base64');
}

describe('Writer Source envelope — ciphertext-first original custody', () => {
  it('round-trips exact bytes without persisting plaintext or a plaintext DEK', async () => {
    const envelope = await encryptOriginalSource(plaintext, context);

    expect(envelope.metadata.keyProvider).toBe('local-test');
    expect(envelope.metadata.keyWrapAlgorithm).toBe('aes-256-gcm-local-test');
    expect(envelope.ciphertext.equals(plaintext)).toBe(false);
    expect(envelope.ciphertext.indexOf(plaintext)).toBe(-1);
    expect(envelope.metadata.wrappedDek).not.toBe(KEY_ONE);
    expect(Buffer.from(envelope.metadata.wrappedDek, 'base64')).toHaveLength(32);
    expect(envelope.metadata.ciphertextSha256).toBe(
      createHash('sha256').update(envelope.ciphertext).digest('hex'),
    );
    await expect(decryptOriginalSource(envelope.ciphertext, envelope.metadata, context))
      .resolves.toEqual(plaintext);
  });

  it('uses fresh DEK and IV material for repeated identical originals', async () => {
    const first = await encryptOriginalSource(plaintext, context);
    const second = await encryptOriginalSource(plaintext, context);

    expect(first.ciphertext.equals(second.ciphertext)).toBe(false);
    expect(first.metadata.cipherIv).not.toBe(second.metadata.cipherIv);
    expect(first.metadata.wrapIv).not.toBe(second.metadata.wrapIv);
    expect(first.metadata.wrappedDek).not.toBe(second.metadata.wrappedDek);
    await expect(decryptOriginalSource(first.ciphertext, first.metadata, context)).resolves.toEqual(plaintext);
    await expect(decryptOriginalSource(second.ciphertext, second.metadata, context)).resolves.toEqual(plaintext);
  });

  it('rematerializes the exact same ciphertext after a process interruption', async () => {
    const first = await encryptOriginalSource(plaintext, context);
    const rematerialized = await materializeOriginalSourceCiphertext(
      plaintext,
      first.metadata,
      context,
    );

    expect(rematerialized).toEqual(first.ciphertext);
    await expect(decryptOriginalSource(rematerialized, first.metadata, context)).resolves.toEqual(plaintext);
  });

  it.each([
    ['member', { memberId: '99999999-9999-4999-8999-999999999999' }],
    ['intent', { intentId: '33333333-3333-4333-8333-333333333333' }],
    ['artifact reference', { artifactRef: 'manuscript-sources/other.source.enc' }],
    ['original hash', { originalSha256: '0'.repeat(64) }],
    ['original length', { originalBytes: plaintext.length + 1 }],
    ['format', { originalFormat: 'epub' as const }],
  ])('refuses ciphertext moved to a different %s context', async (_label, change) => {
    const envelope = await encryptOriginalSource(plaintext, context);
    await expect(decryptOriginalSource(
      envelope.ciphertext,
      envelope.metadata,
      { ...context, ...change },
    )).rejects.toThrow('source_envelope_decryption_refused');
  });

  it('refuses ciphertext, authentication-tag, wrapped-key, and wrapping-tag tampering', async () => {
    const envelope = await encryptOriginalSource(plaintext, context);

    await expect(decryptOriginalSource(
      flipFirstByte(envelope.ciphertext),
      envelope.metadata,
      context,
    )).rejects.toThrow('source_envelope_ciphertext_mismatch');

    await expect(decryptOriginalSource(
      envelope.ciphertext,
      { ...envelope.metadata, cipherTag: flipBase64(envelope.metadata.cipherTag) },
      context,
    )).rejects.toThrow('source_envelope_decryption_refused');

    await expect(decryptOriginalSource(
      envelope.ciphertext,
      { ...envelope.metadata, wrappedDek: flipBase64(envelope.metadata.wrappedDek) },
      context,
    )).rejects.toThrow('source_envelope_decryption_refused');

    await expect(decryptOriginalSource(
      envelope.ciphertext,
      { ...envelope.metadata, wrapTag: flipBase64(envelope.metadata.wrapTag!) },
      context,
    )).rejects.toThrow('source_envelope_decryption_refused');
  });

  it('decrypts an older envelope only while its old test KEK remains in the explicit key ring', async () => {
    const oldEnvelope = await encryptOriginalSource(plaintext, context);

    process.env.WRITER_SOURCE_KEK_ID = 'source-k2';
    process.env.WRITER_SOURCE_KEK = KEY_TWO;
    process.env.WRITER_SOURCE_KEK_RING_JSON = JSON.stringify({ 'source-k1': KEY_ONE });
    clearSourceEnvelopeKeyCacheForTests();
    await expect(decryptOriginalSource(oldEnvelope.ciphertext, oldEnvelope.metadata, context))
      .resolves.toEqual(plaintext);

    delete process.env.WRITER_SOURCE_KEK_RING_JSON;
    clearSourceEnvelopeKeyCacheForTests();
    await expect(decryptOriginalSource(oldEnvelope.ciphertext, oldEnvelope.metadata, context))
      .rejects.toThrow('source_envelope_decryption_refused');
  });

  it('fails closed when the test KEK is absent or malformed', async () => {
    delete process.env.WRITER_SOURCE_KEK;
    clearSourceEnvelopeKeyCacheForTests();
    await expect(encryptOriginalSource(plaintext, context)).rejects.toThrow('writer_source_kek_missing');

    process.env.WRITER_SOURCE_KEK = 'not-a-key';
    clearSourceEnvelopeKeyCacheForTests();
    await expect(encryptOriginalSource(plaintext, context)).rejects.toThrow('writer_source_kek_invalid');
  });

  it('forbids the static local key provider outside NODE_ENV=test', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true, configurable: true });
    clearSourceEnvelopeKeyCacheForTests();
    await expect(encryptOriginalSource(plaintext, context))
      .rejects.toThrow('writer_source_local_key_provider_forbidden');
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalNodeEnv,
      writable: true,
      configurable: true,
    });
  });
});
