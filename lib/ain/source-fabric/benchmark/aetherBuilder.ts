import {
  BENCHMARK_CORPUS,
  benchmarkSourceByRef,
  type BenchmarkCorpusSource,
} from './corpus';
import { BENCHMARK_GRAPH_EDGES, type GraphRelation } from './graph';
import {
  BENCHMARK_TEMPORAL_EDGES,
  temporalDisposition,
  type RepresentedTime,
} from './temporalGraph';
import type {
  AetherInput,
  AetherRelationCandidate,
  AetherSourceNode,
} from './aetherInput';

function representedTime(source:BenchmarkCorpusSource):RepresentedTime{
  if(source.temporalStanding==='historical_context')return 'has_been';
  if(source.temporalStanding==='supersession_record')return 'has_been';
  return 'is_being';
}

function relationPredicate(relation:GraphRelation):AetherRelationCandidate['predicate']{
  if(relation==='relational_bridge')return 'resonance';
  if(relation==='symbolic_boundary')return 'contrast';
  if(relation==='evidence_lineage')return 'temporal_sequence';
  if(relation==='governance_lineage')return 'possible_continuity';
  if(relation==='retrieval_lineage')return 'possible_continuity';
  if(relation==='source_provenance')return 'possible_continuity';
  if(relation==='experience_continuity')return 'possible_continuity';
  if(relation==='authorship_sovereignty')return 'possible_continuity';
  return 'comparison';
}

function sourceNode(
  source:BenchmarkCorpusSource,
  temporalNeed:AetherInput['temporalNeed'],
):AetherSourceNode{
  const disposition=temporalDisposition(source.sourceRef);
  const superseded=temporalNeed==='current'&&!disposition.currentClaimEligible;
  return {
    sourceRef:source.sourceRef,
    permission:'admitted',
    epistemicRole:source.epistemicRole,
    representedTime:representedTime(source),
    status:superseded?'superseded':'active',
    reliedUpon:!superseded,
    speakable:true,
    disclosed:true,
    uncertainty:source.authorityRole==='governing'?.05:.15,
  };
}
export function buildAetherInputFromField(
  inquiryRef:string,
  sourceRefs:string[],
  temporalNeed:AetherInput['temporalNeed']='mixed',
):AetherInput{
  const uniqueRefs=[...new Set(sourceRefs)];
  const selected=new Set(uniqueRefs);
  const sources=uniqueRefs.map(ref=>sourceNode(benchmarkSourceByRef(ref),temporalNeed));
  const sourceByRef=new Map(sources.map(s=>[s.sourceRef,s]));
  const relations:AetherRelationCandidate[]=[];

  for(const edge of BENCHMARK_GRAPH_EDGES){
    if(!selected.has(edge.a)||!selected.has(edge.b))continue;
    const a=sourceByRef.get(edge.a)!;
    const b=sourceByRef.get(edge.b)!;
    const historical=a.status==='superseded'||b.status==='superseded';
    relations.push({
      relationRef:'graph:'+edge.relation+':'+edge.a+':'+edge.b,
      endpointRefs:[edge.a,edge.b],
      supportRefs:[edge.a,edge.b],
      criticalSupportRefs:[edge.a,edge.b],
      predicate:relationPredicate(edge.relation),
      standing:edge.relation==='evidence_lineage'?'source_declared':'candidate_unestablished',
      status:'active_candidate',
      claimTemporalNeed:historical?'historical':temporalNeed,
      counterevidenceRefs:[],
      uncertainty:edge.relation==='relational_bridge'?.25:.15,
      introducedBy:edge.relation==='evidence_lineage'?'source_declared':'aether_candidate',
    });
  }

  for(const edge of BENCHMARK_TEMPORAL_EDGES){
    if(!selected.has(edge.from)||!selected.has(edge.to))continue;
    const ref='temporal:'+edge.kind+':'+edge.from+':'+edge.to;
    if(relations.some(r=>r.relationRef===ref))continue;
    relations.push({
      relationRef:ref,
      endpointRefs:[edge.from,edge.to],
      supportRefs:[edge.from,edge.to],
      criticalSupportRefs:[edge.from,edge.to],
      predicate:'temporal_sequence',
      standing:'historical_record',
      status:'active_candidate',
      claimTemporalNeed:'historical',
      counterevidenceRefs:[],
      uncertainty:.05,
      introducedBy:'source_declared',
    });
  }
  const contradictions:AetherInput['contradictions']=[];
  if(selected.has('library-adr')&&selected.has('source-fabric-census')){
    contradictions.push({
      contradictionRef:'contradiction-library-runtime-standing',
      sourceRefs:['library-adr','source-fabric-census'],
      note:'ADR architecture and later live orchestration census must be held with their different time/claim scopes.',
    });
  }

  return {
    inquiryRef,
    temporalNeed,
    sources,
    relations,
    contradictions,
    absences:[],
    corrections:[],
    uncertainties:relations
      .filter(r=>r.standing==='candidate_unestablished')
      .map(r=>({
        uncertaintyRef:'uncertainty:'+r.relationRef,
        subjectRef:r.relationRef,
        note:'Candidate relation remains provisional and source-dependent.',
      })),
    synthesisPermissions:{
      allowCreativeRelation:true,
      allowCausalClaim:false,
      allowPrediction:false,
      allowIdentityClaim:false,
      allowDiagnosticClaim:false,
      allowThirdPartyInteriority:false,
      allowPersistence:false,
      requireAblation:true,
    },
  };
}

export function corpusRefs():string[]{
  return BENCHMARK_CORPUS.map(s=>s.sourceRef);
}
