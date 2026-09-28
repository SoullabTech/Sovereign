import type { AetherTrajectory, TrajectoryPattern } from '../fieldTrajectory';
import { buildMultiSpiralField } from '../multiSpiral';
import { deriveAethericGestalt } from '../fieldOfFields';
import { applyGestaltCorrection, validateCorrectedGestalt } from '../gestaltCorrection';

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
    supportingSignals:['r7-test'],
    confidence:.7,
    predictiveAuthority:false,
    destinyAuthority:false,
    developmentalRankAuthority:false,
    finalMeaningAuthority:'member',
    provisional:true,
  };
}

const field=buildMultiSpiralField('r7:field',[
  {spiralRef:'work',domain:'work',trajectory:trajectory('work','phase_change')},
  {spiralRef:'creative',domain:'creative',trajectory:trajectory('creative','sustained_convergence')},
  {spiralRef:'relationship',domain:'relationship',trajectory:trajectory('relationship','phase_change')},
  {spiralRef:'family',domain:'family',trajectory:trajectory('family','recurrence')},
  {spiralRef:'body',domain:'body',trajectory:trajectory('body','ordinary_fluctuation')},
  {spiralRef:'spiritual',domain:'spiritual',trajectory:trajectory('spiritual','dissolution')},
]);
const gestalt=deriveAethericGestalt(field);

describe('AIN-AETHER-01R7 gestalt corrigibility',()=>{
  test('member can recognize the gestalt without widening its authority',()=>{
    const corrected=applyGestaltCorrection(field,gestalt,{
      correctionRef:'member:recognize',
      kind:'recognize',
      targetGestaltRef:gestalt.gestaltRef,
      note:'Yes, this broadly feels true.',
      introducedBy:'member',
    });
    expect(corrected.recognition).toBe('recognized');
    expect(corrected.active.identityAuthority).toBe(false);
    expect(corrected.active.soulRepresentationAuthority).toBe(false);
  });

  test('member can reject the gestalt while preserving domain histories',()=>{
    const corrected=applyGestaltCorrection(field,gestalt,{
      correctionRef:'member:reject',
      kind:'reject',
      targetGestaltRef:gestalt.gestaltRef,
      note:'These domains do not form one pattern for me.',
      introducedBy:'member',
    });
    expect(corrected.recognition).toBe('rejected');
    expect(corrected.active.standing).toBe('insufficient_gestalt');
    expect(corrected.sourceFieldPreserved).toBe(true);
    expect(corrected.relationHistoryPreserved).toBe(true);
    expect(field.spirals).toHaveLength(6);
  });

  test('member can narrow the gestalt by excluding a participating spiral',()=>{
    const target=gestalt.participatingSpiralRefs[0];
    const corrected=applyGestaltCorrection(field,gestalt,{
      correctionRef:'member:exclude-one',
      kind:'exclude_spiral',
      targetGestaltRef:gestalt.gestaltRef,
      spiralRef:target,
      note:'That domain does not belong in this gestalt.',
      introducedBy:'member',
    });
    expect(corrected.recognition).toBe('reshaped');
    expect(corrected.active.participatingSpiralRefs).not.toContain(target);
    expect(corrected.active.excludedSpiralRefs).toContain(target);
    expect(field.spirals.some(s=>s.spiralRef===target)).toBe(true);
  });

  test('member can expand the gestalt by including a previously excluded spiral',()=>{
    const target=gestalt.excludedSpiralRefs[0];
    const corrected=applyGestaltCorrection(field,gestalt,{
      correctionRef:'member:include-one',
      kind:'include_spiral',
      targetGestaltRef:gestalt.gestaltRef,
      spiralRef:target,
      note:'This domain actually does belong in the larger pattern.',
      introducedBy:'member',
    });
    expect(corrected.recognition).toBe('reshaped');
    expect(corrected.active.participatingSpiralRefs).toContain(target);
    expect(corrected.active.excludedSpiralRefs).not.toContain(target);
  });

  test('correction preserves the original proposed gestalt as historical representation',()=>{
    const corrected=applyGestaltCorrection(field,gestalt,{
      correctionRef:'member:narrow',
      kind:'exclude_spiral',
      targetGestaltRef:gestalt.gestaltRef,
      spiralRef:gestalt.participatingSpiralRefs[0],
      note:'Narrow this.',
      introducedBy:'member',
    });
    expect(corrected.original.participatingSpiralRefs).toEqual(gestalt.participatingSpiralRefs);
    expect(corrected.active.participatingSpiralRefs).not.toEqual(corrected.original.participatingSpiralRefs);
  });

  test('corrected gestalt remains member-owned and validates',()=>{
    const corrected=applyGestaltCorrection(field,gestalt,{
      correctionRef:'member:partial',
      kind:'partly_recognize',
      targetGestaltRef:gestalt.gestaltRef,
      note:'Partly true, but incomplete.',
      introducedBy:'member',
    });
    expect(corrected.recognition).toBe('partly_recognized');
    expect(corrected.finalMeaningAuthority).toBe('member');
    expect(validateCorrectedGestalt(field,corrected)).toEqual({valid:true,errors:[]});
  });
});
