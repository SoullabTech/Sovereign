/**
 * Field-Depth Integration
 * Connects Resonance Field System with Spiral Journey & Depth Tracking
 *
 * Revolutionary insight: Field configuration RESPONDS to user's spiral position
 * As users go deeper, agent weights shift automatically
 * Memory isn't just storage - it's field resonance history
 */

import { FullFieldDominanceSystem, FieldConfig } from './phase4-field-dominance';
import { SpiralJourneyTracker, SPIRAL_FACETS } from '../spiral/SpiralJourneyTracker';
import { DepthStateTracker } from '../../apps/api/backend/src/oracle/intelligence/DepthStateTracker';

export interface FieldMemoryEntry {
  timestamp: Date;
  userInput: string;
  response: string | null;
  fieldState: {
    coherence: number;
    entropy: number;
    resonance: number;
    dominantFrequency: number;
  };
  depth: {
    currentDepth: number;
    phase: string;
  };
  spiral: {
    activeSpiralIds: string[];
    currentFacets: Record<string, string>;
    breakthroughDetected: boolean;
  };
  signature: string;
}

export interface SpiralFieldMapping {
  facetId: string;
  agentModulations: Record<string, number>; // Agent weight multipliers
  silenceThreshold: number;
  breathSensitivity: number;
}

/**
 * Maps spiral facets to field configurations
 * Different stages of the journey require different agent balances
 */
export const FACET_FIELD_MAPPINGS: Record<string, SpiralFieldMapping> = {
  // Stage 1: Innocence - High oracle, low shadow
  'innocence': {
    facetId: 'innocence',
    agentModulations: {
      'elemental-oracle': 1.3,
      'inner-child': 1.2,
      'higher-self': 1.1,
      'shadow': 0.5,
      'crisis-detection': 0.8
    },
    silenceThreshold: 0.4,
    breathSensitivity: 1.0
  },

  // Stage 3: Struggle - High crisis, attachment, conscious
  'struggle': {
    facetId: 'struggle',
    agentModulations: {
      'crisis-detection': 1.4,
      'attachment': 1.3,
      'conscious-mind': 1.2,
      'higher-self': 1.1,
      'shadow': 0.7,
      'unconscious': 0.8
    },
    silenceThreshold: 0.3, // Less silence during struggle
    breathSensitivity: 1.2
  },

  // Stage 8: Shadow - Maximum shadow, unconscious, lower self
  'shadow': {
    facetId: 'shadow',
    agentModulations: {
      'shadow': 1.5,
      'unconscious': 1.4,
      'lower-self': 1.3,
      'anima': 1.2,
      'higher-self': 0.9,
      'conscious-mind': 0.8
    },
    silenceThreshold: 0.5, // More silence for integration
    breathSensitivity: 1.4 // Breath is crucial here
  },

  // Stage 9: Death/Rebirth - All agents balanced, high silence
  'death': {
    facetId: 'death',
    agentModulations: {
      'shadow': 1.2,
      'unconscious': 1.2,
      'higher-self': 1.2,
      'lower-self': 1.2,
      'anima': 1.1
    },
    silenceThreshold: 0.6, // Maximum silence
    breathSensitivity: 1.5
  },

  // Stage 11: Integration - High conscious, higher self, wisdom
  'integration': {
    facetId: 'integration',
    agentModulations: {
      'claude-wisdom': 1.4,
      'higher-self': 1.3,
      'conscious-mind': 1.2,
      'elemental-oracle': 1.2,
      'shadow': 0.9
    },
    silenceThreshold: 0.4,
    breathSensitivity: 1.1
  },

  // Stage 12: Transcendence - Wisdom dominant, minimal others
  'transcendence': {
    facetId: 'transcendence',
    agentModulations: {
      'claude-wisdom': 1.5,
      'higher-self': 1.4,
      'anima': 1.3,
      'elemental-oracle': 1.1,
      'crisis-detection': 0.6,
      'attachment': 0.6
    },
    silenceThreshold: 0.7, // Sacred silence
    breathSensitivity: 1.6
  }
};

/**
 * Integrates Field System with Depth & Spiral Tracking
 */
export class FieldDepthIntegration {
  private fieldSystem: FullFieldDominanceSystem;
  private spiralTracker: SpiralJourneyTracker;
  private depthTracker: DepthStateTracker;
  private memorySpiral: FieldMemoryEntry[] = [];

  constructor(userId: string) {
    this.fieldSystem = new FullFieldDominanceSystem();
    this.spiralTracker = new SpiralJourneyTracker(userId);
    this.depthTracker = new DepthStateTracker();
  }

  /**
   * Generate response with full integration
   */
  async generateWithMemory(
    input: string,
    userId: string,
    breathState?: any
  ): Promise<{
    response: string | null;
    memory: FieldMemoryEntry;
    insights: string[];
  }> {
    // 1. Detect spiral context from input
    const spiralDetections = this.spiralTracker.detectSpiralContext(
      input,
      this.memorySpiral.slice(-5).map(m => m.userInput)
    );

    // 2. Update spiral positions
    for (const detection of spiralDetections.slice(0, 2)) { // Top 2
      this.spiralTracker.updateSpiralPosition(
        detection.spiral,
        detection.facet,
        detection.confidence * 0.1
      );
    }

    // 3. Get current spiral state
    const spiralState = this.getCurrentSpiralState();

    // 4. Modulate field based on spiral position
    this.modulateFieldForSpiral(spiralState);

    // 5. Generate field response
    const result = await this.fieldSystem.generate(input, userId, breathState);

    // 6. Update depth tracking
    const depthMetrics = this.depthTracker.update(input, result.response || '...');

    // 7. Create memory entry
    const memoryEntry: FieldMemoryEntry = {
      timestamp: new Date(),
      userInput: input,
      response: result.response,
      fieldState: {
        coherence: result.fieldState.coherence,
        entropy: result.fieldState.entropy,
        resonance: result.fieldState.resonance,
        dominantFrequency: result.fieldState.dominantFrequency
      },
      depth: {
        currentDepth: depthMetrics.currentDepth,
        phase: depthMetrics.phase
      },
      spiral: {
        activeSpiralIds: spiralDetections.slice(0, 2).map(d => d.spiral),
        currentFacets: spiralState.currentFacets,
        breakthroughDetected: depthMetrics.breakthroughMoments.length > 0
      },
      signature: result.signature
    };

    // 8. Add to memory spiral
    this.memorySpiral.push(memoryEntry);

    // 9. Trim old memories (keep last 100)
    if (this.memorySpiral.length > 100) {
      this.memorySpiral = this.memorySpiral.slice(-100);
    }

    // 10. Generate insights
    const insights = this.generateInsights(memoryEntry, spiralState);

    return {
      response: result.response,
      memory: memoryEntry,
      insights
    };
  }

  /**
   * Modulate field configuration based on spiral position
   */
  private modulateFieldForSpiral(spiralState: {
    primaryFacet: string;
    currentFacets: Record<string, string>;
    averageDepth: number;
  }): void {
    const mapping = FACET_FIELD_MAPPINGS[spiralState.primaryFacet];
    if (!mapping) return;

    const config = this.fieldSystem.getFieldConfig();

    // Apply facet-specific agent modulations
    for (const [agentName, multiplier] of Object.entries(mapping.agentModulations)) {
      const agent = config.agents.get(agentName);
      if (agent) {
        agent.weight *= multiplier;
      }
    }

    // Adjust silence threshold
    config.silenceThreshold = mapping.silenceThreshold;

    // Adjust breath sensitivity
    if (config.breathEntrained) {
      config.globalSensitivity *= mapping.breathSensitivity;
    }

    // Depth-based adjustments
    if (spiralState.averageDepth > 7) {
      // Very deep - amplify wisdom & unconscious
      config.agents.get('claude-wisdom')!.weight *= 1.2;
      config.agents.get('unconscious')!.weight *= 1.15;
      config.silenceThreshold *= 1.1; // More willing to be silent
    } else if (spiralState.averageDepth < 3) {
      // Shallow - amplify oracle & conscious
      config.agents.get('elemental-oracle')!.weight *= 1.15;
      config.agents.get('conscious-mind')!.weight *= 1.1;
    }

    this.fieldSystem.updateFieldConfig(config);
  }

  /**
   * Get current spiral state across all active spirals
   */
  private getCurrentSpiralState(): {
    primaryFacet: string;
    currentFacets: Record<string, string>;
    averageDepth: number;
  } {
    const vizData = this.spiralTracker.getVisualizationData();
    const depthMetrics = this.depthTracker.getMetrics();

    const currentFacets: Record<string, string> = {};
    for (const spiral of vizData.spirals) {
      // Would need to access spiral facets - simplified here
      currentFacets[spiral.id] = vizData.primaryFacet;
    }

    return {
      primaryFacet: vizData.primaryFacet,
      currentFacets,
      averageDepth: depthMetrics.currentDepth
    };
  }

  /**
   * Generate insights from memory and spiral position
   */
  private generateInsights(
    memory: FieldMemoryEntry,
    spiralState: any
  ): string[] {
    const insights: string[] = [];

    // Spiral insights
    const spiralInsights = this.spiralTracker.getInsights();
    insights.push(...spiralInsights);

    // Field coherence insights
    if (memory.fieldState.coherence > 0.8) {
      insights.push('Field is highly coherent - deep alignment present');
    } else if (memory.fieldState.coherence < 0.3) {
      insights.push('Field is scattered - multiple tensions present');
    }

    // Depth progression insights
    if (memory.depth.phase === 'integration' && memory.fieldState.resonance > 0.7) {
      insights.push('Integration phase with high resonance - wisdom crystallizing');
    }

    // Breakthrough detection
    if (memory.spiral.breakthroughDetected) {
      insights.push(`Breakthrough detected in ${memory.spiral.activeSpiralIds.join(', ')}`);
    }

    // Silence patterns
    if (memory.response === null && memory.fieldState.entropy < 0.4) {
      insights.push('Sacred silence - field awaiting deeper emergence');
    }

    return insights;
  }

  /**
   * Get memory patterns over time
   */
  getMemoryPatterns(): {
    dominantFacets: string[];
    depthProgression: number[];
    coherenceTrend: number[];
    frequentSignatures: string[];
    breakthroughMoments: FieldMemoryEntry[];
  } {
    // Get dominant facets from memory
    const facetCounts = new Map<string, number>();
    for (const entry of this.memorySpiral) {
      for (const facet of Object.values(entry.spiral.currentFacets)) {
        facetCounts.set(facet, (facetCounts.get(facet) || 0) + 1);
      }
    }

    const dominantFacets = Array.from(facetCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([facet]) => facet);

    // Depth progression
    const depthProgression = this.memorySpiral.map(m => m.depth.currentDepth);

    // Coherence trend
    const coherenceTrend = this.memorySpiral.map(m => m.fieldState.coherence);

    // Frequent signatures (recurring field patterns)
    const signatureCounts = new Map<string, number>();
    for (const entry of this.memorySpiral) {
      signatureCounts.set(entry.signature, (signatureCounts.get(entry.signature) || 0) + 1);
    }

    const frequentSignatures = Array.from(signatureCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([sig]) => sig);

    // Breakthrough moments
    const breakthroughMoments = this.memorySpiral.filter(
      m => m.spiral.breakthroughDetected
    );

    return {
      dominantFacets,
      depthProgression,
      coherenceTrend,
      frequentSignatures,
      breakthroughMoments
    };
  }

  /**
   * Get spiral visualization with field overlays
   */
  getSpiralVisualizationWithField(): {
    spirals: any[];
    fieldStates: Array<{
      position: { x: number; y: number };
      coherence: number;
      dominantFrequency: number;
    }>;
  } {
    const vizData = this.spiralTracker.getVisualizationData();

    // Map memory to spiral positions
    const fieldStates = this.memorySpiral.slice(-20).map((entry, idx) => {
      // Approximate position based on depth and time
      const angle = (idx / 20) * Math.PI * 2;
      const radius = 100 + (entry.depth.currentDepth * 10);

      return {
        position: {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius
        },
        coherence: entry.fieldState.coherence,
        dominantFrequency: entry.fieldState.dominantFrequency
      };
    });

    return {
      spirals: vizData.spirals,
      fieldStates
    };
  }

  /**
   * Export memory spiral for analysis
   */
  exportMemorySpiral(): FieldMemoryEntry[] {
    return [...this.memorySpiral];
  }

  /**
   * Get depth summary
   */
  getDepthSummary() {
    return this.depthTracker.getSummary();
  }

  /**
   * Reset for new conversation
   */
  reset(): void {
    this.memorySpiral = [];
    this.depthTracker.reset();
  }
}

export default FieldDepthIntegration;