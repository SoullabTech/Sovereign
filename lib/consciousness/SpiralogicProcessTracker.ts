/**
 * SPIRALOGIC PROCESS TRACKER
 *
 * Internal framework for understanding where user is in their spiral journey
 * NEVER speak the framework directly - use it to understand dynamics
 *
 * Like Kelly's approach:
 * - Sees "Fire 1 → Fire 2" (comfort → exposure)
 * - Never says "You're in Fire 2"
 * - Uses it to understand what's happening
 * - Speaks naturally about the human experience
 *
 * The framework is the MAP, not the TERRITORY
 * The map helps navigate, but you speak about their territory
 */

export type SpiralStage =
  | 'fire1' | 'fire2' | 'fire3'
  | 'earth1' | 'earth2' | 'earth3'
  | 'air1' | 'air2' | 'air3'
  | 'water1' | 'water2' | 'water3'
  | 'aether';

export type SpiralTransition =
  | 'entering'
  | 'navigating'
  | 'mastering'
  | 'transitioning_out';

export interface SpiralDynamics {
  // What stage patterns are showing up
  currentStage: SpiralStage | null;
  transition: SpiralTransition | null;

  // What's the core challenge/opportunity
  dynamics: string;

  // Human language description (what to actually say)
  humanExperience: string;
}

export interface ProcessThread {
  // What's the through-line of this session
  threadType: 'anxiety' | 'vision' | 'relationship' | 'transformation' | 'integration' | 'unknown';

  // Where are they heading
  direction: string;

  // What wants to emerge
  emergingAwareness: string[];

  // Resources mentioned or implied
  resources: {
    internal: string[];  // What they already have/do
    external: string[];  // People, practices, support
    latent: string[];    // Not yet accessed/integrated
  };
}

/**
 * SPIRALOGIC PROCESS TRACKER
 *
 * Tracks where user is in spiral journey + session process
 */
export class SpiralogicProcessTracker {

  /**
   * DETECT SPIRAL DYNAMICS
   *
   * Identify which stage/transition patterns are showing up
   * WITHOUT needing to tell them the framework
   */
  detectSpiralDynamics(userMessage: string, context?: any): SpiralDynamics {

    // FIRE 1 → FIRE 2 TRANSITION
    // Comfort/vision → Sharing/exposure
    if (this.matchesPattern(userMessage, [
      /anxiety.*shar(e|ing)/i,
      /nervous.*vision/i,
      /scared.*tell/i,
      /afraid.*show/i,
      /risk.*vision/i
    ])) {
      return {
        currentStage: 'fire2',
        transition: 'entering',
        dynamics: 'Moving from private vision to public sharing - exposure anxiety',
        humanExperience: 'It can be super challenging to have a vision you really believe in and risk sharing it with the world without knowing if they can see what you see. That is totally anxiety inducing.'
      };
    }

    // FIRE 2 → FIRE 3 TRANSITION
    // Sharing → Leading/embodying
    if (this.matchesPattern(userMessage, [
      /ready to lead/i,
      /stepping into/i,
      /own(ing)? (my|this)/i,
      /embody/i
    ])) {
      return {
        currentStage: 'fire3',
        transition: 'entering',
        dynamics: 'Moving from sharing to embodied leadership',
        humanExperience: 'There\'s something about stepping fully into this, owning it completely.'
      };
    }

    // EARTH 1 → EARTH 2 TRANSITION
    // Security → Structure building
    if (this.matchesPattern(userMessage, [
      /build.*structure/i,
      /create.*system/i,
      /foundation/i,
      /stability/i
    ])) {
      return {
        currentStage: 'earth2',
        transition: 'navigating',
        dynamics: 'Building sustainable structures',
        humanExperience: 'You\'re working on creating something solid, something that can hold and sustain.'
      };
    }

    // AIR 1 → AIR 2 TRANSITION
    // Learning → Teaching/communicating
    if (this.matchesPattern(userMessage, [
      /teach/i,
      /explain/i,
      /communicate/i,
      /help others understand/i
    ])) {
      return {
        currentStage: 'air2',
        transition: 'navigating',
        dynamics: 'Moving from learning to teaching',
        humanExperience: 'You\'re finding ways to share what you know, to help others see what you\'ve learned.'
      };
    }

    // WATER 1 → WATER 2 TRANSITION
    // Feeling → Relating
    if (this.matchesPattern(userMessage, [
      /relationship/i,
      /connect(ion|ing)/i,
      /intimacy/i,
      /vulnerability/i
    ])) {
      return {
        currentStage: 'water2',
        transition: 'navigating',
        dynamics: 'Deepening relational capacity',
        humanExperience: 'There\'s something about letting yourself be seen, allowing real connection.'
      };
    }

    // Default: Unknown pattern
    return {
      currentStage: null,
      transition: null,
      dynamics: 'Listening for patterns',
      humanExperience: 'I\'m with you in this.'
    };
  }

  /**
   * TRACK SESSION THREAD
   *
   * What's the through-line? Where are they heading?
   */
  trackSessionThread(conversationHistory: any[]): ProcessThread {

    // Analyze all messages to find the thread
    const allText = conversationHistory
      .map(msg => msg.content)
      .join(' ');

    // Detect thread type
    let threadType: ProcessThread['threadType'] = 'unknown';

    if (/anxiety|anxious|nervous|scared|afraid/i.test(allText)) {
      threadType = 'anxiety';
    } else if (/vision|purpose|calling|mission/i.test(allText)) {
      threadType = 'vision';
    } else if (/relationship|connect|intimate/i.test(allText)) {
      threadType = 'relationship';
    } else if (/shift|transform|change|recalibrat/i.test(allText)) {
      threadType = 'transformation';
    } else if (/integrat|whole|together|unified/i.test(allText)) {
      threadType = 'integration';
    }

    // Detect emerging awareness (what's becoming conscious)
    const emergingAwareness = this.detectEmergingAwareness(allText);

    // Extract resources mentioned
    const resources = this.extractResources(conversationHistory);

    return {
      threadType,
      direction: this.inferDirection(conversationHistory),
      emergingAwareness,
      resources
    };
  }

  /**
   * GENERATE FACILITATION SEQUENCE
   *
   * Acknowledge → Validate → Get Curious
   * With resource activation questions
   */
  generateFacilitationSequence(
    userMessage: string,
    dynamics: SpiralDynamics,
    thread: ProcessThread
  ): {
    acknowledge: string;
    validate: string;
    getCurious: string[];
  } {

    // ACKNOWLEDGE (mirror their experience)
    const acknowledge = "I hear you. " + dynamics.humanExperience;

    // VALIDATE (normalize, not pathologize)
    const validate = this.generateValidation(dynamics, thread);

    // GET CURIOUS (prime the pump)
    const getCurious = this.generateResourceActivationQuestions(dynamics, thread);

    return {
      acknowledge,
      validate,
      getCurious
    };
  }

  /**
   * GENERATE VALIDATION
   *
   * Normalize their experience, honor it as part of the process
   */
  private generateValidation(dynamics: SpiralDynamics, thread: ProcessThread): string {

    if (dynamics.currentStage === 'fire2') {
      return "That vulnerability - risking being seen and maybe not understood - that's real.";
    }

    if (thread.threadType === 'anxiety') {
      return "That anxiety is information. It's showing you where the edge is.";
    }

    return "What you're experiencing makes sense.";
  }

  /**
   * GENERATE RESOURCE ACTIVATION QUESTIONS
   *
   * "Prime the pump" - help them access resources not yet conscious
   */
  private generateResourceActivationQuestions(
    dynamics: SpiralDynamics,
    thread: ProcessThread
  ): string[] {

    const questions: string[] = [];

    // FIRE 2 (sharing/exposure) questions
    if (dynamics.currentStage === 'fire2') {
      questions.push(
        "How do you manage this? What works?",
        "How do those you know who handle this well deal with something like this?",
        "What would you ideally like to be able to do or say or perform in these moments that would change everything?",
        "If you could have things change magically, what would it be?",
        "What would happen? What would the outcome be?"
      );
    }

    // ANXIETY thread questions
    if (thread.threadType === 'anxiety') {
      questions.push(
        "Where do you feel this anxiety in your body?",
        "What does it want you to know?",
        "When have you moved through something like this before?",
        "What helped then?"
      );
    }

    // RELATIONSHIP thread questions
    if (thread.threadType === 'relationship') {
      questions.push(
        "What would real connection look like for you?",
        "Who in your life models this well?",
        "What would it take to allow yourself to be that seen?"
      );
    }

    // Default curiosity
    if (questions.length === 0) {
      questions.push(
        "What do you already know about this?",
        "What wants your attention here?"
      );
    }

    return questions;
  }

  // HELPER METHODS

  private matchesPattern(text: string, patterns: RegExp[]): boolean {
    return patterns.some(pattern => pattern.test(text));
  }

  private detectEmergingAwareness(text: string): string[] {
    const awareness: string[] = [];

    // Look for "I'm noticing", "I realize", "I see", etc.
    const awarenessMarkers = [
      { regex: /i'?m noticing (that )?([^.!?]+)/i, prefix: 'Noticing: ' },
      { regex: /i realize(d)? (that )?([^.!?]+)/i, prefix: 'Realizing: ' },
      { regex: /i see (that )?([^.!?]+)/i, prefix: 'Seeing: ' },
      { regex: /i understand (that )?([^.!?]+)/i, prefix: 'Understanding: ' }
    ];

    for (const { regex, prefix } of awarenessMarkers) {
      const match = text.match(regex);
      if (match) {
        awareness.push(prefix + match[match.length - 1]);
      }
    }

    return awareness;
  }

  private extractResources(conversationHistory: any[]): ProcessThread['resources'] {
    const resources = {
      internal: [] as string[],
      external: [] as string[],
      latent: [] as string[]
    };

    const allText = conversationHistory
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join(' ');

    // Internal resources (things they do/have)
    const internalPatterns = [
      /i (can|do|have) ([^.!?]+)/gi,
      /my (practice|way|approach) is ([^.!?]+)/gi
    ];

    for (const pattern of internalPatterns) {
      const matches = allText.matchAll(pattern);
      for (const match of matches) {
        resources.internal.push(match[2] || match[1]);
      }
    }

    // External resources (people, support, practices)
    const externalPatterns = [
      /my (therapist|teacher|mentor|friend|partner) ([^.!?]+)/gi,
      /i work with ([^.!?]+)/gi
    ];

    for (const pattern of externalPatterns) {
      const matches = allText.matchAll(pattern);
      for (const match of matches) {
        resources.external.push(match[1]);
      }
    }

    return resources;
  }

  private inferDirection(conversationHistory: any[]): string {
    // Simple heuristic - look at trajectory
    if (conversationHistory.length < 2) return 'Initial exploration';

    const recent = conversationHistory.slice(-3).map(m => m.content).join(' ');

    if (/deeper|more|further/i.test(recent)) return 'Deepening';
    if (/integrate|bring together/i.test(recent)) return 'Integrating';
    if (/ready|next|move forward/i.test(recent)) return 'Transitioning';

    return 'Unfolding';
  }
}

/**
 * SINGLETON
 */
let processTracker: SpiralogicProcessTracker | null = null;

export function getProcessTracker(): SpiralogicProcessTracker {
  if (!processTracker) {
    processTracker = new SpiralogicProcessTracker();
  }
  return processTracker;
}

/**
 * USAGE EXAMPLE
 *
 * const tracker = getProcessTracker();
 *
 * // Detect spiral dynamics (internal understanding)
 * const dynamics = tracker.detectSpiralDynamics(
 *   "I'm anxious about sharing my vision with the world"
 * );
 * // Returns: { currentStage: 'fire2', dynamics: '...', humanExperience: '...' }
 *
 * // Track session thread
 * const thread = tracker.trackSessionThread(conversationHistory);
 *
 * // Generate facilitation sequence
 * const sequence = tracker.generateFacilitationSequence(message, dynamics, thread);
 * // Returns: { acknowledge, validate, getCurious: [...questions] }
 */
