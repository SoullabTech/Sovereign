import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const mockVerify = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockQuery = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockCreateSession = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockValidateSession = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockRevokeSession = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockClient = { query: jest.fn() };

jest.mock('@/lib/db/postgres', () => ({
  transaction: (fn: (client: typeof mockClient) => unknown) => fn(mockClient),
  query: (...args: unknown[]) => mockQuery(...args),
}));

jest.mock('@/lib/auth/emailCodeService', () => {
  const actual = jest.requireActual('@/lib/auth/emailCodeService') as Record<string, unknown>;
  return { ...actual, verifyEmailCode: (...args: unknown[]) => mockVerify(...args) };
});

jest.mock('@/lib/auth/serverSessions', () => ({
  createSession: (...args: unknown[]) => mockCreateSession(...args),
  validateSession: (...args: unknown[]) => mockValidateSession(...args),
  revokeSession: (...args: unknown[]) => mockRevokeSession(...args),
}));

jest.mock('@/lib/auth/rateLimiter', () => ({
  checkRateLimit: jest.fn(async () => ({ allowed: true })),
  getClientIP: jest.fn(() => '127.0.0.1'),
  buildRateLimitHeaders: jest.fn(() => ({})),
}));

import { EmailCodeError } from '@/lib/auth/emailCodeService';
import { POST } from '../route';

function request(
  body: Record<string, unknown> = {
    email: 'fiction@example.invalid', code: '123456', next: '/writers-studio?work=fiction',
  },
  origin = 'http://localhost',
) {
  return new NextRequest('http://localhost/api/members/email-code/verify', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin,
      'sec-fetch-site': origin === 'http://localhost' ? 'same-origin' : 'cross-site',
      'user-agent': 'Fictional Browser',
    },
    body: JSON.stringify(body),
  });
}

const MEMBER = {
  id: '22222222-2222-4222-8222-222222222222',
  username: 'fictional_writer',
  name: 'Fictional Writer',
  onboarded: true,
  onboarding_step: 'complete',
  tier: 'free',
  roles: ['member'],
};

const SESSION = {
  id: 'session-1',
  memberId: MEMBER.id,
  sessionToken: 'session-token-1',
  deviceId: null,
  ipAddress: '127.0.0.1',
  userAgent: 'Fictional Browser',
  expiresAt: new Date('2026-11-28T12:00:00Z'),
  lastActiveAt: new Date('2026-10-28T12:00:00Z'),
  revoked: false,
};

describe('POST /api/members/email-code/verify — session is authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AUTH_CODE_PEPPER = 'fictional-auth-code-pepper-with-more-than-32-characters';
    mockQuery.mockResolvedValue({ rows: [MEMBER] });
    mockVerify.mockResolvedValue({
      kind: 'existing-member',
      challengeId: '11111111-1111-4111-8111-111111111111',
      memberId: MEMBER.id,
    });
    mockCreateSession.mockResolvedValue(SESSION);
    mockValidateSession.mockResolvedValue(SESSION);
    mockRevokeSession.mockResolvedValue(undefined);
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => { jest.restoreAllMocks(); });

  it('returns registration-required truth and places the raw proof only in an HttpOnly cookie', async () => {
    const rawProof = 'proof_abcdefghijklmnopqrstuvwxyz0123456789ABCDE';
    mockVerify.mockResolvedValue({
      kind: 'registration-required',
      challengeId: '11111111-1111-4111-8111-111111111111',
      email: 'fiction@example.invalid',
      registrationProof: rawProof,
      registrationProofExpiresAt: new Date('2026-10-28T12:15:00Z'),
    });
    const res = await POST(request());
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toMatchObject({
      success: true, authenticated: false, registrationRequired: true,
      redirect: '/writers-studio?work=fiction',
    });
    expect(body).not.toHaveProperty('registrationProof');
    expect(res.headers.get('set-cookie')).toContain(`maia_registration_proof=${rawProof}`);
    expect(res.headers.get('set-cookie')).toMatch(/HttpOnly/i);
    expect(mockCreateSession).not.toHaveBeenCalled();
  });

  it('reads back the exact server session before reporting authentication', async () => {
    const res = await POST(request());
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toMatchObject({
      success: true, authenticated: true, registrationRequired: false,
      member: { id: MEMBER.id }, redirect: '/writers-studio?work=fiction',
    });
    expect(mockCreateSession).toHaveBeenCalledWith({
      memberId: MEMBER.id, ipAddress: '127.0.0.1', userAgent: 'Fictional Browser',
    });
    expect(mockValidateSession).toHaveBeenCalledWith('session-token-1');
    const cookies = res.headers.get('set-cookie') ?? '';
    expect(cookies).toContain('maia_session=session-token-1');
    expect(cookies).toContain(`maia_member_id=${MEMBER.id}`);
  });

  it('does not report success when session issuance fails', async () => {
    mockCreateSession.mockRejectedValue(new Error('database unavailable'));
    const res = await POST(request());
    expect(res.status).toBe(503);
    expect(await res.json()).not.toHaveProperty('success', true);
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it.each([
    null,
    { ...SESSION, memberId: 'other-member' },
    { ...SESSION, id: 'other-session' },
    { ...SESSION, revoked: true },
  ])('refuses mismatched or revoked session readback: %p', async (readback) => {
    mockValidateSession.mockResolvedValue(readback);
    const res = await POST(request());
    expect(res.status).toBe(503);
    expect(mockRevokeSession).toHaveBeenCalledWith('session-1', 'session_readback_failed');
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('revokes a minted session if response/cookie construction fails', async () => {
    mockQuery.mockResolvedValue({ rows: [{ ...MEMBER, roles: BigInt(1) }] });
    const res = await POST(request());
    expect(res.status).toBe(503);
    expect(mockRevokeSession).toHaveBeenCalledWith('session-1', 'session_readback_failed');
  });

  it('uses the canonical onboarding target before a requested return path', async () => {
    mockQuery.mockResolvedValue({
      rows: [{ ...MEMBER, onboarded: false, onboarding_step: 'faq' }],
    });
    const res = await POST(request());
    expect((await res.json()).redirect).toBe('/faq');
  });

  it('normalizes an unsafe requested return destination', async () => {
    const res = await POST(request({
      email: 'fiction@example.invalid', code: '123456', next: '//evil.invalid/take-me',
    }));
    expect((await res.json()).redirect).toBe('/home');
  });

  it('refuses cross-site verification before touching challenge state', async () => {
    const res = await POST(request(undefined, 'https://evil.invalid'));
    expect(res.status).toBe(403);
    expect(mockVerify).not.toHaveBeenCalled();
  });

  it('returns a committed challenge refusal without issuing a session', async () => {
    mockVerify.mockResolvedValue({
      kind: 'refused', code: 'AUTH_CODE_EXPIRED', message: 'Authentication code has expired',
    });
    const res = await POST(request());
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ reason: 'AUTH_CODE_EXPIRED' });
    expect(mockCreateSession).not.toHaveBeenCalled();
  });

  it('keeps unexpected verification failure fail-closed', async () => {
    mockVerify.mockRejectedValue(new Error('database unavailable'));
    const res = await POST(request());
    expect(res.status).toBe(500);
    expect(mockCreateSession).not.toHaveBeenCalled();
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('reports missing verification configuration without creating a session', async () => {
    mockVerify.mockRejectedValue(new EmailCodeError(
      'AUTH_CODE_CONFIGURATION_REQUIRED', 'Authentication code configuration is unavailable',
    ));
    const res = await POST(request());
    expect(res.status).toBe(503);
    expect(mockCreateSession).not.toHaveBeenCalled();
    expect(res.headers.get('set-cookie')).toBeNull();
  });
});
