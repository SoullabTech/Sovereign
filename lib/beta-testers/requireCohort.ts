import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';

export interface CohortIdentity {
  memberId: string;
}

/**
 * Gate for the Beta Learning Field — invite-only, beta cohort only.
 *
 * Cohort membership = a row in beta_cohort_memberships with status='active'.
 * This is the authoritative enforcement: cohort is not expressible in the
 * tier/role model of config/accessMatrix.ts, so it lives here (the same pattern
 * other surfaces use to gate beyond tier/role). Fails closed.
 *
 * Returns the identity on success, or a NextResponse (401/403) the caller must
 * return immediately.
 */
export async function requireCohort(
  request: NextRequest
): Promise<CohortIdentity | NextResponse> {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await query(
      `SELECT 1 FROM beta_cohort_memberships
        WHERE member_id = $1 AND status = 'active' LIMIT 1`,
      [memberId]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not in beta cohort', inviteOnly: true }, { status: 403 });
    }
  } catch {
    // Fail closed — if we cannot confirm active membership, deny.
    return NextResponse.json({ error: 'Cohort check failed' }, { status: 403 });
  }

  return { memberId };
}

export function isGateResponse(x: CohortIdentity | NextResponse): x is NextResponse {
  return x instanceof NextResponse;
}
