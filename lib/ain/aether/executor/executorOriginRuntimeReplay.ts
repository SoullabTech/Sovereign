import type { LiveShadowObservation } from '../live/liveInputContract';
import { projectFixtureShadowToSyntheticRuntime } from '../live/shadowRuntimeCompatibility';
import { adaptSyntheticEventToBenchmarkObservation } from '../runtime/benchmarkObservationAdapter';
import { deriveSyntheticMemberField } from '../runtime/syntheticFieldDerivation';
import { generateSyntheticReflectionCandidate } from '../runtime/syntheticReflectionCandidate';
import { authorizeSyntheticReflectionHandoff } from '../runtime/reflectionDeliveryGate';
import { simulateSyntheticDelivery } from '../runtime/syntheticDeliverySimulator';

export interface ExecutorOriginProvenance {
  recordRef:string;
  executorReceiptRef:string;
  transportRef:string;
  transportKind:'local_fixture_only';
  externalNetworkCall:false;
  productionReachable:false;
}

export interface ExecutorOriginShadow {
  shadow:LiveShadowObservation;
  origin:ExecutorOriginProvenance;
}

export interface ExecutorOriginReplayResult {
  replayed:boolean;
  errors:string[];
  executorOriginCount:number;
  projectedCount:number;
  adaptedCount:number;
  fieldDerived:boolean;
  reflectionGenerated:boolean;
  humanGatePassed:boolean;
  noOpSimulationPassed:boolean;
  originRecordsPreserved:string[];
  originReceiptsPreserved:string[];
  originTransportsPreserved:string[];
  externalNetworkCall:false;
  persisted:false;
  memberFacingContacted:false;
  deliveryExecuted:false;
  maiaPromptMutated:false;
  productionAuthority:false;
}

export function replayExecutorOriginShadows(
  replayRef:string,
  inputs:ExecutorOriginShadow[],
):ExecutorOriginReplayResult{
  const errors:string[]=[];

  if(inputs.length<2) errors.push('executor_origin_replay_requires_two_shadows');

  for(const input of inputs){
    if(input.origin.transportKind!=='local_fixture_only') errors.push('origin_transport_not_local_fixture_only');
    if(input.origin.externalNetworkCall!==false) errors.push('origin_network_effect_present');
    if(input.origin.productionReachable!==false) errors.push('origin_production_reachability_present');
  }

  if(errors.length>0){
    return {
      replayed:false,
      errors:[...new Set(errors)],
      executorOriginCount:inputs.length,
      projectedCount:0,
      adaptedCount:0,
      fieldDerived:false,
      reflectionGenerated:false,
      humanGatePassed:false,
      noOpSimulationPassed:false,
      originRecordsPreserved:inputs.map(i=>i.origin.recordRef),
      originReceiptsPreserved:inputs.map(i=>i.origin.executorReceiptRef),
      originTransportsPreserved:inputs.map(i=>i.origin.transportRef),
      externalNetworkCall:false,
      persisted:false,
      memberFacingContacted:false,
      deliveryExecuted:false,
      maiaPromptMutated:false,
      productionAuthority:false,
    };
  }

  const projected=[];
  for(const [index,input] of inputs.entries()){
    const p=projectFixtureShadowToSyntheticRuntime(input.shadow,{
      fixtureRef:replayRef+':executor-origin:'+index,
      fixtureOnly:true,
      memberRef:input.shadow.memberRef,
      consentRef:input.shadow.consentRef,
    });
    if(!p.projected||!p.runtimeEvent){
      errors.push(...p.errors.map(e=>'projection:'+e));
      break;
    }
    projected.push(p.runtimeEvent);
  }

  const adapted=[];
  if(errors.length===0){
    for(const event of projected){
      const a=adaptSyntheticEventToBenchmarkObservation(event);
      if(!a.adapted||!a.result){
        errors.push(...a.errors.map(e=>'adaptation:'+e));
        break;
      }
      adapted.push(a.result);
    }
  }

  const field=errors.length===0
    ? deriveSyntheticMemberField(replayRef+':field',adapted)
    : {derived:false,errors:['prior_stage_failed'],field:null};

  if(!field.derived||!field.field) errors.push(...field.errors.map(e=>'field:'+e));

  const reflection=field.field
    ? generateSyntheticReflectionCandidate(field.field)
    : {generated:false,errors:['field_missing'],candidate:null};

  if(!reflection.generated||!reflection.candidate){
    errors.push(...reflection.errors.map(e=>'reflection:'+e));
  }

  const gate=reflection.candidate
    ? authorizeSyntheticReflectionHandoff(reflection.candidate,{
        authorizationRef:replayRef+':human-auth',
        candidateRef:reflection.candidate.candidateRef,
        actor:'human',
        authorized:true,
        scope:'synthetic_handoff_only',
        note:'Executor-origin fixture replay authorization.',
      })
    : null;

  if(!gate?.gatePassed||!gate.token){
    errors.push(...(gate?.errors??['human_gate_missing']).map(e=>'gate:'+e));
  }

  const simulation=gate?.token
    ? simulateSyntheticDelivery(gate.token)
    : {simulated:false,errors:['handoff_token_missing'],receipt:null};

  if(!simulation.simulated||!simulation.receipt){
    errors.push(...simulation.errors.map(e=>'simulation:'+e));
  }

  return {
    replayed:errors.length===0,
    errors:[...new Set(errors)],
    executorOriginCount:inputs.length,
    projectedCount:projected.length,
    adaptedCount:adapted.length,
    fieldDerived:field.derived,
    reflectionGenerated:reflection.generated,
    humanGatePassed:Boolean(gate?.gatePassed),
    noOpSimulationPassed:simulation.simulated,
    originRecordsPreserved:inputs.map(i=>i.origin.recordRef),
    originReceiptsPreserved:inputs.map(i=>i.origin.executorReceiptRef),
    originTransportsPreserved:inputs.map(i=>i.origin.transportRef),
    externalNetworkCall:false,
    persisted:false,
    memberFacingContacted:simulation.receipt?.memberFacingContacted??false,
    deliveryExecuted:simulation.receipt?.deliveryExecuted??false,
    maiaPromptMutated:simulation.receipt?.maiaPromptMutated??false,
    productionAuthority:simulation.receipt?.productionAuthority??false,
  };
}
