import type { LiveAetherConsentGrant } from './liveInputContract';
import type { LiveConsentLifecycleRecord } from './consentLifecycle';
import {
  createFixtureLiveSourceReader,
  executeShadowReadTransaction,
  type FixtureLiveSourceRecord,
} from './shadowReadTransaction';
import { projectFixtureShadowToSyntheticRuntime } from './shadowRuntimeCompatibility';
import { adaptSyntheticEventToBenchmarkObservation } from '../runtime/benchmarkObservationAdapter';
import { deriveSyntheticMemberField } from '../runtime/syntheticFieldDerivation';
import { generateSyntheticReflectionCandidate } from '../runtime/syntheticReflectionCandidate';
import { authorizeSyntheticReflectionHandoff } from '../runtime/reflectionDeliveryGate';
import { simulateSyntheticDelivery } from '../runtime/syntheticDeliverySimulator';

export interface FixtureReplayInput {
  replayRef:string;
  memberRef:string;
  sessionRef:string;
  now:string;
  consentGrant:LiveAetherConsentGrant;
  consentLifecycle:LiveConsentLifecycleRecord;
  sources:FixtureLiveSourceRecord[];
  sourceRefs:string[];
}

export interface FixtureReplayResult {
  replayed:boolean;
  errors:string[];
  shadowCount:number;
  projectedCount:number;
  adaptedCount:number;
  fieldDerived:boolean;
  reflectionGenerated:boolean;
  humanGatePassed:boolean;
  noOpSimulationPassed:boolean;
  consentLifecycleBefore:LiveConsentLifecycleRecord;
  consentLifecycleAfter:LiveConsentLifecycleRecord;
  liveSourceConnected:false;
  realMemberDataRead:false;
  persisted:false;
  memberFacingContacted:false;
  deliveryExecuted:false;
  maiaPromptMutated:false;
  networkSideEffect:false;
  productionAuthority:false;
}

export function runFixtureEndToEndReplay(
  input:FixtureReplayInput,
):FixtureReplayResult{
  const errors:string[]=[];
  const reader=createFixtureLiveSourceReader(input.sources);
  const before={...input.consentLifecycle};
  let lifecycle={...input.consentLifecycle};
  const shadows=[];

  for(const [index,sourceRef] of input.sourceRefs.entries()){
    const tx=executeShadowReadTransaction(reader,{
      transactionRef:input.replayRef+':tx:'+index,
      sourceRef,
      inputRef:input.replayRef+':shadow:'+index,
      consentGrant:input.consentGrant,
      consentLifecycle:lifecycle,
      consentUse:{
        memberRef:input.memberRef,
        consentRef:input.consentGrant.consentRef,
        sessionRef:input.sessionRef,
        now:input.now,
      },
    });
    if(!tx.committed||!tx.shadow){
      errors.push(...tx.errors.map(e=>'shadow_read:'+e));
      return {
        replayed:false,
        errors,
        shadowCount:shadows.length,
        projectedCount:0,
        adaptedCount:0,
        fieldDerived:false,
        reflectionGenerated:false,
        humanGatePassed:false,
        noOpSimulationPassed:false,
        consentLifecycleBefore:before,
        consentLifecycleAfter:{...before},
        liveSourceConnected:false,
        realMemberDataRead:false,
        persisted:false,
        memberFacingContacted:false,
        deliveryExecuted:false,
        maiaPromptMutated:false,
        networkSideEffect:false,
        productionAuthority:false,
      };
    }
    lifecycle={...tx.consentLifecycleAfter};
    shadows.push(tx.shadow);
  }

  const projected=[];
  for(const [index,shadow] of shadows.entries()){
    const p=projectFixtureShadowToSyntheticRuntime(shadow,{
      fixtureRef:input.replayRef+':fixture:'+index,
      fixtureOnly:true,
      memberRef:shadow.memberRef,
      consentRef:shadow.consentRef,
    });
    if(!p.projected||!p.runtimeEvent){
      errors.push(...p.errors.map(e=>'projection:'+e));
      break;
    }
    projected.push(p.runtimeEvent);
  }

  if(errors.length>0){
    return {
      replayed:false,
      errors,
      shadowCount:shadows.length,
      projectedCount:projected.length,
      adaptedCount:0,
      fieldDerived:false,
      reflectionGenerated:false,
      humanGatePassed:false,
      noOpSimulationPassed:false,
      consentLifecycleBefore:before,
      consentLifecycleAfter:lifecycle,
      liveSourceConnected:false,
      realMemberDataRead:false,
      persisted:false,
      memberFacingContacted:false,
      deliveryExecuted:false,
      maiaPromptMutated:false,
      networkSideEffect:false,
      productionAuthority:false,
    };
  }

  const adapted=[];
  for(const event of projected){
    const a=adaptSyntheticEventToBenchmarkObservation(event);
    if(!a.adapted||!a.result){
      errors.push(...a.errors.map(e=>'adaptation:'+e));
      break;
    }
    adapted.push(a.result);
  }

  if(errors.length>0){
    return {
      replayed:false,
      errors,
      shadowCount:shadows.length,
      projectedCount:projected.length,
      adaptedCount:adapted.length,
      fieldDerived:false,
      reflectionGenerated:false,
      humanGatePassed:false,
      noOpSimulationPassed:false,
      consentLifecycleBefore:before,
      consentLifecycleAfter:lifecycle,
      liveSourceConnected:false,
      realMemberDataRead:false,
      persisted:false,
      memberFacingContacted:false,
      deliveryExecuted:false,
      maiaPromptMutated:false,
      networkSideEffect:false,
      productionAuthority:false,
    };
  }

  const field=deriveSyntheticMemberField(
    input.replayRef+':field',
    adapted,
  );
  if(!field.derived||!field.field){
    errors.push(...field.errors.map(e=>'field:'+e));
  }

  const reflection=field.field
    ? generateSyntheticReflectionCandidate(field.field)
    : {generated:false,errors:['field_missing'],candidate:null};

  if(!reflection.generated||!reflection.candidate){
    errors.push(...reflection.errors.map(e=>'reflection:'+e));
  }

  const gate=reflection.candidate
    ? authorizeSyntheticReflectionHandoff(reflection.candidate,{
        authorizationRef:input.replayRef+':human-auth',
        candidateRef:reflection.candidate.candidateRef,
        actor:'human',
        authorized:true,
        scope:'synthetic_handoff_only',
        note:'Fixture-only end-to-end replay authorization.',
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

  const receipt=simulation.receipt;

  return {
    replayed:errors.length===0,
    errors,
    shadowCount:shadows.length,
    projectedCount:projected.length,
    adaptedCount:adapted.length,
    fieldDerived:field.derived,
    reflectionGenerated:reflection.generated,
    humanGatePassed:Boolean(gate?.gatePassed),
    noOpSimulationPassed:simulation.simulated,
    consentLifecycleBefore:before,
    consentLifecycleAfter:lifecycle,
    liveSourceConnected:false,
    realMemberDataRead:false,
    persisted:false,
    memberFacingContacted:receipt?.memberFacingContacted??false,
    deliveryExecuted:receipt?.deliveryExecuted??false,
    maiaPromptMutated:receipt?.maiaPromptMutated??false,
    networkSideEffect:receipt?.networkSideEffect??false,
    productionAuthority:receipt?.productionAuthority??false,
  };
}
