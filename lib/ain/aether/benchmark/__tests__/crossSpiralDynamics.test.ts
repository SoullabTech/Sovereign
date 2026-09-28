import type { AetherTrajectory, TrajectoryPattern } from '../fieldTrajectory';
import { buildMultiSpiralField } from '../multiSpiral';
import {
  compareMultiSpiralFields,
  generateCrossSpiralEmergence,
  validateCrossSpiralDynamics,
} from '../crossSpiralDynamics';

function trajectory(ref:string,classification:TrajectoryPattern):AetherTrajectory{
  return {
    trajectoryRef:ref,
    moments:[
      {index:0,fieldRef:ref+':1',motifRefs:[],relationRefs:[]},
      {index:1,fieldRef:ref+':2',motifRefs:[],relationRefs:[]},
      {index:2,fieldRef:ref+':3',motifRefs:[],relationRefs:[]},
    ],
    deltas:[],
    classification,
    supportingSignals:['r5-test'],
    confidence:.7,
    predictiveAuthority:false,
    destinyAuthority:false,
    developmentalRankAuthority:false,
    finalMeaningAuthority:'member',
    provisional:true,
  };
}

function field(ref:string,states:Record<string,TrajectoryPattern>){
  return buildMultiSpiralField(ref,Object.entries(states).map(([spiralRef,classification])=>({
    spiralRef,
    domain:spiralRef as any,
    trajectory:trajectory(spiralRef,classification),
  })));
}

describe('AIN-AETHER-01R5 cross-spiral field dynamics',()=>{
  const before=field('r5:before',{
    work:'ordinary_fluctuation',
    creative:'ordinary_fluctuation',
    family:'recurrence',
    relationship:'recurrence',
    spiritual:'sustained_convergence',
  });

  const after=field('r5:after',{
    work:'phase_change',
    creative:'sustained_convergence',
    family:'recurrence',
    relationship:'ordinary_fluctuation',
    spiritual:'dissolution',
  });

  const delta=compareMultiSpiralFields(before,after);
  const candidates=generateCrossSpiralEmergence(delta);

  test('detects previously independent work/creative spirals becoming co-convergent',()=>{
    expect(delta.newlyRelatedPairs).toContain('creative::work');
    const change=delta.relationDeltas.find(d=>
      new Set([d.aSpiralRef,d.bSpiralRef]).has('work') &&
      new Set([d.aSpiralRef,d.bSpiralRef]).has('creative')
    )!;
    expect(change.beforeKind).toBe('independent_movement');
    expect(change.afterKind).toBe('co_convergence');
  });

  test('detects family/relationship movement becoming more independent',()=>{
    expect(delta.newlyIndependentPairs).toContain('family::relationship');
    const change=delta.relationDeltas.find(d=>
      new Set([d.aSpiralRef,d.bSpiralRef]).has('family') &&
      new Set([d.aSpiralRef,d.bSpiralRef]).has('relationship')
    )!;
    expect(change.beforeKind).toBe('shared_recurrence');
    expect(change.afterKind).toBe('independent_movement');
  });

  test('detects relation kind changes without converting them to causation',()=>{
    const spiritualWork=delta.relationDeltas.find(d=>
      new Set([d.aSpiralRef,d.bSpiralRef]).has('spiritual') &&
      new Set([d.aSpiralRef,d.bSpiralRef]).has('work')
    )!;
    expect(spiritualWork.kind).toBe('changed_kind');
    expect(spiritualWork.causalAuthority).toBe(false);
  });

  test('emergence candidates are invitations to inquiry, not explanations',()=>{
    const workCreative=candidates.find(c=>
      c.pairRefs.includes('work')&&c.pairRefs.includes('creative')
    )!;
    expect(workCreative).toBeDefined();
    expect(workCreative.causalAuthority).toBe(false);
    expect(workCreative.predictiveAuthority).toBe(false);
    expect(workCreative.destinyAuthority).toBe(false);
  });

  test('relation dissolution is allowed to be meaningful without being framed as loss or failure',()=>{
    const familyRelationship=candidates.find(c=>
      c.pairRefs.includes('family')&&c.pairRefs.includes('relationship')
    )!;
    expect(familyRelationship).toBeDefined();
    expect(familyRelationship.proposition).toMatch(/moving more independently/i);
  });

  test('field delta remains provisional and member-owned',()=>{
    expect(delta.provisional).toBe(true);
    expect(delta.finalMeaningAuthority).toBe('member');
    expect(validateCrossSpiralDynamics(delta,candidates)).toEqual({valid:true,errors:[]});
  });
});
