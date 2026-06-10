// Co-lab SMS — minimal Twilio REST client (no SDK). Server-only.
//
// We call Twilio's REST API directly with fetch + HTTP Basic auth rather than
// pulling in the Twilio Node SDK: smaller dependency surface, and the exact
// request that leaves the system is visible here for audit. Never throws.

import { getTwilioCreds } from '@/lib/sms/config';

export const TWILIO_API_BASE = 'https://api.twilio.com/2010-04-01';
export const TWILIO_VERIFY_BASE = 'https://verify.twilio.com/v2';

export interface TwilioResponse {
  ok: boolean;
  status: number;
  // Twilio returns JSON for both success and error bodies.
  data: Record<string, any> | null;
}

function basicAuthHeader(sid: string, token: string): string {
  const raw = `${sid}:${token}`;
  const encoded =
    typeof btoa === 'function' ? btoa(raw) : Buffer.from(raw, 'utf8').toString('base64');
  return `Basic ${encoded}`;
}

/**
 * POST application/x-www-form-urlencoded to a Twilio endpoint. Never throws —
 * returns { ok:false, status:0 } on missing creds or any network/parse error so
 * callers stay fire-safe.
 */
export async function twilioPostForm(
  url: string,
  form: Record<string, string>
): Promise<TwilioResponse> {
  const creds = getTwilioCreds();
  if (!creds) return { ok: false, status: 0, data: null };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: basicAuthHeader(creds.accountSid, creds.authToken),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(form).toString(),
    });
    let data: Record<string, any> | null = null;
    try {
      data = (await res.json()) as Record<string, any>;
    } catch {
      data = null;
    }
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}
