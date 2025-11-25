/**
 * Metrics Client SDK
 * Easy-to-use client for querying psychospiritual metrics
 */

import {
  ComprehensiveMetricsSnapshot,
  ArchetypeCoherenceScore,
  EmotionalCoherenceMetrics,
  NarrativeProgressionMetrics,
  ShadowIntegrationMetrics,
  RitualIntegrationMetrics,
  PsychospiritualGrowthIndex,
  SymbolicEvolutionMetrics,
  SpiralogicPhaseMetrics
} from './PsychospiritualMetricsEngine';

export type MetricComponent =
  | 'archetype-coherence'
  | 'emotional-landscape'
  | 'narrative-progression'
  | 'shadow-integration'
  | 'ritual-integration'
  | 'growth-index'
  | 'symbolic-evolution'
  | 'spiralogic-phase';

export class MetricsClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/metrics/psychospiritual') {
    this.baseUrl = baseUrl;
  }

  async getSnapshot(userId: string): Promise<ComprehensiveMetricsSnapshot | null> {
    try {
      const response = await fetch(`${this.baseUrl}?mode=snapshot&userId=${userId}`);

      if (!response.ok) {
        console.error('Failed to fetch snapshot:', response.statusText);
        return null;
      }

      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Error fetching snapshot:', error);
      return null;
    }
  }

  async getAggregatedMetrics(userIds?: string[]): Promise<any> {
    try {
      const userIdsParam = userIds ? `&userIds=${userIds.join(',')}` : '';
      const response = await fetch(`${this.baseUrl}?mode=aggregated${userIdsParam}`);

      if (!response.ok) {
        console.error('Failed to fetch aggregated metrics:', response.statusText);
        return null;
      }

      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Error fetching aggregated metrics:', error);
      return null;
    }
  }

  async getComponent<T = any>(userId: string, component: MetricComponent): Promise<T | null> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'compute-component',
          userId,
          data: { component }
        })
      });

      if (!response.ok) {
        console.error('Failed to fetch component:', response.statusText);
        return null;
      }

      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Error fetching component:', error);
      return null;
    }
  }

  async getArchetypeCoherence(userId: string): Promise<ArchetypeCoherenceScore | null> {
    return this.getComponent<ArchetypeCoherenceScore>(userId, 'archetype-coherence');
  }

  async getEmotionalLandscape(userId: string): Promise<EmotionalCoherenceMetrics | null> {
    return this.getComponent<EmotionalCoherenceMetrics>(userId, 'emotional-landscape');
  }

  async getNarrativeProgression(userId: string): Promise<NarrativeProgressionMetrics | null> {
    return this.getComponent<NarrativeProgressionMetrics>(userId, 'narrative-progression');
  }

  async getShadowIntegration(userId: string): Promise<ShadowIntegrationMetrics | null> {
    return this.getComponent<ShadowIntegrationMetrics>(userId, 'shadow-integration');
  }

  async getRitualIntegration(userId: string): Promise<RitualIntegrationMetrics | null> {
    return this.getComponent<RitualIntegrationMetrics>(userId, 'ritual-integration');
  }

  async getGrowthIndex(userId: string): Promise<PsychospiritualGrowthIndex | null> {
    return this.getComponent<PsychospiritualGrowthIndex>(userId, 'growth-index');
  }

  async getSymbolicEvolution(userId: string): Promise<SymbolicEvolutionMetrics | null> {
    return this.getComponent<SymbolicEvolutionMetrics>(userId, 'symbolic-evolution');
  }

  async getSpiralogicPhase(userId: string): Promise<SpiralogicPhaseMetrics | null> {
    return this.getComponent<SpiralogicPhaseMetrics>(userId, 'spiralogic-phase');
  }

  async getAlerts(userId: string): Promise<string[]> {
    const snapshot = await this.getSnapshot(userId);
    return snapshot?.alerts || [];
  }

  async getRecommendations(userId: string): Promise<string[]> {
    const snapshot = await this.getSnapshot(userId);
    return snapshot?.recommendations || [];
  }
}

export const metricsClient = new MetricsClient();