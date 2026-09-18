#!/usr/bin/env node
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { planWorkUnitRoute } from '../work-unit-route.mjs';

let passed=0, failed=0;
const assert=(name, condition, detail='')=>{
  if (condition) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}`); }
  if (detail) console.log(`          ${detail}`);
};

const tmp=mkdtempSync(path.join(os.tmpdir(),'jarvis-work-unit-route-'));
const packets=path.join(tmp,'packets');
mkdirSync(packets,{recursive:true});
process.env.AIN_DELEGATION_HOME=tmp;

const base={
  title:'Routing fixture',
  objective:'Route this fixture.',
  execution_lane:'provider-evaluation',
  canonical_sha:'abcdef1',
  branch:'fixture',
  worktree:'/tmp/fixture',
  governing_authority:'proof',
  established_facts:[], allowed_files:[], prohibited_files_actions:[],
  acceptance_criteria:[], verification_commands:[], escalation_conditions:[],
  max_attempts:1, expected_output:'fixture',
};
function packet(id, extra={}) {
  const p={...base,work_unit_id:id,...extra};
  writeFileSync(path.join(packets,`${id}.json`),JSON.stringify(p,null,2));
}

console.log('\n=== W1: implementation packet projects to local Qwen ===');
packet('route-impl',{
  task_class:'implementation', risk_class:'mechanical', data_class:'repo_nonconfidential',
  authorized_acts:['repo.read'],
  not_authorized_acts:['repo.write:worktree','network.external','provider.spend','production.read','production.write','deploy','authority.change'],
});
{
  const r=planWorkUnitRoute('route-impl');
  assert('projection succeeds',r.ok);
  assert('permission envelope remains local-only',r.permission_envelope.external_network===false && r.permission_envelope.provider_spend===false);
  assert('Qwen primary selected',r.plan.primary?.provider_id==='qwen-local');
  assert('independent verification remains next gate',r.plan.advancement.next_gate==='independent_verification');
}

console.log('\n=== W2: high-risk external review requires explicit packet authority ===');
packet('route-security',{
  task_class:'security', risk_class:'high', data_class:'repo_nonconfidential', external_review:true,
  authorized_acts:['repo.read','network.external','provider.spend'],
  not_authorized_acts:['repo.write:worktree','production.read','production.write','deploy','authority.change'],
});
{
  const r=planWorkUnitRoute('route-security');
  assert('GPT-OSS remains primary',r.plan.primary?.provider_id==='gpt-oss-local');
  assert('local Qwen challenger present',r.plan.challengers.some(c=>c.provider_id==='qwen-local'));
  assert('external Inkling challenger admitted',r.plan.challengers.some(c=>c.provider_id==='inkling-tinker'));
  assert('epistemic guard remains advancement gate',r.plan.advancement.next_gate==='epistemic_guard');
}

console.log('\n=== W3: PHI classification defeats external authority ===');
packet('route-phi',{
  task_class:'governance', risk_class:'high', data_class:'phi', external_review:true,
  authorized_acts:['repo.read','network.external','provider.spend'],
  not_authorized_acts:['repo.write:worktree','production.read','production.write','deploy','authority.change'],
});
{
  const r=planWorkUnitRoute('route-phi');
  assert('external review is blocked despite spend authority',r.plan.status==='planned_with_review_blocker' && r.plan.external_review?.status==='refused_evidence');
  assert('no external provider is scheduled',!r.plan.challengers.some(c=>c.external_network));
  assert('governance gate remains next gate',r.plan.advancement.next_gate==='governance_gate');
}

console.log('\n=== W4: external-deep requires explicit safe packet ===');
packet('route-deep',{
  task_class:'architecture', risk_class:'high', routing_profile:'external-deep', data_class:'synthetic',
  authorized_acts:['repo.read','network.external','provider.spend'],
  not_authorized_acts:['repo.write:worktree','production.read','production.write','deploy','authority.change'],
});
{
  const r=planWorkUnitRoute('route-deep');
  assert('Nemotron primary selected',r.plan.primary?.provider_id==='nemotron-tinker');
  assert('Inkling challenger selected',r.plan.challengers.length===1 && r.plan.challengers[0].provider_id==='inkling-tinker');
  assert('models still cannot self-promote claims',r.plan.advancement.model_output_sufficient===false);
}

console.log('\n=== W5: incomplete packet intent does not trigger model guess ===');
packet('route-unknown',{
  risk_class:'mechanical', authorized_acts:['repo.read'],
  not_authorized_acts:['network.external','provider.spend'],
});
{
  const r=planWorkUnitRoute('route-unknown');
  assert('missing task_class requires routing metadata',r.plan.status==='needs_routing_metadata');
}

console.log('\n=== W6: missing Work Unit fails closed ===');
{
  const r=planWorkUnitRoute('does-not-exist');
  assert('missing Work Unit is not fabricated',r.ok===false && r.status==='WORK_UNIT_NOT_FOUND');
}

rmSync(tmp,{recursive:true,force:true});
console.log(`\n${passed} passed · ${failed} failed`);
process.exit(failed===0?0:1);
