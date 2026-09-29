import { adjudicateSandboxEndpointCustody } from '../sandboxEndpointCustody';

describe('AIN-AETHER-REMOTE-TRANSPORT-01R3 sandbox endpoint custody',()=>{
  test('fails closed when operator endpoint attestation is absent',()=>{
    const result=adjudicateSandboxEndpointCustody(null);
    expect(result.readyForFirstProbe).toBe(false);
    expect(result.errors).toContain('operator_sandbox_endpoint_attestation_required');
    expect(result.realNetworkProbeAuthorized).toBe(false);
    expect(result.realNetworkProbeExecuted).toBe(false);
  });

  test('accepts only explicit human sandbox attestation',()=>{
    const result=adjudicateSandboxEndpointCustody({
      attestationRef:'attestation:r3:test',
      operator:'human',
      endpointRef:'sandbox-endpoint:r3:test',
      host:'sandbox.example.internal',
      environment:'sandbox',
      realMemberDataPresent:false,
      productionDataPresent:false,
      productionCredentialsAccepted:false,
      healthPath:'/health',
      attested:true,
      note:'Dedicated isolated sandbox containing synthetic data only.',
    });
    expect(result.readyForFirstProbe).toBe(true);
    expect(result.sandboxStandingConfirmed).toBe(true);
    expect(result.zeroRealMemberDataConfirmed).toBe(true);
    expect(result.zeroProductionDataConfirmed).toBe(true);
    expect(result.productionCredentialsRejected).toBe(true);
    expect(result.realNetworkProbeAuthorized).toBe(false);
    expect(result.realNetworkProbeExecuted).toBe(false);
  });

  test('refuses production or real-member-data attestation',()=>{
    const base={
      attestationRef:'attestation:r3:bad',
      operator:'human' as const,
      endpointRef:'endpoint:r3:bad',
      host:'bad.example.internal',
      environment:'sandbox' as const,
      realMemberDataPresent:false as const,
      productionDataPresent:false as const,
      productionCredentialsAccepted:false as const,
      healthPath:'/health' as const,
      attested:true as const,
      note:'bad fixture',
    };

    const realData=adjudicateSandboxEndpointCustody({
      ...base,
      realMemberDataPresent:true as false,
    });
    expect(realData.readyForFirstProbe).toBe(false);
    expect(realData.errors).toContain('real_member_data_present_forbidden');

    const prod=adjudicateSandboxEndpointCustody({
      ...base,
      productionDataPresent:true as false,
    });
    expect(prod.readyForFirstProbe).toBe(false);
    expect(prod.errors).toContain('production_data_present_forbidden');
  });

  test('custody readiness is not network authorization',()=>{
    const result=adjudicateSandboxEndpointCustody({
      attestationRef:'attestation:r3:ready',
      operator:'human',
      endpointRef:'sandbox-endpoint:r3:ready',
      host:'sandbox.example.internal',
      environment:'sandbox',
      realMemberDataPresent:false,
      productionDataPresent:false,
      productionCredentialsAccepted:false,
      healthPath:'/health',
      attested:true,
      note:'Ready for separate probe authorization.',
    });
    expect(result.readyForFirstProbe).toBe(true);
    expect(result.realNetworkProbeAuthorized).toBe(false);
    expect(result.realNetworkProbeExecuted).toBe(false);
  });
});
