/**
 * SMTP PROVIDER — the acceptance rule, in SMTP's own terms.
 * =========================================================
 *
 * The boundary rule is that `accepted: true` means the server took
 * responsibility AND issued an id. SMTP makes this sharper than an HTTP API
 * does, because one transaction can accept some recipients and reject others.
 *
 * These tests exist because reporting a partial acceptance as a send is the
 * 2026-08-24 defect one layer down: a member told their sign-in code is on its
 * way when the server refused their address.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockSendMail = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockCreateTransport = jest.fn(() => ({ sendMail: (o: unknown) => mockSendMail(o) }));
jest.mock('nodemailer', () => ({ createTransport: (o: unknown) => mockCreateTransport(o) }));

import { SmtpProvider } from '../SmtpProvider';

const msg = {
  from: 'MAIA <noreply@soullab.life>',
  to: 'member@example.com',
  subject: 'Your sign-in code',
  text: 'code',
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.SMTP_HOST = 'smtp.example.com';
  process.env.SMTP_USER = 'user';
  process.env.SMTP_PASSWORD = 'pass';
  delete process.env.SMTP_PORT;
  delete process.env.SMTP_SECURE;
});

describe('SmtpProvider.isConfigured', () => {
  it('is false without credentials — a host alone is not a transport', () => {
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASSWORD;
    expect(new SmtpProvider().isConfigured()).toBe(false);
  });

  it('is true with host, user and password', () => {
    expect(new SmtpProvider().isConfigured()).toBe(true);
  });
});

describe('SmtpProvider.send — what counts as accepted', () => {
  it('accepts only when a message id AND an accepted recipient come back', async () => {
    mockSendMail.mockResolvedValue({
      messageId: '<abc@soullab.life>',
      accepted: ['member@example.com'],
      rejected: [],
    });

    const r = await new SmtpProvider().send(msg);

    expect(r).toEqual({ accepted: true, providerMessageId: '<abc@soullab.life>' });
  });

  it('REFUSES a partial acceptance — any rejected recipient is not a send', async () => {
    mockSendMail.mockResolvedValue({
      messageId: '<abc@soullab.life>',
      accepted: ['ok@example.com'],
      rejected: ['refused@example.com'],
    });

    const r = await new SmtpProvider().send({ ...msg, to: ['ok@example.com', 'refused@example.com'] });

    // A message id is present. It is still not an acceptance.
    expect(r.accepted).toBe(false);
  });

  it('REFUSES a response with no message id — an unidentifiable send is not a send', async () => {
    mockSendMail.mockResolvedValue({ accepted: ['member@example.com'], rejected: [] });
    expect((await new SmtpProvider().send(msg)).accepted).toBe(false);
  });

  it('REFUSES when nobody was accepted, even with an id', async () => {
    mockSendMail.mockResolvedValue({ messageId: '<x@y>', accepted: [], rejected: [] });
    expect((await new SmtpProvider().send(msg)).accepted).toBe(false);
  });

  it('returns transport faults as rawError so the shared classifier can read them', async () => {
    // A thrown auth failure and a returned one must not classify differently.
    mockSendMail.mockRejectedValue(Object.assign(new Error('Invalid login'), { code: 'EAUTH' }));

    const r = await new SmtpProvider().send(msg);

    expect(r.accepted).toBe(false);
    expect((r as { rawError: unknown }).rawError).toBeDefined();
  });

  it('carries purpose and lane as headers, since SMTP has no tags', async () => {
    mockSendMail.mockResolvedValue({ messageId: '<a@b>', accepted: ['member@example.com'], rejected: [] });

    await new SmtpProvider().send({
      ...msg,
      tags: [{ name: 'purpose', value: 'auth:email-code' }, { name: 'lane', value: 'P0' }],
    });

    const sent = mockSendMail.mock.calls[0][0] as { headers: Record<string, string> };
    expect(sent.headers['X-Soullab-purpose']).toBe('auth:email-code');
    expect(sent.headers['X-Soullab-lane']).toBe('P0');
  });
});

describe('SmtpProvider — TLS is not optional', () => {
  it('requires STARTTLS rather than silently sending credentials in the clear', async () => {
    mockSendMail.mockResolvedValue({ messageId: '<a@b>', accepted: ['member@example.com'], rejected: [] });
    await new SmtpProvider().send(msg);

    const cfg = mockCreateTransport.mock.calls[0][0] as Record<string, unknown>;
    expect(cfg.requireTLS).toBe(true);
    expect((cfg.tls as { minVersion: string }).minVersion).toBe('TLSv1.2');
  });
});
