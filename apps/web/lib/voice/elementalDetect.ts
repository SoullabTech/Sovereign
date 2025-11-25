// lib/voice/elementalDetect.ts
// Elemental tone detection from text and voice patterns

import { Element } from './types';

interface ElementalSignature {
  element: Element;
  intensity: number;
  markers: string[];
}

export class ElementalDetector {
  // Elemental keyword mappings
  private elementalMarkers = {
    fire: {
      keywords: [
        'passion', 'anger', 'transform', 'burn', 'ignite', 'fierce', 'rage',
        'intensity', 'drive', 'force', 'power', 'breakthrough', 'destroy',
        'create', 'forge', 'spark', 'explosive', 'urgent', 'now', 'must'
      ],
      patterns: [
        /!+/, // Exclamation marks
        /\b(need|have to|must)\b/i,
        /\b(fight|battle|war|confront)\b/i,
        /\b(hot|heat|flame|blaze)\b/i
      ],
      emotionalTone: ['anger', 'excitement', 'passion', 'determination']
    },

    water: {
      keywords: [
        'flow', 'emotion', 'feel', 'tears', 'grief', 'sorrow', 'deep',
        'ocean', 'wave', 'current', 'intuition', 'dream', 'fluid', 'soft',
        'gentle', 'nurture', 'hold', 'embrace', 'receptive', 'sensitive'
      ],
      patterns: [
        /\b(cry|weep|tears)\b/i,
        /\b(feel|feeling|felt)\b/i,
        /\b(flow|flowing|stream)\b/i,
        /\b(deep|depth|profound)\b/i
      ],
      emotionalTone: ['sadness', 'compassion', 'intuition', 'empathy']
    },

    earth: {
      keywords: [
        'ground', 'stable', 'solid', 'practical', 'real', 'tangible',
        'body', 'physical', 'material', 'foundation', 'roots', 'anchor',
        'steady', 'patient', 'endure', 'persist', 'reliable', 'concrete'
      ],
      patterns: [
        /\b(ground|grounded|grounding)\b/i,
        /\b(practical|pragmatic|realistic)\b/i,
        /\b(solid|stable|steady)\b/i,
        /\b(plan|structure|organize)\b/i
      ],
      emotionalTone: ['stability', 'patience', 'persistence', 'security']
    },

    air: {
      keywords: [
        'think', 'thought', 'idea', 'mind', 'intellectual', 'analyze',
        'perspective', 'view', 'see', 'understand', 'clarity', 'vision',
        'communicate', 'speak', 'words', 'breath', 'space', 'freedom'
      ],
      patterns: [
        /\?+/, // Question marks
        /\b(think|thinking|thought)\b/i,
        /\b(understand|realize|recognize)\b/i,
        /\b(perspective|viewpoint|angle)\b/i
      ],
      emotionalTone: ['curiosity', 'clarity', 'detachment', 'wonder']
    },

    aether: {
      keywords: [
        'spirit', 'soul', 'divine', 'sacred', 'mystery', 'unknown',
        'transcend', 'unity', 'whole', 'integrate', 'synthesis', 'void',
        'silence', 'presence', 'witness', 'awareness', 'consciousness'
      ],
      patterns: [
        /\b(spirit|spiritual|soul)\b/i,
        /\b(sacred|divine|holy)\b/i,
        /\b(mystery|mysterious|unknown)\b/i,
        /\b(silence|stillness|void)\b/i
      ],
      emotionalTone: ['transcendence', 'unity', 'mystery', 'presence']
    }
  };

  /**
   * Detect elemental composition from text
   */
  async detect(text: string): Promise<Partial<Record<Element, number>>> {
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/);
    const elementScores: Partial<Record<Element, number>> = {};

    // Check each element
    for (const [element, markers] of Object.entries(this.elementalMarkers)) {
      let score = 0;
      let matches = 0;

      // Check keywords
      for (const keyword of markers.keywords) {
        if (lower.includes(keyword)) {
          score += 1;
          matches++;
        }
      }

      // Check patterns
      for (const pattern of markers.patterns) {
        if (pattern.test(lower)) {
          score += 0.5;
          matches++;
        }
      }

      // Normalize by text length and match density
      const normalizedScore = matches > 0
        ? Math.min(1, (score / words.length) * 10)
        : 0;

      if (normalizedScore > 0.1) {
        elementScores[element as Element] = normalizedScore;
      }
    }

    // Ensure at least one element is present
    if (Object.keys(elementScores).length === 0) {
      // Default to balanced aether if no clear element
      elementScores.aether = 0.3;
    }

    // Normalize so total doesn't exceed 1
    const total = Object.values(elementScores).reduce((sum, score) => sum + score, 0);
    if (total > 1) {
      for (const element in elementScores) {
        elementScores[element as Element] = elementScores[element as Element]! / total;
      }
    }

    return elementScores;
  }

  /**
   * Detect elemental signature with detailed analysis
   */
  async analyzeElementalSignature(text: string): Promise<ElementalSignature[]> {
    const signatures: ElementalSignature[] = [];
    const lower = text.toLowerCase();

    for (const [element, markers] of Object.entries(this.elementalMarkers)) {
      const foundMarkers: string[] = [];

      // Collect all matching markers
      for (const keyword of markers.keywords) {
        if (lower.includes(keyword)) {
          foundMarkers.push(keyword);
        }
      }

      if (foundMarkers.length > 0) {
        signatures.push({
          element: element as Element,
          intensity: Math.min(1, foundMarkers.length * 0.2),
          markers: foundMarkers
        });
      }
    }

    // Sort by intensity
    signatures.sort((a, b) => b.intensity - a.intensity);

    return signatures;
  }

  /**
   * Detect elemental transitions over time
   */
  detectElementalFlow(
    utterances: Array<{ text: string; timestamp: number }>
  ): Array<{ from: Element; to: Element; timestamp: number }> {
    const transitions: Array<{ from: Element; to: Element; timestamp: number }> = [];

    let lastDominant: Element | null = null;

    for (const utterance of utterances) {
      const elements = this.detect(utterance.text);
      const dominant = this.getDominantElement(elements);

      if (dominant && lastDominant && dominant !== lastDominant) {
        transitions.push({
          from: lastDominant,
          to: dominant,
          timestamp: utterance.timestamp
        });
      }

      lastDominant = dominant;
    }

    return transitions;
  }

  /**
   * Get dominant element from blend
   */
  private getDominantElement(
    blend: Partial<Record<Element, number>>
  ): Element | null {
    const entries = Object.entries(blend);
    if (entries.length === 0) return null;

    const [dominant] = entries.sort(([, a], [, b]) => b - a);
    return dominant[0] as Element;
  }

  /**
   * Detect emotional-elemental correspondence
   */
  detectEmotionalElement(emotionalContext: { valence: number; arousal: number }): Element {
    const { valence, arousal } = emotionalContext;

    // Map emotional quadrants to elements
    if (valence > 0.3 && arousal > 0.6) {
      return 'fire'; // High positive energy
    } else if (valence < -0.3 && arousal > 0.6) {
      return 'water'; // High negative energy (intense emotions)
    } else if (valence > 0.3 && arousal < 0.4) {
      return 'earth'; // Calm positive (grounded contentment)
    } else if (valence < -0.3 && arousal < 0.4) {
      return 'air'; // Calm negative (contemplative)
    } else {
      return 'aether'; // Neutral/balanced state
    }
  }

  /**
   * Combine text and voice features for richer detection
   */
  async detectWithVoiceFeatures(
    text: string,
    voiceFeatures?: {
      pitch?: number;      // 0-1 normalized
      energy?: number;     // 0-1 normalized
      speed?: number;      // Words per minute
      pauseRatio?: number; // Silence vs speech ratio
    }
  ): Promise<Partial<Record<Element, number>>> {
    // Start with text-based detection
    const textElements = await this.detect(text);

    if (!voiceFeatures) {
      return textElements;
    }

    // Adjust based on voice features
    const voiceAdjustments: Partial<Record<Element, number>> = {};

    // High energy + fast speed = more fire
    if (voiceFeatures.energy > 0.7 && voiceFeatures.speed > 150) {
      voiceAdjustments.fire = 0.2;
    }

    // Low energy + high pause ratio = more water or earth
    if (voiceFeatures.energy < 0.3 && voiceFeatures.pauseRatio > 0.3) {
      voiceAdjustments.water = 0.15;
      voiceAdjustments.earth = 0.1;
    }

    // High pitch variance = more air
    if (voiceFeatures.pitch > 0.6) {
      voiceAdjustments.air = 0.15;
    }

    // Very low energy + very slow = aether
    if (voiceFeatures.energy < 0.2 && voiceFeatures.speed < 100) {
      voiceAdjustments.aether = 0.2;
    }

    // Combine text and voice signals
    const combined: Partial<Record<Element, number>> = {};

    for (const element of ['fire', 'water', 'earth', 'air', 'aether'] as Element[]) {
      const textScore = textElements[element] || 0;
      const voiceScore = voiceAdjustments[element] || 0;

      // Weighted combination (70% text, 30% voice)
      const combinedScore = textScore * 0.7 + voiceScore * 0.3;

      if (combinedScore > 0.1) {
        combined[element] = Math.min(1, combinedScore);
      }
    }

    return combined;
  }

  /**
   * Generate elemental description for user feedback
   */
  describeElementalState(blend: Partial<Record<Element, number>>): string {
    const entries = Object.entries(blend).sort(([, a], [, b]) => b - a);

    if (entries.length === 0) {
      return 'Your energy is subtle and undefined, like mist before dawn.';
    }

    const [primary, primaryIntensity] = entries[0];
    const [secondary, secondaryIntensity] = entries[1] || [null, 0];

    const descriptions = {
      fire: 'burning with transformative energy',
      water: 'flowing with deep emotional currents',
      earth: 'grounded in practical wisdom',
      air: 'dancing with ideas and perspectives',
      aether: 'touching the mystery beyond form'
    };

    let description = `You are ${descriptions[primary as Element]}`;

    if (secondary && secondaryIntensity > 0.3) {
      description += `, while also ${descriptions[secondary as Element]}`;
    }

    // Add intensity modifier
    if (primaryIntensity > 0.8) {
      description = 'Powerfully, ' + description.toLowerCase();
    } else if (primaryIntensity < 0.4) {
      description = 'Gently, ' + description.toLowerCase();
    }

    return description + '.';
  }
}

// Singleton instance
export const elementalDetector = new ElementalDetector();