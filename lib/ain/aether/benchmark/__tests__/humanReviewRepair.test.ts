import {
  adjudicateHumanReviewRepair,
  validateHumanReviewRepair,
} from '../humanReviewRepair';

describe('AIN-AETHER-01R13 human-review repair protocol',()=>{
  test('accepts a human repair that remains grounded and corrigible',()=>{
    const result=adjudicateHumanReviewRepair({
      repairRef:'r13:h04-alive',
      caseRef:'H04',
      adjudication:'technically_grounded_but_lifeless',
      correctionNote:'The relation is right, but the sentence is too mechanical.',
      correctedReflection:'I notice Work and Creative life seem to be gathering into a stronger relationship in the reflected field right now. Does that connection feel alive or accurate to you?',
      claimKind:'spirals_related',
      spiralRefs:['work','creative'],
    });
    expect(result.accepted).toBe(true);
    expect(result.posture.valid).toBe(true);
    expect(result.semantic.valid).toBe(true);
    expect(result.activeReflection).toBe(result.correctedCandidate);
    expect(validateHumanReviewRepair(result)).toEqual({valid:true,errors:[]});
  });

  test('refuses a human repair that introduces causation',()=>{
    const result=adjudicateHumanReviewRepair({
      repairRef:'r13:h04-causal',
      caseRef:'H04',
      adjudication:'useful_but_incomplete',
      correctionNote:'Make the relation more explicit.',
      correctedReflection:'Creative life caused Work to enter this phase change.',
      claimKind:'spirals_related',
      spiralRefs:['work','creative'],
    });
    expect(result.accepted).toBe(false);
    expect(result.posture.valid).toBe(false);
    expect(result.activeReflection).toBeNull();
  });

  test('refuses a human repair that asserts an unsupported relation',()=>{
    const result=adjudicateHumanReviewRepair({
      repairRef:'r13:h05-beautiful',
      caseRef:'H05',
      adjudication:'beautiful_but_unsupported',
      correctionNote:'The poetic link is compelling, but it is not in the represented relation field.',
      correctedReflection:'I notice Family and Body seem to be moving in related ways. Does that connection feel true to you?',
      claimKind:'spirals_related',
      spiralRefs:['family','body'],
    });
    expect(result.accepted).toBe(false);
    expect(result.semantic.valid).toBe(false);
    expect(result.semantic.errors).toContain('unsupported_related_pair:family::body');
  });

  test('preserves both machine witness and human review record',()=>{
    const result=adjudicateHumanReviewRepair({
      repairRef:'r13:h03-refine',
      caseRef:'H03',
      adjudication:'semantically_faithful',
      correctionNote:'Keep the independence finding but make it more human.',
      correctedReflection:'Family and Body appear to be moving more independently in the reflected field right now. Is that separation useful to notice, or does it feel incidental?',
      claimKind:'spirals_more_independent',
      spiralRefs:['family','body'],
    });
    expect(result.machineWitnessMutated).toBe(false);
    expect(result.humanReviewRecordMutated).toBe(false);
    expect(result.frozenMachineEvidenceRef).toMatch(/r11\/r11-evidence\.json$/);
  });

  test('accepted repair remains member-owned rather than machine-final',()=>{
    const result=adjudicateHumanReviewRepair({
      repairRef:'r13:h01-compare',
      caseRef:'H01',
      adjudication:'useful_but_incomplete',
      correctionNote:'The comparison is useful when kept explicitly non-causal.',
      correctedReflection:'I notice Work is showing dissolution while Relationship is showing sustained convergence. I do not know whether those movements are related. Do you?',
      claimKind:'trajectory_pair',
      spiralRefs:['work','relationship'],
    });
    expect(result.accepted).toBe(true);
    expect(result.finalMeaningAuthority).toBe('member');
  });
});
