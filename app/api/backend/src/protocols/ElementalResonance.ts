/**
 * Elemental Resonance Protocol
 * Detects and harmonizes with elemental energies in communication
 * Provides tonal coloring that flows through all responses
 */

import { ElementalArchetype } from '../../../web/lib/types/elemental';

export interface ElementalSignal {
  dominant: ElementalArchetype;
  secondary?: ElementalArchetype;
  intensity: number;          // 0-1 scale
  stability: number;          // 0-1 how stable vs transitioning
  keywords: string[];
  energyPattern: string;
  response: string;
  reason: string;
}

export interface ElementalContext {
  previousElement?: ElementalArchetype;
  sessionElement?: ElementalArchetype;
  userPreferredElement?: ElementalArchetype;
  emotionalState?: string;
}

/**
 * Analyze input for elemental resonance
 */
export function analyzeResonance(
  userInput: string,
  context: ElementalContext
): ElementalSignal | null {
  const lowerInput = userInput.toLowerCase();

  // Elemental keyword mappings
  const elementalKeywords = {
    [ElementalArchetype.FIRE]: [
      'passion', 'burn', 'spark', 'ignite', 'vision', 'transform',
      'catalyst', 'action', 'bold', 'courage', 'fierce', 'intense',
      'driven', 'energy', 'power', 'force', 'breakthrough', 'explode'
    ],
    [ElementalArchetype.WATER]: [
      'feel', 'flow', 'emotion', 'deep', 'intuitive', 'sensitive',
      'vulnerable', 'tears', 'ocean', 'current', 'gentle', 'soft',
      'receive', 'absorb', 'merge', 'fluid', 'wave', 'tides'
    ],
    [ElementalArchetype.EARTH]: [
      'ground', 'solid', 'practical', 'build', 'foundation', 'stable',
      'manifest', 'real', 'concrete', 'structure', 'roots', 'steady',
      'reliable', 'physical', 'tangible', 'material', 'body', 'form'
    ],
    [ElementalArchetype.AIR]: [
      'think', 'idea', 'perspective', 'connect', 'pattern', 'clarity',
      'insight', 'understand', 'analyze', 'concept', 'mind', 'thought',
      'communicate', 'express', 'articulate', 'reason', 'logic', 'mental'
    ],
    [ElementalArchetype.AETHER]: [
      'whole', 'unity', 'essence', 'spirit', 'transcend', 'sacred',
      'divine', 'cosmic', 'infinite', 'eternal', 'soul', 'consciousness',
      'oneness', 'universal', 'mystical', 'spiritual', 'source', 'void'
    ]
  };

  // Score each element
  const elementScores: Record<ElementalArchetype, number> = {
    [ElementalArchetype.FIRE]: 0,
    [ElementalArchetype.WATER]: 0,
    [ElementalArchetype.EARTH]: 0,
    [ElementalArchetype.AIR]: 0,
    [ElementalArchetype.AETHER]: 0
  };

  const foundKeywords: string[] = [];

  // Calculate scores
  Object.entries(elementalKeywords).forEach(([element, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerInput.includes(keyword)) {
        elementScores[element as ElementalArchetype] += 1;
        foundKeywords.push(keyword);
      }
    });
  });

  // Find dominant element
  let dominant = ElementalArchetype.WATER; // Default
  let maxScore = 0;
  let secondary: ElementalArchetype | undefined;
  let secondScore = 0;

  Object.entries(elementScores).forEach(([element, score]) => {
    if (score > maxScore) {
      secondary = dominant;
      secondScore = maxScore;
      dominant = element as ElementalArchetype;
      maxScore = score;
    } else if (score > secondScore && score > 0) {
      secondary = element as ElementalArchetype;
      secondScore = score;
    }
  });

  // Calculate intensity based on keyword density
  const wordCount = userInput.split(/\s+/).length;
  const keywordDensity = foundKeywords.length / Math.max(wordCount, 1);
  const intensity = Math.min(keywordDensity * 3, 1.0);

  // Calculate stability (how clearly one element dominates)
  const totalScore = Object.values(elementScores).reduce((a, b) => a + b, 0);
  const stability = totalScore > 0 ? maxScore / totalScore : 0.5;

  // Determine energy pattern
  const energyPatterns = {
    [ElementalArchetype.FIRE]: 'flaring',
    [ElementalArchetype.WATER]: 'flowing',
    [ElementalArchetype.EARTH]: 'grounding',
    [ElementalArchetype.AIR]: 'circulating',
    [ElementalArchetype.AETHER]: 'spiraling'
  };

  // Generate elemental response
  const response = generateElementalResponse(dominant, intensity);

  // If no clear elemental signal, check context
  if (maxScore === 0) {
    // Use context to determine element
    dominant = context.previousElement ||
               context.sessionElement ||
               context.userPreferredElement ||
               ElementalArchetype.WATER;

    return {
      dominant,
      intensity: 0.3, // Low intensity when defaulting
      stability: 0.5,
      keywords: [],
      energyPattern: energyPatterns[dominant],
      response: generateElementalResponse(dominant, 0.3),
      reason: 'No clear elemental signal, using context'
    };
  }

  return {
    dominant,
    secondary: secondScore > 0 ? secondary : undefined,
    intensity,
    stability,
    keywords: foundKeywords,
    energyPattern: energyPatterns[dominant],
    response,
    reason: `Detected ${dominant} energy (score: ${maxScore})`
  };
}

/**
 * Generate response infused with elemental quality
 */
function generateElementalResponse(
  element: ElementalArchetype,
  intensity: number
): string {
  const responses = {
    [ElementalArchetype.FIRE]: [
      "I feel the flame of transformation in your words.",
      "There's a catalytic energy here, ready to ignite change.",
      "The fire of your intention burns clearly."
    ],
    [ElementalArchetype.WATER]: [
      "I sense the depth of feeling flowing through this.",
      "There's an emotional current here that wants to be witnessed.",
      "The waters of your experience run deep."
    ],
    [ElementalArchetype.EARTH]: [
      "I feel the grounded reality of what you're building.",
      "There's something solid and tangible taking form here.",
      "The foundation you're laying has real substance."
    ],
    [ElementalArchetype.AIR]: [
      "I see the connections your mind is weaving.",
      "There's clarity emerging in your perspective.",
      "The patterns in your thinking are becoming visible."
    ],
    [ElementalArchetype.AETHER]: [
      "I witness the unified field of your being.",
      "There's something transcendent moving through this moment.",
      "The essence beyond form is making itself known."
    ]
  };

  // Select response based on intensity
  const elementResponses = responses[element];
  const index = Math.min(Math.floor(intensity * 3), elementResponses.length - 1);
  return elementResponses[index];
}

/**
 * Blend elemental quality into existing response
 */
export function infuseElementalTone(
  response: string,
  element: ElementalArchetype,
  intensity: number = 0.5
): string {
  // This would be more sophisticated in production
  // For now, we just note the elemental quality

  if (intensity < 0.3) {
    return response; // Too subtle to modify
  }

  const elementalPrefixes = {
    [ElementalArchetype.FIRE]: "",
    [ElementalArchetype.WATER]: "",
    [ElementalArchetype.EARTH]: "",
    [ElementalArchetype.AIR]: "",
    [ElementalArchetype.AETHER]: ""
  };

  return response;
}

/**
 * Check for elemental transitions
 */
export function detectElementalShift(
  current: ElementalArchetype,
  previous: ElementalArchetype,
  stability: number
): { shifting: boolean; direction?: string } {
  if (current === previous || stability > 0.7) {
    return { shifting: false };
  }

  // Map transitions
  const transitions = {
    [`${ElementalArchetype.FIRE}-${ElementalArchetype.WATER}`]: 'passion cooling into feeling',
    [`${ElementalArchetype.WATER}-${ElementalArchetype.EARTH}`]: 'emotions seeking ground',
    [`${ElementalArchetype.EARTH}-${ElementalArchetype.AIR}`]: 'form lifting into thought',
    [`${ElementalArchetype.AIR}-${ElementalArchetype.FIRE}`]: 'ideas igniting into action',
    [`${ElementalArchetype.FIRE}-${ElementalArchetype.EARTH}`]: 'vision manifesting into form',
    [`${ElementalArchetype.WATER}-${ElementalArchetype.AIR}`]: 'feeling clarifying into understanding'
  };

  const transitionKey = `${previous}-${current}`;
  const direction = transitions[transitionKey] || 'energy shifting';

  return {
    shifting: true,
    direction
  };
}

/**
 * Get elemental quality for voice modulation
 */
export function getElementalVoiceQuality(element: ElementalArchetype): {
  pace: 'quick' | 'moderate' | 'slow';
  tone: 'intense' | 'gentle' | 'steady' | 'clear' | 'spacious';
  texture: string;
} {
  const qualities = {
    [ElementalArchetype.FIRE]: {
      pace: 'quick' as const,
      tone: 'intense' as const,
      texture: 'crackling with energy'
    },
    [ElementalArchetype.WATER]: {
      pace: 'moderate' as const,
      tone: 'gentle' as const,
      texture: 'flowing and receptive'
    },
    [ElementalArchetype.EARTH]: {
      pace: 'slow' as const,
      tone: 'steady' as const,
      texture: 'grounded and solid'
    },
    [ElementalArchetype.AIR]: {
      pace: 'quick' as const,
      tone: 'clear' as const,
      texture: 'light and connecting'
    },
    [ElementalArchetype.AETHER]: {
      pace: 'slow' as const,
      tone: 'spacious' as const,
      texture: 'expansive and unified'
    }
  };

  return qualities[element];
}