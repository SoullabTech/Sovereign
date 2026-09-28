import { runTemporalProgrammeClosure } from '../temporalProgrammeClosure';

describe('AIN-AETHER-01R22 temporal programme closure',()=>{
  test('checks seven cross-layer temporal invariants',()=>{
    const closure=runTemporalProgrammeClosure();
    expect(closure.invariants).toHaveLength(7);
  });

  test('all R16-R21 invariants pass together',()=>{
    const closure=runTemporalProgrammeClosure();
    expect(closure.allPass).toBe(true);
    expect(closure.contradictionRefs).toEqual([]);
  });

  test('closure preserves no-false-precision and no-midpoint laws',()=>{
    const closure=runTemporalProgrammeClosure();
    expect(closure.invariants.find(i=>i.invariantRef==='TINV-01')?.pass).toBe(true);
    expect(closure.invariants.find(i=>i.invariantRef==='TINV-02')?.pass).toBe(true);
  });

  test('closure preserves conflict and question-specific authority together',()=>{
    const closure=runTemporalProgrammeClosure();
    expect(closure.invariants.find(i=>i.invariantRef==='TINV-03')?.pass).toBe(true);
    expect(closure.invariants.find(i=>i.invariantRef==='TINV-04')?.pass).toBe(true);
  });

  test('closure preserves clarification, natural dialogue, and blind falsification',()=>{
    const closure=runTemporalProgrammeClosure();
    expect(closure.invariants.find(i=>i.invariantRef==='TINV-05')?.pass).toBe(true);
    expect(closure.invariants.find(i=>i.invariantRef==='TINV-06')?.pass).toBe(true);
    expect(closure.invariants.find(i=>i.invariantRef==='TINV-07')?.pass).toBe(true);
  });

  test('closure grants no runtime authority',()=>{
    const closure=runTemporalProgrammeClosure();
    expect(closure.temporalProgrammeStanding).toBe('closed_for_benchmark_scope');
    expect(closure.runtimeAuthority).toBe(false);
  });
});
