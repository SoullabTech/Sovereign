import type { BenchmarkCorpusSource } from './corpus';
import type { RetrievedItem } from './scoring';

export interface LaneRankedSource extends RetrievedItem {
  lane: 'lexical' | 'semantic';
}

export interface FusedSource extends RetrievedItem {
  rrfScore: number;
  lexicalRank: number | null;
  semanticRank: number | null;
  lanes: Array<'lexical'|'semantic'>;
}

export function reciprocalRankFusion(
  lexical: RetrievedItem[],
  semantic: RetrievedItem[],
  k = 60,
): FusedSource[] {
  const byRef=new Map<string,FusedSource>();

  const add=(items:RetrievedItem[],lane:'lexical'|'semantic')=>{
    for(const item of items){
      const current=byRef.get(item.sourceRef)??{
        ...item,
        rank:0,
        rrfScore:0,
        lexicalRank:null,
        semanticRank:null,
        lanes:[],
      };
      current.rrfScore += 1/(k+item.rank);
      if(lane==='lexical') current.lexicalRank=item.rank;
      else current.semanticRank=item.rank;
      if(!current.lanes.includes(lane)) current.lanes.push(lane);
      current.tokenEstimate=Math.min(current.tokenEstimate,item.tokenEstimate);
      byRef.set(item.sourceRef,current);
    }
  };

  add(lexical,'lexical');
  add(semantic,'semantic');

  return [...byRef.values()]
    .sort((a,b)=>b.rrfScore-a.rrfScore)
    .map((item,index)=>({...item,rank:index+1}));
}

export interface RerankOptions {
  limit:number;
  dualLaneBonus:number;
  newSourceClassBonus:number;
  newDomainBonus:number;
}

export function callosalRerank(
  fused:FusedSource[],
  corpus:readonly BenchmarkCorpusSource[],
  options:RerankOptions={
    limit:8,
    dualLaneBonus:.006,
    newSourceClassBonus:.004,
    newDomainBonus:.004,
  },
):FusedSource[]{
  const sourceByRef=new Map(corpus.map(s=>[s.sourceRef,s]));
  const remaining=[...fused];
  const selected:FusedSource[]=[];
  const classes=new Set<string>();
  const domains=new Set<string>();

  while(remaining.length&&selected.length<options.limit){
    let bestIndex=0;
    let bestScore=-Infinity;
    for(let i=0;i<remaining.length;i++){
      const item=remaining[i];
      const meta=sourceByRef.get(item.sourceRef);
      const score=
        item.rrfScore+
        (item.lanes.length===2?options.dualLaneBonus:0)+
        (meta&&!classes.has(meta.sourceClass)?options.newSourceClassBonus:0)+
        (meta&&!domains.has(meta.domain)?options.newDomainBonus:0);
      if(score>bestScore){bestScore=score;bestIndex=i;}
    }
    const [picked]=remaining.splice(bestIndex,1);
    const meta=sourceByRef.get(picked.sourceRef);
    if(meta){classes.add(meta.sourceClass);domains.add(meta.domain);}
    selected.push({...picked,rank:selected.length+1});
  }
  return selected;
}

function metadataTokens(source:BenchmarkCorpusSource):Set<string>{
  const text=[
    source.sourceRef,source.sourceClass,source.domain,source.epistemicRole,...source.tags,
  ].join(' ').toLowerCase();
  return new Set(text.match(/[a-z0-9][a-z0-9'_-]*/g)??[]);
}

function queryTokens(query:string):Set<string>{
  return new Set(query.toLowerCase().match(/[a-z0-9][a-z0-9'_-]*/g)??[]);
}

export function metadataOverlap(query:string,source:BenchmarkCorpusSource):number{
  const q=queryTokens(query),s=metadataTokens(source);
  let overlap=0;
  for(const token of q)if(s.has(token))overlap+=1;
  return overlap/Math.max(1,Math.sqrt(q.size*s.size));
}

export interface MetadataRerankOptions {
  limit:number;
  metadataWeight:number;
  dualLaneBonus:number;
}

export function metadataAwareCallosalRerank(
  query:string,
  fused:FusedSource[],
  corpus:readonly BenchmarkCorpusSource[],
  options:MetadataRerankOptions={
    limit:8,
    metadataWeight:.003,
    dualLaneBonus:.001,
  },
):FusedSource[]{
  const sourceByRef=new Map(corpus.map(s=>[s.sourceRef,s]));
  return [...fused]
    .sort((a,b)=>{
      const ma=sourceByRef.get(a.sourceRef),mb=sourceByRef.get(b.sourceRef);
      const sa=a.rrfScore+
        (ma?options.metadataWeight*metadataOverlap(query,ma):0)+
        (a.lanes.length===2?options.dualLaneBonus:0);
      const sb=b.rrfScore+
        (mb?options.metadataWeight*metadataOverlap(query,mb):0)+
        (b.lanes.length===2?options.dualLaneBonus:0);
      return sb-sa;
    })
    .slice(0,options.limit)
    .map((item,index)=>({...item,rank:index+1}));
}
