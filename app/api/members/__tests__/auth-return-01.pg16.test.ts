/**
 * AUTH-RETURN-01 route/transaction contract.
 *
 * The exact PostgreSQL 16.13 witness lives in scripts/witness/auth-return-01.mjs.
 * This Jest contract compiles the route and proves that its transaction does
 * not report authentication unless the exact session row is read back.
 */
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const mockConsumeProof = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockLockProof = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockHashPassword = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockRevokeSession = jest.fn<(...args: unknown[]) => Promise<boolean>>();
const mockSetSessionCookies = jest.fn<(...args: unknown[]) => unknown>();
const mockClientQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>>();
const mockClient = { query: mockClientQuery };

jest.mock('@/lib/db/postgres', () => ({
  transaction: (fn: (client: typeof mockClient) => unknown) => fn(mockClient),
}));

jest.mock('@/lib/auth/registrationProof', () => {
  const actual = jest.requireActual('@/lib/auth/registrationProof') as Record<string, unknown>;
  return {
    ...actual,
    consumeRegistrationProof: (...args: unknown[]) => mockConsumeProof(...args),
    lockRegistrationProof: (...args: unknown[]) => mockLockProof(...args),
  };
});

jest.mock('@/lib/auth/passwordUtils', () => ({
  hashPassword: (...args: unknown[]) => mockHashPassword(...args),
  generateSecureToken: () => 'fictional-session-token',
}));

jest.mock('@/lib/auth/serverSessions', () => ({
  revokeSession: (...args: unknown[]) => mockRevokeSession(...args),
}));

jest.mock('@/lib/auth/setSessionCookies', () => ({
  setSessionCookies: (...args: unknown[]) => mockSetSessionCookies(...args),
}));

jest.mock('@/lib/auth/rateLimiter', () => ({
  checkRateLimit: jest.fn(async () => ({ allowed: true })),
  getClientIP: jest.fn(() => '127.0.0.1'),
  buildRateLimitHeaders: jest.fn(() => ({})),
}));

import { POST } from '../register-email/route';
import { RegistrationProofError } from '@/lib/auth/registrationProof';

const MEMBER_ID = '22222222-2222-4222-8222-222222222222';

function request(options: {
  proofCookie?: string;
  body?: Record<string, unknown>;
  origin?: string;
} = {}) {
  const origin = options.origin ?? 'http://localhost';
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    origin,
    'sec-fetch-site': origin === 'http://localhost' ? 'same-origin' : 'cross-site',
    'user-agent': 'Fictional Browser',
  };
  if (options.proofCookie) {
    headers.cookie = `maia_registration_proof=${options.proofCookie}`;
  }
  return new NextRequest('http://localhost/api/members/register-email', {
    method: 'POST',
    headers,
    body: JSON.stringify(options.body ?? {
      email: 'new.writer@example.invalid',
      username: 'new_writer',
      password: 'fictional-password-123',
      name: 'New Writer',
      next: '/writers-studio?work=fiction',
    }),
  });
}

function installSuccessfulDatabase() {
  let insertedSession: { id: string; memberId: string; token: string } | null = null;
  mockClientQuery.mockImplementation(async (sql: string, params: unknown[] = []) => {
    if (sql.includes('pg_advisory_xact_lock')) return { rows: [], rowCount: 1 };
    if (sql.includes('SELECT id FROM members WHERE LOWER(email)')) return { rows: [], rowCount: 0 };
    if (sql.includes('SELECT id FROM members WHERE LOWER(username)')) return { rows: [], rowCount: 0 };
    if (sql.includes('INSERT INTO members')) {
      return {
        rows: [{
          id: MEMBER_ID, username: 'new_writer', name: 'New Writer', onboarded: false,
          onboarding_step: 'faq', tier: 'free', roles: ['member'],
        }],
        rowCount: 1,
      };
    }
    if (sql.includes('INSERT INTO auth_sessions')) {
      insertedSession = { id: String(params[0]), memberId: String(params[1]), token: String(params[2]) };
      return { rows: [], rowCount: 1 };
    }
    if (sql.includes('FROM auth_sessions')) {
      return insertedSession
        ? {
            rows: [{
              id: insertedSession.id,
              member_id: insertedSession.memberId,
              session_token: insertedSession.token,
              revoked: false,
              expires_at: new Date('2026-11-28T12:00:00Z'),
            }],
            rowCount: 1,
          }
        : { rows: [], rowCount: 0 };
    }
    throw new Error(`unexpected SQL: ${sql}`);
  });
}

describe('POST /api/members/register-email — AUTH-RETURN-01', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHashPassword.mockResolvedValue('fictional-password-hash');
    mockRevokeSession.mockResolvedValue(true);
    mockSetSessionCookies.mockImplementation((...args: unknown[]) => {
      const actual = jest.requireActual('@/lib/auth/setSessionCookies') as {
        setSessionCookies: (...values: unknown[]) => unknown;
      };
      return actual.setSessionCookies(...args);
    });
    mockConsumeProof.mockResolvedValue({
      proofId: 'proof-id', challengeId: 'challenge-id',
    });
    mockLockProof.mockResolvedValue({
      proofId: 'proof-id', challengeId: 'challenge-id',
    });
    installSuccessfulDatabase();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => { jest.restoreAllMocks(); });

  it('consumes the HttpOnly proof and commits member plus exact session readback', async () => {
    const res = await POST(request({ proofCookie: 'proof_abcdefghijklmnopqrstuvwxyz0123456789ABCDE' }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toMatchObject({
      success: true, authenticated: true, member: { id: MEMBER_ID },
      redirect: '/faq?next=%2Fwriters-studio%3Fwork%3Dfiction',
    });
    expect(mockConsumeProof).toHaveBeenCalledWith(mockClient, expect.objectContaining({
      proof: 'proof_abcdefghijklmnopqrstuvwxyz0123456789ABCDE',
      email: 'new.writer@example.invalid',
    }));
    const sql = mockClientQuery.mock.calls.map(([statement]) => String(statement));
    expect(sql.some((statement) => statement.includes('INSERT INTO members'))).toBe(true);
    expect(sql.some((statement) => statement.includes('INSERT INTO auth_sessions'))).toBe(true);
    expect(sql.some((statement) => statement.includes('FROM auth_sessions'))).toBe(true);
    const cookies = res.headers.get('set-cookie') ?? '';
    expect(cookies).toContain('maia_session=fictional-session-token');
    expect(cookies).toContain('maia_registration_proof=');
    expect(cookies).toMatch(/Max-Age=0/i);
  });

  it('fails the whole registration when exact session readback is absent', async () => {
    installSuccessfulDatabase();
    const previous = mockClientQuery.getMockImplementation();
    mockClientQuery.mockImplementation(async (sql: string, params: unknown[] = []) => {
      if (sql.includes('FROM auth_sessions')) return { rows: [], rowCount: 0 };
      return previous!(sql, params);
    });
    const res = await POST(request({ proofCookie: 'proof_abcdefghijklmnopqrstuvwxyz0123456789ABCDE' }));
    expect(res.status).toBe(500);
    expect(await res.json()).not.toHaveProperty('success', true);
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('requires a verified registration proof', async () => {
    const res = await POST(request());
    expect(res.status).toBe(403);
    expect(mockConsumeProof).not.toHaveBeenCalled();
    expect(mockLockProof).not.toHaveBeenCalled();
  });

  it('reports a committed account truthfully and revokes the unreturned session if cookies fail', async () => {
    mockSetSessionCookies.mockImplementation(() => { throw new Error('synthetic cookie emission failure'); });
    const res = await POST(request({ proofCookie: 'proof_abcdefghijklmnopqrstuvwxyz0123456789ABCDE' }));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body).toMatchObject({
      success: false, authenticated: false, registrationCreated: true,
      recovery: { action: 'signin', path: '/signin' },
    });
    expect(body).not.toHaveProperty('member');
    expect(body).not.toHaveProperty('session');
    expect(res.headers.get('set-cookie')).toBeNull();
    const sessionInsert = mockClientQuery.mock.calls.find(([sql]) => sql.includes('INSERT INTO auth_sessions'));
    expect(mockRevokeSession).toHaveBeenCalledWith(sessionInsert![1]![0], 'registration_response_failed');
  });

  it('refuses invalid proof authority before disclosing member conflicts', async () => {
    mockLockProof.mockRejectedValue(new RegistrationProofError(
      'REGISTRATION_PROOF_INVALID', 'Registration proof is invalid',
    ));
    const res = await POST(request({ proofCookie: 'proof_abcdefghijklmnopqrstuvwxyz0123456789ABCDE' }));
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ reason: 'REGISTRATION_PROOF_INVALID' });
    expect(mockConsumeProof).not.toHaveBeenCalled();
    expect(mockClientQuery.mock.calls.some(([sql]) => /FROM members|INSERT INTO members|auth_sessions/.test(String(sql)))).toBe(false);
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('refuses a cross-site registration before hashing or database work', async () => {
    const res = await POST(request({
      proofCookie: 'proof_abcdefghijklmnopqrstuvwxyz0123456789ABCDE',
      origin: 'https://evil.invalid',
    }));
    expect(res.status).toBe(403);
    expect(mockHashPassword).not.toHaveBeenCalled();
    expect(mockClientQuery).not.toHaveBeenCalled();
  });

  it('normalizes an unsafe return destination before onboarding carries it', async () => {
    const res = await POST(request({
      proofCookie: 'proof_abcdefghijklmnopqrstuvwxyz0123456789ABCDE',
      body: {
        email: 'new.writer@example.invalid', username: 'new_writer',
        password: 'fictional-password-123', name: 'New Writer', next: '//evil.invalid',
      },
    }));
    expect((await res.json()).redirect).toBe('/faq?next=%2Fhome');
  });
});
