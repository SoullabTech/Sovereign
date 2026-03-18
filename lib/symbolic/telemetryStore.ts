/**
 * Symbolic Telemetry Store — Phase 18
 *
 * Server-side in-memory circular buffer for governed symbolic pipeline events.
 *
 * DESIGN:
 *   - Module-level — shared across requests within a server process
 *   - Resets on server restart (intentional — no persistence needed for calibration)
 *   - FIFO eviction when MAX_EVENTS reached
 *   - Thread-safe enough for Node.js single-threaded event loop
 *
 * USAGE:
 *   recordSymbolicEvent(telemetryFromIngressItem(item, sessionId));  // fire-and-forget
 *   const events = getSymbolicEvents({ limit: 50 });                 // for /api/debug
 *
 * WIRING POINT (Phase 19+):
 *   In app/api/oracle/conversation/route.ts, after buildPromptIngressItem():
 *     recordSymbolicEvent(telemetryFromIngressItem(item, sessionId));
 */

import type { SymbolicTelemetryEvent } from '@/lib/symbolic/symbolicTelemetry';

const MAX_EVENTS = 200;

// Module-level buffer — lives for the duration of the server process
const _events: SymbolicTelemetryEvent[] = [];

// ─────────────────────────────────────────────────────────────────────────────
// WRITE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Record a telemetry event into the circular buffer.
 * Fire-and-forget — never throws, never blocks.
 */
export function recordSymbolicEvent(event: SymbolicTelemetryEvent): void {
  try {
    if (_events.length >= MAX_EVENTS) {
      _events.shift(); // evict oldest
    }
    _events.push(event);
  } catch {
    // Silently ignore — telemetry must never break the pipeline
  }
}

/**
 * Record multiple events at once.
 */
export function recordSymbolicEvents(events: SymbolicTelemetryEvent[]): void {
  for (const event of events) {
    recordSymbolicEvent(event);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────────────────────────────────────

export interface GetSymbolicEventsOptions {
  /** Filter to a specific session */
  sessionId?: string;
  /** Return at most N events (most recent first) */
  limit?: number;
}

/**
 * Return a snapshot of recorded events, most recent first.
 */
export function getSymbolicEvents(
  opts: GetSymbolicEventsOptions = {}
): SymbolicTelemetryEvent[] {
  let events = [..._events].reverse(); // most recent first

  if (opts.sessionId) {
    events = events.filter(e => e.sessionId === opts.sessionId);
  }

  if (opts.limit !== undefined && opts.limit > 0) {
    events = events.slice(0, opts.limit);
  }

  return events;
}

/**
 * Total number of events currently in the buffer.
 */
export function getEventCount(): number {
  return _events.length;
}

// ─────────────────────────────────────────────────────────────────────────────
// RESET (dev / test only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clear all recorded events.
 * Only call from debug endpoints or test setup — never from production paths.
 */
export function clearSymbolicEvents(): void {
  _events.splice(0, _events.length);
}
