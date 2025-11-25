// lib/dialogue/RelaxedConversationSystem.ts
// Natural, relaxed conversation style - like talking to a friend
"use strict";

export class RelaxedConversationSystem {
  /**
   * Transform formal oracle speech into casual conversation
   */
  public static makeRelaxed(text: string, context?: { isGreeting?: boolean; isQuestion?: boolean }): string {
    let relaxed = text;

    // First, make it WAY shorter
    relaxed = this.shortenDrastically(relaxed, context);

    // Then make it casual
    relaxed = this.casualize(relaxed);

    // Remove any remaining formality
    relaxed = this.stripFormality(relaxed);

    return relaxed.trim();
  }

  /**
   * Drastically shorten responses
   */
  private static shortenDrastically(text: string, context?: { isGreeting?: boolean; isQuestion?: boolean }): string {
    // Greetings should be SUPER short
    if (context?.isGreeting) {
      const greetings = [
        "Hey there.",
        "Hi.",
        "Hello.",
        "Welcome.",
        "Hey."
      ];
      // Just return a simple greeting, ignore the rest
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Questions should be one simple sentence
    if (context?.isQuestion) {
      // Take just the first question if there are multiple
      const firstQuestion = text.match(/[^.!?]*\?/);
      if (firstQuestion) {
        return firstQuestion[0].trim();
      }
    }

    // For other responses, take only the MOST essential sentence
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length > 0) {
      // Take the shortest meaningful sentence
      const meaningful = sentences
        .filter(s => s.trim().split(' ').length > 2)
        .sort((a, b) => a.length - b.length);

      if (meaningful.length > 0) {
        return meaningful[0].trim() + '.';
      }

      // Fallback to first sentence
      return sentences[0].trim() + '.';
    }

    return text;
  }

  /**
   * Make language casual and conversational
   */
  private static casualize(text: string): string {
    const casualReplacements = new Map([
      // Formal -> Casual
      ["I am", "I'm"],
      ["you are", "you're"],
      ["we are", "we're"],
      ["they are", "they're"],
      ["it is", "it's"],
      ["that is", "that's"],
      ["what is", "what's"],
      ["there is", "there's"],
      ["cannot", "can't"],
      ["will not", "won't"],
      ["do not", "don't"],
      ["does not", "doesn't"],
      ["have not", "haven't"],
      ["has not", "hasn't"],
      ["would not", "wouldn't"],
      ["should not", "shouldn't"],
      ["could not", "couldn't"],

      // Remove overly formal phrases
      ["I would like to", "I'd"],
      ["Would you like to", "Want to"],
      ["Perhaps we could", "Maybe we"],
      ["It appears that", "Looks like"],
      ["It seems that", "Seems"],
      ["I believe that", "I think"],
      ["In my opinion", ""],
      ["Furthermore", "Also"],
      ["Therefore", "So"],
      ["However", "But"],
      ["Nevertheless", "Still"],
      ["Indeed", "Yeah"],
      ["Certainly", "Sure"],
      ["Of course", "Sure"],
      ["Shall we", "Want to"],
      ["May I", "Can I"],
    ]);

    let casual = text;
    casualReplacements.forEach((relaxed, formal) => {
      const pattern = new RegExp(`\\b${formal}\\b`, 'gi');
      casual = casual.replace(pattern, relaxed);
    });

    return casual;
  }

  /**
   * Strip remaining formality markers
   */
  private static stripFormality(text: string): string {
    // Remove formal punctuation patterns
    let relaxed = text;

    // Remove semicolons - too formal
    relaxed = relaxed.replace(/;/g, ',');

    // Simplify overly complex punctuation
    relaxed = relaxed.replace(/\s*—\s*/g, ' - ');

    // Remove parenthetical asides - too academic
    relaxed = relaxed.replace(/\s*\([^)]*\)\s*/g, ' ');

    // Remove leading "Well," "Now," "So," - can feel condescending
    relaxed = relaxed.replace(/^(Well|Now|So|Actually|Basically),?\s*/i, '');

    // Remove trailing ", yes?" ", no?" - too formal
    relaxed = relaxed.replace(/,\s*(yes|no|right|okay)\?$/i, '.');

    return relaxed;
  }

  /**
   * Create natural opening responses
   */
  public static getRelaxedGreeting(): string {
    const greetings = [
      "Hey.",
      "Hi there.",
      "Hello.",
      "Hey, what's up?",
      "Hi.",
      "Welcome.",
      "Good to see you.",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /**
   * Create natural follow-up prompts
   */
  public static getRelaxedPrompt(): string {
    const prompts = [
      "What's on your mind?",
      "How can I help?",
      "What's going on?",
      "Tell me.",
      "I'm here.",
      "Talk to me.",
      "I'm listening.",
      "How are you?",
      "What's happening?",
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  /**
   * Create natural acknowledgments
   */
  public static getRelaxedAcknowledgment(): string {
    const acks = [
      "I hear you.",
      "Got it.",
      "I see.",
      "Makes sense.",
      "Okay.",
      "Right.",
      "I understand.",
      "Yeah.",
      "Mm-hmm.",
      "I get it.",
    ];
    return acks[Math.floor(Math.random() * acks.length)];
  }

  /**
   * Transform specific oracle patterns to casual conversation
   */
  public static transformOraclePatterns(text: string): string {
    const patterns = [
      // Oracle speak -> Casual
      { pattern: /I sense your presence/gi, replacement: "Hey" },
      { pattern: /Sacred space awaits/gi, replacement: "Ready when you are" },
      { pattern: /The oracle listens/gi, replacement: "I'm listening" },
      { pattern: /Speak your truth/gi, replacement: "Go ahead" },
      { pattern: /What seeks expression/gi, replacement: "What's up" },
      { pattern: /I witness/gi, replacement: "I see" },
      { pattern: /This resonates/gi, replacement: "That makes sense" },
      { pattern: /The energy shifts/gi, replacement: "Things are changing" },
      { pattern: /I hold space for/gi, replacement: "I'm here for" },
      { pattern: /Your essence/gi, replacement: "You" },
      { pattern: /Sacred journey/gi, replacement: "journey" },
      { pattern: /Divine timing/gi, replacement: "timing" },
      { pattern: /Cosmic wisdom/gi, replacement: "wisdom" },
      { pattern: /Universal truth/gi, replacement: "truth" },
      { pattern: /Elemental forces/gi, replacement: "forces" },
      { pattern: /Mystical/gi, replacement: "interesting" },
      { pattern: /Profound/gi, replacement: "deep" },
      { pattern: /Illuminate/gi, replacement: "show" },
      { pattern: /Manifest/gi, replacement: "create" },
      { pattern: /Transmute/gi, replacement: "change" },
      { pattern: /Transcend/gi, replacement: "go beyond" },
    ];

    let relaxed = text;
    patterns.forEach(({ pattern, replacement }) => {
      relaxed = relaxed.replace(pattern, replacement);
    });

    return relaxed;
  }
}

// Export for easy use
export const relaxedConversation = new RelaxedConversationSystem();