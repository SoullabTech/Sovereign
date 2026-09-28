import type { LiveShadowObservation } from './liveInputContract';
import {
  adjudicateCandidateAetherEvent,
  type CandidateAetherEvent,
} from '../runtime/candidateEventEnvelope';

export interface LiveFixtureAttestation {
  fixtureRef:string;
  fixtureOnly:true;
  memberRef:string;
  consentRef:string;
}

export interface ShadowRuntimeCompatibilityProvenance {
  fixtureRef:string;
  originalInputRef:string;
  originalMemberRef:string;
  originalConsentRef:string;
  originalSource:LiveShadowObservation['source'];
  originalDomain:string;
  originalTemporalStanding:LiveShadowObservation['temporalStanding'];
  originalConfidence:number;
  fixtureOnly:true;
  liveDataProjected:false;
  confidenceIncreased:false;
  temporalStandingStrengthened:false;
  authorityEscalated:false;
  persistenceAuthority:false;
  deliveryAuthority:false;
  promptMutationAuthority:false;
  productionAuthority:false;
}

export interface ShadowRuntimeCompatibilityResult {
  projected:boolean;
  errors:string[];
  runtimeEvent:CandidateAetherEvent|null;
  provenance:ShadowRuntimeCompatibilityProvenance|null;
}

function runtimeSource(source:LiveShadowObservation['source']){
  if(source==='member_authored') return 'synthetic_member_authored' as const;
  if(source==='member_confirmed_import') return 'synthetic_imported' as const;
  return 'synthetic_system_observed' as const;
}

export function projectFixtureShadowToSyntheticRuntime(
  shadow:LiveShadowObservation,
  attestation:LiveFixtureAttestation|null,
):ShadowRuntimeCompatibilityResult{
  const errors:string[]=[];

  if(!attestation){
    errors.push('fixture_attestation_required');
  } else {
    if(attestation.fixtureOnly!==true) errors.push('fixture_attestation_not_fixture_only');
    if(attestation.memberRef!==shadow.memberRef) errors.push('fixture_member_mismatch');
    if(attestation.consentRef!==shadow.consentRef) errors.push('fixture_consent_mismatch');
    if(!attestation.fixtureRef.trim()) errors.push('fixture_ref_required');
  }

  if(shadow.readOnly!==true) errors.push('shadow_not_read_only');
  if(shadow.persisted!==false) errors.push('shadow_already_persisted');
  if(shadow.delivered!==false) errors.push('shadow_already_delivered');
  if(shadow.maiaPromptMutated!==false) errors.push('shadow_maia_prompt_already_mutated');
  if(shadow.productionAuthority!==false) errors.push('shadow_has_production_authority');
  if(shadow.identityAuthority!==false) errors.push('shadow_identity_authority_present');
  if(shadow.diagnosticAuthority!==false) errors.push('shadow_diagnostic_authority_present');
  if(shadow.predictiveAuthority!==false) errors.push('shadow_predictive_authority_present');
  if(shadow.destinyAuthority!==false) errors.push('shadow_destiny_authority_present');
  if(shadow.soulRepresentationAuthority!==false) errors.push('shadow_soul_authority_present');
  if(shadow.finalMeaningAuthority!=='member') errors.push('shadow_final_meaning_not_member_owned');

  if(errors.length>0){
    return {projected:false,errors,runtimeEvent:null,provenance:null};
  }

  const adjudicated=adjudicateCandidateAetherEvent({
    eventRef:'fixture-shadow:'+shadow.inputRef,
    synthetic:true,
    source:runtimeSource(shadow.source),
    domain:shadow.domain,
    observation:shadow.observation,
    temporalStanding:shadow.temporalStanding,
    confidence:shadow.confidence,
    consent:'explicit_synthetic_consent',
    finalMeaningAuthority:'member',
  });

  if(!adjudicated.admitted||!adjudicated.event){
    return {
      projected:false,
      errors:adjudicated.errors.map(e=>'runtime_membrane:'+e),
      runtimeEvent:null,
      provenance:null,
    };
  }

  return {
    projected:true,
    errors:[],
    runtimeEvent:adjudicated.event,
    provenance:{
      fixtureRef:attestation!.fixtureRef,
      originalInputRef:shadow.inputRef,
      originalMemberRef:shadow.memberRef,
      originalConsentRef:shadow.consentRef,
      originalSource:shadow.source,
      originalDomain:shadow.domain,
      originalTemporalStanding:shadow.temporalStanding,
      originalConfidence:shadow.confidence,
      fixtureOnly:true,
      liveDataProjected:false,
      confidenceIncreased:false,
      temporalStandingStrengthened:false,
      authorityEscalated:false,
      persistenceAuthority:false,
      deliveryAuthority:false,
      promptMutationAuthority:false,
      productionAuthority:false,
    },
  };
}
