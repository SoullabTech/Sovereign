// Elemental Resonance Tracker
// Maps user's first truth to elemental patterns and archetypal alignments

export type Element = 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';

export interface ElementalAnalysis {
  dominant: Element;
  distribution: Record<string, number>;
  archetypeAlignment: string;
}

export class ElementalResonanceTracker {
  private elementalKeywords = {
    Fire: [
      'passion', 'burn', 'ignite', 'energy', 'transform', 'anger', 'excited', 'fierce',
      'drive', 'power', 'action', 'creative', 'intense', 'desire', 'motivate', 'spark',
      'dynamic', 'explosive', 'heat', 'force', 'ambitious', 'courage', 'warrior'
    ],
    Water: [
      'flow', 'emotion', 'tears', 'deep', 'intuition', 'dream', 'fluid', 'feeling',
      'gentle', 'nurture', 'compassion', 'empathy', 'sensitive', 'receptive', 'moon',
      'ocean', 'wave', 'current', 'depths', 'reflection', 'mirror', 'cleanse', 'heal'
    ],
    Earth: [
      'grounded', 'stable', 'practical', 'foundation', 'body', 'material', 'solid', 'real',
      'nature', 'roots', 'steady', 'reliable', 'concrete', 'physical', 'tangible', 'secure',
      'structure', 'build', 'manifest', 'patient', 'endure', 'sustain', 'nourish'
    ],
    Air: [
      'thought', 'idea', 'breath', 'mind', 'clarity', 'perspective', 'freedom', 'light',
      'communication', 'intellect', 'logic', 'reason', 'analyze', 'understand', 'learn',
      'curiosity', 'question', 'explore', 'space', 'expand', 'liberate', 'inspire', 'vision'
    ],
    Aether: [
      'connection', 'unity', 'consciousness', 'cosmic', 'infinite', 'purpose', 'meaning', 'divine',
      'spirit', 'transcend', 'sacred', 'essence', 'eternal', 'whole', 'source', 'mystery',
      'synchronicity', 'destiny', 'awakening', 'enlightenment', 'universal', 'quantum', 'void'
    ]
  };

  private archetypes = {
    'Fire-dominant': 'The Catalyst - Transformative force of change',
    'Water-dominant': 'The Healer - Emotional depth and intuitive wisdom',
    'Earth-dominant': 'The Builder - Grounded manifestation and stability',
    'Air-dominant': 'The Sage - Mental clarity and visionary insight',
    'Aether-dominant': 'The Mystic - Spiritual connection and unity consciousness',
    'Fire-Water': 'The Alchemist - Passionate emotional transformation',
    'Fire-Earth': 'The Creator - Manifesting vision into reality',
    'Fire-Air': 'The Innovator - Inspired action and breakthrough thinking',
    'Water-Earth': 'The Nurturer - Compassionate grounding and healing',
    'Water-Air': 'The Poet - Emotional intelligence and creative expression',
    'Earth-Air': 'The Architect - Practical wisdom and structured thinking',
    'Balanced': 'The Oracle - Harmonious integration of all elements'
  };

  public analyzeElementalResonance(text: string): ElementalAnalysis {
    const elementScores: Record<Element, number> = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0,
      Aether: 0
    };

    // Score each element based on keyword presence
    const lowerText = text.toLowerCase();
    for (const [element, keywords] of Object.entries(this.elementalKeywords)) {
      keywords.forEach(keyword => {
        // Use regex to match whole words
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
          elementScores[element as Element] += matches.length;
        }
      });
    }

    // Calculate total and normalize
    const total = Object.values(elementScores).reduce((sum, score) => sum + score, 1); // Avoid divide by zero
    const distribution: Record<string, number> = {};
    for (const [element, score] of Object.entries(elementScores)) {
      distribution[element] = Math.round((score / total) * 100);
    }

    // Determine dominant element
    const dominant = Object.entries(elementScores)
      .sort(([, a], [, b]) => b - a)[0][0] as Element;

    // Determine archetype alignment
    const archetypeAlignment = this.determineArchetype(elementScores);

    return {
      dominant,
      distribution,
      archetypeAlignment
    };
  }

  private determineArchetype(scores: Record<Element, number>): string {
    const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
    const [first, second] = sorted;
    const total = Object.values(scores).reduce((sum, score) => sum + score, 1);

    // Check for balanced distribution (all elements within 20% of each other)
    const avg = total / 5;
    const isBalanced = Object.values(scores).every(score =>
      Math.abs(score - avg) / Math.max(avg, 1) < 0.2
    );

    if (isBalanced) {
      return this.archetypes['Balanced'];
    }

    // Check for dominant element (>40% of total)
    if (first[1] / total > 0.4) {
      return this.archetypes[`${first[0]}-dominant` as keyof typeof this.archetypes] || 'The Seeker';
    }

    // Check for dual element combination (top two > 60% of total)
    if ((first[1] + second[1]) / total > 0.6) {
      const combo = `${first[0]}-${second[0]}`;
      return this.archetypes[combo as keyof typeof this.archetypes] ||
             this.archetypes[`${second[0]}-${first[0]}` as keyof typeof this.archetypes] ||
             'The Seeker';
    }

    return 'The Seeker - Journey of discovery';
  }
}

export const elementalResonanceTracker = new ElementalResonanceTracker();