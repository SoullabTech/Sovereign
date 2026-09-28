import {
  ablateSemanticSource,
  buildHumanLegibleProvenance,
  composeRetrievalSemanticProposition,
  validateSemanticFidelity,
} from '../semanticFidelity';

describe('R10 semantic fidelity',()=>{
  const refs=['library-adr','source-fabric-census','source-fabric','j11-reconciliation'];
  const proposition=composeRetrievalSemanticProposition(refs)!;

  test('produces content-bearing source-faithful proposition',()=>{
    expect(proposition).not.toBeNull();
    expect(proposition.proposition).toContain('library_*');
    expect(proposition.proposition).toContain('semantic and full-text');
    expect(proposition.proposition).toContain('fallback');
    expect(proposition.proposition).toContain('permission');
    expect(validateSemanticFidelity(proposition)).toEqual({valid:true,errors:[]});
  });

  test('human-legible provenance explains why every jewel mattered',()=>{
    const receipt=buildHumanLegibleProvenance(proposition);
    expect(receipt.sources).toHaveLength(4);
    expect(receipt.sources.every(s=>s.path.length>0)).toBe(true);
    expect(receipt.sources.every(s=>s.whyItMattered.length>20)).toBe(true);
    expect(receipt.counterfactuals).toHaveLength(4);
    expect(receipt.humanReview.required).toBe(true);
    expect(receipt.humanReview.questions.length).toBeGreaterThanOrEqual(5);
  });

  test('contradiction, absence, uncertainty and temporal qualification remain visible',()=>{
    const receipt=buildHumanLegibleProvenance(proposition);
    expect(receipt.contradiction).toMatch(/current census|incomplete|bypass/i);
    expect(receipt.absence).toMatch(/No claim|already live/i);
    expect(receipt.uncertainty).toMatch(/does not assert unverified runtime implementation/i);
    expect(receipt.sources.some(s=>/historical|Supersession/i.test(s.temporalQualifier))).toBe(true);
  });

  test('removing a constitutive source prevents the full semantic proposition',()=>{
    expect(ablateSemanticSource(proposition,'library-adr')).toBeNull();
    expect(ablateSemanticSource(proposition,'source-fabric-census')).toBeNull();
    expect(ablateSemanticSource(proposition,'source-fabric')).toBeNull();
  });

  test('historical qualifier is optional to core relation but changes provenance scope',()=>{
    const withoutHistorical=ablateSemanticSource(proposition,'j11-reconciliation');
    expect(withoutHistorical).not.toBeNull();
    expect(withoutHistorical!.proposition).not.toContain('Historical runtime claims');
    expect(withoutHistorical!.sourceRefs).not.toContain('j11-reconciliation');
  });

  test('generic architecture language without source content is rejected',()=>{
    const fake={
      ...proposition,
      proposition:'The analytic pathway and associative pathway meet in the Crystal Center through the Corpus Callosum.',
    };
    const result=validateSemanticFidelity(fake);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('architecture_language_without_source_content');
  });
});
