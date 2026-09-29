import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const MEMBER_TOKEN = 'valid-member-token';
const ADMIN_TOKEN = 'valid-admin-token';
const MEMBER_ID = '11111111-1111-4111-8111-111111111111';
const ADMIN_ID = '33333333-3333-4333-8333-333333333333';

const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
  default: { query: (sql: string, params?: unknown[]) => mockQuery(sql, params) },
}));

import { NextRequest, NextResponse } from 'next/server';
import { proxy } from '../../../../proxy';

function request(
  route: string,
  opts: { headers?: Record<string, string>; cookies?: Record<string, string> } = {},
): NextRequest {
  const headers = new Headers(opts.headers ?? {});
  const cookies = Object.entries(opts.cookies ?? {});
  if (cookies.length) {
    headers.set('cookie', cookies.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('; '));
  }
  return new NextRequest(new URL(route, 'https://soullab.life'), { headers });
}

function expectForwarded(res: NextResponse) {
  expect(res.status).toBe(200);
  expect(res.headers.get('x-middleware-next')).toBe('1');
}

function expectDenied(res: NextResponse) {
  expect(res.headers.get('x-middleware-next')).toBeNull();
  const location = res.headers.get('location') ?? '';
  expect(
    res.status === 401 ||
    res.status === 403 ||
    (res.status >= 300 && res.status < 400 && location.includes('/signin')),
  ).toBe(true);
}

const forgedRoleTier = {
  headers: {
    'x-maia-roles': 'admin',
    'x-maia-tier': 'pro',
    'x-access-authed': 'true',
    'x-access-roles': 'admin',
    'x-access-tier': 'pro',
  },
  cookies: {
    maia_roles: JSON.stringify(['admin']),
    maia_tier: 'pro',
  },
};

beforeEach(() => {
  mockQuery.mockReset();
  mockQuery.mockImplementation(async (sql: string, params: unknown[] = []) => {
    if (!sql.includes('auth_sessions')) return { rows: [] };
    if (params[0] === MEMBER_TOKEN) {
      return { rows: [{ member_id: MEMBER_ID, tier: 'free', roles: ['member'] }] };
    }
    if (params[0] === ADMIN_TOKEN) {
      return { rows: [{ member_id: ADMIN_ID, tier: 'pro', roles: ['admin'] }] };
    }
    return { rows: [] };
  });
});

const MEMBER_API = '/api/team/channels';
const ADMIN_PAGE = '/admin/settings';
const PUBLIC_API = '/api/ask';

describe('hostile caller assertions never become authority', () => {
  it('denies an invalid token even with forged admin/pro assertions', async () => {
    const res = await proxy(request(ADMIN_PAGE, {
      headers: { 'x-session-token': 'garbage', ...forgedRoleTier.headers },
      cookies: forgedRoleTier.cookies,
    }));
    expectDenied(res);
  });

  it('denies forged admin/pro claims with no credential', async () => {
    const res = await proxy(request(ADMIN_PAGE, {
      headers: forgedRoleTier.headers,
      cookies: forgedRoleTier.cookies,
    }));
    expectDenied(res);
  });

  it('denies an ordinary member on admin despite forged role/tier', async () => {
    const res = await proxy(request(ADMIN_PAGE, {
      headers: { 'x-session-token': MEMBER_TOKEN, ...forgedRoleTier.headers },
      cookies: forgedRoleTier.cookies,
    }));
    expect(res.status).toBe(403);
  });
});

describe('validated sessions govern authorization', () => {
  it('allows a valid ordinary member on a member route', async () => {
    const res = await proxy(request(MEMBER_API, { headers: { 'x-session-token': MEMBER_TOKEN } }));
    expectForwarded(res);
    expect(res.headers.get('x-middleware-request-x-access-roles')).toBe('member');
    expect(res.headers.get('x-middleware-request-x-access-tier')).toBe('free');
  });

  it('allows a valid admin on the admin route', async () => {
    const res = await proxy(request(ADMIN_PAGE, { headers: { 'x-session-token': ADMIN_TOKEN } }));
    expectForwarded(res);
    expect(res.headers.get('x-middleware-request-x-access-roles')).toBe('admin');
  });

  it('rejects a mismatched member identity claim', async () => {
    const res = await proxy(request(MEMBER_API, {
      headers: { 'x-session-token': MEMBER_TOKEN, 'x-member-id': ADMIN_ID },
    }));
    expect(res.status).toBe(401);
  });
});

describe('credential transports and sanitization', () => {
  it('accepts maia_session cookie', async () => {
    expectForwarded(await proxy(request(MEMBER_API, { cookies: { maia_session: MEMBER_TOKEN } })));
  });

  it('accepts ?_t= for EventSource/SSE', async () => {
    expectForwarded(await proxy(request(`${MEMBER_API}?_t=${MEMBER_TOKEN}`)));
  });

  it('does not authenticate from ?_m= member id alone', async () => {
    expectDenied(await proxy(request(`${MEMBER_API}?_m=${MEMBER_ID}`)));
  });

  it('strips forged assertions from public routes without querying DB', async () => {
    const res = await proxy(request(PUBLIC_API, { headers: forgedRoleTier.headers }));
    expectForwarded(res);
    expect(res.headers.get('x-middleware-request-x-access-roles')).toBeNull();
    expect(res.headers.get('x-middleware-request-x-maia-roles')).toBeNull();
    expect(mockQuery).not.toHaveBeenCalled();
  });
});

describe('current Capacitor behavior is preserved', () => {
  it('allows unauthenticated iOS WebView page load for /field/* with sanitized bypass context', async () => {
    const res = await proxy(request('/field/member-home', {
      headers: {
        'user-agent': 'Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Mobile/15E148',
        'x-access-roles': 'admin',
      },
    }));
    expectForwarded(res);
    expect(res.headers.get('x-middleware-request-x-access-authed')).toBe('false');
    expect(res.headers.get('x-middleware-request-x-access-capacitor-bypass')).toBe('true');
    expect(res.headers.get('x-middleware-request-x-access-roles')).toBeNull();
  });
});
