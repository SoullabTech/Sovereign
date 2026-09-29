import { lineageProcessForState } from '@/lib/writersStudio/intellectualLineageProcess';

describe('C15 state-sensitive intellectual lineage process', () => {
  it('uses manuscript evidence for an existing manuscript', () => {
    const plan = lineageProcessForState('existing-manuscript');
    expect(plan.phases).toEqual([
      'whole-field-orientation',
      'chapter-lineage',
      'exact-locus',
      'whole-field-synthesis',
    ]);
    expect(plan.claimBoundary).toContain('actual manuscript loci');
  });

  it('keeps written and planned material separate for a partial manuscript', () => {
    const plan = lineageProcessForState('partial-manuscript');
    expect(plan.phases).toContain('written-vs-planned-map');
    expect(plan.phases).toContain('prospective-research');
    expect(plan.claimBoundary).toContain('visibly separate');
  });

  it('does not invent manuscript claims before prose exists', () => {
    const plan = lineageProcessForState('pre-manuscript');
    expect(plan.phases).toEqual([
      'source-field-orientation',
      'prospective-research',
      'possible-structure',
      'writing-threshold',
    ]);
    expect(plan.claimBoundary).toContain('before prose exists');
    expect(plan.phases).not.toContain('exact-locus');
  });

  it('stays conservative when maturity is undeclared', () => {
    const plan = lineageProcessForState(null);
    expect(plan.phases).toEqual(['source-field-orientation']);
    expect(plan.claimBoundary).toContain('Do not infer manuscript maturity');
  });
});
