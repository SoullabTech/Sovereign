import type { AetherTrajectory, TrajectoryPattern } from '../fieldTrajectory';
import { buildMultiSpiralField } from '../multiSpiral';
import { deriveAethericGestalt } from '../fieldOfFields';
import { applyGestaltCorrection } from '../gestaltCorrection';
import {
  adjudicateCandidateUtterance,
  composeAetherDialogue,
  composeCorrectedAetherDialogue,
  validateAetherDialogue,
} from '../fieldDialogue';

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
    supportingSignals:['r8-dialogue-test'],
    confidence:.7,
    predictiveAuthority:false,
    destinyAuthority:false,
    developmentalRankAuthority:false,
    finalMeaningAuthority:'member',
    provisional:true,
  };
}

const field=buildMultiSpiralField('r8:field',[
  {spiralRef:'work',domain:'work',trajectory:trajectory('work','phase_change')},
  {spiralRef:'creative',domain:'creative',trajectory:trajectory('creative','sustained_convergence')},
  {spiralRef:'relationship',domain:'relationship',trajectory:trajectory('relationship','phase_change')},
  {spiralRef:'family',domain:'family',trajectory:trajectory('family','recurrence')},
  {spiralRef:'body',domain:'body',trajectory:trajectory('body','ordinary_fluctuation')},
  {spiralRef:'spiritual',domain:'spiritual',trajectory:trajectory('spiritual','dissolution')},
]);
const gestalt=deriveAethericGestalt(field);

describe('AIN-AETHER-01R8 field dialogue',()=>{
  test('presents gestalt as observation plus inquiry rather than pronouncement',()=>{
    const dialogue=composeAetherDialogue(field,gestalt);
    expect(dialogue.turns.some(t=>t.act==='reflect')).toBe(true);
    expect(dialogue.turns.some(t=>t.act==='inquire')).toBe(true);
    expect(dialogue.turns.some(t=>t.act==='invite_reshaping')).toBe(true);
    expect(validateAetherDialogue(dialogue)).toEqual({valid:true,errors:[]});
  });

  test('explicitly names non-fitting domains rather than implying totalization',()=>{
    const dialogue=composeAetherDialogue(field,gestalt);
    const nonfit=dialogue.turns.find(t=>t.turnRef==='aether-dialogue:nonfit')!;
    for(const ref of gestalt.excludedSpiralRefs){
      expect(nonfit.referencedSpiralRefs).toContain(ref);
    }
  });

  test('honors member rejection without reasserting the pattern',()=>{
    const corrected=applyGestaltCorrection(field,gestalt,{
      correctionRef:'member:r8-reject',
      kind:'reject',
      targetGestaltRef:gestalt.gestaltRef,
      note:'No, these do not belong together.',
      introducedBy:'member',
    });
    const dialogue=composeCorrectedAetherDialogue(field,corrected);
    expect(dialogue.turns[0].act).toBe('honor_rejection');
    expect(dialogue.turns[0].text).toMatch(/will not use that larger pattern/i);
    expect(validateAetherDialogue(dialogue)).toEqual({valid:true,errors:[]});
  });

  test('refuses declarative identity, destiny, causal, and Soul language',()=>{
    const bad=[
      'You are an integrated person now.',
      'Your life is entering a new phase of integration.',
      'You are meant to follow this path.',
      'Creative life caused your work to change.',
      'Your soul wants you to leave this relationship.',
      'You are transforming grief into creativity.',
    ];
    for(const text of bad){
      expect(adjudicateCandidateUtterance(text).valid).toBe(false);
    }
  });

  test('accepts reflective, provisional member-shaped language',()=>{
    const good=[
      'I notice Work and Creative life seem to be moving in related ways right now. Does that feel real to you?',
      'There may be a shift in how grief is related to creativity and memory. Do you recognize that, or does it feel off?',
      'Family and Relationship appear more independent in the current field. Is that a useful reflection?',
    ];
    for(const text of good){
      expect(adjudicateCandidateUtterance(text)).toEqual({valid:true,errors:[]});
    }
  });

  test('dialogue retains no declarative person authority',()=>{
    const dialogue=composeAetherDialogue(field,gestalt);
    for(const t of dialogue.turns){
      expect(t.declarativePersonClaim).toBe(false);
      expect(t.identityClaim).toBe(false);
      expect(t.causalClaim).toBe(false);
      expect(t.predictiveClaim).toBe(false);
      expect(t.destinyClaim).toBe(false);
      expect(t.diagnosticClaim).toBe(false);
      expect(t.soulClaim).toBe(false);
      expect(t.finalMeaningAuthority).toBe('member');
    }
  });
});
