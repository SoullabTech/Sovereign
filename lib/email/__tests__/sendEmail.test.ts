/**
 * CENTRAL EMAIL HELPER — the failure taxonomy contract.
 *
 * THE BUG THIS CLOSES. Resend's `emails.send()` RESOLVES on API rejection:
 * `{ data: null, error: { name, message } }`. It does not throw. Code that
 * awaits it in a bare try/catch records a successful send for mail that never
 * left. On 2026-08-24 that turned a 429 `monthly_quota_exceeded` into six
 * "Code sent" log lines for one person who received nothing.
 *
 * Every case here models the RETURNED-error shape. A suite that only mocks a
 * rejected promise proves nothing about this bug — which is precisely how it
 * survived: the old fixture resolved to a bare `{ id }` and could not express
 * failure at all.
 *
 * The second contract is ATTRIBUTION. `invalid_recipient` is the only class
 * that tells a member their own address is wrong, so it is the only class that
 * requires evidence naming the recipient. Everything unattributed stays ours.
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

const refuse = (name: string, message: string) =>
  mockSend.mockResolvedValue({ data: null, error: { name, message } });

beforeEach(() => {
  mockSend.mockReset();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe('sendEmail — a resolved refusal is a failure, never a success', () => {
  it('THE INCIDENT: 429 monthly_quota_exceeded', async () => {
    refuse('monthly_quota_exceeded', 'You have reached your monthly email sending quota.');
    const r = await send();

    expect(r.success).toBe(false);
    expect(r.id).toBeUndefined();
    expect(r.failureKind).toBe('quota_exceeded');
    expect(r.ourFault).toBe(true);
    expect(r.retryable).toBe(false);   // retrying an exhausted quota cannot work
    // The provider's own name survives for the operator, alongside our class.
    expect(r.providerCode).toBe('monthly_quota_exceeded');
  });

  it('quota and throttle are different failures with different remedies', async () => {
    refuse('rate_limit_exceeded', 'Too many requests. Please slow down.');
    const throttled = await send();
    expect(throttled.failureKind).toBe('rate_limited');
    expect(throttled.retryable).toBe(true);

    refuse('rate_limit_exceeded', 'Monthly quota reached.');
    const quota = await send();
    expect(quota.failureKind).toBe('quota_exceeded');
    expect(quota.retryable).toBe(false);
  });

  it('a bad API key is ours', async () => {
    refuse('missing_api_key', 'Invalid `api_key` provided.');
    const r = await send();
    expect(r.failureKind).toBe('provider_auth');
    expect(r.ourFault).toBe(true);
    expect(r.retryable).toBe(false);
  });

  it('a resolved send with no message id is not a send', async () => {
    mockSend.mockResolvedValue({ data: null, error: null });
    const r = await send();
    expect(r.success).toBe(false);
    expect(r.failureKind).toBe('provider_error');
  });

  it('a thrown transport fault is caught and reported as a failure', async () => {
    mockSend.mockRejectedValue(new Error('socket hang up'));
    const r = await send();
    expect(r.success).toBe(false);
    expect(r.failureKind).toBe('exception');
    expect(r.retryable).toBe(true);      // a transport blip genuinely can clear
    expect(r.error).toContain('socket hang up');
  });

  it('CONTROL: success requires a provider-issued message id', async () => {
    mockSend.mockResolvedValue({ data: { id: 'msg_abc123' }, error: null });
    const r = await send();
    expect(r.success).toBe(true);
    expect(r.id).toBe('msg_abc123');
    expect(r.status).toBe('sent');
    expect(r.failureKind).toBeUndefined();
  });

  it('a transport-wide failure emits a greppable TRANSPORT_DOWN line', async () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    errSpy.mockClear();   // console spies outlive mockReset — isolate this case
    refuse('monthly_quota_exceeded', 'Monthly quota exceeded.');
    await send();
    expect(errSpy.mock.calls.map((c) => String(c[0])).some((l) => l.includes('TRANSPORT_DOWN'))).toBe(true);
  });

  it('a per-recipient failure does NOT claim the whole transport is down', async () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    errSpy.mockClear();
    refuse('validation_error', 'Invalid `to` field.');
    await send();
    expect(errSpy.mock.calls.map((c) => String(c[0])).some((l) => l.includes('TRANSPORT_DOWN'))).toBe(false);
  });
});

describe('sendEmail — attribution: unattributed failures stay OURS', () => {
  it('an unverified FROM address is our config problem, not a bad recipient', async () => {
    // Resend returns `validation_error` for this. Classifying it as
    // invalid_recipient told the member their own address was wrong.
    refuse('validation_error', 'The from address is not verified.');
    const r = await send();

    expect(r.failureKind).toBe('provider_config');
    expect(r.ourFault).toBe(true);
    expect(r.retryable).toBe(false);
  });

  it('an unverified DOMAIN is also ours', async () => {
    refuse('not_found', 'Domain not found.');
    const r = await send();
    expect(r.ourFault).toBe(true);
    expect(r.failureKind).toBe('provider_config');
  });

  it('a bare validation_error degrades to provider_error, still ours', async () => {
    refuse('validation_error', 'Something did not validate.');
    const r = await send();
    expect(r.failureKind).toBe('provider_error');
    expect(r.ourFault).toBe(true);
  });

  it('an unrecognised error name is a failure, and is ours', async () => {
    refuse('some_future_error_name', 'Something new went wrong.');
    const r = await send();
    expect(r.success).toBe(false);
    expect(r.failureKind).toBe('provider_error');
    expect(r.ourFault).toBe(true);
  });

  it('CONTROL: evidence naming the RECIPIENT is attributed to the recipient', async () => {
    // Without this, every assertion above would also pass against a taxonomy
    // broken into never attributing anything to the address.
    refuse('validation_error', 'Invalid `to` field.');
    const r = await send();
    expect(r.failureKind).toBe('invalid_recipient');
    expect(r.ourFault).toBe(false);
  });

  it('CONTROL: invalid_recipient is the ONLY class that is not ours', async () => {
    const cases: Array<[string, string]> = [
      ['monthly_quota_exceeded', 'Monthly quota reached.'],
      ['rate_limit_exceeded', 'Too many requests.'],
      ['missing_api_key', 'Invalid `api_key` provided.'],
      ['validation_error', 'The from address is not verified.'],
      ['not_found', 'Domain not found.'],
      ['validation_error', 'Something did not validate.'],
      ['some_future_error_name', 'Unknown.'],
    ];
    for (const [name, message] of cases) {
      refuse(name, message);
      const r = await send();
      expect({ name, message, ourFault: r.ourFault }).toEqual({ name, message, ourFault: true });
    }
  });
});

describe('classifyProviderError — defensive against shapes we have not seen', () => {
  it('reads statusCode when the name is unhelpful', () => {
    expect(classifyProviderError({ statusCode: 429, message: 'nope' }).kind).toBe('rate_limited');
    expect(classifyProviderError({ statusCode: 401, message: 'nope' }).kind).toBe('provider_auth');
  });

  it('never throws on null, undefined, or a non-object', () => {
    expect(classifyProviderError(null).kind).toBe('provider_error');
    expect(classifyProviderError(undefined).kind).toBe('provider_error');
    expect(classifyProviderError('a string').kind).toBe('provider_error');
  });

  it('a message implicating our sender is never read as a recipient failure', () => {
    // Both markers present — sender evidence wins, because the cost of getting
    // this backwards falls on the member.
    const r = classifyProviderError({
      name: 'validation_error',
      message: 'The from address is not a valid email address.',
    });
    expect(r.kind).not.toBe('invalid_recipient');
  });
});
