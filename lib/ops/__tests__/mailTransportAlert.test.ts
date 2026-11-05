import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { notifyMailTransportDown, resetMailTransportAlertThrottle } from '../mailTransportAlert.server';

const ENV_KEYS = [
  'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER', 'TWILIO_MESSAGING_SERVICE_SID',
  'OPS_ALERT_PHONE', 'OPS_ALERT_SLACK_WEBHOOK_URL',
];
const saved: Record<string, string | undefined> = {};
const alert = { kind: 'provider_auth', providerCode: 'validation_error', purpose: 'auth:email-code' };

describe('mail transport down alert', () => {
  let fetchMock: jest.Mock;
  beforeEach(() => {
    for (const k of ENV_KEYS) { saved[k] = process.env[k]; delete process.env[k]; }
    resetMailTransportAlertThrottle();
    fetchMock = jest.fn(async () => ({ ok: true, json: async () => ({ error_code: null }) }));
    (globalThis as unknown as { fetch: unknown }).fetch = fetchMock;
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => { for (const k of ENV_KEYS) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; } });

  function configureSms() {
    process.env.TWILIO_ACCOUNT_SID = 'ACfictional';
    process.env.TWILIO_AUTH_TOKEN = 'fictional';
    process.env.TWILIO_FROM_NUMBER = '+15550000001';
    process.env.OPS_ALERT_PHONE = '+15550000002';
  }

  it('says so loudly and never claims delivery when no recipient is configured', async () => {
    const r = await notifyMailTransportDown(alert, 1);
    expect(r.delivered).toBe(false);
    expect(r.sms).toBe('not_configured');
    expect(fetchMock).not.toHaveBeenCalled();
    expect((console.error as jest.Mock).mock.calls.some((c) => String(c[0]).includes('OPS_NOTIFY_NO_RECIPIENT'))).toBe(true);
  });

  it('sends one content-free SMS when configured', async () => {
    configureSms();
    const r = await notifyMailTransportDown(alert, 1);
    expect(r.delivered).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const raw = ((fetchMock.mock.calls[0] as unknown[])[1] as { body: string }).body;
    const text = new URLSearchParams(raw).get('Body') ?? '';
    expect(text).toContain('EMAIL TRANSPORT DOWN');
    expect(text).not.toMatch(/[\w.]+@[\w.]+/);
  });

  it('pages once per kind inside the window, again after it', async () => {
    configureSms();
    await notifyMailTransportDown(alert, 1);
    const second = await notifyMailTransportDown(alert, 2);
    expect(second.throttled).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await notifyMailTransportDown(alert, 1 + 6 * 60 * 60 * 1000 + 1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('a different kind is not throttled by another', async () => {
    configureSms();
    await notifyMailTransportDown(alert, 1);
    await notifyMailTransportDown({ ...alert, kind: 'quota_exceeded' }, 2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('never throws when the provider call fails', async () => {
    configureSms();
    fetchMock.mockImplementation(async () => { throw new Error('network'); });
    const r = await notifyMailTransportDown(alert, 1);
    expect(r.delivered).toBe(false);
    expect(r.sms).toBe('failed');
  });
});
