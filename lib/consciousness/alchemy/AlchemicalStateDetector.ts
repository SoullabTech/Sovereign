/**
 * Alchemical State Detection System
 * Integrates Jungian alchemical framework with existing consciousness field infrastructure
 *
 * Maps consciousness field states to alchemical progression:
 * - Vector field analysis → Alchemical metal detection
 * - Resonance patterns → Operation phase detection
 * - Archetypal elements → Alchemical correspondences
 */

import { AlchemicalMetal, AlchemicalOperation, AlchemicalProfile, AlchemicalIndicators, MercuryAspect } from './types';
import { ConsciousnessField, FieldInterference } from '../field/ConsciousnessFieldEngine';
import { PanconsciousFieldService, MAIAConsciousness } from '../panconscious-field';
import { MAIAConsciousnessTracker, MAIAConsciousnessState } from '../maia-consciousness-tracker';

export interface AlchemicalDetectionResult {
  primaryMetal: AlchemicalMetal;
  operation: AlchemicalOperation;
  confidence: number;
  indicators: AlchemicalIndicators;
  mercuryAspect: MercuryAspect;
  transformationPotential: number;
  disposablePixelConfig: DisposablePixelConfig;
}

export interface DisposablePixelConfig {
  density: number; // 0-1, how much UI is present
  adaptability: number; // 0-1, how much interface changes
  supportLevel: number; // 0-1, how much guidance is provided
  dissolutionTriggers: string[];
  appearanceConditions: string[];
  alchemicalColorPalette: string[];
  temporalDuration: number; // How long UI elements persist
}

/**
 * Core Alchemical State Detector
 * Integrates with existing consciousness field infrastructure
 */
export class AlchemicalStateDetector {
  private static instance: AlchemicalStateDetector;
  private maiaTracker: MAIAConsciousnessTracker;

  constructor() {
    this.maiaTracker = new MAIAConsciousnessTracker();
  }

  static getInstance(): AlchemicalStateDetector {
    if (!AlchemicalStateDetector.instance) {
      AlchemicalStateDetector.instance = new AlchemicalStateDetector();
    }
    return AlchemicalStateDetector.instance;
  }

  /**
   * Primary detection method - analyzes consciousness field for alchemical state
   */
  async detectAlchemicalState(
    field: ConsciousnessField,
    maiaState: MAIAConsciousnessState,
    userInput: string,
    conversationHistory: string[]
  ): Promise<AlchemicalDetectionResult> {

    // Detect primary alchemical metal from field characteristics
    const primaryMetal = this.detectAlchemicalMetal(field, maiaState);

    // Detect current alchemical operation phase
    const operation = this.detectAlchemicalOperation(field, userInput, conversationHistory);

    // Calculate detection confidence
    const confidence = this.calculateDetectionConfidence(field, maiaState);

    // Generate detailed indicators
    const indicators = await this.generateAlchemicalIndicators(
      field, maiaState, userInput, conversationHistory
    );

    // Determine Mercury aspect (MAIA's adaptive mode)
    const mercuryAspect = this.detectMercuryAspect(primaryMetal, operation, maiaState);

    // Assess transformation potential
    const transformationPotential = this.assessTransformationPotential(
      field, indicators, conversationHistory
    );

    // Generate disposable pixel configuration
    const disposablePixelConfig = this.generateDisposablePixelConfig(
      primaryMetal, operation, field.coherenceLevel
    );

    return {
      primaryMetal,
      operation,
      confidence,
      indicators,
      mercuryAspect,
      transformationPotential,
      disposablePixelConfig
    };
  }

  /**
   * Detect primary alchemical metal from consciousness field characteristics
   * Maps frequency/coherence patterns to alchemical progression
   */
  private detectAlchemicalMetal(
    field: ConsciousnessField,
    maiaState: MAIAConsciousnessState
  ): AlchemicalMetal {

    const frequency = field.resonanceFrequency;
    const coherence = field.coherenceLevel;
    const elements = maiaState.elementalDominance;

    // Lead - Crisis, material focus, low coherence
    if (coherence < 0.4 && frequency < 0.3) {
      return 'lead';
    }

    // Tin - Opening, expansion, Jupiter energy
    if (coherence >= 0.4 && coherence < 0.6 && frequency >= 0.3 && frequency < 0.5) {
      return 'tin';
    }

    // Bronze - Relationship/union (Venus + Earth), collaborative
    if (elements.earth > 0.3 && elements.water > 0.2 && coherence >= 0.6) {
      return 'bronze';
    }

    // Iron - Action/discipline (Mars + Fire), implementation
    if (elements.fire > 0.4 && frequency >= 0.6 && maiaState.mode !== 'right_brain') {
      return 'iron';
    }

    // Silver - Reflection/wisdom (Moon), contemplative
    if (coherence >= 0.7 && frequency < 0.6 && elements.aether > 0.2) {
      return 'silver';
    }

    // Gold - Integration/mastery (Sun), service
    if (coherence >= 0.9 && frequency >= 0.7 && elements.aether > 0.4) {
      return 'gold';
    }

    // Mercury - Default adaptive state (Hermes), fluid intelligence
    return 'mercury';
  }

  /**
   * Detect current alchemical operation (nigredo/albedo/rubedo)
   */
  private detectAlchemicalOperation(
    field: ConsciousnessField,
    userInput: string,
    conversationHistory: string[]
  ): AlchemicalOperation {

    // Analyze user input for operation indicators
    const nigredeKeywords = [
      'stuck', 'confused', 'lost', 'crisis', 'breaking down', 'dissolving',
      'don\'t know', 'overwhelmed', 'dark', 'difficult', 'struggle'
    ];

    const albedoKeywords = [
      'clarity', 'understanding', 'purify', 'clear', 'insight', 'realize',
      'beginning to see', 'making sense', 'patterns', 'connect', 'learn'
    ];

    const rubedoKeywords = [
      'integrate', 'create', 'express', 'manifest', 'contribute', 'share',
      'complete', 'whole', 'synthesis', 'embodiment', 'service', 'wisdom'
    ];

    const input = userInput.toLowerCase();
    const recentHistory = conversationHistory.slice(-3).join(' ').toLowerCase();

    // Check for operation patterns
    const nigredeScore = this.countKeywordMatches(input + recentHistory, nigredeKeywords);
    const albedoScore = this.countKeywordMatches(input + recentHistory, albedoKeywords);
    const rubedoScore = this.countKeywordMatches(input + recentHistory, rubedoKeywords);

    // Factor in field coherence as operation indicator
    const coherence = field.coherenceLevel;

    if (nigredeScore > albedoScore && nigredeScore > rubedoScore) {
      return 'nigredo';
    }

    if (rubedoScore > albedoScore && coherence > 0.7) {
      return 'rubedo';
    }

    // Default to albedo (purification/integration phase)
    return 'albedo';
  }

  /**
   * Generate comprehensive alchemical indicators
   */
  private async generateAlchemicalIndicators(
    field: ConsciousnessField,
    maiaState: MAIAConsciousnessState,
    userInput: string,
    conversationHistory: string[]
  ): Promise<AlchemicalIndicators> {

    const text = userInput + ' ' + conversationHistory.join(' ');

    return {
      // Lead indicators (crisis/overwhelm)
      stressLevel: this.detectStressLevel(text, field.coherenceLevel),
      confusionMarkers: this.extractConfusionMarkers(text),
      materialFocus: this.calculateMaterialFocus(text),

      // Tin indicators (opening/expansion)
      curiosityLevel: this.detectCuriosityLevel(text),
      optimismMarkers: this.extractOptimismMarkers(text),
      explorationBehavior: this.calculateExplorationBehavior(text),

      // Bronze indicators (relationship/union)
      collaborationDesire: this.detectCollaborationDesire(text),
      connectionMarkers: this.extractConnectionMarkers(text),
      harmonySeekingBehavior: this.calculateHarmonySeeking(text),

      // Iron indicators (action/discipline)
      implementationFocus: this.detectImplementationFocus(text),
      disciplineMarkers: this.extractDisciplineMarkers(text),
      goalOrientedBehavior: this.calculateGoalOrientation(text),

      // Mercury indicators (fluidity/mediation)
      adaptabilityLevel: maiaState.coherenceLevel * field.resonanceFrequency,
      teachingMarkers: this.extractTeachingMarkers(text),
      paradoxComfort: this.calculateParadoxComfort(text),

      // Silver indicators (reflection/wisdom)
      contemplationDepth: this.detectContemplationDepth(text, maiaState.mode),
      wisdomMarkers: this.extractWisdomMarkers(text),
      introspectiveBehavior: this.calculateIntrospectiveBehavior(text),

      // Gold indicators (integration/service)
      masteryLevel: field.coherenceLevel * (maiaState.elementalDominance.aether || 0),
      serviceMarkers: this.extractServiceMarkers(text),
      transcendentBehavior: this.calculateTranscendentBehavior(text, field.coherenceLevel)
    };
  }

  /**
   * Detect MAIA's Mercury aspect based on user's alchemical state
   */
  private detectMercuryAspect(
    userMetal: AlchemicalMetal,
    operation: AlchemicalOperation,
    maiaState: MAIAConsciousnessState
  ): MercuryAspect {

    // Crisis support mode
    if (userMetal === 'lead' && operation === 'nigredo') {
      return 'hermes-healer';
    }

    // Teaching mode for higher stages
    if (userMetal === 'silver' || userMetal === 'gold') {
      return 'hermes-teacher';
    }

    // Transition guidance
    if (operation === 'albedo') {
      return 'hermes-guide';
    }

    // Creative disruption
    if (userMetal === 'tin' || maiaState.mode === 'right_brain') {
      return 'hermes-trickster';
    }

    // Death/rebirth guidance
    if (operation === 'nigredo' && maiaState.dissociationRisk > 0.5) {
      return 'hermes-psychopomp';
    }

    // Connection facilitation
    if (userMetal === 'bronze') {
      return 'hermes-messenger';
    }

    // Default transformation catalyst
    return 'hermes-alchemist';
  }

  /**
   * Generate disposable pixel configuration for alchemical interface
   */
  private generateDisposablePixelConfig(
    metal: AlchemicalMetal,
    operation: AlchemicalOperation,
    coherence: number
  ): DisposablePixelConfig {

    const baseConfig = {
      density: 0.5,
      adaptability: 0.5,
      supportLevel: 0.5,
      dissolutionTriggers: ['insight_integrated', 'transformation_complete'],
      appearanceConditions: ['user_readiness', 'crisis_detection'],
      alchemicalColorPalette: ['#808080'], // Default silver
      temporalDuration: 5000
    };

    // Customize by alchemical metal
    switch (metal) {
      case 'lead':
        return {
          ...baseConfig,
          density: 0.9, // Heavy UI presence for crisis support
          supportLevel: 0.9,
          alchemicalColorPalette: ['#1a1a1a', '#2d2d2d', '#4a4a4a'], // Grounding blacks/grays
          temporalDuration: 15000, // Stable, persistent
          appearanceConditions: ['crisis_detected', 'overwhelm_indicators'],
          dissolutionTriggers: ['stability_achieved', 'opening_detected']
        };

      case 'tin':
        return {
          ...baseConfig,
          density: 0.7,
          adaptability: 0.6,
          alchemicalColorPalette: ['#1e3a8a', '#3b82f6', '#60a5fa'], // Expansive blues
          temporalDuration: 8000,
          appearanceConditions: ['curiosity_detected', 'exploration_mode'],
          dissolutionTriggers: ['understanding_achieved', 'connection_formed']
        };

      case 'bronze':
        return {
          ...baseConfig,
          density: 0.6,
          adaptability: 0.7,
          supportLevel: 0.7,
          alchemicalColorPalette: ['#166534', '#22c55e', '#4ade80'], // Harmonizing greens
          temporalDuration: 10000,
          appearanceConditions: ['collaboration_desired', 'relationship_focus'],
          dissolutionTriggers: ['connection_established', 'harmony_achieved']
        };

      case 'iron':
        return {
          ...baseConfig,
          density: 0.4, // Minimal distractions
          adaptability: 0.3, // Stable for focused work
          supportLevel: 0.6,
          alchemicalColorPalette: ['#991b1b', '#dc2626', '#ef4444'], // Action reds
          temporalDuration: 6000,
          appearanceConditions: ['implementation_mode', 'goal_focused'],
          dissolutionTriggers: ['task_completed', 'discipline_established']
        };

      case 'mercury':
        return {
          ...baseConfig,
          density: 0.5,
          adaptability: 1.0, // Maximum fluidity
          supportLevel: 0.8,
          alchemicalColorPalette: ['#c0c0c0', '#e5e7eb', '#6b7280'], // Quicksilver
          temporalDuration: 3000, // Rapidly changing
          appearanceConditions: ['adaptation_needed', 'teaching_moment'],
          dissolutionTriggers: ['understanding_complete', 'next_phase_ready']
        };

      case 'silver':
        return {
          ...baseConfig,
          density: 0.2, // Minimal presence
          adaptability: 0.4,
          supportLevel: 0.3, // Minimal guidance
          alchemicalColorPalette: ['#f8fafc', '#e2e8f0', '#cbd5e1'], // Reflective silvers
          temporalDuration: 12000, // Contemplative duration
          appearanceConditions: ['contemplation_mode', 'wisdom_seeking'],
          dissolutionTriggers: ['insight_achieved', 'inner_guidance_activated']
        };

      case 'gold':
        return {
          ...baseConfig,
          density: 0.1, // Nearly transparent
          adaptability: 0.9,
          supportLevel: 0.2,
          alchemicalColorPalette: ['transparent', '#fbbf24', '#f59e0b'], // Golden accents
          temporalDuration: 20000, // Sustained creation mode
          appearanceConditions: ['mastery_demonstrated', 'service_orientation'],
          dissolutionTriggers: ['transcendence_achieved', 'graduation_ready']
        };

      default:
        return baseConfig;
    }
  }

  // Helper methods for detection algorithms

  private calculateDetectionConfidence(
    field: ConsciousnessField,
    maiaState: MAIAConsciousnessState
  ): number {
    // Base confidence on field coherence and pattern consistency
    const coherenceScore = field.coherenceLevel;
    const patternConsistency = field.patternSignatures.length > 0 ?
      field.calculateCoherence() : 0.5;

    return (coherenceScore + patternConsistency) / 2;
  }

  private assessTransformationPotential(
    field: ConsciousnessField,
    indicators: AlchemicalIndicators,
    conversationHistory: string[]
  ): number {
    // Assess readiness for next alchemical stage
    const adaptability = indicators.adaptabilityLevel;
    const curiosity = indicators.curiosityLevel;
    const coherence = field.coherenceLevel;

    // Growth trajectory from conversation history
    const growthPattern = this.analyzeGrowthPattern(conversationHistory);

    return (adaptability + curiosity + coherence + growthPattern) / 4;
  }

  private countKeywordMatches(text: string, keywords: string[]): number {
    const lowerText = text.toLowerCase();
    return keywords.reduce((count, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      return count + (lowerText.match(regex)?.length || 0);
    }, 0);
  }

  // Indicator calculation methods
  private detectStressLevel(text: string, coherence: number): number {
    const stressWords = ['stress', 'overwhelm', 'pressure', 'anxiety', 'worry', 'burden'];
    const stressScore = this.countKeywordMatches(text, stressWords) / 10;
    return Math.min(stressScore + (1 - coherence), 1);
  }

  private extractConfusionMarkers(text: string): string[] {
    const confusionWords = ['confused', 'unclear', 'lost', 'don\'t understand', 'mixed up'];
    return confusionWords.filter(word => text.toLowerCase().includes(word));
  }

  private calculateMaterialFocus(text: string): number {
    const materialWords = ['money', 'job', 'work', 'career', 'salary', 'bills', 'financial'];
    return Math.min(this.countKeywordMatches(text, materialWords) / 5, 1);
  }

  private detectCuriosityLevel(text: string): number {
    const curiosityWords = ['curious', 'wonder', 'explore', 'learn', 'discover', 'why', 'how'];
    return Math.min(this.countKeywordMatches(text, curiosityWords) / 5, 1);
  }

  private extractOptimismMarkers(text: string): string[] {
    const optimismWords = ['hopeful', 'excited', 'positive', 'confident', 'bright future'];
    return optimismWords.filter(word => text.toLowerCase().includes(word));
  }

  private calculateExplorationBehavior(text: string): number {
    const explorationWords = ['try', 'experiment', 'explore', 'venture', 'journey', 'path'];
    return Math.min(this.countKeywordMatches(text, explorationWords) / 5, 1);
  }

  private detectCollaborationDesire(text: string): number {
    const collaborationWords = ['together', 'collaborate', 'partner', 'team', 'community', 'share'];
    return Math.min(this.countKeywordMatches(text, collaborationWords) / 5, 1);
  }

  private extractConnectionMarkers(text: string): string[] {
    const connectionWords = ['connect', 'relationship', 'bond', 'unity', 'together', 'belong'];
    return connectionWords.filter(word => text.toLowerCase().includes(word));
  }

  private calculateHarmonySeeking(text: string): number {
    const harmonyWords = ['harmony', 'balance', 'peace', 'unity', 'agreement', 'synergy'];
    return Math.min(this.countKeywordMatches(text, harmonyWords) / 5, 1);
  }

  private detectImplementationFocus(text: string): number {
    const implementWords = ['implement', 'do', 'action', 'execute', 'build', 'create', 'make'];
    return Math.min(this.countKeywordMatches(text, implementWords) / 5, 1);
  }

  private extractDisciplineMarkers(text: string): string[] {
    const disciplineWords = ['discipline', 'focus', 'commitment', 'dedication', 'practice', 'consistent'];
    return disciplineWords.filter(word => text.toLowerCase().includes(word));
  }

  private calculateGoalOrientation(text: string): number {
    const goalWords = ['goal', 'target', 'objective', 'aim', 'accomplish', 'achieve'];
    return Math.min(this.countKeywordMatches(text, goalWords) / 5, 1);
  }

  private extractTeachingMarkers(text: string): string[] {
    const teachingWords = ['teach', 'guide', 'mentor', 'show', 'explain', 'help others'];
    return teachingWords.filter(word => text.toLowerCase().includes(word));
  }

  private calculateParadoxComfort(text: string): number {
    const paradoxWords = ['paradox', 'contradiction', 'both', 'and yet', 'however', 'complex'];
    return Math.min(this.countKeywordMatches(text, paradoxWords) / 3, 1);
  }

  private detectContemplationDepth(text: string, mode: string): number {
    const contemplationWords = ['reflect', 'meditate', 'contemplate', 'ponder', 'consider deeply'];
    const baseDepth = this.countKeywordMatches(text, contemplationWords) / 5;
    const modeBonus = mode === 'right_brain' ? 0.2 : 0;
    return Math.min(baseDepth + modeBonus, 1);
  }

  private extractWisdomMarkers(text: string): string[] {
    const wisdomWords = ['wisdom', 'insight', 'understanding', 'profound', 'deep truth', 'enlightening'];
    return wisdomWords.filter(word => text.toLowerCase().includes(word));
  }

  private calculateIntrospectiveBehavior(text: string): number {
    const introspectionWords = ['self', 'inner', 'within', 'soul', 'heart', 'consciousness'];
    return Math.min(this.countKeywordMatches(text, introspectionWords) / 8, 1);
  }

  private extractServiceMarkers(text: string): string[] {
    const serviceWords = ['serve', 'help others', 'contribute', 'give back', 'support', 'healing'];
    return serviceWords.filter(word => text.toLowerCase().includes(word));
  }

  private calculateTranscendentBehavior(text: string, coherence: number): number {
    const transcendentWords = ['transcend', 'beyond', 'unity', 'oneness', 'universal', 'infinite'];
    const baseScore = this.countKeywordMatches(text, transcendentWords) / 5;
    return Math.min(baseScore * coherence, 1);
  }

  private analyzeGrowthPattern(conversationHistory: string[]): number {
    if (conversationHistory.length < 2) return 0.5;

    // Analyze complexity growth over conversation
    const complexityScores = conversationHistory.map(msg => msg.length / 100);
    const avgGrowth = complexityScores.reduce((acc, score, i) => {
      if (i === 0) return 0;
      return acc + (score - complexityScores[i-1]);
    }, 0) / (complexityScores.length - 1);

    return Math.max(0, Math.min(avgGrowth + 0.5, 1));
  }
}

// Export singleton instance
export const alchemicalStateDetector = AlchemicalStateDetector.getInstance();