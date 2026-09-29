/**
 * Onboarding Funnel Telemetry
 *
 * Fire-and-forget event logging for the onboarding funnel.
 * NEVER awaited in critical paths — failures are logged but never rethrown.
 *
 * Storage: `onboarding_events`.
 * Telemetry is never a hard dependency for user flow.
 */

import { query } from '@/lib/db/postgres';
import type {
  OnboardingEvent as ClientOnboardingEvent,
  TelemetryPayload as ClientTelemetryPayload,
} from './telemetryTypes';

export type OnboardingEvent = ClientOnboardingEvent | 'magic_link_send_failed';

export interface TelemetryPayload extends Omit<ClientTelemetryPayload, 'event'> {
  event: OnboardingEvent;
}

export function trackOnboarding(payload: TelemetryPayload): void {
  recordOnboarding(payload).catch((err) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(
        '[onboarding/telemetry] drop (table may not exist):',
        err instanceof Error ? err.message : err,
      );
    }
  });
}

export async function recordOnboarding(payload: TelemetryPayload): Promise<void> {
  await query(
    `INSERT INTO onboarding_events (event, member_id, email, path, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      payload.event,
      payload.memberId ?? null,
      payload.email ?? null,
      payload.path ?? null,
      payload.metadata ? JSON.stringify(payload.metadata) : null,
    ],
  );
}
