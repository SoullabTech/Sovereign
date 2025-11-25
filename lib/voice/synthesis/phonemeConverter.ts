/**
 * Phoneme Converter
 *
 * Converts text to phoneme sequences.
 * This is a simplified version for the initial implementation.
 *
 * Future enhancements:
 * - Full IPA phoneme support
 * - Dictionary lookup for irregular words
 * - Stress marking
 * - Syllable boundaries
 */

export interface Phoneme {
  type: 'vowel' | 'consonant' | 'pause';
  symbol: string;          // IPA or simplified symbol
  duration: number;        // ms
  pitch?: number;          // Hz (for prosody)
  stress?: number;         // 0-1 (emphasis level)
}

/**
 * Simple text-to-phoneme conversion
 * For now, just extracts vowels and marks pauses
 *
 * This is intentionally basic - just enough to get the voice engine working.
 * Full implementation would use:
 * - CMU Pronouncing Dictionary
 * - IPA phoneme set
 * - Grapheme-to-phoneme rules
 * - ML-based pronunciation prediction
 */
export class PhonemeConverter {
  /**
   * Convert text to simple phoneme sequence
   * @param text Input text
   * @param basePitch Base pitch for the phrase (Hz)
   * @param pacingMultiplier Speed multiplier (from voice profile)
   * @returns Array of phonemes
   */
  convert(
    text: string,
    basePitch = 220,
    pacingMultiplier = 1.0
  ): Phoneme[] {
    const phonemes: Phoneme[] = [];
    const words = text.toLowerCase().split(/\s+/);

    const baseDuration = 150 * pacingMultiplier; // Base phoneme duration in ms

    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
      const word = words[wordIndex];

      // Skip empty words
      if (!word) continue;

      // Process each character
      for (let charIndex = 0; charIndex < word.length; charIndex++) {
        const char = word[charIndex];

        // Check if vowel
        if ('aeiou'.includes(char)) {
          phonemes.push({
            type: 'vowel',
            symbol: char,
            duration: baseDuration,
            pitch: basePitch,
            stress: charIndex === 0 ? 0.8 : 0.5, // First vowel slightly stressed
          });
        }
        // For consonants, we'll add a very short duration placeholder
        // Real implementation would synthesize actual consonant sounds
        else if (char.match(/[a-z]/)) {
          phonemes.push({
            type: 'consonant',
            symbol: char,
            duration: baseDuration * 0.5, // Consonants typically shorter
            stress: 0.3,
          });
        }
      }

      // Add pause between words
      if (wordIndex < words.length - 1) {
        phonemes.push({
          type: 'pause',
          symbol: '_',
          duration: baseDuration * 0.6, // Short inter-word pause
        });
      }
    }

    // Add final pause
    phonemes.push({
      type: 'pause',
      symbol: '_',
      duration: baseDuration * 1.5, // Longer final pause
    });

    return phonemes;
  }

  /**
   * Calculate total duration of phoneme sequence
   */
  getTotalDuration(phonemes: Phoneme[]): number {
    return phonemes.reduce((sum, p) => sum + p.duration, 0);
  }

  /**
   * Apply prosody (intonation) to phoneme sequence
   * @param phonemes Base phoneme sequence
   * @param pattern Prosody pattern ('statement', 'question', 'exclamation')
   * @returns Modified phoneme sequence with pitch contours
   */
  applyProsody(
    phonemes: Phoneme[],
    pattern: 'statement' | 'question' | 'exclamation' = 'statement'
  ): Phoneme[] {
    const modified = [...phonemes];

    // Apply pitch contours based on pattern
    for (let i = 0; i < modified.length; i++) {
      const phoneme = modified[i];

      if (phoneme.type !== 'vowel' || !phoneme.pitch) continue;

      const progress = i / modified.length; // 0 to 1 through the phrase

      switch (pattern) {
        case 'statement':
          // Slight fall at end
          phoneme.pitch *= 1.0 - progress * 0.15;
          break;

        case 'question':
          // Rise at end
          phoneme.pitch *= 1.0 + progress * 0.3;
          break;

        case 'exclamation':
          // Higher overall with fall
          phoneme.pitch *= 1.2 - progress * 0.2;
          break;
      }
    }

    return modified;
  }
}

/**
 * Detect sentence ending type from text
 */
export function detectSentencePattern(text: string): 'statement' | 'question' | 'exclamation' {
  const trimmed = text.trim();

  if (trimmed.endsWith('?')) return 'question';
  if (trimmed.endsWith('!')) return 'exclamation';
  return 'statement';
}
