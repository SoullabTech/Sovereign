/**
 * Contrast Experience Telemetry — Client-side fire-and-forget logging.
 *
 * Follows the storeTrustObservation pattern: never blocks, never throws,
 * errors are swallowed with a console warning.
 */

import { apiFetch } from '@/lib/http/apiBase';

export type ContrastEventType =
  | 'gate_passed'
  | 'gate_rejected'
  | 'shown'
  | 'accepted'
  | 'dismissed'
  | 'generated'
  | 'suppressed_similarity'
  | 'engaged_after_contrast';

export interface ContrastEvent {
  sessionId: string;
  turnIndex: number;
  eventType: ContrastEventType;
  originalTradition: string | null;
  contrastTradition: string | null;
  contrastMode: string | null;
  gateReason?: string;
  meta?: Record<string, unknown>;
}

/**
 * Fire-and-forget telemetry for contrast moments.
 * Never blocks, never throws. Errors log a warning.
 */
export function logContrastEvent(event: ContrastEvent): void {
  apiFetch('/api/contrast/telemetry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  }).catch((err: unknown) => {
    console.warn('[contrast-telemetry] Failed to log event:', event.eventType, err);
  });
}
