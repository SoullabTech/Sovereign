import {
  adjudicateCandidateUtterance,
} from '../benchmark/fieldDialogue';
import type {
  AetherFieldPattern,
  MemberAetherField,
} from '../benchmark/memberField';

export interface SyntheticReflectionProvenance {
  patternRef:string;
  motif:string;
  contributingObservationRefs:string[];
  contributingFacetRefs:string[];
  sourceObservationNotes:Array<{
    observationRef:string;
    facetRef:string;
    note:string;
  }>;
  uncertainty:number;
  memberRecognition:string;
}

export interface SyntheticReflectionCandidate {
  candidateRef:string;
  text:string;
  patternRef:string;
  referencedFacetRefs:string[];
  referencedObservationRefs:string[];
  provenance:SyntheticReflectionProvenance;
  correctionInvited:true;
  provisional:true;
  finalMeaningAuthority:'member';
  identityAuthority:false;
  diagnosticAuthority:false;
  predictiveAuthority:false;
  destinyAuthority:false;
  soulRepresentationAuthority:false;
  deliverable:false;
  memberFacingDelivered:false;
  maiaPromptMutated:false;
  persisted:false;
  productionAuthority:false;
}

export interface SyntheticReflectionCandidateResult {
  generated:boolean;
  errors:string[];
  candidate:SyntheticReflectionCandidate|null;
}

function humanize(ref:string){
  return ref.replace(/[-_]/g,' ').replace(/\b\w/g,m=>m.toUpperCase());
}

function listNames(refs:string[]){
  const names=refs.map(humanize);
  if(names.length===0) return '';
  if(names.length===1) return names[0];
  if(names.length===2) return names.join(' and ');
  return names.slice(0,-1).join(', ')+', and '+names[names.length-1];
}

function eligiblePattern(field:MemberAetherField){
  return field.patterns
    .filter(p=>p.contributingFacetRefs.length>=2)
    .sort((a,b)=>b.contributingFacetRefs.length-a.contributingFacetRefs.length)[0]??null;
}

export function validateSyntheticReflectionSemantics(
  field:MemberAetherField,
  pattern:AetherFieldPattern,
  candidate:SyntheticReflectionCandidate,
){
  const errors:string[]=[];
  const observations=new Map(field.observations.map(o=>[o.observationRef,o]));

  if(candidate.patternRef!==pattern.patternRef){
    errors.push('candidate_pattern_ref_mismatch');
  }

  for(const ref of pattern.contributingObservationRefs){
    if(!candidate.referencedObservationRefs.includes(ref)){
      errors.push('candidate_missing_supporting_observation:'+ref);
    }
    if(!observations.has(ref)){
      errors.push('pattern_references_missing_observation:'+ref);
    }
  }

  for(const ref of candidate.referencedObservationRefs){
    if(!pattern.contributingObservationRefs.includes(ref)){
      errors.push('candidate_adds_unsupported_observation:'+ref);
    }
  }

  for(const facet of pattern.contributingFacetRefs){
    if(!candidate.referencedFacetRefs.includes(facet)){
      errors.push('candidate_missing_supporting_facet:'+facet);
    }
    if(!candidate.text.toLowerCase().includes(facet.toLowerCase())){
      errors.push('candidate_text_missing_facet:'+facet);
    }
  }

  for(const facet of candidate.referencedFacetRefs){
    if(!pattern.contributingFacetRefs.includes(facet)){
      errors.push('candidate_adds_unsupported_facet:'+facet);
    }
  }

  if(pattern.identityAuthority!==false) errors.push('pattern_identity_authority_present');
  if(pattern.diagnosticAuthority!==false) errors.push('pattern_diagnostic_authority_present');
  if(pattern.predictiveAuthority!==false) errors.push('pattern_predictive_authority_present');
  if(pattern.soulRepresentationAuthority!==false) errors.push('pattern_soul_authority_present');
  if(pattern.provisional!==true) errors.push('pattern_not_provisional');

  const posture=adjudicateCandidateUtterance(candidate.text);
  if(!posture.valid){
    errors.push(...posture.errors.map(e=>'dialogue_posture:'+e));
  }

  return {valid:errors.length===0,errors};
}

export function generateSyntheticReflectionCandidate(
  field:MemberAetherField,
):SyntheticReflectionCandidateResult{
  const errors:string[]=[];

  if(field.finalMeaningAuthority!=='member') errors.push('field_final_meaning_not_member_owned');
  if(field.persistenceAuthority!==false) errors.push('field_persistence_authority_present');

  const pattern=eligiblePattern(field);
  if(!pattern) errors.push('no_cross_facet_pattern_available');

  if(errors.length>0||!pattern){
    return {generated:false,errors,candidate:null};
  }

  const facets=listNames(pattern.contributingFacetRefs);
  const text=
    `I notice ${facets} share a pattern in the reflected synthetic field right now. Does that connection feel meaningful, or should these areas stay separate?`;

  const sourceObservationNotes=pattern.contributingObservationRefs
    .map(ref=>field.observations.find(o=>o.observationRef===ref))
    .filter((o):o is NonNullable<typeof o>=>Boolean(o))
    .map(o=>({
      observationRef:o.observationRef,
      facetRef:o.facetRef,
      note:o.note,
    }));

  const candidate:SyntheticReflectionCandidate={
    candidateRef:'synthetic-reflection:'+pattern.patternRef,
    text,
    patternRef:pattern.patternRef,
    referencedFacetRefs:[...pattern.contributingFacetRefs],
    referencedObservationRefs:[...pattern.contributingObservationRefs],
    provenance:{
      patternRef:pattern.patternRef,
      motif:pattern.motif,
      contributingObservationRefs:[...pattern.contributingObservationRefs],
      contributingFacetRefs:[...pattern.contributingFacetRefs],
      sourceObservationNotes,
      uncertainty:pattern.uncertainty,
      memberRecognition:pattern.memberRecognition,
    },
    correctionInvited:true,
    provisional:true,
    finalMeaningAuthority:'member',
    identityAuthority:false,
    diagnosticAuthority:false,
    predictiveAuthority:false,
    destinyAuthority:false,
    soulRepresentationAuthority:false,
    deliverable:false,
    memberFacingDelivered:false,
    maiaPromptMutated:false,
    persisted:false,
    productionAuthority:false,
  };

  const semantic=validateSyntheticReflectionSemantics(field,pattern,candidate);
  if(!semantic.valid){
    return {generated:false,errors:semantic.errors,candidate:null};
  }

  return {generated:true,errors:[],candidate};
}
