/**
 * AUTH-RETURN-01 boundary regressions.
 * Uses the real matrix, proxy, identity-header sanitizer and return normalizer.
 * Only database-backed authority and Writer admission are fictional fixtures.
 */
import { NextRequest } from 'next/server';
import { checkAccess, matchRule } from '@/config/accessMatrix';
import { proxy } from '@/proxy';
import { deriveVerifiedAccess } from '@/lib/auth/verifiedAccess';
import {
  isSameOriginAuthMutation,
  normalizeReturnDestination,
  requireSameOriginAuthMutation,
} from '@/lib/auth/returnDestination';

jest.mock('@/lib/auth/verifiedAccess', () => ({ deriveVerifiedAccess: jest.fn() }));
jest.mock('@/lib/writersStudio/admissionServer', () => ({
  writerStudioAdmissionForMember: jest.fn(async () => ({ allowed: false, code: 'FICTIONAL_NOT_INVITED' })),
}));

const authority = deriveVerifiedAccess as jest.Mock;
const publicPosts = [
  '/api/members/email-code',
  '/api/members/email-code/verify',
  '/api/members/register-email',
  '/api/members/register',
  '/api/members/signout',
  '/api/members/lookup-email',
];
const authenticatedPosts = [
  '/api/auth/device/trust',
  '/api/onboarding/telemetry',
  '/api/members/progress',
];
const neighbors = [
  '/api/members/email-code-extra',
  '/api/members/email-code/child',
  '/api/members/email-code/verify-extra',
  '/api/members/email-code/verify/child',
  '/api/members/register-email-extra',
  '/api/members/register-email/child',
  '/api/members/register-extra',
  '/api/members/session-extra',
  '/api/members/session/child',
  '/api/members/signout-extra',
  '/api/members/signout/child',
  '/api/members/lookup-email-extra',
  '/api/members/lookup-email/child',
  '/api/auth/whoami-extra',
  '/api/auth/whoami/child',
  '/api/auth/device/trust-extra',
  '/api/auth/device/trust/child',
  '/api/onboarding/telemetry-extra',
  '/api/onboarding/telemetry/child',
  '/api/members/progress-extra',
  '/api/members/progress/child',
];
const assertedHeaders: Record<string, string> = {
  'x-member-id': 'fictional-birch',
  'x-access-authed': 'true',
  'x-access-member-id': 'fictional-birch',
  'x-access-tier': 'pro',
  'x-access-roles': 'admin,steward',
  'x-access-rule': 'caller-declared-public',
  'x-access-unmapped': '1',
};
const anonymous = {
  authenticated: false, memberId: null, tier: 'free', roles: [], reason: 'no_credential',
};
const memberA = {
  authenticated: true, memberId: 'fictional-alder', tier: 'free', roles: ['member'],
};

function request(path: string, method = 'POST', headers: Record<string, string> = {}) {
  return new NextRequest(`https://auth-return.invalid${path}`, { method, headers });
}

describe('AUTH-RETURN-01 exact route and method admission', () => {
  const previousMode = process.env.ACCESS_CONTROL_MODE;

  beforeEach(() => {
    process.env.ACCESS_CONTROL_MODE = 'strict';
    authority.mockReset().mockResolvedValue(anonymous);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    if (previousMode === undefined) delete process.env.ACCESS_CONTROL_MODE;
    else process.env.ACCESS_CONTROL_MODE = previousMode;
    jest.restoreAllMocks();
  });

  it.each(publicPosts)('admits the declared public POST at %s', async (path) => {
    const methods = path === '/api/members/register' ? ['POST', 'OPTIONS'] : ['POST'];
    expect(matchRule(path)).toEqual(expect.objectContaining({ exact: path, public: true, methods }));
    expect(checkAccess(path, 'free', [], false).allowed).toBe(true);
    const response = await proxy(request(path));
    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(authority).not.toHaveBeenCalled();
  });

  it.each(publicPosts.flatMap((path) => ['GET', 'HEAD', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
    .filter((method) => !(path === '/api/members/register' && method === 'OPTIONS'))
    .map((method) => [path, method])))
  ('refuses %s %s before a public/preflight shortcut', async (path, method) => {
    const response = await proxy(request(path, method));
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe(path === '/api/members/register' ? 'POST, OPTIONS' : 'POST');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-middleware-next')).toBeNull();
    expect(authority).not.toHaveBeenCalled();
  });

  it('preserves the exact legacy registration OPTIONS handler without forwarding caller authority', async () => {
    const response = await proxy(request('/api/members/register', 'OPTIONS', assertedHeaders));
    expect(response.headers.get('x-middleware-next')).toBe('1');
    for (const name of Object.keys(assertedHeaders)) {
      expect(response.headers.get(`x-middleware-request-${name}`)).toBeNull();
    }
    expect(authority).not.toHaveBeenCalled();
  });

  it.each(['GET', 'OPTIONS'])('admits the exact public whoami %s while leaving credential truth to its handler', async (method) => {
    expect(matchRule('/api/auth/whoami')).toEqual(expect.objectContaining({
      exact: '/api/auth/whoami', public: true, methods: ['GET', 'OPTIONS'],
    }));
    const response = await proxy(request('/api/auth/whoami', method, assertedHeaders));
    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(authority).not.toHaveBeenCalled();
  });

  it.each(['HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'])('refuses unlisted whoami method %s', async (method) => {
    const response = await proxy(request('/api/auth/whoami', method, assertedHeaders));
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('GET, OPTIONS');
    expect(authority).not.toHaveBeenCalled();
  });

  it.each(authenticatedPosts)('requires verified authority for exact member mutation %s', async (path) => {
    expect(matchRule(path)).toEqual(expect.objectContaining({ exact: path, minTier: 'free', methods: ['POST'] }));
    const response = await proxy(request(path, 'POST', assertedHeaders));
    expect(response.status).toBe(401);
    expect(response.headers.get('x-middleware-next')).toBeNull();
    expect(authority).toHaveBeenCalledTimes(1);
  });

  it.each(authenticatedPosts)('forwards exact member mutation %s with authority-derived identity', async (path) => {
    authority.mockResolvedValue(memberA);
    const response = await proxy(request(path, 'POST', assertedHeaders));
    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('x-middleware-request-x-access-member-id')).toBe('fictional-alder');
    expect(response.headers.get('x-middleware-request-x-access-tier')).toBe('free');
    expect(response.headers.get('x-middleware-request-x-access-roles')).toBe('member');
    expect(response.headers.get('x-middleware-request-x-member-id')).toBeNull();
  });

  it.each(authenticatedPosts.flatMap((path) => ['GET', 'HEAD', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
    .map((method) => [path, method])))
  ('refuses unlisted method at %s %s before authority lookup', async (path, method) => {
    const response = await proxy(request(path, method, assertedHeaders));
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('POST');
    expect(authority).not.toHaveBeenCalled();
  });

  it.each(neighbors)('does not extend exact public admission to neighboring route %s', async (path) => {
    expect(matchRule(path)).toBeNull();
    expect(checkAccess(path, 'free', [], false)).toEqual(expect.objectContaining({ allowed: false, reason: 'no-rule-match' }));
    const response = await proxy(request(path, 'POST', assertedHeaders));
    expect(response.status).toBe(404);
    expect(response.headers.get('x-middleware-next')).toBeNull();
  });

  it.each(['GET', 'HEAD', 'POST'])('requires verified authority for session %s', async (method) => {
    const response = await proxy(request('/api/members/session', method, {
      ...assertedHeaders,
      cookie: 'maia_member_id=fictional-birch; maia_tier=pro; maia_roles=admin',
    }));
    expect(response.status).toBe(401);
    expect(response.headers.get('x-middleware-next')).toBeNull();
    expect(authority).toHaveBeenCalledTimes(1);
  });

  it.each(['GET', 'HEAD', 'POST'])('admits session %s with authority-derived identity only', async (method) => {
    authority.mockResolvedValue(memberA);
    const response = await proxy(request('/api/members/session', method, assertedHeaders));
    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(response.headers.get('x-middleware-request-x-access-member-id')).toBe('fictional-alder');
    expect(response.headers.get('x-middleware-request-x-access-tier')).toBe('free');
    expect(response.headers.get('x-middleware-request-x-access-roles')).toBe('member');
    expect(response.headers.get('x-middleware-request-x-access-authed')).toBe('true');
    expect(response.headers.get('x-middleware-request-x-member-id')).toBeNull();
    expect(response.headers.get('x-middleware-request-x-access-unmapped')).toBeNull();
    expect(response.headers.get('x-access-member-id')).toBeNull();
  });

  it.each(['PUT', 'PATCH', 'DELETE', 'OPTIONS'])('refuses unlisted session method %s before authority lookup', async (method) => {
    const response = await proxy(request('/api/members/session', method, assertedHeaders));
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('GET, HEAD, POST');
    expect(authority).not.toHaveBeenCalled();
  });

  it('strips forged forwarded authority from a public auth request while preserving the real credential/request key', async () => {
    const response = await proxy(request('/api/members/email-code', 'POST', {
      ...assertedHeaders,
      'x-session-token': 'fictional-session-credential',
      'x-soullab-auth-request': 'fictional-idempotency-key',
    }));
    expect(response.headers.get('x-middleware-next')).toBe('1');
    for (const name of Object.keys(assertedHeaders)) {
      expect(response.headers.get(`x-middleware-request-${name}`)).toBeNull();
    }
    expect(response.headers.get('x-middleware-request-x-session-token')).toBe('fictional-session-credential');
    expect(response.headers.get('x-middleware-request-x-soullab-auth-request')).toBe('fictional-idempotency-key');
    expect(authority).not.toHaveBeenCalled();
  });
});

describe('AUTH-RETURN-01 return and request-origin authority', () => {
  const previousOrigins = process.env.AUTH_ALLOWED_ORIGINS;

  beforeEach(() => { delete process.env.AUTH_ALLOWED_ORIGINS; });
  afterEach(() => {
    if (previousOrigins === undefined) delete process.env.AUTH_ALLOWED_ORIGINS;
    else process.env.AUTH_ALLOWED_ORIGINS = previousOrigins;
  });

  const unsafeDestinations: unknown[] = [
    undefined, null, 42, {}, '', 'https://outside.invalid', '//outside.invalid/path',
    'javascript:alert(1)', '/\\outside.invalid', '/%2foutside.invalid', '/%5coutside.invalid',
    '/%252foutside.invalid', '/home\n', '/home\u0000',
    // URL normalization can create a leading scheme-relative/encoded separator
    // even when the original string did not start with one.
    '/writers-studio/..//outside.invalid/path',
    '/writers-studio/%2e%2e//outside.invalid/path',
    '/writers-studio/../%2foutside.invalid',
    '/writers-studio/../%5coutside.invalid',
    '/writers-studio/../%252foutside.invalid',
  ];

  it.each(unsafeDestinations)('refuses an unsafe destination %#', (candidate) => {
    expect(normalizeReturnDestination(candidate, '/writers-studio?work=fictional#edit'))
      .toBe('/writers-studio?work=fictional#edit');
  });

  it('normalizes a local path while preserving its work query and locus hash', () => {
    expect(normalizeReturnDestination(' /writers-studio/./draft/../work?manuscript=fictional-alder#paragraph-2 '))
      .toBe('/writers-studio/work?manuscript=fictional-alder#paragraph-2');
  });

  it.each(['https://outside.invalid', '//outside.invalid', '/room/..//outside.invalid', '/room/../%2foutside.invalid'])
  ('does not trust an unsafe fallback %s', (fallback) => {
    expect(normalizeReturnDestination(undefined, fallback)).toBe('/home');
  });

  it('normalizes the fallback too', () => {
    expect(normalizeReturnDestination(undefined, '/writers-studio/draft/../work#edit')).toBe('/writers-studio/work#edit');
  });

  function originRequest(headers: Record<string, string>) {
    return { url: 'https://auth-return.invalid/api/members/email-code', headers: new Headers(headers) };
  }

  it('accepts a same-origin browser mutation', () => {
    expect(isSameOriginAuthMutation(originRequest({ origin: 'https://auth-return.invalid', 'sec-fetch-site': 'same-origin' }))).toBe(true);
  });

  it('does not let forwarded host/origin assertions authorize an external browser origin', () => {
    expect(isSameOriginAuthMutation(originRequest({
      origin: 'https://outside.invalid',
      host: 'outside.invalid',
      'x-forwarded-host': 'outside.invalid',
      'x-forwarded-proto': 'https',
    }))).toBe(false);
  });

  it('refuses cross-site metadata even when that origin is configured', () => {
    process.env.AUTH_ALLOWED_ORIGINS = 'https://native-fixture.invalid';
    expect(isSameOriginAuthMutation(originRequest({ origin: 'https://native-fixture.invalid', 'sec-fetch-site': 'cross-site' }))).toBe(false);
  });

  it('preserves the originless native/server path without admitting explicit null or cross-site origins', () => {
    expect(isSameOriginAuthMutation(originRequest({}))).toBe(true);
    expect(isSameOriginAuthMutation(originRequest({ origin: 'null' }))).toBe(false);
    expect(isSameOriginAuthMutation(originRequest({ 'sec-fetch-site': 'cross-site' }))).toBe(false);
    expect(() => requireSameOriginAuthMutation(originRequest({ origin: 'https://outside.invalid' })))
      .toThrow('Authentication request origin was refused');
  });
});
