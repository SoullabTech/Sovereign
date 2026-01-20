export const dynamic = 'force-dynamic';
// backend: app/api/admin/opus-pulse/facet-heatmap/route.ts

import { NextRequest, NextResponse } from 'next/server';

export const revalidate = false;
import { getPool } from '@/lib/database/postgres';

// Skip during static export (Capacitor builds)

export async function GET(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  // Handle static generation gracefully
  let searchParams: URLSearchParams;
  try {
    searchParams = new URL(req.url).searchParams;
  } catch {
    // During static export, return empty data
    return NextResponse.json({ windowDays: 30, cells: [] });
  }

  const pool = getPool();

  try {
    const daysParam = searchParams.get('days');
    const days = daysParam ? Math.max(1, Math.min(365, Number(daysParam))) : 30;

    const result = await pool.query(
      `
      SELECT
        COALESCE(facet, 'UNKNOWN')  AS facet,
        COALESCE(element, 'UNKNOWN') AS element,
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE is_gold = true)::int AS gold,
        COUNT(*) FILTER (WHERE warnings > 0 AND rupture_detected = false)::int AS edge,
        COUNT(*) FILTER (WHERE rupture_detected = true)::int AS rupture
      FROM opus_axiom_turns
      WHERE timestamp >= now() - ($1::int || ' days')::interval
      GROUP BY facet, element
      ORDER BY facet, element
      `,
      [days]
    );

    return NextResponse.json({
      windowDays: days,
      cells: result.rows.map((row) => ({
        facet: row.facet as string,
        element: row.element as string,
        total: row.total as number,
        gold: row.gold as number,
        edge: row.edge as number,
        rupture: row.rupture as number,
      })),
    });
  } catch (err) {
    console.error('❌ [OpusPulse] Failed to compute facet heatmap', err);
    return NextResponse.json(
      { error: 'Failed to compute facet heatmap' },
      { status: 500 }
    );
  }
}
