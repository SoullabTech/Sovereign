export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireCohort, isGateResponse } from '@/lib/beta-testers/requireCohort';

/** GET the active research questions ("What We Are Learning"). */
export async function GET(request: NextRequest) {
  const gate = await requireCohort(request);
  if (isGateResponse(gate)) return gate;

  try {
    const result = await query(
      `SELECT id, question, detail
         FROM beta_questions
        WHERE active = true
        ORDER BY sort_order ASC, created_at ASC`
    );
    return NextResponse.json({ questions: result.rows });
  } catch (error) {
    console.error('[beta-testers/questions] GET error:', error);
    return NextResponse.json({ questions: [] });
  }
}
