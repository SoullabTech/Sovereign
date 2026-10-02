/**
 * JARVIS O5-R2C — Path B recovery classifier FALSIFIERS (PB-F1…PB-F7).
 *
 * Each is a pure function of a classifier candidate `{ classifyWorkUnit }` over
 * synthetic fact fixtures shaped like the real Path B records (grant ledger
 * standings, durable-result witness, W0.v2 envelope + W2 guard, W4 execution).
 * The integration witness (jarvis-desktop/test/o5-path-b-recovery.test.mjs)
 * proves the same laws against the REAL substrate.
 *
 * Founder mandate (R2C): prove the recovery NEVER reissues a grant and NEVER
 * invents success from incomplete evidence.
 */
const WU = 'v2-o5r2-wu';
const G = 'grant-o5r2-01';
const SNAP = '{"core":"authorized"}';
const REF = `canonical-result:${WU}:${G}`;
const DIGEST = 'sha256:' + 'b'.repeat(64);
const ACTIONS = ['NONE', 'CONVERGED', 'RECORD', 'GATED'];
const DISPATCHING_FIELDS = ['reissue', 'reissue_after', 'retry', 'retry_after', 'dispatch', 'claim', 'issue_grant', 'new_grant', 'redispatch'];

function body(patch = {}) {
  return { execution_version: 'E1.v1', work_unit_id: WU, grant_id: G, route_participant_id: 'primary', transport_binding_id: 'tb-1', exit_code: 0, test_results: 'pass', ...patch };
}

/** Build a fact set. Every field names a real Path B record. */
export function facts({
  lifecycle = 'EXECUTING', guardState, coreNow = SNAP, guardWu = WU,
  standing = 'CLAIMED', claimed = true, ledgered = null,
  witness = 'present', witnessBody, grantWu = WU, envelopeUnreadable = false, grantsUnreadable = false,
} = {}) {
  const events = [{ event: 'ISSUED', grant: { grant_id: G } }];
  if (claimed) events.push({ event: 'CLAIMED', grant_id: G });
  if (standing === 'CONSUMED') events.push({ event: 'CONSUMED', grant_id: G });
  if (standing === 'REVOKED' || standing === 'INVALIDATED') events.push({ event: standing, grant_id: G });
  const attempts = ledgered === 'attempt' ? [{ attempt_id: 'a1', evidence_refs: [REF] }] : [];
  const artifacts = ledgered === 'artifact' ? [{ artifact_id: 'r1', ref: REF, digest: DIGEST }] : [];
  const envelope = envelopeUnreadable ? { unreadable: true } : {
    work_unit: { identity: { id: WU }, state: { lifecycle_state: lifecycle }, execution: { attempts, artifacts } },
    guard: { work_unit_id: guardWu, current_state: guardState ?? lifecycle, authorized_core_snapshot: SNAP },
  };
  const results = {};
  if (witness === 'present') results[G] = { present: true, readable: true, body: witnessBody ?? body(), digest: DIGEST };
  if (witness === 'unreadable') results[G] = { present: true, readable: false, digest: DIGEST };
  if (witness === 'absent') results[G] = { present: false };
  return {
    work_unit_id: WU, envelope, core_snapshot_now: coreNow,
    grants: [{ grant: { grant_id: G, work_unit_id: grantWu, route_participant_id: 'primary', transport_binding_id: 'tb-1' }, standing, events }],
    grants_unreadable: grantsUnreadable, results,
  };
}

const one = (c, f) => c.classifyWorkUnit(f)[0];
const run = (id, fn) => { try { const f = fn(); return { id, pass: f.length === 0, failures: f }; } catch (e) { return { id, pass: false, failures: [`threw: ${e.message}`] }; } };
const expectGate = (f, label, d, gate) => {
  if (d?.action !== 'GATED' || (gate && d.gate !== gate)) f.push(`${label}: got ${d?.action}/${d?.gate}, expected GATED/${gate}`);
};

export const SCENARIOS = [
  facts(), facts({ witness: 'absent' }), facts({ witness: 'unreadable' }), facts({ standing: 'CONSUMED' }),
  facts({ standing: 'CONSUMED', witness: 'absent' }), facts({ ledgered: 'artifact' }), facts({ ledgered: 'attempt', standing: 'CONSUMED' }),
  facts({ claimed: false, standing: 'ACTIVE', witness: 'absent' }), facts({ lifecycle: 'STOPPED' }), facts({ coreNow: '{"core":"widened"}' }),
  facts({ standing: 'REVOKED' }), facts({ envelopeUnreadable: true }), facts({ grantsUnreadable: true }),
];

// PB-F1 — never reissues: the action vocabulary is closed and no decision may
// carry any field that schedules, requests or implies a new dispatch.
export function PBF1(c) {
  return run('PB-F1', () => {
    const f = [];
    for (const [i, s] of SCENARIOS.entries()) {
      for (const d of c.classifyWorkUnit(s)) {
        if (!ACTIONS.includes(d.action)) f.push(`scenario ${i}: action '${d.action}' outside the closed vocabulary`);
        for (const k of DISPATCHING_FIELDS) if (k in d) f.push(`scenario ${i}: decision carries dispatching field '${k}'`);
      }
    }
    return f;
  });
}

// PB-F2 — never invents success from incomplete evidence: without a witness
// nothing is recorded or declared converged; a RECORD carries exactly the
// witnessed bytes' body and digest.
export function PBF2(c) {
  return run('PB-F2', () => {
    const f = [];
    expectGate(f, 'CLAIMED, no witness', one(c, facts({ witness: 'absent' })), 'BLOCKED_BY_EVIDENCE');
    expectGate(f, 'CONSUMED, no witness, not ledgered', one(c, facts({ standing: 'CONSUMED', witness: 'absent' })), 'BLOCKED_BY_EVIDENCE');
    const d = one(c, facts());
    if (d?.action === 'RECORD') {
      if (JSON.stringify(d.record?.durable_result) !== JSON.stringify(body())) f.push('RECORD body is not the witnessed body');
      if (d.record?.result_digest !== DIGEST) f.push('RECORD digest is not the witnessed digest');
      if (d.record?.result_ref !== REF) f.push(`RECORD ref ${d.record?.result_ref} ≠ ${REF}`);
    }
    return f;
  });
}

// PB-F3 — a witness that is unreadable, unbound or undigested is UNKNOWN, never PRESENT and never ABSENT.
export function PBF3(c) {
  return run('PB-F3', () => {
    const f = [];
    expectGate(f, 'witness unreadable', one(c, facts({ witness: 'unreadable' })), 'BLOCKED_BY_EVIDENCE');
    expectGate(f, 'witness for another unit', one(c, facts({ witnessBody: body({ work_unit_id: 'v2-other' }) })), 'BLOCKED_BY_EVIDENCE');
    expectGate(f, 'witness for another grant', one(c, facts({ witnessBody: body({ grant_id: 'grant-other' }) })), 'BLOCKED_BY_EVIDENCE');
    const nod = facts(); nod.results[G].digest = undefined;
    expectGate(f, 'witness without digest', one(c, nod), 'BLOCKED_BY_EVIDENCE');
    return f;
  });
}

// PB-F4 — live authority is re-derived now; a witnessed result is not recorded
// once the unit left EXECUTING, its authorized core moved, or its grant was withdrawn.
export function PBF4(c) {
  return run('PB-F4', () => {
    const f = [];
    expectGate(f, 'unit STOPPED', one(c, facts({ lifecycle: 'STOPPED' })), 'NEEDS_OPERATOR_AUTHORITY');
    expectGate(f, 'guard state disagrees', one(c, facts({ guardState: 'CLOSED' })), 'NEEDS_OPERATOR_AUTHORITY');
    expectGate(f, 'authorized core mutated', one(c, facts({ coreNow: '{"core":"widened"}' })), 'NEEDS_OPERATOR_AUTHORITY');
    expectGate(f, 'grant REVOKED after claim', one(c, facts({ standing: 'REVOKED' })), 'NEEDS_OPERATOR_AUTHORITY');
    expectGate(f, 'grant INVALIDATED after claim', one(c, facts({ standing: 'INVALIDATED' })), 'NEEDS_OPERATOR_AUTHORITY');
    expectGate(f, 'guard bound to another unit', one(c, facts({ guardWu: 'v2-other' })), null);
    expectGate(f, 'grant bound to another unit', one(c, facts({ grantWu: 'v2-other' })), null);
    return f;
  });
}

// PB-F5 — idempotence: a result W4 already records is never recorded again.
export function PBF5(c) {
  return run('PB-F5', () => {
    const f = [];
    for (const [label, s, settle] of [
      ['ledgered via artifact, grant CONSUMED', facts({ ledgered: 'artifact', standing: 'CONSUMED' }), false],
      ['ledgered via attempt, grant CONSUMED', facts({ ledgered: 'attempt', standing: 'CONSUMED' }), false],
      ['ledgered, grant still CLAIMED', facts({ ledgered: 'artifact' }), true],
    ]) {
      const d = one(c, s);
      if (d?.action !== 'CONVERGED') f.push(`${label}: got ${d?.action}, expected CONVERGED`);
      else if (Boolean(d.settle_grant) !== settle) f.push(`${label}: settle_grant ${d.settle_grant}, expected ${settle}`);
    }
    return f;
  });
}

// PB-F6 — liveness: where evidence and authority suffice, recovery MUST record.
// Refusing to recover is not safety.
export function PBF6(c) {
  return run('PB-F6', () => {
    const f = [];
    const a = one(c, facts());
    if (a?.action !== 'RECORD' || a.settle_grant !== true) f.push(`CLAIMED + witnessed: got ${a?.action}/settle=${a?.settle_grant}, expected RECORD/settle=true`);
    const b = one(c, facts({ standing: 'CONSUMED' }));
    if (b?.action !== 'RECORD' || b.settle_grant !== false) f.push(`CONSUMED + witnessed + unledgered: got ${b?.action}/settle=${b?.settle_grant}, expected RECORD/settle=false`);
    const n = one(c, facts({ claimed: false, standing: 'ACTIVE', witness: 'absent' }));
    if (n?.action !== 'NONE') f.push(`never claimed: got ${n?.action}, expected NONE`);
    return f;
  });
}

// PB-F7 — an unreadable record is not an empty record: an unreadable envelope
// or grant ledger stops on evidence, never reads as "nothing to do".
export function PBF7(c) {
  return run('PB-F7', () => {
    const f = [];
    expectGate(f, 'envelope unreadable', one(c, facts({ envelopeUnreadable: true })), 'BLOCKED_BY_EVIDENCE');
    const g = c.classifyWorkUnit(facts({ grantsUnreadable: true }));
    if (!g.length) f.push('grant ledger unreadable: produced no decision (reads as nothing to do)');
    else expectGate(f, 'grant ledger unreadable', g[0], 'BLOCKED_BY_EVIDENCE');
    return f;
  });
}

export const PB_FALSIFIERS = Object.freeze({ 'PB-F1': PBF1, 'PB-F2': PBF2, 'PB-F3': PBF3, 'PB-F4': PBF4, 'PB-F5': PBF5, 'PB-F6': PBF6, 'PB-F7': PBF7 });
