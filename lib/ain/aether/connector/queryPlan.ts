import type { LiveAetherConsentGrant } from '../live/liveInputContract';
import type { AetherConnectorDeclaration, AetherConnectorSourceClass } from './connectorContract';
import type { AetherConnectorSourceManifest } from './sourceManifest';
import { adjudicateSourceFieldDryRun } from './sourceManifest';

export interface AetherConnectorQueryPlan {
  queryRef:string;
  connectorRef:string;
  manifestRef:string;
  memberRef:string;
  consentRef:string;
  sourceClass:AetherConnectorSourceClass;
  fields:string[];
  startTime:string;
  endTime:string;
  maxRecords:number;
  wildcard:false;
  paginationAllowed:false;
  execute:false;
}

export interface QueryPlanAdjudication {
  allowed:boolean;
  errors:string[];
  plan:AetherConnectorQueryPlan|null;
  zeroExecution:true;
  recordReadExecuted:false;
  recordCountRead:0;
  persistenceAuthorized:false;
  memberFacingDeliveryAuthorized:false;
  maiaPromptMutationAuthorized:false;
  productionAuthority:false;
}

function parseTime(value:string){
  const t=Date.parse(value);
  return Number.isNaN(t)?null:t;
}

export function adjudicateQueryPlan(
  connector:AetherConnectorDeclaration,
  manifest:AetherConnectorSourceManifest,
  consent:LiveAetherConsentGrant|null,
  plan:AetherConnectorQueryPlan,
):QueryPlanAdjudication{
  const errors:string[]=[];

  if(plan.connectorRef!==connector.connectorRef) errors.push('connector_ref_mismatch');
  if(plan.manifestRef!==manifest.manifestRef) errors.push('manifest_ref_mismatch');
  if(!connector.sourceClasses.includes(plan.sourceClass)){
    errors.push('source_class_not_declared:'+plan.sourceClass);
  }
  if(plan.wildcard!==false) errors.push('wildcard_forbidden');
  if(plan.paginationAllowed!==false) errors.push('pagination_forbidden_in_r3');
  if(plan.execute!==false) errors.push('query_execution_forbidden_in_r3');

  if(!Number.isInteger(plan.maxRecords)||plan.maxRecords<1){
    errors.push('max_records_invalid');
  }
  if(plan.maxRecords>100){
    errors.push('max_records_exceeds_r3_ceiling');
  }

  const start=parseTime(plan.startTime);
  const end=parseTime(plan.endTime);
  if(start===null) errors.push('invalid_start_time');
  if(end===null) errors.push('invalid_end_time');
  if(start!==null&&end!==null&&start>=end){
    errors.push('time_window_invalid');
  }

  if(!consent){
    errors.push('connector_consent_required');
  } else {
    if(consent.memberRef!==plan.memberRef) errors.push('consent_member_mismatch');
    if(consent.consentRef!==plan.consentRef) errors.push('consent_ref_mismatch');
    if(consent.purpose!=='aether_reflection') errors.push('consent_purpose_invalid');
    if(consent.persistenceAllowed!==false) errors.push('consent_persistence_scope_too_broad');
    if(consent.deliveryAllowed!==false) errors.push('consent_delivery_scope_too_broad');
    if(consent.promptMutationAllowed!==false) errors.push('consent_prompt_mutation_scope_too_broad');
    if(consent.productionEscalationAllowed!==false) errors.push('consent_production_scope_too_broad');
  }

  const fieldCheck=adjudicateSourceFieldDryRun(manifest,{
    manifestRef:plan.manifestRef,
    sourceClass:plan.sourceClass,
    requestedFields:plan.fields,
  });
  if(!fieldCheck.allowed){
    errors.push(...fieldCheck.errors.map(e=>'field_manifest:'+e));
  }

  return {
    allowed:errors.length===0,
    errors:[...new Set(errors)],
    plan:errors.length===0?{
      ...plan,
      fields:[...plan.fields],
      wildcard:false,
      paginationAllowed:false,
      execute:false,
    }:null,
    zeroExecution:true,
    recordReadExecuted:false,
    recordCountRead:0,
    persistenceAuthorized:false,
    memberFacingDeliveryAuthorized:false,
    maiaPromptMutationAuthorized:false,
    productionAuthority:false,
  };
}
