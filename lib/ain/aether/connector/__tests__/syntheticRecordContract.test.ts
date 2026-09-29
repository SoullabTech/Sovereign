import {
  createSyntheticSandboxRecord,
  validateSyntheticRecordExchange,
  type SyntheticRecordAuthority,
  type SyntheticRecordRequestEnvelope,
  type SyntheticRecordResponseShape,
} from '../syntheticRecordContract';

const authority:SyntheticRecordAuthority={
  authorityRef:'authority:r4:synthetic',
  grantedBy:'human_operator',
  purpose:'synthetic_transport_validation',
  syntheticOnly:true,
  remoteRecordRequestAuthorized:false,
  persistenceAllowed:false,
  productionEscalationAllowed:false,
};

const record=createSyntheticSandboxRecord(
  'synthetic-record:r4:001',
  'Synthetic reflection fixture only.',
);

const request:SyntheticRecordRequestEnvelope={
  requestRef:'request:r4:001',
  endpointRef:'aether-sandbox-health-01',
  environment:'sandbox',
  recordRef:record.recordRef,
  synthetic:true,
  authorityRef:authority.authorityRef,
  executeRemoteRequest:false,
  productionCredentialsIncluded:false,
};
const response:SyntheticRecordResponseShape={
  endpointRef:request.endpointRef,
  environment:'sandbox',
  record,
  productionDataPresent:false,
  realMemberIdentifierPresent:false,
  persisted:false,
};

describe('AIN-AETHER-REMOTE-TRANSPORT-01R4 synthetic record-shape contract',()=>{
  test('creates an explicitly synthetic zero-production-data fixture',()=>{
    expect(record.synthetic).toBe(true);
    expect(record.productionDataPresent).toBe(false);
    expect(record.realMemberIdentifierPresent).toBe(false);
    expect(record.recordKind).toBe('synthetic_aether_record');
  });

  test('accepts the exact local synthetic exchange shape',()=>{
    const result=validateSyntheticRecordExchange(authority,request,response);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.recordReadExecuted).toBe(false);
    expect(result.remoteRequestExecuted).toBe(false);
    expect(result.persistenceAuthorized).toBe(false);
    expect(result.productionAuthority).toBe(false);
  });

  test('fails closed if remote record execution is requested',()=>{
    const result=validateSyntheticRecordExchange(authority,{
      ...request,
      executeRemoteRequest:true as false,
    },response);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('remote_record_request_forbidden_in_r4');
    expect(result.remoteRequestExecuted).toBe(false);
  });

  test('fails closed on production data or a real-member identifier',()=>{
    const contaminated={
      ...response,
      productionDataPresent:true as false,
      realMemberIdentifierPresent:true as false,
      record:{
        ...record,
        productionDataPresent:true as false,
        realMemberIdentifierPresent:true as false,
      },
    };
    const result=validateSyntheticRecordExchange(authority,request,contaminated);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      'record_production_data_forbidden',
      'record_real_member_identifier_forbidden',
      'response_production_data_forbidden',
      'response_real_member_identifier_forbidden',
    ]));
  });

  test('fails closed on authority mismatch, persistence, or endpoint mismatch',()=>{
    const result=validateSyntheticRecordExchange(authority,{
      ...request,
      authorityRef:'authority:other',
    },{
      ...response,
      endpointRef:'other-endpoint',
      persisted:true as false,
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      'request_authority_mismatch',
      'response_endpoint_mismatch',
      'response_persistence_forbidden',
    ]));
    expect(result.persistenceAuthorized).toBe(false);
    expect(result.productionAuthority).toBe(false);
  });
});
