export interface SyntheticSandboxRecord {
  recordRef:string;
  recordKind:'synthetic_aether_record';
  synthetic:true;
  sourceClass:'member_authored_text';
  payload:{ text:string };
  productionDataPresent:false;
  realMemberIdentifierPresent:false;
}

export interface SyntheticRecordAuthority {
  authorityRef:string;
  grantedBy:'human_operator';
  purpose:'synthetic_transport_validation';
  syntheticOnly:true;
  remoteRecordRequestAuthorized:false;
  persistenceAllowed:false;
  productionEscalationAllowed:false;
}

export interface SyntheticRecordRequestEnvelope {
  requestRef:string;
  endpointRef:string;
  environment:'sandbox';
  recordRef:string;
  synthetic:true;
  authorityRef:string;
  executeRemoteRequest:false;
  productionCredentialsIncluded:false;
}
export interface SyntheticRecordResponseShape {
  endpointRef:string;
  environment:'sandbox';
  record: SyntheticSandboxRecord;
  productionDataPresent:false;
  realMemberIdentifierPresent:false;
  persisted:false;
}

export interface SyntheticRecordValidationResult {
  valid:boolean;
  errors:string[];
  recordReadExecuted:false;
  remoteRequestExecuted:false;
  persistenceAuthorized:false;
  productionAuthority:false;
}

export function createSyntheticSandboxRecord(
  recordRef:string,
  text:string,
):SyntheticSandboxRecord{
  return {
    recordRef,
    recordKind:'synthetic_aether_record',
    synthetic:true,
    sourceClass:'member_authored_text',
    payload:{text},
    productionDataPresent:false,
    realMemberIdentifierPresent:false,
  };
}
export function validateSyntheticRecordExchange(
  authority:SyntheticRecordAuthority,
  request:SyntheticRecordRequestEnvelope,
  response:SyntheticRecordResponseShape,
):SyntheticRecordValidationResult{
  const errors:string[]=[];

  if(!authority.authorityRef.trim()) errors.push('authority_ref_required');
  if(authority.grantedBy!=='human_operator') errors.push('authority_grantor_invalid');
  if(authority.purpose!=='synthetic_transport_validation') errors.push('authority_purpose_invalid');
  if(authority.syntheticOnly!==true) errors.push('synthetic_only_authority_required');
  if(authority.remoteRecordRequestAuthorized!==false) errors.push('remote_record_request_authority_forbidden_in_r4');
  if(authority.persistenceAllowed!==false) errors.push('persistence_authority_forbidden_in_r4');
  if(authority.productionEscalationAllowed!==false) errors.push('production_authority_forbidden_in_r4');

  if(!request.requestRef.trim()) errors.push('request_ref_required');
  if(!request.endpointRef.trim()) errors.push('endpoint_ref_required');
  if(request.environment!=='sandbox') errors.push('request_environment_must_be_sandbox');
  if(request.synthetic!==true) errors.push('request_must_be_synthetic');
  if(request.authorityRef!==authority.authorityRef) errors.push('request_authority_mismatch');
  if(request.executeRemoteRequest!==false) errors.push('remote_record_request_forbidden_in_r4');
  if(request.productionCredentialsIncluded!==false) errors.push('production_credentials_forbidden');
  if(response.endpointRef!==request.endpointRef) errors.push('response_endpoint_mismatch');
  if(response.environment!=='sandbox') errors.push('response_environment_must_be_sandbox');
  if(response.record.recordRef!==request.recordRef) errors.push('response_record_ref_mismatch');
  if(response.record.synthetic!==true) errors.push('response_record_not_synthetic');
  if(response.record.productionDataPresent!==false) errors.push('record_production_data_forbidden');
  if(response.record.realMemberIdentifierPresent!==false) errors.push('record_real_member_identifier_forbidden');
  if(response.productionDataPresent!==false) errors.push('response_production_data_forbidden');
  if(response.realMemberIdentifierPresent!==false) errors.push('response_real_member_identifier_forbidden');
  if(response.persisted!==false) errors.push('response_persistence_forbidden');

  return {
    valid:errors.length===0,
    errors:Array.from(new Set(errors)),
    recordReadExecuted:false,
    remoteRequestExecuted:false,
    persistenceAuthorized:false,
    productionAuthority:false,
  };
}
