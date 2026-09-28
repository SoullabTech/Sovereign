import { runConnectorProgrammeClosure } from '../connectorProgrammeClosure';

describe('AIN-AETHER-CONNECTOR-01R7 pre-execution closure',()=>{
  test('checks seven connector invariants',()=>{
    expect(runConnectorProgrammeClosure().invariants).toHaveLength(7);
  });

  test('all connector invariants pass together',()=>{
    const closure=runConnectorProgrammeClosure();
    expect(closure.allPass).toBe(true);
    expect(closure.contradictionRefs).toEqual([]);
  });

  test('R1-R3 capability, manifest, and query invariants remain intact',()=>{
    const closure=runConnectorProgrammeClosure();
    for(const ref of ['CONN-INV-01','CONN-INV-02','CONN-INV-03']){
      expect(closure.invariants.find(i=>i.invariantRef===ref)?.pass).toBe(true);
    }
  });

  test('R4-R6 review, token, and rehearsal invariants remain intact',()=>{
    const closure=runConnectorProgrammeClosure();
    for(const ref of ['CONN-INV-04','CONN-INV-05','CONN-INV-06']){
      expect(closure.invariants.find(i=>i.invariantRef===ref)?.pass).toBe(true);
    }
  });

  test('closure preserves zero-IO and no real-record-read capability',()=>{
    const closure=runConnectorProgrammeClosure();
    expect(closure.invariants.find(i=>i.invariantRef==='CONN-INV-07')?.pass).toBe(true);
    expect(closure.realRecordReadCapability).toBe(false);
    expect(closure.connectorExecutorImplemented).toBe(false);
    expect(closure.externalIoAuthorized).toBe(false);
    expect(closure.persistenceAuthorized).toBe(false);
    expect(closure.memberFacingDeliveryAuthorized).toBe(false);
    expect(closure.maiaPromptMutationAuthorized).toBe(false);
    expect(closure.productionAuthority).toBe(false);
  });

  test('closure standing is pre-execution connector scope only',()=>{
    expect(runConnectorProgrammeClosure().standing).toBe('closed_for_pre_execution_connector_scope');
  });
});
