import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { deliverHumanSafetyAlert } from '../humanSafetyAlert.server';

describe('human safety alert delivery', () => {
  const originalEnv = { ...process.env };
  const fetchMock = jest.fn<typeof fetch>();

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_FROM_NUMBER;
    delete process.env.TWILIO_MESSAGING_SERVICE_SID;
    delete process.env.SAFETY_ALERT_SLACK_WEBHOOK_URL;
    delete process.env.SLACK_WEBHOOK_URL;
    global.fetch = fetchMock;
  });

  it('fails closed when no human delivery channel is configured', async () => {
    const result = await deliverHumanSafetyAlert({
      memberId: 'member-1',
      source: 'maia_crisis',
      severity: 'crisis',
      crisisType: 'crisis_language_detected',
      sessionId: 'session-1',
    });

    expect(result.delivered).toBe(false);
    expect(result.sms).toBe('not_configured');
    expect(result.slack).toBe('not_configured');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('counts Twilio provider acceptance as human delivery', async () => {
    process.env.TWILIO_ACCOUNT_SID = 'AC-test';
    process.env.TWILIO_AUTH_TOKEN = 'secret';
    process.env.TWILIO_FROM_NUMBER = '+15550000001';
    process.env.SAFETY_ALERT_PHONE = '+15550000002';

    fetchMock.mockResolvedValueOnce(new Response(
      JSON.stringify({ sid: 'SM1', status: 'queued' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    ));

    const result = await deliverHumanSafetyAlert({
      memberId: 'member-2',
      source: 'teen_crisis',
      severity: 'crisis',
      crisisType: 'suicidal_ideation',
      sessionId: 'session-2',
      age: 16,
    });

    expect(result.delivered).toBe(true);
    expect(result.sms).toBe('sent');

    const [, request] = fetchMock.mock.calls[0];
    const body = String(request?.body);
    expect(body).toContain('MAIA+SAFETY');
    expect(body).toContain('No+message+content+included.');
    expect(body).not.toContain('I want to die');
  });

  it('uses Slack independently when SMS is unavailable', async () => {
    process.env.SAFETY_ALERT_SLACK_WEBHOOK_URL = 'https://hooks.example.invalid/safety';

    fetchMock.mockResolvedValueOnce(new Response('ok', { status: 200 }));

    const result = await deliverHumanSafetyAlert({
      memberId: 'member-3',
      source: 'stellium_safety',
      severity: 'high',
      crisisType: 'member_safety_concern',
    });

    expect(result.delivered).toBe(true);
    expect(result.sms).toBe('not_configured');
    expect(result.slack).toBe('sent');
  });

  it('does not claim delivery when a configured provider rejects the alert', async () => {
    process.env.TWILIO_ACCOUNT_SID = 'AC-test';
    process.env.TWILIO_AUTH_TOKEN = 'secret';
    process.env.TWILIO_FROM_NUMBER = '+15550000001';
    process.env.SAFETY_ALERT_PHONE = '+15550000002';

    fetchMock.mockResolvedValueOnce(new Response(
      JSON.stringify({ code: 21610, message: 'unsubscribed' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    ));

    const result = await deliverHumanSafetyAlert({
      memberId: 'member-4',
      source: 'maia_crisis',
      severity: 'crisis',
    });

    expect(result.delivered).toBe(false);
    expect(result.sms).toBe('failed');
  });
});
