import { intakeOperatorSandboxEndpoint } from '../sandboxEndpointIntake';

describe('AIN-AETHER-REMOTE-TRANSPORT-01R3 endpoint intake',()=>{
  test('accepts explicit remote HTTPS sandbox endpoint with zero-real-data attestation',()=>{
    const result=intakeOperatorSandboxEndpoint({
      endpointRef:'sandbox:r3',
      url:'https://sandbox.example.internal',
      realMemberDataPresent:false,
      productionDataPresent:false,
      productionCredentialsAccepted:false,
      note:'Dedicated isolated sandbox with synthetic data only.',
    });
    expect(result.accepted).toBe(true);
    expect(result.attestation?.host).toBe('sandbox.example.internal');
    expect(result.attestation?.healthPath).toBe('/health');
  });

  test('refuses localhost and loopback endpoints',()=>{
    for(const url of [
      'https://localhost',
      'https://127.0.0.1',
    ]){
      const result=intakeOperatorSandboxEndpoint({
        endpointRef:'sandbox:local',
        url,
        realMemberDataPresent:false,
        productionDataPresent:false,
        productionCredentialsAccepted:false,
        note:'local',
      });
      expect(result.accepted).toBe(false);
      expect(result.errors).toContain('sandbox_host_forbidden');
    }
  });

  test('refuses production and shared staging hosts',()=>{
    for(const url of [
      'https://soullab.life',
      'https://staging.soullab.life',
    ]){
      const result=intakeOperatorSandboxEndpoint({
        endpointRef:'sandbox:forbidden',
        url,
        realMemberDataPresent:false,
        productionDataPresent:false,
        productionCredentialsAccepted:false,
        note:'forbidden',
      });
      expect(result.accepted).toBe(false);
      expect(result.errors).toContain('sandbox_host_forbidden');
    }
  });

  test('refuses any real-member or production-data standing',()=>{
    const real=intakeOperatorSandboxEndpoint({
      endpointRef:'sandbox:bad',
      url:'https://sandbox.example.internal',
      realMemberDataPresent:true,
      productionDataPresent:false,
      productionCredentialsAccepted:false,
      note:'bad',
    });
    expect(real.accepted).toBe(false);
    expect(real.errors).toContain('real_member_data_present_forbidden');

    const prod=intakeOperatorSandboxEndpoint({
      endpointRef:'sandbox:bad',
      url:'https://sandbox.example.internal',
      realMemberDataPresent:false,
      productionDataPresent:true,
      productionCredentialsAccepted:false,
      note:'bad',
    });
    expect(prod.accepted).toBe(false);
    expect(prod.errors).toContain('production_data_present_forbidden');
  });

  test('refuses non-HTTPS, non-443, path, query, or fragment',()=>{
    const cases=[
      'http://sandbox.example.internal',
      'https://sandbox.example.internal:8443',
      'https://sandbox.example.internal/foo',
      'https://sandbox.example.internal?x=1',
      'https://sandbox.example.internal#x',
    ];
    for(const url of cases){
      expect(intakeOperatorSandboxEndpoint({
        endpointRef:'sandbox:shape',
        url,
        realMemberDataPresent:false,
        productionDataPresent:false,
        productionCredentialsAccepted:false,
        note:'shape',
      }).accepted).toBe(false);
    }
  });
});
