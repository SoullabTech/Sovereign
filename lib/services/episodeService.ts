/**
 * Episode Service - Postgres Adapter for MAIA-SOVEREIGN
 * Handles Bardic memory episode creation and retrieval
 * Replaces Supabase-based episode capture
 */

import { query } from '@/lib/db/postgres';

export interface CreateEpisodeInput {
  userId: string;
  occurredAt?: string; // ISO timestamp
  placeCue?: string;
  senseCues?: string[];
  affectValence?: number;
  affectArousal?: number;
  elementalState?: Record<string, unknown>;
  sceneStanza?: string;
  sacredFlag?: boolean;
}

export interface Episode {
  id: string;
  user_id: string;
  occurred_at: string;
  place_cue?: string;
  sense_cues?: string[];
  affect_valence?: number;
  affect_arousal?: number;
  elemental_state?: Record<string, unknown>;
  scene_stanza?: string;
  sacred_flag: boolean;
  created_at: string;
}

export class EpisodeService {
  /**
   * Create a new episode (crystallization moment)
   * Returns the episode ID for linking/embedding
   */
  async createEpisode(input: CreateEpisodeInput): Promise<string> {
    const occurredAt = input.occurredAt ?? new Date().toISOString();

    try {
      const result = await query<{ id: string }>(`
        INSERT INTO episodes (
          user_id,
          occurred_at,
          place_cue,
          sense_cues,
          affect_valence,
          affect_arousal,
          elemental_state,
          scene_stanza,
          sacred_flag
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [
        input.userId,
        occurredAt,
        input.placeCue ?? null,
        input.senseCues ? JSON.stringify(input.senseCues) : null,
        typeof input.affectValence === 'number' ? input.affectValence : null,
        typeof input.affectArousal === 'number' ? input.affectArousal : null,
        input.elementalState ? JSON.stringify(input.elementalState) : null,
        input.sceneStanza ?? null,
        input.sacredFlag ?? false,
      ]);

      const id = result.rows[0]?.id;
      if (!id) {
        throw new Error('[EpisodeService] Failed to create episode (no id returned)');
      }

      console.log(`✅ [Episode] Created: ${id}`);
      return id;
    } catch (error) {
      console.error('❌ [Episode] Error creating episode:', error);
      throw error;
    }
  }

  /**
   * Get episode by ID
   */
  async getEpisode(episodeId: string): Promise<Episode | null> {
    try {
      const result = await query<Episode>(`
        SELECT * FROM episodes WHERE id = $1
      `, [episodeId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        ...row,
        sense_cues: typeof row.sense_cues === 'string'
          ? JSON.parse(row.sense_cues)
          : row.sense_cues,
        elemental_state: typeof row.elemental_state === 'string'
          ? JSON.parse(row.elemental_state)
          : row.elemental_state,
      };
    } catch (error) {
      console.error('❌ [Episode] Error fetching episode:', error);
      return null;
    }
  }

  /**
   * Get recent episodes for a user
   */
  async getRecentEpisodes(userId: string, limit: number = 20): Promise<Episode[]> {
    try {
      const result = await query<Episode>(`
        SELECT * FROM episodes
        WHERE user_id = $1
        ORDER BY occurred_at DESC
        LIMIT $2
      `, [userId, limit]);

      return result.rows.map(row => ({
        ...row,
        sense_cues: typeof row.sense_cues === 'string'
          ? JSON.parse(row.sense_cues)
          : row.sense_cues,
        elemental_state: typeof row.elemental_state === 'string'
          ? JSON.parse(row.elemental_state)
          : row.elemental_state,
      }));
    } catch (error) {
      console.error('❌ [Episode] Error fetching recent episodes:', error);
      return [];
    }
  }
}

// Export singleton instance
export const episodeService = new EpisodeService();
