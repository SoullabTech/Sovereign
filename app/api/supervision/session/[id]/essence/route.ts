/**
 * Get Session Essence Summary
 * GET /api/supervision/session/[id]/essence
 *
 * Returns the Fathom-like essence summary for a completed session.
 * Includes: title, coreInsight, themes, goldLines, supervisionFocus, etc.
 */

export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import { getEssenceSummary, runSessionSynthesis } from '@/lib/supervision/SessionSynthesizer';
import { getSession } from '@/lib/supervision/SupervisionStore';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }

  try {
    const { id: sessionId } = await context.params;
    const searchParams = request.nextUrl.searchParams;
    const regenerate = searchParams.get('regenerate') === 'true';

    // Verify session exists
    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Session not found'
      }, { status: 404 });
    }

    // Get existing essence or regenerate if requested
    let essence = await getEssenceSummary(sessionId);

    if (!essence && session.ended_at) {
      // Session ended but no essence - generate it now
      console.log(`📝 [ESSENCE] Generating essence for completed session ${sessionId}`);
      essence = await runSessionSynthesis(sessionId);
    } else if (regenerate && session.ended_at) {
      // Force regenerate requested
      console.log(`🔄 [ESSENCE] Regenerating essence for session ${sessionId}`);
      essence = await runSessionSynthesis(sessionId);
    } else if (!session.ended_at) {
      // Session still active - return partial/preview
      return NextResponse.json({
        success: true,
        sessionId,
        status: 'in_progress',
        message: 'Session still in progress. Essence will be generated when session ends.',
        essence: null
      });
    }

    if (!essence) {
      return NextResponse.json({
        success: true,
        sessionId,
        status: 'no_content',
        message: 'No transcript content available for synthesis.',
        essence: null
      });
    }

    return NextResponse.json({
      success: true,
      sessionId,
      status: 'complete',
      essence: {
        title: essence.title,
        coreInsight: essence.coreInsight,
        themes: essence.themes,
        goldLines: essence.goldLines,
        turningPoints: essence.turningPoints,
        spiralMovement: essence.spiralMovement,
        elementalSignature: essence.elementalSignature,
        nextSteps: essence.nextSteps,
        practices: essence.practices,
        supervisionFocus: essence.supervisionFocus,
        synthesizedAt: essence.synthesizedAt,
        version: essence.version
      }
    });

  } catch (error) {
    console.error('🔴 [ESSENCE] Error getting essence:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to get essence summary'
    }, { status: 500 });
  }
}
