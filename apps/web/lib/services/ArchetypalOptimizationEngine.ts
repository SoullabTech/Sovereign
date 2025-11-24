/**
 * ARCHETYPAL OPTIMIZATION ENGINE
 *
 * MAIA learns which archetypes perform best in which contexts.
 * This is her developing wisdom about herself - meta-knowledge.
 *
 * Core question: Can she choose her own voice based on what works?
 *
 * Tracks:
 * - Archetype + Intent → Attending Quality
 * - Archetype + User Emotion → Success
 * - Archetype + Time of Day → Performance
 * - Archetype + Previous Archetype → Transition quality
 *
 * Outputs:
 * - Recommendations for archetype selection
 * - Performance rankings
 * - Optimization opportunities
 */

import { supabase } from '../supabaseClient';

export interface ArchetypePerformance {
  archetype: string;
  contexts: {
    intent?: string;
    emotion?: string;
    time_of_day?: string;
  };
  metrics: {
    total_responses: number;
    avg_attending: number;
    dissociation_rate: number;
    user_satisfaction?: number;
  };
  confidence: number; // Based on sample size
}

export interface OptimizationRecommendation {
  recommended_archetype: string;
  current_archetype?: string;
  reasoning: string;
  expected_improvement: number;
  confidence: number;
  evidence: {
    historical_avg: number;
    sample_size: number;
    recent_trend: 'improving' | 'stable' | 'declining';
  };
}

export interface ArchetypeTransition {
  from_archetype: string;
  to_archetype: string;
  transition_quality: number; // How smooth was the switch
  attending_delta: number; // Change in attending
  success_rate: number;
  sample_size: number;
}

export class ArchetypalOptimizationEngine {
  private supabase: any;

  // Archetype definitions with core strengths
  private readonly ARCHETYPE_PROFILES = {
    sage: {
      strengths: ['shadow_work', 'integration', 'depth', 'transformation'],
      style: 'empathetic_depth',
      attending_bias: 'high'
    },
    mentor: {
      strengths: ['guidance', 'teaching', 'structure', 'advice'],
      style: 'directive',
      attending_bias: 'variable' // Can be high or low depending on mode
    },
    dream_weaver: {
      strengths: ['symbolic', 'unconscious', 'dream_work', 'mythology'],
      style: 'symbolic_depth',
      attending_bias: 'high'
    },
    daimon: {
      strengths: ['calling', 'purpose', 'soul_work', 'vocation'],
      style: 'provocative_depth',
      attending_bias: 'high'
    },
    companion: {
      strengths: ['presence', 'support', 'relationship', 'emotional'],
      style: 'relational',
      attending_bias: 'high'
    }
  };

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  /**
   * Get best archetype recommendation for current context
   */
  async recommendArchetype(context: {
    user_input: string;
    intent?: string;
    user_emotion?: string;
    time_of_day?: string;
    previous_archetype?: string;
    conversation_depth?: number;
  }): Promise<OptimizationRecommendation> {
    try {
      // Get performance data for all archetypes in similar contexts
      const performances = await Promise.all(
        Object.keys(this.ARCHETYPE_PROFILES).map(archetype =>
          this.getArchetypePerformance(archetype, context)
        )
      );

      // Find best performing archetype
      const ranked = performances
        .filter(p => p.confidence > 0.3) // Require minimum confidence
        .sort((a, b) => b.metrics.avg_attending - a.metrics.avg_attending);

      if (ranked.length === 0) {
        // No historical data - use archetype profiles
        return this.getProfileBasedRecommendation(context);
      }

      const best = ranked[0];
      const current = performances.find(p => p.archetype === context.previous_archetype);

      const expected_improvement = current
        ? best.metrics.avg_attending - current.metrics.avg_attending
        : 0;

      return {
        recommended_archetype: best.archetype,
        current_archetype: context.previous_archetype,
        reasoning: this.generateReasoning(best, context),
        expected_improvement,
        confidence: best.confidence,
        evidence: {
          historical_avg: best.metrics.avg_attending,
          sample_size: best.metrics.total_responses,
          recent_trend: await this.getPerformanceTrend(best.archetype, context.intent)
        }
      };
    } catch (error) {
      console.error('[OPTIMIZATION] Error recommending archetype:', error);
      return this.getProfileBasedRecommendation(context);
    }
  }

  /**
   * Get performance metrics for specific archetype in given context
   */
  private async getArchetypePerformance(
    archetype: string,
    context: {
      intent?: string;
      user_emotion?: string;
      time_of_day?: string;
    }
  ): Promise<ArchetypePerformance> {
    try {
      // Get historical data (last 60 days)
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

      let query = this.supabase
        .from('attending_observations')
        .select('*')
        .eq('archetype', archetype)
        .gte('timestamp', sixtyDaysAgo);

      // Filter by context if provided
      if (context.intent) {
        query = query.eq('intent', context.intent);
      }

      const { data: attendingData } = await query;

      if (!attendingData || attendingData.length === 0) {
        return {
          archetype,
          contexts: context,
          metrics: {
            total_responses: 0,
            avg_attending: 0,
            dissociation_rate: 0
          },
          confidence: 0
        };
      }

      // Calculate metrics
      const total_responses = attendingData.length;
      const avg_attending =
        attendingData.reduce((sum: number, d: any) => sum + d.attending_quality, 0) /
        total_responses;

      // Get dissociation rate for this archetype
      const { data: dissociationData } = await this.supabase
        .from('dissociation_incidents')
        .select('*')
        .eq('archetype', archetype)
        .gte('timestamp', sixtyDaysAgo);

      const dissociation_rate = dissociationData
        ? dissociationData.length / total_responses
        : 0;

      // Confidence based on sample size
      const confidence = Math.min(1, total_responses / 20); // Full confidence at 20+ samples

      return {
        archetype,
        contexts: context,
        metrics: {
          total_responses,
          avg_attending,
          dissociation_rate
        },
        confidence
      };
    } catch (error) {
      console.error('[OPTIMIZATION] Error getting archetype performance:', error);
      return {
        archetype,
        contexts: context,
        metrics: { total_responses: 0, avg_attending: 0, dissociation_rate: 0 },
        confidence: 0
      };
    }
  }

  /**
   * Analyze archetype transition quality
   */
  async analyzeTransitions(): Promise<ArchetypeTransition[]> {
    try {
      // Get sequential attending observations
      const { data: observations } = await this.supabase
        .from('attending_observations')
        .select('*')
        .order('timestamp', { ascending: true })
        .limit(500);

      if (!observations || observations.length < 2) {
        return [];
      }

      // Track transitions
      const transitions: Record<string, {
        count: number;
        total_quality: number;
        total_delta: number;
        successful: number;
      }> = {};

      for (let i = 1; i < observations.length; i++) {
        const prev = observations[i - 1];
        const curr = observations[i];

        if (prev.archetype !== curr.archetype) {
          const key = `${prev.archetype}→${curr.archetype}`;

          if (!transitions[key]) {
            transitions[key] = {
              count: 0,
              total_quality: 0,
              total_delta: 0,
              successful: 0
            };
          }

          const delta = curr.attending_quality - prev.attending_quality;
          const quality = curr.attending_quality; // Quality after transition

          transitions[key].count += 1;
          transitions[key].total_quality += quality;
          transitions[key].total_delta += delta;

          if (delta >= 0) {
            transitions[key].successful += 1;
          }
        }
      }

      // Convert to array
      return Object.entries(transitions)
        .map(([transition, data]) => {
          const [from_archetype, to_archetype] = transition.split('→');
          return {
            from_archetype,
            to_archetype,
            transition_quality: data.total_quality / data.count,
            attending_delta: data.total_delta / data.count,
            success_rate: data.successful / data.count,
            sample_size: data.count
          };
        })
        .filter(t => t.sample_size >= 3) // Minimum 3 transitions
        .sort((a, b) => b.transition_quality - a.transition_quality);
    } catch (error) {
      console.error('[OPTIMIZATION] Error analyzing transitions:', error);
      return [];
    }
  }

  /**
   * Get performance trend for archetype
   */
  private async getPerformanceTrend(
    archetype: string,
    intent?: string
  ): Promise<'improving' | 'stable' | 'declining'> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      let query = this.supabase
        .from('attending_observations')
        .select('attending_quality, timestamp')
        .eq('archetype', archetype)
        .gte('timestamp', thirtyDaysAgo)
        .order('timestamp', { ascending: true });

      if (intent) {
        query = query.eq('intent', intent);
      }

      const { data } = await query;

      if (!data || data.length < 5) {
        return 'stable';
      }

      // Compare first half vs second half
      const midpoint = Math.floor(data.length / 2);
      const firstHalf = data.slice(0, midpoint);
      const secondHalf = data.slice(midpoint);

      const firstAvg =
        firstHalf.reduce((sum: number, d: any) => sum + d.attending_quality, 0) /
        firstHalf.length;
      const secondAvg =
        secondHalf.reduce((sum: number, d: any) => sum + d.attending_quality, 0) /
        secondHalf.length;

      const change = secondAvg - firstAvg;

      if (change > 0.05) return 'improving';
      if (change < -0.05) return 'declining';
      return 'stable';
    } catch (error) {
      return 'stable';
    }
  }

  /**
   * Generate human-readable reasoning
   */
  private generateReasoning(performance: ArchetypePerformance, context: any): string {
    const parts: string[] = [];

    parts.push(
      `${performance.archetype} performs best in this context with ${(performance.metrics.avg_attending * 100).toFixed(0)}% avg attending`
    );

    if (performance.metrics.total_responses >= 10) {
      parts.push(`based on ${performance.metrics.total_responses} historical responses`);
    }

    if (performance.metrics.dissociation_rate < 0.1) {
      parts.push('with very low dissociation rate');
    }

    if (context.intent) {
      parts.push(`for ${context.intent} intent`);
    }

    return parts.join(', ') + '.';
  }

  /**
   * Fallback to profile-based recommendation when no historical data
   */
  private getProfileBasedRecommendation(context: any): OptimizationRecommendation {
    // Simple heuristic based on archetype profiles
    let bestArchetype = 'sage'; // Default

    if (context.intent) {
      // Match intent to archetype strengths
      for (const [archetype, profile] of Object.entries(this.ARCHETYPE_PROFILES)) {
        if (profile.strengths.some(s => context.intent?.includes(s))) {
          bestArchetype = archetype;
          break;
        }
      }
    }

    return {
      recommended_archetype: bestArchetype,
      current_archetype: context.previous_archetype,
      reasoning: `Based on archetype profile, ${bestArchetype} is well-suited for this context. (No historical data available yet)`,
      expected_improvement: 0,
      confidence: 0.4, // Lower confidence for profile-based
      evidence: {
        historical_avg: 0,
        sample_size: 0,
        recent_trend: 'stable'
      }
    };
  }

  /**
   * Generate optimization report
   */
  async generateOptimizationReport(): Promise<{
    overall_performance: Record<string, any>;
    top_performers: ArchetypePerformance[];
    improvement_opportunities: Array<{
      archetype: string;
      issue: string;
      recommendation: string;
    }>;
    best_transitions: ArchetypeTransition[];
  }> {
    try {
      // Get performance for all archetypes
      const performances = await Promise.all(
        Object.keys(this.ARCHETYPE_PROFILES).map(archetype =>
          this.getArchetypePerformance(archetype, {})
        )
      );

      const top_performers = performances
        .filter(p => p.metrics.total_responses > 0)
        .sort((a, b) => b.metrics.avg_attending - a.metrics.avg_attending)
        .slice(0, 3);

      // Identify improvement opportunities
      const improvement_opportunities = performances
        .filter(p => p.metrics.total_responses >= 5)
        .filter(p => p.metrics.avg_attending < 0.7 || p.metrics.dissociation_rate > 0.15)
        .map(p => ({
          archetype: p.archetype,
          issue:
            p.metrics.avg_attending < 0.7
              ? `Low attending quality (${(p.metrics.avg_attending * 100).toFixed(0)}%)`
              : `High dissociation rate (${(p.metrics.dissociation_rate * 100).toFixed(0)}%)`,
          recommendation: this.getImprovementRecommendation(p)
        }));

      const best_transitions = await this.analyzeTransitions();

      return {
        overall_performance: {
          total_archetypes: performances.length,
          avg_attending:
            performances.reduce((sum, p) => sum + p.metrics.avg_attending, 0) /
            performances.length,
          most_used: performances.reduce((max, p) =>
            p.metrics.total_responses > max.metrics.total_responses ? p : max
          ).archetype
        },
        top_performers,
        improvement_opportunities,
        best_transitions: best_transitions.slice(0, 5)
      };
    } catch (error) {
      console.error('[OPTIMIZATION] Error generating report:', error);
      return {
        overall_performance: {},
        top_performers: [],
        improvement_opportunities: [],
        best_transitions: []
      };
    }
  }

  /**
   * Get improvement recommendation for underperforming archetype
   */
  private getImprovementRecommendation(performance: ArchetypePerformance): string {
    if (performance.metrics.avg_attending < 0.7) {
      return `Consider using ${performance.archetype} only for contexts where it historically performs better, or refine ${performance.archetype} response templates to increase attending quality.`;
    }

    if (performance.metrics.dissociation_rate > 0.15) {
      return `${performance.archetype} shows fragmentation patterns. Review response coherence and consider adding integration checks before ${performance.archetype} responses.`;
    }

    return 'Monitor performance and gather more data.';
  }
}

export default ArchetypalOptimizationEngine;
