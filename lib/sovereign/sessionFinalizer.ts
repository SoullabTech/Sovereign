/**
 * SESSION FINALIZER
 *
 * The connective tissue between client closing ritual and the memory pipeline.
 *
 * Called when a session ends (closing ritual complete, timer expiry, or inactivity).
 * Determines whether to purge (Sanctuary) or enqueue summary (Continuity).
 *
 * Sanctuary path:
 *   1. Delete all conversation_turns for this session (proof of deletion)
 *   2. Write member_sessions row with mode='sanctuary', summary=NULL
 *
 * Continuity path:
 *   1. Ensure maia_sessions row exists (self-healing if client didn't register)
 *   2. Create member_sessions row with mode='continuity', summary=NULL (pending)
 *   3. Enqueue a job in session_summary_queue for the worker to generate the summary
 *
 * The worker will later:
 *   - Load turns from conversation_turns (they still exist for continuity)
 *   - Generate a structured summary via the sovereign model
 *   - Write the summary to member_sessions.summary
 */

import { query } from '@/lib/db/postgres';
import { TurnsStore } from '@/lib/memory/stores/TurnsStore';
import { SessionSummaryStore } from '@/lib/memory/stores/SessionSummaryStore';

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
}

/**
 * Ensure maia_sessions row exists (self-healing).
 * Called before any operation that has FK dependency on maia_sessions.
 * Idempotent: ON CONFLICT DO UPDATE just touches last_activity_at.
 */
async function ensureMaiaSessionExists(
  sessionId: string,
  memberId: string,
  mode: 'continuity' | 'sanctuary'
): Promise<boolean> {
  try {
    const result = await query(
      `
      INSERT INTO maia_sessions (id, member_id, mode, privacy_mode, status, started_at, last_activity_at)
      VALUES ($1, $2, $3, $4, 'closing', NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        last_activity_at = NOW(),
        status = 'closing',
        member_id = COALESCE(maia_sessions.member_id, EXCLUDED.member_id)
      RETURNING (xmax = 0) AS was_inserted
      `,
      [sessionId, memberId || null, mode, mode === 'sanctuary' ? 'sanctuary' : 'standard']
    );

    const wasInserted = result.rows[0]?.was_inserted === true;
    if (wasInserted) {
      console.log(`🔧 [SessionFinalizer] Self-healed: created maia_sessions row for ${sessionId}`);
    }
    return wasInserted;
  } catch (err) {
    // Table might not exist yet - let caller handle
    console.error('[SessionFinalizer] Failed to ensure session exists:', err);
    throw err;
  }
}

/**
 * Mark session as completed in maia_sessions.
 * This closes the session lifecycle: active → closing → completed
 */
async function markSessionCompleted(sessionId: string, endedAt: string | null): Promise<void> {
  try {
    await query(
      `
      UPDATE maia_sessions
      SET status = 'completed',
          ended_at = $2,
          completed_at = $2
      WHERE id = $1
      `,
      [sessionId, endedAt ? new Date(endedAt) : new Date()]
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

  // Self-healing: ensure maia_sessions row exists before FK operations
  const mode = isSanctuary ? 'sanctuary' : 'continuity';
  let sessionCreated = false;

  try {
    sessionCreated = await ensureMaiaSessionExists(sessionId, memberId, mode);
  } catch {
    // If maia_sessions table doesn't exist, continue anyway
    // The member_sessions write will still work
    console.warn('[SessionFinalizer] Could not ensure maia_session (table may not exist)');
  }

  if (isSanctuary) {
    // ═══════════════════════════════════════════════
    // SANCTUARY PATH: Purge turns, store metadata only
    // ═══════════════════════════════════════════════

    // 1. Delete all conversation_turns for this session
    const turnsDeleted = await TurnsStore.deleteBySessionId(sessionId);

    console.log(
      `🛡️ [SessionFinalizer] Sanctuary purge: ${turnsDeleted} turns deleted for session ${sessionId}`
    );

    // 2. Store metadata row (summary forced to null by SessionSummaryStore)
    await SessionSummaryStore.writeSessionRecord({
      memberId,
      sessionId,
      isSanctuary: true,
      endedAt,
      summaryText: null,
    });

    // 3. Close the session lifecycle: closing → completed
    await markSessionCompleted(sessionId, endedAt);

    return { ok: true, sanctuary: true, turnsDeleted, sessionCreated };
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
  await markSessionCompleted(sessionId, endedAt);

  return { ok: true, sanctuary: false, queued, sessionCreated };
}
