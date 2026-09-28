import {
  adjudicateConnectorDryRun,
  createAetherConnectorDeclaration,
} from '../connectorContract';

const consent={
  consentRef:'consent:connector:r1',
  memberRef:'member:fixture',
  scope:'aether_read_once' as const,
  grantedBy:'member' as const,
  granted:true as const,
  purpose:'aether_reflection' as const,
  persistenceAllowed:false as const,
  deliveryAllowed:false as const,
  promptMutationAllowed:false as const,
  productionEscalationAllowed:false as const,
};

describe('AIN-AETHER-CONNECTOR-01R1 connector contract',()=>{
  test('declares readable source classes without implementing record reads',()=>{
    const connector=createAetherConnectorDeclaration('connector:r1',[
      'member_authored_text',
      'system_observed_event',
    ]);
    expect(connector.readCapabilityDeclared).toBe(true);
    expect(connector.recordReadImplemented).toBe(false);
    expect(connector.persistenceImplemented).toBe(false);
    expect(connector.deliveryImplemented).toBe(false);
    expect(connector.promptMutationImplemented).toBe(false);
    expect(connector.productionRouteImplemented).toBe(false);
  });

  test('valid dry-run checks declared capability and consent with zero record reads',()=>{
    const connector=createAetherConnectorDeclaration('connector:r1',[
      'member_authored_text',
      'system_observed_event',
    ]);
    const result=adjudicateConnectorDryRun(connector,consent,{
      dryRunRef:'dry:r1',
      memberRef:'member:fixture',
      consentRef:'consent:connector:r1',
      requestedSourceClasses:['member_authored_text'],
      executeRecordRead:false,
    });
    expect(result.allowed).toBe(true);
    expect(result.dryRunOnly).toBe(true);
    expect(result.recordReadExecuted).toBe(false);
    expect(result.recordCountRead).toBe(0);
  });

  test('refuses dry-run request that asks to execute a record read',()=>{
    const connector=createAetherConnectorDeclaration('connector:r1',[
      'member_authored_text',
    ]);
    const result=adjudicateConnectorDryRun(connector,consent,{
      dryRunRef:'dry:r1:read',
      memberRef:'member:fixture',
      consentRef:'consent:connector:r1',
      requestedSourceClasses:['member_authored_text'],
      executeRecordRead:true,
    });
    expect(result.allowed).toBe(false);
    expect(result.errors).toContain('record_read_execution_forbidden_in_r1');
    expect(result.recordReadExecuted).toBe(false);
    expect(result.recordCountRead).toBe(0);
  });

  test('refuses undeclared source class and missing consent',()=>{
    const connector=createAetherConnectorDeclaration('connector:r1',[
      'member_authored_text',
    ]);
    const result=adjudicateConnectorDryRun(connector,null,{
      dryRunRef:'dry:r1:bad',
      memberRef:'member:fixture',
      consentRef:'missing',
      requestedSourceClasses:['system_observed_event'],
      executeRecordRead:false,
    });
    expect(result.allowed).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      'connector_consent_required',
      'source_class_not_declared:system_observed_event',
    ]));
  });

  test('dry-run never grants side-effect authority',()=>{
    const connector=createAetherConnectorDeclaration('connector:r1',[
      'member_authored_text',
    ]);
    const result=adjudicateConnectorDryRun(connector,consent,{
      dryRunRef:'dry:r1:no-side-effect',
      memberRef:'member:fixture',
      consentRef:'consent:connector:r1',
      requestedSourceClasses:['member_authored_text'],
      executeRecordRead:false,
    });
    expect(result.persistenceAuthorized).toBe(false);
    expect(result.memberFacingDeliveryAuthorized).toBe(false);
    expect(result.maiaPromptMutationAuthorized).toBe(false);
    expect(result.productionAuthority).toBe(false);
  });
});
