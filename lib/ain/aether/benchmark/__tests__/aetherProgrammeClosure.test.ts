import { runAetherProgrammeClosure } from '../aetherProgrammeClosure';

describe('AIN-AETHER-01R23 integrated programme closure',()=>{
  test('checks thirteen constitutional invariants',()=>{
    const closure=runAetherProgrammeClosure();
    expect(closure.invariants).toHaveLength(13);
  });

  test('all constitutional invariants pass together',()=>{
    const closure=runAetherProgrammeClosure();
    expect(closure.allPass).toBe(true);
    expect(closure.contradictionRefs).toEqual([]);
  });

  test('field, gestalt, correction, dialogue, and semantic fidelity remain coherent',()=>{
    const closure=runAetherProgrammeClosure();
    for(const ref of ['AINV-01','AINV-02','AINV-03','AINV-04','AINV-05','AINV-06']){
      expect(closure.invariants.find(i=>i.invariantRef===ref)?.pass).toBe(true);
    }
  });

  test('human review, repair, lineage, and memory remain append-only and non-reconstructive',()=>{
    const closure=runAetherProgrammeClosure();
    for(const ref of ['AINV-07','AINV-08','AINV-09','AINV-10']){
      expect(closure.invariants.find(i=>i.invariantRef===ref)?.pass).toBe(true);
    }
  });

  test('temporal plurality and temporal closure remain subordinate to constitutional law',()=>{
    const closure=runAetherProgrammeClosure();
    expect(closure.invariants.find(i=>i.invariantRef==='AINV-11')?.pass).toBe(true);
    expect(closure.invariants.find(i=>i.invariantRef==='AINV-12')?.pass).toBe(true);
  });

  test('programme closure grants no runtime, person-definition, or Soul-representation authority',()=>{
    const closure=runAetherProgrammeClosure();
    expect(closure.programmeStanding).toBe('closed_for_benchmark_scope');
    expect(closure.runtimeAuthority).toBe(false);
    expect(closure.personDefinitionAuthority).toBe(false);
    expect(closure.soulRepresentationAuthority).toBe(false);
    expect(closure.finalMeaningAuthority).toBe('member');
    expect(closure.invariants.find(i=>i.invariantRef==='AINV-13')?.pass).toBe(true);
  });
});
