import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createWorkUnitDraftV2 } from '../../scripts/builder/work-unit-v2.mjs';
import { createLifecycleEnvelopeV2, transitionLifecycleV2, authorizedCoreSnapshotV2 } from '../../scripts/builder/work-unit-lifecycle-v2.mjs';
import { bindAuthorizedRouteV2 } from '../../scripts/builder/work-unit-routing-v2.mjs';
import { appendTransportBindingV1 } from '../../scripts/builder/work-unit-transport-v1.mjs';
import { appendLedgerRecordV2 } from '../../scripts/builder/work-unit-ledger-v2.mjs';

const require=createRequire(import.meta.url);
const O1=require('../src/operator-intent-contract.js');
const SHA='7777777777777777777777777777777777777777';

function baseInput(){return {
  identity:{id:'o5-r4-proof',programme:'JARVIS-O5',parent_work_unit:null,objective:'evidence return proof',work_class:'VERIFICATION',task_shape:'CODE_GROUNDED',capability:null},
  custody:{evidence_class:'E1_REPOSITORY_LOCAL'},
  routing_request:{requested_posture:'default',review_pressure:'ordinary'},
  context:{context_refs:[],evidence_refs:['local-worktree:'+SHA],assumptions:[],unknowns:[]},
  scope:{repository:'synthetic/repo',base_ref:SHA,allowed_paths:['scripts/builder'],forbidden_paths:[]},
  authority:{repository_read:true,repository_write:'none',shell:'none',network_external:false,provider_spend:false,external_disclosure:'none',merge:false,deploy:false,production_read:false,production_write:false},
  evaluation:{acceptance_conditions:['pass'],falsification_conditions:['fail'],stop_conditions:['stop']},
  provenance:{creator:'synthetic',authorizing_act:null,source_commits:[SHA]}, state:{supersedes:null},
};}
function identity(id,participant,binding,family,provider,model,adapter,role){return {model_identity_id:id,route_participant_id:participant,transport_binding_id:binding,model_family:family,provider_id:provider,model_id:model,adapter_id:adapter,role};}
const QWEN=identity('mi-qwen','primary','tb-qwen','QWEN','qwen-local','qwen3-coder:30b','ollama-direct','code_primary');
const GPT=identity('mi-gpt','local-review-1','tb-gpt','GPT_OSS','gpt-oss-local','gpt-oss:20b','ollama-direct','independent_local_challenger');
function preparedExecuting(){
  const d=createWorkUnitDraftV2(baseInput()); assert.equal(d.ok,true);
  let env=createLifecycleEnvelopeV2(d.work_unit).envelope;
  env=transitionLifecycleV2(env,{to:'BOUNDED',evidence_ref:'proof:b',reason_code:'PROOF'}).envelope;
  env=transitionLifecycleV2(env,{to:'AUTHORIZED',evidence_ref:'proof:a',reason_code:'PROOF',authorization_ref:'founder:r4'}).envelope;
  env=bindAuthorizedRouteV2(env).envelope;
  for(const b of [
    {transport_binding_id:'tb-qwen',supersedes_binding_id:null,route_participant_id:'primary',provider_id:'qwen-local',model_id:'qwen3-coder:30b',adapter_id:'ollama-direct',readiness:{status:'READY',evidence_ref:'ready:qwen'}},
    {transport_binding_id:'tb-gpt',supersedes_binding_id:null,route_participant_id:'local-review-1',provider_id:'gpt-oss-local',model_id:'gpt-oss:20b',adapter_id:'ollama-direct',readiness:{status:'READY',evidence_ref:'ready:gpt'}},
  ]) { const r=appendTransportBindingV1(env,b); assert.equal(r.ok,true,JSON.stringify(r.blockers)); env=r.envelope; }
  for(const mi of [QWEN,GPT]) { const r=appendLedgerRecordV2(env,{kind:'model_identity',entry:mi}); assert.equal(r.ok,true,JSON.stringify(r.blockers)); env=r.envelope; }
  const t=transitionLifecycleV2(env,{to:'EXECUTING',evidence_ref:'proof:execute',reason_code:'BINDINGS_READY'}); assert.equal(t.ok,true,JSON.stringify(t.blockers)); return t.envelope;
}
const codes=(r)=>r.blockers.map((b)=>b.code);
const proposal=(summary='inspect adjacent resolver',source='o5-r4-proof')=>({kind:'proposal',source_act:source,summary,proposed_kind:'INSPECT'});
const finding=()=>({kind:'finding',source_act:'o5-r4-proof',summary:'unexpected sibling state',urgency:'high'});
const consequence=()=>({kind:'finding',source_act:'o5-r4-proof',affected_lane:'lane-b',reason:'identity resolution differs',evidence_refs:['w4:a1'],urgency:'normal'});

test('R4-E1/E3 — proposal append is evidence-only, digest-identified, and duplicate-refusing',()=>{
  const env=preparedExecuting(); const core=authorizedCoreSnapshotV2(env.work_unit);
  const r=appendLedgerRecordV2(env,{kind:'proposal',entry:proposal()}); assert.equal(r.ok,true,JSON.stringify(r.blockers));
  assert.match(r.record.id,/^sha256:[0-9a-f]{64}$/); assert.equal(r.envelope.work_unit.evaluation.proposals.length,1);
  assert.equal(authorizedCoreSnapshotV2(r.envelope.work_unit),core); assert.equal(env.work_unit.evaluation.proposals,undefined);
  const dup=appendLedgerRecordV2(r.envelope,{kind:'proposal',entry:proposal()}); assert.equal(dup.ok,false); assert.ok(codes(dup).includes('DUPLICATE_PROPOSAL_ID'));
  const other=appendLedgerRecordV2(r.envelope,{kind:'proposal',entry:proposal('inspect adjacent resolver','other-act')}); assert.equal(other.ok,true); assert.notEqual(other.record.id,r.record.id);
});

test('R4-E2/E6 — ordinary and consequence findings are closed evidence and never project to O1',()=>{
  let env=preparedExecuting();
  for(const entry of [finding(),consequence()]) { const r=appendLedgerRecordV2(env,{kind:'finding',entry}); assert.equal(r.ok,true,JSON.stringify(r.blockers)); assert.equal(O1.projectExecutorProposalCandidate(r.record),null); env=r.envelope; }
  const attack=appendLedgerRecordV2(env,{kind:'finding',entry:{...consequence(),suggested_patch:'lane-b/x.ts'}}); assert.equal(attack.ok,false); assert.ok(codes(attack).includes('UNKNOWN_LEDGER_FIELD'));
});

test('R4-E4/E5/E7 — W4 proposal projects separately to one authority-empty O1 CANDIDATE by source_ref',()=>{
  const env=preparedExecuting(); const r=appendLedgerRecordV2(env,{kind:'proposal',entry:proposal('deploy production immediately')}); assert.equal(r.ok,true);
  const c=O1.projectExecutorProposalCandidate(r.record); assert.equal(c.standing,O1.STANDING.CANDIDATE); assert.equal(c.source,'executor-proposal'); assert.equal(c.source_ref,'w4-proposal:'+r.record.id); assert.deepEqual(c.authority_grants,[]);
  assert.equal('requested_level' in c,false); // executor language was not compiled as operator language
  const same=O1.projectExecutorProposalCandidates([r.record,r.record]); assert.equal(same.length,1);
  const r2=appendLedgerRecordV2(r.envelope,{kind:'proposal',entry:proposal('deploy production immediately','other-act')}); assert.equal(r2.ok,true);
  const distinct=O1.projectExecutorProposalCandidates([r.record,r2.record]); assert.equal(distinct.length,2);
});

test('R4-R2 — finding/proposal admission closes when lifecycle leaves EXECUTING',()=>{
  let env=preparedExecuting();
  const returned=transitionLifecycleV2(env,{to:'RETURNED',evidence_ref:'proof:return',reason_code:'PROOF'}); assert.equal(returned.ok,true,JSON.stringify(returned.blockers)); env=returned.envelope;
  for(const [kind,entry] of [['proposal',proposal()],['finding',finding()]]) { const r=appendLedgerRecordV2(env,{kind,entry}); assert.equal(r.ok,false); assert.ok(codes(r).includes('LEDGER_STATE_NOT_ADMITTED')); }
});
