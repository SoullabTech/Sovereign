/**
 * TeleologyRepo - Postgres-native storage for teloi and alignment tracking
 *
 * Tables:
 * - teloi: stores "what wants to become" (future-pull)
 * - telos_alignment_log: tracks how episodes relate to teloi
 */

import { query } from '@/lib/db/postgres';

export interface TelosRow {
  id: string;
  user_id: string;
  phrase: string;
  origin_episode: string | null;
  strength: number;
  horizon_days: number | null;
  signals: string[];
  created_at: string;
  updated_at: string;
}

export interface AlignmentLogRow {
  id: string;
  episode_id: string;
  telos_id: string;
  delta: number;
  notes: string | null;
  created_at: string;
}

export interface CreateTelosInput {
  userId: string;
  phrase: string;
  originEpisodeId?: string;
  strength?: number;
  horizonDays?: number;
  signals?: string[];
}

export interface LogAlignmentInput {
  episodeId: string;
  telosId: string;
  delta: number;
  notes?: string;
}

/**
 * Parse database row to TelosRow
 */
function rowToTelos(row: Record<string, unknown>): TelosRow {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    phrase: row.phrase as string,
    origin_episode: row.origin_episode as string | null,
    strength: row.strength as number,
    horizon_days: row.horizon_days as number | null,
    signals: (row.signals as string[]) ?? [],
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

/**
 * Parse database row to AlignmentLogRow
 */
function rowToAlignment(row: Record<string, unknown>): AlignmentLogRow {
  return {
    id: row.id as string,
    episode_id: row.episode_id as string,
    telos_id: row.telos_id as string,
    delta: row.delta as number,
    notes: row.notes as string | null,
    created_at: row.created_at as string,
  };
}

export const TeleologyRepo = {
  /**
   * Create a new telos
   */
  async createTelos(input: CreateTelosInput): Promise<TelosRow | null> {
    const res = await query(
      `
      INSERT INTO teloi (user_id, phrase, origin_episode, strength, horizon_days, signals)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb)
      RETURNING *
      `,
      [
        input.userId,
        input.phrase,
        input.originEpisodeId ?? null,
        input.strength ?? 0.5,
        input.horizonDays ?? null,
        JSON.stringify(input.signals ?? []),
      ]
    );

    const row = res.rows?.[0];
    return row ? rowToTelos(row) : null;
  },

  /**
   * Log an alignment delta for an episode
   */
  async logAlignment(input: LogAlignmentInput): Promise<boolean> {
    const res = await query(
      `
      INSERT INTO telos_alignment_log (episode_id, telos_id, delta, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [input.episodeId, input.telosId, input.delta, input.notes ?? null]
    );

    return (res.rowCount ?? 0) > 0;
  },

  /**
   * Get recent alignment logs for a telos (for strength calculation)
   */
  async getRecentAlignments(
    telosId: string,
    limit: number = 10
  ): Promise<AlignmentLogRow[]> {
    const res = await query(
      `
      SELECT *
      FROM telos_alignment_log
      WHERE telos_id = $1
      ORDER BY created_at DESC
      LIMIT $2
      `,
      [telosId, limit]
    );

    return (res.rows ?? []).map(rowToAlignment);
  },

  /**
   * Update telos strength
   */
  async updateStrength(telosId: string, newStrength: number): Promise<boolean> {
    const clamped = Math.max(0, Math.min(1, newStrength));

    const res = await query(
      `
      UPDATE teloi
      SET strength = $1, updated_at = now()
      WHERE id = $2
      `,
      [clamped, telosId]
    );

    return (res.rowCount ?? 0) > 0;
  },

  /**
   * Get active teloi for a user (strength >= threshold)
   */
  async getActiveTeloi(
    userId: string,
    minStrength: number = 0.3
  ): Promise<TelosRow[]> {
    const res = await query(
      `
      SELECT *
      FROM teloi
      WHERE user_id = $1 AND strength >= $2
      ORDER BY strength DESC
      `,
      [userId, minStrength]
    );

    return (res.rows ?? []).map(rowToTelos);
  },

  /**
   * Get episode IDs in a date range for a user
   */
  async getEpisodeIdsInRange(
    userId: string,
    sinceDate: Date
  ): Promise<string[]> {
    const res = await query(
      `
      SELECT id
      FROM episodes
      WHERE user_id = $1 AND occurred_at >= $2
      `,
      [userId, sinceDate.toISOString()]
    );

    return (res.rows ?? []).map((row) => row.id as string);
  },

  /**
   * Get alignments for a list of episodes
   */
  async getAlignmentsForEpisodes(
    episodeIds: string[]
  ): Promise<AlignmentLogRow[]> {
    if (episodeIds.length === 0) {
      return [];
    }

    const res = await query(
      `
      SELECT *
      FROM telos_alignment_log
      WHERE episode_id = ANY($1)
      `,
      [episodeIds]
    );

    return (res.rows ?? []).map(rowToAlignment);
  },

  /**
   * Get a single telos by ID
   */
  async getTelos(telosId: string): Promise<TelosRow | null> {
    const res = await query(
      `
      SELECT * FROM teloi WHERE id = $1 LIMIT 1
      `,
      [telosId]
    );

    const row = res.rows?.[0];
    return row ? rowToTelos(row) : null;
  },

  /**
   * Alias for updateStrength (for service compatibility)
   */
  async updateTelosStrength(telosId: string, newStrength: number): Promise<boolean> {
    return this.updateStrength(telosId, newStrength);
  },

  /**
   * Count recent episodes for a user since a date
   */
  async countRecentEpisodes(userId: string, sinceDate: Date): Promise<number> {
    const res = await query(
      `
      SELECT COUNT(*) as count
      FROM episodes
      WHERE user_id = $1 AND occurred_at >= $2
      `,
      [userId, sinceDate.toISOString()]
    );

    return parseInt(res.rows?.[0]?.count ?? '0', 10);
  },

  /**
   * Get recent episode IDs (alias for getEpisodeIdsInRange)
   */
  async getRecentEpisodeIds(userId: string, sinceDate: Date): Promise<string[]> {
    return this.getEpisodeIdsInRange(userId, sinceDate);
  },

  /**
   * Count alignments for a list of episodes since a date
   */
  async countAlignmentsForEpisodes(
    episodeIds: string[],
    sinceDate: Date
  ): Promise<number> {
    if (episodeIds.length === 0) {
      return 0;
    }

    const res = await query(
      `
      SELECT COUNT(*) as count
      FROM telos_alignment_log
      WHERE episode_id = ANY($1) AND created_at >= $2
      `,
      [episodeIds, sinceDate.toISOString()]
    );

    return parseInt(res.rows?.[0]?.count ?? '0', 10);
  },
};
