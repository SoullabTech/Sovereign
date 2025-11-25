/**
 * Bardic Invocations - Natural Language Triggers
 *
 * Detects when users invoke bardic memory functions through poetic language
 *
 * @module lib/bardic/invocations
 */

export interface BardicInvocation {
  type: 'fire' | 'thread' | 'recall' | 'virtue' | 'sacred';
  trigger: string;
  confidence: number;
  params?: any;
}

// ============================================================================
// INVOCATION PATTERNS
// ============================================================================

const FIRE_PATTERNS = [
  /let the bard[s']? speak/i,
  /what wants to emerge/i,
  /what'?s? pulling me forward/i,
  /what'?s? becoming clearer/i,
  /show me what'?s? crystallizing/i,
  /fire query/i,
  /invoke fire/i,
];

const THREAD_PATTERNS = [
  /show me the thread/i,
  /reveal the thread/i,
  /weave the thread/i,
  /air query/i,
  /narrative thread/i,
  /show connections/i,
  /how does this connect/i,
];

const RECALL_PATTERNS = [
  /remember when/i,
  /recall .+ moment/i,
  /take me back to/i,
  /re-enter .+ memory/i,
  /revisit .+ conversation/i,
];

const VIRTUE_PATTERNS = [
  /show my practice/i,
  /virtue ledger/i,
  /what am i cultivating/i,
  /microact/i,
  /earth query/i,
  /show my growth/i,
];

const SACRED_PATTERNS = [
  /witness this/i,
  /hold this sacred/i,
  /sacred moment/i,
  /don'?t analyze/i,
  /just witness/i,
];

// ============================================================================
// DETECTION
// ============================================================================

/**
 * Detect if user message contains a bardic invocation
 */
export function detectInvocation(message: string): BardicInvocation | null {
  const lowerMessage = message.toLowerCase();

  // Check Fire Query
  for (const pattern of FIRE_PATTERNS) {
    if (pattern.test(message)) {
      return {
        type: 'fire',
        trigger: message.match(pattern)?.[0] || 'fire query',
        confidence: 0.95,
      };
    }
  }

  // Check Thread/Air Query
  for (const pattern of THREAD_PATTERNS) {
    if (pattern.test(message)) {
      return {
        type: 'thread',
        trigger: message.match(pattern)?.[0] || 'show thread',
        confidence: 0.9,
      };
    }
  }

  // Check Recall
  for (const pattern of RECALL_PATTERNS) {
    if (pattern.test(message)) {
      return {
        type: 'recall',
        trigger: message.match(pattern)?.[0] || 'recall',
        confidence: 0.85,
        params: {
          searchQuery: extractRecallQuery(message),
        },
      };
    }
  }

  // Check Virtue Ledger
  for (const pattern of VIRTUE_PATTERNS) {
    if (pattern.test(message)) {
      return {
        type: 'virtue',
        trigger: message.match(pattern)?.[0] || 'virtue query',
        confidence: 0.9,
      };
    }
  }

  // Check Sacred
  for (const pattern of SACRED_PATTERNS) {
    if (pattern.test(message)) {
      return {
        type: 'sacred',
        trigger: message.match(pattern)?.[0] || 'sacred witness',
        confidence: 0.95,
      };
    }
  }

  return null;
}

/**
 * Extract search query from recall invocation
 */
function extractRecallQuery(message: string): string {
  const patterns = [
    /remember when (.+)/i,
    /recall .+ (moment|conversation|time) about (.+)/i,
    /take me back to (.+)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      return match[1] || match[2] || message;
    }
  }

  return message;
}

// ============================================================================
// RESPONSE TEMPLATES
// ============================================================================

export const INVOCATION_RESPONSES = {
  fire: [
    "The Bard speaks. I'm sensing into what wants to emerge...",
    "Opening the Fire gate. What seeks to crystallize from the field?",
    "Invoking Right PFC cognition - querying future pressures...",
  ],
  thread: [
    "Weaving the narrative threads. Let me trace the connections...",
    "Air query activated. I'll show you how this moment relates...",
    "Drawing the thread through your story...",
  ],
  recall: [
    "Entering the bardic archive. Searching for resonance...",
    "Re-entering that moment. Let me prepare the portal...",
    "Detecting morphic resonance across your timeline...",
  ],
  virtue: [
    "Opening the Earth ledger. Here's what you've been cultivating...",
    "The slow accrual of character. Let me show your practice...",
    "Virtue ledger summoned. These are the seeds you've planted...",
  ],
  sacred: [
    "Witnessed. I'll hold this without analysis.",
    "Sacred space held. This moment is yours alone.",
    "Held in reverence. No interpretation, only presence.",
  ],
};

/**
 * Get a random response for an invocation type
 */
export function getInvocationResponse(type: BardicInvocation['type']): string {
  const responses = INVOCATION_RESPONSES[type];
  return responses[Math.floor(Math.random() * responses.length)];
}

// ============================================================================
// UI TRIGGERS
// ============================================================================

export interface UITrigger {
  component: 'FireQueryInterface' | 'BardicDrawer' | 'VirtueLedger' | 'SacredWitness';
  props?: any;
}

/**
 * Map invocation to UI component trigger
 */
export function getUITrigger(invocation: BardicInvocation): UITrigger | null {
  switch (invocation.type) {
    case 'fire':
      return {
        component: 'FireQueryInterface',
      };

    case 'thread':
      return {
        component: 'BardicDrawer',
        props: {
          // Will need current episode ID
        },
      };

    case 'virtue':
      return {
        component: 'VirtueLedger',
      };

    case 'sacred':
      return {
        component: 'SacredWitness',
        props: {
          message: invocation.params?.message,
        },
      };

    default:
      return null;
  }
}

// ============================================================================
// INTEGRATION HELPER
// ============================================================================

export interface BardicResponse {
  shouldInvoke: boolean;
  invocation?: BardicInvocation;
  responseText?: string;
  uiTrigger?: UITrigger;
}

/**
 * Process a message and check for bardic invocations
 * Call this in your chat route before generating MAIA's response
 */
export function processBardicInvocation(message: string): BardicResponse {
  const invocation = detectInvocation(message);

  if (!invocation) {
    return { shouldInvoke: false };
  }

  return {
    shouldInvoke: true,
    invocation,
    responseText: getInvocationResponse(invocation.type),
    uiTrigger: getUITrigger(invocation),
  };
}
