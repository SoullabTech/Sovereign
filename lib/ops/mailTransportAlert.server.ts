/**
 * MAIL TRANSPORT DOWN → A HUMAN
 * =============================
 * Email sign-in, codes, resets and invites all ride one transport. On
 * 2026-09-29 it failed, the failure was recorded in the delivery ledger and the
 * non-delivery register, and nobody was told for five weeks — a member found it
 * before we did. A record that reaches no person is not an alert.
 *
 * This pages a human, over a path that does NOT use email, when `sendEmail`
 * sees a transport-wide failure (quota, provider auth, provider config, not
 * configured). It is deliberately separate from `humanSafetyAlert`: that path
 * carries concerns about harm to a member; this one carries operations. The two
 * must not share a recipient setting by accident.
 *
 * Contract:
 *   - Content-free: kind, provider code and purpose only. Never a recipient,
 *     code, link or member id.
 *   - Never throws and is never awaited by the send path: an alert failure must
 *     not change the outcome of a send.
 *   - Throttled per kind (default 6h) so a down transport pages once, not once
 *     per failed send. The throttle is per process; a restart may page again,
 *     which is the safe direction.
 *   - If no recipient is configured it says so loudly. It never reports
 *     success it did not achieve.
 *
 * Three independent paths, any one of which counts as delivered:
 *   - SMS via the existing Twilio credentials to OPS_ALERT_PHONE. NOTE: US SMS
 *     is blocked by carriers (Twilio error 30034) until the sender is A2P
 *     10DLC registered, so a "sent" here means Twilio accepted it.
 *   - Slack via OPS_ALERT_SLACK_WEBHOOK_URL.
 *   - Soullab's own Team Channels: a MAIA-authored message in the private
 *     #ops-alerts channel. Depends on no outside provider. The channel is
 *     created by a founder act; this code never creates it, so absent channel
 *     = not_configured. The message carries no @mention, so it triggers no
 *     email notification (which would depend on the thing that is down).
 */

export interface MailTransportAlert {
  kind: string;
  providerCode?: string;
  purpose: string;
}

export interface OpsDeliveryResult {
  delivered: boolean;
  throttled: boolean;
  sms: 'sent' | 'failed' | 'not_configured';
  slack: 'sent' | 'failed' | 'not_configured';
  /** Soullab's own Team Channels: the private #ops-alerts channel, if it exists. */
  channel: 'sent' | 'failed' | 'not_configured';
}

import { query } from '@/lib/db/postgres';

const OPS_CHANNEL_SLUG = 'ops-alerts';
const THROTTLE_MS = 6 * 60 * 60 * 1000;
const lastPagedAt = new Map<string, number>();

/** Test seam: forget what has been paged. */
export function resetMailTransportAlertThrottle(): void {
  lastPagedAt.clear();
}

function buildBody(alert: MailTransportAlert): string {
  return [
    'MAIA OPS',
    'EMAIL TRANSPORT DOWN',
    `kind=${alert.kind}`,
    `providerCode=${alert.providerCode ?? 'unnamed'}`,
    `purpose=${alert.purpose}`,
    'Sign-in and other email are failing for everyone.',
    'No recipient data included.',
  ].join(' | ');
}

async function sendSms(text: string): Promise<'sent' | 'failed' | 'not_configured'> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const service = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const to = process.env.OPS_ALERT_PHONE;
  if (!sid || !token || (!from && !service) || !to) return 'not_configured';

  const form = new URLSearchParams({ To: to, Body: text });
  if (service) form.set('MessagingServiceSid', service);
  else form.set('From', from as string);

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });
  if (!response.ok) return 'failed';
  const result = (await response.json()) as { error_code?: number | null };
  return result.error_code ? 'failed' : 'sent';
}

async function sendSlack(text: string): Promise<'sent' | 'failed' | 'not_configured'> {
  const url = process.env.OPS_ALERT_SLACK_WEBHOOK_URL;
  if (!url) return 'not_configured';
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return response.ok ? 'sent' : 'failed';
}

async function postChannel(text: string): Promise<'sent' | 'failed' | 'not_configured'> {
  const found = await query<{ id: string; created_by: string }>(
    `SELECT id, created_by FROM team_channels WHERE slug = $1 AND archived_at IS NULL LIMIT 1`,
    [OPS_CHANNEL_SLUG],
  );
  const channel = found.rows[0];
  if (!channel) return 'not_configured';
  await query(
    `INSERT INTO team_messages (channel_id, sender_id, body, sender_type, message_kind)
     VALUES ($1, $2, $3, 'maia', 'request')`,
    [channel.id, channel.created_by, text],
  );
  return 'sent';
}

export async function notifyMailTransportDown(
  alert: MailTransportAlert,
  now: number = Date.now(),
): Promise<OpsDeliveryResult> {
  const quiet: OpsDeliveryResult = {
    delivered: false, throttled: true, sms: 'not_configured', slack: 'not_configured', channel: 'not_configured',
  };
  try {
    const last = lastPagedAt.get(alert.kind);
    if (last !== undefined && now - last < THROTTLE_MS) return quiet;
    lastPagedAt.set(alert.kind, now);

    const text = buildBody(alert);
    const [sms, slack, channel] = await Promise.all([
      sendSms(text).catch(() => 'failed' as const),
      sendSlack(text).catch(() => 'failed' as const),
      postChannel(text).catch(() => 'failed' as const),
    ]);
    const delivered = sms === 'sent' || slack === 'sent' || channel === 'sent';
    if (!delivered) {
      console.error('[OPS_NOTIFY_NO_RECIPIENT] email transport is down and no human was paged', {
        kind: alert.kind,
        sms,
        slack,
        channel,
      });
    }
    return { delivered, throttled: false, sms, slack, channel };
  } catch {
    return quiet;
  }
}
