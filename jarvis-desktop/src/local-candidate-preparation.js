// EC1-R18 — canonical-first preparation of one structured local-candidate Work.
// Non-executing: creates/authorizes W0/W2, projects Path A packet, persists packet.
'use strict';
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const { pathToFileURL }=require('node:url');
const CWUV2=require('./canonical-work-unit-v2.js');
const WUC=require('./work-unit-control.js');
const IDS=require('./shared-work-identity.js');

const clone=v=>JSON.parse(JSON.stringify(v));
const canonical=v=>Array.isArray(v)?'['+v.map(canonical).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}':JSON.stringify(v??null);
const homeOf=env=>env?.AIN_DELEGATION_HOME||path.join(os.homedir(),'.claude','ain-delegation');
const packetFile=(home,id)=>path.join(home,'packets',id+'.json');
async function importBound(root,rel){return import(pathToFileURL(path.join(root,rel)).href+'?ec1r18='+Date.now());}
function fail(status,reason,extra={}){return{ok:false,status,reason,eligible:false,...extra};}
function currentCore(w){return{identity:{id:w?.identity?.id,programme:w?.identity?.programme,parent_work_unit:w?.identity?.parent_work_unit,objective:w?.identity?.objective,work_class:w?.identity?.work_class,task_shape:w?.identity?.task_shape,capability:w?.identity?.capability},custody:w?.custody,routing_request:w?.routing_request,scope:w?.scope,authority:w?.authority,evaluation:{acceptance_conditions:w?.evaluation?.acceptance_conditions,falsification_conditions:w?.evaluation?.falsification_conditions,stop_conditions:w?.evaluation?.stop_conditions}};}
function expectedCore(input){return{identity:input.identity,custody:input.custody,routing_request:input.routing_request,scope:input.scope,authority:input.authority,evaluation:input.evaluation};}
function readPacket(home,id){const f=packetFile(home,id);if(!fs.existsSync(f))return null;try{return JSON.parse(fs.readFileSync(f,'utf8'));}catch{return{__unreadable:true};}}

async function prepareLocalCandidate(root,{canonicalSpec,verificationPlan},{canonicalSha,nowMs=Date.now(),workUnitId=null,env=process.env,actorId='human:jarvis-desktop:operator'}={}){
  if(!root||!canonicalSpec||typeof canonicalSpec!=='object')return fail('REFUSED','CANONICAL_SPEC_REQUIRED');
  const sharedId=workUnitId||IDS.makeSharedWorkId(canonicalSpec.objective||'work',nowMs);
  if(!IDS.isSafeSharedWorkId(sharedId))return fail('REFUSED','SHARED_WORK_UNIT_ID_INVALID');
  const built=CWUV2.canonicalInputFromSpec(canonicalSpec,{canonicalSha,workUnitId:sharedId,authorityProfile:'LOCAL_CANDIDATE'});
  if(!built.ok)return fail('CANONICAL_SHADOW_REFUSED','CANONICAL_V2_INTENT_REFUSED',{blockers:built.blockers,work_unit_id:sharedId});

  let envlp=CWUV2.readCanonicalExecutionEnvelopeV2(sharedId,env);
  if(!envlp){
    const made=await CWUV2.createCanonicalV2(root,canonicalSpec,{canonicalSha,nowMs,workUnitId:sharedId,env,actorId,authorityProfile:'LOCAL_CANDIDATE'});
    if(!made.ok)return fail('CANONICAL_SHADOW_REFUSED',made.reason,{blockers:made.blockers,work_unit_id:sharedId});
    envlp=CWUV2.readCanonicalExecutionEnvelopeV2(sharedId,env);
  }
  if(!envlp)return fail('CANONICAL_SHADOW_UNREADABLE','CANONICAL_V2_WORK_UNIT_NOT_FOUND',{work_unit_id:sharedId});
  if(canonical(currentCore(envlp.work_unit))!==canonical(expectedCore(built.input)))return fail('SEMANTIC_CORE_MISMATCH','CANONICAL_SHADOW_CORE_MISMATCH',{work_unit_id:sharedId});

  let state=envlp.work_unit.state.lifecycle_state;
  if(state==='DRAFT'){
    const bounded=await CWUV2.transitionCanonicalV2(root,sharedId,'BOUNDED',{env,actorId});
    if(!bounded.ok)return fail('CANONICAL_BOUNDING_REFUSED',bounded.reason,{blockers:bounded.blockers,work_unit_id:sharedId});
    envlp=CWUV2.readCanonicalExecutionEnvelopeV2(sharedId,env);state=envlp.work_unit.state.lifecycle_state;
  }
  if(state==='BOUNDED'){
    const authorized=await CWUV2.transitionCanonicalV2(root,sharedId,'AUTHORIZED',{env,actorId});
    if(!authorized.ok)return fail('CANONICAL_AUTHORIZATION_REFUSED',authorized.reason,{blockers:authorized.blockers,work_unit_id:sharedId});
    envlp=CWUV2.readCanonicalExecutionEnvelopeV2(sharedId,env);state=envlp.work_unit.state.lifecycle_state;
  }
  if(state!=='AUTHORIZED')return fail('CANONICAL_STATE_NOT_PREPARABLE','AUTHORIZED_STATE_REQUIRED',{work_unit_id:sharedId,state});

  const projector=await importBound(root,'scripts/builder/local-candidate-packet-v1.mjs');
  const projected=projector.projectAuthorizedLocalCandidatePacketV1(envlp,{verification_plan:verificationPlan});
  if(!projected.ok)return fail('PACKET_PROJECTION_REFUSED',projected.reason,{detail:projected.detail,work_unit_id:sharedId});

  const home=homeOf(env);let existing=readPacket(home,sharedId);
  if(existing?.__unreadable)return fail('LEGACY_PACKET_UNREADABLE','PERSISTED_PACKET_INVALID',{work_unit_id:sharedId});
  if(existing){
    if(canonical(existing)!==canonical(projected.packet))return fail('SEMANTIC_CORE_MISMATCH','PERSISTED_PACKET_MISMATCH',{work_unit_id:sharedId});
  }else{
    const created=await WUC.create(root,clone(projected.packet),{home});
    if(!created.ok)return fail('PARTIAL_CANONICAL_AUTHORIZED','LEGACY_PACKET_CREATE_REFUSED',{code:created.code,errors:created.errors,work_unit_id:sharedId});
    existing=readPacket(home,sharedId);
  }
  return{ok:true,status:'LOCAL_CANDIDATE_PREPARED',eligible:false,work_unit_id:sharedId,canonical_state:'AUTHORIZED',packet_path:packetFile(home,sharedId),authorized_core_digest:projected.authorized_core_digest,verification_plan_digest:projected.verification_plan_digest,packet:clone(existing)};
}
module.exports={prepareLocalCandidate,_currentCoreForTest:currentCore,_expectedCoreForTest:expectedCore};
