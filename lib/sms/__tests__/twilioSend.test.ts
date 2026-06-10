/**
 * sendSMS + Twilio Verify — dormancy, never-throws, and the REST contract.
 *
 * Core guarantees:
 *   - DORMANT: with the flag/creds absent, NO network call is made.
 *   - NEVER THROWS: a network failure returns a typed error result, not a throw
 *     (these run on the fire-and-forget message path).
 *   - The send hits Twilio's Messages endpoint with the alert body verbatim
 *     (callers own the content-free copy) and HTTP Basic auth.
 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { sendSMS } from '@/lib/sms/sendSMS';
import { startPhoneVerification, checkPhoneVerification } from '@/lib/sms/verifyPhone';

const KEYS = [
  'SMS_NOTIFICATIONS_ENABLED',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_MESSAGING_SERVICE_SID',
  'TWILIO_VERIFY_SERVICE_SID',
];
let saved: Record<string, string | undefined> = {};
const realFetch = global.fetch;

function configureAll() {
  process.env.SMS_NOTIFICATIONS_ENABLED = '1';
  process.env.TWILIO_ACCOUNT_SID = 'ACtest';
  process.env.TWILIO_AUTH_TOKEN = 'secret-token';
  process.env.TWILIO_MESSAGING_SERVICE_SID = 'MGtest';
  process.env.TWILIO_VERIFY_SERVICE_SID = 'VAtest';
}
function mockFetch(impl: (...args: any[]) => any) {
  global.fetch = jest.fn(impl) as any;
}
const jsonRes = (ok: boolean, status: number, data: any) => ({ ok, status, json: async () => data });

beforeEach(() => {
  saved = {};
  for (const k of KEYS) {
    saved[k] = process.env[k];
    delete process.env[k];
  }
});
afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
  global.fetch = realFetch;
  jest.restoreAllMocks();
});

describe('sendSMS — dormancy', () => {
  it('not configured → status not_configured, NO fetch', async () => {
    mockFetch(() => { throw new Error('should not be called'); });
    const r = await sendSMS({ to: '+16172165533', body: 'alert', purpose: 'dm_received' });
    expect(r).toEqual({ success: false, status: 'not_configured' });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('sendSMS — configured', () => {
  it('posts to Twilio Messages with body verbatim + Basic auth', async () => {
    configureAll();
    mockFetch(async () => jsonRes(true, 201, { sid: 'SM123' }));
    const r = await sendSMS({
      to: '(617) 216-5533',
      body: 'You have a new Co-lab message from Nathan. Open Co-lab: https://soullab.life/team',
      purpose: 'dm_received',
    });
    expect(r.success).toBe(true);
    expect(r.sid).toBe('SM123');

    const [url, init] = (global.fetch as any).mock.calls[0];
    expect(url).toContain('/Accounts/ACtest/Messages.json');
    const params = new URLSearchParams(init.body);
    expect(params.get('To')).toBe('+16172165533'); // normalized
    expect(params.get('MessagingServiceSid')).toBe('MGtest');
    expect(params.get('Body')).toContain('new Co-lab message from Nathan'); // verbatim, alert-only
    expect(init.headers.Authorization).toMatch(/^Basic /);
  });

  it('invalid number → invalid_number, NO fetch', async () => {
    configureAll();
    mockFetch(() => { throw new Error('should not be called'); });
    const r = await sendSMS({ to: 'not-a-number', body: 'x', purpose: 'mentioned' });
    expect(r.status).toBe('invalid_number');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('Twilio API error → typed error, does NOT throw', async () => {
    configureAll();
    mockFetch(async () => jsonRes(false, 400, { message: 'Invalid To number' }));
    const r = await sendSMS({ to: '+16172165533', body: 'x', purpose: 'dm_received' });
    expect(r.success).toBe(false);
    expect(r.status).toBe('error');
  });

  it('network throw is swallowed → error result, not a throw', async () => {
    configureAll();
    mockFetch(async () => { throw new Error('ECONNRESET'); });
    await expect(
      sendSMS({ to: '+16172165533', body: 'x', purpose: 'dm_received' })
    ).resolves.toMatchObject({ success: false, status: 'error' });
  });
});

describe('Twilio Verify', () => {
  it('start is dormant when unconfigured', async () => {
    mockFetch(() => { throw new Error('should not be called'); });
    const r = await startPhoneVerification('+16172165533');
    expect(r.status).toBe('not_configured');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('start posts to Verifications with Channel=sms', async () => {
    configureAll();
    mockFetch(async () => jsonRes(true, 201, { status: 'pending' }));
    const r = await startPhoneVerification('6172165533');
    expect(r.success).toBe(true);
    const [url, init] = (global.fetch as any).mock.calls[0];
    expect(url).toContain('/Services/VAtest/Verifications');
    expect(new URLSearchParams(init.body).get('Channel')).toBe('sms');
  });

  it('check returns approved on status approved', async () => {
    configureAll();
    mockFetch(async () => jsonRes(true, 200, { status: 'approved' }));
    const r = await checkPhoneVerification('+16172165533', '123456');
    expect(r.approved).toBe(true);
  });

  it('check returns rejected on a 200 non-approved (wrong code)', async () => {
    configureAll();
    mockFetch(async () => jsonRes(true, 200, { status: 'pending' }));
    const r = await checkPhoneVerification('+16172165533', '000000');
    expect(r.approved).toBe(false);
    expect(r.status).toBe('rejected');
  });

  it('check rejects a malformed code without a network call', async () => {
    configureAll();
    mockFetch(() => { throw new Error('should not be called'); });
    const r = await checkPhoneVerification('+16172165533', 'abc');
    expect(r.approved).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
