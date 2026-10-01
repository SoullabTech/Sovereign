#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createWorkUnitDraftV2 } from '../work-unit-v2.mjs';
const require=createRequire(import.meta.url);
const HERE=path.dirname(fileURLToPath(import.meta.url));
const REPO=path.resolve(HERE,'..','..','..');
const C=require('../../../jarvis-desktop/src/canonical-work-unit-v2.js');
const SHA='0123456789abcdef0123456789abcdef01234567';
let passed=0,failed=0;
function check(name,fn){try{fn();passed++;console.log('PASS  '+name)}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.stack)}}
async function checkAsync(name,fn){try{await fn();passed++;console.log('PASS  '+name)}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.stack)}}
function temp(){const home=fs.mkdtempSync(path.join(os.tmpdir(),'ec1-lc-auth-'));return{home,env:{...process.env,AIN_DELEGATION_HOME:home,USER:'ec1-proof'}}}
function spec(p={}){return{objective:'Authorize one bounded local candidate',workClass:'PATCH',taskShape:'CODE_GROUNDED',capability:'',evidenceClass:'E1_REPOSITORY_LOCAL',requestedPosture:'local_only',reviewPressure:'ordinary',evidenceFocus:'scripts/builder/jarvis-runtime-pipeline.mjs',acceptanceCriteria:'Candidate is bounded and verified',falsificationConditions:'Authority widens',stopConditions:'Stop before merge/deploy/production',authorityRequest:{networkExternal:false,providerSpend:false,externalDisclosure:'none'},...p}}

await checkAsync('LC-A1 default canonical-v2 authority remains read-only',async()=>{
  const {home,env}=temp();try{
    const out=await C.createCanonicalV2(REPO,spec(),{canonicalSha:SHA,nowMs:1,env,actorId:'human:lc'});assert.equal(out.ok,true,JSON.stringify(out.blockers));
    const w=C.readCanonicalExecutionEnvelopeV2(out.work_unit_id,env).work_unit;
    assert.equal(w.authority.repository_write,'none');assert.equal(w.authority.shell,'none');assert.equal(w.authority.test_execution,false);
  }finally{fs.rmSync(home,{recursive:true,force:true})}
});

await checkAsync('LC-A2 host LOCAL_CANDIDATE profile yields exact bounded mutation/test authority',async()=>{
  const {home,env}=temp();try{
    const out=await C.createCanonicalV2(REPO,spec(),{canonicalSha:SHA,nowMs:2,env,actorId:'human:lc',authorityProfile:'LOCAL_CANDIDATE'});assert.equal(out.ok,true,JSON.stringify(out.blockers));
    const w=C.readCanonicalExecutionEnvelopeV2(out.work_unit_id,env).work_unit;
    assert.equal(w.authority.repository_read,true);assert.equal(w.authority.repository_write,'worktree');assert.equal(w.authority.shell,'bounded_write');assert.equal(w.authority.test_execution,true);
    assert.equal(w.authority.network_external,false);assert.equal(w.authority.provider_spend,false);assert.equal(w.authority.merge,false);assert.equal(w.authority.deploy,false);assert.equal(w.authority.production_read,false);assert.equal(w.authority.production_write,false);
  }finally{fs.rmSync(home,{recursive:true,force:true})}
});

await checkAsync('LC-A3 renderer/canonical spec cannot name authorityProfile',async()=>{
  const {home,env}=temp();try{
    const out=await C.createCanonicalV2(REPO,spec({authorityProfile:'LOCAL_CANDIDATE'}),{canonicalSha:SHA,nowMs:3,env,actorId:'human:lc'});
    assert.equal(out.ok,false);assert.equal(out.reason,'CANONICAL_V2_INTENT_REFUSED');assert.ok(out.blockers.some(b=>b.code==='CANONICAL_SPEC_FIELD_REFUSED'));
  }finally{fs.rmSync(home,{recursive:true,force:true})}
});

check('LC-A4 W0 schema rejects malformed explicit test_execution',()=>{
  const base={
    identity:{id:'lc-a4',programme:'EC1',parent_work_unit:null,objective:'x',work_class:'PATCH',task_shape:'CODE_GROUNDED',capability:null},
    custody:{evidence_class:'E1_REPOSITORY_LOCAL'}, routing_request:{requested_posture:'local_only',review_pressure:'ordinary'},
    context:{context_refs:[],evidence_refs:['local-worktree:'+SHA],assumptions:[],unknowns:[]},
    scope:{repository:'synthetic',base_ref:SHA,allowed_paths:['scripts/builder'],forbidden_paths:[]},
    authority:{repository_read:true,repository_write:'worktree',shell:'bounded_write',test_execution:'yes',network_external:false,provider_spend:false,external_disclosure:'none',merge:false,deploy:false,production_read:false,production_write:false},
    evaluation:{acceptance_conditions:['x'],falsification_conditions:['y'],stop_conditions:['z']},
    provenance:{creator:'proof',authorizing_act:null,source_commits:[SHA]},state:{supersedes:null},
  };
  const out=createWorkUnitDraftV2(base);assert.equal(out.ok,false);assert.ok(out.blockers.some(b=>b.code==='INVALID_TEST_EXECUTION'));
});

await checkAsync('LC-A5 W2 authorized-core snapshot includes test_execution',async()=>{
  const {home,env}=temp();try{
    const out=await C.createCanonicalV2(REPO,spec(),{canonicalSha:SHA,nowMs:4,env,actorId:'human:lc',authorityProfile:'LOCAL_CANDIDATE'});assert.equal(out.ok,true);
    let s=await C.transitionCanonicalV2(REPO,out.work_unit_id,'BOUNDED',{env,actorId:'human:lc'});assert.equal(s.ok,true);
    s=await C.transitionCanonicalV2(REPO,out.work_unit_id,'AUTHORIZED',{env,actorId:'human:lc'});assert.equal(s.ok,true);
    const w=C.readCanonicalExecutionEnvelopeV2(out.work_unit_id,env);assert.match(w.guard.authorized_core_snapshot,/"test_execution":true/);
  }finally{fs.rmSync(home,{recursive:true,force:true})}
});

check('LC-A6 profile selection remains absent from canonical renderer spec surface',()=>{
  const src=fs.readFileSync(path.join(REPO,'jarvis-desktop/src/renderer.js'),'utf8');assert.equal(src.includes('LOCAL_CANDIDATE'),false);assert.equal(src.includes('authorityProfile'),false);
});

console.log('\n'+passed+' passed · '+failed+' failed');process.exit(failed?1:0);
