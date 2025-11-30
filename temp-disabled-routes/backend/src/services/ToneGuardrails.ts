/**
 * ToneGuardrails.ts
 * 
 * Prevents Maya's greetings from becoming overly saccharine or cringeworthy
 * while maintaining warmth and personality. Provides configurable tone control.
 */

import { logger } from '../utils/logger';

// Tone configuration
export type ToneStyle = 'grounded' | 'balanced' | 'poetic' | 'mythic';

export interface ToneConfig {
  style: ToneStyle;
  maxPoeticDensity: number; // 0-1 scale
  maxSacredTerms: number; // per greeting
  requireGrounding: boolean;
  allowImprovisation: boolean;
  personalPronounLimit: number;
}

// Default tone configurations
export const tonePresets: Record<ToneStyle, ToneConfig> = {
  grounded: {
    style: 'grounded',
    maxPoeticDensity: 0.2,
    maxSacredTerms: 1,
    requireGrounding: true,
    allowImprovisation: false,
    personalPronounLimit: 2
  },
  balanced: {
    style: 'balanced',
    maxPoeticDensity: 0.35,
    maxSacredTerms: 2,
    requireGrounding: true,
    allowImprovisation: true,
    personalPronounLimit: 3
  },
  poetic: {
    style: 'poetic',
    maxPoeticDensity: 0.5,
    maxSacredTerms: 3,
    requireGrounding: false,
    allowImprovisation: true,
    personalPronounLimit: 4
  },
  mythic: {
    style: 'mythic',
    maxPoeticDensity: 0.7,
    maxSacredTerms: 5,
    requireGrounding: false,
    allowImprovisation: true,
    personalPronounLimit: 5
  }
};

export class ToneGuardrails {
  // Terms that can become overused and saccharine
  private readonly sacredTerms = [
    'dear soul', 'beautiful one', 'radiant being', 'sacred traveler',
    'luminous vessel', 'beloved', 'precious one', 'divine spark',
    'cosmic child', 'blessed one', 'eternal flame', 'sacred mirror'
  ];

  // Grounded alternatives for sacred terms
  private readonly groundedAlternatives: Record<string, string[]> = {
    'dear soul': ['friend', 'traveler', '{name}'],
    'beautiful one': ['friend', '{name}', 'you'],
    'radiant being': ['friend', 'you'],
    'sacred traveler': ['traveler', 'explorer', '{name}'],
    'luminous vessel': ['you', '{name}'],
    'beloved': ['friend', '{name}'],
    'precious one': ['friend', '{name}'],
    'divine spark': ['inner light', 'essence'],
    'cosmic child': ['explorer', 'seeker'],
    'blessed one': ['friend', '{name}'],
    'eternal flame': ['inner fire', 'spark'],
    'sacred mirror': ['reflection', 'this space']
  };

  // Mythic/poetic indicators
  private readonly mythicWords = [
    'moon', 'stag', 'aether', 'spiral', 'cycles', 'cosmos', 'divine',
    'sacred', 'eternal', 'infinite', 'transcendent', 'mystical',
    'luminous', 'radiant', 'celestial', 'cosmic', 'archetypal'
  ];

  // Grounding words that tether to reality
  private readonly groundingWords = [
    'today', 'now', 'here', 'body', 'breath', 'moment', 'feeling',
    'rest', 'sleep', 'work', 'walk', 'eat', 'simple', 'real',
    'practical', 'specific', 'concrete', 'actual', 'present'
  ];

  // Adjective patterns (for density calculation)
  private readonly adjectivePatterns = [
    /ing$/, /ous$/, /ful$/, /ive$/, /ent$/, /ant$/, /al$/, /ic$/
  ];

  /**
   * Apply all tone guardrails to a greeting
   */
  applyGuardrails(
    greeting: string, 
    config: ToneConfig = tonePresets.balanced,
    userName?: string
  ): string {
    let processed = greeting;

    // Step 1: Vocabulary throttling
    processed = this.throttleSacredTerms(processed, config, userName);

    // Step 2: Limit poetic density
    processed = this.limitPoeticDensity(processed, config);

    // Step 3: Ensure grounding if required
    if (config.requireGrounding) {
      processed = this.ensureGrounding(processed);
    }

    // Step 4: Limit personal pronouns
    processed = this.limitPersonalPronouns(processed, config);

    // Step 5: Clean up redundancies
    processed = this.cleanupRedundancies(processed);

    // Log transformation for debugging
    if (greeting !== processed) {
      logger.debug('[TONE] Guardrails applied:', {
        original: greeting.slice(0, 100),
        processed: processed.slice(0, 100),
        style: config.style
      });
    }

    return processed;
  }

  /**
   * Throttle sacred/flowery terms
   */
  private throttleSacredTerms(
    text: string,
    config: ToneConfig,
    userName?: string
  ): string {
    let result = text;
    let sacredCount = 0;

    // Count and replace sacred terms
    this.sacredTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = (result.match(regex) || []).length;

      if (matches > 0) {
        result = result.replace(regex, (match, offset, string) => {
          sacredCount++;

          // Keep first N occurrences based on config
          if (sacredCount <= config.maxSacredTerms) {
            return match;
          }

          // Replace with grounded alternative
          const alternatives = this.groundedAlternatives[term.toLowerCase()] || ['friend'];
          let replacement = this.pickRandom(alternatives);

          // Replace {name} placeholder if username available
          if (userName && replacement === '{name}') {
            replacement = userName;
          } else if (replacement === '{name}') {
            replacement = 'friend';
          }

          return replacement;
        });
      }
    });

    return result;
  }

  /**
   * Limit poetic density (adjective/metaphor overload)
   */
  private limitPoeticDensity(text: string, config: ToneConfig): string {
    const sentences = text.split(/(?<=[.!?])\s+/);
    
    return sentences.map(sentence => {
      const words = sentence.split(/\s+/);
      
      // Count adjectives and mythic words
      const adjectiveCount = words.filter(word => 
        this.adjectivePatterns.some(pattern => pattern.test(word))
      ).length;
      
      const mythicCount = words.filter(word =>
        this.mythicWords.includes(word.toLowerCase())
      ).length;
      
      const poeticDensity = (adjectiveCount + mythicCount) / words.length;

      // If density exceeds limit, simplify
      if (poeticDensity > config.maxPoeticDensity && words.length > 5) {
        // Remove some adjectives
        const simplified = words.filter((word, index) => {
          // Keep structure words and important nouns/verbs
          if (index === 0 || index === words.length - 1) return true;
          
          // Randomly keep some adjectives based on allowed density
          if (this.adjectivePatterns.some(p => p.test(word))) {
            return Math.random() < config.maxPoeticDensity;
          }
          
          return true;
        });

        return simplified.join(' ');
      }

      return sentence;
    }).join(' ');
  }

  /**
   * Ensure grounding elements are present
   */
  private ensureGrounding(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Check for mythic content
    const hasMythic = this.mythicWords.some(word => 
      lowerText.includes(word)
    );
    
    // Check for grounding content
    const hasGrounding = this.groundingWords.some(word =>
      lowerText.includes(word)
    );

    // Add grounding if too mythic
    if (hasMythic && !hasGrounding) {
      const groundingPhrases = [
        "How are you feeling in your body today?",
        "What's present for you right now?",
        "What feels most real in this moment?",
        "How can I support you today?",
        "What do you need right now?",
        "Let's start with what's here.",
        "What's alive for you today?"
      ];

      // Add a grounding question
      text += ' ' + this.pickRandom(groundingPhrases);
    }

    return text;
  }

  /**
   * Limit excessive use of personal pronouns
   */
  private limitPersonalPronouns(text: string, config: ToneConfig): string {
    const pronouns = ['your', 'you', 'yourself'];
    let pronounCount = 0;

    return text.split(/\s+/).map(word => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
      
      if (pronouns.includes(cleanWord)) {
        pronounCount++;
        if (pronounCount > config.personalPronounLimit) {
          // Skip this pronoun or replace with "the"
          return pronounCount % 2 === 0 ? 'the' : '';
        }
      }
      
      return word;
    }).filter(Boolean).join(' ');
  }

  /**
   * Clean up redundancies and formatting issues
   */
  private cleanupRedundancies(text: string): string {
    return text
      // Remove double spaces
      .replace(/\s+/g, ' ')
      // Remove double punctuation
      .replace(/([.!?])\1+/g, '$1')
      // Fix space before punctuation
      .replace(/\s+([.!?,])/g, '$1')
      // Remove empty sentences
      .replace(/\.\s*\./g, '.')
      // Trim
      .trim();
  }

  /**
   * Adjust tone based on user preference
   */
  adjustToneForUser(
    greeting: string,
    userPreference: ToneStyle = 'balanced',
    userName?: string
  ): string {
    const config = tonePresets[userPreference];
    return this.applyGuardrails(greeting, config, userName);
  }

  /**
   * Create custom tone configuration
   */
  createCustomConfig(overrides: Partial<ToneConfig>): ToneConfig {
    return {
      ...tonePresets.balanced,
      ...overrides
    };
  }

  /**
   * Analyze greeting tone (for debugging/metrics)
   */
  analyzeTone(text: string): {
    poeticDensity: number;
    sacredTermCount: number;
    mythicWordCount: number;
    groundingWordCount: number;
    averageSentenceLength: number;
    toneClassification: ToneStyle;
  } {
    const words = text.split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(Boolean);

    // Count various indicators
    const sacredTermCount = this.sacredTerms.filter(term =>
      text.toLowerCase().includes(term)
    ).length;

    const mythicWordCount = words.filter(word =>
      this.mythicWords.includes(word.toLowerCase())
    ).length;

    const groundingWordCount = words.filter(word =>
      this.groundingWords.includes(word.toLowerCase())
    ).length;

    const adjectiveCount = words.filter(word =>
      this.adjectivePatterns.some(pattern => pattern.test(word))
    ).length;

    const poeticDensity = (adjectiveCount + mythicWordCount) / words.length;
    const averageSentenceLength = words.length / sentences.length;

    // Classify tone
    let toneClassification: ToneStyle = 'balanced';
    if (poeticDensity > 0.5) {
      toneClassification = 'mythic';
    } else if (poeticDensity > 0.35) {
      toneClassification = 'poetic';
    } else if (poeticDensity < 0.2) {
      toneClassification = 'grounded';
    }

    return {
      poeticDensity,
      sacredTermCount,
      mythicWordCount,
      groundingWordCount,
      averageSentenceLength,
      toneClassification
    };
  }

  /**
   * Pick random element from array
   */
  private pickRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Generate tone-appropriate variations
   */
  generateVariations(
    baseGreeting: string,
    styles: ToneStyle[] = ['grounded', 'balanced', 'poetic']
  ): Record<ToneStyle, string> {
    const variations: Partial<Record<ToneStyle, string>> = {};

    styles.forEach(style => {
      variations[style] = this.adjustToneForUser(baseGreeting, style);
    });

    return variations as Record<ToneStyle, string>;
  }
}

// Export singleton instance
export const toneGuardrails = new ToneGuardrails();