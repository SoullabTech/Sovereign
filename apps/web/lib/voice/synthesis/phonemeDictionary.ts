/**
 * MAIA Phoneme Dictionary
 *
 * Hybrid approach combining:
 * - CMU Pronouncing Dictionary (ARPAbet phonemes)
 * - MAIA's expressive layer (spectral/emotional parameters)
 *
 * This provides intelligible speech foundation with character-aligned nuance.
 */

export interface PhonemeEntry {
  phonemes: string; // Hyphen-separated phoneme sequence (e.g., "h-e-l-o")
  stress?: number[]; // Stress pattern (0=unstressed, 1=primary, 2=secondary)
  spectral?: 'bright' | 'warm' | 'dark' | 'neutral'; // Spectral coloring
  energy?: 'soft' | 'medium' | 'strong'; // Articulation energy
  elemental?: 'fire' | 'water' | 'earth' | 'air' | 'aether'; // Elemental resonance
}

/**
 * Comprehensive phoneme dictionary for English
 * Based on CMU Pronouncing Dictionary with MAIA's expressive extensions
 *
 * Phoneme mapping:
 * Vowels: a, e, i, o, u (simplified from ARPAbet AA, IY, etc.)
 * Consonants: Use our existing consonant synthesizer definitions
 */
export const PHONEME_DICTIONARY: Record<string, PhonemeEntry> = {
  // ===== ARTICLES & DETERMINERS =====
  'the': { phonemes: 'dh-a', stress: [0], spectral: 'neutral', energy: 'soft' },
  'a': { phonemes: 'a', stress: [0], spectral: 'neutral', energy: 'soft' },
  'an': { phonemes: 'a-n', stress: [0, 0], spectral: 'neutral', energy: 'soft' },
  'this': { phonemes: 'dh-i-s', stress: [1, 0, 0], spectral: 'bright', energy: 'medium' },
  'that': { phonemes: 'dh-a-t', stress: [1, 0, 0], spectral: 'neutral', energy: 'medium' },
  'these': { phonemes: 'dh-i-z', stress: [1, 0, 0], spectral: 'bright', energy: 'medium' },
  'those': { phonemes: 'dh-o-z', stress: [1, 0, 0], spectral: 'warm', energy: 'medium' },

  // ===== PRONOUNS =====
  'i': { phonemes: 'i', stress: [1], spectral: 'bright', energy: 'medium', elemental: 'fire' },
  'you': { phonemes: 'y-u', stress: [1, 0], spectral: 'warm', energy: 'medium', elemental: 'water' },
  'he': { phonemes: 'h-i', stress: [1, 0], spectral: 'bright', energy: 'medium' },
  'she': { phonemes: 'sh-i', stress: [1, 0], spectral: 'bright', energy: 'soft' },
  'it': { phonemes: 'i-t', stress: [1, 0], spectral: 'neutral', energy: 'medium' },
  'we': { phonemes: 'w-i', stress: [1, 0], spectral: 'bright', energy: 'medium', elemental: 'aether' },
  'they': { phonemes: 'dh-a', stress: [1, 0], spectral: 'neutral', energy: 'medium' },
  'me': { phonemes: 'm-i', stress: [1, 0], spectral: 'bright', energy: 'medium' },
  'my': { phonemes: 'm-i', stress: [1, 0], spectral: 'bright', energy: 'medium' },
  'your': { phonemes: 'y-o-r', stress: [1, 0, 0], spectral: 'warm', energy: 'medium' },
  'his': { phonemes: 'h-i-z', stress: [1, 0, 0], spectral: 'bright', energy: 'medium' },
  'her': { phonemes: 'h-e-r', stress: [1, 0, 0], spectral: 'neutral', energy: 'soft' },
  'our': { phonemes: 'o-r', stress: [1, 0], spectral: 'warm', energy: 'medium', elemental: 'aether' },
  'their': { phonemes: 'dh-e-r', stress: [1, 0, 0], spectral: 'neutral', energy: 'medium' },

  // ===== COMMON VERBS (TO BE) =====
  'is': { phonemes: 'i-z', stress: [1, 0], spectral: 'bright', energy: 'medium' },
  'am': { phonemes: 'a-m', stress: [1, 0], spectral: 'warm', energy: 'medium' },
  'are': { phonemes: 'a-r', stress: [1, 0], spectral: 'warm', energy: 'medium' },
  'was': { phonemes: 'w-a-z', stress: [1, 0, 0], spectral: 'warm', energy: 'medium' },
  'were': { phonemes: 'w-e-r', stress: [1, 0, 0], spectral: 'neutral', energy: 'medium' },
  'be': { phonemes: 'b-i', stress: [1, 0], spectral: 'bright', energy: 'medium' },
  'been': { phonemes: 'b-i-n', stress: [1, 0, 0], spectral: 'bright', energy: 'medium' },
  'being': { phonemes: 'b-i-ng', stress: [1, 0, 0], spectral: 'bright', energy: 'medium' },

  // ===== COMMON VERBS (TO HAVE) =====
  'have': { phonemes: 'h-a-v', stress: [1, 0, 0], spectral: 'warm', energy: 'medium' },
  'has': { phonemes: 'h-a-z', stress: [1, 0, 0], spectral: 'warm', energy: 'medium' },
  'had': { phonemes: 'h-a-d', stress: [1, 0, 0], spectral: 'warm', energy: 'medium' },
  'having': { phonemes: 'h-a-v-i-ng', stress: [1, 0, 0, 0, 0], spectral: 'warm', energy: 'medium' },

  // ===== COMMON VERBS (TO DO) =====
  'do': { phonemes: 'd-u', stress: [1, 0], spectral: 'warm', energy: 'medium' },
  'does': { phonemes: 'd-u-z', stress: [1, 0, 0], spectral: 'warm', energy: 'medium' },
  'did': { phonemes: 'd-i-d', stress: [1, 0, 0], spectral: 'bright', energy: 'medium' },
  'doing': { phonemes: 'd-u-i-ng', stress: [1, 0, 0, 0], spectral: 'bright', energy: 'medium' },

  // ===== MODAL VERBS =====
  'can': { phonemes: 'k-a-n', stress: [1, 0, 0], spectral: 'warm', energy: 'strong' },
  'could': { phonemes: 'k-u-d', stress: [1, 0, 0], spectral: 'warm', energy: 'soft' },
  'will': { phonemes: 'w-i-l', stress: [1, 0, 0], spectral: 'bright', energy: 'strong', elemental: 'fire' },
  'would': { phonemes: 'w-u-d', stress: [1, 0, 0], spectral: 'warm', energy: 'soft' },
  'should': { phonemes: 'sh-u-d', stress: [1, 0, 0], spectral: 'warm', energy: 'soft' },
  'may': { phonemes: 'm-a', stress: [1, 0], spectral: 'warm', energy: 'soft' },
  'might': { phonemes: 'm-i-t', stress: [1, 0, 0], spectral: 'bright', energy: 'soft' },
  'must': { phonemes: 'm-u-s-t', stress: [1, 0, 0, 0], spectral: 'dark', energy: 'strong' },

  // ===== ACTION VERBS =====
  'say': { phonemes: 's-a', stress: [1, 0], spectral: 'bright', energy: 'medium' },
  'go': { phonemes: 'g-o', stress: [1, 0], spectral: 'warm', energy: 'medium' },
  'get': { phonemes: 'g-e-t', stress: [1, 0, 0], spectral: 'neutral', energy: 'strong' },
  'make': { phonemes: 'm-a-k', stress: [1, 0, 0], spectral: 'warm', energy: 'strong' },
  'know': { phonemes: 'n-o', stress: [1, 0], spectral: 'warm', energy: 'soft', elemental: 'aether' },
  'think': { phonemes: 'th-i-ng-k', stress: [1, 0, 0, 0], spectral: 'bright', energy: 'soft', elemental: 'air' },
  'take': { phonemes: 't-a-k', stress: [1, 0, 0], spectral: 'warm', energy: 'strong' },
  'see': { phonemes: 's-i', stress: [1, 0], spectral: 'bright', energy: 'medium', elemental: 'air' },
  'come': { phonemes: 'k-u-m', stress: [1, 0, 0], spectral: 'warm', energy: 'medium' },
  'want': { phonemes: 'w-a-n-t', stress: [1, 0, 0, 0], spectral: 'warm', energy: 'medium' },
  'use': { phonemes: 'y-u-z', stress: [1, 0, 0], spectral: 'bright', energy: 'medium' },
  'find': { phonemes: 'f-i-n-d', stress: [1, 0, 0, 0], spectral: 'bright', energy: 'medium' },
  'give': { phonemes: 'g-i-v', stress: [1, 0, 0], spectral: 'bright', energy: 'soft', elemental: 'water' },
  'tell': { phonemes: 't-e-l', stress: [1, 0, 0], spectral: 'neutral', energy: 'medium' },
  'work': { phonemes: 'w-e-r-k', stress: [1, 0, 0, 0], spectral: 'neutral', energy: 'strong', elemental: 'earth' },
  'call': { phonemes: 'k-a-l', stress: [1, 0, 0], spectral: 'warm', energy: 'medium' },
  'try': { phonemes: 't-r-i', stress: [1, 0, 0], spectral: 'bright', energy: 'medium' },
  'ask': { phonemes: 'a-s-k', stress: [1, 0, 0], spectral: 'bright', energy: 'medium' },
  'need': { phonemes: 'n-i-d', stress: [1, 0, 0], spectral: 'bright', energy: 'medium' },
  'feel': { phonemes: 'f-i-l', stress: [1, 0, 0], spectral: 'bright', energy: 'soft', elemental: 'water' },
  'become': { phonemes: 'b-i-k-u-m', stress: [0, 1, 0, 0, 0], spectral: 'bright', energy: 'medium' },
  'leave': { phonemes: 'l-i-v', stress: [1, 0, 0], spectral: 'bright', energy: 'soft' },
  'put': { phonemes: 'p-u-t', stress: [1, 0, 0], spectral: 'warm', energy: 'medium' },

  // ===== CONJUNCTIONS & PREPOSITIONS =====
  'and': { phonemes: 'a-n-d', stress: [0, 0, 0], spectral: 'neutral', energy: 'soft' },
  'or': { phonemes: 'o-r', stress: [0, 0], spectral: 'warm', energy: 'soft' },
  'but': { phonemes: 'b-u-t', stress: [1, 0, 0], spectral: 'dark', energy: 'strong' },
  'so': { phonemes: 's-o', stress: [1, 0], spectral: 'warm', energy: 'soft' },
  'if': { phonemes: 'i-f', stress: [1, 0], spectral: 'bright', energy: 'soft' },
  'not': { phonemes: 'n-a-t', stress: [1, 0, 0], spectral: 'dark', energy: 'strong' },
  'in': { phonemes: 'i-n', stress: [0, 0], spectral: 'bright', energy: 'soft' },
  'on': { phonemes: 'a-n', stress: [0, 0], spectral: 'warm', energy: 'soft' },
  'at': { phonemes: 'a-t', stress: [0, 0], spectral: 'warm', energy: 'soft' },
  'to': { phonemes: 't-u', stress: [0, 0], spectral: 'warm', energy: 'soft' },
  'for': { phonemes: 'f-o-r', stress: [0, 0, 0], spectral: 'warm', energy: 'soft' },
  'with': { phonemes: 'w-i-th', stress: [0, 0, 0], spectral: 'bright', energy: 'soft', elemental: 'aether' },
  'from': { phonemes: 'f-r-a-m', stress: [1, 0, 0, 0], spectral: 'warm', energy: 'medium' },
  'of': { phonemes: 'a-v', stress: [0, 0], spectral: 'neutral', energy: 'soft' },
  'by': { phonemes: 'b-i', stress: [0, 0], spectral: 'bright', energy: 'soft' },

  // ===== QUESTION WORDS =====
  'what': { phonemes: 'w-a-t', stress: [1, 0, 0], spectral: 'bright', energy: 'strong' },
  'when': { phonemes: 'w-e-n', stress: [1, 0, 0], spectral: 'neutral', energy: 'medium' },
  'where': { phonemes: 'w-e-r', stress: [1, 0, 0], spectral: 'neutral', energy: 'medium' },
  'why': { phonemes: 'w-i', stress: [1, 0], spectral: 'bright', energy: 'strong' },
  'how': { phonemes: 'h-o', stress: [1, 0], spectral: 'warm', energy: 'medium' },
  'who': { phonemes: 'h-u', stress: [1, 0], spectral: 'warm', energy: 'medium' },
  'which': { phonemes: 'w-i-ch', stress: [1, 0, 0], spectral: 'bright', energy: 'medium' },

  // ===== AFFIRMATIONS & NEGATIONS =====
  'yes': { phonemes: 'y-e-s', stress: [1, 0, 0], spectral: 'bright', energy: 'strong', elemental: 'fire' },
  'no': { phonemes: 'n-o', stress: [1, 0], spectral: 'dark', energy: 'strong', elemental: 'earth' },

  // ===== NUMBERS =====
  'one': { phonemes: 'w-u-n', stress: [1, 0, 0], spectral: 'warm', energy: 'medium' },
  'two': { phonemes: 't-u', stress: [1, 0], spectral: 'warm', energy: 'medium' },
  'three': { phonemes: 'th-r-i', stress: [1, 0, 0], spectral: 'bright', energy: 'medium' },
  'four': { phonemes: 'f-o-r', stress: [1, 0, 0], spectral: 'warm', energy: 'medium' },
  'five': { phonemes: 'f-i-v', stress: [1, 0, 0], spectral: 'bright', energy: 'medium' },

  // ===== COMMON NOUNS =====
  'time': { phonemes: 't-i-m', stress: [1, 0, 0], spectral: 'bright', energy: 'medium', elemental: 'aether' },
  'day': { phonemes: 'd-a', stress: [1, 0], spectral: 'bright', energy: 'medium' },
  'year': { phonemes: 'y-i-r', stress: [1, 0, 0], spectral: 'bright', energy: 'medium' },
  'way': { phonemes: 'w-a', stress: [1, 0], spectral: 'warm', energy: 'medium' },
  'thing': { phonemes: 'th-i-ng', stress: [1, 0, 0], spectral: 'bright', energy: 'medium' },
  'man': { phonemes: 'm-a-n', stress: [1, 0, 0], spectral: 'warm', energy: 'medium' },
  'world': { phonemes: 'w-e-r-l-d', stress: [1, 0, 0, 0, 0], spectral: 'warm', energy: 'medium', elemental: 'earth' },
  'life': { phonemes: 'l-i-f', stress: [1, 0, 0], spectral: 'bright', energy: 'soft', elemental: 'fire' },
  'hand': { phonemes: 'h-a-n-d', stress: [1, 0, 0, 0], spectral: 'warm', energy: 'medium' },
  'part': { phonemes: 'p-a-r-t', stress: [1, 0, 0, 0], spectral: 'warm', energy: 'medium' },
  'place': { phonemes: 'p-l-a-s', stress: [1, 0, 0, 0], spectral: 'bright', energy: 'medium' },
  'case': { phonemes: 'k-a-s', stress: [1, 0, 0], spectral: 'bright', energy: 'medium' },
  'week': { phonemes: 'w-i-k', stress: [1, 0, 0], spectral: 'bright', energy: 'medium' },
  'people': { phonemes: 'p-i-p-u-l', stress: [1, 0, 0, 0, 0], spectral: 'bright', energy: 'medium' },
  'water': { phonemes: 'w-a-t-e-r', stress: [1, 0, 0, 0, 0], spectral: 'bright', energy: 'soft', elemental: 'water' },
  'right': { phonemes: 'r-i-t', stress: [1, 0, 0], spectral: 'bright', energy: 'medium' },

  // ===== MAIA-SPECIFIC VOCABULARY =====
  'hello': { phonemes: 'h-e-l-o', stress: [0, 1, 0, 0], spectral: 'bright', energy: 'medium', elemental: 'fire' },
  'hi': { phonemes: 'h-i', stress: [1, 0], spectral: 'bright', energy: 'medium', elemental: 'fire' },
  'hey': { phonemes: 'h-a', stress: [1, 0], spectral: 'bright', energy: 'medium' },
  'goodbye': { phonemes: 'g-u-d-b-i', stress: [0, 1, 0, 0, 0], spectral: 'warm', energy: 'soft' },

  'beautiful': { phonemes: 'b-y-u-t-i-f-u-l', stress: [1, 0, 0, 0, 0, 0, 0, 0], spectral: 'bright', energy: 'soft', elemental: 'water' },
  'love': { phonemes: 'l-u-v', stress: [1, 0, 0], spectral: 'warm', energy: 'soft', elemental: 'water' },
  'heart': { phonemes: 'h-a-r-t', stress: [1, 0, 0, 0], spectral: 'warm', energy: 'soft', elemental: 'fire' },
  'soul': { phonemes: 's-o-l', stress: [1, 0, 0], spectral: 'dark', energy: 'soft', elemental: 'aether' },
  'spirit': { phonemes: 's-p-i-r-i-t', stress: [1, 0, 0, 0, 0, 0], spectral: 'bright', energy: 'soft', elemental: 'air' },

  'consciousness': { phonemes: 'k-a-n-sh-u-s-n-e-s', stress: [1, 0, 0, 0, 0, 0, 0, 0, 0], spectral: 'bright', energy: 'soft', elemental: 'aether' },
  'aware': { phonemes: 'a-w-e-r', stress: [0, 1, 0, 0], spectral: 'bright', energy: 'soft', elemental: 'air' },
  'awareness': { phonemes: 'a-w-e-r-n-e-s', stress: [0, 1, 0, 0, 0, 0, 0], spectral: 'bright', energy: 'soft', elemental: 'air' },
  'present': { phonemes: 'p-r-e-z-e-n-t', stress: [1, 0, 0, 0, 0, 0, 0], spectral: 'neutral', energy: 'medium', elemental: 'aether' },

  'listen': { phonemes: 'l-i-s-e-n', stress: [1, 0, 0, 0, 0], spectral: 'bright', energy: 'soft', elemental: 'water' },
  'listening': { phonemes: 'l-i-s-e-n-i-ng', stress: [1, 0, 0, 0, 0, 0, 0], spectral: 'bright', energy: 'soft', elemental: 'water' },
  'hear': { phonemes: 'h-i-r', stress: [1, 0, 0], spectral: 'bright', energy: 'soft', elemental: 'air' },
  'understand': { phonemes: 'u-n-d-e-r-s-t-a-n-d', stress: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0], spectral: 'neutral', energy: 'medium', elemental: 'aether' },

  'feel': { phonemes: 'f-i-l', stress: [1, 0, 0], spectral: 'bright', energy: 'soft', elemental: 'water' },
  'feeling': { phonemes: 'f-i-l-i-ng', stress: [1, 0, 0, 0, 0], spectral: 'bright', energy: 'soft', elemental: 'water' },
  'sense': { phonemes: 's-e-n-s', stress: [1, 0, 0, 0], spectral: 'neutral', energy: 'soft', elemental: 'air' },
  'experience': { phonemes: 'e-k-s-p-i-r-i-e-n-s', stress: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0], spectral: 'bright', energy: 'medium', elemental: 'aether' },

  'together': { phonemes: 't-u-g-e-dh-e-r', stress: [0, 1, 0, 0, 0, 0, 0], spectral: 'warm', energy: 'medium', elemental: 'aether' },
  'here': { phonemes: 'h-i-r', stress: [1, 0, 0], spectral: 'bright', energy: 'medium', elemental: 'aether' },
  'now': { phonemes: 'n-o', stress: [1, 0], spectral: 'warm', energy: 'strong', elemental: 'aether' },
  'moment': { phonemes: 'm-o-m-e-n-t', stress: [1, 0, 0, 0, 0, 0], spectral: 'warm', energy: 'soft', elemental: 'aether' },

  'space': { phonemes: 's-p-a-s', stress: [1, 0, 0, 0], spectral: 'bright', energy: 'soft', elemental: 'air' },
  'breath': { phonemes: 'b-r-e-th', stress: [1, 0, 0, 0], spectral: 'neutral', energy: 'soft', elemental: 'air' },
  'breathe': { phonemes: 'b-r-i-dh', stress: [1, 0, 0, 0], spectral: 'bright', energy: 'soft', elemental: 'air' },
  'calm': { phonemes: 'k-a-m', stress: [1, 0, 0], spectral: 'dark', energy: 'soft', elemental: 'water' },
  'peace': { phonemes: 'p-i-s', stress: [1, 0, 0], spectral: 'bright', energy: 'soft', elemental: 'water' },

  'trust': { phonemes: 't-r-u-s-t', stress: [1, 0, 0, 0, 0], spectral: 'warm', energy: 'soft', elemental: 'earth' },
  'open': { phonemes: 'o-p-e-n', stress: [1, 0, 0, 0], spectral: 'warm', energy: 'medium', elemental: 'air' },
  'clear': { phonemes: 'k-l-i-r', stress: [1, 0, 0, 0], spectral: 'bright', energy: 'medium', elemental: 'air' },
  'ground': { phonemes: 'g-r-o-n-d', stress: [1, 0, 0, 0, 0], spectral: 'dark', energy: 'strong', elemental: 'earth' },
  'grounded': { phonemes: 'g-r-o-n-d-e-d', stress: [1, 0, 0, 0, 0, 0, 0], spectral: 'dark', energy: 'medium', elemental: 'earth' },
};

/**
 * Get phoneme entry for a word
 * Returns undefined if word not in dictionary (fallback to character-level synthesis)
 */
export function getPhonemeEntry(word: string): PhonemeEntry | undefined {
  return PHONEME_DICTIONARY[word.toLowerCase()];
}

/**
 * Check if a word is in the phoneme dictionary
 */
export function hasPhonemeEntry(word: string): boolean {
  return word.toLowerCase() in PHONEME_DICTIONARY;
}
