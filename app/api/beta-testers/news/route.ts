export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireCohort, isGateResponse } from '@/lib/beta-testers/requireCohort';

/** GET published news for the cohort, newest first. */
export async function GET(request: NextRequest) {
  const gate = await requireCohort(request);
  if (isGateResponse(gate)) return gate;

  try {
    const result = await query(
      `SELECT id, title, body, published_at
         FROM beta_news
        WHERE published = true
        ORDER BY published_at DESC NULLS LAST, created_at DESC`
    );
    return NextResponse.json({ news: result.rows });
  } catch (error) {
    console.error('[beta-testers/news] GET error:', error);
    return NextResponse.json({ news: [] });
  }
}
