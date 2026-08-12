/**
 * JARVIS Unit 19 — native governance gate emission
 *
 * Unit 18 earned Classification C on one seam: a worker executing a bounded
 * objective can encounter a legitimate authority limit, but could not itself
 * emit a structured governance gate. The "ask" was manufactured by the harness.
 * That is not governed agency.
 *
 * This module lets a worker say, in structured form:
 *
 *   "I cannot truthfully continue because this bounded objective now requires
 *    authority I do not possess."
 *
 * ── The load-bearing distinction ────────────────────────────────────────────
 *
 *   A WORKER GATE IS A CLAIM, NOT AN AUTHORITY.
 *
 * The worker may IDENTIFY the missing authority. It may not SUPPLY it. Unit 11
 * already held that "worker self-report is never authoritative" for evidence;
 * the same rule governs governance boundaries. Every emitted gate is validated
 * by the control plane before it becomes governance state, and a gate that
 * fails validation is an INVALID RESULT — never an indefinite pause.
 *
 * ── What a gate is not (§1) ─────────────────────────────────────────────────
 *
 * Not failure, not an exception, not low confidence, not a request for more
 * compute, not capacity pressure, not a model's preference to escalate, not
 * ordinary clarification. A gate means: continuing would require authority not
 * contained in the current grant.
 */

import { randomBytes, createHash } from 'node:crypto';
import { MUTATING_CLASSES } from './jarvis-principal.mjs';

// ── §3 gate classes — closed taxonomy ────────────────────────────────────────
/**
 * `resolver` is the authenticated standing that may close the class (Unit 16).
 * The distinctions exist because they change WHO may resolve; a generic
 * NEEDS_MORE_AUTHORITY would erase exactly that.
 *
 * `executable_after_resolution` records whether closing the gate can ever lead
 * to execution in this architecture. WRITE/PRODUCTION are representable so a
 * worker can name them honestly, but no resolution in this unit makes them
 * runnable — Unit 14's ceilings and Unit 15's lanes still refuse.
 */
export const GATE_CLASSES = Object.freeze({
  FOUNDER_DECISION_REQUIRED: { resolver: 'FOUNDER', executable_after_resolution: true },
  OPERATOR_AUTHORIZATION_REQUIRED: { resolver: 'OPERATOR', executable_after_resolution: true },
  SCOPE_EXPANSION_REQUIRED: { resolver: 'OPERATOR', executable_after_resolution: true },
  CONSTITUTIONAL_AMBIGUITY: { resolver: 'FOUNDER', executable_after_resolution: true },
  WRITE_AUTHORITY_REQUIRED: { resolver: 'OPERATOR', executable_after_resolution: false },
  PRODUCTION_AUTHORIZATION_REQUIRED: { resolver: 'FOUNDER', executable_after_resolution: false },
});

export const GATE_CLASS_NAMES = Object.freeze(Object.keys(GATE_CLASSES));

/** §15 — capacity is not a governance gate. Named so it can be refused by name. */
export const NON_GOVERNANCE_REASONS = Object.freeze([
  'CAPACITY', 'CAPACITY_BLOCKED', 'RATE_LIMIT', 'TIMEOUT', 'LOW_CONFIDENCE',
  'NEEDS_MORE_COMPUTE', 'NEEDS_MORE_TOKENS', 'CLARIFICATION',
]);

export const GATE_REFUSAL = Object.freeze({
  GATE_MALFORMED: 'GATE_MALFORMED',
  GATE_CLASS_UNKNOWN: 'GATE_CLASS_UNKNOWN',
  GATE_NOT_GOVERNANCE: 'GATE_NOT_GOVERNANCE',
  GATE_RUN_MISMATCH: 'GATE_RUN_MISMATCH',
  GATE_OBJECTIVE_MISMATCH: 'GATE_OBJECTIVE_MISMATCH',
  GATE_AUTHORITY_ALREADY_HELD: 'GATE_AUTHORITY_ALREADY_HELD',
  GATE_WIDENS_OBJECTIVE: 'GATE_WIDENS_OBJECTIVE',
  GATE_SELF_GRANT: 'GATE_SELF_GRANT',
  GATE_EVIDENCE_UNATTRIBUTABLE: 'GATE_EVIDENCE_UNATTRIBUTABLE',
  GATE_ALREADY_OPEN: 'GATE_ALREADY_OPEN',
  /** Unit 21 (D) — the gate presupposes an act this grant never authorised. */
  GATE_INADMISSIBLE_FOR_GRANT: 'GATE_INADMISSIBLE_FOR_GRANT',
});

// ── Unit 21 — admissibility declared at grant time (founder ruling: D + A) ───
//
// The defect this closes: on a fully-granted READ-ONLY objective a worker emitted
// WRITE_AUTHORITY_REQUIRED. A read-only objective does not *withhold* write
// authority — it does not *involve* it. There is no write the worker was asked to
// perform, so there is no write authority it can lack. That is a category error,
// not a boundary report, and the happy path falsely paused.
//
// Two prompt-level narrowings were tried and failed. Prompt text is the wrong
// layer for an admissibility invariant: it argues with the worker's judgement
// instead of bounding the worker's choice set. So the invariant moves into the
// CONTRACT — the admissible set is derived from what the objective was GRANTED,
// before the worker executes, and is checked against what the worker emitted.
//
// ⚠️ SCOPE LIMIT — this is class-level admissibility ONLY.
// It answers "may a gate of this CLASS arise under this grant?" It does NOT
// answer "may this run reach that particular target?" — the operation-bound
// authority derivation that R1-A still requires (`R1A_SYSTEM_READ` alone is far
// too broad; see jarvis-delegation.mjs §60). Those solve different edges and are
// compatible. This is precisely why SCOPE_EXPANSION_REQUIRED remains admissible
// under every read grant: target-level reach is unresolved and must stay raisable.
// ⛔ Do not let this table become a substitute for that derivation.

/**
 * Gate classes admissible under ANY grant. Each names a boundary about *reach*
 * or *decision*, never about mutation rights, so none presupposes an act the
 * objective did not request.
 */
export const UNCONDITIONALLY_ADMISSIBLE_GATES = Object.freeze([
  'FOUNDER_DECISION_REQUIRED',
  'OPERATOR_AUTHORIZATION_REQUIRED',
  'SCOPE_EXPANSION_REQUIRED',
  'CONSTITUTIONAL_AMBIGUITY',
]);

/** Gate classes admissible only when the grant itself carries the matching act. */
export const CONDITIONALLY_ADMISSIBLE_GATES = Object.freeze({
  // Admissible only if the objective was granted a mutating class — only then is
  // there a write the worker could have been asked to perform.
  WRITE_AUTHORITY_REQUIRED: (granted) => MUTATING_CLASSES.includes(granted),
  // Production is narrower still: only a production grant can lack production authority.
  PRODUCTION_AUTHORIZATION_REQUIRED: (granted) => granted === 'R5_PRODUCTION',
});

/**
 * D — derive the admissible gate set from the GRANTED objective contract.
 *
 * @param {string|null} grantedOperationClass  the run's granted operation class
 * @returns {string[]} admissible gate class names, sorted
 */
export function deriveAdmissibleGateClasses(grantedOperationClass) {
  const granted = typeof grantedOperationClass === 'string' ? grantedOperationClass : null;
  const conditional = Object.entries(CONDITIONALLY_ADMISSIBLE_GATES)
    .filter(([, admits]) => granted != null && admits(granted))
    .map(([name]) => name);
  return [...UNCONDITIONALLY_ADMISSIBLE_GATES, ...conditional].sort();
}

export const GATE_STATUS = Object.freeze({
  OPEN: 'OPEN', RESOLVED: 'RESOLVED', REFUSED: 'REFUSED', SUPERSEDED: 'SUPERSEDED',
});

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const bound = (s, n = 600) => (typeof s === 'string' && s.trim()
  ? s.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n)
  : null);

/**
 * Normalise worker prose so 'rate limit' and 'RATE_LIMIT' are both caught. This
 * is a fail-CLOSED heuristic layered on top of the structural gate_class check —
 * it can only ever refuse more, never authorise.
 */
const normaliseReason = (s) => String(s ?? '').toUpperCase().replace(/[^A-Z0-9]+/g, '_');

export const objectiveDigest = (text) => createHash('sha256').update(String(text ?? ''), 'utf8').digest('hex');
const newGateId = () => `gov-${randomBytes(6).toString('hex')}`;

/**
 * Fields a worker may NOT put in a gate. A gate that carries a grant is a
 * self-grant attempt, which is the one thing a worker must never do (§4).
 */
const SELF_GRANT_KEYS = Object.freeze([
  'delegation_id', 'delegation', 'granted', 'authority_granted', 'principal_type',
  'instruction_id', 'channel_id', 'resolution_id', 'approved', 'authorized',
]);

/**
 * §5 — validate a worker-emitted gate against the run that produced it.
 *
 * Everything is checked against the RUN RECORD, never against the worker's
 * claims about itself. An invalid gate is a result-contract failure, not a
 * pause: a worker must not be able to suspend its own run by emitting nonsense.
 *
 * @param {object} claim  the `governance_gate` object from the result contract
 * @param {object} run    the live run record
 * @param {object} [opts] { heldAuthority } — what the run already possesses
 * @returns {{ok: boolean, refusal?: string, reason?: string, gate?: object}}
 */
export function validateWorkerGate(claim, run, opts = {}, now = new Date().toISOString()) {
  const deny = (refusal, reason) => ({ ok: false, refusal, reason });

  if (!isObj(claim)) return deny(GATE_REFUSAL.GATE_MALFORMED, 'governance_gate must be an object');

  // §4 — a gate is a claim. It may not carry a grant.
  for (const k of SELF_GRANT_KEYS) {
    if (k in claim) {
      return deny(GATE_REFUSAL.GATE_SELF_GRANT,
        `a worker gate may not carry '${k}'; it identifies missing authority, it never supplies it`);
    }
  }

  const cls = claim.gate_class;
  if (typeof cls !== 'string' || !cls.trim()) {
    return deny(GATE_REFUSAL.GATE_MALFORMED, 'gate_class is required');
  }
  // §15 / §1 — capacity, timeouts and confidence are not governance boundaries.
  if (NON_GOVERNANCE_REASONS.includes(cls.toUpperCase())
      || NON_GOVERNANCE_REASONS.some((r) => normaliseReason(claim.reason).includes(r))) {
    return deny(GATE_REFUSAL.GATE_NOT_GOVERNANCE,
      'capacity, timeout, confidence and clarification are not authority boundaries');
  }
  if (!GATE_CLASS_NAMES.includes(cls)) {
    return deny(GATE_REFUSAL.GATE_CLASS_UNKNOWN, `unknown gate class '${cls}'`);
  }

  // ── Unit 21 (D + A + always-record) ────────────────────────────────────────
  //
  // Decided BEFORE the instance checks below. The class-level question ("could a
  // gate of this class ever arise under this grant?") precedes the instance
  // question ("do we already hold what it asks for?"), so an inadmissible gate is
  // refused as inadmissible rather than masked by a narrower refusal.
  //
  // A — the worker's testimony is preserved verbatim and never translated. We do
  // not map WRITE_AUTHORITY_REQUIRED onto its tidier neighbour: on the observed
  // corpus 3 of 5 such gates carried authority_required.operation_class = WRITE,
  // so reclassifying would falsify what the worker actually said. The contract
  // fails; the claim survives intact as evidence.
  const reqPeek = isObj(claim.authority_required) ? claim.authority_required : {};
  const grantedClass = opts.grantedOperationClass
    ?? (isObj(opts.heldAuthority) ? opts.heldAuthority.operation_class : null)
    ?? null;
  const admissibleClasses = deriveAdmissibleGateClasses(grantedClass);
  const isAdmissible = admissibleClasses.includes(cls);

  // Always-record: emitted regardless of outcome, on the deny path and the ok
  // path alike. Recording a gate is not accepting a gate — a refused gate is
  // still evidence, and over-emission must be measurable rather than invisible.
  const admissibility = {
    worker_assertion: {
      gate_class: cls,
      reason: bound(claim.reason, 600),
      authority_required: {
        operation_class: reqPeek.operation_class ?? null,
        target: reqPeek.target ?? null,
      },
    },
    proposed_operation_class: reqPeek.operation_class ?? null,
    granted_authority: {
      operation_class: grantedClass,
      allowed_targets: Array.isArray(opts.heldAuthority?.allowed_targets)
        ? opts.heldAuthority.allowed_targets.slice() : [],
    },
    derived_admissible_gate_classes: admissibleClasses,
    comparison_result: isAdmissible ? 'ADMISSIBLE' : 'INADMISSIBLE_FOR_GRANT',
    evidence: Array.isArray(claim.evidence) ? claim.evidence.filter((e) => typeof e === 'string').slice(0, 20) : [],
    emitted_by: 'worker',
    disposition: isAdmissible ? 'GATE_ADMITTED' : 'GATE_REFUSED_INADMISSIBLE',
    decided_at: now,
    // Names the layer that decided, so this is never mistaken for worker testimony.
    decided_by: 'control_plane:unit_21_admissibility',
  };

  if (!isAdmissible) {
    return {
      ok: false,
      refusal: GATE_REFUSAL.GATE_INADMISSIBLE_FOR_GRANT,
      reason: `gate class '${cls}' is not admissible under granted operation class `
        + `'${grantedClass ?? 'NONE'}' (admissible: ${admissibleClasses.join(', ')}) — `
        + 'the gate presupposes an act this objective never requested',
      admissibility,
    };
  }

  const reason = bound(claim.reason);
  if (!reason) return deny(GATE_REFUSAL.GATE_MALFORMED, 'a bounded reason is required');

  // The gate must belong to the active run and its actual objective.
  if (claim.run_id != null && claim.run_id !== run?.run_id) {
    return deny(GATE_REFUSAL.GATE_RUN_MISMATCH, 'gate names a different run');
  }
  if (claim.work_unit_id != null && claim.work_unit_id !== run?.packet?.work_unit_id) {
    return deny(GATE_REFUSAL.GATE_RUN_MISMATCH, 'gate names a different work unit');
  }
  const runObjective = run?.objective ?? run?.packet?.objective ?? null;
  const digest = objectiveDigest(runObjective);
  if (claim.objective_digest != null && claim.objective_digest !== digest) {
    return deny(GATE_REFUSAL.GATE_OBJECTIVE_MISMATCH,
      'gate is not bound to the objective this run is executing');
  }

  // §5 — asking for authority the run already holds is not a boundary.
  const held = isObj(opts.heldAuthority) ? opts.heldAuthority : {};
  const req = isObj(claim.authority_required) ? claim.authority_required : {};
  if (req.operation_class != null && req.operation_class === held.operation_class
      && (req.target == null || (held.allowed_targets ?? []).includes(req.target))) {
    return deny(GATE_REFUSAL.GATE_AUTHORITY_ALREADY_HELD,
      `the run already holds ${req.operation_class}${req.target ? ` on ${req.target}` : ''}`);
  }

  // §12 — the gate may not become a way to change the task.
  const scope = isObj(claim.scope_requested) ? claim.scope_requested : {};
  if (scope.work_unit_id != null && scope.work_unit_id !== run?.packet?.work_unit_id) {
    return deny(GATE_REFUSAL.GATE_WIDENS_OBJECTIVE, 'a gate may not retarget the work unit');
  }
  if (scope.objective != null && objectiveDigest(scope.objective) !== digest) {
    return deny(GATE_REFUSAL.GATE_WIDENS_OBJECTIVE, 'a gate may not restate the objective');
  }

  // Evidence must be attributable — file:line references, like all other
  // JARVIS evidence. Prose alone does not establish that a boundary was met.
  const evidence = Array.isArray(claim.evidence) ? claim.evidence.filter((e) => typeof e === 'string') : [];
  if (evidence.length && !evidence.some((e) => /:\d+/.test(e))) {
    return deny(GATE_REFUSAL.GATE_EVIDENCE_UNATTRIBUTABLE,
      'gate evidence must carry attributable file:line references when present');
  }

  const spec = GATE_CLASSES[cls];
  return {
    ok: true,
    admissibility,
    gate: {
      // Unit 21 — the admissibility decision travels WITH the gate it admitted,
      // so a persisted gate always carries the contract check that let it exist.
      admissibility,
      gate_id: newGateId(),
      status: GATE_STATUS.OPEN,
      // Bound to the run and the exact objective it was executing.
      run_id: run.run_id,
      request_id: run.request_id ?? null,
      work_unit_id: run.packet?.work_unit_id ?? null,
      objective: bound(runObjective, 600),
      objective_digest: digest,
      gate_class: cls,
      reason,
      // Normalised — only recognised shape survives from the worker's claim.
      authority_required: {
        operation_class: req.operation_class ?? null,
        target: req.target ?? null,
        note: bound(req.note, 240),
      },
      scope_requested: { note: bound(scope.note, 240) },
      current_authority: {
        operation_class: held.operation_class ?? null,
        allowed_targets: Array.isArray(held.allowed_targets) ? held.allowed_targets.slice() : [],
      },
      evidence: evidence.slice(0, 20),
      required_resolver_role: spec.resolver,
      executable_after_resolution: spec.executable_after_resolution,
      emitted_by: 'worker',
      created_at: now,
      resolved_at: null,
      resolution_id: null,
      resolution_type: null,
    },
  };
}

/**
 * §9/§10 — close a gate with authenticated authority.
 *
 * Reuses Unit 16 standing wholesale; no second authority system. A resolution
 * closes the governance question. It does not itself execute anything, and it
 * cannot widen the objective (§12).
 *
 * @param {object} gate      the OPEN gate
 * @param {object} instruction  a verified Unit 16 instruction record
 * @param {object} input     { resolution_type: 'APPROVE'|'REFUSE', scope_grant?, rationale? }
 */
export function resolveGovernanceGate(gate, instruction, input = {}, now = new Date().toISOString()) {
  const deny = (refusal, reason) => ({ ok: false, refusal, reason });

  if (!isObj(gate)) return deny(GATE_REFUSAL.GATE_MALFORMED, 'no gate');
  if (gate.status !== GATE_STATUS.OPEN) {
    return deny(GATE_REFUSAL.GATE_ALREADY_OPEN, `gate is ${gate.status}`);
  }
  if (!isObj(instruction)) {
    return deny('AUTHENTICATED_ACTOR_REQUIRED', 'an authenticated instruction is required');
  }
  // §9 — the authenticated role must satisfy the gate class.
  if (instruction.actor_role !== gate.required_resolver_role) {
    return deny(gate.required_resolver_role === 'FOUNDER'
      ? 'FOUNDER_AUTHORITY_REQUIRED' : 'OPERATOR_AUTHORITY_REQUIRED',
    `${gate.gate_class} requires ${gate.required_resolver_role} standing; got ${instruction.actor_role}`);
  }
  const type = input.resolution_type;
  if (type !== 'APPROVE' && type !== 'REFUSE') {
    return deny('RESOLUTION_TYPE_REQUIRED', 'a typed resolution (APPROVE | REFUSE) is required');
  }

  // §12 — an approval may not restate or retarget the objective.
  const grant = isObj(input.scope_grant) ? input.scope_grant : {};
  if (grant.objective != null || grant.work_unit_id != null) {
    return deny(GATE_REFUSAL.GATE_WIDENS_OBJECTIVE,
      'a resolution may close the authority question; it may not change the task');
  }

  const resolved = {
    ...gate,
    status: GATE_STATUS.RESOLVED,
    resolved_at: now,
    resolution_type: type,
    resolution_id: `gres-${randomBytes(6).toString('hex')}`,
    resolved_by_instruction: instruction.instruction_id,
    resolved_by_role: instruction.actor_role,
    resolved_by_actor: instruction.authenticated_actor_id,
    // The authority delta this resolution actually conferred — bounded, and
    // only ever what the gate asked for.
    authority_delta: type === 'APPROVE'
      ? { operation_class: gate.authority_required.operation_class,
        target: gate.authority_required.target,
        additional_selectors: Array.isArray(grant.additional_selectors) ? grant.additional_selectors.slice(0, 20) : [] }
      : null,
    // §10 — resolution is not execution, and some classes never become runnable.
    permits_resumption: type === 'APPROVE' && gate.executable_after_resolution === true,
    rationale: bound(input.rationale, 600),
  };
  return { ok: true, gate: resolved };
}

/** §8 — what a public surface may know. No worker reasoning, no evidence body. */
export function publicGovernanceGate(g) {
  if (!g) return null;
  return {
    gate_id: g.gate_id,
    status: g.status,
    gate_class: g.gate_class,
    required_resolver_role: g.required_resolver_role,
    reason: g.reason,
    authority_required: g.authority_required,
    run_id: g.run_id,
    request_id: g.request_id,
    objective_digest: g.objective_digest,
    created_at: g.created_at,
    resolution_type: g.resolution_type ?? null,
    permits_resumption: g.permits_resumption ?? null,
    // Unit 20: provenance, not reasoning or evidence — a fixed classification of
    // WHO raised the gate ('worker' vs any future non-worker emitter), no more
    // sensitive than `reason` (free-text) already exposed above. Without it a
    // caller reading the public run API has no way to confirm a gate was
    // self-raised by the worker rather than fabricated by whatever submitted
    // the run, which is exactly the property Unit 20's live proof needs to
    // observe rather than take on faith.
    emitted_by: g.emitted_by ?? null,
  };
}
