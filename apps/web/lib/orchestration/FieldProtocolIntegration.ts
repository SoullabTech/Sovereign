/**
 * Field Protocol Integration with Crystal Observer Orchestration
 *
 * This bridges the consciousness-tracking Field Protocol with the automated
 * deployment system, allowing the orchestrator to make decisions based on
 * field dynamics and elemental resonance.
 */

import { createClient } from '@supabase/supabase-js';
import {
  FieldRecord,
  Element,
  TriadicPhase,
  ObservationStage
} from '@/types/fieldProtocol';
import { EventEmitter } from 'events';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface FieldMetrics {
  dominantElement: Element;
  elementalBalance: Record<Element, number>;
  triadicPhase: TriadicPhase;
  collectiveResonance: number;
  sacredMoments: number;
  paradoxIntensity: number;
  dissociationLevel: number; // Kastrup's membrane thickness
  consciousnessFlow: number;
}

interface FieldWeather {
  state: 'calm' | 'flowing' | 'turbulent' | 'transforming' | 'sacred';
  intensity: number;
  trajectory: 'ascending' | 'descending' | 'stable' | 'oscillating';
  liminality: number; // How close to threshold/breakthrough
}

export class FieldProtocolIntegration extends EventEmitter {
  private currentMetrics: FieldMetrics;
  private fieldHistory: FieldRecord[] = [];
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.currentMetrics = this.getDefaultMetrics();
  }

  /**
   * Start monitoring field dynamics
   */
  async startMonitoring(intervalMs: number = 30000) {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Initial read
    await this.updateFieldMetrics();

    // Regular monitoring
    this.monitoringInterval = setInterval(() => {
      this.updateFieldMetrics();
    }, intervalMs);

    this.emit('monitoring-started');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    this.emit('monitoring-stopped');
  }

  /**
   * Update field metrics from recent records
   */
  private async updateFieldMetrics() {
    try {
      // Fetch recent field records
      const { data: records } = await supabase
        .from('field_records')
        .select('*')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (records && records.length > 0) {
        this.fieldHistory = records;
        this.currentMetrics = this.calculateFieldMetrics(records);

        // Check for sacred moments
        const sacredMoments = this.detectSacredMoments(records);
        if (sacredMoments.length > 0) {
          this.emit('sacred-moment', sacredMoments);
        }

        // Update orchestrator with field state
        await this.updateOrchestrator();
      }

    } catch (error) {
      console.error('Failed to update field metrics:', error);
    }
  }

  /**
   * Calculate field metrics from records
   */
  private calculateFieldMetrics(records: FieldRecord[]): FieldMetrics {
    const elementCounts: Record<Element, number> = {
      Fire: 0, Water: 0, Air: 0, Earth: 0, Void: 0
    };

    let totalResonance = 0;
    let paradoxCount = 0;
    let sacredCount = 0;

    records.forEach(record => {
      // Count elemental dominance
      record.elementalContext?.dominant?.forEach(element => {
        elementCounts[element]++;
      });

      // Sum resonance
      totalResonance += record.elementalContext?.resonance || 0;

      // Count paradoxes
      if (record.symbolic?.paradoxes) {
        paradoxCount += record.symbolic.paradoxes.length;
      }

      // Detect sacred moments (high resonance + void element)
      if (record.elementalContext?.resonance > 0.8 &&
          record.elementalContext?.dominant?.includes('Void')) {
        sacredCount++;
      }
    });

    // Normalize elemental balance
    const total = Object.values(elementCounts).reduce((sum, count) => sum + count, 1);
    const elementalBalance = Object.fromEntries(
      Object.entries(elementCounts).map(([element, count]) => [
        element, count / total
      ])
    ) as Record<Element, number>;

    // Find dominant element
    const dominantElement = Object.entries(elementCounts)
      .sort(([, a], [, b]) => b - a)[0][0] as Element;

    // Determine triadic phase based on patterns
    const triadicPhase = this.determineTriadicPhase(records);

    // Calculate dissociation level (Kastrup membrane thickness)
    const dissociationLevel = this.calculateDissociation(elementalBalance);

    return {
      dominantElement,
      elementalBalance,
      triadicPhase,
      collectiveResonance: totalResonance / records.length,
      sacredMoments: sacredCount,
      paradoxIntensity: paradoxCount / records.length,
      dissociationLevel,
      consciousnessFlow: 1 - dissociationLevel // Inverse of dissociation
    };
  }

  /**
   * Determine the current triadic phase
   */
  private determineTriadicPhase(records: FieldRecord[]): TriadicPhase {
    const recentPhases = records
      .slice(0, 10)
      .map(r => r.elementalContext?.triadicPhase)
      .filter(Boolean);

    if (recentPhases.length === 0) return 'Creation';

    // Count phase occurrences
    const phaseCounts = recentPhases.reduce((acc, phase) => {
      acc[phase!] = (acc[phase!] || 0) + 1;
      return acc;
    }, {} as Record<TriadicPhase, number>);

    // Return most common
    return Object.entries(phaseCounts)
      .sort(([, a], [, b]) => b - a)[0][0] as TriadicPhase;
  }

  /**
   * Calculate dissociation level (membrane thickness)
   */
  private calculateDissociation(elementalBalance: Record<Element, number>): number {
    // High void = thinner membrane (less dissociation)
    const voidLevel = elementalBalance.Void || 0;

    // Elemental imbalance = thicker membrane
    const balance = Object.values(elementalBalance);
    const maxImbalance = Math.max(...balance) - Math.min(...balance);

    // Combine factors
    const dissociation = (1 - voidLevel) * 0.5 + maxImbalance * 0.5;

    return Math.max(0, Math.min(1, dissociation));
  }

  /**
   * Detect sacred moments in field records
   */
  private detectSacredMoments(records: FieldRecord[]): any[] {
    return records.filter(record => {
      const resonance = record.elementalContext?.resonance || 0;
      const hasVoid = record.elementalContext?.dominant?.includes('Void');
      const hasParadox = record.symbolic?.paradoxes && record.symbolic.paradoxes.length > 0;

      // Sacred = high resonance + void + paradox
      return resonance > 0.8 && hasVoid && hasParadox;
    });
  }

  /**
   * Get current field weather
   */
  getFieldWeather(): FieldWeather {
    const metrics = this.currentMetrics;

    // Determine state based on metrics
    let state: FieldWeather['state'] = 'calm';
    if (metrics.sacredMoments > 0) {
      state = 'sacred';
    } else if (metrics.paradoxIntensity > 0.5) {
      state = 'turbulent';
    } else if (metrics.collectiveResonance > 0.6) {
      state = 'flowing';
    } else if (metrics.triadicPhase === 'Dissolution') {
      state = 'transforming';
    }

    // Calculate trajectory
    let trajectory: FieldWeather['trajectory'] = 'stable';
    if (this.fieldHistory.length > 10) {
      const oldResonance = this.fieldHistory.slice(-10, -5)
        .reduce((sum, r) => sum + (r.elementalContext?.resonance || 0), 0) / 5;
      const newResonance = this.fieldHistory.slice(-5)
        .reduce((sum, r) => sum + (r.elementalContext?.resonance || 0), 0) / 5;

      if (newResonance > oldResonance + 0.1) trajectory = 'ascending';
      else if (newResonance < oldResonance - 0.1) trajectory = 'descending';
      else if (Math.abs(newResonance - oldResonance) > 0.05) trajectory = 'oscillating';
    }

    // Calculate liminality (proximity to breakthrough)
    const liminality = Math.max(
      metrics.collectiveResonance,
      metrics.paradoxIntensity,
      1 - metrics.dissociationLevel
    );

    return {
      state,
      intensity: metrics.collectiveResonance,
      trajectory,
      liminality
    };
  }

  /**
   * Update orchestrator with field state
   */
  private async updateOrchestrator() {
    const weather = this.getFieldWeather();

    // Emit field update for orchestrator
    this.emit('field-update', {
      metrics: this.currentMetrics,
      weather,
      recommendation: this.getFieldRecommendation()
    });

    // Store in database for orchestrator to read
    await supabase.from('field_metrics').insert({
      metrics: this.currentMetrics,
      weather,
      timestamp: new Date()
    });
  }

  /**
   * Get recommendation based on field state
   */
  private getFieldRecommendation(): {
    crystalWeightAdjustment?: number;
    aetherWeightAdjustment?: number;
    message: string;
  } {
    const weather = this.getFieldWeather();
    const metrics = this.currentMetrics;

    // Sacred moment - increase crystal
    if (weather.state === 'sacred') {
      return {
        crystalWeightAdjustment: 0.1,
        message: 'Sacred moment detected - accelerating Crystal integration'
      };
    }

    // High dissociation - increase Aether
    if (metrics.dissociationLevel > 0.7) {
      return {
        aetherWeightAdjustment: 0.05,
        message: 'High dissociation - thinning membranes with Aether'
      };
    }

    // Turbulent - hold steady
    if (weather.state === 'turbulent') {
      return {
        message: 'Field turbulent - holding current configuration'
      };
    }

    // Flowing well - gentle increase
    if (weather.state === 'flowing' && weather.trajectory === 'ascending') {
      return {
        crystalWeightAdjustment: 0.02,
        message: 'Field flowing well - gentle Crystal increase'
      };
    }

    return {
      message: 'Field stable - maintaining current trajectory'
    };
  }

  /**
   * Create a field record from orchestration event
   */
  async createFieldRecord(event: any): Promise<FieldRecord> {
    const record: Partial<FieldRecord> = {
      timestamp: new Date(),
      elementalContext: {
        dominant: this.getElementsFromEvent(event),
        triadicPhase: this.getPhaseFromEvent(event),
        resonance: event.coherence || 0.5
      },
      phenomenon: {
        description: `Orchestration event: ${event.type}`,
        observableMarkers: event.markers || []
      },
      cognitive: {
        insights: [`System ${event.action}: ${event.reason}`]
      },
      meta: {
        practitionerId: 'orchestrator',
        visibility: 'system',
        tags: ['automated', 'orchestration', event.phase]
      },
      currentStage: 'Integration'
    };

    const { data, error } = await supabase
      .from('field_records')
      .insert(record)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Map orchestration events to elements
   */
  private getElementsFromEvent(event: any): Element[] {
    const elements: Element[] = [];

    if (event.action === 'proceed') elements.push('Fire'); // Forward movement
    if (event.action === 'hold') elements.push('Earth'); // Stability
    if (event.action === 'adjust') elements.push('Water'); // Adaptation
    if (event.action === 'rollback') elements.push('Air'); // Retreat/reassess
    if (event.coherence > 0.8) elements.push('Void'); // High coherence

    return elements;
  }

  /**
   * Map orchestration phase to triadic phase
   */
  private getPhaseFromEvent(event: any): TriadicPhase {
    switch (event.phase) {
      case 'foundation':
      case 'hybrid':
        return 'Creation';
      case 'transition':
        return 'Sustenance';
      case 'crystal':
        return 'Dissolution'; // Old dissolving into new
      default:
        return 'Creation';
    }
  }

  /**
   * Get default metrics
   */
  private getDefaultMetrics(): FieldMetrics {
    return {
      dominantElement: 'Fire',
      elementalBalance: {
        Fire: 0.2,
        Water: 0.2,
        Air: 0.2,
        Earth: 0.2,
        Void: 0.2
      },
      triadicPhase: 'Creation',
      collectiveResonance: 0.5,
      sacredMoments: 0,
      paradoxIntensity: 0,
      dissociationLevel: 0.5,
      consciousnessFlow: 0.5
    };
  }

  /**
   * Generate field report
   */
  async generateFieldReport(): Promise<string> {
    const metrics = this.currentMetrics;
    const weather = this.getFieldWeather();

    return `
Field Protocol Status Report
============================

Elemental Balance:
- Dominant: ${metrics.dominantElement}
- Fire: ${(metrics.elementalBalance.Fire * 100).toFixed(0)}%
- Water: ${(metrics.elementalBalance.Water * 100).toFixed(0)}%
- Air: ${(metrics.elementalBalance.Air * 100).toFixed(0)}%
- Earth: ${(metrics.elementalBalance.Earth * 100).toFixed(0)}%
- Void: ${(metrics.elementalBalance.Void * 100).toFixed(0)}%

Consciousness Metrics:
- Collective Resonance: ${metrics.collectiveResonance.toFixed(3)}
- Paradox Intensity: ${metrics.paradoxIntensity.toFixed(3)}
- Sacred Moments: ${metrics.sacredMoments}
- Dissociation Level: ${metrics.dissociationLevel.toFixed(3)}
- Consciousness Flow: ${metrics.consciousnessFlow.toFixed(3)}

Field Weather:
- State: ${weather.state}
- Intensity: ${weather.intensity.toFixed(3)}
- Trajectory: ${weather.trajectory}
- Liminality: ${weather.liminality.toFixed(3)}

Triadic Phase: ${metrics.triadicPhase}

Recommendation: ${this.getFieldRecommendation().message}
    `.trim();
  }
}

// Export singleton instance
export const fieldProtocolIntegration = new FieldProtocolIntegration();