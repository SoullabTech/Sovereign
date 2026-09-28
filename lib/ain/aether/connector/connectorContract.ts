import type { LiveAetherConsentGrant } from '../live/liveInputContract';

export type AetherConnectorSourceClass=
  | 'member_authored_text'
  | 'member_confirmed_import'
  | 'system_observed_event';

export interface AetherConnectorDeclaration {
  connectorRef:string;
  connectorKind:'real_source_connector';
  sourceClasses:AetherConnectorSourceClass[];
  readCapabilityDeclared:true;
  recordReadImplemented:false;
  persistenceImplemented:false;
  deliveryImplemented:false;
  promptMutationImplemented:false;
  productionRouteImplemented:false;
}

export interface AetherConnectorDryRunRequest {
  dryRunRef:string;
  memberRef:string;
  consentRef:string;
  requestedSourceClasses:AetherConnectorSourceClass[];
  executeRecordRead:boolean;
}

export interface AetherConnectorDryRunResult {
  allowed:boolean;
  errors:string[];
  connectorRef:string;
  consentRef:string;
  declaredSourceClasses:AetherConnectorSourceClass[];
  requestedSourceClasses:AetherConnectorSourceClass[];
  dryRunOnly:true;
  recordReadExecuted:false;
  recordCountRead:0;
  persistenceAuthorized:false;
  memberFacingDeliveryAuthorized:false;
  maiaPromptMutationAuthorized:false;
  productionAuthority:false;
}

export function createAetherConnectorDeclaration(
  connectorRef:string,
  sourceClasses:AetherConnectorSourceClass[],
):AetherConnectorDeclaration{
  return {
    connectorRef,
    connectorKind:'real_source_connector',
    sourceClasses:[...new Set(sourceClasses)],
    readCapabilityDeclared:true,
    recordReadImplemented:false,
    persistenceImplemented:false,
    deliveryImplemented:false,
    promptMutationImplemented:false,
    productionRouteImplemented:false,
  };
}

export function adjudicateConnectorDryRun(
  connector:AetherConnectorDeclaration,
  consent:LiveAetherConsentGrant|null,
  request:AetherConnectorDryRunRequest,
):AetherConnectorDryRunResult{
  const errors:string[]=[];

  if(!connector.connectorRef.trim()) errors.push('connector_ref_required');
  if(connector.connectorKind!=='real_source_connector') errors.push('connector_kind_invalid');
  if(connector.readCapabilityDeclared!==true) errors.push('read_capability_not_declared');
  if(connector.recordReadImplemented!==false) errors.push('record_read_implementation_forbidden_in_r1');
  if(connector.persistenceImplemented!==false) errors.push('persistence_implementation_forbidden_in_r1');
  if(connector.deliveryImplemented!==false) errors.push('delivery_implementation_forbidden_in_r1');
  if(connector.promptMutationImplemented!==false) errors.push('prompt_mutation_implementation_forbidden_in_r1');
  if(connector.productionRouteImplemented!==false) errors.push('production_route_implementation_forbidden_in_r1');

  if(!consent){
    errors.push('connector_consent_required');
  } else {
    if(consent.memberRef!==request.memberRef) errors.push('consent_member_mismatch');
    if(consent.consentRef!==request.consentRef) errors.push('consent_ref_mismatch');
    if(consent.purpose!=='aether_reflection') errors.push('consent_purpose_invalid');
    if(consent.persistenceAllowed!==false) errors.push('consent_persistence_scope_too_broad');
    if(consent.deliveryAllowed!==false) errors.push('consent_delivery_scope_too_broad');
    if(consent.promptMutationAllowed!==false) errors.push('consent_prompt_mutation_scope_too_broad');
    if(consent.productionEscalationAllowed!==false) errors.push('consent_production_scope_too_broad');
  }

  if(request.executeRecordRead!==false){
    errors.push('record_read_execution_forbidden_in_r1');
  }

  for(const sourceClass of request.requestedSourceClasses){
    if(!connector.sourceClasses.includes(sourceClass)){
      errors.push('source_class_not_declared:'+sourceClass);
    }
  }

  return {
    allowed:errors.length===0,
    errors:[...new Set(errors)],
    connectorRef:connector.connectorRef,
    consentRef:request.consentRef,
    declaredSourceClasses:[...connector.sourceClasses],
    requestedSourceClasses:[...request.requestedSourceClasses],
    dryRunOnly:true,
    recordReadExecuted:false,
    recordCountRead:0,
    persistenceAuthorized:false,
    memberFacingDeliveryAuthorized:false,
    maiaPromptMutationAuthorized:false,
    productionAuthority:false,
  };
}
