/**
 * Helper Fund Stats API
 *
 * GET /api/pricing/helper-fund/stats
 *
 * Returns public statistics about the Helper Fund.
 */

import { NextResponse } from 'next/server';
import { getHelperFundStats } from '@/lib/pricing';

export async function GET() {
  try {
    const stats = await getHelperFundStats();

    return NextResponse.json({
      activeContributors: stats.activeContributors,
      activeScholarships: stats.activeScholarships,
      pendingApplications: stats.pendingApplications,
      monthlyContributionsCents: stats.monthlyContributionsCents,
    });
  } catch (error) {
    console.error('[helper-fund/stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
