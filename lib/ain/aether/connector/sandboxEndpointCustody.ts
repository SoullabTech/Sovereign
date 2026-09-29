export interface OperatorSandboxEndpointAttestation {
  attestationRef:string;
  operator:'human';
  endpointRef:string;
  host:string;
  environment:'sandbox';
  realMemberDataPresent:false;
  productionDataPresent:false;
  productionCredentialsAccepted:false;
  healthPath:'/health';
  attested:true;
  note:string;
}

export interface SandboxEndpointCustodyResult {
  readyForFirstProbe:boolean;
  errors:string[];
  endpointRef:string|null;
  host:string|null;
  healthPath:'/health'|null;
  sandboxStandingConfirmed:boolean;
  zeroRealMemberDataConfirmed:boolean;
  zeroProductionDataConfirmed:boolean;
  productionCredentialsRejected:boolean;
  realNetworkProbeAuthorized:false;
  realNetworkProbeExecuted:false;
}

export function adjudicateSandboxEndpointCustody(
  attestation:OperatorSandboxEndpointAttestation|null,
):SandboxEndpointCustodyResult{
  const errors:string[]=[];

  if(!attestation){
    errors.push('operator_sandbox_endpoint_attestation_required');
    return {
      readyForFirstProbe:false,
      errors,
      endpointRef:null,
      host:null,
      healthPath:null,
      sandboxStandingConfirmed:false,
      zeroRealMemberDataConfirmed:false,
      zeroProductionDataConfirmed:false,
      productionCredentialsRejected:false,
      realNetworkProbeAuthorized:false,
      realNetworkProbeExecuted:false,
    };
  }

  if(attestation.operator!=='human') errors.push('attestation_operator_not_human');
  if(!attestation.attestationRef.trim()) errors.push('attestation_ref_required');
  if(!attestation.endpointRef.trim()) errors.push('endpoint_ref_required');
  if(!attestation.host.trim()) errors.push('sandbox_host_required');
  if(attestation.environment!=='sandbox') errors.push('endpoint_not_attested_sandbox');
  if(attestation.realMemberDataPresent!==false) errors.push('real_member_data_present_forbidden');
  if(attestation.productionDataPresent!==false) errors.push('production_data_present_forbidden');
  if(attestation.productionCredentialsAccepted!==false){
    errors.push('production_credentials_acceptance_forbidden');
  }
  if(attestation.healthPath!=='/health') errors.push('health_path_must_be_exact');
  if(attestation.attested!==true) errors.push('operator_attestation_not_granted');
  if(!attestation.note.trim()) errors.push('attestation_note_required');

  return {
    readyForFirstProbe:errors.length===0,
    errors:[...new Set(errors)],
    endpointRef:attestation.endpointRef,
    host:attestation.host,
    healthPath:'/health',
    sandboxStandingConfirmed:attestation.environment==='sandbox',
    zeroRealMemberDataConfirmed:attestation.realMemberDataPresent===false,
    zeroProductionDataConfirmed:attestation.productionDataPresent===false,
    productionCredentialsRejected:attestation.productionCredentialsAccepted===false,
    realNetworkProbeAuthorized:false,
    realNetworkProbeExecuted:false,
  };
}
