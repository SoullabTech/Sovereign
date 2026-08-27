/**
 * DELIVERY LEDGER — durable evidence of what left, and what came back.
 * ===================================================================
 *
 * THE LOAD-BEARING RULE:
 *
 *     The ledger OBSERVES sending; it does not AUTHORIZE sending.
 *
 * This module must never be consulted before a provider call, must never return a
 * value the send path branches on, and must never be able to fail a send. It
 * imports no provider and no sendEmail — enforced by a guard test, not by care.
 *
 * WHY BEST-EFFORT.
 *   If a ledger write were on the critical path, a database problem would become a
 *   P0 authentication outage: nobody could sign in because we could not record that
 *   they were signing in. Adding observability must not be able to stop mail.
 *
 * WHAT THAT COSTS, STATED PLAINLY.
 *   A best-effort ledger UNDER-REPORTS, and it under-reports hardest exactly when
 *   the system is most stressed. So the ledger cannot be its own witness: dropped
 *   writes are counted OUT OF BAND (./metrics) and every volume figure must carry
 *   that count. "12,403 sends observed · 7 ledger writes lost" is honest;
 *   "12,403 total sends" is not.
 */

import { query } from '@/lib/db/postgres';
import { fingerprintRecipient } from './fingerprint';
import { recordLedgerWriteFailure } from './metrics';
import type { EmailPriority } from '../purpose';

export type LedgerState = 'attempting' | 'accepted' | 'indeterminate' | 'refused';

/**
 * Outcomes we genuinely cannot resolve, mapped from MAIL-01's SendFailureKind.
 *
 * `no_message_id` — the vendor resolved with neither an error nor an id. It never
 *   said no; it said nothing usable.
 *
 * `exception` — a transport throw (network, DNS, timeout). Depending on where the
 *   connection died, THE PROVIDER MAY HAVE RECEIVED AND ACTED ON THE REQUEST while
 *   we lost the response. Recording that as `refused` asserts knowledge we do not
 *   have, in precisely the situation where a duplicate send is most likely — which
 *   is the situation MAIL-03 will most need this data to reason about.
 *
 * Everything else is a known terminal non-send. `not_configured` is not literally a
 * vendor refusal, but it is not ambiguous either, so `refused` is the least
 * misleading state in a four-state model; `failure_class` preserves the
 * distinction for operators.
 */
const INDETERMINATE_KINDS: ReadonlySet<string> = new Set(['no_message_id', 'exception']);

/**
 * Map a MAIL-01 failure onto what we KNOW happened.
 *
 * Return type deliberately EXCLUDES 'attempting' and 'accepted': a failure can
 * never be either, and letting the signature say otherwise would allow a caller
 * to settle a failed send as accepted without the compiler objecting.
 */
export function stateForFailure(failureKind: string | undefined): 'indeterminate' | 'refused' {
  if (failureKind && INDETERMINATE_KINDS.has(failureKind)) return 'indeterminate';
  return 'refused';
}

export interface AttemptRecord {
  purpose: string;
  lane: EmailPriority;
  provider: string;
  /** Plaintext, used ONLY to derive the fingerprint and domain. Never stored. */
  recipient: string;
  memberRef?: string;
  idempotencyKey?: string;
  correlationId?: string;
  triggerType?: 'route' | 'cron' | 'script' | 'worker';
  triggerRef?: string;
  campaignRef?: string;
  metadata?: Record<string, string>;
}

export interface OutcomeRecord {
  state: Exclude<LedgerState, 'attempting'>;
  providerMessageId?: string;
  failureClass?: string;
  failureCode?: string;
}

function domainOf(recipient: string): string | null {
  const at = recipient.lastIndexOf('@');
  return at >= 0 ? recipient.slice(at + 1).toLowerCase() : null;
}

/**
 * Keys that must never reach the ledger, whatever a caller passes in `metadata`.
 *
 * `metadata` is free-form JSONB and is therefore the likeliest place for a secret
 * to arrive by accident. MAIL-01 closed two secret-in-log leaks (a beta passcode
 * and a practice-field join token); durable storage must not reopen them.
 * Filtering here rather than trusting call sites means a new caller cannot
 * reintroduce the leak by not knowing about it.
 */
const FORBIDDEN_METADATA = [
  'code', 'token', 'passcode', 'password', 'secret', 'key', 'otp',
  'magic', 'link', 'url', 'email', 'address', 'recipient', 'body', 'html', 'subject',
];

export function scrubMetadata(metadata: Record<string, string> | undefined): Record<string, string> {
  if (!metadata) return {};
  const safe: Record<string, string> = {};
  for (const [k, v] of Object.entries(metadata)) {
    const lower = k.toLowerCase();
    if (FORBIDDEN_METADATA.some((bad) => lower.includes(bad))) continue;
    safe[k] = v;
  }
  return safe;
}

/**
 * Open a ledger row BEFORE the provider call.
 *
 * The row must exist before the call so a crash mid-send leaves evidence rather
 * than nothing. Returns the row id, or `null` if the write failed — and `null` is
 * not an error the caller handles, it simply means the outcome update has nothing
 * to update. The send proceeds either way.
 */
export async function openAttempt(record: AttemptRecord): Promise<string | null> {
  try {
    const fp = fingerprintRecipient(record.recipient);
    const result = await query<{ id: string }>(
      `INSERT INTO email_delivery_attempts
         (purpose, lane, provider, state,
          recipient_fingerprint, recipient_fingerprint_key_version, member_ref, recipient_domain,
          idempotency_key, correlation_id, trigger_type, trigger_ref, campaign_ref, metadata)
       VALUES ($1,$2,$3,'attempting',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id`,
      [
        record.purpose,
        record.lane,
        record.provider,
        fp?.fingerprint ?? null,
        fp?.keyVersion ?? null,
        record.memberRef ?? null,
        domainOf(record.recipient),
        record.idempotencyKey ?? null,
        record.correlationId ?? null,
        record.triggerType ?? null,
        record.triggerRef ?? null,
        record.campaignRef ?? null,
        JSON.stringify(scrubMetadata(record.metadata)),
      ]
    );
    return result.rows[0]?.id ?? null;
  } catch (err) {
    recordLedgerWriteFailure('open', err);
    return null;
  }
}

/**
 * Settle a ledger row after the provider answered.
 *
 * A failure here leaves the row in `attempting` — which is itself detectable
 * uncertainty, and is exactly why `state` is an enum rather than a boolean. It is
 * never surfaced to the caller.
 */
export async function settleAttempt(id: string | null, outcome: OutcomeRecord): Promise<void> {
  if (!id) return;
  try {
    await query(
      `UPDATE email_delivery_attempts
          SET state = $2, settled_at = NOW(),
              provider_message_id = $3, failure_class = $4, failure_code = $5
        WHERE id = $1`,
      [
        id,
        outcome.state,
        outcome.providerMessageId ?? null,
        outcome.failureClass ?? null,
        outcome.failureCode ?? null,
      ]
    );
  } catch (err) {
    recordLedgerWriteFailure('settle', err);
  }
}
