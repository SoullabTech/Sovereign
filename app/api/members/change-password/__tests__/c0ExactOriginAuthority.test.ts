/**
 * C0-PROXY Class A fictional-account behavioral checks on the actual
 * change-password handler. All database/password helpers are synthetic.
 */
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const MEMBER = '11111111-1111-4111-8111-111111111111';
const mockCookie: { value: string | null } = { value: 'FICTIONAL_DESKTOP_SESSION' };
let passwordProofValid = true;
let sessionRevoked = false;
let sessionExpired = false;
const queryCalls: string[] = [];
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>>();
jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => name === 'maia_session' && mockCookie.value
      ? { value: mockCookie.value } : undefined,
  }),
}));
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));
jest.mock('@/lib/auth/passwordUtils', () => ({
  __esModule: true,
  verifyPassword: async () => ({ ok: passwordProofValid }),
  hashPassword: async (value: unknown) =>
    value === 'fictional-new-password' ? 'FICTIONAL_NEW_HASH' : 'UNEXPECTED_PASSWORD',
}));

import { POST } from '../route';
const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
function request(opts: {
  origin?: string;
  referer?: string;
  sessionHeader?: string;
  currentPassword?: string;
  newPassword?: string;
} = {}): NextRequest {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.origin !== undefined) headers.origin = opts.origin;
  if (opts.referer !== undefined) headers.referer = opts.referer;
  if (opts.sessionHeader !== undefined) headers['x-session-token'] = opts.sessionHeader;
  return new NextRequest('https://fictional-c0.invalid/api/members/change-password', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      currentPassword: opts.currentPassword ?? 'fictional-current-password',
      newPassword: opts.newPassword ?? 'fictional-new-password',
    }),
  });
}
function writes() {
  return queryCalls.filter(s => /UPDATE\s+(members|auth_sessions)/i.test(s));
}

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_APP_URL;
  mockCookie.value = 'FICTIONAL_DESKTOP_SESSION';
  passwordProofValid = true;
  sessionRevoked = false;
  sessionExpired = false;
  queryCalls.length = 0;
  mockQuery.mockReset();
  mockQuery.mockImplementation(async (sql) => {
    queryCalls.push(sql);
    if (/FROM auth_sessions/i.test(sql)) {
      return { rows: [{ member_id: MEMBER, revoked: sessionRevoked,
        expires_at: sessionExpired ? new Date('2020-01-01') : new Date('2035-01-01') }], rowCount: 1 };
    }
    if (/SELECT id, password_hash FROM members/i.test(sql)) {
      return { rows: [{ id: MEMBER, password_hash: 'FICTIONAL_OLD_HASH' }], rowCount: 1 };
    }
    if (/UPDATE members SET password_hash/i.test(sql)) return { rows: [], rowCount: 1 };
    if (/UPDATE auth_sessions/i.test(sql)) return { rows: [], rowCount: 2 };
    throw new Error('Unexpected SQL in fictional origin witness');
  });
});
afterEach(() => {
  if (originalAppUrl === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
  else process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
});

describe('C0-PROXY exact Origin/Referer and unchanged password authority', () => {
  it.each([
    ['https://soullab.life'],
    ['https://www.soullab.life'],
    ['http://localhost:3000'],
    ['https://localhost:3000'],
  ])('accepts exactly approved Origin %s with a valid cookie and current password', async (origin) => {
    const response = await POST(request({ origin }));
    expect(response.status).toBe(200);
    expect(writes()).toHaveLength(2);
    expect(writes().some(sql => /UPDATE auth_sessions/i.test(sql))).toBe(true);
  });

  it.each([
    ['https://soullab.life.attacker.invalid'],
    ['http://localhost:3000.attacker.invalid'],
    ['https://soullab.life@attacker.invalid'],
    ['https://soullab.life/path'],
    ['https://soullab.life?unexpected=1'],
    ['https://soullab.life#fragment'],
    ['null'],
    ['not-a-url'],
    ['https://evil.invalid'],
    ['https://soullab.life:444'],
  ])('rejects hostile/malformed Origin %s before any database access', async (origin) => {
    const response = await POST(request({ origin }));
    expect(response.status).toBe(403);
    expect(queryCalls).toHaveLength(0);
    expect(writes()).toHaveLength(0);
  });

  it('does not let a valid Referer override an untrusted Origin', async () => {
    const response = await POST(request({
      origin: 'https://soullab.life.attacker.invalid',
      referer: 'https://soullab.life/account/settings',
    }));
    expect(response.status).toBe(403);
    expect(queryCalls).toHaveLength(0);
  });

  it('accepts an approved parsed Referer as a compatibility fallback when Origin is absent', async () => {
    const response = await POST(request({ referer: 'https://soullab.life/account/settings?tab=security' }));
    expect(response.status).toBe(200);
    expect(writes()).toHaveLength(2);
  });

  it.each([
    ['https://soullab.life.attacker.invalid/account/settings'],
    ['https://soullab.life@attacker.invalid/path'],
    ['https://attacker.invalid'],
    ['not-a-url'],
  ])('rejects hostile Referer %s', async (referer) => {
    expect((await POST(request({ referer }))).status).toBe(403);
    expect(queryCalls).toHaveLength(0);
  });

  it('rejects absent Origin and Referer', async () => {
    expect((await POST(request())).status).toBe(403);
    expect(queryCalls).toHaveLength(0);
  });

  it('honors an explicitly configured app origin without accepting host prefixes', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://approved-staging.soullab.invalid/member';
    expect((await POST(request({ origin: 'https://approved-staging.soullab.invalid' }))).status).toBe(200);
    queryCalls.length = 0;
    expect((await POST(request({ origin: 'https://approved-staging.soullab.invalid.attacker.invalid' }))).status).toBe(403);
    expect(queryCalls).toHaveLength(0);
  });

  it('continues to require the actual session cookie, not merely a Safari header credential', async () => {
    mockCookie.value = null;
    const response = await POST(request({
      origin: 'https://soullab.life',
      sessionHeader: 'FICTIONAL_SAFARI_HEADER_TOKEN',
    }));
    expect(response.status).toBe(401);
    expect(writes()).toHaveLength(0);
  });

  it('rejects the wrong current password before a password/session write', async () => {
    passwordProofValid = false;
    expect((await POST(request({ origin: 'https://soullab.life' }))).status).toBe(403);
    expect(writes()).toHaveLength(0);
  });

  it('rejects a revoked or expired session', async () => {
    sessionRevoked = true;
    expect((await POST(request({ origin: 'https://soullab.life' }))).status).toBe(401);
    expect(writes()).toHaveLength(0);
    sessionRevoked = false;
    sessionExpired = true;
    expect((await POST(request({ origin: 'https://soullab.life' }))).status).toBe(401);
    expect(writes()).toHaveLength(0);
  });

  it('does not leak the untrusted header contents in a refusal log', async () => {
    const log = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const attackerOrigin = 'https://soullab.life.attacker.invalid/secret?password=synthetic';
      expect((await POST(request({ origin: attackerOrigin }))).status).toBe(403);
      const output = log.mock.calls.map(c => c.join(' ')).join(' ');
      expect(output).not.toContain(attackerOrigin);
      expect(output).not.toContain('synthetic');
      expect(output).toContain('unapproved request origin');
    } finally {
      log.mockRestore();
    }
  });
});
