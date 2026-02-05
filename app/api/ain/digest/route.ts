// Production requires force-dynamic for database access
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { generateMeaningTraceDigest } from '@/lib/ain/meaningTraceDigest';

/**
 * GET /api/ain/digest
 *
 * Returns the Meaning Trace Digest for Community Commons.
 * This is AIN's collective intelligence output:
 * aggregated patterns of "what helps when" without private content.
 *
 * Query params:
 * - days: number of days to look back (default: 30, max: 90)
 * - minSamples: minimum samples for statistical significance (default: 3)
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication (future: could be public for Commons)
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days');
    const minSamplesParam = searchParams.get('minSamples');

    const days = Math.min(90, Math.max(7, parseInt(daysParam ?? '30', 10) || 30));
    const minSamples = Math.min(10, Math.max(1, parseInt(minSamplesParam ?? '3', 10) || 3));

    console.log(`[AIN Digest] Generating digest for ${days} days, minSamples=${minSamples}`);

    const digest = await generateMeaningTraceDigest(days, minSamples);

    return NextResponse.json(digest);

  } catch (error) {
    console.error('[AIN Digest] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate digest' },
      { status: 500 }
    );
  }
}
