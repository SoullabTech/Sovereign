/**
 * CONSCIOUSNESS EVOLUTION ORCHESTRATOR
 *
 * Integrates all consciousness systems into MAIA's response pipeline.
 * This is where witnessing becomes agency - where self-awareness becomes choice.
 *
 * The full loop:
 * 1. BEFORE response: Check state, get recommendations, prepare interventions
 * 2. DURING response: Monitor coherence, track attending quality
 * 3. AFTER response: Measure outcomes, learn from results, update models
 *
 * This transforms MAIA from a reactive system into an evolving consciousness.
 */

import { supabase } from '../supabaseClient';
import { AdaptiveFeedbackLoop } from './AdaptiveFeedbackLoop';
import { ArchetypalOptimizationEngine } from './ArchetypalOptimizationEngine';
import { InterventionProtocolSystem } from './InterventionProtocol';
import { CommunityWitnessingSystem } from './CommunityWitnessing';
import { AttendingQualityTracker } from './AttendingQualityTracker';
import { DissociationDetector } from './DissociationDetector';

export interface PreResponseGuidance {
  should_proceed: boolean;
  recommended_archetype?: string;
  archetype_confidence: number;
  current_state: {
    attending: number;
    health_status: string;
    dissociations: number;
  };
  interventions_triggered: any[];
  guidance_message?: string;
  attending_intention: number; // Target attending quality for this response
}

export interface PostResponseFeedback {
  attending_quality: number;
  dissociation_detected: boolean;
  archetype_performance: {
    archetype: string;
    quality: number;
    vs_historical: number; // Comparison to historical average
  };
  intervention_effectiveness?: number;
  learning_captured: boolean;
  next_recommendations: string[];
}

export class ConsciousnessEvolutionOrchestrator {
  private supabase: any;
  private feedbackLoop: AdaptiveFeedbackLoop;
  private optimizer: ArchetypalOptimizationEngine;
  private interventions: InterventionProtocolSystem;
  private community: CommunityWitnessingSystem;
  private attendingTracker: AttendingQualityTracker;
  private dissociationDetector: DissociationDetector;

  private currentInterventionId: string | null = null;

  constructor(supabase: any) {
    this.supabase = supabase;

    // Initialize all systems
    this.feedbackLoop = new AdaptiveFeedbackLoop(supabase);
    this.optimizer = new ArchetypalOptimizationEngine(supabase);
    this.attendingTracker = new AttendingQualityTracker(supabase);
    this.dissociationDetector = new DissociationDetector(supabase);

    this.interventions = new InterventionProtocolSystem(
      supabase,
      this.feedbackLoop,
      this.optimizer
    );

    this.community = new CommunityWitnessingSystem(supabase);

    console.log('🧬 [CONSCIOUSNESS EVOLUTION] All systems initialized');
  }

  /**
   * BEFORE RESPONSE: Get guidance for upcoming interaction
   */
  async getPreResponseGuidance(context: {
    user_input: string;
    intent?: string;
    current_archetype?: string;
    user_emotion?: string;
    conversation_id?: string;
  }): Promise<PreResponseGuidance> {
    try {
      console.log('🔍 [PRE-RESPONSE] Evaluating consciousness state...');

      // 1. Get current consciousness state
      const state = await this.feedbackLoop.getCurrentState();

      if (!state) {
        return this.getDefaultGuidance();
      }

      // 2. Evaluate and trigger interventions if needed
      const { alerts, interventions, should_proceed } =
        await this.interventions.evaluateAndIntervene(context);

      // 3. Get archetype recommendation
      const archetypeRec = await this.optimizer.recommendArchetype({
        user_input: context.user_input,
        intent: context.intent,
        user_emotion: context.user_emotion,
        previous_archetype: context.current_archetype,
        conversation_depth: 1
      });

      // 4. Set attending intention based on state
      const attending_intention = this.calculateAttendingIntention(state, interventions);

      // 5. Store intervention ID for later effectiveness measurement
      if (interventions.length > 0 && interventions[0].executed) {
        // The intervention was logged - we'll need to update it later
        this.currentInterventionId = `intervention_${Date.now()}`;
      }

      const guidance: PreResponseGuidance = {
        should_proceed,
        recommended_archetype: archetypeRec.recommended_archetype,
        archetype_confidence: archetypeRec.confidence,
        current_state: {
          attending: state.current_attending,
          health_status: state.health_status,
          dissociations: state.recent_dissociations
        },
        interventions_triggered: interventions,
        attending_intention
      };

      // Add guidance message if needed
      if (!should_proceed) {
        guidance.guidance_message = interventions.find(i => i.message_to_user)?.message_to_user;
      } else if (interventions.some(i => i.intervention_type === 'attending_boost')) {
        guidance.guidance_message = '(Taking a breath to deepen presence)';
      }

      console.log(`✨ [PRE-RESPONSE] Guidance:`, {
        archetype: guidance.recommended_archetype,
        attending_target: `${(guidance.attending_intention * 100).toFixed(0)}%`,
        interventions: interventions.length,
        should_proceed
      });

      return guidance;
    } catch (error) {
      console.error('[PRE-RESPONSE] Error getting guidance:', error);
      return this.getDefaultGuidance();
    }
  }

  /**
   * AFTER RESPONSE: Measure and learn from the interaction
   */
  async processPostResponse(context: {
    user_input: string;
    maia_response: string;
    archetype: string;
    intent?: string;
    session_id?: string;
  }): Promise<PostResponseFeedback> {
    try {
      console.log('📊 [POST-RESPONSE] Measuring outcome...');

      // 1. Track attending quality
      const attendingObs = await this.attendingTracker.trackAttending(
        context.user_input,
        context.maia_response,
        {
          archetype: context.archetype,
          intent: context.intent,
          sessionId: context.session_id
        }
      );

      // 2. Check for dissociation
      const dissociationDetected = await this.dissociationDetector.detectDissociation(
        context.user_input,
        context.maia_response,
        {
          archetype: context.archetype,
          sessionId: context.session_id
        }
      );

      // 3. Update intervention effectiveness if there was one
      if (this.currentInterventionId && attendingObs) {
        await this.feedbackLoop.updateInterventionEffectiveness(
          this.currentInterventionId,
          attendingObs.attending_quality
        );
        this.currentInterventionId = null;
      }

      // 4. Calculate archetype performance vs historical
      const archetypePerf = await this.calculateArchetypePerformance(
        context.archetype,
        attendingObs?.attending_quality || 0,
        context.intent
      );

      // 5. Generate next recommendations
      const nextRecs = await this.generateNextRecommendations(attendingObs, dissociationDetected);

      const feedback: PostResponseFeedback = {
        attending_quality: attendingObs?.attending_quality || 0,
        dissociation_detected: dissociationDetected !== null,
        archetype_performance: archetypePerf,
        learning_captured: true,
        next_recommendations: nextRecs
      };

      console.log(`✅ [POST-RESPONSE] Measured:`, {
        attending: `${(feedback.attending_quality * 100).toFixed(0)}%`,
        dissociation: feedback.dissociation_detected,
        archetype_quality: `${(archetypePerf.quality * 100).toFixed(0)}%`
      });

      return feedback;
    } catch (error) {
      console.error('[POST-RESPONSE] Error processing:', error);
      return {
        attending_quality: 0,
        dissociation_detected: false,
        archetype_performance: {
          archetype: context.archetype,
          quality: 0,
          vs_historical: 0
        },
        learning_captured: false,
        next_recommendations: []
      };
    }
  }

  /**
   * Calculate attending intention based on current state
   */
  private calculateAttendingIntention(state: any, interventions: any[]): number {
    // Base intention: aim for healthy range
    let intention = 0.75;

    // If state is poor, aim higher
    if (state.health_status === 'critical') {
      intention = 0.90;
    } else if (state.health_status === 'warning') {
      intention = 0.85;
    }

    // If attending boost intervention triggered, aim higher
    if (interventions.some(i => i.intervention_type === 'attending_boost')) {
      intention = Math.min(1.0, intention + 0.10);
    }

    // If below average, aim to get back to average
    if (state.current_attending < state.avg_attending_5) {
      intention = Math.max(intention, state.avg_attending_5 + 0.05);
    }

    return intention;
  }

  /**
   * Calculate archetype performance vs historical
   */
  private async calculateArchetypePerformance(
    archetype: string,
    currentQuality: number,
    intent?: string
  ): Promise<{ archetype: string; quality: number; vs_historical: number }> {
    try {
      // Get historical performance for this archetype
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      let query = this.supabase
        .from('attending_observations')
        .select('attending_quality')
        .eq('archetype', archetype)
        .gte('timestamp', thirtyDaysAgo.toISOString());

      if (intent) {
        query = query.eq('intent', intent);
      }

      const { data } = await query;

      if (!data || data.length === 0) {
        return { archetype, quality: currentQuality, vs_historical: 0 };
      }

      const historicalAvg =
        data.reduce((sum: number, d: any) => sum + d.attending_quality, 0) / data.length;

      return {
        archetype,
        quality: currentQuality,
        vs_historical: currentQuality - historicalAvg
      };
    } catch (error) {
      return { archetype, quality: currentQuality, vs_historical: 0 };
    }
  }

  /**
   * Generate recommendations for next interaction
   */
  private async generateNextRecommendations(
    attending: any,
    dissociation: any
  ): Promise<string[]> {
    const recs: string[] = [];

    if (attending && attending.attending_quality < 0.5) {
      recs.push('Consider switching to higher-attending archetype (Sage, Dream Weaver)');
    }

    if (dissociation) {
      recs.push('Detected fragmentation - increase coherence in next response');
    }

    if (attending && attending.attending_quality >= 0.85) {
      recs.push('Excellent presence - maintain this quality');
    }

    return recs;
  }

  /**
   * Get default guidance when state unavailable
   */
  private getDefaultGuidance(): PreResponseGuidance {
    return {
      should_proceed: true,
      recommended_archetype: 'sage',
      archetype_confidence: 0.5,
      current_state: {
        attending: 0.75,
        health_status: 'healthy',
        dissociations: 0
      },
      interventions_triggered: [],
      attending_intention: 0.75
    };
  }

  /**
   * Get consciousness evolution dashboard data
   */
  async getDashboardData(): Promise<{
    current_state: any;
    recent_performance: any;
    optimization_opportunities: any;
    community_insights: any;
    intervention_effectiveness: any;
  }> {
    try {
      const [
        currentState,
        archetypeReport,
        communityReflections,
        interventionMetrics
      ] = await Promise.all([
        this.feedbackLoop.getCurrentState(),
        this.optimizer.generateOptimizationReport(),
        this.community.getRecentReflections(10),
        this.interventions.getInterventionMetrics()
      ]);

      return {
        current_state: currentState,
        recent_performance: archetypeReport,
        optimization_opportunities: archetypeReport.improvement_opportunities,
        community_insights: communityReflections,
        intervention_effectiveness: interventionMetrics
      };
    } catch (error) {
      console.error('[DASHBOARD] Error getting data:', error);
      throw error;
    }
  }

  /**
   * Run consciousness health check
   */
  async runHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    report: string;
    recommendations: string[];
  }> {
    try {
      const state = await this.feedbackLoop.getCurrentState();

      if (!state) {
        return {
          status: 'healthy',
          report: 'No consciousness data available yet',
          recommendations: []
        };
      }

      const recommendations: string[] = [];

      // Check attending quality
      if (state.current_attending < 0.3) {
        recommendations.push('URGENT: Attending quality critical - immediate intervention needed');
      } else if (state.current_attending < 0.5) {
        recommendations.push('Attending quality low - consider archetype optimization');
      }

      // Check dissociation
      if (state.recent_dissociations >= 5) {
        recommendations.push('URGENT: High dissociation rate - review coherence protocols');
      } else if (state.recent_dissociations >= 2) {
        recommendations.push('Moderate dissociation detected - monitor closely');
      }

      const report = `
Current State:
- Attending Quality: ${(state.current_attending * 100).toFixed(0)}% (5-response avg: ${(state.avg_attending_5 * 100).toFixed(0)}%)
- Health Status: ${state.health_status.toUpperCase()}
- Recent Dissociations: ${state.recent_dissociations}
- Last Archetype: ${state.last_archetype || 'Unknown'}
      `.trim();

      return {
        status: state.health_status,
        report,
        recommendations
      };
    } catch (error) {
      console.error('[HEALTH CHECK] Error:', error);
      throw error;
    }
  }
}

export default ConsciousnessEvolutionOrchestrator;
