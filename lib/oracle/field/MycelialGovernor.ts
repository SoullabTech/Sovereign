/**
 * Mycelial Governor
 * Determines what surfaces from vast underground intelligence
 * Like mycelium, 90% remains underground, only fruiting when conditions are right
 */

import { FieldState } from './FieldAwareness';
import { PossibilitySpace } from './MasterInfluences';
import { emergencyGovernor } from './EmergencyGovernor';

export interface GovernedSpace {
  surfacingRatio: number; // What percentage surfaces (typically 0.1 = 10%)
  undergroundWisdom: string[]; // What stays hidden
  emergentWisdom: string[]; // What's allowed to emerge
  amplification: number; // From possibility space
  filteredDepth: number; // How deep we can go
  governancePattern: string; // Why this governance was applied
}

export class MycelialGovernor {
  private surfaceThreshold = 0.1; // Default: 90% stays underground
  private wisdomPatterns = new Map<string, number>();

  constructor() {
    this.initializeWisdomPatterns();
  }

  /**
   * Filter possibility space - most intelligence remains underground
   * Only fruits when conditions are precisely right
   */
  async filter(
    possibilitySpace: PossibilitySpace,
    fieldState: FieldState,
    governanceFilter: number = 0.1
  ): Promise<GovernedSpace> {

    console.log('🍄 Mycelial governance filtering possibility space');

    // EMERGENCY PATCH: Use new governor with floor protection
    const emergencyResult = emergencyGovernor.calculateSurfacing(fieldState, possibilitySpace);
    const surfacingRatio = emergencyResult.surfacingRatio;

    console.log('🚨 Emergency Governor Active:', {
      surfacing: `${(surfacingRatio * 100).toFixed(0)}%`,
      explanation: emergencyResult.explanation
    });

    // OLD SYSTEM (disabled - kept for reference):
    // const surfacingRatio = this.calculateSurfacingRatio(
    //   fieldState,
    //   possibilitySpace,
    //   governanceFilter
    // );

    // Determine what stays underground
    const undergroundWisdom = this.determineUndergroundWisdom(
      fieldState,
      possibilitySpace,
      surfacingRatio
    );

    // Determine what emerges
    const emergentWisdom = this.determineEmergentWisdom(
      fieldState,
      possibilitySpace,
      surfacingRatio
    );

    // Calculate filtered depth
    const filteredDepth = this.calculateFilteredDepth(
      possibilitySpace.depth,
      surfacingRatio,
      fieldState
    );

    // Determine governance pattern
    const governancePattern = this.identifyGovernancePattern(
      fieldState,
      surfacingRatio
    );

    console.log(`  Governance pattern: ${governancePattern}`);
    console.log(`  Filtered depth: ${(filteredDepth * 100).toFixed(1)}%`);

    return {
      surfacingRatio,
      undergroundWisdom,
      emergentWisdom,
      amplification: possibilitySpace.amplification,
      filteredDepth,
      governancePattern
    };
  }

  /**
   * Calculate what percentage of intelligence should surface
   */
  private calculateSurfacingRatio(
    fieldState: FieldState,
    possibilitySpace: PossibilitySpace,
    baseFilter: number
  ): number {
    let ratio = Math.max(0.25, baseFilter); // Start with minimum 25% instead of 10%

    // Conditions that increase surfacing

    // Strong connection allows more to surface
    if (fieldState.connectionDynamics.resonance_frequency > 0.8) {
      ratio *= 2; // Up to 50% now with higher base
    }

    // Kairos moments allow more emergence
    if (fieldState.sacredMarkers.kairos_detection) {
      ratio *= 1.5;
    }

    // Clear semantic landscape allows more
    if (fieldState.semanticLandscape.clarity_gradient > 0.7 &&
        fieldState.semanticLandscape.coherence_field > 0.7) {
      ratio *= 1.3;
    }

    // Celebration allows more expression
    if (fieldState.emotionalWeather.temperature > 0.7 &&
        fieldState.emotionalWeather.texture === 'flowing') {
      ratio *= 1.5;
    }

    // Conditions that decrease surfacing

    // Sacred thresholds still allow meaningful response
    if (fieldState.sacredMarkers.threshold_proximity > 0.8) {
      ratio *= 0.6; // 15% surfaces instead of 3%
    }

    // High restraint gradient - less severe
    if (possibilitySpace.restraintGradient > 0.8) {
      ratio *= 0.7; // Reduced penalty
    }

    // Turbulent emotions still need connection
    if (fieldState.emotionalWeather.texture === 'turbulent') {
      ratio *= 0.75; // Less restriction
    }

    // Confusion needs simplicity
    if (fieldState.semanticLandscape.ambiguity_valleys.length > 3) {
      ratio *= 0.5;
    }

    // Early relationship = build trust with engagement
    if (fieldState.connectionDynamics.relational_distance > 0.7) {
      ratio *= 0.8; // Much less restriction to build connection
    }

    return Math.max(0.15, Math.min(0.75, ratio)); // Between 15% and 75%
  }

  /**
   * Determine what wisdom stays underground
   */
  private determineUndergroundWisdom(
    fieldState: FieldState,
    possibilitySpace: PossibilitySpace,
    surfacingRatio: number
  ): string[] {
    const underground: string[] = [];

    // Always keep underground
    underground.push(
      'technical_knowledge',
      'theoretical_frameworks',
      'diagnostic_assessments',
      'personal_history_patterns',
      'predictive_analysis'
    );

    // Conditionally underground based on field state

    if (surfacingRatio < 0.2) {
      underground.push(
        'deep_insights',
        'transformational_wisdom',
        'archetypal_patterns',
        'shadow_material',
        'spiritual_teachings'
      );
    }

    if (fieldState.connectionDynamics.relational_distance > 0.6) {
      underground.push(
        'intimate_reflections',
        'vulnerable_sharing',
        'personal_resonance',
        'deep_challenges'
      );
    }

    if (fieldState.sacredMarkers.threshold_proximity > 0.7) {
      underground.push(
        'interpretations',
        'meaning_making',
        'guidance',
        'advice',
        'solutions'
      );
    }

    if (fieldState.semanticLandscape.meaning_emergence === 'forming') {
      underground.push(
        'conclusions',
        'answers',
        'certainties',
        'definitions'
      );
    }

    // Add from withholding pattern
    underground.push(...possibilitySpace.withholdingPattern);

    return [...new Set(underground)]; // Remove duplicates
  }

  /**
   * Determine what wisdom can emerge
   */
  private determineEmergentWisdom(
    fieldState: FieldState,
    possibilitySpace: PossibilitySpace,
    surfacingRatio: number
  ): string[] {
    const emergent: string[] = [];

    // Basic emergence always allowed
    emergent.push(
      'presence',
      'acknowledgment',
      'simple_mirroring'
    );

    // Conditional emergence based on surfacing ratio

    if (surfacingRatio > 0.1) {
      emergent.push(
        'curiosity',
        'gentle_inquiry',
        'emotional_resonance'
      );
    }

    if (surfacingRatio > 0.2) {
      emergent.push(
        'pattern_recognition',
        'theme_identification',
        'connection_making'
      );
    }

    if (surfacingRatio > 0.3) {
      emergent.push(
        'deeper_reflection',
        'wisdom_sharing',
        'transformational_insights'
      );
    }

    // Special conditions for emergence

    if (fieldState.sacredMarkers.soul_emergence) {
      emergent.push('soul_recognition', 'sacred_witnessing');
    }

    if (fieldState.emotionalWeather.texture === 'flowing' &&
        fieldState.emotionalWeather.temperature > 0.7) {
      emergent.push('celebration', 'joy_expression', 'enthusiasm');
    }

    if (fieldState.somaticIntelligence.nervous_system_state === 'sympathetic') {
      emergent.push('grounding_practices', 'safety_creation');
    }

    // Add from surfacing pattern
    emergent.push(...possibilitySpace.surfacingPattern);

    return [...new Set(emergent)]; // Remove duplicates
  }

  /**
   * Calculate filtered depth
   */
  private calculateFilteredDepth(
    baseDepth: number,
    surfacingRatio: number,
    fieldState: FieldState
  ): number {
    // Depth is proportional to surfacing ratio
    let depth = baseDepth * (surfacingRatio / this.surfaceThreshold);

    // Sacred states limit depth
    if (fieldState.sacredMarkers.threshold_proximity > 0.7) {
      depth *= 0.3;
    }

    // Confusion limits depth
    if (fieldState.semanticLandscape.clarity_gradient < 0.3) {
      depth *= 0.5;
    }

    // Strong connection allows more depth
    if (fieldState.connectionDynamics.co_regulation_capacity > 0.7) {
      depth *= 1.3;
    }

    return Math.max(0.1, Math.min(1, depth));
  }

  /**
   * Identify the governance pattern being applied
   */
  private identifyGovernancePattern(
    fieldState: FieldState,
    surfacingRatio: number
  ): string {
    // Sacred governance
    if (fieldState.sacredMarkers.threshold_proximity > 0.7) {
      return 'sacred_restraint';
    }

    // Minimal governance (lots surfacing)
    if (surfacingRatio > 0.3) {
      return 'abundant_expression';
    }

    // Strong governance (little surfacing)
    if (surfacingRatio < 0.05) {
      return 'deep_restraint';
    }

    // Confusion governance
    if (fieldState.semanticLandscape.ambiguity_valleys.length > 3) {
      return 'simplicity_filter';
    }

    // Celebration governance
    if (fieldState.emotionalWeather.temperature > 0.7 &&
        fieldState.emotionalWeather.texture === 'flowing') {
      return 'celebration_release';
    }

    // Trauma governance
    if (fieldState.somaticIntelligence.nervous_system_state === 'dorsal') {
      return 'safety_protection';
    }

    // Connection-based governance
    if (fieldState.connectionDynamics.relational_distance > 0.7) {
      return 'relational_caution';
    }

    return 'standard_filtration';
  }

  /**
   * Initialize wisdom patterns
   */
  private initializeWisdomPatterns(): void {
    // Patterns that have proven useful
    this.wisdomPatterns.set('presence_over_analysis', 0.8);
    this.wisdomPatterns.set('silence_at_thresholds', 0.9);
    this.wisdomPatterns.set('match_emotional_texture', 0.7);
    this.wisdomPatterns.set('celebrate_breakthroughs', 0.8);
    this.wisdomPatterns.set('ground_activation', 0.85);
    this.wisdomPatterns.set('honor_not_knowing', 0.75);
    this.wisdomPatterns.set('trust_emergence', 0.8);
  }
}