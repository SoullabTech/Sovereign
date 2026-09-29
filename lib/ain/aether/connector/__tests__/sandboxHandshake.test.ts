import type { SandboxRemoteTransportContract } from '../sandboxRemoteTransportContract';
import {
  buildSandboxHandshakeRequest,
  performSandboxHandshake,
  type SandboxHandshakeClient,
} from '../sandboxHandshake';

function contract():SandboxRemoteTransportContract{
  return {
    transportRef:'remote-transport:r2',
    endpoint:{
      endpointRef:'sandbox-endpoint:r2',
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

const client:SandboxHandshakeClient={
  probe(request){
    expect(request.method).toBe('HEAD');
    expect(request.path).toBe('/health');
    expect(request.memberIdentifierIncluded).toBe(false);
    expect(request.queryParametersIncluded).toBe(false);
    expect(request.requestBodyIncluded).toBe(false);
    expect(request.productionCredentialsIncluded).toBe(false);
    return {
      status:204,
      endpointRef:'sandbox-endpoint:r2',
      environment:'sandbox',
      responseBodyBytes:0,
      memberRecordReturned:false,
      productionDataReturned:false,
    };
  },
};

describe('AIN-AETHER-REMOTE-TRANSPORT-01R2 sandbox handshake',()=>{
  test('builds exact zero-record HEAD health request',()=>{
    const request=buildSandboxHandshakeRequest(contract());
    expect(request).toEqual({
      method:'HEAD',
      scheme:'https',
      host:'sandbox.example.internal',
      port:443,
      path:'/health',
      memberIdentifierIncluded:false,
      queryParametersIncluded:false,
      requestBodyIncluded:false,
      productionCredentialsIncluded:false,
    });
  });

  test('completes exact sandbox identity handshake through injected client',()=>{
    const result=performSandboxHandshake(contract(),client);
    expect(result.completed).toBe(true);
    expect(result.exactHostMatched).toBe(true);
    expect(result.endpointIdentityMatched).toBe(true);
    expect(result.recordReadExecuted).toBe(false);
    expect(result.recordCountRead).toBe(0);
    expect(result.responseBodyBytes).toBe(0);
  });

  test('refuses endpoint identity mismatch',()=>{
    const bad:SandboxHandshakeClient={
      probe(){
        return {
          status:204,
          endpointRef:'sandbox-endpoint:other',
          environment:'sandbox',
          responseBodyBytes:0,
          memberRecordReturned:false,
          productionDataReturned:false,
        };
      },
    };
    const result=performSandboxHandshake(contract(),bad);
    expect(result.completed).toBe(false);
    expect(result.errors).toContain('endpoint_identity_mismatch');
  });

  test('refuses body or member record returned by handshake',()=>{
    const bad:SandboxHandshakeClient={
      probe(){
        return {
          status:200,
          endpointRef:'sandbox-endpoint:r2',
          environment:'sandbox',
          responseBodyBytes:4 as 0,
          memberRecordReturned:true as false,
          productionDataReturned:false,
        };
      },
    };
    const result=performSandboxHandshake(contract(),bad);
    expect(result.completed).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      'handshake_body_forbidden',
      'member_record_return_forbidden',
    ]));
  });

  test('handshake grants no downstream authority',()=>{
    const result=performSandboxHandshake(contract(),client);
    expect(result.persistenceAuthorized).toBe(false);
    expect(result.memberFacingDeliveryAuthorized).toBe(false);
    expect(result.maiaPromptMutationAuthorized).toBe(false);
    expect(result.productionAuthority).toBe(false);
  });
});
