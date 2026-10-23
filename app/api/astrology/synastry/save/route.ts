/**
 * Synastry Save API
 *
 * POST /api/astrology/synastry/save
 *   Toggle saved_at for a synastry analysis (Save to Timeline)
 *   Request body:
 *     analysisId: string (uuid)
 *     memberId?: string (legacy assertion only; verified session owns the record)
 *     saved?: boolean (default true)
 */

import { NextRequest, NextResponse } from 'next/server';
import { setSynastryAnalysisSaved } from '@/lib/astrology/synastry/synastryStore';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const sessionMemberId = await getMemberIdFromRequest(request);
    if (!sessionMemberId) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) {
      return NextResponse.json({ success: false, error: 'Origin not allowed' }, { status: 403 });
    }
    const body = await request.json();
    const { analysisId, saved = true } = body;
    if (body.memberId && body.memberId !== sessionMemberId) {
      return NextResponse.json({ success: false, error: 'Member identity mismatch' }, { status: 403 });
    }
    if (typeof saved !== 'boolean') {
      return NextResponse.json({ success: false, error: 'saved must be a boolean' }, { status: 400 });
    }

    if (!analysisId || typeof analysisId !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'analysisId is required',
      }, { status: 400 });
    }

    const result = await setSynastryAnalysisSaved(analysisId, sessionMemberId, saved);

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
      error: 'Failed to save synastry',
    }, { status: 500 });
  }
}
