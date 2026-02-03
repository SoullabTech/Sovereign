/**
 * COMMS SPINE: Safety Dashboard API
 *
 * GET /api/comms/safety
 *   Get all unacknowledged safety flags for the practitioner
 *
 * AUTHORIZATION: Session-based.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { getSafetyDashboard } from '@/lib/comms/SafetyService';

/**
 * GET /api/comms/safety
 *
 * Returns:
 * - flags: Array of unacknowledged safety flags with context
 * - counts: Breakdown by severity
 */
export async function GET(request: NextRequest) {
  try {
    const practitionerId = await requireMemberId();

    const dashboard = await getSafetyDashboard(practitionerId);

    return NextResponse.json(dashboard);
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[Comms Safety API] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch safety dashboard' },
      { status: 500 }
    );
  }
}
