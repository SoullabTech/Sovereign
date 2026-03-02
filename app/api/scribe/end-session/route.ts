export const dynamic = 'force-dynamic';
// app/api/scribe/end-session/route.ts
// Closes a session: queues summary for continuity, purges turns for sanctuary.

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const revalidate = false;
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, userId, sanctuary } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      );
    }

    console.log(`🔄 Ending session ${sessionId}...`);

    // 1. Load session
    const result = await query<{
      id: string;
      mode: string;
      status: string;
      summary: any;
      member_id: string | null;
    }>(
      'SELECT id, mode, status, summary, member_id FROM maia_sessions WHERE id = $1',
      [sessionId]
    );

    const session = result.rows[0];

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // 2. Already completed?
    if (session.status === 'completed') {
      console.log(`⚠️  Session ${sessionId} already completed`);
      return NextResponse.json({
        success: true,
        sessionId,
        summary: session.summary,
        message: 'Session was already completed',
      });
    }

    // Determine mode: trust DB first, then request body, then default
    const mode = session.mode || (sanctuary ? 'sanctuary' : 'continuity');

    // Update session mode if it wasn't set at creation time
    if (!session.mode || session.mode === 'continuity') {
      await query(
        `UPDATE maia_sessions SET mode = $1, updated_at = NOW() WHERE id = $2`,
        [mode, sessionId]
      );
    }

    // 3. SANCTUARY: purge turns, mark completed, no summary
    if (mode === 'sanctuary') {
      console.log(`🔒 Session ${sessionId} is sanctuary — purging turns`);

      // Delete conversation turns for this session
      const purged = await query(
        `DELETE FROM conversation_turns WHERE session_id = $1`,
        [sessionId]
      );

      // Mark completed with no summary
      await query(
        `UPDATE maia_sessions
         SET status = 'completed', completed_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [sessionId]
      );

      console.log(`🔒 Session ${sessionId} closed — ${purged.rowCount ?? 0} turns purged`);

      return NextResponse.json({
        success: true,
        sessionId,
        mode: 'sanctuary',
        message: 'Sanctuary session closed. No summary generated. Turns purged.',
      });
    }

    // 4. CONTINUITY: queue for background summarization

    // Guard: count turns BEFORE changing session state.
    // Only transition to 'closing' if we're actually going to enqueue.
    // If < 2 turns: leave session as 'active' so the sweeper can pick it up
    // once turns arrive. Setting 'closing' here would make it invisible to
    // the sweeper (which requires status='active').
    const turnCountResult = await query<{ turn_count: string }>(
      `SELECT COUNT(*) AS turn_count FROM conversation_turns WHERE session_id = $1`,
      [sessionId]
    );
    const turnCount = parseInt(turnCountResult.rows[0]?.turn_count ?? '0', 10);

    if (turnCount < 2) {
      // Keep member_id if missing, but do NOT change status.
      // Sweeper will close + enqueue once the session is stale with >= 2 turns.
      await query(
        `UPDATE maia_sessions
         SET member_id = COALESCE(member_id, $2), updated_at = NOW()
         WHERE id = $1`,
        [sessionId, userId || null]
      );
      console.log(
        `[EndSession] SKIP_ENQUEUE_TOO_FEW_TURNS: session ${sessionId} has ${turnCount} turn(s) — leaving active for sweeper`
      );
      return NextResponse.json({
        success: true,
        sessionId,
        mode: 'continuity',
        message: 'Session has too few turns for summary — sweeper will handle when content arrives.',
        status: 'active',
        skippedQueue: true,
      });
    }

    // Enough turns — transition to closing and enqueue.
    console.log(`📝 Session ${sessionId} queued for summary (${turnCount} turns)`);
    await query(
      `UPDATE maia_sessions
       SET status = 'closing', member_id = COALESCE(member_id, $2), updated_at = NOW()
       WHERE id = $1`,
      [sessionId, userId || null]
    );

    // Enqueue for the summary worker
    await query(
      `INSERT INTO session_summary_queue (session_id, member_id)
       VALUES ($1, $2)
       ON CONFLICT (session_id) DO NOTHING`,
      [sessionId, userId || session.member_id || null]
    );

    return NextResponse.json({
      success: true,
      sessionId,
      mode: 'continuity',
      message: 'Session closing. Summary will be generated in the background.',
      status: 'closing',
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

// Check session summary status (polling endpoint)
export async function GET(req: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }

  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId parameter' },
        { status: 400 }
      );
    }

    const result = await query<{
      id: string;
      status: string;
      mode: string;
      completed_at: string | null;
      summary: any;
    }>(
      'SELECT id, status, mode, completed_at, summary FROM maia_sessions WHERE id = $1',
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
      mode: session.mode,
      completedAt: session.completed_at,
      hasSummary: !!session.summary,
      summary: session.status === 'completed' ? session.summary : undefined,
    });
  } catch (error: any) {
    console.error('❌ Error checking session status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check session status' },
      { status: 500 }
    );
  }
}
