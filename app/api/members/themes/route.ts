export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';

function generateCorrelationId(): string {
  return `themes-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface ThemeSignalTypeDistribution {
  active: number;
  emerging: number;
  blocked: number;
  integrating: number;
}

export interface ThemeSummary {
  theme: string;
  count: number;
  first_detected_at: string;
  latest_detected_at: string;
  strongest_resonance: number | null;
  element: string | null;
  signal_types: ThemeSignalTypeDistribution;
}

export interface ThemesResponse {
  themes: ThemeSummary[];
  total_signals: number;
  window_days: number;
  correlationId: string;
}

/**
 * GET /api/members/themes
 * Returns recurring theme summary for the authenticated member.
 *
 * Grouped by theme, ordered by count desc then recency.
 * 30-day rolling window. Max 6 themes returned.
 *
 * Authentication: session cookie only (same as /api/members/profile)
 */
export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId();
  const headers = { 'X-Correlation-ID': correlationId };

  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true }, { headers });
  }

  const session = await getCurrentSession();
  const memberId = session?.memberId ?? null;

  if (!memberId) {
    return NextResponse.json(
      { error: 'Session required', code: 'NO_SESSION', correlationId },
      { status: 401, headers }
    );
  }

  // Optional: caller can request a different window (default 30 days, max 90)
  const url = new URL(request.url);
  const rawDays = parseInt(url.searchParams.get('days') ?? '30', 10);
  const windowDays = Math.min(Math.max(rawDays, 1), 90);

  try {
    const result = await query<{
      theme: string;
      count: string;
      first_detected_at: string;
      latest_detected_at: string;
      strongest_resonance: string | null;
      element: string | null;
      active_count: string;
      emerging_count: string;
      blocked_count: string;
      integrating_count: string;
    }>(
      `SELECT
         theme,
         COUNT(*)::int                       AS count,
         MIN(detected_at)                    AS first_detected_at,
         MAX(detected_at)                    AS latest_detected_at,
         MAX(resonance_strength)             AS strongest_resonance,
         (
           SELECT element
           FROM   member_theme_signals sub
           WHERE  sub.member_id = $1
             AND  sub.theme     = mts.theme
           ORDER  BY sub.detected_at DESC
           LIMIT  1
         )                                   AS element,
         COUNT(*) FILTER (WHERE signal_type = 'active')::int       AS active_count,
         COUNT(*) FILTER (WHERE signal_type = 'emerging')::int     AS emerging_count,
         COUNT(*) FILTER (WHERE signal_type = 'blocked')::int      AS blocked_count,
         COUNT(*) FILTER (WHERE signal_type = 'integrating')::int  AS integrating_count
       FROM   member_theme_signals mts
       WHERE  member_id   = $1
         AND  detected_at > NOW() - ($2 || ' days')::interval
       GROUP  BY theme
       ORDER  BY count DESC, latest_detected_at DESC
       LIMIT  6`,
      [memberId, windowDays]
    );

    // Total individual signals in the window (for context)
    const totalResult = await query<{ total: string }>(
      `SELECT COUNT(*)::int AS total
       FROM   member_theme_signals
       WHERE  member_id   = $1
         AND  detected_at > NOW() - ($2 || ' days')::interval`,
      [memberId, windowDays]
    );

    const themes: ThemeSummary[] = result.rows.map((row) => ({
      theme: row.theme,
      count: Number(row.count),
      first_detected_at: row.first_detected_at,
      latest_detected_at: row.latest_detected_at,
      strongest_resonance: row.strongest_resonance != null ? Number(row.strongest_resonance) : null,
      element: row.element,
      signal_types: {
        active: Number(row.active_count),
        emerging: Number(row.emerging_count),
        blocked: Number(row.blocked_count),
        integrating: Number(row.integrating_count),
      },
    }));

    return NextResponse.json(
      {
        themes,
        total_signals: Number(totalResult.rows[0]?.total ?? 0),
        window_days: windowDays,
        correlationId,
      } satisfies ThemesResponse,
      { headers }
    );
  } catch (error) {
    console.error(`[Themes API] ${correlationId} - Database error:`, error);

    // Distinguish schema mismatch from connection error
    const isSchema =
      error instanceof Error &&
      (error.message.includes('column') || error.message.includes('relation')) &&
      error.message.includes('does not exist');

    if (isSchema) {
      console.error(`[Themes API] ${correlationId} - SCHEMA MISMATCH (migration not applied?)`);
    }

    return NextResponse.json(
      { error: 'Database temporarily unavailable', correlationId },
      { status: 503, headers }
    );
  }
}
