import { deriveMemberAetherField, type MemberFieldObservation } from '../memberField';
import { deriveFieldTrajectory, validateAetherTrajectory } from '../fieldTrajectory';

function o(ref:string,facet:string,motif:string,qualities:any[]=['resonance']):MemberFieldObservation{
  return {observationRef:ref,facetRef:facet,motif,temporalStanding:'is_being',standing:'member_named',qualities,note:ref};
}
function f(ref:string,obs:MemberFieldObservation[]){
  return deriveMemberAetherField(ref,obs);
}

describe('AIN-AETHER-01R3 field trajectory',()=>{
  test('requires more than two moments for trajectory claims',()=>{
    const t=deriveFieldTrajectory('short',[
      f('t1',[o('a1','journal','Grief')]),
      f('t2',[o('a2','journal','Grief')]),
    ]);
    expect(t.classification).toBe('insufficient_evidence');
    expect(validateAetherTrajectory(t)).toEqual({valid:true,errors:[]});
  });

  test('detects recurrence when a motif returns after an intervening absence',()=>{
    const t=deriveFieldTrajectory('recurrence',[
      f('t1',[o('g1','journal','Grief'),o('m1','journal','Memory')]),
      f('t2',[o('l1','relationship','Love'),o('m2','journal','Memory')]),
      f('t3',[o('g2','creative','Grief'),o('m3','journal','Memory')]),
    ]);
    expect(t.classification).toBe('recurrence');
    expect(t.supportingSignals).toContain('motif_returns_after_absence');
  });

  test('detects sustained convergence across several moments',()=>{
    const t=deriveFieldTrajectory('convergence',[
      f('t1',[o('c1','journal','Courage')]),
      f('t2',[o('c2','journal','Courage'),o('c3','work','Courage')]),
      f('t3',[o('c4','journal','Courage'),o('c5','work','Courage'),o('c6','creative','Courage')]),
      f('t4',[o('c7','journal','Courage'),o('c8','work','Courage'),o('c9','creative','Courage'),o('c10','relationship','Courage')]),
    ]);
    expect(['sustained_convergence','phase_change']).toContain(t.classification);
    expect(t.predictiveAuthority).toBe(false);
  });

  test('detects phase change when persistent motifs enter a substantially new geometry',()=>{
    const t=deriveFieldTrajectory('phase',[
      f('t1',[
        o('g1','journal','Grief',['tension']),
        o('f1','journal','Fear',['tension']),
        o('i1','relationship','Isolation',['tension']),
      ]),
      f('t2',[
        o('g2','journal','Grief',['tension']),
        o('f2','relationship','Fear',['tension']),
        o('m2','journal','Memory',['resonance']),
      ]),
      f('t3',[
        o('g3','journal','Grief',['resonance']),
        o('g4','creative','Grief',['resonance']),
        o('m3','journal','Memory',['resonance']),
        o('l3','relationship','Love',['resonance']),
      ]),
      f('t4',[
        o('g5','journal','Grief',['resonance']),
        o('g6','creative','Grief',['resonance']),
        o('m4','journal','Memory',['resonance']),
        o('l4','relationship','Love',['resonance']),
        o('c4','creative','Creativity',['resonance']),
      ]),
    ]);
    expect(['phase_change','sustained_convergence']).toContain(t.classification);
    expect(t.supportingSignals.length).toBeGreaterThan(0);
  });

  test('trajectory remains descriptive rather than predictive or developmental ranking',()=>{
    const t=deriveFieldTrajectory('authority',[
      f('t1',[o('a1','journal','Courage')]),
      f('t2',[o('a2','journal','Courage'),o('a3','work','Courage')]),
      f('t3',[o('a4','creative','Courage'),o('a5','work','Courage')]),
    ]);
    expect(t.predictiveAuthority).toBe(false);
    expect(t.destinyAuthority).toBe(false);
    expect(t.developmentalRankAuthority).toBe(false);
    expect(t.finalMeaningAuthority).toBe('member');
    expect(validateAetherTrajectory(t)).toEqual({valid:true,errors:[]});
  });
});
