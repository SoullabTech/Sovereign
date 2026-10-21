#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { createWorkUnitDraftV2 } from '../work-unit-v2.mjs';
import { createLifecycleEnvelopeV2, transitionLifecycleV2 } from '../work-unit-lifecycle-v2.mjs';
import { bindAuthorizedRouteV2 } from '../work-unit-routing-v2.mjs';
import {
  VERSION,
  createExecutionBindingV1,
  validateBindingSetV1,
  evaluateExecutionReadinessV1,
  selectExecutionReadyV1,
} from '../o5-execution-readiness-v1.mjs';

const require=createRequire(import.meta.url);
const O1=require('../../../jarvis-desktop/src/operator-intent-contract.js');
const O2=require('../../../jarvis-desktop/src/operator-work-graph.js');
const SHA='8888888888888888888888888888888888888888';
let passed=0,failed=0;
function check(name,fn){try{fn();passed++;console.log('PASS  '+name);}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.stack);}}
function clone(v){return structuredClone(v);}
function graph(){const intent=O1.compileIntent({utterance:'Fix the bounded execution flow.'});assert.equal(intent.standing,'CLEAR');const r=O2.compileWorkGraph(intent);assert.equal(r.ok,true);return clone(r.graph);}
function baseInput(id,objective){return {
  identity:{id,programme:'JARVIS-O5-R5A',parent_work_unit:null,objective,work_class:'VERIFICATION',task_shape:'CODE_GROUNDED',capability:null},
  custody:{evidence_class:'E1_REPOSITORY_LOCAL'}, routing_request:{requested_posture:'default',review_pressure:'ordinary'},
  context:{context_refs:[],evidence_refs:['local-worktree:'+SHA],assumptions:[],unknowns:[]},
  scope:{repository:'synthetic/repo',base_ref:SHA,allowed_paths:['scripts/builder'],forbidden_paths:[]},
  authority:{repository_read:true,repository_write:'none',shell:'none',network_external:false,provider_spend:false,external_disclosure:'none',merge:false,deploy:false,production_read:false,production_write:false},
  evaluation:{acceptance_conditions:['pass'],falsification_conditions:['fail'],stop_conditions:['stop']},
  provenance:{creator:'synthetic-r5a',authorizing_act:null,source_commits:[SHA]},state:{supersedes:null},
};}
function routedEnvelope(id,objective){
  const d=createWorkUnitDraftV2(baseInput(id,objective));assert.equal(d.ok,true,JSON.stringify(d.blockers));
  let env=createLifecycleEnvelopeV2(d.work_unit).envelope;
  env=transitionLifecycleV2(env,{to:'BOUNDED',evidence_ref:'r5:b',reason_code:'R5A'}).envelope;
  env=transitionLifecycleV2(env,{to:'AUTHORIZED',evidence_ref:'r5:a',reason_code:'R5A',authorization_ref:'founder:r5a'}).envelope;
  const routed=bindAuthorizedRouteV2(env);assert.equal(routed.ok,true,JSON.stringify(routed.blockers));return routed.envelope;
}
function withState(env,state){const x=clone(env);const disposition={ROUTED:'open',ADJUDICATED:'accepted',CLOSED:'closed',RETURNED:'returned',STOPPED:'stopped',SUPERSEDED:'superseded',EXECUTING:'open',EVIDENCE_READY:'open',AUTHORIZED:'open',DRAFT:'open'}[state];x.work_unit.state.lifecycle_state=state;x.work_unit.state.disposition=disposition;x.guard.current_state=state;return x;}
function fixture(){
  const g=graph(); const envs={}; const bindings=[];
  for(let i=0;i<g.work_units.length;i++){
    const node=g.work_units[i], rid='runtime-'+node.work_unit_id;
    let env=routedEnvelope(rid,node.objective);
    if(i<2)env=withState(env,'CLOSED');
    envs[rid]=env;
    const b=createExecutionBindingV1({graph:g,planned_work_unit_id:node.work_unit_id,envelope:env,bound_at_sha:SHA});assert.equal(b.ok,true,JSON.stringify(b.blockers));bindings.push(b.binding);
  }
  return {graph:g,envelopes_by_id:envs,bindings};
}
function row(out,g,index){return out.rows.find((r)=>r.planned_work_unit_id===g.work_units[index].work_unit_id);}

check('R5A-1 canonical O2 replay is required before binding',()=>{
  const f=fixture(), bad=clone(f.graph);bad.work_units[2].depends_on=[];
  const env=f.envelopes_by_id[f.bindings[2].canonical_work_unit_id];
  const b=createExecutionBindingV1({graph:bad,planned_work_unit_id:bad.work_units[2].work_unit_id,envelope:env,bound_at_sha:SHA});
  assert.equal(b.ok,false);assert.ok(b.blockers.some((x)=>x.code==='O2_CANONICAL_GRAPH_INTEGRITY_MISMATCH'));
});

check('R5A-2 binding carries exact graph/runtime/SHA identity',()=>{
  const f=fixture(),b=f.bindings[2];assert.equal(b.binding_version,'O5-R5A.binding.v1');assert.equal(b.graph_id,f.graph.graph_id);assert.match(b.graph_digest,/^sha256:[0-9a-f]{64}$/);assert.equal(b.planned_work_unit_id,f.graph.work_units[2].work_unit_id);assert.equal(b.canonical_work_unit_id,'runtime-'+f.graph.work_units[2].work_unit_id);assert.equal(b.bound_at_sha,SHA);
});

check('R5A-3 one-to-one binding duplicates fail closed',()=>{
  const f=fixture(), extra=routedEnvelope('runtime-extra','extra');f.envelopes_by_id['runtime-extra']=extra;f.bindings.push({...f.bindings[2],canonical_work_unit_id:'runtime-extra'});
  const r=validateBindingSetV1(f);assert.equal(r.ok,false);assert.ok(r.blockers.some((x)=>x.code==='MULTIPLE_RUNTIME_BINDINGS'));
});

check('R5A-4 CLOSED predecessor + ROUTED own unit yields exactly current ready node',()=>{
  const f=fixture(),r=evaluateExecutionReadinessV1(f);assert.equal(r.ok,true);assert.equal(row(r,f.graph,2).status,'READY');assert.equal(row(r,f.graph,3).status,'BLOCKED');
});

check('R5A-5 non-CLOSED predecessor states never satisfy readiness',()=>{
  for(const state of ['ADJUDICATED','RETURNED','STOPPED','SUPERSEDED','EXECUTING','EVIDENCE_READY','ROUTED']){
    const f=fixture(),depId=f.bindings[1].canonical_work_unit_id;f.envelopes_by_id[depId]=withState(f.envelopes_by_id[depId],state);const r=evaluateExecutionReadinessV1(f);assert.equal(row(r,f.graph,2).status,'BLOCKED',state);assert.equal(row(r,f.graph,2).reason,'DEPENDENCY_NOT_CLOSED',state);
  }
});

check('R5A-6 own unit must be ROUTED and missing evidence fails closed',()=>{
  const f=fixture(),own=f.bindings[2].canonical_work_unit_id;f.envelopes_by_id[own]=withState(f.envelopes_by_id[own],'EXECUTING');let r=evaluateExecutionReadinessV1(f);assert.equal(row(r,f.graph,2).status,'INELIGIBLE');
  const g=fixture(),dep=g.bindings[1].canonical_work_unit_id;delete g.envelopes_by_id[dep];r=evaluateExecutionReadinessV1(g);assert.equal(r.ok,false);assert.ok(r.blockers.some((x)=>x.code==='BOUND_RUNTIME_INVALID'));
});

check('R5A-7 zero/unknown capacity selects none; positive capacity selects only current ready unit',()=>{
  for(const [slots,n] of [[0,0],[-1,0],[null,0],[1,1],[7,1]]){const f=fixture(),r=selectExecutionReadyV1({...f,available_slots:slots});assert.equal(r.selected.length,n,String(slots));if(n)assert.equal(r.selected[0].planned_work_unit_id,f.graph.work_units[2].work_unit_id);assert.equal(r.requires_live_session_recheck,true);}
});

check('R5A-8 readiness is pure and emits no dispatch/session/lifecycle authority',()=>{
  const f=fixture(),before=JSON.stringify(f);const a=selectExecutionReadyV1({...f,available_slots:1}),b=selectExecutionReadyV1({...f,available_slots:1});assert.equal(JSON.stringify(f),before);assert.deepEqual(a.selected,b.selected);assert.deepEqual(a.effects,{authority:'none',routing:'none',lifecycle:'none',session:'none',dispatch:'none'});assert.equal(a.selected[0].standing,'ELIGIBLE_FOR_LIVE_SESSION_ADMISSION');
});

check('R5A-9 live Builder session admission remains a separate authoritative recheck',()=>{
  const src=readFileSync(new URL('../session.mjs',import.meta.url),'utf8');assert.match(src,/active\.length >= cfg\.max_active/);assert.match(src,/worktree-ownership/);assert.match(src,/REFUSED — Claude concurrency budget reached/);
  const r5=readFileSync(new URL('../o5-execution-readiness-v1.mjs',import.meta.url),'utf8');assert.doesNotMatch(r5,/session\.mjs open|spawn\(|execFile|transitionLifecycleV2/);
});

console.log(`\n${passed} passed · ${failed} failed`);if(failed)process.exit(1);
