/**
 * Divination Service - Postgres Adapter for MAIA-SOVEREIGN
 * Handles saving, retrieving, and managing divination readings (I Ching, Tarot, Runes)
 * All readings are optionally saved at the member's discretion
 */

import { query } from '@/lib/db/postgres';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export type DivinationType = 'iching' | 'tarot' | 'runes';

export interface BaseDivinationReading {
  id: string;
  user_id: string;
  session_id?: string;
  question?: string;
  interpretation_text?: string;
  guidance_text?: string;
  sacred_timing?: string;
  ritual_suggestion?: string;
  member_notes?: string;
  archetypal_themes?: string[];
  metadata_json?: Record<string, any>;
  is_favorite: boolean;
  is_archived: boolean;
  created_at: Date;
  updated_at: Date;
}

// I Ching Reading
export interface IChingReading extends BaseDivinationReading {
  type: 'iching';
  cast_method: 'coins' | 'yarrow' | 'rng' | 'manual';
  primary_hex: number;
  primary_hex_name: string;
  line_values: number[];
  changing_lines: number[];
  relating_hex?: number;
  relating_hex_name?: string;
  lower_trigram: string;
  upper_trigram: string;
  wuxing_influence_json?: Record<string, number>;
  theme_keywords?: string[];
}

// Tarot Reading
export interface TarotReading extends BaseDivinationReading {
  type: 'tarot';
  spread_type: 'single' | 'three_card' | 'celtic_cross' | 'horseshoe' | 'custom';
  cards_json: Array<{
    position: string;
    card: string;
    reversed: boolean;
    number?: number;
    suit?: string;
    arcana?: 'major' | 'minor';
  }>;
}

// Runes Reading
export interface RunesReading extends BaseDivinationReading {
  type: 'runes';
  cast_type: 'single' | 'three_norns' | 'nine_worlds' | 'custom';
  runes_json: Array<{
    position: string;
    rune: string;
    reversed: boolean;
    element?: string;
    meaning?: string;
  }>;
  wyrd_message?: string;
}

export type DivinationReading = IChingReading | TarotReading | RunesReading;

// Input types for saving
export interface SaveIChingInput {
  question?: string;
  cast_method: 'coins' | 'yarrow' | 'rng' | 'manual';
  primary_hex: number;
  primary_hex_name: string;
  line_values: number[];
  changing_lines: number[];
  relating_hex?: number;
  relating_hex_name?: string;
  lower_trigram: string;
  upper_trigram: string;
  interpretation_text?: string;
  guidance_text?: string;
  sacred_timing?: string;
  ritual_suggestion?: string;
  wuxing_influence_json?: Record<string, number>;
  theme_keywords?: string[];
  archetypal_themes?: string[];
  metadata_json?: Record<string, any>;
}

export interface SaveTarotInput {
  question?: string;
  spread_type: 'single' | 'three_card' | 'celtic_cross' | 'horseshoe' | 'custom';
  cards_json: Array<{
    position: string;
    card: string;
    reversed: boolean;
    number?: number;
    suit?: string;
    arcana?: 'major' | 'minor';
  }>;
  interpretation_text?: string;
  guidance_text?: string;
  sacred_timing?: string;
  ritual_suggestion?: string;
  archetypal_themes?: string[];
  metadata_json?: Record<string, any>;
}

export interface SaveRunesInput {
  question?: string;
  cast_type: 'single' | 'three_norns' | 'nine_worlds' | 'custom';
  runes_json: Array<{
    position: string;
    rune: string;
    reversed: boolean;
    element?: string;
    meaning?: string;
  }>;
  wyrd_message?: string;
  interpretation_text?: string;
  guidance_text?: string;
  sacred_timing?: string;
  ritual_suggestion?: string;
  archetypal_themes?: string[];
  metadata_json?: Record<string, any>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DIVINATION SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class DivinationService {

  // ═══════════════════════════════════════════════════════════════════════════
  // I CHING OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Save an I Ching reading
   */
  async saveIChingReading(
    input: SaveIChingInput,
    userId: string
  ): Promise<IChingReading | null> {
    try {
      const result = await query<IChingReading>(`
        INSERT INTO divination_iching_readings (
          user_id,
          cast_method,
          question,
          primary_hex,
          primary_hex_name,
          line_values,
          changing_lines,
          relating_hex,
          relating_hex_name,
          lower_trigram,
          upper_trigram,
          wuxing_influence_json,
          theme_keywords,
          interpretation_text,
          guidance_text
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `, [
        userId,
        input.cast_method,
        input.question || null,
        input.primary_hex,
        input.primary_hex_name,
        input.line_values,
        input.changing_lines || [],
        input.relating_hex || null,
        input.relating_hex_name || null,
        input.lower_trigram,
        input.upper_trigram,
        JSON.stringify(input.wuxing_influence_json || {}),
        input.theme_keywords || [],
        input.interpretation_text || null,
        input.guidance_text || null
      ]);

      console.log('✅ [Divination] I Ching reading saved:', result.rows[0].id);
      return { ...result.rows[0], type: 'iching' };
    } catch (error) {
      console.error('❌ [Divination] Error saving I Ching reading:', error);
      return null;
    }
  }

  /**
   * Get I Ching readings for a user
   */
  async getIChingReadings(userId: string, limit: number = 50): Promise<IChingReading[]> {
    try {
      const result = await query<IChingReading>(`
        SELECT * FROM divination_iching_readings
        WHERE user_id = $1 AND (is_archived = FALSE OR is_archived IS NULL)
        ORDER BY created_at DESC
        LIMIT $2
      `, [userId, limit]);

      return result.rows.map(row => ({
        ...row,
        type: 'iching' as const,
        wuxing_influence_json: typeof row.wuxing_influence_json === 'string'
          ? JSON.parse(row.wuxing_influence_json)
          : row.wuxing_influence_json
      }));
    } catch (error) {
      console.error('❌ [Divination] Error fetching I Ching readings:', error);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TAROT OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Save a Tarot reading
   */
  async saveTarotReading(
    input: SaveTarotInput,
    userId: string
  ): Promise<TarotReading | null> {
    try {
      const result = await query<TarotReading>(`
        INSERT INTO divination_tarot_readings (
          user_id,
          question,
          spread_type,
          cards_json,
          interpretation_text,
          guidance_text,
          sacred_timing,
          ritual_suggestion,
          archetypal_themes,
          metadata_json
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        userId,
        input.question || null,
        input.spread_type,
        JSON.stringify(input.cards_json),
        input.interpretation_text || null,
        input.guidance_text || null,
        input.sacred_timing || null,
        input.ritual_suggestion || null,
        input.archetypal_themes || [],
        JSON.stringify(input.metadata_json || {})
      ]);

      console.log('✅ [Divination] Tarot reading saved:', result.rows[0].id);
      return { ...result.rows[0], type: 'tarot' };
    } catch (error) {
      console.error('❌ [Divination] Error saving Tarot reading:', error);
      return null;
    }
  }

  /**
   * Get Tarot readings for a user
   */
  async getTarotReadings(userId: string, limit: number = 50): Promise<TarotReading[]> {
    try {
      const result = await query<TarotReading>(`
        SELECT * FROM divination_tarot_readings
        WHERE user_id = $1 AND is_archived = FALSE
        ORDER BY created_at DESC
        LIMIT $2
      `, [userId, limit]);

      return result.rows.map(row => ({
        ...row,
        type: 'tarot' as const,
        cards_json: typeof row.cards_json === 'string'
          ? JSON.parse(row.cards_json)
          : row.cards_json,
        metadata_json: typeof row.metadata_json === 'string'
          ? JSON.parse(row.metadata_json)
          : row.metadata_json
      }));
    } catch (error) {
      console.error('❌ [Divination] Error fetching Tarot readings:', error);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RUNES OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Save a Runes reading
   */
  async saveRunesReading(
    input: SaveRunesInput,
    userId: string
  ): Promise<RunesReading | null> {
    try {
      const result = await query<RunesReading>(`
        INSERT INTO divination_runes_readings (
          user_id,
          question,
          cast_type,
          runes_json,
          wyrd_message,
          interpretation_text,
          guidance_text,
          sacred_timing,
          ritual_suggestion,
          archetypal_themes,
          metadata_json
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        userId,
        input.question || null,
        input.cast_type,
        JSON.stringify(input.runes_json),
        input.wyrd_message || null,
        input.interpretation_text || null,
        input.guidance_text || null,
        input.sacred_timing || null,
        input.ritual_suggestion || null,
        input.archetypal_themes || [],
        JSON.stringify(input.metadata_json || {})
      ]);

      console.log('✅ [Divination] Runes reading saved:', result.rows[0].id);
      return { ...result.rows[0], type: 'runes' };
    } catch (error) {
      console.error('❌ [Divination] Error saving Runes reading:', error);
      return null;
    }
  }

  /**
   * Get Runes readings for a user
   */
  async getRunesReadings(userId: string, limit: number = 50): Promise<RunesReading[]> {
    try {
      const result = await query<RunesReading>(`
        SELECT * FROM divination_runes_readings
        WHERE user_id = $1 AND is_archived = FALSE
        ORDER BY created_at DESC
        LIMIT $2
      `, [userId, limit]);

      return result.rows.map(row => ({
        ...row,
        type: 'runes' as const,
        runes_json: typeof row.runes_json === 'string'
          ? JSON.parse(row.runes_json)
          : row.runes_json,
        metadata_json: typeof row.metadata_json === 'string'
          ? JSON.parse(row.metadata_json)
          : row.metadata_json
      }));
    } catch (error) {
      console.error('❌ [Divination] Error fetching Runes readings:', error);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIFIED OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get all readings across all divination types
   */
  async getAllReadings(userId: string, limit: number = 50): Promise<DivinationReading[]> {
    try {
      const [iching, tarot, runes] = await Promise.all([
        this.getIChingReadings(userId, limit),
        this.getTarotReadings(userId, limit),
        this.getRunesReadings(userId, limit)
      ]);

      // Combine and sort by date
      const allReadings: DivinationReading[] = [...iching, ...tarot, ...runes];
      allReadings.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return allReadings.slice(0, limit);
    } catch (error) {
      console.error('❌ [Divination] Error fetching all readings:', error);
      return [];
    }
  }

  /**
   * Get favorite readings across all types
   */
  async getFavoriteReadings(userId: string): Promise<DivinationReading[]> {
    try {
      const [iching, tarot, runes] = await Promise.all([
        query<IChingReading>(`
          SELECT * FROM divination_iching_readings
          WHERE user_id = $1 AND is_favorite = TRUE AND (is_archived = FALSE OR is_archived IS NULL)
          ORDER BY created_at DESC
        `, [userId]),
        query<TarotReading>(`
          SELECT * FROM divination_tarot_readings
          WHERE user_id = $1 AND is_favorite = TRUE AND is_archived = FALSE
          ORDER BY created_at DESC
        `, [userId]),
        query<RunesReading>(`
          SELECT * FROM divination_runes_readings
          WHERE user_id = $1 AND is_favorite = TRUE AND is_archived = FALSE
          ORDER BY created_at DESC
        `, [userId])
      ]);

      const allFavorites: DivinationReading[] = [
        ...iching.rows.map(r => ({ ...r, type: 'iching' as const })),
        ...tarot.rows.map(r => ({ ...r, type: 'tarot' as const })),
        ...runes.rows.map(r => ({ ...r, type: 'runes' as const }))
      ];

      allFavorites.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return allFavorites;
    } catch (error) {
      console.error('❌ [Divination] Error fetching favorites:', error);
      return [];
    }
  }

  /**
   * Toggle favorite status for a reading
   */
  async toggleFavorite(
    type: DivinationType,
    readingId: string,
    isFavorite: boolean
  ): Promise<boolean> {
    const tableMap = {
      iching: 'divination_iching_readings',
      tarot: 'divination_tarot_readings',
      runes: 'divination_runes_readings'
    };

    try {
      await query(`
        UPDATE ${tableMap[type]}
        SET is_favorite = $1
        WHERE id = $2
      `, [isFavorite, readingId]);

      console.log(`✅ [Divination] ${type} reading favorite toggled:`, readingId, isFavorite);
      return true;
    } catch (error) {
      console.error('❌ [Divination] Error toggling favorite:', error);
      return false;
    }
  }

  /**
   * Update member notes for a reading
   */
  async updateNotes(
    type: DivinationType,
    readingId: string,
    notes: string
  ): Promise<boolean> {
    const tableMap = {
      iching: 'divination_iching_readings',
      tarot: 'divination_tarot_readings',
      runes: 'divination_runes_readings'
    };

    try {
      await query(`
        UPDATE ${tableMap[type]}
        SET member_notes = $1
        WHERE id = $2
      `, [notes, readingId]);

      console.log(`✅ [Divination] ${type} reading notes updated:`, readingId);
      return true;
    } catch (error) {
      console.error('❌ [Divination] Error updating notes:', error);
      return false;
    }
  }

  /**
   * Archive a reading (soft delete)
   */
  async archiveReading(
    type: DivinationType,
    readingId: string
  ): Promise<boolean> {
    const tableMap = {
      iching: 'divination_iching_readings',
      tarot: 'divination_tarot_readings',
      runes: 'divination_runes_readings'
    };

    try {
      await query(`
        UPDATE ${tableMap[type]}
        SET is_archived = TRUE
        WHERE id = $1
      `, [readingId]);

      console.log(`✅ [Divination] ${type} reading archived:`, readingId);
      return true;
    } catch (error) {
      console.error('❌ [Divination] Error archiving reading:', error);
      return false;
    }
  }

  /**
   * Get a single reading by ID
   */
  async getReading(
    type: DivinationType,
    readingId: string
  ): Promise<DivinationReading | null> {
    const tableMap = {
      iching: 'divination_iching_readings',
      tarot: 'divination_tarot_readings',
      runes: 'divination_runes_readings'
    };

    try {
      const result = await query(`
        SELECT * FROM ${tableMap[type]}
        WHERE id = $1
      `, [readingId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return { ...row, type } as DivinationReading;
    } catch (error) {
      console.error('❌ [Divination] Error fetching reading:', error);
      return null;
    }
  }
}

// Export singleton instance
export const divinationService = new DivinationService();
