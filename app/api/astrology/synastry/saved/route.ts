/**
 * Saved Synastry API
 *
 * GET /api/astrology/synastry/saved?limit=3
 *   Lists only the authenticated member's own saved synastry analyses.
 */

import { NextRequest, NextResponse } from 'next/server';
import { listSavedSynastryAnalyses } from '@/lib/astrology/synastry/synastryStore';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(request.url);
    // Never choose a private record owner from client parameters. The session
    // determines ownership independently of the access-matrix outer gate.
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    // Reject (rather than silently substitute for) a contradictory legacy
    // identity claim, preventing accidental account mixing on old clients.
    const claimedMemberId = searchParams.get('memberId');
    if (claimedMemberId && claimedMemberId !== memberId) {
      return NextResponse.json({ success: false, error: 'Member identity mismatch' }, { status: 403 });
    }

    const rawLimit = Number(searchParams.get('limit') ?? '20');
    const rawOffset = Number(searchParams.get('offset') ?? '0');
    const limit = Number.isSafeInteger(rawLimit) ? Math.max(1, Math.min(50, rawLimit)) : 20;
    const offset = Number.isSafeInteger(rawOffset) ? Math.max(0, rawOffset) : 0;

    const rows = await listSavedSynastryAnalyses(memberId, { limit, offset });

    // Extract summary info from each row
    const items = rows.map((row) => {
      const result = row.result as Record<string, unknown> | null;
      const synastry = result?.synastry as Record<string, unknown> | undefined;
      const chartA = result?.chartA as Record<string, unknown> | undefined;
      const chartB = result?.chartB as Record<string, unknown> | undefined;

      return {
        analysisId: row.id,
        createdAt: row.created_at,
        savedAt: row.saved_at,
        chartA: chartA ? {
          sunSign: chartA.sunSign,
          moonSign: chartA.moonSign,
        } : null,
        chartB: chartB ? {
          sunSign: chartB.sunSign,
          moonSign: chartB.moonSign,
        } : null,
        scores: synastry?.scores ?? null,
      };
    });

    return NextResponse.json({
      success: true,
      items,
      count: items.length,
    });

  } catch (error) {
    console.error('[Saved Synastry API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to list saved synastry',
    }, { status: 500 });
  }
}
