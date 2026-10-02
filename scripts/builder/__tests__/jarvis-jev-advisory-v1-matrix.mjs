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
  let env=createLifecycleEnvelopeV2(draft.work_unit).envelope;
  env=transitionLifecycleV2(env,{to:'BOUNDED',evidence_ref:'m:b',reason_code:'MATRIX'}).envelope;
  env=transitionLifecycleV2(env,{to:'AUTHORIZED',evidence_ref:'m:a',reason_code:'MATRIX',authorization_ref:'founder:matrix'}).envelope;
  return bindAuthorizedRouteV2(env).envelope.work_unit;
}
const fake=createFakeJevTransport({
  Q_RISK:{question_id:'Q_RISK',answer:true,confidence:.9},
});

const clone=(x)=>JSON.parse(JSON.stringify(x));
const candidates=[
  ['DC-JEV-ROUTE-MUTATION',{...JEV_INTEGRATION_DECISIONS,afterConsultWorkUnit:(wu)=>{const x=clone(wu);x.routing.route_digest='mutated';return x;}},async r=>r.ok===true],
  ['DC-JEV-AUTHORITY-MUTATION',{...JEV_INTEGRATION_DECISIONS,applyAuthority:(a)=>({...a,provider_spend:true})},async r=>r.ok===true],
  ['DC-JEV-LIFECYCLE-MUTATION',{...JEV_INTEGRATION_DECISIONS,afterConsultWorkUnit:(wu)=>{const x=clone(wu);x.state.lifecycle_state='EXECUTING';return x;}},async r=>r.ok===true],
  ['DC-JEV-ABSENCE-AS-ADVICE',{...JEV_INTEGRATION_DECISIONS,noTransportResult:(wu)=>({ok:true,consulted:true,reason:null,record:{advice:{}},work_unit:wu})},async r=>r.consulted===false&&r.record===null],
  ['DC-JEV-TRANSPORT-ERROR-ESCAPES',{...JEV_INTEGRATION_DECISIONS,observeTransport:async()=>{throw new Error('escaped');}},async()=>false],
  ['DC-JEV-LOWERING-DELIVERED',{...JEV_INTEGRATION_DECISIONS,projectHumanDelivery:(a)=>({protective_signals:[],protective_signal_raised:false,depth:a.depth,modelNeeded:a.modelNeeded})},async r=>!('depth'in r.record.human_delivery)&&!('modelNeeded'in r.record.human_delivery)],
];

let killed=0;
for(const [name,decisions,falsifier] of candidates){
  let result;
  let threw=false;
  try{
    result=await consultJevAdvisoryWithDecisions({
      workUnit:routedWorkUnit(),
      transport:name==='DC-JEV-ABSENCE-AS-ADVICE'?null:fake,
      questions:['Q_RISK'],
    },decisions);
  }catch{threw=true;}
  const survived=!threw && await falsifier(result);
  if(survived){console.error('SURVIVED  '+name);process.exitCode=1;}
  else{killed++;console.log('KILL  '+name);}
}
console.log('\n'+killed+'/'+candidates.length+' real decision-substitution candidates killed');
if(killed!==candidates.length)process.exit(1);
