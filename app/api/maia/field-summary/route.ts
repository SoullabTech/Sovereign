export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { getMaiaFieldSummary } from '@/lib/field/getMaiaFieldSummary';

/**
 * GET /api/maia/field-summary
 *
 * Returns the aggregated field summary for the authenticated member.
 * Thin wrapper around getMaiaFieldSummary — the same function used
 * by the server-rendered /maia page.
 */
export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const summary = await getMaiaFieldSummary(session.memberId);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('[field-summary] Error building field summary:', {
      memberId: session.memberId,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to build field summary' },
      { status: 500 }
    );
  }
}
