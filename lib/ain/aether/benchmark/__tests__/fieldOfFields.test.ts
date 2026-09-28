import type { AetherTrajectory, TrajectoryPattern } from '../fieldTrajectory';
import { buildMultiSpiralField } from '../multiSpiral';
import {
  ablateGestaltSpiral,
  deriveAethericGestalt,
  validateAethericGestalt,
} from '../fieldOfFields';

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
    supportingSignals:['r6-field-of-fields'],
    confidence:.7,
    predictiveAuthority:false,
    destinyAuthority:false,
    developmentalRankAuthority:false,
    finalMeaningAuthority:'member',
    provisional:true,
  };
}

const field=buildMultiSpiralField('r6:field',[
  {spiralRef:'work',domain:'work',trajectory:trajectory('work','phase_change')},
  {spiralRef:'creative',domain:'creative',trajectory:trajectory('creative','sustained_convergence')},
  {spiralRef:'relationship',domain:'relationship',trajectory:trajectory('relationship','phase_change')},
  {spiralRef:'family',domain:'family',trajectory:trajectory('family','recurrence')},
  {spiralRef:'body',domain:'body',trajectory:trajectory('body','ordinary_fluctuation')},
  {spiralRef:'spiritual',domain:'spiritual',trajectory:trajectory('spiritual','dissolution')},
]);

describe('AIN-AETHER-01R6 field-of-fields synthesis',()=>{
  const gestalt=deriveAethericGestalt(field);

  test('forms a higher-order candidate from several strongly related spirals',()=>{
    expect(['candidate_gestalt','partial_gestalt']).toContain(gestalt.standing);
    expect(gestalt.participatingSpiralRefs.length).toBeGreaterThanOrEqual(2);
    expect(gestalt.supportingRelationRefs.length).toBeGreaterThan(0);
  });

  test('preserves non-fitting spirals outside the gestalt',()=>{
    expect(gestalt.excludedSpiralRefs.length).toBeGreaterThan(0);
    expect(gestalt.preservesNonfit).toBe(true);
    expect(new Set([...gestalt.participatingSpiralRefs,...gestalt.excludedSpiralRefs]).size).toBe(field.spirals.length);
  });

  test('does not totalize the gestalt into identity, destiny, rank, or Soul representation',()=>{
    expect(gestalt.totalizingAuthority).toBe(false);
    expect(gestalt.identityAuthority).toBe(false);
    expect(gestalt.destinyAuthority).toBe(false);
    expect(gestalt.developmentalRankAuthority).toBe(false);
    expect(gestalt.soulRepresentationAuthority).toBe(false);
  });

  test('gestalt remains non-causal and member-owned',()=>{
    expect(gestalt.causalAuthority).toBe(false);
    expect(gestalt.predictiveAuthority).toBe(false);
    expect(gestalt.finalMeaningAuthority).toBe('member');
    expect(validateAethericGestalt(field,gestalt)).toEqual({valid:true,errors:[]});
  });

  test('ablating a participating spiral changes the gestalt rather than preserving it by story alone',()=>{
    const target=gestalt.participatingSpiralRefs[0];
    expect(target).toBeDefined();
    const after=ablateGestaltSpiral(field,target);
    expect(after.participatingSpiralRefs).not.toContain(target);
    expect(after.gestaltRef).toBe('aetheric-gestalt:'+field.fieldRef);
  });

  test('field may legitimately refuse a higher-order gestalt when relations are too weak',()=>{
    const weak=buildMultiSpiralField('r6:weak',[
      {spiralRef:'family',domain:'family',trajectory:trajectory('family','recurrence')},
      {spiralRef:'body',domain:'body',trajectory:trajectory('body','ordinary_fluctuation')},
      {spiralRef:'community',domain:'community',trajectory:trajectory('community','ordinary_fluctuation')},
    ]);
    const weakGestalt=deriveAethericGestalt(weak);
    expect(['partial_gestalt','insufficient_gestalt']).toContain(weakGestalt.standing);
    expect(weakGestalt.totalizingAuthority).toBe(false);
  });
});
