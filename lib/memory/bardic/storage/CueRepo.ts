/**
 * CueRepo - Postgres-native storage for bardic cues
 *
 * Replaces Supabase-based storage with direct lib/db/postgres.ts queries.
 * Manages cue catalog, episode-cue associations, and cue events.
 */

import { query } from '@/lib/db/postgres';
import type { CueType } from '../types';

export interface StoredCue {
  id: string;
  userId: string;
  cueType: CueType;
  cueKey: string;
  userWords?: string | null;
  mediaRef?: string | null;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface EpisodeCueLink {
  episodeId: string;
  cueId: string;
  potency: number;
  notes?: string | null;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

/**
 * Normalize cue key for consistent lookups
 */
function normKey(s: string): string {
  return String(s ?? '').trim().toLowerCase();
}

export const CueRepo = {
  /**
   * Create or update a cue
   *
   * Cues are user-scoped (same cue may mean different things to different users).
   * Deduped by (user_id, cue_type, cue_key).
   */
  async upsertCue(input: {
    userId: string;
    cueType: CueType;
    userWords: string;
    mediaRef?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<StoredCue> {
    const cueType = normKey(input.cueType);
    const cueKey = normKey(input.userWords);

    const res = await query(
      `
      INSERT INTO bardic_cues (user_id, cue_type, cue_key, user_words, media_ref, metadata)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb)
      ON CONFLICT (user_id, cue_type, cue_key) DO UPDATE SET
        user_words = COALESCE(EXCLUDED.user_words, bardic_cues.user_words),
        media_ref = COALESCE(EXCLUDED.media_ref, bardic_cues.media_ref),
        metadata = bardic_cues.metadata || EXCLUDED.metadata,
        updated_at = now()
      RETURNING id, user_id, cue_type, cue_key, user_words, media_ref, metadata, created_at, updated_at
      `,
      [
        input.userId,
        cueType,
        cueKey,
        input.userWords,
        input.mediaRef ?? null,
        JSON.stringify(input.metadata ?? {}),
      ]
    );

    const row = res.rows[0];
    return parseCueRow(row);
  },

  /**
   * Get a cue by ID
   */
  async getCue(cueId: string): Promise<StoredCue | null> {
    const res = await query(
      `
      SELECT id, user_id, cue_type, cue_key, user_words, media_ref, metadata, created_at, updated_at
      FROM bardic_cues
      WHERE id = $1
      `,
      [cueId]
    );

    if (res.rows.length === 0) return null;
    return parseCueRow(res.rows[0]);
  },

  /**
   * List all cues for a user, optionally filtered by type
   */
  async listUserCues(userId: string, cueType?: CueType): Promise<StoredCue[]> {
    let sql = `
      SELECT id, user_id, cue_type, cue_key, user_words, media_ref, metadata, created_at, updated_at
      FROM bardic_cues
      WHERE user_id = $1
    `;
    const params: unknown[] = [userId];

    if (cueType) {
      sql += ` AND cue_type = $2`;
      params.push(normKey(cueType));
    }

    sql += ` ORDER BY created_at DESC`;

    const res = await query(sql, params);
    return res.rows.map(parseCueRow);
  },

  /**
   * Delete a cue (cascades to episode_cues)
   */
  async deleteCue(cueId: string, userId: string): Promise<boolean> {
    const res = await query(
      `DELETE FROM bardic_cues WHERE id = $1 AND user_id = $2`,
      [cueId, userId]
    );
    return (res.rowCount ?? 0) > 0;
  },

  /**
   * Associate a cue with an episode (with potency)
   */
  async attachCueToEpisode(input: {
    episodeId: string;
    cueId: string;
    potency?: number;
    notes?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<boolean> {
    const potency = Math.max(0, Math.min(1, input.potency ?? 0.5));

    await query(
      `
      INSERT INTO bardic_episode_cues (episode_id, cue_id, potency, notes, metadata)
      VALUES ($1, $2, $3, $4, $5::jsonb)
      ON CONFLICT (episode_id, cue_id) DO UPDATE SET
        potency = EXCLUDED.potency,
        notes = COALESCE(EXCLUDED.notes, bardic_episode_cues.notes),
        metadata = bardic_episode_cues.metadata || EXCLUDED.metadata
      `,
      [
        input.episodeId,
        input.cueId,
        potency,
        input.notes ?? null,
        JSON.stringify(input.metadata ?? {}),
      ]
    );

    return true;
  },

  /**
   * Update potency for an episode-cue link
   */
  async updatePotency(
    episodeId: string,
    cueId: string,
    newPotency: number
  ): Promise<boolean> {
    const potency = Math.max(0, Math.min(1, newPotency));

    const res = await query(
      `
      UPDATE bardic_episode_cues
      SET potency = $3
      WHERE episode_id = $1 AND cue_id = $2
      `,
      [episodeId, cueId, potency]
    );

    return (res.rowCount ?? 0) > 0;
  },

  /**
   * List cues for an episode (with potency)
   */
  async listEpisodeCues(
    episodeId: string
  ): Promise<Array<StoredCue & { potency: number }>> {
    const res = await query(
      `
      SELECT
        c.id, c.user_id, c.cue_type, c.cue_key, c.user_words, c.media_ref,
        c.metadata, c.created_at, c.updated_at,
        ec.potency
      FROM bardic_episode_cues ec
      JOIN bardic_cues c ON c.id = ec.cue_id
      WHERE ec.episode_id = $1
      ORDER BY ec.potency DESC, c.cue_type ASC, c.cue_key ASC
      `,
      [episodeId]
    );

    return res.rows.map((row: Record<string, unknown>) => ({
      ...parseCueRow(row),
      potency: (row.potency as number) ?? 0.5,
    }));
  },

  /**
   * Find episode IDs associated with a cue
   *
   * Returns episode IDs sorted by potency (strongest first).
   * Caller must fetch full Episode objects separately if needed.
   */
  async findEpisodeIdsByCue(input: {
    cueId: string;
    minPotency?: number;
    limit?: number;
  }): Promise<Array<{ episodeId: string; potency: number }>> {
    const minPotency = input.minPotency ?? 0.5;
    const limit = Math.min(Math.max(input.limit ?? 50, 1), 200);

    const res = await query(
      `
      SELECT episode_id, potency
      FROM bardic_episode_cues
      WHERE cue_id = $1 AND potency >= $2
      ORDER BY potency DESC, created_at DESC
      LIMIT $3
      `,
      [input.cueId, minPotency, limit]
    );

    return res.rows.map((row: Record<string, unknown>) => ({
      episodeId: row.episode_id as string,
      potency: row.potency as number,
    }));
  },

  /**
   * Log a cue event (for telemetry/learning)
   */
  async logCueEvent(input: {
    episodeId?: string | null;
    cueType: string;
    cueKey: string;
    eventType: string; // e.g. "triggered" | "reentered" | "failed"
    score?: number | null;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await query(
      `
      INSERT INTO bardic_cue_events
        (episode_id, cue_type, cue_key, event_type, score, metadata)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb)
      `,
      [
        input.episodeId ?? null,
        normKey(input.cueType),
        normKey(input.cueKey),
        normKey(input.eventType),
        input.score ?? null,
        JSON.stringify(input.metadata ?? {}),
      ]
    );
  },

  /**
   * Check if a cue exists
   */
  async hasCue(cueId: string): Promise<boolean> {
    const res = await query(
      `SELECT 1 FROM bardic_cues WHERE id = $1 LIMIT 1`,
      [cueId]
    );
    return res.rows.length > 0;
  },
};

/**
 * Parse database row to StoredCue
 */
function parseCueRow(row: Record<string, unknown>): StoredCue {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    cueType: row.cue_type as CueType,
    cueKey: row.cue_key as string,
    userWords: row.user_words as string | null,
    mediaRef: row.media_ref as string | null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
