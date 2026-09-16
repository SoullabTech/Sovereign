/**
 * TURN-02 — predictive turn intelligence, shadow-safe core.
 *
 * The arbiter may recommend WAIT / BACKCHANNEL / YIELD. It never sends a turn.
 * TURN-01 member sovereignty remains the authority boundary.
 */
export type TurnDecision =
  | 'wait'
  | 'backchannel_candidate'
  | 'yield_candidate'
  | 'insufficient_evidence';

export type TurnPredictorSnapshot = {
  acousticContinue?: number | null;
  acousticYield?: number | null;
  semanticIncomplete?: number | null;
  semanticYield?: number | null;
  backchannel?: number | null;
};

export type TurnEvidence = TurnPredictorSnapshot & {
  explicitFloorHeld: boolean;
  speechActive: boolean;
  silenceMs: number;
  selectedSilenceMs: number;
  continuedPauseEmaMs?: number;
};

export type TurnArbiterResult = {
  decision: TurnDecision;
  continueScore: number;
  yieldScore: number;
  backchannelScore: number;
  reasons: string[];
};

const clamp01 = (v: number | null | undefined): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : null;

const maxKnown = (...values: Array<number | null>): number => {
  const known = values.filter((v): v is number => v !== null);
  return known.length ? Math.max(...known) : 0;
};

export function decideTurn(e: TurnEvidence): TurnArbiterResult {
  const ac = clamp01(e.acousticContinue);
  const ay = clamp01(e.acousticYield);
  const si = clamp01(e.semanticIncomplete);
  const sy = clamp01(e.semanticYield);
  const bc = clamp01(e.backchannel);
  const continueScore = maxKnown(ac, si);
  const yieldScore = maxKnown(ay, sy);
  const backchannelScore = bc ?? 0;
  const reasons: string[] = [];

  if (e.explicitFloorHeld) {
    return { decision: 'wait', continueScore, yieldScore, backchannelScore, reasons: ['explicit_floor'] };
  }
  if (e.speechActive) {
    return { decision: 'wait', continueScore, yieldScore, backchannelScore, reasons: ['speech_active'] };
  }

  // TURN-01 remains a floor: TURN-02 can never make MAIA more aggressive than
  // the member-selected / learned conversational-space threshold.
  if (e.silenceMs < e.selectedSilenceMs) {
    reasons.push('below_member_space');
    if (backchannelScore >= 0.72 && continueScore >= 0.58) {
      return { decision: 'backchannel_candidate', continueScore, yieldScore, backchannelScore, reasons };
    }
    return { decision: 'wait', continueScore, yieldScore, backchannelScore, reasons };
  }

  // Conflicting evidence resolves toward the member retaining the floor.
  if (continueScore >= 0.62) {
    reasons.push('continuation_evidence');
    return { decision: 'wait', continueScore, yieldScore, backchannelScore, reasons };
  }

  const predictorCount = [ac, ay, si, sy].filter((v) => v !== null).length;
  if (predictorCount === 0) {
    reasons.push('no_predictor_evidence');
    return { decision: 'insufficient_evidence', continueScore, yieldScore, backchannelScore, reasons };
  }

  if (yieldScore >= 0.72 && continueScore < 0.45) {
    reasons.push('yield_evidence');
    return { decision: 'yield_candidate', continueScore, yieldScore, backchannelScore, reasons };
  }

  reasons.push('ambiguous_predictor_evidence');
  return { decision: 'insufficient_evidence', continueScore, yieldScore, backchannelScore, reasons };
}
