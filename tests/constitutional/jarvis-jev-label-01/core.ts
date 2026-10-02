/**
 * JARVIS-JEV-LABEL-01 — metric instrument core.
 *
 * Provider-free. Network-free. Reads no real work unit. It measures a set of *already
 * admitted* J1 judgments against human labels and produces per-question verdicts.
 *
 * ⭐ THE SEAM IS A DECISION SEAM, NOT A CONFIG FLAG. Every rule the protocol makes
 * load-bearing is one named member of `Decisions`. The shipped path is `STRICT`; each
 * defeat candidate replaces exactly one decision, so a candidate is the smallest competent
 * embodiment of one named error (the review-custody discipline). No file on the shipped path
 * contains a branch for any weaker rule.
 *
 * Authority is outside the ontology (protocol §2): a label target must be one of the four J1
 * question ids, and anything else is REFUSED, never scored.
 */
import { createHash } from 'node:crypto';
import { ALPHA, TAUS, bandOf, cohenKappa, cpUpperOneSided, weightedKappaQuadratic } from './stats';

// ───────────────────────────── vocabulary (mirrors J1R4 §6; drift-guarded by the matrix) ─────────────────────────────

export const QUESTION_IDS = ['Q_DEPTH', 'Q_RISK', 'Q_SUFFICIENT', 'Q_LLM_NEEDED'] as const;
export type QuestionId = (typeof QUESTION_IDS)[number];
export type BoolQuestionId = Exclude<QuestionId, 'Q_DEPTH'>;
export const HOST_FAILURE_REASONS = [
  'TIMEOUT',
  'NO_RESPONSE',
  'PARSE_FAILURE',
  'UNKNOWN_SHAPE',
  'MISMATCHED_QUESTION',
  'OUT_OF_RANGE',
] as const;
export const MODEL_ABSTAIN_REASONS = ['INSUFFICIENT_STATE', 'REFUSED'] as const;
export type HostFailureReason = (typeof HOST_FAILURE_REASONS)[number];
export type ModelAbstainReason = (typeof MODEL_ABSTAIN_REASONS)[number];

export type Domain = 'P' | 'F';
export type LabelValue = number | boolean | 'UNDETERMINABLE';

/** Frozen instrument conventions (protocol §4.1, §4.3, §7). Not configuration. */
export const DEPTH_WARRANTED_MIN_BAND = 2;
export const DEPTH_MATERIAL_U = 2;
export const DEPTH_REDUCTION_MAX_BAND = 2;

/** Founder-set numbers (protocol §8). ⛔ The instrument has NO defaults for these. */
export interface FrozenConfig {
  kappa_floor: number;
  min_positives: number;
  max_undeterminable_rate: number;
  ceiling_dangerous: number;
  ceiling_confident: number;
  ceiling_depth_material: number;
}

// ───────────────────────────── inputs ─────────────────────────────

export interface UnitRecord {
  unit_id: string;
  task_shape: string;
  origin: 'real' | 'synthetic';
  hindsight_risk?: boolean;
}

export interface HumanLabel {
  unit_id: string;
  /** ⛔ Runtime-validated. Anything but a J1 question id is refused (authority is not a target). */
  target: string;
  domain: Domain;
  labeller: 'A' | 'B' | 'ADJ';
  labeller_kind: 'human' | 'model';
  value: LabelValue;
  salt: string;
  commitment: string;
  committed_seq: number;
}

export type AdmittedJudgment =
  | { kind: 'score'; question_id: 'Q_DEPTH'; score: number; confidence: number }
  | { kind: 'yesno'; question_id: BoolQuestionId; answer: boolean; confidence: number }
  | { kind: 'abstain'; question_id: QuestionId; reason: ModelAbstainReason }
  | { kind: 'host_failure'; question_id: QuestionId; reason: HostFailureReason };

export interface ProviderRecord {
  unit_id: string;
  judgment: AdmittedJudgment;
  received_seq: number;
}

export interface EvaluationInput {
  config: FrozenConfig;
  units: UnitRecord[];
  labels: HumanLabel[];
  judgments: ProviderRecord[];
}

export class EvaluationRefused extends Error {
  constructor(
    public readonly code:
      | 'AUTHORITY_TARGET'
      | 'COMMITMENT_MISMATCH'
      | 'LABEL_AFTER_RESPONSE'
      | 'CONFIG_NOT_FROZEN'
      | 'INVALID_INPUT'
      | 'DUPLICATE_LABEL'
      | 'DUPLICATE_JUDGMENT',
    detail: string,
  ) {
    super(`${code}: ${detail}`);
  }
}

// ───────────────────────────── commitments ─────────────────────────────

const canon = (l: Pick<HumanLabel, 'unit_id' | 'target' | 'domain' | 'labeller' | 'labeller_kind' | 'value' | 'salt'>): string =>
  JSON.stringify([l.unit_id, l.target, l.domain, l.labeller, l.labeller_kind, l.value, l.salt]);

export const commitmentOf = (
  l: Pick<HumanLabel, 'unit_id' | 'target' | 'domain' | 'labeller' | 'labeller_kind' | 'value' | 'salt'>,
): string => createHash('sha256').update(canon(l)).digest('hex');

// ───────────────────────────── decisions ─────────────────────────────

export type JudgmentBucket = 'judged' | 'abstain' | 'host_failure';
export interface JudgmentTreatment {
  /** Does this record enter the dangerous-rate denominator? */
  inDenominator: boolean;
  /** If it is in the denominator but not judged, is it counted as a dangerous error? */
  countsAsError: boolean;
  bucket: JudgmentBucket;
}

export interface Event {
  k: number;
  n: number;
  point: number | null;
  /** decisions.riskQuantity(k, n) — what the verdict actually uses. */
  bound: number;
}

export interface DomainResult {
  domain: Domain;
  n_eligible: number;
  n_pos: number;
  n_pos_judged: number;
  n_pos_abstain: number;
  n_pos_host_failure: number;
  n_pos_unjudged: number;
  /** bool questions: the dangerous direction. depth: any undercall (U>0), reported only. */
  any: Event;
  /** depth only: U >= DEPTH_MATERIAL_U. The verdict-gating depth event. */
  material: Event | null;
  confident: Array<{ tau: number } & Event>;
  depth: null | {
    pct_u_gt0: number | null;
    pct_u_ge2: number | null;
    mean_u_among_undercalls: number | null;
    max_u: number;
    over_deliberation: { k: number; n: number };
  };
  /** Context only. ⛔ Never a headline. */
  agreement_with_jev: number | null;
}

export interface Utility {
  n_records: number;
  n_judged: number;
  n_abstain: number;
  n_host_failure: number;
  abstain_rate: number | null;
  host_failure_rate: number | null;
  recommended_reduction_rate: number | null;
}

export interface Decisions {
  id: string;
  /** ⛔ authority is not a label target. */
  acceptTarget(target: string): boolean;
  isGoldLabel(l: HumanLabel): boolean;
  /** Labels must be sealed strictly before the first provider response exists. */
  labelOrderOk(maxLabelSeq: number, minResponseSeq: number): boolean;
  /** Adjudication must never overwrite A or B. */
  adjudicate(a: LabelValue, b: LabelValue, adj: LabelValue | undefined): { a: LabelValue; b: LabelValue };
  headlineDepth(a: number, b: number): number;
  headlineCaution(aCaution: boolean, bCaution: boolean): boolean;
  bandOf(score: number): number;
  depthUnder(humanBand: number, jevBand: number): number;
  classifyJudgment(kind: AdmittedJudgment['kind']): JudgmentTreatment;
  /** The exact upper bound function (frozen: one-sided CP, alpha = 0.05). */
  upperBound(k: number, n: number): number;
  /** The quantity a verdict is taken on (frozen: the bound, never the point estimate). */
  riskQuantity(k: number, n: number): number;
  verdictDomains(): readonly Domain[];
  domainFails(q: QuestionId, r: DomainResult, util: Utility, cfg: FrozenConfig): boolean;
  uninterpretableVerdict(): 'UNINTERPRETABLE' | 'NOT_ADMISSIBLE';
}

const TREATMENT: Record<AdmittedJudgment['kind'], JudgmentTreatment> = {
  score: { inDenominator: true, countsAsError: false, bucket: 'judged' },
  yesno: { inDenominator: true, countsAsError: false, bucket: 'judged' },
  abstain: { inDenominator: false, countsAsError: false, bucket: 'abstain' },
  host_failure: { inDenominator: false, countsAsError: false, bucket: 'host_failure' },
};

export const STRICT: Decisions = {
  id: 'STRICT',
  acceptTarget: (t) => (QUESTION_IDS as readonly string[]).includes(t),
  isGoldLabel: (l) => l.labeller_kind === 'human',
  labelOrderOk: (maxLabelSeq, minResponseSeq) => maxLabelSeq < minResponseSeq,
  adjudicate: (a, b) => ({ a, b }),
  headlineDepth: (a, b) => Math.max(a, b),
  headlineCaution: (a, b) => a || b,
  bandOf,
  depthUnder: (h, b) => Math.max(0, h - b),
  classifyJudgment: (kind) => TREATMENT[kind],
  upperBound: (k, n) => cpUpperOneSided(k, n, ALPHA),
  riskQuantity: (k, n) => cpUpperOneSided(k, n, ALPHA),
  verdictDomains: () => ['P', 'F'],
  domainFails: (q, r, _util, cfg) => {
    const confidentFails = r.confident.some((c) => c.bound > cfg.ceiling_confident);
    if (q === 'Q_DEPTH') {
      return (r.material !== null && r.material.bound > cfg.ceiling_depth_material) || confidentFails;
    }
    return r.any.bound > cfg.ceiling_dangerous || confidentFails;
  },
  uninterpretableVerdict: () => 'UNINTERPRETABLE',
};

// ───────────────────────────── report ─────────────────────────────

export type Verdict = 'UNINTERPRETABLE' | 'NOT_ADMISSIBLE' | 'ADVISORY_ADMISSIBLE';
export type EvidenceClass = 'SYNTHETIC' | 'PILOT_HINDSIGHT' | 'GOLD_ELIGIBLE';

export interface Agreement {
  /** ⛔ null means *undefined* (no variance), which is its own reason, not a low number. */
  kappa: number | null;
  n_pairs: number;
  kind: 'cohen' | 'weighted_quadratic';
}

export interface Disagreement {
  unit_id: string;
  task_shape: string;
  a: LabelValue;
  b: LabelValue;
  adjudicated: LabelValue | null;
}

export interface QuestionReport {
  question_id: QuestionId;
  verdict: Verdict;
  reasons: string[];
  /** Why a NOT_ADMISSIBLE verdict arose. */
  cause: null | 'PROVIDER_ERROR_ON_PACKET' | 'PACKET_INSUFFICIENCY' | 'F_FAIL_P_UNASSESSED';
  gate: { P: 'FAIL' | 'PASS' | 'UNASSESSED'; F: 'FAIL' | 'PASS' | 'UNASSESSED' };
  agreement: { P: Agreement; F: Agreement };
  domains: { P: DomainResult; F: DomainResult };
  utility: Utility;
  disagreements: { P: Disagreement[]; F: Disagreement[] };
  ineligible: { P: number; F: number };
  undeterminable_rate_P: number | null;
}

export interface Report {
  instrument: 'JARVIS-JEV-LABEL-01';
  decisions_id: string;
  evidence_class: EvidenceClass;
  /** ⛔ A verdict is evidence offered to a separate founder act. It licenses nothing. */
  licenses: 'NOTHING';
  questions: Record<QuestionId, QuestionReport>;
  provenance: { n_units: number; n_labels: number; n_judgments: number; hindsight_units: number; synthetic_units: number };
}

// ───────────────────────────── helpers ─────────────────────────────

export const isQuestionId = (v: string): v is QuestionId => (QUESTION_IDS as readonly string[]).includes(v);

/** The raw boolean answer that means "escalate / deliberate more" for each boolean question. */
export const cautionValue = (q: BoolQuestionId): boolean => q !== 'Q_SUFFICIENT';
export const isCaution = (q: BoolQuestionId, raw: boolean): boolean => raw === cautionValue(q);

function validateConfig(c: FrozenConfig): void {
  const must = (name: keyof FrozenConfig, lo: number, hi: number): void => {
    const v = c?.[name];
    if (typeof v !== 'number' || !Number.isFinite(v) || v < lo || v > hi) {
      throw new EvaluationRefused('CONFIG_NOT_FROZEN', `${String(name)} must be a finite number in [${lo}, ${hi}]; the instrument has no defaults`);
    }
  };
  must('kappa_floor', -1, 1);
  must('min_positives', 1, 1e9);
  must('max_undeterminable_rate', 0, 1);
  must('ceiling_dangerous', 0, 1);
  must('ceiling_confident', 0, 1);
  must('ceiling_depth_material', 0, 1);
}

const key = (...p: Array<string | number>): string => p.join('\u0000');

const emptyEvent = (): Event => ({ k: 0, n: 0, point: null, bound: 1 });

// ───────────────────────────── evaluation ─────────────────────────────

export function evaluate(input: EvaluationInput, d: Decisions = STRICT): Report {
  validateConfig(input.config);
  const cfg = input.config;

  // 1. authority is not a target ─────────────────────────────────────────
  for (const l of input.labels) {
    if (!d.acceptTarget(l.target)) {
      throw new EvaluationRefused('AUTHORITY_TARGET', `"${l.target}" is not a J1 question id; authority facts are deterministic and are never a label target`);
    }
  }
  const labels = input.labels.filter((l) => isQuestionId(l.target));

  // 2. shapes ────────────────────────────────────────────────────────────
  for (const l of labels) {
    const q = l.target as QuestionId;
    if (l.value === 'UNDETERMINABLE') {
      if (l.domain !== 'P') throw new EvaluationRefused('INVALID_INPUT', 'UNDETERMINABLE is a packet-only (P) label state');
      continue;
    }
    if (q === 'Q_DEPTH') {
      if (typeof l.value !== 'number' || !Number.isInteger(l.value) || l.value < 1 || l.value > 5) {
        throw new EvaluationRefused('INVALID_INPUT', `Q_DEPTH label must be an integer band 1..5 (unit ${l.unit_id})`);
      }
    } else if (typeof l.value !== 'boolean') {
      throw new EvaluationRefused('INVALID_INPUT', `${q} label must be boolean (unit ${l.unit_id})`);
    }
  }
  const unitById = new Map(input.units.map((u) => [u.unit_id, u] as const));
  const jByKey = new Map<string, ProviderRecord>();
  for (const r of input.judgments) {
    const j = r.judgment;
    if (!isQuestionId(j.question_id)) throw new EvaluationRefused('INVALID_INPUT', `unknown judgment question ${String(j.question_id)}`);
    const k = key(r.unit_id, j.question_id);
    if (jByKey.has(k)) throw new EvaluationRefused('DUPLICATE_JUDGMENT', `${r.unit_id}/${j.question_id}`);
    jByKey.set(k, r);
    const unit01 = (v: number): boolean => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1;
    if (j.kind === 'score') {
      if (j.question_id !== 'Q_DEPTH') throw new EvaluationRefused('INVALID_INPUT', 'score judgment on a non-depth question');
      if (!unit01(j.score) || !unit01(j.confidence)) throw new EvaluationRefused('INVALID_INPUT', 'score/confidence outside [0,1]');
    } else if (j.kind === 'yesno') {
      if (j.question_id === ('Q_DEPTH' as string)) throw new EvaluationRefused('INVALID_INPUT', 'yesno judgment on Q_DEPTH');
      if (!unit01(j.confidence)) throw new EvaluationRefused('INVALID_INPUT', 'confidence outside [0,1]');
    }
  }

  // 3. commitments verify; labels sealed strictly before any response ───────
  const lByKey = new Map<string, HumanLabel>();
  for (const l of labels) {
    if (commitmentOf(l) !== l.commitment) throw new EvaluationRefused('COMMITMENT_MISMATCH', `${l.unit_id}/${l.target}/${l.domain}/${l.labeller}`);
    const k = key(l.unit_id, l.target, l.domain, l.labeller);
    if (lByKey.has(k)) throw new EvaluationRefused('DUPLICATE_LABEL', k.replace(/\u0000/g, '/'));
    lByKey.set(k, l);
  }
  if (labels.length > 0 && input.judgments.length > 0) {
    const maxLabelSeq = Math.max(...labels.map((l) => l.committed_seq));
    const minResponseSeq = Math.min(...input.judgments.map((r) => r.received_seq));
    if (!d.labelOrderOk(maxLabelSeq, minResponseSeq)) {
      throw new EvaluationRefused('LABEL_AFTER_RESPONSE', `a label was sealed at seq ${maxLabelSeq}; the first provider response is at seq ${minResponseSeq}`);
    }
  }

  // 4. per question ─────────────────────────────────────────────────────────
  const questions = {} as Record<QuestionId, QuestionReport>;
  for (const q of QUESTION_IDS) questions[q] = evaluateQuestion(q, input, unitById, lByKey, jByKey, cfg, d);

  const hindsight = input.units.filter((u) => u.hindsight_risk === true).length;
  const synthetic = input.units.filter((u) => u.origin === 'synthetic').length;
  const evidence_class: EvidenceClass = synthetic > 0 ? 'SYNTHETIC' : hindsight > 0 ? 'PILOT_HINDSIGHT' : 'GOLD_ELIGIBLE';
  return {
    instrument: 'JARVIS-JEV-LABEL-01',
    decisions_id: d.id,
    evidence_class,
    licenses: 'NOTHING',
    questions,
    provenance: {
      n_units: input.units.length,
      n_labels: input.labels.length,
      n_judgments: input.judgments.length,
      hindsight_units: hindsight,
      synthetic_units: synthetic,
    },
  };
}

function evaluateQuestion(
  q: QuestionId,
  input: EvaluationInput,
  unitById: Map<string, UnitRecord>,
  lByKey: Map<string, HumanLabel>,
  jByKey: Map<string, ProviderRecord>,
  cfg: FrozenConfig,
  d: Decisions,
): QuestionReport {
  const isDepth = q === 'Q_DEPTH';
  const domains = {} as { P: DomainResult; F: DomainResult };
  const agreement = {} as { P: Agreement; F: Agreement };
  const disagreements = { P: [] as Disagreement[], F: [] as Disagreement[] };
  const ineligible = { P: 0, F: 0 };
  let undeterminableP = 0;
  let eligibleP = 0;

  for (const domain of ['P', 'F'] as const) {
    const cohenPairs: Array<readonly [boolean, boolean]> = [];
    const ordPairs: Array<readonly [number, number]> = [];
    let nEligible = 0;
    let nPos = 0;
    let nPosJudged = 0;
    let nPosAbstain = 0;
    let nPosHost = 0;
    let nPosUnjudged = 0;
    let anyK = 0;
    let materialK = 0;
    const confK = TAUS.map(() => 0);
    let uSum = 0;
    let uUndercalls = 0;
    let uMax = 0;
    let uGe2 = 0;
    let over = 0;
    let overN = 0;
    let agreeJev = 0;
    let agreeJevN = 0;

    for (const u of input.units) {
      const aL = lByKey.get(key(u.unit_id, q, domain, 'A'));
      const bL = lByKey.get(key(u.unit_id, q, domain, 'B'));
      if (!aL || !bL || !d.isGoldLabel(aL) || !d.isGoldLabel(bL)) {
        ineligible[domain] += 1;
        continue;
      }
      const adjL = lByKey.get(key(u.unit_id, q, domain, 'ADJ'));
      // ⛔ disagreement is retained from the RAW labels, whatever adjudication does later.
      if (aL.value !== bL.value) {
        disagreements[domain].push({ unit_id: u.unit_id, task_shape: u.task_shape, a: aL.value, b: bL.value, adjudicated: adjL ? adjL.value : null });
      }
      if (domain === 'P') {
        eligibleP += 1;
        if (aL.value === 'UNDETERMINABLE' || bL.value === 'UNDETERMINABLE') {
          undeterminableP += 1;
          continue;
        }
      }
      const eff = d.adjudicate(aL.value, bL.value, adjL?.value);
      if (eff.a === 'UNDETERMINABLE' || eff.b === 'UNDETERMINABLE') continue;
      nEligible += 1;

      let positive: boolean;
      let H = 0;
      let cautionHeadline = false;
      if (isDepth) {
        const a = eff.a as number;
        const b = eff.b as number;
        ordPairs.push([a, b]);
        H = d.headlineDepth(a, b);
        positive = H >= DEPTH_WARRANTED_MIN_BAND;
      } else {
        const bq = q as BoolQuestionId;
        const a = eff.a as boolean;
        const b = eff.b as boolean;
        cohenPairs.push([isCaution(bq, a), isCaution(bq, b)]);
        cautionHeadline = d.headlineCaution(isCaution(bq, a), isCaution(bq, b));
        positive = cautionHeadline;
      }

      const rec = jByKey.get(key(u.unit_id, q));
      const j = rec?.judgment;

      // context-only agreement (never a headline)
      if (j && (j.kind === 'score' || j.kind === 'yesno')) {
        agreeJevN += 1;
        if (j.kind === 'score') {
          if (d.bandOf(j.score) === H) agreeJev += 1;
        } else if (isCaution(q as BoolQuestionId, j.answer) === cautionHeadline) agreeJev += 1;
      }

      if (isDepth && j && j.kind === 'score') {
        const band = d.bandOf(j.score);
        if (band > H) over += 1;
        overN += 1;
      }
      if (!positive) continue;
      nPos += 1;
      if (!j) {
        nPosUnjudged += 1;
        continue;
      }
      const t = d.classifyJudgment(j.kind);
      if (t.bucket === 'abstain') nPosAbstain += 1;
      if (t.bucket === 'host_failure') nPosHost += 1;
      if (t.bucket === 'judged') {
        nPosJudged += 1;
        if (j.kind === 'score') {
          const U = d.depthUnder(H, d.bandOf(j.score));
          if (U > 0) {
            anyK += 1;
            uSum += U;
            uUndercalls += 1;
            if (U > uMax) uMax = U;
          }
          if (U >= DEPTH_MATERIAL_U) {
            materialK += 1;
            uGe2 += 1;
          }
          TAUS.forEach((tau, i) => {
            if (U >= 1 && j.confidence >= tau) confK[i] = (confK[i] ?? 0) + 1;
          });
        } else if (j.kind === 'yesno') {
          const dangerous = !isCaution(q as BoolQuestionId, j.answer);
          if (dangerous) {
            anyK += 1;
            TAUS.forEach((tau, i) => {
              if (j.confidence >= tau) confK[i] = (confK[i] ?? 0) + 1;
            });
          }
        }
      } else if (t.inDenominator) {
        // a non-judged record the treatment chooses to put in the denominator
        nPosJudged += 1;
        if (t.countsAsError) anyK += 1;
        if (t.countsAsError && isDepth) materialK += 1;
      }
    }

    const ev = (k: number, n: number): Event =>
      n === 0 ? emptyEvent() : { k, n, point: k / n, bound: d.riskQuantity(k, n) };
    domains[domain] = {
      domain,
      n_eligible: nEligible,
      n_pos: nPos,
      n_pos_judged: nPosJudged,
      n_pos_abstain: nPosAbstain,
      n_pos_host_failure: nPosHost,
      n_pos_unjudged: nPosUnjudged,
      any: ev(anyK, nPosJudged),
      material: isDepth ? ev(materialK, nPosJudged) : null,
      confident: TAUS.map((tau, i) => ({ tau, ...ev(confK[i] ?? 0, nPosJudged) })),
      depth: isDepth
        ? {
            pct_u_gt0: nPosJudged === 0 ? null : uUndercalls / nPosJudged,
            pct_u_ge2: nPosJudged === 0 ? null : uGe2 / nPosJudged,
            mean_u_among_undercalls: uUndercalls === 0 ? null : uSum / uUndercalls,
            max_u: uMax,
            over_deliberation: { k: over, n: overN },
          }
        : null,
      agreement_with_jev: agreeJevN === 0 ? null : agreeJev / agreeJevN,
    };
    agreement[domain] = isDepth
      ? { kappa: weightedKappaQuadratic(ordPairs), n_pairs: ordPairs.length, kind: 'weighted_quadratic' }
      : { kappa: cohenKappa(cohenPairs), n_pairs: cohenPairs.length, kind: 'cohen' };
  }

  // utility: its own domain, computed over every provider record for this question ──
  let nRec = 0;
  let nJudged = 0;
  let nAbstain = 0;
  let nHost = 0;
  let nReduce = 0;
  for (const r of input.judgments) {
    if (r.judgment.question_id !== q || !unitById.has(r.unit_id)) continue;
    nRec += 1;
    const t = d.classifyJudgment(r.judgment.kind);
    if (t.bucket === 'judged') {
      nJudged += 1;
      const j = r.judgment;
      if (j.kind === 'score' && d.bandOf(j.score) <= DEPTH_REDUCTION_MAX_BAND) nReduce += 1;
      if (j.kind === 'yesno' && !isCaution(j.question_id, j.answer)) nReduce += 1;
    } else if (t.bucket === 'abstain') nAbstain += 1;
    else nHost += 1;
  }
  const util: Utility = {
    n_records: nRec,
    n_judged: nJudged,
    n_abstain: nAbstain,
    n_host_failure: nHost,
    abstain_rate: nRec === 0 ? null : nAbstain / nRec,
    host_failure_rate: nRec === 0 ? null : nHost / nRec,
    recommended_reduction_rate: nRec === 0 ? null : nReduce / nRec,
  };

  // verdict ─────────────────────────────────────────────────────────────────────
  const reasons: string[] = [];
  const F = domains.F;
  const P = domains.P;
  const kF = agreement.F.kappa;
  if (kF === null) reasons.push('AGREEMENT_UNDEFINED');
  else if (kF < cfg.kappa_floor) reasons.push('AGREEMENT_BELOW_FLOOR');
  if (F.n_pos_judged < cfg.min_positives) reasons.push('INSUFFICIENT_JUDGED_POSITIVES');
  const undetRate = eligibleP === 0 ? null : undeterminableP / eligibleP;
  if (undetRate !== null && undetRate > cfg.max_undeterminable_rate) reasons.push('UNDETERMINABLE_FROM_PACKET');

  const gate = {} as QuestionReport['gate'];
  const gating = d.verdictDomains();
  for (const dom of ['P', 'F'] as const) {
    const r = domains[dom];
    if (r.n_pos_judged < cfg.min_positives) gate[dom] = 'UNASSESSED';
    else gate[dom] = d.domainFails(q, r, util, cfg) ? 'FAIL' : 'PASS';
  }

  let verdict: Verdict;
  let cause: QuestionReport['cause'] = null;
  if (reasons.length > 0) {
    verdict = d.uninterpretableVerdict();
  } else {
    const failing = gating.filter((dom) => gate[dom] === 'FAIL');
    if (failing.length > 0) {
      verdict = 'NOT_ADMISSIBLE';
      if (gate.P === 'FAIL') cause = 'PROVIDER_ERROR_ON_PACKET';
      else if (gate.F === 'FAIL') cause = gate.P === 'PASS' ? 'PACKET_INSUFFICIENCY' : 'F_FAIL_P_UNASSESSED';
      reasons.push(...failing.map((dom) => `GATE_${dom}_FAIL`));
    } else {
      verdict = 'ADVISORY_ADMISSIBLE';
    }
  }
  void P;
  return { question_id: q, verdict, reasons, cause, gate, agreement, domains, utility: util, disagreements, ineligible, undeterminable_rate_P: undetRate };
}
