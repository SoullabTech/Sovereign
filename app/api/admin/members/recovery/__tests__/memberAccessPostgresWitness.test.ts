/**
 * Class A PostgreSQL witness. Runs ONLY against the ephemeral CI postgres
 * service at the hardcoded fictional DATABASE_URL; refuses any other database.
 * The real issuance/redemption handlers and real PostgreSQL transactions run.
 * Email, rate-limiter and bcrypt are mocked; no real recipients or credentials.
 */
import { beforeAll, afterAll, beforeEach, describe, it, expect, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { Pool } from 'pg';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const FOUNDER = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TARGET = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const MEMBER_EMAIL = 'fictional-member@example.invalid';
const URL = 'postgresql://postgres:postgres@127.0.0.1:5432/postgres';
type FakeMailResult = { success: boolean; provider?: string; id?: string };
const mockSend = jest.fn<(_opts: unknown) => Promise<FakeMailResult>>(async () =>
  ({ success: true, provider: 'smtp', id: 'FICTIONAL-SMTP-ID' }));
const fictionalSmtpProvider = {
  name: 'smtp',
  isConfigured: () => true,
  send: jest.fn(async () => ({ accepted: false as const, rawError: 'never send real mail' })),
};
jest.mock('@/lib/email/providers', () => ({
  __esModule: true, getEmailProvider: () => fictionalSmtpProvider,
}));

jest.mock('@/lib/email/sendEmail', () => ({
  __esModule: true, SENDERS: { noreply: 'Soullab <noreply@soullab.life>' },
  sendEmail: (opts: unknown) => mockSend(opts),
}));
jest.mock('@/lib/auth/rateLimiter', () => ({
  __esModule: true,
  getClientIP: () => '198.51.100.55',
  checkRateLimit: async () => ({ allowed: true }),
}));
jest.mock('@/lib/auth/passwordUtils', () => ({
  __esModule: true, hashPassword: async () => 'FICTIONAL_HASHED_PASSWORD',
}));

import { query, closePool } from '@/lib/db/postgres';
import { POST as issuePOST } from '../route';
import { POST as founderVerifyPOST } from '../verify-email/route';
import { POST as redeemPOST } from '@/app/api/members/admin-recovery/route';
import { POST as verifyEmailPOST } from '@/app/api/members/verify-email/route';
import { POST as publicVerificationPOST } from '@/app/api/members/send-verification/route';

let scratch: Pool;
function fake(path: string, body: unknown, signedIn = false): NextRequest {
  return new NextRequest('https://soullab.life' + path, {
    method: 'POST',
    headers: {
      origin: 'https://soullab.life',
      'content-type': 'application/json',
      ...(signedIn ? { 'x-session-token': 'FICTIONAL_VERIFIED_FOUNDER_SESSION' } : {}),
    },
    body: JSON.stringify(body),
  });
}
function tokenFromEmail(): string {
  const text = (mockSend.mock.calls.at(-1)?.[0] as { text?: string } | undefined)?.text || '';
  const token = text.match(/#token=([a-f0-9]{64})/)?.[1];
  if (!token) throw new Error('Missing fictional email token');
  return token;
}
async function issue() {
  return issuePOST(fake('/api/admin/members/recovery',
    { memberId: TARGET, method: 'email', reason: 'member_requested' }, true));
}
async function redeem(token: string) {
  return redeemPOST(fake('/api/members/admin-recovery',
    { token, newPassword: 'fictional full-length replacement password' }));
}

beforeAll(async () => {
  // A production, development, connector or tenant DB must NEVER be reached.
  if (process.env.DATABASE_URL !== URL || process.env.CI !== 'true') {
    throw new Error('Refused: recovery SQL witness requires the exact ephemeral CI PostgreSQL URL');
  }
  process.env.MEMBER_ACCESS_RECOVERY_ENABLED = '1';
  process.env.EMAIL_PROVIDER = 'smtp';
  scratch = new Pool({ connectionString: URL });
  await scratch.query(`
    CREATE TABLE members (
      id uuid PRIMARY KEY, username text, email text, admin_role text, password_hash text,
      password_changed_at timestamptz, updated_at timestamptz,
      email_verified boolean NOT NULL DEFAULT false,
      email_verified_at timestamptz,
      email_verification_token text,
      email_verification_sent_at timestamptz
    );
    CREATE TABLE auth_sessions (
      member_id uuid REFERENCES members(id), session_token text PRIMARY KEY,
      expires_at timestamptz NOT NULL, revoked boolean NOT NULL DEFAULT false
    );
    CREATE TABLE admin_access_log (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      via text NOT NULL, member_id uuid, admin_role text, route text, ip text
    );
  `);
  await scratch.query(readFileSync(resolve(process.cwd(),
    'database/migrations/20261018000001_admin_member_recovery_tokens.sql'), 'utf8'));
  await scratch.query(`
    INSERT INTO members(id,email,admin_role,password_hash) VALUES
      ('${FOUNDER}', 'founder@example.invalid', 'founder', 'EXISTING_FOUNDER_HASH'),
      ('${TARGET}', '${MEMBER_EMAIL}', NULL, 'EXISTING_MEMBER_HASH');
    INSERT INTO auth_sessions(member_id,session_token,expires_at,revoked) VALUES
      ('${FOUNDER}', 'FICTIONAL_VERIFIED_FOUNDER_SESSION', now()+interval '1 day', false),
      ('${TARGET}', 'FICTIONAL_OLD_MEMBER_SESSION', now()+interval '1 day', false);
  `);
}, 30000);

afterAll(async () => {
  if (scratch) await scratch.end();
  await closePool();
});

beforeEach(async () => {
  mockSend.mockReset();
  mockSend.mockResolvedValue({ success: true, provider: 'smtp', id: 'FICTIONAL-SMTP-ID' });
  process.env.EMAIL_PROVIDER = 'smtp';
  await query('DELETE FROM admin_member_recovery_tokens');
  await query('DELETE FROM admin_access_log');
  await query('UPDATE auth_sessions SET revoked = false');
  await query('UPDATE members SET email=$1, email_verified=FALSE, email_verified_at=NULL, email_verification_token=NULL, email_verification_sent_at=NULL WHERE id=$2',
    [MEMBER_EMAIL, TARGET]);
  await query("UPDATE members SET email_verification_token='FICTIONAL-VERIFY-TOKEN', email_verification_sent_at=clock_timestamp() WHERE id=$1", [TARGET]);
  await query('UPDATE members SET email_verified=TRUE, email_verification_token=NULL WHERE id=$1', [TARGET]);
  await query(`UPDATE members SET password_hash='EXISTING_MEMBER_HASH', password_changed_at=NULL WHERE id=$1`, [TARGET]);
});

describe('founder-admin verification issuance — real ephemeral PostgreSQL', () => {
  function verifyRequest(data: Record<string, unknown> = { memberId: TARGET, confirmed: true }, signedIn = true) {
    return fake('/api/admin/members/recovery/verify-email', data, signedIn);
  }
  async function resetToUnverified() {
    await query('UPDATE members SET email_verified=FALSE, email_verification_sent_at=NULL WHERE id=$1', [TARGET]);
  }

  it('refuses a signed-out, shared-password-only, or unconfirmed caller before sending', async () => {
    await resetToUnverified();
    const absent = await founderVerifyPOST(verifyRequest(undefined, false));
    expect(absent.status).toBe(401);
    process.env.LABTOOLS_ADMIN_PASSWORD = 'FICTIONAL-SHARED-PASSWORD';
    const shared = new NextRequest('https://soullab.life/api/admin/members/recovery/verify-email', {
      method: 'POST',
      headers: {
        origin: 'https://soullab.life', 'content-type': 'application/json',
        'x-admin-password': 'FICTIONAL-SHARED-PASSWORD',
      },
      body: JSON.stringify({ memberId: TARGET, confirmed: true }),
    });
    try {
      const withLegacyPassword = await founderVerifyPOST(shared);
      expect(withLegacyPassword.status).toBe(403);
    } finally {
      delete process.env.LABTOOLS_ADMIN_PASSWORD;
    }
    expect((await founderVerifyPOST(verifyRequest({ memberId: TARGET, confirmed: false }))).status).toBe(400);
    expect((await founderVerifyPOST(verifyRequest({ memberId: TARGET, confirmed: true, email: 'outsider@example.invalid' }))).status).toBe(400);
    const check = await query('SELECT email_verification_token FROM members WHERE id=$1', [TARGET]);
    expect(check.rows[0].email_verification_token).toBeNull();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('requires the default-OFF feature flag and explicit SMTP configuration', async () => {
    await resetToUnverified();
    delete process.env.MEMBER_ACCESS_RECOVERY_ENABLED;
    expect((await founderVerifyPOST(verifyRequest())).status).toBe(503);
    process.env.MEMBER_ACCESS_RECOVERY_ENABLED = '1';
    delete process.env.EMAIL_PROVIDER;
    expect((await founderVerifyPOST(verifyRequest())).status).toBe(503);
    process.env.EMAIL_PROVIDER = 'resend';
    expect((await founderVerifyPOST(verifyRequest())).status).toBe(503);
    process.env.EMAIL_PROVIDER = 'smtp';
    expect(mockSend).not.toHaveBeenCalled();
    expect((await query('SELECT email_verification_token FROM members WHERE id=$1', [TARGET])).rows[0].email_verification_token).toBeNull();
  });

  it('sends only to on-file email through accepted SMTP and never exposes the bearer', async () => {
    await resetToUnverified();
    const answer = await founderVerifyPOST(verifyRequest());
    expect(answer.status).toBe(200);
    const body = await answer.json();
    expect(body).toMatchObject({ success: true, method: 'email', delivery: 'provider_accepted', verificationRequired: true });
    expect(body.token).toBeUndefined();
    expect(body.verificationLink).toBeUndefined();
    const call = mockSend.mock.calls.at(-1)?.[0] as {
      from?: string; to?: string; purpose?: string; provider?: { name: string }; text?: string;
    };
    expect(call.from).toBe('Soullab <noreply@soullab.life>');
    expect(call.to).toBe(MEMBER_EMAIL);
    expect(call.purpose).toBe('auth:verification');
    expect(call.provider?.name).toBe('smtp');
    expect(call.text).toContain('https://soullab.life/verify-email#token=');
    expect(JSON.stringify(body)).not.toContain('#token=');
    const record = await query('SELECT email_verification_token,email_verification_sent_at FROM members WHERE id=$1', [TARGET]);
    expect(record.rows[0].email_verification_token).toMatch(/^[a-f0-9]{64}$/);
    expect(record.rows[0].email_verification_sent_at).not.toBeNull();
    const verify = await verifyEmailPOST(fake('/api/members/verify-email', { token: record.rows[0].email_verification_token }));
    expect(verify.status).toBe(200);
    expect((await issue()).status).toBe(200);
  });

  it('enforces durable cooldown on a second request for the same member', async () => {
    await resetToUnverified();
    expect((await founderVerifyPOST(verifyRequest())).status).toBe(200);
    const first = (await query('SELECT email_verification_token FROM members WHERE id=$1', [TARGET])).rows[0].email_verification_token;
    expect((await founderVerifyPOST(verifyRequest())).status).toBe(429);
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect((await query('SELECT email_verification_token FROM members WHERE id=$1', [TARGET])).rows[0].email_verification_token).toBe(first);
  });

  it('retires rejected SMTP email token; can retry without exposing the link', async () => {
    await resetToUnverified();
    mockSend.mockResolvedValueOnce({ success: false, provider: 'smtp' });
    expect((await founderVerifyPOST(verifyRequest())).status).toBe(502);
    const record = await query('SELECT email_verification_token,email_verification_sent_at FROM members WHERE id=$1', [TARGET]);
    expect(record.rows[0].email_verification_token).toBeNull();
    expect(record.rows[0].email_verification_sent_at).toBeNull();
    expect((await founderVerifyPOST(verifyRequest())).status).toBe(200);
  });

  it('denies missing on-file email and does not permit operator destination override', async () => {
    await query('UPDATE members SET email=NULL, email_verified=FALSE, email_verification_sent_at=NULL WHERE id=$1', [TARGET]);
    expect((await founderVerifyPOST(verifyRequest())).status).toBe(409);
    expect(mockSend).not.toHaveBeenCalled();
  });
});

describe('public registration verifier — SMTP-only transport compatibility', () => {
  it('refuses missing or legacy Resend provider without minting a verification token', async () => {
    for (const setting of [undefined, 'resend', 'memory']) {
      await query('UPDATE members SET email_verified=FALSE,email_verification_token=NULL,email_verification_sent_at=NULL WHERE id=$1', [TARGET]);
      if (setting === undefined) delete process.env.EMAIL_PROVIDER;
      else process.env.EMAIL_PROVIDER = setting;
      const reply = await publicVerificationPOST(fake('/api/members/send-verification', { memberId: TARGET, email: MEMBER_EMAIL }));
      expect(reply.status).toBe(503);
      const member = await query('SELECT email_verification_token FROM members WHERE id=$1', [TARGET]);
      expect(member.rows[0].email_verification_token).toBeNull();
    }
    process.env.EMAIL_PROVIDER = 'smtp';
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('sends ONLY to account record from approved noreply via pinned SMTP provider', async () => {
    await query('UPDATE members SET email_verified=FALSE,email_verification_token=NULL,email_verification_sent_at=NULL WHERE id=$1', [TARGET]);
    const refused = await publicVerificationPOST(fake('/api/members/send-verification', {
      memberId: TARGET, email: 'attacker@example.invalid',
    }));
    expect(refused.status).toBe(409);
    expect(mockSend).not.toHaveBeenCalled();

    const accepted = await publicVerificationPOST(fake('/api/members/send-verification', {
      memberId: TARGET, email: MEMBER_EMAIL,
    }));
    expect(accepted.status).toBe(200);
    const opts = mockSend.mock.calls.at(-1)?.[0] as {
      to?: string; from?: string; provider?: { name: string }; purpose?: string; html?: string;
    };
    expect(opts.to).toBe(MEMBER_EMAIL);
    expect(opts.from).toBe('Soullab <noreply@soullab.life>');
    expect(opts.provider?.name).toBe('smtp');
    expect(opts.purpose).toBe('auth:verification');
    expect(opts.html).toContain('https://soullab.life/verify-email#token=');
  });

  it('retires the exact unaccepted token and leaves the on-file email unchanged', async () => {
    await query('UPDATE members SET email_verified=FALSE,email_verification_token=NULL,email_verification_sent_at=NULL WHERE id=$1', [TARGET]);
    mockSend.mockResolvedValueOnce({ success: true, provider: 'resend', id: 'FICTIONAL-WRONG-TRANSPORT' });
    const result = await publicVerificationPOST(fake('/api/members/send-verification', { memberId: TARGET }));
    expect(result.status).toBe(502);
    const row = await query('SELECT email,email_verification_token,email_verification_sent_at FROM members WHERE id=$1', [TARGET]);
    expect(row.rows[0].email).toBe(MEMBER_EMAIL);
    expect(row.rows[0].email_verification_token).toBeNull();
    expect(row.rows[0].email_verification_sent_at).toBeNull();
  });
});

describe('atomic current-email verification route on real disposable PostgreSQL', () => {
  it('consumes the actual 64-hex verification token once and mints a recovery proof', async () => {
    const token = '3'.repeat(64);
    await query('UPDATE members SET email_verified=FALSE WHERE id=$1', [TARGET]);
    await query('UPDATE members SET email_verification_token=$1, email_verification_sent_at=clock_timestamp() WHERE id=$2', [token, TARGET]);
    const done = await verifyEmailPOST(fake('/api/members/verify-email', { token }));
    expect(done.status).toBe(200);
    const row = await query('SELECT email_verified,email_verified_at,recovery_email_verification_id,email_verification_token FROM members WHERE id=$1', [TARGET]);
    expect(row.rows[0].email_verified).toBe(true);
    expect(row.rows[0].email_verified_at).not.toBeNull();
    expect(row.rows[0].recovery_email_verification_id).not.toBeNull();
    expect(row.rows[0].email_verification_token).toBeNull();
    expect((await verifyEmailPOST(fake('/api/members/verify-email', { token }))).status).toBe(400);
    expect((await issue()).status).toBe(200);
  });

  it('refuses an obsolete verification token after a newer token is sent', async () => {
    const oldToken = '4'.repeat(64), newToken = '5'.repeat(64);
    await query('UPDATE members SET email_verified=FALSE WHERE id=$1', [TARGET]);
    await query('UPDATE members SET email_verification_token=$1, email_verification_sent_at=clock_timestamp() WHERE id=$2', [oldToken, TARGET]);
    await query('UPDATE members SET email_verification_token=$1, email_verification_sent_at=clock_timestamp() WHERE id=$2', [newToken, TARGET]);
    expect((await verifyEmailPOST(fake('/api/members/verify-email', { token: oldToken }))).status).toBe(400);
    const prior = await query('SELECT recovery_email_verification_id FROM members WHERE id=$1', [TARGET]);
    expect(prior.rows[0].recovery_email_verification_id).toBeNull();
    expect((await verifyEmailPOST(fake('/api/members/verify-email', { token: newToken }))).status).toBe(200);
    expect((await issue()).status).toBe(200);
  });

  it('refuses an old verification link after the email address has changed', async () => {
    const token = '6'.repeat(64);
    await query('UPDATE members SET email_verified=FALSE WHERE id=$1', [TARGET]);
    await query('UPDATE members SET email_verification_token=$1, email_verification_sent_at=clock_timestamp() WHERE id=$2', [token, TARGET]);
    await query('UPDATE members SET email=$1 WHERE id=$2', ['changed@example.invalid', TARGET]);
    expect((await verifyEmailPOST(fake('/api/members/verify-email', { token }))).status).toBe(400);
    expect((await issue()).status).toBe(409);
    expect(mockSend).not.toHaveBeenCalled();
  });
});

describe('verified CURRENT email proof and bound recovery', () => {
  it('prevents direct SQL assignment from forging a recovery email proof', async () => {
    const initial = await query('SELECT recovery_email_verification_id FROM members WHERE id=$1', [TARGET]);
    expect(initial.rows[0].recovery_email_verification_id).not.toBeNull();
    const forged = '99999999-9999-4999-8999-999999999999';
    await query('UPDATE members SET recovery_email_verification_id=$1 WHERE id=$2', [forged, TARGET]);
    const result = await query('SELECT recovery_email_verification_id FROM members WHERE id=$1', [TARGET]);
    expect(result.rows[0].recovery_email_verification_id).toEqual(initial.rows[0].recovery_email_verification_id);
    expect(result.rows[0].recovery_email_verification_id).not.toEqual(forged);
  });

  it('denies legacy email_verified true without a fresh verification nonce', async () => {
    await query('UPDATE members SET email_verified=FALSE WHERE id=$1', [TARGET]);
    await query('UPDATE members SET email_verified=TRUE WHERE id=$1', [TARGET]);
    const row = await query('SELECT email_verified,recovery_email_verification_id FROM members WHERE id=$1', [TARGET]);
    expect(row.rows[0].email_verified).toBe(true);
    expect(row.rows[0].recovery_email_verification_id).toBeNull();
    expect((await issue()).status).toBe(409);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('binds a verified email to a fresh nonce and clears both if the address changes', async () => {
    const initial = await query('SELECT recovery_email_verification_id,email_verified FROM members WHERE id=$1', [TARGET]);
    expect(initial.rows[0].email_verified).toBe(true);
    expect(initial.rows[0].recovery_email_verification_id).not.toBeNull();

    expect((await issue()).status).toBe(200);
    const rawToken = tokenFromEmail();
    const issued = await query('SELECT email_verification_id FROM admin_member_recovery_tokens');
    expect(issued.rows[0].email_verification_id).toEqual(initial.rows[0].recovery_email_verification_id);

    await query('UPDATE members SET email=$1 WHERE id=$2', ['changed@example.invalid', TARGET]);
    const changed = await query('SELECT email_verified,email_verification_token,recovery_email_verification_id FROM members WHERE id=$1', [TARGET]);
    expect(changed.rows[0].email_verified).toBe(false);
    expect(changed.rows[0].recovery_email_verification_id).toBeNull();
    expect(changed.rows[0].email_verification_token).toBeNull();
    expect((await redeem(rawToken)).status).toBe(400);
    expect((await query('SELECT password_hash FROM members WHERE id=$1', [TARGET])).rows[0].password_hash).toBe('EXISTING_MEMBER_HASH');
  });

  it('re-verification of a changed email issues a DIFFERENT nonce; old link stays unusable', async () => {
    const first = await query('SELECT recovery_email_verification_id FROM members WHERE id=$1', [TARGET]);
    expect((await issue()).status).toBe(200);
    const oldLink = tokenFromEmail();
    await query('UPDATE members SET email=$1 WHERE id=$2', ['new-current@example.invalid', TARGET]);
    await query("UPDATE members SET email_verification_token='FICTIONAL-NEW-VERIFY-TOKEN', email_verification_sent_at=clock_timestamp() WHERE id=$1", [TARGET]);
    await query('UPDATE members SET email_verified=TRUE,email_verification_token=NULL WHERE id=$1', [TARGET]);
    const next = await query('SELECT recovery_email_verification_id FROM members WHERE id=$1', [TARGET]);
    expect(next.rows[0].recovery_email_verification_id).not.toBeNull();
    expect(next.rows[0].recovery_email_verification_id).not.toEqual(first.rows[0].recovery_email_verification_id);
    expect((await redeem(oldLink)).status).toBe(400);
    expect((await issue()).status).toBe(200);
  });

  it('refuses proof minted from expired or impossible future email verification tokens', async () => {
    await query('UPDATE members SET email_verified=FALSE WHERE id=$1', [TARGET]);
    await query("UPDATE members SET email_verification_token='EXPIRED', email_verification_sent_at=clock_timestamp()-interval '25 hours' WHERE id=$1", [TARGET]);
    await query('UPDATE members SET email_verified=TRUE,email_verification_token=NULL WHERE id=$1', [TARGET]);
    const expired = await query('SELECT recovery_email_verification_id FROM members WHERE id=$1', [TARGET]);
    expect(expired.rows[0].recovery_email_verification_id).toBeNull();
    await query('UPDATE members SET email_verified=FALSE WHERE id=$1', [TARGET]);
    await query("UPDATE members SET email_verification_token='FUTURE', email_verification_sent_at=clock_timestamp()+interval '1 hour' WHERE id=$1", [TARGET]);
    await query('UPDATE members SET email_verified=TRUE,email_verification_token=NULL WHERE id=$1', [TARGET]);
    const future = await query('SELECT recovery_email_verification_id FROM members WHERE id=$1', [TARGET]);
    expect(future.rows[0].recovery_email_verification_id).toBeNull();
    expect((await issue()).status).toBe(409);
    expect(mockSend).not.toHaveBeenCalled();
  });
});

describe('real PostgreSQL one-use admin recovery', () => {
  it('rejects private handoff before creating a database row or sending email', async () => {
    const rejected = await issuePOST(fake('/api/admin/members/recovery', {
      memberId: TARGET, method: 'private_handoff', reason: 'verified_in_person',
      identityVerified: true,
    }, true));
    expect(rejected.status).toBe(403);
    expect(mockSend).not.toHaveBeenCalled();
    const rows = await query('SELECT COUNT(*)::int AS n FROM admin_member_recovery_tokens');
    expect(rows.rows[0].n).toBe(0);
  });

  it('enforces email-only issuance invariants at the actual PostgreSQL CHECK constraints', async () => {
    const disallowed: Array<[string, string, string]> = [
      ['private_handoff', 'member_requested', 'pending'],
      ['email', 'verified_in_person', 'pending'],
      ['email', 'member_requested', 'handoff_issued'],
    ];
    const currentProof = await query('SELECT recovery_email_verification_id FROM members WHERE id=$1', [TARGET]);
    expect(currentProof.rows[0].recovery_email_verification_id).not.toBeNull();
    for (const [method, reason, status] of disallowed) {
      const attempt = scratch.query(
        `INSERT INTO admin_member_recovery_tokens
         (member_id, issued_by, email_verification_id, token_hash,
          delivery_method, reason_code, delivery_status, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, now() + interval '30 minutes')`,
        [TARGET, FOUNDER, currentProof.rows[0].recovery_email_verification_id,
          'f'.repeat(64), method, reason, status],
      );
      await expect(attempt).rejects.toMatchObject({ code: '23514' });
    }
    const rows = await query('SELECT COUNT(*)::int AS n FROM admin_member_recovery_tokens');
    expect(rows.rows[0].n).toBe(0);
  });

  it('checks founder-member authority in real session tables and denies bare identifiers', async () => {
    const unauth = await issuePOST(fake('/api/admin/members/recovery',
      { memberId: TARGET, method: 'email', reason: 'member_requested' }));
    expect(unauth.status).toBe(401);
    const count = await query('SELECT count(*)::int AS n FROM admin_member_recovery_tokens');
    expect(count.rows[0].n).toBe(0);
  });

  it('persists only a hashed bearer, marks acceptance, and consumes in the SAME transaction as the password and session revocation', async () => {
    const result = await issue();
    expect(result.status).toBe(200);
    const raw = tokenFromEmail();
    const issued = await query('SELECT token_hash, delivery_status FROM admin_member_recovery_tokens');
    expect(issued.rows).toHaveLength(1);
    expect(issued.rows[0].delivery_status).toBe('provider_accepted');
    expect(issued.rows[0].token_hash.trim()).toBe(createHash('sha256').update(raw).digest('hex'));
    expect(issued.rows[0].token_hash).not.toEqual(raw);
    const success = await redeem(raw);
    expect(success.status).toBe(200);
    const member = await query('SELECT password_hash, password_changed_at FROM members WHERE id=$1', [TARGET]);
    expect(member.rows[0].password_hash).toBe('FICTIONAL_HASHED_PASSWORD');
    expect(member.rows[0].password_changed_at).not.toBeNull();
    const sessions = await query('SELECT revoked FROM auth_sessions WHERE member_id=$1', [TARGET]);
    expect(sessions.rows[0].revoked).toBe(true);
    const used = await query('SELECT redeemed_at FROM admin_member_recovery_tokens');
    expect(used.rows[0].redeemed_at).not.toBeNull();
    expect((await redeem(raw)).status).toBe(400);
  });

  it('refuses concurrent redemption by two separate requests: at most one can claim', async () => {
    expect((await issue()).status).toBe(200);
    const token = tokenFromEmail();
    const statuses = (await Promise.all([redeem(token), redeem(token)])).map(x => x.status).sort();
    expect(statuses).toEqual([200, 400]);
    const count = await query('SELECT count(*)::int AS n FROM admin_member_recovery_tokens WHERE redeemed_at IS NOT NULL');
    expect(count.rows[0].n).toBe(1);
  });

  it('rolls back password update AND token usage when session revocation fails', async () => {
    expect((await issue()).status).toBe(200);
    const token = tokenFromEmail();
    await query(`
      CREATE FUNCTION fictional_block_revoke() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN RAISE EXCEPTION 'fictional-forced-revocation-failure'; END;
      $$;
      CREATE TRIGGER fictional_fail_revocation BEFORE UPDATE ON auth_sessions
        FOR EACH ROW EXECUTE FUNCTION fictional_block_revoke();
    `);
    try {
      expect((await redeem(token)).status).toBe(503);
      const m = await query('SELECT password_hash FROM members WHERE id=$1', [TARGET]);
      expect(m.rows[0].password_hash).toBe('EXISTING_MEMBER_HASH');
      const t = await query('SELECT redeemed_at FROM admin_member_recovery_tokens');
      expect(t.rows[0].redeemed_at).toBeNull();
    } finally {
      await query('DROP TRIGGER fictional_fail_revocation ON auth_sessions; DROP FUNCTION fictional_block_revoke()');
    }
    expect((await redeem(token)).status).toBe(200);
  });

  it('invalidates prior links when a new one is issued', async () => {
    expect((await issue()).status).toBe(200);
    const oldToken = tokenFromEmail();
    expect((await issue()).status).toBe(200);
    expect((await redeem(oldToken)).status).toBe(400);
    const revoked = await query('SELECT count(*)::int AS n FROM admin_member_recovery_tokens WHERE revoked_at IS NOT NULL');
    expect(revoked.rows[0].n).toBe(1);
  });

  it('does not block deleting the target account; target deletion cascades recovery receipts', async () => {
    expect((await issue()).status).toBe(200);
    const client = await scratch.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM auth_sessions WHERE member_id=$1', [TARGET]);
      await client.query('DELETE FROM members WHERE id=$1', [TARGET]);
      const result = await client.query(
        'SELECT count(*)::int AS n FROM admin_member_recovery_tokens WHERE member_id=$1',
        [TARGET],
      );
      expect(result.rows[0].n).toBe(0);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
    const untouched = await query('SELECT id FROM members WHERE id=$1', [TARGET]);
    expect(untouched.rows).toHaveLength(1);
  });

  it('deleting the issuing founder also invalidates that issuer\'s recovery records', async () => {
    expect((await issue()).status).toBe(200);
    const client = await scratch.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM auth_sessions WHERE member_id=$1', [FOUNDER]);
      await client.query('DELETE FROM members WHERE id=$1', [FOUNDER]);
      const result = await client.query(
        'SELECT count(*)::int AS n FROM admin_member_recovery_tokens WHERE issued_by=$1',
        [FOUNDER],
      );
      expect(result.rows[0].n).toBe(0);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
    const untouched = await query('SELECT id FROM members WHERE id=$1', [FOUNDER]);
    expect(untouched.rows).toHaveLength(1);
  });

  it('failed email provider acceptance leaves no usable token', async () => {
    mockSend.mockResolvedValueOnce({ success: false });
    expect((await issue()).status).toBe(502);
    const rows = await query('SELECT delivery_status, revoked_at FROM admin_member_recovery_tokens');
    expect(rows.rows[0].delivery_status).toBe('failed');
    expect(rows.rows[0].revoked_at).not.toBeNull();
  });
});
