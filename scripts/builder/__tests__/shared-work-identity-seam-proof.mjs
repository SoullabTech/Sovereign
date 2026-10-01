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
const W=require('../../../jarvis-desktop/src/operator-work-unit.js');
const C=require('../../../jarvis-desktop/src/canonical-work-unit-v2.js');
const ID=require('../../../jarvis-desktop/src/shared-work-identity.js');
const SHA='0123456789abcdef0123456789abcdef01234567';
let passed=0, failed=0;
function check(name,fn){try{fn();passed++;console.log('PASS  '+name)}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.stack)}}
async function checkAsync(name,fn){try{await fn();passed++;console.log('PASS  '+name)}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.stack)}}
function tempEnv(){const home=fs.mkdtempSync(path.join(os.tmpdir(),'ec1-r6-'));return{home,env:{...process.env,AIN_DELEGATION_HOME:home,USER:'ec1-r6'}}}
function legacySpec(){return{objective:'Repair local candidate continuity',providers:['qwen-local'],evidenceFocus:'scripts/builder/jarvis-runtime-pipeline.mjs',acceptanceCriteria:'Candidate evidence remains exact'}}
function canonicalSpec(){return{objective:'Repair local candidate continuity',workClass:'PATCH',taskShape:'CODE_GROUNDED',capability:'',evidenceClass:'E1_REPOSITORY_LOCAL',requestedPosture:'local_only',reviewPressure:'ordinary',evidenceFocus:'scripts/builder/jarvis-runtime-pipeline.mjs',acceptanceCriteria:'Candidate evidence remains exact',falsificationConditions:'Identity or scope diverges',stopConditions:'Stop before runtime cutover',authorityRequest:{networkExternal:false,providerSpend:false,externalDisclosure:'none'}}}

check('R6-1 shared id minter is safe and representation-neutral',()=>{
  const id=ID.makeSharedWorkId('Repair local candidate continuity',123456789);
  assert.equal(ID.isSafeSharedWorkId(id),true);
  assert.match(id,/^work-/);
  assert.equal(id.startsWith('desktop-'),false);
  assert.equal(id.startsWith('v2-'),false);
});

check('R6-2 legacy constructor preserves caller-supplied shared id',()=>{
  const id=ID.makeSharedWorkId('Repair local candidate continuity',123456789);
  const out=W.buildPacket(legacySpec(),{canonicalSha:SHA,nowMs:99,workUnitId:id});
  assert.equal(out.ok,true,JSON.stringify(out.errors));
  assert.equal(out.packet.work_unit_id,id);
  assert.equal(out.packet.objective,legacySpec().objective);
  assert.equal(out.packet.canonical_sha,SHA);
  assert.deepEqual(out.packet.allowed_files,['scripts/builder/jarvis-runtime-pipeline.mjs']);
});

await checkAsync('R6-3 W0.v2 constructor preserves the same caller-supplied shared id',async()=>{
  const {home,env}=tempEnv();
  try{
    const id=ID.makeSharedWorkId('Repair local candidate continuity',123456789);
    const out=await C.createCanonicalV2(REPO,canonicalSpec(),{canonicalSha:SHA,nowMs:99,workUnitId:id,env,actorId:'human:ec1-r6'});
    assert.equal(out.ok,true,JSON.stringify(out.blockers));
    assert.equal(out.work_unit_id,id);
    const raw=JSON.parse(fs.readFileSync(C.workUnitPath(id,env),'utf8'));
    assert.equal(raw.work_unit.identity.id,id);
    assert.equal(raw.work_unit.identity.objective,canonicalSpec().objective);
    assert.equal(raw.work_unit.scope.base_ref,SHA);
    assert.deepEqual(raw.work_unit.scope.allowed_paths,['scripts/builder/jarvis-runtime-pipeline.mjs']);
  }finally{fs.rmSync(home,{recursive:true,force:true})}
});

await checkAsync('R6-4 shared representations have identical ruled semantic core',async()=>{
  const {home,env}=tempEnv();
  try{
    const id=ID.makeSharedWorkId('Repair local candidate continuity',123456789);
    const legacy=W.buildPacket(legacySpec(),{canonicalSha:SHA,nowMs:1,workUnitId:id});
    const canonical=await C.createCanonicalV2(REPO,canonicalSpec(),{canonicalSha:SHA,nowMs:2,workUnitId:id,env,actorId:'human:ec1-r6'});
    assert.equal(legacy.ok,true); assert.equal(canonical.ok,true);
    const raw=JSON.parse(fs.readFileSync(C.workUnitPath(id,env),'utf8')).work_unit;
    const a={id:legacy.packet.work_unit_id,objective:legacy.packet.objective,base:legacy.packet.canonical_sha,paths:[...legacy.packet.allowed_files].sort()};
    const b={id:raw.identity.id,objective:raw.identity.objective,base:raw.scope.base_ref,paths:[...raw.scope.allowed_paths].sort()};
    assert.deepEqual(a,b);
  }finally{fs.rmSync(home,{recursive:true,force:true})}
});

check('R6-5 invalid supplied id fails closed in legacy constructor',()=>{
  const out=W.buildPacket(legacySpec(),{canonicalSha:SHA,workUnitId:'BAD ID'});
  assert.equal(out.ok,false); assert.match(out.errors.join(' '),/Shared Work Unit id is invalid/);
});

await checkAsync('R6-6 invalid supplied id fails closed in W0.v2 constructor',async()=>{
  const {home,env}=tempEnv();
  try{
    const out=await C.createCanonicalV2(REPO,canonicalSpec(),{canonicalSha:SHA,workUnitId:'BAD ID',env});
    assert.equal(out.ok,false); assert.equal(out.reason,'SHARED_WORK_UNIT_ID_INVALID');
  }finally{fs.rmSync(home,{recursive:true,force:true})}
});

await checkAsync('R6-7 omission preserves both historical default id schemes',async()=>{
  const legacy=W.buildPacket(legacySpec(),{canonicalSha:SHA,nowMs:123});
  assert.equal(legacy.ok,true); assert.match(legacy.packet.work_unit_id,/^desktop-/);
  const {home,env}=tempEnv();
  try{
    const canonical=await C.createCanonicalV2(REPO,canonicalSpec(),{canonicalSha:SHA,nowMs:123,env});
    assert.equal(canonical.ok,true); assert.match(canonical.work_unit_id,/^v2-/);
  }finally{fs.rmSync(home,{recursive:true,force:true})}
});

check('R6-8 shared-id seam introduces no historical matcher or sidecar store',()=>{
  const shared=fs.readFileSync(path.join(REPO,'jarvis-desktop/src/shared-work-identity.js'),'utf8');
  const legacy=fs.readFileSync(path.join(REPO,'jarvis-desktop/src/operator-work-unit.js'),'utf8');
  assert.doesNotMatch(shared,/fs|packet|work-units-v2|crosswalk|match/i);
  assert.doesNotMatch(legacy,/identity-crosswalk|work-units-v2/);
});

console.log('\n'+passed+' passed · '+failed+' failed');process.exit(failed?1:0);
