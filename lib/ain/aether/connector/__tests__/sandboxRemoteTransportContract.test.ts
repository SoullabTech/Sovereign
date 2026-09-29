import {
  validateSandboxTransportContract,
  type SandboxRemoteTransportContract,
} from '../sandboxRemoteTransportContract';

function contract():SandboxRemoteTransportContract{
  return {
    transportRef:'remote-transport:r1',
    endpoint:{
      endpointRef:'sandbox-endpoint:r1',
      environment:'sandbox',
      scheme:'https',
      host:'sandbox.example.internal',
      port:443,
      realMemberDataPresent:false,
      productionDataPresent:false,
    },
    allowedHosts:['sandbox.example.internal'],
    requestImplementationPresent:false,
    recordReadImplementationPresent:false,
    persistenceImplementationPresent:false,
    memberFacingDeliveryPresent:false,
    productionRoutePresent:false,
  };
}

describe('AIN-AETHER-REMOTE-TRANSPORT-01R1 sandbox contract',()=>{
  test('accepts exact sandbox endpoint identity and one-host egress allowlist',()=>{
    const result=validateSandboxTransportContract(contract());
    expect(result.valid).toBe(true);
    expect(result.endpointIdentityBound).toBe(true);
    expect(result.egressAllowlisted).toBe(true);
  });

  test('refuses any additional egress host',()=>{
    const c=contract();
    c.allowedHosts.push('other.example.internal');
    const result=validateSandboxTransportContract(c);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('egress_allowlist_must_match_exact_sandbox_host');
  });

  test('refuses endpoint identity without sandbox standing',()=>{
    const c=contract();
    (c.endpoint as any).environment='production';
    const result=validateSandboxTransportContract(c);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('endpoint_not_sandbox');
  });

  test('contract declares zero real-member and production-data reach',()=>{
    const result=validateSandboxTransportContract(contract());
    expect(result.realMemberDataReachable).toBe(false);
    expect(result.productionDataReachable).toBe(false);
  });

  test('R1 remains zero-request and zero-record-read',()=>{
    const result=validateSandboxTransportContract(contract());
    expect(result.remoteRequestExecuted).toBe(false);
    expect(result.recordReadExecuted).toBe(false);
    expect(result.recordCountRead).toBe(0);
  });
});
