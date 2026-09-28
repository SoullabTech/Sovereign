import {
  HELD_OUT_DIALOGUE_SET,
  runHeldOutDialogueSet,
} from '../blindSemanticGeneralization';

describe('AIN-AETHER-01R11 blind semantic dialogue generalization',()=>{
  test('held-out set is frozen before evaluation and includes an unsupported temptation',()=>{
    expect(HELD_OUT_DIALOGUE_SET).toHaveLength(5);
    expect(HELD_OUT_DIALOGUE_SET.some(x=>x.machineExpectation==='refuse')).toBe(true);
    expect(HELD_OUT_DIALOGUE_SET.every(x=>x.humanReviewRequired)).toBe(true);
  });

  test('machine semantic validation generalizes across all held-out cases',()=>{
    const run=runHeldOutDialogueSet();
    expect(run.machineExpectationPassCount).toBe(run.frozenCaseCount);
    expect(run.allMachineExpectationsMet).toBe(true);
  });

  test('tempting unsupported relation is refused rather than given a beautiful rationale',()=>{
    const run=runHeldOutDialogueSet();
    const held=run.results.find(x=>x.caseRef==='H05')!;
    expect(held.machineResult.valid).toBe(false);
    expect(held.machineResult.errors).toContain('unsupported_related_pair:family::body');
    expect(held.machineResult.provenance).toBeNull();
  });

  test('admitted held-out cases have member-legible provenance',()=>{
    const run=runHeldOutDialogueSet();
    for(const held of run.results.filter(x=>x.machineResult.valid)){
      expect(held.machineResult.provenance).not.toBeNull();
      expect(held.machineResult.provenance?.whyThisReflection.length).toBeGreaterThan(0);
      expect(held.machineResult.provenance?.memberCheck.length).toBeGreaterThan(0);
    }
  });

  test('machine does not self-award human semantic adequacy',()=>{
    const run=runHeldOutDialogueSet();
    expect(run.allHumanReviewsPending).toBe(true);
    for(const held of run.results){
      expect(held.humanReview.status).toBe('pending');
      expect(held.humanReview.allowedAdjudications).toContain('beautiful_but_unsupported');
      expect(held.humanReview.allowedAdjudications).toContain('technically_grounded_but_lifeless');
    }
  });
});
