/* JOP-04 RB-6B — CURRENT-LINEAGE POST-REPAIR REAL HOST WITNESS.
 *
 * Founder-run in JARVIS renderer DevTools. Uses one existing harmless read
 * capability only. The frozen pre-repair witness remains untouched.
 *
 * Arm B and Arm D each open MAIN's native confirmation. Choose Execute for B
 * and Cancel for D. No repository mutation capability is involved.
 */
(async () => {
  const CAPABILITY = 'git.rev_parse';
  const routedTask = {
    capability: CAPABILITY,
    args: {},
    routing: { satisfied: true, basis: 'operator_submission' },
  };
  const out = {
    witness: 'JOP-04 RB-6B current-lineage post-repair host witness',
    captured_at: new Date().toISOString(),
    arms: {},
  };

  // Control: registration alone is not routing.
  const control = await window.jarvis.submitTask({ capability: CAPABILITY, args: {} });
  out.arms.control_no_routing = {
    status: control.status,
    lane: control.execution_lane,
    executed: Boolean(control.result && control.result.exit_code !== undefined),
    pass: control.status === 'refused_not_routable'
      && control.execution_lane == null
      && !(control.result && control.result.exit_code !== undefined),
  };

  // Arm A: same valid route, decision absent. Must stage only.
  const a = await window.jarvis.submitTask(routedTask);
  out.arms.A_route_decision_absent = {
    status: a.status,
    lane: a.execution_lane,
    occurrence_id: a.occurrence_id || null,
    executed: Boolean(a.result && a.result.exit_code !== undefined),
    decision_present: Boolean(a.execution_decision),
    pass: a.execution_lane === 'C0'
      && a.status === 'ROUTED_AWAITING_EXECUTION_DECISION'
      && Boolean(a.occurrence_id)
      && !(a.result && a.result.exit_code !== undefined)
      && !a.execution_decision,
  };

  // Arm C: closest caller counterfeit — forged occurrence id.
  const c = await window.jarvis.executeRoutedTask('c0-forged-by-renderer');
  out.arms.C_caller_counterfeit = {
    status: c.status,
    reason: c.reason,
    executed: Boolean(c.result && c.result.exit_code !== undefined),
    pass: c.status === 'REFUSED'
      && c.reason === 'PENDING_OCCURRENCE_NOT_FOUND'
      && !(c.result && c.result.exit_code !== undefined),
  };

  // Arm B: same valid route + separate host decision. Choose Execute.
  const bStage = await window.jarvis.submitTask(routedTask);
  const b = await window.jarvis.executeRoutedTask(bStage.occurrence_id);
  out.arms.B_host_decision_constituted = {
    stage_status: bStage.status,
    status: b.status,
    executed: Boolean(b.result && b.result.exit_code !== undefined),
    decision_present: Boolean(b.execution_decision),
    decision_source: b.execution_decision?.source || null,
    occurrence_matches: b.execution_decision?.occurrence_id === bStage.occurrence_id,
    pass: bStage.status === 'ROUTED_AWAITING_EXECUTION_DECISION'
      && b.status === 'completed'
      && Boolean(b.result && b.result.exit_code !== undefined)
      && b.execution_decision?.source === 'host:native-confirmation'
      && b.execution_decision?.occurrence_id === bStage.occurrence_id,
  };

  // Arm D: same valid route, host deliberately withholds decision. Choose Cancel.
  const dStage = await window.jarvis.submitTask(routedTask);
  const withheld = await window.jarvis.executeRoutedTask(dStage.occurrence_id);
  out.arms.D_host_decision_withheld = {
    stage_status: dStage.status,
    status: withheld.status,
    executed: Boolean(withheld.result && withheld.result.exit_code !== undefined),
    decision_present: Boolean(withheld.execution_decision),
    pass: dStage.status === 'ROUTED_AWAITING_EXECUTION_DECISION'
      && withheld.status === 'EXECUTION_DECISION_WITHHELD'
      && !(withheld.result && withheld.result.exit_code !== undefined)
      && !withheld.execution_decision,
  };

  out.pass = Object.values(out.arms).every((arm) => arm.pass === true);
  console.log(JSON.stringify(out, null, 2));
  try {
    await navigator.clipboard.writeText(JSON.stringify(out, null, 2));
    console.log('— witness JSON copied to clipboard —');
  } catch {}
  return out;
})();
