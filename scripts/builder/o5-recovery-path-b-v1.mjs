/**
 * JARVIS O5-R2B — Path B recovery classifier (pure).
 *
 * Law: the checkpoint is evidence about a prior execution; it is never
 * authority to execute the next act.
 *
 *   recovery decision = intersection(checkpoint evidence, reconstructed work,
 *                                    live authority, effect knowledge)
 *
 * On Path B (canonical W v2 provider execution) the "checkpoint" is not a new
 * object. It is DERIVED from three durable facts that already exist:
 *
 *   grant ledger  (append-only; ISSUED → CLAIMED → CONSUMED | REVOKED | INVALIDATED)
 *   durable result file  (results/<work_unit>/<grant>.json)
 *   W4.v2 envelope       (attempt + artifact whose ref names that result)
 *
 *   R1 phase           Path B fact
 *   authorized         grant ACTIVE, never CLAIMED
 *   dispatched         grant claimed, no durable result
 *   effect_witnessed   durable result present, not in W4
 *   ledgered           W4 artifact ref === canonical-result:<wu>:<grant>
 *
 * Path B has NO effect probe (the provider runs inside a containment root
 * deleted in `finally`). So "dispatched" can never be proven PRESENT or ABSENT:
 * it is always UNKNOWN → BLOCKED_BY_EVIDENCE. That is the UNKNOWN branch of R1's
 * F8, and it is the only honest one here.
 *
 * Boundary: pure — no filesystem, clock, network, credentials, or randomness.
 * The action vocabulary is CLOSED and contains no act that issues, claims,
 * reissues or dispatches anything. Freshness of the canonical tip is
 * deliberately NOT an input: every action here records what already happened;
 * none is a new act against the repository.
 */

export const CLASSIFIER_VERSION = 'O5R2B.v1';

export const ACTIONS = Object.freeze({
  NONE: 'NONE',             // nothing was dispatched; nothing to recover
  CONVERGED: 'CONVERGED',   // already ledgered; nothing to write
  RECORD: 'RECORD',         // ledger the witnessed result into W4 (+ settle the grant if still CLAIMED)
  GATED: 'GATED',           // stop visibly at an O0 gate
});

export const GATES = Object.freeze({
  EVIDENCE: 'BLOCKED_BY_EVIDENCE',
  AUTHORITY: 'NEEDS_OPERATOR_AUTHORITY',
});

export const resultRef = (workUnitId, grantId) => `canonical-result:${workUnitId}:${grantId}`;

const gated = (gate, reason, extra = {}) => Object.freeze({ action: ACTIONS.GATED, gate, reason, ...extra });

function isLedgered(envelope, ref) {
  const artifacts = envelope?.work_unit?.execution?.artifacts;   // W4.v2 ledgerTarget('artifact')
  const attempts = envelope?.work_unit?.execution?.attempts;
  const inArtifacts = Array.isArray(artifacts) && artifacts.some((a) => a?.ref === ref);
  const inAttempts = Array.isArray(attempts) && attempts.some((a) => Array.isArray(a?.evidence_refs) && a.evidence_refs.includes(ref));
  return inArtifacts || inAttempts;
}

/** Live authority, re-derived now. Never read from the checkpoint. */
export function liveAuthority(facts, grantEntry) {
  const env = facts.envelope;
  const wu = facts.work_unit_id;
  if (!env || env.unreadable) return { ok: false, gate: GATES.EVIDENCE, reason: 'W0_ENVELOPE_UNREADABLE' };
  const unit = env.work_unit;
  const guard = env.guard;
  if (!unit || !guard) return { ok: false, gate: GATES.EVIDENCE, reason: 'W0_ENVELOPE_INCOMPLETE' };
  if (unit.identity?.id !== wu || guard.work_unit_id !== wu) return { ok: false, gate: GATES.EVIDENCE, reason: 'W0_ENVELOPE_FOREIGN' };
  if (unit.state?.lifecycle_state !== 'EXECUTING' || guard.current_state !== 'EXECUTING') {
    return { ok: false, gate: GATES.AUTHORITY, reason: 'W2_NOT_EXECUTING' };
  }
  if (typeof facts.core_snapshot_now !== 'string' || guard.authorized_core_snapshot !== facts.core_snapshot_now) {
    return { ok: false, gate: GATES.AUTHORITY, reason: 'W2_AUTHORIZED_CORE_MUTATED' };
  }
  if (grantEntry.grant?.work_unit_id !== wu) return { ok: false, gate: GATES.EVIDENCE, reason: 'GRANT_FOREIGN' };
  if (['REVOKED', 'INVALIDATED'].includes(grantEntry.standing)) {
    return { ok: false, gate: GATES.AUTHORITY, reason: `GRANT_${grantEntry.standing}` };
  }
  return { ok: true };
}

/** A witness counts only if present, parseable, and bound to THIS unit + grant. */
export function witnessStanding(facts, grantId) {
  const r = facts.results?.[grantId];
  if (!r || r.present !== true) return { standing: 'ABSENT' };
  if (r.readable !== true || !r.body || typeof r.body !== 'object' || Array.isArray(r.body)) {
    return { standing: 'UNKNOWN', reason: 'DURABLE_RESULT_UNREADABLE' };
  }
  if (r.body.work_unit_id !== facts.work_unit_id || r.body.grant_id !== grantId) {
    return { standing: 'UNKNOWN', reason: 'DURABLE_RESULT_UNBOUND' };
  }
  if (typeof r.digest !== 'string' || !r.digest.startsWith('sha256:')) {
    return { standing: 'UNKNOWN', reason: 'DURABLE_RESULT_DIGEST_MISSING' };
  }
  return { standing: 'PRESENT', body: r.body, digest: r.digest };
}

export function classifyGrant(facts, grantEntry) {
  const grantId = grantEntry?.grant?.grant_id;
  const base = { work_unit_id: facts.work_unit_id, grant_id: grantId ?? null, classifier_version: CLASSIFIER_VERSION };
  if (!grantId) return gated(GATES.EVIDENCE, 'GRANT_RECORD_MALFORMED', base);

  const wasClaimed = (grantEntry.events || []).some((e) => e?.event === 'CLAIMED');
  if (!wasClaimed) return Object.freeze({ ...base, action: ACTIONS.NONE, phase: 'authorized', reason: `GRANT_${grantEntry.standing}_NEVER_DISPATCHED` });

  const ref = resultRef(facts.work_unit_id, grantId);
  if (facts.envelope && !facts.envelope.unreadable && isLedgered(facts.envelope, ref)) {
    // Already ledgered: nothing is written to W4. If the grant is still CLAIMED
    // (the confirm path appends W4 without checking consume, so a busy grant
    // lock can leave it so), settling it records that authority was SPENT — a
    // narrowing, which needs no live authority and dispatches nothing.
    return Object.freeze({
      ...base, action: ACTIONS.CONVERGED, phase: 'ledgered', reason: 'W4_ALREADY_RECORDS_RESULT',
      settle_grant: grantEntry.standing === 'CLAIMED',
    });
  }

  const auth = liveAuthority(facts, grantEntry);
  if (!auth.ok) {
    // O5-R3 (R3-C1…C3): the one probe-free absence proof. The runner (the only effect-bearing
    // step) is reachable only after the ROUTED → EXECUTING transition, and lifecycle never
    // returns to ROUTED; so CLAIMED ∧ still ROUTED ∧ no witness ⇒ this grant was never
    // dispatched. RELABEL ONLY: the gate is unchanged and nothing is acted on — retiring the
    // grant is an operator act outside O5-R3. The proof holds ONLY while the unit is ROUTED.
    const unit = facts.envelope?.work_unit;
    const neverDispatched = auth.reason === 'W2_NOT_EXECUTING'
      && grantEntry.standing === 'CLAIMED'
      && unit?.state?.lifecycle_state === 'ROUTED'
      && facts.envelope?.guard?.current_state === 'ROUTED'
      && witnessStanding(facts, grantId).standing === 'ABSENT';
    if (neverDispatched) return gated(auth.gate, 'CLAIMED_NEVER_DISPATCHED', { ...base, phase: 'never_dispatched' });
    return gated(auth.gate, auth.reason, { ...base, phase: 'unconverged' });
  }

  const w = witnessStanding(facts, grantId);
  if (w.standing === 'ABSENT') return gated(GATES.EVIDENCE, 'DISPATCHED_WITHOUT_WITNESS_NO_PROBE', { ...base, phase: 'dispatched' });
  if (w.standing === 'UNKNOWN') return gated(GATES.EVIDENCE, w.reason, { ...base, phase: 'dispatched' });

  return Object.freeze({
    ...base,
    action: ACTIONS.RECORD,
    phase: 'effect_witnessed',
    reason: 'WITNESSED_RESULT_NOT_LEDGERED',
    settle_grant: grantEntry.standing === 'CLAIMED',
    record: Object.freeze({
      route_participant_id: grantEntry.grant.route_participant_id,
      transport_binding_id: grantEntry.grant.transport_binding_id,
      durable_result: w.body,
      result_ref: ref,
      result_digest: w.digest,
      wrapper_exit_code: Number.isInteger(w.body.exit_code) ? w.body.exit_code : null,
    }),
  });
}

/** Classify every grant of one Work Unit. Grant-ledger corruption gates the unit. */
export function classifyWorkUnit(facts) {
  if (facts.grants_unreadable) {
    return Object.freeze([gated(GATES.EVIDENCE, 'GRANT_LEDGER_UNREADABLE', { work_unit_id: facts.work_unit_id, grant_id: null, classifier_version: CLASSIFIER_VERSION })]);
  }
  return Object.freeze((facts.grants || []).map((g) => classifyGrant(facts, g)));
}
