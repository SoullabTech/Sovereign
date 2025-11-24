/**
 * Journal Service
 * Handles saving, retrieving, and managing holoflower journal entries
 * All roads lead back to MAIA's deepening understanding of each member
 */

import { getBrowserSupabaseClient } from '@/lib/supabaseBrowserClient';
import type {
  HoloflowerJournalEntry,
  CreateJournalEntryInput,
  UpdateJournalEntryInput,
  SoulPattern
} from '@/types/journal';

export class JournalService {
  private get supabase() {
    return getBrowserSupabaseClient();
  }

  /**
   * Save a new holoflower reading to the journal
   * This becomes part of MAIA's memory of this person
   */
  async saveJournalEntry(entry: CreateJournalEntryInput): Promise<HoloflowerJournalEntry | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();

      if (!user) {
        console.error('❌ [Journal] No authenticated user');
        return null;
      }

      const { data, error } = await this.supabase
        .from('holoflower_journal_entries')
        .insert({
          user_id: user.id,
          ...entry
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [Journal] Error saving entry:', error);
        return null;
      }

      console.log('✅ [Journal] Entry saved successfully:', data.id);
      return data as HoloflowerJournalEntry;
    } catch (error) {
      console.error('❌ [Journal] Unexpected error:', error);
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
      const { data, error } = await this.supabase
        .from('holoflower_journal_entries')
        .update(updates)
        .eq('id', entryId)
        .select()
        .single();

      if (error) {
        console.error('❌ [Journal] Error updating entry:', error);
        return null;
      }

      console.log('✅ [Journal] Entry updated:', entryId);
      return data as HoloflowerJournalEntry;
    } catch (error) {
      console.error('❌ [Journal] Unexpected error:', error);
      return null;
    }
  }

  /**
   * Get all journal entries for the current user
   * Returns entries sorted by most recent first
   */
  async getJournalEntries(limit: number = 50): Promise<HoloflowerJournalEntry[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();

      if (!user) return [];

      const { data, error } = await this.supabase
        .from('holoflower_journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ [Journal] Error fetching entries:', error);
        return [];
      }

      return data as HoloflowerJournalEntry[];
    } catch (error) {
      console.error('❌ [Journal] Unexpected error:', error);
      return [];
    }
  }

  /**
   * Get a single journal entry by ID
   */
  async getJournalEntry(entryId: string): Promise<HoloflowerJournalEntry | null> {
    try {
      const { data, error } = await this.supabase
        .from('holoflower_journal_entries')
        .select('*')
        .eq('id', entryId)
        .single();

      if (error) {
        console.error('❌ [Journal] Error fetching entry:', error);
        return null;
      }

      return data as HoloflowerJournalEntry;
    } catch (error) {
      console.error('❌ [Journal] Unexpected error:', error);
      return null;
    }
  }

  /**
   * Delete a journal entry
   */
  async deleteJournalEntry(entryId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('holoflower_journal_entries')
        .delete()
        .eq('id', entryId);

      if (error) {
        console.error('❌ [Journal] Error deleting entry:', error);
        return false;
      }

      console.log('✅ [Journal] Entry deleted:', entryId);
      return true;
    } catch (error) {
      console.error('❌ [Journal] Unexpected error:', error);
      return false;
    }
  }

  /**
   * Get soul patterns for the current user
   * These are MAIA's recognized patterns across multiple journal entries
   */
  async getSoulPatterns(): Promise<SoulPattern[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();

      if (!user) return [];

      const { data, error } = await this.supabase
        .from('soul_patterns')
        .select('*')
        .eq('user_id', user.id)
        .order('confidence_score', { ascending: false, nullsFirst: false });

      if (error) {
        console.error('❌ [Journal] Error fetching soul patterns:', error);
        return [];
      }

      return data as SoulPattern[];
    } catch (error) {
      console.error('❌ [Journal] Unexpected error:', error);
      return [];
    }
  }

  /**
   * Search journal entries by tags
   */
  async searchByTags(tags: string[]): Promise<HoloflowerJournalEntry[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();

      if (!user) return [];

      const { data, error } = await this.supabase
        .from('holoflower_journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .overlaps('tags', tags)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [Journal] Error searching by tags:', error);
        return [];
      }

      return data as HoloflowerJournalEntry[];
    } catch (error) {
      console.error('❌ [Journal] Unexpected error:', error);
      return [];
    }
  }

  /**
   * Get favorite entries
   */
  async getFavorites(): Promise<HoloflowerJournalEntry[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();

      if (!user) return [];

      const { data, error } = await this.supabase
        .from('holoflower_journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_favorite', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [Journal] Error fetching favorites:', error);
        return [];
      }

      return data as HoloflowerJournalEntry[];
    } catch (error) {
      console.error('❌ [Journal] Unexpected error:', error);
      return [];
    }
  }
}

// Export singleton instance
export const journalService = new JournalService();
