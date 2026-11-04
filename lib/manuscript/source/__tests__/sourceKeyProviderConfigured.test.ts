/**
 * writerSourceKeyProviderConfigured(): a precondition check on NON-SECRET settings.
 *
 * It exists so the ingest route can refuse BEFORE creating anything when no key provider is set up. It must never admit more
 * than the real key path would: where the real path would throw for a missing or malformed setting, this must say "not configured".
 */
import { writerSourceKeyProviderConfigured } from '../sourceKeyAuthority';

const KEYS = [
  'WRITER_SOURCE_KEY_PROVIDER', 'WRITER_SOURCE_KMS_KEY_ARN', 'WRITER_SOURCE_KMS_REGION', 'AWS_REGION', 'AWS_DEFAULT_REGION',
] as const;
const ARN = 'arn:aws:kms:us-west-2:111122223333:key/fictional-key-id';
const saved: Record<string, string | undefined> = {};
const env = process.env as Record<string, string | undefined>;
let nodeEnv: string | undefined;

beforeEach(() => {
  nodeEnv = env.NODE_ENV;
  for (const k of KEYS) { saved[k] = env[k]; delete env[k]; }
});
afterEach(() => {
  for (const k of KEYS) { if (saved[k] === undefined) delete env[k]; else env[k] = saved[k]; }
  env.NODE_ENV = nodeEnv;
});

function aws(extra: Record<string, string | undefined> = {}) {
  env.WRITER_SOURCE_KEY_PROVIDER = 'aws-kms';
  env.WRITER_SOURCE_KMS_KEY_ARN = ARN;
  env.WRITER_SOURCE_KMS_REGION = 'us-west-2';
  for (const [k, v] of Object.entries(extra)) { if (v === undefined) delete env[k]; else env[k] = v; }
}

describe('aws-kms', () => {
  it('is configured with a provider, a key ARN and a region', () => {
    aws();
    expect(writerSourceKeyProviderConfigured()).toBe(true);
  });

  it.each([
    ['no provider at all', { WRITER_SOURCE_KEY_PROVIDER: undefined }],
    ['an unknown provider', { WRITER_SOURCE_KEY_PROVIDER: 'gcp-kms' }],
    ['the provider spelled in another case', { WRITER_SOURCE_KEY_PROVIDER: 'AWS-KMS' }],
    ['no key ARN', { WRITER_SOURCE_KMS_KEY_ARN: undefined }],
    ['an empty key ARN', { WRITER_SOURCE_KMS_KEY_ARN: '' }],
    ['a key ARN with a control character', { WRITER_SOURCE_KMS_KEY_ARN: 'arn:aws:kms:us-west-2:1:key/x\u0000y' }],
    ['a key ARN that is too long', { WRITER_SOURCE_KMS_KEY_ARN: 'a'.repeat(2049) }],
    ['no region anywhere', { WRITER_SOURCE_KMS_REGION: undefined }],
    ['an empty region', { WRITER_SOURCE_KMS_REGION: '' }],
    ['a malformed region', { WRITER_SOURCE_KMS_REGION: 'moon-base' }],
    ['a region with trailing text', { WRITER_SOURCE_KMS_REGION: 'us-west-2 ' }],
  ])('is NOT configured with %s', (_n, extra) => {
    aws(extra);
    expect(writerSourceKeyProviderConfigured()).toBe(false);
  });

  it('accepts the region from AWS_REGION or AWS_DEFAULT_REGION when WRITER_SOURCE_KMS_REGION is absent (the same fallbacks the client uses)', () => {
    aws({ WRITER_SOURCE_KMS_REGION: undefined, AWS_REGION: 'eu-central-1' });
    expect(writerSourceKeyProviderConfigured()).toBe(true);
    aws({ WRITER_SOURCE_KMS_REGION: undefined, AWS_REGION: undefined, AWS_DEFAULT_REGION: 'us-gov-west-1' });
    expect(writerSourceKeyProviderConfigured()).toBe(true);
  });

  it('prefers WRITER_SOURCE_KMS_REGION: a malformed one is not rescued by a valid fallback (the client would throw)', () => {
    aws({ WRITER_SOURCE_KMS_REGION: 'moon-base', AWS_REGION: 'us-west-2' });
    expect(writerSourceKeyProviderConfigured()).toBe(false);
  });

  it('reads no credential and leaks nothing: it returns a boolean', () => {
    aws();
    env.AWS_SECRET_ACCESS_KEY = 'FICTIONALSECRET';
    expect(typeof writerSourceKeyProviderConfigured()).toBe('boolean');
    delete env.AWS_SECRET_ACCESS_KEY;
  });
});

describe('local-test', () => {
  it('is configured only under NODE_ENV=test', () => {
    env.WRITER_SOURCE_KEY_PROVIDER = 'local-test';
    env.NODE_ENV = 'test';
    expect(writerSourceKeyProviderConfigured()).toBe(true);
    env.NODE_ENV = 'production';
    expect(writerSourceKeyProviderConfigured()).toBe(false);
    env.NODE_ENV = 'development';
    expect(writerSourceKeyProviderConfigured()).toBe(false);
  });
});
