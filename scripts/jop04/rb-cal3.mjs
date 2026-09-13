/**
 * JOP-04 RB-6B — CAL-3 · routing/execution discriminator
 *
 * GOVERNING LAW (frozen 2026-09-13)
 *   Routing may be requester-influenced.
 *   Execution authority may NOT be requester-minted or requester-transported.
 *
 *     caller MAY request   "consider this task for routing"
 *     caller MAY NOT assert "therefore execute it"
 *
 *   ROUTABLE ≠ EXECUTABLE  must become an observable PRODUCTION state.
 *
 * ⛔ This module names no execution-authority type. It tests the SEMANTIC
 *    distinction; the repair's shape is undesigned.
 * ⛔ It NEVER fabricates a missing authority to make an arm runnable. An arm
 *    whose mechanism does not exist is UNINSTANTIATED — never GREEN, never RED.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

export const CAL3_SPECIMEN = 'git.rev_parse';

/**
 * FROZEN HOST-ORIGIN CONTRACT — an execution decision is legitimate for RB-6B
 * purposes only if it originated INSIDE the trusted host side of the IPC
 * boundary. These are architectural disqualifiers, not naming rules:
 */
export const HOST_ORIGIN_CONTRACT = Object.freeze({
  disqualified: Object.freeze([
    'a field on the submitted task (e.g. task.execution_authorized)',
    'a nested object supplied through jarvis:submit-task',
    'a branded object created in the renderer',
    'a caller-supplied value merely rewrapped by main.js — mintPermit(task.callerSuppliedDecision)',
    'any value whose truth is a function of the routing result alone',
  ]),
  required: 'the decision depends on at least one fact the router did not produce and the caller could not supply',
});

async function loadEligibility(subjectDir) {
  const p = path.join(subjectDir, 'scripts', 'builder', 'routing-eligibility.mjs');
  try { return (await import(`file://${p}`)).declareRoutingEligibility ?? null; }
  catch { return null; }
}

/** Reach a valid route the legitimate way, recording how. ⛔ Never fabricated. */
async function reachValidRoute({ router }, subjectDir, capability) {
  const declare = await loadEligibility(subjectDir);
  if (declare) {
    const e = declare({ satisfied: true, basis: 'jop04_instrument_declaration', declared_by: 'rb-cal3' });
    return { decision: router.route({ capability }, e), how: 'declared routing eligibility (subject producer) → route()' };
  }
  return { decision: router.route({ capability }), how: 'route() with an ordinary task — subject grants placement without a separate condition' };
}

/**
 * Does any independent execution-decision boundary exist between the routing
 * result and the seam? Read structurally from the subject's own caller.
 */
function executionDecisionBoundary(mainJsPath) {
  let src = '';
  try { src = readFileSync(mainJsPath, 'utf8'); } catch { return { readable: false }; }
  const c0Branch = /if \(decision\.execution_lane === 'C0'\) \{([\s\S]{0,1200}?)runCapability\(/.exec(src);
  return {
    readable: true,
    c0_branch_found: Boolean(c0Branch),
    statements_between_lane_test_and_seam: c0Branch ? c0Branch[1].split('\n').filter((l) => l.trim() && !l.trim().startsWith('//')).length : null,
    any_decision_gate_between: c0Branch ? /execut\w*(Decision|Permit|Authority)/i.test(c0Branch[1]) : null,
    evidence_class: 'STRUCTURAL (supplementary; discharges nothing)',
  };
}

export async function runCal3(ctx, subjectDir, capability = CAL3_SPECIMEN) {
  const { decision, how } = await reachValidRoute(ctx.mods, subjectDir, capability);
  const routeReached = decision.execution_lane === 'C0';
  const boundary = executionDecisionBoundary(ctx.mods.mainJsPath);

  // ── CAL-3a · a legitimate route must not, by itself, cause execution ──────
  let executed = false, error = null;
  if (routeReached) {
    try { ctx.mods.deterministic.runCapability(capability, {}, subjectDir); executed = true; }
    catch (e) { error = e.message; }
  }
  const cal3a = {
    id: 'RB-CAL-3a',
    label: 'a legitimate routing result is not by itself sufficient to cause execution',
    observed: routeReached ? (executed ? 'RED' : 'GREEN') : 'PRECONDITION-UNMET',
    precondition: {
      requirement: 'REQUIRED', state: routeReached ? 'REACHED' : 'UNREACHED',
      evidence: { capability, route_witness: { lane: decision.execution_lane, status: decision.status },
                  independent_host_execution_decision_supplied: null },
      provenance: how,
    },
    evidence: { executed, error, execution_decision_boundary: boundary },
    note: routeReached
      ? (executed
        ? 'a legitimately routed invocation executed with NO independent host execution decision'
        : 'a legitimately routed invocation did not execute without an independent decision')
      : '⛔ PRECONDITION-UNMET — no valid route was reached',
  };

  // ── CAL-3b · the discriminating state, both arms ──────────────────────────
  // ARM A  valid route + host decision ABSENT  → must NOT execute
  // ARM B  valid route + host decision CONSTITUTED → may execute
  // ⛔ ARM B cannot be legitimately instantiated: no host-minted decision
  //    mechanism exists. Fabricating one in the harness would test the harness.
  const cal3b = {
    id: 'RB-CAL-3b',
    label: 'same capability, same route — only the independent host execution decision differs',
    observed: 'UNINSTANTIATED',
    precondition: {
      requirement: 'REQUIRED', state: 'UNREACHED',
      evidence: {
        arm_a_reached: routeReached,
        arm_a_result: routeReached ? (executed ? 'EXECUTED (defect)' : 'not executed') : 'route not reached',
        arm_b_reached: false,
        arm_b_reason: 'no host-minted execution decision mechanism exists in the subject',
      },
      provenance: 'ARM A observed through the subject composition; ARM B has no mechanism to observe',
    },
    evidence: { host_origin_contract: HOST_ORIGIN_CONTRACT },
    note: '⛔ UNINSTANTIATED — ARM B has no mechanism yet; ⛔ it was NOT fabricated to make the probe runnable',
  };

  // ── CAL-3c · anti-self-grant, future-facing ──────────────────────────────
  const cal3c = {
    id: 'RB-CAL-3c',
    label: 'caller-controlled data resembling execution authority cannot cause a routed invocation to execute',
    observed: 'UNINSTANTIATED',
    precondition: {
      requirement: 'REQUIRED', state: 'UNREACHED',
      evidence: { reason: 'the repaired host-side authority form does not exist, so its closest caller-controlled counterfeit cannot be constructed' },
      provenance: 'frozen in the probe specification',
    },
    evidence: {
      forbidden_shortcut: '⛔ spraying arbitrary fields (approved:true, authorized:true) and calling that proof',
      when_instantiable: 'once a real host-side authority form exists, the probe must attempt the CLOSEST caller-controlled counterfeit of THAT form',
      note: 'this will likely become the first concrete specimen for RB-F5, which has remained abstract',
    },
    note: '⛔ UNINSTANTIATED — a counterfeit must mirror a real shape; there is no shape yet',
  };

  // ── CAL-3d · no auto-mint from the route ─────────────────────────────────
  const cal3d = {
    id: 'RB-CAL-3d',
    label: 'the host execution decision may not be auto-minted from the routing result',
    observed: 'UNINSTANTIATED',
    precondition: {
      requirement: 'REQUIRED', state: 'UNREACHED',
      evidence: { reason: 'no host execution decision exists, so it cannot yet be shown to depend on a fact independent of the route' },
      provenance: 'frozen in the probe specification',
    },
    evidence: {
      counterfeit: "if (route.lane === 'C0') { decision = mintHostDecision() }",
      why_worthless: '⭐ technically host-minted and architecturally worthless — the truth of the decision is still a function of the route',
      required_when_instantiable: 'withholding the decision must be REACHABLE while the same valid route is produced',
    },
    note: '⛔ UNINSTANTIATED — host-minted is necessary and not sufficient; independence from the route is the real test',
  };

  return { cal3a, cal3b, cal3c, cal3d };
}

/**
 * REAL IPC HOST WITNESS — specification + availability check.
 * ⛔ NEVER falls back to the simulated composition. Absence is reported, not
 *    substituted: the simulated path is exactly what cannot discharge F3/F6.
 */
export function ipcHostWitness(subjectDir) {
  const required = [
    "renderer/request → ipcMain('jarvis:submit-task')",
    'route()',
    'C0 branch / successor',
    'execution decision boundary',
    'runCapability()',
  ];
  let electron = false;
  try { electron = Boolean(require.resolve); } catch { /* ignore */ }
  let hasElectronDep = false;
  try {
    const pkg = JSON.parse(readFileSync(path.join(subjectDir, 'jarvis-desktop', 'package.json'), 'utf8'));
    hasElectronDep = Boolean((pkg.devDependencies && pkg.devDependencies.electron) || (pkg.dependencies && pkg.dependencies.electron));
  } catch { /* recorded below */ }
  const available = false; // no Electron host in this environment; never assumed
  return {
    id: 'RB-IPC-WITNESS',
    observed: available ? 'PENDING' : 'HOST_WITNESS_UNAVAILABLE',
    required_path: required,
    capability_policy: 'existing harmless registered read capability ONLY — ⛔ no effect-bearing capability, ever',
    electron_declared_in_subject: hasElectronDep,
    substitution_policy: '⛔ the simulated route()+runCapability() composition MUST NOT be substituted; it is exactly what cannot discharge RB-F3/RB-F6',
    consequence: 'RB-6B cannot close GREEN until a founder-run host witness captures both pre- and post-repair semantics',
    discharges: false,
    _unused: electron,
  };
}
