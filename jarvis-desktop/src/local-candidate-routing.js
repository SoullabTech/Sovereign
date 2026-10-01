// EC1-R20 — non-executing W3/W3T provenance preparation for local candidates.
'use strict';
const CWUV2=require('./canonical-work-unit-v2.js');

function activeBindings(workUnit){
  const all=Array.isArray(workUnit?.routing?.transport_bindings)?workUnit.routing.transport_bindings:[];
  const superseded=new Set(all.map(b=>b?.supersedes_binding_id).filter(Boolean));
  return all.filter(b=>b?.transport_binding_id&&!superseded.has(b.transport_binding_id));
}
function requiredParticipants(workUnit){
  const route=workUnit?.routing?.route_record;const out=[];
  if(route?.primary?.required_for_completion===true)out.push(route.primary);
  for(const p of Array.isArray(route?.challengers)?route.challengers:[])if(p?.required_for_completion===true)out.push(p);
  return out;
}
function validateLocalRoute(workUnit){
  const route=workUnit?.routing?.route_record;
  const primary=route?.primary;
  const challenger=(route?.challengers||[]).find(p=>p?.participant_id==='local-review-1');
  if(primary?.participant_id!=='primary'||primary?.model_family!=='QWEN'||primary?.role!=='code_primary'||primary?.required_for_completion!==true){return{ok:false,reason:'LOCAL_CANDIDATE_QWEN_PRIMARY_REQUIRED'};}
  if(challenger?.model_family!=='GPT_OSS'||challenger?.role!=='independent_local_challenger'||challenger?.required_for_completion!==true){return{ok:false,reason:'LOCAL_CANDIDATE_GPT_OSS_CHALLENGER_REQUIRED'};}
  if(route?.evidence_policy?.primary?.kind!=='local_worktree_read_only'){return{ok:false,reason:'LOCAL_CANDIDATE_PRIMARY_READ_ONLY_EVIDENCE_REQUIRED'};}
  return{ok:true};
}

async function prepareLocalCandidateRouting(root,workUnitId,{env=process.env,actorId='human:jarvis-desktop:operator'}={}){
  let envelope=CWUV2.readCanonicalExecutionEnvelopeV2(workUnitId,env);
  if(!envelope)return{ok:false,status:'REFUSED',reason:'CANONICAL_V2_WORK_UNIT_NOT_FOUND'};
  if(envelope.work_unit?.identity?.capability!=='local-native-candidate')return{ok:false,status:'REFUSED',reason:'LOCAL_CANDIDATE_CAPABILITY_REQUIRED'};
  let state=envelope.work_unit.state?.lifecycle_state;
  if(state==='AUTHORIZED'){
    const routed=await CWUV2.bindCanonicalRouteV2(root,workUnitId,{env,actorId});
    if(!routed.ok)return routed;
    envelope=CWUV2.readCanonicalExecutionEnvelopeV2(workUnitId,env);state=envelope.work_unit.state.lifecycle_state;
  }
  if(state!=='ROUTED')return{ok:false,status:'REFUSED',reason:'ROUTED_STATE_REQUIRED',state};
  const routeCheck=validateLocalRoute(envelope.work_unit);if(!routeCheck.ok)return{ok:false,status:'REFUSED',reason:routeCheck.reason};

  for(const participant of requiredParticipants(envelope.work_unit)){
    envelope=CWUV2.readCanonicalExecutionEnvelopeV2(workUnitId,env);
    let active=activeBindings(envelope.work_unit).filter(b=>b.route_participant_id===participant.participant_id);
    if(active.length===0){
      const bound=await CWUV2.bindCanonicalTransportV2(root,workUnitId,participant.participant_id,{env,actorId});
      if(!bound.ok)return bound;
      envelope=CWUV2.readCanonicalExecutionEnvelopeV2(workUnitId,env);
      active=activeBindings(envelope.work_unit).filter(b=>b.route_participant_id===participant.participant_id);
    }
    if(active.length!==1)return{ok:false,status:'REFUSED',reason:'EXACT_ACTIVE_TRANSPORT_BINDING_REQUIRED',participant_id:participant.participant_id};
    if(active[0].readiness?.status==='HOLD'){
      const ready=await CWUV2.prepareCanonicalTransportForExecutionV2(root,workUnitId,participant.participant_id,{env,actorId});
      if(!ready.ok)return ready;
    }else if(active[0].readiness?.status!=='READY'){
      return{ok:false,status:'REFUSED',reason:'READY_TRANSPORT_REQUIRED',participant_id:participant.participant_id};
    }
  }
  envelope=CWUV2.readCanonicalExecutionEnvelopeV2(workUnitId,env);
  const finalBindings=activeBindings(envelope.work_unit);
  const required=requiredParticipants(envelope.work_unit);
  const ready=required.every(p=>finalBindings.some(b=>b.route_participant_id===p.participant_id&&b.readiness?.status==='READY'));
  if(!ready)return{ok:false,status:'REFUSED',reason:'REQUIRED_LOCAL_TRANSPORTS_NOT_READY'};
  return{ok:true,status:'LOCAL_CANDIDATE_ROUTED_READY',work_unit_id:workUnitId,lifecycle_state:'ROUTED',route_digest:envelope.work_unit.routing.route_digest,primary:envelope.work_unit.routing.route_record.primary,challengers:envelope.work_unit.routing.route_record.challengers,transport_bindings:finalBindings};
}
module.exports={prepareLocalCandidateRouting,_validateLocalRouteForTest:validateLocalRoute,_activeBindingsForTest:activeBindings};
