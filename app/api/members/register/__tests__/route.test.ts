/**
 * REGISTER SESSION-MINT TESTS
 *
 * /api/members/register is the canonical test-elemental onboarding path. Before
 * this fix it inserted a member row but never minted a session, leaving the
 * member authenticated only by a forgeable x-member-id. These tests prove:
 *  1. a real auth_sessions session is minted on success (createSession called)
 *  2. the maia_session cookie is the REAL token — never the 'active' placeholder
 *  3. the token is returned in the body for the native x-session-token path
 *  4. invite redemption still fires (mint runs after it)
 *  5. session failure reports the created account and refuses authenticated success
 *  6. duplicate passkey still 409 (no enumeration change)
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

const REAL_TOKEN = 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90'; // 64-hex, like generateSecureToken(32)
const EXPIRES = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
const SESSION = {
  id: 'session-uuid-1', memberId: 'mem-uuid-1',
  sessionToken: REAL_TOKEN, expiresAt: EXPIRES, revoked: false,
};

const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>>();
jest.mock('@/lib/db/postgres', () => ({
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

const mockCreateSession = jest.fn<(opts: unknown) => Promise<typeof SESSION>>();
const mockValidateSession = jest.fn<(token: string) => Promise<typeof SESSION | null>>();
const mockRevokeSession = jest.fn<(id: string, reason: string) => Promise<boolean>>();
jest.mock('@/lib/auth/serverSessions', () => ({
  createSession: (opts: unknown) => mockCreateSession(opts),
  validateSession: (token: string) => mockValidateSession(token),
  revokeSession: (id: string, reason: string) => mockRevokeSession(id, reason),
}));

jest.mock('@/lib/auth/passwordUtils', () => ({
  hashPassword: async () => 'hashed-password',
}));

jest.mock('@/lib/auth/rateLimiter', () => ({
  checkRateLimit: async () => ({ allowed: true }),
  getClientIP: () => '127.0.0.1',
  buildRateLimitHeaders: () => ({}),
}));

// Import after mocks
import { POST } from '../route';

function req(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/members/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const NEW_BODY = { passkey: 'SOULLAB-TESTSOUL', username: 'testsoul', password: 'secretpass', name: 'Test Soul' };

function memberRow() {
  return {
    id: 'mem-uuid-1', username: 'testsoul', name: 'Test Soul',
    onboarded: false, onboarding_step: 'test-elemental',
    created_at: '2026-06-10T00:00:00.000Z', developmental_tier: null, guardian_required: false,
  };
}

/**
 * A pending, unexpired invite. Registration REQUIRES one since the 2026-09-06
 * admission repair: a passkey's prefix decides its FORMAT, never its
 * authorization. These fixtures previously supplied "invite lookup (none)" and
 * still expected a 200 — that was the bypass, and it is now closed.
 */
const PENDING_INVITE = {
  id: 'inv-1', status: 'pending', expires_at: null, created_by: 'inviter-1',
  inviter_username: 'inviter', inviter_name: 'Inviter',
};

/**
 * Dispatch on the SQL rather than on call order. The admission repair moved the
 * invite lookup ahead of the username check, and positional fixtures broke on
 * an ordering change that altered no behaviour they were asserting.
 */
function mockSql(opts: { member?: unknown[]; invite?: unknown[]; usernameTaken?: boolean } = {}) {
  const { member = [], invite = [PENDING_INVITE], usernameTaken = false } = opts;
  mockQuery.mockImplementation((sql: string) => {
    if (/FROM members WHERE passkey/i.test(sql)) return Promise.resolve({ rows: member, rowCount: member.length });
    if (/LOWER\(username\)/i.test(sql)) return Promise.resolve({ rows: usernameTaken ? [{ id: 'taken' }] : [], rowCount: usernameTaken ? 1 : 0 });
    if (/FROM invites/i.test(sql)) return Promise.resolve({ rows: invite, rowCount: invite.length });
    if (/INSERT INTO members/i.test(sql)) return Promise.resolve({ rows: [memberRow()], rowCount: 1 });
    if (/UPDATE invites/i.test(sql)) return Promise.resolve({ rows: [], rowCount: 1 });
    return Promise.resolve({ rows: [], rowCount: 0 });
  });
}

function mockHappyPath() {
  mockSql();
  mockCreateSession.mockResolvedValue(SESSION);
  mockValidateSession.mockResolvedValue(SESSION);
  mockRevokeSession.mockResolvedValue(true);
}

describe('POST /api/members/register — session mint', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('mints a real session and sets maia_session to the real token + returns it in the body', async () => {
    mockHappyPath();
    const res = await POST(req(NEW_BODY));

    expect(res.status).toBe(200);
    // a real auth_sessions row is created for the new member
    expect(mockCreateSession).toHaveBeenCalledTimes(1);
    expect(mockCreateSession).toHaveBeenCalledWith(expect.objectContaining({ memberId: 'mem-uuid-1' }));
    // cookie carries the real token; access cookies present
    expect(res.cookies.get('maia_session')?.value).toBe(REAL_TOKEN);
    expect(res.cookies.get('maia_member_id')?.value).toBe('mem-uuid-1');
    // token in body for the Capacitor/iOS x-session-token path
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.authenticated).toBe(true);
    expect(data.session?.token).toBe(REAL_TOKEN);
    expect(mockValidateSession).toHaveBeenCalledWith(REAL_TOKEN);
    expect(res.headers.get('Cache-Control')).toContain('no-store');
  });

  it("REGRESSION: a newly registered member can never get maia_session='active'", async () => {
    mockHappyPath();
    const res = await POST(req(NEW_BODY));
    const cookie = res.cookies.get('maia_session')?.value;
    expect(cookie).not.toBe('active');
    expect(cookie).toMatch(/^[0-9a-f]{64}$/i); // real generateSecureToken shape
  });

  it('preserves invite redemption (mint runs after the UPDATE invites)', async () => {
    mockHappyPath();

    const res = await POST(req(NEW_BODY));

    expect(res.status).toBe(200);
    const redeemed = mockQuery.mock.calls.some(c => typeof c[0] === 'string' && c[0].includes('UPDATE invites'));
    expect(redeemed).toBe(true);
    expect(res.cookies.get('maia_session')?.value).toBe(REAL_TOKEN); // session still minted
  });

  it('reports account creation and refuses success when the session cannot be minted', async () => {
    mockHappyPath();
    mockCreateSession.mockRejectedValue(new Error('db down'));

    const res = await POST(req(NEW_BODY));

    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data).toMatchObject({
      success: false, authenticated: false, registrationCreated: true,
      recovery: { action: 'signin', path: '/signin' },
    });
    expect(data.error).toMatch(/account was created/);
    expect(data.member).toBeUndefined();
    expect(data.session).toBeUndefined();
    expect(res.cookies.get('maia_session')?.value).toBeFalsy();
    expect(mockRevokeSession).not.toHaveBeenCalled();
    expect(res.headers.get('Cache-Control')).toContain('no-store');
  });

  it.each([
    null,
    { ...SESSION, id: 'another-session' },
    { ...SESSION, memberId: 'another-member' },
    { ...SESSION, sessionToken: 'another-token' },
    { ...SESSION, revoked: true },
    { ...SESSION, expiresAt: new Date(0) },
  ])('revokes a minted session when exact current readback is absent: %p', async (readback) => {
    mockHappyPath();
    mockValidateSession.mockResolvedValue(readback);
    const res = await POST(req(NEW_BODY));
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({
      success: false, authenticated: false, registrationCreated: true,
    });
    expect(mockRevokeSession).toHaveBeenCalledWith(SESSION.id, 'registration_session_issuance_failed');
    expect(res.cookies.get('maia_session')?.value).toBeFalsy();
  });

  it('duplicate passkey still returns 409 and mints nothing (no enumeration change)', async () => {
    mockSql({ member: [{ id: 'existing', username: 'testsoul', name: 'Test Soul', onboarded: false, onboarding_step: 'test-elemental' }] }); // passkey already registered
    const res = await POST(req(NEW_BODY));
    expect(res.status).toBe(409);
    expect(mockCreateSession).not.toHaveBeenCalled();
  });
});
