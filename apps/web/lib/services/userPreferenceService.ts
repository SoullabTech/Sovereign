// lib/services/userPreferenceService.ts
// User Preference Management with Supabase persistence

"use strict";

import { createClient } from '@/lib/supabase';
import type { VoiceMode, InteractionMode } from '../agents/modules/VoiceSelectionUI';
import { ritualEventService } from './ritualEventService';

// Types for user preferences
export interface UserPreferences {
  userId: string;
  voiceProfileId: string;
  voiceMode: VoiceMode;
  interactionMode: InteractionMode;
  customWakeWord?: string;
  nudgesEnabled?: boolean;
  elementalAffinities?: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  journeyProgress?: {
    daysCompleted: number;
    currentPhase: string;
    favoriteElement?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface PreferenceUpdate {
  voiceProfileId?: string;
  voiceMode?: VoiceMode;
  interactionMode?: InteractionMode;
  customWakeWord?: string;
  nudgesEnabled?: boolean;
  elementalAffinities?: UserPreferences['elementalAffinities'];
  journeyProgress?: UserPreferences['journeyProgress'];
}

/**
 * User Preference Service
 * Handles persistence and retrieval of user voice/interaction preferences
 */
export class UserPreferenceService {
  private supabase: any;

  constructor() {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
    }
  }

  /**
   * Get user preferences with fallback defaults
   */
  public async getUserPreferences(userId: string): Promise<UserPreferences> {
    if (!this.supabase) {
      return this.getDefaultPreferences(userId);
    }

    try {
      const { data, error } = await this.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        console.log('No preferences found, creating defaults');
        return await this.createDefaultPreferences(userId);
      }

      return {
        userId: data.user_id,
        voiceProfileId: data.voice_profile_id || 'maya-nova',
        voiceMode: data.voice_mode || 'push-to-talk',
        interactionMode: data.interaction_mode || 'conversational',
        customWakeWord: data.custom_wake_word,
        nudgesEnabled: data.nudges_enabled !== false,
        elementalAffinities: data.elemental_affinities || {
          fire: 0, water: 0, earth: 0, air: 0, aether: 0
        },
        journeyProgress: data.journey_progress || {
          daysCompleted: 0,
          currentPhase: 'initiation'
        },
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return this.getDefaultPreferences(userId);
    }
  }

  /**
   * Update user preferences
   */
  public async updateUserPreferences(
    userId: string,
    updates: PreferenceUpdate
  ): Promise<UserPreferences> {
    if (!this.supabase) {
      // Return updated defaults if no database
      return {
        ...this.getDefaultPreferences(userId),
        ...updates
      };
    }

    try {
      const { data, error } = await this.supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          voice_profile_id: updates.voiceProfileId,
          voice_mode: updates.voiceMode,
          interaction_mode: updates.interactionMode,
          custom_wake_word: updates.customWakeWord,
          nudges_enabled: updates.nudgesEnabled,
          elemental_affinities: updates.elementalAffinities,
          journey_progress: updates.journeyProgress,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating preferences:', error);
        throw error;
      }

      const updatedPreferences = {
        userId: data.user_id,
        voiceProfileId: data.voice_profile_id,
        voiceMode: data.voice_mode,
        interactionMode: data.interaction_mode,
        customWakeWord: data.custom_wake_word,
        nudgesEnabled: data.nudges_enabled !== false,
        elementalAffinities: data.elemental_affinities,
        journeyProgress: data.journey_progress,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      // Log preference update for analytics
      await ritualEventService.logUserPreferenceUpdate(userId, updatedPreferences);

      return updatedPreferences;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  /**
   * Update journey progress specifically
   */
  public async updateJourneyProgress(
    userId: string,
    progress: UserPreferences['journeyProgress']
  ): Promise<void> {
    const current = await this.getUserPreferences(userId);
    await this.updateUserPreferences(userId, {
      journeyProgress: {
        ...current.journeyProgress,
        ...progress
      }
    });
  }

  /**
   * Update elemental affinities based on interactions
   */
  public async updateElementalAffinities(
    userId: string,
    element: string,
    strengthDelta: number
  ): Promise<void> {
    const current = await this.getUserPreferences(userId);
    const affinities = { ...current.elementalAffinities };

    if (affinities && element in affinities) {
      affinities[element as keyof typeof affinities] = Math.max(
        0,
        Math.min(10, affinities[element as keyof typeof affinities] + strengthDelta)
      );

      await this.updateUserPreferences(userId, {
        elementalAffinities: affinities
      });
    }
  }

  /**
   * Get voice configuration for user
   */
  public async getVoiceConfiguration(userId: string): Promise<{
    voiceProfileId: string;
    voiceMode: VoiceMode;
    interactionMode: InteractionMode;
    customWakeWord?: string;
  }> {
    const prefs = await this.getUserPreferences(userId);
    return {
      voiceProfileId: prefs.voiceProfileId,
      voiceMode: prefs.voiceMode,
      interactionMode: prefs.interactionMode,
      customWakeWord: prefs.customWakeWord
    };
  }

  /**
   * Create default preferences for new user
   */
  private async createDefaultPreferences(userId: string): Promise<UserPreferences> {
    const defaults = this.getDefaultPreferences(userId);

    if (this.supabase) {
      try {
        await this.supabase
          .from('user_preferences')
          .insert({
            user_id: userId,
            voice_profile_id: defaults.voiceProfileId,
            voice_mode: defaults.voiceMode,
            interaction_mode: defaults.interactionMode,
            nudges_enabled: defaults.nudgesEnabled,
            elemental_affinities: defaults.elementalAffinities,
            journey_progress: defaults.journeyProgress,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      } catch (error) {
        console.error('Error creating default preferences:', error);
      }
    }

    return defaults;
  }

  /**
   * Get default preferences structure
   */
  private getDefaultPreferences(userId: string): UserPreferences {
    return {
      userId,
      voiceProfileId: 'maya-nova',
      voiceMode: 'push-to-talk',
      interactionMode: 'conversational',
      nudgesEnabled: true,
      elementalAffinities: {
        fire: 0,
        water: 0,
        earth: 0,
        air: 0,
        aether: 0
      },
      journeyProgress: {
        daysCompleted: 0,
        currentPhase: 'initiation'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Get user's most resonant element
   */
  public async getMostResonantElement(userId: string): Promise<string> {
    const prefs = await this.getUserPreferences(userId);
    const affinities = prefs.elementalAffinities;

    if (!affinities) return 'fire'; // Default

    let maxElement = 'fire';
    let maxValue = affinities.fire;

    Object.entries(affinities).forEach(([element, value]) => {
      if (value > maxValue) {
        maxElement = element;
        maxValue = value;
      }
    });

    return maxElement;
  }

  /**
   * Export user data for privacy compliance
   */
  public async exportUserData(userId: string): Promise<any> {
    if (!this.supabase) return null;

    try {
      const { data } = await this.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId);

      return {
        preferences: data,
        exportedAt: new Date().toISOString(),
        userId
      };
    } catch (error) {
      console.error('Error exporting user data:', error);
      return null;
    }
  }

  /**
   * Delete all user data
   */
  public async deleteUserData(userId: string): Promise<boolean> {
    if (!this.supabase) return false;

    try {
      const { error } = await this.supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Error deleting user data:', error);
      return false;
    }
  }
}

// Singleton instance
export const userPreferenceService = new UserPreferenceService();