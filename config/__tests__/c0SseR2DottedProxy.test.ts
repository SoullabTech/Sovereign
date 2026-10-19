/**
 * C0-SSE-R2 Class A fictional dotted API request acceptance.
 * Exercise the real Next proxy, access matrix and shared auth boundary.
 * No production DB, network, member accounts or HTTP listener.
 */
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

import { proxy, config } from '@/proxy';
import { CLIENT_ASSERTABLE_IDENTITY_HEADERS } from '@/lib/auth/identityAssertions';

const initialMode = process.env.ACCESS_CONTROL_MODE;
function request(path: string, options: {
  cookie?: string;
  header?: string;
  claim?: string;
  forgedRole?: string;
  method?: string;
} = {}): NextRequest {
  const headers = new Headers({ host: 'fictional.invalid' });
  if (options.cookie) headers.set('cookie', 'maia_session=' + options.cookie);
  if (options.header) headers.set('x-session-token', options.header);
  if (options.claim) headers.set('x-member-id', options.claim);
  if (options.forgedRole) headers.set('x-access-roles', options.forgedRole);
  return new NextRequest('https://fictional.invalid' + path, {
    headers, method: options.method || 'GET',
  });
}
function forwarded(response: Response): boolean {
  return response.headers.get('x-middleware-next') === '1';
}
beforeEach(() => {
  process.env.ACCESS_CONTROL_MODE = 'strict';
  mockQuery.mockReset();
  mockQuery.mockImplementation(async (sql, params) => {
    if (!/auth_sessions/i.test(sql)) throw new Error('Unexpected fictional SQL');
    expect(sql).toMatch(/revoked\s*=\s*FALSE/i);
    expect(sql).toMatch(/expires_at\s*>\s*NOW\(\)/i);
    const token = String(params?.[0] ?? '');
    if (token === 'VALID_A') return {
      rows: [{ member_id: A, tier: 'free', roles: ['member'] }],
    };
    if (token === 'VALID_B_ADMIN') return {
      rows: [{ member_id: B, tier: 'pro', roles: ['admin'] }],
    };
    return { rows: [] };
  });
});
afterEach(() => {
  if (initialMode === undefined) delete process.env.ACCESS_CONTROL_MODE;
  else process.env.ACCESS_CONTROL_MODE = initialMode;
});

describe('C0-SSE-R2 dotted routes are not static assets at proxy', () => {
  it.each([
    '/api/team/channels/fictional.channel/stream',
    '/api/team/dm/fictional.dm/stream',
    '/api/team/channels/fictional.json/stream',
    '/api/team/dm/alpha.beta/stream',
  ])('%s denies missing sessions rather than forwarding unsanitized authority', async path => {
    const response = await proxy(request(path));
    expect(response.status).toBe(401);
    expect(forwarded(response)).toBe(false);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it.each([
    '/api/team/channels/fictional.channel/stream',
    '/api/team/dm/fictional.dm/stream',
  ])('%s denies unknown/revoked _t instead of bypassing auth', async path => {
    const response = await proxy(request(path + '?_t=REVOKED_OR_UNKNOWN'));
    expect(response.status).toBe(401);
    expect(forwarded(response)).toBe(false);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it.each([
    '/api/team/channels/fictional.channel/stream',
    '/api/team/dm/fictional.dm/stream',
  ])('%s still checks an actually valid session and derives member identity', async path => {
    const response = await proxy(request(path + '?_t=VALID_A'));
    expect(response.status).toBe(200);
    expect(forwarded(response)).toBe(true);
    expect(response.headers.get('x-middleware-request-x-access-member-id')).toBe(A);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('rejects dotted member and administrator paths through their real matrix policies', async () => {
    const expected = [
      ['/api/members/profile.json', 404], // truly unmapped in strict mode
      ['/api/admin/partners/prelude/x.yaml', 401], // matched protected admin prefix
    ] as const;
    for (const [path, status] of expected) {
      mockQuery.mockClear();
      const response = await proxy(request(path));
      expect(response.status).toBe(status);
      expect(forwarded(response)).toBe(false);
      expect(mockQuery).not.toHaveBeenCalled();
    }
  });

  it('preserves existing no-auth forwarding for real static assets', async () => {
    for (const path of [
      '/_next/static/chunks/main.js',
      '/favicon.ico',
      '/favicon.svg',
      '/assets/icon.svg',
      '/images/photo.png',
      '/fonts/sans.woff2',
      '/styles/theme.css',
    ]) {
      const response = await proxy(request(path, { forgedRole: 'admin' }));
      expect(response.status).toBe(200);
      expect(forwarded(response)).toBe(true);
      for (const name of CLIENT_ASSERTABLE_IDENTITY_HEADERS) {
        expect(response.headers.get('x-middleware-request-' + name)).toBeNull();
      }
    }
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('preserves explicit proxy matcher exceptions for multipart transport', () => {
    const source = config.matcher[0];
    expect(source).toContain('api/voice/transcribe-simple');
    expect(source).toContain('api/sovereign/manuscripts/ingest$');
  });

  it('does not broaden a forged member or role claim into an authorization grant', async () => {
    const response = await proxy(request(
      '/api/team/channels/fictional.channel/stream',
      { claim: B, forgedRole: 'admin' },
    ));
    expect(response.status).toBe(401);
    expect(forwarded(response)).toBe(false);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('preserves strict authenticating behavior when API IDs contain dots and cookie is valid', async () => {
    const response = await proxy(request('/api/team/dm/fictional.dm/stream', {
      cookie: 'VALID_A',
      claim: A,
      forgedRole: 'admin',
    }));
    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-request-x-access-member-id')).toBe(A);
    expect(response.headers.get('x-middleware-request-x-access-roles')).toBe('member');
  });

  it('preserves recognized auth requirements in permissive matrix mode', async () => {
    process.env.ACCESS_CONTROL_MODE = 'permissive';
    const response = await proxy(request('/api/team/channels/fictional.channel/stream'));
    expect(response.status).toBe(401);
    expect(forwarded(response)).toBe(false);
  });
});
