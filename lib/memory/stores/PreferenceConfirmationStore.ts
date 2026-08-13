/**
 * Preference Confirmation Store
 *
 * Tracks when users confirm, update, or expire their preferences.
 * Essential for handling preference drift - people change, and MAIA
 * needs to know when stored preferences may be stale.
 */

import { query } from '../../db/postgres';

export type ConfirmationAction = 'confirmed' | 'updated' | 'expired' | 'restored';
export type ConfirmationTrigger = 'manual' | 'prompt' | 'drift_detected' | 'session_start';

export interface PreferenceConfirmation {
  id: string;
  userId: string;
  memoryId: string;
  action: ConfirmationAction;
  previousContent?: string;
  newContent?: string;
  triggeredBy: ConfirmationTrigger;
  createdAt: string;
}

export interface RecordConfirmationInput {
  userId: string;
  memoryId: string;
  action: ConfirmationAction;
  previousContent?: string;
  newContent?: string;
  triggeredBy?: ConfirmationTrigger;
}

/**
 * Outcome of a confirmation attempt. `standingChanged` is false when the row was
 * withdrawn by the member and the confirmation was therefore refused.
 */
export interface RecordConfirmationResult {
  confirmationId: string;
  standingChanged: boolean;
  refusedReason?: 'withdrawn_by_member';
}

export const PreferenceConfirmationStore = {
  /**
   * Record a preference confirmation event
   */
  /**
   * PH2-001 item 5: the return distinguishes "the audit event was written" from
   * "the record's standing changed". A confirmation against a member-withdrawn row
   * is refused by the predicate below; the attempt is still a real event and is still
   * audited, but the caller must not infer that standing was restored. Silence about
   * failure is a defect when the caller would reasonably infer success.
   */
  async record(input: RecordConfirmationInput): Promise<RecordConfirmationResult> {
    let standingChanged = true;
    let refusedReason: 'withdrawn_by_member' | undefined;
    const result = await query<{ id: string }>(
      `
      INSERT INTO preference_confirmations (
        user_id, memory_id, action,
        previous_content, new_content, triggered_by
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
      `,
      [
        input.userId,
        input.memoryId,
        input.action,
        input.previousContent ?? null,
        input.newContent ?? null,
        input.triggeredBy ?? 'manual',
      ]
    );

    // Also update the memory's last_confirmed_at
    if (input.action === 'confirmed' || input.action === 'updated') {
      const applied = await query(
        `
        UPDATE developmental_memories
        SET
          last_confirmed_at = NOW(),
          confirmed_by_user = true,
          valid_to = NULL
        WHERE id = $1
          -- PH2-001 item 5: a confirmation may refresh a live record. It may NOT
          -- resurrect a withdrawn one. No staleness-expiry mechanism exists anywhere
          -- in the system, so every valid_to = NOW() is member-originated: restoring
          -- an expired row is necessarily restoring a member-yielded understanding.
          -- Correction is not temporary disagreement. New evidence may create a new
          -- perception; it may not resurrect the old assertion.
          AND (valid_to IS NULL OR valid_to > NOW())
        `,
        [input.memoryId]
      );
      if ((applied.rowCount ?? 0) === 0) {
        standingChanged = false;
        refusedReason = 'withdrawn_by_member';
      }
    } else if (input.action === 'expired') {
      await query(
        `
        UPDATE developmental_memories
        SET valid_to = NOW()
        WHERE id = $1
        `,
        [input.memoryId]
      );
    } else if (input.action === 'restored') {
      await query(
        `
        UPDATE developmental_memories
        SET
          valid_to = NULL,
          last_confirmed_at = NOW()
        WHERE id = $1
        `,
        [input.memoryId]
      );
    }

    return {
      confirmationId: result.rows[0]?.id ?? '',
      standingChanged,
      ...(refusedReason ? { refusedReason } : {}),
    };
  },

  /**
   * Get confirmation history for a specific memory
   */
  async getForMemory(memoryId: string): Promise<PreferenceConfirmation[]> {
    const result = await query<PreferenceConfirmation>(
      `
      SELECT
        id,
        user_id as "userId",
        memory_id as "memoryId",
        action,
        previous_content as "previousContent",
        new_content as "newContent",
        triggered_by as "triggeredBy",
        created_at as "createdAt"
      FROM preference_confirmations
      WHERE memory_id = $1
      ORDER BY created_at DESC
      `,
      [memoryId]
    );

    return result.rows ?? [];
  },

  /**
   * Get all confirmations for a user (for analytics)
   */
  async getForUser(userId: string, limit: number = 100): Promise<PreferenceConfirmation[]> {
    const result = await query<PreferenceConfirmation>(
      `
      SELECT
        id,
        user_id as "userId",
        memory_id as "memoryId",
        action,
        previous_content as "previousContent",
        new_content as "newContent",
        triggered_by as "triggeredBy",
        created_at as "createdAt"
      FROM preference_confirmations
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
      `,
      [userId, limit]
    );

    return result.rows ?? [];
  },

  /**
   * Get preferences that need confirmation (stale preferences)
   * Returns memories that haven't been confirmed in X days
   */
  async getStalePreferences(
    userId: string,
    staleDays: number = 90
  ): Promise<Array<{
    id: string;
    memoryType: string;
    content: string;
    daysSinceConfirmed: number;
    originalSignificance: number;
    effectiveConfidence: number;
  }>> {
    const result = await query<{
      id: string;
      memoryType: string;
      content: string;
      daysSinceConfirmed: string;
      originalSignificance: string;
      effectiveConfidence: string;
    }>(
      `
      SELECT
        dm.id,
        dm.memory_type as "memoryType",
        COALESCE(dm.content_text, dm.trigger_event::text) as content,
        EXTRACT(DAY FROM NOW() - COALESCE(dm.last_confirmed_at, dm.formed_at))::int as "daysSinceConfirmed",
        dm.significance as "originalSignificance",
        calculate_decayed_confidence(
          dm.significance,
          dm.memory_type,
          dm.last_confirmed_at,
          dm.formed_at
        ) as "effectiveConfidence"
      FROM developmental_memories dm
      WHERE dm.user_id = $1
        AND dm.memory_type IN ('effective_practice', 'pattern', 'correction')
        AND (dm.valid_to IS NULL OR dm.valid_to > NOW())
        AND COALESCE(dm.last_confirmed_at, dm.formed_at) < NOW() - make_interval(days => $2)
      ORDER BY "effectiveConfidence" ASC, "daysSinceConfirmed" DESC
      LIMIT 10
      `,
      [userId, staleDays]
    );

    return (result.rows ?? []).map(r => ({
      id: r.id,
      memoryType: r.memoryType,
      content: r.content,
      daysSinceConfirmed: parseInt(r.daysSinceConfirmed, 10),
      originalSignificance: parseFloat(r.originalSignificance),
      effectiveConfidence: parseFloat(r.effectiveConfidence),
    }));
  },

  /**
   * Check if a memory needs confirmation prompt
   * Returns true if memory is stale enough to warrant asking "is this still true?"
   */
  async needsConfirmation(
    memoryId: string,
    thresholdDays: number = 60
  ): Promise<boolean> {
    const result = await query<{ needsConfirmation: boolean }>(
      `
      SELECT
        COALESCE(last_confirmed_at, formed_at) < NOW() - make_interval(days => $2)
        AND confirmed_by_user = true
        AS "needsConfirmation"
      FROM developmental_memories
      WHERE id = $1
      `,
      [memoryId, thresholdDays]
    );

    return result.rows[0]?.needsConfirmation ?? false;
  },

  /**
   * Get count of confirmations by action type (for analytics)
   */
  async getActionCounts(userId: string): Promise<Record<ConfirmationAction, number>> {
    const result = await query<{ action: ConfirmationAction; count: string }>(
      `
      SELECT action, COUNT(*) as count
      FROM preference_confirmations
      WHERE user_id = $1
      GROUP BY action
      `,
      [userId]
    );

    const counts: Record<ConfirmationAction, number> = {
      confirmed: 0,
      updated: 0,
      expired: 0,
      restored: 0,
    };

    for (const row of result.rows ?? []) {
      counts[row.action] = parseInt(row.count, 10);
    }

    return counts;
  },
};
