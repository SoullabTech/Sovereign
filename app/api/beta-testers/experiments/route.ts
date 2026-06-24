export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireCohort, isGateResponse } from '@/lib/beta-testers/requireCohort';

/** GET active experiments (investigations), by sort order. */
export async function GET(request: NextRequest) {
  const gate = await requireCohort(request);
  if (isGateResponse(gate)) return gate;

  try {
    const result = await query(
      `SELECT id, code, title, protocol
         FROM beta_experiments
        WHERE active = true
        ORDER BY sort_order ASC, created_at ASC`
    );
    return NextResponse.json({ experiments: result.rows });
  } catch (error) {
    console.error('[beta-testers/experiments] GET error:', error);
    return NextResponse.json({ experiments: [] });
  }
}
