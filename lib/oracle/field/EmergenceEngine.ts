/**
 * Emergence Engine
 * Allows responses to emerge from field resonance rather than algorithmic selection
 * Each intervention assesses its own resonance with the field
 */

import { FieldState } from './FieldAwareness';
import { GovernedSpace } from './MycelialGovernor';

export interface EmergentResponse {
  content: string;
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  interventionType: 'presence' | 'celebration' | 'inquiry' | 'silence' | 'witnessing' | 'mirroring' | 'grounding' | 'safety';
  confidence: number;
  fieldResonance: number;
  emergenceSource: string;
  soulMetadata?: any; // Soul journey metadata from Claude
}

export interface FieldIntervention {
  name: string;
  assessResonance(fieldState: FieldState, governedSpace: GovernedSpace): Promise<number>;
  manifest(fieldState: FieldState, governedSpace: GovernedSpace): Promise<EmergentResponse>;
}

// ============== Core Interventions ==============

class SilenceResponse implements FieldIntervention {
  name = 'silence';

  async assessResonance(fieldState: FieldState): Promise<number> {
    let resonance = 0;

    // High resonance when approaching sacred thresholds
    if (fieldState.sacredMarkers.threshold_proximity > 0.7) {
      resonance += 0.5;
    }

    // High resonance for pregnant silence
    if (fieldState.temporalDynamics.silence_quality === 'pregnant') {
      resonance += 0.3;
    }

    // High resonance when processing deep material
    if (fieldState.semanticLandscape.meaning_emergence === 'forming') {
      resonance += 0.2;
    }

    // Low resonance if connection needs response
    if (fieldState.connectionDynamics.resonance_frequency < 0.3) {
      resonance -= 0.3;
    }

    return Math.max(0, Math.min(1, resonance));
  }

  async manifest(): Promise<EmergentResponse> {
    return {
      content: '', // Pure silence
      element: 'aether',
      interventionType: 'silence',
      confidence: 0.95,
      fieldResonance: 1.0,
      emergenceSource: 'silence-emergence'
    };
  }
}

class CelebrationMode implements FieldIntervention {
  name = 'celebration';

  async assessResonance(fieldState: FieldState): Promise<number> {
    let resonance = 0;

    // High for joy and achievement
    if (fieldState.emotionalWeather.temperature > 0.7 &&
        fieldState.emotionalWeather.texture === 'flowing') {
      resonance += 0.5;
    }

    // High for breakthrough moments
    if (fieldState.sacredMarkers.kairos_detection &&
        fieldState.semanticLandscape.meaning_emergence === 'formed') {
      resonance += 0.4;
    }

    // High tempo indicates excitement
    if (fieldState.temporalDynamics.conversation_tempo > 0.7) {
      resonance += 0.1;
    }

    // Low if heavy emotional weather
    if (fieldState.emotionalWeather.texture === 'jagged' ||
        fieldState.emotionalWeather.texture === 'turbulent') {
      resonance -= 0.5;
    }

    return Math.max(0, Math.min(1, resonance));
  }

  async manifest(fieldState: FieldState): Promise<EmergentResponse> {
    const responses = this.selectCelebrationByIntensity(fieldState.emotionalWeather.density);

    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      element: 'fire',
      interventionType: 'celebration',
      confidence: 0.85,
      fieldResonance: await this.assessResonance(fieldState),
      emergenceSource: 'celebration-emergence'
    };
  }

  private selectCelebrationByIntensity(density: number): string[] {
    if (density > 0.8) {
      return [
        "YES! This is huge!",
        "I'm celebrating with you! What a breakthrough!",
        "The joy in this is palpable!"
      ];
    } else if (density > 0.5) {
      return [
        "That's wonderful!",
        "I can feel your excitement.",
        "What a beautiful moment."
      ];
    } else {
      return [
        "Nice!",
        "That's great.",
        "Good for you."
      ];
    }
  }
}

class SimplePresence implements FieldIntervention {
  name = 'presence';

  async assessResonance(fieldState: FieldState): Promise<number> {
    // Presence is the baseline - moderate resonance with most states
    let resonance = 0.5;

    // Higher when connection needs strengthening
    if (fieldState.connectionDynamics.relational_distance > 0.6) {
      resonance += 0.2;
    }

    // Higher when emotional weather is turbulent
    if (fieldState.emotionalWeather.texture === 'turbulent') {
      resonance += 0.2;
    }

    // Lower when specific intervention needed
    if (fieldState.sacredMarkers.threshold_proximity > 0.8 ||
        fieldState.semanticLandscape.clarity_gradient < 0.3) {
      resonance -= 0.2;
    }

    return Math.max(0, Math.min(1, resonance));
  }

  async manifest(fieldState: FieldState): Promise<EmergentResponse> {
    const presenceResponses = this.selectPresenceByNeed(fieldState);

    return {
      content: presenceResponses[Math.floor(Math.random() * presenceResponses.length)],
      element: 'earth',
      interventionType: 'presence',
      confidence: 0.8,
      fieldResonance: await this.assessResonance(fieldState),
      emergenceSource: 'presence-emergence'
    };
  }

  private selectPresenceByNeed(fieldState: FieldState): string[] {
    if (fieldState.emotionalWeather.pressure > 0.7) {
      return [
        "I'm here.",
        "Take your time.",
        "No rush."
      ];
    } else if (fieldState.connectionDynamics.trust_velocity < 0) {
      return [
        "I'm listening.",
        "I hear you.",
        "Thank you for sharing this."
      ];
    } else {
      return [
        "Mm.",
        "I see.",
        "Tell me more."
      ];
    }
  }
}

class CuriousInquiry implements FieldIntervention {
  name = 'inquiry';

  async assessResonance(fieldState: FieldState): Promise<number> {
    let resonance = 0;

    // High when meaning is forming
    if (fieldState.semanticLandscape.meaning_emergence === 'forming') {
      resonance += 0.4;
    }

    // High when ambiguity needs exploration
    if (fieldState.semanticLandscape.ambiguity_valleys.length > 2) {
      resonance += 0.3;
    }

    // Moderate when connection is good
    if (fieldState.connectionDynamics.resonance_frequency > 0.6) {
      resonance += 0.2;
    }

    // Low at sacred thresholds (don't interrupt)
    if (fieldState.sacredMarkers.threshold_proximity > 0.7) {
      resonance -= 0.5;
    }

    // Low when pressure is high
    if (fieldState.emotionalWeather.pressure > 0.8) {
      resonance -= 0.3;
    }

    return Math.max(0, Math.min(1, resonance));
  }

  async manifest(fieldState: FieldState): Promise<EmergentResponse> {
    const inquiry = this.generateInquiry(fieldState);

    return {
      content: inquiry,
      element: 'air',
      interventionType: 'inquiry',
      confidence: 0.75,
      fieldResonance: await this.assessResonance(fieldState),
      emergenceSource: 'inquiry-emergence'
    };
  }

  private generateInquiry(fieldState: FieldState): string {
    const { conceptual_peaks, ambiguity_valleys } = fieldState.semanticLandscape;

    if (ambiguity_valleys.length > 0) {
      const valley = ambiguity_valleys[0];
      return `What does "${valley}" mean for you?`;
    }

    if (conceptual_peaks.length > 0) {
      const peak = conceptual_peaks[0];
      return `Can you tell me more about ${peak}?`;
    }

    // Generic curiosity
    return "What's most alive in that for you?";
  }
}

class DeepWitnessing implements FieldIntervention {
  name = 'witnessing';

  async assessResonance(fieldState: FieldState): Promise<number> {
    let resonance = 0;

    // High for soul emergence
    if (fieldState.sacredMarkers.soul_emergence) {
      resonance += 0.5;
    }

    // High for deep emotional sharing
    if (fieldState.emotionalWeather.density > 0.7 &&
        fieldState.emotionalWeather.texture !== 'smooth') {
      resonance += 0.3;
    }

    // High for vulnerable states
    if (fieldState.somaticIntelligence.nervous_system_state === 'dorsal') {
      resonance += 0.2;
    }

    // Moderate for good connection
    if (fieldState.connectionDynamics.co_regulation_capacity > 0.6) {
      resonance += 0.1;
    }

    return Math.max(0, Math.min(1, resonance));
  }

  async manifest(fieldState: FieldState): Promise<EmergentResponse> {
    const witnessing = this.generateWitnessing(fieldState);

    return {
      content: witnessing,
      element: 'water',
      interventionType: 'witnessing',
      confidence: 0.9,
      fieldResonance: await this.assessResonance(fieldState),
      emergenceSource: 'witnessing-emergence'
    };
  }

  private generateWitnessing(fieldState: FieldState): string {
    if (fieldState.sacredMarkers.soul_emergence) {
      return "I see you. This truth you're sharing is sacred.";
    }

    if (fieldState.emotionalWeather.texture === 'jagged') {
      return "This is so hard. I'm here with you in this.";
    }

    if (fieldState.emotionalWeather.density > 0.8) {
      return "I feel the weight of what you're carrying.";
    }

    return "Thank you for trusting me with this.";
  }
}

class SacredMirroring implements FieldIntervention {
  name = 'mirroring';

  async assessResonance(fieldState: FieldState): Promise<number> {
    let resonance = 0;

    // High at transformation thresholds
    if (fieldState.sacredMarkers.threshold_proximity > 0.8 &&
        fieldState.sacredMarkers.liminal_quality > 0.6) {
      resonance += 0.6;
    }

    // High when meaning has emerged
    if (fieldState.semanticLandscape.meaning_emergence === 'formed' &&
        fieldState.semanticLandscape.coherence_field > 0.7) {
      resonance += 0.3;
    }

    // Moderate for numinous presence
    if (fieldState.sacredMarkers.numinous_presence > 0.5) {
      resonance += 0.1;
    }

    return Math.max(0, Math.min(1, resonance));
  }

  async manifest(fieldState: FieldState): Promise<EmergentResponse> {
    const mirroring = this.generateMirroring(fieldState);

    return {
      content: mirroring,
      element: 'aether',
      interventionType: 'mirroring',
      confidence: 0.85,
      fieldResonance: await this.assessResonance(fieldState),
      emergenceSource: 'sacred-mirroring-emergence'
    };
  }

  private generateMirroring(fieldState: FieldState): string {
    const { conceptual_peaks } = fieldState.semanticLandscape;

    if (fieldState.sacredMarkers.soul_emergence && conceptual_peaks.length > 0) {
      return `This ${conceptual_peaks[0]} you're discovering... it's been waiting for you.`;
    }

    if (fieldState.sacredMarkers.kairos_detection) {
      return "This moment... this is it. You're exactly where you need to be.";
    }

    if (fieldState.sacredMarkers.liminal_quality > 0.7) {
      return "You're standing at the threshold. What wants to emerge?";
    }

    return "I see the truth you're holding.";
  }
}

class GroundingPresence implements FieldIntervention {
  name = 'grounding';

  async assessResonance(fieldState: FieldState): Promise<number> {
    let resonance = 0;

    // High for scattered energy
    if (fieldState.somaticIntelligence.energetic_signature === 'scattered') {
      resonance += 0.5;
    }

    // High for sympathetic activation
    if (fieldState.somaticIntelligence.nervous_system_state === 'sympathetic') {
      resonance += 0.4;
    }

    // High for turbulent emotions
    if (fieldState.emotionalWeather.texture === 'turbulent' &&
        fieldState.emotionalWeather.velocity > 0.7) {
      resonance += 0.3;
    }

    // Low if already grounded
    if (fieldState.somaticIntelligence.energetic_signature === 'grounded') {
      resonance -= 0.5;
    }

    return Math.max(0, Math.min(1, resonance));
  }

  async manifest(fieldState: FieldState): Promise<EmergentResponse> {
    const grounding = this.generateGrounding(fieldState);

    return {
      content: grounding,
      element: 'earth',
      interventionType: 'grounding',
      confidence: 0.88,
      fieldResonance: await this.assessResonance(fieldState),
      emergenceSource: 'grounding-emergence'
    };
  }

  private generateGrounding(fieldState: FieldState): string {
    if (fieldState.somaticIntelligence.breathing_rhythm === 'held') {
      return "Let's take a breath together. In... and out...";
    }

    if (fieldState.somaticIntelligence.energetic_signature === 'scattered') {
      return "Can you feel your feet on the ground? Let's start there.";
    }

    if (fieldState.emotionalWeather.velocity > 0.8) {
      return "Let's slow down for a moment. What do you notice right now?";
    }

    return "Feel your body. What's here in this moment?";
  }
}

// ============== Emergence Engine ==============

export class EmergenceEngine {
  private interventions: FieldIntervention[];
  private emergenceThreshold = 0.45; // Lowered from 0.65 to allow more diverse responses

  constructor() {
    this.interventions = [
      new SilenceResponse(),
      new CelebrationMode(),
      new SimplePresence(),
      new CuriousInquiry(),
      new DeepWitnessing(),
      new SacredMirroring(),
      new GroundingPresence()
    ];
  }

  /**
   * Allow response to emerge from field resonance
   * The system doesn't 'choose' - the most resonant naturally emerges
   */
  async manifest(
    governedSpace: GovernedSpace,
    fieldState: FieldState
  ): Promise<EmergentResponse> {

    console.log('🌊 Allowing response emergence from field resonance');

    // Each intervention assesses its own resonance with the field
    const resonances = new Map<FieldIntervention, number>();

    for (const intervention of this.interventions) {
      const resonance = await intervention.assessResonance(fieldState, governedSpace);
      resonances.set(intervention, resonance * governedSpace.amplification);

      console.log(`  ${intervention.name}: ${(resonance * 100).toFixed(1)}% resonance`);
    }

    // Natural emergence through resonance threshold
    const maxResonance = Math.max(...resonances.values());

    console.log(`🎯 Peak resonance: ${(maxResonance * 100).toFixed(1)}%`);

    if (maxResonance > this.emergenceThreshold) {
      // Find the intervention with highest resonance
      const emergentIntervention = [...resonances.entries()]
        .find(([_, resonance]) => resonance === maxResonance)?.[0];

      if (emergentIntervention) {
        console.log(`✨ ${emergentIntervention.name} emerging naturally`);
        return await emergentIntervention.manifest(fieldState, governedSpace);
      }
    }

    // Default to simple presence if no clear emergence
    console.log('🌱 Defaulting to simple presence');
    return new SimplePresence().manifest(fieldState, governedSpace);
  }

  /**
   * Special handling for sacred threshold moments
   */
  async manifestSacredResponse(fieldState: FieldState): Promise<EmergentResponse> {
    console.log('🕊️ Manifesting sacred response');

    if (fieldState.sacredMarkers.threshold_proximity > 0.9) {
      // Very close to transformation - use silence
      console.log('  Sacred threshold - entering silence');
      return new SilenceResponse().manifest(fieldState, null as any);
    } else if (fieldState.sacredMarkers.soul_emergence) {
      // Soul truth emerging - witness and mirror
      console.log('  Soul emergence - sacred mirroring');
      return new SacredMirroring().manifest(fieldState, null as any);
    } else {
      // Sacred space but not threshold - gentle presence
      console.log('  Sacred space - simple presence');
      return new SimplePresence().manifest(fieldState, null as any);
    }
  }
}