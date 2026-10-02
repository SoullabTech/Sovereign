jest.mock('@/lib/email/sendEmail', () => ({
  sendEmail: jest.fn(),
}));

import { NextRequest } from 'next/server';
import { sendEmail } from '@/lib/email/sendEmail';
import { SmtpProvider } from '@/lib/email/providers/SmtpProvider';
import { POST } from '../route';

const mockSendEmail = sendEmail as jest.Mock;
const originalEnv = { ...process.env };

function req(token = 'alert-token') {
  return new NextRequest('http://localhost/api/build/alert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-token': token,
    },
    body: JSON.stringify({
      severity: 'critical',
      message: 'production health failed',
      commit: 'abc123',
      source: 'readiness-test',
    }),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  process.env = {
    ...originalEnv,
    INTERNAL_ALERT_TOKEN: 'alert-token',
    EMAIL_PROVIDER: 'resend',
    ALERT_SMTP_HOST: 'smtp.protonmail.ch',
    ALERT_SMTP_PORT: '587',
    ALERT_SMTP_SECURE: 'false',
    ALERT_SMTP_USER: 'messages@soullab.life',
    ALERT_SMTP_PASSWORD: 'alert-token-secret',
    ALERT_FROM: 'Soullab Operations <messages@soullab.life>',
  };
  delete process.env.SLACK_WEBHOOK_URL;
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_CHAT_ID;
  mockSendEmail.mockResolvedValue({
    success: true,
    status: 'sent',
    provider: 'smtp',
  });
});

afterAll(() => {
  process.env = originalEnv;
});

describe('/api/build/alert dedicated SMTP paging', () => {
  it('fails closed when the internal alert token is not configured', async () => {
    delete process.env.INTERNAL_ALERT_TOKEN;

    const res = await POST(req());

    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe('server_not_configured');
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('fails closed when dedicated alert SMTP is not configured', async () => {
    delete process.env.ALERT_SMTP_PASSWORD;

    const res = await POST(req());

    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe('alert_smtp_not_configured');
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('still attempts optional Slack when required SMTP is unavailable', async () => {
    delete process.env.ALERT_SMTP_PASSWORD;
    process.env.SLACK_WEBHOOK_URL = 'https://hooks.example.invalid/test';
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response('ok', { status: 200 })
    );

    const res = await POST(req());

    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('alert_smtp_not_configured');
    expect(body.channels.email).toBe(false);
    expect(body.channels.slack).toBe(true);
    expect(mockSendEmail).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fetchMock.mockRestore();
  });

  it('uses a dedicated SMTP provider without changing the global member-mail provider', async () => {
    process.env.EMAIL_PROVIDER = 'resend';

    const res = await POST(req());

    expect(res.status).toBe(200);
    expect(process.env.EMAIL_PROVIDER).toBe('resend');
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        purpose: 'build:alert',
        to: 'kelly@soullab.life',
        from: 'Soullab Operations <messages@soullab.life>',
        provider: expect.any(SmtpProvider),
      })
    );
  });

  it('refuses a From identity that does not match the SMTP token user', async () => {
    process.env.ALERT_FROM = 'Soullab Operations <noreply@soullab.life>';

    const res = await POST(req());

    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe('alert_sender_mismatch');
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('returns 503 on a Proton refusal even if an optional channel succeeds', async () => {
    mockSendEmail.mockResolvedValue({
      success: false,
      status: 'error',
      provider: 'smtp',
      failureKind: 'provider_auth',
    });
    process.env.SLACK_WEBHOOK_URL = 'https://hooks.example.invalid/test';
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response('ok', { status: 200 })
    );

    const res = await POST(req());

    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('required_alert_email_not_delivered');
    expect(body.channels.email).toBe(false);
    expect(body.channels.slack).toBe(true);
    fetchMock.mockRestore();
  });

  it('stays successful when required email succeeds even if Slack refuses', async () => {
    process.env.SLACK_WEBHOOK_URL = 'https://hooks.example.invalid/test';
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response('no', { status: 500 })
    );

    const res = await POST(req());

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.channels.email).toBe(true);
    expect(body.channels.slack).toBe(false);
    fetchMock.mockRestore();
  });
});
