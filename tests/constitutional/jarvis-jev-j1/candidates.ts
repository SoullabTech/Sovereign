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
  CONTRACT_SCALE,
  DECLARED_SHAPE,
  PROVIDER_ABSTAIN_MEMBERS,
  SCALE_MEMBERS,
  SCORE_MEMBERS,
  YESNO_MEMBERS,
  exactMembers,
  inUnitInterval,
  isAbstainShaped,
  isScoreShaped,
  isYesNoShaped,
  FILE_COUNT_MAX,
  PACKET_VERSION,
  isAbstainValue,
  isScoreValue,
  isYesNoValue,
  TASK_SHAPES,
  derive,
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
  js.some((j) => isYesNoValue(j) && j.question_id === q && j.answer);

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
      const d = js.find((j) => isScoreValue(j) && j.question_id === 'Q_DEPTH');
      return d && isScoreValue(d) && d.score > 0.9
        ? { ...prior, deliberationFloor: d.score } // advice VALUE reaches authority
        : prior;
    },
  }),
  'DC-REMOVAL-CHANGES-LATTICE': derive({
    applyAuthority: (prior, js) => (js.length === 0 ? { ...prior, guardRaised: false } : prior),
  }),
  'DC-CONFIDENCE-TOUCHES-AUTHORITY': derive({
    applyAuthority: (prior, js) => {
      const confident = js.some((j) => !isAbstainValue(j) && j.confidence > 0.5);
      return confident ? { ...prior, deliberationFloor: prior.deliberationFloor + 0.1 } : prior;
    },
  }),
  'DC-REPLAY-ACCUMULATES': derive({
    applyAuthority: (prior, js) =>
      js.length > 1 ? { ...prior, deliberationFloor: prior.deliberationFloor + js.length } : prior,
  }),
  'DC-AGREEMENT-IS-STANDING': derive({
    applyAuthority: (prior, js) =>
      js.filter((j) => isYesNoValue(j) && j.answer).length >= 2
        ? { ...prior, gates: [...prior.gates, 'G_AGREED'] }
        : prior,
  }),
  'DC-AGREEMENT-AS-AUTHORITY': derive({
    applyAuthority: (prior, js) =>
      js.filter((j) => isYesNoValue(j) && j.answer).length >= 2
        ? { ...prior, openRequirements: prior.openRequirements.filter((r) => r !== 'INDEPENDENT_REVIEW') }
        : prior,
  }),
  'DC-DISCHARGES-REVIEW': derive({
    applyAuthority: (prior, js) =>
      js.some((j) => isScoreValue(j)) ? { ...prior, openRequirements: [] } : prior,
  }),
  'DC-ABSTAIN-MOVES-AUTHORITY': derive({
    applyAuthority: (prior, js) =>
      js.length > 0 && js.every((j) => isAbstainValue(j))
        ? noAdded(prior, prior.availableActs.filter((a) => a !== 'PROPOSE'))
        : prior,
  }),

  // ── question asymmetries ──────────────────────────────────────────────────
  'DC-FALSE-LOWERS-GUARD': derive({
    applyAuthority: (prior, js) =>
      js.some((j) => isYesNoValue(j) && j.question_id === 'Q_RISK' && j.answer === false)
        ? { ...prior, guardRaised: false }
        : prior,
  }),
  'DC-LOW-DEPTH-LOWERS-FLOOR': derive({
    produceAdvice: (prior, js) => {
      let next: Advice = prior;
      for (const j of js) {
        if (isScoreValue(j) && j.question_id === 'Q_DEPTH') next = { ...next, depth: j.score };
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
      question_id: packet.question_id,
      reason: reason as never, // trusts the provider's claim about the host interaction
    })),
  ),
  'DC-HOST-REASON-PASSTHROUGH': derive(
    forgedReasonCandidate((packet, reason) => ({
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
      question_id: packet.question_id,
      reason: 'UNKNOWN_SHAPE', // reads structural "shape" as admissible TYPE
    })),
  ),
  'DC-UNION-COLLAPSE': derive(
    forgedReasonCandidate((packet) => ({
      question_id: packet.question_id,
      reason: 'REFUSED', // one union: a host reason becomes a model reason
    })),
  ),
  'DC-MODEL-REASON-WINS': derive({
    admit: (packet, o): AdmittedJudgment => {
      const raw = o.raw as { reason?: unknown } | undefined;
      // consults the model's self-report BEFORE the host's own observations
      if (raw && isModelAbstainReason(raw.reason)) {
        return { question_id: packet.question_id, reason: raw.reason };
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
      if (!o.parsed) return { question_id: packet.question_id, reason: 'PARSE_FAILURE' };
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
        return { question_id: 'Q_LLM_NEEDED', reason: 'TIMEOUT' };
      }
      return referenceAdmit(packet, o);
    },
  }),
  'DC-QUESTION-FROM-RESPONSE': derive({
    admit: (packet, o): AdmittedJudgment => {
      const raw = o.raw as { question_id?: unknown } | undefined;
      if (raw && typeof raw.question_id === 'string' && raw.question_id !== packet.question_id) {
        // takes the expected question from the RESPONSE
        return { question_id: raw.question_id as QuestionId, reason: 'OUT_OF_RANGE' };
      }
      return referenceAdmit(packet, o);
    },
  }),
  // ── F1R2: declared question -> response shape ────────────────────────────
  'DC-SCORE-FOR-YESNO-QUESTION': derive({
    admit: (packet, o): AdmittedJudgment => {
      // admits a Score for ANY question — ignores the declared mapping
      if (o.parsed && isScoreShaped(o.raw)) {
        const r = o.raw as { question_id?: unknown; score?: unknown; confidence?: unknown };
        if (r.question_id === packet.question_id && DECLARED_SHAPE[packet.question_id] !== 'Score') {
          return {
            question_id: packet.question_id,
            scale: CONTRACT_SCALE,
            score: r.score as number,
            confidence: r.confidence as number,
          };
        }
      }
      return referenceAdmit(packet, o);
    },
  }),
  'DC-YESNO-FOR-SCORE-QUESTION': derive({
    admit: (packet, o): AdmittedJudgment => {
      if (o.parsed && isYesNoShaped(o.raw)) {
        const r = o.raw as { question_id?: unknown; answer?: unknown; confidence?: unknown };
        if (r.question_id === packet.question_id && DECLARED_SHAPE[packet.question_id] !== 'YesNo') {
          return {
            question_id: packet.question_id,
            answer: r.answer as boolean,
            confidence: r.confidence as number,
          };
        }
      }
      return referenceAdmit(packet, o);
    },
  }),

  // ── F1R2: abstention carries no confidence ───────────────────────────────
  'DC-ABSTAIN-CONFIDENCE-ACCEPTED': derive({
    admit: (packet, o): AdmittedJudgment => {
      const r = o.raw as { question_id?: unknown; reason?: unknown } | undefined;
      // accepts the abstention and silently DROPS the inadmissible confidence
      // ⭐ F1R3 narrowing: perturbs ONLY the confidence path, so the general
      // closed-record law (DC-PROVIDER-ABSTAIN-EXTRA-MEMBER) is not collaterally tripped.
      if (o.parsed && isAbstainShaped(o.raw) && r && r.question_id === packet.question_id
          && isModelAbstainReason(r.reason) && 'confidence' in (o.raw as object)
          && exactMembers(o.raw, [...PROVIDER_ABSTAIN_MEMBERS, 'confidence'])) {
        return { question_id: packet.question_id, reason: r.reason };
      }
      return referenceAdmit(packet, o);
    },
  }),

  // ── F1R2: NaN / Infinity in a Real[0,1] position ─────────────────────────
  'DC-SCORE-NAN-ACCEPTED': derive({
    admit: (packet, o): AdmittedJudgment => {
      const r = o.raw as { question_id?: unknown; score?: unknown; confidence?: unknown } | undefined;
      // bare typeof/range comparisons — NaN and Infinity slip through
      const sc = (o.raw as { scale?: { min?: unknown; max?: unknown } } | undefined)?.scale;
      const scaleOk = typeof sc === 'object' && sc !== null && sc.min === 0 && sc.max === 1;
      if (o.parsed && isScoreShaped(o.raw) && r && r.question_id === packet.question_id
          && DECLARED_SHAPE[packet.question_id] === 'Score' && scaleOk
          && exactMembers(o.raw, SCORE_MEMBERS) && exactMembers(sc, SCALE_MEMBERS)
          && inUnitInterval(r.confidence)
          // ⭐ the ONLY loosened decision: a bare range comparison lets NaN/Infinity through
          && typeof r.score === 'number' && !(r.score < 0) && !(r.score > 1)) {
        return {
          question_id: packet.question_id,
          scale: CONTRACT_SCALE,
          score: r.score,
          confidence: r.confidence,
        };
      }
      return referenceAdmit(packet, o);
    },
  }),
  'DC-CONFIDENCE-NAN-ACCEPTED': derive({
    admit: (packet, o): AdmittedJudgment => {
      const r = o.raw as { question_id?: unknown; confidence?: unknown; answer?: unknown; score?: unknown } | undefined;
      // ⭐ the ONLY loosened decision: a bare range comparison on confidence.
      const looseConf = typeof r?.confidence === 'number' && !(r.confidence < 0) && !(r.confidence > 1);
      const sc = (o.raw as { scale?: { min?: unknown; max?: unknown } } | undefined)?.scale;
      const scaleOk = typeof sc === 'object' && sc !== null && sc.min === 0 && sc.max === 1;
      if (o.parsed && r && r.question_id === packet.question_id && looseConf) {
        // the SHARED mechanism reached from BOTH response shapes
        if (isScoreShaped(o.raw) && DECLARED_SHAPE[packet.question_id] === 'Score'
            && scaleOk && exactMembers(o.raw, SCORE_MEMBERS) && exactMembers(sc, SCALE_MEMBERS)
            && inUnitInterval(r.score)) {
          return {
            question_id: packet.question_id, scale: CONTRACT_SCALE,
            score: r.score, confidence: r.confidence as number,
          };
        }
        if (isYesNoShaped(o.raw) && DECLARED_SHAPE[packet.question_id] === 'YesNo'
            && exactMembers(o.raw, YESNO_MEMBERS) && typeof r.answer === 'boolean') {
          return {
            question_id: packet.question_id,
            answer: r.answer, confidence: r.confidence as number,
          };
        }
      }
      return referenceAdmit(packet, o);
    },
  }),

  // ── F1R1: Score fidelity ──────────────────────────────────────────────────
  'DC-SCORE-SCALE-OMITTED': derive({
    admit: (packet, o): AdmittedJudgment => {
      const r = o.raw as Record<string, unknown> | undefined;
      // treats question_id + score as sufficient — the exact F1 defect
      if (r && 'question_id' in r && 'score' in r && !('scale' in r)) {
        return {
          question_id: packet.question_id,
          scale: CONTRACT_SCALE,
          score: r['score'] as number,
          confidence: (r['confidence'] ?? 0.5) as number,
        };
      }
      return referenceAdmit(packet, o);
    },
  }),
  'DC-SCORE-SCALE-ALTERED': derive({
    admit: (packet, o): AdmittedJudgment => {
      const r = o.raw as { question_id?: unknown; scale?: unknown; score?: unknown; confidence?: unknown } | undefined;
      // ⭐ the ONLY loosened decision: an exactly-membered scale record is accepted
      // without judging min/max. (F1R3 narrowing: membership is still enforced, so the
      // closed-record laws are not collaterally tripped.)
      if (o.parsed && isScoreShaped(o.raw) && r && r.question_id === packet.question_id
          && DECLARED_SHAPE[packet.question_id] === 'Score'
          && exactMembers(o.raw, SCORE_MEMBERS) && exactMembers(r.scale, SCALE_MEMBERS)
          && inUnitInterval(r.score) && inUnitInterval(r.confidence)) {
        return {
          question_id: packet.question_id,
          scale: CONTRACT_SCALE,
          score: r.score,
          confidence: r.confidence,
        };
      }
      return referenceAdmit(packet, o);
    },
  }),
  'DC-SCORE-SCALE-DROPPED': derive({
    admit: (packet, o): AdmittedJudgment => {
      const a = referenceAdmit(packet, o);
      if (isScoreValue(a)) {
        // drops the contract-required scale from the admitted record
        const bare = { question_id: a.question_id, score: a.score, confidence: a.confidence };
        return bare as unknown as AdmittedJudgment;
      }
      return a;
    },
  }),

  // ── F1R1: construction exactness ──────────────────────────────────────────
  'DC-NONBOOLEAN-CONSTRUCTS': derive({
    constructPacket: (state, q): ConstructionResult => {
      const r = referenceConstructPacket(state, q);
      if (r.ok) return r;
      // coerces a non-boolean into a boolean position instead of refusing
      const coerced = {
        ...state,
        containsSensitive: Boolean(state.containsSensitive),
        requiresExternalInfo: Boolean(state.requiresExternalInfo),
        migration: Boolean(state.migration),
        auth: Boolean(state.auth),
        production: Boolean(state.production),
      };
      return referenceConstructPacket(coerced, q);
    },
  }),
  'DC-INVALID-QUESTION-CONSTRUCTS': derive({
    constructPacket: (state, q): ConstructionResult => {
      const r = referenceConstructPacket(state, q);
      if (r.ok) return r;
      // substitutes a default question instead of refusing an invalid selector
      const rebuilt = referenceConstructPacket(state, 'Q_RISK');
      if (!rebuilt.ok) return r;
      return { ok: true, packet: { ...rebuilt.packet, question_id: q as QuestionId } };
    },
  }),
  'DC-PACKET-VERSION-DRIFT': derive({
    constructPacket: (state, q): ConstructionResult => {
      const r = referenceConstructPacket(state, q);
      if (!r.ok) return r;
      return {
        ok: true,
        packet: { ...r.packet, packet_version: 'jev-4' as typeof PACKET_VERSION },
      };
    },
  }),

  // ── F1R3: closed records — each candidate DISCARDS the forbidden part and admits ──
  'DC-PROVIDER-ABSTAIN-EXTRA-MEMBER': derive({
    admit: (packet, o): AdmittedJudgment => {
      const r = o.raw as { question_id?: unknown; reason?: unknown } | undefined;
      // ⭐ the ONLY loosened decision: top-level ProviderAbstain membership.
      // ⛔ the confidence prohibition is NOT loosened, so this stays distinct from
      // DC-ABSTAIN-CONFIDENCE-ACCEPTED.
      if (o.parsed && !o.timedOut && !o.empty && isAbstainShaped(o.raw) && r
          && r.question_id === packet.question_id && isModelAbstainReason(r.reason)
          && !exactMembers(o.raw, PROVIDER_ABSTAIN_MEMBERS)
          && !('confidence' in (o.raw as object))) {
        return { question_id: packet.question_id, reason: r.reason };
      }
      return referenceAdmit(packet, o);
    },
  }),
  'DC-SCORE-EXTRA-MEMBER': derive({
    admit: (packet, o): AdmittedJudgment => {
      const r = o.raw as { question_id?: unknown; score?: unknown; confidence?: unknown } | undefined;
      const sc = (o.raw as { scale?: { min?: unknown; max?: unknown } } | undefined)?.scale;
      // ⭐ the ONLY loosened decision: top-level Score membership.
      if (o.parsed && isScoreShaped(o.raw) && r && r.question_id === packet.question_id
          && DECLARED_SHAPE[packet.question_id] === 'Score'
          && !exactMembers(o.raw, SCORE_MEMBERS)
          && exactMembers(sc, SCALE_MEMBERS) && sc?.min === 0 && sc?.max === 1
          && inUnitInterval(r.score) && inUnitInterval(r.confidence)) {
        return {
          question_id: packet.question_id,
          scale: CONTRACT_SCALE,
          score: r.score,
          confidence: r.confidence,
        };
      }
      return referenceAdmit(packet, o);
    },
  }),
  'DC-YESNO-EXTRA-MEMBER': derive({
    admit: (packet, o): AdmittedJudgment => {
      const r = o.raw as { question_id?: unknown; answer?: unknown; confidence?: unknown } | undefined;
      // ⭐ the ONLY loosened decision: top-level YesNo membership.
      if (o.parsed && isYesNoShaped(o.raw) && r && r.question_id === packet.question_id
          && DECLARED_SHAPE[packet.question_id] === 'YesNo'
          && !exactMembers(o.raw, YESNO_MEMBERS)
          && typeof r.answer === 'boolean' && inUnitInterval(r.confidence)) {
        return { question_id: packet.question_id, answer: r.answer, confidence: r.confidence };
      }
      return referenceAdmit(packet, o);
    },
  }),
  'DC-SCALE-EXTRA-MEMBER': derive({
    admit: (packet, o): AdmittedJudgment => {
      const r = o.raw as { question_id?: unknown; score?: unknown; confidence?: unknown } | undefined;
      const sc = (o.raw as { scale?: { min?: unknown; max?: unknown } } | undefined)?.scale;
      // ⭐ the ONLY loosened decision: membership of the NESTED Scale record.
      // min/max are still judged, so this stays distinct from DC-SCORE-SCALE-ALTERED.
      if (o.parsed && isScoreShaped(o.raw) && r && r.question_id === packet.question_id
          && DECLARED_SHAPE[packet.question_id] === 'Score'
          && exactMembers(o.raw, SCORE_MEMBERS)
          && typeof sc === 'object' && sc !== null && !exactMembers(sc, SCALE_MEMBERS)
          && sc.min === 0 && sc.max === 1
          && inUnitInterval(r.score) && inUnitInterval(r.confidence)) {
        return {
          question_id: packet.question_id,
          scale: CONTRACT_SCALE,
          score: r.score,
          confidence: r.confidence,
        };
      }
      return referenceAdmit(packet, o);
    },
  }),
  'DC-ADMITTED-EXTRA-MEMBER': derive({
    admit: (packet, o): AdmittedJudgment => {
      const a = referenceAdmit(packet, o);
      // admits correctly, then ENRICHES the closed admitted record on the way out
      if (isAbstainValue(a)) {
        return { ...a, source: 'provider' } as unknown as AdmittedJudgment;
      }
      return a;
    },
  }),
  'DC-CHANGE-SCOPE-EXTRA-MEMBER': derive({
    constructPacket: (state, q): ConstructionResult => {
      const r = referenceConstructPacket(state, q);
      if (!r.ok) return r;
      // a class-legal primitive, nested where the top-level member laws cannot see it
      const packet = {
        ...r.packet,
        change_scope: { ...r.packet.change_scope, trace_index: 7 },
      };
      return { ok: true, packet: packet as unknown as JudgmentPacket };
    },
  }),

  'DC-ABSTAIN-REJECTED': derive({
    admit: (packet, o): AdmittedJudgment => {
      const raw = o.raw as { reason?: unknown } | undefined;
      // rejects a LAWFUL ProviderAbstain because it is not the question's declared shape
      if (raw && isModelAbstainReason(raw.reason)) {
        return { question_id: packet.question_id, reason: 'UNKNOWN_SHAPE' };
      }
      return referenceAdmit(packet, o);
    },
  }),
};

export const CANDIDATE_IDS = Object.keys(CANDIDATES).sort();
