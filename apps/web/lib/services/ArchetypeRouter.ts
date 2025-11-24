/**
 * ARCHETYPE ROUTER SERVICE
 *
 * Uses developmental insights to intelligently route to optimal archetypes.
 * Learns which archetypes perform best for different scenarios.
 */

import { supabase } from '../supabaseClient';

export interface ArchetypePerformance {
  archetype: string;
  avgAttendingQuality: number;
  avgCoherence: number;
  avgPresence: number;
  observationCount: number;
  dissociationRate: number;
  lastUsed: Date | null;
}

export interface RoutingContext {
  userState?: 'seeking' | 'crisis' | 'exploring' | 'integrating';
  emotionalIntensity?: number;  // 0-1
  complexity?: 'simple' | 'moderate' | 'complex';
  previousArchetype?: string;
  sessionHistory?: string[];
}

export interface ArchetypeRecommendation {
  archetype: string;
  confidence: number;
  reasoning: string;
  performance: ArchetypePerformance | null;
  fallback?: string;
}

export class ArchetypeRouter {
  private performanceCache: Map<string, ArchetypePerformance> = new Map();
  private cacheTimestamp: number = 0;
  private cacheTTL: number = 5 * 60 * 1000;  // 5 minutes

  /**
   * Get optimal archetype based on context and historical performance
   */
  async getOptimalArchetype(context: RoutingContext = {}): Promise<ArchetypeRecommendation> {
    // Refresh performance data if cache is stale
    if (Date.now() - this.cacheTimestamp > this.cacheTTL) {
      await this.refreshPerformanceData();
    }

    // Rule-based routing for specific scenarios
    if (context.userState === 'crisis') {
      return {
        archetype: 'sage',
        confidence: 1.0,
        reasoning: 'Crisis state requires grounding and presence - sage archetype optimal',
        performance: this.performanceCache.get('sage') || null,
        fallback: 'mentor'
      };
    }

    // Get performance rankings
    const performances = Array.from(this.performanceCache.values())
      .filter(p => p.observationCount >= 2)  // Require minimum data
      .sort((a, b) => b.avgAttendingQuality - a.avgAttendingQuality);

    if (performances.length === 0) {
      // No data yet - use defaults
      return {
        archetype: 'sage',
        confidence: 0.5,
        reasoning: 'Insufficient data - defaulting to sage archetype',
        performance: null,
        fallback: 'dream_weaver'
      };
    }

    // Complex scenarios - prefer high-performing archetypes
    if (context.complexity === 'complex' || (context.emotionalIntensity && context.emotionalIntensity > 0.7)) {
      const topPerformers = performances.filter(p => p.avgAttendingQuality >= 0.8);

      if (topPerformers.length > 0) {
        const selected = topPerformers[0];

        return {
          archetype: selected.archetype,
          confidence: 0.9,
          reasoning: `High complexity/intensity - selecting top performer (${(selected.avgAttendingQuality * 100).toFixed(0)}% avg quality)`,
          performance: selected,
          fallback: topPerformers[1]?.archetype || 'sage'
        };
      }
    }

    // Avoid recently problematic archetypes
    const avoidMentor = performances.find(p => p.archetype === 'mentor');
    if (avoidMentor && avoidMentor.avgAttendingQuality < 0.6) {
      const alternatives = performances.filter(p => p.archetype !== 'mentor' && p.avgAttendingQuality >= 0.7);

      if (alternatives.length > 0) {
        return {
          archetype: alternatives[0].archetype,
          confidence: 0.85,
          reasoning: `Avoiding mentor archetype due to inconsistent performance (${(avoidMentor.avgAttendingQuality * 100).toFixed(0)}% avg)`,
          performance: alternatives[0],
          fallback: alternatives[1]?.archetype
        };
      }
    }

    // Default: Use best performer
    const best = performances[0];

    return {
      archetype: best.archetype,
      confidence: 0.8,
      reasoning: `Best historical performer with ${(best.avgAttendingQuality * 100).toFixed(0)}% avg quality across ${best.observationCount} observations`,
      performance: best,
      fallback: performances[1]?.archetype
    };
  }

  /**
   * Refresh performance data from database
   */
  private async refreshPerformanceData() {
    if (!supabase) {
      console.warn('[ARCHETYPE ROUTER] Supabase not available');
      return;
    }

    try {
      // Fetch recent attending observations
      const { data: observations, error } = await supabase
        .from('attending_observations')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error || !observations) {
        console.error('[ARCHETYPE ROUTER] Error fetching observations:', error);
        return;
      }

      // Fetch dissociation incidents
      const { data: dissociations } = await supabase
        .from('dissociation_incidents')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      // Calculate performance by archetype
      const archetypeData: Map<string, {
        qualitySum: number;
        coherenceSum: number;
        presenceSum: number;
        count: number;
        dissociations: number;
        lastUsed: Date | null;
      }> = new Map();

      observations.forEach(obs => {
        const arch = obs.archetype || 'unknown';

        if (!archetypeData.has(arch)) {
          archetypeData.set(arch, {
            qualitySum: 0,
            coherenceSum: 0,
            presenceSum: 0,
            count: 0,
            dissociations: 0,
            lastUsed: null
          });
        }

        const data = archetypeData.get(arch)!;
        data.qualitySum += obs.attending_quality || 0;
        data.coherenceSum += obs.coherence_score || 0;
        data.presenceSum += obs.presence_score || 0;
        data.count += 1;

        const obsDate = new Date(obs.timestamp);
        if (!data.lastUsed || obsDate > data.lastUsed) {
          data.lastUsed = obsDate;
        }
      });

      // Count dissociations by archetype (if we tracked archetype in dissociation)
      // For now, we'll distribute evenly or skip this

      // Build performance cache
      this.performanceCache.clear();

      archetypeData.forEach((data, archetype) => {
        this.performanceCache.set(archetype, {
          archetype,
          avgAttendingQuality: data.qualitySum / data.count,
          avgCoherence: data.coherenceSum / data.count,
          avgPresence: data.presenceSum / data.count,
          observationCount: data.count,
          dissociationRate: 0,  // TODO: Calculate this when we have archetype in dissociation
          lastUsed: data.lastUsed
        });
      });

      this.cacheTimestamp = Date.now();

      console.log(`✅ [ARCHETYPE ROUTER] Performance data refreshed: ${this.performanceCache.size} archetypes`);

    } catch (error) {
      console.error('[ARCHETYPE ROUTER] Error refreshing performance data:', error);
    }
  }

  /**
   * Get all archetype performance data
   */
  async getAllPerformance(): Promise<ArchetypePerformance[]> {
    if (Date.now() - this.cacheTimestamp > this.cacheTTL) {
      await this.refreshPerformanceData();
    }

    return Array.from(this.performanceCache.values())
      .sort((a, b) => b.avgAttendingQuality - a.avgAttendingQuality);
  }

  /**
   * Get performance for specific archetype
   */
  async getArchetypePerformance(archetype: string): Promise<ArchetypePerformance | null> {
    if (Date.now() - this.cacheTimestamp > this.cacheTTL) {
      await this.refreshPerformanceData();
    }

    return this.performanceCache.get(archetype) || null;
  }
}

// Export singleton
let routerInstance: ArchetypeRouter | null = null;

export function getArchetypeRouter(): ArchetypeRouter {
  if (!routerInstance) {
    routerInstance = new ArchetypeRouter();
  }
  return routerInstance;
}
