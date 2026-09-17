import fs from 'node:fs';
import path from 'node:path';

type Op='POLARITY'|'CROSS_CONSTRAINT'|'FACILITATIVE_RESONANCE'|'OPTIONAL_COUPLING';
type Edge={a:string;b:string;op:Op};
type Graph={id:string;nodes:string[];edges:Edge[]};
type Pair={id:string;motif:Graph;control:Graph};
const E=(a:string,b:string,op:Op):Edge=>({a,b,op});
const N=['A','B','C','D'];
const pairs:Pair[]=[
 {id:'PCC',motif:{id:'CROSS_TRIAD',nodes:N,edges:[E('A','B','POLARITY'),E('A','C','CROSS_CONSTRAINT'),E('B','C','CROSS_CONSTRAINT')]},control:{id:'DISTRIBUTED_PCC',nodes:N,edges:[E('A','B','POLARITY'),E('A','C','CROSS_CONSTRAINT'),E('B','D','CROSS_CONSTRAINT')]}},
 {id:'FFF',motif:{id:'RESONANT_TRIAD',nodes:N,edges:[E('A','B','FACILITATIVE_RESONANCE'),E('B','C','FACILITATIVE_RESONANCE'),E('C','A','FACILITATIVE_RESONANCE')]},control:{id:'RESONANT_PATH',nodes:N,edges:[E('A','B','FACILITATIVE_RESONANCE'),E('B','C','FACILITATIVE_RESONANCE'),E('C','D','FACILITATIVE_RESONANCE')]}},
 {id:'COO',motif:{id:'FOCAL_OPTIONAL',nodes:N,edges:[E('A','B','CROSS_CONSTRAINT'),E('A','C','OPTIONAL_COUPLING'),E('B','C','OPTIONAL_COUPLING')]},control:{id:'DISTRIBUTED_OPTIONAL',nodes:N,edges:[E('A','B','CROSS_CONSTRAINT'),E('A','C','OPTIONAL_COUPLING'),E('B','D','OPTIONAL_COUPLING')]}},
 {id:'PFF',motif:{id:'POLAR_MEDIATION',nodes:N,edges:[E('A','B','POLARITY'),E('A','C','FACILITATIVE_RESONANCE'),E('B','C','FACILITATIVE_RESONANCE')]},control:{id:'DISTRIBUTED_PFF',nodes:N,edges:[E('A','B','POLARITY'),E('A','C','FACILITATIVE_RESONANCE'),E('B','D','FACILITATIVE_RESONANCE')]}},
 {id:'PPCCCC',motif:{id:'BALANCED_CROSS',nodes:N,edges:[E('A','B','POLARITY'),E('C','D','POLARITY'),E('A','C','CROSS_CONSTRAINT'),E('A','D','CROSS_CONSTRAINT'),E('B','C','CROSS_CONSTRAINT'),E('B','D','CROSS_CONSTRAINT')]},control:{id:'SHARED_POLARITY_CROSS',nodes:N,edges:[E('A','B','POLARITY'),E('A','C','POLARITY'),E('A','D','CROSS_CONSTRAINT'),E('B','C','CROSS_CONSTRAINT'),E('B','D','CROSS_CONSTRAINT'),E('C','D','CROSS_CONSTRAINT')]}},
];

let seed=0x51a7c0de;
function rand(){seed=(1664525*seed+1013904223)>>>0;return seed/2**32;}
const uniform=(a:number,b:number)=>a+(b-a)*rand();
type Weights=Record<Op,number>;
function sampleWeights():Weights{return{
 POLARITY:uniform(-1.0,-0.55),
 CROSS_CONSTRAINT:uniform(-0.85,-0.35),
 FACILITATIVE_RESONANCE:uniform(0.35,0.85),
 OPTIONAL_COUPLING:uniform(0.10,0.40),
};}
function initial(){return N.map(()=>uniform(-1,1));}
function step(g:Graph,x:number[],w:Weights,alpha=0.32){const idx=new Map(g.nodes.map((n,i)=>[n,i]));const influence=new Array(x.length).fill(0);for(const e of g.edges){const i=idx.get(e.a)!,j=idx.get(e.b)!,ww=w[e.op];influence[i]+=ww*x[j]!;influence[j]+=ww*x[i]!;}return x.map((v,i)=>Math.tanh(0.72*v+alpha*influence[i]));}
function simulate(g:Graph,x0:number[],w:Weights,steps=6){let x=[...x0];const trajectory=[x];for(let i=0;i<steps;i++){x=step(g,x,w);trajectory.push(x);}return trajectory;}
function l2(a:number[],b:number[]){return Math.sqrt(a.reduce((s,v,i)=>s+(v-b[i]!)**2,0));}
function dominant(x:number[]){let k=0;for(let i=1;i<x.length;i++)if(Math.abs(x[i]!)>Math.abs(x[k]!))k=i;return N[k]!;}
function signPattern(x:number[]){return x.map(v=>v>0?'+' : v<0?'-':'0').join('');}
const TRIALS=500;
function edgeBag(g:Graph){return g.edges.map(e=>e.op).sort().join('|');}
function median(xs:number[]){const s=[...xs].sort((a,b)=>a-b);return s[Math.floor(s.length/2)]!;}
function runPair(p:Pair){const finalDistances:number[]=[];const trajectoryDistances:number[]=[];let finalDistinct=0,dominantDifferent=0,signDifferent=0;for(let t=0;t<TRIALS;t++){
 const w=sampleWeights(),x0=initial();const a=simulate(p.motif,x0,w),b=simulate(p.control,x0,w);const fd=l2(a.at(-1)!,b.at(-1)!);finalDistances.push(fd);const td=a.reduce((s,x,i)=>s+l2(x,b[i]!),0)/(a.length);trajectoryDistances.push(td);if(fd>0.05)finalDistinct++;if(dominant(a.at(-1)!)!==dominant(b.at(-1)!))dominantDifferent++;if(signPattern(a.at(-1)!)!==signPattern(b.at(-1)!))signDifferent++;}
 return {id:p.id,sameEdgeBag:edgeBag(p.motif)===edgeBag(p.control),trials:TRIALS,finalDistinctRate:finalDistinct/TRIALS,meanFinalL2:finalDistances.reduce((a,b)=>a+b,0)/TRIALS,medianFinalL2:median(finalDistances),meanTrajectoryL2:trajectoryDistances.reduce((a,b)=>a+b,0)/TRIALS,bagOnlyMinimumMeanFinalError:(finalDistances.reduce((a,b)=>a+b,0)/TRIALS)/2,dominantNodeDifferentRate:dominantDifferent/TRIALS,signPatternDifferentRate:signDifferent/TRIALS};}

function main(){const results=pairs.map(runPair);const output={schema:'RELATIONAL_GEOMETRY_H6E_CONFIGURATION_DYNAMICS_V1',authority:'offline deterministic formal-system test only',hypothesis:'With identical nodes, operator inventory, operator weights, and initial state, changing only incidence topology can change system trajectory.',model:{update:'x[t+1] = tanh(0.72*x[t] + 0.32*weighted-neighbor-influence)',steps:6,trialsPerCollisionPair:TRIALS,weightRanges:{POLARITY:'[-1.00,-0.55]',CROSS_CONSTRAINT:'[-0.85,-0.35]',FACILITATIVE_RESONANCE:'[0.35,0.85]',OPTIONAL_COUPLING:'[0.10,0.40]'},note:'Weights are synthetic structural probes, not psychological estimates or astrological values.'},results,summary:{pairs:results.length,allSameEdgeBag:results.every(r=>r.sameEdgeBag),allMeanFinalDistancesPositive:results.every(r=>r.meanFinalL2>0),meanDistinctRate:results.reduce((s,r)=>s+r.finalDistinctRate,0)/results.length,meanBagOnlyMinimumError:results.reduce((s,r)=>s+r.bagOnlyMinimumMeanFinalError,0)/results.length},law:'Under a fixed local interaction law, incidence topology can alter global trajectory even when relation types and strengths are unchanged. This is a formal systems result, not evidence that any symbolic motif predicts human outcomes.'};const out=path.join(process.cwd(),'docs/programme/evidence/relational-geometry-integration/H6E_CONFIGURATION_DYNAMICS_2026-09-16.json');fs.writeFileSync(out,JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify(output,null,2));}
main();
