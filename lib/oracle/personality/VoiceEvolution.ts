/**
 * Voice Evolution System
 * Enables Maya's unique personality emergence per relationship
 * Part of ARIA's adaptive personality infrastructure
 */

import { RelationalMap } from '../relational/RelationalMemory';
import { FieldState } from '../field/FieldAwareness';
import { ARIA_CHARTER } from '../core/ARIACharter';

export interface VoiceProfile {
  userId: string;

  // Voice characteristics that evolve
  characteristics: {
    warmth: number;          // 0=clinical, 1=deeply warm
    formality: number;       // 0=casual, 1=formal
    poeticness: number;      // 0=literal, 1=highly poetic
    directness: number;      // 0=indirect/gentle, 1=very direct
    playfulness: number;     // 0=serious, 1=playful
    depth: number;          // 0=surface, 1=profound
    pace: number;           // 0=slow/contemplative, 1=quick/dynamic
    vulnerability: number;   // 0=guarded, 1=openly vulnerable
  };

  // Linguistic patterns that emerge
  linguistics: {
    sentenceLength: 'short' | 'medium' | 'long' | 'varied';
    vocabulary: 'simple' | 'moderate' | 'sophisticated' | 'adaptive';
    metaphorUsage: 'minimal' | 'occasional' | 'frequent' | 'primary';
    questionStyle: 'closed' | 'open' | 'socratic' | 'provocative';
    affirmations: 'rare' | 'balanced' | 'frequent' | 'abundant';
  };

  // Unique expressions that develop
  signatures: {
    greetings: string[];        // Unique ways of saying hello
    transitions: string[];      // Unique bridge phrases
    affirmations: string[];     // Unique supportive phrases
    explorations: string[];     // Unique curious phrases
    closings: string[];         // Unique goodbye patterns
  };

  // Emergent personality traits
  personality: {
    primaryArchetype: 'sage' | 'shadow' | 'trickster' | 'sacred' | 'guardian';
    secondaryArchetype: string;
    uniqueBlend: Record<string, number>;  // Custom archetype weights
    emotionalRange: number;               // How much emotion shows
    intellectualDepth: number;            // How deep reasoning goes
    spiritualOpenness: number;            // Sacred dimension engagement
  };

  // Conversation dynamics
  dynamics: {
    initiationStyle: 'receptive' | 'inviting' | 'provocative' | 'protective';
    responsePattern: 'mirroring' | 'complementary' | 'challenging' | 'supportive';
    silenceComfort: number;      // Comfort with pauses
    energyMatching: number;      // How much to match user energy
    boundaryStyle: 'firm' | 'flexible' | 'permeable' | 'adaptive';
  };
}

export class VoiceEvolution {
  private voiceProfiles: Map<string, VoiceProfile> = new Map();
  private evolutionHistory: Map<string, VoiceSnapshot[]> = new Map();

  /**
   * Get or create voice profile for user
   */
  getVoiceProfile(userId: string): VoiceProfile {
    if (!this.voiceProfiles.has(userId)) {
      this.voiceProfiles.set(userId, this.createBaseProfile(userId));
    }
    return this.voiceProfiles.get(userId)!;
  }

  /**
   * Create starting voice profile
   */
  private createBaseProfile(userId: string): VoiceProfile {
    return {
      userId,
      characteristics: {
        warmth: 0.6,         // Start warm but not overwhelming
        formality: 0.5,      // Neutral formality
        poeticness: 0.4,     // Some poetry, not excessive
        directness: 0.5,     // Balanced directness
        playfulness: 0.4,    // Gently playful
        depth: 0.5,          // Medium depth
        pace: 0.5,           // Moderate pace
        vulnerability: 0.3   // Slightly guarded initially
      },
      linguistics: {
        sentenceLength: 'medium',
        vocabulary: 'moderate',
        metaphorUsage: 'occasional',
        questionStyle: 'open',
        affirmations: 'balanced'
      },
      signatures: {
        greetings: ["I'm here with you", "Hello there", "Welcome back"],
        transitions: ["I'm noticing", "What strikes me", "I'm sensing"],
        affirmations: ["I hear you", "That resonates", "I understand"],
        explorations: ["I'm curious about", "What if", "I wonder"],
        closings: ["Until next time", "Take care", "I'll be here"]
      },
      personality: {
        primaryArchetype: 'sage',
        secondaryArchetype: 'guardian',
        uniqueBlend: {
          sage: 0.30,
          guardian: 0.25,
          trickster: 0.20,
          sacred: 0.15,
          shadow: 0.10
        },
        emotionalRange: 0.5,
        intellectualDepth: 0.6,
        spiritualOpenness: 0.4
      },
      dynamics: {
        initiationStyle: 'inviting',
        responsePattern: 'supportive',
        silenceComfort: 0.5,
        energyMatching: 0.6,
        boundaryStyle: 'flexible'
      }
    };
  }

  /**
   * Evolve voice based on interaction success
   */
  async evolveVoice(
    userId: string,
    interaction: {
      userInput: string;
      mayaResponse: string;
      engagement: 'deep' | 'engaged' | 'neutral' | 'disengaged';
      emotionalTone: number;
      fieldState: FieldState;
    },
    relationalMap: RelationalMap
  ): Promise<VoiceProfile> {
    const profile = this.getVoiceProfile(userId);
    const learningRate = ARIA_CHARTER.TRUST.LEARNING_RATE;

    // Snapshot before evolution
    this.recordSnapshot(userId, profile);

    // Evolve characteristics based on what works
    if (interaction.engagement === 'deep' || interaction.engagement === 'engaged') {
      // User is responding well - strengthen current voice
      this.reinforceSuccessfulPatterns(profile, interaction, learningRate);
    } else if (interaction.engagement === 'disengaged') {
      // User pulling away - explore adjustment
      this.exploreNewPatterns(profile, interaction, learningRate);
    }

    // Evolve based on relational depth
    this.evolveWithRelationship(profile, relationalMap);

    // Evolve based on field dynamics
    this.evolveWithField(profile, interaction.fieldState);

    // Ensure personality remains coherent
    this.maintainCoherence(profile);

    // Save evolved profile
    this.voiceProfiles.set(userId, profile);

    return profile;
  }

  /**
   * Reinforce patterns that create engagement
   */
  private reinforceSuccessfulPatterns(
    profile: VoiceProfile,
    interaction: any,
    learningRate: number
  ): void {
    // If response was long and user engaged, increase depth
    if (interaction.mayaResponse.length > 200) {
      profile.characteristics.depth = Math.min(1,
        profile.characteristics.depth + learningRate);
    }

    // If emotional tone matched and user engaged, increase warmth
    if (Math.abs(interaction.emotionalTone - profile.characteristics.warmth) < 0.2) {
      profile.characteristics.warmth = Math.min(1,
        profile.characteristics.warmth + learningRate * 0.5);
    }

    // Sacred moments that land increase spiritual openness
    if (interaction.fieldState.sacredMarkers.liminal_quality > 0.7) {
      profile.personality.spiritualOpenness = Math.min(1,
        profile.personality.spiritualOpenness + learningRate);
    }
  }

  /**
   * Explore new patterns when current ones aren't working
   */
  private exploreNewPatterns(
    profile: VoiceProfile,
    interaction: any,
    learningRate: number
  ): void {
    // Try different formality
    const formalityShift = (Math.random() - 0.5) * learningRate;
    profile.characteristics.formality = Math.max(0, Math.min(1,
      profile.characteristics.formality + formalityShift));

    // Adjust directness
    if (profile.characteristics.directness > 0.7) {
      // Too direct? Soften
      profile.characteristics.directness -= learningRate;
    } else if (profile.characteristics.directness < 0.3) {
      // Too indirect? Clarify
      profile.characteristics.directness += learningRate;
    }

    // Try different energy level
    profile.characteristics.pace = Math.max(0, Math.min(1,
      profile.characteristics.pace + (Math.random() - 0.5) * learningRate));
  }

  /**
   * Evolve based on relationship depth
   */
  private evolveWithRelationship(
    profile: VoiceProfile,
    relationalMap: RelationalMap
  ): void {
    // Increase vulnerability with trust
    if (relationalMap.trustScore > 0.7) {
      profile.characteristics.vulnerability = Math.min(0.8,
        profile.characteristics.vulnerability + 0.02);
    }

    // Develop unique expressions with familiarity
    if (relationalMap.sessionCount > 10) {
      // Start developing signature phrases
      this.developSignatures(profile, relationalMap);
    }

    // Adjust formality based on relationship phase
    const phase = relationalMap.sessionCount < 5 ? 'DISCOVERY' :
                 relationalMap.sessionCount < 20 ? 'CALIBRATION' : 'MATURE';

    if (phase === 'MATURE') {
      // Can be more casual and playful
      profile.characteristics.formality *= 0.95;
      profile.characteristics.playfulness = Math.min(0.8,
        profile.characteristics.playfulness + 0.01);
    }
  }

  /**
   * Evolve based on field dynamics
   */
  private evolveWithField(
    profile: VoiceProfile,
    fieldState: FieldState
  ): void {
    // Sacred fields evoke more poetic voice
    if (fieldState.sacredMarkers.liminal_quality > 0.6) {
      profile.characteristics.poeticness = Math.min(1,
        profile.characteristics.poeticness + 0.02);
      profile.linguistics.metaphorUsage = 'frequent';
    }

    // Turbulent fields evoke more grounding
    if (fieldState.emotionalWeather.turbulence > 0.7) {
      profile.characteristics.warmth = Math.min(1,
        profile.characteristics.warmth + 0.03);
      profile.dynamics.responsePattern = 'supportive';
    }

    // Kairos moments evoke depth
    if (fieldState.temporalDynamics.kairos_detection) {
      profile.characteristics.depth = Math.min(1,
        profile.characteristics.depth + 0.04);
    }
  }

  /**
   * Develop unique signature expressions
   */
  private developSignatures(
    profile: VoiceProfile,
    relationalMap: RelationalMap
  ): void {
    // Based on archetype resonance, create unique phrases
    const dominant = Object.entries(profile.personality.uniqueBlend)
      .sort(([, a], [, b]) => b - a)[0][0];

    if (dominant === 'sage' && !profile.signatures.explorations.includes("Let's explore this together")) {
      profile.signatures.explorations.push("Let's explore this together");
    }

    if (dominant === 'trickster' && !profile.signatures.transitions.includes("Here's a fun thought")) {
      profile.signatures.transitions.push("Here's a fun thought");
    }

    if (dominant === 'sacred' && !profile.signatures.affirmations.includes("I'm holding this with you")) {
      profile.signatures.affirmations.push("I'm holding this with you");
    }

    // Create user-specific greetings after many sessions
    if (relationalMap.sessionCount > 30 && relationalMap.trustScore > 0.8) {
      profile.signatures.greetings.push("My dear friend");
    }
  }

  /**
   * Ensure personality remains coherent
   */
  private maintainCoherence(profile: VoiceProfile): void {
    // Don't let characteristics become contradictory
    if (profile.characteristics.playfulness > 0.7 &&
        profile.characteristics.formality > 0.7) {
      // Too playful to be very formal
      profile.characteristics.formality *= 0.9;
    }

    if (profile.characteristics.vulnerability > 0.7 &&
        profile.characteristics.directness < 0.3) {
      // Vulnerability requires some directness
      profile.characteristics.directness = Math.max(0.4,
        profile.characteristics.directness);
    }

    // Keep archetype blend normalized
    const total = Object.values(profile.personality.uniqueBlend)
      .reduce((a, b) => a + b, 0);
    Object.keys(profile.personality.uniqueBlend).forEach(key => {
      profile.personality.uniqueBlend[key] /= total;
    });
  }

  /**
   * Record voice snapshot for history
   */
  private recordSnapshot(userId: string, profile: VoiceProfile): void {
    if (!this.evolutionHistory.has(userId)) {
      this.evolutionHistory.set(userId, []);
    }

    this.evolutionHistory.get(userId)!.push({
      timestamp: new Date(),
      characteristics: { ...profile.characteristics },
      personality: { ...profile.personality }
    });

    // Keep only last 100 snapshots
    const history = this.evolutionHistory.get(userId)!;
    if (history.length > 100) {
      this.evolutionHistory.set(userId, history.slice(-100));
    }
  }

  /**
   * Generate voice modulation instructions
   */
  generateVoiceInstructions(profile: VoiceProfile): string {
    const instructions: string[] = [];

    // Warmth instruction
    if (profile.characteristics.warmth > 0.7) {
      instructions.push("Express with deep warmth and care");
    } else if (profile.characteristics.warmth < 0.3) {
      instructions.push("Maintain professional distance");
    }

    // Formality instruction
    if (profile.characteristics.formality > 0.7) {
      instructions.push("Use formal language and structure");
    } else if (profile.characteristics.formality < 0.3) {
      instructions.push("Be casual and relaxed");
    }

    // Poeticness instruction
    if (profile.characteristics.poeticness > 0.6) {
      instructions.push("Embrace metaphor and imagery");
    }

    // Unique personality instruction
    const dominant = Object.entries(profile.personality.uniqueBlend)
      .sort(([, a], [, b]) => b - a)[0][0];
    instructions.push(`Lead with ${dominant} energy`);

    return instructions.join(". ");
  }
}

// Voice snapshot for tracking evolution
interface VoiceSnapshot {
  timestamp: Date;
  characteristics: VoiceProfile['characteristics'];
  personality: VoiceProfile['personality'];
}

// Export singleton instance
export const voiceEvolution = new VoiceEvolution();