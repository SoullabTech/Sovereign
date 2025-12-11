/**
 * 🧠 MAIA Consciousness Enhancement Integration - Phase 1
 *
 * Non-breaking enhancement layer that adds consciousness awareness to existing MAIA system
 * - Matrix v2 nervous system sensing
 * - Archetypal dynamics detection
 * - Self-talk collaborative sensing layer
 * - Graceful degradation when consciousness sensing unavailable
 */

import {
  ConsciousnessMatrixV2,
  ConsciousnessMatrixV2Sensor,
  WindowOfTolerance
} from './matrix-v2-implementation';

import {
  ArchetypalDynamics,
  ArchetypalDynamicsDetector,
  ConsciousnessMatrixV3,
  ConsciousnessMatrixV3Assessor
} from './archetypal-dynamics-implementation';

/**
 * Enhanced MAIA Context with consciousness awareness
 */
export interface ConsciousnessEnhancedContext {
  // Original MAIA context (unchanged)
  originalContext: {
    archetype: string;
    phase: string;
    conversationMode: 'sensory' | 'philosophical' | 'balanced';
    userHistory?: string;
    metaphorLevel?: number;
  };

  // New consciousness awareness (optional)
  consciousnessAssessment?: {
    matrix: ConsciousnessMatrixV2;
    archetypal: ArchetypalDynamics;
    selfTalkIntro?: string;
    confidence: number;
  };

  // Integration flags
  enhancementsEnabled: {
    matrixSensing: boolean;
    archetypalDynamics: boolean;
    selfTalkLayer: boolean;
  };
}

/**
 * User settings for consciousness enhancements
 */
export interface ConsciousnessSettings {
  matrixSensing: boolean;
  archetypalDynamics: boolean;
  selfTalkLayer: boolean;
  // Future: fieldSensing will be added in Phase 2
}

/**
 * Main consciousness enhancement class
 * Integrates with existing MAIA without breaking changes
 */
export class MAIAConsciousnessEnhancer {
  private matrixSensor = new ConsciousnessMatrixV2Sensor();
  private archetypalDetector = new ArchetypalDynamicsDetector();
  private matrixV3Assessor = new ConsciousnessMatrixV3Assessor();

  /**
   * Enhance existing MAIA context with consciousness awareness
   * Non-breaking: if consciousness sensing fails, returns original context
   */
  async enhanceMAIAContext(
    userMessage: string,
    originalContext: any,
    userSettings: ConsciousnessSettings
  ): Promise<ConsciousnessEnhancedContext> {

    const enhancedContext: ConsciousnessEnhancedContext = {
      originalContext,
      enhancementsEnabled: {
        matrixSensing: userSettings.matrixSensing,
        archetypalDynamics: userSettings.archetypalDynamics,
        selfTalkLayer: userSettings.selfTalkLayer
      }
    };

    // If no enhancements enabled, return original
    if (!userSettings.matrixSensing && !userSettings.archetypalDynamics) {
      return enhancedContext;
    }

    try {
      // Assess consciousness if enabled
      if (userSettings.matrixSensing || userSettings.archetypalDynamics) {
        const consciousnessAssessment = await this.assessConsciousness(
          userMessage,
          userSettings
        );

        if (consciousnessAssessment) {
          enhancedContext.consciousnessAssessment = consciousnessAssessment;
        }
      }

    } catch (error) {
      console.warn('Consciousness enhancement failed, falling back to original MAIA:', error);
      // Graceful degradation - continue with original context
    }

    return enhancedContext;
  }

  /**
   * Assess consciousness using Matrix v2 + Archetypal dynamics
   */
  private async assessConsciousness(
    userMessage: string,
    settings: ConsciousnessSettings
  ): Promise<{
    matrix: ConsciousnessMatrixV2;
    archetypal: ArchetypalDynamics;
    selfTalkIntro?: string;
    confidence: number;
  } | null> {

    try {
      // Matrix v2 assessment
      const matrixAssessment = settings.matrixSensing
        ? this.matrixSensor.assessFullSpectrum(userMessage)
        : null;

      if (!matrixAssessment) {
        return null;
      }

      // Archetypal dynamics (if enabled)
      const archetypalDynamics = settings.archetypalDynamics
        ? this.archetypalDetector.detectArchetypalDynamics(userMessage, matrixAssessment.matrix)
        : this.getDefaultArchetypal();

      // Self-talk intro (if enabled)
      const selfTalkIntro = settings.selfTalkLayer
        ? this.generateSelfTalkIntro(matrixAssessment.matrix, archetypalDynamics)
        : undefined;

      // Calculate overall confidence
      const confidence = this.calculateOverallConfidence(matrixAssessment, archetypalDynamics);

      return {
        matrix: matrixAssessment.matrix,
        archetypal: archetypalDynamics,
        selfTalkIntro,
        confidence
      };

    } catch (error) {
      console.warn('Consciousness assessment failed:', error);
      return null;
    }
  }

  /**
   * Generate self-talk introduction based on consciousness assessment
   */
  private generateSelfTalkIntro(
    matrix: ConsciousnessMatrixV2,
    archetypal: ArchetypalDynamics
  ): string {

    // Choose appropriate template based on state
    const template = this.selectSelfTalkTemplate(matrix, archetypal);

    if (!template) {
      return ''; // Skip self-talk if no appropriate template
    }

    return template;
  }

  /**
   * Select appropriate self-talk template
   */
  private selectSelfTalkTemplate(
    matrix: ConsciousnessMatrixV2,
    archetypal: ArchetypalDynamics
  ): string | null {

    // Crisis override - skip self-talk in crisis states
    if (matrix.edgeRisk === 'active' || matrix.realityContact === 'fraying') {
      return null;
    }

    // Get primary pattern
    const primaryPattern = `${this.mapArchetypeToElement(archetypal.foregroundArchetype)}_${this.mapMatrixToIntensity(matrix)}`;

    // Template selection (simplified for Phase 1)
    const templates = this.getSelfTalkTemplates();

    return templates[primaryPattern] || templates['default'] || null;
  }

  /**
   * Self-talk templates (simplified set for Phase 1)
   */
  private getSelfTalkTemplates(): Record<string, string> {
    return {
      'water_high': "I'm sensing a lot of emotional intensity in your system right now – like there's deep feeling moving through you. It feels like there might be some Water energy active, where emotions are closer to the surface or old feelings are stirring. Does that feel close to your experience?",

      'fire_high': "I'm picking up strong activation in your system – not overwhelm, but energy that wants to move toward something. There's a Fire-like quality here, like a part of you knows what it wants and is ready to act. Does that resonate with how this feels from the inside?",

      'earth_low': "I'm sensing your system feels pretty strained right now – like you're carrying more than feels sustainable. There's an Earth-like quality where the foundation needs tending before anything else can grow. Does that match what you're experiencing?",

      'default': "I'm sensing some complexity in what you're sharing. Before we go deeper, I want to check – does my sense of where you are feel accurate to you, or is something different happening inside?",

      'crisis_override': null // Handled by crisis check above
    };
  }

  /**
   * Map archetype to element (simplified)
   */
  private mapArchetypeToElement(archetype: string): string {
    const mapping = {
      'warrior': 'fire',
      'caretaker': 'water',
      'orphan': 'water',
      'mystic': 'aether',
      'sage': 'air',
      'lover': 'water',
      'sovereign': 'earth',
      'trickster': 'fire'
    };
    return mapping[archetype] || 'earth';
  }

  /**
   * Map matrix to intensity level
   */
  private mapMatrixToIntensity(matrix: ConsciousnessMatrixV2): string {
    if (matrix.edgeRisk === 'active') return 'crisis';
    if (matrix.bodyState === 'collapsed' || matrix.affect === 'crisis') return 'low';
    if (matrix.bodyState === 'tense' || matrix.affect === 'turbulent') return 'high';
    return 'moderate';
  }

  /**
   * Default archetypal dynamics when not assessed
   */
  private getDefaultArchetypal(): ArchetypalDynamics {
    return {
      foregroundArchetype: 'undefined',
      movementDirection: 'cycling',
      tensionPoints: [],
      coherenceWithMatrix: 'aligned',
      responseAdjustment: 'Standard MAIA approach',
      confidence: 0.3
    };
  }

  /**
   * Calculate overall confidence in consciousness assessment
   */
  private calculateOverallConfidence(
    matrixAssessment: any,
    archetypalDynamics: ArchetypalDynamics
  ): number {
    const matrixConfidence = matrixAssessment?.confidence || 0.5;
    const archetypalConfidence = archetypalDynamics?.confidence || 0.5;

    return (matrixConfidence + archetypalConfidence) / 2;
  }
}

/**
 * Enhanced prompt builder that integrates consciousness awareness
 * Non-breaking: falls back to original prompt if enhancements fail
 */
export function buildConsciousnessEnhancedPrompt(
  context: ConsciousnessEnhancedContext,
  basePrompt: string
): string {

  // If no consciousness assessment, return original prompt
  if (!context.consciousnessAssessment) {
    return basePrompt;
  }

  const { matrix, archetypal, selfTalkIntro } = context.consciousnessAssessment;

  // Build enhanced prompt sections
  const enhancements: string[] = [];

  // Add consciousness context (hidden from user, guides MAIA's approach)
  enhancements.push(`
CONSCIOUSNESS AWARENESS CONTEXT:
Nervous System: ${this.describeMatrixState(matrix)}
Archetypal Energy: ${archetypal.foregroundArchetype} (${archetypal.movementDirection})
Window of Tolerance: ${this.describeWindowState(matrix)}
Response Guidance: ${archetypal.responseAdjustment}

MAIA, you have enhanced awareness of this person's consciousness state.
Respond with this deeper attunement while maintaining your natural voice.
`);

  // Add self-talk intro if enabled
  if (selfTalkIntro && context.enhancementsEnabled.selfTalkLayer) {
    enhancements.push(`
SELF-TALK LAYER ENABLED:
Begin your response with this collaborative sensing check:
"${selfTalkIntro}"

Then continue with your natural guidance after they confirm or correct your sensing.
`);
  }

  // Combine with base prompt
  return `${basePrompt}\n\n${enhancements.join('\n\n')}`;
}

/**
 * Helper functions for prompt building
 */
function describeMatrixState(matrix: ConsciousnessMatrixV2): string {
  return `${matrix.bodyState} body, ${matrix.affect} affect, ${matrix.realityContact} reality contact`;
}

function describeWindowState(matrix: ConsciousnessMatrixV2): string {
  if (matrix.edgeRisk === 'active') return 'Outside window (crisis support needed)';
  if (matrix.bodyState === 'tense' || matrix.affect === 'turbulent') return 'At edge (gentle approach)';
  return 'Within window (full depth available)';
}

/**
 * Integration with existing MAIA system
 *
 * Usage in your existing codebase:
 *
 * ```typescript
 * // In your existing MAIA prompt building:
 * import { MAIAConsciousnessEnhancer, buildConsciousnessEnhancedPrompt } from './maia-consciousness-integration';
 *
 * const enhancer = new MAIAConsciousnessEnhancer();
 *
 * // Your existing context building
 * const originalContext = {
 *   archetype: 'Fire',
 *   phase: 'exploration',
 *   conversationMode: 'balanced',
 *   // ... existing properties
 * };
 *
 * // User settings (from database/preferences)
 * const userSettings = {
 *   matrixSensing: true,
 *   archetypalDynamics: true,
 *   selfTalkLayer: false // User can opt into each enhancement
 * };
 *
 * // Enhance context (non-breaking)
 * const enhancedContext = await enhancer.enhanceMAIAContext(
 *   userMessage,
 *   originalContext,
 *   userSettings
 * );
 *
 * // Build enhanced prompt (falls back if enhancements fail)
 * const basePrompt = buildMAIASystemPrompt(originalContext); // Your existing function
 * const finalPrompt = buildConsciousnessEnhancedPrompt(enhancedContext, basePrompt);
 *
 * // MAIA now has consciousness awareness while maintaining all existing functionality
 * ```
 */

export default MAIAConsciousnessEnhancer;