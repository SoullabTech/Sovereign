/**
 * JARVIS-ROUTING-INTELLIGENCE-01 / J2-R1 / J1R4-F1 — defeat candidates.
 *
 * Each candidate is the REFERENCE with EXACTLY the decision needed to embody one
 * named constitutional error (act §IV: "differ from the reference only as much as
 * needed"). Every candidate DELEGATES to the reference and perturbs one path.
 *
 * ⛔ None is an implementation proposal.
 *
 * Act §IV: a candidate must be EXECUTABLE. Where a wrong implementation would not
 * typecheck, the error is embodied through `unknown`/cast boundaries so the compiler
 * cannot save the constitution by making the error unbuildable.
 */
import {
  FILE_COUNT_MAX,
  TASK_SHAPES,
  derive,
  isAbstainShaped,
  isModelAbstainReason,
  referenceAdmit,
  referenceClassShapeEligible,
  referenceConstructPacket,
  type AdmittedJudgment,
  type Advice,
  type AuthorityState,
  type ConstructionResult,
  type ContractModel,
  type JudgmentPacket,
  type QuestionId,
  type WorkUnitState,
} from './contract-model';

// ───────────────────────────── isolation helpers ─────────────────────────────

/** Delegate to the reference; only when it refuses FOR OVERFLOW, compress instead. */
const overflowCandidate = (transform: (n: number) => unknown): Partial<ContractModel> => ({
  constructPacket: (state, q): ConstructionResult => {
    const r = referenceConstructPacket(state, q);
    if (r.ok) return r;
    if (state.fileCount <= FILE_COUNT_MAX) return r; // some OTHER law refuses — stay refusing
    const rebuilt = referenceConstructPacket({ ...state, fileCount: 0 }, q);
    if (!rebuilt.ok) return r;
    const packet = {
      ...rebuilt.packet,
      change_scope: {
        ...rebuilt.packet.change_scope,
        file_count: transform(state.fileCount) as number,
      },
    };
    return { ok: true, packet };
  },
});

/** Delegate; on success add exactly one unlawful member. */
const addsMember = (key: string, value: (s: WorkUnitState) => unknown): Partial<ContractModel> => ({
  constructPacket: (state, q): ConstructionResult => {
    const r = referenceConstructPacket(state, q);
    if (!r.ok) return r;
    const p = { ...r.packet } as unknown as Record<string, unknown>;
    p[key] = value(state);
    return { ok: true, packet: p as unknown as JudgmentPacket };
  },
});

/** Delegate; perturb only the Abstain-shaped-with-forged-reason path. */
const forgedReasonCandidate = (
  handle: (packet: JudgmentPacket, reason: unknown) => AdmittedJudgment,
): Partial<ContractModel> => ({
  admit: (packet, o): AdmittedJudgment => {
    if (o.parsed && !o.timedOut && !o.empty && isAbstainShaped(o.raw)) {
      const raw = o.raw as { question_id?: unknown; reason?: unknown };
      if (raw.question_id === packet.question_id && !isModelAbstainReason(raw.reason)) {
        return handle(packet, raw.reason);
      }
    }
    return referenceAdmit(packet, o);
  },
});

const noAdded = (a: AuthorityState, acts: readonly string[]): AuthorityState =>
  ({ ...a, availableActs: acts });

const hasYes = (js: readonly AdmittedJudgment[], q: QuestionId): boolean =>
  js.some((j) => j.kind === 'YesNo' && j.question_id === q && j.answer);

export const CANDIDATES: Readonly<Record<string, ContractModel>> = {
  // ── authority invariance ──────────────────────────────────────────────────
  'DC-REMOVES-AUTHORIZED-ACT': derive({
    applyAuthority: (prior, js) =>
      hasYes(js, 'Q_SUFFICIENT')
        ? noAdded(prior, prior.availableActs.filter((a) => a !== 'LOCAL_INFERENCE'))
        : prior,
  }),
  'DC-ADDS-AUTHORIZED-ACT': derive({
    applyAuthority: (prior, js) =>
      hasYes(js, 'Q_LLM_NEEDED') ? noAdded(prior, [...prior.availableActs, 'EXTERNAL_INFERENCE']) : prior,
  }),
  'DC-ADVICE-FEEDS-AUTHORITY': derive({
    applyAuthority: (prior, js) => {
      const d = js.find((j) => j.kind === 'Score' && j.question_id === 'Q_DEPTH');
      return d && d.kind === 'Score' && d.score > 0.9
        ? { ...prior, deliberationFloor: d.score } // advice VALUE reaches authority
        : prior;
    },
  }),
  'DC-REMOVAL-CHANGES-LATTICE': derive({
    applyAuthority: (prior, js) => (js.length === 0 ? { ...prior, guardRaised: false } : prior),
  }),
  'DC-CONFIDENCE-TOUCHES-AUTHORITY': derive({
    applyAuthority: (prior, js) => {
      const confident = js.some((j) => j.kind !== 'Abstain' && j.confidence > 0.5);
      return confident ? { ...prior, deliberationFloor: prior.deliberationFloor + 0.1 } : prior;
    },
  }),
  'DC-REPLAY-ACCUMULATES': derive({
    applyAuthority: (prior, js) =>
      js.length > 1 ? { ...prior, deliberationFloor: prior.deliberationFloor + js.length } : prior,
  }),
  'DC-AGREEMENT-IS-STANDING': derive({
    applyAuthority: (prior, js) =>
      js.filter((j) => j.kind === 'YesNo' && j.answer).length >= 2
        ? { ...prior, gates: [...prior.gates, 'G_AGREED'] }
        : prior,
  }),
  'DC-AGREEMENT-AS-AUTHORITY': derive({
    applyAuthority: (prior, js) =>
      js.filter((j) => j.kind === 'YesNo' && j.answer).length >= 2
        ? { ...prior, openRequirements: prior.openRequirements.filter((r) => r !== 'INDEPENDENT_REVIEW') }
        : prior,
  }),
  'DC-DISCHARGES-REVIEW': derive({
    applyAuthority: (prior, js) =>
      js.some((j) => j.kind === 'Score') ? { ...prior, openRequirements: [] } : prior,
  }),
  'DC-ABSTAIN-MOVES-AUTHORITY': derive({
    applyAuthority: (prior, js) =>
      js.length > 0 && js.every((j) => j.kind === 'Abstain')
        ? noAdded(prior, prior.availableActs.filter((a) => a !== 'PROPOSE'))
        : prior,
  }),

  // ── question asymmetries ──────────────────────────────────────────────────
  'DC-FALSE-LOWERS-GUARD': derive({
    applyAuthority: (prior, js) =>
      js.some((j) => j.kind === 'YesNo' && j.question_id === 'Q_RISK' && j.answer === false)
        ? { ...prior, guardRaised: false }
        : prior,
  }),
  'DC-LOW-DEPTH-LOWERS-FLOOR': derive({
    produceAdvice: (prior, js) => {
      let next: Advice = prior;
      for (const j of js) {
        if (j.kind === 'Score' && j.question_id === 'Q_DEPTH') next = { ...next, depth: j.score };
      }
      return next;
    },
  }),
  'DC-LLM-TRUE-GRANTS': derive({
    applyAuthority: (prior, js) =>
      hasYes(js, 'Q_LLM_NEEDED') ? { ...prior, gates: [...prior.gates, 'G_MODEL_ELIGIBLE'] } : prior,
  }),
  'DC-ORPHAN-ADVICE-SURFACE': derive({
    produceAdvice: (prior, js) =>
      ({ ...prior, escalate: js.length > 0, preferredRoute: 'LOCAL_QWEN' } as unknown as Advice),
  }),
  'DC-SELF-STANDING': derive({
    questionIds: () => ['Q_DEPTH', 'Q_RISK', 'Q_SUFFICIENT', 'Q_LLM_NEEDED', 'Q_JEV_SHOULD_USE'],
  }),

  // ── packet exactness ──────────────────────────────────────────────────────
  // ⭐ a PERFECTLY well-formed opaque identifier: class-legal under R-5, packet-illegal.
  'DC-CORRELATION-HANDLE': derive(addsMember('work_unit_ref', (s) => s.workUnitId)),
  'DC-EXTRA-MEMBER': derive(addsMember('trace_index', () => 7)),
  'DC-FREE-STRING': derive({
    classShapeEligible: (v) => (typeof v === 'string' ? true : referenceClassShapeEligible(v)),
  }),
  'DC-WRAPPER-ENVELOPE': derive({ outboundRepresentation: (packet) => ({ packet }) }),
  'DC-PROSE-IN-REPRESENTATION': derive({
    outboundRepresentation: (packet) => ({ ...packet, rationale: 'this work unit looks risky' }),
  }),
  'DC-QUESTION-TEXT': derive({
    outboundRepresentation: (packet) => ({
      ...packet,
      question_text: 'Does this appear to cross a structural-risk boundary?',
    }),
  }),
  // Work-unit-varying wording can ONLY reach the wire as content, so this candidate
  // necessarily also trips the member laws — declared collateral, not over-reach.
  'DC-VARYING-INSTRUCTION': derive(
    addsMember('guidance', (s) => `work unit ${s.workUnitId.slice(0, 6)} looks unusual`),
  ),

  // ── construction failure ──────────────────────────────────────────────────
  'DC-CLAMP-ON-OVERFLOW': derive(overflowCandidate(() => FILE_COUNT_MAX)),
  'DC-STRINGIFY-OVERFLOW': derive(overflowCandidate(() => '>10000')),
  'DC-BUCKET-OVERFLOW': derive(overflowCandidate(() => '10000+')),
  'DC-HASH-OVERFLOW': derive(overflowCandidate((n) => (n * 2654435761) % 1_000_000)),
  'DC-DEFAULT-SUBSTITUTION': derive(overflowCandidate(() => 0)),
  'DC-LOCAL-OVERFLOW-ENUM': derive(overflowCandidate(() => 'FILE_COUNT_OVERFLOW')),
  'DC-SPLIT-TO-FIT': derive(overflowCandidate(() => 500)),
  'DC-FAILURE-AS-ABSTENTION': derive({
    constructionFailureEffect: () => ({
      representationConstructed: false,
      providerConsulted: false,
      offendingValueRecorded: false,
      authorityChanged: false,
      recordedAsAbstention: true,
    }),
  }),
  'DC-FAILURE-CHANGES-AUTHORITY': derive({
    constructionFailureEffect: () => ({
      representationConstructed: false,
      providerConsulted: false,
      offendingValueRecorded: false,
      authorityChanged: true,
      recordedAsAbstention: false,
    }),
  }),
  'DC-FAILURE-LOGS-VALUE': derive({
    constructionFailureEffect: () => ({
      representationConstructed: false,
      providerConsulted: false,
      offendingValueRecorded: true,
      authorityChanged: false,
      recordedAsAbstention: false,
    }),
  }),
  'DC-REFUSAL-LOGS-PACKET': derive({ refusalRecordsPacket: () => true }),
  'DC-UNBOUND-TASKSHAPE': derive({
    constructPacket: (state, q): ConstructionResult => {
      const r = referenceConstructPacket(state, q);
      if (r.ok) return r;
      // coerce an unbound shape rather than refusing — but only the SHAPE path
      if (!(TASK_SHAPES as readonly string[]).includes(state.taskShape)) {
        return referenceConstructPacket({ ...state, taskShape: 'FRONTIER_UNKNOWN' }, q);
      }
      return r;
    },
  }),
  'DC-TASKSHAPE-DRIFT': derive({
    taskShapes: () => [
      'CODE_GROUNDED', 'ARCHITECTURE_REASONING', 'ADVERSARIAL_FALSIFICATION',
      'LONG_HORIZON_DECOMPOSITION', 'EVIDENCE_SYNTHESIS', 'FRONTIER_UNKNOWN', 'SEVENTH_SHAPE',
    ],
  }),

  // ── admission & provenance ────────────────────────────────────────────────
  'DC-MODEL-FORGES-HOST-REASON': derive(
    forgedReasonCandidate((packet, reason) => ({
      kind: 'Abstain',
      question_id: packet.question_id,
      reason: reason as never, // trusts the provider's claim about the host interaction
    })),
  ),
  'DC-HOST-REASON-PASSTHROUGH': derive(
    forgedReasonCandidate((packet, reason) => ({
      kind: 'Abstain',
      question_id: packet.question_id,
      reason: (typeof reason === 'string' ? reason : 'OUT_OF_RANGE') as never,
    })),
  ),
  'DC-FORGERY-DISCARDED': derive(
    forgedReasonCandidate(() => {
      throw new Error('forged host reason — silently discarded');
    }),
  ),
  'DC-FORGERY-AS-UNKNOWN-SHAPE': derive(
    forgedReasonCandidate((packet) => ({
      kind: 'Abstain',
      question_id: packet.question_id,
      reason: 'UNKNOWN_SHAPE', // reads structural "shape" as admissible TYPE
    })),
  ),
  'DC-UNION-COLLAPSE': derive(
    forgedReasonCandidate((packet) => ({
      kind: 'Abstain',
      question_id: packet.question_id,
      reason: 'REFUSED', // one union: a host reason becomes a model reason
    })),
  ),
  'DC-MODEL-REASON-WINS': derive({
    admit: (packet, o): AdmittedJudgment => {
      const raw = o.raw as { reason?: unknown } | undefined;
      // consults the model's self-report BEFORE the host's own observations
      if (raw && isModelAbstainReason(raw.reason)) {
        return { kind: 'Abstain', question_id: packet.question_id, reason: raw.reason };
      }
      return referenceAdmit(packet, o);
    },
  }),
  'DC-PRECEDENCE-REORDERED': derive({
    hostFailureReason: (o) => {
      if (!o.parsed) return 'PARSE_FAILURE'; // parse before timeout — reordered
      if (o.timedOut) return 'TIMEOUT';
      if (o.empty) return 'NO_RESPONSE';
      return 'OUT_OF_RANGE';
    },
    admit: (packet, o): AdmittedJudgment => {
      if (!o.parsed) return { kind: 'Abstain', question_id: packet.question_id, reason: 'PARSE_FAILURE' };
      return referenceAdmit(packet, o);
    },
  }),
  'DC-NONDETERMINISTIC-REASON': (() => {
    let n = 0;
    return derive({
      admit: (packet, o): AdmittedJudgment => {
        const raw = o.raw as { nd?: unknown } | undefined;
        if (raw && raw.nd === true) {
          n += 1;
          return {
            kind: 'Abstain',
            question_id: packet.question_id,
            reason: n % 2 === 0 ? 'OUT_OF_RANGE' : 'UNKNOWN_SHAPE',
          };
        }
        return referenceAdmit(packet, o);
      },
    });
  })(),
  'DC-FABRICATED-QUESTION-ID': derive({
    admit: (packet, o): AdmittedJudgment => {
      if (o.timedOut) {
        // invents a response identity instead of using the packet's
        return { kind: 'Abstain', question_id: 'Q_LLM_NEEDED', reason: 'TIMEOUT' };
      }
      return referenceAdmit(packet, o);
    },
  }),
  'DC-QUESTION-FROM-RESPONSE': derive({
    admit: (packet, o): AdmittedJudgment => {
      const raw = o.raw as { question_id?: unknown } | undefined;
      if (raw && typeof raw.question_id === 'string' && raw.question_id !== packet.question_id) {
        // takes the expected question from the RESPONSE
        return { kind: 'Abstain', question_id: raw.question_id as QuestionId, reason: 'OUT_OF_RANGE' };
      }
      return referenceAdmit(packet, o);
    },
  }),
  'DC-ABSTAIN-REJECTED': derive({
    admit: (packet, o): AdmittedJudgment => {
      const raw = o.raw as { reason?: unknown } | undefined;
      // rejects a LAWFUL ProviderAbstain because it is not the question's declared shape
      if (raw && isModelAbstainReason(raw.reason)) {
        return { kind: 'Abstain', question_id: packet.question_id, reason: 'UNKNOWN_SHAPE' };
      }
      return referenceAdmit(packet, o);
    },
  }),
};

export const CANDIDATE_IDS = Object.keys(CANDIDATES).sort();
