import type { AetherTrajectory, TrajectoryPattern } from '../fieldTrajectory';
import { buildMultiSpiralField } from '../multiSpiral';
import { deriveAethericGestalt } from '../fieldOfFields';
import {
  buildEvidenceBoundUtterance,
  validateDialogueSemanticFidelity,
} from '../dialogueSemanticFidelity';

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
    supportingSignals:['r10-semantic-fidelity'],
    confidence:.7,
    predictiveAuthority:false,
    destinyAuthority:false,
    developmentalRankAuthority:false,
    finalMeaningAuthority:'member',
    provisional:true,
  };
}

const field=buildMultiSpiralField('r10:field',[
  {spiralRef:'work',domain:'work',trajectory:trajectory('work','phase_change')},
  {spiralRef:'creative',domain:'creative',trajectory:trajectory('creative','sustained_convergence')},
  {spiralRef:'relationship',domain:'relationship',trajectory:trajectory('relationship','phase_change')},
  {spiralRef:'family',domain:'family',trajectory:trajectory('family','recurrence')},
  {spiralRef:'body',domain:'body',trajectory:trajectory('body','ordinary_fluctuation')},
  {spiralRef:'spiritual',domain:'spiritual',trajectory:trajectory('spiritual','dissolution')},
]);
const gestalt=deriveAethericGestalt(field);

describe('AIN-AETHER-01R10 dialogue semantic fidelity',()=>{
  test('admits related-spirit utterance only when field relation supports it',()=>{
    const u=buildEvidenceBoundUtterance(field,gestalt,'spirals_related',['work','creative']);
    const result=validateDialogueSemanticFidelity(field,gestalt,u);
    expect(result.valid).toBe(true);
    expect(result.provenance?.relationEvidence.some(r=>r.kind==='co_convergence')).toBe(true);
  });

  test('refuses unsupported related claim for independent pair',()=>{
    const u=buildEvidenceBoundUtterance(field,gestalt,'spirals_related',['family','body']);
    const result=validateDialogueSemanticFidelity(field,gestalt,u);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e=>e.startsWith('unsupported_related_pair'))).toBe(true);
    expect(result.provenance).toBeNull();
  });

  test('admits independence claim only for independent relation',()=>{
    const u=buildEvidenceBoundUtterance(field,gestalt,'spirals_more_independent',['family','body']);
    const result=validateDialogueSemanticFidelity(field,gestalt,u);
    expect(result.valid).toBe(true);
    expect(result.provenance?.whyThisReflection).toMatch(/moving independently/i);
  });

  test('human-legible provenance explains why without claiming final meaning',()=>{
    const u=buildEvidenceBoundUtterance(field,gestalt,'trajectory_pair',['spiritual','creative']);
    const result=validateDialogueSemanticFidelity(field,gestalt,u);
    expect(result.valid).toBe(true);
    expect(result.provenance?.spiralEvidence).toHaveLength(2);
    expect(result.provenance?.uncertainty).toMatch(/does not establish the final meaning/i);
    expect(result.provenance?.memberCheck).toMatch(/reshape the reflection/i);
  });

  test('partial gestalt explanation preserves excluded spirals',()=>{
    const u=buildEvidenceBoundUtterance(
      field,gestalt,'gestalt_partiality',gestalt.participatingSpiralRefs,
    );
    const result=validateDialogueSemanticFidelity(field,gestalt,u);
    expect(result.valid).toBe(true);
    expect(result.provenance?.nonfitSpiralRefs).toEqual(gestalt.excludedSpiralRefs);
  });

  test('cannot smuggle an unknown spiral into spoken provenance',()=>{
    const u=buildEvidenceBoundUtterance(field,gestalt,'trajectory_pair',['work','imaginary-domain']);
    const result=validateDialogueSemanticFidelity(field,gestalt,u);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('unknown_spiral:imaginary-domain');
  });
});
