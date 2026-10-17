/**
 * SESSION FINALIZER
 *
 * The connective tissue between client closing ritual and the memory pipeline.
 *
 * Called when a session ends (closing ritual complete, timer expiry, or inactivity).
 * Determines whether to purge (Sanctuary) or enqueue summary (Continuity).
 *
 * RF01 S0-A2:
 *   - Require an existing authenticated member-owned maia_sessions row first.
 *   - Never adopt a legacy NULL-owner row.
 *   - Hold Sanctuary finalization before any destructive blanket deletion;
 *     per-turn eligibility and deletion policy belong to S1/R1.
 * RF01 R1-A:
 *   - Ordinary non-destructive closure is preserved.
 *   - External summarization/enqueuing and summary-derived recall are held
 *     until separate background-processing and recovery authorities exist.
 *   - The test fixture checks each normal turn's explicit consent and the
 *     absence of protected gestures and deletion scopes before enqueuing.
 */

import { query } from '@/lib/db/postgres';
import { SessionSummaryStore } from '@/lib/memory/stores/SessionSummaryStore';
import { requireExistingOwnedSession } from './memberSessionOwnership';
import { evaluateSummaryEligibility, summaryProviderFixtureEnabled } from '@/lib/sanctuary/sessionSummaryEligibility';

export interface FinalizeSessionInput {
  memberId: string;
  sessionId: string;
  isSanctuary: boolean;
  endedAt?: string | null;
}

export interface FinalizeSessionResult {
  ok: boolean;
  sanctuary: boolean;
  turnsDeleted?: number;
  queued?: boolean;
  sessionCreated?: boolean;
  error?: string;
  summaryHeld?: boolean;
}

/**
 * Mark session as completed in maia_sessions for its already-verified owner.
 * This closes the session lifecycle: active → closing → completed
 */
async function markSessionCompleted(
  sessionId: string,
  memberId: string,
  endedAt: string | null,
): Promise<void> {
  // A refusal/error must not be reported to the member as a completed close.
  const result = await query<{id:string}>(
    "UPDATE maia_sessions SET status='completed', ended_at=$2, "+
    "completed_at=$2, updated_at=NOW() WHERE id=$1 AND member_id=$3 "+
    "AND mode='continuity' RETURNING id",
    [sessionId, endedAt ? new Date(endedAt) : new Date(), memberId],
  );
  if (!result.rows[0]) {
    throw new Error('SESSION_FINALIZATION_NOT_CONFIRMED');
  }
}

export async function finalizeSession(
  input: FinalizeSessionInput
): Promise<FinalizeSessionResult> {
  const { memberId, sessionId, isSanctuary, endedAt = null } = input;

  // Mandatory service-level authorization, independent of the HTTP handler.
  // Legacy ownerless sessions are refused rather than silently adopted.
  await requireExistingOwnedSession(sessionId, memberId);
  const sessionCreated = false;

  // A mutable client end-of-session flag cannot authorize deletion of earlier
  // ordinary turns. S1/R1 must qualify per-turn aftermath first.

  if (isSanctuary) {
    return {
      ok: false,
      sanctuary: true,
      sessionCreated,
      error: 'SANCTUARY_FINALIZATION_AWAITS_TURN_LEVEL_POLICY',
    };
  }

  // ═══════════════════════════════════════════════
  // CONTINUITY PATH: Create record + enqueue summary job
  // ═══════════════════════════════════════════════

  // Preserve non-destructive ordinary closure; do NOT enqueue a transcript
  // for Anthropic without independent background provider permission.
  if (!summaryProviderFixtureEnabled()) {
    await markSessionCompleted(sessionId, memberId, endedAt);
    return { ok: true, sanctuary: false, queued: false, sessionCreated, summaryHeld: true };
  }
  // Fixture-only: proof must cover EVERY turn and all previous privacy
  // gestures, including Sanctuary choices that never wrote a transcript.
  const summaryEligible = await evaluateSummaryEligibility({
    sessionId, memberId, requireClosed: false,
  });
  if (!summaryEligible.ok) {
    await markSessionCompleted(sessionId, memberId, endedAt);
    return { ok: true, sanctuary: false, queued: false, sessionCreated, summaryHeld: true };
  }

  // 1. Create member_sessions row (summary null, pending worker)
  await SessionSummaryStore.writeSessionRecord({
    memberId,
    sessionId,
    isSanctuary: false,
    endedAt,
    summaryText: null,
  });

  // 2. Enqueue summary generation job (if queue table exists)
  // Guard: only enqueue if session has ≥2 turns — prevents "done but empty" jobs.
  // The sweeper will capture the session later if it becomes summarizable.
  let queued = false;
  try {
    const turnCountResult = await query<{ turn_count: string }>(
      `SELECT COUNT(*) AS turn_count FROM conversation_turns WHERE session_id = $1`,
      [sessionId]
    );
    const turnCount = parseInt(turnCountResult.rows[0]?.turn_count ?? '0', 10);

    if (turnCount < 2) {
      console.log(
        `[SessionFinalizer] SKIP_ENQUEUE_TOO_FEW_TURNS: ${sessionId} has ${turnCount} turn(s) — sweeper will handle`
      );
    } else {
      await query(
        `
        INSERT INTO session_summary_queue (member_id, session_id, mode_used, ended_at)
        VALUES ($1, $2, 'continuity', $3)
        ON CONFLICT (session_id) DO NOTHING
        `,
        [memberId, sessionId, endedAt ? new Date(endedAt) : new Date()]
      );
      queued = true;
      console.log(
        `📝 [SessionFinalizer] Continuity session ${sessionId} finalized, summary job queued (${turnCount} turns)`
      );
    }
  } catch (queueErr) {
    // Queue table might not exist yet or FK constraint failed
    // Session is still finalized, just won't get auto-summary
    console.warn(
      `⚠️ [SessionFinalizer] Could not queue summary job for ${sessionId}:`,
      queueErr instanceof Error ? queueErr.message : queueErr
    );
  }

  // 3. Close the session lifecycle: closing → completed
  await markSessionCompleted(sessionId, memberId, endedAt);

  return { ok: true, sanctuary: false, queued, sessionCreated };
}
