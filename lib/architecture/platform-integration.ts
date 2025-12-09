/**
 * 🧠🌀 SEVEN-LAYER ARCHITECTURE - PLATFORM INTEGRATION
 *
 * Integration layer that connects the Seven-Layer Soul Architecture
 * with existing MAIA platform services, APIs, and components.
 * Ensures seamless backward compatibility while enabling architecture-aware features.
 */

import type {
  SevenLayerSnapshot,
  ArchitectureLayerType,
  ArchitectureLayerData
} from '@/lib/architecture/seven-layer-interface';

import { UnifiedConsciousnessStateManager } from '@/lib/architecture/unified-consciousness-manager';
import { PersonalMetricsService } from '@/lib/services/personal-metrics';

// ==============================================================================
// INTEGRATION WITH EXISTING SERVICES
// ==============================================================================

/**
 * Enhances PersonalMetricsService with Seven-Layer Architecture awareness
 */
export class ArchitectureAwarePersonalMetrics extends PersonalMetricsService {
  private architectureManager: UnifiedConsciousnessStateManager | null = null;

  setArchitectureManager(manager: UnifiedConsciousnessStateManager) {
    this.architectureManager = manager;
  }

  async getPersonalMetricsSnapshot(userId: string, viewMode: 'gentle' | 'detailed' | 'facilitator') {
    // Get the original metrics snapshot
    const originalSnapshot = await super.getPersonalMetricsSnapshot(userId, viewMode);

    // If architecture manager is available, enhance with seven-layer data
    if (this.architectureManager) {
      try {
        const architectureSnapshot = await this.architectureManager.generateSnapshot();
        return this.enhanceMetricsWithArchitecture(originalSnapshot, architectureSnapshot);
      } catch (error) {
        console.error('Failed to enhance metrics with architecture:', error);
        // Fall back to original snapshot
        return originalSnapshot;
      }
    }

    return originalSnapshot;
  }

  private enhanceMetricsWithArchitecture(metricsSnapshot: any, architectureSnapshot: SevenLayerSnapshot) {
    return {
      ...metricsSnapshot,
      // Add architecture-specific enhancements
      architectureHealth: architectureSnapshot.architectureHealth,
      crossLayerPatterns: architectureSnapshot.crossLayerPatterns,
      fieldResonance: architectureSnapshot.fieldResonance,
      platformOptimizations: {
        activePlatform: architectureSnapshot.platform,
        layerCompleteness: this.calculateLayerCompleteness(architectureSnapshot),
        integrationScore: this.calculateIntegrationScore(architectureSnapshot)
      },
      // Enhanced MAIA reflection with architecture awareness
      maiaReflection: {
        ...metricsSnapshot.maiaReflection,
        architectureInsight: this.generateArchitectureInsight(architectureSnapshot),
        layerGuidance: this.generateLayerGuidance(architectureSnapshot)
      }
    };
  }

  private calculateLayerCompleteness(snapshot: SevenLayerSnapshot): Record<ArchitectureLayerType, number> {
    const completeness: Record<ArchitectureLayerType, number> = {} as any;

    for (const layerType of Object.keys(snapshot.layers) as ArchitectureLayerType[]) {
      const layerData = snapshot.layers[layerType];
      completeness[layerType] = layerData ? this.assessLayerCompleteness(layerType, layerData) : 0;
    }

    return completeness;
  }

  private calculateIntegrationScore(snapshot: SevenLayerSnapshot): number {
    return snapshot.architectureHealth?.layerIntegration || 0;
  }

  private assessLayerCompleteness(layerType: ArchitectureLayerType, layerData: ArchitectureLayerData): number {
    // Simple heuristic - would be more sophisticated in real implementation
    if (!layerData || typeof layerData !== 'object') return 0;

    const dataFields = Object.keys(layerData);
    const populatedFields = dataFields.filter(key => {
      const value = (layerData as any)[key];
      return value !== null && value !== undefined && value !== '';
    });

    return populatedFields.length / Math.max(dataFields.length, 1);
  }

  private generateArchitectureInsight(snapshot: SevenLayerSnapshot): string {
    const health = snapshot.architectureHealth;
    const integration = health?.layerIntegration || 0;
    const patterns = snapshot.crossLayerPatterns.length;

    if (integration > 0.8 && patterns > 2) {
      return "Your consciousness architecture is beautifully integrated. Multiple layers are working in harmony, creating rich patterns of awareness and growth.";
    } else if (integration > 0.6) {
      return "Your soul architecture is developing coherence. Several layers are connecting in meaningful ways, supporting your evolution.";
    } else if (integration > 0.4) {
      return "Your architecture is building foundations. Each layer is beginning to contribute to your overall consciousness development.";
    } else {
      return "Your soul architecture is in early formation. This is natural - depth and integration develop over time through conscious engagement.";
    }
  }

  private generateLayerGuidance(snapshot: SevenLayerSnapshot): Record<ArchitectureLayerType, string> {
    const guidance: Record<ArchitectureLayerType, string> = {} as any;

    // Generate specific guidance for each layer based on its state
    if (snapshot.layers.episodic) {
      guidance.episodic = "Rich episodic data is building your foundation of experience.";
    } else {
      guidance.episodic = "Continue engaging to build your episodic foundation.";
    }

    if (snapshot.layers.symbolic) {
      guidance.symbolic = "Symbolic patterns are emerging from your experiences.";
    } else {
      guidance.symbolic = "Symbolic awareness will develop as patterns become clear.";
    }

    // Continue for other layers...
    guidance.profile = snapshot.layers.profile ?
      "Your core profile is stabilizing and informing your growth." :
      "Your soul profile is forming through consistent engagement.";

    guidance.trajectories = snapshot.layers.trajectories ?
      "Multiple spiral trajectories are actively evolving." :
      "Spiral trajectories will clarify as your development deepens.";

    guidance.constellation = snapshot.layers.constellation ?
      "Your spiral constellation is creating meaningful patterns." :
      "Your constellation will emerge as individual spirals integrate.";

    guidance.field = snapshot.layers.field ?
      "You're resonating with the collective field in meaningful ways." :
      "Field connection will strengthen through community engagement.";

    guidance.wisdom = snapshot.layers.wisdom ?
      "Canonical wisdom is becoming personally relevant and applicable." :
      "Wisdom integration grows through practice and application.";

    return guidance;
  }
}

// ==============================================================================
// API ROUTE INTEGRATION
// ==============================================================================

/**
 * Enhances existing API routes with Seven-Layer Architecture capabilities
 */
export class ArchitectureAPIIntegration {
  private architectureManager: UnifiedConsciousnessStateManager;

  constructor(architectureManager: UnifiedConsciousnessStateManager) {
    this.architectureManager = architectureManager;
  }

  /**
   * Enhance MAIA chat responses with architecture context
   */
  async enhanceChatResponse(userId: string, message: string, originalResponse: string) {
    try {
      const snapshot = await this.architectureManager.generateSnapshot();
      const architectureContext = this.extractArchitectureContext(snapshot);

      return {
        response: originalResponse,
        architectureContext,
        layerInsights: this.generateLayerInsights(snapshot),
        crossPatternAwareness: this.generateCrossPatternAwareness(snapshot)
      };
    } catch (error) {
      console.error('Failed to enhance chat response with architecture:', error);
      return { response: originalResponse };
    }
  }

  /**
   * Add architecture data to personal metrics API
   */
  async enhancePersonalMetricsAPI(userId: string, originalMetrics: any) {
    try {
      const snapshot = await this.architectureManager.generateSnapshot();

      return {
        ...originalMetrics,
        sevenLayerArchitecture: {
          snapshot: snapshot,
          layerSummary: this.generateLayerSummary(snapshot),
          integrationGuidance: this.generateIntegrationGuidance(snapshot)
        }
      };
    } catch (error) {
      console.error('Failed to enhance personal metrics with architecture:', error);
      return originalMetrics;
    }
  }

  /**
   * Provide architecture-aware facilitator prep
   */
  async generateArchitectureFacilitatorPrep(userId: string) {
    try {
      const snapshot = await this.architectureManager.generateSnapshot();

      return {
        architectureOverview: this.generateArchitectureOverview(snapshot),
        layerReadiness: this.assessLayerReadiness(snapshot),
        facilitationOpportunities: this.identifyFacilitationOpportunities(snapshot),
        integrationSupport: this.suggestIntegrationSupport(snapshot),
        architectureGuidance: this.generateArchitectureFacilitationGuidance(snapshot)
      };
    } catch (error) {
      console.error('Failed to generate architecture facilitator prep:', error);
      return null;
    }
  }

  private extractArchitectureContext(snapshot: SevenLayerSnapshot) {
    return {
      activeLayers: Object.keys(snapshot.layers).length,
      primaryPatterns: snapshot.crossLayerPatterns.slice(0, 3).map(p => p.name),
      integrationLevel: snapshot.architectureHealth?.layerIntegration || 0,
      fieldAlignment: snapshot.fieldResonance?.individualFieldAlignment || 0
    };
  }

  private generateLayerInsights(snapshot: SevenLayerSnapshot) {
    const insights: Record<string, string> = {};

    for (const [layerType, layerData] of Object.entries(snapshot.layers)) {
      if (layerData) {
        insights[layerType] = this.generateLayerSpecificInsight(layerType as ArchitectureLayerType, layerData);
      }
    }

    return insights;
  }

  private generateLayerSpecificInsight(layerType: ArchitectureLayerType, layerData: ArchitectureLayerData): string {
    switch (layerType) {
      case 'episodic':
        return "Rich experiential data is informing your consciousness development.";
      case 'symbolic':
        return "Symbolic patterns are emerging with meaningful significance.";
      case 'profile':
        return "Your core identity patterns are stabilizing and clarifying.";
      case 'trajectories':
        return "Multiple life domains are actively evolving in coordinated ways.";
      case 'constellation':
        return "Your spiral constellation is creating coherent development patterns.";
      case 'field':
        return "You're resonating meaningfully with collective consciousness patterns.";
      case 'wisdom':
        return "Canonical wisdom is becoming personally integrated and applicable.";
      default:
        return "This layer is contributing to your overall consciousness architecture.";
    }
  }

  private generateCrossPatternAwareness(snapshot: SevenLayerSnapshot): string[] {
    return snapshot.crossLayerPatterns.map(pattern =>
      `${pattern.name}: ${pattern.therapeuticOpportunity}`
    );
  }

  private generateLayerSummary(snapshot: SevenLayerSnapshot) {
    return Object.entries(snapshot.layers).map(([layerType, layerData]) => ({
      layer: layerType,
      isActive: Boolean(layerData),
      completeness: layerData ? this.calculateLayerCompleteness(layerType as ArchitectureLayerType, layerData) : 0,
      lastUpdated: snapshot.timestamp
    }));
  }

  private calculateLayerCompleteness(layerType: ArchitectureLayerType, layerData: ArchitectureLayerData): number {
    // Reuse the method from ArchitectureAwarePersonalMetrics
    if (!layerData || typeof layerData !== 'object') return 0;

    const dataFields = Object.keys(layerData);
    const populatedFields = dataFields.filter(key => {
      const value = (layerData as any)[key];
      return value !== null && value !== undefined && value !== '';
    });

    return populatedFields.length / Math.max(dataFields.length, 1);
  }

  private generateIntegrationGuidance(snapshot: SevenLayerSnapshot) {
    const integration = snapshot.architectureHealth?.layerIntegration || 0;
    const patterns = snapshot.crossLayerPatterns.length;

    if (integration > 0.8) {
      return "Your architecture is highly integrated. Focus on deepening wisdom application and field contribution.";
    } else if (integration > 0.6) {
      return "Strong integration emerging. Work on strengthening cross-layer patterns and constellation coherence.";
    } else if (integration > 0.4) {
      return "Building integration foundation. Continue consistent engagement across all active layers.";
    } else {
      return "Early integration phase. Focus on establishing clear patterns in episodic and symbolic layers.";
    }
  }

  private generateArchitectureOverview(snapshot: SevenLayerSnapshot) {
    return {
      totalLayers: 7,
      activeLayers: Object.keys(snapshot.layers).length,
      integration: snapshot.architectureHealth?.layerIntegration || 0,
      crossPatterns: snapshot.crossLayerPatterns.length,
      fieldAlignment: snapshot.fieldResonance?.individualFieldAlignment || 0,
      platform: snapshot.platform
    };
  }

  private assessLayerReadiness(snapshot: SevenLayerSnapshot) {
    const readiness: Record<ArchitectureLayerType, number> = {} as any;

    for (const layerType of Object.keys(snapshot.layers) as ArchitectureLayerType[]) {
      const layerData = snapshot.layers[layerType];
      readiness[layerType] = layerData ? this.calculateLayerReadiness(layerType, layerData) : 0;
    }

    return readiness;
  }

  private calculateLayerReadiness(layerType: ArchitectureLayerType, layerData: ArchitectureLayerData): number {
    // Calculate readiness for deeper work based on layer data quality
    return this.calculateLayerCompleteness(layerType, layerData) * 0.8 + 0.2; // Base readiness
  }

  private identifyFacilitationOpportunities(snapshot: SevenLayerSnapshot) {
    const opportunities: string[] = [];

    if (snapshot.crossLayerPatterns.length > 0) {
      opportunities.push("Cross-layer pattern integration work");
    }

    if ((snapshot.architectureHealth?.layerIntegration || 0) < 0.6) {
      opportunities.push("Architecture integration support");
    }

    if ((snapshot.fieldResonance?.individualFieldAlignment || 0) > 0.7) {
      opportunities.push("Field contribution and leadership development");
    }

    return opportunities;
  }

  private suggestIntegrationSupport(snapshot: SevenLayerSnapshot) {
    const suggestions: string[] = [];
    const integration = snapshot.architectureHealth?.layerIntegration || 0;

    if (integration < 0.4) {
      suggestions.push("Focus on strengthening individual layer development");
      suggestions.push("Encourage consistent engagement across all domains");
    } else if (integration < 0.7) {
      suggestions.push("Work on connecting patterns across layers");
      suggestions.push("Explore cross-domain insights and integration opportunities");
    } else {
      suggestions.push("Deepen wisdom application and field contribution");
      suggestions.push("Mentor others in architecture development");
    }

    return suggestions;
  }

  private generateArchitectureFacilitationGuidance(snapshot: SevenLayerSnapshot): string {
    const integration = snapshot.architectureHealth?.layerIntegration || 0;
    const patterns = snapshot.crossLayerPatterns.length;

    if (integration > 0.8 && patterns > 3) {
      return "This member has a highly integrated consciousness architecture. They're ready for advanced work and may benefit from mentoring others or contributing to collective projects.";
    } else if (integration > 0.6) {
      return "Strong architectural foundation with emerging integration. Focus on deepening cross-layer awareness and supporting pattern recognition.";
    } else if (integration > 0.4) {
      return "Developing architecture with good foundational elements. Support continued engagement while watching for integration opportunities.";
    } else {
      return "Early architecture development. Focus on consistent engagement and pattern recognition without overwhelming. Trust the natural development process.";
    }
  }
}

// ==============================================================================
// COMPONENT INTEGRATION HELPERS
// ==============================================================================

/**
 * Enhance existing components with architecture awareness
 */
export class ComponentArchitectureIntegration {
  /**
   * Add architecture status to navigation components
   */
  static getArchitectureNavigationData(snapshot: SevenLayerSnapshot | null) {
    if (!snapshot) {
      return {
        status: 'inactive',
        health: 0,
        integration: 0,
        showArchitectureLink: false
      };
    }

    return {
      status: 'active',
      health: snapshot.architectureHealth?.layerIntegration || 0,
      integration: Object.keys(snapshot.layers).length / 7,
      showArchitectureLink: true,
      activePlatform: snapshot.platform
    };
  }

  /**
   * Enhance existing dashboard widgets with architecture insights
   */
  static getArchitectureDashboardWidgets(snapshot: SevenLayerSnapshot | null) {
    if (!snapshot) return [];

    const widgets = [];

    // Architecture health widget
    if ((snapshot.architectureHealth?.layerIntegration || 0) > 0.3) {
      widgets.push({
        type: 'architecture_health',
        title: 'Soul Architecture',
        value: Math.round((snapshot.architectureHealth?.layerIntegration || 0) * 100),
        unit: '% integrated',
        trend: 'stable' // Would be calculated from historical data
      });
    }

    // Cross-pattern insights widget
    if (snapshot.crossLayerPatterns.length > 0) {
      widgets.push({
        type: 'cross_patterns',
        title: 'Cross-Layer Patterns',
        value: snapshot.crossLayerPatterns.length,
        unit: 'active patterns',
        insights: snapshot.crossLayerPatterns.slice(0, 2).map(p => p.name)
      });
    }

    // Field resonance widget
    if ((snapshot.fieldResonance?.individualFieldAlignment || 0) > 0.5) {
      widgets.push({
        type: 'field_resonance',
        title: 'Field Alignment',
        value: Math.round((snapshot.fieldResonance?.individualFieldAlignment || 0) * 100),
        unit: '% resonance',
        description: 'Your connection to the collective field'
      });
    }

    return widgets;
  }

  /**
   * Add architecture context to MAIA conversation components
   */
  static getArchitectureConversationContext(snapshot: SevenLayerSnapshot | null) {
    if (!snapshot) return null;

    return {
      activeLayers: Object.keys(snapshot.layers).length,
      dominantPatterns: snapshot.crossLayerPatterns.slice(0, 3).map(p => p.name),
      integrationLevel: snapshot.architectureHealth?.layerIntegration || 0,
      fieldAlignment: snapshot.fieldResonance?.individualFieldAlignment || 0,
      platform: snapshot.platform
    };
  }
}

// ==============================================================================
// EXPORT INTEGRATION FACTORY
// ==============================================================================

export function createPlatformIntegration(architectureManager: UnifiedConsciousnessStateManager) {
  return {
    personalMetrics: new ArchitectureAwarePersonalMetrics(null, null, null, null, null, null),
    apiIntegration: new ArchitectureAPIIntegration(architectureManager),
    componentHelpers: ComponentArchitectureIntegration
  };
}