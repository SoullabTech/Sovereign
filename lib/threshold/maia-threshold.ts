/**
 * MAIA Threshold Layer
 *
 * Fast-path routing for presence responses that skip LLM latency.
 * Implements Crowder's precategorical holding - experience before interpretation.
 *
 * CRITICAL FOR VOICE LATENCY:
 * This module provides instant responses for Threshold moments,
 * enabling time-to-first-audio under 100ms (vs 300-1000ms with LLM).
 */

import {
  MAIAThresholdState,
  MAIAThresholdResponse,
  MAIAThresholdResponseType,
  MAIAThresholdTrigger,
  MAIAThresholdExit,
  createMAIAThresholdState,
  detectMAIAThresholdTrigger,
  detectMAIAThresholdExit,
} from './schemas';

import {
  getHoldResponse,
  getInviteResponse,
  getForkResponse,
  getTransitionResponse,
  getProtectionResponse,
} from './prompts';

// =============================================================================
// THRESHOLD ROUTING RESULT
// =============================================================================

export interface ThresholdRoutingResult {
  /** Whether to use Threshold fast-path (skip LLM) */
  useThreshold: boolean;

  /** The response if using Threshold (ready for TTS) */
  response?: MAIAThresholdResponse;

  /** Updated Threshold state */
  state: MAIAThresholdState | null;

  /** Timing for instrumentation */
  routingTimeMs: number;
}

// =============================================================================
// MAIN ROUTING FUNCTION
// =============================================================================

/**
 * Route input through Threshold fast-path or to LLM.
 *
 * This is the main entry point for voice pipeline integration.
 * Call BEFORE sending to Claude to potentially skip LLM entirely.
 *
 * @param input - User's message text
 * @param currentState - Current Threshold state (null if not in Threshold)
 * @returns Routing result with response or pass-through decision
 */
export function routeThreshold(
  input: string,
  currentState: MAIAThresholdState | null
): ThresholdRoutingResult {
  const startTime = performance.now();

  // If already in Threshold, check for exit
  if (currentState?.inThreshold) {
    return routeWhileInThreshold(input, currentState, startTime);
  }

  // Not in Threshold - check for entry trigger
  const trigger = detectMAIAThresholdTrigger(input);

  if (trigger) {
    // Enter Threshold with immediate presence response
    const state = createMAIAThresholdState(trigger);
    const response = generateEntryResponse(trigger, input);

    return {
      useThreshold: true,
      response,
      state,
      routingTimeMs: performance.now() - startTime,
    };
  }

  // No trigger detected - pass through to LLM
  return {
    useThreshold: false,
    state: null,
    routingTimeMs: performance.now() - startTime,
  };
}

// =============================================================================
// INTERNAL ROUTING HELPERS
// =============================================================================

/**
 * Route when already in Threshold mode
 */
function routeWhileInThreshold(
  input: string,
  state: MAIAThresholdState,
  startTime: number
): ThresholdRoutingResult {
  // Check for exit condition
  const exitReason = detectMAIAThresholdExit(input);

  if (exitReason) {
    // Exit Threshold with transition response
    const response = generateExitResponse(exitReason);
    const updatedState: MAIAThresholdState = {
      ...state,
      inThreshold: false,
      exitReason,
    };

    return {
      useThreshold: true,
      response,
      state: updatedState,
      routingTimeMs: performance.now() - startTime,
    };
  }

  // Still in Threshold - generate continuation response
  const turnCount = state.turnCount + 1;
  const response = generateContinuationResponse(turnCount, input);
  const updatedState: MAIAThresholdState = {
    ...state,
    turnCount,
  };

  return {
    useThreshold: true,
    response,
    state: updatedState,
    routingTimeMs: performance.now() - startTime,
  };
}

// =============================================================================
// RESPONSE GENERATORS
// =============================================================================

/**
 * Generate response when entering Threshold
 */
function generateEntryResponse(
  trigger: MAIAThresholdTrigger,
  input: string
): MAIAThresholdResponse {
  // Check if user mentioned a feeling/sensation
  const hasFeelingWords = /feel|sense|notice|something|weight|heavy|tight|warm|cold/i.test(input);

  switch (trigger) {
    case 'felt_sense':
      return {
        type: 'HOLD',
        text: getHoldResponse(true),
        continueThreshold: true,
      };

    case 'high_stakes':
      return {
        type: 'HOLD',
        text: getHoldResponse(false),
        continueThreshold: true,
      };

    case 'too_fast_meaning':
      return {
        type: 'HOLD',
        text: getProtectionResponse(),
        continueThreshold: true,
      };

    case 'explicit_request':
      return {
        type: 'HOLD',
        text: getHoldResponse(false),
        continueThreshold: true,
      };

    case 'session_start':
      return {
        type: 'HOLD',
        text: "I'm here with you.",
        continueThreshold: true,
      };

    default:
      return {
        type: 'HOLD',
        text: getHoldResponse(hasFeelingWords),
        continueThreshold: true,
      };
  }
}

/**
 * Generate response while continuing in Threshold
 */
function generateContinuationResponse(
  turnCount: number,
  input: string
): MAIAThresholdResponse {
  const hasFeelingWords = /feel|sense|notice|something|weight|heavy|tight|warm|cold/i.test(input);

  // Vary response type based on turn count
  if (turnCount <= 2) {
    // Early turns: pure presence
    return {
      type: 'HOLD',
      text: getHoldResponse(hasFeelingWords),
      continueThreshold: true,
    };
  }

  if (turnCount <= 4) {
    // Middle turns: gentle invitation
    return {
      type: 'INVITE',
      text: getInviteResponse(),
      continueThreshold: true,
    };
  }

  // Later turns: offer fork
  return {
    type: 'FORK',
    text: getForkResponse(),
    continueThreshold: true,
  };
}

/**
 * Generate response when exiting Threshold
 */
function generateExitResponse(exitReason: MAIAThresholdExit): MAIAThresholdResponse {
  switch (exitReason) {
    case 'user_symbolizes':
    case 'interpretation_request':
    case 'explicit_request':
      return {
        type: 'TRANSITION',
        text: getTransitionResponse(),
        continueThreshold: false,
        exitReason,
      };

    case 'stabilization':
    case 'time_natural':
      return {
        type: 'TRANSITION',
        text: "Let's look at this together.",
        continueThreshold: false,
        exitReason,
      };

    default:
      return {
        type: 'TRANSITION',
        text: getTransitionResponse(),
        continueThreshold: false,
        exitReason,
      };
  }
}

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

export {
  createMAIAThresholdState,
  detectMAIAThresholdTrigger,
  detectMAIAThresholdExit,
};
