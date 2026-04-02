/**
 * World Telemetry — fire-and-forget client event emitter.
 * Sends to POST /api/telemetry/world. Never blocks UX.
 */

import { apiFetch } from '@/lib/http/apiBase';

interface WorldEvent {
  eventType: 'doorway_shown' | 'doorway_clicked' | 'doorway_dismissed' | 'world_entered' | 'world_exited';
  intent?: string;
  world?: string;
  confidence?: number;
  timeToClick?: number | null;
  timeInWorld?: number | null;
}

export function emitWorldEvent(event: WorldEvent): void {
  // Fire-and-forget — never await, never block
  const memberId = typeof window !== 'undefined'
    ? localStorage.getItem('explorerId') || undefined
    : undefined;
  const sessionId = typeof window !== 'undefined'
    ? sessionStorage.getItem('maia_session_id') || undefined
    : undefined;

  apiFetch('/api/telemetry/world', {
    method: 'POST',
    body: JSON.stringify({
      ...event,
      memberId,
      sessionId,
    }),
  }).catch(() => {
    // Silent fail — telemetry must never disrupt experience
  });
}
