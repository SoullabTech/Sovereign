/**
 * Session Summary Store
 *
 * Writes session metadata + summaries to member_sessions.
 * Retrieves recent summaries for context priming (CORE/DEEP paths).
 *
 * Sanctuary invariant: if isSanctuary === true, summaryText MUST be null.
 * This is enforced here as defense-in-depth (caller also enforces).
 *
 * Note: member_sessions.member_id is UUID FK to members table.
 * Guest users (without member record) skip this table - their sessions
 * are tracked only in maia_sessions.
 */

import { query } from '../../db/postgres';
import { memberRef } from '../../privacy/memberRef';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const SessionSummaryStore = {
  /**
   * Create or update a member_sessions row for a finalized session.
   *
   * Uses the unique partial index on session_id (from migration 20260210200001).
   * If a row with this session_id already exists, update ended_at/mode/summary.
   * If not, create a new row.
   *
   * Sanctuary: summaryText is forced to null regardless of what caller sends.
   *
   * Note: Skips write if memberId is not a valid UUID (guest users).
   * Guest sessions are tracked in maia_sessions only.
   */
  async writeSessionRecord(params: {
    memberId: string;
    sessionId: string;
    isSanctuary: boolean;
    endedAt?: string | null;
    summaryText?: string | null;
  }) {
    const {
      memberId,
      sessionId,
      isSanctuary,
      endedAt = null,
      summaryText = null,
    } = params;

    // Skip if memberId is not a valid UUID (guest user)
    if (!memberId || !UUID_REGEX.test(memberId)) {
      console.log(`[SessionSummaryStore] Skipping member_sessions write for non-member: ${memberId?.slice(0, 8) || 'null'}`);
      return;
    }

    const mode = isSanctuary ? 'sanctuary' : 'continuity';
    // Defense-in-depth: sanctuary sessions NEVER store summary content
    const safeSummary = isSanctuary ? null : summaryText;

    try {
      await query(
        `
        INSERT INTO member_sessions (member_id, session_id, ended_at, mode, summary)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (session_id) WHERE session_id IS NOT NULL
        DO UPDATE SET
          ended_at = COALESCE(EXCLUDED.ended_at, member_sessions.ended_at),
          mode = EXCLUDED.mode,
          summary = EXCLUDED.summary
        `,
        [
          memberId,
          sessionId,
          endedAt ? new Date(endedAt) : new Date(),
          mode,
          safeSummary,
        ]
      );
    } catch (err) {
      // Handle FK violation gracefully (member doesn't exist)
      if (err instanceof Error && err.message.includes('violates foreign key')) {
        console.warn(`[SessionSummaryStore] Member ${memberRef(memberId)} not found in members table, skipping`);
        return;
      }
      throw err;
    }
  },

  /**
   * Write a generated summary to an existing member_sessions row.
   * Called by the worker after generating a summary from turns.
   */
  async writeSummary(memberId: string, sessionId: string, summaryText: string) {
    await query(
      `
      UPDATE member_sessions
      SET summary = $3
      WHERE member_id = $1
        AND session_id = $2
        AND mode = 'continuity'
      `,
      [memberId, sessionId, summaryText]
    );
  },

  /**
   * Get recent session summaries for a member.
   *
   * Returns continuity sessions with non-null summaries, ordered by most recent.
   * Used by CORE/DEEP context priming. FAST path should NOT call this.
   *
   * Sanctuary rows have summary = NULL and are excluded by the WHERE clause.
   */
  async getRecentSummaries(
    memberId: string,
    limit: number = 5
  ): Promise<Array<{
    session_id: string;
    started_at: string;
    ended_at: string;
    mode: string;
    summary: string;
  }>> {
    const result = await query(
      `
      SELECT session_id, started_at, ended_at, mode, summary
      FROM member_sessions
      WHERE member_id = $1
        AND mode = 'continuity'
        AND summary IS NOT NULL
      ORDER BY started_at DESC
      LIMIT $2
      `,
      [memberId, Math.min(limit, 10)]
    );

    return result.rows ?? [];
  },
};
