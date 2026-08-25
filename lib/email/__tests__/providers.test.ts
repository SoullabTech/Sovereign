/**
 * PROVIDER BOUNDARY — the contract, and the two refusals in provider selection.
 *
 * The rule under test throughout: `accepted: true` means the vendor took
 * responsibility AND issued an id. Anything else is a refusal, and a refusal
 * must never reach a caller as a send.
 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

const mockSend = jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: (...args: unknown[]) => mockSend(...args) },
  })),
}));

import { ResendProvider } from '../providers/ResendProvider';
import { MemoryProvider } from '../providers/MemoryProvider';
import { resolveProviderName, getEmailProvider, __setEmailProviderForTests } from '../providers';
import { sendEmail } from '../sendEmail';

const MESSAGE = { from: 'a@soullab.life', to: 'b@example.com', subject: 's', text: 't' };

const ENV = { ...process.env };
beforeEach(() => {
  mockSend.mockReset();
  process.env = { ...ENV, RESEND_API_KEY: 'test-key' };
  __setEmailProviderForTests(null);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => {
  process.env = ENV;
  __setEmailProviderForTests(null);
  jest.restoreAllMocks();
});

describe('ResendProvider', () => {
  it('acceptance requires a vendor-issued message id', async () => {
    mockSend.mockResolvedValue({ data: { id: 'msg_1' }, error: null });
    await expect(new ResendProvider().send(MESSAGE)).resolves.toEqual({
      accepted: true,
      providerMessageId: 'msg_1',
    });
  });

  it('a RESOLVED refusal is not an acceptance, and the vendor error survives verbatim', async () => {
    // The whole reason this boundary exists: the SDK resolves on rejection.
    const error = { name: 'monthly_quota_exceeded', message: 'You have reached your limit' };
    mockSend.mockResolvedValue({ data: null, error });

    const result = await new ResendProvider().send(MESSAGE);

    expect(result.accepted).toBe(false);
    // Verbatim — flattening this to a sentence discards the only fact that
    // distinguishes "top up the account" from "fix the payload".
    expect(result).toMatchObject({ rawError: error });
  });

  it('no error AND no id is a refusal, not an invented success', async () => {
    mockSend.mockResolvedValue({ data: null, error: null });
    const result = await new ResendProvider().send(MESSAGE);
    expect(result.accepted).toBe(false);
  });

  it('reports unconfigured rather than constructing a client without a key', async () => {
    delete process.env.RESEND_API_KEY;
    const provider = new ResendProvider();
    expect(provider.isConfigured()).toBe(false);
    const result = await provider.send(MESSAGE);
    expect(result.accepted).toBe(false);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('an explicit key is used INSTEAD of the environment — BYO practitioner routing', () => {
    delete process.env.RESEND_API_KEY;
    expect(new ResendProvider('practitioner-key').isConfigured()).toBe(true);
  });
});

describe('provider selection', () => {
  it('defaults to resend', () => {
    delete process.env.EMAIL_PROVIDER;
    expect(resolveProviderName()).toBe('resend');
    expect(getEmailProvider().name).toBe('resend');
  });

  it('REFUSES an unknown provider instead of silently falling back', () => {
    process.env.EMAIL_PROVIDER = 'mailgun';
    // A deploy that asked for one provider and got another is a deploy that is
    // not running what it says it is running.
    expect(() => resolveProviderName()).toThrow(/not a supported provider/);
  });

  it('REFUSES the capture transport in production', () => {
    process.env.EMAIL_PROVIDER = 'memory';
    process.env.NODE_ENV = 'production';
    expect(() => resolveProviderName()).toThrow(/refused in production/);
  });

  it('allows the capture transport outside production', () => {
    process.env.EMAIL_PROVIDER = 'memory';
    process.env.NODE_ENV = 'test';
    expect(resolveProviderName()).toBe('memory');
  });

  it('a provider-selection refusal reaches the caller as a classified failure, not a crash', async () => {
    process.env.EMAIL_PROVIDER = 'mailgun';
    const result = await sendEmail({ purpose: 'auth:email-code', to: 'x@example.com', subject: 's', text: 't' });

    expect(result.success).toBe(false);
    expect(result.failureKind).toBe('not_configured');
    expect(result.ourFault).toBe(true);
  });
});

describe('sendEmail carries classification through to the result', () => {
  it('a successful send reports its lane and its provider', async () => {
    const memory = new MemoryProvider();
    const result = await sendEmail({
      purpose: 'auth:email-code',
      to: 'x@example.com',
      subject: 's',
      text: 't',
      provider: memory,
      correlationId: 'req-1',
    });

    expect(result).toMatchObject({ success: true, provider: 'memory', priority: 'P0' });
    expect(memory.sent()).toHaveLength(1);
  });

  it('a FAILED send still reports its lane — an incident needs to know what was hit', async () => {
    mockSend.mockResolvedValue({ data: null, error: { name: 'monthly_quota_exceeded', message: 'limit' } });
    const result = await sendEmail({ purpose: 'auth:email-code', to: 'x@example.com', subject: 's', text: 't' });

    expect(result.success).toBe(false);
    expect(result.priority).toBe('P0');
    expect(result.provider).toBe('resend');
    expect(result.failureKind).toBe('quota_exceeded');
  });

  it('purpose, lane and correlation travel WITH the message as provider tags', async () => {
    const memory = new MemoryProvider();
    await sendEmail({
      purpose: 'auth:magic-link',
      to: 'x@example.com',
      subject: 's',
      text: 't',
      provider: memory,
      correlationId: 'req-42',
      idempotencyKey: 'AUTH_CODE:tok-9',
      metadata: { surface: 'signin' },
    });

    const tags = memory.sent()[0].tags ?? [];
    const byName = Object.fromEntries(tags.map((t) => [t.name, t.value]));
    // Normalised: ':' is not legal in a provider tag, and a rejected TAG fails
    // the whole send — turning observability into an outage.
    expect(byName.purpose).toBe('auth_magic-link');
    expect(byName.priority).toBe('P0');
    expect(byName.correlation_id).toBe('req-42');
    expect(byName.idempotency_key).toBe('AUTH_CODE_tok-9');
    expect(byName.surface).toBe('signin');
  });

  it('CONTROL: tag normalisation leaves already-legal values untouched', async () => {
    const memory = new MemoryProvider();
    await sendEmail({
      purpose: 'auth:email-code',
      to: 'x@example.com',
      subject: 's',
      text: 't',
      provider: memory,
      metadata: { plain_value: 'already-legal_123' },
    });
    const tags = memory.sent()[0].tags ?? [];
    expect(tags).toContainEqual({ name: 'plain_value', value: 'already-legal_123' });
  });
});
