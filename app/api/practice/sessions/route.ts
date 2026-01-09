/**
 * GET /api/practice/sessions
 *
 * List practice sessions for a practitioner
 */

import { NextRequest, NextResponse } from 'next/server';
import { listSessions, getSession, updateSession } from '@/lib/practice/PracticeStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const practitionerId = searchParams.get('practitionerId') || undefined;
    const clientAlias = searchParams.get('clientAlias') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const sessionId = searchParams.get('sessionId');

    // Single session lookup
    if (sessionId) {
      const session = await getSession(sessionId);
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Session not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, session });
    }

    // List sessions
    const sessions = await listSessions({
      practitionerId,
      clientAlias,
      limit,
      offset
    });

    return NextResponse.json({
      success: true,
      sessions,
      pagination: { limit, offset, count: sessions.length }
    });
  } catch (error) {
    console.error('[practice/sessions] GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list sessions' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, ...updates } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId required' },
        { status: 400 }
      );
    }

    const session = await updateSession(sessionId, updates);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('[practice/sessions] PATCH Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
