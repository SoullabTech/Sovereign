import type { CrystalCenterField } from './crystalCenter';
import {
  buildParallelPathways,
  exchangeCallosalSignals,
  generateFifthElementCandidate,
  type FifthElementCandidate,
  type PathwayState,
} from './callosalEmergence';

export interface EmergenceQuality {
  valid:boolean;
  reasons:string[];
  effectiveSupportRefs:string[];
  contextualOnlyRefs:string[];
  bridgeRelationRefs:string[];
  nontrivialSignature:string[];
  trivialRestatement:boolean;
}

function unique(xs:string[]):string[]{ return [...new Set(xs)]; }

function sourceRefs(pathway:PathwayState):string[]{
  return unique(pathway.signals.flatMap(signal=>signal.sourceRefs));
}

export function evaluateEmergenceQuality(
  field:CrystalCenterField,
  candidate:FifthElementCandidate|null,
):EmergenceQuality {
  const reasons:string[]=[];
  const {analytic,associative}=buildParallelPathways(field);
  const analyticRefs=new Set(sourceRefs(analytic));
  const associativeRefs=new Set(sourceRefs(associative));
  const allRefs=unique([...analyticRefs,...associativeRefs]);

  // Effective support requires actual participation in both the evidential and
  // relational pathways. Merely being present in the field is contextual only.
  const effectiveSupportRefs=allRefs
    .filter(ref=>analyticRefs.has(ref)&&associativeRefs.has(ref))
    .sort();
  const contextualOnlyRefs=allRefs
    .filter(ref=>!effectiveSupportRefs.includes(ref))
    .sort();

  const bridgeRelationRefs=unique(
    associative.signals.flatMap(signal=>signal.relationRefs),
  ).sort();

  const contradictionCount=field.facets.filter(f=>f.mode==='contradiction').length;
  const absenceCount=field.facets.filter(f=>f.mode==='absence').length;
  const temporalCount=field.facets.filter(f=>f.mode==='temporal').length;

  const nontrivialSignature=[
    ...bridgeRelationRefs.map(ref=>'relation:'+ref),
    ...(contradictionCount?['constraint:contradiction']:[]),
    ...(absenceCount?['constraint:absence']:[]),
    ...(temporalCount?['constraint:temporal']:[]),
  ].sort();

  if(!candidate) reasons.push('candidate_absent');
  if(effectiveSupportRefs.length<2) reasons.push('insufficient_effective_cross_pathway_support');
  if(bridgeRelationRefs.length===0) reasons.push('no_bridge_relation');
  if(nontrivialSignature.length<2) reasons.push('signature_too_trivial');

  // A candidate is a trivial restatement if its only novelty is that both
  // pathway labels exist, with no source relation or constraint content.
  const trivialRestatement=
    bridgeRelationRefs.length===0 ||
    (nontrivialSignature.length===1 && nontrivialSignature[0].startsWith('relation:')===false);
  if(trivialRestatement) reasons.push('trivial_pathway_restatement');

  return {
    valid:reasons.length===0,
    reasons,
    effectiveSupportRefs,
    contextualOnlyRefs,
    bridgeRelationRefs,
    nontrivialSignature,
    trivialRestatement,
  };
}

export function regenerateWithoutSources(
  field:CrystalCenterField,
  removedRefs:string[],
):FifthElementCandidate|null {
  const removed=new Set(removedRefs);

  // First identify every relation whose source support was cut.
  const removedRelationRefs=new Set(
    field.facets
      .filter(f=>f.sourceRefs.some(ref=>removed.has(ref)))
      .flatMap(f=>f.relationRefs),
  );
  for(const candidate of field.candidates){
    if(candidate.supportRefs.some(ref=>removed.has(ref))){
      removedRelationRefs.add(candidate.relationRef);
    }
  }

  // Then cascade the ablation through derivative facets. An uncertainty or
  // imaginal trace may not outlive the relation that produced it.
  const nextFacets=field.facets.filter(f=>
    !f.sourceRefs.some(ref=>removed.has(ref)) &&
    !f.relationRefs.some(ref=>removedRelationRefs.has(ref))
  );
  const nextCandidates=field.candidates.filter(c=>
    !c.supportRefs.some(ref=>removed.has(ref)) &&
    !removedRelationRefs.has(c.relationRef)
  );

  const next={...field,facets:nextFacets,candidates:nextCandidates};
  const {analytic,associative}=buildParallelPathways(next);
  const exchange=exchangeCallosalSignals(analytic,associative);
  return generateFifthElementCandidate(next,analytic,associative,exchange);
}

export function distractorInvariant(
  field:CrystalCenterField,
  distractorRef:string,
):{valid:boolean;reason:string|null}{
  const candidate=regenerateWithoutSources(field,[distractorRef]);
  if(!candidate) return {valid:false,reason:'distractor_removal_destroyed_candidate'};
  const quality=evaluateEmergenceQuality(field,candidate);
  if(quality.effectiveSupportRefs.includes(distractorRef)){
    return {valid:false,reason:'distractor_promoted_to_effective_support'};
  }
  return {valid:true,reason:null};
}

export function bridgeAblation(
  field:CrystalCenterField,
  bridgeRefs:string[],
):{candidateAfter:FifthElementCandidate|null;qualityAfter:EmergenceQuality}{
  const candidateAfter=regenerateWithoutSources(field,bridgeRefs);
  return {
    candidateAfter,
    qualityAfter:evaluateEmergenceQuality(field,candidateAfter),
  };
}
