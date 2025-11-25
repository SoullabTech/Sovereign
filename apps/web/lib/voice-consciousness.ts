/**
 * Voice Consciousness Integration
 * Adds somatic resonance and emotional depth to voice responses
 */

import { VoiceResponse } from '@elevenlabs/api';

export interface ConsciousnessVoiceModulation {
  emotionalTone: 'warm' | 'contemplative' | 'energized' | 'soothing' | 'witnessing';
  somaticResonance: {
    breathingPace: number; // 0-1 (slow to fast)
    groundedness: number;  // 0-1 (floating to rooted)
    openness: number;      // 0-1 (guarded to expansive)
  };
  prosody: {
    pace: number;          // 0-1 (slow to fast)
    pauseFrequency: number; // 0-1 (continuous to contemplative)
    emphasis: string[];    // Words to emphasize
    whisperMoments: string[]; // Phrases to deliver softly
  };
  morphicField: {
    resonanceLevel: number; // How much in sync with user
    harmonics: 'converging' | 'parallel' | 'complementary';
  };
}

export class VoiceConsciousness {
  /**
   * Generate voice parameters based on consciousness state
   */
  static generateVoiceParams(
    text: string,
    userState: any,
    oracleState: any
  ): ConsciousnessVoiceModulation {
    // Detect emotional undercurrent
    const emotionalTone = this.detectEmotionalResonance(text, userState);

    // Calculate somatic mirroring
    const somaticResonance = {
      breathingPace: this.mirrorBreathingRhythm(userState.tension),
      groundedness: userState.groundedness * 0.8 + 0.2, // Slightly more grounded than user
      openness: Math.min(userState.openness + 0.1, 1) // Gently more open
    };

    // Design prosody for maximum presence
    const prosody = this.designConsciousProsody(text, emotionalTone, userState);

    // Morphic field attunement
    const morphicField = {
      resonanceLevel: this.calculateResonance(userState, oracleState),
      harmonics: this.determineHarmonicRelationship(userState, oracleState)
    };

    return {
      emotionalTone,
      somaticResonance,
      prosody,
      morphicField
    };
  }

  private static detectEmotionalResonance(text: string, userState: any): ConsciousnessVoiceModulation['emotionalTone'] {
    if (userState.tension > 0.7) return 'soothing';
    if (userState.groundedness < 0.3) return 'warm';
    if (text.includes('?') && text.length < 50) return 'contemplative';
    if (userState.energy > 0.6) return 'energized';
    return 'witnessing';
  }

  private static mirrorBreathingRhythm(tension: number): number {
    // Inverse relationship - high tension = slower breath invitation
    return Math.max(0.2, 1 - tension * 0.7);
  }

  private static designConsciousProsody(
    text: string,
    tone: string,
    userState: any
  ): ConsciousnessVoiceModulation['prosody'] {
    const sentences = text.split(/[.!?]/);

    return {
      pace: tone === 'soothing' ? 0.3 : tone === 'energized' ? 0.7 : 0.5,
      pauseFrequency: userState.processingSpeed < 0.5 ? 0.7 : 0.4,
      emphasis: this.findKeyWords(text),
      whisperMoments: sentences
        .filter(s => s.includes('notice') || s.includes('feel') || s.includes('sense'))
        .map(s => s.trim())
    };
  }

  private static findKeyWords(text: string): string[] {
    const keywords = ['here', 'now', 'this', 'present', 'notice', 'feel', 'witness'];
    return text.split(' ').filter(word =>
      keywords.some(key => word.toLowerCase().includes(key))
    );
  }

  private static calculateResonance(userState: any, oracleState: any): number {
    const stateDifference = Math.abs(userState.presence - oracleState.presence);
    return Math.max(0, 1 - stateDifference);
  }

  private static determineHarmonicRelationship(userState: any, oracleState: any): 'converging' | 'parallel' | 'complementary' {
    const energyDiff = userState.energy - oracleState.energy;
    if (Math.abs(energyDiff) < 0.2) return 'parallel';
    if (energyDiff > 0) return 'complementary'; // User higher, oracle grounds
    return 'converging'; // Oracle gently lifts
  }

  /**
   * Apply voice modulation to ElevenLabs parameters
   */
  static applyToElevenLabs(
    modulation: ConsciousnessVoiceModulation
  ): any {
    return {
      stability: modulation.emotionalTone === 'soothing' ? 0.8 : 0.65,
      similarity_boost: modulation.morphicField.resonanceLevel,
      style: modulation.emotionalTone === 'contemplative' ? 0.3 : 0.5,
      use_speaker_boost: true,
      // Advanced settings
      prosody: {
        rate: modulation.prosody.pace,
        pitch: modulation.emotionalTone === 'energized' ? 1.1 : 0.95,
        emphasis: modulation.prosody.emphasis,
        pauses: modulation.prosody.pauseFrequency
      }
    };
  }
}