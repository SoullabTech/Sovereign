#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require=createRequire(import.meta.url);
const HERE=path.dirname(fileURLToPath(import.meta.url));
const REPO=path.resolve(HERE,'..','..','..');
const C=require('../../../jarvis-desktop/src/canonical-work-unit-v2.js');
const ROUTING=require('../../../jarvis-desktop/src/local-candidate-routing.js');
const SHA=execFileSync('git',['rev-parse','HEAD'],{cwd:REPO,encoding:'utf8'}).trim();
let passed=0,failed=0;
function check(name,fn){try{fn();passed++;console.log('PASS  '+name)}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.stack)}}
async function checkAsync(name,fn){try{await fn();passed++;console.log('PASS  '+name)}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.stack)}}
function temp(){const home=fs.mkdtempSync(path.join(os.tmpdir(),'ec1-r29-'));return{home,env:{...process.env,AIN_DELEGATION_HOME:home,USER:'r29'}}}
function spec(){return{objective:'Close one converged local candidate',workClass:'PATCH',taskShape:'CODE_GROUNDED',capability:'',evidenceClass:'E1_REPOSITORY_LOCAL',requestedPosture:'local_only',reviewPressure:'ordinary',evidenceFocus:'scripts/builder/jarvis-runtime-pipeline.mjs',acceptanceCriteria:'human adjudication and closure remain generic',falsificationConditions:'model or EC1 auto-closes Work',stopConditions:'preserve human agency',authorityRequest:{networkExternal:false,providerSpend:false,externalDisclosure:'none'}}}
async function evidenceReady(env,now){
  const m=await C.createCanonicalV2(REPO,spec(),{canonicalSha:SHA,nowMs:now,env,actorId:'human:r29',authorityProfile:'LOCAL_CANDIDATE'});assert.equal(m.ok,true,JSON.stringify(m.blockers));
  let s=await C.transitionCanonicalV2(REPO,m.work_unit_id,'BOUNDED',{env,actorId:'human:r29'});assert.equal(s.ok,true);
  s=await C.transitionCanonicalV2(REPO,m.work_unit_id,'AUTHORIZED',{env,actorId:'human:r29'});assert.equal(s.ok,true);
  const routed=await ROUTING.prepareLocalCandidateRouting(REPO,m.work_unit_id,{env,actorId:'human:r29'});assert.equal(routed.ok,true,JSON.stringify(routed));
  s=await C.transitionCanonicalV2(REPO,m.work_unit_id,'EXECUTING',{env,actorId:'human:r29'});assert.equal(s.ok,true);
  let snap=C.readCanonicalExecutionEnvelopeV2(m.work_unit_id,env);
  const primary=snap.work_unit.routing.transport_bindings.find(b=>b.route_participant_id==='primary'&&b.readiness?.status==='READY');
  const challenger=snap.work_unit.routing.transport_bindings.find(b=>b.route_participant_id==='local-review-1'&&b.readiness?.status==='READY');
  const primaryRec=await C.appendCanonicalExecutionResultV2(REPO,m.work_unit_id,{route_participant_id:'primary',transport_binding_id:primary.transport_binding_id,provider_admission:{ok:true,disposition:'ADMITTED'},wrapper_exit_code:0,durable_result:{exit_code:0,test_results:'pass',recommended_next_action:'review-diff'},result_ref:'r29:primary',result_digest:'sha256:'+'1'.repeat(64)},{env,actorId:'human:r29'});assert.equal(primaryRec.ok,true,JSON.stringify(primaryRec));
  const challengerRec=await C.appendCanonicalExecutionResultV2(REPO,m.work_unit_id,{route_participant_id:'local-review-1',transport_binding_id:challenger.transport_binding_id,provider_admission:{ok:true,disposition:'ADMITTED'},wrapper_exit_code:0,durable_result:{exit_code:0,test_results:'not_run',recommended_next_action:'review-diff'},result_ref:'r29:challenger',result_digest:'sha256:'+'2'.repeat(64)},{env,actorId:'human:r29'});assert.equal(challengerRec.ok,true,JSON.stringify(challengerRec));
  snap=C.readCanonicalExecutionEnvelopeV2(m.work_unit_id,env);
  const primaryAttempt=snap.work_unit.execution.attempts.find(a=>a.route_participant_id==='primary'&&a.status==='completed');
  assert.ok(primaryAttempt);
  const verifierAttemptId='r29-verifier-attempt';
  const ledger=await import(new URL('../work-unit-ledger-v2.mjs',import.meta.url));
  let appended=ledger.appendDurableAttemptV2(snap,{attempt:{attempt_id:verifierAttemptId,model_identity_id:null,route_participant_id:null,transport_binding_id:null,model_family:null,provider_id:null,model_id:null,adapter_id:null,role:'structured_inspection_verifier',actor_id:'system:jarvis-local-native-verifier',attempt_kind:'deterministic_verification',parent_attempt_id:primaryAttempt.attempt_id,evidence_refs:['r29:verifier']},provider_admission:null,wrapper_exit_code:0,durable_result:{exit_code:0,test_results:'pass',recommended_next_action:'review-diff'}});assert.equal(appended.ok,true,JSON.stringify(appended.blockers));
  fs.writeFileSync(C.workUnitPath(m.work_unit_id,env),JSON.stringify(appended.envelope,null,2)+'\n');
  const vr=await C.appendCanonicalVerifierResultV2(REPO,m.work_unit_id,{target_attempt_id:primaryAttempt.attempt_id,verifier_attempt_id:verifierAttemptId,disposition:'mechanical_pass',evidence_refs:['r29:verifier']},{env,actorId:'human:r29'});assert.equal(vr.ok,true,JSON.stringify(vr));
  const ready=await C.markCanonicalEvidenceReadyV2(REPO,m.work_unit_id,{env,actorId:'human:r29'});assert.equal(ready.ok,true,JSON.stringify(ready));
  return m.work_unit_id;
}

await checkAsync('R29-1 local candidate at EVIDENCE_READY requires explicit human accepted adjudication with basis',async()=>{const {home,env}=temp();try{const id=await evidenceReady(env,1);const refused=await C.adjudicateCanonicalV2(REPO,id,{decision:'accepted',basis_refs:[]},{env,actorId:'human:r29'});assert.equal(refused.ok,false);assert.equal(refused.reason,'ADJUDICATION_BASIS_REQUIRED');const out=await C.adjudicateCanonicalV2(REPO,id,{decision:'accepted',basis_refs:['r29:primary','r29:challenger','r29:verifier']},{env,actorId:'human:r29'});assert.equal(out.ok,true,JSON.stringify(out));assert.equal(out.lifecycle.state,'ADJUDICATED');assert.equal(out.adjudication_record.actor_kind,'human');assert.equal(out.adjudication_record.actor_id,'human:r29');assert.equal(out.adjudication_record.model_authored,false);}finally{fs.rmSync(home,{recursive:true,force:true})}});

await checkAsync('R29-2 closure requires and cites the explicit human adjudication record',async()=>{const {home,env}=temp();try{const id=await evidenceReady(env,2);const before=await C.closeCanonicalV2(REPO,id,{env,actorId:'human:r29'});assert.equal(before.ok,false);assert.equal(before.reason,'ADJUDICATED_STATE_REQUIRED');const adj=await C.adjudicateCanonicalV2(REPO,id,{decision:'accepted',basis_refs:['r29:primary','r29:challenger','r29:verifier']},{env,actorId:'human:r29'});assert.equal(adj.ok,true);const closed=await C.closeCanonicalV2(REPO,id,{env,actorId:'human:r29'});assert.equal(closed.ok,true,JSON.stringify(closed));assert.equal(closed.lifecycle.state,'CLOSED');assert.equal(closed.closure_record.actor_kind,'human');assert.equal(closed.closure_record.actor_id,'human:r29');assert.equal(closed.closure_record.adjudication_ref,adj.adjudication_record.evidence_ref);}finally{fs.rmSync(home,{recursive:true,force:true})}});

check('R29-3 adjudication and closure contain no local-candidate special case',()=>{const src=fs.readFileSync(path.join(REPO,'jarvis-desktop/src/canonical-work-unit-v2.js'),'utf8');const a=src.indexOf('async function adjudicateCanonicalV2');const b=src.indexOf('async function closeCanonicalV2');const c=src.indexOf('module.exports',b);assert.equal(src.slice(a,c).includes('local-native-candidate'),false);assert.match(src.slice(a,b),/EVIDENCE_READY_REQUIRED/);assert.match(src.slice(b,c),/ADJUDICATED_STATE_REQUIRED/);});

console.log('\n'+passed+' passed · '+failed+' failed');process.exit(failed?1:0);
