export const dynamic = 'error';

/**
 * CASE PATTERNS API
 *
 * GET - Recompute and return pattern summary
 */

import { NextRequest, NextResponse } from 'next/server';
import { CasePatternService } from '@/lib/caseload/CasePatternService';
import { CaseStore } from '@/lib/caseload/CaseStore';

interface RouteParams {
  params: Promise<{ caseId: string }>;
}

/**
 * GET /api/caseload/[caseId]/patterns
 *
 * Recompute pattern summary from notes and return.
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { caseId } = await context.params;
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ error: 'memberId required' }, { status: 400 });
    }

    // Verify case access
    const caseData = await CaseStore.getCase(caseId, memberId);
    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Recompute patterns
    const summary = await CasePatternService.upsert(caseId);

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error('[CASELOAD] Patterns error:', error);
    return NextResponse.json({ error: 'Failed to compute patterns' }, { status: 500 });
  }
}
