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
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest, isValidUUID } from '@/lib/scribe/scribeAuth';
import { logAudit } from '@/lib/security/auditLog';
import { runAssembly } from '@/lib/supervision/transcriptAssembler';

// ─── AUTHORIZATION (security patch, 2026-07-17, sibling of PR #622) ─────────
// Before this patch, any authenticated member could trigger assembly for ANY
// supervision session id, and the response's turnCount/rawSegmentCount leaked
// whether a session existed and how large it was. supervision_sessions has no
// member_id column; ownership is derived through the established link
// supervision_sessions.metadata->>'scribeSessionId' → scribe_sessions.member_id
// (the same link sessionReviewMode uses). External calls are now owner-only;
// a session that does not exist, is owned by someone else, or has no scribe
// link returns an identical non-revealing 404. Denials and grants are
// audit-logged (identifiers only — never transcript contents).
//
// The Docker-internal bypass is retained deliberately: port 3000 is not
// published to the host, and the normal assembly path
// (/api/supervision/session/stop → runAssembly) plus admin re-runs originate
// inside the compose network without member identity.

const NOT_FOUND_BODY = { error: 'Not found', code: 'SESSION_NOT_FOUND' } as const;

/**
 * Is this request coming from within the Docker-internal network?
 * Port 3000 is not published to the host, so requests without x-forwarded-for
 * that come from localhost are safe to treat as internal admin calls.
 */
function isDockerInternalRequest(request: NextRequest): boolean {
  const forwarded = request.headers.get('x-forwarded-for');
  const host = request.headers.get('host') ?? '';
  return !forwarded && (host.startsWith('localhost') || host.startsWith('127.'));
}

/**
 * Does this member own the supervision session (via its linked scribe session)?
 * One query; zero rows for nonexistent / unowned / unlinked alike, so the
 * caller cannot distinguish those cases. The join compares text-to-text so a
 * malformed metadata value can never raise a cast error.
 */
async function verifySupervisionSessionOwnership(
  supervisionSessionId: string,
  memberId: string
): Promise<boolean> {
  try {
    const result = await query(
      `SELECT ss.id
       FROM supervision_sessions ss
       JOIN scribe_sessions sc ON sc.id::text = ss.metadata->>'scribeSessionId'
       WHERE ss.id = $1 AND sc.member_id = $2`,
      [supervisionSessionId, memberId]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('[Assembler] Ownership check failed:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'sessionId is required', code: 'MISSING_SESSION_ID' },
        { status: 400 }
      );
    }

    // Allow unauthenticated calls from within Docker (port 3000 is internal-only)
    const isInternal = isDockerInternalRequest(request);

    if (!isInternal) {
      const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      const audit = (userId: string, result: 'success' | 'failure', reason?: string) =>
        logAudit({
          timestamp: new Date(),
          userId,
          action: 'access',
          resource: 'supervision_transcript',
          resourceId: sessionId,
          ipAddress,
          userAgent,
          result,
          ...(reason ? { reason } : {}),
          metadata: { endpoint: 'assemble-transcript:POST' },
        }).catch(() => {}); // audit failure must not mask the denial

      const memberId = await getMemberIdFromRequest(request);
      if (!memberId) {
        await audit('anonymous', 'failure', 'unauthenticated');
        return NextResponse.json(
          { error: 'Authentication required', code: 'AUTH_REQUIRED' },
          { status: 401 }
        );
      }

      // Malformed ids are denied before any DB work, same shape as unauthorized.
      if (!isValidUUID(sessionId)) {
        await audit(memberId, 'failure', 'malformed_session_id');
        return NextResponse.json(NOT_FOUND_BODY, { status: 404 });
      }

      const owned = await verifySupervisionSessionOwnership(sessionId, memberId);
      if (!owned) {
        await audit(memberId, 'failure', 'not_owner_or_nonexistent');
        return NextResponse.json(NOT_FOUND_BODY, { status: 404 });
      }

      await audit(memberId, 'success');
    }

    console.log(`[Assembler] Assembly triggered for session ${sessionId} (internal=${isInternal})`);

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
