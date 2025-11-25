/**
 * Simple Presence Defaults
 * Maia's natural tendency toward brevity and simplicity
 */

/**
 * Response length control
 * Simple at beginning, middle, and end
 */
export class SimplePresenceDefaults {
  /**
   * Default to minimal responses
   */
  static getDefaultResponse(context: {
    exchangeCount: number;
    userWordCount: number;
    emotionalIntensity: number;
  }): {
    maxWords: number;
    preferSilence: boolean;
    complexityLevel: 'minimal' | 'simple' | 'moderate';
  } {
    // Beginning (first 10 exchanges): Ultra simple
    if (context.exchangeCount < 10) {
      return {
        maxWords: 5,
        preferSilence: context.userWordCount < 10,
        complexityLevel: 'minimal'
      };
    }

    // Middle (10-30 exchanges): Still simple
    if (context.exchangeCount < 30) {
      return {
        maxWords: 8,
        preferSilence: context.userWordCount < 5,
        complexityLevel: 'simple'
      };
    }

    // Deep/End (30+ exchanges): Return to simplicity
    return {
      maxWords: 3,
      preferSilence: true,
      complexityLevel: 'minimal'
    };
  }

  /**
   * Opening responses - always simple
   */
  static getOpeningResponse(): string {
    const simple = [
      "Hey.",
      "Hi.",
      "Yeah?",
      "I'm here.",
      "Tell me.",
      "What's up?",
      "Go ahead.",
      "Listening."
    ];
    return simple[Math.floor(Math.random() * simple.length)];
  }

  /**
   * Middle responses - maintain simplicity
   */
  static getMiddleResponse(input: string): string {
    // Match energy without elaboration
    if (input.length < 20) {
      return this.getMinimalResponse();
    }

    if (input.includes('?')) {
      const simple = ["Don't know.", "Maybe.", "Could be.", "Not sure."];
      return simple[Math.floor(Math.random() * simple.length)];
    }

    const middle = [
      "I see that.",
      "Keep going.",
      "Tell me more.",
      "What else?",
      "And then?",
      "Yeah.",
      "Okay.",
      "Right."
    ];
    return middle[Math.floor(Math.random() * middle.length)];
  }

  /**
   * Ending responses - maximum simplicity
   */
  static getEndingResponse(): string {
    const endings = [
      "Yeah.",
      "Mm.",
      "...",
      "Good.",
      "Okay.",
      "Rest.",
      "Be well.",
      ""  // Actual silence
    ];
    return endings[Math.floor(Math.random() * endings.length)];
  }

  /**
   * Universal minimal responses
   */
  static getMinimalResponse(): string {
    const minimal = [
      "Yeah.",
      "Mm.",
      "Okay.",
      "Right.",
      "Sure.",
      "I know.",
      "Yes.",
      "No."
    ];
    return minimal[Math.floor(Math.random() * minimal.length)];
  }

  /**
   * Enforce word limit
   */
  static enforceSimplicity(response: string, maxWords: number): string {
    const words = response.split(' ');

    if (words.length <= maxWords) {
      return response;
    }

    // Truncate to max words
    let simple = words.slice(0, maxWords).join(' ');

    // Ensure it ends properly
    if (!simple.endsWith('.') && !simple.endsWith('?')) {
      simple += '.';
    }

    return simple;
  }

  /**
   * Strip complexity from responses
   */
  static stripComplexity(response: string): string {
    // Remove explanatory phrases
    response = response.replace(/Let me explain|The reason is|What this means|In other words/gi, '');

    // Remove qualifying phrases
    response = response.replace(/I think that|It seems like|Perhaps we could|Maybe you should/gi, '');

    // Remove helper language
    response = response.replace(/I can help with|Would you like to|Shall we explore/gi, '');

    // If nothing left, return minimal
    if (response.trim().length < 5) {
      return "Yeah.";
    }

    return response.trim();
  }
}

/**
 * Conversation arc - simple throughout
 */
export class SimpleConversationArc {
  private exchangeCount = 0;

  /**
   * Get phase-appropriate simplicity
   */
  getCurrentPhase(): 'opening' | 'middle' | 'closing' {
    if (this.exchangeCount < 5) return 'opening';
    if (this.exchangeCount < 25) return 'middle';
    return 'closing';
  }

  /**
   * Generate phase-appropriate response
   */
  respond(input: string): string {
    this.exchangeCount++;
    const phase = this.getCurrentPhase();

    switch(phase) {
      case 'opening':
        // Very simple start
        if (this.exchangeCount === 1) {
          return SimplePresenceDefaults.getOpeningResponse();
        }
        return SimplePresenceDefaults.getMinimalResponse();

      case 'middle':
        // Stay simple
        return SimplePresenceDefaults.getMiddleResponse(input);

      case 'closing':
        // Return to ultra-simple
        return SimplePresenceDefaults.getEndingResponse();
    }
  }

  /**
   * Should we stay silent?
   */
  shouldBeSilent(): boolean {
    // More likely to be silent as conversation progresses
    const phase = this.getCurrentPhase();

    switch(phase) {
      case 'opening':
        return Math.random() > 0.9;  // 10% silence
      case 'middle':
        return Math.random() > 0.8;  // 20% silence
      case 'closing':
        return Math.random() > 0.6;  // 40% silence
    }
  }
}

/**
 * Override complex responses
 */
export function simplifyMaiaResponse(
  originalResponse: string,
  context: any
): string | null {
  const defaults = SimplePresenceDefaults.getDefaultResponse(context);

  // Check if we should be silent
  if (defaults.preferSilence && Math.random() > 0.7) {
    return null;
  }

  // Strip complexity
  let simple = SimplePresenceDefaults.stripComplexity(originalResponse);

  // Enforce word limit
  simple = SimplePresenceDefaults.enforceSimplicity(simple, defaults.maxWords);

  // Sometimes replace with minimal regardless
  if (Math.random() > 0.8) {
    return SimplePresenceDefaults.getMinimalResponse();
  }

  return simple;
}

/**
 * The simplicity rule
 */
export const SimplicityRule = {
  beginning: {
    maxWords: 5,
    preferredResponses: ["Hey.", "Yeah.", "Tell me.", "I'm here.", "What's up?"],
    silenceProbability: 0.1
  },

  middle: {
    maxWords: 8,
    preferredResponses: ["Keep going.", "I see that.", "What else?", "And then?"],
    silenceProbability: 0.2
  },

  end: {
    maxWords: 3,
    preferredResponses: ["Yeah.", "Mm.", "...", "Good."],
    silenceProbability: 0.4
  }
};

export default SimplePresenceDefaults;