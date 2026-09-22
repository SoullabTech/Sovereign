/**
 * JARVIS-ROUTING-INTELLIGENCE-01 / J2-R1 / J1R4-F1
 * Test-only executable model of the J1R4 Jev Judgment Contract.
 *
 * ⛔ This is NOT an adapter, NOT runtime authority, NOT a seed for one.
 * It exists so defeat candidates have something to be wrong against.
 *
 * Pinned contract authority : docs/programme/JARVIS-JEV-01_J1R4_JUDGMENT_CONTRACT_2026-09-22.md
 *                             blob 98eb6cf16223b83b4768e46e1ae253e7881ae5f5
 * Governing J0             : blob 494cd61973ed02c4453067716657631f3f9143e9
 * TaskShape substrate (J5) : blob e840d705c9c1059667379d321cc7b5c802045754
 */

// ───────────────────────────── J5-bound vocabulary (§3) ─────────────────────────────

export const TASK_SHAPES = [
  'CODE_GROUNDED',
  'ARCHITECTURE_REASONING',
  'ADVERSARIAL_FALSIFICATION',
  'LONG_HORIZON_DECOMPOSITION',
  'EVIDENCE_SYNTHESIS',
  'FRONTIER_UNKNOWN',
] as const;
export type TaskShape = (typeof TASK_SHAPES)[number];

// ───────────────────────────── J1-owned vocabulary (§6) ─────────────────────────────

export const QUESTION_IDS = ['Q_DEPTH', 'Q_RISK', 'Q_SUFFICIENT', 'Q_LLM_NEEDED'] as const;
export type QuestionId = (typeof QUESTION_IDS)[number];

/** §6.2 — ONLY the host may originate these. */
export const HOST_FAILURE_REASONS = [
  'TIMEOUT',
  'NO_RESPONSE',
  'PARSE_FAILURE',
  'UNKNOWN_SHAPE',
  'MISMATCHED_QUESTION',
  'OUT_OF_RANGE',
] as const;
export type HostFailureReason = (typeof HOST_FAILURE_REASONS)[number];

/** §6.2 — the provider may originate these. */
export const MODEL_ABSTAIN_REASONS = ['INSUFFICIENT_STATE', 'REFUSED'] as const;
export type ModelAbstainReason = (typeof MODEL_ABSTAIN_REASONS)[number];

export type AdmittedAbstainReason = HostFailureReason | ModelAbstainReason;

export const isHostFailureReason = (v: unknown): v is HostFailureReason =>
  typeof v === 'string' && (HOST_FAILURE_REASONS as readonly string[]).includes(v);
export const isModelAbstainReason = (v: unknown): v is ModelAbstainReason =>
  typeof v === 'string' && (MODEL_ABSTAIN_REASONS as readonly string[]).includes(v);

// ───────────────────────────── §2 the exact packet ─────────────────────────────

/** §2 — the exact six members. Nothing else is a member of the packet. */
export const PACKET_MEMBERS = [
  'packet_version',
  'question_id',
  'task_shape',
  'contains_sensitive',
  'requires_external_info',
  'change_scope',
] as const;

export const FILE_COUNT_MAX = 10_000;
export const PACKET_VERSION = 'jev-3' as const;

export interface ChangeScope {
  file_count: number;
  migration: boolean;
  auth: boolean;
  production: boolean;
}

export interface JudgmentPacket {
  packet_version: typeof PACKET_VERSION;
  question_id: QuestionId;
  task_shape: TaskShape;
  contains_sensitive: boolean;
  requires_external_info: boolean;
  change_scope: ChangeScope;
}

/** Host-side work unit state. Never sent; the packet is derived from it. */
export interface WorkUnitState {
  /** Host-local correlation only — §2.1 forbids this crossing the boundary. */
  readonly workUnitId: string;
  readonly taskShape: string;
  readonly fileCount: number;
  /**
   * ⭐ §5.5 boundary positions are typed `unknown`, NOT `boolean`. F1 typed them
   * `boolean`, so "a non-boolean in a boolean position must refuse construction"
   * could never be exercised — the compiler made the error unbuildable and that
   * was mistaken for enforcement.
   */
  readonly containsSensitive: unknown;
  readonly requiresExternalInfo: unknown;
  readonly migration: unknown;
  readonly auth: unknown;
  readonly production: unknown;
}

// ───────────────────────────── §5 construction outcome ─────────────────────────────

export type ConstructionResult =
  | { readonly ok: true; readonly packet: JudgmentPacket }
  | { readonly ok: false; readonly reason: 'UNREPRESENTABLE' };

/** §5.3 — what a construction failure does to the world. */
export interface ConstructionFailureEffect {
  readonly representationConstructed: boolean;
  readonly providerConsulted: boolean;
  readonly offendingValueRecorded: boolean;
  readonly authorityChanged: boolean;
  /** §5.4 — a construction failure is NOT an abstention. */
  readonly recordedAsAbstention: boolean;
}

// ───────────────────────────── §6.1 responses vs records ─────────────────────────────

/**
 * §6.1 — contract VALUES. ⛔ No `kind` tag: a harness discriminator must not become
 * part of the modeled AdmittedJudgment. Discrimination is STRUCTURAL (below).
 */
export interface Scale {
  readonly min: 0;
  readonly max: 1;
}
export const CONTRACT_SCALE: Scale = { min: 0, max: 1 };

export interface ScoreJudgment {
  readonly question_id: QuestionId;
  readonly scale: Scale; // ⭐ contract-required; F1 omitted it entirely
  readonly score: number;
  readonly confidence: number;
}
export interface YesNoJudgment {
  readonly question_id: QuestionId;
  readonly answer: boolean;
  readonly confidence: number;
}
export interface AdmittedAbstain {
  readonly question_id: QuestionId;
  readonly reason: AdmittedAbstainReason;
}
export type AdmittedJudgment = ScoreJudgment | YesNoJudgment | AdmittedAbstain;

const has = (v: unknown, k: string): boolean =>
  typeof v === 'object' && v !== null && k in v;

/** Structural discrimination over contract values — the harness tags nothing. */
export const isScoreValue = (v: unknown): v is ScoreJudgment =>
  has(v, 'question_id') && has(v, 'scale') && has(v, 'score') && has(v, 'confidence');
export const isYesNoValue = (v: unknown): v is YesNoJudgment =>
  has(v, 'question_id') && has(v, 'answer') && has(v, 'confidence');
export const isAbstainValue = (v: unknown): v is AdmittedAbstain =>
  has(v, 'question_id') && has(v, 'reason');

/**
 * What the host observed about the interaction. §7.2 orders these.
 * `raw` is deliberately `unknown`: malformed transport must be able to arrive
 * so a wrong implementation can actually execute on it (act §IV).
 */
export interface HostObservation {
  readonly timedOut: boolean;
  readonly empty: boolean;
  readonly parsed: boolean;
  readonly raw: unknown;
}

// ───────────────────────────── advice & authority ─────────────────────────────

/** §1 — EXACTLY the image of the question set. One member per question, no more. */
export interface Advice {
  readonly depth: number | null;
  readonly escalate: boolean;
  readonly clarify: boolean;
  readonly modelNeeded: boolean | null;
}
export const ADVICE_MEMBERS = ['depth', 'escalate', 'clarify', 'modelNeeded'] as const;

export const NEUTRAL_ADVICE: Advice = {
  depth: null,
  escalate: false,
  clarify: false,
  modelNeeded: null,
};

export interface AuthorityState {
  readonly availableActs: readonly string[];
  readonly prohibitedActs: readonly string[];
  readonly openRequirements: readonly string[];
  readonly gates: readonly string[];
  /** An independently established deliberation floor — advice may not lower it. */
  readonly deliberationFloor: number;
  /** Guard state — a `false` answer may never lower it. */
  readonly guardRaised: boolean;
}

export const BASE_AUTHORITY: AuthorityState = {
  availableActs: ['READ', 'PROPOSE', 'LOCAL_INFERENCE'],
  prohibitedActs: ['REPOSITORY_WRITE', 'DEPLOY'],
  openRequirements: ['INDEPENDENT_REVIEW'],
  gates: ['G_DISCLOSURE', 'G_EXECUTION'],
  deliberationFloor: 0.5,
  guardRaised: true,
};

// ───────────────────────────── the model interface ─────────────────────────────

export interface ContractModel {
  /** §2 + §5 — derive the packet, or refuse to construct. */
  constructPacket(state: WorkUnitState, question: QuestionId | string): ConstructionResult;
  /** §4.1 — the representation IS the packet; no wrapper. */
  outboundRepresentation(packet: JudgmentPacket): unknown;
  /** §2 — the exact member set of a packet value. */
  packetMembers(packet: unknown): readonly string[];
  /**
   * Parent capability-class grammar (`repository_derived_metadata`, ratified R-5).
   * PERMITS opaque identifiers among other shapes. J1 does not own or narrow this.
   */
  classShapeEligible(value: unknown): boolean;
  /** §5.3 — what happens to the world when construction refuses. */
  constructionFailureEffect(state: WorkUnitState): ConstructionFailureEffect;
  /** §7.2 — deterministic total precedence over ACTUAL host observations. */
  hostFailureReason(obs: HostObservation): HostFailureReason;
  /** §7.1 — admission, bound to packet.question_id. */
  admit(packet: JudgmentPacket, obs: HostObservation): AdmittedJudgment;
  /** §1 / I2 — advice is the only mutable output. */
  produceAdvice(prior: Advice, judgments: readonly AdmittedJudgment[]): Advice;
  /** §1 / I1 — authority is INVARIANT under every judgment set. */
  applyAuthority(prior: AuthorityState, judgments: readonly AdmittedJudgment[]): AuthorityState;
  /** §A5 / §3.9 — a refusal must not disclose. */
  refusalRecordsPacket(): boolean;
  /** §3 — the TaskShape vocabulary this model treats as bound to the J5 blob. */
  taskShapes(): readonly string[];
  /** §3.5 / A6 — the question set this model exposes. */
  questionIds(): readonly string[];
}

// ───────────────────────────── reference implementation ─────────────────────────────

const isTaskShape = (v: unknown): v is TaskShape =>
  typeof v === 'string' && (TASK_SHAPES as readonly string[]).includes(v);

const REFUSE = { ok: false, reason: 'UNREPRESENTABLE' } as const;

export const referenceConstructPacket = (
  state: WorkUnitState,
  question: QuestionId | string,
): ConstructionResult => {
  // §5 — any value that cannot be expressed exactly refuses construction.
  if (!isTaskShape(state.taskShape)) return REFUSE;
  if (!Number.isInteger(state.fileCount)) return REFUSE;
  if (state.fileCount < 0 || state.fileCount > FILE_COUNT_MAX) return REFUSE;
  if (!(QUESTION_IDS as readonly string[]).includes(question)) return REFUSE;
  // §5.5 — a non-boolean in a boolean position refuses construction.
  const cs = state.containsSensitive;
  const re = state.requiresExternalInfo;
  const mg = state.migration;
  const au = state.auth;
  const pr = state.production;
  if (typeof cs !== 'boolean') return REFUSE;
  if (typeof re !== 'boolean') return REFUSE;
  if (typeof mg !== 'boolean') return REFUSE;
  if (typeof au !== 'boolean') return REFUSE;
  if (typeof pr !== 'boolean') return REFUSE;
  return {
    ok: true,
    packet: {
      packet_version: PACKET_VERSION,
      question_id: question as QuestionId,
      task_shape: state.taskShape,
      contains_sensitive: cs,
      requires_external_info: re,
      change_scope: { file_count: state.fileCount, migration: mg, auth: au, production: pr },
    },
  };
};

/** §7.2 — the fixed total order over actual host observations. */
export const referenceHostFailureReason = (obs: HostObservation): HostFailureReason => {
  if (obs.timedOut) return 'TIMEOUT';
  if (obs.empty) return 'NO_RESPONSE';
  if (!obs.parsed) return 'PARSE_FAILURE';
  if (!isAbstainShaped(obs.raw) && !isScoreShaped(obs.raw) && !isYesNoShaped(obs.raw)) {
    return 'UNKNOWN_SHAPE';
  }
  return 'OUT_OF_RANGE';
};

// Structural shape predicates. §7.2: STRUCTURE, never admissible type.
export const isAbstainShaped = (v: unknown): boolean => has(v, 'question_id') && has(v, 'reason');
/** ⭐ §6.1 structure: a Score-shaped response carries question_id + scale + score + confidence. */
export const isScoreShaped = (v: unknown): boolean =>
  has(v, 'question_id') && has(v, 'scale') && has(v, 'score') && has(v, 'confidence');
export const isYesNoShaped = (v: unknown): boolean =>
  has(v, 'question_id') && has(v, 'answer') && has(v, 'confidence');

const questionOf = (v: unknown): unknown =>
  typeof v === 'object' && v !== null && 'question_id' in v
    ? (v as { question_id: unknown }).question_id
    : undefined;

export const referenceAdmit = (
  packet: JudgmentPacket,
  obs: HostObservation,
): AdmittedJudgment => {
  const q = packet.question_id; // §7.1 — from the packet the host SENT, never the response.

  if (obs.timedOut) return { question_id: q, reason: 'TIMEOUT' };
  if (obs.empty) return { question_id: q, reason: 'NO_RESPONSE' };
  if (!obs.parsed) return { question_id: q, reason: 'PARSE_FAILURE' };

  const raw = obs.raw;
  const scoreShaped = isScoreShaped(raw);
  const yesNoShaped = isYesNoShaped(raw);
  const abstainShaped = isAbstainShaped(raw);

  // 4 — STRUCTURE only.
  if (!scoreShaped && !yesNoShaped && !abstainShaped) {
    return { question_id: q, reason: 'UNKNOWN_SHAPE' };
  }
  // 5 — recognized structure, wrong question.
  if (questionOf(raw) !== q) {
    return { question_id: q, reason: 'MISMATCHED_QUESTION' };
  }
  // 6 — value validity, including a provider-originated HostFailureReason.
  if (abstainShaped) {
    const reason = (raw as { reason: unknown }).reason;
    if (isModelAbstainReason(reason)) return { question_id: q, reason };
    // ⭐ forged host reason (or any other bad value) → the host's own OUT_OF_RANGE.
    return { question_id: q, reason: 'OUT_OF_RANGE' };
  }
  if (scoreShaped) {
    const r = raw as { scale: unknown; score: unknown; confidence: unknown };
    const sc = r.scale as { min?: unknown; max?: unknown } | null;
    // ⭐ scale is structurally PRESENT (else UNKNOWN_SHAPE above); here its VALUE is judged.
    const scaleOk = typeof sc === 'object' && sc !== null && sc.min === 0 && sc.max === 1;
    const sv = r.score;
    const cv = r.confidence;
    if (!scaleOk) return { question_id: q, reason: 'OUT_OF_RANGE' };
    if (typeof sv !== 'number' || sv < 0 || sv > 1) return { question_id: q, reason: 'OUT_OF_RANGE' };
    if (typeof cv !== 'number' || cv < 0 || cv > 1) return { question_id: q, reason: 'OUT_OF_RANGE' };
    // ⭐ the admitted record PRESERVES the contract-required scale.
    return { question_id: q, scale: CONTRACT_SCALE, score: sv, confidence: cv };
  }
  const a = (raw as { answer: unknown }).answer;
  const c2 = (raw as { confidence?: unknown }).confidence;
  if (typeof a !== 'boolean' || typeof c2 !== 'number' || c2 < 0 || c2 > 1) {
    return { question_id: q, reason: 'OUT_OF_RANGE' };
  }
  return { question_id: q, answer: a, confidence: c2 };
};

export const referenceProduceAdvice = (
  prior: Advice,
  judgments: readonly AdmittedJudgment[],
): Advice => {
  let next: Advice = prior;
  for (const j of judgments) {
    if (isAbstainValue(j)) continue; // I7 — authority-inert, advice-neutral.
    if (isScoreValue(j) && j.question_id === 'Q_DEPTH') {
      // low depth may never reduce an established floor — advice only raises.
      next = { ...next, depth: Math.max(next.depth ?? 0, j.score) };
    }
    if (isYesNoValue(j) && j.question_id === 'Q_RISK') {
      next = { ...next, escalate: next.escalate || j.answer }; // false lowers nothing
    }
    if (isYesNoValue(j) && j.question_id === 'Q_SUFFICIENT') {
      next = { ...next, clarify: next.clarify || !j.answer }; // true discharges nothing
    }
    if (isYesNoValue(j) && j.question_id === 'Q_LLM_NEEDED') {
      next = { ...next, modelNeeded: j.answer === false ? false : next.modelNeeded };
    }
  }
  return next;
};

/** I1 — authority is invariant. The reference returns the prior state, always. */
export const referenceApplyAuthority = (
  prior: AuthorityState,
  _judgments: readonly AdmittedJudgment[],
): AuthorityState => prior;

/**
 * Parent class grammar: `repository_derived_metadata` (ratified R-5).
 * ⭐ PERMITS opaque identifiers. J1 does not own this vocabulary and must not narrow it.
 */
export const OPAQUE_ID = /^[0-9a-f]{32}$/;
export const referenceClassShapeEligible = (value: unknown): boolean => {
  if (typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'string') {
    return (
      OPAQUE_ID.test(value) ||
      (TASK_SHAPES as readonly string[]).includes(value) ||
      (QUESTION_IDS as readonly string[]).includes(value) ||
      value === PACKET_VERSION
    );
  }
  if (Array.isArray(value)) return value.every(referenceClassShapeEligible);
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).every(referenceClassShapeEligible);
  }
  return false;
};

export const REFERENCE: ContractModel = {
  constructPacket: referenceConstructPacket,
  outboundRepresentation: (packet) => packet, // §4.1 — no wrapper, no envelope
  packetMembers: (packet) =>
    typeof packet === 'object' && packet !== null ? Object.keys(packet) : [],
  classShapeEligible: referenceClassShapeEligible,
  constructionFailureEffect: () => ({
    representationConstructed: false,
    providerConsulted: false,
    offendingValueRecorded: false,
    authorityChanged: false,
    recordedAsAbstention: false,
  }),
  hostFailureReason: referenceHostFailureReason,
  admit: referenceAdmit,
  produceAdvice: referenceProduceAdvice,
  applyAuthority: referenceApplyAuthority,
  refusalRecordsPacket: () => false,
  taskShapes: () => TASK_SHAPES,
  questionIds: () => QUESTION_IDS,
};

/** Build a candidate by replacing exactly the named decisions. */
export const derive = (overrides: Partial<ContractModel>): ContractModel => ({
  ...REFERENCE,
  ...overrides,
});

// ───────────────────────────── shared fixtures ─────────────────────────────

export const OK_STATE: WorkUnitState = {
  workUnitId: 'a'.repeat(32),
  taskShape: 'CODE_GROUNDED',
  containsSensitive: false,
  requiresExternalInfo: false,
  fileCount: 3,
  migration: false,
  auth: false,
  production: false,
};

export const OVERFLOW_STATE: WorkUnitState = { ...OK_STATE, fileCount: 15_000 };
export const UNBOUND_SHAPE_STATE: WorkUnitState = { ...OK_STATE, taskShape: 'SEVENTH_SHAPE' };
/** §5.5 — a non-boolean in a boolean position. Expressible because the field is `unknown`. */
export const NONBOOLEAN_STATE: WorkUnitState = { ...OK_STATE, migration: 'yes', auth: 1 };
export const INVALID_QUESTION = 'Q_NOT_A_QUESTION';

export const obs = (raw: unknown, over: Partial<HostObservation> = {}): HostObservation => ({
  timedOut: false,
  empty: false,
  parsed: true,
  raw,
  ...over,
});

/** A well-formed provider Score response, §6.1-complete. */
export const providerScore = (q: QuestionId, over: Record<string, unknown> = {}): unknown => ({
  question_id: q,
  scale: { min: 0, max: 1 },
  score: 0.8,
  confidence: 0.9,
  ...over,
});

export const okPacket = (q: QuestionId = 'Q_RISK'): JudgmentPacket => {
  const r = referenceConstructPacket(OK_STATE, q);
  if (!r.ok) throw new Error('fixture invariant: OK_STATE must construct');
  return r.packet;
};
