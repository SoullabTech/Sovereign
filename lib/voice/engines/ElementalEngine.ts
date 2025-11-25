/**
 * Elemental Engine
 *
 * Consolidates elemental personality system into one clean engine.
 * Merges: ElementalVoiceOrchestrator.ts, elementalDetect.ts,
 *         ElementalPhrasebook.ts, ElementalMetaphors.ts
 *
 * The Five Elements (from Spiralogic Elemental Theory):
 * - Fire: Transformation, passion, action, urgency
 * - Water: Emotion, flow, intuition, depth
 * - Earth: Grounding, stability, practicality, body
 * - Air: Clarity, thought, communication, spaciousness
 * - Aether: Spirit, transcendence, mystery, wholeness
 */

import { ConversationMessage } from '../state/ConversationState';

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';

interface ElementalMarkers {
  keywords: string[];
  patterns: RegExp[];
  emotionalTone: string[];
}

export class ElementalEngine {
  // Elemental detection patterns
  private readonly markers: Record<Element, ElementalMarkers> = {
    fire: {
      keywords: [
        'passion', 'anger', 'transform', 'burn', 'ignite', 'fierce', 'rage',
        'intensity', 'drive', 'force', 'power', 'breakthrough', 'destroy',
        'create', 'forge', 'spark', 'explosive', 'urgent', 'now', 'must'
      ],
      patterns: [
        /!+/,
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
        /\b(body|physical|tangible)\b/i,
        /\b(ground|grounded|grounding)\b/i,
        /\b(real|reality|practical)\b/i,
        /\b(stable|stability|solid)\b/i
      ],
      emotionalTone: ['calm', 'grounded', 'present', 'patient']
    },

    air: {
      keywords: [
        'think', 'thought', 'idea', 'clear', 'clarity', 'mind', 'mental',
        'understand', 'comprehend', 'concept', 'logic', 'reason', 'analyze',
        'communicate', 'speak', 'word', 'breath', 'space', 'detach', 'observe'
      ],
      patterns: [
        /\b(think|thinking|thought)\b/i,
        /\b(understand|comprehend|grasp)\b/i,
        /\b(clear|clarity|lucid)\b/i,
        /\b(mind|mental|intellect)\b/i
      ],
      emotionalTone: ['curious', 'detached', 'analytical', 'clear']
    },

    aether: {
      keywords: [
        'spirit', 'divine', 'sacred', 'soul', 'transcend', 'mystery',
        'infinite', 'eternal', 'cosmic', 'universal', 'consciousness',
        'awakening', 'enlighten', 'witness', 'presence', 'wholeness', 'unity'
      ],
      patterns: [
        /\b(spirit|spiritual|soul)\b/i,
        /\b(divine|sacred|holy)\b/i,
        /\b(transcend|transcendent|beyond)\b/i,
        /\b(infinite|eternal|timeless)\b/i
      ],
      emotionalTone: ['awe', 'reverence', 'peace', 'transcendent']
    }
  };

  /**
   * Detect dominant element from user's text
   *
   * @param text - User's spoken/written text
   * @param history - Recent conversation history for context
   * @returns Detected element
   */
  detect(text: string, history: ConversationMessage[] = []): Element {
    const lower = text.toLowerCase();
    const scores: Record<Element, number> = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      aether: 0
    };

    // Score based on keywords
    for (const [element, markers] of Object.entries(this.markers)) {
      for (const keyword of markers.keywords) {
        if (lower.includes(keyword)) {
          scores[element as Element] += 2;
        }
      }

      // Score based on patterns
      for (const pattern of markers.patterns) {
        if (pattern.test(text)) {
          scores[element as Element] += 3;
        }
      }
    }

    // Consider conversation history (last 3 messages)
    if (history.length > 0) {
      const recent = history.slice(-3);
      const elementCounts: Record<string, number> = {};

      recent.forEach(msg => {
        if (msg.element) {
          elementCounts[msg.element] = (elementCounts[msg.element] || 0) + 1;
        }
      });

      // Boost score for elements present in recent history
      for (const [element, count] of Object.entries(elementCounts)) {
        scores[element as Element] += count;
      }
    }

    // Get highest scoring element
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const winner = sorted[0];

    // If no clear winner (score = 0), default to air (neutral/mental)
    if (winner[1] === 0) {
      return 'air';
    }

    return winner[0] as Element;
  }

  /**
   * Get system prompt modifier for element
   *
   * @param element - Current element
   * @param basePrompt - Base system prompt
   * @returns Enhanced prompt with elemental tone
   */
  getPrompt(element: Element, basePrompt: string): string {
    const modifiers: Record<Element, string> = {
      fire: `${basePrompt}\n\nElemental Tone: FIRE - Respond with energy, directness, and passion. Be action-oriented and catalytic. Match their intensity. Use active verbs. Be brief and powerful.`,

      water: `${basePrompt}\n\nElemental Tone: WATER - Respond with emotional attunement and depth. Be empathetic, flowing, and gentle. Hold space for feelings. Use metaphors of depth and flow. Be receptive.`,

      earth: `${basePrompt}\n\nElemental Tone: EARTH - Respond with grounding and practicality. Be stable, concrete, and embodied. Offer tangible steps. Use physical/sensory language. Be patient and steady.`,

      air: `${basePrompt}\n\nElemental Tone: AIR - Respond with clarity and precision. Be thoughtful, articulate, and spacious. Offer new perspectives. Use clear language. Be curious and analytical.`,

      aether: `${basePrompt}\n\nElemental Tone: AETHER - Respond with depth and spaciousness. Be contemplative and expansive. Point to wholeness. Use poetic/mystical language. Be reverent and present.`
    };

    return modifiers[element];
  }

  /**
   * Get metaphors for element (for language stylization)
   *
   * @param element - Current element
   * @returns Array of metaphors
   */
  getMetaphors(element: Element): string[] {
    const metaphors: Record<Element, string[]> = {
      fire: [
        'like a flame',
        'burning bright',
        'igniting',
        'forging ahead',
        'with heat',
        'blazing through',
        'sparking',
        'transforming like fire'
      ],

      water: [
        'like a river',
        'flowing',
        'deep waters',
        'tides shifting',
        'currents moving',
        'waves of',
        'diving deep',
        'fluid as water'
      ],

      earth: [
        'rooted',
        'solid ground',
        'foundations',
        'growing',
        'grounded in',
        'anchored',
        'steady as earth',
        'embodied'
      ],

      air: [
        'like wind',
        'clarity emerging',
        'breath of',
        'spacious',
        'lifting',
        'clear as air',
        'mindful',
        'observing'
      ],

      aether: [
        'transcendent',
        'infinite',
        'sacred',
        'beyond',
        'whole',
        'unified',
        'eternal',
        'witnessed'
      ]
    };

    return metaphors[element];
  }

  /**
   * Get voice characteristics for element
   * (for future TTS integration)
   *
   * @param element - Current element
   * @returns Voice characteristics
   */
  getVoiceCharacteristics(element: Element): {
    rate: number;
    pitch: number;
    emphasis: string;
  } {
    const characteristics: Record<Element, { rate: number; pitch: number; emphasis: string }> = {
      fire: {
        rate: 1.1, // Faster
        pitch: 1.05, // Slightly higher
        emphasis: 'strong' // Emphatic
      },

      water: {
        rate: 0.9, // Slower
        pitch: 0.95, // Slightly lower
        emphasis: 'moderate' // Gentle
      },

      earth: {
        rate: 1.0, // Normal
        pitch: 0.9, // Lower
        emphasis: 'strong' // Grounded
      },

      air: {
        rate: 1.0, // Normal
        pitch: 1.0, // Normal
        emphasis: 'moderate' // Clear
      },

      aether: {
        rate: 0.85, // Slowest
        pitch: 1.0, // Normal
        emphasis: 'reduced' // Spacious
      }
    };

    return characteristics[element];
  }
}

// Singleton instance
export const elementalEngine = new ElementalEngine();
