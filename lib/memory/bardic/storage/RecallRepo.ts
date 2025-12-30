/**
 * RecallRepo - Postgres-native storage for recall operations
 *
 * Loads episodes and their artifacts (microacts, insights, transcripts)
 * for the "third R" of bardic memory: Recognition → Reentry → Recall
 */

import { query } from '@/lib/db/postgres';

export interface EpisodeRow {
  id: string;
  user_id: string;
  occurred_at: string;
  place_cue?: string | null;
  sense_cues?: unknown;
  people?: unknown;
  affect_valence?: number | null;
  affect_arousal?: number | null;
  elemental_state?: unknown;
  scene_stanza?: string | null;
  sacred_flag?: boolean | null;
  created_at: string;
  updated_at?: string | null;
}

export interface MicroactRow {
  id: string;
  user_id: string;
  description: string;
  context?: string | null;
  element_bias?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string | null;
}

export const RecallRepo = {
  /**
   * Get an episode by ID
   */
  async getEpisode(userId: string, episodeId: string): Promise<EpisodeRow | null> {
    const res = await query<EpisodeRow>(
      `SELECT * FROM episodes WHERE id = $1 AND user_id = $2`,
      [episodeId, userId]
    );
    return res.rows[0] ?? null;
  },

  /**
   * Get microacts linked to an episode
   *
   * Queries microact_logs to find which microacts were suggested/completed
   * for this episode, then fetches the microact details.
   */
  async getMicroactsForEpisode(
    episodeId: string,
    maxCount: number = 5
  ): Promise<MicroactRow[]> {
    const res = await query<MicroactRow>(
      `
      SELECT DISTINCT m.*
      FROM bardic_microacts m
      JOIN bardic_microact_logs l ON l.microact_id = m.id
      WHERE l.episode_id = $1
      ORDER BY l.timestamp DESC
      LIMIT $2
      `,
      [episodeId, maxCount]
    );
    return res.rows;
  },

  /**
   * Get insights for an episode
   *
   * Future: Query an insights table
   * For now: Extract from episode metadata or return empty
   */
  async getInsightsForEpisode(
    _episodeId: string,
    _maxCount: number = 5
  ): Promise<string[]> {
    // TODO: Implement when insights extraction is in place
    return [];
  },

  /**
   * Get transcript for an episode
   *
   * Future: Query a conversation_logs or transcripts table
   * For now: Return undefined
   */
  async getTranscriptForEpisode(_episodeId: string): Promise<string | undefined> {
    // TODO: Implement when conversation logging is in place
    return undefined;
  },

  /**
   * Create a microact
   */
  async createMicroact(params: {
    userId: string;
    description: string;
    context?: string;
    elementBias?: string;
    metadata?: Record<string, unknown>;
  }): Promise<MicroactRow> {
    const res = await query<MicroactRow>(
      `
      INSERT INTO bardic_microacts (user_id, description, context, element_bias, metadata)
      VALUES ($1, $2, $3, $4, $5::jsonb)
      RETURNING *
      `,
      [
        params.userId,
        params.description,
        params.context ?? null,
        params.elementBias ?? null,
        JSON.stringify(params.metadata ?? {}),
      ]
    );
    return res.rows[0];
  },

  /**
   * Log a microact event (suggested, started, completed, skipped)
   */
  async logMicroactEvent(params: {
    userId: string;
    microactId: string;
    episodeId?: string;
    eventType: string;
    notes?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await query(
      `
      INSERT INTO bardic_microact_logs (user_id, microact_id, episode_id, event_type, notes, metadata)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb)
      `,
      [
        params.userId,
        params.microactId,
        params.episodeId ?? null,
        params.eventType,
        params.notes ?? null,
        JSON.stringify(params.metadata ?? {}),
      ]
    );
  },

  /**
   * Get user's microacts
   */
  async getUserMicroacts(userId: string, limit: number = 20): Promise<MicroactRow[]> {
    const res = await query<MicroactRow>(
      `
      SELECT * FROM bardic_microacts
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
      `,
      [userId, limit]
    );
    return res.rows;
  },
};
