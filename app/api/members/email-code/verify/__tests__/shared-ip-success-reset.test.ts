import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const mockVerify = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockQuery = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockCreateSession = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockValidateSession = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockRevokeSession = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockResetRateLimit = jest.fn<(...args: unknown[]) => Promise<void>>();
const mockCheckRateLimit = jest.fn<(...args: unknown[]) => Promise<unknown>>();
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
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  resetRateLimit: (...args: unknown[]) => mockResetRateLimit(...args),
  getClientIP: jest.fn(() => '198.51.100.77'),
  buildRateLimitHeaders: jest.fn(() => ({})),
}));

import { POST } from '../route';

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
  ipAddress: '198.51.100.77',
  userAgent: 'Fictional Browser',
  expiresAt: new Date('2026-11-28T12:00:00Z'),
  lastActiveAt: new Date('2026-10-28T12:00:00Z'),
  revoked: false,
};

function request(body: Record<string, unknown> = {
  email: 'fiction@example.invalid', code: '123456', next: '/writers-studio',
}) {
  return new NextRequest('http://localhost/api/members/email-code/verify', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'http://localhost',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Fictional Browser',
    },
    body: JSON.stringify(body),
  });
}

const EXPECTED_RESETS = [
  ['198.51.100.77', 'ip', '/api/members/email-code'],
  ['198.51.100.77', 'ip', '/api/members/email-code/verify'],
];

describe('successful email-code proof releases shared-IP auth buckets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AUTH_CODE_PEPPER = 'fictional-auth-code-pepper-with-more-than-32-characters';
    mockCheckRateLimit.mockResolvedValue({ allowed: true, remainingAttempts: 4 });
    mockResetRateLimit.mockResolvedValue(undefined);
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

  it('clears issuance and verification buckets after registration proof succeeds', async () => {
    mockVerify.mockResolvedValue({
      kind: 'registration-required',
      challengeId: '11111111-1111-4111-8111-111111111111',
      email: 'fiction@example.invalid',
      registrationProof: 'proof_abcdefghijklmnopqrstuvwxyz0123456789ABCDE',
      registrationProofExpiresAt: new Date('2026-10-28T12:15:00Z'),
    });

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(mockResetRateLimit.mock.calls).toEqual(EXPECTED_RESETS);
    expect(mockCreateSession).not.toHaveBeenCalled();
  });

  it('clears both buckets after an existing member proves the code', async () => {
    const response = await POST(request());

    expect(response.status).toBe(200);
    expect((await response.json()).authenticated).toBe(true);
    expect(mockResetRateLimit.mock.calls).toEqual(EXPECTED_RESETS);
  });

  it('does not clear either bucket for an incorrect or expired code', async () => {
    mockVerify.mockResolvedValue({
      kind: 'refused', code: 'AUTH_CODE_INCORRECT', message: 'Authentication code is incorrect',
    });

    const response = await POST(request());

    expect(response.status).toBe(400);
    expect(mockResetRateLimit).not.toHaveBeenCalled();
    expect(mockCreateSession).not.toHaveBeenCalled();
  });

  it('does not clear either bucket when challenge verification throws', async () => {
    mockVerify.mockRejectedValue(new Error('fictional database failure'));

    const response = await POST(request());

    expect(response.status).toBe(500);
    expect(mockResetRateLimit).not.toHaveBeenCalled();
  });

  it('keeps the proven member eligible for a new code when session issuance later fails', async () => {
    mockCreateSession.mockRejectedValue(new Error('fictional session failure'));

    const response = await POST(request());

    expect(response.status).toBe(503);
    expect(mockResetRateLimit.mock.calls).toEqual(EXPECTED_RESETS);
  });
});
