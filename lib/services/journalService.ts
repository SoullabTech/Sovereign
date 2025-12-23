/**
 * Journal Service - Postgres Adapter for MAIA-SOVEREIGN
 * Handles saving, retrieving, and managing holoflower journal entries
 * All roads lead back to MAIA's deepening understanding of each member
 */

import 'server-only';
import { query } from '@/lib/db/postgres';
import type {
  HoloflowerJournalEntry,
  CreateJournalEntryInput,
  UpdateJournalEntryInput,
  SoulPattern
} from '@/lib/types/holoflower/journal';

export class JournalService {
  /**
   * Save a new holoflower reading to the journal
   * This becomes part of MAIA's memory of this person
   */
  async saveJournalEntry(
    entry: CreateJournalEntryInput,
    userId: string
  ): Promise<HoloflowerJournalEntry | null> {
    try {
      const result = await query<HoloflowerJournalEntry>(`
        INSERT INTO holoflower_journal_entries (
          user_id,
          intention,
          configuration_method,
          petal_intensities,
          spiral_stage,
          archetype,
          shadow_archetype,
          conversation_messages,
          tags,
          is_favorite,
          visibility
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        userId,
        entry.intention || null,
        entry.configuration_method,
        JSON.stringify(entry.petal_intensities),
        JSON.stringify(entry.spiral_stage),
        entry.archetype || null,
        entry.shadow_archetype || null,
        JSON.stringify(entry.conversation_messages),
        entry.tags || [],
        entry.is_favorite || false,
        entry.visibility || 'private'
      ]);

      console.log('✅ [Journal] Entry saved successfully:', result.rows[0].id);
      return result.rows[0];
    } catch (error) {
      console.error('❌ [Journal] Error saving entry:', error);
      return null;
    }
  }

  /**
   * Update an existing journal entry
   * Used when conversation continues or user adds tags/favorites
   */
  async updateJournalEntry(
    entryId: string,
    updates: UpdateJournalEntryInput
  ): Promise<HoloflowerJournalEntry | null> {
    try {
      // Build dynamic update query
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.intention !== undefined) {
        updateFields.push(`intention = \$${paramIndex++}`);
        values.push(updates.intention);
      }
      if (updates.petal_intensities !== undefined) {
        updateFields.push(`petal_intensities = \$${paramIndex++}`);
        values.push(JSON.stringify(updates.petal_intensities));
      }
      if (updates.spiral_stage !== undefined) {
        updateFields.push(`spiral_stage = \$${paramIndex++}`);
        values.push(JSON.stringify(updates.spiral_stage));
      }
      if (updates.archetype !== undefined) {
        updateFields.push(`archetype = \$${paramIndex++}`);
        values.push(updates.archetype);
      }
      if (updates.shadow_archetype !== undefined) {
        updateFields.push(`shadow_archetype = \$${paramIndex++}`);
        values.push(updates.shadow_archetype);
      }
      if (updates.conversation_messages !== undefined) {
        updateFields.push(`conversation_messages = \$${paramIndex++}`);
        values.push(JSON.stringify(updates.conversation_messages));
      }
      if (updates.tags !== undefined) {
        updateFields.push(`tags = \$${paramIndex++}`);
        values.push(updates.tags);
      }
      if (updates.is_favorite !== undefined) {
        updateFields.push(`is_favorite = \$${paramIndex++}`);
        values.push(updates.is_favorite);
      }
      if (updates.visibility !== undefined) {
        updateFields.push(`visibility = \$${paramIndex++}`);
        values.push(updates.visibility);
      }

      if (updateFields.length === 0) {
        console.warn('⚠️ [Journal] No fields to update');
        return null;
      }

      values.push(entryId);
      const result = await query<HoloflowerJournalEntry>(`
        UPDATE holoflower_journal_entries
        SET ${updateFields.join(', ')}
        WHERE id = \$${paramIndex}
        RETURNING *
      `, values);

      if (result.rows.length === 0) {
        console.warn('⚠️ [Journal] Entry not found:', entryId);
        return null;
      }

      console.log('✅ [Journal] Entry updated:', entryId);
      return result.rows[0];
    } catch (error) {
      console.error('❌ [Journal] Error updating entry:', error);
      return null;
    }
  }

  /**
   * Get all journal entries for the current user
   * Returns entries sorted by most recent first
   */
  async getJournalEntries(userId: string, limit: number = 50): Promise<HoloflowerJournalEntry[]> {
    try {
      const result = await query<HoloflowerJournalEntry>(`
        SELECT * FROM holoflower_journal_entries
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `, [userId, limit]);

      // Parse JSONB fields
      return result.rows.map(row => ({
        ...row,
        petal_intensities: typeof row.petal_intensities === 'string'
          ? JSON.parse(row.petal_intensities)
          : row.petal_intensities,
        spiral_stage: typeof row.spiral_stage === 'string'
          ? JSON.parse(row.spiral_stage)
          : row.spiral_stage,
        conversation_messages: typeof row.conversation_messages === 'string'
          ? JSON.parse(row.conversation_messages)
          : row.conversation_messages
      }));
    } catch (error) {
      console.error('❌ [Journal] Error fetching entries:', error);
      return [];
    }
  }

  /**
   * Get a single journal entry by ID
   */
  async getJournalEntry(entryId: string): Promise<HoloflowerJournalEntry | null> {
    try {
      const result = await query<HoloflowerJournalEntry>(`
        SELECT * FROM holoflower_journal_entries
        WHERE id = $1
      `, [entryId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        ...row,
        petal_intensities: typeof row.petal_intensities === 'string'
          ? JSON.parse(row.petal_intensities)
          : row.petal_intensities,
        spiral_stage: typeof row.spiral_stage === 'string'
          ? JSON.parse(row.spiral_stage)
          : row.spiral_stage,
        conversation_messages: typeof row.conversation_messages === 'string'
          ? JSON.parse(row.conversation_messages)
          : row.conversation_messages
      };
    } catch (error) {
      console.error('❌ [Journal] Error fetching entry:', error);
      return null;
    }
  }

  /**
   * Delete a journal entry
   */
  async deleteJournalEntry(entryId: string): Promise<boolean> {
    try {
      await query(`
        DELETE FROM holoflower_journal_entries
        WHERE id = $1
      `, [entryId]);

      console.log('✅ [Journal] Entry deleted:', entryId);
      return true;
    } catch (error) {
      console.error('❌ [Journal] Error deleting entry:', error);
      return false;
    }
  }

  /**
   * Get soul patterns for the current user
   * These are MAIA's recognized patterns across multiple journal entries
   */
  async getSoulPatterns(userId: string): Promise<SoulPattern[]> {
    try {
      const result = await query<SoulPattern>(`
        SELECT * FROM soul_patterns
        WHERE user_id = $1
        ORDER BY confidence_score DESC NULLS LAST
      `, [userId]);

      // Parse JSONB pattern_data
      return result.rows.map(row => ({
        ...row,
        pattern_data: typeof row.pattern_data === 'string'
          ? JSON.parse(row.pattern_data)
          : row.pattern_data
      }));
    } catch (error) {
      console.error('❌ [Journal] Error fetching soul patterns:', error);
      return [];
    }
  }

  /**
   * Search journal entries by tags
   */
  async searchByTags(userId: string, tags: string[]): Promise<HoloflowerJournalEntry[]> {
    try {
      const result = await query<HoloflowerJournalEntry>(`
        SELECT * FROM holoflower_journal_entries
        WHERE user_id = $1
          AND tags && $2::text[]
        ORDER BY created_at DESC
      `, [userId, tags]);

      // Parse JSONB fields
      return result.rows.map(row => ({
        ...row,
        petal_intensities: typeof row.petal_intensities === 'string'
          ? JSON.parse(row.petal_intensities)
          : row.petal_intensities,
        spiral_stage: typeof row.spiral_stage === 'string'
          ? JSON.parse(row.spiral_stage)
          : row.spiral_stage,
        conversation_messages: typeof row.conversation_messages === 'string'
          ? JSON.parse(row.conversation_messages)
          : row.conversation_messages
      }));
    } catch (error) {
      console.error('❌ [Journal] Error searching by tags:', error);
      return [];
    }
  }

  /**
   * Get favorite entries
   */
  async getFavorites(userId: string): Promise<HoloflowerJournalEntry[]> {
    try {
      const result = await query<HoloflowerJournalEntry>(`
        SELECT * FROM holoflower_journal_entries
        WHERE user_id = $1
          AND is_favorite = true
        ORDER BY created_at DESC
      `, [userId]);

      // Parse JSONB fields
      return result.rows.map(row => ({
        ...row,
        petal_intensities: typeof row.petal_intensities === 'string'
          ? JSON.parse(row.petal_intensities)
          : row.petal_intensities,
        spiral_stage: typeof row.spiral_stage === 'string'
          ? JSON.parse(row.spiral_stage)
          : row.spiral_stage,
        conversation_messages: typeof row.conversation_messages === 'string'
          ? JSON.parse(row.conversation_messages)
          : row.conversation_messages
      }));
    } catch (error) {
      console.error('❌ [Journal] Error fetching favorites:', error);
      return [];
    }
  }
}

// Export singleton instance
export const journalService = new JournalService();
