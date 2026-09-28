import { runSyntheticRuntimeClosure } from '../runtimeProgrammeClosure';

describe('AIN-AETHER-RUNTIME-01R8 synthetic runtime closure',()=>{
  test('checks eight end-to-end membrane invariants',()=>{
    const closure=runSyntheticRuntimeClosure();
    expect(closure.invariants).toHaveLength(8);
  });

  test('all synthetic runtime invariants pass together',()=>{
    const closure=runSyntheticRuntimeClosure();
    expect(closure.allPass).toBe(true);
    expect(closure.contradictionRefs).toEqual([]);
  });

  test('R1-R4 constitutional, ingress, adaptation, and field invariants remain intact',()=>{
    const closure=runSyntheticRuntimeClosure();
    for(const ref of ['RINV-01','RINV-02','RINV-03','RINV-04']){
      expect(closure.invariants.find(i=>i.invariantRef===ref)?.pass).toBe(true);
    }
  });

  test('R5-R7 reflection, human-gate, and no-op delivery invariants remain intact',()=>{
    const closure=runSyntheticRuntimeClosure();
    for(const ref of ['RINV-05','RINV-06','RINV-07']){
      expect(closure.invariants.find(i=>i.invariantRef===ref)?.pass).toBe(true);
    }
  });

  test('closure preserves zero external effect across the entire lane',()=>{
    const closure=runSyntheticRuntimeClosure();
    expect(closure.invariants.find(i=>i.invariantRef==='RINV-08')?.pass).toBe(true);
    expect(closure.liveMemberDataAuthorized).toBe(false);
    expect(closure.persistenceAuthorized).toBe(false);
    expect(closure.memberFacingDeliveryAuthorized).toBe(false);
    expect(closure.deliveryExecuted).toBe(false);
    expect(closure.maiaPromptMutationAuthorized).toBe(false);
    expect(closure.networkSideEffect).toBe(false);
    expect(closure.productionAuthority).toBe(false);
  });

  test('closure standing is synthetic-runtime-only',()=>{
    const closure=runSyntheticRuntimeClosure();
    expect(closure.standing).toBe('closed_for_synthetic_runtime_scope');
  });
});
