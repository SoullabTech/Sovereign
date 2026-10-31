import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NextRequest } from 'next/server';

const mockBegin = jest.fn();
const mockAccepted = jest.fn();
const mockFailure = jest.fn();
const mockSendEmail = jest.fn();
const mockCheckRateLimit = jest.fn(async () => ({ allowed: true, remainingAttempts: 4, blockedUntil: null, retryAfterSeconds: null, limit: 5 }));
const mockClient = { query: jest.fn() };

jest.mock('@/lib/db/postgres', () => ({
  transaction: (fn: (client: typeof mockClient) => unknown) => fn(mockClient),
}));

jest.mock('@/lib/auth/emailCodeService', () => {
  const actual = jest.requireActual('@/lib/auth/emailCodeService') as Record<string, unknown>;
  return {
    ...actual,
    beginEmailChallenge: (...args: unknown[]) => mockBegin(...args),
    settleEmailChallengeAccepted: (...args: unknown[]) => mockAccepted(...args),
    settleEmailChallengeFailure: (...args: unknown[]) => mockFailure(...args),
  };
});

jest.mock('@/lib/email/sendEmail', () => ({
  SENDERS: { noreply: 'Soullab <noreply@soullab.life>' },
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}));

jest.mock('@/lib/auth/rateLimiter', () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  getClientIP: jest.fn(() => '127.0.0.1'),
  buildRateLimitHeaders: jest.fn(() => ({})),
}));

import { EmailCodeError } from '@/lib/auth/emailCodeService';
import { POST } from '../route';

const BASE_CHALLENGE = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'fiction@example.invalid',
  memberId: null,
  memberName: null,
  status: 'pending',
  attempts: 0,
  maxAttempts: 5,
  expiresAt: new Date('2026-10-28T12:10:00Z'),
  provider: null,
  providerMessageId: null,
};

function request(options: {
  email?: string; requestKey?: string; origin?: string; site?: string;
} = {}) {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    origin: options.origin ?? 'http://localhost',
    'sec-fetch-site': options.site ?? 'same-origin',
  };
  if (options.requestKey !== null) {
    headers['x-soullab-auth-request'] = options.requestKey ?? 'fictional-request-0001';
  }
  return new NextRequest('http://localhost/api/members/email-code', {
    method: 'POST',
    headers,
    body: JSON.stringify({ email: options.email ?? 'fiction@example.invalid' }),
  });
}

describe('POST /api/members/email-code — AUTH-RETURN-01', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue({ allowed: true, remainingAttempts: 4, blockedUntil: null, retryAfterSeconds: null, limit: 5 });
    delete process.env.CAPACITOR_BUILD;
    process.env.AUTH_CODE_PEPPER = 'fictional-auth-code-pepper-with-more-than-32-characters';
    mockBegin.mockResolvedValue({ created: true, code: '123456', challenge: BASE_CHALLENGE });
    mockSendEmail.mockResolvedValue({
      success: true, status: 'sent', provider: 'smtp', id: '<smtp-1>', priority: 'P0',
    });
    mockAccepted.mockResolvedValue({ ...BASE_CHALLENGE, status: 'accepted' });
    mockFailure.mockResolvedValue(undefined);
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => { jest.restoreAllMocks(); });


  it('keeps a durable shared-IP ceiling and a separate normalized-email ceiling', async () => {
    const res = await POST(request({ email: 'Fiction@Example.Invalid' }));
    expect(res.status).toBe(200);
    expect(mockCheckRateLimit).toHaveBeenNthCalledWith(
      1, '127.0.0.1', 'ip', '/api/members/email-code', { maxAttempts: 20 },
    );
    expect(mockCheckRateLimit).toHaveBeenNthCalledWith(
      2, 'fiction@example.invalid', 'email', '/api/members/email-code', { maxAttempts: 5 },
    );
  });

  it('refuses a spent shared-IP ceiling before email or delivery work', async () => {
    mockCheckRateLimit.mockResolvedValueOnce({
      allowed: false, remainingAttempts: 0, blockedUntil: new Date(), retryAfterSeconds: 60, limit: 20,
    });
    const res = await POST(request());
    expect(res.status).toBe(429);
    expect(mockCheckRateLimit).toHaveBeenCalledTimes(1);
    expect(mockBegin).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('refuses a spent per-email allowance before challenge or delivery work', async () => {
    mockCheckRateLimit
      .mockResolvedValueOnce({ allowed: true, remainingAttempts: 19, blockedUntil: null, retryAfterSeconds: null, limit: 20 })
      .mockResolvedValueOnce({ allowed: false, remainingAttempts: 0, blockedUntil: new Date(), retryAfterSeconds: 60, limit: 5 });
    const res = await POST(request());
    expect(res.status).toBe(429);
    expect(mockCheckRateLimit).toHaveBeenCalledTimes(2);
    expect(mockBegin).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('retains the shared-IP abuse gate for malformed email payloads', async () => {
    const res = await POST(request({ email: 'not-an-email' }));
    expect(res.status).toBe(400);
    expect(mockCheckRateLimit).toHaveBeenCalledTimes(1);
    expect(mockCheckRateLimit).toHaveBeenNthCalledWith(1, '127.0.0.1', 'ip',
      '/api/members/email-code', { maxAttempts: 20 });
    expect(mockBegin).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('requires an explicit idempotency key and passes it into the challenge service', async () => {
    const res = await POST(request({ requestKey: 'fictional-request-key-42' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(mockBegin).toHaveBeenCalledWith(mockClient, expect.objectContaining({
      email: 'fiction@example.invalid', requestKey: 'fictional-request-key-42',
    }));
  });

  it('settles only a provider-accepted SMTP message', async () => {
    await POST(request());
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockAccepted).toHaveBeenCalledWith(mockClient, {
      challengeId: BASE_CHALLENGE.id, provider: 'smtp', providerMessageId: '<smtp-1>',
    });
    expect(mockFailure).not.toHaveBeenCalled();
  });

  it('does not resend an idempotently accepted request', async () => {
    mockBegin.mockResolvedValue({
      created: false, challenge: { ...BASE_CHALLENGE, status: 'accepted' },
    });
    const res = await POST(request());
    expect(await res.json()).toEqual({ success: true, reused: true });
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('does not resend a pending or ambiguous request', async () => {
    for (const status of ['pending', 'ambiguous']) {
      jest.clearAllMocks();
      mockBegin.mockResolvedValue({ created: false, challenge: { ...BASE_CHALLENGE, status } });
      const res = await POST(request());
      expect(res.status).toBe(409);
      expect(await res.json()).toMatchObject({ reason: 'delivery_state_unknown', retryable: false });
      expect(mockSendEmail).not.toHaveBeenCalled();
    }
  });

  it('records a definite SMTP refusal without superseding an older code', async () => {
    mockSendEmail.mockResolvedValue({
      success: false, status: 'error', provider: 'smtp', priority: 'P0',
      failureKind: 'provider_error', retryable: false, ourFault: true, error: 'rejected',
    });
    const res = await POST(request());
    expect(res.status).toBe(502);
    expect(mockFailure).toHaveBeenCalledWith(mockClient, {
      challengeId: BASE_CHALLENGE.id, ambiguous: false, provider: 'smtp',
    });
    expect(mockAccepted).not.toHaveBeenCalled();
  });

  it('records timeout/exception delivery as ambiguous and tells the browser not to retry it', async () => {
    mockSendEmail.mockResolvedValue({
      success: false, status: 'exception', provider: 'smtp', priority: 'P0',
      failureKind: 'exception', retryable: true, ourFault: true, error: 'socket timeout',
    });
    const res = await POST(request());
    expect(res.status).toBe(502);
    expect(await res.json()).toMatchObject({ reason: 'delivery_state_unknown', retryable: false });
    expect(mockFailure).toHaveBeenCalledWith(mockClient, {
      challengeId: BASE_CHALLENGE.id, ambiguous: true, provider: 'smtp',
    });
  });

  it('fails closed when durable settlement fails after SMTP acceptance', async () => {
    mockAccepted.mockRejectedValue(new Error('postgres unavailable'));
    const res = await POST(request());
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ reason: 'delivery_state_unknown' });
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
  });

  it('refuses cross-site browser mutation before issuing or sending anything', async () => {
    const res = await POST(request({ origin: 'https://evil.invalid', site: 'cross-site' }));
    expect(res.status).toBe(403);
    expect(mockBegin).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('reports missing request authority as a stable 400', async () => {
    mockBegin.mockRejectedValue(new EmailCodeError(
      'AUTH_CODE_REQUEST_KEY_REQUIRED', 'A stable authentication request key is required',
    ));
    const res = await POST(request({ requestKey: null }));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ reason: 'AUTH_CODE_REQUEST_KEY_REQUIRED' });
  });

  it('contains no runtime DDL, raw-code table or Resend route client', () => {
    const source = readFileSync(join(process.cwd(), 'app/api/members/email-code/route.ts'), 'utf8');
    expect(source).not.toMatch(/CREATE TABLE|ALTER TABLE|magic_link_tokens|Resend/);
  });
});
