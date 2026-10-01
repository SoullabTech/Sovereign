#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require=createRequire(import.meta.url);
const HERE=path.dirname(fileURLToPath(import.meta.url));
const REPO=path.resolve(HERE,'..','..','..');
const DUAL=require('../../../jarvis-desktop/src/dual-work-shadow.js');
const C=require('../../../jarvis-desktop/src/canonical-work-unit-v2.js');
const ID=require('../../../jarvis-desktop/src/shared-work-identity.js');
const SHA='0123456789abcdef0123456789abcdef01234567';
let passed=0,failed=0;
function check(name,fn){try{fn();passed++;console.log('PASS  '+name)}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.stack)}}
async function checkAsync(name,fn){try{await fn();passed++;console.log('PASS  '+name)}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.stack)}}
function temp(){const home=fs.mkdtempSync(path.join(os.tmpdir(),'ec1-r7-'));return{home,env:{...process.env,AIN_DELEGATION_HOME:home,USER:'ec1-r7'}}}
function legacySpec(p={}){return{objective:'Repair local candidate continuity',providers:['qwen-local'],evidenceFocus:'scripts/builder/jarvis-runtime-pipeline.mjs',acceptanceCriteria:'Candidate evidence remains exact',...p}}
function canonicalSpec(p={}){return{objective:'Repair local candidate continuity',workClass:'PATCH',taskShape:'CODE_GROUNDED',capability:'',evidenceClass:'E1_REPOSITORY_LOCAL',requestedPosture:'local_only',reviewPressure:'ordinary',evidenceFocus:'scripts/builder/jarvis-runtime-pipeline.mjs',acceptanceCriteria:'Candidate evidence remains exact',falsificationConditions:'Identity or scope diverges',stopConditions:'Stop before runtime cutover',authorityRequest:{networkExternal:false,providerSpend:false,externalDisclosure:'none'},...p}}
const packet=(home,id)=>path.join(home,'packets',id+'.json');

await checkAsync('R7-1 dual shadow creates both representations under one shared id',async()=>{
  const {home,env}=temp();
  try{
    const out=await DUAL.createDualShadow(REPO,{legacySpec:legacySpec(),canonicalSpec:canonicalSpec()},{canonicalSha:SHA,nowMs:1000,env,actorId:'human:r7'});
    assert.equal(out.ok,true,JSON.stringify(out));assert.equal(out.eligible,true);assert.equal(out.status,'DUAL_SHADOW_READY');
    assert.match(out.work_unit_id,/^work-/);
    assert.equal(fs.existsSync(packet(home,out.work_unit_id)),true);
    assert.equal(fs.existsSync(C.workUnitPath(out.work_unit_id,env)),true);
    const legacy=JSON.parse(fs.readFileSync(packet(home,out.work_unit_id),'utf8'));
    const canonical=C.readCanonicalExecutionEnvelopeV2(out.work_unit_id,env);
    assert.deepEqual(DUAL.coreFromLegacy(legacy),DUAL.coreFromCanonical(canonical));
  }finally{fs.rmSync(home,{recursive:true,force:true})}
});

await checkAsync('R7-2 exact retry converges on existing dual representation',async()=>{
  const {home,env}=temp();
  try{
    const args={canonicalSha:SHA,nowMs:1001,env,actorId:'human:r7'};
    const a=await DUAL.createDualShadow(REPO,{legacySpec:legacySpec(),canonicalSpec:canonicalSpec()},args);
    const before=fs.readFileSync(packet(home,a.work_unit_id),'utf8');
    const b=await DUAL.createDualShadow(REPO,{legacySpec:legacySpec(),canonicalSpec:canonicalSpec()},{...args,workUnitId:a.work_unit_id});
    assert.equal(b.ok,true);assert.equal(b.eligible,true);assert.equal(b.work_unit_id,a.work_unit_id);
    assert.equal(fs.readFileSync(packet(home,a.work_unit_id),'utf8'),before);
  }finally{fs.rmSync(home,{recursive:true,force:true})}
});

await checkAsync('R7-3 canonical-only partial is safe and retry completes legacy side',async()=>{
  const {home,env}=temp();
  try{
    const id=ID.makeSharedWorkId('Repair local candidate continuity',1002);
    const c=await C.createCanonicalV2(REPO,canonicalSpec(),{canonicalSha:SHA,nowMs:1002,workUnitId:id,env,actorId:'human:r7'});
    assert.equal(c.ok,true);assert.equal(fs.existsSync(packet(home,id)),false);
    const out=await DUAL.createDualShadow(REPO,{legacySpec:legacySpec(),canonicalSpec:canonicalSpec()},{canonicalSha:SHA,nowMs:1002,workUnitId:id,env,actorId:'human:r7'});
    assert.equal(out.ok,true,JSON.stringify(out));assert.equal(out.eligible,true);assert.equal(fs.existsSync(packet(home,id)),true);
  }finally{fs.rmSync(home,{recursive:true,force:true})}
});

await checkAsync('R7-4 same id with mismatched canonical semantic core refuses before legacy create',async()=>{
  const {home,env}=temp();
  try{
    const id=ID.makeSharedWorkId('Repair local candidate continuity',1003);
    const c=await C.createCanonicalV2(REPO,canonicalSpec({objective:'Different objective'}),{canonicalSha:SHA,nowMs:1003,workUnitId:id,env,actorId:'human:r7'});
    assert.equal(c.ok,true);
    const out=await DUAL.createDualShadow(REPO,{legacySpec:legacySpec(),canonicalSpec:canonicalSpec()},{canonicalSha:SHA,nowMs:1003,workUnitId:id,env,actorId:'human:r7'});
    assert.equal(out.ok,false);assert.equal(out.eligible,false);assert.equal(out.status,'SEMANTIC_CORE_MISMATCH');
    assert.equal(fs.existsSync(packet(home,id)),false,'legacy packet must not be created after canonical mismatch');
  }finally{fs.rmSync(home,{recursive:true,force:true})}
});

await checkAsync('R7-5 mismatched legacy request leaves canonical shadow non-executing and no packet',async()=>{
  const {home,env}=temp();
  try{
    const out=await DUAL.createDualShadow(REPO,{legacySpec:legacySpec({evidenceFocus:'scripts/builder/other.mjs'}),canonicalSpec:canonicalSpec()},{canonicalSha:SHA,nowMs:1004,env,actorId:'human:r7'});
    assert.equal(out.ok,false);assert.equal(out.eligible,false);assert.equal(out.status,'SEMANTIC_CORE_MISMATCH');
    const canonical=C.readCanonicalExecutionEnvelopeV2(out.work_unit_id,env);
    assert.equal(canonical.work_unit.state.lifecycle_state,'DRAFT');
    assert.equal(fs.existsSync(packet(home,out.work_unit_id)),false);
  }finally{fs.rmSync(home,{recursive:true,force:true})}
});

check('R7-6 coordinator has no execution, routing transition, grant, provider, or projection call',()=>{
  const src=fs.readFileSync(path.join(REPO,'jarvis-desktop/src/dual-work-shadow.js'),'utf8')
    .replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
  for(const forbidden of ['runWorkUnit','executeRun','canonicalConfirmAuthorizedExecution','transitionCanonicalV2','authorizeExecutionOnce','claimCanonicalExecutionGrant','projectLocalNativeCandidate','spawn(','execFile','child_process']){
    assert.equal(src.includes(forbidden),false,'found '+forbidden);
  }
});

console.log('\n'+passed+' passed · '+failed+' failed');process.exit(failed?1:0);
