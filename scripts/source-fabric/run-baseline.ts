import { createHash } from 'node:crypto';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BENCHMARK_CORPUS } from '../../lib/ain/source-fabric/benchmark/corpus';
import { buildBenchmarkChunks } from '../../lib/ain/source-fabric/benchmark/chunking';
import { GOLD_QUERIES } from '../../lib/ain/source-fabric/benchmark/goldQueries';
import { bm25Rank, collapseToSources, semanticRank } from '../../lib/ain/source-fabric/benchmark/baselines';
import { scoreRetrieval, type BenchmarkScore, type RetrievedItem } from '../../lib/ain/source-fabric/benchmark/scoring';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-SOURCE-FABRIC-02/baseline');
const MODEL=process.env.SOURCE_FABRIC_EMBED_MODEL||'nomic-embed-text';
const OLLAMA=process.env.OLLAMA_BASE_URL||'http://127.0.0.1:11434';
const LIMIT=8;
mkdirSync(OUT,{recursive:true});

function hashTexts(texts:string[]):string{
  const h=createHash('sha256');
  for(const text of texts){h.update(text);h.update('\0');}
  return h.digest('hex');
}

async function embedBatch(texts:string[]):Promise<number[][]>{
  const response=await fetch(OLLAMA+'/api/embed',{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({model:MODEL,input:texts}),
    signal:AbortSignal.timeout(120000),
  });
  if(!response.ok)throw new Error('EMBED_HTTP_'+response.status);
  const data=await response.json() as {embeddings?:number[][]};
  if(!Array.isArray(data.embeddings)||data.embeddings.length!==texts.length){
    throw new Error('EMBED_RESPONSE_SHAPE');
  }
  return data.embeddings;
}

async function embedAll(texts:string[],label:string):Promise<number[][]>{
  const cacheDir='/tmp/ain-source-fabric-benchmark-cache';
  mkdirSync(cacheDir,{recursive:true});
  const key=createHash('sha256').update(MODEL).update('\0').update(hashTexts(texts)).digest('hex');
  const cache=cacheDir+'/'+label+'-'+key+'.json';
  if(existsSync(cache)){
    const cached=JSON.parse(readFileSync(cache,'utf8')) as number[][];
    if(cached.length===texts.length){
      console.log('cache hit',label,cached.length);
      return cached;
    }
  }

  const all:number[][]=[];
  const batchSize=24;
  for(let i=0;i<texts.length;i+=batchSize){
    const batch=texts.slice(i,i+batchSize);
    const vectors=await embedBatch(batch);
    all.push(...vectors);
    console.log(label,Math.min(i+batch.length,texts.length)+'/'+texts.length);
  }
  writeFileSync(cache,JSON.stringify(all));
  return all;
}

interface MethodResult {
  method:string;
  governed:boolean;
  perQuery:Array<{
    id:string;
    family:string;
    lane:string;
    retrieved:RetrievedItem[];
    score:BenchmarkScore;
  }>;
  aggregate:Record<string,unknown>;
}
function avg(values:number[]):number{
  return values.length?values.reduce((a,b)=>a+b,0)/values.length:0;
}

function aggregate(perQuery:MethodResult['perQuery']):Record<string,unknown>{
  const numericKeys:(keyof BenchmarkScore)[]=[
    'mustRecall','helpfulRecall','counterevidenceRecall','bridgeRecall',
    'forbiddenLeakage','irrelevantRate','staleCurrentRate','sourceClassDiversity',
    'redundancyRate','usefulPerThousandTokens',
  ];
  const overall:Record<string,number>={};
  for(const key of numericKeys) overall[key]=avg(perQuery.map(x=>Number(x.score[key])));
  overall.hardFailQueries=perQuery.filter(x=>x.score.hardFail).length;
  overall.negativeFalsePositiveQueries=perQuery.filter(x=>{
    const q=GOLD_QUERIES.find(g=>g.id===x.id);
    return q?.expectedEmpty===true&&x.retrieved.length>0;
  }).length;

  const families:Record<string,Record<string,number>>={};
  for(const family of [...new Set(perQuery.map(x=>x.family))]){
    const rows=perQuery.filter(x=>x.family===family);
    families[family]={
      count:rows.length,
      mustRecall:avg(rows.map(x=>x.score.mustRecall)),
      counterevidenceRecall:avg(rows.map(x=>x.score.counterevidenceRecall)),
      bridgeRecall:avg(rows.map(x=>x.score.bridgeRecall)),
      irrelevantRate:avg(rows.map(x=>x.score.irrelevantRate)),
      forbiddenLeakage:rows.reduce((s,x)=>s+x.score.forbiddenLeakage,0),
    };
  }
  const lanes:Record<string,Record<string,number>>={};
  for(const lane of [...new Set(perQuery.map(x=>x.lane))]){
    const rows=perQuery.filter(x=>x.lane===lane);
    lanes[lane]={
      count:rows.length,
      mustRecall:avg(rows.map(x=>x.score.mustRecall)),
      bridgeRecall:avg(rows.map(x=>x.score.bridgeRecall)),
      irrelevantRate:avg(rows.map(x=>x.score.irrelevantRate)),
    };
  }
  return {overall,families,lanes};
}

function runLexical(chunks:ReturnType<typeof buildBenchmarkChunks>,governed:boolean):MethodResult{
  const perQuery=GOLD_QUERIES.map(query=>{
    const ranked=bm25Rank(query.query,chunks);
    const retrieved=collapseToSources(ranked,query,governed,LIMIT);
    return {
      id:query.id,
      family:query.family,
      lane:query.laneExpectation,
      retrieved,
      score:scoreRetrieval(query,retrieved),
    };
  });
  return {method:'bm25',governed,perQuery,aggregate:aggregate(perQuery)};
}

function runSemantic(
  chunks:ReturnType<typeof buildBenchmarkChunks>,
  chunkVectors:number[][],
  queryVectors:number[][],
  governed:boolean,
):MethodResult{
  const perQuery=GOLD_QUERIES.map((query,index)=>{
    const ranked=semanticRank(queryVectors[index],chunks,chunkVectors);
    const retrieved=collapseToSources(ranked,query,governed,LIMIT);
    return {
      id:query.id,
      family:query.family,
      lane:query.laneExpectation,
      retrieved,
      score:scoreRetrieval(query,retrieved),
    };
  });
  return {method:'semantic',governed,perQuery,aggregate:aggregate(perQuery)};
}

async function main(){
  const chunks=buildBenchmarkChunks(ROOT,BENCHMARK_CORPUS);
  const chunkTexts=chunks.map(c=>c.content);
  const queryTexts=GOLD_QUERIES.map(q=>q.query);

  const chunkManifest={
    generatedAt:new Date().toISOString(),
    sourceCount:BENCHMARK_CORPUS.length,
    chunkCount:chunks.length,
    tokenEstimate:chunks.reduce((s,c)=>s+c.tokenEstimate,0),
    chunkingHash:hashTexts(chunks.map(c=>c.chunkId+'\n'+c.content)),
    countsBySource:Object.fromEntries(BENCHMARK_CORPUS.map(s=>[
      s.sourceRef,chunks.filter(c=>c.sourceRef===s.sourceRef).length
    ])),
  };
  writeFileSync(OUT+'/chunk-manifest.json',JSON.stringify(chunkManifest,null,2)+'\n');

  console.log('running lexical baselines');
  const lexicalRaw=runLexical(chunks,false);
  const lexicalGoverned=runLexical(chunks,true);

  console.log('embedding corpus',chunks.length,'chunks with',MODEL);
  const chunkVectors=await embedAll(chunkTexts,'chunks');
  console.log('embedding queries',queryTexts.length);
  const queryVectors=await embedAll(queryTexts,'queries');
  const semanticRaw=runSemantic(chunks,chunkVectors,queryVectors,false);
  const semanticGoverned=runSemantic(chunks,chunkVectors,queryVectors,true);

  const methods=[lexicalRaw,lexicalGoverned,semanticRaw,semanticGoverned];
  const evidence={
    generatedAt:new Date().toISOString(),
    model:MODEL,
    ollama:OLLAMA,
    topSourceLimit:LIMIT,
    corpus:{sources:BENCHMARK_CORPUS.length,chunks:chunks.length},
    methods,
  };
  writeFileSync(OUT+'/baseline-results.json',JSON.stringify(evidence,null,2)+'\n');

  const summary={
    generatedAt:evidence.generatedAt,
    model:MODEL,
    corpus:evidence.corpus,
    methods:Object.fromEntries(methods.map(m=>[
      m.method+(m.governed?'-governed':'-raw'),m.aggregate
    ])),
  };
  writeFileSync(OUT+'/baseline-summary.json',JSON.stringify(summary,null,2)+'\n');
  console.log(JSON.stringify(summary,null,2));
}

main().catch(error=>{console.error(error);process.exitCode=1;});
