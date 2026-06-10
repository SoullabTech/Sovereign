/**
 * REGISTER-LOCAL SESSION-MINT TESTS
 *
 * /api/members/register-local is the second sessionless-onboarding generator
 * (cross-device sync via SyncAccountPrompt). Before this fix it inserted a member
 * without minting a session. These tests prove it now mints a real session and
 * never emits maia_session='active'.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

const REAL_TOKEN = 'f0e1d2c3b4a5968778695a4b3c2d1e0ff0e1d2c3b4a5968778695a4b3c2d1e0f'; // 64-hex
const EXPIRES = new Date('2026-12-31T00:00:00.000Z');

const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>>();
jest.mock('@/lib/db/postgres', () => ({
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

const mockCreateSession = jest.fn<(opts: unknown) => Promise<{ sessionToken: string; expiresAt: Date }>>();
jest.mock('@/lib/auth/serverSessions', () => ({
  createSession: (opts: unknown) => mockCreateSession(opts),
}));

jest.mock('@/lib/auth/passwordUtils', () => ({
  hashPassword: async () => 'hashed-password',
}));

jest.mock('@/lib/auth/betaConfig', () => ({
  betaConfig: { requireEmailVerification: false },
  validatePassword: () => ({ valid: true }),
  validateEmail: () => ({ valid: true }),
}));

// Import after mocks
import { POST } from '../route';

function req(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/members/register-local', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const BODY = { username: 'localsoul', password: 'secretpass', name: 'Local Soul' };

function mockHappyPath() {
  mockQuery
    .mockResolvedValueOnce({ rows: [], rowCount: 0 })   // username existence
    .mockResolvedValueOnce({ rows: [], rowCount: 1 });  // INSERT member
  mockCreateSession.mockResolvedValue({ sessionToken: REAL_TOKEN, expiresAt: EXPIRES });
}

describe('POST /api/members/register-local — session mint', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('mints a real session and sets maia_session to the real token + returns it in the body', async () => {
    mockHappyPath();
    const res = await POST(req(BODY));

    expect(res.status).toBe(200);
    expect(mockCreateSession).toHaveBeenCalledTimes(1);
    expect(res.cookies.get('maia_session')?.value).toBe(REAL_TOKEN);
    expect(res.cookies.get('maia_member_id')?.value).toBeTruthy();
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.session?.token).toBe(REAL_TOKEN);
  });

  it("REGRESSION: a newly registered local member can never get maia_session='active'", async () => {
    mockHappyPath();
    const res = await POST(req(BODY));
    const cookie = res.cookies.get('maia_session')?.value;
    expect(cookie).not.toBe('active');
    expect(cookie).toMatch(/^[0-9a-f]{64}$/i);
  });

  it('degrades non-fatally when session mint fails — member created, no session', async () => {
    mockHappyPath();
    mockCreateSession.mockRejectedValue(new Error('db down'));
    const res = await POST(req(BODY));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.session).toBeUndefined();
    expect(res.cookies.get('maia_session')?.value).toBeFalsy();
  });
});
