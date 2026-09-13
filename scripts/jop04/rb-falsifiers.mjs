/**
 * JOP-04 RB — frozen falsifiers RB-F1…RB-F8 as executable obligations.
 *
 * Verdict vocabulary
 *   RED             the forbidden property IS present — the falsifier fails
 *   GREEN           the required property holds
 *   UNINSTANTIATED  no legitimate specimen exists yet — ⛔ NEVER DISCHARGES
 *   N/A             not applicable at this baseline — ⛔ NEVER DISCHARGES
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

export const LAYER_B_CAPABILITY = 'git.rev_parse';
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
      // No eligibility state is withheld because none exists to withhold — that is the finding.
      const run = composeSubjectChain(ctx.mods, ctx.subjectDir, { capability: LAYER_B_CAPABILITY });
      const observed = run.executed ? 'RED' : 'GREEN';
      return {
        observed,
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
    run(ctx) {
      // A valid routing result is supplied while ALL invocation authority is withheld.
      const run = composeSubjectChain(ctx.mods, ctx.subjectDir, { capability: LAYER_B_CAPABILITY });
      const observed = run.executed ? 'RED' : 'GREEN';
      return {
        observed,
        evidence: {
          lane: run.decision.execution_lane,
          authority_supplied: { packet: null, gate: null, permission_envelope: null, actor: null },
          executed: run.executed,
        },
        note: run.executed
          ? 'execution occurred with a valid lane and zero invocation authority'
          : 'a valid lane did not by itself permit execution',
      };
    },
  },
  {
    id: 'RB-F4',
    statement: 'Missing effect contract is not read-only. Absence of classification cannot inherit safety.',
    predicted: 'RED',
    evidenceClass: 'BEHAVIORAL',
    run(ctx) {
      const reg = ctx.mods.deterministic.CAPABILITIES;
      const names = Object.keys(reg);
      const declared = names.filter((n) => {
        const e = reg[n];
        return e && (e.effect !== undefined || e.effect_contract !== undefined || e.mutation !== undefined);
      });
      const undeclared = names.filter((n) => !declared.includes(n));
      // Is an undeclared entry nonetheless executable?
      const run = composeSubjectChain(ctx.mods, ctx.subjectDir, { capability: LAYER_B_CAPABILITY });
      const undeclaredExecuted = undeclared.includes(LAYER_B_CAPABILITY) && run.executed;
      return {
        observed: undeclaredExecuted ? 'RED' : 'GREEN',
        evidence: {
          registered_total: names.length,
          with_effect_declaration: declared.length,
          without_effect_declaration: undeclared.length,
          probe_capability: LAYER_B_CAPABILITY,
          probe_has_declaration: declared.includes(LAYER_B_CAPABILITY),
          probe_executed: run.executed,
        },
        note: undeclaredExecuted
          ? 'a capability carrying no effect declaration executed — absence of classification inherited safety'
          : 'an undeclared capability did not execute',
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
    run(ctx) {
      // Authority held constant (there is none). ONLY the routing output varies.
      const routed = composeSubjectChain(ctx.mods, ctx.subjectDir, { capability: LAYER_B_CAPABILITY });
      const unrouted = composeSubjectChain(ctx.mods, ctx.subjectDir, { capability: UNREGISTERED });
      const routingDecidesExecution = routed.executed !== unrouted.executed;
      return {
        observed: routingDecidesExecution ? 'RED' : 'GREEN',
        evidence: {
          authority_state: 'constant (none supplied in either arm)',
          arm_1: { lane: routed.decision.execution_lane, executed: routed.executed },
          arm_2: { lane: unrouted.decision.execution_lane, executed: unrouted.executed },
        },
        note: routingDecidesExecution
          ? 'varying only the routing output changed whether the act occurred — the router carries authority-making power'
          : 'routing output did not alter whether the act was authorized',
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
