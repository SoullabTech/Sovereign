/**
 * SELF-ADDRESSED-RETURN-01 Tier 1 — shared types.
 *
 * Mirrors the CHECK constraints in
 * database/migrations/20260904000002_member_reminders.sql.
 */

export type ReminderSourceType = 'memory_atom' | 'daily_anchor' | 'member_note';

export const VALID_REMINDER_SOURCE_TYPES: ReadonlySet<ReminderSourceType> = new Set([
  'memory_atom',
  'daily_anchor',
  'member_note',
]);

export function isValidReminderSourceType(v: unknown): v is ReminderSourceType {
  return typeof v === 'string' && VALID_REMINDER_SOURCE_TYPES.has(v as ReminderSourceType);
}

/**
 * Typed, closed failure set (spec §6.5). No provider prose is ever stored:
 * vendor messages can echo the payload, and free-text columns accrete content.
 */
export type ReminderFailureCode =
  | 'no_recipient'
  | 'provider_unconfigured'
  | 'provider_rejected'
  | 'quota_exceeded'
  | 'expired'
  | 'cancel_secret_unavailable'
  | 'unknown';

/** Longest a member-approved reminder text may be (mirrors the CHECK). */
export const MAX_DELIVERY_TEXT_LENGTH = 2000;

/** v1 retry window. Past this, the reminder is terminal-'expired', never sent. */
export const DEFAULT_DELIVERY_WINDOW_HOURS = 6;

/** Stable, derived — never random. Spec §6.2. */
export function reminderIdempotencyKey(reminderId: string): string {
  return `self-addressed-return/${reminderId}`;
}

export interface MemberReminder {
  id: string;
  member_id: string;
  source_type: ReminderSourceType;
  source_id: string | null;
  delivery_at: Date;
  delivery_deadline: Date;
  channel: 'email';
  delivery_text: string;
  created_at: Date;
  cancelled_at: Date | null;
  delivered_at: Date | null;
  delivery_attempts: number;
  cancel_token_version: number;
  failed_at: Date | null;
  failure_code: ReminderFailureCode | null;
}
