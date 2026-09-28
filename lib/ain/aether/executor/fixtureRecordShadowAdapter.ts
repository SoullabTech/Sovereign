import type { LocalFixtureExecutionResult } from './localFixtureExecutor';
import type {
  LiveAetherConsentGrant,
  LiveObservationSource,
  LiveShadowAdjudication,
} from '../live/liveInputContract';
import { admitLiveInputToShadow } from '../live/liveInputContract';

export interface FixtureRecordAdmissionBinding {
  bindingRef:string;
  consentRef:string;
  source:LiveObservationSource;
  temporalStanding:'has_been'|'is_being'|'may_become'|'unknown';
  confidence:number;
}

export interface FixtureRecordShadowAdaptation {
  adapted:boolean;
  errors:string[];
  admission:LiveShadowAdjudication|null;
  sourceRecordRef:string|null;
  memberRefPreserved:boolean;
  domainPreserved:boolean;
  observationPreserved:boolean;
  sourceStandingPreserved:boolean;
  temporalStandingPreserved:boolean;
  confidencePreserved:boolean;
  consentRefPreserved:boolean;
  persisted:false;
  memberFacingDelivery:false;
  maiaPromptMutated:false;
  productionAuthority:false;
}

export function adaptFixtureExecutionToLiveShadow(
  execution:LocalFixtureExecutionResult,
  binding:FixtureRecordAdmissionBinding,
  consent:LiveAetherConsentGrant|null,
):FixtureRecordShadowAdaptation{
  const errors:string[]=[];

  if(!execution.executed||!execution.record||!execution.receipt){
    errors.push('successful_fixture_execution_required');
  }
  if(execution.receipt?.transportKind!=='local_fixture_only'){
    errors.push('local_fixture_receipt_required');
  }
  if(execution.receipt?.externalNetworkCall!==false){
    errors.push('networked_execution_forbidden');
  }
  if(execution.receipt?.productionReachable!==false){
    errors.push('production_reachable_execution_forbidden');
  }
  if(!binding.bindingRef.trim()) errors.push('binding_ref_required');
  if(!Number.isFinite(binding.confidence)||binding.confidence<0||binding.confidence>1){
    errors.push('binding_confidence_out_of_range');
  }
  if(consent&&consent.consentRef!==binding.consentRef){
    errors.push('binding_consent_ref_mismatch');
  }

  if(errors.length>0||!execution.record){
    return {
      adapted:false,
      errors:[...new Set(errors)],
      admission:null,
      sourceRecordRef:execution.record?.recordRef??null,
      memberRefPreserved:false,
      domainPreserved:false,
      observationPreserved:false,
      sourceStandingPreserved:false,
      temporalStandingPreserved:false,
      confidencePreserved:false,
      consentRefPreserved:false,
      persisted:false,
      memberFacingDelivery:false,
      maiaPromptMutated:false,
      productionAuthority:false,
    };
  }

  const input={
    inputRef:'executor-record:'+execution.record.recordRef,
    memberRef:execution.record.memberRef,
    source:binding.source,
    domain:execution.record.domain,
    observation:execution.record.text,
    temporalStanding:binding.temporalStanding,
    confidence:binding.confidence,
    consentRef:binding.consentRef,
  } as const;

  const admission=admitLiveInputToShadow(input,consent);
  const shadow=admission.shadow;

  return {
    adapted:admission.admitted&&Boolean(shadow),
    errors:admission.errors,
    admission,
    sourceRecordRef:execution.record.recordRef,
    memberRefPreserved:shadow?.memberRef===execution.record.memberRef,
    domainPreserved:shadow?.domain===execution.record.domain,
    observationPreserved:shadow?.observation===execution.record.text,
    sourceStandingPreserved:shadow?.source===binding.source,
    temporalStandingPreserved:shadow?.temporalStanding===binding.temporalStanding,
    confidencePreserved:shadow?.confidence===binding.confidence,
    consentRefPreserved:shadow?.consentRef===binding.consentRef,
    persisted:false,
    memberFacingDelivery:false,
    maiaPromptMutated:false,
    productionAuthority:false,
  };
}
