export type PlanSpeechAct = 'GROUNDED' | 'CANDIDATE' | 'QUESTION';
export type PlanStanding = 'established' | 'adopted' | 'system_fact' | 'provisional' | 'open';
export type QuestionIntent = 'open_edge' | 'confirm' | 'clarify' | 'reopen';

export interface ClaimDraft {
  readonly proposition: string;
  readonly surfaceText: string;
  readonly speechAct: PlanSpeechAct;
  readonly standing: PlanStanding;
  readonly evidenceRefs?: readonly string[];
  readonly relationRefs?: readonly string[];
  readonly questionIntent?: QuestionIntent;
  readonly targetOrdinals?: readonly number[];
}

export interface PlannedClaim extends ClaimDraft {
  readonly claimId: string;
  readonly ordinal: number;
  readonly evidenceRefs: readonly string[];
  readonly relationRefs: readonly string[];
  readonly targetClaimIds: readonly string[];
}

export interface ClaimPlan {
  readonly version: 'prospective-claim-plan-v1';
  readonly planId: string;
  readonly claims: readonly PlannedClaim[];
}

export interface RenderedClaimSpan {
  readonly claimId: string;
  readonly startChar: number;
  readonly endChar: number;
  readonly speechAct: PlanSpeechAct;
  readonly standing: PlanStanding;
}

export interface RenderedClaimPlan {
  readonly planId: string;
  readonly text: string;
  readonly spans: readonly RenderedClaimSpan[];
}

export interface PlanGestureBinding {
  readonly gesture: string;
  readonly outcome: 'BOUND' | 'AMBIGUOUS' | 'NO_TARGET';
  readonly targetClaimId?: string;
  readonly candidateClaimIds: readonly string[];
  readonly reason: string;
}
