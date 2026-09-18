#!/usr/bin/env node
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  validateModelRuntimeRequest, admitModelRuntimeRequest,
} from '../model-runtime-admission.mjs';

let passed=0, failed=0;
const assert=(name,condition,detail='')=>{
  if(condition){passed++;console.log(`  PASS  ${name}`);}else{failed++;console.log(`  FAIL  ${name}`);}
  if(detail)console.log(`          ${detail}`);
};

console.log('\n=== A1: runtime request is identity + action only ===');
{
  assert('valid plan request accepted',validateModelRuntimeRequest({action:'plan',work_unit_id:'router-runtime-01'}).ok);
  assert('valid execute request accepted',validateModelRuntimeRequest({action:'execute',work_unit_id:'router-runtime-01'}).ok);
  for (const injected of [
    {model:'thinkingmachines/Inkling'},
    {provider_id:'inkling-tinker'},
    {routing_profile:'external-deep'},
    {provider_spend:true},
    {external_call_budget:99},
    {data_class:'synthetic'},
  ]) {
    const v=validateModelRuntimeRequest({action:'execute',work_unit_id:'router-runtime-01',...injected});
    assert(`runtime injection refused: ${Object.keys(injected)[0]}`,!v.ok&&v.status==='REQUEST_SHAPE_INVALID');
  }
  assert('path-like Work Unit id refused',!validateModelRuntimeRequest({action:'plan',work_unit_id:'../packet'}).ok);
}

console.log('\n=== A2: planning cannot execute ===');
{
  let executes=0;
  const r=admitModelRuntimeRequest(
    {action:'plan',work_unit_id:'router-runtime-01'},
    {
      compileFn:()=>({ok:true,status:'READY',executable:true,stages:[{provider_id:'gpt-oss-local'}]}),
      executeFn:()=>{executes++;return {executed:true,status:'COMPLETE'};},
    },
  );
  assert('plan reports READY without execution',r.status==='READY'&&r.admitted===true&&r.executed===false);
  assert('plan called execute zero times',executes===0,String(executes));
}

console.log('\n=== A3: typed blockers never execute ===');
{
  const blockers=[
    'ROUTING_BLOCKED','WRITE_CAPABLE_MODEL_ADAPTER_REQUIRED','BUDGET_INVALID',
    'STAGE_BUDGET_EXCEEDED','EXTERNAL_CALL_BUDGET_EXCEEDED',
  ];
  for(const status of blockers){
    let executes=0;
    const r=admitModelRuntimeRequest(
      {action:'execute',work_unit_id:'router-runtime-01'},
      {compileFn:()=>({ok:true,status,executable:false}),executeFn:()=>{executes++;return {};}}
    );
    assert(`${status} preserved`,r.status===status&&r.admitted===false&&r.executed===false);
    assert(`${status} executes zero stages`,executes===0,String(executes));
  }
}

console.log('\n=== A4: explicit READY execute invokes one orchestration only ===');
{
  let executes=0;
  const r=admitModelRuntimeRequest(
    {action:'execute',work_unit_id:'router-runtime-01'},
    {
      compileFn:()=>({ok:true,status:'READY',executable:true}),
      executeFn:(id)=>{executes++;return {executed:true,status:'COMPLETE',disposition:'READY_FOR_EXISTING_GATE',work_unit_id:id};},
    }
  );
  assert('execution is admitted',r.admitted===true&&r.executed===true);
  assert('one execution only',executes===1,String(executes));
  assert('orchestration disposition passes through unchanged',r.status==='COMPLETE'&&r.disposition==='READY_FOR_EXISTING_GATE');
}

console.log('\n=== A5: stopped orchestration remains stopped ===');
{
  let executes=0;
  const r=admitModelRuntimeRequest(
    {action:'execute',work_unit_id:'router-runtime-01'},
    {
      compileFn:()=>({ok:true,status:'READY',executable:true}),
      executeFn:()=>{executes++;return {executed:true,status:'STOPPED',disposition:'REVIEW_REQUIRED'};},
    }
  );
  assert('review-required result is not upgraded',r.status==='STOPPED'&&r.disposition==='REVIEW_REQUIRED');
  assert('no automatic retry',executes===1,String(executes));
}

console.log('\n=== A6: real canonical Work Unit controls admission ===');
const home=mkdtempSync(path.join(os.tmpdir(),'jarvis-model-runtime-admission-'));
mkdirSync(path.join(home,'packets'),{recursive:true});
process.env.AIN_DELEGATION_HOME=home;
const base={
  title:'Runtime admission fixture',objective:'Synthetic architecture review.',execution_lane:'provider-evaluation',
  canonical_sha:'abcdef1',branch:'chore/runtime-admission-fixture',worktree:null,governing_authority:'proof',
  established_facts:[],allowed_files:['NO FILES — synthetic admission proof'],prohibited_files_actions:[],
  acceptance_criteria:[],verification_commands:[],escalation_conditions:[],max_attempts:1,expected_output:'fixture',
  task_class:'architecture',risk_class:'high',routing_profile:'local-first',review_policy:'auto',
  data_class:'repo_nonconfidential',external_review:false,external_tiebreaker:false,
  authorized_acts:['repo.read'],
  not_authorized_acts:['repo.write:worktree','network.external','provider.spend','production.read','production.write','deploy','authority.change'],
};
function packet(id,extra={}){writeFileSync(path.join(home,'packets',`${id}.json`),JSON.stringify({...base,work_unit_id:id,...extra},null,2));}

packet('runtime-budget-default');
{
  const r=admitModelRuntimeRequest({action:'plan',work_unit_id:'runtime-budget-default'});
  assert('default one-stage budget blocks two-stage high-assurance route',r.status==='STAGE_BUDGET_EXCEEDED'&&r.executed===false);
}

packet('runtime-local-ready',{model_stage_budget:2,external_call_budget:0});
{
  const r=admitModelRuntimeRequest({action:'plan',work_unit_id:'runtime-local-ready'});
  assert('canonical local budget makes plan READY',r.status==='READY'&&r.admitted===true&&r.executed===false);
  assert('plan remains local when packet lacks explicit external intent',r.orchestration.stages.every(s=>s.external===false));
}

packet('runtime-external-ready',{
  routing_profile:'external-deep',data_class:'synthetic',model_stage_budget:2,external_call_budget:2,
  authorized_acts:['repo.read','network.external','provider.spend'],
  not_authorized_acts:['repo.write:worktree','production.read','production.write','deploy','authority.change'],
});
{
  const r=admitModelRuntimeRequest({action:'plan',work_unit_id:'runtime-external-ready'});
  assert('canonical external intent + authority + budgets make external plan READY',r.status==='READY'&&r.orchestration.budgets.external_calls_planned===2);
  assert('runtime request itself supplied no provider/model/budget override',r.orchestration.stages[0].provider_id==='nemotron-tinker'&&r.orchestration.stages[1].provider_id==='inkling-tinker');
}

rmSync(home,{recursive:true,force:true});
console.log(`\n${passed} passed · ${failed} failed`);
process.exit(failed===0?0:1);
