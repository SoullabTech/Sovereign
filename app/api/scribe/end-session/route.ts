// app/api/scribe/end-session/route.ts
// API endpoint to end a session and generate summary

import { NextRequest, NextResponse } from 'next/server';
import {
  generateSessionSummary,
  storeSessionSummary,
} from '@/lib/scribe/sessionSummaryGenerator';
import { getConversationHistory } from '@/lib/sovereign/sessionManager';
import { query } from '@/lib/db/postgres';

export const runtime = 'nodejs';
export const maxDuration = 60; // Allow up to 60 seconds for summary generation

export async function POST(req: NextRequest) {
  try {
    const { sessionId, userId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      );
    }

    console.log(`🔄 Ending session ${sessionId}...`);

    // 1. Load session data
    const conversationHistory = await getConversationHistory(sessionId);

    const result = await query(
      'SELECT * FROM maia_sessions WHERE id = $1',
      [sessionId]
    );

    const session = result.rows[0];

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // 2. Check if session already completed
    if (session.status === 'completed') {
      console.log(`⚠️  Session ${sessionId} already completed`);
      return NextResponse.json({
        success: true,
        sessionId,
        summary: session.session_summary,
        message: 'Session was already completed',
      });
    }

    // 3. Calculate duration
    const startTime = new Date(session.created_at);
    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    // 4. Generate summary
    console.log(`🔄 Generating summary for session ${sessionId}...`);
    const summary = await generateSessionSummary({
      sessionId,
      conversationHistory,
      userId: userId || session.user_id,
      duration,
      startTime,
      endTime,
    });

    // 5. Store summary and mark session as completed
    await storeSessionSummary(sessionId, summary);

    console.log(`✅ Session ${sessionId} ended successfully`);

    // 6. Return summary
    return NextResponse.json({
      success: true,
      sessionId,
      summary,
      duration,
    });
  } catch (error: any) {
    console.error('❌ Error ending session:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to end session',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Allow GET to check session status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId parameter' },
        { status: 400 }
      );
    }

    const result = await query(
      'SELECT id, status, completed_at, session_summary FROM maia_sessions WHERE id = $1',
      [sessionId]
    );

    const session = result.rows[0];

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      sessionId: session.id,
      status: session.status,
      completedAt: session.completed_at,
      hasSummary: !!session.session_summary,
    });
  } catch (error: any) {
    console.error('❌ Error checking session status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check session status' },
      { status: 500 }
    );
  }
}
