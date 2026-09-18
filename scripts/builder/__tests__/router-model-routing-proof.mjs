#!/usr/bin/env node
import { planModelRoute, route } from '../router.mjs';

let passed = 0, failed = 0;
const assert = (name, condition, detail = '') => {
  if (condition) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}`); }
  if (detail) console.log(`          ${detail}`);
};
const ext = { external_network: true, provider_spend: true };

console.log('\n=== R1: legacy cost router remains unchanged ===');
{
  const d0 = route({ capability: 'inventory.routes' });
  const d1 = route({ bounded_for_local: true, input_chars: 50 });
  const d3 = route({ description: 'not declared local' });
  assert('legacy C0 still routes deterministic capability', d0.execution_lane === 'C0');
  assert('legacy C1 still routes bounded local', d1.execution_lane === 'C1');
  assert('legacy C3 still routes non-local-declared task', d3.execution_lane === 'C3');
}

console.log('\n=== R2: mechanical implementation is local Qwen first ===');
{
  const p = planModelRoute({ task_class: 'implementation', risk_class: 'mechanical' });
  assert('planned locally', p.status === 'planned' && p.cost_route === 'C1');
  assert('Qwen is primary code worker', p.primary?.provider_id === 'qwen-local' && p.primary.role === 'code_worker');
  assert('routine implementation has no automatic challenger', p.challengers.length === 0);
  assert('model output alone cannot advance work', p.advancement.model_output_sufficient === false);
  assert('implementation must pass independent verification', p.advancement.next_gate === 'independent_verification');
}

console.log('\n=== R3: high-assurance architecture gets local independent challenge ===');
{
  const p = planModelRoute({ task_class: 'architecture', risk_class: 'high' });
  assert('GPT-OSS is local reasoning primary', p.primary?.provider_id === 'gpt-oss-local');
  assert('Qwen is independent local challenger', p.challengers.some((c) => c.provider_id === 'qwen-local'));
  assert('no external model is scheduled without explicit external intent',
    !p.challengers.some((c) => c.external_network === true));
  assert('interpretive result must go through epistemic guard', p.advancement.next_gate === 'epistemic_guard');
}

console.log('\n=== R4: spend authority is not routing intent ===');
{
  const p = planModelRoute(
    { task_class: 'architecture', risk_class: 'high', data_class: 'repo_nonconfidential' },
    { permissionEnvelope: ext },
  );
  assert('external authority alone does not spend', !p.challengers.some((c) => c.external_network));
  assert('route remains local-first', p.primary?.provider_id === 'gpt-oss-local' && p.cost_route === 'C1');
}

console.log('\n=== R5: explicit external review admits Inkling only after both gates ===');
{
  const p = planModelRoute(
    {
      task_class: 'independent_evaluation',
      risk_class: 'high',
      data_class: 'repo_nonconfidential',
      external_review: true,
    },
    { permissionEnvelope: ext },
  );
  assert('local reasoning stays primary', p.primary?.provider_id === 'gpt-oss-local');
  assert('Inkling is external adversarial challenger',
    p.challengers.some((c) => c.provider_id === 'inkling-tinker' && c.role === 'adversarial_challenger'));
  assert('external review records scheduled status', p.external_review?.status === 'scheduled');
  assert('Inkling cannot close the work unit', p.advancement.model_output_sufficient === false);
}

console.log('\n=== R6: sensitive or unspecified evidence never leaves the machine ===');
{
  for (const dataClass of ['phi', 'member', 'client', 'secret', 'production', undefined]) {
    const p = planModelRoute(
      { task_class: 'security', risk_class: 'high', data_class: dataClass, external_review: true },
      { permissionEnvelope: ext },
    );
    assert(`external review blocked for data_class=${dataClass ?? 'unspecified'}`,
      p.status === 'planned_with_review_blocker'
        && p.external_review?.status === 'refused_evidence'
        && !p.challengers.some((c) => c.external_network));
  }
}

console.log('\n=== R7: explicit adversarial review without authority does not silently downgrade ===');
{
  const p = planModelRoute({
    task_class: 'security',
    review_policy: 'adversarial',
    data_class: 'repo_nonconfidential',
  });
  assert('route is marked with review blocker', p.status === 'planned_with_review_blocker');
  assert('external review is authority-deferred', p.external_review?.status === 'deferred_authority');
  assert('local challenger still runs', p.challengers.some((c) => c.provider_id === 'qwen-local'));
  assert('no external challenger is silently executed', !p.challengers.some((c) => c.external_network));
}

console.log('\n=== R8: external-deep is explicit, authority-bound, and data-bound ===');
{
  const denied = planModelRoute({
    task_class: 'architecture', routing_profile: 'external-deep', data_class: 'repo_nonconfidential',
  });
  assert('external-deep without authority is refused', denied.status === 'external_authority_required' && denied.primary === null);

  const sensitive = planModelRoute(
    { task_class: 'architecture', routing_profile: 'external-deep', data_class: 'phi' },
    { permissionEnvelope: ext },
  );
  assert('external-deep with sensitive evidence is refused', sensitive.status === 'external_evidence_refused');

  const admitted = planModelRoute(
    { task_class: 'architecture', routing_profile: 'external-deep', data_class: 'repo_nonconfidential' },
    { permissionEnvelope: ext },
  );
  assert('Nemotron becomes explicit deep primary', admitted.primary?.provider_id === 'nemotron-tinker');
  assert('Inkling challenges Nemotron', admitted.challengers.length === 1 && admitted.challengers[0].provider_id === 'inkling-tinker');
  assert('external deep remains non-authoritative', admitted.advancement.model_output_sufficient === false);
}

console.log('\n=== R9: governance is human-authority bound ===');
{
  const p = planModelRoute({ task_class: 'governance', risk_class: 'high' });
  assert('GPT-OSS may analyze governance locally', p.primary?.provider_id === 'gpt-oss-local');
  assert('model standing is governance advisory only', p.advancement.output_standing === 'GOVERNANCE_ADVISORY_ONLY');
  assert('next gate is existing governance gate', p.advancement.next_gate === 'governance_gate');
  assert('models cannot close governance', p.advancement.model_output_sufficient === false);
}

console.log('\n=== R10: disagreement nominates but never auto-runs Nemotron ===');
{
  const p = planModelRoute(
    {
      task_class: 'security',
      risk_class: 'high',
      data_class: 'repo_nonconfidential',
      external_review: true,
      external_tiebreaker: true,
    },
    { permissionEnvelope: ext },
  );
  assert('Nemotron is nominated only on material disagreement', p.escalation?.trigger === 'material_disagreement');
  assert('Nemotron tiebreaker is not automatic', p.escalation?.automatic === false);
  assert('tiebreaker provider is Nemotron', p.escalation?.provider?.provider_id === 'nemotron-tinker');
  assert('disagreement policy is stop-and-review', p.disagreement_policy === 'STOP_AND_REVIEW');
}

console.log('\n=== R11: deterministic and unknown tasks fail safely ===');
{
  const d = planModelRoute({ capability: 'inventory.routes', task_class: 'implementation' });
  assert('registered deterministic capability schedules no model', d.status === 'deterministic' && d.primary === null && d.challengers.length === 0);

  const u = planModelRoute({ task_class: 'mystery_task' });
  assert('unknown task class requires metadata instead of guessing', u.status === 'needs_routing_metadata' && u.primary === null);
}

console.log('\n=== R12: no route ever assigns model output authority ===');
{
  const plans = [
    planModelRoute({ task_class: 'implementation' }),
    planModelRoute({ task_class: 'architecture', risk_class: 'high' }),
    planModelRoute({ task_class: 'governance', risk_class: 'high' }),
    planModelRoute(
      { task_class: 'security', routing_profile: 'external-deep', data_class: 'synthetic' },
      { permissionEnvelope: ext },
    ),
  ];
  assert('all planned model routes have model_output_sufficient=false',
    plans.every((p) => p.advancement?.model_output_sufficient === false));
  const providers = plans.flatMap((p) => [p.primary, ...(p.challengers ?? []), p.escalation?.provider].filter(Boolean));
  assert('interactive-only Zen is never selected by automated planner',
    providers.every((p) => p.provider_id !== 'nemotron-zen'));
}

console.log(`\n${passed} passed · ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
