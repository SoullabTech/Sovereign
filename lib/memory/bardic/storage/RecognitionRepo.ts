/**
 * RecognitionRepo - Postgres-native storage for recognition operations
 *
 * Provides read operations for the recognition phase of bardic memory:
 * - Fetch episodes by ID list (for vector search results)
 * - Find episodes with overlapping cues
 * - Expand graph via episode_links
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

export interface LinkedEpisodeRow extends EpisodeRow {
  link_relation: string;
  link_weight: number;
}

export const RecognitionRepo = {
  /**
   * Get episodes by ID list (for vector search results)
   */
  async getEpisodesByIds(
    userId: string,
    episodeIds: string[]
  ): Promise<EpisodeRow[]> {
    if (episodeIds.length === 0) return [];

    const res = await query<EpisodeRow>(
      `
      SELECT * FROM episodes
      WHERE user_id = $1
        AND id = ANY($2::text[])
      `,
      [userId, episodeIds]
    );
    return res.rows;
  },

  /**
   * Find episodes with overlapping sense cues
   * Uses PostgreSQL array overlap operator (&&)
   */
  async getEpisodesByCues(
    userId: string,
    cues: string[]
  ): Promise<EpisodeRow[]> {
    if (cues.length === 0) return [];

    const res = await query<EpisodeRow>(
      `
      SELECT * FROM episodes
      WHERE user_id = $1
        AND sacred_flag = false
        AND sense_cues && $2::text[]
      `,
      [userId, cues]
    );
    return res.rows;
  },

  /**
   * Get linked episodes for graph expansion
   * Joins episode_links with episodes to return full episode data
   */
  async getLinkedEpisodes(
    srcEpisodeIds: string[],
    limit: number = 10
  ): Promise<LinkedEpisodeRow[]> {
    if (srcEpisodeIds.length === 0) return [];

    const res = await query<LinkedEpisodeRow>(
      `
      SELECT
        e.*,
        el.relation as link_relation,
        el.weight as link_weight
      FROM episode_links el
      JOIN episodes e ON e.id = el.dst_episode_id
      WHERE el.src_episode_id = ANY($1::text[])
      ORDER BY el.weight DESC
      LIMIT $2
      `,
      [srcEpisodeIds, limit]
    );
    return res.rows;
  },
};
