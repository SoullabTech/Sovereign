/** AUTH-RETURN-01 provider selection and classification. */
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MemoryProvider } from '../providers/MemoryProvider';
import {
  __setEmailProviderForTests,
  getEmailProvider,
  resolveProviderName,
} from '../providers';
import { sendEmail } from '../sendEmail';
import type { EmailProvider } from '../providers/types';

const ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ENV, NODE_ENV: 'test' };
  delete process.env.EMAIL_PROVIDER;
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASSWORD;
  delete process.env.SMTP_PASS;
  delete process.env.SMTP_PASSWORD_FILE;
  __setEmailProviderForTests(null);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  process.env = ENV;
  __setEmailProviderForTests(null);
  jest.restoreAllMocks();
});

describe('AUTH-RETURN-01 provider selection', () => {
  it('defaults to SMTP and never imports a Resend adapter', () => {
    expect(resolveProviderName()).toBe('smtp');
    expect(getEmailProvider().name).toBe('smtp');
    const source = readFileSync(join(process.cwd(), 'lib/email/providers/index.ts'), 'utf8');
    expect(source).not.toMatch(/ResendProvider|from ['"]resend['"]/);
  });

  it('refuses unknown providers rather than falling back', () => {
    process.env.EMAIL_PROVIDER = 'resend';
    expect(() => resolveProviderName()).toThrow(/not supported/);
  });

  it('refuses the capture transport in production', () => {
    process.env.EMAIL_PROVIDER = 'memory';
    process.env.NODE_ENV = 'production';
    expect(() => resolveProviderName()).toThrow(/refused in production/);
  });

  it('allows the capture transport only outside production', () => {
    process.env.EMAIL_PROVIDER = 'memory';
    expect(resolveProviderName()).toBe('memory');
  });

  it('turns provider-selection refusal into a classified result', async () => {
    process.env.EMAIL_PROVIDER = 'resend';
    const result = await sendEmail({
      purpose: 'auth:email-code', to: 'fiction@example.invalid', subject: 's', text: 't',
    });
    expect(result).toMatchObject({
      success: false, failureKind: 'not_configured', ourFault: true, priority: 'P0',
    });
  });
});

describe('sendEmail retains provider truth', () => {
  it('reports the lane and provider for a successful capture', async () => {
    const memory = new MemoryProvider();
    const result = await sendEmail({
      purpose: 'auth:email-code', to: 'fiction@example.invalid', subject: 's', text: 't',
      provider: memory, correlationId: 'req-1',
    });
    expect(result).toMatchObject({ success: true, provider: 'memory', priority: 'P0' });
    expect(memory.sent()).toHaveLength(1);
  });

  it('refuses an SMTP attempt without a bound challenge before contacting any provider', async () => {
    const attempted = jest.fn<(...args: unknown[]) => Promise<{ accepted: false; rawError: unknown }>>();
    attempted.mockResolvedValue({
      accepted: false,
      rawError: { name: 'smtp_rejected_recipients', message: 'server rejected recipient' },
    });
    const refusing: EmailProvider = {
      name: 'smtp',
      isConfigured: () => true,
      send: attempted,
    };
    const result = await sendEmail({
      purpose: 'auth:email-code', to: 'fiction@example.invalid', subject: 's', text: 't',
      provider: refusing,
    });
    expect(result.success).toBe(false);
    expect(result.provider).toBe('smtp');
    expect(result.priority).toBe('P0');
    expect(result.failureKind).toBe('provider_config');
    expect(result.providerCode).toBe('smtp_scope_refused');
    expect(attempted).not.toHaveBeenCalled();
  });

  it('carries purpose, lane, correlation and idempotency with the message', async () => {
    const memory = new MemoryProvider();
    await sendEmail({
      purpose: 'auth:email-code',
      to: 'fiction@example.invalid',
      subject: 's',
      text: 't',
      provider: memory,
      correlationId: 'req-42',
      idempotencyKey: 'AUTH_CODE:challenge-9',
      metadata: { surface: 'signin' },
    });
    const byName = Object.fromEntries((memory.sent()[0].tags ?? []).map((tag) => [tag.name, tag.value]));
    expect(byName).toMatchObject({
      purpose: 'auth_email-code',
      priority: 'P0',
      correlation_id: 'req-42',
      idempotency_key: 'AUTH_CODE_challenge-9',
      surface: 'signin',
    });
  });
});
