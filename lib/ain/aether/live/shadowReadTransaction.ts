import type { LiveAetherConsentGrant, LiveAetherInput, LiveShadowObservation } from './liveInputContract';
import { admitLiveInputToShadow } from './liveInputContract';
import type {
  LiveConsentLifecycleRecord,
  LiveConsentUseRequest,
} from './consentLifecycle';
import {
  consumeReadOnceConsent,
  evaluateLiveConsent,
} from './consentLifecycle';

export interface FixtureLiveSourceRecord {
  sourceRef:string;
  memberRef:string;
  source:LiveAetherInput['source'];
  domain:string;
  observation:string;
  temporalStanding:LiveAetherInput['temporalStanding'];
  confidence:number;
}

export interface FixtureLiveSourceReader {
  read(sourceRef:string):FixtureLiveSourceRecord|null;
}

export interface ShadowReadTransactionRequest {
  transactionRef:string;
  sourceRef:string;
  inputRef:string;
  consentGrant:LiveAetherConsentGrant;
  consentLifecycle:LiveConsentLifecycleRecord;
  consentUse:LiveConsentUseRequest;
}

export interface ShadowReadTransactionResult {
  committed:boolean;
  errors:string[];
  shadow:LiveShadowObservation|null;
  consentLifecycleBefore:LiveConsentLifecycleRecord;
  consentLifecycleAfter:LiveConsentLifecycleRecord;
  consentConsumed:boolean;
  sourceRead:boolean;
  persistenceAuthorized:false;
  memberFacingDeliveryAuthorized:false;
  maiaPromptMutationAuthorized:false;
  productionAuthority:false;
}

export function createFixtureLiveSourceReader(
  records:FixtureLiveSourceRecord[],
):FixtureLiveSourceReader{
  const byRef=new Map(records.map(r=>[r.sourceRef,{...r}]));
  return {
    read(sourceRef:string){
      const found=byRef.get(sourceRef);
      return found?{...found}:null;
    },
  };
}

export function executeShadowReadTransaction(
  reader:FixtureLiveSourceReader,
  request:ShadowReadTransactionRequest,
):ShadowReadTransactionResult{
  const before={...request.consentLifecycle};

  const consent=evaluateLiveConsent(
    request.consentGrant,
    request.consentLifecycle,
    request.consentUse,
  );

  if(!consent.valid){
    return {
      committed:false,
      errors:consent.errors,
      shadow:null,
      consentLifecycleBefore:before,
      consentLifecycleAfter:{...before},
      consentConsumed:false,
      sourceRead:false,
      persistenceAuthorized:false,
      memberFacingDeliveryAuthorized:false,
      maiaPromptMutationAuthorized:false,
      productionAuthority:false,
    };
  }

  const record=reader.read(request.sourceRef);
  if(!record){
    return {
      committed:false,
      errors:['fixture_source_not_found'],
      shadow:null,
      consentLifecycleBefore:before,
      consentLifecycleAfter:{...before},
      consentConsumed:false,
      sourceRead:false,
      persistenceAuthorized:false,
      memberFacingDeliveryAuthorized:false,
      maiaPromptMutationAuthorized:false,
      productionAuthority:false,
    };
  }

  if(record.memberRef!==request.consentGrant.memberRef){
    return {
      committed:false,
      errors:['source_member_mismatch'],
      shadow:null,
      consentLifecycleBefore:before,
      consentLifecycleAfter:{...before},
      consentConsumed:false,
      sourceRead:true,
      persistenceAuthorized:false,
      memberFacingDeliveryAuthorized:false,
      maiaPromptMutationAuthorized:false,
      productionAuthority:false,
    };
  }

  const input:LiveAetherInput={
    inputRef:request.inputRef,
    memberRef:record.memberRef,
    source:record.source,
    domain:record.domain,
    observation:record.observation,
    temporalStanding:record.temporalStanding,
    confidence:record.confidence,
    consentRef:request.consentGrant.consentRef,
  };

  const admitted=admitLiveInputToShadow(input,request.consentGrant);
  if(!admitted.admitted||!admitted.shadow){
    return {
      committed:false,
      errors:admitted.errors,
      shadow:null,
      consentLifecycleBefore:before,
      consentLifecycleAfter:{...before},
      consentConsumed:false,
      sourceRead:true,
      persistenceAuthorized:false,
      memberFacingDeliveryAuthorized:false,
      maiaPromptMutationAuthorized:false,
      productionAuthority:false,
    };
  }

  const after=consent.consumeOnUse
    ? consumeReadOnceConsent(
        request.consentGrant,
        request.consentLifecycle,
        request.consentUse.now,
      )
    : {...request.consentLifecycle};

  return {
    committed:true,
    errors:[],
    shadow:admitted.shadow,
    consentLifecycleBefore:before,
    consentLifecycleAfter:after,
    consentConsumed:consent.consumeOnUse,
    sourceRead:true,
    persistenceAuthorized:false,
    memberFacingDeliveryAuthorized:false,
    maiaPromptMutationAuthorized:false,
    productionAuthority:false,
  };
}
