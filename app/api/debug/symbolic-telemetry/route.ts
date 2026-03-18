export const dynamic = 'force-dynamic';

/**
 * Debug Panel — Symbolic Telemetry
 *
 * Returns a live snapshot of the governed symbolic pipeline:
 * authority distribution, block reasons, surface eligibility,
 * anomalies, and recent raw events.
 *
 * SECURITY: Returns 404 in production or when MAIA_DEBUG_PANEL_ENABLED is unset.
 * No auth beyond env gate — this is internal calibration data only.
 *
 * GET /api/debug/symbolic-telemetry
 * GET /api/debug/symbolic-telemetry?sessionId=<id>   — filter to one session
 * DELETE /api/debug/symbolic-telemetry               — clear buffer (dev only)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  buildTelemetrySummary,
  detectTelemetryAnomalies,
} from '@/lib/symbolic/symbolicTelemetry';
import {
  getSymbolicEvents,
  getEventCount,
  clearSymbolicEvents,
} from '@/lib/symbolic/telemetryStore';

function assertDebugEnabled(): NextResponse | null {
  const enabled =
    process.env.NODE_ENV !== 'production' &&
    process.env.MAIA_DEBUG_PANEL_ENABLED === 'true';

  if (!enabled) {
    return NextResponse.json(
      { ok: false, reason: 'debug_disabled' },
      { status: 404 }
    );
  }
  return null;
}

export async function GET(req: NextRequest) {
  const guard = assertDebugEnabled();
  if (guard) return guard;

  const { searchParams } = req.nextUrl;
  const sessionId = searchParams.get('sessionId') ?? undefined;

  // All events (for summary) vs filtered (for recent display)
  const allEvents = getSymbolicEvents();
  const filteredEvents = sessionId
    ? getSymbolicEvents({ sessionId })
    : allEvents;

  const eventsForSummary = sessionId ? filteredEvents : allEvents;
  const summary = buildTelemetrySummary(eventsForSummary, sessionId);
  const anomalies = detectTelemetryAnomalies(summary);

  return NextResponse.json({
    ok: true,
    eventCount: getEventCount(),
    sessionId: sessionId ?? null,
    summary,
    anomalies,
    recentEvents: filteredEvents.slice(0, 20),
    generatedAt: new Date().toISOString(),
  });
}

/** Clear the buffer — dev use only */
export async function DELETE(_req: NextRequest) {
  const guard = assertDebugEnabled();
  if (guard) return guard;

  clearSymbolicEvents();
  return NextResponse.json({ ok: true, cleared: true });
}
