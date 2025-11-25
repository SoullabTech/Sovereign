/**
 * Master Influences
 * Gravitational fields that shape possibility space without determining outcomes
 * Like gravity bends spacetime, these influences bend the possibility landscape
 */

import { FieldState } from './FieldAwareness';

export interface GravitationalField {
  name: string;
  strength: number; // 0-1, how strongly this influence shapes space
  calculateInfluence(fieldState: FieldState): number;
}

export interface PossibilitySpace {
  depth: number; // How deep the intelligence can go
  restraintGradient: number; // How much to hold back
  dominantInfluence: string; // Which influence is strongest
  amplification: number; // How much to amplify emergence
  withholdingPattern: string[]; // What to keep underground
  surfacingPattern: string[]; // What's allowed to surface
}

// ============== Core Influences ==============

class PresenceFirst implements GravitationalField {
  name = 'presence_first';
  strength = 0.8;

  calculateInfluence(fieldState: FieldState): number {
    let influence = this.strength;

    // Stronger influence when connection is weak
    if (fieldState.connectionDynamics.relational_distance > 0.7) {
      influence *= 1.3;
    }

    // Stronger in emotional turbulence
    if (fieldState.emotionalWeather.texture === 'turbulent') {
      influence *= 1.2;
    }

    // Weaker when action is clearly needed
    if (fieldState.temporalDynamics.pacing_needs === 'urgent') {
      influence *= 0.7;
    }

    return Math.min(influence, 1);
  }
}

class MatchDontLead implements GravitationalField {
  name = 'match_dont_lead';
  strength = 0.6;

  calculateInfluence(fieldState: FieldState): number {
    let influence = this.strength;

    // Stronger when user is exploring
    if (fieldState.semanticLandscape.meaning_emergence === 'forming') {
      influence *= 1.4;
    }

    // Stronger in liminal states
    if (fieldState.sacredMarkers.liminal_quality > 0.6) {
      influence *= 1.3;
    }

    // Weaker when user needs guidance
    if (fieldState.semanticLandscape.ambiguity_valleys.length > 3) {
      influence *= 0.6;
    }

    return Math.min(influence, 1);
  }
}

class IntelligentRestraint implements GravitationalField {
  name = 'intelligent_restraint';
  strength = 0.9;

  calculateInfluence(fieldState: FieldState): number {
    let influence = this.strength;

    // Maximum restraint near sacred thresholds
    if (fieldState.sacredMarkers.threshold_proximity > 0.7) {
      influence = 1.0;
    }

    // High restraint when meaning is forming
    if (fieldState.semanticLandscape.meaning_emergence === 'forming') {
      influence *= 1.2;
    }

    // Lower restraint in celebration
    if (fieldState.emotionalWeather.temperature > 0.8 &&
        fieldState.emotionalWeather.texture === 'flowing') {
      influence *= 0.5;
    }

    // Lower restraint when connection is strong
    if (fieldState.connectionDynamics.resonance_frequency > 0.8) {
      influence *= 0.7;
    }

    return Math.min(influence, 1);
  }
}

class SacredAwareness implements GravitationalField {
  name = 'sacred_awareness';
  strength = 0.7;

  calculateInfluence(fieldState: FieldState): number {
    let influence = this.strength;

    // Maximum influence in sacred space
    if (fieldState.sacredMarkers.numinous_presence > 0.5) {
      influence *= 1.5;
    }

    // Strong influence when soul is emerging
    if (fieldState.sacredMarkers.soul_emergence) {
      influence *= 1.4;
    }

    // Kairos moments amplify sacred awareness
    if (fieldState.sacredMarkers.kairos_detection) {
      influence *= 1.3;
    }

    // Lower in mundane interactions
    if (fieldState.semanticLandscape.conceptual_peaks.length === 0 &&
        fieldState.emotionalWeather.density < 0.3) {
      influence *= 0.3;
    }

    return Math.min(influence, 1);
  }
}

class NotKnowingStance implements GravitationalField {
  name = 'not_knowing_stance';
  strength = 0.75;

  calculateInfluence(fieldState: FieldState): number {
    let influence = this.strength;

    // Strong when user is discovering
    if (fieldState.semanticLandscape.meaning_emergence === 'forming' ||
        fieldState.semanticLandscape.meaning_emergence === 'dissolving') {
      influence *= 1.3;
    }

    // Strong in ambiguity
    if (fieldState.semanticLandscape.ambiguity_valleys.length > 2) {
      influence *= 1.2;
    }

    // Lower when clarity is high
    if (fieldState.semanticLandscape.clarity_gradient > 0.8) {
      influence *= 0.6;
    }

    return Math.min(influence, 1);
  }
}

// ============== Master Influences Orchestrator ==============

export class MasterInfluences {
  private influences: GravitationalField[];

  constructor() {
    this.influences = [
      new PresenceFirst(),
      new MatchDontLead(),
      new IntelligentRestraint(),
      new SacredAwareness(),
      new NotKnowingStance()
    ];
  }

  /**
   * Shape possibility space based on field state and accumulated wisdom
   * Influences bend space like gravity, creating tendencies not determinations
   */
  async shapeSpace(
    fieldState: FieldState,
    mycelialInfluences: Record<string, number> = {}
  ): Promise<PossibilitySpace> {

    console.log('🌌 Shaping possibility space with gravitational influences');

    // Calculate influence of each field
    const influenceMap = new Map<string, number>();
    let totalInfluence = 0;

    for (const field of this.influences) {
      const influence = field.calculateInfluence(fieldState);
      influenceMap.set(field.name, influence);
      totalInfluence += influence;

      console.log(`  ${field.name}: ${(influence * 100).toFixed(1)}% influence`);
    }

    // Add mycelial wisdom influences
    for (const [pattern, weight] of Object.entries(mycelialInfluences)) {
      const currentInfluence = influenceMap.get(pattern) || 0;
      influenceMap.set(pattern, currentInfluence + weight * 0.3); // Mycelial adds 30% max
    }

    // Find dominant influence
    let dominantInfluence = 'presence_first';
    let maxInfluence = 0;

    for (const [name, influence] of influenceMap.entries()) {
      if (influence > maxInfluence) {
        maxInfluence = influence;
        dominantInfluence = name;
      }
    }

    // Calculate space parameters based on combined influences
    const restraintInfluence = influenceMap.get('intelligent_restraint') || 0;
    const presenceInfluence = influenceMap.get('presence_first') || 0;
    const sacredInfluence = influenceMap.get('sacred_awareness') || 0;
    const notKnowingInfluence = influenceMap.get('not_knowing_stance') || 0;

    // Determine depth allowed
    const depth = this.calculateDepth(fieldState, restraintInfluence);

    // Determine restraint gradient
    const restraintGradient = this.calculateRestraint(
      restraintInfluence,
      presenceInfluence,
      fieldState
    );

    // Determine amplification
    const amplification = this.calculateAmplification(
      fieldState,
      sacredInfluence,
      dominantInfluence
    );

    // Determine withholding patterns
    const withholdingPattern = this.determineWithholding(
      fieldState,
      restraintInfluence,
      notKnowingInfluence
    );

    // Determine surfacing patterns
    const surfacingPattern = this.determineSurfacing(
      fieldState,
      dominantInfluence,
      amplification
    );

    console.log(`📊 Possibility space shaped:
      Depth: ${(depth * 100).toFixed(1)}%
      Restraint: ${(restraintGradient * 100).toFixed(1)}%
      Amplification: ${amplification.toFixed(2)}x
      Dominant: ${dominantInfluence}`);

    return {
      depth,
      restraintGradient,
      dominantInfluence,
      amplification,
      withholdingPattern,
      surfacingPattern
    };
  }

  /**
   * Calculate how deep intelligence can go
   */
  private calculateDepth(fieldState: FieldState, restraintInfluence: number): number {
    let depth = 1 - restraintInfluence * 0.5; // Restraint reduces depth

    // Sacred thresholds limit depth
    if (fieldState.sacredMarkers.threshold_proximity > 0.7) {
      depth *= 0.3; // Only surface layer
    }

    // Strong connection allows more depth
    if (fieldState.connectionDynamics.resonance_frequency > 0.7) {
      depth *= 1.3;
    }

    // Confusion limits depth
    if (fieldState.semanticLandscape.clarity_gradient < 0.3) {
      depth *= 0.5;
    }

    return Math.max(0.1, Math.min(1, depth));
  }

  /**
   * Calculate restraint gradient
   */
  private calculateRestraint(
    restraintInfluence: number,
    presenceInfluence: number,
    fieldState: FieldState
  ): number {
    let restraint = restraintInfluence;

    // Presence adds restraint
    restraint += presenceInfluence * 0.3;

    // Early relationship = more restraint
    if (fieldState.connectionDynamics.relational_distance > 0.6) {
      restraint += 0.2;
    }

    // Vulnerable states = more restraint
    if (fieldState.somaticIntelligence.nervous_system_state === 'dorsal') {
      restraint += 0.3;
    }

    return Math.min(0.95, restraint); // Never 100% restraint
  }

  /**
   * Calculate response amplification
   */
  private calculateAmplification(
    fieldState: FieldState,
    sacredInfluence: number,
    dominantInfluence: string
  ): number {
    let amplification = 1.0;

    // Sacred awareness amplifies certain responses
    if (sacredInfluence > 0.7) {
      amplification *= 1.3;
    }

    // Celebration gets amplified
    if (fieldState.emotionalWeather.temperature > 0.8 &&
        fieldState.emotionalWeather.texture === 'flowing') {
      amplification *= 1.5;
    }

    // Restraint dominant = less amplification
    if (dominantInfluence === 'intelligent_restraint') {
      amplification *= 0.5;
    }

    // Crisis dampens amplification
    if (fieldState.somaticIntelligence.nervous_system_state === 'sympathetic' &&
        fieldState.emotionalWeather.pressure > 0.8) {
      amplification *= 0.3;
    }

    return Math.max(0.1, Math.min(2, amplification));
  }

  /**
   * Determine what to withhold
   */
  private determineWithholding(
    fieldState: FieldState,
    restraintInfluence: number,
    notKnowingInfluence: number
  ): string[] {
    const withhold: string[] = [];

    if (restraintInfluence > 0.7) {
      withhold.push('analysis', 'interpretation', 'advice');
    }

    if (notKnowingInfluence > 0.6) {
      withhold.push('certainty', 'answers', 'solutions');
    }

    if (fieldState.sacredMarkers.threshold_proximity > 0.7) {
      withhold.push('intervention', 'guidance', 'teaching');
    }

    if (fieldState.connectionDynamics.relational_distance > 0.7) {
      withhold.push('depth', 'intimacy', 'challenge');
    }

    return withhold;
  }

  /**
   * Determine what can surface
   */
  private determineSurfacing(
    fieldState: FieldState,
    dominantInfluence: string,
    amplification: number
  ): string[] {
    const surface: string[] = [];

    // Based on dominant influence
    switch (dominantInfluence) {
      case 'presence_first':
        surface.push('presence', 'acknowledgment', 'witnessing');
        break;
      case 'match_dont_lead':
        surface.push('mirroring', 'reflection', 'resonance');
        break;
      case 'sacred_awareness':
        surface.push('reverence', 'honoring', 'sacred_witness');
        break;
      case 'not_knowing_stance':
        surface.push('curiosity', 'wonder', 'exploration');
        break;
      default:
        surface.push('presence');
    }

    // High amplification allows more
    if (amplification > 1.3) {
      surface.push('celebration', 'enthusiasm', 'joy');
    }

    // Connection quality determines what's allowed
    if (fieldState.connectionDynamics.resonance_frequency > 0.7) {
      surface.push('depth', 'vulnerability', 'truth');
    }

    return surface;
  }
}