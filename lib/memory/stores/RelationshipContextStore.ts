/**
 * Relationship Context Store
 *
 * Retrieves and updates the relationship essence for a user.
 * This is the "who is this person + what matters to them" summary.
 */

import { query } from '../../db/postgres';

export interface RelationshipContext {
  userId: string;
  preferredName?: string;
  conversationHistorySummary?: string;
  recurringThemes?: string[];
  consciousnessJourneyStage?: string;
  totalSessions?: number;
  relationshipDepth?: number;
  elementalAffinities?: Record<string, number>;
}

export const RelationshipContextStore = {
  /**
   * Get relationship context for a user
   */
  async get(userId: string): Promise<RelationshipContext | null> {
    const result = await query<RelationshipContext>(
      `
      SELECT
        user_id as "userId",
        preferred_name as "preferredName",
        conversation_history_summary as "conversationHistorySummary",
        recurring_themes as "recurringThemes",
        consciousness_journey_stage as "consciousnessJourneyStage",
        total_sessions as "totalSessions",
        relationship_depth as "relationshipDepth",
        elemental_affinities as "elementalAffinities"
      FROM user_relationship_context
      WHERE user_id = $1
      LIMIT 1
      `,
      [userId]
    );

    return result.rows[0] ?? null;
  },

  /**
   * Upsert relationship context
   */
  async upsert(userId: string, updates: Partial<RelationshipContext>): Promise<void> {
    await query(
      `
      INSERT INTO user_relationship_context (
        user_id,
        preferred_name,
        conversation_history_summary,
        recurring_themes,
        consciousness_journey_stage,
        total_sessions,
        relationship_depth,
        elemental_affinities,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        preferred_name = COALESCE(EXCLUDED.preferred_name, user_relationship_context.preferred_name),
        conversation_history_summary = COALESCE(EXCLUDED.conversation_history_summary, user_relationship_context.conversation_history_summary),
        recurring_themes = COALESCE(EXCLUDED.recurring_themes, user_relationship_context.recurring_themes),
        consciousness_journey_stage = COALESCE(EXCLUDED.consciousness_journey_stage, user_relationship_context.consciousness_journey_stage),
        total_sessions = COALESCE(EXCLUDED.total_sessions, user_relationship_context.total_sessions),
        relationship_depth = COALESCE(EXCLUDED.relationship_depth, user_relationship_context.relationship_depth),
        elemental_affinities = COALESCE(EXCLUDED.elemental_affinities, user_relationship_context.elemental_affinities),
        updated_at = NOW()
      `,
      [
        userId,
        updates.preferredName ?? null,
        updates.conversationHistorySummary ?? null,
        updates.recurringThemes ?? null,
        updates.consciousnessJourneyStage ?? null,
        updates.totalSessions ?? null,
        updates.relationshipDepth ?? null,
        updates.elementalAffinities ? JSON.stringify(updates.elementalAffinities) : null,
      ]
    );
  },

  /**
   * Increment session count
   */
  async incrementSessionCount(userId: string): Promise<void> {
    await query(
      `
      UPDATE user_relationship_context
      SET
        total_sessions = COALESCE(total_sessions, 0) + 1,
        updated_at = NOW()
      WHERE user_id = $1
      `,
      [userId]
    );
  },
};
