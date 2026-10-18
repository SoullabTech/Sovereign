/**
 * Class A Member Access falsifiers. Entirely fictional UUIDs, DB state and email
 * provider; NO network, real members, production secrets or actual mail.
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { createHash } from 'node:crypto';

const FOUNDER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const MEMBER_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const EMAIL = 'fictional@example.invalid';
const SHARED_PASSWORD = 'fictional-shared-admin-password';
const STRONG_PASSWORD = 'correct horse battery staple 2026';
type Issued = {
  id: string; member_id: string; issued_by: string; token_hash: string;
  status: string; method: string; expires: Date; redeemed: boolean; revoked: boolean;
};

let tokens: Issued[] = [];
let role: 'founder' | 'cto' | null = 'founder';
let issuerExists = true;
let targetEmail: string | null = EMAIL;
let quotaCount = 0;
let passwordWrites = 0;
let sessionRevocations = 0;
let failSessionRevocation = false;
let rateAllowed = true;
const auditQueries: Array<{ sql: string; args: unknown[] }> = [];
const mockEmail = jest.fn(async (_opts: unknown) => ({ success: true }));

function cloneTokens(): Issued[] {
  return tokens.map(t => ({ ...t, expires: new Date(t.expires) }));
}
async function txQuery(sql: string, args: unknown[] = []): Promise<{ rows: any[] }> {
  if (sql.includes("SELECT id FROM members WHERE id = $1 AND admin_role = 'founder'")) {
    return { rows: issuerExists ? [{ id: FOUNDER_ID }] : [] };
  }
  if (sql.includes('COUNT(*)::int AS n FROM admin_member_recovery_tokens')) {
    return { rows: [{ n: quotaCount }] };
  }
  if (sql.includes('SELECT id, email FROM members WHERE id = $1 FOR UPDATE')) {
    return { rows: args[0] === MEMBER_ID ? [{ id: MEMBER_ID, email: targetEmail }] : [] };
  }
  if (sql.includes('UPDATE admin_member_recovery_tokens SET revoked_at = now()')) {
    for (const t of tokens) if (t.member_id === args[0] && !t.redeemed) t.revoked = true;
    return { rows: [] };
  }
  if (sql.includes('INSERT INTO admin_member_recovery_tokens')) {
    tokens.push({
      id: 'c'.repeat(8) + '-cccc-4ccc-8ccc-' + String(tokens.length).padStart(12, '0'),
      member_id: args[0] as string, issued_by: args[1] as string,
      token_hash: args[2] as string, method: args[3] as string,
      status: args[5] as string, expires: args[6] as Date,
      redeemed: false, revoked: false,
    });
    return { rows: [] };
  }
  if (sql.includes('SELECT id, member_id FROM admin_member_recovery_tokens')) {
    const t = tokens.find(x => x.token_hash === args[0] && !x.redeemed && !x.revoked
      && x.expires > new Date() && ['provider_accepted', 'handoff_issued'].includes(x.status));
    return { rows: t ? [{ id: t.id, member_id: t.member_id }] : [] };
  }
  if (sql.includes('UPDATE members SET password_hash')) {
    passwordWrites++;
    return { rows: [{ id: args[1] }] };
  }
  if (sql.includes('UPDATE auth_sessions SET revoked = TRUE')) {
    if (failSessionRevocation) throw new Error('fictional session revocation failure');
    sessionRevocations++;
    return { rows: [] };
  }
  if (sql.includes('UPDATE admin_member_recovery_tokens SET redeemed_at')) {
    const t = tokens.find(x => x.id === args[0] && !x.redeemed && !x.revoked);
    if (!t) return { rows: [] };
    t.redeemed = true;
    return { rows: [{ id: t.id }] };
  }
  throw new Error('Unexpected transactional SQL shape: ' + sql.slice(0, 45));
}

jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: async (sql: string, args: unknown[] = []) => {
    if (sql.includes('INSERT INTO admin_access_log')) {
      auditQueries.push({ sql, args }); return { rows: [] };
    }
    if (sql.includes('FROM members m') && sql.includes('JOIN auth_sessions')) {
      return { rows: role ? [{ id: FOUNDER_ID, admin_role: role }] : [] };
    }
    if (sql.includes("UPDATE admin_member_recovery_tokens SET delivery_status = 'failed'")) {
      const t = tokens.find(x => x.token_hash === args[0]);
      if (t) { t.status = 'failed'; t.revoked = true; }
      return { rows: [] };
    }
    if (sql.includes("UPDATE admin_member_recovery_tokens SET delivery_status = 'provider_accepted'")) {
      const t = tokens.find(x => x.token_hash === args[0] && x.status === 'pending' && !x.revoked);
      if (t) { t.status = 'provider_accepted'; return { rows: [{ id: t.id }] }; }
      return { rows: [] };
    }
    throw new Error('Unexpected nontransactional SQL: ' + sql.slice(0, 50));
  },
  transaction: async (cb: (tx: { query: typeof txQuery }) => Promise<unknown>) => {
    const snapshot = cloneTokens();
    const oldWrites = passwordWrites, oldRevocations = sessionRevocations;
    try { return await cb({ query: txQuery }); }
    catch (e) {
      tokens = snapshot;
      passwordWrites = oldWrites;
      sessionRevocations = oldRevocations;
      throw e;
    }
  },
}));
jest.mock('@/lib/email/sendEmail', () => ({
  __esModule: true,
  SENDERS: { noreply: 'Soullab <noreply@soullab.life>' },
  sendEmail: (opts: unknown) => mockEmail(opts),
}));
jest.mock('@/lib/auth/rateLimiter', () => ({
  __esModule: true,
  getClientIP: () => '198.51.100.44',
  checkRateLimit: async () => ({ allowed: rateAllowed }),
}));
jest.mock('@/lib/auth/passwordUtils', () => ({
  __esModule: true,
  hashPassword: async () => 'FICTIONAL_BCRYPT_HASH',
}));

import { POST as issuePOST } from '../route';
import { POST as redeemPOST } from '@/app/api/members/admin-recovery/route';
import {
  digestRecoveryToken, generateRecoveryToken, validRecoveryPassword,
  secureRecoveryOrigin, recoveryTokenShape,
} from '@/lib/admin/memberRecovery';

function req(
  path: string, body: unknown,
  options: { session?: boolean; admin?: boolean; origin?: string | null } = {},
): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (options.origin !== null) headers.origin = options.origin ?? 'https://soullab.life';
  if (options.session) headers['x-session-token'] = 'fictional-founder-session';
  if (options.admin) headers['x-admin-password'] = SHARED_PASSWORD;
  return new NextRequest('https://soullab.life' + path, {
    method: 'POST', headers, body: JSON.stringify(body),
  });
}
function issueBody(method: 'email' | 'private_handoff' = 'email') {
  return {
    memberId: MEMBER_ID, method,
    reason: method === 'email' ? 'member_requested' : 'email_unavailable',
    ...(method === 'private_handoff' ? { identityVerified: true } : {}),
  };
}
function emailToken(): string {
  const body = (mockEmail.mock.calls.at(-1)?.[0] as { text?: string } | undefined)?.text || '';
  const t = body.match(/#token=([a-f0-9]{64})/)?.[1];
  if (!t) throw new Error('Fixture expected email link');
  return t;
}
function redeem(token: string, password = STRONG_PASSWORD) {
  return redeemPOST(req('/api/members/admin-recovery', { token, newPassword: password }));
}

beforeEach(() => {
  tokens = []; role = 'founder'; issuerExists = true; targetEmail = EMAIL;
  quotaCount = 0; passwordWrites = 0; sessionRevocations = 0;
  failSessionRevocation = false; rateAllowed = true; auditQueries.length = 0;
  mockEmail.mockReset();
  mockEmail.mockResolvedValue({ success: true });
  process.env.LABTOOLS_ADMIN_PASSWORD = SHARED_PASSWORD;
  process.env.MEMBER_ACCESS_RECOVERY_ENABLED = '1';
});
describe('recovery token and origin primitives', () => {
  it('generates unpredictable token-shaped, distinct values and stores only SHA-256 digests', () => {
    const a = generateRecoveryToken(), b = generateRecoveryToken();
    expect(recoveryTokenShape(a)).toBe(true);
    expect(a).not.toEqual(b);
    expect(digestRecoveryToken(a)).toEqual(createHash('sha256').update(a).digest('hex'));
    expect(digestRecoveryToken(a)).not.toEqual(a);
  });
  it('refuses absent, null and foreign origins and invalid passwords', () => {
    expect(secureRecoveryOrigin(null)).toBe(false);
    expect(secureRecoveryOrigin('null')).toBe(false);
    expect(secureRecoveryOrigin('https://soullab.life.attacker.invalid')).toBe(false);
    expect(secureRecoveryOrigin('https://soullab.life')).toBe(true);
    expect(validRecoveryPassword('🔐'.repeat(6))).toBe(false);
    expect(validRecoveryPassword('é'.repeat(40))).toBe(false);
    expect(validRecoveryPassword(STRONG_PASSWORD)).toBe(true);
  });
});
describe('founder-controlled initiation', () => {
  it('rejects foreign/missing origin before DB access', async () => {
    const result = await issuePOST(req('/api/admin/members/recovery', issueBody(), { session: true, origin: null }));
    expect(result.status).toBe(403);
    expect(tokens).toHaveLength(0);
    expect(auditQueries).toHaveLength(0);
  });
  it('denies unauthenticated requests, forged IDs, and non-founder sessions', async () => {
    expect((await issuePOST(req('/api/admin/members/recovery', issueBody()))).status).toBe(401);
    expect((await issuePOST(req('/api/admin/members/recovery', issueBody(), { admin: true }))).status).toBe(403);
    role = 'cto';
    expect((await issuePOST(req('/api/admin/members/recovery', issueBody(), { session: true }))).status).toBe(401);
    expect(tokens).toHaveLength(0);
  });
  it('requires explicit handoff verification before creating any token', async () => {
    const body = { ...issueBody('private_handoff'), identityVerified: false };
    expect((await issuePOST(req('/api/admin/members/recovery', body, { session: true }))).status).toBe(400);
    expect(tokens).toHaveLength(0);
  });
  it('refuses malformed member ID, wrong reason and stale actor role', async () => {
    expect((await issuePOST(req('/api/admin/members/recovery', { ...issueBody(), memberId: 'attacker' }, { session: true }))).status).toBe(400);
    expect((await issuePOST(req('/api/admin/members/recovery', { ...issueBody(), reason: 'fake' }, { session: true }))).status).toBe(400);
    issuerExists = false;
    expect((await issuePOST(req('/api/admin/members/recovery', issueBody(), { session: true }))).status).toBe(403);
    expect(tokens).toHaveLength(0);
  });
  it('enforces durable issuer quota and checks target delivery email', async () => {
    quotaCount = 5;
    expect((await issuePOST(req('/api/admin/members/recovery', issueBody(), { session: true }))).status).toBe(429);
    quotaCount = 0; targetEmail = null;
    expect((await issuePOST(req('/api/admin/members/recovery', issueBody(), { session: true }))).status).toBe(409);
    expect(tokens).toHaveLength(0);
  });
  it('uses email provider acceptance without placing raw token in DB or API result', async () => {
    const res = await issuePOST(req('/api/admin/members/recovery', issueBody(), { session: true }));
    const result = await res.json();
    expect(res.status).toBe(200);
    expect(result.delivery).toBe('provider_accepted');
    expect(result.recoveryLink).toBeUndefined();
    const token = emailToken();
    expect(tokens).toHaveLength(1);
    expect(tokens[0].status).toBe('provider_accepted');
    expect(tokens[0].token_hash).toBe(digestRecoveryToken(token));
    expect(JSON.stringify(tokens)).not.toContain(token);
    expect(auditQueries.some(x => x.args.includes(FOUNDER_ID))).toBe(true);
  });
  it('revokes an unaccepted email link and returns a delivery error', async () => {
    mockEmail.mockResolvedValueOnce({ success: false });
    expect((await issuePOST(req('/api/admin/members/recovery', issueBody(), { session: true }))).status).toBe(502);
    expect(tokens[0].status).toBe('failed');
    expect(tokens[0].revoked).toBe(true);
  });
  it('private handoff returns link once in response with short expiry, never emailing it', async () => {
    const res = await issuePOST(req('/api/admin/members/recovery', issueBody('private_handoff'), { session: true }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.method).toBe('private_handoff');
    expect(json.expiresInMinutes).toBe(10);
    expect(json.recoveryLink).toMatch(/^https:\/\/soullab\.life\/member-recovery#token=[a-f0-9]{64}$/);
    expect(mockEmail).not.toHaveBeenCalled();
    expect(tokens[0].status).toBe('handoff_issued');
  });
  it('reissuing recovery revokes the previous capability for the target', async () => {
    await issuePOST(req('/api/admin/members/recovery', issueBody(), { session: true }));
    const older = emailToken();
    await issuePOST(req('/api/admin/members/recovery', issueBody('private_handoff'), { session: true }));
    expect(tokens[0].revoked).toBe(true);
    expect((await redeem(older)).status).toBe(400);
  });
});
describe('transactional redemption', () => {
  it('updates only the token-bound member, revokes sessions and consumes exactly once', async () => {
    await issuePOST(req('/api/admin/members/recovery', issueBody(), { session: true }));
    const token = emailToken();
    const first = await redeem(token);
    expect(first.status).toBe(200);
    expect(passwordWrites).toBe(1);
    expect(sessionRevocations).toBe(1);
    expect(tokens[0].redeemed).toBe(true);
    expect((await redeem(token)).status).toBe(400);
    expect(passwordWrites).toBe(1);
  });
  it('invalid, revoked, expired and pending tokens cannot change a password', async () => {
    expect((await redeem('f'.repeat(64))).status).toBe(400);
    await issuePOST(req('/api/admin/members/recovery', issueBody(), { session: true }));
    const token = emailToken();
    tokens[0].expires = new Date(Date.now() - 1000);
    expect((await redeem(token)).status).toBe(400);
    tokens[0].expires = new Date(Date.now() + 1000_000);
    tokens[0].status = 'pending';
    expect((await redeem(token)).status).toBe(400);
    tokens[0].status = 'provider_accepted'; tokens[0].revoked = true;
    expect((await redeem(token)).status).toBe(400);
    expect(passwordWrites).toBe(0);
  });
  it('refuses too-short and overlong UTF-8 passwords before any password update', async () => {
    await issuePOST(req('/api/admin/members/recovery', issueBody(), { session: true }));
    const token = emailToken();
    for (const password of ['🔐'.repeat(6), 'é'.repeat(40), '123456']) {
      expect((await redeem(token, password)).status).toBe(400);
    }
    expect(passwordWrites).toBe(0);
    expect(tokens[0].redeemed).toBe(false);
  });
  it('rolls back password update and token consumption when session revocation fails', async () => {
    await issuePOST(req('/api/admin/members/recovery', issueBody(), { session: true }));
    const token = emailToken();
    failSessionRevocation = true;
    expect((await redeem(token)).status).toBe(503);
    expect(passwordWrites).toBe(0);
    expect(sessionRevocations).toBe(0);
    expect(tokens[0].redeemed).toBe(false);
    failSessionRevocation = false;
    expect((await redeem(token)).status).toBe(200);
  });
  it('rate-limited redemption does not perform any token lookup', async () => {
    rateAllowed = false;
    expect((await redeem('f'.repeat(64))).status).toBe(429);
    expect(passwordWrites).toBe(0);
  });
  it('refuses missing origin without attempting redemption', async () => {
    const res = await redeemPOST(req('/api/members/admin-recovery',
      { token: 'a'.repeat(64), newPassword: STRONG_PASSWORD }, { origin: null }));
    expect(res.status).toBe(403);
    expect(passwordWrites).toBe(0);
  });
});
