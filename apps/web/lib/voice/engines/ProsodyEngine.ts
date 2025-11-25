/**
 * Prosody Engine
 *
 * Consolidates voice quality, pacing, and emotional modulation.
 * Merges: ProsodyCurves.ts, PacingModulation.ts, EmotionalVoiceModulation.ts
 *
 * Prosody = The patterns of stress and intonation in speech.
 * Makes MAIA sound natural, not robotic.
 *
 * Key aspects:
 * - Pauses (timing, rhythm)
 * - Emphasis (stress on certain words)
 * - Pacing (speed based on element/emotion)
 * - Emotional tone (warmth, energy, softness)
 */

import { Element } from './ElementalEngine';

export type Emotion = 'joy' | 'sadness' | 'anger' | 'fear' | 'neutral';

export class ProsodyEngine {
  /**
   * Add prosodic markers to text for natural speech
   *
   * @param text - Raw text response
   * @param element - Current elemental tone
   * @param emotion - Detected emotion
   * @returns Text with prosodic markers (pauses, emphasis)
   */
  modulate(text: string, element: Element, emotion: Emotion = 'neutral'): string {
    let processed = text;

    // Step 1: Add pauses for rhythm
    processed = this.addPauses(processed, element);

    // Step 2: Adjust pacing based on element
    processed = this.adjustPacing(processed, element);

    // Step 3: Add emotional markers
    processed = this.addEmotionalMarkers(processed, emotion);

    // Step 4: Add emphasis to key words
    processed = this.addEmphasis(processed, element);

    return processed;
  }

  /**
   * Add pauses after punctuation for natural rhythm
   *
   * Pause lengths:
   * - Period: Long pause (... = ~500ms)
   * - Comma: Medium pause (.. = ~300ms)
   * - Question/Exclamation: Long pause + emphasis
   */
  private addPauses(text: string, element: Element): string {
    // Element affects pause length
    const pauseMultiplier: Record<Element, number> = {
      fire: 0.7, // Shorter pauses (faster)
      water: 1.2, // Longer pauses (flowing)
      earth: 1.0, // Normal pauses (steady)
      air: 1.0, // Normal pauses (clear)
      aether: 1.5 // Longest pauses (spacious)
    };

    const multiplier = pauseMultiplier[element];

    // Add pauses (more dots = longer pause)
    let processed = text;

    // Long pause after sentences
    const longPause = '.'.repeat(Math.round(3 * multiplier));
    processed = processed.replace(/\. /g, `. ${longPause} `);

    // Medium pause after commas
    const mediumPause = '.'.repeat(Math.round(2 * multiplier));
    processed = processed.replace(/\, /g, `, ${mediumPause} `);

    // Long pause after questions (with slight pitch rise implied)
    processed = processed.replace(/\? /g, `? ${longPause} `);

    // Long pause after exclamations (with emphasis)
    processed = processed.replace(/\! /g, `! ${longPause} `);

    return processed;
  }

  /**
   * Adjust pacing based on elemental tone
   * (Conceptual - for future TTS integration)
   *
   * @param text - Text with pauses
   * @param element - Current element
   * @returns Text with pacing hints
   */
  private adjustPacing(text: string, element: Element): string {
    // Future: integrate with TTS provider that supports rate control
    // For now, return text as-is (pauses handle some pacing)

    // Element-specific pacing:
    // Fire: Fast, urgent (rate: 1.1x)
    // Water: Slow, flowing (rate: 0.9x)
    // Earth: Steady (rate: 1.0x)
    // Air: Normal (rate: 1.0x)
    // Aether: Slow, spacious (rate: 0.85x)

    return text;
  }

  /**
   * Add emotional markers to text
   * (Conceptual - for future emotional TTS)
   *
   * @param text - Text with pauses/pacing
   * @param emotion - Detected emotion
   * @returns Text with emotional context
   */
  private addEmotionalMarkers(text: string, emotion: Emotion): string {
    // Future: integrate with emotional TTS
    // For now, subtle textual cues can hint at emotion

    const emotionalPrefix: Record<Emotion, string> = {
      joy: '', // Lighter, uplifted tone
      sadness: '', // Softer, gentler tone
      anger: '', // Firmer, more direct tone
      fear: '', // Calmer, reassuring tone
      neutral: '' // Balanced tone
    };

    return emotionalPrefix[emotion] + text;
  }

  /**
   * Add emphasis to key words
   * (Using capitalization or repetition as subtle hints)
   *
   * @param text - Text to emphasize
   * @param element - Current element
   * @returns Text with emphasis markers
   */
  private addEmphasis(text: string, element: Element): string {
    // Element-specific emphasis patterns
    const emphasisWords: Record<Element, string[]> = {
      fire: ['transform', 'power', 'breakthrough', 'ignite', 'now'],
      water: ['feel', 'flow', 'deep', 'embrace', 'gentle'],
      earth: ['ground', 'stable', 'real', 'present', 'body'],
      air: ['clear', 'understand', 'see', 'breathe', 'space'],
      aether: ['whole', 'infinite', 'sacred', 'witness', 'presence']
    };

    const wordsToEmphasize = emphasisWords[element];
    let processed = text;

    // Subtle emphasis: add slight pause before key words
    for (const word of wordsToEmphasize) {
      const regex = new RegExp(`\\b(${word})\\b`, 'gi');
      processed = processed.replace(regex, '. $1'); // Micro-pause before word
    }

    return processed;
  }

  /**
   * Detect affect (emotion) from user's text
   *
   * @param text - User's text
   * @returns Detected emotion
   */
  detectAffect(text: string): Emotion {
    const lower = text.toLowerCase();

    // Joy markers
    if (/\b(happy|joy|excited|great|love|wonderful|amazing|fantastic)\b/i.test(lower)) {
      return 'joy';
    }

    // Sadness markers
    if (/\b(sad|depressed|down|hurt|loss|grief|sorrow|cry|tears)\b/i.test(lower)) {
      return 'sadness';
    }

    // Anger markers
    if (/\b(angry|mad|furious|rage|hate|annoyed|frustrated|pissed)\b/i.test(lower)) {
      return 'anger';
    }

    // Fear markers
    if (/\b(afraid|scared|fear|anxious|worried|panic|terrified|nervous)\b/i.test(lower)) {
      return 'fear';
    }

    return 'neutral';
  }

  /**
   * Get prosodic characteristics for element + emotion combo
   * (For future advanced TTS integration)
   *
   * @param element - Current element
   * @param emotion - Current emotion
   * @returns Prosodic parameters
   */
  getProsodyParams(element: Element, emotion: Emotion): {
    rate: number;
    pitch: number;
    volume: number;
    emphasis: 'none' | 'moderate' | 'strong';
  } {
    // Base parameters from element
    const elementParams = {
      fire: { rate: 1.1, pitch: 1.05, volume: 1.0, emphasis: 'strong' as const },
      water: { rate: 0.9, pitch: 0.95, volume: 0.9, emphasis: 'moderate' as const },
      earth: { rate: 1.0, pitch: 0.9, volume: 1.0, emphasis: 'strong' as const },
      air: { rate: 1.0, pitch: 1.0, volume: 0.95, emphasis: 'moderate' as const },
      aether: { rate: 0.85, pitch: 1.0, volume: 0.9, emphasis: 'none' as const }
    };

    // Emotion modifiers
    const emotionModifiers = {
      joy: { rate: 1.05, pitch: 1.1, volume: 1.05 },
      sadness: { rate: 0.9, pitch: 0.95, volume: 0.85 },
      anger: { rate: 1.1, pitch: 1.0, volume: 1.1 },
      fear: { rate: 1.05, pitch: 1.05, volume: 0.9 },
      neutral: { rate: 1.0, pitch: 1.0, volume: 1.0 }
    };

    const base = elementParams[element];
    const modifier = emotionModifiers[emotion];

    return {
      rate: base.rate * modifier.rate,
      pitch: base.pitch * modifier.pitch,
      volume: base.volume * modifier.volume,
      emphasis: base.emphasis
    };
  }

  /**
   * Preprocess text before TTS
   * Remove artifacts, normalize spacing, clean up formatting
   *
   * @param text - Raw text
   * @returns Cleaned text ready for TTS
   */
  preprocessForTTS(text: string): string {
    let processed = text;

    // Remove markdown artifacts
    processed = processed.replace(/\*\*/g, ''); // Bold
    processed = processed.replace(/\*/g, ''); // Italic
    processed = processed.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // Links

    // Normalize spacing
    processed = processed.replace(/\s+/g, ' '); // Multiple spaces → single
    processed = processed.trim();

    // Fix common TTS pronunciation issues
    processed = processed.replace(/\be\.g\./gi, 'for example');
    processed = processed.replace(/\bi\.e\./gi, 'that is');
    processed = processed.replace(/\betc\./gi, 'etcetera');

    // Expand contractions for clearer speech
    processed = processed.replace(/\bcan't\b/gi, 'cannot');
    processed = processed.replace(/\bwon't\b/gi, 'will not');
    processed = processed.replace(/\bdon't\b/gi, 'do not');

    return processed;
  }
}

// Singleton instance
export const prosodyEngine = new ProsodyEngine();
