/**
 * SMS error transparency (Bug B)
 *
 * Regression: when Twilio rejects a message, TwilioProvider must return a populated
 * `errorMessage` instead of leaving it undefined. Previously an undefined errorMessage
 * collapsed (via `result.errorMessage || 'Failed to send SMS'`) into a generic
 * "Failed to send SMS" in both the route log and the UI, discarding the real reason.
 */
import { TwilioProvider } from '@/lib/comms/providers/TwilioProvider';

const creds = {
  account_sid: 'ACtest',
  auth_token: 'tok',
  from_number: '+15045177812',
  messaging_service_sid: 'MGtest',
};

const payload = {
  to: '+15551234567',
  bodyText: 'hello',
  messageId: 'sms-test',
  practitionerId: 'system',
};

function mockFetch(status: number, jsonBody: unknown) {
  (global as unknown as { fetch: jest.Mock }).fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => jsonBody,
  });
}

describe('TwilioProvider.send — error transparency', () => {
  const provider = new TwilioProvider();
  afterEach(() => jest.resetAllMocks());

  it('populates errorMessage when Twilio accepts (2xx) but status is not queued', async () => {
    mockFetch(201, { sid: 'SMx', status: 'failed' }); // no error_code, no error_message
    const res = await provider.send(payload, creds);
    expect(res.success).toBe(false);
    expect(res.errorMessage).toBeTruthy();
    expect(res.errorMessage).toMatch(/failed/i);
  });

  it('populates errorMessage when Twilio reports an error_code without a message', async () => {
    mockFetch(201, { sid: 'SMx', status: 'failed', error_code: 30007 });
    const res = await provider.send(payload, creds);
    expect(res.success).toBe(false);
    expect(res.errorCode).toBe('30007');
    expect(res.errorMessage).toBeTruthy();
    expect(res.errorMessage).toContain('30007');
  });

  it('uses the Twilio error.message on HTTP error (4xx) responses', async () => {
    mockFetch(400, { code: 21211, message: "The 'To' number is not a valid phone number." });
    const res = await provider.send(payload, creds);
    expect(res.success).toBe(false);
    expect(res.errorCode).toBe('21211');
    expect(res.errorMessage).toContain('not a valid phone number');
  });

  it('leaves errorMessage undefined on success (queued)', async () => {
    mockFetch(201, { sid: 'SMx', status: 'queued' });
    const res = await provider.send(payload, creds);
    expect(res.success).toBe(true);
    expect(res.errorMessage).toBeUndefined();
  });
});
