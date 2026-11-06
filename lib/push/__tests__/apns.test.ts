import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { generateKeyPairSync, createVerify } from 'node:crypto';
import { mkdtempSync, writeFileSync, chmodSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const mockQuery = jest.fn<(...args: unknown[]) => Promise<{ rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({ query: (...args: unknown[]) => mockQuery(...args) }));

import {
  PUSH_NOTICES, buildApnsJwt, classifyApnsResponse, pushToMember, readOwnerOnlyFile,
  resolveApnsConfig, sendApnsPush, type ApnsConfig, type ApnsRequest,
} from '../apns';

const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const config: ApnsConfig = { keyPem: pem, keyId: 'ABC123DEFG', teamId: 'TEAM123456', topic: 'life.soullab.maia' };
const TOKEN = 'a'.repeat(64);

describe('APNs sender (dark)', () => {
  beforeEach(() => mockQuery.mockReset());

  it('signs an ES256 token carrying the key id and team id', async () => {
    const jwt = await buildApnsJwt(config, 1_700_000_000);
    const [h, p] = jwt.split('.').slice(0, 2).map((x) => JSON.parse(Buffer.from(x, 'base64url').toString()));
    expect(h).toMatchObject({ alg: 'ES256', kid: 'ABC123DEFG' });
    expect(p).toMatchObject({ iss: 'TEAM123456', iat: 1_700_000_000 });
    const [hh, pp, sig] = jwt.split('.');
    const ok = createVerify('SHA256').update(`${hh}.${pp}`).verify(
      { key: publicKey, dsaEncoding: 'ieee-p1363' }, Buffer.from(sig, 'base64url'));
    expect(ok).toBe(true);
  });

  it('classifies Apple responses', () => {
    expect(classifyApnsResponse(200)).toEqual({ ok: true });
    expect(classifyApnsResponse(410, 'Unregistered')).toMatchObject({ ok: false, reason: 'dead_token' });
    expect(classifyApnsResponse(400, 'BadDeviceToken')).toMatchObject({ reason: 'dead_token' });
    expect(classifyApnsResponse(403, 'InvalidProviderToken')).toMatchObject({ reason: 'provider_auth' });
    expect(classifyApnsResponse(429)).toMatchObject({ reason: 'retryable' });
    expect(classifyApnsResponse(503)).toMatchObject({ reason: 'retryable' });
    expect(classifyApnsResponse(400, 'PayloadTooLarge')).toMatchObject({ reason: 'rejected' });
  });

  it('a push can only carry a fixed notice: no free text parameter exists', async () => {
    let seen: ApnsRequest | undefined;
    await sendApnsPush({ token: TOKEN, environment: 'production' }, 'ops_email_failing', {
      config, jwt: 'jwt', transport: async (r) => { seen = r; return { status: 200 }; },
    });
    expect(seen?.host).toBe('https://api.push.apple.com');
    expect(JSON.parse(seen!.payload).aps.alert).toEqual(PUSH_NOTICES.ops_email_failing);
    expect(sendApnsPush.length).toBeLessThanOrEqual(3);
  });

  it('uses the sandbox host for sandbox devices', async () => {
    let host = '';
    await sendApnsPush({ token: TOKEN, environment: 'sandbox' }, 'ops_test', {
      config, jwt: 'jwt', transport: async (r) => { host = r.host; return { status: 200 }; },
    });
    expect(host).toBe('https://api.sandbox.push.apple.com');
  });

  it('a transport fault is reported as retryable, never thrown', async () => {
    const r = await sendApnsPush({ token: TOKEN, environment: 'production' }, 'ops_test', {
      config, jwt: 'jwt', transport: async () => { throw new Error('socket'); },
    });
    expect(r).toMatchObject({ ok: false, reason: 'retryable' });
  });

  it('pushToMember is quiet when APNs is not configured', async () => {
    const r = await pushToMember('m1', 'ops_test', { config: null });
    expect(r).toEqual({ attempted: 0, accepted: 0, revoked: 0, failed: 0, configured: false });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('pushToMember counts accepted, revokes dead tokens, counts failures', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [
        { id: 'd1', token: '1'.repeat(64), environment: 'production' },
        { id: 'd2', token: '2'.repeat(64), environment: 'production' },
        { id: 'd3', token: '3'.repeat(64), environment: 'production' },
      ] })
      .mockResolvedValue({ rows: [] });
    const replies = [{ status: 200 }, { status: 410, reason: 'Unregistered' }, { status: 503 }];
    let i = 0;
    const r = await pushToMember('m1', 'ops_test', { config, transport: async () => replies[i++] });
    expect(r).toEqual({ attempted: 3, accepted: 1, revoked: 1, failed: 1, configured: true });
    const revoke = mockQuery.mock.calls.find((c) => String(c[0]).includes('UPDATE member_push_devices'));
    expect((revoke![1] as string[])[0]).toBe('d2');
  });

  it('pushToMember never throws when the database fails', async () => {
    mockQuery.mockRejectedValue(new Error('db'));
    const r = await pushToMember('m1', 'ops_test', { config, transport: async () => ({ status: 200 }) });
    expect(r.attempted).toBe(0);
  });

  describe('signing key file', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'apns-'));
    it('accepts an owner-only regular file', () => {
      const f = path.join(dir, 'ok.p8'); writeFileSync(f, pem); chmodSync(f, 0o600);
      expect(readOwnerOnlyFile(f)).toContain('BEGIN PRIVATE KEY');
    });
    it('refuses a group- or world-readable file', () => {
      const f = path.join(dir, 'open.p8'); writeFileSync(f, pem); chmodSync(f, 0o644);
      expect(() => readOwnerOnlyFile(f)).toThrow(/group or other/);
    });
    it('refuses a symlink', () => {
      const f = path.join(dir, 'real.p8'); writeFileSync(f, pem); chmodSync(f, 0o600);
      const l = path.join(dir, 'link.p8'); symlinkSync(f, l);
      expect(() => readOwnerOnlyFile(l)).toThrow();
    });
    it('is unconfigured when nothing is set, and refuses a half-configured setup', () => {
      expect(resolveApnsConfig({} as NodeJS.ProcessEnv)).toBeNull();
      expect(() => resolveApnsConfig({ APNS_KEY_ID: 'x' } as unknown as NodeJS.ProcessEnv)).toThrow(/all required/);
    });
  });
});
