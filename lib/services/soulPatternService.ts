/**
 * SOUL PATTERN SERVICE - Postgres Adapter for MAIA-SOVEREIGN
 *
 * Manages soul patterns in the database - MAIA's longitudinal understanding
 * of each person's essence, growth trajectory, and recurring themes.
 *
 * These are not raw data, but MAIA's interpretations of what she sees
 * across multiple encounters.
 */

import 'server-only';
import { query } from '@/lib/db/postgres';
import type { SoulPattern } from '@/lib/types/holoflower/journal';

export interface CreateSoulPatternInput {
  pattern_type: string;
  pattern_data: Record<string, any>;
  confidence_score?: number;
  observations_count?: number;
  maia_interpretation?: string;
  first_observed?: string | null;
  last_observed?: string | null;
  insight?: string | null;
}

export class SoulPatternService {
  /**
   * Save a new soul pattern
   * Uses UPSERT logic based on (user_id, pattern_type) uniqueness
   */
  async saveSoulPattern(
    input: CreateSoulPatternInput,
    userId: string
  ): Promise<SoulPattern | null> {
    try {
      // Check if pattern already exists
      const existingResult = await query<SoulPattern>(`
        SELECT * FROM soul_patterns
        WHERE user_id = $1 AND pattern_type = $2
      `, [userId, input.pattern_type]);

      if (existingResult.rows[0]) {
        // Update existing pattern
        const result = await query<SoulPattern>(`
          UPDATE soul_patterns
          SET
            pattern_data = $1,
            confidence_score = $2,
            observations_count = COALESCE($3, observations_count),
            maia_interpretation = $4,
            last_updated = NOW()
          WHERE id = $5
          RETURNING *
        `, [
          JSON.stringify(input.pattern_data),
          input.confidence_score || null,
          input.observations_count || null,
          input.maia_interpretation || null,
          existingResult.rows[0].id
        ]);

        console.log('✨ [SOUL PATTERN] Pattern updated:', input.pattern_type);

        // Parse JSONB pattern_data
        const row = result.rows[0];
        return {
          ...row,
          pattern_data: typeof row.pattern_data === 'string'
            ? JSON.parse(row.pattern_data)
            : row.pattern_data
        };
      } else {
        // Create new pattern
        const result = await query<SoulPattern>(`
          INSERT INTO soul_patterns (
            user_id,
            pattern_type,
            pattern_data,
            confidence_score,
            observations_count,
            maia_interpretation
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `, [
          userId,
          input.pattern_type,
          JSON.stringify(input.pattern_data),
          input.confidence_score || null,
          input.observations_count || 1,
          input.maia_interpretation || null
        ]);

        console.log('✨ [SOUL PATTERN] Pattern created:', input.pattern_type);

        // Parse JSONB pattern_data
        const row = result.rows[0];
        return {
          ...row,
          pattern_data: typeof row.pattern_data === 'string'
            ? JSON.parse(row.pattern_data)
            : row.pattern_data
        };
      }
    } catch (error) {
      console.error('❌ [SOUL PATTERN] Unexpected error:', error);
      return null;
    }
  }

  /**
   * Get all soul patterns for current user
   */
  async getSoulPatterns(userId: string): Promise<SoulPattern[]> {
    try {
      const result = await query<SoulPattern>(`
        SELECT * FROM soul_patterns
        WHERE user_id = $1
        ORDER BY confidence_score DESC NULLS LAST
      `, [userId]);

      // Parse JSONB pattern_data for all rows
      return result.rows.map(row => ({
        ...row,
        pattern_data: typeof row.pattern_data === 'string'
          ? JSON.parse(row.pattern_data)
          : row.pattern_data
      }));
    } catch (error) {
      console.error('❌ [SOUL PATTERN] Error fetching patterns:', error);
      return [];
    }
  }

  /**
   * Get patterns by type
   */
  async getPatternsByType(userId: string, patternType: string): Promise<SoulPattern[]> {
    try {
      const result = await query<SoulPattern>(`
        SELECT * FROM soul_patterns
        WHERE user_id = $1 AND pattern_type = $2
        ORDER BY last_updated DESC
      `, [userId, patternType]);

      // Parse JSONB pattern_data for all rows
      return result.rows.map(row => ({
        ...row,
        pattern_data: typeof row.pattern_data === 'string'
          ? JSON.parse(row.pattern_data)
          : row.pattern_data
      }));
    } catch (error) {
      console.error('❌ [SOUL PATTERN] Error fetching patterns by type:', error);
      return [];
    }
  }

  /**
   * Delete a soul pattern
   */
  async deleteSoulPattern(patternId: string): Promise<boolean> {
    try {
      await query(`
        DELETE FROM soul_patterns
        WHERE id = $1
      `, [patternId]);

      console.log('✅ [SOUL PATTERN] Pattern deleted:', patternId);
      return true;
    } catch (error) {
      console.error('❌ [SOUL PATTERN] Error deleting pattern:', error);
      return false;
    }
  }

  /**
   * Get MAIA's complete understanding (all patterns synthesized)
   */
  async getMAIAUnderstanding(userId: string): Promise<{
    dominantElements: string[];
    recurringArchetypes: string[];
    growthTrajectory: string | null;
    shadowThemes: string[];
    insights: string[];
  }> {
    const patterns = await this.getSoulPatterns(userId);

    const result = {
      dominantElements: [] as string[],
      recurringArchetypes: [] as string[],
      growthTrajectory: null as string | null,
      shadowThemes: [] as string[],
      insights: [] as string[]
    };

    patterns.forEach(pattern => {
      switch (pattern.pattern_type) {
        case 'dominant_element':
          result.dominantElements.push(pattern.pattern_data.element);
          break;
        case 'recurring_archetype':
          result.recurringArchetypes.push(pattern.pattern_data.archetype);
          break;
        case 'growth_trajectory':
          result.growthTrajectory = `${pattern.pattern_data.from} → ${pattern.pattern_data.to}`;
          break;
        case 'shadow_integration':
          result.shadowThemes.push(pattern.pattern_data.shadow);
          break;
      }

      if (pattern.maia_interpretation) {
        result.insights.push(pattern.maia_interpretation);
      }
    });

    return result;
  }
}

// Export singleton
export const soulPatternService = new SoulPatternService();
