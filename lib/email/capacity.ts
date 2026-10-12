/**
 * MAIL-05 · Transport-independent sending budget.
 *
 * Unlike the observational delivery ledger, this policy check DOES authorize
 * capacity. Every SMTP attempt must reserve a DB-wide allowance before the
 * provider is contacted. The database function is atomic across workers.
 *
 * Recipients are never stored or logged in plaintext. The table receives only
 * HMAC-SHA256 keys from the ledger fingerprint boundary. No unhashed fallback.
 * P0 has a tiny, bounded process-local emergency allowance when (and only when)
 * PostgreSQL is unavailable, so an outage cannot become an unlimited mailer.
 */
import { query } from '@/lib/db/postgres';
import { fingerprintRecipient } from './ledger/fingerprint';
import type { EmailPriority } from './purpose';

export type CapacityVerdict =
  | { allowed: true; degraded: boolean }
  | { allowed: false; reason: 'invalid_recipient' | 'fingerprint_unavailable' |
      'budget_exhausted' | 'capacity_unavailable' | 'emergency_ceiling'; degraded: boolean };

const MAX_RECIPIENTS = 20;
const EMERGENCY_HOUR_MAX = 6;
const EMERGENCY_PER_RECIPIENT_MAX = 2;
const EMERGENCY_MAP_CAP = 64;

let emergencyHour = '';
let emergencyGlobal = 0;
const emergencyByRecipient = new Map<string, number>();

/** Parses one mailbox or display-name <mailbox> without permitting newline/header smuggling. */
export function extractRecipientMailbox(value: string): string | null {
  if (!value || /[\r\n]/.test(value)) return null;
  const trimmed = value.trim();
  const bracketed = trimmed.match(/^[^<>]*<([^<>]+)>$/);
  const bare = bracketed ? bracketed[1].trim() : trimmed;
  if (!/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(bare)) return null;
  return bare.toLowerCase();
}

function emergencyReserve(recipients: string[]): CapacityVerdict {
  const hour = new Date().toISOString().slice(0, 13);
  if (hour !== emergencyHour) {
    emergencyHour = hour;
    emergencyGlobal = 0;
    emergencyByRecipient.clear();
  }
  // Only one-recipient identity mail is eligible for the degraded allowance.
  if (recipients.length !== 1 || emergencyGlobal + 1 > EMERGENCY_HOUR_MAX) {
    return { allowed: false, reason: 'emergency_ceiling', degraded: true };
  }
  const key = recipients[0];
  const current = emergencyByRecipient.get(key) ?? 0;
  if (current + 1 > EMERGENCY_PER_RECIPIENT_MAX ||
      (current === 0 && emergencyByRecipient.size >= EMERGENCY_MAP_CAP)) {
    return { allowed: false, reason: 'emergency_ceiling', degraded: true };
  }
  emergencyByRecipient.set(key, current + 1);
  emergencyGlobal += 1;
  return { allowed: true, degraded: true };
}

/** Unit-test seam only; never an operational mechanism for restoring capacity. */
export function __resetEmergencyCapacityForTests(): void {
  emergencyHour = '';
  emergencyGlobal = 0;
  emergencyByRecipient.clear();
}

/**
 * Fail-closed if the recipient cannot be fingerprinted, if a budget is spent,
 * or for any P1/P2/P3 database failure. Only P0 uses a tiny emergency ceiling.
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
    if (lane === 'P0') return emergencyReserve(hashes as string[]);
    return { allowed: false, reason: 'capacity_unavailable', degraded: true };
  }
}
