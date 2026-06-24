export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireCohort, isGateResponse } from '@/lib/beta-testers/requireCohort';

/** GET all roadmap items, by sort order. Status uses the honest liveness ladder. */
export async function GET(request: NextRequest) {
  const gate = await requireCohort(request);
  if (isGateResponse(gate)) return gate;

  try {
    const result = await query(
      `SELECT id, title, description, status, category, sort_order
         FROM beta_roadmap_items
        ORDER BY sort_order ASC, updated_at DESC`
    );
    return NextResponse.json({ items: result.rows });
  } catch (error) {
    console.error('[beta-testers/roadmap] GET error:', error);
    return NextResponse.json({ items: [] });
  }
}
