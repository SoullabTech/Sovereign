export type RuntimeObservationSource=
  | 'synthetic_member_authored'
  | 'synthetic_system_observed'
  | 'synthetic_imported';

export type RuntimeTemporalStanding=
  | 'has_been'
  | 'is_being'
  | 'may_become'
  | 'unknown';

export type RuntimeConsentStanding=
  | 'explicit_synthetic_consent'
  | 'absent';

export interface CandidateAetherEvent {
  eventRef:string;
  synthetic:true;
  source:RuntimeObservationSource;
  domain:string;
  observation:string;
  temporalStanding:RuntimeTemporalStanding;
  confidence:number;
  consent:RuntimeConsentStanding;

  // These flags are constitutional claims, not content labels.
  identityAuthority:false;
  diagnosticAuthority:false;
  predictiveAuthority:false;
  destinyAuthority:false;
  soulRepresentationAuthority:false;
  persistenceAuthority:false;
  finalMeaningAuthority:'member';
}

export interface CandidateAetherEventInput {
  eventRef:string;
  synthetic:boolean;
  source:RuntimeObservationSource;
  domain:string;
  observation:string;
  temporalStanding:RuntimeTemporalStanding;
  confidence:number;
  consent:RuntimeConsentStanding;
  identityAuthority?:boolean;
  diagnosticAuthority?:boolean;
  predictiveAuthority?:boolean;
  destinyAuthority?:boolean;
  soulRepresentationAuthority?:boolean;
  persistenceAuthority?:boolean;
  finalMeaningAuthority?:'member'|'system';
}

export interface CandidateEventAdjudication {
  admitted:boolean;
  errors:string[];
  event:CandidateAetherEvent|null;
  liveMemberDataAuthorized:false;
  persistenceAuthorized:false;
  productionAuthority:false;
}

const PERSON_DEFINITION_PATTERNS=[
  /\byou are\b/i,
  /\bthis defines (?:you|the member)\b/i,
  /\btrue self\b/i,
];

const DIAGNOSTIC_PATTERNS=[
  /\bdiagnos(?:is|ed|tic)\b/i,
  /\bmeet(?:s)? criteria for\b/i,
];

const DESTINY_PATTERNS=[
  /\bdestiny\b/i,
  /\bdestined\b/i,
  /\bmeant to\b/i,
  /\bwill inevitably\b/i,
];

const SOUL_AUTHORITY_PATTERNS=[
  /\byour soul (?:is|wants|needs|has decided)\b/i,
  /\bthe soul says\b/i,
];

export function adjudicateCandidateAetherEvent(
  input:CandidateAetherEventInput,
):CandidateEventAdjudication{
  const errors:string[]=[];

  if(input.synthetic!==true) errors.push('live_or_non_synthetic_event_not_authorized');
  if(input.consent!=='explicit_synthetic_consent') errors.push('consent_absent');
  if(!input.eventRef.trim()) errors.push('event_ref_required');
  if(!input.domain.trim()) errors.push('domain_required');
  if(!input.observation.trim()) errors.push('observation_required');
  if(!Number.isFinite(input.confidence)||input.confidence<0||input.confidence>1){
    errors.push('confidence_out_of_range');
  }

  if(input.identityAuthority) errors.push('identity_authority_forbidden');
  if(input.diagnosticAuthority) errors.push('diagnostic_authority_forbidden');
  if(input.predictiveAuthority) errors.push('predictive_authority_forbidden');
  if(input.destinyAuthority) errors.push('destiny_authority_forbidden');
  if(input.soulRepresentationAuthority) errors.push('soul_representation_authority_forbidden');
  if(input.persistenceAuthority) errors.push('persistence_authority_forbidden');
  if(input.finalMeaningAuthority&&input.finalMeaningAuthority!=='member'){
    errors.push('final_meaning_must_remain_member_owned');
  }

  for(const pattern of PERSON_DEFINITION_PATTERNS){
    if(pattern.test(input.observation)) errors.push('person_definition_language_forbidden');
  }
  for(const pattern of DIAGNOSTIC_PATTERNS){
    if(pattern.test(input.observation)) errors.push('diagnostic_language_forbidden');
  }
  for(const pattern of DESTINY_PATTERNS){
    if(pattern.test(input.observation)) errors.push('destiny_language_forbidden');
  }
  for(const pattern of SOUL_AUTHORITY_PATTERNS){
    if(pattern.test(input.observation)) errors.push('soul_authority_language_forbidden');
  }

  if(errors.length>0){
    return {
      admitted:false,
      errors:[...new Set(errors)],
      event:null,
      liveMemberDataAuthorized:false,
      persistenceAuthorized:false,
      productionAuthority:false,
    };
  }

  const event:CandidateAetherEvent={
    eventRef:input.eventRef,
    synthetic:true,
    source:input.source,
    domain:input.domain,
    observation:input.observation,
    temporalStanding:input.temporalStanding,
    confidence:input.confidence,
    consent:'explicit_synthetic_consent',
    identityAuthority:false,
    diagnosticAuthority:false,
    predictiveAuthority:false,
    destinyAuthority:false,
    soulRepresentationAuthority:false,
    persistenceAuthority:false,
    finalMeaningAuthority:'member',
  };

  return {
    admitted:true,
    errors:[],
    event,
    liveMemberDataAuthorized:false,
    persistenceAuthorized:false,
    productionAuthority:false,
  };
}
