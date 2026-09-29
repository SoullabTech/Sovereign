jest.mock('@/lib/email/sendEmail', () => ({
  SENDERS: { default: 'Soullab <noreply@soullab.life>' },
  sendEmail: jest.fn(),
}));

import { NextRequest } from 'next/server';
import { sendEmail } from '@/lib/email/sendEmail';
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
  process.env = { ...originalEnv, INTERNAL_ALERT_TOKEN: 'alert-token' };
  delete process.env.RESEND_API_KEY;
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

describe('/api/build/alert provider-neutral paging', () => {
  it('fails closed when the internal alert token is not configured', async () => {
    delete process.env.INTERNAL_ALERT_TOKEN;

    const res = await POST(req());

    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe('server_not_configured');
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('uses sendEmail even when no Resend key exists', async () => {
    const res = await POST(req());

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.channels.email).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockSendEmail.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        purpose: 'build:alert',
        to: 'kelly@soullab.life',
        from: 'Soullab <noreply@soullab.life>',
      })
    );
  });

  it('returns 503 rather than false success when every channel refuses', async () => {
    mockSendEmail.mockResolvedValue({
      success: false,
      status: 'not_configured',
      provider: 'smtp',
      failureKind: 'not_configured',
    });

    const res = await POST(req());

    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('no_alert_channel_delivered');
    expect(body.channels).toEqual({ email: false });
  });

  it('does not count a non-2xx Slack response as delivered', async () => {
    mockSendEmail.mockResolvedValue({
      success: false,
      status: 'not_configured',
      provider: 'smtp',
      failureKind: 'not_configured',
    });
    process.env.SLACK_WEBHOOK_URL = 'https://hooks.example.invalid/test';
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response('no', { status: 500 })
    );

    const res = await POST(req());

    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.channels.email).toBe(false);
    expect(body.channels.slack).toBe(false);
    fetchMock.mockRestore();
  });

  it('accepts a successful optional channel when email is unavailable', async () => {
    mockSendEmail.mockResolvedValue({
      success: false,
      status: 'not_configured',
      provider: 'smtp',
      failureKind: 'not_configured',
    });
    process.env.SLACK_WEBHOOK_URL = 'https://hooks.example.invalid/test';
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response('ok', { status: 200 })
    );

    const res = await POST(req());

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.channels.email).toBe(false);
    expect(body.channels.slack).toBe(true);
    fetchMock.mockRestore();
  });
});
