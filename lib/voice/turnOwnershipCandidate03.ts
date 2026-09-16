import { CONVERSATIONAL_SPACE_CONFIG, type ConversationalSpace } from './turnTaking';

export type TurnOwnershipDecision = 'wait' | 'yield_candidate';

export type TurnOwnershipCandidateEvidence = {
  explicitFloorHeld: boolean;
  speechActive: boolean;
  silenceMs: number;
  selectedSilenceMs: number;
  conversationalSpace: ConversationalSpace;
  semanticIncomplete?: number | null;
  semanticYield?: number | null;
};

export type TurnOwnershipCandidateResult = {
  decision: TurnOwnershipDecision;
  earliestYieldMs: number;
  ambiguityCeilingMs: number;
  reasons: string[];
};

const p = (v: number | null | undefined): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : null;

/**
 * TURN-03 shadow candidate. Models do not receive floor authority here.
 * The selected TURN-01 silence value becomes the earliest consideration point;
 * the existing Space adaptive ceiling becomes the generic ambiguity boundary.
 */
export function decideTurnOwnershipCandidate03(e: TurnOwnershipCandidateEvidence): TurnOwnershipCandidateResult {
  const config = CONVERSATIONAL_SPACE_CONFIG[e.conversationalSpace];
  const earliestYieldMs = Math.max(config.silenceMs, e.selectedSilenceMs);
  const ambiguityCeilingMs = Math.max(earliestYieldMs, config.adaptiveCeilingMs);
  const semanticIncomplete = p(e.semanticIncomplete) ?? 0;
  const semanticYield = p(e.semanticYield) ?? 0;

  if (e.explicitFloorHeld) return { decision:'wait', earliestYieldMs, ambiguityCeilingMs, reasons:['explicit_floor'] };
  if (e.speechActive) return { decision:'wait', earliestYieldMs, ambiguityCeilingMs, reasons:['speech_active'] };
  if (e.silenceMs < earliestYieldMs) return { decision:'wait', earliestYieldMs, ambiguityCeilingMs, reasons:['member_space'] };
  if (semanticIncomplete >= 0.62) return { decision:'wait', earliestYieldMs, ambiguityCeilingMs, reasons:['semantic_continuation'] };
  if (semanticYield >= 0.72) return { decision:'yield_candidate', earliestYieldMs, ambiguityCeilingMs, reasons:['explicit_semantic_yield'] };
  if (e.silenceMs < ambiguityCeilingMs) return { decision:'wait', earliestYieldMs, ambiguityCeilingMs, reasons:['ambiguity_window'] };
  return { decision:'yield_candidate', earliestYieldMs, ambiguityCeilingMs, reasons:['ambiguity_ceiling'] };
}
