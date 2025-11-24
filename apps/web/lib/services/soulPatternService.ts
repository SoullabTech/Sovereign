/**
 * SOUL PATTERN SERVICE
 *
 * Manages soul patterns in the database - MAIA's longitudinal understanding
 * of each person's essence, growth trajectory, and recurring themes.
 *
 * These are not raw data, but MAIA's interpretations of what she sees
 * across multiple encounters.
 */

import { getBrowserSupabaseClient } from '@/lib/supabaseBrowserClient';
import type { SoulPattern } from '@/types/journal';

export interface CreateSoulPatternInput {
  pattern_type: string;
  pattern_data: Record<string, any>;
  confidence_score?: number;
  occurrence_count: number;
  first_observed: string;
  last_observed: string;
  insight?: string;
}

export class SoulPatternService {
  private get supabase() {
    return getBrowserSupabaseClient();
  }

  /**
   * Save a new soul pattern
   */
  async saveSoulPattern(input: CreateSoulPatternInput): Promise<SoulPattern | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();

      if (!user) {
        console.error('❌ [SOUL PATTERN] No authenticated user');
        return null;
      }

      // Check if pattern already exists
      const { data: existing } = await this.supabase
        .from('soul_patterns')
        .select('*')
        .eq('user_id', user.id)
        .eq('pattern_type', input.pattern_type)
        .single();

      if (existing) {
        // Update existing pattern
        const { data, error } = await this.supabase
          .from('soul_patterns')
          .update({
            pattern_data: input.pattern_data,
            confidence_score: input.confidence_score,
            occurrence_count: input.occurrence_count,
            last_observed: input.last_observed,
            insight: input.insight
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          console.error('❌ [SOUL PATTERN] Error updating pattern:', error);
          return null;
        }

        console.log('✨ [SOUL PATTERN] Pattern updated:', input.pattern_type);
        return data as SoulPattern;
      } else {
        // Create new pattern
        const { data, error } = await this.supabase
          .from('soul_patterns')
          .insert([{
            user_id: user.id,
            ...input
          }])
          .select()
          .single();

        if (error) {
          console.error('❌ [SOUL PATTERN] Error creating pattern:', error);
          return null;
        }

        console.log('✨ [SOUL PATTERN] Pattern created:', input.pattern_type);
        return data as SoulPattern;
      }
    } catch (error) {
      console.error('❌ [SOUL PATTERN] Unexpected error:', error);
      return null;
    }
  }

  /**
   * Get all soul patterns for current user
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
        console.error('❌ [SOUL PATTERN] Error fetching patterns:', error);
        return [];
      }

      return data as SoulPattern[];
    } catch (error) {
      console.error('❌ [SOUL PATTERN] Unexpected error:', error);
      return [];
    }
  }

  /**
   * Get patterns by type
   */
  async getPatternsByType(patternType: string): Promise<SoulPattern[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();

      if (!user) return [];

      const { data, error } = await this.supabase
        .from('soul_patterns')
        .select('*')
        .eq('user_id', user.id)
        .eq('pattern_type', patternType)
        .order('last_observed', { ascending: false });

      if (error) {
        console.error('❌ [SOUL PATTERN] Error fetching patterns by type:', error);
        return [];
      }

      return data as SoulPattern[];
    } catch (error) {
      console.error('❌ [SOUL PATTERN] Unexpected error:', error);
      return [];
    }
  }

  /**
   * Delete a soul pattern
   */
  async deleteSoulPattern(patternId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('soul_patterns')
        .delete()
        .eq('id', patternId);

      if (error) {
        console.error('❌ [SOUL PATTERN] Error deleting pattern:', error);
        return false;
      }

      console.log('✅ [SOUL PATTERN] Pattern deleted:', patternId);
      return true;
    } catch (error) {
      console.error('❌ [SOUL PATTERN] Unexpected error:', error);
      return false;
    }
  }

  /**
   * Get MAIA's complete understanding (all patterns synthesized)
   */
  async getMAIAUnderstanding(): Promise<{
    dominantElements: string[];
    recurringArchetypes: string[];
    growthTrajectory: string | null;
    shadowThemes: string[];
    insights: string[];
  }> {
    const patterns = await this.getSoulPatterns();

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

      if (pattern.insight) {
        result.insights.push(pattern.insight);
      }
    });

    return result;
  }
}

// Export singleton
export const soulPatternService = new SoulPatternService();
