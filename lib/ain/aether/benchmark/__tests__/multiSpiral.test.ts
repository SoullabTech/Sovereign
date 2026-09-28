import type { AetherTrajectory, TrajectoryPattern } from '../fieldTrajectory';
import { buildMultiSpiralField, summarizeDomainStates, validateMultiSpiralField } from '../multiSpiral';

function trajectory(ref:string,classification:TrajectoryPattern):AetherTrajectory{
  return {
    trajectoryRef:ref,
    moments:[{index:0,fieldRef:ref+':1',motifRefs:[],relationRefs:[]},{index:1,fieldRef:ref+':2',motifRefs:[],relationRefs:[]},{index:2,fieldRef:ref+':3',motifRefs:[],relationRefs:[]}],
    deltas:[],
    classification,
    supportingSignals:['synthetic-r4'],
    confidence:.7,
    predictiveAuthority:false,
    destinyAuthority:false,
    developmentalRankAuthority:false,
    finalMeaningAuthority:'member',
    provisional:true,
  };
}

describe('AIN-AETHER-01R4 multi-spiral field',()=>{
  const field=buildMultiSpiralField('member:multi-spiral',[
    {spiralRef:'relationship',domain:'relationship',trajectory:trajectory('relationship','oscillation')},
    {spiralRef:'work',domain:'work',trajectory:trajectory('work','phase_change')},
    {spiralRef:'family',domain:'family',trajectory:trajectory('family','recurrence')},
    {spiralRef:'creative',domain:'creative',trajectory:trajectory('creative','sustained_convergence')},
    {spiralRef:'body',domain:'body',trajectory:trajectory('body','ordinary_fluctuation')},
    {spiralRef:'spiritual',domain:'spiritual',trajectory:trajectory('spiritual','dissolution')},
  ]);

  test('preserves different simultaneous trajectories by domain',()=>{
    const states=summarizeDomainStates(field);
    expect(states).toEqual(expect.arrayContaining([
      expect.objectContaining({domain:'relationship',classification:'oscillation'}),
      expect.objectContaining({domain:'work',classification:'phase_change'}),
      expect.objectContaining({domain:'family',classification:'recurrence'}),
      expect.objectContaining({domain:'creative',classification:'sustained_convergence'}),
      expect.objectContaining({domain:'spiritual',classification:'dissolution'}),
    ]));
  });

  test('does not reduce the member to one stage or rank',()=>{
    expect(field.singleStageAuthority).toBe(false);
    expect(field.developmentalRankAuthority).toBe(false);
    expect(field.finalMeaningAuthority).toBe('member');
  });

  test('detects timing mismatch across independent spirals without ranking them',()=>{
    const relation=field.crossSpiralRelations.find(r=>
      new Set([r.aSpiralRef,r.bSpiralRef]).has('work') &&
      new Set([r.aSpiralRef,r.bSpiralRef]).has('spiritual')
    )!;
    expect(relation.kind).toBe('timing_mismatch');
    expect(relation.provisional).toBe(true);
  });

  test('detects co-convergence where two domains move similarly',()=>{
    const relation=field.crossSpiralRelations.find(r=>
      new Set([r.aSpiralRef,r.bSpiralRef]).has('work') &&
      new Set([r.aSpiralRef,r.bSpiralRef]).has('creative')
    )!;
    expect(relation.kind).toBe('co_convergence');
  });

  test('allows independent movement rather than inventing a relation',()=>{
    const relation=field.crossSpiralRelations.find(r=>
      new Set([r.aSpiralRef,r.bSpiralRef]).has('family') &&
      new Set([r.aSpiralRef,r.bSpiralRef]).has('body')
    )!;
    expect(relation.kind).toBe('independent_movement');
  });

  test('field remains non-predictive and validates',()=>{
    expect(field.predictiveAuthority).toBe(false);
    expect(validateMultiSpiralField(field)).toEqual({valid:true,errors:[]});
  });
});
