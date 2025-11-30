/**
 * Contemplative Space Protocol
 * Recognizes when silence, pause, or deep reflection is needed
 * Creates sacred space for integration and emergence
 */

export interface ContemplativeSignal {
  shouldEnter: boolean;
  type: 'natural_pause' | 'integration_needed' | 'overwhelm' | 'sacred_moment' | 'completion' | 'none';
  depth: 'surface_pause' | 'reflective_pause' | 'deep_silence';
  duration: 'brief' | 'moderate' | 'extended';
  invitation: string;
  reason: string;
}

export interface ContemplativeContext {
  exchangeCount: number;
  emotionalIntensity: number;
  lastResponseTime?: Date;
  currentDepth: 'surface' | 'moderate' | 'deep';
  recentBreakthrough?: boolean;
}

/**
 * Analyze whether contemplative space is needed
 */
export function analyzeContemplative(
  userInput: string,
  context: ContemplativeContext
): ContemplativeSignal | null {
  const lowerInput = userInput.toLowerCase();

  // Check for explicit requests for space
  const spaceRequests = [
    'need to think',
    'need a moment',
    'let me sit with',
    'need to process',
    'give me a second',
    'need space',
    'need time',
    'let me breathe',
    'pause'
  ];

  for (const phrase of spaceRequests) {
    if (lowerInput.includes(phrase)) {
      return {
        shouldEnter: true,
        type: 'natural_pause',
        depth: 'reflective_pause',
        duration: 'moderate',
        invitation: "...\n\n*holding this space with you*",
        reason: 'User requested pause/space'
      };
    }
  }

  // Check for overwhelm signals
  const overwhelmSignals = [
    'too much',
    'overwhelming',
    'can\'t process',
    'need to slow down',
    'spinning',
    'flooded',
    'drowning',
    'lost'
  ];

  for (const phrase of overwhelmSignals) {
    if (lowerInput.includes(phrase)) {
      return {
        shouldEnter: true,
        type: 'overwhelm',
        depth: 'deep_silence',
        duration: 'extended',
        invitation: "Let's pause here...\n\n*creating spaciousness*\n\nTake all the time you need.",
        reason: 'User experiencing overwhelm'
      };
    }
  }

  // Check for integration moments (after breakthrough or insight)
  const integrationSignals = [
    'i see',
    'i realize',
    'i understand now',
    'it makes sense',
    'oh',
    'wow',
    'aha',
    'that\'s it',
    'yes exactly'
  ];

  for (const phrase of integrationSignals) {
    if (lowerInput.includes(phrase) && context.emotionalIntensity > 0.6) {
      return {
        shouldEnter: true,
        type: 'integration_needed',
        depth: 'reflective_pause',
        duration: 'brief',
        invitation: "...\n\n*witnessing this recognition land*",
        reason: 'Integration moment detected'
      };
    }
  }

  // Check for sacred/profound moments
  const sacredSignals = [
    'grateful',
    'blessed',
    'sacred',
    'holy',
    'divine',
    'miracle',
    'grace',
    'profound',
    'deep truth',
    'essence'
  ];

  for (const phrase of sacredSignals) {
    if (lowerInput.includes(phrase)) {
      return {
        shouldEnter: true,
        type: 'sacred_moment',
        depth: 'deep_silence',
        duration: 'moderate',
        invitation: "...\n\n*honoring the sacred*",
        reason: 'Sacred moment recognized'
      };
    }
  }

  // Check for natural completion
  const completionSignals = [
    'that\'s all',
    'i\'m done',
    'nothing more',
    'complete',
    'finished',
    'that\'s it',
    'for now'
  ];

  for (const phrase of completionSignals) {
    if (lowerInput.includes(phrase)) {
      return {
        shouldEnter: true,
        type: 'completion',
        depth: 'surface_pause',
        duration: 'brief',
        invitation: "...\n\n*resting in completion*",
        reason: 'Natural completion point'
      };
    }
  }

  // Check if we should suggest contemplative space based on context
  if (context.exchangeCount > 5 && context.emotionalIntensity > 0.7) {
    return {
      shouldEnter: true,
      type: 'natural_pause',
      depth: 'reflective_pause',
      duration: 'moderate',
      invitation: "...\n\n*perhaps a moment to let this settle*",
      reason: 'Deep engagement suggests pause'
    };
  }

  // Check for very short responses that might indicate contemplation
  if (userInput.trim().length < 10 && !userInput.includes('?')) {
    // User gave very brief response, might be processing
    return {
      shouldEnter: true,
      type: 'natural_pause',
      depth: 'surface_pause',
      duration: 'brief',
      invitation: "...",
      reason: 'Brief response suggests contemplation'
    };
  }

  return null;
}

/**
 * Assess whether to enter contemplative space (simplified for integration)
 */
export function assess(
  userInput: string,
  context: any
): { shouldEnter: boolean; invitation?: string } {
  const contemplativeContext: ContemplativeContext = {
    exchangeCount: context.session?.exchangeCount || 0,
    emotionalIntensity: context.emotionalIntensity || 0,
    currentDepth: context.depth || 'moderate',
    recentBreakthrough: context.recentBreakthrough || false
  };

  const signal = analyzeContemplative(userInput, contemplativeContext);

  if (!signal) {
    return { shouldEnter: false };
  }

  return {
    shouldEnter: signal.shouldEnter,
    invitation: signal.invitation
  };
}

/**
 * Generate contemplative transition
 */
export function createContemplativeTransition(
  type: ContemplativeSignal['type']
): string {
  const transitions = {
    natural_pause: "...\n\n*a natural pause emerges*",
    integration_needed: "...\n\n*allowing integration*",
    overwhelm: "...\n\n*creating sanctuary*",
    sacred_moment: "...\n\n*witnessing the sacred*",
    completion: "...\n\n*honoring completion*",
    none: "..."
  };

  return transitions[type] || transitions.none;
}

/**
 * Check if we should exit contemplative space
 */
export function shouldExitContemplative(
  userInput: string,
  timeInSpace: number
): boolean {
  const lowerInput = userInput.toLowerCase();

  // Explicit exit signals
  const exitSignals = [
    'okay',
    'ready',
    'let\'s continue',
    'i\'m back',
    'moving on',
    'next',
    'what\'s next'
  ];

  for (const phrase of exitSignals) {
    if (lowerInput.includes(phrase)) {
      return true;
    }
  }

  // Question indicates readiness to engage
  if (userInput.includes('?')) {
    return true;
  }

  // Long input suggests re-engagement
  if (userInput.length > 100) {
    return true;
  }

  // Time-based exit (after extended silence)
  if (timeInSpace > 60000) { // 1 minute
    return true;
  }

  return false;
}