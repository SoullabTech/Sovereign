/**
 * LinkingRepo - Postgres-native storage for episode links
 *
 * Stores graph edges between episodes:
 * - echoes: similar affect/pattern
 * - contrasts: opposite/shadow
 * - fulfills: resolution/completion
 * - co_occurs: temporal proximity
 *
 * This builds the mycelial memory graph automatically.
 */

import { query } from '@/lib/db/postgres';
import type { EpisodeRelation } from '../types';

export interface CreateLinkInput {
  srcEpisodeId: string;
  dstEpisodeId: string;
  relation: EpisodeRelation;
  weight: number;
  reasoning?: string;
}

export interface StoredLink {
  id: string;
  srcEpisodeId: string;
  dstEpisodeId: string;
  relation: EpisodeRelation;
  weight: number;
  reasoning?: string | null;
  createdAt: string;
}

/**
 * Parse database row to StoredLink
 */
function rowToLink(row: Record<string, unknown>): StoredLink {
  return {
    id: row.id as string,
    srcEpisodeId: row.src_episode_id as string,
    dstEpisodeId: row.dst_episode_id as string,
    relation: row.relation as EpisodeRelation,
    weight: row.weight as number,
    reasoning: row.reasoning as string | null,
    createdAt: row.created_at as string,
  };
}

export const LinkingRepo = {
  /**
   * Create a link between two episodes
   *
   * Uses ON CONFLICT DO NOTHING to silently skip duplicates
   * (same src → dst with same relation already exists)
   */
  async createLink(input: CreateLinkInput): Promise<boolean> {
    const weight = Math.max(0, Math.min(1, input.weight));

    const res = await query(
      `
      INSERT INTO episode_links (src_episode_id, dst_episode_id, relation, weight, reasoning)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (src_episode_id, dst_episode_id, relation) DO NOTHING
      RETURNING id
      `,
      [
        input.srcEpisodeId,
        input.dstEpisodeId,
        input.relation,
        weight,
        input.reasoning ?? null,
      ]
    );

    // Returns true if a row was inserted (not a duplicate)
    return (res.rowCount ?? 0) > 0;
  },

  /**
   * Get all links originating from an episode
   */
  async getLinksFrom(srcEpisodeId: string): Promise<StoredLink[]> {
    const res = await query(
      `
      SELECT *
      FROM episode_links
      WHERE src_episode_id = $1
      ORDER BY weight DESC, created_at DESC
      `,
      [srcEpisodeId]
    );

    return (res.rows ?? []).map(rowToLink);
  },

  /**
   * Get all links pointing to an episode
   */
  async getLinksTo(dstEpisodeId: string): Promise<StoredLink[]> {
    const res = await query(
      `
      SELECT *
      FROM episode_links
      WHERE dst_episode_id = $1
      ORDER BY weight DESC, created_at DESC
      `,
      [dstEpisodeId]
    );

    return (res.rows ?? []).map(rowToLink);
  },

  /**
   * Get links of a specific relation type for an episode
   */
  async getLinksByRelation(
    episodeId: string,
    relation: EpisodeRelation,
    direction: 'from' | 'to' | 'both' = 'both'
  ): Promise<StoredLink[]> {
    let sql: string;
    const params = [episodeId, relation];

    if (direction === 'from') {
      sql = `
        SELECT * FROM episode_links
        WHERE src_episode_id = $1 AND relation = $2
        ORDER BY weight DESC
      `;
    } else if (direction === 'to') {
      sql = `
        SELECT * FROM episode_links
        WHERE dst_episode_id = $1 AND relation = $2
        ORDER BY weight DESC
      `;
    } else {
      sql = `
        SELECT * FROM episode_links
        WHERE (src_episode_id = $1 OR dst_episode_id = $1) AND relation = $2
        ORDER BY weight DESC
      `;
    }

    const res = await query(sql, params);
    return (res.rows ?? []).map(rowToLink);
  },

  /**
   * Delete a link
   */
  async deleteLink(linkId: string): Promise<boolean> {
    const res = await query(`DELETE FROM episode_links WHERE id = $1`, [
      linkId,
    ]);
    return (res.rowCount ?? 0) > 0;
  },

  /**
   * Check if a link exists
   */
  async hasLink(
    srcEpisodeId: string,
    dstEpisodeId: string,
    relation: EpisodeRelation
  ): Promise<boolean> {
    const res = await query(
      `
      SELECT 1 FROM episode_links
      WHERE src_episode_id = $1 AND dst_episode_id = $2 AND relation = $3
      LIMIT 1
      `,
      [srcEpisodeId, dstEpisodeId, relation]
    );
    return res.rows.length > 0;
  },
};
