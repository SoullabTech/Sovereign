export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireCohort, isGateResponse } from '@/lib/beta-testers/requireCohort';

/** GET active challenges (invitations to bring a real question), by sort order. */
export async function GET(request: NextRequest) {
  const gate = await requireCohort(request);
  if (isGateResponse(gate)) return gate;

  try {
    const result = await query(
      `SELECT id, title, prompt, element, sort_order
         FROM beta_challenges
        WHERE active = true
        ORDER BY sort_order ASC, created_at ASC`
    );
    return NextResponse.json({ challenges: result.rows });
  } catch (error) {
    console.error('[beta-testers/challenges] GET error:', error);
    return NextResponse.json({ challenges: [] });
  }
}
