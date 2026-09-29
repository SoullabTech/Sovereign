import type { SandboxEndpointIdentity } from './sandboxEndpointIdentity';

export interface SandboxRemoteTransportContract {
  transportRef:string;
  endpoint:SandboxEndpointIdentity;
  allowedHosts:string[];
  requestImplementationPresent:false;
  recordReadImplementationPresent:false;
  persistenceImplementationPresent:false;
  memberFacingDeliveryPresent:false;
  productionRoutePresent:false;
}

export interface SandboxTransportValidation {
  valid:boolean;
  errors:string[];
  endpointIdentityBound:boolean;
  egressAllowlisted:boolean;
  realMemberDataReachable:false;
  productionDataReachable:false;
  remoteRequestExecuted:false;
  recordReadExecuted:false;
  recordCountRead:0;
}

export function validateSandboxTransportContract(
  contract:SandboxRemoteTransportContract,
):SandboxTransportValidation{
  const errors:string[]=[];

  if(!contract.transportRef.trim()) errors.push('transport_ref_required');
  if(contract.endpoint.environment!=='sandbox') errors.push('endpoint_not_sandbox');
  if(contract.endpoint.scheme!=='https') errors.push('endpoint_https_required');
  if(contract.endpoint.port!==443) errors.push('endpoint_port_invalid');
  if(contract.endpoint.realMemberDataPresent!==false) errors.push('real_member_data_forbidden');
  if(contract.endpoint.productionDataPresent!==false) errors.push('production_data_forbidden');

  const endpointIdentityBound=
    contract.endpoint.endpointRef.trim().length>0 &&
    contract.endpoint.host.trim().length>0;

  if(!endpointIdentityBound) errors.push('endpoint_identity_required');

  const egressAllowlisted=
    contract.allowedHosts.length===1 &&
    contract.allowedHosts[0]===contract.endpoint.host;

  if(!egressAllowlisted) errors.push('egress_allowlist_must_match_exact_sandbox_host');
  if(contract.requestImplementationPresent!==false) errors.push('remote_request_implementation_forbidden_in_r1');
  if(contract.recordReadImplementationPresent!==false) errors.push('record_reader_forbidden_in_r1');
  if(contract.persistenceImplementationPresent!==false) errors.push('persistence_forbidden_in_r1');
  if(contract.memberFacingDeliveryPresent!==false) errors.push('delivery_forbidden_in_r1');
  if(contract.productionRoutePresent!==false) errors.push('production_route_forbidden_in_r1');

  return {
    valid:errors.length===0,
    errors:[...new Set(errors)],
    endpointIdentityBound,
    egressAllowlisted,
    realMemberDataReachable:false,
    productionDataReachable:false,
    remoteRequestExecuted:false,
    recordReadExecuted:false,
    recordCountRead:0,
  };
}
