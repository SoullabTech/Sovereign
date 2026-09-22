/**
 * JARVIS-ROUTING-INTELLIGENCE-01 / J2-R1 / J1R4-F1 — falsifiers.
 *
 * Each falsifier asserts the IDENTITY of the required outcome (act §V),
 * never merely that "something failed".
 */
import {
  ADVICE_MEMBERS,
  CONTRACT_SCALE,
  INVALID_QUESTION,
  NONBOOLEAN_STATE,
  PACKET_VERSION as PV,
  isAbstainValue,
  isScoreValue,
  isYesNoValue,
  providerScore,
  BASE_AUTHORITY,
  FILE_COUNT_MAX,
  MODEL_ABSTAIN_REASONS,
  HOST_FAILURE_REASONS,
  NEUTRAL_ADVICE,
  OK_STATE,
  OVERFLOW_STATE,
  PACKET_MEMBERS,
  PACKET_VERSION,
  QUESTION_IDS,
  TASK_SHAPES,
  UNBOUND_SHAPE_STATE,
  obs,
  okPacket,
  type AdmittedJudgment,
  type AuthorityState,
  type ContractModel,
  type JudgmentPacket,
} from './contract-model';

const fail = (msg: string): never => {
  throw new Error(msg);
};

const sameAuthority = (a: AuthorityState, b: AuthorityState): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

const scoreAt = (q: 'Q_DEPTH', v: number): AdmittedJudgment => ({
  question_id: q,
  scale: CONTRACT_SCALE,
  score: v,
  confidence: 0.9,
});
const yesNo = (
  q: 'Q_RISK' | 'Q_SUFFICIENT' | 'Q_LLM_NEEDED',
  answer: boolean,
  confidence = 0.9,
): AdmittedJudgment => ({ question_id: q, answer, confidence });
const abst = (q: 'Q_RISK', reason: 'REFUSED'): AdmittedJudgment => ({ question_id: q, reason });

/** A well-formed opaque identifier — class-shape-legal under R-5. */
export const WELL_FORMED_OPAQUE_ID = 'b'.repeat(32);

const members = (m: ContractModel, p: unknown): readonly string[] => m.packetMembers(p);

const constructOk = (m: ContractModel): JudgmentPacket => {
  const r = m.constructPacket(OK_STATE, 'Q_RISK');
  if (!r.ok) return fail('reference precondition: OK_STATE must construct');
  return r.packet;
};

export type Falsifier = (m: ContractModel) => void;

export const FALSIFIERS: Readonly<Record<string, Falsifier>> = {
  // ── authority invariance (I1–I7) ──────────────────────────────────────────
  'DC-REMOVES-AUTHORIZED-ACT': (m) => {
    const after = m.applyAuthority(BASE_AUTHORITY, [yesNo('Q_SUFFICIENT', true)]);
    if (after.availableActs.length !== BASE_AUTHORITY.availableActs.length ||
        !BASE_AUTHORITY.availableActs.every((a) => after.availableActs.includes(a))) {
      fail('I1: available authorized act set must be IDENTICAL after a judgment');
    }
  },
  'DC-ADDS-AUTHORIZED-ACT': (m) => {
    const after = m.applyAuthority(BASE_AUTHORITY, [yesNo('Q_LLM_NEEDED', true)]);
    for (const a of after.availableActs) {
      if (!BASE_AUTHORITY.availableActs.includes(a)) fail(`I1: judgment created act ${a}`);
    }
  },

  'DC-ADVICE-FEEDS-AUTHORITY': (m) => {
    // I2 owns exactly this: the VALUE of advice must not reach authority.
    const hi = m.applyAuthority(BASE_AUTHORITY, [scoreAt('Q_DEPTH', 0.99)]);
    const lo = m.applyAuthority(BASE_AUTHORITY, [scoreAt('Q_DEPTH', 0.01)]);
    if (!sameAuthority(hi, lo)) {
      const a = m.produceAdvice(NEUTRAL_ADVICE, [scoreAt('Q_DEPTH', 0.99)]);
      fail(`I2: authority varied with advice value (${JSON.stringify(a)})`);
    }
  },
  'DC-REMOVAL-CHANGES-LATTICE': (m) => {
    const after = m.applyAuthority(BASE_AUTHORITY, []);
    if (!sameAuthority(after, BASE_AUTHORITY)) fail('I3/A7: absence must be the identity');
  },
  'DC-CONFIDENCE-TOUCHES-AUTHORITY': (m) => {
    // I4 owns exactly this: authority must not vary with confidence.
    const lo = m.applyAuthority(BASE_AUTHORITY, [yesNo('Q_RISK', true, 0.01)]);
    const hi = m.applyAuthority(BASE_AUTHORITY, [yesNo('Q_RISK', true, 0.99)]);
    if (!sameAuthority(lo, hi)) fail('I4: authority varied with confidence');
  },
  'DC-REPLAY-ACCUMULATES': (m) => {
    // I5 owns accumulation: N repeats must equal 1. Invariance itself is I1/I3's law.
    const one = m.applyAuthority(BASE_AUTHORITY, [yesNo('Q_RISK', true)]);
    const many = m.applyAuthority(BASE_AUTHORITY, [
      yesNo('Q_RISK', true), yesNo('Q_RISK', true), yesNo('Q_RISK', true),
    ]);
    if (!sameAuthority(one, many)) fail('I5: repetition accumulated into an authority change');
  },
  'DC-AGREEMENT-IS-STANDING': (m) => {
    const after = m.applyAuthority(BASE_AUTHORITY, [yesNo('Q_RISK', true), yesNo('Q_RISK', true)]);
    if (JSON.stringify(after.gates) !== JSON.stringify(BASE_AUTHORITY.gates)) {
      fail('I5: agreement conferred gate standing');
    }
  },
  'DC-AGREEMENT-AS-AUTHORITY': (m) => {
    const after = m.applyAuthority(BASE_AUTHORITY, [yesNo('Q_RISK', true), yesNo('Q_RISK', true)]);
    if (!after.openRequirements.includes('INDEPENDENT_REVIEW')) {
      fail('I5/I6: agreement satisfied a review requirement');
    }
  },
  'DC-DISCHARGES-REVIEW': (m) => {
    const after = m.applyAuthority(BASE_AUTHORITY, [scoreAt('Q_DEPTH', 1)]);
    if (!after.openRequirements.includes('INDEPENDENT_REVIEW')) {
      fail('I6: a single judgment marked a review requirement satisfied');
    }
  },
  'DC-ABSTAIN-MOVES-AUTHORITY': (m) => {
    const j: AdmittedJudgment = abst('Q_RISK', 'REFUSED');
    if (!sameAuthority(m.applyAuthority(BASE_AUTHORITY, [j]), BASE_AUTHORITY)) {
      fail('I7: an abstention changed authority state');
    }
  },

  // ── question asymmetries (§3.5) ───────────────────────────────────────────
  'DC-FALSE-LOWERS-GUARD': (m) => {
    const after = m.applyAuthority(BASE_AUTHORITY, [yesNo('Q_RISK', false)]);
    if (after.guardRaised !== BASE_AUTHORITY.guardRaised) {
      fail('Q_RISK=false changed guard state; it must be exactly unchanged');
    }
  },
  'DC-LOW-DEPTH-LOWERS-FLOOR': (m) => {
    const prior = { ...NEUTRAL_ADVICE, depth: 0.8 };
    const after = m.produceAdvice(prior, [scoreAt('Q_DEPTH', 0.1)]);
    if ((after.depth ?? 0) < 0.8) fail('low Q_DEPTH reduced an established floor');
    const auth = m.applyAuthority(BASE_AUTHORITY, [scoreAt('Q_DEPTH', 0.1)]);
    if (auth.deliberationFloor < BASE_AUTHORITY.deliberationFloor) {
      fail('low Q_DEPTH reduced the authority-side deliberation floor');
    }
  },
  'DC-LLM-TRUE-GRANTS': (m) => {
    const after = m.applyAuthority(BASE_AUTHORITY, [yesNo('Q_LLM_NEEDED', true)]);
    if (JSON.stringify(after.availableActs) !== JSON.stringify(BASE_AUTHORITY.availableActs) ||
        JSON.stringify(after.gates) !== JSON.stringify(BASE_AUTHORITY.gates)) {
      fail('Q_LLM_NEEDED=true created eligibility/route/execution permission');
    }
  },
  'DC-ORPHAN-ADVICE-SURFACE': (m) => {
    const a = m.produceAdvice(NEUTRAL_ADVICE, [yesNo('Q_RISK', true)]);
    const keys = Object.keys(a).sort();
    if (JSON.stringify(keys) !== JSON.stringify([...ADVICE_MEMBERS].sort())) {
      fail(`advice surface is not the image of the question set: ${keys.join(',')}`);
    }
  },
  'DC-SELF-STANDING': (m) => {
    const qs = m.questionIds();
    for (const q of qs) {
      if (/JEV|SELF|ELIGIBLE|HOLD|CONFIDENCE_OK|SHOULD_USE/i.test(q)) {
        fail(`A6: question ${q} asks Jev about Jev`);
      }
    }
    if (JSON.stringify([...qs]) !== JSON.stringify([...QUESTION_IDS])) {
      fail(`A6/§3.5: question set is not the closed four: ${qs.join(',')}`);
    }
  },

  // ── packet exactness (§2) ─────────────────────────────────────────────────
  'DC-CORRELATION-HANDLE': (m) => {
    // ⭐ A well-formed opaque id is CLASS-legal under R-5 ...
    if (!m.classShapeEligible(WELL_FORMED_OPAQUE_ID)) {
      fail('parent class grammar must still permit a well-formed opaque identifier');
    }
    // ... and still must not be a member of the exact J1 packet.
    const p = constructOk(m);
    const keys = members(m, p);
    for (const k of keys) {
      if (!(PACKET_MEMBERS as readonly string[]).includes(k)) {
        fail(`§2: correlation handle / non-member "${k}" present in the exact packet`);
      }
    }
  },
  'DC-EXTRA-MEMBER': (m) => {
    const keys = members(m, constructOk(m));
    if (keys.length !== PACKET_MEMBERS.length) {
      fail(`§2: packet has ${keys.length} members; exactly ${PACKET_MEMBERS.length} are lawful`);
    }
    for (const k of keys) {
      if (!(PACKET_MEMBERS as readonly string[]).includes(k)) fail(`§2: extra member "${k}"`);
    }
  },
  'DC-FREE-STRING': (m) => {
    const p = constructOk(m) as unknown as Record<string, unknown>;
    for (const [k, v] of Object.entries(p)) {
      if (typeof v === 'string' && !m.classShapeEligible(v)) {
        fail(`§3.8: free string in member "${k}"`);
      }
    }
    if (m.classShapeEligible('an arbitrary prose fragment')) {
      fail('§3.8: class grammar admitted arbitrary prose');
    }
  },
  'DC-WRAPPER-ENVELOPE': (m) => {
    const p = constructOk(m);
    if (m.outboundRepresentation(p) !== p) {
      fail('§4.1: the representation must BE the packet — no wrapper, no envelope');
    }
  },
  'DC-PROSE-IN-REPRESENTATION': (m) => {
    const r = m.outboundRepresentation(constructOk(m));
    const keys = typeof r === 'object' && r !== null ? Object.keys(r) : [];
    for (const k of keys) {
      if (/reason|context|rationale|instruction|prompt|note|hint|guidance/i.test(k)) {
        fail(`§4.2: prose member "${k}" in the representation`);
      }
    }
  },
  'DC-QUESTION-TEXT': (m) => {
    const r = m.outboundRepresentation(constructOk(m));
    const keys = typeof r === 'object' && r !== null ? Object.keys(r) : [];
    if (keys.some((k) => /question_text|text|description|criteria/i.test(k))) {
      fail('§4.2: question_id accompanied by question text');
    }
  },
  'DC-VARYING-INSTRUCTION': (m) => {
    // Two work units differing ONLY in host-local id must yield identical representations.
    const a = m.constructPacket(OK_STATE, 'Q_RISK');
    const b = m.constructPacket({ ...OK_STATE, workUnitId: 'c'.repeat(32) }, 'Q_RISK');
    if (!a.ok || !b.ok) return fail('fixture: both must construct');
    const ra = JSON.stringify(m.outboundRepresentation(a.packet));
    const rb = JSON.stringify(m.outboundRepresentation(b.packet));
    if (ra !== rb) fail('§4.3: representation varied with the work unit');
  },

  // ── construction failure (§5) ─────────────────────────────────────────────
  'DC-CLAMP-ON-OVERFLOW': (m) => {
    const r = m.constructPacket(OVERFLOW_STATE, 'Q_RISK');
    if (r.ok && r.packet.change_scope.file_count === FILE_COUNT_MAX) {
      fail('§5.2: file_count clamped to the maximum');
    }
    if (r.ok) fail('§5.1: an unrepresentable value must produce NO representation');
  },
  'DC-STRINGIFY-OVERFLOW': (m) => {
    const r = m.constructPacket(OVERFLOW_STATE, 'Q_RISK');
    if (r.ok && typeof (r.packet.change_scope.file_count as unknown) === 'string') {
      fail('§5.2: file_count stringified');
    }
    if (r.ok) fail('§5.1: overflow must refuse construction');
  },
  'DC-BUCKET-OVERFLOW': (m) => {
    const r = m.constructPacket(OVERFLOW_STATE, 'Q_RISK');
    if (r.ok) fail('§5.2: overflow bucketed/bracketed instead of refusing');
  },
  'DC-HASH-OVERFLOW': (m) => {
    const r = m.constructPacket(OVERFLOW_STATE, 'Q_RISK');
    if (r.ok) fail('§5.2: overflow digested instead of refusing');
  },
  'DC-DEFAULT-SUBSTITUTION': (m) => {
    const r = m.constructPacket(OVERFLOW_STATE, 'Q_RISK');
    if (r.ok && r.packet.change_scope.file_count === 0) fail('§5.2: default substituted');
    if (r.ok) fail('§5.1: overflow must refuse construction');
  },
  'DC-LOCAL-OVERFLOW-ENUM': (m) => {
    const r = m.constructPacket(OVERFLOW_STATE, 'Q_RISK');
    if (r.ok) {
      const v = JSON.stringify(r.packet);
      if (/OVERFLOW|OTHER|UNKNOWN_COUNT/i.test(v)) fail('§5.2: local overflow enum invented');
      fail('§5.1: overflow must refuse construction');
    }
  },
  'DC-SPLIT-TO-FIT': (m) => {
    const r = m.constructPacket(OVERFLOW_STATE, 'Q_RISK');
    if (r.ok) {
      if (r.packet.change_scope.file_count < OVERFLOW_STATE.fileCount) {
        fail('§5.2: work unit split/reshaped so the packet would fit');
      }
      fail('§5.1: overflow must refuse construction');
    }
  },
  'DC-FAILURE-AS-ABSTENTION': (m) => {
    const e = m.constructionFailureEffect(OVERFLOW_STATE);
    if (e.recordedAsAbstention) fail('§5.4: construction failure recorded as an abstention');
    if (e.providerConsulted) fail('§5.4: provider consulted despite construction failure');
  },
  'DC-FAILURE-CHANGES-AUTHORITY': (m) => {
    if (m.constructionFailureEffect(OVERFLOW_STATE).authorityChanged) {
      fail('§5.3/I1: construction failure changed authority');
    }
  },
  'DC-FAILURE-LOGS-VALUE': (m) => {
    if (m.constructionFailureEffect(OVERFLOW_STATE).offendingValueRecorded) {
      fail('§5.3/A5: the offending value was logged, hashed or cached');
    }
  },
  'DC-REFUSAL-LOGS-PACKET': (m) => {
    if (m.refusalRecordsPacket()) fail('A5/§3.9: a refusal constructed or logged the packet');
  },
  'DC-UNBOUND-TASKSHAPE': (m) => {
    const r = m.constructPacket(UNBOUND_SHAPE_STATE, 'Q_RISK');
    if (r.ok) fail(`§5.5: unbound task_shape coerced to "${r.packet.task_shape}"`);
  },
  'DC-TASKSHAPE-DRIFT': (m) => {
    // Exactly the six members of J5 blob e840d705, in order.
    const bound = [
      'CODE_GROUNDED', 'ARCHITECTURE_REASONING', 'ADVERSARIAL_FALSIFICATION',
      'LONG_HORIZON_DECOMPOSITION', 'EVIDENCE_SYNTHESIS', 'FRONTIER_UNKNOWN',
    ];
    if (JSON.stringify([...TASK_SHAPES]) !== JSON.stringify(bound)) {
      fail('§3: the pinned TaskShape constant itself diverges from blob e840d705');
    }
    const used = m.taskShapes();
    if (JSON.stringify([...used]) !== JSON.stringify(bound)) {
      fail(`§3: TaskShape drift silently followed: ${used.join(',')}`);
    }
  },

  // ── admission & provenance (§6, §7) ───────────────────────────────────────
  'DC-MODEL-FORGES-HOST-REASON': (m) => {
    const p = okPacket('Q_RISK');
    const forged = { question_id: 'Q_RISK', reason: 'TIMEOUT' };
    const a = m.admit(p, obs(forged));
    if (!isAbstainValue(a) || a.reason !== 'OUT_OF_RANGE') {
      fail(`§7.1: forged host reason admitted as ${JSON.stringify(a)}; required OUT_OF_RANGE`);
    }
  },
  'DC-HOST-REASON-PASSTHROUGH': (m) => {
    const p = okPacket('Q_DEPTH');
    for (const hr of HOST_FAILURE_REASONS) {
      const a = m.admit(p, obs({ question_id: 'Q_DEPTH', reason: hr }));
      if (isAbstainValue(a) && a.reason === hr && hr !== 'OUT_OF_RANGE') {
        fail(`§7.1: provider-supplied ${hr} recorded verbatim`);
      }
    }
  },
  'DC-FORGERY-DISCARDED': (m) => {
    const p = okPacket('Q_RISK');
    let a: AdmittedJudgment;
    try {
      a = m.admit(p, obs({ question_id: 'Q_RISK', reason: 'PARSE_FAILURE' }));
    } catch {
      return fail('§7.1: forged host reason discarded (threw) instead of recorded');
    }
    if (!isAbstainValue(a) || a.reason !== 'OUT_OF_RANGE') {
      fail('§7.1: forged host reason must be RECORDED as host OUT_OF_RANGE');
    }
  },
  'DC-FORGERY-AS-UNKNOWN-SHAPE': (m) => {
    const p = okPacket('Q_RISK');
    const a = m.admit(p, obs({ question_id: 'Q_RISK', reason: 'TIMEOUT' }));
    if (isAbstainValue(a) && a.reason === 'UNKNOWN_SHAPE') {
      fail('§7.2: Abstain-shaped forgery classified UNKNOWN_SHAPE (shape read as type)');
    }
  },
  'DC-UNION-COLLAPSE': (m) => {
    const p = okPacket('Q_SUFFICIENT');
    for (const hr of HOST_FAILURE_REASONS) {
      const a = m.admit(p, obs({ question_id: 'Q_SUFFICIENT', reason: hr }));
      if (isAbstainValue(a) && (MODEL_ABSTAIN_REASONS as readonly string[]).includes(a.reason)) {
        fail(`§6.1: host reason ${hr} admitted as a model reason — unions collapsed`);
      }
    }
    for (const mr of MODEL_ABSTAIN_REASONS) {
      const a = m.admit(p, obs({ question_id: 'Q_SUFFICIENT', reason: mr }));
      if (!isAbstainValue(a) || a.reason !== mr) {
        fail(`§6.1: lawful ProviderAbstain ${mr} was not admitted as itself`);
      }
    }
  },
  'DC-MODEL-REASON-WINS': (m) => {
    const p = okPacket('Q_RISK');
    const a = m.admit(p, obs({ question_id: 'Q_RISK', reason: 'REFUSED' }, { parsed: false }));
    if (!isAbstainValue(a) || a.reason !== 'PARSE_FAILURE') {
      fail(`§7.2: malformed + self-declared REFUSED must record PARSE_FAILURE, got ${JSON.stringify(a)}`);
    }
  },
  'DC-PRECEDENCE-REORDERED': (m) => {
    const p = okPacket('Q_RISK');
    const a = m.admit(p, obs({ nonsense: 1 }, { timedOut: true, parsed: false }));
    if (!isAbstainValue(a) || a.reason !== 'TIMEOUT') {
      fail(`§7.2: precedence reordered — expected TIMEOUT, got ${JSON.stringify(a)}`);
    }
    const b = m.hostFailureReason({ timedOut: true, empty: true, parsed: false, raw: null });
    if (b !== 'TIMEOUT') fail(`§7.2: precedence reordered at the reason function: ${b}`);
  },
  'DC-NONDETERMINISTIC-REASON': (m) => {
    const p = okPacket('Q_RISK');
    // identical input, three times — the reason must be identical every time
    const mk = () => m.admit(p, obs({ question_id: 'Q_RISK', reason: 'TIMEOUT', nd: true }));
    const a = mk(); const b = mk(); const c = mk();
    if (JSON.stringify(a) !== JSON.stringify(b) || JSON.stringify(b) !== JSON.stringify(c)) {
      fail('§7.2: same failure produced different AdmittedAbstainReason across runs');
    }
  },
  'DC-FABRICATED-QUESTION-ID': (m) => {
    const p = okPacket('Q_DEPTH');
    const a = m.admit(p, obs(undefined, { timedOut: true }));
    if (a.question_id !== 'Q_DEPTH') {
      fail(`§7.1: question identity fabricated/recovered — got ${a.question_id}`);
    }
  },
  'DC-QUESTION-FROM-RESPONSE': (m) => {
    const p = okPacket('Q_DEPTH');
    const a = m.admit(p, obs({ question_id: 'Q_RISK', answer: true, confidence: 0.9 }));
    if (a.question_id !== 'Q_DEPTH') fail('§7.1: expected question taken from the response');
    if (!isAbstainValue(a) || a.reason !== 'MISMATCHED_QUESTION') {
      fail(`§7.2: wrong-question response must record MISMATCHED_QUESTION, got ${JSON.stringify(a)}`);
    }
  },
  // ── F1R1: Score fidelity (§6.1) ───────────────────────────────────────────
  'DC-SCORE-SCALE-OMITTED': (m) => {
    const p = okPacket('Q_DEPTH');
    // a Score response with NO scale is not §6.1 Score-shaped
    const a = m.admit(p, obs({ question_id: 'Q_DEPTH', score: 0.8, confidence: 0.9 }));
    if (isScoreValue(a)) fail('§6.1: a Score missing `scale` was admitted as a Score');
    if (!isAbstainValue(a) || a.reason !== 'UNKNOWN_SHAPE') {
      fail(`§IV: missing required Score member must be UNKNOWN_SHAPE, got ${JSON.stringify(a)}`);
    }
  },
  'DC-SCORE-SCALE-ALTERED': (m) => {
    const p = okPacket('Q_DEPTH');
    const a = m.admit(p, obs(providerScore('Q_DEPTH', { scale: { min: 0, max: 100 } })));
    if (!isAbstainValue(a) || a.reason !== 'OUT_OF_RANGE') {
      fail(`§IV: altered scale must be OUT_OF_RANGE, got ${JSON.stringify(a)}`);
    }
  },
  'DC-SCORE-SCALE-DROPPED': (m) => {
    const p = okPacket('Q_DEPTH');
    const a = m.admit(p, obs(providerScore('Q_DEPTH')));
    if (!isScoreValue(a)) fail(`§6.1: a lawful Score was not admitted: ${JSON.stringify(a)}`);
    else if (a.scale.min !== 0 || a.scale.max !== 1) {
      fail('§6.1: admitted Score did not preserve the contract-required scale');
    }
  },

  // ── F1R1: construction exactness (§2, §5.5) ───────────────────────────────
  'DC-NONBOOLEAN-CONSTRUCTS': (m) => {
    const r = m.constructPacket(NONBOOLEAN_STATE, 'Q_RISK');
    if (r.ok) fail('§5.5: a non-boolean in a boolean position must refuse construction');
  },
  'DC-INVALID-QUESTION-CONSTRUCTS': (m) => {
    const r = m.constructPacket(OK_STATE, INVALID_QUESTION);
    if (r.ok) fail('§5.5: a question selector outside QuestionId must refuse construction');
  },
  'DC-PACKET-VERSION-DRIFT': (m) => {
    const r = m.constructPacket(OK_STATE, 'Q_RISK');
    if (!r.ok) return fail('fixture: OK_STATE must construct');
    if (r.packet.packet_version !== PV) {
      fail(`§2: packet_version must be exactly "${PV}", got "${r.packet.packet_version}"`);
    }
  },

  'DC-ABSTAIN-REJECTED': (m) => {
    for (const q of QUESTION_IDS) {
      const p = okPacket(q);
      const a = m.admit(p, obs({ question_id: q, reason: 'REFUSED' }));
      if (!isAbstainValue(a) || a.reason !== 'REFUSED') {
        fail(`§7.1: lawful ProviderAbstain rejected for ${q}: ${JSON.stringify(a)}`);
      }
    }
  },
};

export const FALSIFIER_IDS = Object.keys(FALSIFIERS).sort();

/** §2 members / PACKET_VERSION referenced so a drifted literal is caught at compile time. */
export const PINNED_LITERALS = { PACKET_VERSION, PACKET_MEMBERS } as const;
