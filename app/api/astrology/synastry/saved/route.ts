/**
 * Saved Synastry API
 *
 * GET /api/astrology/synastry/saved?memberId=<uuid>
 *   List synastry analyses saved to timeline by this member.
 */

import { NextRequest, NextResponse } from 'next/server';
import { listSavedSynastryAnalyses } from '@/lib/astrology/synastry/synastryStore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    if (!memberId) {
      return NextResponse.json({
        success: false,
        error: 'memberId query parameter is required',
      }, { status: 400 });
    }

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
      error: error instanceof Error ? error.message : 'Failed to list saved synastry',
    }, { status: 500 });
  }
}
