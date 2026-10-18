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
const mockSend = jest.fn(async (_opts: unknown) => ({ success: true }));

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
import { POST as redeemPOST } from '@/app/api/members/admin-recovery/route';

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
  scratch = new Pool({ connectionString: URL });
  await scratch.query(`
    CREATE TABLE members (
      id uuid PRIMARY KEY, email text, admin_role text, password_hash text,
      password_changed_at timestamptz, updated_at timestamptz
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
  mockSend.mockResolvedValue({ success: true });
  await query('DELETE FROM admin_member_recovery_tokens');
  await query('DELETE FROM admin_access_log');
  await query('UPDATE auth_sessions SET revoked = false');
  await query(`UPDATE members SET password_hash='EXISTING_MEMBER_HASH', password_changed_at=NULL WHERE id=$1`, [TARGET]);
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
    for (const [method, reason, status] of disallowed) {
      const attempt = scratch.query(
        `INSERT INTO admin_member_recovery_tokens
         (member_id, issued_by, token_hash, delivery_method, reason_code,
          delivery_status, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, now() + interval '30 minutes')`,
        [TARGET, FOUNDER, 'f'.repeat(64), method, reason, status],
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
