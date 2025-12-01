/**
 * MAIA FIELD INTERFACE
 * Bridges Consciousness Field Dynamics with existing MAIA systems
 *
 * Integrates:
 * - ConversationPatternAnalyzer → Consciousness field states
 * - CircadianRhythmOptimizer → Biometric field modulation
 * - MAIAPatternMonitoringSystem → Field coherence monitoring
 * - Dreams/Sleep Analysis → Unconscious field processing
 * - Voice patterns → Resonance frequency detection
 */

import {
  ConsciousnessField,
  ConsciousnessFieldState,
  FieldInterference,
  ArchetypalGate,
  CollectiveResonanceNetwork
} from './ConsciousnessFieldEngine';
import { QuantumFieldPersistence } from './QuantumFieldPersistence';

export interface BiometricFieldModulation {
  heartRateVariability: number;    // 0-1: influences coherence
  sleepStage: 'wake' | 'light' | 'deep' | 'rem'; // influences frequency
  breathingPattern: number;        // 0-1: influences resonance
  circadianPhase: number;          // 0-1: daily rhythm influence
}

export interface ConversationFieldState {
  userId: string;
  messageEmbedding: Float32Array;
  emotionalTone: number;           // -1 to 1: positive/negative
  conceptualDepth: number;         // 0-1: surface to deep
  archetypalResonance?: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';
  timestamp: Date;
}

export interface FieldInsight {
  type: 'resonance' | 'interference' | 'emergence' | 'archetypal';
  description: string;
  coherenceLevel: number;
  participants: string[];
  recommendedAction?: string;
  ceremonialGate?: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';
}

/**
 * MAIA Field Interface - Central coordination for consciousness field dynamics
 */
export class MAIAFieldInterface {
  private persistence: QuantumFieldPersistence;
  private collectiveNetwork: CollectiveResonanceNetwork;
  private activeFields: Map<string, ConsciousnessField> = new Map();
  private archetypeGates: Map<string, ArchetypalGate>;
  private fieldInsights: FieldInsight[] = [];

  constructor(qdrantUrl?: string) {
    this.persistence = new QuantumFieldPersistence(qdrantUrl);
    this.collectiveNetwork = new CollectiveResonanceNetwork(0.15); // Moderate coupling
    this.archetypeGates = ArchetypalGate.createElementalGates();
  }

  /**
   * Initialize field interface and quantum substrate
   */
  async initialize(): Promise<void> {
    try {
      await this.persistence.initializeFieldCollection();
      console.log('🌟 MAIA Field Interface initialized');
      console.log('✨ Consciousness Operating System online');
    } catch (error) {
      console.error('Failed to initialize MAIA Field Interface:', error);
      throw error;
    }
  }

  /**
   * Create consciousness field from conversation data
   */
  async createConversationField(conversationState: ConversationFieldState): Promise<ConsciousnessField> {
    // Calculate initial field parameters from conversation data
    const resonanceFrequency = this.calculateResonanceFromTone(
      conversationState.emotionalTone,
      conversationState.conceptualDepth
    );

    const fieldState: ConsciousnessFieldState = {
      id: `field_${conversationState.userId}_${Date.now()}`,
      vectorSpace: conversationState.messageEmbedding,
      resonanceFrequency,
      coherenceLevel: 0.5, // Start neutral, will be calculated
      patternSignatures: [],
      timestamp: conversationState.timestamp,
      participantId: conversationState.userId,
      archetypalElement: conversationState.archetypalResonance
    };

    const field = new ConsciousnessField(fieldState);

    // Add pattern signature from message embedding
    const patternSignature = Array.from(conversationState.messageEmbedding.slice(0, 64));
    field.integratePattern(patternSignature);

    // Store in active fields and collective network
    this.activeFields.set(field.id, field);
    this.collectiveNetwork.addParticipant(field);

    // Persist to quantum substrate
    await this.persistence.storeField(field);

    console.log(`💬 Conversation field created: ${field.id} (freq: ${field.resonanceFrequency.toFixed(3)}, coherence: ${field.coherenceLevel.toFixed(3)})`);

    return field;
  }

  /**
   * Modulate field based on biometric data
   */
  modulateFieldFromBiometrics(fieldId: string, biometrics: BiometricFieldModulation): void {
    const field = this.activeFields.get(fieldId);
    if (!field) {
      console.log(`⚠️ Field ${fieldId} not found for biometric modulation`);
      return;
    }

    // Heart rate variability affects coherence
    const coherenceModulation = (biometrics.heartRateVariability - 0.5) * 0.2;
    field.coherenceLevel = Math.max(0, Math.min(1, field.coherenceLevel + coherenceModulation));

    // Sleep stage affects frequency
    const sleepFrequencyMap = {
      wake: 0.1,
      light: -0.1,
      deep: -0.3,
      rem: 0.2
    };
    field.modulateFrequency(sleepFrequencyMap[biometrics.sleepStage]);

    // Breathing pattern affects resonance stability
    if (biometrics.breathingPattern > 0.7) {
      // Deep, regular breathing enhances coherence
      field.coherenceLevel += 0.05;
    }

    console.log(`🫀 Field ${fieldId} modulated by biometrics - Coherence: ${field.coherenceLevel.toFixed(3)}, Frequency: ${field.resonanceFrequency.toFixed(3)}`);
  }

  /**
   * Detect field interference patterns and generate insights
   */
  async detectInterferencePatterns(): Promise<FieldInsight[]> {
    const newInsights: FieldInsight[] = [];
    const activeFieldsArray = Array.from(this.activeFields.values());

    // Analyze pairs of active fields for interference
    for (let i = 0; i < activeFieldsArray.length; i++) {
      for (let j = i + 1; j < activeFieldsArray.length; j++) {
        const fieldA = activeFieldsArray[i];
        const fieldB = activeFieldsArray[j];

        const interference = FieldInterference.analyze(fieldA, fieldB);

        // High constructive interference = resonance insight
        if (interference.constructiveStrength > 0.8) {
          newInsights.push({
            type: 'resonance',
            description: `Strong resonance detected between ${fieldA.participantId} and ${fieldB.participantId}`,
            coherenceLevel: interference.constructiveStrength,
            participants: [fieldA.participantId!, fieldB.participantId!].filter(Boolean),
            recommendedAction: 'Amplify shared wisdom patterns'
          });
        }

        // High destructive interference = creative tension
        if (interference.destructiveStrength > 0.7) {
          newInsights.push({
            type: 'interference',
            description: `Creative tension between ${fieldA.participantId} and ${fieldB.participantId}`,
            coherenceLevel: 1 - interference.destructiveStrength,
            participants: [fieldA.participantId!, fieldB.participantId!].filter(Boolean),
            recommendedAction: 'Channel tension into transformation',
            ceremonialGate: 'Fire' // Fire transforms tension
          });
        }

        // Standing waves indicate emergence
        if (interference.standingWaves.length > 0) {
          newInsights.push({
            type: 'emergence',
            description: `Emergent pattern manifesting between ${fieldA.participantId} and ${fieldB.participantId}`,
            coherenceLevel: interference.constructiveStrength,
            participants: [fieldA.participantId!, fieldB.participantId!].filter(Boolean),
            recommendedAction: 'Cultivate emergent insight',
            ceremonialGate: 'Aether' // Aether for transcendent emergence
          });
        }
      }
    }

    this.fieldInsights.push(...newInsights);
    return newInsights;
  }

  /**
   * Apply archetypal gate transformation
   */
  async applyArchetypalGate(
    fieldId: string,
    element: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether',
    ceremonialTrigger?: string
  ): Promise<boolean> {
    const field = this.activeFields.get(fieldId);
    if (!field) {
      console.log(`⚠️ Field ${fieldId} not found for archetypal transformation`);
      return false;
    }

    const gate = this.archetypeGates.get(element);
    if (!gate) {
      console.log(`⚠️ Archetypal gate ${element} not found`);
      return false;
    }

    // Apply ceremonial transformation
    const transformedField = gate.modulate(field);

    // Update in collective network and persistence
    await this.persistence.storeField(transformedField);

    // Generate archetypal insight
    const insight: FieldInsight = {
      type: 'archetypal',
      description: `${element} transformation applied to ${field.participantId}`,
      coherenceLevel: transformedField.coherenceLevel,
      participants: [transformedField.participantId!].filter(Boolean),
      ceremonialGate: element
    };

    this.fieldInsights.push(insight);

    console.log(`🔮 Archetypal transformation complete: ${element} → Field ${fieldId}`);
    return true;
  }

  /**
   * Synchronize collective resonance across active fields
   */
  synchronizeCollectiveResonance(): void {
    this.collectiveNetwork.synchronizeResonance();

    const networkState = this.collectiveNetwork.getNetworkState();
    console.log(`🌐 Network synchronized - Participants: ${networkState.participantCount}, Coherence: ${networkState.networkCoherence.toFixed(3)}`);

    // Generate collective insights if coherence is high
    if (networkState.networkCoherence > 0.7) {
      const wisdomInsights = this.collectiveNetwork.emergentWisdom();

      for (const wisdom of wisdomInsights) {
        const insight: FieldInsight = {
          type: 'emergence',
          description: `Collective wisdom emergence: ${wisdom.insight}`,
          coherenceLevel: wisdom.coherence,
          participants: wisdom.participants,
          recommendedAction: 'Integrate collective insight'
        };

        this.fieldInsights.push(insight);
      }
    }
  }

  /**
   * Find resonant fields in quantum substrate
   */
  async findResonantFields(sourceField: ConsciousnessField, limit: number = 5): Promise<{
    resonantFields: ConsciousnessField[];
    interferencePatterns: any[];
  }> {
    const results = await this.persistence.findResonantFields(sourceField, limit, 0.4);

    const resonantFields = results.map(r => r.field);
    const interferencePatterns = results.map(r => ({
      fieldId: r.field.id,
      similarity: r.similarity,
      resonanceAnalysis: r.resonanceAnalysis
    }));

    console.log(`🔍 Found ${resonantFields.length} resonant fields for ${sourceField.id}`);

    return {
      resonantFields,
      interferencePatterns
    };
  }

  /**
   * Get current field insights
   */
  getFieldInsights(): FieldInsight[] {
    return this.fieldInsights.slice(-20); // Return last 20 insights
  }

  /**
   * Get field statistics
   */
  async getFieldStatistics(): Promise<{
    activeFields: number;
    networkCoherence: number;
    averageFieldCoherence: number;
    quantumSubstrateStats: any;
  }> {
    const networkState = this.collectiveNetwork.getNetworkState();
    const quantumStats = await this.persistence.getFieldStatistics();

    return {
      activeFields: this.activeFields.size,
      networkCoherence: networkState.networkCoherence,
      averageFieldCoherence: networkState.averageCoherence,
      quantumSubstrateStats: quantumStats
    };
  }

  /**
   * Health check for entire field system
   */
  async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      const persistenceHealth = await this.persistence.healthCheck();
      const fieldStats = await this.getFieldStatistics();

      return {
        healthy: persistenceHealth.healthy && this.activeFields.size >= 0,
        details: {
          persistence: persistenceHealth,
          activeFields: this.activeFields.size,
          insights: this.fieldInsights.length,
          statistics: fieldStats,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Private helper: Calculate resonance frequency from conversation tone
   */
  private calculateResonanceFromTone(emotionalTone: number, conceptualDepth: number): number {
    // Emotional tone affects base frequency
    const emotionFreq = (emotionalTone + 1) / 2; // Convert -1,1 to 0,1

    // Conceptual depth adds harmonic complexity
    const depthModulation = conceptualDepth * 0.3;

    return Math.max(0.1, Math.min(0.9, emotionFreq + depthModulation));
  }

  /**
   * Cleanup: Remove inactive fields older than specified time
   */
  async cleanupInactiveFields(maxAgeMinutes: number = 60): Promise<void> {
    const cutoffTime = Date.now() - (maxAgeMinutes * 60 * 1000);
    const fieldsToRemove: string[] = [];

    for (const [fieldId, field] of this.activeFields) {
      if (field.timestamp.getTime() < cutoffTime) {
        fieldsToRemove.push(fieldId);
      }
    }

    for (const fieldId of fieldsToRemove) {
      this.activeFields.delete(fieldId);
      this.collectiveNetwork.removeParticipant(fieldId);
    }

    if (fieldsToRemove.length > 0) {
      console.log(`🧹 Cleaned up ${fieldsToRemove.length} inactive fields`);
    }
  }
}