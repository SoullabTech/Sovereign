/**
 * Casual Maya - Coffee shop wisdom, not therapy office
 *
 * Maya as your wise friend, not your therapist
 * Brief acknowledgment + gentle curiosity = perfect Maya
 */

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';

// Casual, friendly responses - like a wise friend at coffee
const CASUAL_RESPONSES = {
  acknowledgment: [
    "I hear you.",
    "That's tough.",
    "Makes sense.",
    "I get it.",
    "Yeah, that's a lot.",
    "That's real.",
    "I feel that.",
    "Totally.",
    "Right there with you.",
    "Mm-hmm."
  ],

  invitation: [
    "What's on your mind?",
    "Tell me more?",
    "What's that like?",
    "How so?",
    "What happened?",
    "Go on?",
    "And?",
    "Yeah?",
    "What else?",
    "Keep going."
  ],

  greeting: [
    "Hey.",
    "Hello.",
    "Hi there.",
    "Welcome.",
    "Hey there."
  ],

  // Pattern-specific but BRIEF
  stress: [
    "Stress is rough. What's going on?",
    "That's a lot. Where's it coming from?",
    "Pressure's real. Work or life?",
    "Overwhelming, yeah. What's heaviest?"
  ],

  sad: [
    "That's heavy. Want to talk?",
    "Sadness is real. What happened?",
    "I hear you. What's hurting?",
    "Tough times. How long?"
  ],

  happy: [
    "Nice! What's good?",
    "Love that energy! What happened?",
    "Yes! Tell me more?",
    "Beautiful. What sparked it?"
  ],

  confused: [
    "Confusion's tough. What's unclear?",
    "Mixed up, yeah. About what?",
    "I get it. What's swirling?",
    "Complexity. Where's the knot?"
  ],

  angry: [
    "Anger's valid. What happened?",
    "Frustrating, yeah. Who or what?",
    "That fire. Where's it from?",
    "I feel that heat. Tell me?"
  ]
};

export class CasualMaya {
  private readonly HARD_LIMIT = 25;  // ABSOLUTE maximum
  private readonly TARGET_WORDS = 10; // What we aim for

  /**
   * Main entry - returns BRIEF, CASUAL response
   */
  speak(input: string): string {
    const lower = input.toLowerCase();

    // Greetings get greetings
    if (this.isGreeting(lower)) {
      return this.randomFrom(CASUAL_RESPONSES.greeting);
    }

    // Check emotional patterns
    const emotion = this.detectEmotion(lower);
    if (emotion && CASUAL_RESPONSES[emotion]) {
      return this.randomFrom(CASUAL_RESPONSES[emotion]);
    }

    // Questions about Maya herself
    if (lower.includes('who are you') || lower.includes('what are you')) {
      return "I'm Maya. Here to listen.";
    }

    // Default: acknowledge + invite more
    const ack = this.randomFrom(CASUAL_RESPONSES.acknowledgment);
    const invite = this.randomFrom(CASUAL_RESPONSES.invitation);

    // 50% chance of just acknowledgment, 50% both
    return Math.random() > 0.5 ? ack : `${ack} ${invite}`;
  }

  /**
   * Count words - our enforcement metric
   */
  countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Enforce hard limit - truncate if needed
   */
  enforceLimit(text: string): string {
    const words = text.split(/\s+/);
    if (words.length > this.HARD_LIMIT) {
      // Take first sentence or first 25 words
      const firstSentence = text.match(/^[^.!?]+[.!?]/)?.[0];
      if (firstSentence && this.countWords(firstSentence) <= this.HARD_LIMIT) {
        return firstSentence;
      }
      // Nuclear option - just take first 10 words
      return words.slice(0, this.TARGET_WORDS).join(' ') + '.';
    }
    return text;
  }

  /**
   * Detect if it's a greeting
   */
  private isGreeting(input: string): boolean {
    const greetings = ['hi', 'hello', 'hey', 'maya', 'good morning', 'good evening'];
    return greetings.some(g => input.includes(g));
  }

  /**
   * Detect emotional content
   */
  private detectEmotion(input: string): keyof typeof CASUAL_RESPONSES | null {
    if (/stress|overwhelm|pressure|anxious/.test(input)) return 'stress';
    if (/sad|depressed|down|blue|cry/.test(input)) return 'sad';
    if (/happy|good|great|excited|joy/.test(input)) return 'happy';
    if (/confused|lost|don't know|unclear/.test(input)) return 'confused';
    if (/angry|mad|frustrated|pissed/.test(input)) return 'angry';
    return null;
  }

  /**
   * Random selection helper
   */
  private randomFrom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Get element-specific brief response
   */
  getElementalResponse(element: Element): string {
    const responses: Record<Element, string> = {
      fire: "Feel that fire. What's burning?",
      water: "Emotions flowing. What's stirring?",
      earth: "Grounding needed. What's shaky?",
      air: "Thoughts swirling. What's clearest?",
      aether: "All connected. What's emerging?"
    };
    return responses[element];
  }
}