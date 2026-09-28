import { buildAetherInputFromField } from '../aetherBuilder';
import { generateAetherCandidates } from '../aetherSynthesis';
import { buildCrystalCenterField } from '../crystalCenter';
import {
  ablateEmergencePathway,
  buildParallelPathways,
  exchangeCallosalSignals,
  generateFifthElementCandidate,
  validateFifthElementEmergence,
} from '../callosalEmergence';

describe('R8 Corpus Callosum fifth-element emergence',()=>{
  const input=buildAetherInputFromField(
    'R8-test',
    ['library-adr','source-fabric-census','source-fabric','facet-crossings',
     'j9-adjudication','j11-reconciliation','rgr-note','rgr-constitution'],
    'mixed',
  );
  input.absences.push({
    absenceRef:'r8-member-final-meaning',
    subject:'member-owned final meaning',
    reason:'no_support',
  });
  const field=buildCrystalCenterField(input,generateAetherCandidates(input));
  const {analytic,associative}=buildParallelPathways(field);
  const exchange=exchangeCallosalSignals(analytic,associative);
  const candidate=generateFifthElementCandidate(field,analytic,associative,exchange);

  test('pathways remain differentiated before exchange',()=>{
    expect(analytic.signals.length).toBeGreaterThan(0);
    expect(associative.signals.length).toBeGreaterThan(0);
    expect(analytic.independentCandidateRefs).not.toContain('fifth-element:R8-test:cross-pathway');
    expect(associative.independentCandidateRefs).not.toContain('fifth-element:R8-test:cross-pathway');
  });

  test('exchange is bounded and does not pass raw unrestricted context',()=>{
    expect(exchange.bounded).toBe(true);
    expect(exchange.rawContextExchange).toBe(false);
    expect(exchange.analyticSignalRefs.length).toBeGreaterThan(0);
    expect(exchange.associativeSignalRefs.length).toBeGreaterThan(0);
  });

  test('fifth-element candidate only exists as a cross-pathway emergence',()=>{
    expect(candidate).not.toBeNull();
    expect(candidate!.novelRelativeToIndependentPaths).toBe(true);
    expect(candidate!.analyticContributionRefs.length).toBeGreaterThan(0);
    expect(candidate!.associativeContributionRefs.length).toBeGreaterThan(0);
    expect(candidate!.combinationSignature.length).toBeGreaterThan(candidate!.analyticIndependentSignature.length);
    expect(candidate!.combinationSignature.length).toBeGreaterThan(candidate!.associativeIndependentSignature.length);
  });

  test('ablating either pathway removes the emergence rather than substituting it',()=>{
    for(const pathway of ['analytic_pathway','associative_pathway'] as const){
      const result=ablateEmergencePathway(candidate!,pathway);
      expect(result.candidateAfter).toBe('absent');
      expect(result.substituted).toBe(false);
    }
  });

  test('contradiction and absence survive into the emergent candidate',()=>{
    expect(candidate!.preservedContradictionFacetRefs.length).toBeGreaterThan(0);
    expect(candidate!.preservedAbsenceFacetRefs.length).toBeGreaterThan(0);
  });

  test('emergence remains provisional, non-persistent and non-totalizing',()=>{
    expect(candidate!.provisional).toBe(true);
    expect(candidate!.persistenceAuthority).toBe(false);
    expect(candidate!.wholePersonAuthority).toBe(false);
    expect(validateFifthElementEmergence(
      field,analytic,associative,exchange,candidate,
    )).toEqual({valid:true,errors:[]});
  });

  test('without either pathway there is no fifth-element candidate',()=>{
    const noAnalytic=generateFifthElementCandidate(
      field,
      {...analytic,signals:[]},
      associative,
      exchangeCallosalSignals({...analytic,signals:[]},associative),
    );
    const noAssociative=generateFifthElementCandidate(
      field,
      analytic,
      {...associative,signals:[]},
      exchangeCallosalSignals(analytic,{...associative,signals:[]}),
    );
    expect(noAnalytic).toBeNull();
    expect(noAssociative).toBeNull();
  });
});
