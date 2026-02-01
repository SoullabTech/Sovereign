/**
 * Dream Service - Postgres Adapter for MAIA-SOVEREIGN
 * Handles saving, retrieving, and analyzing dream journal entries.
 * Dreams flow into MAIA's memory as episodes in the bardic timeline.
 */

import { query } from '@/lib/db/postgres';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface DreamEntry {
  id: string;
  user_id: string;
  title: string | null;
  dream_text: string;
  occurred_at: Date;
  symbols: string[];
  motifs: string[];
  archetypes: string[];
  tags: string[];
  is_favorite: boolean;
  lucidity_level: number | null;
  emotional_tone: string | null;
  analysis: object | null;
  analysis_generated_at: Date | null;
  episode_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDreamInput {
  userId: string;
  title?: string;
  dreamText: string;
  occurredAt?: string;
  symbols?: string[];
  motifs?: string[];
  archetypes?: string[];
  tags?: string[];
  lucidityLevel?: number;
  emotionalTone?: string;
}

export interface UpdateDreamInput {
  title?: string;
  tags?: string[];
  isFavorite?: boolean;
  lucidityLevel?: number;
  emotionalTone?: string;
  analysis?: object;
}

export interface DreamPattern {
  id: string;
  user_id: string;
  pattern_type: string;
  pattern_value: string;
  occurrence_count: number;
  first_seen: Date;
  last_seen: Date;
  dream_ids: string[];
  interpretation: string | null;
  significance_score: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

export class DreamService {
  /**
   * Record a new dream entry
   */
  async recordDream(input: CreateDreamInput): Promise<DreamEntry | null> {
    try {
      const result = await query<DreamEntry>(`
        INSERT INTO dream_entries (
          user_id,
          title,
          dream_text,
          occurred_at,
          symbols,
          motifs,
          archetypes,
          tags,
          lucidity_level,
          emotional_tone
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        input.userId,
        input.title || null,
        input.dreamText,
        input.occurredAt ? new Date(input.occurredAt) : new Date(),
        input.symbols || [],
        input.motifs || [],
        input.archetypes || [],
        input.tags || [],
        input.lucidityLevel ?? null,
        input.emotionalTone || null,
      ]);

      const dream = result.rows[0];
      if (!dream) return null;

      console.log('✨ [Dreams] Recorded:', { id: dream.id, userId: input.userId });

      // Update pattern tracking in background (don't await)
      this.updatePatterns(input.userId, dream.id, input.symbols, input.motifs, input.archetypes)
        .catch(err => console.error('[Dreams] Pattern update failed:', err));

      return dream;
    } catch (error) {
      console.error('❌ [Dreams] Error recording dream:', error);
      return null;
    }
  }

  /**
   * Get a single dream by ID
   */
  async getDream(dreamId: string): Promise<DreamEntry | null> {
    try {
      const result = await query<DreamEntry>(`
        SELECT * FROM dream_entries WHERE id = $1
      `, [dreamId]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ [Dreams] Error fetching dream:', error);
      return null;
    }
  }

  /**
   * List dreams for a user
   */
  async listDreams(
    userId: string,
    options: { limit?: number; offset?: number; tags?: string[] } = {}
  ): Promise<{ dreams: DreamEntry[]; total: number }> {
    try {
      const limit = options.limit || 20;
      const offset = options.offset || 0;

      let whereClause = 'WHERE user_id = $1';
      const params: any[] = [userId];

      if (options.tags && options.tags.length > 0) {
        params.push(options.tags);
        whereClause += ` AND tags && $${params.length}::text[]`;
      }

      // Count total
      const countResult = await query<{ count: string }>(
        `SELECT COUNT(*) FROM dream_entries ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0]?.count || '0', 10);

      // Fetch dreams
      params.push(limit, offset);
      const result = await query<DreamEntry>(`
        SELECT * FROM dream_entries
        ${whereClause}
        ORDER BY occurred_at DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `, params);

      return { dreams: result.rows, total };
    } catch (error) {
      console.error('❌ [Dreams] Error listing dreams:', error);
      return { dreams: [], total: 0 };
    }
  }

  /**
   * Update a dream entry
   */
  async updateDream(dreamId: string, updates: UpdateDreamInput): Promise<DreamEntry | null> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (updates.title !== undefined) {
        fields.push(`title = $${idx++}`);
        values.push(updates.title);
      }
      if (updates.tags !== undefined) {
        fields.push(`tags = $${idx++}`);
        values.push(updates.tags);
      }
      if (updates.isFavorite !== undefined) {
        fields.push(`is_favorite = $${idx++}`);
        values.push(updates.isFavorite);
      }
      if (updates.lucidityLevel !== undefined) {
        fields.push(`lucidity_level = $${idx++}`);
        values.push(updates.lucidityLevel);
      }
      if (updates.emotionalTone !== undefined) {
        fields.push(`emotional_tone = $${idx++}`);
        values.push(updates.emotionalTone);
      }
      if (updates.analysis !== undefined) {
        fields.push(`analysis = $${idx++}`);
        fields.push(`analysis_generated_at = NOW()`);
        values.push(JSON.stringify(updates.analysis));
      }

      if (fields.length === 0) {
        return this.getDream(dreamId);
      }

      values.push(dreamId);
      const result = await query<DreamEntry>(`
        UPDATE dream_entries
        SET ${fields.join(', ')}
        WHERE id = $${idx}
        RETURNING *
      `, values);

      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ [Dreams] Error updating dream:', error);
      return null;
    }
  }

  /**
   * Delete a dream entry
   */
  async deleteDream(dreamId: string): Promise<boolean> {
    try {
      await query('DELETE FROM dream_entries WHERE id = $1', [dreamId]);
      console.log('✅ [Dreams] Deleted:', dreamId);
      return true;
    } catch (error) {
      console.error('❌ [Dreams] Error deleting dream:', error);
      return false;
    }
  }

  /**
   * Get recurring patterns for a user
   */
  async getPatterns(
    userId: string,
    patternType?: string
  ): Promise<DreamPattern[]> {
    try {
      let sql = 'SELECT * FROM dream_patterns WHERE user_id = $1';
      const params: any[] = [userId];

      if (patternType) {
        params.push(patternType);
        sql += ` AND pattern_type = $2`;
      }

      sql += ' ORDER BY significance_score DESC, occurrence_count DESC LIMIT 50';

      const result = await query<DreamPattern>(sql, params);
      return result.rows;
    } catch (error) {
      console.error('❌ [Dreams] Error fetching patterns:', error);
      return [];
    }
  }

  /**
   * Update pattern tracking when a dream is recorded
   * (called in background, doesn't block recording)
   */
  private async updatePatterns(
    userId: string,
    dreamId: string,
    symbols?: string[],
    motifs?: string[],
    archetypes?: string[]
  ): Promise<void> {
    const updates: Array<{ type: string; value: string }> = [];

    symbols?.forEach(s => updates.push({ type: 'symbol', value: s }));
    motifs?.forEach(m => updates.push({ type: 'motif', value: m }));
    archetypes?.forEach(a => updates.push({ type: 'archetype', value: a }));

    for (const { type, value } of updates) {
      try {
        await query(`
          INSERT INTO dream_patterns (user_id, pattern_type, pattern_value, dream_ids)
          VALUES ($1, $2, $3, ARRAY[$4]::uuid[])
          ON CONFLICT (user_id, pattern_type, pattern_value)
          DO UPDATE SET
            occurrence_count = dream_patterns.occurrence_count + 1,
            last_seen = NOW(),
            dream_ids = array_append(dream_patterns.dream_ids, $4::uuid),
            significance_score = LEAST(1.0, dream_patterns.significance_score + 0.1)
        `, [userId, type, value, dreamId]);
      } catch (err) {
        // Log but continue - pattern tracking is non-critical
        console.warn('[Dreams] Pattern update skipped:', type, value, err);
      }
    }
  }

  /**
   * Store analysis results for a dream
   */
  async storeAnalysis(dreamId: string, analysis: object): Promise<boolean> {
    try {
      await query(`
        UPDATE dream_entries
        SET analysis = $2, analysis_generated_at = NOW()
        WHERE id = $1
      `, [dreamId, JSON.stringify(analysis)]);
      return true;
    } catch (error) {
      console.error('❌ [Dreams] Error storing analysis:', error);
      return false;
    }
  }
}

// Export singleton
export const dreamService = new DreamService();
