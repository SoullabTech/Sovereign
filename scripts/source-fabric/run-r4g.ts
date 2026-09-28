import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { BENCHMARK_CORPUS } from '../../lib/ain/source-fabric/benchmark/corpus';
import { buildBenchmarkChunks } from '../../lib/ain/source-fabric/benchmark/chunking';
import { GOLD_QUERIES } from '../../lib/ain/source-fabric/benchmark/goldQueries';
import {
  bm25Rank, collapseToSources, semanticRank, sourceAllowed,
} from '../../lib/ain/source-fabric/benchmark/baselines';
import { reciprocalRankFusion } from '../../lib/ain/source-fabric/benchmark/fusion';
import { graphAwareRerank } from '../../lib/ain/source-fabric/benchmark/graphRerank';
import { evidenceSufficiency } from '../../lib/ain/source-fabric/benchmark/abstention';
import { scoreRetrieval, type BenchmarkScore, type RetrievedItem } from '../../lib/ain/source-fabric/benchmark/scoring';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-SOURCE-FABRIC-02/r4g');
mkdirSync(OUT,{recursive:true});

const chunkVectors=JSON.parse(readFileSync(
  '/tmp/ain-source-fabric-benchmark-cache/chunks-823b0c08c42a8da7ff26f17cac326d2dffe79a0d7f8cb68f44f5e0720cdf6a8e.json','utf8'
)) as number[][];
const queryVectors=JSON.parse(readFileSync(
  '/tmp/ain-source-fabric-benchmark-cache/queries-11fb458eec8bf224bb63604fbc16d941a3e672d4df9c4e2b81159dc6ce9d0d02.json','utf8'
)) as number[][];

function avg<T>(rows:T[],fn:(x:T)=>number):number{
  return rows.length?rows.reduce((s,x)=>s+fn(x),0)/rows.length:0;
}
function topAvg<T extends {score:number}>(rows:T[],n:number):number{
  const x=rows.slice(0,n);
  return x.length?x.reduce((s,r)=>s+r.score,0)/x.length:0;
}

interface Row {
  id:string;
  family:string;
  retrieved:RetrievedItem[];
  score:BenchmarkScore;
  abstained:boolean;
  expandedCount:number;
  activeCommunities:string[];
}
function aggregate(rows:Row[]){
  const global=rows.filter(r=>r.family==='global');
  const diversity=rows.filter(r=>r.family==='diversity');
  return {
    mustRecall:avg(rows,r=>r.score.mustRecall),
    helpfulRecall:avg(rows,r=>r.score.helpfulRecall),
    bridgeRecall:avg(rows,r=>r.score.bridgeRecall),
    counterevidenceRecall:avg(rows,r=>r.score.counterevidenceRecall),
    irrelevantRate:avg(rows,r=>r.score.irrelevantRate),
    sourceClassDiversity:avg(rows,r=>r.score.sourceClassDiversity),
    usefulPerThousandTokens:avg(rows,r=>r.score.usefulPerThousandTokens),
    globalMustRecall:avg(global,r=>r.score.mustRecall),
    diversityMustRecall:avg(diversity,r=>r.score.mustRecall),
    abstainedQueries:rows.filter(r=>r.abstained).length,
    positiveFalseAbstentions:rows.filter(r=>{
      const q=GOLD_QUERIES.find(q=>q.id===r.id)!;
      return r.abstained&&!q.expectedEmpty;
    }).length,
    negativeFalsePositiveQueries:rows.filter(r=>{
      const q=GOLD_QUERIES.find(q=>q.id===r.id)!;
      return q.expectedEmpty&&!r.abstained;
    }).length,
    hardFailQueries:rows.filter(r=>r.score.hardFail).length,
    avgExpandedNeighbors:avg(rows,r=>r.expandedCount),
    queriesWithActiveCommunities:rows.filter(r=>r.activeCommunities.length>0).length,
  };
}

const chunks=buildBenchmarkChunks(ROOT,BENCHMARK_CORPUS);
const shadowRows:Row[]=[];
const directGraphRows:Row[]=[];
const finalRows:Row[]=[];

for(let i=0;i<GOLD_QUERIES.length;i++){
  const query=GOLD_QUERIES[i];
  const lexicalChunks=bm25Rank(query.query,chunks);
  const semanticChunks=semanticRank(queryVectors[i],chunks,chunkVectors);
  const lexical=collapseToSources(lexicalChunks,query,true,26);
  const semantic=collapseToSources(semanticChunks,query,true,26);
  const fused=reciprocalRankFusion(lexical,semantic);
  const allowed=(ref:string)=>sourceAllowed(query,ref,true);
  const distributed=query.family==='global'||query.family==='diversity';
  const shadow=graphAwareRerank(query.query,fused,BENCHMARK_CORPUS,allowed,{
    limit:8,seedLimit:6,neighborsPerSeed:3,
    metadataWeight:.003,dualLaneBonus:.001,
    graphBonus:0,communityBonus:.002,
    enableCommunity:distributed,
  });

  const direct=graphAwareRerank(query.query,fused,BENCHMARK_CORPUS,allowed,{
    limit:8,seedLimit:6,neighborsPerSeed:3,
    metadataWeight:.003,dualLaneBonus:.001,
    graphBonus:.002,communityBonus:.002,
    enableCommunity:distributed,
  });

  const ls=new Set(lexical.slice(0,8).map(x=>x.sourceRef));
  const ss=new Set(semantic.slice(0,8).map(x=>x.sourceRef));
  const overlap=[...ls].filter(ref=>ss.has(ref)).length;
  const decision=evidenceSufficiency(query.query,{
    bm25Top:lexicalChunks[0]?.score??0,
    semanticTop:semanticChunks[0]?.score??0,
    semanticTop3Average:topAvg(semanticChunks,3),
    topSourceAgreement:lexical[0]?.sourceRef===semantic[0]?.sourceRef,
    sourceOverlap:overlap,
  },false);

  const make=(retrieved:RetrievedItem[],abstained:boolean,expandedCount:number,activeCommunities:string[]):Row=>({
    id:query.id,family:query.family,retrieved,
    score:scoreRetrieval(query,retrieved),
    abstained,expandedCount,activeCommunities,
  });

  shadowRows.push(make(shadow.ranked,false,shadow.expanded.length,shadow.activeCommunities));
  directGraphRows.push(make(direct.ranked,false,direct.expanded.length,direct.activeCommunities));
  finalRows.push(make(
    decision.answer?shadow.ranked:[],
    !decision.answer,
    shadow.expanded.length,
    shadow.activeCommunities,
  ));
}
const result={
  generatedAt:new Date().toISOString(),
  parentBlindPass:'566a358c7826a3df4038e0e27f79e8269ce6a076',
  parameters:{
    seedLimit:6,
    neighborsPerSeed:3,
    metadataWeight:.003,
    dualLaneBonus:.001,
    acceptedGraphBonus:0,
    acceptedCommunityBonus:.002,
    communityFamilies:['global','diversity'],
    directGraphFalsifierBonus:.002,
  },
  methods:{
    graph_shadow_community:{rows:shadowRows,aggregate:aggregate(shadowRows)},
    direct_graph_falsifier:{rows:directGraphRows,aggregate:aggregate(directGraphRows)},
    final_with_abstention:{rows:finalRows,aggregate:aggregate(finalRows)},
  },
};

writeFileSync(OUT+'/r4g-results.json',JSON.stringify(result,null,2)+'\n');
writeFileSync(OUT+'/r4g-summary.json',JSON.stringify({
  generatedAt:result.generatedAt,
  parentBlindPass:result.parentBlindPass,
  parameters:result.parameters,
  methods:Object.fromEntries(
    Object.entries(result.methods).map(([k,v])=>[k,v.aggregate])
  ),
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(readFileSync(OUT+'/r4g-summary.json','utf8')),null,2));
