import { runLiveAdapterFixtureClosure } from '../liveAdapterFixtureClosure';

describe('AIN-AETHER-LIVE-ADAPTER-01R6 fixture closure',()=>{
  test('checks six fixture live-adapter invariants',()=>{
    expect(runLiveAdapterFixtureClosure().invariants).toHaveLength(6);
  });

  test('all fixture live-adapter invariants pass together',()=>{
    const closure=runLiveAdapterFixtureClosure();
    expect(closure.allPass).toBe(true);
    expect(closure.contradictionRefs).toEqual([]);
  });

  test('R1-R3 consent and transaction invariants remain intact',()=>{
    const closure=runLiveAdapterFixtureClosure();
    for(const ref of ['LAINV-01','LAINV-02','LAINV-03']){
      expect(closure.invariants.find(i=>i.invariantRef===ref)?.pass).toBe(true);
    }
  });

  test('R4-R5 compatibility and replay invariants remain intact',()=>{
    const closure=runLiveAdapterFixtureClosure();
    for(const ref of ['LAINV-04','LAINV-05']){
      expect(closure.invariants.find(i=>i.invariantRef===ref)?.pass).toBe(true);
    }
  });

  test('closure preserves zero real-data and zero external effect',()=>{
    const closure=runLiveAdapterFixtureClosure();
    expect(closure.invariants.find(i=>i.invariantRef==='LAINV-06')?.pass).toBe(true);
    expect(closure.realConnectorAuthorized).toBe(false);
    expect(closure.realMemberDataRead).toBe(false);
    expect(closure.persistenceAuthorized).toBe(false);
    expect(closure.memberFacingDeliveryAuthorized).toBe(false);
    expect(closure.maiaPromptMutationAuthorized).toBe(false);
    expect(closure.networkSideEffect).toBe(false);
    expect(closure.productionAuthority).toBe(false);
  });

  test('closure standing is fixture-live-adapter-only',()=>{
    expect(runLiveAdapterFixtureClosure().standing).toBe('closed_for_fixture_live_adapter_scope');
  });
});
