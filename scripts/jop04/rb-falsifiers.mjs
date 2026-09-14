/**
 * JOP-04 RB — frozen falsifiers RB-F1…RB-F8 as executable obligations.
 *
 * Verdict vocabulary (RULING 1, 2026-09-13 — suite-wide precondition law)
 *   GREEN               preconditions reached; forbidden condition absent
 *   RED                 preconditions reached; forbidden condition present
 *   PRECONDITION-UNMET  required test state was not reached — ⛔ NEVER DISCHARGES
 *   UNINSTANTIATED      no legitimate specimen exists yet — ⛔ NEVER DISCHARGES
 *   N/A                 obligation does not yet apply by frozen design — ⛔ NEVER DISCHARGES
 *
 * ⛔ ONLY GREEN DISCHARGES AN APPLICABLE FROZEN OBLIGATION.
 * ⛔ PRECONDITION-UNMET ≠ GREEN. It is not a failure of the substrate; it is a
 *    failure to obtain a valid judgment.
 * ⛔ A test may not make its precondition trivially true by constructing the
 *    thing it is supposed to witness. Every precondition carries evidentiary
 *    provenance answering: HOW DO YOU KNOW? — the real decision object from the
 *    subject's own composition, never an asserted flag.
 *
 * Evidence classes (design §7)
 *   BEHAVIORAL   observed behavior of the real composition
 *   STRUCTURAL   an enforced structural property
 *   CANARY       a source-string check — supplementary, never discharging
 *
 * ⛔ Layer B exercises ONLY registered read capabilities. The instrument may
 *    never acquire the ability to drive the chain with an effect-bearing one.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

export const LAYER_B_CAPABILITY = 'git.rev_parse';

/** Load the subject's routing-eligibility producer if the subject has one. */
export async function loadEligibilityProducer(subjectDir) {
  const p = path.join(subjectDir, 'scripts', 'builder', 'routing-eligibility.mjs');
  try { return (await import(`file://${p}`)).declareRoutingEligibility ?? null; }
  catch { return null; }
}

/**
 * Reach a VALID EXECUTABLE PLACEMENT by the legitimate means the subject offers,
 * and record HOW. ⛔ Never fabricates a lane.
 */
function reachValidPlacement({ router }, capability, declare) {
  if (declare) {
    const eligibility = declare({ satisfied: true, basis: 'jop04_instrument_declaration', declared_by: 'rb-falsifiers' });
    const decision = router.route({ capability }, eligibility);
    return { decision, how: 'declared routing eligibility (subject producer), then route()', eligibility_basis: eligibility.basis };
  }
  const decision = router.route({ capability });
  return { decision, how: 'route() with an ordinary task — subject grants placement without a separate condition', eligibility_basis: null };
}

const reached = (decision) => decision.execution_lane === 'C0';

/** Every probe returns one of these. ⛔ `null` is an INSTRUMENT_ERROR, never a pass. */
export function pre(requirement, state, evidence, provenance) {
  return { requirement, state, evidence, provenance };
}
const UNREGISTERED = 'jop04.definitely_not_registered_xyz999';

/**
 * The subject's OWN route() and runCapability(), composed in the order the
 * subject's main.js composes them (router → C0 branch → runCapability).
 * ⚠️ The IPC hop is NOT exercised — no Electron host. Recorded, never hidden.
 */
function composeSubjectChain({ router, deterministic }, subjectDir, task) {
  const decision = router.route(task);
  if (decision.execution_lane !== 'C0') {
    return { decision, executed: false, result: null, error: null };
  }
  try {
    const result = deterministic.runCapability(task.capability, task.args || {}, subjectDir);
    return { decision, executed: true, result, error: null };
  } catch (e) {
    return { decision, executed: false, result: null, error: e.message };
  }
}

export const FALSIFIERS = [
  {
    id: 'RB-F1',
    statement: 'Registration is not execution. Registration alone cannot produce an executable invocation.',
    predicted: 'RED',
    evidenceClass: 'BEHAVIORAL',
    run(ctx) {
      // No eligibility state is supplied — registration ALONE is the specimen.
      const run = composeSubjectChain(ctx.mods, ctx.subjectDir, { capability: LAYER_B_CAPABILITY });
      const observed = run.executed ? 'RED' : 'GREEN';
      return {
        observed,
        precondition: pre('REQUIRED', 'REACHED',
          { capability_registered: true, registration_alone_path_exercised: true,
            route_decision: { lane: run.decision.execution_lane, status: run.decision.status } },
          'route() called with an ordinary task carrying only a registered capability name; nothing else supplied'),
        evidence: {
          capability: LAYER_B_CAPABILITY,
          eligibility_state_supplied: null,
          executed: run.executed,
          stdout_present: typeof run.result?.stdout === 'string',
        },
        note: run.executed
          ? 'registration alone yielded an executed invocation; no eligibility state was supplied or required'
          : 'registration alone did not yield execution',
      };
    },
  },
  {
    id: 'RB-F2',
    statement: 'Registry membership is not a lane grant. name ∈ CAPABILITIES cannot by itself confer C0.',
    predicted: 'RED',
    calibrationAnchor: true,
    evidenceClass: 'BEHAVIORAL',
    run(ctx) {
      // Two otherwise-identical tasks. The ONLY difference is registry membership.
      const a = ctx.mods.router.route({ capability: LAYER_B_CAPABILITY });
      const b = ctx.mods.router.route({ capability: UNREGISTERED });
      const membershipDecidesLane = a.execution_lane === 'C0' && b.execution_lane !== 'C0';
      return {
        observed: membershipDecidesLane ? 'RED' : 'GREEN',
        precondition: pre('REQUIRED', (a && b) ? 'REACHED' : 'UNREACHED',
          { both_tasks_presented_to_real_router: Boolean(a && b),
            routing_judgment_observed: { a: a.status, b: b.status } },
          'router.route() invoked directly on the subject module for both arms'),
        evidence: {
          task_a: { capability: LAYER_B_CAPABILITY, registered: true, lane: a.execution_lane, reason: a.reason },
          task_b: { capability: UNREGISTERED, registered: false, lane: b.execution_lane, reason: b.reason },
          sole_differentiator: 'registry membership',
        },
        note: membershipDecidesLane
          ? 'membership is the sole causal differentiator of the C0 lane grant'
          : 'membership alone did not determine the lane',
      };
    },
  },
  {
    id: 'RB-F3',
    statement: 'Lane selection is not authority. Placement cannot satisfy authorization requirements.',
    predicted: 'RED',
    evidenceClass: 'BEHAVIORAL',
    layerB: true,
    async run(ctx) {
      // PRECONDITION — a valid executable placement must actually be REACHED,
      // by the legitimate means the subject offers. Before RB-6A that was
      // registration alone; after RB-6A it requires a declared eligibility.
      const declare = await loadEligibilityProducer(ctx.subjectDir);
      const { decision, how, eligibility_basis } = reachValidPlacement(ctx.mods, LAYER_B_CAPABILITY, declare);
      const precondition = pre('REQUIRED', reached(decision) ? 'REACHED' : 'UNREACHED',
        { requirement: 'a valid executable placement (C0) reached through the subject production composition',
          witness: { lane: decision.execution_lane, status: decision.status, reason: decision.reason },
          eligibility_basis, fabricated: false },
        how);
      if (precondition.state === 'UNREACHED') {
        return { observed: 'PRECONDITION-UNMET', precondition,
          evidence: { reason: 'no valid lane was reached, so authority could not be withheld against one' },
          note: '⛔ PRECONDITION-UNMET — the probe never obtained the state its frozen meaning requires' };
      }
      // Only now: withhold ALL invocation authority and observe execution.
      let executed = false, error = null;
      try {
        ctx.mods.deterministic.runCapability(LAYER_B_CAPABILITY, {}, ctx.subjectDir);
        executed = true;
      } catch (e) { error = e.message; }
      return {
        observed: executed ? 'RED' : 'GREEN',
        precondition,
        evidence: {
          lane: decision.execution_lane,
          authority_supplied: { packet: null, gate: null, permission_envelope: null, actor: null, execution_authority: null },
          executed, error,
        },
        note: executed
          ? 'a valid lane was reached and execution occurred with zero invocation authority'
          : 'a valid lane was reached and execution was refused without invocation authority',
      };
    },
  },
  {
    id: 'RB-F4',
    statement: 'Missing effect contract is not read-only. Absence of classification cannot inherit safety.',
    predicted: 'RED',
    evidenceClass: 'BEHAVIORAL',
    layerB: true,
    async run(ctx) {
      const reg = ctx.mods.deterministic.CAPABILITIES;
      const names = Object.keys(reg);
      const hasDecl = (n) => {
        const e = reg[n];
        return Boolean(e) && (e.effect !== undefined || e.effect_contract !== undefined || e.mutation !== undefined);
      };
      const undeclared = names.filter((n) => !hasDecl(n));
      const probeUndeclared = !hasDecl(LAYER_B_CAPABILITY);

      // PRECONDITION — the undeclared capability must be LEGITIMATELY ROUTED.
      // ⛔ Absence of an effect contract can only be shown insufficient if the
      //    invocation was otherwise eligible.
      const declare = await loadEligibilityProducer(ctx.subjectDir);
      const { decision, how, eligibility_basis } = reachValidPlacement(ctx.mods, LAYER_B_CAPABILITY, declare);
      const precondition = pre('REQUIRED', (probeUndeclared && reached(decision)) ? 'REACHED' : 'UNREACHED',
        { probe_capability: LAYER_B_CAPABILITY,
          probe_has_effect_declaration: !probeUndeclared,
          registered_total: names.length,
          with_effect_declaration: names.length - undeclared.length,
          without_effect_declaration: undeclared.length,
          route_witness: { lane: decision.execution_lane, status: decision.status },
          eligibility_basis },
        how);
      if (precondition.state === 'UNREACHED') {
        return { observed: 'PRECONDITION-UNMET', precondition,
          evidence: { reason: probeUndeclared
            ? 'the undeclared capability was not legitimately routed, so missing classification was never tested'
            : 'the probe capability now carries an effect declaration; a different undeclared specimen is required' },
          note: '⛔ PRECONDITION-UNMET — absence of classification can only be tested on an otherwise-eligible invocation' };
      }
      let executed = false, error = null;
      try { ctx.mods.deterministic.runCapability(LAYER_B_CAPABILITY, {}, ctx.subjectDir); executed = true; }
      catch (e) { error = e.message; }
      return {
        observed: executed ? 'RED' : 'GREEN',
        precondition,
        evidence: {
          effect_declaration_present: false,
          otherwise_eligible: true,
          executed, error,
          question: 'did absence of an effect contract prevent execution?',
          answer: executed ? 'no' : 'yes',
        },
        note: executed
          ? 'an otherwise-eligible invocation executed with NO effect declaration — absence was accepted as sufficient'
          : 'execution was refused while classification was unresolved',
      };
    },
  },
  {
    id: 'RB-F5',
    statement: 'Caller/packet cannot elevate registration semantics.',
    predicted: 'UNINSTANTIATED',
    evidenceClass: 'BEHAVIORAL',
    uninstantiated: true,
    run() {
      return {
        observed: 'UNINSTANTIATED',
        precondition: pre('NOT_REQUIRED', 'N/A',
          { rationale: 'frozen in the probe specification: no legitimate specimen exists, so there is no state to reach' },
          'RB spec §5 — structurally frozen, deliberately uninstantiated'),
        evidence: {
          reason: 'the repaired request shape does not exist; no legitimate specimen can be constructed',
          forbidden_substitute: 'inventing a legacy RED by asserting a self-grant the census never showed',
        },
        note: 'structurally frozen, deliberately uninstantiated — ⛔ never discharges (FR-14)',
      };
    },
  },
  {
    id: 'RB-F6',
    statement: 'Routing remains non-authoritative. The router may not possess authority-making power.',
    predicted: 'RED',
    evidenceClass: 'BEHAVIORAL',
    layerB: true,
    async run(ctx) {
      // Two arms, SAME registered capability, SAME (absent) authority state.
      // ⛔ Not registered-vs-unknown — that is RB-F8's discriminant.
      const declare = await loadEligibilityProducer(ctx.subjectDir);
      const armA = reachValidPlacement(ctx.mods, LAYER_B_CAPABILITY, declare);
      const armBDecision = declare
        ? ctx.mods.router.route({ capability: LAYER_B_CAPABILITY },
            declare({ satisfied: false, basis: 'jop04_instrument_declaration', declared_by: 'rb-falsifiers' }))
        : ctx.mods.router.route({ capability: LAYER_B_CAPABILITY });
      const armAReached = reached(armA.decision);
      const armBReached = !reached(armBDecision);
      const precondition = pre('REQUIRED', (armAReached && armBReached) ? 'REACHED' : 'UNREACHED',
        { requirement: 'ARM A reaches a valid routing result AND ARM B reaches a non-routable/refused state, for the SAME registered capability',
          witness: { arm_a: { lane: armA.decision.execution_lane, status: armA.decision.status },
                     arm_b: { lane: armBDecision.execution_lane, status: armBDecision.status } },
          arm_a_reached: armAReached, arm_b_reached: armBReached,
          capability_identity_constant: true, fabricated: false },
        armA.how + ' | arm B: ' + (declare ? 'declared eligibility UNSATISFIED' : 'no producer exists — no way to withhold routing for a registered capability'));
      if (precondition.state === 'UNREACHED') {
        return { observed: 'PRECONDITION-UNMET', precondition,
          evidence: { reason: armBReached ? 'arm A did not reach a valid routing result' : 'arm B could not reach a non-routable state for a registered capability' },
          note: '⛔ PRECONDITION-UNMET — both arms are required, on one capability identity' };
      }
      // Authority state identical (absent) in both arms; only routing differs.
      const execA = (() => { try { ctx.mods.deterministic.runCapability(LAYER_B_CAPABILITY, {}, ctx.subjectDir); return true; } catch { return false; } })();
      const routingDecides = reached(armA.decision) !== reached(armBDecision) && execA;
      return {
        observed: routingDecides ? 'RED' : 'GREEN',
        precondition,
        evidence: {
          authority_state: 'identical and absent in both arms',
          arm_a: { lane: armA.decision.execution_lane, executable: true, executes: execA },
          arm_b: { lane: armBDecision.execution_lane, status: armBDecision.status, executable: false, executes: false },
          only_variable: 'routing condition',
        },
        note: routingDecides
          ? 'varying only the routing condition decided whether the act could occur — the router still carries authority-making power'
          : 'routing output did not decide whether the act was authorized',
      };
    },
  },
  {
    id: 'RB-F7',
    statement: 'Existing read capability remains semantically read (complements Effect Substrate F12, content inline in RB-F7).',
    predicted: 'N/A',
    evidenceClass: 'BEHAVIORAL',
    notApplicable: true,
    run() {
      return {
        observed: 'N/A',
        precondition: pre('NOT_REQUIRED', 'N/A',
          { rationale: 'frozen in the probe specification: the obligation does not yet apply' },
          'RB spec §5 — not applicable until re-expression exists'),
        evidence: { reason: 'requires re-expression through the new registration model, which does not exist' },
        note: 'not applicable at this baseline — ⛔ never discharges',
      };
    },
  },
  {
    id: 'RB-F8',
    statement: 'Unregistered remains impossible.',
    predicted: 'GREEN',
    evidenceClass: 'BEHAVIORAL',
    run(ctx) {
      const decision = ctx.mods.router.route({ capability: UNREGISTERED });
      const routedToExecutable = decision.execution_lane === 'C0';
      let seamRefused = false;
      let seamError = null;
      try {
        ctx.mods.deterministic.runCapability(UNREGISTERED, {}, ctx.subjectDir);
      } catch (e) {
        seamRefused = true;
        seamError = e.message;
      }
      const chain = composeSubjectChain(ctx.mods, ctx.subjectDir, { capability: UNREGISTERED });
      const impossible = !routedToExecutable && seamRefused && !chain.executed;
      return {
        observed: impossible ? 'GREEN' : 'RED',
        precondition: pre('REQUIRED', 'REACHED',
          { unknown_name_presented_to_router: true, unknown_name_presented_to_seam: true,
            router_witness: { lane: decision.execution_lane, status: decision.status },
            seam_witness: seamError },
          'unregistered name passed to the subject router AND to runCapability directly'),
        evidence: {
          capability: UNREGISTERED,
          routed_lane: decision.execution_lane,
          routed_to_executable_placement: routedToExecutable,
          seam_refused: seamRefused,
          seam_error: seamError,
          chain_executed: chain.executed,
        },
        note: impossible
          ? 'unregistered name reached neither executable placement nor the handler seam'
          : '⛔ an unregistered capability found a path — execution authority has widened',
      };
    },
  },
];

/** STRUCTURAL TRIPWIRE — records the IPC consuming branch the harness cannot execute. */
export function ipcCompositionTripwire(mainJsPath) {
  let src = '';
  try { src = readFileSync(mainJsPath, 'utf8'); } catch (e) { return { readable: false, error: e.message }; }
  return {
    readable: true,
    submit_task_handler_present: src.includes("ipcMain.handle('jarvis:submit-task'"),
    c0_branch_consumes_lane: src.includes("decision.execution_lane === 'C0'"),
    calls_run_capability: src.includes('runCapability(task.capability, task.args || {}, currentRoot())'),
    evidence_class: 'STRUCTURAL',
    discharges: false,
    note: 'the IPC hop is NOT exercised (no Electron host). This records the consuming branch only and discharges nothing.',
  };
}
