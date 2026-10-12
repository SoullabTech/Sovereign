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
 *     - ALWAYS logs purpose / sender / recipient REFERENCE / domain / status
 *       (the recipient address itself is never logged — see logSend)
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

import { getEmailProvider } from './providers';
import type { EmailProvider } from './providers/types';
import { resolvePriority, type EmailPriority } from './purpose';
import { openAttempt, settleAttempt, stateForFailure } from './ledger';
import { memberRef } from '@/lib/privacy/memberRef';
import { redactEmails } from '@/lib/privacy/redactEmails';
import { reserveEmailCapacity } from './capacity';
import { managedSender } from './senderAuthority';
import { admit, type AdmissionRequest } from './admission';
import { isRegisteredPurpose } from './purpose';
import { fingerprintRecipient, fingerprintMailReference } from './ledger/fingerprint';
import { extractRecipientMailbox } from './capacity';

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
   * Required classification, e.g. 'auth:magic-link', 'invite:beta',
   * 'reminder:session', 'portal:booking'. Keeps every send traceable AND
   * determines the delivery lane (see lib/email/purpose.ts).
   *
   * Typed as `string` deliberately: every existing caller keeps working, and an
   * unregistered purpose resolves to the P2 lane rather than being rejected.
   * Registered purposes (EmailPurpose) are the ones with a declared lane.
   */
  purpose: string;
  /**
   * Override the lane resolved from `purpose`. Rarely needed — prefer
   * registering the purpose. Present so a caller with genuinely mixed traffic
   * under one purpose can still classify correctly.
   */
  priority?: EmailPriority;
  /**
   * Mandatory for managed SMTP: independently derived actor authority and
   * recipient provenance. Never populate from unverified request claims.
   * The central boundary derives purpose itself, preventing purpose mismatch.
   */
  admission?: Omit<AdmissionRequest, 'purpose'>;
  /**
   * Ties this send to the request/operation that caused it, so a delivery
   * failure can be traced back to the member action that triggered it.
   */
  correlationId?: string;
  /**
   * Logical identity of the message, e.g. `AUTH_CODE:<token-id>`. Carried into
   * provider tags and logs so duplicate sends are IDENTIFIABLE.
   *
   * NOT yet a suppression key: nothing in this module drops a second send with
   * the same key. Deduplication requires durable state (the ledger), and
   * claiming it before that exists would be worse than not having it —
   * an auth code silently suppressed is a member locked out.
   */
  idempotencyKey?: string;
  /** Free-form operational labels. Never put member content here. */
  metadata?: Record<string, string>;
  /**
   * Send through a specific provider instead of the configured one. Used by
   * practitioner bring-your-own-key routing, which needs the same adapter with
   * a different credential.
   */
  provider?: EmailProvider;
  /**
   * What caused this send, for the delivery ledger: the route path, cron job,
   * script or worker name. Optional — an unattributed send is still recorded,
   * it is just harder to trace back to its origin.
   */
  triggerType?: 'route' | 'cron' | 'script' | 'worker';
  triggerRef?: string;
  /** Campaign identity for bulk traffic, so one blast is countable as one thing. */
  campaignRef?: string;
  /** Member id, when the recipient is a known member. Stored as memberRef(). */
  memberId?: string;
}

export interface SendEmailResult {
  success: boolean;
  /** Provider-issued message id on success. */
  id?: string;
  /** Which provider handled this attempt: 'resend' | 'memory' | ... */
  provider?: string;
  /** The lane this send was classified into. Present on success and failure. */
  priority?: EmailPriority;
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
  /**
   * The CLASSIFIED failure. `providerCode` above is the provider's raw name;
   * this is what a caller is allowed to branch on. Present on every failure,
   * absent on success.
   */
  failureKind?: SendFailureKind;
  /**
   * True when trying the same send again shortly could plausibly work.
   *
   * Fails SAFE: anything we cannot attribute is NOT retryable. Wrongly
   * promising a retry is the harm this whole lane exists to remove — on
   * 2026-08-24 a quota refusal was reported as retryable and one person made
   * six attempts across two days, none of which could ever have worked.
   * Wrongly withholding a retry only routes someone to a human, who can help.
   */
  retryable?: boolean;
  /**
   * True when the failure is ours (quota, credentials, sender config, outage,
   * or unattributable) rather than something about the recipient's address.
   * Unknown attribution is OURS by construction — see classifyProviderError.
   */
  ourFault?: boolean;
}

/**
 * Why a send failed, in terms a CALLER can act on.
 *
 * The provider reports failures two ways and both must be handled: a thrown
 * exception (network/transport) AND a resolved `{ error }` object (every
 * API-level rejection, including the 429 monthly quota). Callers must never
 * have to parse prose to tell "our account is out of quota" from "that address
 * is malformed" — that distinction lives here, once.
 */
export type SendFailureKind =
  | 'quota_exceeded'     // provider account limit hit (Resend: 429 monthly_quota_exceeded)
  | 'rate_limited'       // provider throttle — retrying shortly can work
  | 'capacity_refused'   // shared MAIL-05 budget; avoid retry loops
  | 'sender_not_authorized' // SMTP From has no qualified credential
  | 'provider_auth'      // missing / invalid / restricted API key
  | 'provider_config'    // our sender identity is wrong: unverified from-address or domain
  | 'invalid_recipient'  // the RECIPIENT address is bad — the only class that is not ours
  | 'provider_error'     // refused or failed for a reason we cannot attribute
  | 'not_configured'     // no API key in this environment
  | 'exception';         // transport threw (network, DNS, timeout)

// ============================================================================
// HELPERS
// ============================================================================

function domainOf(to: string | string[]): string {
  const first = (Array.isArray(to) ? to[0] : to) || '';
  const at = first.lastIndexOf('@');
  return at >= 0 ? first.slice(at + 1) : 'unknown';
}

/**
 * Recipient-specific evidence. `invalid_recipient` is the ONLY class that tells
 * a member their address is the problem, so it requires evidence that names the
 * recipient — not merely that some validation failed.
 *
 * This is the attribution defect that had to be fixed before this taxonomy
 * could ship: treating a bare `validation_error` as a bad recipient turns
 * "The from address is not verified" — our configuration problem, and one of
 * the refusals PR #1073 deliberately tests — into a 400 telling the member
 * their own address is wrong. Exactly inverted.
 */
const RECIPIENT_MARKERS = [
  'invalid_to',
  'invalid recipient',
  'recipient rejected',
  'invalid `to` field',
  'invalid to field',
  'invalid email address',
] as const;

/** Evidence that a validation failure is about OUR sender, not their recipient. */
const SENDER_MARKERS = ['from address', '`from`', 'from field', 'sender', 'domain'] as const;

/**
 * Map a provider error onto a SendFailureKind.
 *
 * Defensive by construction: Resend's error carries `name` and `message`, and
 * some transports add `statusCode`. All three are read, and an unrecognised
 * failure falls back to `provider_error` — never to success, and never to the
 * member's fault. A new provider error name degrades to "we could not send and
 * we do not know why", which is true and safe.
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
  const has = (needle: string) => haystack.includes(needle);

  if (name === 'smtp_sender_not_authorized') {
    return { kind: 'sender_not_authorized', name, message };
  }
  // Quota before throttle: a monthly quota is also served as 429, but the
  // remedy is "top up / wait for the reset", not "retry in a moment".
  if (has('quota') || has('limit_reached') || has('exceeded_limit')) {
    return { kind: 'quota_exceeded', name, message };
  }
  if (statusCode === 429 || has('rate_limit') || has('too many requests')) {
    return { kind: 'rate_limited', name, message };
  }
  if (
    statusCode === 401 || statusCode === 403 ||
    has('api_key') || has('api key') || has('unauthorized') || has('restricted')
  ) {
    return { kind: 'provider_auth', name, message };
  }
  // Our sender identity: unverified from-address, unverified/missing domain.
  // Ours to fix, and retrying cannot help.
  if (
    (has('not verified') || has('unverified') || has('not found') || has('no_domain')) &&
    SENDER_MARKERS.some(has)
  ) {
    return { kind: 'provider_config', name, message };
  }
  // The recipient — and ONLY on evidence that names the recipient. A message
  // that also implicates our sender is never attributed to the member.
  if (RECIPIENT_MARKERS.some(has) && !SENDER_MARKERS.some(has)) {
    return { kind: 'invalid_recipient', name, message };
  }
  // Everything else, INCLUDING a bare `validation_error`. Unattributed is ours.
  return { kind: 'provider_error', name, message };
}

/**
 * Attribution and retry policy, in one table so the two can never drift.
 * `invalid_recipient` is deliberately the single `ourFault: false` row.
 */
const FAILURE_POLICY: Record<SendFailureKind, { ourFault: boolean; retryable: boolean }> = {
  quota_exceeded:    { ourFault: true,  retryable: false },
  rate_limited:      { ourFault: true,  retryable: true  },
  capacity_refused:  { ourFault: true,  retryable: false },
  sender_not_authorized: { ourFault: true, retryable: false },
  provider_auth:     { ourFault: true,  retryable: false },
  provider_config:   { ourFault: true,  retryable: false },
  invalid_recipient: { ourFault: false, retryable: false },
  provider_error:    { ourFault: true,  retryable: false },
  not_configured:    { ourFault: true,  retryable: false },
  exception:         { ourFault: true,  retryable: true  },
};

/**
 * Failures where EVERY send in the system is failing, not just this one. These
 * are operator emergencies and get their own greppable line.
 */
const TRANSPORT_WIDE: ReadonlySet<SendFailureKind> = new Set<SendFailureKind>([
  'quota_exceeded', 'provider_auth', 'provider_config', 'not_configured',
]);

function failure(
  kind: SendFailureKind,
  error: string,
  providerCode?: string,
  context?: { provider?: string; priority?: EmailPriority }
): SendEmailResult {
  const policy = FAILURE_POLICY[kind];
  return {
    success: false,
    error,
    providerCode,
    status: kind === 'not_configured' ? 'not_configured' : kind === 'exception' ? 'exception' : 'error',
    failureKind: kind,
    retryable: policy.retryable,
    ourFault: policy.ourFault,
    ...(context?.provider ? { provider: context.provider } : {}),
    ...(context?.priority ? { priority: context.priority } : {}),
  };
}

function logSend(
  purpose: string,
  from: string,
  to: string,
  domain: string,
  result: SendEmailResult,
  trace?: { correlationId?: string; idempotencyKey?: string }
): void {
  // Structural metadata only — never log subject or body (Sanctuary: minimal
  // metadata, never content).
  //
  // AND NEVER THE RECIPIENT ADDRESS. This is the transport layer under every
  // auth code, invite and password reset in the system, so a raw `to` here
  // defeats redaction done in any calling route: the route can stop printing
  // the address and this line will print it one call lower down, on both the
  // success and the failure path. That is exactly what happened — the
  // email-code route's logs were redacted while this line kept emitting the
  // address for every send.
  //
  // Recipient addresses have low entropy. Never use an unkeyed memberRef()
  // hash for them — the ledger's keyed HMAC is the correct pseudonymous
  // representation. Without that key, record 'unavailable', not a weak digest.
  const firstRecipient = extractRecipientMailbox(to.split(', ')[0] ?? '');
  const pseudonym = firstRecipient ? fingerprintRecipient(firstRecipient) : null;
  const toRef = pseudonym
    ? `hmac-v${pseudonym.keyVersion}:${pseudonym.fingerprint.slice(0, 16)}`
    : 'unavailable';

  const line = {
    purpose,
    ...(result.priority ? { priority: result.priority } : {}),
    ...(result.provider ? { provider: result.provider } : {}),
    ...(trace?.correlationId ? { correlationId: trace.correlationId } : {}),
    ...(trace?.idempotencyKey ? { idempotencyKey: trace.idempotencyKey } : {}),
    from,
    toRef,
    domain,
    status: result.status,
    ...(result.id ? { id: result.id } : {}),
    // REDACTED, not dropped. The provider echoes back the address it rejected
    // ("Invalid recipient a.real.person@example.com"), which would re-enter
    // stdout through this field and bypass `toRef` above and every route-level
    // redaction below it. `result.error` itself stays raw for callers that
    // need it; only what crosses the logging boundary is sanitised.
    ...(result.error ? { error: redactEmails(result.error) } : {}),
    ...(result.providerCode ? { providerCode: result.providerCode } : {}),
    ...(result.failureKind ? { failureKind: result.failureKind } : {}),
  };
  if (result.success) {
    console.log('[MAIA/email] sent', line);
    return;
  }
  console.error('[MAIA/email] FAILED', line);
  // When this fires, every auth code, invite and reset in the system is
  // failing — not just this one. It should not have to be inferred from a
  // per-request error line during an outage.
  if (result.failureKind && TRANSPORT_WIDE.has(result.failureKind)) {
    console.error(
      `[MAIA/email] TRANSPORT_DOWN kind=${result.failureKind} providerCode=${result.providerCode ?? 'unnamed'} purpose=${purpose} — email delivery is failing for ALL recipients. Check the provider account.`
    );
  }
}

// ============================================================================
// SEND
// ============================================================================

/**
 * Send one email through Soullab Mail's governed provider boundary.
 * Sender identity and MAIL-05 capacity are checked before touching the provider.
 */
export async function sendEmail(opts: SendEmailOptions): Promise<SendEmailResult> {
  let from = opts.from ?? SENDERS.default;
  let replyTo = opts.replyTo;
  const toLog = Array.isArray(opts.to) ? opts.to.join(', ') : opts.to;
  const domain = domainOf(opts.to);
  // The purpose registry owns priority. A caller cannot promote bulk mail to
  // P0 or downgrade identity mail without an explicit reviewed policy change.
  const priority = resolvePriority(opts.purpose);
  if (opts.priority !== undefined && opts.priority !== priority) {
    return failure('sender_not_authorized', 'Mail priority override is not authorized', 'mail_priority_refused', { priority });
  }
  // New unregistered families must never consume protected identity/access
  // quotas, even when they syntactically resemble an auth: or invite: purpose.
  if ((priority === 'P0' || priority === 'P1') && !isRegisteredPurpose(opts.purpose)) {
    return failure('sender_not_authorized', 'Protected mail purpose is not registered', 'mail_purpose_unregistered', { priority });
  }
  // A caller's key may accidentally contain a passkey, name or email address.
  // Always replace it with a domain-separated keyed HMAC before it can enter
  // either the delivery ledger, SMTP headers or operational logs.
  const opaqueAttemptKey = opts.idempotencyKey
    ? fingerprintMailReference('attempt', opts.idempotencyKey)
    : undefined;
  const trace = { correlationId: opts.correlationId, idempotencyKey: opaqueAttemptKey ?? undefined };
  if (opts.idempotencyKey && !opaqueAttemptKey) {
    const result = failure('not_configured', 'Mail correlation key unavailable', 'mail_reference_unavailable', { priority });
    logSend(opts.purpose, from, toLog, domain, result, trace);
    return result;
  }

  // Provider resolution can itself refuse (unknown EMAIL_PROVIDER, capture
  // transport in production). That refusal is a configuration failure, not an
  // unhandled crash in whatever route happened to be sending.
  let provider: EmailProvider;
  try {
    provider = opts.provider ?? getEmailProvider();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Email provider is not configured';
    const result = failure('not_configured', message, 'provider_selection', { priority });
    logSend(opts.purpose, from, toLog, domain, result, trace);
    return result;
  }

  const ctx = { provider: provider.name, priority };

  // The production transport cannot be overridden back to a retired vendor.
  if (process.env.NODE_ENV === 'production' && provider.name !== 'smtp') {
    const result = failure('not_configured', 'Only governed SMTP transport is permitted', 'mail_transport_refused', ctx);
    logSend(opts.purpose, from, toLog, domain, result, trace);
    return result;
  }

  if (!provider.isConfigured()) {
    const result = failure('not_configured', `${provider.name} provider is not configured`, undefined, ctx);
    logSend(opts.purpose, from, toLog, domain, result, trace);
    return result;
  }

  // MAIL-04: an SMTP provider never receives mail with unknown authority or
  // unproved recipient provenance. No 'system' default and no inference from
  // the purpose string; callers must explicitly establish the real actor and
  // destination origin in the trusted server path.
  if (provider.name === 'smtp') {
    if (!opts.admission) {
      const result = failure('sender_not_authorized', 'Soullab Mail requires verified send authority', 'mail_admission_missing', ctx);
      logSend(opts.purpose, from, toLog, domain, result, trace);
      return result;
    }
    const admission = admit({ purpose: opts.purpose, ...opts.admission });
    if (!admission.admitted) {
      const result = failure('sender_not_authorized', 'Soullab Mail refused recipient provenance', 'mail_admission_' + admission.reason, ctx);
      logSend(opts.purpose, from, toLog, domain, result, trace);
      return result;
    }
  }

  // The qualified Proton credential belongs only to noreply@soullab.life.
  // Other historical managed senders are made visibly Soullab-sent; human
  // reply targets survive where explicitly known. Custom/unknown senders refuse.
  if (provider.name === 'smtp' && !opts.provider) {
    const sender = managedSender(from, replyTo, opts.purpose);
    if (!sender.allowed) {
      const result = failure('sender_not_authorized', 'Soullab Mail sender identity is not qualified', 'mail_sender_refused', ctx);
      logSend(opts.purpose, from, toLog, domain, result, trace);
      return result;
    }
    from = sender.from;
    replyTo = sender.replyTo;
  }

  // MAIL-05 is a separate authorization boundary, never a ledger lookup.
  // An exhausted budget does not reach SMTP, even if the caller is a worker.
  // Test providers intentionally do not use real capacity; production refuses
  // all transports except smtp, for which this check is mandatory.
  if (provider.name === 'smtp') {
    const capacity = await reserveEmailCapacity(priority, opts.to);
    if (!capacity.allowed) {
      const isBadRecipient = capacity.reason === 'invalid_recipient';
      const isExhausted = capacity.reason === 'budget_exhausted';
      const kind: SendFailureKind = isBadRecipient ? 'invalid_recipient' : isExhausted ? 'capacity_refused' : 'not_configured';
      const result = failure(
        kind,
        isBadRecipient ? 'Invalid recipient address' : isExhausted
          ? 'Soullab Mail sending limit reached; please try later'
          : 'Soullab Mail capacity controls are unavailable',
        'mail_capacity_' + capacity.reason, ctx
      );
      logSend(opts.purpose, from, toLog, domain, result, trace);
      return result;
    }
  }

  try {
    // Purpose, lane and correlation travel WITH the message as provider tags,
    // so the vendor's own dashboard segments the same way our logs do and an
    // operator does not have to correlate two vocabularies during an incident.
    const tags = [
      ...(opts.tags ?? []).map((t) => ({
        name: tagSafe(t.name),
        value: tagSafe(t.value),
      })),
      { name: 'purpose', value: tagSafe(opts.purpose) },
      { name: 'priority', value: priority },
      ...(opts.correlationId ? [{ name: 'correlation_id', value: tagSafe(opts.correlationId) }] : []),
      ...(opaqueAttemptKey ? [{ name: 'idempotency_key', value: tagSafe(opaqueAttemptKey) }] : []),
      ...Object.entries(opts.metadata ?? {}).map(([name, value]) => ({
        name: tagSafe(name),
        value: tagSafe(value),
      })),
    ];

    // LEDGER — opened BEFORE the provider call so a crash mid-send leaves
    // evidence rather than nothing. Best-effort by construction: `openAttempt`
    // swallows its own failures and returns null, and nothing below branches on
    // the result. The ledger observes sending; it does not authorize it.
    const attemptId = await openAttempt({
      purpose: opts.purpose,
      lane: priority,
      provider: provider.name,
      recipient: Array.isArray(opts.to) ? opts.to[0] : opts.to,
      memberRef: opts.memberId ? memberRef(opts.memberId) : undefined,
      idempotencyKey: opaqueAttemptKey,
      correlationId: opts.correlationId,
      triggerType: opts.triggerType,
      triggerRef: opts.triggerRef,
      campaignRef: opts.campaignRef,
      metadata: opts.metadata,
    });

    const outcome = await provider.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      replyTo,
      headers: opts.headers,
      tags,
    });

    // THE LOAD-BEARING CHECK, now stated at the boundary rather than inside one
    // vendor's SDK contract. A provider reports acceptance ONLY when the vendor
    // took responsibility and issued an id. Everything else is a refusal, and a
    // refusal is never reported to a caller as a send.
    if (!outcome.accepted) {
      const { kind, name, message } = classifyProviderError(outcome.rawError);
      // `providerCode` is the vendor's raw name, kept verbatim for operators;
      // `failureKind` is our classification, which is what callers branch on.
      const result = failure(kind, message, name, ctx);
      // `stateForFailure` decides what we KNOW happened; `failure_class` records
      // WHY. A transport exception is indeterminate, not refused — the provider
      // may have acted before we lost the response.
      await settleAttempt(attemptId, {
        state: stateForFailure(kind),
        failureClass: kind,
        failureCode: name,
      });
      logSend(opts.purpose, from, toLog, domain, result, trace);
      return result;
    }

    const result: SendEmailResult = {
      success: true,
      id: outcome.providerMessageId,
      status: 'sent',
      provider: provider.name,
      priority,
    };
    await settleAttempt(attemptId, {
      state: 'accepted',
      providerMessageId: outcome.providerMessageId,
    });
    logSend(opts.purpose, from, toLog, domain, result, trace);
    return result;
  } catch (err) {
    const { name, message } = classifyProviderError(err);
    const result = failure('exception', message, name, ctx);
    logSend(opts.purpose, from, toLog, domain, result, trace);
    return result;
  }
}

/**
 * Provider tags are a constrained namespace (Resend: ASCII letters, digits,
 * underscore, dash). A purpose like `auth:magic-link` would be rejected
 * verbatim, and a rejected TAG fails the whole send — turning observability
 * into an outage. Normalise rather than risk that.
 */
function tagSafe(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 256) || 'unspecified';
}
