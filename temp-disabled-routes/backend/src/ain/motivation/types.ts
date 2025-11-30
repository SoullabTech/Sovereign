export type NeedId = string;
export interface Need {
  id: NeedId;
  label: string;
  level: number;      // 0..1 current satisfaction
  urgency: number;    // 0..1 innate pressure
  weight: number;     // 0..1 importance (learned/priors)
}

export interface ActionOption {
  id: string;
  label: string;
  expectedNeedDelta: Record<NeedId, number>; // + raises / - lowers
  effort: number;   // 0..1
  risk: number;     // 0..1
}

export interface PsiState {
  tick: number;
  needs: Need[];
  mood: number;       // -1..1
  arousal: number;    // 0..1
  lastActionId?: string;
}

export interface Appraisal {
  optionId: string;
  valence: number;   // goodness prediction
  urgencyBias: number;
  expectedUtility: number;
}

export interface PsiStepInput {
  state: PsiState;
  options: ActionOption[];
  context?: Record<string, number>; // signals (fatigue, timePressure, novelty…)
}

export interface PsiStepOutput {
  next: PsiState;
  appraisals: Appraisal[];
  chosen: Appraisal | null;
}

export interface LearningParams {
  enabled: boolean;
  rate: number;        // typical 0.02–0.15
  minWeight?: number;  // default 0
  maxWeight?: number;  // default 1
}

export interface NeedDelta {
  id: NeedId;
  predicted: number;
  actual: number;        // next.level - prev.level
}

export interface PsiEpisode {
  ts: string;
  tick: number;
  chosenActionId?: string;
  mood: number;
  arousal: number;
  needDeltas: NeedDelta[];
  realizedValence: number;
  appraisals: Appraisal[];
  // optional bag for downstream analytics
  extra?: Record<string, unknown>;
}