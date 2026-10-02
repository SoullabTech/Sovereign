'use client';

import type { TelemetryPayload } from './telemetryTypes';

export function trackOnboarding(payload: TelemetryPayload): void {
  void fetch('/api/onboarding/telemetry', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Telemetry is never a hard dependency for onboarding.
  });
}
