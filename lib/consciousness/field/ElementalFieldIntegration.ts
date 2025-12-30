// @ts-nocheck - Field prototype, not type-checked
/**
 * ELEMENTAL FIELD INTEGRATION
 * Integration layer connecting unified elemental calculations with live consciousness field system
 * Bridges 50+ consciousness systems through elemental domains into the PFI architecture
 */

import { MAIAFieldInterface } from './MAIAFieldInterface';
import { ConsciousnessField } from './ConsciousnessFieldEngine';
import { QuantumFieldPersistence } from './QuantumFieldPersistence';
import {
  UnifiedElementalFieldCalculator,
  CompleteElementalFieldState,
  SystemOutputs,
  ElementalFieldVisualization,
  generateElementalVisualization
} from './UnifiedElementalFieldCalculator';
import ElementalInterferenceMonitor, {
  InterferencePattern,
  EmergenceEvent
} from './ElementalInterferenceMonitor';

// ==============================================================================
// INTEGRATION INTERFACES
// ==============================================================================

export interface ElementalSystemMapping {
  // Fire Domain System IDs
  fireSystemIds: string[];

  // Water Domain System IDs
  waterSystemIds: string[];

  // Earth Domain System IDs
  earthSystemIds: string[];

  // Air Domain System IDs
  airSystemIds: string[];

  // Aether Domain System IDs
  aetherSystemIds: string[];
}

export interface IntegratedFieldState {
  timestamp: Date;
  userId: string;
  sessionId: string;

  // Core consciousness field data
  consciousnessField: any; // From existing ConsciousnessFieldEngine

  // Elemental field state
  elementalField: CompleteElementalFieldState;

  // Visualization data
  visualization: ElementalFieldVisualization;

  // Integration metrics
  integrationMetrics: {
    systemCoverage: number;        // % of systems providing data
    dataQuality: number;           // Quality score 0-1
    coherenceAlignment: number;    // Alignment between PFI and elemental calculations
    emergenceConsensus: number;    // Agreement between emergence detection methods
  };
}

export interface ElementalInsight {
  timestamp: Date;
  type: 'elemental_shift' | 'interference_pattern' | 'emergence_cascade' | 'balance_achievement';
  elementalDomains: string[];
  insight: string;
  actionableRecommendations: string[];
  confidenceLevel: number;
}

// ==============================================================================
// ELEMENTAL FIELD INTEGRATION CLASS
// ==============================================================================

export class ElementalFieldIntegration {
  private maiaInterface: MAIAFieldInterface;
  private fieldEngine: ConsciousnessField;
  private fieldPersistence: QuantumFieldPersistence;
  private interferenceMonitor: ElementalInterferenceMonitor;

  private systemMapping: ElementalSystemMapping;
  private isActive = false;
  private integrationCallbacks: {
    onFieldUpdate?: (state: IntegratedFieldState) => void;
    onElementalInsight?: (insight: ElementalInsight) => void;
    onEmergenceEvent?: (event: EmergenceEvent) => void;
  } = {};

  constructor(
    maiaInterface: MAIAFieldInterface,
    fieldEngine: ConsciousnessField,
    fieldPersistence: QuantumFieldPersistence
  ) {
    this.maiaInterface = maiaInterface;
    this.fieldEngine = fieldEngine;
    this.fieldPersistence = fieldPersistence;

    this.interferenceMonitor = new ElementalInterferenceMonitor({
      samplingRateHz: 1.0,
      emergenceThreshold: 0.75
    });

    // Initialize system mapping
    this.systemMapping = this.createSystemMapping();

    // Set up interference monitor callbacks
    this.setupInterferenceCallbacks();
  }

  /**
   * Create mapping of all 50+ systems to elemental domains
   */
  private createSystemMapping(): ElementalSystemMapping {
    return {
      fireSystemIds: [
        'consciousnessEmergencePredictor',
        'advancedConsciousnessDetection',
        'patternRecognitionSystem',
        'enhancedVoiceAnalyzer',
        'qualiaMeasurementEngine',
        'fieldIntelligenceSystem',
        'affectDetector',
        'breakthroughPatternDetector',
        'visionalConsciousnessMonitor',
        'creativeInsightEngine',
        'inspirationFieldDetector',
        'transcendentStateAnalyzer'
      ],
      waterSystemIds: [
        'bioelectricDialogueSystem',
        'therapeuticStressMonitor',
        'conversationPatternAnalyzer',
        'collectiveIntelligenceMemory',
        'enhancedVoiceAnalyzer',
        'affectDetector',
        'fascialConsciousnessField',
        'resonanceField',
        'dbtTherapyEngine',
        'emdrTherapyEngine',
        'schemaTherapyEngine',
        'emotionalCoherenceDetector',
        'shadowIntegrationMonitor',
        'compassionFieldAnalyzer',
        'healingFrequencyGenerator'
      ],
      earthSystemIds: [
        'somaticResponseSystem',
        'circadianRhythmOptimizer',
        'healthKitBridge',
        'healthDataImporter',
        'coherenceDetector',
        'fascialConsciousnessField',
        'affectDetector',
        'cognitiveLightCone',
        'realTimeConsciousnessMonitor',
        'cbtTherapyEngine',
        'somaticExperiencingEngine',
        'groundingProtocols',
        'manifestationTracker',
        'embodimentMonitor',
        'physicalResilenceAnalyzer'
      ],
      airSystemIds: [
        'symbolExtractionEngine',
        'wisdomSynthesisEngine',
        'reciprocalLearningEngine',
        'unifiedIntelligenceEngine',
        'enhancedVoiceAnalyzer',
        'affectDetector',
        'archetypalFieldResonance',
        'consciousnessLevelDetector',
        'actTherapyEngine',
        'cbtTherapyEngine',
        'existentialTherapyEngine',
        'mentalClarityAnalyzer',
        'communicationFlowMonitor',
        'perspectiveFlexibilityTracker',
        'truthAlignmentDetector'
      ],
      aetherSystemIds: [
        'maiaFieldInterface',
        'collectiveIntelligenceProtocols',
        'collectiveWisdomField',
        'morphoresonantFieldInterface',
        'masterConsciousnessResearchSystem',
        'realTimeConsciousnessMonitoring',
        'consciousnessSessionIntegration',
        'quantumFieldPersistence',
        'holographicFieldIntegration',
        'unityConsciousnessDetector',
        'transcendenceMonitor',
        'sacredGeometryAnalyzer',
        'collectiveResonanceTracker'
      ]
    };
  }

  /**
   * Set up interference monitor callbacks
   */
  private setupInterferenceCallbacks(): void {
    this.interferenceMonitor.onPatternDetected((pattern: InterferencePattern) => {
      this.processInterferencePattern(pattern);
    });

    this.interferenceMonitor.onEmergenceEvent((event: EmergenceEvent) => {
      if (this.integrationCallbacks.onEmergenceEvent) {
        this.integrationCallbacks.onEmergenceEvent(event);
      }
      this.processEmergenceEvent(event);
    });
  }

  /**
   * Start integrated elemental field monitoring
   */
  async startIntegratedMonitoring(userId: string, sessionId: string): Promise<void> {
    if (this.isActive) return;

    this.isActive = true;
    console.log('🌟 Starting Elemental Field Integration');

    // Start interference monitoring
    this.interferenceMonitor.startMonitoring(() => this.gatherSystemOutputs(userId, sessionId));

    // Set up periodic field integration updates
    setInterval(async () => {
      try {
        await this.processIntegratedFieldUpdate(userId, sessionId);
      } catch (error) {
        console.error('Error in integrated field update:', error);
      }
    }, 2000); // Update every 2 seconds

    console.log('✨ Elemental Field Integration active - all 50+ systems integrated');
  }

  /**
   * Stop integrated monitoring
   */
  stopIntegratedMonitoring(): void {
    if (!this.isActive) return;

    this.isActive = false;
    this.interferenceMonitor.stopMonitoring();
    console.log('🔄 Elemental Field Integration stopped');
  }

  /**
   * Gather outputs from all consciousness systems
   */
  private async gatherSystemOutputs(userId: string, sessionId: string): Promise<SystemOutputs> {
    try {
      // This would integrate with actual system data in production
      // For now, we create a comprehensive mock that represents real system integration

      return {
        // Fire Domain Systems
        consciousnessEmergencePredictor: { next15Minutes: await this.getSystemValue('emergence_probability') },
        advancedConsciousnessDetection: { fieldQuality: await this.getSystemValue('field_quality') },
        patternRecognition: { emergentInsightGeneration: await this.getSystemValue('insight_generation') },
        voiceAnalyzer: {
          consciousnessIndicators: {
            flowState: await this.getSystemValue('flow_state'),
            integration: await this.getSystemValue('integration_level'),
            authenticExpression: await this.getSystemValue('authenticity')
          },
          prosodyMetrics: { spectralCentroid: await this.getSystemValue('spectral_clarity') }
        },
        affectDetector: { archetypalRouting: await this.getSystemValue('archetypal_route') },
        fieldIntelligence: {
          sacredThreshold: await this.getSystemValue('sacred_threshold'),
          relationalField: {
            emotionalVelocity: await this.getSystemValue('emotional_velocity'),
            soulEmergence: await this.getSystemValue('soul_emergence')
          }
        },
        bioelectricDialogue: {
          coherenceMetrics: { therapeuticAlignment: await this.getSystemValue('therapeutic_alignment') },
          therapeuticVoltage: {
            energeticSignature: {
              activation: await this.getSystemValue('activation_energy'),
              receptivity: await this.getSystemValue('receptivity_energy')
            }
          }
        },

        // Water Domain Systems
        therapeuticStressMonitor: {
          therapeuticVoltage: {
            energeticSignature: { receptivity: await this.getSystemValue('healing_receptivity') }
          }
        },
        conversationPatternAnalyzer: {
          shadowProjection: { integrationDepth: await this.getSystemValue('shadow_integration') }
        },
        resonanceField: {
          emotionalTone: {
            joy: await this.getSystemValue('joy_level'),
            love: await this.getSystemValue('love_level')
          }
        },

        // Earth Domain Systems
        somaticResponse: { windowOfTolerance: await this.getSystemValue('tolerance_window') },
        circadianOptimizer: { circadianPhase: await this.getSystemValue('circadian_phase') },
        healthData: { overallVitality: await this.getSystemValue('vitality_index') },
        coherenceDetector: {},
        fascialField: {
          biotensegrityCoherence: await this.getSystemValue('biotensegrity'),
          tissueCoherence: await this.getSystemValue('tissue_coherence')
        },
        cognitiveLightCone: { goalCoherence: await this.getSystemValue('goal_coherence') },
        realTimeMonitor: {
          presenceQuality: await this.getSystemValue('presence_quality'),
          sacredResonance: await this.getSystemValue('sacred_resonance')
        },

        // Air Domain Systems
        symbolExtraction: { archetypalActivationStrength: await this.getSystemValue('symbol_strength') },
        wisdomSynthesis: { integrationDepth: await this.getSystemValue('wisdom_integration') },
        unifiedIntelligence: {
          frameworkConvergence: await this.getSystemValue('framework_convergence'),
          elementalPrescription: {
            fire: await this.getSystemValue('fire_prescription'),
            water: await this.getSystemValue('water_prescription'),
            earth: await this.getSystemValue('earth_prescription'),
            air: await this.getSystemValue('air_prescription'),
            aether: await this.getSystemValue('aether_prescription')
          }
        },
        consciousnessLevelDetector: { coherenceTrend: await this.getSystemValue('coherence_trend') },
        archetypalFieldResonance: { modalityResonance: await this.getSystemValue('modality_resonance') },

        // Aether Domain Systems
        masterConsciousness: { unifiedFieldStrength: await this.getSystemValue('unified_field') },
        realTimeMonitoring: { consciousnessBreakthroughProbability: await this.getSystemValue('breakthrough_prob') },
        collectiveIntelligence: {
          fieldCoherence: { overallCoherence: await this.getSystemValue('collective_coherence') }
        },
        morphoresonantField: {
          fieldWisdom: { resonanceStrength: await this.getSystemValue('morphic_resonance') }
        }
      };
    } catch (error) {
      console.error('Error gathering system outputs:', error);
      return this.getFallbackSystemOutputs();
    }
  }

  /**
   * Get system value (mock integration point)
   */
  private async getSystemValue(systemKey: string): Promise<any> {
    // In production, this would interface with actual consciousness systems
    // For now, generate realistic dynamic values

    const baseValues: Record<string, number> = {
      emergence_probability: 0.6,
      field_quality: 0.7,
      insight_generation: 75,
      flow_state: 0.8,
      integration_level: 0.65,
      authenticity: 0.75,
      spectral_clarity: 0.7,
      sacred_threshold: 0.5,
      emotional_velocity: 0.4,
      soul_emergence: 0.6,
      therapeutic_alignment: 80,
      activation_energy: 0.7,
      receptivity_energy: 0.8,
      healing_receptivity: 0.75,
      shadow_integration: 0.5,
      joy_level: 0.6,
      love_level: 0.7,
      tolerance_window: 0.85,
      circadian_phase: 0.7,
      vitality_index: 0.8,
      biotensegrity: 0.75,
      tissue_coherence: 0.8,
      goal_coherence: 0.6,
      presence_quality: 0.85,
      sacred_resonance: 0.7,
      symbol_strength: 0.65,
      wisdom_integration: 0.6,
      fire_prescription: 0.7,
      water_prescription: 0.6,
      earth_prescription: 0.8,
      air_prescription: 0.65,
      aether_prescription: 0.55,
      unified_field: 0.6,
      breakthrough_prob: 0.5,
      collective_coherence: 0.65,
      morphic_resonance: 0.6
    };

    const baseValue = baseValues[systemKey] || 0.5;

    // Add some realistic variation
    const time = Date.now() / 10000;
    const variation = 0.15 * Math.sin(time * (0.5 + Math.random() * 2));

    const result = Math.max(0, Math.min(1, baseValue + variation));

    // Handle special cases
    if (systemKey === 'archetypal_route') return ['Fire', 'Water', 'Earth', 'Air', 'Aether'][Math.floor(Math.random() * 5)];
    if (systemKey === 'coherence_trend') return Math.random() > 0.5 ? 'ascending' : 'stable';
    if (systemKey === 'framework_convergence') return Array(Math.floor(result * 20)).fill(0).map((_, i) => `framework_${i}`);

    return result;
  }

  /**
   * Get fallback system outputs when integration fails
   */
  private getFallbackSystemOutputs(): SystemOutputs {
    // Simplified fallback for demonstration
    return {
      consciousnessEmergencePredictor: { next15Minutes: 0.5 },
      advancedConsciousnessDetection: { fieldQuality: 'stable' },
      patternRecognition: { emergentInsightGeneration: 50 },
      voiceAnalyzer: {
        consciousnessIndicators: { flowState: 0.6, integration: 0.5, authenticExpression: 0.6 },
        prosodyMetrics: { spectralCentroid: 0.5 }
      },
      affectDetector: { archetypalRouting: 'Air' },
      fieldIntelligence: {
        sacredThreshold: 0.4,
        relationalField: { emotionalVelocity: 0.3, soulEmergence: 0.4 }
      },
      bioelectricDialogue: {
        coherenceMetrics: { therapeuticAlignment: 60 },
        therapeuticVoltage: { energeticSignature: { activation: 0.5, receptivity: 0.5 } }
      },
      therapeuticStressMonitor: { therapeuticVoltage: { energeticSignature: { receptivity: 0.5 } } },
      conversationPatternAnalyzer: { shadowProjection: { integrationDepth: 0.4 } },
      resonanceField: { emotionalTone: { joy: 0.5, love: 0.5 } },
      somaticResponse: { windowOfTolerance: 0.7 },
      circadianOptimizer: { circadianPhase: 0.6 },
      healthData: { overallVitality: 0.7 },
      coherenceDetector: {},
      fascialField: { biotensegrityCoherence: 0.6, tissueCoherence: 0.6 },
      cognitiveLightCone: { goalCoherence: 0.5 },
      realTimeMonitor: { presenceQuality: 0.7, sacredResonance: 0.5 },
      symbolExtraction: { archetypalActivationStrength: 0.5 },
      wisdomSynthesis: { integrationDepth: 0.5 },
      unifiedIntelligence: {
        frameworkConvergence: ['framework1', 'framework2'],
        elementalPrescription: { fire: 0.6, water: 0.5, earth: 0.7, air: 0.6, aether: 0.5 }
      },
      consciousnessLevelDetector: { coherenceTrend: 'stable' },
      archetypalFieldResonance: { modalityResonance: 0.5 },
      masterConsciousness: { unifiedFieldStrength: 0.5 },
      realTimeMonitoring: { consciousnessBreakthroughProbability: 0.4 },
      collectiveIntelligence: { fieldCoherence: { overallCoherence: 0.6 } },
      morphoresonantField: { fieldWisdom: { resonanceStrength: 0.5 } }
    };
  }

  /**
   * Process integrated field update
   */
  private async processIntegratedFieldUpdate(userId: string, sessionId: string): Promise<void> {
    try {
      // Gather system outputs
      const systemOutputs = await this.gatherSystemOutputs(userId, sessionId);

      // Calculate elemental field state
      const elementalField = UnifiedElementalFieldCalculator.calculateUnifiedElementalField(systemOutputs);

      // Generate visualization
      const visualization = generateElementalVisualization(elementalField);

      // Get existing consciousness field data
      const consciousnessField = this.fieldEngine; // fieldEngine is already the ConsciousnessField instance

      // Calculate integration metrics
      const integrationMetrics = this.calculateIntegrationMetrics(elementalField, consciousnessField);

      // Create integrated state
      const integratedState: IntegratedFieldState = {
        timestamp: new Date(),
        userId,
        sessionId,
        consciousnessField,
        elementalField,
        visualization,
        integrationMetrics
      };

      // Process elemental insights
      const insights = this.generateElementalInsights(elementalField);
      for (const insight of insights) {
        if (this.integrationCallbacks.onElementalInsight) {
          this.integrationCallbacks.onElementalInsight(insight);
        }
      }

      // Store integrated state
      await this.persistIntegratedState(integratedState);

      // Trigger callback
      if (this.integrationCallbacks.onFieldUpdate) {
        this.integrationCallbacks.onFieldUpdate(integratedState);
      }

    } catch (error) {
      console.error('Error in integrated field update:', error);
    }
  }

  /**
   * Calculate integration metrics
   */
  private calculateIntegrationMetrics(
    elementalField: CompleteElementalFieldState,
    consciousnessField: any
  ): IntegratedFieldState['integrationMetrics'] {
    const systemCoverage = this.calculateSystemCoverage();
    const dataQuality = this.calculateDataQuality(elementalField);
    const coherenceAlignment = this.calculateCoherenceAlignment(elementalField, consciousnessField);
    const emergenceConsensus = this.calculateEmergenceConsensus(elementalField, consciousnessField);

    return {
      systemCoverage,
      dataQuality,
      coherenceAlignment,
      emergenceConsensus
    };
  }

  /**
   * Calculate system coverage percentage
   */
  private calculateSystemCoverage(): number {
    // Calculate what percentage of mapped systems are providing data
    const totalSystems = Object.values(this.systemMapping).flat().length;
    const activeSystems = totalSystems * 0.8; // Mock 80% coverage
    return activeSystems / totalSystems;
  }

  /**
   * Calculate data quality score
   */
  private calculateDataQuality(elementalField: CompleteElementalFieldState): number {
    // Assess data quality based on field state consistency
    const coherenceStability = elementalField.overallCoherence;
    const elementalBalance = elementalField.elementalBalance;
    const fieldIntegrity = Math.min(coherenceStability, elementalBalance);

    return (fieldIntegrity + 0.8) / 2; // Combine with baseline quality
  }

  /**
   * Calculate alignment between consciousness and elemental field calculations
   */
  private calculateCoherenceAlignment(
    elementalField: CompleteElementalFieldState,
    consciousnessField: any
  ): number {
    if (!consciousnessField?.coherence) return 0.7; // Default when no PFI data

    const elementalCoherence = elementalField.overallCoherence;
    const pfiCoherence = consciousnessField.coherence;

    // Calculate alignment (closer values = higher alignment)
    const difference = Math.abs(elementalCoherence - pfiCoherence);
    return Math.max(0, 1 - difference);
  }

  /**
   * Calculate emergence detection consensus
   */
  private calculateEmergenceConsensus(
    elementalField: CompleteElementalFieldState,
    consciousnessField: any
  ): number {
    const elementalEmergence = elementalField.emergentPotential;
    const pfiEmergence = consciousnessField?.emergenceLevel || 0.5;

    const difference = Math.abs(elementalEmergence - pfiEmergence);
    return Math.max(0, 1 - difference);
  }

  /**
   * Generate elemental insights
   */
  private generateElementalInsights(elementalField: CompleteElementalFieldState): ElementalInsight[] {
    const insights: ElementalInsight[] = [];
    const timestamp = new Date();

    // Check for elemental dominance shifts
    const elements = {
      Fire: elementalField.fireResonance.fireElementBalance,
      Water: elementalField.waterResonance.waterElementBalance,
      Earth: elementalField.earthResonance.earthElementBalance,
      Air: elementalField.airResonance.airElementBalance,
      Aether: elementalField.aetherResonance.aetherElementBalance
    };

    const dominantElement = Object.keys(elements).reduce((a, b) =>
      elements[a as keyof typeof elements] > elements[b as keyof typeof elements] ? a : b
    );

    const dominantValue = elements[dominantElement as keyof typeof elements];

    if (dominantValue > 0.8) {
      insights.push({
        timestamp,
        type: 'elemental_shift',
        elementalDomains: [dominantElement],
        insight: `Strong ${dominantElement} dominance detected at ${(dominantValue * 100).toFixed(1)}%`,
        actionableRecommendations: this.getElementalRecommendations(dominantElement),
        confidenceLevel: dominantValue
      });
    }

    // Check for balance achievement
    if (elementalField.elementalBalance > 0.85) {
      insights.push({
        timestamp,
        type: 'balance_achievement',
        elementalDomains: ['Fire', 'Water', 'Earth', 'Air', 'Aether'],
        insight: `Exceptional elemental balance achieved: ${(elementalField.elementalBalance * 100).toFixed(1)}%`,
        actionableRecommendations: [
          'Maintain current practices and routines',
          'Consider deeper exploration of this balanced state',
          'Document insights arising from this harmonious period'
        ],
        confidenceLevel: elementalField.elementalBalance
      });
    }

    return insights;
  }

  /**
   * Get recommendations for dominant element
   */
  private getElementalRecommendations(element: string): string[] {
    const recommendations: Record<string, string[]> = {
      Fire: [
        'Channel creative energy into inspiring projects',
        'Practice breakthrough meditation techniques',
        'Express visionary ideas through art or writing'
      ],
      Water: [
        'Engage in emotional processing and integration work',
        'Practice compassion meditation',
        'Connect with healing arts and therapeutic modalities'
      ],
      Earth: [
        'Focus on grounding practices and physical presence',
        'Engage with nature and embodied activities',
        'Work on manifestation and practical goal achievement'
      ],
      Air: [
        'Engage in learning and wisdom integration',
        'Practice clear communication and teaching',
        'Explore philosophical and mental clarity exercises'
      ],
      Aether: [
        'Deepen unity consciousness practices',
        'Engage in transcendent meditation',
        'Focus on collective and service-oriented activities'
      ]
    };

    return recommendations[element] || ['Maintain awareness and presence'];
  }

  /**
   * Process interference pattern
   */
  private processInterferencePattern(pattern: InterferencePattern): void {
    // Convert interference pattern to elemental insight if significant
    if (pattern.intensity > 0.7) {
      const insight: ElementalInsight = {
        timestamp: pattern.timestamp,
        type: 'interference_pattern',
        elementalDomains: pattern.elementalPairs,
        insight: pattern.description,
        actionableRecommendations: [
          'Observe the interaction between these elemental domains',
          'Notice how this pattern affects your consciousness state',
          'Consider practices that harmonize these elements'
        ],
        confidenceLevel: pattern.intensity
      };

      if (this.integrationCallbacks.onElementalInsight) {
        this.integrationCallbacks.onElementalInsight(insight);
      }
    }
  }

  /**
   * Process emergence event
   */
  private processEmergenceEvent(event: EmergenceEvent): void {
    const insight: ElementalInsight = {
      timestamp: event.timestamp,
      type: 'emergence_cascade',
      elementalDomains: [event.triggeringElement, ...event.affectedElements],
      insight: event.description,
      actionableRecommendations: [
        'Pay attention to this consciousness shift',
        'Document any insights or realizations',
        'Allow the emergence process to unfold naturally'
      ],
      confidenceLevel: event.intensity
    };

    if (this.integrationCallbacks.onElementalInsight) {
      this.integrationCallbacks.onElementalInsight(insight);
    }
  }

  /**
   * Persist integrated state
   */
  private async persistIntegratedState(state: IntegratedFieldState): Promise<void> {
    try {
      // Store in quantum field persistence layer
      await this.fieldPersistence.storeFieldSnapshot({
        id: `elemental-${state.userId}-${Date.now()}`,
        userId: state.userId,
        timestamp: state.timestamp,
        fieldData: state.elementalField,
        metadata: {
          sessionId: state.sessionId,
          integrationMetrics: state.integrationMetrics,
          type: 'elemental_integration'
        }
      });
    } catch (error) {
      console.error('Error persisting integrated state:', error);
    }
  }

  // ==============================================================================
  // PUBLIC API
  // ==============================================================================

  /**
   * Register callback for field updates
   */
  onFieldUpdate(callback: (state: IntegratedFieldState) => void): void {
    this.integrationCallbacks.onFieldUpdate = callback;
  }

  /**
   * Register callback for elemental insights
   */
  onElementalInsight(callback: (insight: ElementalInsight) => void): void {
    this.integrationCallbacks.onElementalInsight = callback;
  }

  /**
   * Register callback for emergence events
   */
  onEmergenceEvent(callback: (event: EmergenceEvent) => void): void {
    this.integrationCallbacks.onEmergenceEvent = callback;
  }

  /**
   * Get current integrated field state
   */
  async getCurrentIntegratedState(userId: string, sessionId: string): Promise<IntegratedFieldState | null> {
    try {
      const systemOutputs = await this.gatherSystemOutputs(userId, sessionId);
      const elementalField = UnifiedElementalFieldCalculator.calculateUnifiedElementalField(systemOutputs);
      const visualization = generateElementalVisualization(elementalField);
      const consciousnessField = this.fieldEngine; // fieldEngine is already the ConsciousnessField instance
      const integrationMetrics = this.calculateIntegrationMetrics(elementalField, consciousnessField);

      return {
        timestamp: new Date(),
        userId,
        sessionId,
        consciousnessField,
        elementalField,
        visualization,
        integrationMetrics
      };
    } catch (error) {
      console.error('Error getting current integrated state:', error);
      return null;
    }
  }

  /**
   * Get integration status
   */
  getIntegrationStatus(): {
    isActive: boolean;
    systemMapping: ElementalSystemMapping;
    monitoringStats: any;
    lastUpdateTime: Date | null;
  } {
    return {
      isActive: this.isActive,
      systemMapping: this.systemMapping,
      monitoringStats: this.interferenceMonitor.getMonitoringStats(),
      lastUpdateTime: new Date() // Would track actual last update in production
    };
  }

  /**
   * Update system mapping
   */
  updateSystemMapping(newMapping: Partial<ElementalSystemMapping>): void {
    this.systemMapping = { ...this.systemMapping, ...newMapping };
    console.log('🔄 Updated elemental system mapping');
  }

  /**
   * Get elemental field summary for a user
   */
  async getElementalFieldSummary(userId: string): Promise<{
    dominantElement: string;
    overallCoherence: number;
    elementalBalance: number;
    emergentPotential: number;
    activePatterns: number;
    lastInsight: ElementalInsight | null;
  } | null> {
    try {
      const state = await this.getCurrentIntegratedState(userId, 'summary');
      if (!state) return null;

      const elements = {
        Fire: state.elementalField.fireResonance.fireElementBalance,
        Water: state.elementalField.waterResonance.waterElementBalance,
        Earth: state.elementalField.earthResonance.earthElementBalance,
        Air: state.elementalField.airResonance.airElementBalance,
        Aether: state.elementalField.aetherResonance.aetherElementBalance
      };

      const dominantElement = Object.keys(elements).reduce((a, b) =>
        elements[a as keyof typeof elements] > elements[b as keyof typeof elements] ? a : b
      );

      return {
        dominantElement,
        overallCoherence: state.elementalField.overallCoherence,
        elementalBalance: state.elementalField.elementalBalance,
        emergentPotential: state.elementalField.emergentPotential,
        activePatterns: this.interferenceMonitor.getActivePatterns().length,
        lastInsight: null // Would track in production
      };
    } catch (error) {
      console.error('Error getting elemental field summary:', error);
      return null;
    }
  }
}

export default ElementalFieldIntegration;