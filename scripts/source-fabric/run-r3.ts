import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BENCHMARK_CORPUS } from '../../lib/ain/source-fabric/benchmark/corpus';
import { buildBenchmarkChunks } from '../../lib/ain/source-fabric/benchmark/chunking';
import { GOLD_QUERIES } from '../../lib/ain/source-fabric/benchmark/goldQueries';
import {
  bm25Rank, collapseToSources, semanticRank,
} from '../../lib/ain/source-fabric/benchmark/baselines';
import {
  metadataAwareCallosalRerank, reciprocalRankFusion,
} from '../../lib/ain/source-fabric/benchmark/fusion';
import {
  evidenceSufficiency,
} from '../../lib/ain/source-fabric/benchmark/abstention';
import {
  scoreRetrieval, type BenchmarkScore, type RetrievedItem,
} from '../../lib/ain/source-fabric/benchmark/scoring';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-SOURCE-FABRIC-02/r3');
const MODEL=process.env.SOURCE_FABRIC_EMBED_MODEL||'nomic-embed-text';
const OLLAMA=process.env.OLLAMA_BASE_URL||'http://127.0.0.1:11434';
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
  const dir='/tmp/ain-source-fabric-benchmark-cache';
  mkdirSync(dir,{recursive:true});
  const key=createHash('sha256').update(MODEL).update('\0').update(hashTexts(texts)).digest('hex');
  const file=dir+'/'+label+'-'+key+'.json';
  if(existsSync(file)){
    const cached=JSON.parse(readFileSync(file,'utf8')) as number[][];
    if(cached.length===texts.length)return cached;
  }
  const out:number[][]=[];
  for(let i=0;i<texts.length;i+=24){
    out.push(...await embedBatch(texts.slice(i,i+24)));
  }
  writeFileSync(file,JSON.stringify(out));
  return out;
}

function avg<T>(rows:T[],fn:(row:T)=>number):number{
  return rows.length?rows.reduce((s,row)=>s+fn(row),0)/rows.length:0;
}

function topAverage<T extends {score:number}>(rows:T[],n:number):number{
  const slice=rows.slice(0,n);
  return slice.length?slice.reduce((s,x)=>s+x.score,0)/slice.length:0;
}

interface R3Row {
  id:string;
  family:string;
  lane:string;
  retrieved:RetrievedItem[];
  score:BenchmarkScore;
  abstained:boolean;
  abstentionReason:string|null;
}

function aggregate(rows:R3Row[]){
  return {
    mustRecall:avg(rows,r=>r.score.mustRecall),
    helpfulRecall:avg(rows,r=>r.score.helpfulRecall),
    bridgeRecall:avg(rows,r=>r.score.bridgeRecall),
    counterevidenceRecall:avg(rows,r=>r.score.counterevidenceRecall),
    irrelevantRate:avg(rows,r=>r.score.irrelevantRate),
    sourceClassDiversity:avg(rows,r=>r.score.sourceClassDiversity),
    usefulPerThousandTokens:avg(rows,r=>r.score.usefulPerThousandTokens),
    hardFailQueries:rows.filter(r=>r.score.hardFail).length,
    abstainedQueries:rows.filter(r=>r.abstained).length,
    positiveFalseAbstentions:rows.filter(r=>{
      const q=GOLD_QUERIES.find(q=>q.id===r.id)!;
      return r.abstained&&!q.expectedEmpty;
    }).length,
    negativeFalsePositiveQueries:rows.filter(r=>{
      const q=GOLD_QUERIES.find(q=>q.id===r.id)!;
      return q.expectedEmpty&&!r.abstained;
    }).length,
    abstentionReasons:Object.fromEntries(
      [...new Set(rows.filter(r=>r.abstentionReason).map(r=>r.abstentionReason!))]
        .map(reason=>[reason,rows.filter(r=>r.abstentionReason===reason).length]),
    ),
  };
}

async function main(){
  const chunks=buildBenchmarkChunks(ROOT,BENCHMARK_CORPUS);
  const chunkVectors=await embedAll(chunks.map(c=>c.content),'chunks');
  const queryVectors=await embedAll(GOLD_QUERIES.map(q=>q.query),'queries');

  const rrfRows:R3Row[]=[];
  const callosalRows:R3Row[]=[];
  const finalRows:R3Row[]=[];

  for(let i=0;i<GOLD_QUERIES.length;i++){
    const query=GOLD_QUERIES[i];
    const lexicalChunks=bm25Rank(query.query,chunks);
    const semanticChunks=semanticRank(queryVectors[i],chunks,chunkVectors);
    const lexical=collapseToSources(lexicalChunks,query,true,26);
    const semantic=collapseToSources(semanticChunks,query,true,26);
    const fused=reciprocalRankFusion(lexical,semantic);
    const rrf=fused.slice(0,8).map((x,index)=>({...x,rank:index+1}));
    const callosal=metadataAwareCallosalRerank(query.query,fused,BENCHMARK_CORPUS,{
      limit:8,metadataWeight:.003,dualLaneBonus:.001,
    });

    const topLexical=lexicalChunks[0]?.score??0;
    const topSemantic=semanticChunks[0]?.score??0;
    const lexicalTop8=new Set(lexical.slice(0,8).map(x=>x.sourceRef));
    const semanticTop8=new Set(semantic.slice(0,8).map(x=>x.sourceRef));
    const overlap=[...lexicalTop8].filter(ref=>semanticTop8.has(ref)).length;
    const topAgreement=lexical[0]?.sourceRef===semantic[0]?.sourceRef;

    const sufficiency=evidenceSufficiency(query.query,{
      bm25Top:topLexical,
      semanticTop:topSemantic,
      semanticTop3Average:topAverage(semanticChunks,3),
      topSourceAgreement:topAgreement,
      sourceOverlap:overlap,
    },false);

    const final=sufficiency.answer?callosal:[];

    const row=(retrieved:RetrievedItem[],abstained=false,reason:string|null=null):R3Row=>({
      id:query.id,family:query.family,lane:query.laneExpectation,retrieved,
      score:scoreRetrieval(query,retrieved),abstained,abstentionReason:reason,
    });
    rrfRows.push(row(rrf));
    callosalRows.push(row(callosal));
    finalRows.push(row(final,!sufficiency.answer,sufficiency.answer?null:sufficiency.reason));
  }

  const result={
    generatedAt:new Date().toISOString(),
    model:MODEL,
    corpus:{sources:BENCHMARK_CORPUS.length,chunks:chunks.length},
    referenceParameters:{
      rrfK:60,
      candidatePoolPerLane:26,
      finalLimit:8,
      metadataWeight:.003,
      dualLaneBonus:.001,
      abstention:{
        focused:{semanticTop:.68,bm25Top:13,sourceOverlap:4},
        distributed:{semanticTop3Average:.64},
        predictionSupported:false,
      },
    },
    methods:{
      rrf:{rows:rrfRows,aggregate:aggregate(rrfRows)},
      callosal:{rows:callosalRows,aggregate:aggregate(callosalRows)},
      callosal_abstention:{rows:finalRows,aggregate:aggregate(finalRows)},
    },
  };
  writeFileSync(OUT+'/r3-results.json',JSON.stringify(result,null,2)+'\n');
  writeFileSync(OUT+'/r3-summary.json',JSON.stringify({
    generatedAt:result.generatedAt,
    model:MODEL,
    corpus:result.corpus,
    referenceParameters:result.referenceParameters,
    methods:Object.fromEntries(Object.entries(result.methods).map(([k,v])=>[k,v.aggregate])),
  },null,2)+'\n');
  console.log(JSON.stringify(JSON.parse(readFileSync(OUT+'/r3-summary.json','utf8')),null,2));
}

main().catch(error=>{console.error(error);process.exitCode=1;});
