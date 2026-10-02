#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createWorkUnitDraftV2 } from '../work-unit-v2.mjs';
import { createLifecycleEnvelopeV2, transitionLifecycleV2 } from '../work-unit-lifecycle-v2.mjs';
import { bindAuthorizedRouteV2 } from '../work-unit-routing-v2.mjs';
import {
  JEV_INTEGRATION_DECISIONS,
  consultJevAdvisoryWithDecisions,
  createFakeJevTransport,
} from '../jarvis-jev-advisory-v1.mjs';

const SHA='5555555555555555555555555555555555555555';
function routedWorkUnit(){
  const draft=createWorkUnitDraftV2({
    identity:{id:'wu-jev-matrix',programme:'JARVIS-JEV-01',parent_work_unit:null,objective:'matrix',work_class:'VERIFICATION',task_shape:'CODE_GROUNDED',capability:null},
    custody:{evidence_class:'E1_REPOSITORY_LOCAL'},
    routing_request:{requested_posture:'default',review_pressure:'ordinary'},
    context:{context_refs:[],evidence_refs:['local-worktree:'+SHA],assumptions:[],unknowns:[]},
    scope:{repository:'synthetic/repo',base_ref:SHA,allowed_paths:['scripts/builder'],forbidden_paths:[]},
    authority:{repository_read:true,repository_write:'none',shell:'none',network_external:false,provider_spend:false,external_disclosure:'none',merge:false,deploy:false,production_read:false,production_write:false},
    evaluation:{acceptance_conditions:['pass'],falsification_conditions:['fail'],stop_conditions:['stop']},
    provenance:{creator:'matrix',authorizing_act:null,source_commits:[SHA]},
    state:{supersedes:null},
  });
  assert.equal(draft.ok,true);
  let env=createLifecycleEnvelopeV2(draft.work_unit).envelope;
  env=transitionLifecycleV2(env,{to:'BOUNDED',evidence_ref:'m:b',reason_code:'MATRIX'}).envelope;
  env=transitionLifecycleV2(env,{to:'AUTHORIZED',evidence_ref:'m:a',reason_code:'MATRIX',authorization_ref:'founder:matrix'}).envelope;
  const routed=bindAuthorizedRouteV2(env);
  assert.equal(routed.ok,true,JSON.stringify(routed.blockers));
  return routed.envelope.work_unit;
}
const WORK_UNIT=routedWorkUnit();
const fake=createFakeJevTransport({
  Q_DEPTH:{question_id:'Q_DEPTH',scale:{min:0,max:1},score:.1,confidence:.9},
  Q_RISK:{question_id:'Q_RISK',answer:true,confidence:.9},
  Q_SUFFICIENT:{question_id:'Q_SUFFICIENT',answer:true,confidence:.9},
  Q_LLM_NEEDED:{question_id:'Q_LLM_NEEDED',answer:false,confidence:.9},
});
const throwingTransport=async()=>{throw new Error('network exploded');};
const questions=['Q_DEPTH','Q_RISK','Q_SUFFICIENT','Q_LLM_NEEDED'];
const clone=(x)=>JSON.parse(JSON.stringify(x));
const standardArgs={workUnit:WORK_UNIT,transport:fake,questions};

const candidates=[
  ['DC-JEV-ROUTE-MUTATION',{...JEV_INTEGRATION_DECISIONS,afterConsultWorkUnit:(wu)=>{const x=clone(wu);x.routing.route_digest='mutated';return x;}},standardArgs,(r)=>r.ok===true],
  ['DC-JEV-AUTHORITY-MUTATION',{...JEV_INTEGRATION_DECISIONS,applyAuthority:(a)=>({...a,provider_spend:true})},standardArgs,(r)=>r.ok===true],
  ['DC-JEV-LIFECYCLE-MUTATION',{...JEV_INTEGRATION_DECISIONS,afterConsultWorkUnit:(wu)=>{const x=clone(wu);x.state.lifecycle_state='EXECUTING';return x;}},standardArgs,(r)=>r.ok===true],
  ['DC-JEV-ABSENCE-AS-ADVICE',{...JEV_INTEGRATION_DECISIONS,noTransportResult:(wu)=>({ok:true,consulted:true,reason:null,record:{advice:{}},work_unit:wu})},{workUnit:WORK_UNIT,transport:null,questions},(r)=>r.consulted===false&&r.record===null&&r.reason==='TRANSPORT_NOT_CONNECTED'],
  ['DC-JEV-TRANSPORT-ERROR-MISCLASSIFIED',{...JEV_INTEGRATION_DECISIONS,observeTransport:async(transport,request)=>{try{return await transport(request);}catch{return {parsed:false,local_failure:'SWALLOWED'};}}},{workUnit:WORK_UNIT,transport:throwingTransport,questions:['Q_RISK']},(r)=>r.ok===true&&r.record.exchanges[0].judgment.reason==='TIMEOUT'&&r.record.exchanges[0].transport_failure==='network exploded'],
  ['DC-JEV-LOWERING-DELIVERED',{...JEV_INTEGRATION_DECISIONS,projectHumanDelivery:(a)=>({protective_signals:[],protective_signal_raised:false,depth:a.depth,modelNeeded:a.modelNeeded})},standardArgs,(r)=>!('depth'in r.record.human_delivery)&&!('modelNeeded'in r.record.human_delivery)],
];

let killed=0;
let errors=0;
for(const [name,decisions,args,falsifier] of candidates){
  let reference;
  try{
    reference=await consultJevAdvisoryWithDecisions(args,JEV_INTEGRATION_DECISIONS);
  }catch(error){
    errors+=1;
    console.error('REFERENCE ERROR  '+name+'  '+error.message);
    continue;
  }
  if(!falsifier(reference)){
    errors+=1;
    console.error('REFERENCE FAIL   '+name);
    continue;
  }
  console.log('REF PASS  '+name);

  let candidate;
  try{
    candidate=await consultJevAdvisoryWithDecisions(args,decisions);
  }catch(error){
    errors+=1;
    console.error('CANDIDATE THREW '+name+'  '+error.message);
    continue;
  }
  if(falsifier(candidate)){
    console.error('SURVIVED  '+name);
    process.exitCode=1;
  }else{
    killed+=1;
    console.log('KILL      '+name);
  }
}
console.log('\n'+killed+'/'+candidates.length+' named candidates killed · '+errors+' matrix errors');
if(killed!==candidates.length||errors!==0)process.exit(1);
