/**
 * Onboarding Funnel Telemetry
 *
 * Fire-and-forget event logging for the onboarding funnel.
 * NEVER awaited in critical paths — failures are logged but never rethrown.
 *
 * Events to track:
 *   begin_opened, email_submitted, magic_link_sent, magic_link_opened,
 *   token_redeemed, session_created, profile_saved, faq_started,
 *   faq_completed, onboarding_completed, first_maia_entry
 *
 * Failure events:
 *   token_invalid, token_expired, token_already_used,
 *   session_missing_after_verify, redirect_loop_detected,
 *   onboarding_resume_invoked
 *
 * Storage: `onboarding_events` table (see migration below).
 * If the table doesn't exist yet, failures are silently swallowed —
 * telemetry is never a hard dependency for user flow.
 *
 * Migration (run once):
 *   database/migrations/20260312000001_onboarding_events.sql
 */

import { query } from '@/lib/db/postgres';

export type OnboardingEvent =
  // Progress events
  | 'begin_opened'
  | 'email_submitted'
  | 'magic_link_sent'
  | 'magic_link_opened'
  | 'token_redeemed'
  | 'session_created'
  | 'profile_saved'
  | 'faq_started'
  | 'faq_completed'
  | 'prefs_started'
  | 'prefs_completed'
  | 'onboarding_completed'
  | 'first_maia_entry'
  // Recovery events
  | 'onboarding_resumed'
  | 'cross_device_recovery'
  | 'magic_link_resent'
  // Failure events
  | 'token_invalid'
  | 'token_expired'
  | 'token_already_used'
  | 'session_missing_after_verify'
  | 'redirect_loop_detected'
  | 'registration_failed'
  | 'email_already_exists'
  // The provider accepted the request and REFUSED the send (quota, unverified
  // domain, suppressed recipient). Distinct from 'magic_link_sent', which must
  // now mean the provider actually took the message — see the 2026-08-24 quota
  // incident, where six real signup attempts recorded magic_link_sent while
  // Resend had rejected every one with 429 monthly_quota_exceeded. A funnel
  // that cannot see this drop reports a delivery problem as a member who
  // simply never came back.
  | 'magic_link_send_failed';

export interface TelemetryPayload {
  event: OnboardingEvent;
  memberId?: string | null;
  email?: string | null;
  /** Context: which path triggered this (email, passkey, magic-link, resume, etc.) */
  path?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

/**
 * Log an onboarding funnel event.
 * Always fire-and-forget — never await in the calling code.
 *
 * @example
 * trackOnboarding({ event: 'magic_link_sent', email: normalizedEmail });
 * // No await. Failure does not affect user flow.
 */
export function trackOnboarding(payload: TelemetryPayload): void {
  // Intentionally not awaited — pure side-effect
  _insertEvent(payload).catch((err) => {
    // Only log in development; don't pollute production logs
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[onboarding/telemetry] drop (table may not exist):', err instanceof Error ? err.message : err);
    }
  });
}

async function _insertEvent(payload: TelemetryPayload): Promise<void> {
  await query(
    `INSERT INTO onboarding_events (event, member_id, email, path, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      payload.event,
      payload.memberId ?? null,
      payload.email ?? null,
      payload.path ?? null,
      payload.metadata ? JSON.stringify(payload.metadata) : null,
    ]
  );
}
