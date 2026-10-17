export const dynamic = 'force-dynamic';
// RF01 R1-A: this route closes MAIA sessions (not practitioner Scribe
// transcripts). A session-level Sanctuary mode NEVER authorizes deleting every
// turn: mixed encounters can include earlier ordinary writing. This route
// performs non-destructive ordinary closes without queuing external summaries.
// No member content is read or returned as legacy summary status.

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export const revalidate = false;
export const runtime = 'nodejs';

/** Non-disclosing refusal: absent and not-yours are indistinguishable. */
const notFound = () => NextResponse.json({ error: 'Session not found' }, { status: 404 });

interface SessionRow {
  id: string;
  mode: string | null;
  status: string;
  member_id: string | null;
  completed_at: string | null;
}

/**
 * Load a session the actor is permitted to act on.
 * Returns null when it does not exist OR is owned by someone else — the caller
 * cannot tell which, so this is not a session-existence oracle.
 */
async function loadPermittedSession(
  sessionId: string,
  actorId: string,
): Promise<SessionRow | null> {
  const result = await query<SessionRow>(
    'SELECT id, mode, status, member_id, completed_at FROM maia_sessions WHERE id = $1 AND member_id=$2',
    [sessionId, actorId],
  );
  const session = result.rows[0];
  if (!session) return null;
  if (session.member_id !== actorId) return null;
  return session;
}

export async function POST(req: NextRequest) {
  try {
    const actorId = await getMemberIdFromRequest(req);
    if (!actorId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const sessionId = (body as Record<string, unknown>)?.sessionId;
    if (typeof sessionId !== 'string' || !sessionId.trim() || sessionId.length > 200) {
      return NextResponse.json({ error: 'Missing or invalid sessionId' }, { status: 400 });
    }
    const session = await loadPermittedSession(sessionId, actorId);
    if (!session) return notFound();
    if (session.status === 'completed') {
      return NextResponse.json({
        success: true, sessionId, status: 'completed',
        summary: null, hasSummary: false, summaryHeld: true,
        message: 'Conversation already closed; background summarization is held.',
      });
    }
    if (session.mode !== 'continuity') {
      // Sanctuary/unknown session state cannot authorize deleting or
      // reclassifying previously authored normal turns. R1-B owns deletion.
      return NextResponse.json({
        success: false,
        error: 'PER_TURN_DELETION_POLICY_NOT_QUALIFIED',
      }, { status: 409 });
    }
    // Ordinary close remains supported, but it does not enqueue a new
    // external summary, change ownership or return historical summary data.
    const updated = await query<{ id: string }>(
      "UPDATE maia_sessions SET status='completed',completed_at=NOW(),updated_at=NOW() " +
      "WHERE id=$1 AND member_id=$2 AND mode='continuity' " +
      "AND status IN ('active','closing') RETURNING id",
      [sessionId, actorId],
    );
    if (!updated.rows[0]) return notFound();
    return NextResponse.json({
      success: true,sessionId,mode:'continuity',status:'completed',
      summary: null,hasSummary: false,summaryHeld: true,skippedQueue: true,
      message: 'Conversation closed. Automatic summaries are on hold.',
    });
  } catch {
    return NextResponse.json({
      error: 'SESSION_CLOSE_UNAVAILABLE',
    }, { status: 503 });
  }
}

// Check session summary status (polling endpoint).
// Same ownership rule: this returns session mode, status and SUMMARY CONTENT,
// so it disclosed another member's session material when unguarded.
export async function GET(req: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }

  try {
    const actorId = await getMemberIdFromRequest(req);
    if (!actorId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId parameter' }, { status: 400 });
    }

    const session = await loadPermittedSession(sessionId, actorId);
    if (!session) return notFound();

    return NextResponse.json({
      sessionId: session.id,
      status: session.status,
      mode: session.mode,
      completedAt: session.completed_at,
      hasSummary: false,
      summary: null,
      summaryHeld: true,
    });
  } catch (error: any) {
    console.error('❌ Error checking session status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check session status' },
      { status: 500 }
    );
  }
}
