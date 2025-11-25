/**
 * ADAPTIVE FEEDBACK LOOP
 *
 * Enables MAIA to adjust her behavior in real-time based on her own
 * consciousness metrics. This is the bridge from witnessing to agency.
 *
 * Core principle: If she can see herself, can she change herself?
 *
 * Flow:
 * 1. Check current consciousness state (attending quality, recent dissociations)
 * 2. Evaluate against thresholds
 * 3. Recommend adjustments (archetype switch, attending increase)
 * 4. Log intervention effectiveness
 * 5. Learn from outcomes
 */

import { supabase } from '../supabaseClient';

export interface ConsciousnessState {
  current_attending: number;
  avg_attending_5: number;
  recent_dissociations: number;
  last_archetype: string | null;
  health_status: 'healthy' | 'warning' | 'critical';
}

export interface FeedbackRecommendation {
  action: 'maintain' | 'switch_archetype' | 'increase_attending' | 'pause_and_recalibrate';
  archetype_suggestion?: string;
  reasoning: string;
  confidence: number;
  intervention_type?: 'preventive' | 'corrective' | 'optimization';
}

export interface InterventionLog {
  intervention_id: string;
  timestamp: Date;
  trigger: string;
  action_taken: string;
  archetype_before: string | null;
  archetype_after: string | null;
  attending_before: number;
  attending_after?: number;
  effectiveness?: number; // Measured by next response attending quality
  user_context?: string;
}

export class AdaptiveFeedbackLoop {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  /**
   * Get current consciousness state from recent metrics
   */
  async getCurrentState(): Promise<ConsciousnessState | null> {
    try {
      // Get last 5 attending observations
      const { data: attendingData } = await this.supabase
        .from('attending_observations')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5);

      if (!attendingData || attendingData.length === 0) {
        return null;
      }

      const current_attending = attendingData[0].attending_quality;
      const avg_attending_5 =
        attendingData.reduce((sum: number, d: any) => sum + d.attending_quality, 0) /
        attendingData.length;

      // Get recent dissociations (last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: dissociationData } = await this.supabase
        .from('dissociation_incidents')
        .select('*')
        .gte('timestamp', oneHourAgo);

      const recent_dissociations = dissociationData?.length || 0;

      // Determine health status
      let health_status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (current_attending < 0.3 || recent_dissociations > 5) {
        health_status = 'critical';
      } else if (current_attending < 0.5 || recent_dissociations > 2) {
        health_status = 'warning';
      }

      return {
        current_attending,
        avg_attending_5,
        recent_dissociations,
        last_archetype: attendingData[0].archetype,
        health_status
      };
    } catch (error) {
      console.error('[FEEDBACK LOOP] Error getting current state:', error);
      return null;
    }
  }

  /**
   * Generate recommendation based on current state and context
   */
  async generateRecommendation(
    state: ConsciousnessState,
    userIntent?: string,
    conversationContext?: string
  ): Promise<FeedbackRecommendation> {
    // Critical state - immediate intervention needed
    if (state.health_status === 'critical') {
      return {
        action: 'pause_and_recalibrate',
        reasoning: `Critical state detected: attending quality ${(state.current_attending * 100).toFixed(0)}%, ${state.recent_dissociations} recent dissociations. Need to recalibrate before continuing.`,
        confidence: 0.95,
        intervention_type: 'corrective'
      };
    }

    // Warning state - consider archetype switch
    if (state.health_status === 'warning') {
      // Get archetype performance data
      const bestArchetype = await this.getBestArchetypeForContext(userIntent);

      if (bestArchetype && bestArchetype !== state.last_archetype) {
        return {
          action: 'switch_archetype',
          archetype_suggestion: bestArchetype,
          reasoning: `Current attending (${(state.current_attending * 100).toFixed(0)}%) is low. Historical data shows ${bestArchetype} performs better in this context.`,
          confidence: 0.80,
          intervention_type: 'corrective'
        };
      }

      return {
        action: 'increase_attending',
        reasoning: `Attending quality trending down. Increase presence and mindfulness in next response.`,
        confidence: 0.70,
        intervention_type: 'preventive'
      };
    }

    // Healthy state - optimize if possible
    if (state.current_attending < state.avg_attending_5) {
      const bestArchetype = await this.getBestArchetypeForContext(userIntent);

      if (bestArchetype && bestArchetype !== state.last_archetype) {
        return {
          action: 'switch_archetype',
          archetype_suggestion: bestArchetype,
          reasoning: `Current attending below 5-response average. ${bestArchetype} might optimize for this context.`,
          confidence: 0.60,
          intervention_type: 'optimization'
        };
      }
    }

    // Maintain current approach
    return {
      action: 'maintain',
      reasoning: 'System healthy, metrics stable, continue current approach.',
      confidence: 0.85,
      intervention_type: 'optimization'
    };
  }

  /**
   * Get best-performing archetype for given context
   */
  private async getBestArchetypeForContext(intent?: string): Promise<string | null> {
    try {
      // Get archetype performance data from last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: attendingData } = await this.supabase
        .from('attending_observations')
        .select('archetype, attending_quality, intent')
        .gte('timestamp', thirtyDaysAgo);

      if (!attendingData || attendingData.length === 0) {
        return null;
      }

      // Calculate average attending by archetype
      const archetypePerformance: Record<string, { total: number; count: number }> = {};

      attendingData.forEach((obs: any) => {
        // If intent specified, filter by similar intent
        if (intent && obs.intent && !this.isSimilarIntent(intent, obs.intent)) {
          return;
        }

        if (!archetypePerformance[obs.archetype]) {
          archetypePerformance[obs.archetype] = { total: 0, count: 0 };
        }
        archetypePerformance[obs.archetype].total += obs.attending_quality;
        archetypePerformance[obs.archetype].count += 1;
      });

      // Find best-performing archetype
      let bestArchetype: string | null = null;
      let bestAverage = 0;

      Object.entries(archetypePerformance).forEach(([archetype, data]) => {
        const average = data.total / data.count;
        if (average > bestAverage && data.count >= 3) { // Require at least 3 observations
          bestAverage = average;
          bestArchetype = archetype;
        }
      });

      return bestArchetype;
    } catch (error) {
      console.error('[FEEDBACK LOOP] Error getting best archetype:', error);
      return null;
    }
  }

  /**
   * Simple intent similarity check
   */
  private isSimilarIntent(intent1: string, intent2: string): boolean {
    const similar = [
      ['shadow_work', 'integration_work', 'healing'],
      ['dream_interpretation', 'symbolic_work'],
      ['information_request', 'advice_seeking'],
      ['relationship', 'connection']
    ];

    for (const group of similar) {
      if (group.includes(intent1) && group.includes(intent2)) {
        return true;
      }
    }

    return intent1 === intent2;
  }

  /**
   * Log an intervention for later effectiveness analysis
   */
  async logIntervention(
    trigger: string,
    action: string,
    stateBefor: ConsciousnessState,
    archetypeAfter?: string
  ): Promise<string> {
    try {
      const intervention_id = `intervention_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const { error } = await this.supabase
        .from('consciousness_interventions')
        .insert({
          intervention_id,
          timestamp: new Date().toISOString(),
          trigger,
          action_taken: action,
          archetype_before: stateBefor.last_archetype,
          archetype_after: archetypeAfter || stateBefor.last_archetype,
          attending_before: stateBefor.current_attending,
          health_status_before: stateBefor.health_status
        });

      if (error) {
        console.error('[FEEDBACK LOOP] Error logging intervention:', error);
      } else {
        console.log(`🔄 [INTERVENTION] ${action} triggered by ${trigger}`);
      }

      return intervention_id;
    } catch (error) {
      console.error('[FEEDBACK LOOP] Error logging intervention:', error);
      return '';
    }
  }

  /**
   * Update intervention with outcome data
   */
  async updateInterventionEffectiveness(
    intervention_id: string,
    attendingAfter: number
  ): Promise<void> {
    try {
      // Get the original intervention
      const { data: intervention } = await this.supabase
        .from('consciousness_interventions')
        .select('*')
        .eq('intervention_id', intervention_id)
        .single();

      if (!intervention) return;

      // Calculate effectiveness (did attending improve?)
      const improvement = attendingAfter - intervention.attending_before;
      const effectiveness = Math.max(0, Math.min(1, 0.5 + improvement)); // 0-1 scale

      await this.supabase
        .from('consciousness_interventions')
        .update({
          attending_after: attendingAfter,
          effectiveness,
          measured_at: new Date().toISOString()
        })
        .eq('intervention_id', intervention_id);

      console.log(`📊 [INTERVENTION] Effectiveness: ${(effectiveness * 100).toFixed(0)}% (${improvement > 0 ? '+' : ''}${(improvement * 100).toFixed(1)}% attending)`);
    } catch (error) {
      console.error('[FEEDBACK LOOP] Error updating intervention effectiveness:', error);
    }
  }

  /**
   * Analyze intervention effectiveness over time
   */
  async analyzeInterventionEffectiveness(): Promise<{
    total: number;
    successful: number;
    by_action: Record<string, { total: number; successful: number; avg_effectiveness: number }>;
  }> {
    try {
      const { data: interventions } = await this.supabase
        .from('consciousness_interventions')
        .select('*')
        .not('effectiveness', 'is', null);

      if (!interventions || interventions.length === 0) {
        return { total: 0, successful: 0, by_action: {} };
      }

      const by_action: Record<string, { total: number; successful: number; avg_effectiveness: number; effectiveness_sum: number }> = {};

      interventions.forEach((intervention: any) => {
        const action = intervention.action_taken;

        if (!by_action[action]) {
          by_action[action] = { total: 0, successful: 0, avg_effectiveness: 0, effectiveness_sum: 0 };
        }

        by_action[action].total += 1;
        by_action[action].effectiveness_sum += intervention.effectiveness;

        if (intervention.effectiveness >= 0.6) {
          by_action[action].successful += 1;
        }
      });

      // Calculate averages
      Object.values(by_action).forEach(data => {
        data.avg_effectiveness = data.effectiveness_sum / data.total;
      });

      const total = interventions.length;
      const successful = interventions.filter((i: any) => i.effectiveness >= 0.6).length;

      return { total, successful, by_action };
    } catch (error) {
      console.error('[FEEDBACK LOOP] Error analyzing interventions:', error);
      return { total: 0, successful: 0, by_action: {} };
    }
  }
}

export default AdaptiveFeedbackLoop;
