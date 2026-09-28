import { benchmarkSourceByRef } from './corpus';

export interface SourceClaim {
  claimRef:string;
  sourceRef:string;
  claim:string;
  semanticAnchors:string[];
  contribution:'architectural_direction'|'current_state'|'governance'|'historical_qualification';
  temporalQualifier:string;
}

export interface SemanticProposition {
  propositionRef:string;
  proposition:string;
  claimRefs:string[];
  sourceRefs:string[];
  uncertainty:string;
  contradictionNote:string|null;
  absenceNote:string|null;
  provisional:true;
  persistenceAuthority:false;
  wholePersonAuthority:false;
}

export interface HumanLegibleProvenance {
  propositionRef:string;
  proposition:string;
  whyThisRelation:string;
  sources:Array<{
    sourceRef:string;
    path:string;
    contribution:string;
    claim:string;
    temporalQualifier:string;
    whyItMattered:string;
  }>;
  counterfactuals:Array<{
    removedSourceRef:string;
    effect:string;
  }>;
  contradiction:string|null;
  absence:string|null;
  uncertainty:string;
  humanReview:{
    required:true;
    questions:string[];
  };
}

export const SOURCE_CLAIMS:readonly SourceClaim[]=[
  {
    claimRef:'library-adr:one-engine',
    sourceRef:'library-adr',
    claim:'The architecture chooses one knowledge-ingestion and retrieval engine, canonicalized on the library_* pipeline and parameterized by ownership and scope.',
    semanticAnchors:['one','knowledge','retrieval','engine','library','scope'],
    contribution:'architectural_direction',
    temporalQualifier:'Accepted architectural direction from 2026-06-27; implementation was designed, not yet fully built at that record.',
  },
  {
    claimRef:'source-fabric-census:fallback-not-fused',
    sourceRef:'source-fabric-census',
    claim:'The current Library substrate has semantic and full-text retrieval machinery, but top-level orchestration is semantic-first with full-text fallback rather than fused hybrid ranking.',
    semanticAnchors:['semantic','full-text','fallback','fused','hybrid','ranking'],
    contribution:'current_state',
    temporalQualifier:'Verified current-state census on 2026-09-28.',
  },
  {
    claimRef:'source-fabric:govern-not-third-engine',
    sourceRef:'source-fabric',
    claim:'Source Fabric is a governance and orchestration layer over the existing library_* substrate, not a third retrieval engine; discovery does not itself grant permission to use a source.',
    semanticAnchors:['governance','orchestration','library','not','third','engine','permission'],
    contribution:'governance',
    temporalQualifier:'Current Source Fabric constitutional contract.',
  },
  {
    claimRef:'j11:historical-runtime-scope',
    sourceRef:'j11-reconciliation',
    claim:'Historical runtime-state claims in J9 and J10 remain evidence about their historical anchors and must not be reasserted as current production standing without re-witness.',
    semanticAnchors:['historical','runtime','claims','current','production','re-witness'],
    contribution:'historical_qualification',
    temporalQualifier:'Supersession/reconciliation record; used to qualify historical evidence, not as current runtime state.',
  },
] as const;

function unique<T>(xs:T[]):T[]{ return [...new Set(xs)]; }

export function claimsForSources(sourceRefs:string[]):SourceClaim[]{
  const allowed=new Set(sourceRefs);
  return SOURCE_CLAIMS.filter(claim=>allowed.has(claim.sourceRef));
}

export function composeRetrievalSemanticProposition(
  sourceRefs:string[],
):SemanticProposition|null {
  const claims=claimsForSources(sourceRefs);
  const byRef=new Map(claims.map(c=>[c.claimRef,c]));
  const required=[
    'library-adr:one-engine',
    'source-fabric-census:fallback-not-fused',
    'source-fabric:govern-not-third-engine',
  ];
  if(required.some(ref=>!byRef.has(ref))) return null;

  const historical=byRef.get('j11:historical-runtime-scope');
  const proposition=[
    'The retrieval architecture is converging on one governed knowledge engine rather than adding another stack:',
    'the earlier ADR establishes library_* as the canonical engine across scopes,',
    'while the later census shows that semantic and full-text capabilities are present but still orchestrated as fallback rather than fused hybrid ranking.',
    'Source Fabric therefore belongs above that substrate as governance and orchestration, where relevance discovery remains distinct from permission.',
    historical
      ? 'Historical runtime claims remain time-scoped evidence and must not be imported as current production standing without re-witness.'
      : '',
  ].filter(Boolean).join(' ');

  return {
    propositionRef:'r10:retrieval-semantic-fidelity',
    proposition,
    claimRefs:claims.map(c=>c.claimRef),
    sourceRefs:unique(claims.map(c=>c.sourceRef)),
    uncertainty:'This proposition describes the relation among documented architectural direction, witnessed current substrate behavior, and governance constraints; it does not assert unverified runtime implementation beyond those records.',
    contradictionNote:'The architecture aims at one governed retrieval engine, while the current census still records incomplete hybrid orchestration and historical evidence of bypass paths.',
    absenceNote:'No claim is made here that fused hybrid ranking, full Source Fabric runtime orchestration, or migration completion is already live.',
    provisional:true,
    persistenceAuthority:false,
    wholePersonAuthority:false,
  };
}

export function validateSemanticFidelity(
  proposition:SemanticProposition,
):{valid:boolean;errors:string[]} {
  const errors:string[]=[];
  const claims=proposition.claimRefs
    .map(ref=>SOURCE_CLAIMS.find(c=>c.claimRef===ref))
    .filter((x):x is SourceClaim=>!!x);
  if(claims.length!==proposition.claimRefs.length) errors.push('unknown_claim_ref');
  const sourceSet=new Set(proposition.sourceRefs);
  for(const claim of claims){
    if(!sourceSet.has(claim.sourceRef)) errors.push('claim_source_not_declared:'+claim.claimRef);
    const hit=claim.semanticAnchors.filter(anchor=>
      proposition.proposition.toLowerCase().includes(anchor.toLowerCase())
    );
    if(hit.length<Math.min(2,claim.semanticAnchors.length)){
      errors.push('insufficient_semantic_carry:'+claim.claimRef);
    }
  }
  const architectureOnly=/pathway|crystal center|corpus callosum/i.test(proposition.proposition) &&
    !/retrieval|library|semantic|full-text|permission|historical/i.test(proposition.proposition);
  if(architectureOnly) errors.push('architecture_language_without_source_content');
  if(!proposition.contradictionNote) errors.push('contradiction_not_visible');
  if(!proposition.absenceNote) errors.push('absence_not_visible');
  if(!proposition.provisional) errors.push('not_provisional');
  if(proposition.persistenceAuthority) errors.push('persistence_authority_granted');
  if(proposition.wholePersonAuthority) errors.push('whole_person_authority_granted');
  return {valid:errors.length===0,errors};
}

export function buildHumanLegibleProvenance(
  proposition:SemanticProposition,
):HumanLegibleProvenance {
  const claims=proposition.claimRefs.map(ref=>{
    const claim=SOURCE_CLAIMS.find(c=>c.claimRef===ref);
    if(!claim) throw new Error('UNKNOWN_CLAIM:'+ref);
    const source=benchmarkSourceByRef(claim.sourceRef);
    return {
      sourceRef:claim.sourceRef,
      path:source.path,
      contribution:claim.contribution,
      claim:claim.claim,
      temporalQualifier:claim.temporalQualifier,
      whyItMattered:
        claim.contribution==='architectural_direction'
          ? 'It establishes the intended retrieval architecture against which later state is compared.'
          : claim.contribution==='current_state'
            ? 'It constrains the proposition to what the repository was actually witnessed doing at the later census.'
            : claim.contribution==='governance'
              ? 'It explains why the new layer governs retrieval rather than duplicating the retrieval engine.'
              : 'It prevents historical runtime evidence from masquerading as current standing.',
    };
  });

  return {
    propositionRef:proposition.propositionRef,
    proposition:proposition.proposition,
    whyThisRelation:'The proposition is admitted because architectural direction, witnessed substrate state, and governance law jointly support a specific retrieval conclusion that none of those source roles states alone.',
    sources:claims,
    counterfactuals:claims.map(source=>({
      removedSourceRef:source.sourceRef,
      effect:
        source.contribution==='architectural_direction'
          ? 'The proposition loses its evidence for the one-engine architectural direction.'
          : source.contribution==='current_state'
            ? 'The proposition can no longer claim the later observed fallback-not-fused substrate state.'
            : source.contribution==='governance'
              ? 'The proposition loses its basis for placing Source Fabric above, rather than beside, the retrieval substrate.'
              : 'The proposition loses its explicit warning against treating historical runtime claims as current.',
    })),
    contradiction:proposition.contradictionNote,
    absence:proposition.absenceNote,
    uncertainty:proposition.uncertainty,
    humanReview:{
      required:true,
      questions:[
        'Does each source summary accurately represent the cited source?',
        'Does the proposition add a relation rather than merely concatenate the source summaries?',
        'Are temporal qualifications preserved?',
        'Are contradiction and absence visible rather than smoothed away?',
        'Would removing a named source change the proposition in the counterfactual way claimed?',
        'Does the proposition avoid claiming implementation or authority not supported by the sources?',
      ],
    },
  };
}

export function ablateSemanticSource(
  proposition:SemanticProposition,
  removedSourceRef:string,
):SemanticProposition|null {
  const remaining=proposition.sourceRefs.filter(ref=>ref!==removedSourceRef);
  return composeRetrievalSemanticProposition(remaining);
}
