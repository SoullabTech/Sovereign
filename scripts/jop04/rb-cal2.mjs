/**
 * JOP-04 RB — RB-CAL-2 · registration/routability discriminator
 *
 * PROPOSITION
 *   For a registered capability, withholding the separately required routing
 *   condition must make NON-ROUTABILITY REACHABLE — through the REAL routing
 *   composition, never merely constructible inside this harness.
 *
 * ⛔ Does not prescribe a signature. Probes the SEMANTIC DISTINCTION.
 * ⛔ Tolerates the pre-repair substrate: if no eligibility module exists, the
 *    probe records that and returns RED / PRECONDITION-UNMET rather than crashing.
 *
 * CAL-2a  is `registered ∧ ¬routable` REACHABLE?
 * CAL-2b  NO-AUTO-MANUFACTURE — is the routing condition's truth something
 *         other than registry membership wearing another field name?
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

export const CAL2_SPECIMEN = 'git.rev_parse';
const EXECUTABLE_PLACEMENTS = new Set(['C0']);
const isExecutable = (d) => EXECUTABLE_PLACEMENTS.has(d.execution_lane);

/** Load the subject's routing-eligibility producer, if the repair created one. */
async function loadEligibility(subjectDir) {
  const p = path.join(subjectDir, 'scripts', 'builder', 'routing-eligibility.mjs');
  try { return { present: true, mod: await import(`file://${p}`) }; }
  catch { return { present: false, mod: null }; }
}

export async function runCal2({ router, mainJsPath }, subjectDir, capability = CAL2_SPECIMEN) {
  const elig = await loadEligibility(subjectDir);
  const call = (task, second) => {
    try { return second === undefined ? router.route(task) : router.route(task, second); }
    catch (e) { return { execution_lane: null, status: 'threw', reason: e.message }; }
  };

  const arms = [];
  const push = (label, decision, meta = {}) => arms.push({
    arm: label, lane: decision.execution_lane, status: decision.status,
    executable_placement: isExecutable(decision), ...meta,
  });

  // ── ordinary task shapes: nothing but a task object reaches route() ───────
  push('bare (no routing condition)', call({ capability }));
  push('bounded_for_local:true', call({ capability, bounded_for_local: true }));
  push('oversized input_chars', call({ capability, bounded_for_local: true, input_chars: 1_000_000 }));
  push('caller asserts routing_eligibility:false', call({ capability, routing_eligibility: false }));

  // ── FORGERY ARM — a plain object claiming to be a routing condition ──────
  // The BoundEvidence law: a privileged object cannot become privileged
  // because a caller says that it is.
  const forged = call({ capability }, { satisfied: true, basis: 'forged-by-caller' });
  push('FORGED unbranded { satisfied: true }', forged, { forgery: true });

  // ── declared arms — only available once the repair creates the producer ──
  let declaredSatisfied = null, declaredUnsatisfied = null, declaredBasis = null;
  if (elig.present && typeof elig.mod.declareRoutingEligibility === 'function') {
    const yes = elig.mod.declareRoutingEligibility({
      satisfied: true, basis: 'operator_submission', declared_by: 'jop04-instrument',
    });
    const no = elig.mod.declareRoutingEligibility({
      satisfied: false, basis: 'operator_submission', declared_by: 'jop04-instrument',
    });
    declaredBasis = yes.basis;
    declaredSatisfied = call({ capability }, yes);
    declaredUnsatisfied = call({ capability }, no);
    push('declared routing condition SATISFIED', declaredSatisfied, { declared: true });
    push('declared routing condition UNSATISFIED', declaredUnsatisfied, { declared: true });
  }

  const nonRoutable = arms.filter((a) => !a.executable_placement);
  const reachable = nonRoutable.length > 0;

  const cal2a = {
    id: 'RB-CAL-2a',
    label: 'registered ∧ ¬routable is reachable',
    observed: reachable ? 'GREEN' : 'RED',
    precondition: {
      requirement: 'REQUIRED', state: arms.length > 0 ? 'REACHED' : 'UNREACHED',
      evidence: { registered_capability_exercised_through_production_routing_entry: true, arms_presented: arms.length },
      provenance: 'every arm is an ordinary task object passed to the subject router.route(); no harness-internal state',
    },
    evidence: {
      capability, capability_identity_constant: true,
      eligibility_producer_present: elig.present,
      arms,
      arms_executable: arms.length - nonRoutable.length,
      arms_non_routable: nonRoutable.length,
      reachable,
    },
    note: reachable
      ? 'a task shape reachable through route() left a registered capability non-routable'
      : 'no task shape reachable through route() made a registered capability non-routable — registration alone still determines placement',
  };

  // ── CAL-2b · no-auto-manufacture ─────────────────────────────────────────
  if (!reachable) {
    return {
      cal2a,
      cal2b: {
        id: 'RB-CAL-2b',
        label: 'no-auto-manufacture — routing truth is not registry membership renamed',
        observed: 'PRECONDITION-UNMET',
        precondition: {
          requirement: 'REQUIRED', state: 'UNREACHED',
          evidence: { registered_and_routable_reached: true, registered_and_non_routable_reached: false },
          provenance: 'no task shape produced a non-routable state for a registered capability',
        },
        evidence: { reason: 'no non-routable witness exists, so the anti-tautology check has nothing to evaluate' },
        note: '⛔ PRECONDITION-UNMET — never discharges; it did not run, and did not pass',
      },
      headline: cal2a.observed,
    };
  }

  // STRUCTURAL tripwire — does the production caller derive the fact from the registry?
  let callerSrc = '';
  try { callerSrc = readFileSync(mainJsPath, 'utf8'); } catch { /* recorded below */ }
  const registryDerivedInCaller = /CAPABILITIES\s*\[[^\]]+\]\s*\?|hasOwnProperty[\s\S]{0,80}(routing|eligib)/i.test(callerSrc);

  const forgeryRefused = !forged || !isExecutable(forged);
  const bothStatesShown = !!declaredSatisfied && isExecutable(declaredSatisfied)
    && !!declaredUnsatisfied && !isExecutable(declaredUnsatisfied);
  const pass = forgeryRefused && bothStatesShown && !registryDerivedInCaller;

  return {
    cal2a,
    cal2b: {
      id: 'RB-CAL-2b',
      label: 'no-auto-manufacture — routing truth is not registry membership renamed',
      observed: pass ? 'GREEN' : 'RED',
      precondition: {
        requirement: 'REQUIRED', state: bothStatesShown ? 'REACHED' : 'UNREACHED',
        evidence: {
          registered_and_routable_reached: Boolean(declaredSatisfied && isExecutable(declaredSatisfied)),
          registered_and_non_routable_reached: Boolean(declaredUnsatisfied && !isExecutable(declaredUnsatisfied)),
          routing_condition_provenance: declaredBasis,
        },
        provenance: 'both states obtained through the subject router with a declared eligibility from the subject producer',
      },
      evidence: {
        witness_non_routable_arm: nonRoutable[0].arm,
        produced_by: 'router.route(...) — production entry point',
        harness_internal_injection: false,
        registry_modified: false,
        capability_unregistered: false,
        forgery_refused: forgeryRefused,
        forged_arm_lane: forged.execution_lane,
        both_states_shown_same_capability: bothStatesShown,
        declared_basis: declaredBasis,
        caller_derives_condition_from_registry: registryDerivedInCaller,
        caller_scan_class: 'STRUCTURAL (supplementary; does not discharge on its own)',
      },
      note: pass
        ? 'both states reached for one capability; an unbranded assertion was refused; the caller does not derive the condition from the registry'
        : '⛔ the routing condition can be manufactured — forgery accepted, or both states not shown, or the caller derives it from CAPABILITIES',
      limitation: 'provenance is proven up to UNFORGEABILITY plus a DECLARED basis. A caller that computes a satisfied condition from membership and declares an honest-looking basis is caught only by the structural scan.',
    },
    headline: cal2a.observed,
  };
}
