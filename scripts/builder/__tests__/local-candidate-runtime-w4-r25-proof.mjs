#!/usr/bin/env node
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require=createRequire(import.meta.url);
const HERE=path.dirname(fileURLToPath(import.meta.url));
const REPO=path.resolve(HERE,'..','..','..');
const C=require('../../../jarvis-desktop/src/canonical-work-unit-v2.js');
const HOST=require('../../../jarvis-desktop/src/local-candidate-execution-host.js');
const ROUTING=require('../../../jarvis-desktop/src/local-candidate-routing.js');
const MECH=require('../../../jarvis-desktop/src/builder-mechanism.js');
const SHA=require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:REPO,encoding:'utf8'}).trim();
let passed=0,failed=0;
function check(name,fn){try{fn();passed++;console.log('PASS  '+name)}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.stack)}}
async function checkAsync(name,fn){try{await fn();passed++;console.log('PASS  '+name)}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.stack)}}
function canonical(v){if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';if(v&&typeof v==='object')return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';return JSON.stringify(v??null)}
const digestObject=v=>'sha256:'+crypto.createHash('sha256').update(canonical(v)).digest('hex');
function temp(){const home=fs.mkdtempSync(path.join(os.tmpdir(),'ec1-r25-'));return{home,env:{...process.env,AIN_DELEGATION_HOME:home,USER:'r25'}}}
function spec(){return{objective:'Persist one completed local candidate',workClass:'PATCH',taskShape:'CODE_GROUNDED',capability:'',evidenceClass:'E1_REPOSITORY_LOCAL',requestedPosture:'local_only',reviewPressure:'ordinary',evidenceFocus:'scripts/builder/jarvis-runtime-pipeline.mjs',acceptanceCriteria:'VERIFIED run projects to W4',falsificationConditions:'W4 failure rewrites Path A truth',stopConditions:'do not advance lifecycle',authorityRequest:{networkExternal:false,providerSpend:false,externalDisclosure:'none'}}}
const plan={version:'EC1-VERIFY.v1',operations:[{operation_id:'o1',kind:'git.diff_check',effect_class:'INSPECT',args:{}}]};
async function routed(env,now){const m=await C.createCanonicalV2(REPO,spec(),{canonicalSha:SHA,nowMs:now,env,actorId:'human:r25',authorityProfile:'LOCAL_CANDIDATE'});assert.equal(m.ok,true,JSON.stringify(m.blockers));let s=await C.transitionCanonicalV2(REPO,m.work_unit_id,'BOUNDED',{env,actorId:'human:r25'});assert.equal(s.ok,true);s=await C.transitionCanonicalV2(REPO,m.work_unit_id,'AUTHORIZED',{env,actorId:'human:r25'});assert.equal(s.ok,true);const p=await ROUTING.prepareLocalCandidateRouting(REPO,m.work_unit_id,{env,actorId:'human:r25'});assert.equal(p.ok,true,JSON.stringify(p));return m.work_unit_id;}
function counts(env){const w=env.work_unit;return{attempts:w.execution.attempts.length,artifacts:w.execution.artifacts.length,diffs:w.execution.diffs.length,tests:w.execution.test_results.length,commits:w.provenance.resulting_commits.length,verifiers:w.evaluation.verifier_results.length}}
function patchVerifiedMechanism(home,{runId='r-2525252525',writeResult=true,state='VERIFIED'}={}){
  const oldAlloc=MECH.allocateRunId,oldRun=MECH.runWorkUnit;const calls=[];
  MECH.allocateRunId=async()=>({ok:true,run_id:runId});
  MECH.runWorkUnit=async(root,packet,hooks,opts)=>{
    calls.push({packet:JSON.parse(JSON.stringify(packet)),opts:JSON.parse(JSON.stringify(opts))});
    if(state!=='VERIFIED')return{submitted:true,outcome:state,terminal:false,run:{run_id:opts.runId,state,packet,execution_decision:opts.executionDecision},events:[]};
    const commit='c'.repeat(40),patchDigest='sha256:'+'d'.repeat(64),paths=[...packet.allowed_files],planDigest=digestObject(packet.verification_plan);
    const durable={work_unit_id:packet.work_unit_id,verification_mode:'structured-v1',lane:'local-native',model:'qwen3-coder:30b',starting_sha:packet.canonical_sha,ending_sha:commit,files_changed:paths,exit_code:0,test_results:'not_run',evidence_sufficient:true,escalation_required:false,recommended_next_action:'review-diff',patch_admission:{ok:true,status:'APPLIED',code:'PATCH_APPLIED',patch_digest:patchDigest,patch_paths:paths,changed_paths:paths,evidence_path:'/evidence/npa1.jsonl',event:{event:'APPLIED',code:'PATCH_APPLIED',applied:true,patch_digest:patchDigest,changed_paths:paths}}};
    const resultPath=path.join(home,'results',packet.work_unit_id+'.json');if(writeResult){fs.mkdirSync(path.dirname(resultPath),{recursive:true});fs.writeFileSync(resultPath,JSON.stringify(durable,null,2)+'\n');}
    const finished={run_id:opts.runId,state:'VERIFIED',packet,execution_decision:opts.executionDecision,result_path:resultPath,result:{test_results:'pass'},verification:{ok:true,method:'NPA1 + candidate-commit custody; structured verification pending',commit_sha:commit,parent_sha:packet.canonical_sha,patch_digest:patchDigest,changed_paths:paths,verification_plan_digest:planDigest,structured_verification_pending:true,structured:{ok:true,status:'PASS',plan_digest:planDigest,results:[{operation_id:'o1',kind:'git.diff_check',status:'PASS',evidence:''}]}}};
    return{submitted:true,outcome:'VERIFIED',terminal:true,run:finished,verification:finished.verification,events:[]};
  };
  return{calls,restore(){MECH.allocateRunId=oldAlloc;MECH.runWorkUnit=oldRun;}};
}

await checkAsync('R25-1 VERIFIED host-decided run persists exact Path A evidence into W4 and leaves lifecycle EXECUTING',async()=>{const {home,env}=temp();const m=patchVerifiedMechanism(home);try{const id=await routed(env,1);const out=await HOST.executePreparedLocalCandidate(REPO,{workUnitId:id,verificationPlan:plan},{env,confirm:async()=>true,actorId:'human:r25'});assert.equal(out.ok,true,JSON.stringify(out));assert.equal(out.outcome,'VERIFIED');assert.equal(out.completion_status,'PROJECTED');assert.equal(out.w4_persistence.status,'PROJECTED');const after=C.readCanonicalExecutionEnvelopeV2(id,env);assert.equal(after.work_unit.state.lifecycle_state,'EXECUTING');assert.deepEqual(counts(after),{attempts:2,artifacts:2,diffs:1,tests:1,commits:1,verifiers:1});assert.equal(m.calls.length,1);}finally{m.restore();fs.rmSync(home,{recursive:true,force:true})}});

await checkAsync('R25-2 non-VERIFIED run does not invoke W4 persistence',async()=>{const {home,env}=temp();const m=patchVerifiedMechanism(home,{state:'PAUSED_FOR_GOVERNANCE'});const old=C.persistHostDecidedLocalCandidateV1;let calls=0;C.persistHostDecidedLocalCandidateV1=async()=>{calls++;return{ok:true,status:'PROJECTED'}};try{const id=await routed(env,2);const out=await HOST.executePreparedLocalCandidate(REPO,{workUnitId:id,verificationPlan:plan},{env,confirm:async()=>true});assert.equal(out.ok,true);assert.equal(out.outcome,'PAUSED_FOR_GOVERNANCE');assert.equal(calls,0);assert.equal(C.readCanonicalExecutionEnvelopeV2(id,env).work_unit.execution.attempts.length,0);}finally{C.persistHostDecidedLocalCandidateV1=old;m.restore();fs.rmSync(home,{recursive:true,force:true})}});

await checkAsync('R25-3 persistence refusal surfaces completion failure without rewriting VERIFIED run truth',async()=>{const {home,env}=temp();const m=patchVerifiedMechanism(home);const old=C.persistHostDecidedLocalCandidateV1;C.persistHostDecidedLocalCandidateV1=async()=>({ok:false,status:'REFUSED',reason:'CANONICAL_ENVELOPE_STALE'});try{const id=await routed(env,3);const out=await HOST.executePreparedLocalCandidate(REPO,{workUnitId:id,verificationPlan:plan},{env,confirm:async()=>true});assert.equal(out.ok,false);assert.equal(out.status,'W4_PERSISTENCE_REFUSED');assert.equal(out.completion_reason,'CANONICAL_ENVELOPE_STALE');assert.equal(out.outcome,'VERIFIED');assert.equal(out.run.state,'VERIFIED');assert.equal(C.readCanonicalExecutionEnvelopeV2(id,env).work_unit.state.lifecycle_state,'EXECUTING');}finally{C.persistHostDecidedLocalCandidateV1=old;m.restore();fs.rmSync(home,{recursive:true,force:true})}});

await checkAsync('R25-4 missing durable result is a completion refusal, never fabricated evidence',async()=>{const {home,env}=temp();const m=patchVerifiedMechanism(home,{writeResult:false});try{const id=await routed(env,4);const out=await HOST.executePreparedLocalCandidate(REPO,{workUnitId:id,verificationPlan:plan},{env,confirm:async()=>true});assert.equal(out.ok,false);assert.equal(out.status,'W4_PERSISTENCE_REFUSED');assert.equal(out.completion_reason,'PATH_A_DURABLE_RESULT_UNREADABLE');assert.equal(out.outcome,'VERIFIED');assert.equal(C.readCanonicalExecutionEnvelopeV2(id,env).work_unit.execution.attempts.length,0);}finally{m.restore();fs.rmSync(home,{recursive:true,force:true})}});

check('R25-5 completion wire invokes R23 only after VERIFIED and contains no lifecycle advance',()=>{const src=fs.readFileSync(path.join(REPO,'jarvis-desktop/src/local-candidate-execution-host.js'),'utf8');const a=src.indexOf("if(run?.submitted!==true||run?.outcome!=='VERIFIED'||run?.run?.state!=='VERIFIED')");const b=src.indexOf('module.exports',a);const slice=src.slice(a,b);assert.match(slice,/persistHostDecidedLocalCandidateV1/);for(const bad of ["transitionCanonicalV2(root,workUnitId,'EVIDENCE_READY'","transitionCanonicalV2(root,workUnitId,'ADJUDICATED'","closeCanonicalV2("])assert.equal(slice.includes(bad),false,'found '+bad);});

console.log('\n'+passed+' passed · '+failed+' failed');process.exit(failed?1:0);
