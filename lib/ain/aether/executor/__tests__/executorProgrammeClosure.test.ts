import { runExecutorProgrammeClosure } from '../executorProgrammeClosure';

describe('AIN-AETHER-EXECUTOR-01R4 isolated executor closure',()=>{
  test('checks four executor invariants',()=>{
    expect(runExecutorProgrammeClosure().invariants).toHaveLength(4);
  });

  test('all isolated executor invariants pass together',()=>{
    const closure=runExecutorProgrammeClosure();
    expect(closure.allPass).toBe(true);
    expect(closure.contradictionRefs).toEqual([]);
  });

  test('R1 and R2 read/admission invariants remain intact',()=>{
    const closure=runExecutorProgrammeClosure();
    for(const ref of ['EXEC-INV-01','EXEC-INV-02']){
      expect(closure.invariants.find(i=>i.invariantRef===ref)?.pass).toBe(true);
    }
  });

  test('R3 runtime replay invariant remains intact',()=>{
    const closure=runExecutorProgrammeClosure();
    expect(closure.invariants.find(i=>i.invariantRef==='EXEC-INV-03')?.pass).toBe(true);
  });

  test('closure preserves production isolation end to end',()=>{
    const closure=runExecutorProgrammeClosure();
    expect(closure.invariants.find(i=>i.invariantRef==='EXEC-INV-04')?.pass).toBe(true);
    expect(closure.productionReachable).toBe(false);
    expect(closure.externalNetworkCall).toBe(false);
    expect(closure.persistenceAuthorized).toBe(false);
    expect(closure.memberFacingDeliveryAuthorized).toBe(false);
    expect(closure.maiaPromptMutationAuthorized).toBe(false);
    expect(closure.productionAuthority).toBe(false);
  });

  test('closure standing is isolated-executor scope only',()=>{
    expect(runExecutorProgrammeClosure().standing).toBe('closed_for_isolated_executor_scope');
  });
});
