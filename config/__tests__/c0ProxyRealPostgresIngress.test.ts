/**
 * C0-PROXY actual Next proxy + source access matrix + PostgreSQL session witness.
 * Fictional scratch PG17 Unix socket only. Does not run a deployed HTTP server.
 * Opt in with C0_PG_WITNESS=1 and strict credential-free test environment.
 */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { Pool } from 'pg';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const enabled = process.env.C0_PG_WITNESS === '1' ? describe : describe.skip;
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[]; rowCount: number | null }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));
import { proxy } from '@/proxy';

const originalAccess = process.env.ACCESS_CONTROL_MODE;
let pool: Pool;

function input(pathname: string, opts: {
  cookie?: string;
  header?: string;
  claim?: string;
  claimCookie?: string;
  fakeRole?: string;
} = {}): NextRequest {
  const headers: Record<string, string> = {};
  const cookies: string[] = [];
  if (opts.cookie) cookies.push('maia_session=' + opts.cookie);
  if (opts.claimCookie) cookies.push('maia_member_id=' + opts.claimCookie);
  if (cookies.length) headers.cookie = cookies.join('; ');
  if (opts.header) headers['x-session-token'] = opts.header;
  if (opts.claim) headers['x-member-id'] = opts.claim;
  if (opts.fakeRole) headers['x-access-roles'] = opts.fakeRole;
  return new NextRequest('https://fictional-c0.invalid' + pathname, {
    method: 'POST',
    headers,
  });
}
async function admission(pathname: string, opts?: Parameters<typeof input>[1]) {
  return proxy(input(pathname, opts));
}

enabled('C0 strict Next proxy with real synthetic PostgreSQL sessions', () => {
  beforeAll(async () => {
    const socket = process.env.C0_PG_SOCKET;
    if (!socket || !/^\/(?:private\/)?tmp\/soullab-c0pg-20261018\.[A-Za-z0-9]+\/socket$/.test(socket) ||
      process.env.C0_PG_DATABASE !== 'c0_fictional' ||
      process.env.CI !== 'true' ||
      process.env.DATABASE_URL ||
      process.env.SMTP_HOST ||
      process.env.EMAIL_PROVIDER) {
      throw new Error('C0 proxy PostgreSQL witness refused unsafe database/environment');
    }
    pool = new Pool({
      host: socket,
      port: 55473,
      database: 'c0_fictional',
      user: 'soullab',
      connectionTimeoutMillis: 2000,
      max: 3,
    });
    const proof = await pool.query(
      'SELECT current_database() AS db, inet_server_addr() IS NULL AS socket_only, current_setting($1)::integer AS pg_version',
      ['server_version_num'],
    );
    if (proof.rows[0].db !== 'c0_fictional' ||
      proof.rows[0].socket_only !== true ||
      proof.rows[0].pg_version < 170000) {
      throw new Error('Not a permitted isolated PostgreSQL 17 scratch database');
    }
    mockQuery.mockImplementation(async (sql, args) =>
      (await pool.query(sql, args as unknown[] | undefined)));
  });

  afterAll(async () => { if (pool) await pool.end(); });
  beforeEach(() => { process.env.ACCESS_CONTROL_MODE = 'strict'; });
  afterEach(() => {
    if (originalAccess === undefined) delete process.env.ACCESS_CONTROL_MODE;
    else process.env.ACCESS_CONTROL_MODE = originalAccess;
  });

  it.each([
    '/api/members/profile',
    '/api/members/password',
    '/api/members/change-password',
  ])('admits a genuinely verified fictional desktop cookie member at %s', async pathname => {
    const response = await admission(pathname, { cookie: 'FICTIONAL_VALID_COOKIE' });
    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it.each([
    '/api/members/profile',
    '/api/members/password',
    '/api/members/change-password',
  ])('admits a genuinely verified fictional Safari token member at %s', async pathname => {
    const response = await admission(pathname, { header: 'FICTIONAL_VALID_SAFARI' });
    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it.each([
    '/api/members/profile',
    '/api/members/password',
    '/api/members/change-password',
  ])('denies anonymous requests to %s before handler execution', async pathname => {
    const response = await admission(pathname);
    expect(response.status).toBe(401);
    expect(response.headers.get('x-middleware-next')).not.toBe('1');
  });

  it.each([
    'FICTIONAL_EXPIRED',
    'FICTIONAL_REVOKED',
    'NOT_A_SESSION',
  ])('denies %s session credentials', async header => {
    const response = await admission('/api/members/profile', { header });
    expect(response.status).toBe(401);
  });

  it('rejects identity spoofing before the route receives the request', async () => {
    const response = await admission('/api/members/profile', {
      header: 'FICTIONAL_VALID_SAFARI',
      claim: B,
    });
    expect(response.status).toBe(401);
  });

  it('rejects a mismatched member claim in the cookie', async () => {
    const response = await admission('/api/members/profile', {
      cookie: 'FICTIONAL_VALID_COOKIE',
      claimCookie: B,
    });
    expect(response.status).toBe(401);
  });

  it('does not admit adjacent paths in strict mode', async () => {
    for (const pathname of [
      '/api/members/profileX',
      '/api/members/profile/foreign',
      '/api/members/reset-password',
      '/api/auth/native-biometry/verify',
    ]) {
      const response = await admission(pathname, { cookie: 'FICTIONAL_VALID_COOKIE' });
      expect(response.status).toBe(404);
    }
  });

  it('does not elevate roles from client-supplied x-access-roles', async () => {
    const response = await admission('/api/admin/members/recovery', {
      cookie: 'FICTIONAL_VALID_COOKIE',
      fakeRole: 'admin',
    });
    // This admin endpoint has no rule in strict mode: a 404 is the
    // intended fail-closed response, not a 403 role-gate finding.
    expect(response.status).toBe(404);
  });

  it('preserves Safari header fallback despite an expired cookie', async () => {
    const response = await admission('/api/members/profile', {
      cookie: 'FICTIONAL_EXPIRED',
      header: 'FICTIONAL_VALID_SAFARI',
    });
    expect(response.status).toBe(200);
  });

  it('rejects simultaneous VALID cookie and header credentials for different members', async () => {
    const response = await admission('/api/members/profile', {
      cookie: 'FICTIONAL_VALID_COOKIE',
      header: 'FICTIONAL_OTHER_MEMBER',
    });
    expect(response.status).toBe(401);
    expect(response.headers.get('x-middleware-next')).not.toBe('1');
  });

  it('rejects a simultaneous foreign header despite a matching member-ID claim', async () => {
    const response = await admission('/api/members/profile', {
      cookie: 'FICTIONAL_VALID_COOKIE',
      header: 'FICTIONAL_OTHER_MEMBER',
      claim: A,
    });
    expect(response.status).toBe(401);
  });

  it('allows different valid cookie and header tokens when both name the SAME member', async () => {
    const response = await admission('/api/members/profile', {
      cookie: 'FICTIONAL_VALID_COOKIE',
      header: 'FICTIONAL_VALID_SAFARI',
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-request-x-access-member-id')).toBe(A);
    expect(response.headers.get('x-middleware-request-x-access-roles')).toBe('member');
  });

  it('rejects mixed cookie/header conflicts on protected routes as well as profile', async () => {
    for (const pathname of ['/api/members/password', '/api/members/change-password']) {
      const response = await admission(pathname, {
        cookie: 'FICTIONAL_VALID_COOKIE',
        header: 'FICTIONAL_OTHER_MEMBER',
      });
      expect(response.status).toBe(401);
    }
  });

  it('preserves Safari fallback from a revoked cookie without promoting its authority', async () => {
    const response = await admission('/api/members/profile', {
      cookie: 'FICTIONAL_REVOKED',
      header: 'FICTIONAL_VALID_SAFARI',
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-request-x-access-member-id')).toBe(A);
  });

  it('preserves SSE query-token admission only under the original no-cookie/no-header path', async () => {
    const queryOnly = await admission('/api/members/profile?_t=FICTIONAL_VALID_SAFARI');
    expect(queryOnly.status).toBe(200);
    const withExpiredCookie = await admission('/api/members/profile?_t=FICTIONAL_VALID_SAFARI', {
      cookie: 'FICTIONAL_EXPIRED',
    });
    expect(withExpiredCookie.status).toBe(401);
  });

  it('does not accept a real member ID without a valid session', async () => {
    const response = await admission('/api/members/profile', { claim: A });
    expect(response.status).toBe(401);
  });
});
