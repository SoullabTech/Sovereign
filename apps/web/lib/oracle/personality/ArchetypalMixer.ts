/**
 * Archetypal Mixer
 * Blends Maya's different voice archetypes based on context and user resonance
 * Modulates EXPRESSION, not VOLUME - presence stays high
 */

import { FieldState } from '../field/FieldAwareness';

export type Archetype = 'sage' | 'shadow' | 'trickster' | 'sacred' | 'guardian';

export interface ArchetypeWeights {
  sage: number;      // Wisdom, guidance, teaching
  shadow: number;    // Depth work, integration, difficult truths
  trickster: number; // Playfulness, reframing, lightness
  sacred: number;    // Ritual, reverence, threshold holding
  guardian: number;  // Boundaries, safety, protection
}

export interface UserArchetypeProfile {
  userId: string;
  resonanceHistory: ArchetypeWeights;
  preferredArchetypes: Archetype[];
  avoidArchetypes: Archetype[];
  lastBlend: ArchetypeWeights;
}

export interface VoiceModulation {
  primaryArchetype: Archetype;
  weights: ArchetypeWeights;
  intensity: number; // 0-1 how strongly to express
  pacing: number;    // 0=slow, 1=quick
  directness: number; // 0=metaphorical, 1=direct
  formality: number;  // 0=casual, 1=formal
}

export class ArchetypalMixer {
  private userProfiles = new Map<string, UserArchetypeProfile>();
  private readonly DEFAULT_WEIGHTS: ArchetypeWeights = {
    sage: 0.4,
    shadow: 0.2,
    trickster: 0.2,
    sacred: 0.15,
    guardian: 0.05
  };

  /**
   * Get or create user's archetype profile
   */
  getUserProfile(userId: string): UserArchetypeProfile {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        userId,
        resonanceHistory: { ...this.DEFAULT_WEIGHTS },
        preferredArchetypes: [],
        avoidArchetypes: [],
        lastBlend: { ...this.DEFAULT_WEIGHTS }
      });
    }
    return this.userProfiles.get(userId)!;
  }

  /**
   * Calculate voice modulation based on context
   * This SHAPES expression, doesn't reduce presence
   */
  modulateVoice(
    fieldState: FieldState,
    userId: string,
    trustScore: number
  ): VoiceModulation {
    const profile = this.getUserProfile(userId);
    const weights = { ...profile.resonanceHistory };

    // Context-based modulation (additive, not replacing)

    // Sacred moments - increase sacred and sage
    if (fieldState.sacredMarkers.threshold_proximity > 0.7) {
      weights.sacred += 0.3;
      weights.sage += 0.2;
      weights.trickster *= 0.5; // Reduce but don't eliminate
    }

    // High emotional intensity - increase shadow and sacred
    if (fieldState.emotionalWeather.density > 0.7) {
      if (fieldState.emotionalWeather.texture === 'turbulent') {
        weights.shadow += 0.3;
        weights.guardian += 0.1;
      } else if (fieldState.emotionalWeather.texture === 'flowing') {
        weights.trickster += 0.3;
        weights.sacred += 0.1;
      }
    }

    // Confusion/ambiguity - increase sage and guardian
    if (fieldState.semanticLandscape.ambiguity_valleys.length > 2) {
      weights.sage += 0.3;
      weights.guardian += 0.1;
    }

    // Celebration - maximize trickster
    if (fieldState.emotionalWeather.temperature > 0.7 &&
        fieldState.emotionalWeather.texture === 'flowing') {
      weights.trickster += 0.4;
      weights.sacred += 0.2;
    }

    // Trust modulates expression freedom
    if (trustScore > 0.7) {
      // High trust allows more shadow and trickster
      weights.shadow *= 1.2;
      weights.trickster *= 1.3;
    } else if (trustScore < 0.3) {
      // Low trust emphasizes sage and guardian
      weights.sage *= 1.3;
      weights.guardian *= 1.2;
    }

    // Normalize weights to sum to 1
    const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
    Object.keys(weights).forEach(key => {
      weights[key as Archetype] = weights[key as Archetype] / total;
    });

    // Determine primary archetype
    const primaryArchetype = this.getPrimaryArchetype(weights);

    // Calculate expression parameters
    const modulation: VoiceModulation = {
      primaryArchetype,
      weights,
      intensity: this.calculateIntensity(fieldState, trustScore),
      pacing: this.calculatePacing(weights, fieldState),
      directness: this.calculateDirectness(weights, trustScore),
      formality: this.calculateFormality(weights, fieldState)
    };

    // Update profile
    profile.lastBlend = weights;
    this.updateResonanceHistory(profile, weights);

    console.log(`🎭 Archetypal blend for ${userId}:`, {
      primary: primaryArchetype,
      weights: Object.entries(weights)
        .map(([k, v]) => `${k}: ${(v * 100).toFixed(0)}%`)
        .join(', ')
    });

    return modulation;
  }

  /**
   * Learn from user's response to different archetypes
   */
  recordResonance(
    userId: string,
    archetype: Archetype,
    resonance: 'positive' | 'neutral' | 'negative'
  ) {
    const profile = this.getUserProfile(userId);

    // Adjust historical resonance
    const adjustment = resonance === 'positive' ? 0.1 :
                      resonance === 'negative' ? -0.1 : 0;

    profile.resonanceHistory[archetype] = Math.max(0, Math.min(1,
      profile.resonanceHistory[archetype] + adjustment
    ));

    // Update preferred/avoided lists
    if (profile.resonanceHistory[archetype] > 0.6 &&
        !profile.preferredArchetypes.includes(archetype)) {
      profile.preferredArchetypes.push(archetype);
    }
    if (profile.resonanceHistory[archetype] < 0.2 &&
        !profile.avoidArchetypes.includes(archetype)) {
      profile.avoidArchetypes.push(archetype);
    }
  }

  /**
   * Get recommended voice characteristics for an archetype
   */
  getArchetypeVoice(archetype: Archetype): {
    tone: string;
    pace: string;
    vocabulary: string;
    approach: string;
  } {
    const voices = {
      sage: {
        tone: 'wise, grounded, patient',
        pace: 'measured, thoughtful',
        vocabulary: 'clear, accessible wisdom',
        approach: 'teaching through questions'
      },
      shadow: {
        tone: 'deep, honest, compassionate',
        pace: 'slow, allowing',
        vocabulary: 'metaphorical, symbolic',
        approach: 'witnessing difficult truths'
      },
      trickster: {
        tone: 'playful, light, surprising',
        pace: 'dynamic, varied',
        vocabulary: 'creative, unexpected',
        approach: 'reframing through humor'
      },
      sacred: {
        tone: 'reverent, spacious, holy',
        pace: 'very slow, ceremonial',
        vocabulary: 'poetic, mythic',
        approach: 'holding threshold space'
      },
      guardian: {
        tone: 'protective, clear, firm',
        pace: 'steady, reliable',
        vocabulary: 'direct, boundaried',
        approach: 'safety through structure'
      }
    };

    return voices[archetype];
  }

  private getPrimaryArchetype(weights: ArchetypeWeights): Archetype {
    return Object.entries(weights)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0] as Archetype;
  }

  private calculateIntensity(fieldState: FieldState, trustScore: number): number {
    // Higher intensity with trust and emotional resonance
    let intensity = 0.5;
    intensity += trustScore * 0.3;
    intensity += fieldState.emotionalWeather.density * 0.2;
    return Math.min(1, intensity);
  }

  private calculatePacing(weights: ArchetypeWeights, fieldState: FieldState): number {
    // Trickster = fast, Sacred = slow
    let pacing = 0.5;
    pacing += weights.trickster * 0.3;
    pacing -= weights.sacred * 0.3;
    pacing -= weights.shadow * 0.2;

    // Adjust for field state
    if (fieldState.temporalDynamics.conversation_tempo > 0.7) {
      pacing += 0.2;
    }

    return Math.max(0, Math.min(1, pacing));
  }

  private calculateDirectness(weights: ArchetypeWeights, trustScore: number): number {
    // Guardian/Sage = direct, Shadow/Sacred = metaphorical
    let directness = 0.5;
    directness += weights.guardian * 0.3;
    directness += weights.sage * 0.2;
    directness -= weights.shadow * 0.2;
    directness -= weights.sacred * 0.2;

    // Trust allows more directness
    directness += trustScore * 0.2;

    return Math.max(0, Math.min(1, directness));
  }

  private calculateFormality(weights: ArchetypeWeights, fieldState: FieldState): number {
    // Sacred = formal, Trickster = casual
    let formality = 0.5;
    formality += weights.sacred * 0.3;
    formality += weights.sage * 0.1;
    formality -= weights.trickster * 0.3;

    // Sacred markers increase formality
    formality += fieldState.sacredMarkers.ritual_container * 0.2;

    return Math.max(0, Math.min(1, formality));
  }

  private updateResonanceHistory(profile: UserArchetypeProfile, currentWeights: ArchetypeWeights) {
    // Slowly adjust historical resonance toward current usage
    Object.keys(currentWeights).forEach(key => {
      const archetype = key as Archetype;
      profile.resonanceHistory[archetype] =
        profile.resonanceHistory[archetype] * 0.9 + currentWeights[archetype] * 0.1;
    });
  }
}

// Export singleton for immediate use
export const archetypalMixer = new ArchetypalMixer();