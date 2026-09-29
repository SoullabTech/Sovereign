import type { SandboxRemoteTransportContract } from './sandboxRemoteTransportContract';
import { validateSandboxTransportContract } from './sandboxRemoteTransportContract';

export interface SandboxHandshakeRequest {
  method:'HEAD';
  scheme:'https';
  host:string;
  port:443;
  path:'/health';
  memberIdentifierIncluded:false;
  queryParametersIncluded:false;
  requestBodyIncluded:false;
  productionCredentialsIncluded:false;
}

export interface SandboxHandshakeResponse {
  status:200|204;
  endpointRef:string;
  environment:'sandbox';
  responseBodyBytes:0;
  memberRecordReturned:false;
  productionDataReturned:false;
}

export interface SandboxHandshakeClient {
  probe(request:SandboxHandshakeRequest):SandboxHandshakeResponse;
}

export interface SandboxHandshakeResult {
  completed:boolean;
  errors:string[];
  request:SandboxHandshakeRequest;
  response:SandboxHandshakeResponse|null;
  exactHostMatched:boolean;
  endpointIdentityMatched:boolean;
  memberIdentifierIncluded:false;
  recordReadExecuted:false;
  recordCountRead:0;
  responseBodyBytes:0;
  persistenceAuthorized:false;
  memberFacingDeliveryAuthorized:false;
  maiaPromptMutationAuthorized:false;
  productionAuthority:false;
}

export function buildSandboxHandshakeRequest(
  contract:SandboxRemoteTransportContract,
):SandboxHandshakeRequest{
  return {
    method:'HEAD',
    scheme:'https',
    host:contract.endpoint.host,
    port:443,
    path:'/health',
    memberIdentifierIncluded:false,
    queryParametersIncluded:false,
    requestBodyIncluded:false,
    productionCredentialsIncluded:false,
  };
}

export function performSandboxHandshake(
  contract:SandboxRemoteTransportContract,
  client:SandboxHandshakeClient,
):SandboxHandshakeResult{
  const errors:string[]=[];
  const validation=validateSandboxTransportContract(contract);
  if(!validation.valid){
    errors.push(...validation.errors.map(e=>'contract:'+e));
  }

  const request=buildSandboxHandshakeRequest(contract);

  if(request.host!==contract.endpoint.host) errors.push('handshake_host_mismatch');
  if(!contract.allowedHosts.includes(request.host)) errors.push('handshake_host_not_allowlisted');
  if(request.memberIdentifierIncluded!==false) errors.push('member_identifier_forbidden');
  if(request.queryParametersIncluded!==false) errors.push('query_parameters_forbidden');
  if(request.requestBodyIncluded!==false) errors.push('request_body_forbidden');
  if(request.productionCredentialsIncluded!==false) errors.push('production_credentials_forbidden');

  if(errors.length>0){
    return {
      completed:false,
      errors:[...new Set(errors)],
      request,
      response:null,
      exactHostMatched:false,
      endpointIdentityMatched:false,
      memberIdentifierIncluded:false,
      recordReadExecuted:false,
      recordCountRead:0,
      responseBodyBytes:0,
      persistenceAuthorized:false,
      memberFacingDeliveryAuthorized:false,
      maiaPromptMutationAuthorized:false,
      productionAuthority:false,
    };
  }

  const response=client.probe(request);

  if(response.environment!=='sandbox') errors.push('response_not_sandbox');
  if(response.endpointRef!==contract.endpoint.endpointRef) errors.push('endpoint_identity_mismatch');
  if(response.responseBodyBytes!==0) errors.push('handshake_body_forbidden');
  if(response.memberRecordReturned!==false) errors.push('member_record_return_forbidden');
  if(response.productionDataReturned!==false) errors.push('production_data_return_forbidden');

  return {
    completed:errors.length===0,
    errors:[...new Set(errors)],
    request,
    response,
    exactHostMatched:request.host===contract.endpoint.host,
    endpointIdentityMatched:response.endpointRef===contract.endpoint.endpointRef,
    memberIdentifierIncluded:false,
    recordReadExecuted:false,
    recordCountRead:0,
    responseBodyBytes:0,
    persistenceAuthorized:false,
    memberFacingDeliveryAuthorized:false,
    maiaPromptMutationAuthorized:false,
    productionAuthority:false,
  };
}
