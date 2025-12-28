/**
 * Breakthrough Store
 *
 * Retrieves and stores breakthrough moments / key insights.
 * These are the "aha" moments worth remembering across sessions.
 */

import { query } from '../../db/postgres';

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
  async getRecentBreakthroughs(
    userId: string,
    limit: number = 5
  ): Promise<Array<{ insight: string; element?: string; integrated: boolean; createdAt: string }>> {
    const result = await query<{ insight: string; element?: string; integrated: boolean; createdAt: string }>(
      `
      SELECT
        insight,
        element,
        integrated,
        timestamp as "createdAt"
      FROM breakthrough_moments
      WHERE user_id = $1
      ORDER BY timestamp DESC
      LIMIT $2
      `,
      [userId, limit]
    );

    return result.rows ?? [];
  },

  /**
   * Get unintegrated breakthroughs (insights that haven't been fully processed)
   */
  async getUnintegratedBreakthroughs(
    userId: string,
    limit: number = 3
  ): Promise<Array<{ insight: string; element?: string; createdAt: string }>> {
    const result = await query<{ insight: string; element?: string; createdAt: string }>(
      `
      SELECT
        insight,
        element,
        timestamp as "createdAt"
      FROM breakthrough_moments
      WHERE user_id = $1 AND integrated = FALSE
      ORDER BY timestamp DESC
      LIMIT $2
      `,
      [userId, limit]
    );

    return result.rows ?? [];
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
  ): Promise<Array<{ insight: string; integrated: boolean; createdAt: string }>> {
    const result = await query<{ insight: string; integrated: boolean; createdAt: string }>(
      `
      SELECT
        insight,
        integrated,
        timestamp as "createdAt"
      FROM breakthrough_moments
      WHERE user_id = $1 AND element = $2
      ORDER BY timestamp DESC
      LIMIT $3
      `,
      [userId, element, limit]
    );

    return result.rows ?? [];
  },
};
