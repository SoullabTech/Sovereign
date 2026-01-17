/**
 * Threshold Mode Schemas
 *
 * Zod schemas for MAIA Threshold Layer and AIN Threshold Mode.
 * Based on Crowder's Precategorical Acoustic Storage and McGilchrist's hemispheric theory.
 *
 * Core principle: The precategorical layer is a first-class state, not just a buffer.
 * Processing is available, but not automatic. Threshold can be the final state.
 */

import { z } from 'zod';

// =============================================================================
// MAIA THRESHOLD LAYER SCHEMAS
// =============================================================================

/**
 * Reasons to enter MAIA Threshold
 */
export const MAIAThresholdTriggerSchema = z.enum([
  'felt_sense',           // User reports somatic/emotional experience
  'high_stakes',          // Content suggests vulnerability or life transition
  'too_fast_meaning',     // User jumping to conclusion before feeling
  'session_start',        // Optional: gentle presence at conversation start
  'explicit_request',     // User asks for space/presence
]);
export type MAIAThresholdTrigger = z.infer<typeof MAIAThresholdTriggerSchema>;

/**
 * Reasons to exit MAIA Threshold
 */
export const MAIAThresholdExitSchema = z.enum([
  'user_symbolizes',      // User names/labels their experience
  'interpretation_request', // User asks "what does this mean?"
  'stabilization',        // Energy settles naturally
  'explicit_request',     // User asks to move forward
  'time_natural',         // Natural conversational pause
]);
export type MAIAThresholdExit = z.infer<typeof MAIAThresholdExitSchema>;

/**
 * Response types MAIA can give while in Threshold
 */
export const MAIAThresholdResponseTypeSchema = z.enum([
  'HOLD',       // Stay in presence, minimal response
  'INVITE',     // Gentle invitation to notice more
  'FORK',       // Offer pathways without choosing for user
  'TRANSITION', // Begin moving toward interpretation
]);
export type MAIAThresholdResponseType = z.infer<typeof MAIAThresholdResponseTypeSchema>;

/**
 * MAIA Threshold state object
 */
export const MAIAThresholdStateSchema = z.object({
  inThreshold: z.boolean(),
  enteredAt: z.number().optional(),
  trigger: MAIAThresholdTriggerSchema.optional(),
  turnCount: z.number().default(0),
  textureNotes: z.array(z.string()).default([]),
  exitReason: MAIAThresholdExitSchema.optional(),
});
export type MAIAThresholdState = z.infer<typeof MAIAThresholdStateSchema>;

/**
 * MAIA Threshold response object
 */
export const MAIAThresholdResponseSchema = z.object({
  type: MAIAThresholdResponseTypeSchema,
  text: z.string(),
  continueThreshold: z.boolean(),
  exitReason: MAIAThresholdExitSchema.optional(),
});
export type MAIAThresholdResponse = z.infer<typeof MAIAThresholdResponseSchema>;

// =============================================================================
// AIN THRESHOLD MODE SCHEMAS
// =============================================================================

/**
 * Channels for Threshold contributions (no analysis, just sensing)
 */
export const AINThresholdChannelSchema = z.enum([
  'texture',   // What's the tone/shape/weight?
  'context',   // What's present around the words?
  'unknowns',  // What is missing/unclear?
  'aim',       // What does this seem to be asking for?
]);
export type AINThresholdChannel = z.infer<typeof AINThresholdChannelSchema>;

/**
 * Reasons to return to Threshold during deliberation
 */
export const AINReturnToThresholdReasonSchema = z.enum([
  'frame_lock',          // Debate stuck in one frame
  'certainty_inflation', // Confidence exceeding evidence
  'whole_lost',          // Optimizing parts, missing whole
  'winning_vs_seeing',   // Agents competing, not collaborating
  'new_information',     // Context changed
  'user_signal',         // User indicated misattunement
]);
export type AINReturnToThresholdReason = z.infer<typeof AINReturnToThresholdReasonSchema>;

/**
 * Output types from AIN Threshold
 */
export const AINThresholdOutputTypeSchema = z.enum([
  'EMERGENT_QUESTION',     // Committee converged on a question
  'FRAME_OPTIONS',         // Multiple valid frames (max 3)
  'STAY_IN_THRESHOLD',     // Not ready to deliberate
  'ROLE_ACTIVATION_PLAN',  // Ready to activate specific agents
]);
export type AINThresholdOutputType = z.infer<typeof AINThresholdOutputTypeSchema>;

/**
 * Individual sensing contribution from an agent
 */
export const AINSensingContributionSchema = z.object({
  agentId: z.string(),
  channel: AINThresholdChannelSchema,
  observation: z.string(),
  confidence: z.number().min(0).max(1).optional(),
});
export type AINSensingContribution = z.infer<typeof AINSensingContributionSchema>;

/**
 * Frame option for FRAME_OPTIONS output
 */
export const AINFrameOptionSchema = z.object({
  frame: z.string(),
  question: z.string(),
  suggestedAgents: z.array(z.string()),
  disconfirmationPassed: z.boolean(),
});
export type AINFrameOption = z.infer<typeof AINFrameOptionSchema>;

/**
 * Disconfirmation pass result
 */
export const AINDisconfirmationPassSchema = z.object({
  frameWrongIf: z.string(),        // What would make this frame wrong?
  charitableAlternative: z.string(), // Most charitable alternative interpretation
  blindSpots: z.string(),          // What are we not seeing because of our roles?
  passed: z.boolean(),             // Did the frame survive disconfirmation?
});
export type AINDisconfirmationPass = z.infer<typeof AINDisconfirmationPassSchema>;

/**
 * AIN Threshold output object
 */
export const AINThresholdOutputSchema = z.object({
  type: AINThresholdOutputTypeSchema,

  // For EMERGENT_QUESTION
  question: z.string().optional(),

  // For FRAME_OPTIONS
  frames: z.array(AINFrameOptionSchema).max(3).optional(),

  // For ROLE_ACTIVATION_PLAN
  activationPlan: z.object({
    primaryAgents: z.array(z.string()),
    supportAgents: z.array(z.string()),
    frame: z.string(),
    question: z.string(),
  }).optional(),

  // For STAY_IN_THRESHOLD
  reason: z.string().optional(),

  // Always included
  sensingContributions: z.array(AINSensingContributionSchema),
  disconfirmation: AINDisconfirmationPassSchema.optional(),
});
export type AINThresholdOutput = z.infer<typeof AINThresholdOutputSchema>;

/**
 * AIN Threshold state object
 */
export const AINThresholdStateSchema = z.object({
  inThreshold: z.boolean(),
  enteredAt: z.number().optional(),
  sensingRound: z.number().default(0),
  contributions: z.array(AINSensingContributionSchema).default([]),
  returnReason: AINReturnToThresholdReasonSchema.optional(),
  previousFrames: z.array(z.string()).default([]),
});
export type AINThresholdState = z.infer<typeof AINThresholdStateSchema>;

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Create a fresh MAIA Threshold state
 */
export function createMAIAThresholdState(trigger?: MAIAThresholdTrigger): MAIAThresholdState {
  return {
    inThreshold: true,
    enteredAt: Date.now(),
    trigger,
    turnCount: 0,
    textureNotes: [],
  };
}

/**
 * Create a fresh AIN Threshold state
 */
export function createAINThresholdState(returnReason?: AINReturnToThresholdReason): AINThresholdState {
  return {
    inThreshold: true,
    enteredAt: Date.now(),
    sensingRound: 0,
    contributions: [],
    returnReason,
    previousFrames: [],
  };
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Check if MAIA should enter Threshold based on input patterns
 */
export function detectMAIAThresholdTrigger(input: string): MAIAThresholdTrigger | null {
  const lowered = input.toLowerCase();

  // Felt sense patterns
  if (/something('s| is) (happening|shifting|moving|stirring)/i.test(input) ||
      /i (feel|sense|notice) (something|a)/i.test(input) ||
      /there('s| is) (this|a) (feeling|sensation|sense)/i.test(input) ||
      /i don't (know|have) (the )?words/i.test(input)) {
    return 'felt_sense';
  }

  // High stakes patterns
  if (/i('m| am) (scared|terrified|afraid)/i.test(input) ||
      /everything('s| is) (falling apart|changing)/i.test(input) ||
      /i (just )?(lost|found out|discovered)/i.test(input) ||
      /(divorce|death|diagnosis|fired|pregnant)/i.test(input)) {
    return 'high_stakes';
  }

  // Too fast meaning (user interpreting before feeling)
  if (/i (think|guess|suppose) (it('s| is)|this (is|means))/i.test(input) &&
      /\?$/.test(input.trim())) {
    return 'too_fast_meaning';
  }

  // Explicit request for space
  if (/just (be|sit) (here|with me)/i.test(input) ||
      /i (need|want) (space|a moment|to breathe)/i.test(input) ||
      /don't (analyze|explain|fix)/i.test(input)) {
    return 'explicit_request';
  }

  return null;
}

/**
 * Check if MAIA should exit Threshold based on input patterns
 */
export function detectMAIAThresholdExit(input: string): MAIAThresholdExit | null {
  // User symbolizing their experience
  if (/i (think|realize|see|understand) (that |it('s| is) )/i.test(input) ||
      /this (is|feels like) /i.test(input) ||
      /it('s| is) (about|actually|really) /i.test(input)) {
    return 'user_symbolizes';
  }

  // User requesting interpretation
  if (/what (does|do) (this|you think|it) mean/i.test(input) ||
      /can you (help me understand|explain|tell me)/i.test(input) ||
      /why (do|am|is) /i.test(input)) {
    return 'interpretation_request';
  }

  // Explicit request to move forward
  if (/let('s| us) (move on|continue|talk about)/i.test(input) ||
      /i('m| am) ready (to|for)/i.test(input) ||
      /what (should|can) (i|we) do/i.test(input)) {
    return 'explicit_request';
  }

  return null;
}
