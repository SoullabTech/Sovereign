export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';

/**
 * GET /api/beta-testers/access → { authenticated, inCohort }
 *
 * Used by the field layout to decide whether to render the field or the
 * invite-only notice. UX only — real enforcement is requireCohort() on every
 * data route. inCohort = an active beta_cohort_memberships row.
 */
export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ authenticated: false, inCohort: false });
  }

  try {
    const result = await query(
      `SELECT 1 FROM beta_cohort_memberships
        WHERE member_id = $1 AND status = 'active' LIMIT 1`,
      [memberId]
    );
    return NextResponse.json({ authenticated: true, inCohort: result.rows.length > 0 });
  } catch {
    return NextResponse.json({ authenticated: true, inCohort: false });
  }
}
