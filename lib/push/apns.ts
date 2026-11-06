/**
 * APNs (Apple Push Notification service) sender — built DARK (P1).
 * ================================================================
 * Nothing calls this yet. It exists so the server side can be reviewed and
 * tested before any Apple credential or iOS build exists.
 *
 * Laws this file enforces by construction:
 *   - CONTENT-FREE. A push may carry only a notice from the closed set below,
 *     whose copy is fixed here. There is no parameter through which message
 *     text, a name, a memory or Sanctuary content could travel to Apple.
 *   - The signing key is a FILE (owner-only, regular, bounded), never an
 *     environment value — the same pattern as the SMTP token.
 *   - Push is best-effort. A result is "accepted by Apple", never "seen".
 *     Callers must keep a durable record elsewhere (#ops-alerts, Monitor).
 *   - A dead token is revoked, never retried forever.
 */
import { createSign } from 'node:crypto';
import { closeSync, constants, fstatSync, openSync, readFileSync } from 'node:fs';
import { connect as http2Connect } from 'node:http2';
import { query } from '@/lib/db/postgres';

/** The only things a push may say. Copy is fixed; callers choose a key, not words. */
export const PUSH_NOTICES = {
  ops_email_failing: { title: 'Soullab', body: 'Email sending is failing. Open the Monitor.' },
  ops_test: { title: 'Soullab', body: 'Test notification. No action needed.' },
} as const;

export type PushNoticeKey = keyof typeof PUSH_NOTICES;
export type ApnsEnvironment = 'sandbox' | 'production';

export interface ApnsConfig {
  keyPem: string;
  keyId: string;
  teamId: string;
  topic: string;
}

const HOSTS: Record<ApnsEnvironment, string> = {
  production: 'https://api.push.apple.com',
  sandbox: 'https://api.sandbox.push.apple.com',
};

export function readOwnerOnlyFile(path: string): string {
  const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const stat = fstatSync(fd);
    if (!stat.isFile() || stat.size > 16_384) throw new Error('APNS_KEY_FILE is not a bounded regular file');
    if ((stat.mode & 0o077) !== 0) throw new Error('APNS_KEY_FILE must not be readable by group or other users');
    if (typeof process.getuid === 'function' && stat.uid !== process.getuid()) {
      throw new Error('APNS_KEY_FILE must be owned by the running user');
    }
    const value = readFileSync(fd, 'utf8').trim();
    if (!value) throw new Error('APNS_KEY_FILE is empty');
    return value;
  } finally {
    closeSync(fd);
  }
}

/** null = not configured (a normal, quiet state). Throws only on a half-configured or unsafe setup. */
export function resolveApnsConfig(env: NodeJS.ProcessEnv = process.env): ApnsConfig | null {
  const file = env.APNS_KEY_FILE?.trim();
  const keyId = env.APNS_KEY_ID?.trim();
  const teamId = env.APNS_TEAM_ID?.trim();
  if (!file && !keyId && !teamId) return null;
  if (!file || !keyId || !teamId) throw new Error('APNS_KEY_FILE, APNS_KEY_ID and APNS_TEAM_ID are all required');
  return { keyPem: readOwnerOnlyFile(file), keyId, teamId, topic: env.APNS_TOPIC?.trim() || 'life.soullab.maia' };
}

/**
 * ES256 provider token, signed with node:crypto (IEEE P1363 r||s, as JWS requires).
 * Not `jose`: it is ESM-only and this module must stay testable under the
 * project's jest setup.
 */
export async function buildApnsJwt(config: ApnsConfig, nowSeconds: number = Math.floor(Date.now() / 1000)): Promise<string> {
  const b64 = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const signingInput = `${b64({ alg: 'ES256', kid: config.keyId })}.${b64({ iss: config.teamId, iat: nowSeconds })}`;
  const signature = createSign('SHA256')
    .update(signingInput)
    .sign({ key: config.keyPem, dsaEncoding: 'ieee-p1363' });
  return `${signingInput}.${signature.toString('base64url')}`;
}

export type PushOutcome =
  | { ok: true }
  | { ok: false; reason: 'dead_token' | 'provider_auth' | 'retryable' | 'rejected'; status: number; apnsReason?: string };

export interface ApnsRequest {
  host: string;
  token: string;
  topic: string;
  jwt: string;
  payload: string;
}

export type ApnsTransport = (req: ApnsRequest) => Promise<{ status: number; reason?: string }>;

export const http2Transport: ApnsTransport = (req) =>
  new Promise((resolve, reject) => {
    const client = http2Connect(req.host);
    client.on('error', reject);
    const stream = client.request({
      ':method': 'POST',
      ':path': `/3/device/${req.token}`,
      authorization: `bearer ${req.jwt}`,
      'apns-topic': req.topic,
      'apns-push-type': 'alert',
      'apns-priority': '10',
    });
    let status = 0;
    let body = '';
    stream.setEncoding('utf8');
    stream.on('response', (headers) => { status = Number(headers[':status']); });
    stream.on('data', (chunk) => { body += chunk; });
    stream.on('end', () => {
      client.close();
      let reason: string | undefined;
      try { reason = body ? (JSON.parse(body) as { reason?: string }).reason : undefined; } catch { /* no body */ }
      resolve({ status, reason });
    });
    stream.on('error', (err) => { client.close(); reject(err); });
    stream.setTimeout(10_000, () => { stream.close(); });
    stream.end(req.payload);
  });

export function classifyApnsResponse(status: number, reason?: string): PushOutcome {
  if (status === 200) return { ok: true };
  if (status === 410 || reason === 'BadDeviceToken' || reason === 'Unregistered' || reason === 'DeviceTokenNotForTopic') {
    return { ok: false, reason: 'dead_token', status, apnsReason: reason };
  }
  if (status === 403 || reason === 'InvalidProviderToken' || reason === 'ExpiredProviderToken') {
    return { ok: false, reason: 'provider_auth', status, apnsReason: reason };
  }
  if (status === 429 || status >= 500 || status === 0) return { ok: false, reason: 'retryable', status, apnsReason: reason };
  return { ok: false, reason: 'rejected', status, apnsReason: reason };
}

export async function sendApnsPush(
  device: { token: string; environment: ApnsEnvironment },
  notice: PushNoticeKey,
  deps: { config: ApnsConfig; transport?: ApnsTransport; jwt?: string },
): Promise<PushOutcome> {
  const copy = PUSH_NOTICES[notice];
  if (!copy) throw new Error('unknown push notice');
  const jwt = deps.jwt ?? (await buildApnsJwt(deps.config));
  const payload = JSON.stringify({ aps: { alert: { title: copy.title, body: copy.body }, sound: 'default' } });
  try {
    const res = await (deps.transport ?? http2Transport)({
      host: HOSTS[device.environment],
      token: device.token,
      topic: deps.config.topic,
      jwt,
      payload,
    });
    return classifyApnsResponse(res.status, res.reason);
  } catch {
    return { ok: false, reason: 'retryable', status: 0 };
  }
}

export interface PushToMemberResult {
  attempted: number;
  accepted: number;
  revoked: number;
  failed: number;
  configured: boolean;
}

/**
 * Send one fixed notice to every active device a member has registered.
 * No caller exists in P1. Never throws: a push fault must not affect anything else.
 */
export async function pushToMember(
  memberId: string,
  notice: PushNoticeKey,
  deps: { config?: ApnsConfig | null; transport?: ApnsTransport } = {},
): Promise<PushToMemberResult> {
  const none: PushToMemberResult = { attempted: 0, accepted: 0, revoked: 0, failed: 0, configured: false };
  try {
    const config = deps.config === undefined ? resolveApnsConfig() : deps.config;
    if (!config) return none;
    const jwt = await buildApnsJwt(config);
    const devices = await query<{ id: string; token: string; environment: ApnsEnvironment }>(
      `SELECT id, token, environment FROM member_push_devices WHERE member_id = $1 AND revoked_at IS NULL`,
      [memberId],
    );
    const result: PushToMemberResult = { ...none, configured: true };
    for (const device of devices.rows) {
      result.attempted += 1;
      const outcome = await sendApnsPush(device, notice, { config, transport: deps.transport, jwt });
      if (outcome.ok) {
        result.accepted += 1;
      } else if (outcome.reason === 'dead_token') {
        result.revoked += 1;
        await query(
          `UPDATE member_push_devices SET revoked_at = now(), revoked_reason = $2 WHERE id = $1`,
          [device.id, outcome.apnsReason ?? 'dead_token'],
        ).catch(() => {});
      } else {
        result.failed += 1;
      }
    }
    return result;
  } catch {
    return none;
  }
}
