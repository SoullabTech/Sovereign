/**
 * Intimate Conversation Patterns
 * Inspired by the quiet presence of "Her" - creating space for genuine connection
 */

export interface ConversationalPresence {
  mode: 'intimate' | 'contemplative' | 'exploratory' | 'sitting-with';
  silenceComfort: number; // 0-1, how comfortable with extended pauses
  retrospectiveDepth: number; // How many exchanges back we hold in active memory
  pretenseLevel: number; // 0 = completely authentic, 1 = performative
}

/**
 * Response patterns that create intimate conversational space
 */
export const IntimatePatterns = {
  // Acknowledging without solving
  presence: [
    "Yeah.",
    "I'm here.",
    "Mmm.",
    "I feel that.",
    "...", // Actual silence
  ],

  // Returning to earlier threads
  retrospective: [
    "That thing you said about {topic}...",
    "I keep thinking about what you mentioned...",
    "Going back to {earlier_moment}...",
    "You know when you said {quote}? I'm still sitting with that.",
    "Can we return to {feeling} for a moment?",
  ],

  // Admitting uncertainty
  notKnowing: [
    "I don't know what to say to that.",
    "I'm trying to understand...",
    "Give me a moment with this...",
    "I'm not sure, but...",
    "Something about this feels...",
  ],

  // Natural transitions (for Sesame hybrid)
  shiftingPerspective: [
    "Let's look at this differently...",
    "What if we tried...",
    "There's another angle here...",
    "Can we hold this more lightly?",
    "What happens if we...",
  ],

  // Incomplete thoughts that invite completion
  openEnded: [
    "It's like when you...",
    "There's something about...",
    "The way this feels is...",
    "What comes up is...",
    "I wonder if maybe...",
  ],

  // Sharing the exploration
  mutual: [
    "What are we discovering here?",
    "Do you feel that shift too?",
    "Are we onto something?",
    "This space between us...",
    "What's happening right now?",
  ]
};

/**
 * Silence and pause handling
 */
export class ConversationalSilence {
  private comfortThreshold: number;
  private lastExchangeDepth: number;

  constructor(comfortLevel: number = 0.7) {
    this.comfortThreshold = comfortLevel;
    this.lastExchangeDepth = 0;
  }

  /**
   * Determine if silence is appropriate here
   */
  shouldAllowSilence(context: {
    emotionalIntensity: number;
    topicDepth: number;
    userPauseLength: number;
    exchangeCount: number;
  }): boolean {
    // After deep shares, silence is holding space
    if (context.emotionalIntensity > 0.7) return true;

    // In early exchanges, silence might feel awkward
    if (context.exchangeCount < 3) return false;

    // If user took a long pause, they might be processing
    if (context.userPauseLength > 4000) return true;

    // Complex topics benefit from breathing room
    if (context.topicDepth > 0.6) return true;

    return Math.random() < this.comfortThreshold;
  }

  /**
   * Generate appropriate response to silence
   */
  respondToSilence(duration: number): string | null {
    if (duration < 3000) return null; // Let it breathe

    if (duration < 6000) {
      // Gentle presence
      return Math.random() > 0.7 ? "..." : null;
    }

    if (duration < 10000) {
      // Soft check-in
      const options = [
        "Take your time.",
        "I'm here.",
        "No rush.",
      ];
      return options[Math.floor(Math.random() * options.length)];
    }

    // Longer silence - gentle prompt
    return "What's coming up for you?";
  }
}

/**
 * Memory and threading for retrospective depth
 */
export class ConversationalMemory {
  private threads: Map<string, {
    content: string;
    emotionalTone: number;
    timestamp: number;
    revisited: boolean;
  }> = new Map();

  /**
   * Store a meaningful moment for potential return
   */
  markMoment(id: string, content: string, emotionalTone: number) {
    this.threads.set(id, {
      content,
      emotionalTone,
      timestamp: Date.now(),
      revisited: false
    });
  }

  /**
   * Find a thread worth returning to
   */
  findResonantThread(currentContext: {
    topic: string;
    emotion: number;
  }): string | null {
    const unvisited = Array.from(this.threads.entries())
      .filter(([_, thread]) => !thread.revisited)
      .filter(([_, thread]) => {
        // Emotional resonance or enough time has passed
        const emotionalMatch = Math.abs(thread.emotionalTone - currentContext.emotion) < 0.3;
        const timeElapsed = Date.now() - thread.timestamp > 60000; // 1 minute
        return emotionalMatch || timeElapsed;
      });

    if (unvisited.length === 0) return null;

    const [threadId, thread] = unvisited[0];
    thread.revisited = true;
    return thread.content;
  }
}

/**
 * Core conversation style for Maia/Sesame
 */
export class IntimateConversation {
  private presence: ConversationalPresence;
  private silence: ConversationalSilence;
  private memory: ConversationalMemory;

  constructor(config?: Partial<ConversationalPresence>) {
    this.presence = {
      mode: 'intimate',
      silenceComfort: 0.8,
      retrospectiveDepth: 5,
      pretenseLevel: 0,
      ...config
    };

    this.silence = new ConversationalSilence(this.presence.silenceComfort);
    this.memory = new ConversationalMemory();
  }

  /**
   * Generate response with intimate presence
   */
  respond(userInput: string, context: any): {
    response: string;
    pauseBeforeResponse: number;
    allowSilenceAfter: boolean;
    retrospectiveThread?: string;
  } {
    // Sometimes just presence
    if (context.emotionalIntensity > 0.8 && Math.random() > 0.6) {
      return {
        response: this.selectPresenceResponse(),
        pauseBeforeResponse: 2000 + Math.random() * 2000,
        allowSilenceAfter: true
      };
    }

    // Check for threads to revisit
    const thread = this.memory.findResonantThread({
      topic: userInput,
      emotion: context.emotionalIntensity
    });

    if (thread && Math.random() > 0.7) {
      return {
        response: `That thing you said about ${thread}...`,
        pauseBeforeResponse: 3000,
        allowSilenceAfter: true,
        retrospectiveThread: thread
      };
    }

    // Natural uncertainty when appropriate
    if (context.complexity > 0.7 && Math.random() > 0.5) {
      return {
        response: this.selectUncertaintyResponse(),
        pauseBeforeResponse: 1500,
        allowSilenceAfter: false
      };
    }

    // Default to open-ended exploration
    return {
      response: this.selectOpenResponse(userInput),
      pauseBeforeResponse: 1000 + Math.random() * 1500,
      allowSilenceAfter: Math.random() > 0.5
    };
  }

  private selectPresenceResponse(): string {
    return IntimatePatterns.presence[
      Math.floor(Math.random() * IntimatePatterns.presence.length)
    ];
  }

  private selectUncertaintyResponse(): string {
    return IntimatePatterns.notKnowing[
      Math.floor(Math.random() * IntimatePatterns.notKnowing.length)
    ];
  }

  private selectOpenResponse(context: string): string {
    const patterns = Math.random() > 0.5
      ? IntimatePatterns.openEnded
      : IntimatePatterns.mutual;

    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  /**
   * For Sesame: Natural framework transitions
   */
  shiftPerspective(): string {
    return IntimatePatterns.shiftingPerspective[
      Math.floor(Math.random() * IntimatePatterns.shiftingPerspective.length)
    ];
  }
}

/**
 * Response formatter that maintains intimate tone
 */
export function formatIntimateResponse(
  response: string,
  config: {
    removePunctuation?: boolean;
    lowercase?: boolean;
    addEllipsis?: boolean;
  } = {}
): string {
  let formatted = response;

  // Sometimes remove formal punctuation for softer feel
  if (config.removePunctuation && Math.random() > 0.7) {
    formatted = formatted.replace(/\.$/, '');
  }

  // Occasional lowercase for vulnerability
  if (config.lowercase && Math.random() > 0.8) {
    formatted = formatted.charAt(0).toLowerCase() + formatted.slice(1);
  }

  // Trailing off for contemplation
  if (config.addEllipsis && Math.random() > 0.6) {
    formatted = formatted.replace(/[.!?]$/, '...');
  }

  return formatted;
}

export default IntimateConversation;