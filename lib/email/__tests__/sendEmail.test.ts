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
const mockSendMail = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockCapacityQuery = jest.fn<(...args: unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>>();
const mockTransaction = jest.fn<(fn: (client: { query: typeof mockCapacityQuery }) => Promise<unknown>) => Promise<unknown>>();
const mockSettleAttempt = jest.fn<(...args: unknown[]) => Promise<void>>();
jest.mock('nodemailer', () => ({
  createTransport: () => ({ sendMail: (...args: unknown[]) => mockSendMail(...args) }),
}));
jest.mock('@/lib/db/postgres', () => ({
  transaction: (fn: (client: { query: typeof mockCapacityQuery }) => Promise<unknown>) => mockTransaction(fn),
}));
jest.mock('../ledger', () => ({
  openAttempt: async () => 'fictional-delivery-attempt',
  settleAttempt: (...args: unknown[]) => mockSettleAttempt(...args),
  stateForFailure: (kind: string) => kind === 'exception' ? 'indeterminate' : 'refused',
}));

import { sendEmail, classifyProviderError } from '../sendEmail';
import { SmtpProvider } from '../providers/SmtpProvider';
import type { EmailProvider, ProviderSendResult } from '../providers/types';

// Preserve the provider-error taxonomy regression without selecting or
// registering Resend. These unit cases exercise the vendor-neutral boundary.
const fictionalProvider: EmailProvider = {
  name: 'fictional', isConfigured: () => true,
  send: async (message) => await mockSend(message) as ProviderSendResult,
};
const send = () =>
  sendEmail({ purpose: 'test:unit', to: 'someone@example.invalid', subject: 's', text: 't', provider: fictionalProvider });

const refuse = (name: string, message: string) =>
  mockSend.mockResolvedValue({ accepted: false, rawError: { name, message } });

beforeEach(() => {
  mockSend.mockReset();
  mockSendMail.mockReset();
  mockCapacityQuery.mockReset();
  mockTransaction.mockReset();
  mockSettleAttempt.mockReset();
  mockSettleAttempt.mockResolvedValue(undefined);
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
    mockSend.mockResolvedValue({ accepted: false, rawError: { name: 'no_message_id', message: 'No provider id' } });
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
    mockSend.mockResolvedValue({ accepted: true, providerMessageId: 'msg_abc123' });
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


describe('AUTH-RETURN-01 actual SMTP adapter → helper boundary', () => {
  const challengeId = 'df3eeaf5-6bc8-4fb5-b832-c00606ce4148';
  const request = {
    purpose: 'auth:email-code', from: 'Soullab <noreply@soullab.life>',
    to: 'fiction@example.invalid', subject: 'Your fictional code', text: 'fixture-only',
    correlationId: challengeId, idempotencyKey: `AUTH_CODE:${challengeId}`,
  };
  const smtp = () => new SmtpProvider({
    host: '127.0.0.1', port: 2525, user: 'noreply@soullab.life', password: 'fictional-only',
  });

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    mockTransaction.mockImplementation(async (fn) => fn({ query: mockCapacityQuery }));
    mockCapacityQuery.mockImplementation(async (statement) => {
      const sql = String(statement);
      if (sql.includes('pg_advisory_xact_lock')) return { rows: [], rowCount: 1 };
      if (sql.includes('minute_count')) return { rows: [{ minute_count: '0', day_count: '0' }], rowCount: 1 };
      if (sql.includes('SELECT id') || sql.includes('UPDATE auth_email_challenges')) {
        return { rows: [{ id: challengeId }], rowCount: 1 };
      }
      throw new Error('Unexpected fictional capacity query');
    });
  });

  it('reports the actual adapter acceptance and settles accepted evidence', async () => {
    mockSendMail.mockResolvedValue({ messageId: '<fixture@local>', accepted: [request.to], rejected: [] });
    await expect(sendEmail({ ...request, provider: smtp() })).resolves.toMatchObject({
      success: true, id: '<fixture@local>', provider: 'smtp',
    });
    expect(mockSendMail).toHaveBeenCalledTimes(1);
    expect(mockSettleAttempt).toHaveBeenLastCalledWith('fictional-delivery-attempt', {
      state: 'accepted', providerMessageId: '<fixture@local>',
    });
  });

  it('keeps an explicit SMTP refusal distinct from unknown delivery', async () => {
    mockSendMail.mockRejectedValue(Object.assign(new Error('Fictional SMTP refusal'), { responseCode: 550 }));
    const result = await sendEmail({ ...request, provider: smtp() });
    expect(result).toMatchObject({ success: false, failureKind: 'provider_error' });
    expect(mockSettleAttempt).toHaveBeenLastCalledWith('fictional-delivery-attempt', expect.objectContaining({ state: 'refused' }));
  });

  it('keeps lost response unknown through the real adapter and helper', async () => {
    mockSendMail.mockRejectedValue(Object.assign(new Error('Fictional response lost'), { code: 'ETIMEDOUT' }));
    const result = await sendEmail({ ...request, provider: smtp() });
    expect(result).toMatchObject({ success: false, status: 'exception', failureKind: 'exception', retryable: false });
    expect(mockSettleAttempt).toHaveBeenLastCalledWith('fictional-delivery-attempt', expect.objectContaining({ state: 'indeterminate' }));
    expect(mockSendMail).toHaveBeenCalledTimes(1);
  });

  it('does not call incomplete acceptance a definite refusal', async () => {
    mockSendMail.mockResolvedValue({ accepted: [request.to], rejected: [] });
    const result = await sendEmail({ ...request, provider: smtp() });
    expect(result).toMatchObject({ success: false, failureKind: 'exception', retryable: false });
    expect(mockSettleAttempt).toHaveBeenLastCalledWith('fictional-delivery-attempt', expect.objectContaining({ state: 'indeterminate' }));
  });

  it('blocks a non-auth purpose before capacity or SMTP calls', async () => {
    const result = await sendEmail({ ...request, purpose: 'broadcast:update', provider: smtp() });
    expect(result).toMatchObject({ success: false, failureKind: 'provider_config', providerCode: 'smtp_scope_refused' });
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('fails closed before SMTP when capacity storage is unavailable', async () => {
    mockTransaction.mockRejectedValue(new Error('Fictional database unavailable'));
    const result = await sendEmail({ ...request, provider: smtp() });
    expect(result).toMatchObject({ success: false, providerCode: 'smtp_capacity_unavailable', retryable: false });
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('does not select Resend even if its key is present', async () => {
    const oldProvider = process.env.EMAIL_PROVIDER;
    const oldKey = process.env.RESEND_API_KEY;
    process.env.EMAIL_PROVIDER = 'resend';
    process.env.RESEND_API_KEY = 'fictional-unusable-fixture-key';
    try {
      await expect(sendEmail(request)).resolves.toMatchObject({ success: false, status: 'not_configured' });
      expect(mockSendMail).not.toHaveBeenCalled();
    } finally {
      if (oldProvider === undefined) delete process.env.EMAIL_PROVIDER;
      else process.env.EMAIL_PROVIDER = oldProvider;
      if (oldKey === undefined) delete process.env.RESEND_API_KEY;
      else process.env.RESEND_API_KEY = oldKey;
    }
  });
});
