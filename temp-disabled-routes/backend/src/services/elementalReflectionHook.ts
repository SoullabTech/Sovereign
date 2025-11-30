/**
 * ELEMENTAL REFLECTION HOOK
 * Version: v0.9.0-alpha (Initial public integration - October 16, 2025)
 *
 * Lightweight integration layer between Maia's conversation handler
 * and the elemental reflection prototype.
 *
 * Returns only: { reflection, question }
 * Silent logging happens underneath (user-owned data).
 *
 * SECURITY: Logs are NEVER transmitted off-device without explicit consent.
 * All elemental pattern data remains local and user-owned.
 *
 * Toggle-able via config flag: enableElementalReflection
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// ELEMENTAL LANGUAGE PATTERNS (from 25-year Elemental Alchemy framework)
// ============================================================================

interface ElementalPattern {
  element: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether' | 'Shadow' | 'Mixed';
  linguisticMarkers: string[];
  confidence: 'detected' | 'suggested' | 'ambiguous';
  archetypalResonance: string;
  bridgeExplanation: string;
}

interface ElementalReflectionResult {
  reflection: string;
  question: string;
  // Silent metadata (logged, not returned to user directly)
  _internal?: {
    element: string;
    confidence: string;
    timestamp: string;
    userId?: string;
  };
}

const ELEMENTAL_LANGUAGE_PATTERNS = {
  Fire: {
    phrases: [
      'I have an idea', "I'm excited to", 'I see', 'I imagine',
      'I am inspired to', 'I want to', "I'm going to", 'I envision',
      'breakthrough', 'vision', 'passion', 'create', 'ignite'
    ],
    temporalMarkers: ['will', 'going to', 'want to', 'future', 'next'],
    toneIndicators: ['!', 'excited', 'passionate', 'urgent', 'powerful']
  },
  Water: {
    phrases: [
      'I feel', 'I sense', 'emotion', 'intuition', 'flow',
      'healing', 'shadow', 'depth', 'intimacy', 'relationship'
    ],
    temporalMarkers: ['felt', 'feeling', 'past', 'remember'],
    toneIndicators: ['...', 'deep', 'subtle', 'tender', 'vulnerable']
  },
  Earth: {
    phrases: [
      'I do', 'I practice', 'daily', 'ritual', 'habit',
      'body', 'ground', 'concrete', 'physical', 'routine',
      'build', 'structure', 'stable', 'manifest'
    ],
    temporalMarkers: ['daily', 'every day', 'consistently', 'regularly'],
    toneIndicators: ['steady', 'solid', 'practical', 'tangible']
  },
  Air: {
    phrases: [
      'I think', 'I understand', 'I realize', 'clarity',
      'communicate', 'teach', 'share', 'connect', 'learn',
      'pattern', 'analyze', 'explain'
    ],
    temporalMarkers: ['now', 'currently', 'understand', 'see clearly'],
    toneIndicators: ['clear', 'logical', 'rational', 'analytical']
  },
  Aether: {
    phrases: [
      'soul', 'spirit', 'divine', 'transcend', 'unity',
      'presence', 'consciousness', 'sacred', 'infinite',
      'whole', 'integrated', 'essence'
    ],
    temporalMarkers: ['timeless', 'eternal', 'always', 'being'],
    toneIndicators: ['profound', 'sacred', 'mystical', 'unified']
  },
  Shadow: {
    phrases: [
      'struggle', 'resist', 'avoid', 'fear', 'hide',
      'stuck', 'blocked', 'dark', 'hidden', 'secret',
      'shame', 'judge', 'reject'
    ],
    temporalMarkers: ['always', 'never', 'can\'t', 'stuck'],
    toneIndicators: ['heavy', 'contracted', 'tense', 'defensive']
  }
};

// ============================================================================
// MAIA'S REFLECTION LIBRARY (Kitchen Table Mysticism)
// ============================================================================

const MAIA_REFLECTIONS = {
  Fire: {
    reflections: [
      "I witness Fire calling - creative energy gathering strength.",
      "This breakthrough feels like vision wanting to ignite.",
      "Fire energy is here - something wants to be born through you.",
      "Your creative spirit is gathering momentum."
    ],
    questions: [
      "What vision wants to ignite?",
      "What's wanting to be born here?",
      "What would happen if you let this Fire fully express?",
      "What's the spark beneath this excitement?"
    ]
  },
  Water: {
    reflections: [
      "I witness Water seeking its natural flow.",
      "This emotional weather knows how to release.",
      "Water energy is here - healing work unfolding.",
      "Your depths are speaking."
    ],
    questions: [
      "What wants to heal through this Water phase?",
      "What does this feeling need you to know?",
      "What's beneath the surface here?",
      "How does your emotional wisdom want to move?"
    ]
  },
  Earth: {
    reflections: [
      "Earth energy wants to ground this wisdom.",
      "I notice the body asking to embody something.",
      "Earth is calling for ritual and daily practice.",
      "This wants physical form."
    ],
    questions: [
      "What daily ritual would embody this insight?",
      "How does your body want to live this truth?",
      "What concrete step wants to be taken?",
      "What structure would support this manifestation?"
    ]
  },
  Air: {
    reflections: [
      "Air energy seeks to share this wisdom.",
      "Clarity is emerging that wants expression.",
      "This understanding wants to circulate.",
      "I witness mental integration happening."
    ],
    questions: [
      "Who needs to hear what you've learned?",
      "How does this clarity want to be shared?",
      "What pattern are you recognizing?",
      "What wants to be communicated?"
    ]
  },
  Aether: {
    reflections: [
      "I witness your soul shining through.",
      "This is Aether - pure presence recognizing itself.",
      "You're touching the infinite here.",
      "Sacred coherence is present."
    ],
    questions: [
      "What does your essence know in this moment?",
      "How is your soul speaking?",
      "What wants to integrate across all elements?",
      "What does wholeness feel like right now?"
    ]
  },
  Shadow: {
    reflections: [
      "Shadow often holds our greatest medicine.",
      "What you resist carries wisdom.",
      "This darkness knows something important.",
      "I notice resistance - often a sign of hidden gifts."
    ],
    questions: [
      "What if this 'problem' is actually a gift in disguise?",
      "What is your resistance protecting?",
      "What wisdom lives in this shadow?",
      "What would it mean to befriend this part of yourself?"
    ]
  },
  Mixed: {
    reflections: [
      "I notice multiple elemental energies dancing together.",
      "Your spiral is moving through several phases at once.",
      "This is rich - complexity seeking expression.",
      "Multiple layers want acknowledgment."
    ],
    questions: [
      "What's the dominant energy beneath the complexity?",
      "Which element wants attention first?",
      "How are these energies working together?",
      "What wants to integrate here?"
    ]
  }
};

// ============================================================================
// PATTERN DETECTION
// ============================================================================

function detectElementalPattern(message: string): ElementalPattern {
  const messageLower = message.toLowerCase();
  const elementScores = new Map<string, number>();

  // Score each element based on linguistic markers
  for (const [element, patterns] of Object.entries(ELEMENTAL_LANGUAGE_PATTERNS)) {
    let score = 0;
    const foundMarkers: string[] = [];

    // Check phrases
    patterns.phrases.forEach(phrase => {
      if (messageLower.includes(phrase.toLowerCase())) {
        score += 3;
        foundMarkers.push(phrase);
      }
    });

    // Check temporal markers
    patterns.temporalMarkers.forEach(marker => {
      if (messageLower.includes(marker.toLowerCase())) {
        score += 1;
      }
    });

    // Check tone indicators
    patterns.toneIndicators.forEach(indicator => {
      if (messageLower.includes(indicator.toLowerCase())) {
        score += 1;
      }
    });

    if (score > 0) {
      elementScores.set(element, score);
    }
  }

  // Determine dominant element
  if (elementScores.size === 0) {
    return {
      element: 'Mixed',
      linguisticMarkers: [],
      confidence: 'ambiguous',
      archetypalResonance: 'No clear elemental pattern detected - message may be transitional or exploratory',
      bridgeExplanation: 'Linguistic patterns don\'t strongly match any single element'
    };
  }

  const sortedElements = Array.from(elementScores.entries())
    .sort((a, b) => b[1] - a[1]);

  const topElement = sortedElements[0][0];
  const topScore = sortedElements[0][1];

  // Check if it's mixed (multiple elements with similar scores)
  const isMixed = sortedElements.length > 1 &&
                  sortedElements[1][1] >= topScore * 0.6;

  let confidence: 'detected' | 'suggested' | 'ambiguous';
  if (topScore >= 6) {
    confidence = 'detected';
  } else if (topScore >= 3) {
    confidence = 'suggested';
  } else {
    confidence = 'ambiguous';
  }

  const element = isMixed ? 'Mixed' : topElement as any;

  return {
    element,
    linguisticMarkers: [], // Simplified for now
    confidence,
    archetypalResonance: getArchetypalResonance(element),
    bridgeExplanation: `Detected ${confidence} ${element} energy based on linguistic patterns`
  };
}

function getArchetypalResonance(element: string): string {
  const resonances = {
    Fire: 'Creative ignition, vision, breakthrough - right prefrontal cortex activity (future/possibility)',
    Water: 'Emotional processing, healing, depth - right posterior (past/emotion/relationship)',
    Earth: 'Embodiment, manifestation, ritual - left posterior (past/body/concrete)',
    Air: 'Mental clarity, communication, teaching - left prefrontal (future/logic/planning)',
    Aether: 'Soul presence, unity, transcendence - integration across all quadrants',
    Shadow: 'Hidden wisdom, resistance as medicine, unintegrated aspects seeking acknowledgment',
    Mixed: 'Multiple elemental energies present - spiral moving through transformation'
  };
  return resonances[element] || resonances.Mixed;
}

// ============================================================================
// REFLECTION GENERATION
// ============================================================================

function generateMaiaReflection(pattern: ElementalPattern, message: string): ElementalReflectionResult {
  const element = pattern.element;
  const library = MAIA_REFLECTIONS[element];

  // Select reflection and question (random for natural variation)
  const reflection = library.reflections[Math.floor(Math.random() * library.reflections.length)];
  const question = library.questions[Math.floor(Math.random() * library.questions.length)];

  return {
    reflection,
    question,
    _internal: {
      element: pattern.element,
      confidence: pattern.confidence,
      timestamp: new Date().toISOString()
    }
  };
}

// ============================================================================
// SILENT LOGGING (User-owned data)
// ============================================================================
// SECURITY: Logs are stored locally and NEVER transmitted off-device
//           without explicit user consent. All data remains user-owned.
// ============================================================================

function logElementalReflection(
  userId: string,
  message: string,
  result: ElementalReflectionResult
) {
  try {
    const logDir = path.join(process.cwd(), 'logs', 'elemental-reflections');
    const userLogFile = path.join(logDir, `${userId}.jsonl`);

    // Ensure directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId,
      userMessage: message.substring(0, 200), // Truncate for privacy
      element: result._internal?.element,
      confidence: result._internal?.confidence,
      reflectionGiven: result.reflection.substring(0, 100),
      questionAsked: result.question.substring(0, 100)
    };

    // Append to user's log file (JSONL format)
    fs.appendFileSync(userLogFile, JSON.stringify(logEntry) + '\n');

  } catch (err) {
    // Silent failure - don't interrupt conversation flow
    console.error('Elemental reflection logging error:', err);
  }
}

// ============================================================================
// PUBLIC API - The Hook
// ============================================================================

export interface ElementalReflectionConfig {
  enableElementalReflection: boolean;
}

/**
 * Process incoming message and return elemental reflection
 * Returns: { reflection, question } only
 * Logs silently to user-owned data folder
 */
export async function processElementalReflection(
  message: string,
  userId: string,
  config: ElementalReflectionConfig = { enableElementalReflection: true }
): Promise<ElementalReflectionResult | null> {

  // Toggle check
  if (!config.enableElementalReflection) {
    return null;
  }

  try {
    // Detect pattern
    const pattern = detectElementalPattern(message);

    // Generate reflection
    const result = generateMaiaReflection(pattern, message);

    // Add userId to internal metadata
    if (result._internal) {
      result._internal.userId = userId;
    }

    // Silent logging
    logElementalReflection(userId, message, result);

    return result;

  } catch (err) {
    console.error('Elemental reflection processing error:', err);
    return null;
  }
}

/**
 * Check if elemental reflection should be included in response
 * (Can be extended with more sophisticated logic later)
 */
export function shouldIncludeElementalReflection(
  messageCount: number,
  lastReflectionTimestamp?: Date
): boolean {
  // For now: include in every message
  // Later: can add logic like "only every 3rd message" or "only when confidence is high"
  return true;
}
