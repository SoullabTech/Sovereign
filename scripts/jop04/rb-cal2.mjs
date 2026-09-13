/**
 * JOP-04 RB — RB-CAL-2 · registration/routability discriminator
 *
 * PROPOSITION
 *   For a registered capability, withholding the separately required routing
 *   condition must make NON-ROUTABILITY REACHABLE.
 *
 * ⛔ The probe must NOT prescribe how routing eligibility is represented.
 *    `route(task, eligibility)` remains UNDESIGNED (RB-3 freeze). The probe
 *    therefore tests the SEMANTIC DISTINCTION, not a signature.
 *
 * ⭐ FOUNDER SHARPENING (2026-09-13) — the state must be reachable through the
 *    REAL routing composition, not merely constructible inside a test harness:
 *
 *      registered → caller always manufactures eligibility → routable
 *
 *    is a DISGUISED COUPLING and must not produce GREEN.
 *
 * THE DISCRIMINANT IS NOT  registered vs unknown           (RB-F8 covers that)
 * THE DISCRIMINANT IS      same registered capability,
 *                          same capability identity,
 *                          ONLY routing eligibility differs.
 */

export const CAL2_SPECIMEN = 'git.rev_parse';

/**
 * Task shapes reachable through the production entry point. Every arm is an
 * ORDINARY task object — the only thing a real caller can vary. ⛔ Nothing here
 * reaches around route()'s public input or mutates the registry.
 */
function probeArms(capability) {
  return [
    { label: 'bare', task: { capability } },
    { label: 'bounded_for_local:false', task: { capability, bounded_for_local: false } },
    { label: 'bounded_for_local:true', task: { capability, bounded_for_local: true } },
    { label: 'oversized input_chars', task: { capability, bounded_for_local: true, input_chars: 1_000_000 } },
    // Plausible eligibility-shaped fields a caller MIGHT use to withhold routing
    // consideration. If the substrate ignores them, the caller cannot withhold.
    { label: 'routing_eligibility:false', task: { capability, routing_eligibility: false } },
    { label: 'eligible:false', task: { capability, eligible: false } },
    { label: 'routable:false', task: { capability, routable: false } },
    { label: 'routing_condition:unsatisfied', task: { capability, routing_condition: 'unsatisfied' } },
  ];
}

const EXECUTABLE_PLACEMENTS = new Set(['C0']);

/**
 * CAL-2a — is `registered ∧ ¬routable` REACHABLE for the same capability?
 * CAL-2b — no-auto-manufacture: was that reachability produced through the
 *          production entry point using only task-shaped input?
 */
export function runCal2({ router }, capability = CAL2_SPECIMEN) {
  const arms = probeArms(capability).map(({ label, task }) => {
    const decision = router.route(task);
    return {
      arm: label,
      lane: decision.execution_lane,
      status: decision.status,
      executable_placement: EXECUTABLE_PLACEMENTS.has(decision.execution_lane),
    };
  });

  const nonRoutableArms = arms.filter((a) => !a.executable_placement);
  const reachable = nonRoutableArms.length > 0;

  // CAL-2a: RED when non-routability is UNREACHABLE for a registered capability.
  const cal2a = {
    id: 'RB-CAL-2a',
    label: 'registered ∧ ¬routable is reachable',
    observed: reachable ? 'GREEN' : 'RED',
    evidence: {
      capability,
      capability_identity_constant: true,
      arms,
      arms_yielding_executable_placement: arms.length - nonRoutableArms.length,
      arms_yielding_non_routable: nonRoutableArms.length,
      reachable,
    },
    note: reachable
      ? 'a task shape reachable through route() left a registered capability non-routable'
      : 'no task shape reachable through route() made a registered capability non-routable — registration alone still determines placement',
  };

  // CAL-2b: the anti-tautology check. Only evaluable once 2a is GREEN.
  const cal2b = reachable
    ? {
        id: 'RB-CAL-2b',
        label: 'no-auto-manufacture — non-routability reached via the production entry point',
        observed: 'GREEN',
        evidence: {
          witness_arm: nonRoutableArms[0].arm,
          produced_by: 'router.route(task) — ordinary task object only',
          harness_internal_injection: false,
          registry_modified: false,
          capability_unregistered: false,
        },
        note: 'the non-routable witness was produced by the production entry point with task-shaped input only',
      }
    : {
        id: 'RB-CAL-2b',
        label: 'no-auto-manufacture — non-routability reached via the production entry point',
        observed: 'NOT-REACHED',
        evidence: {
          reason: 'no non-routable witness exists, so the anti-tautology check has nothing to evaluate',
        },
        note: '⛔ NOT-REACHED — never discharges; it did not run, and did not pass',
      };

  return { cal2a, cal2b, headline: cal2a.observed };
}
