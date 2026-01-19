/**
 * POST /api/practice/session/stop
 *
 * Stop an active practice session and trigger processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { stopSession, getSession } from '@/lib/practice/PracticeStore';

export const dynamic = 'force-static';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId required' },
        { status: 400 }
      );
    }

    const session = await stopSession(sessionId);

    if (!session) {
      // Session might already be stopped, fetch current state
      const existing = await getSession(sessionId);
      if (existing) {
        return NextResponse.json({
          success: true,
          session: existing,
          message: 'Session already stopped'
        });
      }
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('[practice/session/stop] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to stop session' },
      { status: 500 }
    );
  }
}
