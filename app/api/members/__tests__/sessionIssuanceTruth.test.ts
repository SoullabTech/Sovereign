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
const sessionCookieValues = new Map<string, string>();
const sessionCookieSetMock = jest.fn();
const cabinStoreMock = {
  resolveSession: jest.fn(), ensureLocalMember: jest.fn(),
  issueSession: jest.fn(), close: jest.fn(),
};

jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => sessionCookieValues.has(name)
      ? { name, value: sessionCookieValues.get(name)! }
      : undefined,
    set: (...args: unknown[]) => sessionCookieSetMock(...args),
  }),
}));
jest.mock('@/lib/cabin/localStore', () => ({
  CabinLocalStore: jest.fn(() => cabinStoreMock),
}));

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
import { GET as sessionRead, POST as sessionRefresh } from '../session/route';
import { POST as signout } from '../signout/route';

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
  sessionCookieValues.clear();
  delete process.env.MAIA_CABIN_MODE;
  delete process.env.MAIA_CABIN_DATA_PATH;
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

const B = '22222222-2222-4222-8222-222222222222';
const SESSION_A_TOKEN = 'a'.repeat(64);
const SESSION_B_TOKEN = 'b'.repeat(64);

function sessionRequest(options: {
  method?: 'GET' | 'POST';
  token?: string | null;
  headerToken?: string;
  queryToken?: string;
  memberClaim?: string;
  memberCookieClaim?: string;
  origin?: string;
  path?: string;
} = {}) {
  sessionCookieValues.clear();
  const token = options.token === undefined ? SESSION_A_TOKEN : options.token;
  if (token !== null) sessionCookieValues.set('maia_session', token);
  const headers: Record<string, string> = {
    origin: options.origin ?? 'https://example.invalid',
    'sec-fetch-site': options.origin && options.origin !== 'https://example.invalid'
      ? 'cross-site' : 'same-origin',
  };
  if (token !== null) headers.cookie = `maia_session=${token}`;
  if (options.memberCookieClaim !== undefined) {
    sessionCookieValues.set('maia_member_id', options.memberCookieClaim);
    headers.cookie = [headers.cookie, `maia_member_id=${options.memberCookieClaim}`].filter(Boolean).join('; ');
  }
  if (options.headerToken !== undefined) headers['x-session-token'] = options.headerToken;
  if (options.memberClaim !== undefined) headers['x-member-id'] = options.memberClaim;
  const url = new URL(options.path ?? '/api/members/session', 'https://example.invalid');
  if (options.queryToken !== undefined) url.searchParams.set('_t', options.queryToken);
  return new NextRequest(url, { method: options.method ?? 'GET', headers });
}

function installSessionDatabase(options: { revoked?: boolean; expiresAt?: Date } = {}) {
  const rows = new Map([
    [SESSION_A_TOKEN, {
      member_id: A, revoked: options.revoked ?? false,
      expires_at: options.expiresAt ?? new Date(Date.now() + 60_000),
    }],
    [SESSION_B_TOKEN, { member_id: B, revoked: false, expires_at: new Date(Date.now() + 60_000) }],
  ]);
  queryMock.mockImplementation(async (sql: string, params: unknown[] = []) => {
    if (sql.includes('FROM auth_sessions')) {
      const row = rows.get(String(params[0]));
      if (!row || row.revoked || row.expires_at.getTime() <= Date.now()) return { rows: [], rowCount: 0 };
      if (params[1] && params[1] !== row.member_id) return { rows: [], rowCount: 0 };
      return { rows: [{ ...row, tier: 'free', roles: ['member'] }], rowCount: 1 };
    }
    if (sql.includes('FROM members WHERE id')) {
      return { rows: [{ ...member, id: String(params[0]) }], rowCount: 1 };
    }
    throw new Error('Unexpected fictional session SQL');
  });
}

describe('session handler independently validates credential concordance', () => {
  test.each(['GET', 'POST'] as const)('%s fails closed when connected mode has no request', async (method) => {
    const handler = method === 'GET' ? sessionRead : sessionRefresh;
    const res = await handler();
    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ reason: 'request_required' });
    expect(queryMock).not.toHaveBeenCalled();
    expect(sessionCookieSetMock).not.toHaveBeenCalled();
  });

  test('connected refresh refuses cross-site mutation before authority or cookies', async () => {
    const res = await sessionRefresh(sessionRequest({ method: 'POST', origin: 'https://foreign.invalid' }));
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ refreshed: false, reason: 'AUTH_ORIGIN_REFUSED' });
    expect(queryMock).not.toHaveBeenCalled();
    expect(sessionCookieSetMock).not.toHaveBeenCalled();
  });

  test.each(['GET', 'POST'] as const)('%s refuses a foreign header or query session alongside a valid cookie', async (method) => {
    installSessionDatabase();
    const handler = method === 'GET' ? sessionRead : sessionRefresh;
    for (const extra of [{ headerToken: SESSION_B_TOKEN }, { queryToken: SESSION_B_TOKEN }]) {
      const res = await handler(sessionRequest({ method, ...extra }));
      expect(res.status).toBe(401);
      expect(await res.json()).toMatchObject({ reason: 'credential_conflict' });
      expect(res.headers.get('Cache-Control')).toContain('no-store');
    }
    expect(sessionCookieSetMock).not.toHaveBeenCalled();
  });

  test.each(['GET', 'POST'] as const)('%s refuses an invalid additional credential or foreign member claim', async (method) => {
    installSessionDatabase();
    const handler = method === 'GET' ? sessionRead : sessionRefresh;
    for (const extra of [{ headerToken: 'invalid' }, { headerToken: '' }, { memberClaim: B }, { memberCookieClaim: B }]) {
      const res = await handler(sessionRequest({ method, ...extra }));
      expect(res.status).toBe(401);
      expect(await res.json()).not.toHaveProperty('member');
    }
    expect(sessionCookieSetMock).not.toHaveBeenCalled();
  });

  test.each(['GET', 'POST'] as const)('%s refuses revoked and expired sessions without refreshing cookies', async (method) => {
    const handler = method === 'GET' ? sessionRead : sessionRefresh;
    for (const state of [{ revoked: true }, { expiresAt: new Date(0) }]) {
      installSessionDatabase(state);
      const res = await handler(sessionRequest({ method }));
      expect(res.status).toBe(401);
      expect(await res.json()).not.toHaveProperty('member');
    }
    expect(sessionCookieSetMock).not.toHaveBeenCalled();
  });

  test('expiry equal to the current instant is already expired', async () => {
    const now = Date.now();
    const clock = jest.spyOn(Date, 'now').mockReturnValue(now);
    try {
      installSessionDatabase({ expiresAt: new Date(now) });
      const res = await sessionRead(sessionRequest());
      expect(res.status).toBe(401);
      expect(await res.json()).not.toHaveProperty('member');
    } finally { clock.mockRestore(); }
  });

  test('a valid concordant session reads its own member with no-store', async () => {
    installSessionDatabase();
    const res = await sessionRead(sessionRequest({ headerToken: SESSION_A_TOKEN, memberClaim: A }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ authenticated: true, member: { id: A } });
    expect(res.headers.get('Cache-Control')).toContain('no-store');
    expect(sessionCookieSetMock).not.toHaveBeenCalled();
  });

  test('a valid refresh writes only its verified member access cookies', async () => {
    installSessionDatabase();
    const res = await sessionRefresh(sessionRequest({ method: 'POST' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ refreshed: true, member: { id: A } });
    expect(sessionCookieSetMock).toHaveBeenCalledWith('maia_member_id', A, expect.objectContaining({ httpOnly: true }));
  });

  test('authority outage is unavailable rather than successful or signed-out', async () => {
    queryMock.mockRejectedValue(new Error('fictional authority unavailable'));
    const res = await sessionRead(sessionRequest());
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ authenticated: false, reason: 'authority_unavailable' });
    expect(res.headers.get('Cache-Control')).toContain('no-store');
  });

  test.each(['GET', 'POST'] as const)('Cabin offline %s direct invocation stays before connected-mode authority', async (method) => {
    process.env.MAIA_CABIN_MODE = 'offline';
    process.env.MAIA_CABIN_DATA_PATH = '/fictional/cabin-only';
    cabinStoreMock.resolveSession.mockReturnValue({
      id: A, username: 'local-fiction', name: 'Local Fiction',
      onboarded: true, onboardingStep: 'complete', tier: 'free', roles: ['member'],
    });
    const handler = method === 'GET' ? sessionRead : sessionRefresh;
    const res = await handler();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ authenticated: true, member: { id: A } });
    expect(queryMock).not.toHaveBeenCalled();
    expect(cabinStoreMock.close).toHaveBeenCalled();
  });
});

describe('same-origin signout preserves stale-cookie cleanup', () => {
  test('refuses cross-site signout before revocation or cookie mutation', async () => {
    const res = await signout(sessionRequest({
      method: 'POST', path: '/api/members/signout', origin: 'https://foreign.invalid',
    }));
    expect(res.status).toBe(403);
    expect(queryMock).not.toHaveBeenCalled();
    expect(sessionCookieSetMock).not.toHaveBeenCalled();
  });

  test('revokes only its own cookie token and clears stale access cookies', async () => {
    const res = await signout(sessionRequest({
      method: 'POST', path: '/api/members/signout', headerToken: SESSION_B_TOKEN,
    }));
    expect(res.status).toBe(200);
    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining('UPDATE auth_sessions'), [SESSION_A_TOKEN]);
    expect(sessionCookieSetMock).toHaveBeenCalledWith('maia_session', '', expect.anything());
    expect(res.headers.get('Cache-Control')).toContain('no-store');
  });

  test('missing cookie still permits local stale-cookie cleanup', async () => {
    const res = await signout(sessionRequest({ method: 'POST', path: '/api/members/signout', token: null }));
    expect(res.status).toBe(200);
    expect(queryMock).not.toHaveBeenCalled();
    expect(sessionCookieSetMock).toHaveBeenCalledWith('maia_member_id', '', expect.anything());
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


test('an optional last-sign-in timestamp failure cannot reverse an already issued verified session', async () => {
  queryMock.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM members')) return { rows: [{ ...member, found_member_id: A }] };
    if (sql.includes('UPDATE members SET last_sign_in')) {
      throw new Error('fictional metadata write unavailable');
    }
    return { rows: [], rowCount: 1 };
  });
  const result = await passwordSignin(passwordRequest());
  expect(result.status).toBe(200);
  expect(result.headers.get('Cache-Control')).toContain('no-store');
  const body = await result.json();
  expect(body.success).toBe(true);
  expect(body.session.token).toBe(SESSION.sessionToken);
  expect(setSessionCookieMock).toHaveBeenCalledWith(SESSION.sessionToken, SESSION.expiresAt);
  expect(revokeSessionMock).not.toHaveBeenCalled();
  expect(logAuthEventMock).toHaveBeenCalledWith(
    expect.objectContaining({ result: 'success' }), expect.anything()
  );
});
