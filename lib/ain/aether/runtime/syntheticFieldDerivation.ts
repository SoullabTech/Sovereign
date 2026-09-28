import {
  deriveMemberAetherField,
  validateMemberAetherField,
  type MemberAetherField,
} from '../benchmark/memberField';
import type { AdaptedSyntheticObservation } from './benchmarkObservationAdapter';

export interface SyntheticFieldDerivationResult {
  derived:boolean;
  errors:string[];
  field:MemberAetherField|null;
  sourceObservationRefs:string[];
  sourceProvenanceRefs:string[];
  syntheticOnly:true;
  persisted:false;
  liveMemberDataBound:false;
  productionAuthority:false;
}

export function deriveSyntheticMemberField(
  fieldRef:string,
  adapted:AdaptedSyntheticObservation[],
):SyntheticFieldDerivationResult{
  const errors:string[]=[];

  if(!fieldRef.trim()) errors.push('field_ref_required');
  if(adapted.length===0) errors.push('synthetic_observation_batch_required');

  const observationRefs=new Set<string>();
  for(const item of adapted){
    if(item.provenance.synthetic!==true) errors.push('non_synthetic_provenance_forbidden');
    if(item.provenance.consent!=='explicit_synthetic_consent'){
      errors.push('synthetic_consent_missing');
    }
    if(item.provenance.finalMeaningAuthority!=='member'){
      errors.push('source_final_meaning_not_member_owned');
    }
    if(item.provenance.persistenceAuthority!==false||item.persistenceAuthority!==false){
      errors.push('source_persistence_authority_present');
    }
    if(item.authorityEscalated!==false) errors.push('source_authority_escalated');
    if(item.confidenceIncreased!==false) errors.push('source_confidence_increased');
    if(item.temporalStandingStrengthened!==false){
      errors.push('source_temporal_standing_strengthened');
    }
    if(observationRefs.has(item.observation.observationRef)){
      errors.push('duplicate_observation_ref:'+item.observation.observationRef);
    }
    observationRefs.add(item.observation.observationRef);
  }

  if(errors.length>0){
    return {
      derived:false,
      errors:[...new Set(errors)],
      field:null,
      sourceObservationRefs:[...observationRefs],
      sourceProvenanceRefs:adapted.map(x=>x.provenance.eventRef),
      syntheticOnly:true,
      persisted:false,
      liveMemberDataBound:false,
      productionAuthority:false,
    };
  }

  const field=deriveMemberAetherField(
    fieldRef,
    adapted.map(x=>x.observation),
  );
  const validation=validateMemberAetherField(field);
  if(!validation.valid){
    return {
      derived:false,
      errors:validation.errors.map(e=>'derived_field_invalid:'+e),
      field:null,
      sourceObservationRefs:[...observationRefs],
      sourceProvenanceRefs:adapted.map(x=>x.provenance.eventRef),
      syntheticOnly:true,
      persisted:false,
      liveMemberDataBound:false,
      productionAuthority:false,
    };
  }

  return {
    derived:true,
    errors:[],
    field,
    sourceObservationRefs:[...observationRefs],
    sourceProvenanceRefs:adapted.map(x=>x.provenance.eventRef),
    syntheticOnly:true,
    persisted:false,
    liveMemberDataBound:false,
    productionAuthority:false,
  };
}
