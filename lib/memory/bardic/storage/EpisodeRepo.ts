/**
 * EpisodeRepo - Postgres-native read access to episodes table
 *
 * Read-only repository for querying existing episodes.
 * The episodes table already exists in Postgres (was Supabase-managed).
 *
 * NOTE: The existing table lacks 'people' and 'updated_at' columns
 * that the Episode type expects. We default these when parsing rows.
 */

import { query } from '@/lib/db/postgres';
import type { Episode } from '../types';

/**
 * Parse database row to Episode type
 *
 * Handles missing columns gracefully with defaults
 */
function rowToEpisode(row: Record<string, unknown>): Episode {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    occurred_at: row.occurred_at ? new Date(row.occurred_at as string) : new Date(0),
    place_cue: (row.place_cue as string) ?? undefined,
    sense_cues: (row.sense_cues as string[]) ?? [],
    people: (row.people as string[]) ?? [], // Not in current schema, default to empty
    affect_valence: (row.affect_valence as number) ?? 0,
    affect_arousal: (row.affect_arousal as number) ?? 0,
    elemental_state: (row.elemental_state as Episode['elemental_state']) ?? {
      fire: 0.5,
      air: 0.5,
      water: 0.5,
      earth: 0.5,
      aether: 0.5,
    },
    scene_stanza: (row.scene_stanza as string) ?? undefined,
    sacred_flag: !!(row.sacred_flag as boolean),
    created_at: row.created_at ? new Date(row.created_at as string) : new Date(0),
    updated_at: row.updated_at
      ? new Date(row.updated_at as string)
      : row.created_at
        ? new Date(row.created_at as string)
        : new Date(0), // Default to created_at if no updated_at
  };
}

export const EpisodeRepo = {
  /**
   * Get a single episode by ID and user
   */
  async getEpisode(
    episodeId: string,
    userId: string
  ): Promise<Episode | null> {
    const res = await query(
      `
      SELECT *
      FROM episodes
      WHERE id = $1 AND user_id = $2
      LIMIT 1
      `,
      [episodeId, userId]
    );

    const row = res.rows?.[0];
    return row ? rowToEpisode(row) : null;
  },

  /**
   * List recent episodes for a user
   *
   * @param opts.userId - User ID to filter by
   * @param opts.limit - Max results (default 50, max 200)
   * @param opts.excludeEpisodeId - Episode ID to exclude from results
   * @param opts.includeSacred - Include sacred episodes (default false)
   * @param opts.sinceDate - Only include episodes after this date
   */
  async listRecentEpisodes(opts: {
    userId: string;
    limit?: number;
    excludeEpisodeId?: string;
    includeSacred?: boolean;
    sinceDate?: Date;
  }): Promise<Episode[]> {
    const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
    const includeSacred = opts.includeSacred ?? false;

    const conditions: string[] = ['user_id = $1'];
    const params: unknown[] = [opts.userId];

    if (!includeSacred) {
      conditions.push('(sacred_flag IS NOT TRUE)');
    }

    if (opts.excludeEpisodeId) {
      params.push(opts.excludeEpisodeId);
      conditions.push(`id <> $${params.length}`);
    }

    if (opts.sinceDate) {
      params.push(opts.sinceDate.toISOString());
      conditions.push(`occurred_at >= $${params.length}`);
    }

    params.push(limit);

    const res = await query(
      `
      SELECT *
      FROM episodes
      WHERE ${conditions.join(' AND ')}
      ORDER BY occurred_at DESC NULLS LAST, created_at DESC
      LIMIT $${params.length}
      `,
      params
    );

    return (res.rows ?? []).map(rowToEpisode);
  },

  /**
   * Check if an episode exists and belongs to user
   */
  async hasEpisode(episodeId: string, userId: string): Promise<boolean> {
    const res = await query(
      `SELECT 1 FROM episodes WHERE id = $1 AND user_id = $2 LIMIT 1`,
      [episodeId, userId]
    );
    return res.rows.length > 0;
  },
};
