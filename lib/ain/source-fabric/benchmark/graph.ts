import type { BenchmarkCorpusSource } from './corpus';

export type GraphRelation =
  | 'constitutional_kin'
  | 'governance_lineage'
  | 'source_provenance'
  | 'relational_bridge'
  | 'experience_continuity'
  | 'evidence_lineage'
  | 'retrieval_lineage'
  | 'symbolic_boundary'
  | 'authorship_sovereignty';

export interface BenchmarkGraphEdge {
  a:string;
  b:string;
  relation:GraphRelation;
  basis:'declared_benchmark_relation';
}

export const BENCHMARK_GRAPH_EDGES:readonly BenchmarkGraphEdge[]=[
  {a:'authority-law',b:'interface-humility',relation:'constitutional_kin',basis:'declared_benchmark_relation'},
  {a:'authority-law',b:'direction-authority',relation:'constitutional_kin',basis:'declared_benchmark_relation'},
  {a:'authority-law',b:'source-fabric',relation:'governance_lineage',basis:'declared_benchmark_relation'},
  {a:'authority-law',b:'dream-object',relation:'symbolic_boundary',basis:'declared_benchmark_relation'},
  {a:'direction-authority',b:'memory-consent',relation:'constitutional_kin',basis:'declared_benchmark_relation'},
  {a:'direction-authority',b:'teaching-constitution',relation:'constitutional_kin',basis:'declared_benchmark_relation'},
  {a:'direction-authority',b:'writers-studio',relation:'authorship_sovereignty',basis:'declared_benchmark_relation'},
  {a:'memory-consent',b:'remain-unpossessed',relation:'constitutional_kin',basis:'declared_benchmark_relation'},
  {a:'memory-consent',b:'writers-studio',relation:'authorship_sovereignty',basis:'declared_benchmark_relation'},
  {a:'teaching-constitution',b:'writers-studio',relation:'authorship_sovereignty',basis:'declared_benchmark_relation'},
  {a:'source-fabric',b:'indra-permeability',relation:'governance_lineage',basis:'declared_benchmark_relation'},
  {a:'source-fabric',b:'benchmark-contract',relation:'retrieval_lineage',basis:'declared_benchmark_relation'},
  {a:'source-fabric',b:'source-fabric-census',relation:'retrieval_lineage',basis:'declared_benchmark_relation'},
  {a:'source-fabric',b:'library-adr',relation:'retrieval_lineage',basis:'declared_benchmark_relation'},
  {a:'library-adr',b:'source-fabric-census',relation:'retrieval_lineage',basis:'declared_benchmark_relation'},
  {a:'source-fabric',b:'astrology-contract',relation:'symbolic_boundary',basis:'declared_benchmark_relation'},
  {a:'source-fabric',b:'dream-object',relation:'symbolic_boundary',basis:'declared_benchmark_relation'},
  {a:'source-fabric',b:'divination-return',relation:'symbolic_boundary',basis:'declared_benchmark_relation'},
  {a:'rgr-note',b:'rgr-constitution',relation:'evidence_lineage',basis:'declared_benchmark_relation'},
  {a:'rgr-note',b:'indra-grammar',relation:'relational_bridge',basis:'declared_benchmark_relation'},
  {a:'rgr-constitution',b:'indra-grammar',relation:'relational_bridge',basis:'declared_benchmark_relation'},
  {a:'indra-grammar',b:'indra-permeability',relation:'governance_lineage',basis:'declared_benchmark_relation'},
  {a:'indra-grammar',b:'indra-composer',relation:'relational_bridge',basis:'declared_benchmark_relation'},
  {a:'indra-composer',b:'indra-validation',relation:'evidence_lineage',basis:'declared_benchmark_relation'},
  {a:'indra-validation',b:'indra-topology',relation:'evidence_lineage',basis:'declared_benchmark_relation'},
  {a:'facet-crossings',b:'indra-grammar',relation:'experience_continuity',basis:'declared_benchmark_relation'},
  {a:'facet-crossings',b:'divination-return',relation:'source_provenance',basis:'declared_benchmark_relation'},
  {a:'facet-crossings',b:'dream-object',relation:'source_provenance',basis:'declared_benchmark_relation'},
  {a:'ea-canon',b:'ea-manuscript',relation:'source_provenance',basis:'declared_benchmark_relation'},
  {a:'ea-canon',b:'source-fabric',relation:'retrieval_lineage',basis:'declared_benchmark_relation'},
  {a:'j9-adjudication',b:'authority-law',relation:'evidence_lineage',basis:'declared_benchmark_relation'},
  {a:'j11-reconciliation',b:'authority-law',relation:'evidence_lineage',basis:'declared_benchmark_relation'},
  {a:'j11-reconciliation',b:'library-adr',relation:'retrieval_lineage',basis:'declared_benchmark_relation'},
];

export type CommunityId =
  | 'sovereignty_authority'
  | 'relational_center'
  | 'symbolic_facets'
  | 'provenance_crossing'
  | 'retrieval_architecture'
  | 'authorship_learning'
  | 'elemental_alchemy';

export const BENCHMARK_COMMUNITIES:Record<CommunityId,readonly string[]>={
  sovereignty_authority:[
    'authority-law','interface-humility','remain-unpossessed','direction-authority',
    'memory-consent','teaching-constitution','source-fabric',
  ],
  relational_center:[
    'rgr-note','rgr-constitution','indra-grammar','indra-permeability',
    'indra-composer','indra-validation','indra-topology','facet-crossings',
  ],
  symbolic_facets:[
    'dream-object','astrology-contract','divination-return','source-fabric','indra-validation',
  ],
  provenance_crossing:[
    'facet-crossings','ea-canon','indra-grammar','divination-return','dream-object','source-fabric',
  ],
  retrieval_architecture:[
    'library-adr','source-fabric-census','source-fabric','benchmark-contract',
    'j9-adjudication','j11-reconciliation',
  ],
  authorship_learning:[
    'writers-studio','teaching-constitution','direction-authority','memory-consent','interface-humility',
  ],
  elemental_alchemy:[
    'ea-manuscript','ea-canon','rgr-note',
  ],
};

export interface GraphNeighbor {
  sourceRef:string;
  seedRef:string;
  relation:GraphRelation;
  basis:'declared_benchmark_relation';
}

export function oneHopNeighbors(seedRef:string):GraphNeighbor[]{
  const out:GraphNeighbor[]=[];
  for(const edge of BENCHMARK_GRAPH_EDGES){
    if(edge.a===seedRef)out.push({sourceRef:edge.b,seedRef,relation:edge.relation,basis:edge.basis});
    else if(edge.b===seedRef)out.push({sourceRef:edge.a,seedRef,relation:edge.relation,basis:edge.basis});
  }
  return out;
}
export function boundedOneHopExpansion(
  seedRefs:string[],
  options:{seedLimit:number;neighborsPerSeed:number;allowed:(ref:string)=>boolean},
):GraphNeighbor[]{
  const seen=new Set(seedRefs);
  const out:GraphNeighbor[]=[];
  for(const seedRef of seedRefs.slice(0,options.seedLimit)){
    let used=0;
    for(const neighbor of oneHopNeighbors(seedRef)){
      if(used>=options.neighborsPerSeed)break;
      if(seen.has(neighbor.sourceRef))continue;
      if(!options.allowed(neighbor.sourceRef))continue;
      seen.add(neighbor.sourceRef);
      out.push(neighbor);
      used+=1;
    }
  }
  return out;
}

export function communitiesFor(ref:string):CommunityId[]{
  return (Object.entries(BENCHMARK_COMMUNITIES) as Array<[CommunityId,readonly string[]]>)
    .filter(([,refs])=>refs.includes(ref))
    .map(([id])=>id);
}

export function validateBenchmarkGraph(corpus:readonly BenchmarkCorpusSource[]):void{
  const refs=new Set(corpus.map(s=>s.sourceRef));
  for(const edge of BENCHMARK_GRAPH_EDGES){
    if(!refs.has(edge.a)||!refs.has(edge.b))throw new Error('GRAPH_UNKNOWN_SOURCE');
    if(edge.a===edge.b)throw new Error('GRAPH_SELF_EDGE');
  }
  for(const communityRefs of Object.values(BENCHMARK_COMMUNITIES)){
    for(const ref of communityRefs)if(!refs.has(ref))throw new Error('COMMUNITY_UNKNOWN_SOURCE');
  }
}
