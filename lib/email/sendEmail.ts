/**
 * CENTRAL EMAIL HELPER — the one place transactional email leaves the system.
 * ========================================================================
 *
 * Why this exists:
 *   Resend's `emails.send()` returns `{ data, error }` and does NOT throw on
 *   API failures. Callers that `await` it and assume success silently drop
 *   mail — the failure never appears in logs or HTTP responses. That bug had
 *   already reappeared in several senders (and one was still shipping from the
 *   `onboarding@resend.dev` sandbox sender, which only delivers to the Resend
 *   account owner). This wrapper closes the bug class once:
 *
 *     - ALWAYS inspects `result.error`
 *     - ALWAYS logs purpose / sender / recipient / domain / status
 *     - returns a typed success|failure result
 *     - never throws (safe for fire-and-forget notification callers)
 *
 * Scope: launch-critical transactional senders (auth, invites, reminders,
 * team notify, portal / follow-up). Practitioner BYO routing keeps living in
 * `lib/comms/emailRouter.ts`; this helper mirrors that module's result shape
 * so the two read the same way.
 *
 * Usage:
 *   import { sendEmail, SENDERS } from '@/lib/email/sendEmail';
 *   const r = await sendEmail({
 *     purpose: 'auth:magic-link',
 *     from: SENDERS.noreply,
 *     to: member.email,
 *     subject: 'Your sign-in link',
 *     html, text,
 *   });
 *   if (!r.success) { ... }   // never silently assume success
 */

import { Resend, type CreateEmailOptions } from 'resend';

// ============================================================================
// VERIFIED SENDERS
// ============================================================================

/**
 * Canonical verified sender identities. `soullab.life` is the verified Resend
 * domain. NEVER send from `onboarding@resend.dev` — that sandbox sender only
 * delivers to the Resend account owner, so real recipients receive nothing.
 */
export const SENDERS = {
  default: 'Soullab <noreply@soullab.life>',
  noreply: 'Soullab <noreply@soullab.life>',
  kelly: 'Kelly @ Soullab <kelly@soullab.life>',
  team: 'Soullab Team <team@soullab.life>',
  reminders: 'Session Reminder <reminders@soullab.life>',
  bookings: 'Soullab Bookings <bookings@soullab.life>',
  portal: 'Soullab Portal <portal@soullab.life>',
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface SendEmailOptions {
  /** Recipient(s). */
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  /** Defaults to SENDERS.default. Pass a SENDERS.* value or a verified address. */
  from?: string;
  replyTo?: string;
  headers?: Record<string, string>;
  tags?: Array<{ name: string; value: string }>;
  /**
   * Required label for logs/telemetry, e.g. 'auth:magic-link', 'invite:beta',
   * 'team:dm', 'reminder:session', 'portal:booking'. Keeps every send traceable.
   */
  purpose: string;
}

export interface SendEmailResult {
  success: boolean;
  /** Resend message id on success. */
  id?: string;
  /** Human-readable error on failure. */
  error?: string;
  /**
   * The PROVIDER's own name for the failure, verbatim — e.g.
   * 'monthly_quota_exceeded', 'validation_error', 'not_found'. Present only
   * when Resend returned a typed error.
   *
   * Carried separately from `error` because the message is prose and the name
   * is the thing an operator acts on: a quota failure means top up the
   * account, a validation failure means fix the payload, and the two are
   * indistinguishable once flattened to a sentence. During the 2026-08-24
   * signup incident the only fact that identified the boundary was the name
   * `monthly_quota_exceeded`, and it was being discarded here.
   */
  providerCode?: string;
  /** Machine-readable outcome. */
  status: 'sent' | 'error' | 'not_configured' | 'exception';
}

// ============================================================================
// MANAGED RESEND CLIENT (singleton)
// ============================================================================

let managedResend: Resend | null = null;

function getManagedResend(): Resend | null {
  if (managedResend) return managedResend;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  managedResend = new Resend(apiKey);
  return managedResend;
}

// ============================================================================
// HELPERS
// ============================================================================

function domainOf(to: string | string[]): string {
  const first = (Array.isArray(to) ? to[0] : to) || '';
  const at = first.lastIndexOf('@');
  return at >= 0 ? first.slice(at + 1) : 'unknown';
}

function logSend(
  purpose: string,
  from: string,
  to: string,
  domain: string,
  result: SendEmailResult
): void {
  // Structural metadata only — never log subject or body (Sanctuary: minimal
  // metadata, never content).
  const line = {
    purpose,
    from,
    to,
    domain,
    status: result.status,
    ...(result.id ? { id: result.id } : {}),
    ...(result.error ? { error: result.error } : {}),
    ...(result.providerCode ? { providerCode: result.providerCode } : {}),
  };
  if (result.success) {
    console.log('[MAIA/email] sent', line);
  } else {
    console.error('[MAIA/email] FAILED', line);
  }
}

// ============================================================================
// SEND
// ============================================================================

/**
 * Send one transactional email through the managed Resend client.
 * Always checks `result.error`, always logs, never throws.
 */
export async function sendEmail(opts: SendEmailOptions): Promise<SendEmailResult> {
  const from = opts.from ?? SENDERS.default;
  const toLog = Array.isArray(opts.to) ? opts.to.join(', ') : opts.to;
  const domain = domainOf(opts.to);

  const resend = getManagedResend();
  if (!resend) {
    const result: SendEmailResult = {
      success: false,
      error: 'RESEND_API_KEY not configured',
      status: 'not_configured',
    };
    logSend(opts.purpose, from, toLog, domain, result);
    return result;
  }

  try {
    // Resend's CreateEmailOptions is a RequireAtLeastOne<html|text|react>
    // union; callers always pass html and/or text, so cast through it.
    const payload = {
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      replyTo: opts.replyTo,
      headers: opts.headers,
      tags: opts.tags,
    } as CreateEmailOptions;

    const { data, error } = await resend.emails.send(payload);

    if (error) {
      const result: SendEmailResult = {
        success: false,
        error: error.message,
        // `name` is Resend's typed discriminator. Read defensively: the SDK's
        // error shape is not guaranteed across versions, and losing the code
        // must degrade to "unnamed failure", never to a thrown TypeError on
        // the path whose whole job is to report a failure.
        providerCode:
          typeof (error as { name?: unknown }).name === 'string'
            ? (error as { name: string }).name
            : undefined,
        status: 'error',
      };
      logSend(opts.purpose, from, toLog, domain, result);
      return result;
    }

    const result: SendEmailResult = {
      success: true,
      id: data?.id,
      status: 'sent',
    };
    logSend(opts.purpose, from, toLog, domain, result);
    return result;
  } catch (err) {
    const result: SendEmailResult = {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      status: 'exception',
    };
    logSend(opts.purpose, from, toLog, domain, result);
    return result;
  }
}
