/**
 * Breakthrough Store
 *
 * Retrieves and stores breakthrough moments / key insights.
 *
 * ── P3f — EVERY READ PATH IS ADJUDICATED, NOT JUST THE ONE WITH A COMPOSER ──
 *
 * `breakthrough_moments` is machine-detected and machine-extracted: a
 * significance threshold plus a heuristic decide that something was a
 * breakthrough, and a machine writes the wording. R25 settled its epistemic
 * status as unendorsed system inference, EXCLUDED from canonical cognition.
 *
 * Until P3f this store handed out the raw `insight` string, and
 * `lib/memory/MemoryOrchestrator.ts` composed it into a live prompt as a
 * `RECENT BREAKTHROUGHS` block. R25 was never wrong — it gated a different
 * reader and said so — but the REPRESENTATION kept participating through this
 * one.
 *
 * All THREE read methods now return the certified union, including the two that
 * currently have no caller. A gate that covers only the reader someone happened
 * to notice is the defect being repaired, so "no caller today" is not a reason
 * to leave a raw insight reachable tomorrow.
 *
 * The writes are untouched: exclusion governs PARTICIPATION, not storage. The
 * member can still see every one of these — P1c disposed the representation
 * EXPORT — and being able to see an inference is not MAIA being entitled to
 * think with it.
 */

import { query } from '../../db/postgres';
import {
  adjudicateBreakthroughRow,
  type BreakthroughSnapshot,
} from '../breakthroughParticipation';

export type { BreakthroughSnapshot };

export interface BreakthroughMoment {
  id?: string;
  userId: string;
  insight: string;
  element?: string;  // fire, water, earth, air, aether
  integrated: boolean;
  relatedThemes?: string[];
  conversationId?: string;
  createdAt: string;
}

export const BreakthroughStore = {
  /**
   * Get recent breakthroughs for a user
   */
  async getRecentBreakthroughs(userId: string, limit: number = 5): Promise<BreakthroughSnapshot[]> {
    const result = await query(
      `
      SELECT
        id,
        insight,
        element,
        integrated,
        related_themes,
        timestamp
      FROM breakthrough_moments
      WHERE user_id = $1
      ORDER BY timestamp DESC
      LIMIT $2
      `,
      [userId, limit]
    );

    return (result.rows ?? []).map(adjudicateBreakthroughRow);
  },

  /**
   * Get unintegrated breakthroughs (insights that haven't been fully processed)
   */
  async getUnintegratedBreakthroughs(
    userId: string,
    limit: number = 3
  ): Promise<BreakthroughSnapshot[]> {
    const result = await query(
      `
      SELECT
        id,
        insight,
        element,
        integrated,
        related_themes,
        timestamp
      FROM breakthrough_moments
      WHERE user_id = $1 AND integrated = FALSE
      ORDER BY timestamp DESC
      LIMIT $2
      `,
      [userId, limit]
    );

    return (result.rows ?? []).map(adjudicateBreakthroughRow);
  },

  /**
   * Store a new breakthrough
   */
  async addBreakthrough(breakthrough: Omit<BreakthroughMoment, 'id' | 'createdAt'>): Promise<void> {
    await query(
      `
      INSERT INTO breakthrough_moments (
        user_id,
        insight,
        element,
        integrated,
        related_themes,
        conversation_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        breakthrough.userId,
        breakthrough.insight,
        breakthrough.element ?? null,
        breakthrough.integrated,
        breakthrough.relatedThemes ?? [],
        breakthrough.conversationId ?? null,
      ]
    );
  },

  /**
   * Mark a breakthrough as integrated
   */
  async markIntegrated(breakthroughId: string): Promise<void> {
    await query(
      `
      UPDATE breakthrough_moments
      SET integrated = TRUE, updated_at = NOW()
      WHERE id = $1
      `,
      [breakthroughId]
    );
  },

  /**
   * Get breakthroughs by element
   */
  async getByElement(
    userId: string,
    element: string,
    limit: number = 5
  ): Promise<BreakthroughSnapshot[]> {
    const result = await query(
      `
      SELECT
        id,
        insight,
        integrated,
        related_themes,
        timestamp
      FROM breakthrough_moments
      WHERE user_id = $1 AND element = $2
      ORDER BY timestamp DESC
      LIMIT $3
      `,
      [userId, element, limit]
    );

    return (result.rows ?? []).map(adjudicateBreakthroughRow);
  },
};
