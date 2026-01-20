export const dynamic = 'force-dynamic';
// backend: app/api/admin/opus-pulse/turns/route.ts

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
    return NextResponse.json({ items: [] });
  }

  const pool = getPool();

  try {
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.max(1, Math.min(200, Number(limitParam))) : 50;

    const result = await pool.query(
      `
      SELECT
        id,
        timestamp,
        session_id,
        user_id,
        facet,
        element,
        is_gold,
        warnings,
        violations,
        rupture_detected,
        axioms
      FROM opus_axiom_turns
      ORDER BY timestamp DESC
      LIMIT $1::int
      `,
      [limit]
    );

    const items = result.rows.map((row) => {
      const axioms = (row.axioms || {}) as any;

      return {
        id: row.id as number,
        timestamp: row.timestamp as string,
        sessionId: row.session_id as string | null,
        userId: row.user_id as string | null,
        facet: (row.facet as string | null) ?? null,
        element: (row.element as string | null) ?? null,
        isGold: row.is_gold as boolean,
        warnings: row.warnings as number,
        violations: row.violations as number,
        ruptureDetected: row.rupture_detected as boolean,
        // For now, just a short note preview from axioms.notes
        userPreview: '',
        maiaPreview: (axioms?.notes && axioms.notes[0]) || '',
      };
    });

    return NextResponse.json({ items });
  } catch (err) {
    console.error('❌ [OpusPulse] Failed to fetch recent turns', err);
    return NextResponse.json(
      { error: 'Failed to fetch recent Opus turns' },
      { status: 500 }
    );
  }
}
