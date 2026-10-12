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
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { mkdtempSync, rmSync, writeFileSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

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
  process.env.SMTP_USER = 'noreply@soullab.life';
  process.env.SMTP_PASSWORD = 'pass';
  delete process.env.SMTP_PORT;
  delete process.env.SMTP_SECURE;
  delete process.env.SMTP_PASSWORD_FILE;
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

describe('SmtpProvider — authenticated sender authority', () => {

  it('refuses a mismatched From before constructing a transport', async () => {
    const r = await new SmtpProvider().send({
      ...msg, from: 'Kelly <kelly@soullab.life>',
    });
    expect(r).toMatchObject({
      accepted: false,
      rawError: { name: 'smtp_sender_not_authorized' },
    });
    expect(mockCreateTransport).not.toHaveBeenCalled();
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('refuses injected From headers', async () => {
    const r = await new SmtpProvider().send({
      ...msg, from: 'noreply@soullab.life\r\nBcc: attacker@example.com',
    });
    expect(r.accepted).toBe(false);
    expect(mockSendMail).not.toHaveBeenCalled();
  });
});

describe('SmtpProvider — owner-only file-backed Proton token', () => {
  let workdir = '';
  afterEach(() => {
    if (workdir) rmSync(workdir, { recursive: true, force: true });
    workdir = '';
    delete process.env.SMTP_PASSWORD_FILE;
  });

  it('reads the token only from a private file, never from docker env', async () => {
    workdir = mkdtempSync(join(tmpdir(), 'mail-smtp-secret-'));
    const tokenPath = join(workdir, 'smtp.token');
    writeFileSync(tokenPath, 'private-test-token\n', { mode: 0o600 });
    delete process.env.SMTP_PASSWORD;
    process.env.SMTP_PASSWORD_FILE = tokenPath;
    const provider = new SmtpProvider();
    expect(provider.isConfigured()).toBe(true);
    mockSendMail.mockResolvedValue({
      messageId: '<proof@soullab.life>',
      accepted: ['member@example.com'], rejected: [],
    });
    const result = await provider.send(msg);
    expect(result.accepted).toBe(true);
    expect(mockCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({ auth: { user: 'noreply@soullab.life', pass: 'private-test-token' } })
    );
  });

  it('refuses world-readable token files and does not touch the network', async () => {
    workdir = mkdtempSync(join(tmpdir(), 'mail-smtp-secret-'));
    const tokenPath = join(workdir, 'smtp.token');
    writeFileSync(tokenPath, 'unsafe-token\n', { mode: 0o600 });
    chmodSync(tokenPath, 0o644);
    delete process.env.SMTP_PASSWORD;
    process.env.SMTP_PASSWORD_FILE = tokenPath;
    expect(new SmtpProvider().isConfigured()).toBe(false);
    expect(mockCreateTransport).not.toHaveBeenCalled();
  });

  it('refuses ambiguous file-and-environment credentials', () => {
    workdir = mkdtempSync(join(tmpdir(), 'mail-smtp-secret-'));
    const tokenPath = join(workdir, 'smtp.token');
    writeFileSync(tokenPath, 'private-token\n', { mode: 0o600 });
    process.env.SMTP_PASSWORD = 'env-other-token';
    process.env.SMTP_PASSWORD_FILE = tokenPath;
    expect(new SmtpProvider().isConfigured()).toBe(false);
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


describe('SmtpProvider — explicit isolated configuration', () => {
  it('uses explicit credentials instead of ambient SMTP_*', async () => {
    process.env.SMTP_HOST = 'global.example.com';
    process.env.SMTP_USER = 'global-user';
    process.env.SMTP_PASSWORD = 'global-pass';
    mockSendMail.mockResolvedValue({
      messageId: '<alert@soullab.life>',
      accepted: ['member@example.com'],
      rejected: [],
    });

    const provider = new SmtpProvider({
      host: 'smtp.protonmail.ch',
      user: 'messages@soullab.life',
      password: 'alert-secret',
      port: 587,
      secure: false,
    });

    await provider.send({ ...msg, from: 'Mail Service <messages@soullab.life>' });

    expect(mockCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.protonmail.ch',
        port: 587,
        secure: false,
        auth: { user: 'messages@soullab.life', pass: 'alert-secret' },
      })
    );
  });

  it('does not backfill a missing explicit credential from global SMTP_*', () => {
    process.env.SMTP_HOST = 'global.example.com';
    process.env.SMTP_USER = 'global-user';
    process.env.SMTP_PASSWORD = 'global-pass';

    const provider = new SmtpProvider({
      host: 'smtp.protonmail.ch',
      user: 'messages@soullab.life',
    });

    expect(provider.isConfigured()).toBe(false);
  });
});
