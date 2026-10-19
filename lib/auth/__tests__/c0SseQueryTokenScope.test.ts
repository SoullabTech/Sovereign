/**
 * C0-SSE Class A fictional query-token scope tests. The credential is a
 * candidate only; database validation must still prove a nonrevoked session.
 * No network, credentials, real members, or filesystem mutations.
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const ADMIN = '11111111-1111-4111-8111-111111111111';
const SESSION = 'FICTIONAL_ADMIN_QUERY_TOKEN';
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

import { hasSessionCredential, readSessionCredential } from '../identityAssertions';
import { deriveVerifiedAccess } from '../verifiedAccess';

function request(path: string, opts: {
  method?: string; cookie?: string; header?: string;
} = {}): NextRequest {
  const headers = new Headers();
  if (opts.cookie) headers.set('cookie', 'maia_session=' + opts.cookie);
  if (opts.header) headers.set('x-session-token', opts.header);
  return new NextRequest('https://fictional.invalid' + path, {
    method: opts.method ?? 'GET', headers,
  });
}
beforeEach(() => {
  mockQuery.mockReset();
  mockQuery.mockImplementation(async (sql, params) => {
    expect(sql).toMatch(/revoked\s*=\s*FALSE/i);
    expect(sql).toMatch(/expires_at\s*>\s*NOW\(\)/i);
    return { rows: params?.[0] === SESSION
      ? [{ member_id: ADMIN, tier: 'pro', roles: ['admin'] }]
      : [] };
  });
});

const allowed = [
  '/api/team/channels/11111111-1111-4111-8111-111111111111/stream',
  '/api/team/dm/22222222-2222-4222-8222-222222222222/stream',
] as const;
const forbidden = [
  '/api/team/channels',
  '/api/team/channels/aaa/messages',
  '/api/team/channels/aaa/stream/other',
  '/api/team/channels/aaa/stream/',
  '/api/team/channels/stream',
  '/api/team/channels/aaa/stream-extra',
  '/api/team/dm',
  '/api/team/dm/aaa',
  '/api/team/dm/aaa/stream/other',
  '/api/team/dm/aaa/stream-extra',
  '/api/steward/opus-pulse',
  '/api/feedback',
  '/api/admin/partners/prelude/default',
  '/api/members/profile',
  '/api/members/password',
  '/api/members/change-password',
  '/api/sovereign/app/maia',
  '/api/team/channels/aaa%2Fbbb/stream',
  '/api/team/dm/aaa%5Cbbb/stream',
] as const;

describe('C0-SSE exact GET route query-token boundary', () => {
  it.each(allowed)('admits URL bearer candidate on authorized GET %s', async path => {
    const req = request(path + '?_t=' + SESSION);
    expect(readSessionCredential(req)).toBe(SESSION);
    expect(hasSessionCredential(req)).toBe(true);
    const access = await deriveVerifiedAccess(req);
    expect(access.authenticated).toBe(true);
    expect(access.memberId).toBe(ADMIN);
    expect(access.roles).toEqual(['admin']);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it.each(forbidden)('does not treat a URL bearer as authentication on %s', async path => {
    const req = request(path + '?_t=' + SESSION);
    expect(readSessionCredential(req)).toBeNull();
    expect(hasSessionCredential(req)).toBe(false);
    const access = await deriveVerifiedAccess(req);
    expect(access.authenticated).toBe(false);
    expect(access.reason).toBe('no_credential');
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it.each(['POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'])(
    'refuses URL-token authentication for method %s on approved stream path', async method => {
      const req = request(allowed[0] + '?_t=' + SESSION, { method });
      expect(readSessionCredential(req)).toBeNull();
      expect((await deriveVerifiedAccess(req)).authenticated).toBe(false);
      expect(mockQuery).not.toHaveBeenCalled();
    },
  );

  it('requires a nonempty route ID; encoded separators never become eligible', () => {
    for (const path of ['/api/team/channels//stream', '/api/team/dm//stream',
      '/api/team/dm/x%2fy/stream', '/api/team/channels/x%5cy/stream']) {
      expect(readSessionCredential(request(path + '?_t=' + SESSION))).toBeNull();
    }
  });

  it('requires a nonempty token on an allowed route', () => {
    for (const query of ['', '?_t=', '?another=value', '?_m=' + ADMIN]) {
      expect(readSessionCredential(request(allowed[0] + query))).toBeNull();
    }
  });

  it('preserves cookie preference and Safari-header preference on ALL routes', () => {
    for (const path of [...allowed, ...forbidden.slice(10, 16)]) {
      const uri = path + '?_t=' + SESSION;
      expect(readSessionCredential(request(uri, {cookie:'FICTIONAL_COOKIE'}))).toBe('FICTIONAL_COOKIE');
      expect(readSessionCredential(request(uri, {header:'FICTIONAL_HEADER'}))).toBe('FICTIONAL_HEADER');
      expect(readSessionCredential(request(uri, {cookie:'FICTIONAL_COOKIE', header:'FICTIONAL_HEADER'}))).toBe('FICTIONAL_COOKIE');
    }
  });

  it('never elevates admin access from an invalid stream query-token', async () => {
    const access = await deriveVerifiedAccess(request(allowed[1] + '?_t=FICTIONAL_REVOKED'));
    expect(access).toMatchObject({
      authenticated: false, memberId: null, roles: [], tier: 'free',
      reason: 'invalid_session',
    });
  });

  it('does not grant URL bearer access when a stale cookie is present', async () => {
    const access = await deriveVerifiedAccess(request(allowed[1] + '?_t=' + SESSION, {
      cookie:'FICTIONAL_EXPIRED',
    }));
    expect(access.authenticated).toBe(false);
  });

  it('keeps a valid Safari header usable on a non-SSE route where query is ignored', async () => {
    const access = await deriveVerifiedAccess(request('/api/members/profile?_t=FICTIONAL_UNUSED', {
      header: SESSION,
    }));
    expect(access.authenticated).toBe(true);
    expect(access.memberId).toBe(ADMIN);
  });

  it('does not interpret raw identity claims as session credentials', () => {
    expect(hasSessionCredential(request(allowed[0] + '?_m=' + ADMIN))).toBe(false);
  });
});
