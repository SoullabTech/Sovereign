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

/**
 * Why a send failed, in terms the *caller* can act on.
 *
 * The provider reports failures two different ways and both must be handled:
 * a thrown exception (network/transport) AND a returned `{ error }` object
 * (every API-level rejection, including the 429 monthly quota). Callers must
 * never have to parse an error string to tell "our account is out of quota"
 * from "that address is malformed" — that distinction lives here.
 */
export type SendFailureKind =
  | 'quota_exceeded'     // provider account limit hit (Resend: 429 monthly_quota_exceeded)
  | 'rate_limited'       // provider throttle — retry shortly
  | 'provider_auth'      // missing/invalid API key, restricted key
  | 'invalid_recipient'  // the address itself is bad — retrying will not help
  | 'provider_error'     // provider accepted the shape but refused or failed
  | 'not_configured'     // no API key in this environment
  | 'exception';         // transport threw (network, DNS, timeout)

export interface SendEmailResult {
  success: boolean;
  /** Resend message id on success. Absent id ⇒ the send did NOT happen. */
  id?: string;
  /** Human-readable error on failure. */
  error?: string;
  /** Machine-readable outcome. */
  status: 'sent' | 'error' | 'not_configured' | 'exception';
  /** Actionable failure class. Present on every failure, absent on success. */
  failureKind?: SendFailureKind;
  /** Raw provider error name (e.g. 'rate_limit_exceeded'), for logs only. */
  providerErrorName?: string;
  /** True when a later attempt could plausibly succeed without a code/config change. */
  retryable?: boolean;
  /** True when the failure is ours (quota/keys/outage), not the recipient's. */
  ourFault?: boolean;
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

/**
 * Map a provider error onto a SendFailureKind.
 *
 * Defensive by construction: Resend's error object carries `name` and
 * `message`, and some transports add `statusCode`. We read all three and fall
 * back to 'provider_error' — an unrecognised failure is still a failure, never
 * a success. New provider error names therefore degrade to "we could not send"
 * rather than being silently swallowed.
 */
export function classifyProviderError(err: unknown): {
  kind: SendFailureKind;
  name?: string;
  message: string;
} {
  const e = (err ?? {}) as { name?: unknown; message?: unknown; statusCode?: unknown };
  const name = typeof e.name === 'string' ? e.name : undefined;
  const message = typeof e.message === 'string' ? e.message : 'Unknown email provider error';
  const statusCode = typeof e.statusCode === 'number' ? e.statusCode : undefined;
  const haystack = `${name ?? ''} ${message}`.toLowerCase();

  // Quota before rate-limit: a monthly quota is also served as 429, but the
  // remedy is "upgrade/wait for the reset", not "retry in a moment".
  if (haystack.includes('quota') || haystack.includes('limit_reached') || haystack.includes('exceeded_limit')) {
    return { kind: 'quota_exceeded', name, message };
  }
  if (statusCode === 429 || haystack.includes('rate_limit') || haystack.includes('too many requests')) {
    return { kind: 'rate_limited', name, message };
  }
  if (
    statusCode === 401 || statusCode === 403 ||
    haystack.includes('api_key') || haystack.includes('api key') ||
    haystack.includes('unauthorized') || haystack.includes('restricted')
  ) {
    return { kind: 'provider_auth', name, message };
  }
  if (
    haystack.includes('invalid_to') || haystack.includes('invalid recipient') ||
    haystack.includes('invalid_address') || haystack.includes('validation_error')
  ) {
    return { kind: 'invalid_recipient', name, message };
  }
  return { kind: 'provider_error', name, message };
}

/** Failures that are ours to fix, not the member's. */
const OUR_FAULT: ReadonlySet<SendFailureKind> = new Set<SendFailureKind>([
  'quota_exceeded', 'rate_limited', 'provider_auth', 'provider_error', 'not_configured', 'exception',
]);

/** Failures where simply trying again later could plausibly work. */
const RETRYABLE: ReadonlySet<SendFailureKind> = new Set<SendFailureKind>([
  'rate_limited', 'provider_error', 'exception',
]);

function failure(kind: SendFailureKind, error: string, providerErrorName?: string): SendEmailResult {
  return {
    success: false,
    error,
    status: kind === 'not_configured' ? 'not_configured' : kind === 'exception' ? 'exception' : 'error',
    failureKind: kind,
    providerErrorName,
    retryable: RETRYABLE.has(kind),
    ourFault: OUR_FAULT.has(kind),
  };
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
  };
  if (result.success) {
    console.log('[MAIA/email] sent', line);
    return;
  }
  console.error('[MAIA/email] FAILED', line);
  // Quota and credential failures are operator emergencies, not per-request
  // noise: every auth code, invite and reset is failing right now. Emit a
  // greppable single line so it surfaces without reading the whole log.
  if (result.failureKind === 'quota_exceeded' || result.failureKind === 'provider_auth' || result.failureKind === 'not_configured') {
    console.error(
      `[MAIA/email] TRANSPORT_DOWN kind=${result.failureKind} purpose=${purpose} — email delivery is failing for ALL recipients. Check the provider account.`
    );
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
    const result = failure('not_configured', 'RESEND_API_KEY not configured');
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

    // THE LOAD-BEARING CHECK. Resend resolves — it does not throw — when the
    // API rejects a send (429 quota, bad key, invalid recipient). Awaiting
    // without reading `error` reports success for mail that never left.
    if (error) {
      const { kind, name, message } = classifyProviderError(error);
      const result = failure(kind, message, name);
      logSend(opts.purpose, from, toLog, domain, result);
      return result;
    }

    // No error AND no message id means the provider did not accept the send.
    // Treat an unidentified send as a failure rather than inventing success.
    if (!data?.id) {
      const result = failure('provider_error', 'Provider returned no message id');
      logSend(opts.purpose, from, toLog, domain, result);
      return result;
    }

    const result: SendEmailResult = {
      success: true,
      id: data.id,
      status: 'sent',
    };
    logSend(opts.purpose, from, toLog, domain, result);
    return result;
  } catch (err) {
    const { name, message } = classifyProviderError(err);
    const result = failure('exception', message, name);
    logSend(opts.purpose, from, toLog, domain, result);
    return result;
  }
}
