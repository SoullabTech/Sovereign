export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * POST /api/scribe/assemble-transcript
 *
 * Triggers transcript assembly for a supervision session.
 * Fetches raw Whisper chunks, cleans phantom prefixes, removes overlaps,
 * groups into speaker turns, and persists to supervision_assembled_turns.
 *
 * Body: { sessionId: string }  — supervision_sessions.id
 *
 * Returns assembly metadata (turnCount, rawSegmentCount, phantomRemoved).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';
import { runAssembly } from '@/lib/supervision/transcriptAssembler';

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'sessionId is required', code: 'MISSING_SESSION_ID' },
        { status: 400 }
      );
    }

    console.log(`[Assembler] Manual assembly triggered for session ${sessionId} by member ${memberId}`);

    const result = await runAssembly(sessionId);

    console.log(`[Assembler] Assembly complete: ${result.turnCount} turns, ${result.rawSegmentCount} raw segments`);

    return NextResponse.json({
      success: true,
      sessionId,
      ...result,
    });
  } catch (error: any) {
    console.error('[Assembler] Assembly route error:', error);
    return NextResponse.json(
      { error: error.message || 'Assembly failed', code: 'ASSEMBLY_FAILED' },
      { status: 500 }
    );
  }
}
