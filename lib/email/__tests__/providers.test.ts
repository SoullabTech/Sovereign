/**
 * PROVIDER BOUNDARY — sovereign mail selection.
 *
 * Production mail uses SMTP only. Memory remains a non-production capture
 * transport for tests. Unknown providers fail loudly; there is no vendor
 * fallback path.
 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

import { MemoryProvider } from '../providers/MemoryProvider';
import { resolveProviderName, getEmailProvider, __setEmailProviderForTests } from '../providers';
import { sendEmail } from '../sendEmail';

const ENV = { ...process.env };

beforeEach(() => {
  process.env = {
    ...ENV,
    NODE_ENV: 'test',
    SMTP_HOST: 'smtp.example.com',
    SMTP_USER: 'user',
    SMTP_PASSWORD: 'pass',
  };
  __setEmailProviderForTests(null);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => {
  process.env = ENV;
  __setEmailProviderForTests(null);
  jest.restoreAllMocks();
});

describe('provider selection', () => {
  it('defaults to smtp', () => {
    delete process.env.EMAIL_PROVIDER;
    expect(resolveProviderName()).toBe('smtp');
    expect(getEmailProvider().name).toBe('smtp');
  });

  it('REFUSES an unknown provider instead of silently falling back', () => {
    process.env.EMAIL_PROVIDER = 'resend';
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
  it('a provider-selection refusal reaches the caller as a classified failure', async () => {
    process.env.EMAIL_PROVIDER = 'resend';
    const result = await sendEmail({
      purpose: 'auth:email-code',
      to: 'x@example.com',
      subject: 's',
      text: 't',
    });

    expect(result.success).toBe(false);
    expect(result.failureKind).toBe('not_configured');
    expect(result.ourFault).toBe(true);
  });
});

describe('sendEmail carries policy through provider changes', () => {
  it('a successful send reports its lane and provider', async () => {
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
  it('purpose, lane and correlation travel with the message', async () => {
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
    expect(byName.purpose).toBe('auth_magic-link');
    expect(byName.priority).toBe('P0');
    expect(byName.correlation_id).toBe('req-42');
    expect(byName.idempotency_key).toBe('AUTH_CODE_tok-9');
    expect(byName.surface).toBe('signin');
  });
});
