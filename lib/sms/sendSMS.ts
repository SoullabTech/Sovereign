// Co-lab SMS — central alert sender. Mirrors the email module's contract:
// fire-and-forget, never throws, logs STRUCTURAL metadata only (never the body,
// never the full number). ALERT-ONLY: callers must pass content-free copy.

import {
  isSmsSendConfigured,
  getMessagingServiceSid,
  getTwilioCreds,
} from '@/lib/sms/config';
import { normalizePhone, maskPhone } from '@/lib/sms/phoneNumber';
import { twilioPostForm, TWILIO_API_BASE } from '@/lib/sms/twilioClient';

export type SendSmsStatus = 'sent' | 'not_configured' | 'invalid_number' | 'error';

export interface SendSmsResult {
  success: boolean;
  status: SendSmsStatus;
  sid?: string;
  error?: string;
}

export interface SendSmsOptions {
  to: string; // raw or E.164; normalized here
  body: string; // ALERT-ONLY — must contain no conversation content
  purpose: string; // structural log label, e.g. 'dm_received'
}

export async function sendSMS(opts: SendSmsOptions): Promise<SendSmsResult> {
  // DORMANT: send nothing unless the flag + send creds are present.
  if (!isSmsSendConfigured()) {
    return { success: false, status: 'not_configured' };
  }

  const to = normalizePhone(opts.to);
  if (!to) {
    console.warn('[sms/send] invalid recipient number', { purpose: opts.purpose });
    return { success: false, status: 'invalid_number' };
  }

  const creds = getTwilioCreds()!;
  const messagingServiceSid = getMessagingServiceSid()!;

  const res = await twilioPostForm(
    `${TWILIO_API_BASE}/Accounts/${creds.accountSid}/Messages.json`,
    {
      To: to,
      MessagingServiceSid: messagingServiceSid,
      Body: opts.body,
    }
  );

  // Structural log ONLY — purpose, masked number, status. Never the body.
  if (res.ok) {
    const sid = (res.data?.sid as string) || undefined;
    console.log('[sms/send] sent', { purpose: opts.purpose, to: maskPhone(to), status: 'sent' });
    return { success: true, status: 'sent', sid };
  }

  const error = (res.data?.message as string) || `HTTP ${res.status}`;
  console.warn('[sms/send] failed', {
    purpose: opts.purpose,
    to: maskPhone(to),
    httpStatus: res.status,
    error,
  });
  return { success: false, status: 'error', error };
}
