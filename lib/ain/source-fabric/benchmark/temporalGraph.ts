import type { BenchmarkCorpusSource } from './corpus';

export type RepresentedTime =
  | 'has_been'
  | 'is_being'
  | 'is_becoming'
  | 'atemporal_symbolic'
  | 'historical_external'
  | 'unknown_time';

export type TemporalEdgeKind =
  | 'precedes'
  | 'evidence_successor'
  | 'corrects'
  | 'supersedes'
  | 'revokes';

export type TemporalScope =
  | 'current_claim'
  | 'relation'
  | 'permission'
  | 'all';

export interface TemporalEdge {
  from:string;
  to:string;
  kind:TemporalEdgeKind;
  scope:TemporalScope;
  basis:'declared_benchmark_temporal_relation';
  note:string;
}

export const BENCHMARK_TEMPORAL_EDGES:readonly TemporalEdge[]=[
  {
    from:'j11-reconciliation',
    to:'j9-adjudication',
    kind:'corrects',
    scope:'current_claim',
    basis:'declared_benchmark_temporal_relation',
    note:'J11 records later reconciliation and corrects historical retrieval-authority evidence from J9.',
  },
  {
    from:'authority-law',
    to:'j9-adjudication',
    kind:'supersedes',
    scope:'current_claim',
    basis:'declared_benchmark_temporal_relation',
    note:'Current canon governs present doctrine; J9 remains historical adjudication evidence.',
  },
  {
    from:'source-fabric-census',
    to:'library-adr',
    kind:'evidence_successor',
    scope:'current_claim',
    basis:'declared_benchmark_temporal_relation',
    note:'The later census reports current implementation behavior without withdrawing ADR 004.',
  },
  {
    from:'indra-validation',
    to:'indra-composer',
    kind:'evidence_successor',
    scope:'relation',
    basis:'declared_benchmark_temporal_relation',
    note:'Technical validation follows the composer contract as evidence rather than replacement.',
  },
  {
    from:'indra-topology',
    to:'indra-validation',
    kind:'evidence_successor',
    scope:'relation',
    basis:'declared_benchmark_temporal_relation',
    note:'Topology-aware witness follows technical validation without erasing it.',
  },
];

export interface TemporalDisposition {
  sourceRef:string;
  currentClaimEligible:boolean;
  historicalVisible:boolean;
  supersededBy:string[];
  correctedBy:string[];
  revokedBy:string[];
}

export function temporalDisposition(
  sourceRef:string,
  edges:readonly TemporalEdge[]=BENCHMARK_TEMPORAL_EDGES,
):TemporalDisposition{
  const targeting=edges.filter(e=>e.to===sourceRef);
  const supersededBy=targeting.filter(e=>e.kind==='supersedes'&&(e.scope==='current_claim'||e.scope==='all')).map(e=>e.from);
  const correctedBy=targeting.filter(e=>e.kind==='corrects'&&(e.scope==='current_claim'||e.scope==='all')).map(e=>e.from);
  const revokedBy=targeting.filter(e=>e.kind==='revokes').map(e=>e.from);
  return {
    sourceRef,
    currentClaimEligible:supersededBy.length===0&&revokedBy.length===0,
    historicalVisible:true,
    supersededBy,
    correctedBy,
    revokedBy,
  };
}

export function activeForTemporalNeed(
  sourceRef:string,
  need:'current'|'historical'|'prospective'|'mixed',
  edges:readonly TemporalEdge[]=BENCHMARK_TEMPORAL_EDGES,
):boolean{
  if(need==='historical'||need==='mixed')return true;
  if(need==='prospective')return temporalDisposition(sourceRef,edges).revokedBy.length===0;
  return temporalDisposition(sourceRef,edges).currentClaimEligible;
}

export function temporalEdgesFor(ref:string):TemporalEdge[]{
  return BENCHMARK_TEMPORAL_EDGES.filter(e=>e.from===ref||e.to===ref);
}

export function validateTemporalGraph(corpus:readonly BenchmarkCorpusSource[]):void{
  const refs=new Set(corpus.map(s=>s.sourceRef));
  for(const edge of BENCHMARK_TEMPORAL_EDGES){
    if(!refs.has(edge.from)||!refs.has(edge.to))throw new Error('TEMPORAL_UNKNOWN_SOURCE');
    if(edge.from===edge.to)throw new Error('TEMPORAL_SELF_EDGE');
  }
}
