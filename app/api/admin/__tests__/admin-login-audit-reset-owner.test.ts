/**
 * Isolated regression tests for admin POST auditing + emergency member reset.
 * All DB and password hashing effects are fictional mocks: NO production access.
 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';

const PASSWORD = 'fictional-owner-admin-password';
const RESET_SECRET = 'fictional-independent-reset-secret';
const STRONG_PASSWORD = 'fictional-strong-member-password-2026';

type Row = { id?: string; admin_role?: string; username?: string; name?: string };
const queryMock = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: Row[] }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (sql: string, params?: unknown[]) => queryMock(sql, params),
}));
jest.mock('@/lib/auth/passwordUtils', () => ({
  __esModule: true,
  hashPassword: jest.fn(async () => 'FICTIONAL_BCRYPT_HASH'),
}));

import { POST as loginPOST } from '../auth/route';
import { POST as resetPOST } from '../reset-member-password/route';

let simulatedSessionRole: 'founder' | 'cto' | null;
function request(
  path: string, body: unknown, opts: {
    admin?: string; session?: string; member?: string; ip?: string; rawBody?: boolean;
  } = {},
): NextRequest {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'x-forwarded-for': opts.ip || '198.51.100.200',
  };
  if (opts.admin) headers['x-admin-password'] = opts.admin;
  if (opts.session) headers['x-session-token'] = opts.session;
  if (opts.member) headers['x-member-id'] = opts.member;
  return new NextRequest(`http://localhost${path}`, {
    method: 'POST', headers,
    body: opts.rawBody ? String(body) : JSON.stringify(body),
  });
}

function sqlCalls(match: string) {
  return queryMock.mock.calls.filter(([sql]) => sql.includes(match));
}
function loginAuditParams() {
  return sqlCalls('INSERT INTO admin_access_log').map(([, params]) => params as unknown[]);
}
function resetRequest(
  newPassword = STRONG_PASSWORD,
  opts: { admin?: string; session?: string; member?: string; ip?: string; secret?: string } = {},
) {
  return request('/api/admin/reset-member-password', {
    email: 'Fictional@Example.invalid',
    newPassword, adminSecret: opts.secret ?? RESET_SECRET,
  }, opts);
}

beforeEach(() => {
  queryMock.mockReset();
  simulatedSessionRole = null;
  queryMock.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM members m')) {
      return { rows: simulatedSessionRole ? [{ id: 'fictional-owner', admin_role: simulatedSessionRole }] : [] };
    }
    if (sql.includes('SELECT id, username, name FROM members')) {
      return { rows: [{ id: 'fictional-member', username: 'fixture', name: 'Fictional Member' }] };
    }
    return { rows: [] };
  });
  process.env.LABTOOLS_ADMIN_PASSWORD = PASSWORD;
  process.env.ADMIN_RESET_SECRET = RESET_SECRET;
});
afterEach(() => {
  jest.restoreAllMocks();
  delete process.env.LABTOOLS_ADMIN_PASSWORD;
  delete process.env.ADMIN_RESET_SECRET;
});

describe('admin shared-password POST emits non-secret audit evidence', () => {
  it('success records founder-equivalent password event and retains login response', async () => {
    const res = await loginPOST(request('/api/admin/auth', { password: PASSWORD }, { ip: '198.51.100.11' }));
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(loginAuditParams()).toEqual([['password', null, 'founder', 'POST /api/admin/auth', '198.51.100.11']]);
    expect(JSON.stringify(queryMock.mock.calls)).not.toContain(PASSWORD);
  });

  it('invalid password records denied event without password contents', async () => {
    const res = await loginPOST(request('/api/admin/auth', { password: 'wrong-secret' }, { ip: '198.51.100.12' }));
    expect(res.status).toBe(401);
    expect(loginAuditParams()).toEqual([['denied', null, null, 'POST /api/admin/auth', '198.51.100.12']]);
    expect(JSON.stringify(queryMock.mock.calls)).not.toContain('wrong-secret');
  });

  it('the sixth attempt remains denied at the existing rate ceiling and audited', async () => {
    const ip = '198.51.100.13';
    for (let i = 0; i < 5; i++) {
      expect((await loginPOST(request('/api/admin/auth', { password: 'incorrect' }, { ip }))).status).toBe(401);
    }
    expect((await loginPOST(request('/api/admin/auth', { password: PASSWORD }, { ip }))).status).toBe(429);
    expect(loginAuditParams()).toHaveLength(6);
    expect(loginAuditParams().every((args) => args[0] === 'denied')).toBe(true);
  });

  it('unconfigured password and malformed body both leave denial evidence', async () => {
    delete process.env.LABTOOLS_ADMIN_PASSWORD;
    expect((await loginPOST(request('/api/admin/auth', { password: 'any' }, { ip: '198.51.100.14' }))).status).toBe(500);
    process.env.LABTOOLS_ADMIN_PASSWORD = PASSWORD;
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect((await loginPOST(request('/api/admin/auth', '{bad-json', { rawBody: true, ip: '198.51.100.15' }))).status).toBe(500);
    expect(loginAuditParams()).toHaveLength(2);
    expect(loginAuditParams().every((args) => args[0] === 'denied')).toBe(true);
    log.mockRestore();
  });

  it('audit storage outage remains non-blocking but visibly logs a generic error', async () => {
    queryMock.mockRejectedValueOnce(new Error('fictional-sensitive-db-error'));
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await loginPOST(request('/api/admin/auth', { password: PASSWORD }, { ip: '198.51.100.16' }));
    expect(res.status).toBe(200);
    expect(log).toHaveBeenCalledWith('[admin/audit] admin_access_log write failed');
    expect(JSON.stringify(log.mock.calls)).not.toContain('fictional-sensitive-db-error');
  });
});

describe('emergency password reset requires founder proof and independent secret', () => {
  it('reset secret alone, even with forged member identifier, never writes', async () => {
    const res = await resetPOST(resetRequest(STRONG_PASSWORD, { member: 'fictional-owner' }));
    expect(res.status).toBe(401);
    expect(sqlCalls('UPDATE members SET password_hash')).toHaveLength(0);
  });

  it('founder password with incorrect reset secret never writes', async () => {
    const res = await resetPOST(resetRequest(STRONG_PASSWORD, { admin: PASSWORD, secret: 'incorrect' }));
    expect(res.status).toBe(401);
    expect(sqlCalls('UPDATE members SET password_hash')).toHaveLength(0);
  });

  it('founder-equivalent admin password plus independent secret writes one hash', async () => {
    const res = await resetPOST(resetRequest(STRONG_PASSWORD, { admin: PASSWORD }));
    expect(res.status).toBe(200);
    const calls = sqlCalls('UPDATE members SET password_hash');
    expect(calls).toHaveLength(1);
    expect(calls[0][1]).toEqual(['FICTIONAL_BCRYPT_HASH', 'fictional-member']);
    expect(sqlCalls('SELECT id, username, name FROM members')[0][1]).toEqual(['fictional@example.invalid']);
  });

  it('authenticated founder member session plus secret works', async () => {
    simulatedSessionRole = 'founder';
    const res = await resetPOST(resetRequest(STRONG_PASSWORD, { session: 'fictional-valid-session' }));
    expect(res.status).toBe(200);
    expect(sqlCalls('UPDATE members SET password_hash')).toHaveLength(1);
  });

  it('a valid non-founder member session plus secret never writes', async () => {
    simulatedSessionRole = 'cto';
    const res = await resetPOST(resetRequest(STRONG_PASSWORD, { session: 'fictional-valid-other-role-session' }));
    expect(res.status).toBe(401);
    expect(sqlCalls('UPDATE members SET password_hash')).toHaveLength(0);
  });

  it('unconfigured reset secret fails closed without member mutation', async () => {
    delete process.env.ADMIN_RESET_SECRET;
    const res = await resetPOST(resetRequest(STRONG_PASSWORD, { admin: PASSWORD }));
    expect(res.status).toBe(503);
    expect(sqlCalls('UPDATE members SET password_hash')).toHaveLength(0);
  });

  it('reset secret reused as the shared admin password fails closed', async () => {
    process.env.ADMIN_RESET_SECRET = PASSWORD;
    const res = await resetPOST(resetRequest(STRONG_PASSWORD, { admin: PASSWORD, secret: PASSWORD }));
    expect(res.status).toBe(503);
    expect(sqlCalls('UPDATE members SET password_hash')).toHaveLength(0);
  });

  it('six-character, six-emoji and bcrypt-overlong UTF-8 passwords are refused before any write', async () => {
    for (const candidate of ['123456', '🔐'.repeat(6), 'é'.repeat(40)]) {
      expect((await resetPOST(resetRequest(candidate, { admin: PASSWORD }))).status).toBe(400);
    }
    expect(sqlCalls('UPDATE members SET password_hash')).toHaveLength(0);
  });

  it('malformed reset body is refused after admin proof and without a write', async () => {
    const res = await resetPOST(request('/api/admin/reset-member-password', '{broken-json', {
      admin: PASSWORD, rawBody: true, ip: '198.51.100.99',
    }));
    expect(res.status).toBe(500);
    expect(sqlCalls('UPDATE members SET password_hash')).toHaveLength(0);
  });
});
