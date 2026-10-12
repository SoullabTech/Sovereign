/**
 * MAIL-05 · Transport-independent sending budget.
 *
 * Unlike the observational delivery ledger, this policy check DOES authorize
 * capacity. Every SMTP attempt must reserve a DB-wide allowance before the
 * provider is contacted. The database function is atomic across workers.
 *
 * Recipients are never stored or logged in plaintext. The table receives only
 * HMAC-SHA256 keys from the ledger fingerprint boundary. No unhashed fallback.
 * No process-local emergency allowance is permitted. Restarts, workers and
 * parallel instances cannot share such a cap, so every lane (including P0)
 * fails closed if its durable capacity reservation is unavailable.
 */
import { query } from '@/lib/db/postgres';
import { fingerprintRecipient } from './ledger/fingerprint';
import type { EmailPriority } from './purpose';

export type CapacityVerdict =
  | { allowed: true; degraded: boolean }
  | { allowed: false; reason: 'invalid_recipient' | 'fingerprint_unavailable' |
      'budget_exhausted' | 'capacity_unavailable'; degraded: boolean };

const MAX_RECIPIENTS = 20;
/** Parses one mailbox or display-name <mailbox> without permitting newline/header smuggling. */
export function extractRecipientMailbox(value: string): string | null {
  if (!value || /[\r\n]/.test(value)) return null;
  const trimmed = value.trim();
  const bracketed = trimmed.match(/^[^<>]*<([^<>]+)>$/);
  const bare = bracketed ? bracketed[1].trim() : trimmed;
  if (!/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(bare)) return null;
  return bare.toLowerCase();
}

/**
 * Fail-closed if the recipient cannot be fingerprinted, if a budget is spent,
 * or for ANY database failure, including P0. No restart-based allowances.
 */
export async function reserveEmailCapacity(
  lane: EmailPriority, recipient: string | string[]
): Promise<CapacityVerdict> {
  const values = Array.isArray(recipient) ? recipient : [recipient];
  if (values.length < 1 || values.length > MAX_RECIPIENTS) {
    return { allowed: false, reason: 'invalid_recipient', degraded: false };
  }
  const mailboxes = values.map(extractRecipientMailbox);
  if (mailboxes.some((v) => !v)) {
    return { allowed: false, reason: 'invalid_recipient', degraded: false };
  }
  const distinct = [...new Set(mailboxes as string[])];
  // Repeated To recipients are not allowed to bypass a budget or cause repeat sends.
  if (distinct.length !== values.length) {
    return { allowed: false, reason: 'invalid_recipient', degraded: false };
  }
  const hashes = distinct.map((r) => fingerprintRecipient(r)?.fingerprint);
  if (hashes.some((h) => !h)) {
    return { allowed: false, reason: 'fingerprint_unavailable', degraded: false };
  }
  try {
    const result = await query<{ allowed: boolean }>(
      'SELECT public.reserve_soullab_mail_capacity($1, $2::text[]) AS allowed',
      [lane, hashes]
    );
    if (result.rows[0]?.allowed === true) return { allowed: true, degraded: false };
    return { allowed: false, reason: 'budget_exhausted', degraded: false };
  } catch {
    console.error('[Soullab Mail] CAPACITY_DEGRADED — durable reservation unavailable');
    return { allowed: false, reason: 'capacity_unavailable', degraded: true };
  }
}
