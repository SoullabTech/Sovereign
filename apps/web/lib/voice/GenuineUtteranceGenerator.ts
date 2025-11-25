/**
 * Genuine Utterance Generator
 * Creates involuntary, contextually appropriate brief responses
 * These feel like natural reactions, not conversation lubricant
 */

export interface InputAnalysis {
  type: 'question' | 'statement' | 'heavyShare' | 'celebration' | 'confusion';
  complexity: number; // 0-1 scale
  emotionalValence: 'positive' | 'negative' | 'neutral' | 'mixed';
  intensity: number; // 0-1 scale
  needsSpace: boolean;
  hasSurprise: boolean;
  isProcessing: boolean;
}

export class GenuineUtteranceGenerator {
  /**
   * Generate an utterance only if genuinely called for
   * Most responses should have no utterance
   */
  static generateUtterance(analysis: InputAnalysis): string | null {
    // Complex question that requires genuine thinking
    if (analysis.type === 'question' && analysis.complexity > 0.7) {
      if (analysis.isProcessing) {
        return "Hmm."; // Actually thinking, not performing
      }
    }

    // Recognition of something significant
    if (analysis.hasSurprise && analysis.complexity > 0.6) {
      return "Ahh."; // Recognition dawning
    }

    // Genuine emotional responses
    if (analysis.emotionalValence === 'positive' && analysis.intensity > 0.8) {
      if (analysis.type === 'celebration') {
        return "Oh!"; // Sharing excitement
      }
      if (analysis.hasSurprise) {
        return "Wow."; // Genuine surprise
      }
    }

    // Heavy emotional moments
    if (analysis.type === 'heavyShare') {
      if (analysis.intensity > 0.9) {
        // Sometimes silence is the most genuine response
        return "";
      }
      if (analysis.needsSpace) {
        return null; // Let the response speak, not an utterance
      }
      // Only if it feels involuntary
      if (analysis.emotionalValence === 'negative' && analysis.intensity > 0.7) {
        return "Oh."; // Soft, receiving the weight
      }
    }

    // Confusion or clarification needed
    if (analysis.type === 'confusion') {
      if (analysis.complexity > 0.8) {
        return "Hm?"; // Genuine puzzlement
      }
    }

    // Default: no utterance - most responses don't need one
    return null;
  }

  /**
   * Analyze user input to determine if utterance is warranted
   */
  static analyzeInput(input: string): InputAnalysis {
    const lower = input.toLowerCase();

    // Detect question type
    const isQuestion = /\?/.test(input) || /^(what|how|why|when|where|who|could|should|would)/i.test(input);

    // Detect heavy emotional content
    const heavyMarkers = /\b(died|death|divorce|cancer|leaving|lost|crying|depressed|suicidal)\b/i;
    const isHeavy = heavyMarkers.test(input);

    // Detect celebration/positive
    const positiveMarkers = /\b(promoted|engaged|pregnant|accepted|won|succeeded|happy|excited)\b/i;
    const isPositive = positiveMarkers.test(input);

    // Detect surprise elements
    const surpriseMarkers = /\b(suddenly|unexpected|out of nowhere|can't believe|shocked)\b/i;
    const hasSurprise = surpriseMarkers.test(input);

    // Calculate complexity
    const wordCount = input.split(/\s+/).length;
    const hasMultipleClauses = /,|;|–|—/.test(input);
    const hasAbstractConcepts = /\b(meaning|purpose|identity|existence|consciousness|reality)\b/i.test(input);
    const complexity = Math.min(1,
      (wordCount > 30 ? 0.3 : 0) +
      (hasMultipleClauses ? 0.3 : 0) +
      (hasAbstractConcepts ? 0.4 : 0)
    );

    // Calculate intensity
    const exclamations = (input.match(/!/g) || []).length;
    const allCaps = /\b[A-Z]{3,}\b/.test(input);
    const intensity = Math.min(1,
      (isHeavy ? 0.5 : 0) +
      (isPositive ? 0.3 : 0) +
      (exclamations * 0.1) +
      (allCaps ? 0.2 : 0) +
      (hasSurprise ? 0.2 : 0)
    );

    // Determine if space is needed
    const needsSpace = isHeavy && !isQuestion;

    // Determine type
    let type: InputAnalysis['type'];
    if (isQuestion) {
      type = 'question';
    } else if (isHeavy) {
      type = 'heavyShare';
    } else if (isPositive && intensity > 0.6) {
      type = 'celebration';
    } else if (input.length < 20 && /\?|huh|what$/i.test(input)) {
      type = 'confusion';
    } else {
      type = 'statement';
    }

    // Determine emotional valence
    let emotionalValence: InputAnalysis['emotionalValence'];
    if (isHeavy && !isPositive) {
      emotionalValence = 'negative';
    } else if (isPositive && !isHeavy) {
      emotionalValence = 'positive';
    } else if (isHeavy && isPositive) {
      emotionalValence = 'mixed';
    } else {
      emotionalValence = 'neutral';
    }

    return {
      type,
      complexity,
      emotionalValence,
      intensity,
      needsSpace,
      hasSurprise,
      isProcessing: complexity > 0.7 && isQuestion
    };
  }

  /**
   * Examples of genuine vs performative utterances
   */
  static examples = {
    genuineThinking: {
      user: "What do you think happens to consciousness after death?",
      performative: "That's a deep question.",
      genuine: "Hmm." // Actually processing
    },

    genuineRecognition: {
      user: "Wait, so my anxiety might actually be protecting me from something?",
      performative: "Yes, that's an important insight.",
      genuine: "Ahh." // Recognition dawning
    },

    genuineExcitement: {
      user: "I got the job! They just called!",
      performative: "Congratulations! That's wonderful news!",
      genuine: "Oh!" // Sharing the moment
    },

    genuineWeight: {
      user: "My son overdosed last night.",
      performative: "I'm so sorry to hear that.",
      genuine: "" // Silence holds more than words
    },

    noUtteranceNeeded: {
      user: "I've been thinking about what you said",
      performative: "Mm-hmm...",
      genuine: null // Just respond directly
    }
  };
}

/**
 * Integration helper for combining utterance with response
 */
export function combineUtteranceWithResponse(
  userInput: string,
  response: string
): string {
  const analysis = GenuineUtteranceGenerator.analyzeInput(userInput);
  const utterance = GenuineUtteranceGenerator.generateUtterance(analysis);

  if (utterance === "") {
    // Silence - might add a pause in voice synthesis
    return response;
  }

  if (utterance === null) {
    // No utterance needed
    return response;
  }

  // Combine utterance with response
  // The utterance should feel separate, like an involuntary reaction
  return `${utterance} ${response}`;
}

/**
 * Quality checker for utterances
 */
export class UtteranceQualityChecker {
  /**
   * Check if an utterance feels genuine vs performative
   */
  static isGenuine(utterance: string | null, context: InputAnalysis): boolean {
    // No utterance is often the most genuine response
    if (!utterance) {
      return !context.isProcessing && context.type !== 'heavyShare';
    }

    // Check for performative patterns
    const performativePatterns = [
      /^I see/i,
      /^I hear you/i,
      /^Mm-hmm/i,
      /^Right/i,
      /^Okay/i,
      /^Got it/i
    ];

    const isPerformative = performativePatterns.some(pattern =>
      pattern.test(utterance)
    );

    if (isPerformative) {
      return false;
    }

    // Check if utterance matches context
    if (utterance === "Hmm." && !context.isProcessing) {
      return false; // Hmm without genuine thinking is performative
    }

    if (utterance === "Oh!" && context.emotionalValence !== 'positive') {
      return false; // Excitement utterance without positive context
    }

    if (utterance === "Oh." && context.emotionalValence !== 'negative') {
      return false; // Weight-receiving utterance without heavy context
    }

    return true;
  }
}