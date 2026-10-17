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
 *   - Ordinary finalization retains the existing summary pipeline, which
 *     still needs separate S1 per-turn eligibility qualification.
 *
 * The worker will later:
 *   - Load turns from conversation_turns (they still exist for continuity)
 *   - Generate a structured summary via the sovereign model
 *   - Write the summary to member_sessions.summary
 */

import { query } from '@/lib/db/postgres';
import { SessionSummaryStore } from '@/lib/memory/stores/SessionSummaryStore';
import { requireExistingOwnedSession } from './memberSessionOwnership';

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
}

/**
 * Mark session as completed in maia_sessions for its already-verified owner.
 * This closes the session lifecycle: active → closing → completed
 */
async function markSessionCompleted(sessionId: string, memberId: string, endedAt: string | null): Promise<void> {
  try {
    await query(
      `
      UPDATE maia_sessions
      SET status = 'completed',
          ended_at = $2,
          completed_at = $2
      WHERE id = $1 AND member_id = $3
      `,
      [sessionId, endedAt ? new Date(endedAt) : new Date(), memberId]
    );
    console.log(`✅ [SessionFinalizer] Session ${sessionId} marked as completed`);
  } catch (err) {
    // Non-fatal - session is still finalized even if we can't update status
    console.warn(`⚠️ [SessionFinalizer] Could not mark session ${sessionId} as completed:`, err);
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
