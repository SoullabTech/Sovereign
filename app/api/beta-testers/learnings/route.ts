export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireCohort, isGateResponse } from '@/lib/beta-testers/requireCohort';

/**
 * GET shared learnings visible to the cohort. Two curated sources, unioned:
 *  - observations a tester left that an admin explicitly approved (shared_approved)
 *  - admin-authored / synthesized learnings published for the cohort
 * Nothing appears here automatically — curation first. Observations are shown
 * without attribution.
 */
export async function GET(request: NextRequest) {
  const gate = await requireCohort(request);
  if (isGateResponse(gate)) return gate;

  try {
    const result = await query(
      `SELECT id, kind, title, body, lens, at FROM (
         SELECT id, 'observation' AS kind, NULL::text AS title,
                observation_text AS body, elemental_lens AS lens, created_at AS at
           FROM beta_observations
          WHERE visibility = 'shared_approved'
         UNION ALL
         SELECT id, 'authored' AS kind, title,
                body, NULL::text AS lens, COALESCE(published_at, created_at) AS at
           FROM beta_shared_learnings
          WHERE visibility = 'cohort' AND published_at IS NOT NULL
       ) merged
       ORDER BY at DESC`
    );
    return NextResponse.json({ learnings: result.rows });
  } catch (error) {
    console.error('[beta-testers/learnings] GET error:', error);
    return NextResponse.json({ learnings: [] });
  }
}
