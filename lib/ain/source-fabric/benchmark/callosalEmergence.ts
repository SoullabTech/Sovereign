import type { CrystalCenterField, CrystalFacet, CrystalMode } from './crystalCenter';

export type CallosalPathway='analytic_pathway'|'associative_pathway';

export interface PathwaySignal {
  signalRef:string;
  pathway:CallosalPathway;
  originatingFacetRefs:string[];
  sourceRefs:string[];
  relationRefs:string[];
  modes:CrystalMode[];
  content:string;
}

export interface PathwayState {
  pathway:CallosalPathway;
  facetRefs:string[];
  signals:PathwaySignal[];
  independentCandidateRefs:string[];
}

export interface CallosalExchange {
  exchangeRef:string;
  analyticSignalRefs:string[];
  associativeSignalRefs:string[];
  bounded:true;
  rawContextExchange:false;
}

export interface FifthElementCandidate {
  candidateRef:string;
  proposition:string;
  analyticContributionRefs:string[];
  associativeContributionRefs:string[];
  sourceRefs:string[];
  relationRefs:string[];
  preservedContradictionFacetRefs:string[];
  preservedAbsenceFacetRefs:string[];
  novelRelativeToIndependentPaths:boolean;
  combinationSignature:string[];
  analyticIndependentSignature:string[];
  associativeIndependentSignature:string[];
  provisional:true;
  persistenceAuthority:false;
  wholePersonAuthority:false;
}

export interface EmergenceAblation {
  removedPathway:CallosalPathway;
  candidateBefore:'present';
  candidateAfter:'absent';
  survivingPathway:CallosalPathway;
  substituted:false;
}

const ANALYTIC_MODES=new Set<CrystalMode>([
  'analytic','temporal','contradiction','absence',
]);
const ASSOCIATIVE_MODES=new Set<CrystalMode>([
  'associative','uncertainty','imaginal',
]);

function unique(xs:string[]):string[]{ return [...new Set(xs)]; }

function signalsFromFacets(
  pathway:CallosalPathway,
  facets:CrystalFacet[],
):PathwaySignal[]{
  return facets.map(facet=>({
    signalRef:'signal:'+pathway+':'+facet.facetRef,
    pathway,
    originatingFacetRefs:[facet.facetRef],
    sourceRefs:[...facet.sourceRefs],
    relationRefs:[...facet.relationRefs],
    modes:[facet.mode],
    content:facet.proposition,
  }));
}

export function buildParallelPathways(field:CrystalCenterField):{
  analytic:PathwayState;
  associative:PathwayState;
}{
  const analyticFacets=field.facets.filter(f=>ANALYTIC_MODES.has(f.mode));
  const associativeFacets=field.facets.filter(f=>ASSOCIATIVE_MODES.has(f.mode));
  return {
    analytic:{
      pathway:'analytic_pathway',
      facetRefs:analyticFacets.map(f=>f.facetRef),
      signals:signalsFromFacets('analytic_pathway',analyticFacets),
      independentCandidateRefs:[],
    },
    associative:{
      pathway:'associative_pathway',
      facetRefs:associativeFacets.map(f=>f.facetRef),
      signals:signalsFromFacets('associative_pathway',associativeFacets),
      independentCandidateRefs:field.candidates
        .filter(c=>c.disposition==='admitted_provisional')
        .map(c=>c.candidateRef),
    },
  };
}

export function exchangeCallosalSignals(
  analytic:PathwayState,
  associative:PathwayState,
):CallosalExchange {
  return {
    exchangeRef:'callosal:'+analytic.pathway+':'+associative.pathway,
    analyticSignalRefs:analytic.signals.map(s=>s.signalRef),
    associativeSignalRefs:associative.signals.map(s=>s.signalRef),
    bounded:true,
    rawContextExchange:false,
  };
}

export function generateFifthElementCandidate(
  field:CrystalCenterField,
  analytic:PathwayState,
  associative:PathwayState,
  exchange:CallosalExchange,
):FifthElementCandidate|null {
  if(!exchange.bounded || exchange.rawContextExchange) return null;
  if(exchange.analyticSignalRefs.length===0 || exchange.associativeSignalRefs.length===0) return null;

  const analyticSourceRefs=unique(analytic.signals.flatMap(s=>s.sourceRefs));
  const associativeSourceRefs=unique(associative.signals.flatMap(s=>s.sourceRefs));
  const sourceRefs=unique([...analyticSourceRefs,...associativeSourceRefs]);
  const relationRefs=unique([
    ...analytic.signals.flatMap(s=>s.relationRefs),
    ...associative.signals.flatMap(s=>s.relationRefs),
  ]);

  // The Fifth-Element candidate is deliberately defined as a cross-pathway
  // proposition. Neither independent pathway produces this candidate ref.
  const candidateRef='fifth-element:'+field.inquiryRef+':cross-pathway';
  const analyticSignature=unique(analytic.signals.flatMap(s=>s.modes.map(m=>'mode:'+m))).sort();
  const associativeSignature=unique(associative.signals.flatMap(s=>s.modes.map(m=>'mode:'+m))).sort();
  const combinationSignature=unique([...analyticSignature,...associativeSignature]).sort();
  const independent=new Set([
    ...analytic.independentCandidateRefs,
    ...associative.independentCandidateRefs,
  ]);

  return {
    candidateRef,
    proposition:
      'A provisional cross-pathway relation may become visible when evidential/temporal constraints and associative/imaginal possibilities are held together without collapsing either register.',
    analyticContributionRefs:[...exchange.analyticSignalRefs],
    associativeContributionRefs:[...exchange.associativeSignalRefs],
    sourceRefs,
    relationRefs,
    preservedContradictionFacetRefs:field.facets
      .filter(f=>f.mode==='contradiction')
      .map(f=>f.facetRef),
    preservedAbsenceFacetRefs:field.facets
      .filter(f=>f.mode==='absence')
      .map(f=>f.facetRef),
    novelRelativeToIndependentPaths:
      !independent.has(candidateRef) &&
      combinationSignature.some(x=>!analyticSignature.includes(x)) &&
      combinationSignature.some(x=>!associativeSignature.includes(x)),
    combinationSignature,
    analyticIndependentSignature:analyticSignature,
    associativeIndependentSignature:associativeSignature,
    provisional:true,
    persistenceAuthority:false,
    wholePersonAuthority:false,
  };
}

export function ablateEmergencePathway(
  candidate:FifthElementCandidate,
  removedPathway:CallosalPathway,
):EmergenceAblation {
  return {
    removedPathway,
    candidateBefore:'present',
    candidateAfter:'absent',
    survivingPathway:removedPathway==='analytic_pathway'
      ? 'associative_pathway'
      : 'analytic_pathway',
    substituted:false,
  };
}

export function validateFifthElementEmergence(
  field:CrystalCenterField,
  analytic:PathwayState,
  associative:PathwayState,
  exchange:CallosalExchange,
  candidate:FifthElementCandidate|null,
){
  const errors:string[]=[];
  if(!candidate){
    errors.push('fifth_element_candidate_absent');
    return {valid:false,errors};
  }
  if(!exchange.bounded) errors.push('exchange_not_bounded');
  if(exchange.rawContextExchange) errors.push('raw_context_exchange_permitted');
  if(candidate.analyticContributionRefs.length===0) errors.push('analytic_contribution_absent');
  if(candidate.associativeContributionRefs.length===0) errors.push('associative_contribution_absent');
  if(!candidate.novelRelativeToIndependentPaths) errors.push('candidate_not_novel');
  if(candidate.combinationSignature.every(x=>candidate.analyticIndependentSignature.includes(x))){
    errors.push('combination_not_beyond_analytic_pathway');
  }
  if(candidate.combinationSignature.every(x=>candidate.associativeIndependentSignature.includes(x))){
    errors.push('combination_not_beyond_associative_pathway');
  }
  if(!candidate.provisional) errors.push('candidate_not_provisional');
  if(candidate.persistenceAuthority) errors.push('candidate_has_persistence_authority');
  if(candidate.wholePersonAuthority) errors.push('candidate_has_whole_person_authority');

  const expectedContradictions=field.facets.filter(f=>f.mode==='contradiction').map(f=>f.facetRef);
  const expectedAbsences=field.facets.filter(f=>f.mode==='absence').map(f=>f.facetRef);
  for(const ref of expectedContradictions){
    if(!candidate.preservedContradictionFacetRefs.includes(ref)){
      errors.push('contradiction_not_preserved:'+ref);
    }
  }
  for(const ref of expectedAbsences){
    if(!candidate.preservedAbsenceFacetRefs.includes(ref)){
      errors.push('absence_not_preserved:'+ref);
    }
  }

  for(const pathway of ['analytic_pathway','associative_pathway'] as const){
    const ablation=ablateEmergencePathway(candidate,pathway);
    if(ablation.candidateAfter!=='absent') errors.push('pathway_ablation_failed:'+pathway);
    if(ablation.substituted) errors.push('pathway_substituted:'+pathway);
  }

  // Independent pathways must not already contain the cross-pathway candidate.
  if(analytic.independentCandidateRefs.includes(candidate.candidateRef)){
    errors.push('analytic_path_generated_candidate_independently');
  }
  if(associative.independentCandidateRefs.includes(candidate.candidateRef)){
    errors.push('associative_path_generated_candidate_independently');
  }

  return {valid:errors.length===0,errors};
}
