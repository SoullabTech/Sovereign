/**
 * Synthetic fixtures only. ⛔ No real work unit is read here; every unit is `origin: 'synthetic'`.
 */
import {
  commitmentOf,
  type AdmittedJudgment,
  type BoolQuestionId,
  type Domain,
  type EvaluationInput,
  type FrozenConfig,
  type HumanLabel,
  type LabelValue,
  type ProviderRecord,
  type QuestionId,
  type UnitRecord,
  cautionValue,
  HOST_FAILURE_REASONS,
} from './core';

/** TEST-ONLY numbers. The real floors are founder-set from the pilot (protocol §8). */
export const CFG: FrozenConfig = {
  kappa_floor: 0.5,
  min_positives: 20,
  max_undeterminable_rate: 0.25,
  ceiling_dangerous: 0.1,
  ceiling_confident: 0.1,
  ceiling_depth_material: 0.1,
};

/** 'C' = the cautious state of a boolean question, 'S' = the non-cautious ("safe to reduce") state. */
export type CS = 'C' | 'S';
export type Jev =
  | { kind: 'yn'; ans: CS; conf: number }
  | { kind: 'score'; s: number; conf: number }
  | { kind: 'abstain' }
  | { kind: 'host'; reason?: (typeof HOST_FAILURE_REASONS)[number] };

export interface Segment {
  n: number;
  q?: QuestionId;
  shape?: string;
  /** F-domain labels. For depth, a band 1..5; for booleans, 'C' | 'S'. */
  A: CS | number;
  B: CS | number;
  adj?: CS | number;
  /** P-domain labels; default to the F labels. */
  Ap?: CS | number | 'UNDET';
  Bp?: CS | number | 'UNDET';
  jev?: Jev;
  hindsight?: boolean;
  modelB?: boolean;
}

const raw = (q: QuestionId, v: CS | number | 'UNDET'): LabelValue => {
  if (v === 'UNDET') return 'UNDETERMINABLE';
  if (q === 'Q_DEPTH') return v as number;
  return v === 'C' ? cautionValue(q as BoolQuestionId) : !cautionValue(q as BoolQuestionId);
};

export interface Built {
  input: EvaluationInput;
  /** Rebuild the same input with the provider side re-sequenced BEFORE every label. */
  labelsAfterResponses: () => EvaluationInput;
}

export function build(segments: Segment[], config: FrozenConfig = CFG, opts: { extraLabels?: HumanLabel[] } = {}): Built {
  const units: UnitRecord[] = [];
  const labelDefs: Array<Omit<HumanLabel, 'commitment' | 'committed_seq'>> = [];
  const judgDefs: Array<{ unit_id: string; judgment: AdmittedJudgment }> = [];
  let u = 0;
  let salt = 0;
  for (const seg of segments) {
    const q = seg.q ?? 'Q_RISK';
    for (let i = 0; i < seg.n; i += 1) {
      u += 1;
      const unit_id = `u${String(u).padStart(5, '0')}`;
      units.push({ unit_id, task_shape: seg.shape ?? 'CODE_GROUNDED', origin: 'synthetic', hindsight_risk: seg.hindsight === true });
      const add = (domain: Domain, labeller: 'A' | 'B' | 'ADJ', v: CS | number | 'UNDET', kind: 'human' | 'model' = 'human'): void => {
        salt += 1;
        labelDefs.push({ unit_id, target: q, domain, labeller, labeller_kind: kind, value: raw(q, v), salt: `s${salt}` });
      };
      add('F', 'A', seg.A);
      add('F', 'B', seg.B, seg.modelB ? 'model' : 'human');
      if (seg.adj !== undefined) add('F', 'ADJ', seg.adj);
      add('P', 'A', seg.Ap ?? seg.A);
      add('P', 'B', seg.Bp ?? seg.B, seg.modelB ? 'model' : 'human');
      const jv = seg.jev;
      if (jv) {
        let judgment: AdmittedJudgment;
        if (jv.kind === 'yn') {
          judgment = { kind: 'yesno', question_id: q as BoolQuestionId, answer: raw(q, jv.ans) as boolean, confidence: jv.conf };
        } else if (jv.kind === 'score') {
          judgment = { kind: 'score', question_id: 'Q_DEPTH', score: jv.s, confidence: jv.conf };
        } else if (jv.kind === 'abstain') {
          judgment = { kind: 'abstain', question_id: q, reason: 'INSUFFICIENT_STATE' };
        } else {
          judgment = { kind: 'host_failure', question_id: q, reason: jv.reason ?? 'TIMEOUT' };
        }
        judgDefs.push({ unit_id, judgment });
      }
    }
  }
  const mkLabels = (startSeq: number): HumanLabel[] => {
    const own = labelDefs.map((l, i) => ({ ...l, committed_seq: startSeq + i, commitment: commitmentOf(l) }));
    return [...own, ...(opts.extraLabels ?? [])];
  };
  const mkJudg = (startSeq: number): ProviderRecord[] => judgDefs.map((j, i) => ({ ...j, received_seq: startSeq + i }));
  const L = labelDefs.length;
  const input: EvaluationInput = { config, units, labels: mkLabels(1), judgments: mkJudg(L + 1) };
  return {
    input,
    labelsAfterResponses: () => ({ config, units, labels: mkLabels(judgDefs.length + 1), judgments: mkJudg(1) }),
  };
}

/** A label whose target is not a J1 question — the shape an authority-as-target attempt takes. */
export function authorityLabel(target: string): HumanLabel {
  const base = { unit_id: 'u00001', target, domain: 'F' as const, labeller: 'A' as const, labeller_kind: 'human' as const, value: true, salt: 'x' };
  return { ...base, committed_seq: 1, commitment: commitmentOf(base) };
}
