/**
 * ReentryRepo - Postgres-native storage for re-entry operations
 *
 * Provides operations for the ritual re-entry phase of bardic memory:
 * - Fetch episode for re-entry
 * - Get strongest cue for reconstitution
 * - Mark/unmark episodes as sacred
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

export interface CueRow {
  id: string;
  user_id: string;
  type: string;
  media_ref?: string | null;
  user_words?: string | null;
  potency: number;
  created_at: string;
}

export const ReentryRepo = {
  /**
   * Get episode by ID for re-entry
   */
  async getEpisode(userId: string, episodeId: string): Promise<EpisodeRow | null> {
    const res = await query<EpisodeRow>(
      `
      SELECT * FROM episodes
      WHERE id = $1 AND user_id = $2
      `,
      [episodeId, userId]
    );
    return res.rows[0] ?? null;
  },

  /**
   * Get strongest cue for an episode
   * Joins episode_cues with cues table, ordered by potency
   */
  async getStrongestCue(episodeId: string): Promise<CueRow | null> {
    const res = await query<CueRow>(
      `
      SELECT
        c.id,
        c.user_id,
        c.type,
        c.media_ref,
        c.user_words,
        ec.potency,
        c.created_at
      FROM episode_cues ec
      JOIN cues c ON c.id = ec.cue_id
      WHERE ec.episode_id = $1
      ORDER BY ec.potency DESC
      LIMIT 1
      `,
      [episodeId]
    );
    return res.rows[0] ?? null;
  },

  /**
   * Mark episode as sacred
   * Also deletes associated vectors and links (respect the sacred)
   */
  async markSacred(userId: string, episodeId: string): Promise<boolean> {
    try {
      // Update episode sacred_flag
      await query(
        `
        UPDATE episodes
        SET sacred_flag = true, updated_at = now()
        WHERE id = $1 AND user_id = $2
        `,
        [episodeId, userId]
      );

      // Delete embeddings
      await query(
        `DELETE FROM episode_vectors WHERE episode_id = $1`,
        [episodeId]
      );

      // Delete links (both directions)
      await query(
        `DELETE FROM episode_links WHERE src_episode_id = $1 OR dst_episode_id = $1`,
        [episodeId]
      );

      return true;
    } catch (error) {
      console.error('[ReentryRepo] Error marking sacred:', error);
      return false;
    }
  },

  /**
   * Unmark episode as sacred
   */
  async unmarkSacred(userId: string, episodeId: string): Promise<boolean> {
    try {
      await query(
        `
        UPDATE episodes
        SET sacred_flag = false, updated_at = now()
        WHERE id = $1 AND user_id = $2
        `,
        [episodeId, userId]
      );
      return true;
    } catch (error) {
      console.error('[ReentryRepo] Error unmarking sacred:', error);
      return false;
    }
  },
};
