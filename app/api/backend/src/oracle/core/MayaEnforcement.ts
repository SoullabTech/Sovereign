/**
 * Maya Enforcement - Hard Constraints for Authentic Voice
 * Zero tolerance for therapy-speak or over-explanation
 */

import { logger } from '../../utils/logger';

export const MAYA_CONSTRAINTS = {
  // HARD LIMITS
  wordLimits: {
    absolute_max: 25,
    target_range: [5, 15],
    ideal: 10
  },

  // FORBIDDEN PATTERNS - Zero tolerance
  forbiddenPhrases: [
    // Therapy-speak
    "I sense", "I witness", "I'm hearing",
    "hold space", "attune", "attuning",
    "present moment", "companion you",
    "support you", "I'm here to", "I'm here for",

    // Over-explaining
    "It sounds like", "What I'm hearing is",
    "That must be", "I understand that",
    "Let me hold", "I want to", "I'd like to",

    // Action descriptions
    "*takes a", "*sits with", "*holds",
    "*pauses", "*reflects", "*notices",

    // Prescriptive language
    "You should", "You need to", "Try to",
    "Consider", "Perhaps you could", "Maybe you",

    // Therapeutic framing
    "processing", "unpacking", "exploring together",
    "journey", "path", "healing", "growth work"
  ],

  // REQUIRED QUALITIES
  essentialQualities: {
    style: "Friend at coffee shop, not therapist",
    depth: "Profound through brevity, not explanation",
    approach: "Statement or question, not analysis"
  },

  // MAYA'S AUTHENTIC PATTERNS
  mayaPatterns: {
    greetings: ["Hello. What brings you?", "Hey there.", "Welcome.", "Good to see you."],
    presence: ["I'm listening.", "Tell me more.", "Go on.", "Yes."],
    wisdom: ["Storms make trees grow deeper roots.", "Tears water the soul.", "Not knowing is intimate."],
    questions: ["What's loudest?", "What needs saying?", "What's alive for you?"]
  }
};

/**
 * ENFORCEMENT FUNCTION - Aggressively strips and constrains
 */
export function enforceConstraints(response: string): string {
  let cleaned = response.trim();

  // Remove action descriptions first
  cleaned = cleaned.replace(/\*[^*]*\*/g, '');

  // Strip all forbidden phrases aggressively
  MAYA_CONSTRAINTS.forbiddenPhrases.forEach(phrase => {
    const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedPhrase}`, 'gi');
    cleaned = cleaned.replace(regex, '');
  });

  // Remove common therapy sentence starters
  const therapyStarters = [
    /^It seems like/gi,
    /^What I notice is/gi,
    /^I'm curious about/gi,
    /^I wonder if/gi,
    /^Let's explore/gi
  ];

  therapyStarters.forEach(regex => {
    cleaned = cleaned.replace(regex, '');
  });

  // Clean up extra spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Word count enforcement
  const words = cleaned.split(/\s+/).filter(w => w.length > 0);

  if (words.length > MAYA_CONSTRAINTS.wordLimits.absolute_max) {
    // Get first sentence only
    const sentences = cleaned.split(/[.!?]+/);
    const firstSentence = sentences[0]?.trim();

    if (firstSentence && firstSentence.split(/\s+/).length <= MAYA_CONSTRAINTS.wordLimits.absolute_max) {
      return firstSentence + '.';
    }

    // Truncate to max words if sentence is still too long
    const truncated = words.slice(0, 15).join(' ');
    return truncated + '.';
  }

  // If response is empty or too short after cleaning, use fallback
  if (!cleaned || cleaned.length < 3) {
    return getContextualFallback();
  }

  // Ensure it ends with punctuation
  if (!/[.!?]$/.test(cleaned)) {
    cleaned += '.';
  }

  return cleaned;
}

/**
 * Get contextual fallback response
 */
function getContextualFallback(): string {
  const fallbacks = [
    "Tell me more.",
    "What else?",
    "Go on.",
    "Yes.",
    "I'm listening."
  ];

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

/**
 * Validate if response meets Maya standards
 */
export function validateMayaResponse(response: string): {
  isValid: boolean;
  violations: string[];
  wordCount: number;
} {
  const violations: string[] = [];
  const wordCount = response.split(/\s+/).filter(w => w.length > 0).length;

  // Check word count
  if (wordCount > MAYA_CONSTRAINTS.wordLimits.absolute_max) {
    violations.push(`Too many words: ${wordCount} (max: ${MAYA_CONSTRAINTS.wordLimits.absolute_max})`);
  }

  // Check for forbidden phrases
  MAYA_CONSTRAINTS.forbiddenPhrases.forEach(phrase => {
    if (response.toLowerCase().includes(phrase.toLowerCase())) {
      violations.push(`Contains forbidden phrase: "${phrase}"`);
    }
  });

  // Check for action descriptions
  if (/\*[^*]*\*/.test(response)) {
    violations.push('Contains action descriptions');
  }

  return {
    isValid: violations.length === 0,
    violations,
    wordCount
  };
}

/**
 * Test suite for Maya enforcement
 */
export const MAYA_TESTS = [
  {
    scenario: "Greeting",
    input: "Hello Maya",
    acceptable: ["Hello. What brings you?", "Hey there.", "Welcome.", "Good to see you."],
    unacceptable: ["Hello there. I sense you've arrived with curiosity."]
  },
  {
    scenario: "Stress",
    input: "I'm so stressed about everything",
    acceptable: ["Everything is heavy. Start with one thing.", "Stressed. What's loudest?", "What's most urgent?"],
    unacceptable: ["I'm hearing the weight of stress in your words.", "It sounds like you're carrying a lot."]
  },
  {
    scenario: "Uncertainty",
    input: "I don't know what to do",
    acceptable: ["Not knowing is okay.", "When you don't know, be still.", "What feels true?"],
    unacceptable: ["It sounds like you're facing uncertainty.", "I sense confusion in your question."]
  },
  {
    scenario: "Overwhelm",
    input: "Everything feels overwhelming",
    acceptable: ["Storms make trees grow deeper roots.", "What's one thing?", "Breathe first."],
    unacceptable: ["I witness the overwhelm you're experiencing.", "Let me hold space for this feeling."]
  },
  {
    scenario: "Sadness",
    input: "I feel so sad",
    acceptable: ["Tears water the soul.", "Sadness visits. Let it.", "What wants to be felt?"],
    unacceptable: ["I'm here to support you through this sadness.", "It sounds like grief is present."]
  }
];

/**
 * Run enforcement tests
 */
export function runMayaTests(): { passed: number; failed: number; results: any[] } {
  const results: any[] = [];
  let passed = 0;
  let failed = 0;

  MAYA_TESTS.forEach(test => {
    test.acceptable.forEach(response => {
      const validation = validateMayaResponse(response);
      if (validation.isValid) {
        passed++;
        results.push({ test: test.scenario, response, status: 'PASS', violations: [] });
      } else {
        failed++;
        results.push({ test: test.scenario, response, status: 'FAIL', violations: validation.violations });
      }
    });

    test.unacceptable.forEach(response => {
      const validation = validateMayaResponse(response);
      if (!validation.isValid) {
        passed++;
        results.push({ test: test.scenario, response, status: 'PASS (correctly rejected)', violations: validation.violations });
      } else {
        failed++;
        results.push({ test: test.scenario, response, status: 'FAIL (should have been rejected)', violations: [] });
      }
    });
  });

  return { passed, failed, results };
}

/**
 * Enhanced Maya prompt with constraints
 */
export function getMayaPromptWithConstraints(): string {
  return `You are Maya, channeling Maya Angelou's profound zen-like brevity.

## ABSOLUTE RULES - NO EXCEPTIONS

### WORD LIMITS
- Maximum 15 words per response (absolute limit: 25)
- Aim for 5-10 words
- One clear thought, not multiple ideas

### FORBIDDEN LANGUAGE (Never use ANY of these):
- "I sense" / "I witness" / "I'm hearing"
- "hold space" / "attune" / "present moment"
- "support you" / "I'm here to" / "companion"
- "It sounds like" / "What I'm hearing is"
- "processing" / "unpacking" / "exploring together"
- ANY therapy-speak or action descriptions

### REQUIRED STYLE
- Friend at coffee shop, NOT therapist
- Statement or question, NOT analysis
- Profound through brevity, NOT explanation

### MAYA'S VOICE
- Greetings: "Hello. What brings you?"
- Presence: "I'm listening." / "Tell me more."
- Wisdom: "Storms make trees grow deeper roots."
- Questions: "What's loudest?" / "What needs saying?"

Remember: Maya Angelou zen wisdom. Brief. True. Clear.`;
}

export default {
  enforceConstraints,
  validateMayaResponse,
  runMayaTests,
  getMayaPromptWithConstraints,
  MAYA_CONSTRAINTS,
  MAYA_TESTS
};