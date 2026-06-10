// Central email sender — the single place every launch-critical email goes through.
//
// Why this exists: the Resend SDK reports API-level failures (unverified domain, auth,
// rate-limit) as a RETURNED `result.error`, not a thrown exception. Scattered callers that
// did `await resend.emails.send(...)` without checking `result.error` treated those failures
// as success — silently. This wrapper ALWAYS checks `result.error`, logs structured
// success/failure metadata, and returns a typed result. It NEVER throws, so fire-and-forget
// callers can ignore the result and request handlers can branch on it.
//
// See docs/ops/EMAIL_SENDER_AUDIT_2026-06-10.md. Pattern follows lib/notifications/safety.ts.

import { Resend } from 'resend';

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  /** Verified from-address. Defaults to the verified Soullab sender; pass a sender's own
   *  verified from to preserve it (e.g. reminders@soullab.life, team@soullab.life). */
  from?: string;
  headers?: Record<string, string>;
  tags?: Array<{ name: string; value: string }>;
  /** Short label for log lines, e.g. 'magic-link', 'team-notify', 'invite'. */
  context?: string;
}

export type SendEmailFailureReason = 'not_configured' | 'api_error' | 'exception';

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  /** Present only when ok === false. */
  reason?: SendEmailFailureReason;
  error?: string;
}

/** soullab.life is the verified Resend domain. */
const DEFAULT_FROM = 'Soullab <noreply@soullab.life>';

let client: Resend | null = null;
function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null; // checked first, so a removed key is honoured even if a client was cached
  if (!client) client = new Resend(apiKey);
  return client;
}

/** Mask an address for logs — keep IDs/hashes only, never full PII. */
function maskEmail(addr: string | string[]): string {
  const one = Array.isArray(addr) ? addr[0] : addr;
  if (!one || !one.includes('@')) return '***';
  const [local, domain] = one.split('@');
  const extra = Array.isArray(addr) && addr.length > 1 ? ` (+${addr.length - 1})` : '';
  return `${local.slice(0, 1)}***@${domain}${extra}`;
}

/**
 * Send one email through Resend with mandatory error checking + structured logging.
 * NEVER throws — returns { ok: false, reason, error } on any failure.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const ctx = params.context ?? 'email';
  const to = maskEmail(params.to);

  const resend = getClient();
  if (!resend) {
    console.warn(`[email:${ctx}] RESEND_API_KEY not configured — skipped`, { to });
    return { ok: false, reason: 'not_configured', error: 'RESEND_API_KEY not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: params.from ?? DEFAULT_FROM,
      to: params.to,
      subject: params.subject,
      ...(params.html ? { html: params.html } : {}),
      ...(params.text ? { text: params.text } : {}),
      ...(params.headers ? { headers: params.headers } : {}),
      ...(params.tags ? { tags: params.tags } : {}),
    });

    if (result?.error) {
      const message = result.error.message ?? String(result.error);
      console.error(`[email:${ctx}] send failed (Resend error)`, { to, error: message });
      return { ok: false, reason: 'api_error', error: message };
    }

    console.log(`[email:${ctx}] sent`, { to, id: result?.data?.id });
    return { ok: true, id: result?.data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[email:${ctx}] send threw`, { to, error: message });
    return { ok: false, reason: 'exception', error: message };
  }
}
