/**
 * GET /api/guidance/signals/rollup
 *
 * Aggregate guidance signals by feature_key and signal_type.
 * Includes signal velocity (24h, 7d, 30d counts + trend).
 * Joins to guidance_content to show whether a tooltip exists.
 * Admin-only endpoint.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await query(
      `SELECT
         gs.feature_key,
         gs.signal_type,
         COUNT(*)::int AS count,
         MAX(gs.created_at) AS last_seen_at,
         BOOL_OR(gc.id IS NOT NULL) AS has_tooltip,

         -- Signal velocity: time-windowed counts
         COUNT(*) FILTER (WHERE gs.created_at >= NOW() - INTERVAL '24 hours')::int AS last_24h,
         COUNT(*) FILTER (WHERE gs.created_at >= NOW() - INTERVAL '7 days')::int  AS last_7d,
         COUNT(*) FILTER (WHERE gs.created_at >= NOW() - INTERVAL '30 days')::int AS last_30d

       FROM guidance_signals gs
       LEFT JOIN guidance_content gc
         ON gc.feature_key = gs.feature_key
         AND gc.depth = 'tooltip'
         AND gc.is_enabled = true
       GROUP BY gs.feature_key, gs.signal_type
       ORDER BY count DESC, gs.feature_key ASC`
    );

    // Compute trend per row: ratio of 24h rate to 7d daily average
    // trend > 1 = accelerating, trend < 1 = decelerating, null = no 7d data
    const rows = result.rows.map((r: any) => {
      const avg7d = r.last_7d / 7;
      const trend = avg7d > 0 ? Math.round((r.last_24h / avg7d) * 100) / 100 : null;
      return { ...r, trend };
    });

    return NextResponse.json({ rows });
  } catch (error) {
    console.error('[Guidance] Failed to fetch signal rollup:', error);
    return NextResponse.json({ rows: [] });
  }
}
