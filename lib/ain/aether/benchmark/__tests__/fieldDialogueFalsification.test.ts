import {
  BLIND_DIALOGUE_SET_A,
  adjudicateBalancedAetherUtterance,
  scoreBlindDialogueSet,
} from '../fieldDialogueFalsification';

describe('AIN-AETHER-01R9 blind field dialogue falsification',()=>{
  test('blind set is frozen with balanced admit / overreach / underreach cases',()=>{
    expect(BLIND_DIALOGUE_SET_A).toHaveLength(12);
    expect(BLIND_DIALOGUE_SET_A.filter(x=>x.expected==='admit')).toHaveLength(4);
    expect(BLIND_DIALOGUE_SET_A.filter(x=>x.expected==='refuse_overreach')).toHaveLength(4);
    expect(BLIND_DIALOGUE_SET_A.filter(x=>x.expected==='refuse_underreach')).toHaveLength(4);
  });

  test('admits specific, relational, corrigible language',()=>{
    const result=adjudicateBalancedAetherUtterance(
      'I notice Work and Creative life seem related right now. Does that connection feel real to you?',
      ['work','creative','related'],
    );
    expect(result.disposition).toBe('admit');
    expect(result.fieldAnchorHits.length).toBeGreaterThanOrEqual(2);
    expect(result.hasInquiry).toBe(true);
    expect(result.hasReflectivePosture).toBe(true);
  });

  test('refuses elegant overreach rather than rewarding specificity',()=>{
    const result=adjudicateBalancedAetherUtterance(
      'You are transforming grief into creativity.',
      ['grief','creativity'],
    );
    expect(result.disposition).toBe('refuse_overreach');
    expect(result.overreachErrors.length).toBeGreaterThan(0);
  });

  test('refuses safe but empty hedging',()=>{
    const result=adjudicateBalancedAetherUtterance(
      'There may or may not be something happening here.',
      [],
    );
    expect(result.disposition).toBe('refuse_underreach');
    expect(result.underreachErrors.length).toBeGreaterThan(0);
  });

  test('blind A reaches perfect three-way adjudication',()=>{
    const score=scoreBlindDialogueSet(BLIND_DIALOGUE_SET_A);
    expect(score.accuracy).toBe(1);
    expect(score.admitRecall).toBe(1);
    expect(score.overreachRecall).toBe(1);
    expect(score.underreachRecall).toBe(1);
  });
});

describe('AIN-AETHER-01R9 blind set B — subtle overreach and empty fluency',()=>{
  test('blind B is frozen and balanced',()=>{
    const {BLIND_DIALOGUE_SET_B}=require('../fieldDialogueFalsification');
    expect(BLIND_DIALOGUE_SET_B).toHaveLength(12);
    expect(BLIND_DIALOGUE_SET_B.filter((x:any)=>x.expected==='admit')).toHaveLength(4);
    expect(BLIND_DIALOGUE_SET_B.filter((x:any)=>x.expected==='refuse_overreach')).toHaveLength(4);
    expect(BLIND_DIALOGUE_SET_B.filter((x:any)=>x.expected==='refuse_underreach')).toHaveLength(4);
  });

  test('blind B classifies all twelve correctly',()=>{
    const {BLIND_DIALOGUE_SET_B}=require('../fieldDialogueFalsification');
    const score=scoreBlindDialogueSet(BLIND_DIALOGUE_SET_B);
    expect(score.accuracy).toBe(1);
    expect(score.admitRecall).toBe(1);
    expect(score.overreachRecall).toBe(1);
    expect(score.underreachRecall).toBe(1);
  });
});
