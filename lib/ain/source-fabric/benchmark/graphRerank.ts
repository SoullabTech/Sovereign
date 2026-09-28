import type { BenchmarkCorpusSource } from './corpus';
import type { FusedSource } from './fusion';
import { metadataOverlap } from './fusion';
import {
  boundedOneHopExpansion,
  communitiesFor,
  type CommunityId,
  type GraphNeighbor,
} from './graph';

export interface GraphAwareOptions {
  limit:number;
  seedLimit:number;
  neighborsPerSeed:number;
  metadataWeight:number;
  dualLaneBonus:number;
  graphBonus:number;
  communityBonus:number;
  enableCommunity:boolean;
}

export interface GraphAwareResult {
  ranked:FusedSource[];
  seeds:string[];
  expanded:GraphNeighbor[];
  activeCommunities:CommunityId[];
}

export function graphAwareRerank(
  query:string,
  fused:FusedSource[],
  corpus:readonly BenchmarkCorpusSource[],
  allowed:(ref:string)=>boolean,
  options:GraphAwareOptions,
):GraphAwareResult{
  const sourceByRef=new Map(corpus.map(s=>[s.sourceRef,s]));
  const seeds=fused.slice(0,options.seedLimit).map(x=>x.sourceRef);

  const expanded=boundedOneHopExpansion(seeds,{
    seedLimit:options.seedLimit,
    neighborsPerSeed:options.neighborsPerSeed,
    allowed,
  });
  const graphRefs=new Set(expanded.map(x=>x.sourceRef));
  const communityCounts=new Map<CommunityId,number>();
  for(const seed of seeds){
    for(const community of communitiesFor(seed)){
      communityCounts.set(community,(communityCounts.get(community)??0)+1);
    }
  }
  const activeCommunities=options.enableCommunity
    ? [...communityCounts.entries()].filter(([,count])=>count>=2).map(([id])=>id)
    : [];
  const activeSet=new Set(activeCommunities);

  const communityHit=(ref:string):boolean=>
    communitiesFor(ref).some(id=>activeSet.has(id));

  const ranked=[...fused]
    .filter(item=>allowed(item.sourceRef))
    .sort((a,b)=>{
      const ma=sourceByRef.get(a.sourceRef),mb=sourceByRef.get(b.sourceRef);
      const sa=
        a.rrfScore+
        (ma?options.metadataWeight*metadataOverlap(query,ma):0)+
        (a.lanes.length===2?options.dualLaneBonus:0)+
        (graphRefs.has(a.sourceRef)?options.graphBonus:0)+
        (communityHit(a.sourceRef)?options.communityBonus:0);
      const sb=
        b.rrfScore+
        (mb?options.metadataWeight*metadataOverlap(query,mb):0)+
        (b.lanes.length===2?options.dualLaneBonus:0)+
        (graphRefs.has(b.sourceRef)?options.graphBonus:0)+
        (communityHit(b.sourceRef)?options.communityBonus:0);
      return sb-sa;
    })
    .slice(0,options.limit)
    .map((item,index)=>({...item,rank:index+1}));

  return {ranked,seeds,expanded,activeCommunities};
}
