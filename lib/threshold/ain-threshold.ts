/**
 * AIN Threshold Mode
 *
 * Collective attending before committee deliberation.
 * Prevents "role-grab" and "frame-lock" by ensuring the committee
 * meets the input as a whole before analysis.
 *
 * Based on McGilchrist's hemispheric theory:
 * - Threshold (right hemisphere) → leads, sets context
 * - Deliberation (left hemisphere) → serves, analyzes
 * - Synthesis (right hemisphere) → receives back, integrates
 */

import {
  AINThresholdState,
  AINThresholdOutput,
  AINThresholdOutputType,
  AINSensingContribution,
  AINFrameOption,
  AINDisconfirmationPass,
  AINThresholdChannel,
  AINReturnToThresholdReason,
  createAINThresholdState,
} from './schemas';

import {
  AIN_SENSING_PROMPTS,
  AIN_DISCONFIRMATION_PROMPTS,
  AIN_RETURN_ANNOUNCEMENTS,
  randomPhrase,
  AIN_FRAME_HUMILITY_PHRASES,
} from './prompts';

// =============================================================================
// THRESHOLD ENTRY TRIGGERS
// =============================================================================

/**
 * Patterns that suggest complex, multi-perspective input
 */
const COMPLEXITY_PATTERNS = [
  /should (i|we)/i,               // Decision questions
  /what (do you|should)/i,        // Advice seeking
  /help me (understand|decide)/i, // Understanding requests
  /on one hand.*on the other/i,   // Explicit ambivalence
  /i('m| am) (torn|conflicted)/i, // Internal conflict
  /pros and cons/i,               // Analysis request
];

/**
 * Patterns that suggest high-stakes context
 */
const HIGH_STAKES_PATTERNS = [
  /career|job|work|quit/i,
  /relationship|marriage|divorce/i,
  /health|diagnosis|treatment/i,
  /money|investment|debt/i,
  /family|children|parents/i,
  /ethics|moral|right thing/i,
];

/**
 * Detect if input should trigger AIN Threshold
 */
export function detectAINThresholdTrigger(input: string): boolean {
  // Check complexity patterns
  if (COMPLEXITY_PATTERNS.some(p => p.test(input))) {
    return true;
  }

  // Check high-stakes patterns
  if (HIGH_STAKES_PATTERNS.some(p => p.test(input))) {
    return true;
  }

  // Check input length (longer inputs often need threshold)
  if (input.length > 200) {
    return true;
  }

  // Check for multiple questions
  const questionCount = (input.match(/\?/g) || []).length;
  if (questionCount > 1) {
    return true;
  }

  return false;
}

// =============================================================================
// COLLECTIVE SENSING
// =============================================================================

/**
 * Generate sensing contributions for an input
 * In a full implementation, each agent would contribute independently.
 * This provides a template for synchronous or async collection.
 */
export function generateSensingPrompts(input: string): Record<AINThresholdChannel, string> {
  return {
    texture: `${AIN_SENSING_PROMPTS.texture}\n\nInput: "${input}"`,
    context: `${AIN_SENSING_PROMPTS.context}\n\nInput: "${input}"`,
    unknowns: `${AIN_SENSING_PROMPTS.unknowns}\n\nInput: "${input}"`,
    aim: `${AIN_SENSING_PROMPTS.aim}\n\nInput: "${input}"`,
  };
}

/**
 * Aggregate sensing contributions into emerging patterns
 */
export function aggregateSensing(
  contributions: AINSensingContribution[]
): {
  textures: string[];
  contexts: string[];
  unknowns: string[];
  aims: string[];
  convergence: number;
} {
  const textures = contributions
    .filter(c => c.channel === 'texture')
    .map(c => c.observation);

  const contexts = contributions
    .filter(c => c.channel === 'context')
    .map(c => c.observation);

  const unknowns = contributions
    .filter(c => c.channel === 'unknowns')
    .map(c => c.observation);

  const aims = contributions
    .filter(c => c.channel === 'aim')
    .map(c => c.observation);

  // Calculate convergence (how aligned are the aims?)
  // In a real implementation, this would use semantic similarity
  const convergence = aims.length > 0 ? Math.min(aims.length / 4, 1) : 0;

  return { textures, contexts, unknowns, aims, convergence };
}

// =============================================================================
// DISCONFIRMATION
// =============================================================================

/**
 * Generate disconfirmation prompts for a proposed frame
 */
export function generateDisconfirmationPrompts(frame: string): {
  frameWrongIf: string;
  charitableAlternative: string;
  blindSpots: string;
} {
  return {
    frameWrongIf: `${AIN_DISCONFIRMATION_PROMPTS.frameWrongIf}\n\nProposed frame: "${frame}"`,
    charitableAlternative: `${AIN_DISCONFIRMATION_PROMPTS.charitableAlternative}\n\nProposed frame: "${frame}"`,
    blindSpots: `${AIN_DISCONFIRMATION_PROMPTS.blindSpots}\n\nProposed frame: "${frame}"`,
  };
}

/**
 * Evaluate disconfirmation pass result
 * Frame passes if it survives scrutiny with reasonable answers
 */
export function evaluateDisconfirmation(
  pass: Omit<AINDisconfirmationPass, 'passed'>
): AINDisconfirmationPass {
  // Frame passes if:
  // 1. There's a clear "wrong if" condition (shows bounded confidence)
  // 2. A charitable alternative was articulated (shows intellectual humility)
  // 3. Blind spots were acknowledged (shows role awareness)

  const hasWrongIf = pass.frameWrongIf.length > 20;
  const hasAlternative = pass.charitableAlternative.length > 20;
  const hasBlindSpots = pass.blindSpots.length > 20;

  const passed = hasWrongIf && hasAlternative && hasBlindSpots;

  return { ...pass, passed };
}

// =============================================================================
// OUTPUT GENERATION
// =============================================================================

/**
 * Generate EMERGENT_QUESTION output
 */
export function generateEmergentQuestion(
  question: string,
  contributions: AINSensingContribution[],
  disconfirmation?: AINDisconfirmationPass
): AINThresholdOutput {
  return {
    type: 'EMERGENT_QUESTION',
    question,
    sensingContributions: contributions,
    disconfirmation,
  };
}

/**
 * Generate FRAME_OPTIONS output
 */
export function generateFrameOptions(
  frames: AINFrameOption[],
  contributions: AINSensingContribution[]
): AINThresholdOutput {
  return {
    type: 'FRAME_OPTIONS',
    frames: frames.slice(0, 3), // Max 3 frames
    sensingContributions: contributions,
  };
}

/**
 * Generate STAY_IN_THRESHOLD output
 */
export function generateStayInThreshold(
  reason: string,
  contributions: AINSensingContribution[]
): AINThresholdOutput {
  return {
    type: 'STAY_IN_THRESHOLD',
    reason,
    sensingContributions: contributions,
  };
}

/**
 * Generate ROLE_ACTIVATION_PLAN output
 */
export function generateRoleActivationPlan(
  primaryAgents: string[],
  supportAgents: string[],
  frame: string,
  question: string,
  contributions: AINSensingContribution[],
  disconfirmation: AINDisconfirmationPass
): AINThresholdOutput {
  return {
    type: 'ROLE_ACTIVATION_PLAN',
    activationPlan: {
      primaryAgents,
      supportAgents,
      frame,
      question,
    },
    sensingContributions: contributions,
    disconfirmation,
  };
}

// =============================================================================
// RETURN TO THRESHOLD
// =============================================================================

/**
 * Detect if deliberation should return to Threshold
 */
export function detectReturnToThreshold(
  deliberationState: {
    turnsSinceStart: number;
    agentAgreement: number; // 0-1, how aligned are agents
    confidenceLevel: number; // 0-1, average confidence
    frameChanges: number; // How many times frame shifted
    userFeedback?: 'positive' | 'negative' | 'confused';
  }
): AINReturnToThresholdReason | null {
  // Frame lock: low agreement + high confidence = stuck
  if (deliberationState.agentAgreement < 0.3 && deliberationState.confidenceLevel > 0.7) {
    return 'frame_lock';
  }

  // Certainty inflation: very high confidence early in deliberation
  if (deliberationState.turnsSinceStart < 3 && deliberationState.confidenceLevel > 0.9) {
    return 'certainty_inflation';
  }

  // Whole lost: many frame changes suggests fragmentation
  if (deliberationState.frameChanges > 3) {
    return 'whole_lost';
  }

  // User signal
  if (deliberationState.userFeedback === 'confused' || deliberationState.userFeedback === 'negative') {
    return 'user_signal';
  }

  return null;
}

/**
 * Handle return to Threshold during deliberation
 */
export function returnToThreshold(
  reason: AINReturnToThresholdReason,
  previousFrames: string[]
): {
  announcement: string;
  state: AINThresholdState;
} {
  const announcement = AIN_RETURN_ANNOUNCEMENTS[reason];
  const humilityNote = randomPhrase(AIN_FRAME_HUMILITY_PHRASES);

  return {
    announcement: `${announcement} ${humilityNote}`,
    state: {
      inThreshold: true,
      enteredAt: Date.now(),
      sensingRound: 0,
      contributions: [],
      returnReason: reason,
      previousFrames,
    },
  };
}

// =============================================================================
// MAIN ORCHESTRATION
// =============================================================================

export interface AINThresholdRoutingResult {
  /** Whether input triggered Threshold */
  useThreshold: boolean;

  /** New state if entering Threshold */
  state?: AINThresholdState;

  /** Output if ready to exit Threshold */
  output?: AINThresholdOutput;

  /** Routing time for instrumentation */
  routingTimeMs: number;
}

/**
 * Main entry point for AIN Threshold routing
 */
export function routeAINThreshold(
  input: string,
  currentState: AINThresholdState | null
): AINThresholdRoutingResult {
  const startTime = performance.now();

  // If already in Threshold, this is for advancing state
  // (In practice, sensing would be async with multiple agents)
  if (currentState?.inThreshold) {
    return {
      useThreshold: true,
      state: {
        ...currentState,
        sensingRound: currentState.sensingRound + 1,
      },
      routingTimeMs: performance.now() - startTime,
    };
  }

  // Check for Threshold trigger
  if (detectAINThresholdTrigger(input)) {
    return {
      useThreshold: true,
      state: createAINThresholdState(),
      routingTimeMs: performance.now() - startTime,
    };
  }

  // No trigger - pass through to direct deliberation
  return {
    useThreshold: false,
    routingTimeMs: performance.now() - startTime,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  createAINThresholdState,
  AINThresholdChannel,
  AINReturnToThresholdReason,
};
