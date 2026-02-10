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
 *   1. Write member_sessions row with mode='continuity', summary=NULL (pending)
 *   2. Enqueue a job in session_summary_queue for the worker to generate the summary
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
}

export async function finalizeSession(
  input: FinalizeSessionInput
): Promise<FinalizeSessionResult> {
  const { memberId, sessionId, isSanctuary, endedAt = null } = input;

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

    return { ok: true, sanctuary: true, turnsDeleted };
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

  // 2. Enqueue summary generation job
  await query(
    `
    INSERT INTO session_summary_queue (member_id, session_id, mode_used, ended_at)
    VALUES ($1, $2, 'continuity', $3)
    `,
    [memberId, sessionId, endedAt ? new Date(endedAt) : new Date()]
  );

  console.log(
    `📝 [SessionFinalizer] Continuity session ${sessionId} finalized, summary job queued`
  );

  return { ok: true, sanctuary: false, queued: true };
}
