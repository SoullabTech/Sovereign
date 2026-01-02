// backend: app/api/admin/opus-pulse/summary/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database/postgres';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const pool = getPool();

  try {
    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get('days');
    const days = daysParam ? Math.max(1, Math.min(365, Number(daysParam))) : 30;

    const result = await pool.query(
      `
      SELECT
        COUNT(*)::int                                  AS total,
        COUNT(*) FILTER (WHERE is_gold = true)::int    AS gold,
        COUNT(*) FILTER (WHERE warnings > 0 AND rupture_detected = false)::int AS edge,
        COUNT(*) FILTER (WHERE rupture_detected = true)::int AS rupture
      FROM opus_axiom_turns
      WHERE timestamp >= now() - ($1::int || ' days')::interval
      `,
      [days]
    );

    const row = result.rows[0] ?? { total: 0, gold: 0, edge: 0, rupture: 0 };
    const total = row.total || 0;

    const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

    const payload = {
      windowDays: days,
      counts: {
        total,
        gold: row.gold,
        edge: row.edge,
        rupture: row.rupture,
      },
      percentages: {
        goldPercent: pct(row.gold),
        edgePercent: pct(row.edge),
        rupturePercent: pct(row.rupture),
      },
    };

    return NextResponse.json(payload);
  } catch (err) {
    console.error('❌ [OpusPulse] Failed to compute summary', err);
    return NextResponse.json(
      { error: 'Failed to compute Opus Pulse summary' },
      { status: 500 }
    );
  }
}
