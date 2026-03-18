/**
 * Conversation Flow Telemetry
 *
 * Types and helpers for classifying turn-level flow quality.
 * Consumed by the oracle route after generation and persisted alongside AIN shape telemetry.
 *
 * Layer 0 (resolver) produces: resolverRule, resolverConfidence, clarificationBlocked
 * Route captures: modelAskedClarification, repairSignal
 * This layer synthesizes: flowOutcome, flowConfidence, flowReason
 */

export type FlowOutcome = 'smooth' | 'frictional' | 'repair' | 'unknown';
export type ResolverRule = 'yes_no' | 'either_or' | 'pronoun' | 'none';

export interface ConversationFlowTelemetry {
  flowOutcome: FlowOutcome;
  flowConfidence: number;
  flowReason: string;

  stateResolverFired: boolean;
  resolverRule: ResolverRule;
  resolverConfidence: number;
  clarificationBlocked: boolean;

  modelAskedClarification: boolean;
  clarificationWasNeeded: boolean;

  repairSignal: boolean;
}

export interface BuildFlowTelemetryInput {
  stateResolverFired: boolean;
  resolverRule: ResolverRule;
  resolverConfidence: number;
  clarificationBlocked: boolean;
  modelAskedClarification: boolean;
  clarificationWasNeeded: boolean;
  repairSignal: boolean;
}

// ─── Detection helpers ────────────────────────────────────────────────────────

export function detectClarificationQuestion(text: string): boolean {
  const lower = text.toLowerCase();
  return [
    'can you clarify',
    'could you clarify',
    'what do you mean by',
    'which one do you mean',
    'do you mean',
    'are you referring to',
    'can you say more about',
    'could you say more about',
  ].some((pattern) => lower.includes(pattern));
}

export function detectRepairSignal(text: string): boolean {
  const lower = text.toLowerCase();
  return [
    "that's not what i meant",
    'that is not what i meant',
    'no, i meant',
    'the other one',
    'not that',
    'you misunderstood',
    "that's not it",
    'that is not it',
  ].some((pattern) => lower.includes(pattern));
}

// ─── Classification ───────────────────────────────────────────────────────────

export function buildFlowTelemetry(
  input: BuildFlowTelemetryInput,
): ConversationFlowTelemetry {
  const {
    stateResolverFired,
    resolverRule,
    resolverConfidence,
    clarificationBlocked,
    modelAskedClarification,
    clarificationWasNeeded,
    repairSignal,
  } = input;

  // Repair takes priority — explicit correction signal
  if (repairSignal) {
    return {
      flowOutcome: 'repair',
      flowConfidence: 0.95,
      flowReason: 'repair signal detected after misunderstanding or correction',
      stateResolverFired,
      resolverRule,
      resolverConfidence,
      clarificationBlocked,
      modelAskedClarification,
      clarificationWasNeeded,
      repairSignal,
    };
  }

  // Smooth: resolver fired, clarification blocked, model didn't ask, no repair
  if (
    stateResolverFired &&
    clarificationBlocked &&
    !modelAskedClarification &&
    !clarificationWasNeeded
  ) {
    return {
      flowOutcome: 'smooth',
      flowConfidence: 0.92,
      flowReason: 'resolver supplied local context and turn advanced without clarification',
      stateResolverFired,
      resolverRule,
      resolverConfidence,
      clarificationBlocked,
      modelAskedClarification,
      clarificationWasNeeded,
      repairSignal,
    };
  }

  // Frictional: resolver fired but model still asked, or clarification was needed
  if ((stateResolverFired && modelAskedClarification) || clarificationWasNeeded) {
    return {
      flowOutcome: 'frictional',
      flowConfidence: 0.84,
      flowReason: 'turn still required clarification or showed unresolved ambiguity',
      stateResolverFired,
      resolverRule,
      resolverConfidence,
      clarificationBlocked,
      modelAskedClarification,
      clarificationWasNeeded,
      repairSignal,
    };
  }

  return {
    flowOutcome: 'unknown',
    flowConfidence: 0.5,
    flowReason: 'insufficient signal to classify flow quality',
    stateResolverFired,
    resolverRule,
    resolverConfidence,
    clarificationBlocked,
    modelAskedClarification,
    clarificationWasNeeded,
    repairSignal,
  };
}
