export const dynamic = 'force-dynamic';

/**
 * Debug Panel — Symbolic Telemetry
 *
 * Returns live or historical governed symbolic pipeline data:
 * authority distribution, block reasons, surface eligibility,
 * anomalies, recent raw events, and time-window DB aggregates.
 *
 * SECURITY: Returns 404 in production or when MAIA_DEBUG_PANEL_ENABLED is unset.
 * No auth beyond env gate — this is internal calibration data only.
 *
 * GET /api/debug/symbolic-telemetry
 *   → live: in-memory store (current server process)
 *
 * GET /api/debug/symbolic-telemetry?sessionId=<id>
 *   → live: filtered to one session
 *
 * GET /api/debug/symbolic-telemetry?source=db&window=24
 *   → historical: DB aggregates for past N hours (default 24)
 *
 * GET /api/debug/symbolic-telemetry?source=db&window=72&trend=1
 *   → historical: hourly trend buckets for past N hours
 *
 * GET /api/debug/symbolic-telemetry?source=db&window=72&byMode=1
 *   → Phase 23: mode (element) breakdown for past N hours
 *
 * GET /api/debug/symbolic-telemetry?source=db&window=24&route=oracle/conversation&mode=fire
 *   → Phase 23: filter summary by route and/or mode
 *
 * DELETE /api/debug/symbolic-telemetry
 *   → clear in-memory buffer (dev only)
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
import {
  queryTelemetrySummary,
  queryTelemetryTrend,
  queryTelemetryByMode,
} from '@/lib/symbolic/symbolicTelemetryPersistence';

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
  const source = searchParams.get('source');          // 'db' | null (default: in-memory)
  const sessionId = searchParams.get('sessionId') ?? undefined;
  const memberId = searchParams.get('memberId') ?? undefined;
  const windowHours = parseInt(searchParams.get('window') ?? '24', 10);
  const trend = searchParams.get('trend') === '1';
  const domain = searchParams.get('domain') ?? undefined;
  const route = searchParams.get('route') ?? undefined;  // Phase 23
  const mode = searchParams.get('mode') ?? undefined;    // Phase 23
  const byMode = searchParams.get('byMode') === '1';     // Phase 23 — mode breakdown

  // ── DB-backed historical query ──────────────────────────────────────────────
  if (source === 'db') {
    try {
      if (byMode) {
        const rows = await queryTelemetryByMode(windowHours, { route, domain });
        return NextResponse.json({
          ok: true,
          source: 'db',
          windowHours,
          modeRows: rows,
          generatedAt: new Date().toISOString(),
        });
      }

      if (trend) {
        const rows = await queryTelemetryTrend(windowHours, { memberId, domain, route, mode });
        return NextResponse.json({
          ok: true,
          source: 'db',
          windowHours,
          trendRows: rows,
          generatedAt: new Date().toISOString(),
        });
      }

      const rows = await queryTelemetrySummary(windowHours, { memberId, sessionId, route, mode, domain });
      return NextResponse.json({
        ok: true,
        source: 'db',
        windowHours,
        rows,
        totalEvents: rows.reduce((sum, r) => sum + r.count, 0),
        generatedAt: new Date().toISOString(),
      });
    } catch (err) {
      return NextResponse.json({
        ok: false,
        source: 'db',
        error: err instanceof Error ? err.message : String(err),
      }, { status: 500 });
    }
  }

  // ── In-memory live snapshot (default) ─────────────────────────────────────
  const allEvents = getSymbolicEvents();
  const filteredEvents = sessionId
    ? getSymbolicEvents({ sessionId })
    : allEvents;

  const eventsForSummary = sessionId ? filteredEvents : allEvents;
  const summary = buildTelemetrySummary(eventsForSummary, sessionId);
  const anomalies = detectTelemetryAnomalies(summary);

  return NextResponse.json({
    ok: true,
    source: 'memory',
    eventCount: getEventCount(),
    sessionId: sessionId ?? null,
    summary,
    anomalies,
    recentEvents: filteredEvents.slice(0, 20),
    generatedAt: new Date().toISOString(),
  });
}

/** Clear the in-memory buffer — dev use only */
export async function DELETE(_req: NextRequest) {
  const guard = assertDebugEnabled();
  if (guard) return guard;

  clearSymbolicEvents();
  return NextResponse.json({ ok: true, cleared: true });
}
