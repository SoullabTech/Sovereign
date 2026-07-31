export const dynamic = 'force-dynamic';
// app/api/scribe/end-session/route.ts
// Closes a session: queues summary for continuity, purges turns for sanctuary.
//
// AUTHORIZATION (2026-07-28): the actor is resolved from the verified server
// session. Previously this route took `{ sessionId, userId, sanctuary }` from the
// request body with no session resolution at all: it SELECTed the target
// session's member_id and never compared it to anyone, and the caller-supplied
// `sanctuary` flag could select the destructive branch — an irreversible
// `DELETE FROM conversation_turns` against a caller-named session.
//
// Two rules now hold:
//   1. OWNERSHIP — an owned session may only be ended by the member who owns it.
//   2. PURGE ELIGIBILITY IS NOT CALLER-SUPPLIED — sanctuary is read from the
//      session's persisted mode. The request body can no longer select
//      destructive semantics for a session that was not created as sanctuary.
//
// Anonymous sessions (member_id IS NULL) have no owner, so no caller can
// authorize destroying their turns. They keep the NON-DESTRUCTIVE close path
// only. Letting an authenticated caller adopt an unowned session would be the
// same manufacture-authority-from-possession pattern this lane exists to remove.

import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export const revalidate = false;
export const runtime = 'nodejs';

/** Non-disclosing refusal: absent and not-yours are indistinguishable. */
const notFound = () => NextResponse.json({ error: 'Session not found' }, { status: 404 });

interface SessionRow {
  id: string;
  mode: string | null;
  status: string;
  summary: unknown;
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
    'SELECT id, mode, status, summary, member_id, completed_at FROM maia_sessions WHERE id = $1',
    [sessionId],
  );
  const session = result.rows[0];
  if (!session) return null;
  if (session.member_id !== null && session.member_id !== actorId) return null;
  return session;
}

export async function POST(req: NextRequest) {
  try {
    const actorId = await getMemberIdFromRequest(req);
    if (!actorId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // `userId` and `sanctuary` are deliberately NOT read from the body. Neither
    // establishes identity, and neither may select destructive semantics.
    const { sessionId } = await req.json().catch(() => ({} as Record<string, unknown>));

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const session = await loadPermittedSession(sessionId, actorId);
    if (!session) return notFound();

    if (session.status === 'completed') {
      return NextResponse.json({
        success: true,
        sessionId,
        summary: session.summary,
        message: 'Session was already completed',
      });
    }

    // Purge eligibility comes from persisted state only. An absent mode is NOT
    // an invitation to let the caller choose — it resolves to continuity, the
    // non-destructive branch.
    const isSanctuary = session.mode === 'sanctuary';

    // An unowned session cannot be purged: nobody can authorize destroying it.
    const mayPurge = isSanctuary && session.member_id === actorId;

    if (isSanctuary && !mayPurge) {
      console.warn(
        `[EndSession] sanctuary purge refused for unowned session ${sessionId}`,
      );
      return notFound();
    }

    if (mayPurge) {
      // Deletion and finalization commit together or not at all.
      const purgedCount = await transaction(async (tx) => {
        const purged = await tx.query(
          `DELETE FROM conversation_turns WHERE session_id = $1`,
          [sessionId],
        );
        await tx.query(
          `UPDATE maia_sessions
              SET status = 'completed', completed_at = NOW(), updated_at = NOW()
            WHERE id = $1`,
          [sessionId],
        );
        return purged.rowCount ?? 0;
      });

      console.log(
        `[EndSession] sanctuary close: session=${sessionId} actor=${actorId} turns_purged=${purgedCount}`,
      );

      return NextResponse.json({
        success: true,
        sessionId,
        mode: 'sanctuary',
        message: 'Sanctuary session closed. No summary generated. Turns purged.',
      });
    }

    // CONTINUITY — non-destructive.
    if (!session.mode) {
      await query(
        `UPDATE maia_sessions SET mode = 'continuity', updated_at = NOW() WHERE id = $1`,
        [sessionId],
      );
    }

    const turnCountResult = await query<{ turn_count: string }>(
      `SELECT COUNT(*) AS turn_count FROM conversation_turns WHERE session_id = $1`,
      [sessionId],
    );
    const turnCount = parseInt(turnCountResult.rows[0]?.turn_count ?? '0', 10);

    // Session attribution uses the RESOLVED actor, never a body-supplied id.
    if (turnCount < 2) {
      await query(
        `UPDATE maia_sessions
            SET member_id = COALESCE(member_id, $2), updated_at = NOW()
          WHERE id = $1`,
        [sessionId, actorId],
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

    await query(
      `UPDATE maia_sessions
          SET status = 'closing', member_id = COALESCE(member_id, $2), updated_at = NOW()
        WHERE id = $1`,
      [sessionId, actorId],
    );

    await query(
      `INSERT INTO session_summary_queue (session_id, member_id)
       VALUES ($1, $2)
       ON CONFLICT (session_id) DO NOTHING`,
      [sessionId, session.member_id ?? actorId],
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
