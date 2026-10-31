/** AUTH-RETURN-01 managed SMTP acceptance boundary. */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockSendMail = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockCreateTransport = jest.fn(() => ({ sendMail: (options: unknown) => mockSendMail(options) }));
jest.mock('nodemailer', () => ({ createTransport: (options: unknown) => mockCreateTransport(options) }));

import { SmtpProvider } from '../SmtpProvider';

const MESSAGE = {
  purpose: 'auth:email-code',
  from: 'Soullab <noreply@soullab.life>',
  to: 'fiction@example.invalid',
  subject: 'Your sign-in code',
  text: 'code',
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.NODE_ENV = 'test';
  process.env.SMTP_HOST = 'smtp.protonmail.ch';
  process.env.SMTP_USER = 'noreply@soullab.life';
  process.env.SMTP_PASSWORD = 'fictional-secret';
  delete process.env.SMTP_PASS;
  delete process.env.SMTP_PASSWORD_FILE;
  delete process.env.SMTP_PORT;
  delete process.env.SMTP_SECURE;
});

describe('SmtpProvider configuration', () => {
  it('requires host, managed user and a credential', () => {
    expect(new SmtpProvider().isConfigured()).toBe(true);
    delete process.env.SMTP_PASSWORD;
    expect(new SmtpProvider().isConfigured()).toBe(false);
  });

  it('refuses an authenticated user different from the managed mailbox', () => {
    process.env.SMTP_USER = 'other@soullab.life';
    expect(new SmtpProvider().isConfigured()).toBe(false);
  });
});

describe('SmtpProvider send truth', () => {
  it('accepts only when a message id and recipient acceptance both exist', async () => {
    mockSendMail.mockResolvedValue({
      messageId: '<abc@soullab.life>', accepted: ['fiction@example.invalid'], rejected: [],
    });
    await expect(new SmtpProvider().send(MESSAGE)).resolves.toEqual({
      accepted: true, providerMessageId: '<abc@soullab.life>',
    });
  });

  it('refuses multiple recipients before contacting SMTP', async () => {
    mockSendMail.mockResolvedValue({
      messageId: '<abc@soullab.life>',
      accepted: ['ok@example.invalid'],
      rejected: ['refused@example.invalid'],
    });
    const result = await new SmtpProvider().send({
      ...MESSAGE, to: ['ok@example.invalid', 'refused@example.invalid'],
    });
    expect(result.accepted).toBe(false);
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('reports missing message id or zero acceptance as unknown delivery', async () => {
    mockSendMail.mockResolvedValue({ accepted: ['fiction@example.invalid'], rejected: [] });
    await expect(new SmtpProvider().send(MESSAGE)).rejects.toThrow(/acceptance could not be verified/);
    mockSendMail.mockResolvedValue({ messageId: '<x@y>', accepted: [], rejected: [] });
    await expect(new SmtpProvider().send(MESSAGE)).rejects.toThrow(/acceptance could not be verified/);
  });

  it('returns definite authentication refusal as a raw error', async () => {
    mockSendMail.mockRejectedValue(Object.assign(new Error('Invalid login'), { code: 'EAUTH' }));
    const result = await new SmtpProvider().send(MESSAGE);
    expect(result.accepted).toBe(false);
    expect((result as { rawError: unknown }).rawError).toBeDefined();
  });

  it('preserves socket timeout ambiguity for the caller', async () => {
    const error = Object.assign(new Error('SMTP response lost'), { code: 'ETIMEDOUT' });
    mockSendMail.mockRejectedValue(error);
    await expect(new SmtpProvider().send(MESSAGE)).rejects.toBe(error);
  });

  it('returns an explicit negative SMTP response as a refusal', async () => {
    const error = Object.assign(new Error('Recipient refused'), { responseCode: 550 });
    mockSendMail.mockRejectedValue(error);
    await expect(new SmtpProvider().send(MESSAGE)).resolves.toEqual({ accepted: false, rawError: error });
  });

  it('does not accept a different recipient or an inconsistent acceptance result', async () => {
    mockSendMail.mockResolvedValue({ messageId: '<x@y>', accepted: ['other@example.invalid'], rejected: [] });
    await expect(new SmtpProvider().send(MESSAGE)).rejects.toThrow(/acceptance could not be verified/);
    mockSendMail.mockResolvedValue({
      messageId: '<x@y>', accepted: ['fiction@example.invalid'], rejected: ['fiction@example.invalid'],
    });
    await expect(new SmtpProvider().send(MESSAGE)).rejects.toThrow(/acceptance could not be verified/);
  });

  it('refuses an unapproved purpose without contacting SMTP', async () => {
    const result = await new SmtpProvider().send({ ...MESSAGE, purpose: 'broadcast:update' });
    expect(result.accepted).toBe(false);
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('refuses From drift before contacting SMTP', async () => {
    const result = await new SmtpProvider().send({ ...MESSAGE, from: 'Kelly <kelly@soullab.life>' });
    expect(result.accepted).toBe(false);
    expect(mockCreateTransport).not.toHaveBeenCalled();
  });

  it('carries purpose and lane as SMTP headers', async () => {
    mockSendMail.mockResolvedValue({
      messageId: '<a@b>', accepted: ['fiction@example.invalid'], rejected: [],
    });
    await new SmtpProvider().send({
      ...MESSAGE,
      tags: [{ name: 'purpose', value: 'auth_email-code' }, { name: 'priority', value: 'P0' }],
    });
    const sent = mockSendMail.mock.calls[0][0] as { headers: Record<string, string> };
    expect(sent.headers['X-Soullab-purpose']).toBe('auth_email-code');
    expect(sent.headers['X-Soullab-priority']).toBe('P0');
  });
});

describe('SmtpProvider transport policy', () => {
  it('requires STARTTLS and TLS 1.2+', async () => {
    mockSendMail.mockResolvedValue({
      messageId: '<a@b>', accepted: ['fiction@example.invalid'], rejected: [],
    });
    await new SmtpProvider().send(MESSAGE);
    expect(mockCreateTransport).toHaveBeenCalledWith(expect.objectContaining({
      host: 'smtp.protonmail.ch',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: 'noreply@soullab.life', pass: 'fictional-secret' },
      tls: { minVersion: 'TLSv1.2' },
    }));
  });

  it('supports explicit isolated fake-Proton configuration without ambient fallback', async () => {
    process.env.SMTP_HOST = 'global.invalid';
    process.env.SMTP_USER = 'noreply@soullab.life';
    process.env.SMTP_PASSWORD = 'global-secret';
    mockSendMail.mockResolvedValue({
      messageId: '<fake-proton@soullab.life>',
      accepted: ['fiction@example.invalid'],
      rejected: [],
    });

    const provider = new SmtpProvider({
      host: '127.0.0.1',
      user: 'noreply@soullab.life',
      password: 'isolated-secret',
      port: 2525,
      secure: false,
    });
    await provider.send(MESSAGE);
    expect(mockCreateTransport).toHaveBeenCalledWith(expect.objectContaining({
      host: '127.0.0.1',
      port: 2525,
      auth: { user: 'noreply@soullab.life', pass: 'isolated-secret' },
    }));
  });

  it('does not backfill missing explicit credentials from ambient SMTP variables', () => {
    const provider = new SmtpProvider({
      host: '127.0.0.1', user: 'noreply@soullab.life', port: 2525,
    });
    expect(provider.isConfigured()).toBe(false);
  });
});
