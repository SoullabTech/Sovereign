/**
 * D9 — the KMS client has explicit connect and request timeouts.
 *
 * Why it matters: claimArrival makes a KMS Decrypt call while holding FOR UPDATE row locks on the arrival and the Work.
 * Before this change the client carried only `{ region, maxAttempts: 3 }`, so a stalled response had no bound and could
 * pin database connections indefinitely (measured: both rows stay locked while the call is in flight).
 *
 * The last test is behavioural: a REAL SDK client talks to a local server that accepts the connection and never answers.
 * It never leaves the host: the endpoint is a loopback override AND the region is deliberately nonexistent, so even if the
 * override were ignored the name would not resolve.
 */
import net from 'node:net';
import type { KMSClient, KMSClientConfig } from '@aws-sdk/client-kms';
import {
  clearSourceKeyAuthorityCachesForTests,
  generateSourceDataKey,
  setSourceKmsClientFactoryForTests,
} from '../sourceKeyAuthority';

const KEY_ARN = 'arn:aws:kms:us-east-1:000000000000:key/00000000-0000-4000-8000-000000000001';
const CONTEXT_HASH = 'cd'.repeat(32);
const TOUCHED = [
  'WRITER_SOURCE_KEY_PROVIDER', 'WRITER_SOURCE_KMS_KEY_ARN', 'WRITER_SOURCE_KMS_REGION',
  'WRITER_SOURCE_KMS_CONNECT_TIMEOUT_MS', 'WRITER_SOURCE_KMS_REQUEST_TIMEOUT_MS',
  'AWS_ENDPOINT_URL', 'AWS_ENDPOINT_URL_KMS', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN',
  'AWS_PROFILE', 'AWS_REGION', 'AWS_DEFAULT_REGION', 'HTTPS_PROXY', 'https_proxy', 'HTTP_PROXY', 'http_proxy',
] as const;
const SAVED: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const k of TOUCHED) { SAVED[k] = process.env[k]; delete process.env[k]; }
  process.env.WRITER_SOURCE_KEY_PROVIDER = 'aws-kms';
  process.env.WRITER_SOURCE_KMS_KEY_ARN = KEY_ARN;
  process.env.WRITER_SOURCE_KMS_REGION = 'us-east-1';
  clearSourceKeyAuthorityCachesForTests();
});
afterEach(() => {
  clearSourceKeyAuthorityCachesForTests();
  for (const k of TOUCHED) { if (SAVED[k] === undefined) delete process.env[k]; else process.env[k] = SAVED[k]; }
});

/** Captures the config the library hands to the client constructor, and answers nothing. */
function captureConfig(): { configs: KMSClientConfig[] } {
  const configs: KMSClientConfig[] = [];
  setSourceKmsClientFactoryForTests((config) => {
    configs.push(config);
    return { send: async () => { throw new Error('captured'); }, destroy: () => undefined } as unknown as KMSClient;
  });
  return { configs };
}

it('builds the client with explicit connect and request timeouts, not just a region and attempt count', async () => {
  const { configs } = captureConfig();
  await generateSourceDataKey(CONTEXT_HASH).catch(() => undefined);
  expect(configs).toHaveLength(1);
  expect(configs[0]).toEqual({
    region: 'us-east-1',
    maxAttempts: 3,
    requestHandler: { connectionTimeout: 3000, requestTimeout: 10000, throwOnRequestTimeout: true },
  });
});

it('honours bounded environment overrides', async () => {
  process.env.WRITER_SOURCE_KMS_CONNECT_TIMEOUT_MS = '1500';
  process.env.WRITER_SOURCE_KMS_REQUEST_TIMEOUT_MS = '4000';
  const { configs } = captureConfig();
  await generateSourceDataKey(CONTEXT_HASH).catch(() => undefined);
  expect((configs[0] as any).requestHandler).toEqual({ connectionTimeout: 1500, requestTimeout: 4000, throwOnRequestTimeout: true });
});

it.each([
  ['WRITER_SOURCE_KMS_CONNECT_TIMEOUT_MS', '0'],
  ['WRITER_SOURCE_KMS_CONNECT_TIMEOUT_MS', '100'],
  ['WRITER_SOURCE_KMS_CONNECT_TIMEOUT_MS', '31000'],
  ['WRITER_SOURCE_KMS_REQUEST_TIMEOUT_MS', '499'],
  ['WRITER_SOURCE_KMS_REQUEST_TIMEOUT_MS', '60001'],
  ['WRITER_SOURCE_KMS_REQUEST_TIMEOUT_MS', '10s'],
  ['WRITER_SOURCE_KMS_REQUEST_TIMEOUT_MS', '-5'],
  ['WRITER_SOURCE_KMS_REQUEST_TIMEOUT_MS', '1e3'],
])('refuses a malformed or out-of-range %s=%s instead of silently running with no limit', async (name, value) => {
  process.env[name] = value;
  const { configs } = captureConfig();
  await expect(generateSourceDataKey(CONTEXT_HASH)).rejects.toThrow('writer_source_kms_timeout_invalid');
  expect(configs).toHaveLength(0); // no client was built
});

it('a REAL client gives up on a server that accepts the connection and never answers', async () => {
  let connections = 0;
  const sockets: net.Socket[] = [];
  const server = net.createServer((s) => { connections++; sockets.push(s); /* read nothing, write nothing */ });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  const port = (server.address() as net.AddressInfo).port;
  try {
    // Nonexistent region: if the endpoint override were ever ignored the host name would not resolve.
    process.env.WRITER_SOURCE_KMS_REGION = 'zz-nowhere-1';
    process.env.AWS_ENDPOINT_URL_KMS = `http://127.0.0.1:${port}`;
    process.env.AWS_ENDPOINT_URL = `http://127.0.0.1:${port}`;
    process.env.AWS_ACCESS_KEY_ID = 'fictional-not-a-credential';
    process.env.AWS_SECRET_ACCESS_KEY = 'fictional-not-a-credential';
    process.env.WRITER_SOURCE_KMS_CONNECT_TIMEOUT_MS = '250';
    process.env.WRITER_SOURCE_KMS_REQUEST_TIMEOUT_MS = '500';
    const started = Date.now();
    await expect(generateSourceDataKey(CONTEXT_HASH)).rejects.toBeDefined();
    const elapsed = Date.now() - started;
    expect(connections).toBeGreaterThanOrEqual(1); // it really reached the stalled server, not some earlier failure
    expect(elapsed).toBeLessThan(20_000); // 3 attempts at ~0.5 s plus back-off; without a timeout this never returns
  } finally {
    for (const s of sockets) s.destroy();
    await new Promise<void>((r) => server.close(() => r()));
  }
}, 40_000);
