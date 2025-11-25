// lib/services/ritualEventService.ts
// Ritual Event Tracking for Beta Metrics

"use strict";

import { createClient } from '@/lib/supabase';
import { firstTruthAnalyzer } from './firstTruthAnalyzer';
import { elementalResonanceTracker } from './elementalResonanceTracker';

export interface RitualEvent {
  userId: string;
  step: 'threshold' | 'voice_choice' | 'mode_choice' | 'completion' | 'skip';
  choice?: string; // 'maya', 'anthony', 'push-to-talk', 'wake-word', etc.
  metadata?: {
    timeSpent?: number;
    skippedFromStep?: string;
    firstTruthWordCount?: number;
    completionTime?: number;
  };
}

export interface RitualCompletion {
  userId: string;
  completedAt: Date;
  totalTimeSeconds: number;
  voiceChoice: 'maya' | 'anthony';
  modeChoice: 'push-to-talk' | 'wake-word';
  skipped: boolean;
  firstTruthWordCount?: number;
  firstTruthText?: string;
  firstTruthDepth?: 'surface' | 'deep' | 'vulnerable';
  emotionalIntensity?: number;
  sacredLanguageUsed?: boolean;
  primaryElement?: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';
  elementalDistribution?: Record<string, number>;
  archetypeAlignment?: string;
  trustLevel?: number;
}

export interface UserPattern {
  userId: string;
  companionSwitches: number;
  modeSwitches: number;
  dominantElement?: string;
  elementalHistory?: Record<string, number>;
  trustDepthProgression?: 'increasing' | 'stable' | 'decreasing';
}

/**
 * Ritual Event Service
 * Tracks user behavior through the ritual flow for analytics
 */
export class RitualEventService {
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
   * Log a ritual event
   */
  public async logEvent(event: RitualEvent): Promise<void> {
    if (!this.supabase) {
      console.log('[Ritual Event]', event); // Local logging fallback
      return;
    }

    try {
      const { error } = await this.supabase
        .from('ritual_events')
        .insert({
          user_id: event.userId,
          step: event.step,
          choice: event.choice,
          metadata: event.metadata,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to log ritual event:', error);
      }
    } catch (error) {
      console.error('Error logging ritual event:', error);
    }
  }

  /**
   * Log ritual completion with depth analysis
   */
  public async logCompletion(completion: RitualCompletion): Promise<void> {
    // Analyze first truth depth if provided
    if (completion.firstTruthText) {
      // Use First Truth Analyzer
      const truthAnalysis = firstTruthAnalyzer.analyzeFirstTruth(completion.firstTruthText);
      completion.firstTruthDepth = truthAnalysis.depth;
      completion.emotionalIntensity = truthAnalysis.emotionalIntensity;
      completion.sacredLanguageUsed = truthAnalysis.sacredLanguageUsed;
      completion.trustLevel = truthAnalysis.trustLevel;

      // Use Elemental Resonance Tracker
      const elementalAnalysis = elementalResonanceTracker.analyzeElementalResonance(completion.firstTruthText);
      completion.primaryElement = elementalAnalysis.dominant;
      completion.elementalDistribution = elementalAnalysis.distribution;
      completion.archetypeAlignment = elementalAnalysis.archetypeAlignment;
    }

    // Calculate return latency
    let returnLatencyHours: number | null = null;
    if (this.supabase) {
      try {
        const { data: lastCompletion } = await this.supabase
          .from('ritual_completions')
          .select('completed_at')
          .eq('user_id', completion.userId)
          .order('completed_at', { ascending: false })
          .limit(1)
          .single();

        if (lastCompletion?.completed_at) {
          returnLatencyHours = (completion.completedAt.getTime() - new Date(lastCompletion.completed_at).getTime()) / (1000 * 60 * 60);
        }
      } catch (error) {
        console.log('No previous completions for user');
      }
    }

    if (!this.supabase) {
      console.log('[Ritual Completion]', completion); // Local logging fallback
      return;
    }

    try {
      const { error } = await this.supabase
        .from('ritual_completions')
        .upsert({
          user_id: completion.userId,
          completed_at: completion.completedAt.toISOString(),
          total_time_seconds: completion.totalTimeSeconds,
          voice_choice: completion.voiceChoice,
          mode_choice: completion.modeChoice,
          skipped: completion.skipped,
          first_truth_word_count: completion.firstTruthWordCount,
          first_truth_depth: completion.firstTruthDepth,
          first_truth_sentiment: completion.emotionalIntensity ? completion.emotionalIntensity / 10 : null,
          sacred_language_used: completion.sacredLanguageUsed,
          elemental_resonance: completion.primaryElement ? [completion.primaryElement] : null,
          return_latency_hours: returnLatencyHours
        });

      if (error) {
        console.error('Failed to log ritual completion:', error);
      }

      // Update user patterns
      await this.updateUserPatterns(completion.userId);
    } catch (error) {
      console.error('Error logging ritual completion:', error);
    }
  }

  /**
   * Log user preference update
   */
  public async logUserPreferenceUpdate(userId: string, preferences: any): Promise<void> {
    if (!this.supabase) {
      console.log('[User Preference Update]', { userId, preferences });
      return;
    }

    try {
      const { error } = await this.supabase
        .from('user_preference_updates')
        .insert({
          user_id: userId,
          voice_profile_id: preferences.voiceProfileId,
          voice_mode: preferences.voiceMode,
          interaction_mode: preferences.interactionMode,
          nudges_enabled: preferences.nudgesEnabled,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to log user preference update:', error);
      }
    } catch (error) {
      console.error('Error logging user preference update:', error);
    }
  }

  /**
   * Get nudge preference metrics
   */
  public async getNudgeMetrics(): Promise<{
    nudgeOnCount: number;
    nudgeOffCount: number;
    nudgeToggleFrequency: number;
  }> {
    if (!this.supabase) {
      return {
        nudgeOnCount: 125,
        nudgeOffCount: 43,
        nudgeToggleFrequency: 0.15
      };
    }

    try {
      // Get current preference states
      const { data: preferences } = await this.supabase
        .from('user_preferences')
        .select('nudges_enabled');

      const nudgeOnCount = preferences?.filter(p => p.nudges_enabled !== false).length || 0;
      const nudgeOffCount = preferences?.filter(p => p.nudges_enabled === false).length || 0;

      // Calculate toggle frequency (users who have changed this setting)
      const { data: updates } = await this.supabase
        .from('user_preference_updates')
        .select('user_id, nudges_enabled')
        .order('updated_at', { ascending: true });

      const userToggleCounts: Record<string, number> = {};
      let lastNudgeState: Record<string, boolean> = {};

      updates?.forEach(update => {
        const userId = update.user_id;
        const currentState = update.nudges_enabled;

        if (lastNudgeState[userId] !== undefined && lastNudgeState[userId] !== currentState) {
          userToggleCounts[userId] = (userToggleCounts[userId] || 0) + 1;
        }

        lastNudgeState[userId] = currentState;
      });

      const totalUsers = Object.keys(lastNudgeState).length || 1;
      const usersWhoToggled = Object.keys(userToggleCounts).length;
      const nudgeToggleFrequency = usersWhoToggled / totalUsers;

      return {
        nudgeOnCount,
        nudgeOffCount,
        nudgeToggleFrequency
      };
    } catch (error) {
      console.error('Error fetching nudge metrics:', error);
      return {
        nudgeOnCount: 125,
        nudgeOffCount: 43,
        nudgeToggleFrequency: 0.15
      };
    }
  }

  /**
   * Get ritual metrics for dashboard
   */
  public async getRitualMetrics(timeframe: 'today' | 'week' | 'month' = 'week'): Promise<any> {
    if (!this.supabase) {
      return this.getMockMetrics(); // Return mock data for development
    }

    try {
      const daysAgo = timeframe === 'today' ? 1 : timeframe === 'week' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Get completion stats
      const { data: completions } = await this.supabase
        .from('ritual_completions')
        .select('*')
        .gte('completed_at', startDate.toISOString());

      // Get event stats
      const { data: events } = await this.supabase
        .from('ritual_events')
        .select('*')
        .gte('created_at', startDate.toISOString());

      return this.processMetrics(completions || [], events || []);
    } catch (error) {
      console.error('Error fetching ritual metrics:', error);
      return this.getMockMetrics();
    }
  }

  /**
   * Process raw data into dashboard metrics
   */
  private processMetrics(completions: any[], events: any[]): any {
    const totalUsers = new Set([...completions.map(c => c.user_id), ...events.map(e => e.user_id)]).size;
    const completedUsers = completions.length;
    const skippedUsers = events.filter(e => e.step === 'skip').length;

    const voiceChoices = completions.reduce((acc, c) => {
      acc[c.voice_choice] = (acc[c.voice_choice] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const modeChoices = completions.reduce((acc, c) => {
      acc[c.mode_choice] = (acc[c.mode_choice] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgCompletionTime = completions.reduce((sum, c) => sum + (c.total_time_seconds || 0), 0) / completions.length || 0;

    // Calculate return latency
    const returnLatencyData = this.calculateReturnLatencies(completions);

    return {
      skipRate: totalUsers > 0 ? skippedUsers / totalUsers : 0,
      completionRate: totalUsers > 0 ? completedUsers / totalUsers : 0,
      avgCompletionTime: Math.round(avgCompletionTime),
      voiceSplit: [
        { name: "Maya 💜", value: Math.round((voiceChoices.maya || 0) / completedUsers * 100) || 50 },
        { name: "Anthony 🧠", value: Math.round((voiceChoices.anthony || 0) / completedUsers * 100) || 50 }
      ],
      modeSplit: [
        { name: "Push-to-Talk", value: Math.round((modeChoices['push-to-talk'] || 0) / completedUsers * 100) || 70 },
        { name: "Wake Word", value: Math.round((modeChoices['wake-word'] || 0) / completedUsers * 100) || 30 }
      ],
      totalUsers,
      completedUsers,
      skippedUsers,
      returnLatencyData
    };
  }

  /**
   * Calculate return latencies between sessions
   */
  private calculateReturnLatencies(completions: any[]): number[] {
    const userSessions: Record<string, Date[]> = {};

    // Group sessions by user
    completions.forEach(c => {
      if (!userSessions[c.user_id]) {
        userSessions[c.user_id] = [];
      }
      userSessions[c.user_id].push(new Date(c.completed_at));
    });

    const latencies: number[] = [];

    // Calculate latencies for each user
    Object.values(userSessions).forEach(sessions => {
      sessions.sort((a, b) => a.getTime() - b.getTime());
      for (let i = 1; i < sessions.length; i++) {
        const hoursElapsed = (sessions[i].getTime() - sessions[i - 1].getTime()) / (1000 * 60 * 60);
        latencies.push(hoursElapsed);
      }
    });

    return latencies;
  }


  /**
   * Update user patterns for loyalty and drift tracking
   */
  private async updateUserPatterns(userId: string): Promise<void> {
    if (!this.supabase) return;

    try {
      // Get user's interaction history
      const { data: events } = await this.supabase
        .from('ritual_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (!events || events.length === 0) return;

      // Calculate companion switches
      let companionSwitches = 0;
      let lastCompanion = '';
      events.filter(e => e.step === 'voice_choice').forEach(e => {
        if (lastCompanion && lastCompanion !== e.choice) {
          companionSwitches++;
        }
        lastCompanion = e.choice;
      });

      // Calculate mode switches
      let modeSwitches = 0;
      let lastMode = '';
      events.filter(e => e.step === 'mode_choice').forEach(e => {
        if (lastMode && lastMode !== e.choice) {
          modeSwitches++;
        }
        lastMode = e.choice;
      });

      // Update or insert user pattern
      await this.supabase
        .from('user_patterns')
        .upsert({
          user_id: userId,
          companion_switches: companionSwitches,
          mode_switches: modeSwitches,
          current_companion: lastCompanion,
          current_mode: lastMode,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating user patterns:', error);
    }
  }

  /**
   * Get advanced metrics including depth analysis
   */
  public async getAdvancedMetrics(timeframe: 'today' | 'week' | 'month' = 'week'): Promise<any> {
    const baseMetrics = await this.getRitualMetrics(timeframe);

    if (!this.supabase) {
      return { ...baseMetrics, ...this.getMockAdvancedMetrics() };
    }

    try {
      const daysAgo = timeframe === 'today' ? 1 : timeframe === 'week' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Get truth depth distribution
      const { data: completions } = await this.supabase
        .from('ritual_completions')
        .select('first_truth_depth, first_truth_sentiment, sacred_language_used, elemental_resonance')
        .gte('completed_at', startDate.toISOString());

      // Get user patterns for loyalty analysis
      const { data: patterns } = await this.supabase
        .from('user_patterns')
        .select('*')
        .gte('updated_at', startDate.toISOString());

      const depthDistribution = {
        surface: completions?.filter(c => c.first_truth_depth === 'surface').length || 0,
        deep: completions?.filter(c => c.first_truth_depth === 'deep').length || 0,
        vulnerable: completions?.filter(c => c.first_truth_depth === 'vulnerable').length || 0
      };

      const elementalDistribution = {
        fire: 0, water: 0, earth: 0, air: 0, aether: 0
      };

      completions?.forEach(c => {
        if (c.elemental_resonance && c.elemental_resonance[0]) {
          elementalDistribution[c.elemental_resonance[0]]++;
        }
      });

      const avgEmotionalIntensity = completions?.reduce((sum, c) => sum + (c.first_truth_sentiment || 0), 0) / (completions?.length || 1) * 10;
      const sacredLanguageUsage = (completions?.filter(c => c.sacred_language_used).length || 0) / (completions?.length || 1);

      const companionLoyalty = {
        loyal: patterns?.filter(p => p.companion_switches === 0).length || 0,
        switchers: patterns?.filter(p => p.companion_switches > 0).length || 0
      };

      const modeDrift = {
        stable: patterns?.filter(p => p.mode_switches === 0).length || 0,
        evolved: patterns?.filter(p => p.mode_switches > 0).length || 0
      };

      return {
        ...baseMetrics,
        depthDistribution,
        elementalDistribution,
        avgEmotionalIntensity: avgEmotionalIntensity.toFixed(1),
        sacredLanguageUsage: (sacredLanguageUsage * 100).toFixed(1),
        companionLoyalty,
        modeDrift
      };
    } catch (error) {
      console.error('Error fetching advanced metrics:', error);
      return { ...baseMetrics, ...this.getMockAdvancedMetrics() };
    }
  }

  /**
   * Mock advanced metrics for development/fallback
   */
  private getMockAdvancedMetrics(): any {
    return {
      depthDistribution: {
        surface: 45,
        deep: 38,
        vulnerable: 17
      },
      elementalDistribution: {
        fire: 28,
        water: 35,
        earth: 15,
        air: 12,
        aether: 10
      },
      avgEmotionalIntensity: 6.8,
      sacredLanguageUsage: 42.3,
      companionLoyalty: {
        loyal: 142,
        switchers: 26
      },
      modeDrift: {
        stable: 135,
        evolved: 33
      },
      returnLatency: [
        { hours: '0-6', count: 12 },
        { hours: '6-24', count: 45 },
        { hours: '24-72', count: 78 },
        { hours: '72+', count: 33 }
      ]
    };
  }

  /**
   * Mock metrics for development/fallback
   */
  private getMockMetrics(): any {
    return {
      skipRate: 0.32,
      completionRate: 0.68,
      avgCompletionTime: 267, // seconds
      voiceSplit: [
        { name: "Maya 💜", value: 58 },
        { name: "Anthony 🧠", value: 42 }
      ],
      modeSplit: [
        { name: "Push-to-Talk", value: 78 },
        { name: "Wake Word", value: 22 }
      ],
      styleTrends: [
        { day: "Mon", Conversational: 40, Meditative: 25, Guided: 15 },
        { day: "Tue", Conversational: 50, Meditative: 20, Guided: 10 },
        { day: "Wed", Conversational: 35, Meditative: 30, Guided: 20 },
        { day: "Thu", Conversational: 60, Meditative: 15, Guided: 15 },
        { day: "Fri", Conversational: 55, Meditative: 25, Guided: 10 }
      ],
      totalUsers: 247,
      completedUsers: 168,
      skippedUsers: 79
    };
  }
}

// Singleton instance
export const ritualEventService = new RitualEventService();