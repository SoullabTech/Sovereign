import type {
  AetherObservationStanding,
  AetherTemporalStanding,
  MemberFieldObservation,
} from '../benchmark/memberField';
import type { CandidateAetherEvent } from './candidateEventEnvelope';

export interface SyntheticObservationProvenance {
  eventRef:string;
  source:string;
  sourceConfidence:number;
  consent:'explicit_synthetic_consent';
  synthetic:true;
  originalDomain:string;
  originalObservation:string;
  originalTemporalStanding:CandidateAetherEvent['temporalStanding'];
  finalMeaningAuthority:'member';
  persistenceAuthority:false;
}

export interface AdaptedSyntheticObservation {
  observation:MemberFieldObservation;
  provenance:SyntheticObservationProvenance;
  authorityEscalated:false;
  confidenceIncreased:false;
  temporalStandingStrengthened:false;
  persistenceAuthority:false;
}

export interface ObservationAdaptationResult {
  adapted:boolean;
  errors:string[];
  result:AdaptedSyntheticObservation|null;
}

function standingFor(source:CandidateAetherEvent['source']):AetherObservationStanding{
  return source==='synthetic_member_authored'
    ? 'member_named'
    : 'source_observed';
}

function temporalFor(
  standing:CandidateAetherEvent['temporalStanding'],
):AetherTemporalStanding|null{
  if(standing==='has_been'||standing==='is_being'||standing==='may_become'){
    return standing;
  }
  return null;
}

export function adaptSyntheticEventToBenchmarkObservation(
  event:CandidateAetherEvent,
):ObservationAdaptationResult{
  const errors:string[]=[];

  if(event.synthetic!==true) errors.push('adapter_requires_synthetic_event');
  if(event.consent!=='explicit_synthetic_consent') errors.push('adapter_requires_synthetic_consent');
  if(event.finalMeaningAuthority!=='member') errors.push('adapter_final_meaning_not_member_owned');
  if(event.persistenceAuthority!==false) errors.push('adapter_persistence_authority_present');
  if(event.identityAuthority!==false) errors.push('adapter_identity_authority_present');
  if(event.diagnosticAuthority!==false) errors.push('adapter_diagnostic_authority_present');
  if(event.predictiveAuthority!==false) errors.push('adapter_predictive_authority_present');
  if(event.destinyAuthority!==false) errors.push('adapter_destiny_authority_present');
  if(event.soulRepresentationAuthority!==false) errors.push('adapter_soul_authority_present');

  const temporalStanding=temporalFor(event.temporalStanding);
  if(!temporalStanding){
    errors.push('target_cannot_losslessly_represent_unknown_temporal_standing');
  }

  if(errors.length>0){
    return {adapted:false,errors,result:null};
  }

  const observation:MemberFieldObservation={
    observationRef:event.eventRef,
    facetRef:event.domain,
    motif:event.observation,
    temporalStanding:temporalStanding!,
    standing:standingFor(event.source),
    qualities:[],
    note:event.observation,
  };

  const provenance:SyntheticObservationProvenance={
    eventRef:event.eventRef,
    source:event.source,
    sourceConfidence:event.confidence,
    consent:'explicit_synthetic_consent',
    synthetic:true,
    originalDomain:event.domain,
    originalObservation:event.observation,
    originalTemporalStanding:event.temporalStanding,
    finalMeaningAuthority:'member',
    persistenceAuthority:false,
  };

  return {
    adapted:true,
    errors:[],
    result:{
      observation,
      provenance,
      authorityEscalated:false,
      confidenceIncreased:false,
      temporalStandingStrengthened:false,
      persistenceAuthority:false,
    },
  };
}
