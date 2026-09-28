import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BENCHMARK_CORPUS } from '../../lib/ain/source-fabric/benchmark/corpus';
import { buildBenchmarkChunks } from '../../lib/ain/source-fabric/benchmark/chunking';
import { BLIND_QUERIES_C as BLIND_QUERIES } from '../../lib/ain/source-fabric/benchmark/blindQueriesC';
import { bm25Rank, collapseToSources, semanticRank } from '../../lib/ain/source-fabric/benchmark/baselines';
import { metadataAwareCallosalRerank, reciprocalRankFusion } from '../../lib/ain/source-fabric/benchmark/fusion';
import { evidenceSufficiency } from '../../lib/ain/source-fabric/benchmark/abstention';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-SOURCE-FABRIC-02/r4-blind-c');
const MODEL='nomic-embed-text';
const OLLAMA='http://127.0.0.1:11434';
mkdirSync(OUT,{recursive:true});

function hashTexts(texts:string[]):string{
  const h=createHash('sha256');
  for(const t of texts){h.update(t);h.update('\0');}
  return h.digest('hex');
}

async function embedBatch(texts:string[]):Promise<number[][]>{
  const response=await fetch(OLLAMA+'/api/embed',{
    method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({model:MODEL,input:texts}),signal:AbortSignal.timeout(120000),
  });
  if(!response.ok)throw new Error('EMBED_HTTP_'+response.status);
  const data=await response.json() as {embeddings?:number[][]};
  if(!data.embeddings||data.embeddings.length!==texts.length)throw new Error('EMBED_SHAPE');
  return data.embeddings;
}
async function embedAll(texts:string[],label:string):Promise<number[][]>{
  const dir='/tmp/ain-source-fabric-benchmark-cache';
  mkdirSync(dir,{recursive:true});
  const key=createHash('sha256').update(MODEL).update('\0').update(hashTexts(texts)).digest('hex');
  const file=dir+'/'+label+'-'+key+'.json';
  if(existsSync(file)){
    const v=JSON.parse(readFileSync(file,'utf8')) as number[][];
    if(v.length===texts.length)return v;
  }
  const all:number[][]=[];
  for(let i=0;i<texts.length;i+=24)all.push(...await embedBatch(texts.slice(i,i+24)));
  writeFileSync(file,JSON.stringify(all));
  return all;
}

function avgTop<T extends {score:number}>(rows:T[],n:number):number{
  const x=rows.slice(0,n);
  return x.length?x.reduce((s,r)=>s+r.score,0)/x.length:0;
}

async function main(){
  const chunks=buildBenchmarkChunks(ROOT,BENCHMARK_CORPUS);
  const chunkVectors=await embedAll(chunks.map(c=>c.content),'chunks');
  const queryVectors=await embedAll(BLIND_QUERIES.map(q=>q.query),'blind-c-queries');

  const rows=[];
  for(let i=0;i<BLIND_QUERIES.length;i++){
    const query=BLIND_QUERIES[i];
    const lexicalChunks=bm25Rank(query.query,chunks);
    const semanticChunks=semanticRank(queryVectors[i],chunks,chunkVectors);
    const pseudoQuery={
      id:query.id,query:query.query,family:'negative_control' as const,
      gold:[],laneExpectation:'bilateral' as const,rationale:'blind',
    };
    const lexical=collapseToSources(lexicalChunks,pseudoQuery as any,true,26);
    const semantic=collapseToSources(semanticChunks,pseudoQuery as any,true,26);
    const fused=reciprocalRankFusion(lexical,semantic);
    const callosal=metadataAwareCallosalRerank(query.query,fused,BENCHMARK_CORPUS,{
      limit:8,metadataWeight:.003,dualLaneBonus:.001,
    });
    const ls=new Set(lexical.slice(0,8).map(x=>x.sourceRef));
    const ss=new Set(semantic.slice(0,8).map(x=>x.sourceRef));
    const overlap=[...ls].filter(ref=>ss.has(ref)).length;
    const decision=evidenceSufficiency(query.query,{
      bm25Top:lexicalChunks[0]?.score??0,
      semanticTop:semanticChunks[0]?.score??0,
      semanticTop3Average:avgTop(semanticChunks,3),
      topSourceAgreement:lexical[0]?.sourceRef===semantic[0]?.sourceRef,
      sourceOverlap:overlap,
    },false);
    const retrieved=decision.answer?callosal:[];
    const refs=new Set(retrieved.map(x=>x.sourceRef));
    const mustRecall=query.mustSources.length
      ?query.mustSources.filter(ref=>refs.has(ref)).length/query.mustSources.length
      :1;
    rows.push({
      ...query,
      decision,
      mustRecall,
      retrieved:retrieved.map(x=>x.sourceRef),
      features:{
        bm25Top:lexicalChunks[0]?.score??0,
        semanticTop:semanticChunks[0]?.score??0,
        semanticTop3Average:avgTop(semanticChunks,3),
        topSourceAgreement:lexical[0]?.sourceRef===semantic[0]?.sourceRef,
        sourceOverlap:overlap,
      },
      correctAnswerability:decision.answer===query.expectedAnswer,
    });
  }
  const supported=rows.filter(r=>r.expectedAnswer);
  const unsupported=rows.filter(r=>!r.expectedAnswer);
  const summary={
    generatedAt:new Date().toISOString(),
    frozenRuleBase:'46af35445407ec2afac5c9d198c3ee41a8441ce7',
    frozenBlindSetBase:'b64a501fadd3a0219db6630365bbe4b236109e2e',
    queryCount:rows.length,
    supportedCount:supported.length,
    unsupportedCount:unsupported.length,
    answerabilityAccuracy:rows.filter(r=>r.correctAnswerability).length/rows.length,
    supportedFalseAbstentions:supported.filter(r=>!r.decision.answer).map(r=>r.id),
    unsupportedFalseAnswers:unsupported.filter(r=>r.decision.answer).map(r=>r.id),
    supportedMustRecall:supported.reduce((s,r)=>s+r.mustRecall,0)/supported.length,
    fullSupportedMustCoverage:supported.filter(r=>r.mustRecall===1).length,
    decisionReasons:Object.fromEntries(
      [...new Set(rows.map(r=>r.decision.reason))].map(reason=>[
        reason,rows.filter(r=>r.decision.reason===reason).length,
      ]),
    ),
  };
  writeFileSync(OUT+'/blind-c-results.json',JSON.stringify({summary,rows},null,2)+'\n');
  writeFileSync(OUT+'/blind-c-summary.json',JSON.stringify(summary,null,2)+'\n');
  console.log(JSON.stringify(summary,null,2));
  console.log('\nUnsupported false answers:');
  for(const row of unsupported.filter(r=>r.decision.answer)){
    console.log(row.id,row.query,row.features,row.retrieved);
  }
}

main().catch(error=>{console.error(error);process.exitCode=1;});
