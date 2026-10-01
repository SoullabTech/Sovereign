// EC1-R19 — host-side structured local-candidate execution boundary.
'use strict';
const fs=require('node:fs');
const crypto=require('node:crypto');
const os=require('node:os');
const path=require('node:path');
const { pathToFileURL }=require('node:url');
const CWUV2=require('./canonical-work-unit-v2.js');
const MECH=require('./builder-mechanism.js');
const DECISION=require('./local-candidate-execution-decision.js');

const clone=v=>JSON.parse(JSON.stringify(v));
const canonical=v=>Array.isArray(v)?'['+v.map(canonical).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}':JSON.stringify(v??null);
const storageDigest=v=>'sha256:'+crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const bytesDigest=v=>'sha256:'+crypto.createHash('sha256').update(v).digest('hex');
const homeOf=env=>env?.AIN_DELEGATION_HOME||path.join(os.homedir(),'.claude','ain-delegation');
async function importBound(root,rel){return import(pathToFileURL(path.join(root,rel)).href+'?ec1r19='+Date.now());}
function fail(status,reason,extra={}){return{ok:false,submitted:false,status,outcome:status,reason,...extra};}
function evidencePaths(home,id){return{packet:path.join(home,'packets',id+'.json'),result:path.join(home,'results',id+'.json')};}
function summaryFrom(packet,plan){return{work_unit_id:packet.work_unit_id,objective:packet.objective,canonical_sha:packet.canonical_sha,allowed_files:clone(packet.allowed_files||[]),verification_operations:clone(plan?.operations||[])};}
function activeBindings(workUnit){const all=Array.isArray(workUnit?.routing?.transport_bindings)?workUnit.routing.transport_bindings:[];const superseded=new Set(all.map(b=>b?.supersedes_binding_id).filter(Boolean));return all.filter(b=>b?.transport_binding_id&&!superseded.has(b.transport_binding_id));}
function primaryRouteFacts(workUnit){
  const primary=workUnit?.routing?.route_record?.primary;
  const binding=activeBindings(workUnit).find(b=>b.route_participant_id===primary?.participant_id);
  if(!primary||primary.participant_id!=='primary'||primary.model_family!=='QWEN'||primary.role!=='code_primary')return null;
  if(!binding||binding.provider_id!=='qwen-local'||binding.model_id!=='qwen3-coder:30b'||binding.adapter_id!=='ollama-direct'||binding.readiness?.status!=='READY')return null;
  return{route_digest:String(workUnit.routing?.route_digest||''),transport_binding:clone(binding)};
}

async function projectCurrent(root,workUnitId,verificationPlan,env){
  const envelope=CWUV2.readCanonicalExecutionEnvelopeV2(workUnitId,env);
  if(!envelope)return fail('REFUSED','CANONICAL_V2_WORK_UNIT_NOT_FOUND');
  if(envelope.work_unit?.state?.lifecycle_state!=='ROUTED')return fail('REFUSED','ROUTED_STATE_REQUIRED',{state:envelope.work_unit?.state?.lifecycle_state||null});
  if(envelope.work_unit?.identity?.capability!=='local-native-candidate')return fail('REFUSED','LOCAL_CANDIDATE_CAPABILITY_REQUIRED');
  const route=primaryRouteFacts(envelope.work_unit);if(!route||!route.route_digest)return fail('REFUSED','READY_LOCAL_QWEN_ROUTE_REQUIRED');
  const projector=await importBound(root,'scripts/builder/local-candidate-packet-v1.mjs');
  const projected=projector.projectAuthorizedLocalCandidatePacketV1(envelope,{verification_plan:verificationPlan});
  if(!projected.ok)return fail('REFUSED',projected.reason,{detail:projected.detail||null});
  return{ok:true,envelope,projected,route};
}

async function executePreparedLocalCandidate(root,{workUnitId,verificationPlan},{env=process.env,confirm,hooks={},actorId='human:jarvis-desktop:operator'}={}){
  if(!/^[a-z0-9][a-z0-9-]{2,63}$/.test(String(workUnitId||'')))return fail('REFUSED','INVALID_WORK_UNIT_ID');
  if(typeof confirm!=='function')return fail('REFUSED','HOST_CONFIRMATION_CALLBACK_REQUIRED');
  const first=await projectCurrent(root,workUnitId,verificationPlan,env);
  if(!first.ok)return first;
  const home=homeOf(env);const paths=evidencePaths(home,workUnitId);
  if(fs.existsSync(paths.packet)||fs.existsSync(paths.result))return fail('REFUSED','PREEXISTING_PATH_A_EVIDENCE_REFUSED');

  const allocated=await MECH.allocateRunId(root);
  if(!allocated.ok)return fail('REFUSED',allocated.reason||'RUN_ID_ALLOCATION_REFUSED');
  const runId=allocated.run_id;
  const staged=DECISION.stage({
    root,
    runId,
    packet:first.projected.packet,
    canonicalCoreDigest:first.projected.authorized_core_digest,
    routeDigest:first.route.route_digest,
    transportBinding:first.route.transport_binding,
  });
  if(!staged.ok)return fail('REFUSED',staged.reason);

  let approved=false;
  try{approved=(await confirm(summaryFrom(first.projected.packet,first.projected.packet.verification_plan),{occurrence_id:staged.occurrence_id,run_id:runId,binding_digest:staged.binding_digest}))===true;}
  catch(error){DECISION.forget(staged.occurrence_id);return fail('HOST_CONFIRMATION_FAILED',String(error?.message||error));}
  if(!approved){DECISION.forget(staged.occurrence_id);return{ok:true,submitted:false,status:'EXECUTION_DECISION_WITHHELD',outcome:'EXECUTION_DECISION_WITHHELD',work_unit_id:workUnitId,run_id:runId,occurrence_id:staged.occurrence_id};}

  const current=await projectCurrent(root,workUnitId,verificationPlan,env);
  if(!current.ok){DECISION.forget(staged.occurrence_id);return current;}
  if(canonical(current.projected.packet)!==canonical(first.projected.packet)
      || current.projected.authorized_core_digest!==first.projected.authorized_core_digest
      || current.projected.verification_plan_digest!==first.projected.verification_plan_digest
      || current.route.route_digest!==first.route.route_digest
      || canonical(current.route.transport_binding)!==canonical(first.route.transport_binding)){
    DECISION.forget(staged.occurrence_id);return fail('REFUSED','LOCAL_CANDIDATE_BINDING_CHANGED_AFTER_CONFIRMATION');
  }
  if(fs.existsSync(paths.packet)||fs.existsSync(paths.result)){DECISION.forget(staged.occurrence_id);return fail('REFUSED','PATH_A_EVIDENCE_APPEARED_AFTER_CONFIRMATION');}

  const constituted=DECISION.constitute(staged.occurrence_id,{
    root,
    runId,
    packet:current.projected.packet,
    canonicalCoreDigest:current.projected.authorized_core_digest,
    routeDigest:current.route.route_digest,
    transportBinding:current.route.transport_binding,
  });
  if(!constituted.ok){DECISION.forget(staged.occurrence_id);return fail('REFUSED',constituted.reason);}
  const executionDecision=constituted.execution_decision;
  const executing=await CWUV2.transitionCanonicalV2(root,workUnitId,'EXECUTING',{env,actorId});
  if(!executing.ok){DECISION.forget(staged.occurrence_id);return fail('EXECUTING_TRANSITION_REFUSED',executing.reason||executing.blockers?.[0]?.code||'W2_EXECUTING_TRANSITION_REFUSED',{blockers:executing.blockers||[]});}
  let run;
  try{
    run=await MECH.runWorkUnit(root,clone(current.projected.packet),hooks,{
      runId,
      executionDecision,
      authorizedCoreDigest:current.projected.authorized_core_digest,
      routeDigest:current.route.route_digest,
      transportBinding:current.route.transport_binding,
    });
  }finally{DECISION.forget(staged.occurrence_id);}

  const response={...run,ok:run?.submitted===true,work_unit_id:workUnitId,run_id:runId,execution_decision:clone(executionDecision)};
  if(run?.submitted!==true||run?.outcome!=='VERIFIED'||run?.run?.state!=='VERIFIED')return response;

  const resultPath=run.run.result_path||paths.result;
  let rawResult,durableResult;
  try{rawResult=fs.readFileSync(resultPath);durableResult=JSON.parse(rawResult.toString('utf8'));}
  catch(error){return{...response,ok:false,status:'W4_PERSISTENCE_REFUSED',completion_status:'W4_PERSISTENCE_REFUSED',completion_reason:'PATH_A_DURABLE_RESULT_UNREADABLE',completion_error:String(error?.message||error)};}
  const canonicalBase=CWUV2.readCanonicalExecutionEnvelopeV2(workUnitId,env);
  if(!canonicalBase)return{...response,ok:false,status:'W4_PERSISTENCE_REFUSED',completion_status:'W4_PERSISTENCE_REFUSED',completion_reason:'CANONICAL_V2_WORK_UNIT_NOT_FOUND'};
  const persisted=await CWUV2.persistHostDecidedLocalCandidateV1(root,workUnitId,{
    run:run.run,
    durable_result:durableResult,
    result_ref:'path-a-result:'+workUnitId+':'+runId,
    result_digest:bytesDigest(rawResult),
  },{env,expectedEnvelopeDigest:storageDigest(canonicalBase)});
  if(!persisted.ok)return{...response,ok:false,status:'W4_PERSISTENCE_REFUSED',completion_status:'W4_PERSISTENCE_REFUSED',completion_reason:persisted.reason||persisted.status,w4_persistence:clone(persisted)};
  return{...response,ok:true,completion_status:persisted.status,w4_persistence:clone(persisted)};
}

module.exports={executePreparedLocalCandidate,_projectCurrentForTest:projectCurrent,_summaryFromForTest:summaryFrom};
