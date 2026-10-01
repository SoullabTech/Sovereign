export type HumanSafetySource =
  | 'maia_crisis'
  | 'teen_crisis'
  | 'teen_abuse'
  | 'stellium_safety';

export type HumanSafetySeverity = 'high' | 'crisis';

export interface HumanSafetyAlert {
  memberId: string;
  source: HumanSafetySource;
  severity: HumanSafetySeverity;
  crisisType?: string;
  sessionId?: string;
  age?: number;
}

export interface HumanSafetyDeliveryResult {
  delivered: boolean;
  sms: 'sent' | 'failed' | 'not_configured';
  slack: 'sent' | 'failed' | 'not_configured';
  errors: string[];
}

function buildBody(alert: HumanSafetyAlert): string {
  const parts = [
    'MAIA SAFETY',
    alert.severity.toUpperCase(),
    `source=${alert.source}`,
    `member=${alert.memberId}`,
  ];

  if (alert.crisisType) parts.push(`type=${alert.crisisType}`);
  if (alert.age !== undefined) parts.push(`age=${alert.age}`);
  if (alert.sessionId) parts.push(`session=${alert.sessionId}`);

  parts.push('No message content included.');
  return parts.join(' | ');
}

async function sendSms(bodyText: string): Promise<{ ok: boolean; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const to = process.env.SAFETY_ALERT_PHONE;

  if (!accountSid || !authToken || (!fromNumber && !messagingServiceSid) || !to) {
    return { ok: false, error: 'not_configured' };
  }

  const form = new URLSearchParams({ To: to, Body: bodyText });
  if (messagingServiceSid) form.set('MessagingServiceSid', messagingServiceSid);
  else form.set('From', fromNumber!);

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    }
  );

  if (!response.ok) {
    return { ok: false, error: `Twilio HTTP ${response.status}` };
  }

  const result = await response.json() as { status?: string; error_code?: number };
  if (result.error_code) {
    return { ok: false, error: `Twilio error ${result.error_code}` };
  }

  return { ok: true };
}

async function sendSlack(bodyText: string): Promise<{ ok: boolean; error?: string }> {
  const url = process.env.SAFETY_ALERT_SLACK_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;
  if (!url) return { ok: false, error: 'not_configured' };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: bodyText }),
  });

  if (!response.ok) {
    return { ok: false, error: `Slack HTTP ${response.status}` };
  }

  return { ok: true };
}

export async function deliverHumanSafetyAlert(
  alert: HumanSafetyAlert
): Promise<HumanSafetyDeliveryResult> {
  const bodyText = buildBody(alert);
  const errors: string[] = [];

  const [smsResult, slackResult] = await Promise.allSettled([
    sendSms(bodyText),
    sendSlack(bodyText),
  ]);

  const sms = smsResult.status === 'fulfilled' && smsResult.value.ok
    ? 'sent'
    : smsResult.status === 'fulfilled' && smsResult.value.error === 'not_configured'
      ? 'not_configured'
      : 'failed';

  const slack = slackResult.status === 'fulfilled' && slackResult.value.ok
    ? 'sent'
    : slackResult.status === 'fulfilled' && slackResult.value.error === 'not_configured'
      ? 'not_configured'
      : 'failed';

  if (smsResult.status === 'rejected') errors.push(String(smsResult.reason));
  else if (!smsResult.value.ok && smsResult.value.error !== 'not_configured') errors.push(smsResult.value.error || 'SMS failed');

  if (slackResult.status === 'rejected') errors.push(String(slackResult.reason));
  else if (!slackResult.value.ok && slackResult.value.error !== 'not_configured') errors.push(slackResult.value.error || 'Slack failed');

  const delivered = sms === 'sent' || slack === 'sent';
  if (!delivered) {
    console.error('[SAFETY_NOTIFY_NO_RECIPIENT] human safety alert was not delivered', {
      source: alert.source,
      severity: alert.severity,
      memberId: alert.memberId,
      sms,
      slack,
      errors,
    });
  }

  return { delivered, sms, slack, errors };
}
