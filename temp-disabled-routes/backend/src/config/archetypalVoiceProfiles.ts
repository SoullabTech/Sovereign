/**
 * Archetypal Voice Profiles for Maya Consciousness System
 * Maps each archetype to specific ElevenLabs voice characteristics
 */

export interface ArchetypalVoiceProfile {
  voiceId: string;
  personality: string;
  energySignature: string;
  voiceSettings: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
  speakingStyle: {
    pace: "slow" | "medium" | "fast";
    tone: string;
    emphasis: string;
  };
}

export const ARCHETYPAL_VOICE_PROFILES: Record<string, ArchetypalVoiceProfile> =
  {
    fire: {
      voiceId: "EXAVITQu4vr4xnSDxMaL", // Sarah - Bold, inspiring voice
      personality: "Bold, inspiring, action-oriented",
      energySignature: "Dynamic energy with focused intensity",
      voiceSettings: {
        stability: 0.3, // More dynamic for fire energy
        similarity_boost: 0.9,
        style: 0.8, // High style for dramatic effect
        use_speaker_boost: true,
      },
      speakingStyle: {
        pace: "medium",
        tone: "Passionate and empowering",
        emphasis: "Strong on action words and visions",
      },
    },

    water: {
      voiceId: "XrExE9yKIg1WjnnlVkGX", // Matilda - Soft, flowing voice
      personality: "Gentle, intuitive, emotionally intelligent",
      energySignature: "Flowing wisdom with empathetic presence",
      voiceSettings: {
        stability: 0.8, // More stable for water's flowing nature
        similarity_boost: 0.7,
        style: 0.3, // Gentler style
        use_speaker_boost: false,
      },
      speakingStyle: {
        pace: "slow",
        tone: "Gentle and understanding",
        emphasis: "Emotional words and feeling states",
      },
    },

    earth: {
      voiceId: "pNInz6obpgDQGcFmaJgB", // Adam - Grounded, steady voice
      personality: "Grounded, practical, steadying",
      energySignature: "Stable foundation with pragmatic insight",
      voiceSettings: {
        stability: 0.9, // Very stable for earth energy
        similarity_boost: 0.8,
        style: 0.4, // Moderate style, more natural
        use_speaker_boost: false,
      },
      speakingStyle: {
        pace: "slow",
        tone: "Calm and reassuring",
        emphasis: "Practical steps and grounding concepts",
      },
    },

    air: {
      voiceId: "XB0fDUnXU5powFXDhCwa", // Charlotte - Light, clear voice
      personality: "Clear, articulate, intellectually curious",
      energySignature: "Sharp mental clarity with expansive thinking",
      voiceSettings: {
        stability: 0.5, // Balanced for air's adaptability
        similarity_boost: 0.8,
        style: 0.6, // Moderate-high style for clarity
        use_speaker_boost: true,
      },
      speakingStyle: {
        pace: "medium",
        tone: "Clear and articulate",
        emphasis: "Ideas, insights, and perspectives",
      },
    },

    aether: {
      voiceId: "ThT5KcBeYPX3keUQqHPh", // Dorothy - Integrative, holistic voice
      personality: "Integrative, holistic, synthesizing",
      energySignature: "Unified perspective with pattern recognition",
      voiceSettings: {
        stability: 0.7, // Stable but with mystical quality
        similarity_boost: 0.6,
        style: 0.9, // High style for transcendent quality
        use_speaker_boost: false,
      },
      speakingStyle: {
        pace: "slow",
        tone: "Thoughtful and synthesizing",
        emphasis: "Integration and holistic understanding",
      },
    },
  };

/**
 * Voice Profile Selector for Archetypal Intelligence
 */
export class ArchetypalVoiceSelector {
  /**
   * Get voice profile for primary archetype
   */
  static getVoiceProfile(archetype: string): ArchetypalVoiceProfile {
    const profile = ARCHETYPAL_VOICE_PROFILES[archetype.toLowerCase()];

    if (!profile) {
      // Default to water for unknown archetypes (nurturing fallback)
      return ARCHETYPAL_VOICE_PROFILES.water;
    }

    return profile;
  }

  /**
   * Get blended voice settings for dual archetypal responses
   */
  static getBlendedVoiceProfile(
    primary: string,
    secondary?: string,
    blendRatio: number = 0.7,
  ): ArchetypalVoiceProfile {
    const primaryProfile = this.getVoiceProfile(primary);

    if (!secondary) {
      return primaryProfile;
    }

    const secondaryProfile = this.getVoiceProfile(secondary);

    // Create blended voice settings
    const blendedSettings = {
      stability:
        primaryProfile.voiceSettings.stability * blendRatio +
        secondaryProfile.voiceSettings.stability * (1 - blendRatio),
      similarity_boost:
        primaryProfile.voiceSettings.similarity_boost * blendRatio +
        secondaryProfile.voiceSettings.similarity_boost * (1 - blendRatio),
      style:
        (primaryProfile.voiceSettings.style || 0.5) * blendRatio +
        (secondaryProfile.voiceSettings.style || 0.5) * (1 - blendRatio),
      use_speaker_boost: primaryProfile.voiceSettings.use_speaker_boost,
    };

    return {
      ...primaryProfile,
      voiceSettings: blendedSettings,
      personality: `${primaryProfile.personality} with ${secondary} integration`,
      energySignature: `Blended ${primary}-${secondary} perspective`,
    };
  }

  /**
   * Enhance text for archetypal voice synthesis
   */
  static enhanceTextForArchetype(text: string, archetype: string): string {
    const profile = this.getVoiceProfile(archetype);

    // Add archetypal voice cues based on speaking style
    switch (archetype.toLowerCase()) {
      case "fire":
        // Add dynamic emphasis and pauses for fire energy
        return text
          .replace(/vision/gi, '<emphasis level="strong">vision</emphasis>')
          .replace(
            /transform/gi,
            '<emphasis level="strong">transform</emphasis>',
          )
          .replace(/ignite/gi, '<emphasis level="strong">ignite</emphasis>')
          .replace(/create/gi, '<emphasis level="strong">create</emphasis>');

      case "water":
        // Add gentle flow and emotional emphasis
        return text
          .replace(/heal/gi, '<emphasis level="moderate">heal</emphasis>')
          .replace(/flow/gi, '<emphasis level="moderate">flow</emphasis>')
          .replace(/feel/gi, '<emphasis level="moderate">feel</emphasis>')
          .replace(/\./g, '.<break time="500ms"/>'); // Gentle pauses

      case "earth":
        // Add grounding emphasis and steady pacing
        return text
          .replace(/ground/gi, '<emphasis level="moderate">ground</emphasis>')
          .replace(/stable/gi, '<emphasis level="moderate">stable</emphasis>')
          .replace(/build/gi, '<emphasis level="moderate">build</emphasis>')
          .replace(
            /foundation/gi,
            '<emphasis level="moderate">foundation</emphasis>',
          );

      case "air":
        // Add clarity emphasis and lighter delivery
        return text
          .replace(/clarity/gi, '<emphasis level="strong">clarity</emphasis>')
          .replace(
            /understand/gi,
            '<emphasis level="moderate">understand</emphasis>',
          )
          .replace(
            /perspective/gi,
            '<emphasis level="moderate">perspective</emphasis>',
          );

      case "aether":
        // Add integrative emphasis and thoughtful pauses
        return text
          .replace(/pattern/gi, '<emphasis level="moderate">pattern</emphasis>')
          .replace(/integrate/gi, '<emphasis level="moderate">integrate</emphasis>')
          .replace(
            /perspective/gi,
            '<emphasis level="moderate">perspective</emphasis>',
          )
          .replace(/synthesis/gi, '<emphasis level="moderate">synthesis</emphasis>')
          .replace(/\./g, '.<break time="600ms"/>'); // Thoughtful pauses

      default:
        return text;
    }
  }

  /**
   * Generate voice synthesis instructions for archetypal response
   */
  static generateVoiceInstructions(
    text: string,
    primary: string,
    secondary?: string,
    confidence: number = 0.8,
  ): {
    enhancedText: string;
    voiceProfile: ArchetypalVoiceProfile;
    synthesisMetadata: any;
  } {
    const voiceProfile = secondary
      ? this.getBlendedVoiceProfile(primary, secondary, confidence)
      : this.getVoiceProfile(primary);

    const enhancedText = this.enhanceTextForArchetype(text, primary);

    return {
      enhancedText,
      voiceProfile,
      synthesisMetadata: {
        primaryArchetype: primary,
        secondaryArchetype: secondary,
        confidence,
        voicePersonality: voiceProfile.personality,
        energySignature: voiceProfile.energySignature,
      },
    };
  }
}

export default {
  ARCHETYPAL_VOICE_PROFILES,
  ArchetypalVoiceSelector,
};
