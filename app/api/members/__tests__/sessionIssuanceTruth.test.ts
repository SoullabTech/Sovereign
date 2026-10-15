/**
 * Session-issuance truth: no successful sign-in is valid without a verified
 * server session. Fictional identifiers only; no email sending or live data.
 */
import { NextRequest } from 'next/server';

const queryMock = jest.fn();
const verifyPasswordMock = jest.fn();
const createSessionMock = jest.fn();
const setAccessCookiesMock = jest.fn();
const setSessionCookieMock = jest.fn();
const revokeSessionMock = jest.fn();
const logAuthEventMock = jest.fn();
const checkRateLimitMock = jest.fn();
const resetRateLimitMock = jest.fn();
const trackOnboardingMock = jest.fn();

jest.mock('@/lib/db/postgres', () => ({
  query: (...args: unknown[]) => queryMock(...args),
}));
jest.mock('@/lib/auth/passwordUtils', () => ({
  verifyPassword: (...args: unknown[]) => verifyPasswordMock(...args),
  hashPassword: jest.fn(),
}));
jest.mock('@/lib/auth/serverSessions', () => ({
  createSession: (...args: unknown[]) => createSessionMock(...args),
  setAccessCookies: (...args: unknown[]) => setAccessCookiesMock(...args),
  setSessionCookie: (...args: unknown[]) => setSessionCookieMock(...args),
  revokeSession: (...args: unknown[]) => revokeSessionMock(...args),
}));
jest.mock('@/lib/security/authAudit', () => ({
  logAuthEvent: (...args: unknown[]) => logAuthEventMock(...args),
}));
jest.mock('@/lib/stellium/clients', () => ({
  resolveMemberDisplayName: () => 'Fictional Member',
}));
jest.mock('@/lib/auth/rateLimiter', () => ({
  checkRateLimit: (...args: unknown[]) => checkRateLimitMock(...args),
  resetRateLimit: (...args: unknown[]) => resetRateLimitMock(...args),
  getClientIP: () => '127.0.0.1',
  buildRateLimitHeaders: () => ({}),
}));
jest.mock('@/lib/email/sendEmail', () => ({
  sendEmail: jest.fn(),
  SENDERS: {},
}));
jest.mock('@/lib/privacy/memberRef', () => ({ memberRef: () => 'fictional' }));
jest.mock('@/lib/onboarding/state', () => ({
  getNextOnboardingStep: () => ({ path: '/home' }),
}));
jest.mock('@/lib/onboarding/telemetry', () => ({
  trackOnboarding: (...args: unknown[]) => trackOnboardingMock(...args),
}));

import { POST as passwordSignin } from '../signin/route';
import { GET as magicSignin } from '../magic-link/route';

const A = '11111111-1111-4111-8111-111111111111';
const SESSION = {
  id: '99999999-9999-4999-8999-999999999999',
  memberId: A,
  sessionToken: 'fiction-only-token',
  expiresAt: new Date('2026-10-18T12:00:00Z'),
};
const member = {
  id: A, username: 'fictional', email: 'fictional@example.invalid',
  name: 'Fictional Member', preferred_name: 'Fictional',
  passkey: null, password_hash: 'fictional-hash',
  onboarded: true, onboarding_step: 'complete',
  tier: 'free', roles: ['member'],
  subscription_active: false, subscription_expires_at: null,
  has_webauthn: false, preferred_auth_method: 'password',
  must_reset_password: false,
};
const passwordRequest = () => new NextRequest('https://example.invalid/api/members/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'fictional', password: 'fictional-only-password' }),
});
const linkRequest = () =>
  new NextRequest('https://example.invalid/api/members/magic-link?token=fictional-link-token');

beforeEach(() => {
  jest.clearAllMocks();
  process.env.NEXTAUTH_URL = 'https://example.invalid';
  checkRateLimitMock.mockResolvedValue({allowed:true,remainingAttempts:4});
  resetRateLimitMock.mockResolvedValue(undefined);
  verifyPasswordMock.mockResolvedValue({ok:true,needsUpgrade:false});
  createSessionMock.mockResolvedValue(SESSION);
  setAccessCookiesMock.mockResolvedValue(undefined);
  setSessionCookieMock.mockResolvedValue(undefined);
  revokeSessionMock.mockResolvedValue(true);
  logAuthEventMock.mockResolvedValue(undefined);
  queryMock.mockImplementation(async (sql: string) => {
    if (sql.includes('UPDATE magic_link_tokens')) return {rows:[{
      id:'88888888-8888-4888-8888-888888888888', email:member.email, member_id:A,
    }]};
    if (sql.includes('FROM members')) return {rows:[{ ...member, found_member_id:A }]};
    return {rows:[],rowCount:1};
  });
});

test('password sign-in refuses success and member data when session creation fails', async () => {
  createSessionMock.mockRejectedValue(new Error('synthetic storage failure'));
  const result = await passwordSignin(passwordRequest());
  expect(result.status).toBe(503);
  expect(result.headers.get('Cache-Control')).toContain('no-store');
  const body = await result.json();
  expect(body.error).toMatch(/could not be completed/);
  expect(body).not.toHaveProperty('member');
  expect(body).not.toHaveProperty('session');
  expect(setSessionCookieMock).not.toHaveBeenCalled();
  expect(queryMock.mock.calls.some(([sql]) => String(sql).includes('last_sign_in'))).toBe(false);
  expect(logAuthEventMock.mock.calls.some(([event]) => event.result === 'success')).toBe(false);
});

test('password sign-in revokes a newly minted session when access cookies fail', async () => {
  setAccessCookiesMock.mockRejectedValue(new Error('synthetic cookie failure'));
  const result = await passwordSignin(passwordRequest());
  expect(result.status).toBe(503);
  expect(revokeSessionMock).toHaveBeenCalledWith(SESSION.id, 'session_issuance_failed');
  expect(setSessionCookieMock).not.toHaveBeenCalled();
});

test('password sign-in revokes an issued session if bearer cookie fails', async () => {
  setSessionCookieMock.mockRejectedValue(new Error('synthetic bearer failure'));
  const result = await passwordSignin(passwordRequest());
  expect(result.status).toBe(503);
  expect(revokeSessionMock).toHaveBeenCalledWith(SESSION.id, 'session_issuance_failed');
  expect(logAuthEventMock.mock.calls.some(([event]) => event.result === 'success')).toBe(false);
});

test('password sign-in with verified session retains existing success contract', async () => {
  const result = await passwordSignin(passwordRequest());
  expect(result.status).toBe(200);
  const body = await result.json();
  expect(body.success).toBe(true);
  expect(result.headers.get('Cache-Control')).toContain('no-store');
  expect(body.session.token).toBe(SESSION.sessionToken);
  expect(setAccessCookiesMock).toHaveBeenCalled();
  expect(setSessionCookieMock).toHaveBeenCalledWith(SESSION.sessionToken,SESSION.expiresAt);
  expect(revokeSessionMock).not.toHaveBeenCalled();
});

test('consumed magic link never redirects to success when no session can be created', async () => {
  createSessionMock.mockRejectedValue(new Error('synthetic failed session'));
  const result = await magicSignin(linkRequest());
  expect(result.status).toBe(503);
  expect(result.headers.get('Cache-Control')).toContain('no-store');
  expect(result.headers.get('Location')).toBeNull();
  const body = await result.text();
  expect(body).toContain('Please request a new sign-in link');
  expect(body).not.toContain('fictional-link-token');
  expect(result.headers.get('Set-Cookie')).toBeNull();
  expect(trackOnboardingMock).toHaveBeenCalledWith(
    expect.objectContaining({event:'session_missing_after_verify'})
  );
});

test('magic-link successful return still issues a real cookie and redirect', async () => {
  const result = await magicSignin(linkRequest());
  expect(result.status).toBe(307);
  expect(result.headers.get('Location')).toContain('/magic-link-success');
  expect(result.headers.get('Cache-Control')).toContain('no-store');
  expect(result.headers.get('Set-Cookie')).toContain('maia_session=fiction-only-token');
  expect(revokeSessionMock).not.toHaveBeenCalled();
});
