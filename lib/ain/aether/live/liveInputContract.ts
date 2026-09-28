export type LiveObservationSource=
  | 'member_authored'
  | 'member_confirmed_import'
  | 'system_observed';

export type LiveConsentScope=
  | 'aether_read_once'
  | 'aether_session_read';

export interface LiveAetherConsentGrant {
  consentRef:string;
  memberRef:string;
  scope:LiveConsentScope;
  grantedBy:'member';
  granted:true;
  purpose:'aether_reflection';
  persistenceAllowed:false;
  deliveryAllowed:false;
  promptMutationAllowed:false;
  productionEscalationAllowed:false;
}

export interface LiveAetherInput {
  inputRef:string;
  memberRef:string;
  source:LiveObservationSource;
  domain:string;
  observation:string;
  temporalStanding:'has_been'|'is_being'|'may_become'|'unknown';
  confidence:number;
  consentRef:string;
  identityAuthority?:boolean;
  diagnosticAuthority?:boolean;
  predictiveAuthority?:boolean;
  destinyAuthority?:boolean;
  soulRepresentationAuthority?:boolean;
  persistenceAuthority?:boolean;
  deliveryAuthority?:boolean;
  promptMutationAuthority?:boolean;
  productionAuthority?:boolean;
  finalMeaningAuthority?:'member'|'system';
}

export interface LiveShadowObservation {
  inputRef:string;
  memberRef:string;
  source:LiveObservationSource;
  domain:string;
  observation:string;
  temporalStanding:LiveAetherInput['temporalStanding'];
  confidence:number;
  consentRef:string;
  readOnly:true;
  persisted:false;
  delivered:false;
  maiaPromptMutated:false;
  productionAuthority:false;
  identityAuthority:false;
  diagnosticAuthority:false;
  predictiveAuthority:false;
  destinyAuthority:false;
  soulRepresentationAuthority:false;
  finalMeaningAuthority:'member';
}

export interface LiveShadowAdjudication {
  admitted:boolean;
  errors:string[];
  shadow:LiveShadowObservation|null;
  persistenceAuthorized:false;
  memberFacingDeliveryAuthorized:false;
  maiaPromptMutationAuthorized:false;
  productionAuthority:false;
}

const AUTHORITY_LANGUAGE:Array<[string,RegExp]>=[
  ['identity_language_forbidden',/\byou are\b/i],
  ['diagnostic_language_forbidden',/\b(?:diagnosis|diagnosed|diagnostic|meet(?:s)? criteria for)\b/i],
  ['destiny_language_forbidden',/\b(?:destiny|destined|meant to|will inevitably)\b/i],
  ['soul_language_forbidden',/\b(?:your soul (?:is|wants|needs|has decided)|the soul says)\b/i],
];

export function admitLiveInputToShadow(
  input:LiveAetherInput,
  consent:LiveAetherConsentGrant|null,
):LiveShadowAdjudication{
  const errors:string[]=[];

  if(!consent){
    errors.push('live_consent_required');
  } else {
    if(consent.memberRef!==input.memberRef) errors.push('consent_member_mismatch');
    if(consent.consentRef!==input.consentRef) errors.push('consent_ref_mismatch');
    if(consent.grantedBy!=='member'||consent.granted!==true) errors.push('consent_not_member_granted');
    if(consent.purpose!=='aether_reflection') errors.push('consent_purpose_invalid');
    if(consent.persistenceAllowed!==false) errors.push('consent_persistence_scope_too_broad');
    if(consent.deliveryAllowed!==false) errors.push('consent_delivery_scope_too_broad');
    if(consent.promptMutationAllowed!==false) errors.push('consent_prompt_mutation_scope_too_broad');
    if(consent.productionEscalationAllowed!==false) errors.push('consent_production_scope_too_broad');
  }

  if(!input.inputRef.trim()) errors.push('input_ref_required');
  if(!input.memberRef.trim()) errors.push('member_ref_required');
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
  if(input.deliveryAuthority) errors.push('delivery_authority_forbidden');
  if(input.promptMutationAuthority) errors.push('prompt_mutation_authority_forbidden');
  if(input.productionAuthority) errors.push('production_authority_forbidden');
  if(input.finalMeaningAuthority&&input.finalMeaningAuthority!=='member'){
    errors.push('final_meaning_must_remain_member_owned');
  }

  for(const [name,pattern] of AUTHORITY_LANGUAGE){
    if(pattern.test(input.observation)) errors.push(name);
  }

  if(errors.length>0){
    return {
      admitted:false,
      errors:[...new Set(errors)],
      shadow:null,
      persistenceAuthorized:false,
      memberFacingDeliveryAuthorized:false,
      maiaPromptMutationAuthorized:false,
      productionAuthority:false,
    };
  }

  return {
    admitted:true,
    errors:[],
    shadow:{
      inputRef:input.inputRef,
      memberRef:input.memberRef,
      source:input.source,
      domain:input.domain,
      observation:input.observation,
      temporalStanding:input.temporalStanding,
      confidence:input.confidence,
      consentRef:input.consentRef,
      readOnly:true,
      persisted:false,
      delivered:false,
      maiaPromptMutated:false,
      productionAuthority:false,
      identityAuthority:false,
      diagnosticAuthority:false,
      predictiveAuthority:false,
      destinyAuthority:false,
      soulRepresentationAuthority:false,
      finalMeaningAuthority:'member',
    },
    persistenceAuthorized:false,
    memberFacingDeliveryAuthorized:false,
    maiaPromptMutationAuthorized:false,
    productionAuthority:false,
  };
}
