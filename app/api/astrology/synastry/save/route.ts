/**
 * Synastry Save API
 *
 * POST /api/astrology/synastry/save
 *   Toggle saved_at for a synastry analysis (Save to Timeline)
 *   Request body:
 *     analysisId: string (uuid)
 *     memberId: string
 *     saved?: boolean (default true)
 */

import { NextRequest, NextResponse } from 'next/server';
import { setSynastryAnalysisSaved } from '@/lib/astrology/synastry/synastryStore';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { analysisId, memberId, saved = true } = body;

    if (!analysisId || typeof analysisId !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'analysisId is required',
      }, { status: 400 });
    }

    if (!memberId || typeof memberId !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'memberId is required',
      }, { status: 400 });
    }

    const result = await setSynastryAnalysisSaved(analysisId, memberId, saved);

    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'Analysis not found or not owned by this member',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      analysisId: result.id,
      savedAt: result.saved_at,
    });

  } catch (error) {
    console.error('[Synastry Save API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save synastry',
    }, { status: 500 });
  }
}
