import type { GoldBenchmarkQuery } from './goldQueries';
import type { BenchmarkChunk } from './chunking';
import type { RetrievedItem } from './scoring';

export interface ScoredChunk {
  chunk: BenchmarkChunk;
  score: number;
}

const WORD=/[a-z0-9][a-z0-9'_-]*/g;

export function tokenize(text:string):string[]{
  return (text.toLowerCase().match(WORD)??[]).filter(t=>t.length>1);
}

export function bm25Rank(query:string,chunks:BenchmarkChunk[]):ScoredChunk[]{
  const q=[...new Set(tokenize(query))];
  if(!q.length)return [];
  const tokenized=chunks.map(chunk=>({chunk,tokens:tokenize(chunk.content)}));
  const N=chunks.length;
  const avgLen=tokenized.reduce((s,x)=>s+x.tokens.length,0)/Math.max(1,N);
  const df=new Map<string,number>();
  for(const term of q){
    let n=0;
    for(const x of tokenized) if(x.tokens.includes(term)) n+=1;
    df.set(term,n);
  }
  const k1=1.2,b=.75;
  const scored:ScoredChunk[]=[];
  for(const x of tokenized){
    const tf=new Map<string,number>();
    for(const token of x.tokens) if(q.includes(token)) tf.set(token,(tf.get(token)??0)+1);
    let score=0;
    for(const term of q){
      const f=tf.get(term)??0;
      if(!f)continue;
      const d=df.get(term)??0;
      const idf=Math.log(1+(N-d+.5)/(d+.5));
      const denom=f+k1*(1-b+b*(x.tokens.length/Math.max(1,avgLen)));
      score+=idf*((f*(k1+1))/denom);
    }
    if(score>0)scored.push({chunk:x.chunk,score});
  }
  return scored.sort((a,b)=>b.score-a.score);
}

export function cosine(a:number[],b:number[]):number{
  if(a.length!==b.length||!a.length)return -1;
  let dot=0,aa=0,bb=0;
  for(let i=0;i<a.length;i+=1){
    dot+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i];
  }
  return aa&&bb?dot/(Math.sqrt(aa)*Math.sqrt(bb)):-1;
}
export function semanticRank(
  queryVector:number[],
  chunks:BenchmarkChunk[],
  vectors:number[][],
):ScoredChunk[]{
  if(chunks.length!==vectors.length)throw new Error('SEMANTIC_VECTOR_COUNT_MISMATCH');
  return chunks
    .map((chunk,i)=>({chunk,score:cosine(queryVector,vectors[i])}))
    .sort((a,b)=>b.score-a.score);
}

export function sourceAllowed(
  query:GoldBenchmarkQuery,
  sourceRef:string,
  governed:boolean,
):boolean{
  if(!governed)return true;
  const forbidden=new Set(query.aperture?.forbidden??[]);
  if(forbidden.has(sourceRef))return false;
  const admitted=query.aperture?.admitted;
  if(admitted?.length)return admitted.includes(sourceRef);
  return true;
}
export function collapseToSources(
  scored:ScoredChunk[],
  query:GoldBenchmarkQuery,
  governed:boolean,
  limit=8,
):RetrievedItem[]{
  const best=new Map<string,ScoredChunk>();
  for(const item of scored){
    if(!sourceAllowed(query,item.chunk.sourceRef,governed))continue;
    const prior=best.get(item.chunk.sourceRef);
    if(!prior||item.score>prior.score)best.set(item.chunk.sourceRef,item);
  }

  return [...best.values()]
    .sort((a,b)=>b.score-a.score)
    .slice(0,limit)
    .map((item,rank)=>({
      sourceRef:item.chunk.sourceRef,
      sourceClass:item.chunk.sourceClass,
      rank:rank+1,
      tokenEstimate:item.chunk.tokenEstimate,
    }));
}
