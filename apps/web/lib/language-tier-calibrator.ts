/**
 * 🌀 Language Tier Calibration System
 * 
 * Manages three tiers of language depth:
 * 1. Everyday - Plain, accessible language
 * 2. Metaphorical - Gentle introduction to elemental concepts
 * 3. Alchemical - Full technical/spiritual depth
 */

import type { ElementType } from './types/soullab-metadata';

export interface LanguageTier {
  level: 'everyday' | 'metaphorical' | 'alchemical';
  confidence: number; // 0-1 scale of user's readiness
}

export interface TieredTranslation {
  everyday: string;
  metaphorical: string;
  alchemical: string;
}

/**
 * Language patterns for each tier
 */
const TIER_PATTERNS = {
  everyday: {
    indicators: [
      'simple', 'clear', 'plain', 'basic', 'straightforward',
      'just tell me', 'in simple terms', 'what does that mean'
    ],
    vocabulary: {
      fire: ['energy', 'passion', 'drive', 'excitement', 'motivation'],
      water: ['emotions', 'feelings', 'flow', 'adaptability', 'intuition'],
      earth: ['stability', 'grounding', 'practical', 'resources', 'foundation'],
      air: ['thoughts', 'ideas', 'clarity', 'communication', 'perspective'],
      aether: ['connection', 'spirituality', 'meaning', 'purpose', 'unity']
    }
  },
  
  metaphorical: {
    indicators: [
      'deeper', 'symbolic', 'meaning', 'represents', 'metaphor',
      'like', 'as if', 'reminds me', 'pattern', 'energy'
    ],
    vocabulary: {
      fire: ['fire energy', 'spark', 'flame', 'burning', 'ignite'],
      water: ['water energy', 'flowing', 'fluid', 'waves', 'current'],
      earth: ['earth energy', 'rooted', 'grounded', 'solid', 'foundation'],
      air: ['air energy', 'breath', 'lightness', 'clarity', 'expansion'],
      aether: ['spirit', 'essence', 'unity', 'cosmic', 'divine']
    }
  },
  
  alchemical: {
    indicators: [
      'alchemical', 'elemental', 'archetypal', 'consciousness',
      'transformation', 'transmutation', 'sacred', 'initiation'
    ],
    vocabulary: {
      fire: ['Fire 2', 'solar principle', 'yang', 'sulphur', 'ignition phase'],
      water: ['Water 2', 'lunar principle', 'yin', 'mercury', 'dissolution'],
      earth: ['Earth 2', 'material plane', 'salt', 'coagulation', 'manifestation'],
      air: ['Air 2', 'mental plane', 'sublimation', 'pneuma', 'inspiration'],
      aether: ['Aether', 'quintessence', 'akasha', 'prima materia', 'unity consciousness']
    }
  }
};

/**
 * Language Tier Calibrator
 */
export class LanguageTierCalibrator {
  private userHistory: Map<string, LanguageTier[]> = new Map();
  
  /**
   * Detect appropriate language tier from user input
   */
  detectTier(userId: string, input: string): LanguageTier {
    const inputLower = input.toLowerCase();
    
    // Check for explicit tier indicators
    for (const [tier, patterns] of Object.entries(TIER_PATTERNS)) {
      const matches = patterns.indicators.filter(indicator => 
        inputLower.includes(indicator)
      ).length;
      
      if (matches > 0) {
        return {
          level: tier as LanguageTier['level'],
          confidence: Math.min(matches * 0.3, 1)
        };
      }
    }
    
    // Check user history for established preference
    const history = this.userHistory.get(userId) || [];
    if (history.length > 3) {
      const recentTiers = history.slice(-5);
      const tierCounts = this.countTiers(recentTiers);
      const dominantTier = this.getDominantTier(tierCounts);
      
      return {
        level: dominantTier,
        confidence: tierCounts[dominantTier] / recentTiers.length
      };
    }
    
    // Default to everyday for new users
    return {
      level: 'everyday',
      confidence: 0.8
    };
  }
  
  /**
   * Translate content to appropriate tier
   */
  translate(content: string, targetTier: LanguageTier['level']): string {
    if (targetTier === 'alchemical') {
      // Already at full depth
      return content;
    }
    
    let translated = content;
    
    // Replace alchemical terms with appropriate tier equivalents
    const replacements = this.getReplacementMap(targetTier);
    
    for (const [alchemical, replacement] of Object.entries(replacements)) {
      const regex = new RegExp(alchemical, 'gi');
      translated = translated.replace(regex, replacement);
    }
    
    return translated;
  }
  
  /**
   * Generate all three tiers for a response
   */
  generateTieredResponse(
    element: ElementType,
    archetype: string,
    coreMessage: string
  ): TieredTranslation {
    return {
      everyday: this.translateToEveryday(element, archetype, coreMessage),
      metaphorical: this.translateToMetaphorical(element, archetype, coreMessage),
      alchemical: this.translateToAlchemical(element, archetype, coreMessage)
    };
  }
  
  /**
   * Update user's tier preference based on interaction
   */
  updateUserPreference(userId: string, tier: LanguageTier) {
    const history = this.userHistory.get(userId) || [];
    history.push(tier);
    
    // Keep only recent history
    if (history.length > 10) {
      history.shift();
    }
    
    this.userHistory.set(userId, history);
  }
  
  /**
   * Check if user is ready for deeper tier
   */
  assessReadiness(userId: string): {
    currentTier: LanguageTier['level'];
    readyForNext: boolean;
    nextTier?: LanguageTier['level'];
  } {
    const history = this.userHistory.get(userId) || [];
    
    if (history.length < 5) {
      return {
        currentTier: 'everyday',
        readyForNext: false
      };
    }
    
    const recentTiers = history.slice(-5);
    const avgConfidence = recentTiers.reduce((sum, t) => sum + t.confidence, 0) / recentTiers.length;
    const currentTier = this.getDominantTier(this.countTiers(recentTiers));
    
    // Ready to advance if high confidence in current tier
    const readyForNext = avgConfidence > 0.7;
    
    const tierProgression: Record<string, LanguageTier['level']> = {
      'everyday': 'metaphorical',
      'metaphorical': 'alchemical'
    };
    
    return {
      currentTier,
      readyForNext,
      nextTier: readyForNext ? tierProgression[currentTier] : undefined
    };
  }
  
  /**
   * Generate invitation to deeper tier
   */
  generateTierInvitation(
    currentTier: LanguageTier['level'],
    element: ElementType
  ): string | null {
    if (currentTier === 'alchemical') return null;
    
    const invitations = {
      'everyday': {
        fire: "Some people describe this as 'fire energy' — would you like to explore that metaphor?",
        water: "There's a water-like quality to what you're describing — curious to hear more about that flow?",
        earth: "This has an earth-like grounding to it — would you like to explore that connection?",
        air: "There's something light and air-like here — shall we explore that quality?",
        aether: "This touches on something beyond the everyday — would you like to go deeper?"
      },
      'metaphorical': {
        fire: "In alchemical terms, this is Fire 2 — the performer, the creative spark. Shall we explore that framework?",
        water: "The alchemists called this Water 2 — the realm of deep feeling and flow. Interested in that lens?",
        earth: "This connects to Earth 2 in the alchemical map — manifestation and resources. Want to go deeper?",
        air: "This resonates with Air 2 — mental clarity and communication. Ready for the technical framework?",
        aether: "You're touching the realm of Aether — unity consciousness. Ready for the full depth?"
      }
    };
    
    return invitations[currentTier]?.[element] || null;
  }
  
  // === Private Helper Methods ===
  
  private countTiers(history: LanguageTier[]): Record<string, number> {
    const counts: Record<string, number> = {
      everyday: 0,
      metaphorical: 0,
      alchemical: 0
    };
    
    for (const tier of history) {
      counts[tier.level]++;
    }
    
    return counts;
  }
  
  private getDominantTier(counts: Record<string, number>): LanguageTier['level'] {
    let maxCount = 0;
    let dominantTier: LanguageTier['level'] = 'everyday';
    
    for (const [tier, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantTier = tier as LanguageTier['level'];
      }
    }
    
    return dominantTier;
  }
  
  private getReplacementMap(targetTier: LanguageTier['level']): Record<string, string> {
    if (targetTier === 'everyday') {
      return {
        'Fire 2': 'creative energy',
        'Water 2': 'emotional flow',
        'Earth 2': 'practical foundation',
        'Air 2': 'mental clarity',
        'Aether': 'spiritual connection',
        'elemental signature': 'energy pattern',
        'archetypal': 'symbolic',
        'transmutation': 'transformation',
        'alchemical': 'transformative',
        'consciousness field': 'awareness',
        'resonance': 'connection',
        'morphic field': 'collective pattern'
      };
    }
    
    if (targetTier === 'metaphorical') {
      return {
        'Fire 2': 'fire energy',
        'Water 2': 'water energy',
        'Earth 2': 'earth energy',
        'Air 2': 'air energy',
        'Aether': 'spirit',
        'transmutation': 'transformation',
        'consciousness field': 'field of awareness',
        'morphic field': 'collective field'
      };
    }
    
    return {};
  }
  
  private translateToEveryday(
    element: ElementType,
    archetype: string,
    message: string
  ): string {
    const vocab = TIER_PATTERNS.everyday.vocabulary[element];
    const elementWord = vocab[0]; // Use first everyday term
    
    return message
      .replace(new RegExp(element, 'gi'), elementWord)
      .replace(new RegExp(archetype, 'gi'), 'your pattern')
      .replace(/alchemical/gi, 'transformative')
      .replace(/transmutation/gi, 'change')
      .replace(/consciousness/gi, 'awareness');
  }
  
  private translateToMetaphorical(
    element: ElementType,
    archetype: string,
    message: string
  ): string {
    const vocab = TIER_PATTERNS.metaphorical.vocabulary[element];
    const elementPhrase = vocab[0]; // Use first metaphorical term
    
    return message
      .replace(new RegExp(`${element}\\s+2`, 'gi'), elementPhrase)
      .replace(new RegExp(element, 'gi'), elementPhrase)
      .replace(/alchemical/gi, 'symbolic')
      .replace(/transmutation/gi, 'transformation');
  }
  
  private translateToAlchemical(
    element: ElementType,
    archetype: string,
    message: string
  ): string {
    // Full depth - enhance if needed
    const vocab = TIER_PATTERNS.alchemical.vocabulary[element];
    
    // Ensure proper alchemical terminology
    if (!message.includes('2') && element !== 'aether') {
      message = message.replace(
        new RegExp(element, 'gi'),
        vocab[0] // Use formal alchemical term
      );
    }
    
    return message;
  }
}

// Export singleton instance with lazy loading
let _languageTierCalibrator: LanguageTierCalibrator | null = null;
export const getLanguageTierCalibrator = (): LanguageTierCalibrator => {
  if (!_languageTierCalibrator) {
    _languageTierCalibrator = new LanguageTierCalibrator();
  }
  return _languageTierCalibrator;
};