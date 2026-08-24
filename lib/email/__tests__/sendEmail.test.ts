/**
 * CENTRAL EMAIL HELPER — provider failure contract
 *
 * The bug this suite exists to make impossible:
 *
 *   Resend's `emails.send()` RESOLVES on API rejection. It returns
 *   `{ data: null, error: { name, message } }` and does NOT throw. Code that
 *   `await`s it inside a bare try/catch therefore records a successful send
 *   for mail that never left the building. On 2026-08-24 that is exactly what
 *   happened: Resend returned 429 `monthly_quota_exceeded` and MAIA logged
 *   "Code sent" while nobody could sign in.
 *
 * Every case below models the RETURNED-error shape, not a rejected promise.
 * A suite that only mocks `mockRejectedValue` proves nothing about this bug.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockSend = jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: (...args: unknown[]) => mockSend(...args) },
  })),
}));

process.env.RESEND_API_KEY = 'test-key';

import { sendEmail, classifyProviderError } from '../sendEmail';

const send = () =>
  sendEmail({ purpose: 'test:unit', to: 'someone@example.com', subject: 's', text: 't' });

describe('sendEmail — Resend returns { data, error } and does not throw', () => {
  beforeEach(() => {
    mockSend.mockReset();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('THE INCIDENT: a returned 429 monthly-quota error is a failure, never a success', async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { name: 'rate_limit_exceeded', message: 'You have exceeded your monthly quota of emails.' },
    });

    const result = await send();

    expect(result.success).toBe(false);
    expect(result.id).toBeUndefined();
    expect(result.failureKind).toBe('quota_exceeded');
    expect(result.ourFault).toBe(true);
  });

  it('quota is distinguished from a plain throttle (different remedies)', async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { name: 'rate_limit_exceeded', message: 'Too many requests. Please slow down.' },
    });
    const throttled = await send();
    expect(throttled.failureKind).toBe('rate_limited');
    expect(throttled.retryable).toBe(true);

    mockSend.mockResolvedValue({
      data: null,
      error: { name: 'daily_quota_exceeded', message: 'Monthly quota reached.' },
    });
    const quota = await send();
    expect(quota.failureKind).toBe('quota_exceeded');
    // Retrying a quota failure in a moment cannot work — do not promise it.
    expect(quota.retryable).toBe(false);
  });

  it('a bad API key is our fault; a bad recipient is not', async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { name: 'missing_api_key', message: 'Invalid `api_key` provided.' },
    });
    const keyFail = await send();
    expect(keyFail.failureKind).toBe('provider_auth');
    expect(keyFail.ourFault).toBe(true);

    mockSend.mockResolvedValue({
      data: null,
      error: { name: 'validation_error', message: 'Invalid `to` field.' },
    });
    const recipientFail = await send();
    expect(recipientFail.failureKind).toBe('invalid_recipient');
    expect(recipientFail.ourFault).toBe(false);
    expect(recipientFail.retryable).toBe(false);
  });

  it('an unrecognised provider error degrades to failure, not to success', async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { name: 'some_future_error_name', message: 'Something new went wrong.' },
    });
    const result = await send();
    expect(result.success).toBe(false);
    expect(result.failureKind).toBe('provider_error');
  });

  it('no error AND no message id is still a failure — success needs proof', async () => {
    mockSend.mockResolvedValue({ data: null, error: null });
    const result = await send();
    expect(result.success).toBe(false);
    expect(result.failureKind).toBe('provider_error');
  });

  it('a thrown transport error is caught and reported as a failure', async () => {
    mockSend.mockRejectedValue(new Error('socket hang up'));
    const result = await send();
    expect(result.success).toBe(false);
    expect(result.failureKind).toBe('exception');
    expect(result.error).toContain('socket hang up');
  });

  it('success requires a provider-issued message id', async () => {
    mockSend.mockResolvedValue({ data: { id: 'msg_abc123' }, error: null });
    const result = await send();
    expect(result.success).toBe(true);
    expect(result.id).toBe('msg_abc123');
    expect(result.status).toBe('sent');
    expect(result.failureKind).toBeUndefined();
  });

  it('a transport-wide outage emits a greppable TRANSPORT_DOWN line for the operator', async () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockSend.mockResolvedValue({
      data: null,
      error: { name: 'rate_limit_exceeded', message: 'Monthly quota exceeded.' },
    });
    await send();
    const lines = errSpy.mock.calls.map((c) => String(c[0]));
    expect(lines.some((l) => l.includes('TRANSPORT_DOWN'))).toBe(true);
  });
});

describe('classifyProviderError — defensive against shapes we have not seen', () => {
  it('reads statusCode when the error name is unhelpful', () => {
    expect(classifyProviderError({ statusCode: 429, message: 'nope' }).kind).toBe('rate_limited');
    expect(classifyProviderError({ statusCode: 401, message: 'nope' }).kind).toBe('provider_auth');
  });

  it('never throws on null, undefined, or a non-object', () => {
    expect(classifyProviderError(null).kind).toBe('provider_error');
    expect(classifyProviderError(undefined).kind).toBe('provider_error');
    expect(classifyProviderError('a string').kind).toBe('provider_error');
  });
});
