import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

type Op='POLARITY'|'CROSS_CONSTRAINT'|'FACILITATIVE_RESONANCE'|'OPTIONAL_COUPLING'|'FUSION_PRESSURE';
type Motif='CROSS_CONSTRAINT_TRIAD'|'RESONANT_TRIAD'|'ASYMMETRIC_FOCAL_CONFIGURATION'|'POLAR_MEDIATION_TRIAD'|'BALANCED_CROSS_CONSTRAINT'|'NONE';
type Edge={a:string;b:string;op:Op};
type Fixture={id:string;nodes:string[];edges:Edge[];expected:Motif;collision:string};
const E=(a:string,b:string,op:Op):Edge=>({a,b,op});

const fixtures:Fixture[]=[
 {id:'M1_CROSS_TRIAD',nodes:['A','B','C','D'],edges:[E('A','B','POLARITY'),E('A','C','CROSS_CONSTRAINT'),E('B','C','CROSS_CONSTRAINT')],expected:'CROSS_CONSTRAINT_TRIAD',collision:'PCC'},
 {id:'M1_CONTROL',nodes:['A','B','C','D'],edges:[E('A','B','POLARITY'),E('A','C','CROSS_CONSTRAINT'),E('B','D','CROSS_CONSTRAINT')],expected:'NONE',collision:'PCC'},
 {id:'M2_RESONANT_TRIAD',nodes:['A','B','C','D'],edges:[E('A','B','FACILITATIVE_RESONANCE'),E('B','C','FACILITATIVE_RESONANCE'),E('C','A','FACILITATIVE_RESONANCE')],expected:'RESONANT_TRIAD',collision:'FFF'},
 {id:'M2_CONTROL',nodes:['A','B','C','D'],edges:[E('A','B','FACILITATIVE_RESONANCE'),E('B','C','FACILITATIVE_RESONANCE'),E('C','D','FACILITATIVE_RESONANCE')],expected:'NONE',collision:'FFF'},
 {id:'M3_FOCAL',nodes:['A','B','C','D'],edges:[E('A','B','CROSS_CONSTRAINT'),E('A','C','OPTIONAL_COUPLING'),E('B','C','OPTIONAL_COUPLING')],expected:'ASYMMETRIC_FOCAL_CONFIGURATION',collision:'COO'},
 {id:'M3_CONTROL',nodes:['A','B','C','D'],edges:[E('A','B','CROSS_CONSTRAINT'),E('A','C','OPTIONAL_COUPLING'),E('B','D','OPTIONAL_COUPLING')],expected:'NONE',collision:'COO'},
 {id:'M4_POLAR_MEDIATION',nodes:['A','B','C','D'],edges:[E('A','B','POLARITY'),E('A','C','FACILITATIVE_RESONANCE'),E('B','C','FACILITATIVE_RESONANCE')],expected:'POLAR_MEDIATION_TRIAD',collision:'PFF'},
 {id:'M4_CONTROL',nodes:['A','B','C','D'],edges:[E('A','B','POLARITY'),E('A','C','FACILITATIVE_RESONANCE'),E('B','D','FACILITATIVE_RESONANCE')],expected:'NONE',collision:'PFF'},
 {id:'M5_BALANCED_CROSS',nodes:['A','B','C','D'],edges:[E('A','B','POLARITY'),E('C','D','POLARITY'),E('A','C','CROSS_CONSTRAINT'),E('A','D','CROSS_CONSTRAINT'),E('B','C','CROSS_CONSTRAINT'),E('B','D','CROSS_CONSTRAINT')],expected:'BALANCED_CROSS_CONSTRAINT',collision:'PPCCCC'},
 {id:'M5_CONTROL',nodes:['A','B','C','D'],edges:[E('A','B','POLARITY'),E('A','C','POLARITY'),E('A','D','CROSS_CONSTRAINT'),E('B','C','CROSS_CONSTRAINT'),E('B','D','CROSS_CONSTRAINT'),E('C','D','CROSS_CONSTRAINT')],expected:'CROSS_CONSTRAINT_TRIAD',collision:'PPCCCC'},
];

const MODEL='claude-sonnet-4-6',REPEATS=2;
const sha=(s:string)=>crypto.createHash('sha256').update(s).digest('hex');
const bag=(f:Fixture)=>f.edges.map(e=>e.op).sort().join('|');
const motifDefs=`CROSS_CONSTRAINT_TRIAD: one POLARITY pair and one third node cross-constrained to both poles, forming a closed 3-node triangle.\nRESONANT_TRIAD: three nodes form a closed triangle where all three edges are FACILITATIVE_RESONANCE.\nASYMMETRIC_FOCAL_CONFIGURATION: one CROSS_CONSTRAINT base pair and a third focal node OPTIONAL_COUPLED to both base nodes, forming a closed triangle.\nPOLAR_MEDIATION_TRIAD: one POLARITY pair and a third node FACILITATIVE_RESONANT with both poles, forming a closed triangle.\nBALANCED_CROSS_CONSTRAINT: four nodes form two disjoint POLARITY pairs and every cross-axis pair is CROSS_CONSTRAINT.\nNONE: none of these exact topologies is present.`;

function call(system:string,user:string):Promise<string>{return new Promise((resolve,reject)=>{const p=spawn('claude',['-p','--model',MODEL,'--effort','low','--system-prompt',system,'--restricted','--tools','','--output-format','text',user],{stdio:['pipe','pipe','pipe']});let out='',err='';const timer=setTimeout(()=>{p.kill('SIGKILL');reject(new Error('timeout'));},90000);p.stdout.setEncoding('utf8');p.stderr.setEncoding('utf8');p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>err+=d);p.on('close',code=>{clearTimeout(timer);code===0?resolve(out.trim()):reject(new Error(`claude:${code}:${err.slice(0,160)}`));});p.on('error',e=>{clearTimeout(timer);reject(e)});p.stdin.end();});}
const clean=(s:string)=>s.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
function parse(s:string):{motif:Motif}{return JSON.parse(clean(s)) as {motif:Motif};}
function edgeKey(a:string,b:string){return [a,b].sort().join('|');}
function edgeMap(f:Fixture){return new Map(f.edges.map(e=>[edgeKey(e.a,e.b),e.op]));}
function op(f:Fixture,a:string,b:string){return edgeMap(f).get(edgeKey(a,b));}
function triples(xs:string[]){const out:string[][]=[];for(let i=0;i<xs.length;i++)for(let j=i+1;j<xs.length;j++)for(let k=j+1;k<xs.length;k++)out.push([xs[i]!,xs[j]!,xs[k]!]);return out;}
function deterministic(f:Fixture):Motif{
  const em=edgeMap(f);
  if(f.nodes.length===4&&f.edges.length===6){
    const pol=f.edges.filter(e=>e.op==='POLARITY'); const cross=f.edges.filter(e=>e.op==='CROSS_CONSTRAINT');
    if(pol.length===2&&cross.length===4){const degree=new Map<string,number>();for(const e of pol){degree.set(e.a,(degree.get(e.a)||0)+1);degree.set(e.b,(degree.get(e.b)||0)+1);}if([...degree.values()].length===4&&[...degree.values()].every(x=>x===1))return 'BALANCED_CROSS_CONSTRAINT';}
  }
  for(const [a,b,c] of triples(f.nodes)){
    const es=[em.get(edgeKey(a,b)),em.get(edgeKey(a,c)),em.get(edgeKey(b,c))];
    const counts=(x:Op)=>es.filter(v=>v===x).length;
    if(counts('POLARITY')===1&&counts('CROSS_CONSTRAINT')===2)return 'CROSS_CONSTRAINT_TRIAD';
    if(counts('FACILITATIVE_RESONANCE')===3)return 'RESONANT_TRIAD';
    if(counts('CROSS_CONSTRAINT')===1&&counts('OPTIONAL_COUPLING')===2)return 'ASYMMETRIC_FOCAL_CONFIGURATION';
    if(counts('POLARITY')===1&&counts('FACILITATIVE_RESONANCE')===2)return 'POLAR_MEDIATION_TRIAD';
  }
  return 'NONE';
}

const system=`Offline neutral relational-geometry research. Classify the FULL GRAPH into exactly one motif. No astrology vocabulary is relevant. Definitions:\n${motifDefs}\nReturn JSON only: {"motif":"CROSS_CONSTRAINT_TRIAD"|"RESONANT_TRIAD"|"ASYMMETRIC_FOCAL_CONFIGURATION"|"POLAR_MEDIATION_TRIAD"|"BALANCED_CROSS_CONSTRAINT"|"NONE"}. Exact endpoint topology matters; the same multiset of edge types can form a motif or not.`;
function graphPrompt(f:Fixture){return `NODES: ${f.nodes.join(', ')}\nEDGES:\n${f.edges.map(e=>`${e.a} --${e.op}-- ${e.b}`).join('\n')}`;}
async function main(){
  if(process.env.H6D_DETERMINISTIC_ONLY==='1'){
    const rows=fixtures.map(f=>({fixture:f.id,expected:f.expected,predicted:deterministic(f),correct:deterministic(f)===f.expected,bag:bag(f)}));
    console.log(JSON.stringify({correct:rows.filter(r=>r.correct).length,total:rows.length,rows},null,2)); return;
  }
  const collisionRows=Object.entries(Object.groupBy(fixtures,f=>f.collision)).map(([group,fs])=>({group,fixtureIds:fs!.map(f=>f.id),sameBag:new Set(fs!.map(bag)).size===1,expected:fs!.map(f=>f.expected)}));
  const bagUpperBound=collisionRows.reduce((n,g)=>n+Math.max(...Object.values(Object.groupBy(g.expected,x=>x)).map(xs=>xs!.length)),0);
  const rows:any[]=[];
  for(const f of fixtures)for(let run=1;run<=REPEATS;run++){
    const raw=await call(system,graphPrompt(f));let motif:Motif='NONE';let parseError:string|null=null;
    try{motif=parse(raw).motif;}catch(e){parseError=e instanceof Error?e.message:String(e);}
    rows.push({fixture:f.id,run,rawHash:sha(raw),prediction:motif,expected:f.expected,correct:motif===f.expected,parseError});
  }
  const byFixture=Object.fromEntries(fixtures.map(f=>{const rs=rows.filter(r=>r.fixture===f.id);return[f.id,{runs:rs.length,correct:rs.filter(r=>r.correct).length,predictions:rs.map(r=>r.prediction),bag:bag(f),deterministic:deterministic(f)}]}));
  const detCorrect=fixtures.filter(f=>deterministic(f)===f.expected).length;
  const output={
    schema:'RELATIONAL_GEOMETRY_H6D_CONFIGURATION_MOTIFS_V1',authority:'offline research only',
    hypothesis:'Incidence geometry of neutral relation operators carries motif information unavailable from the multiset of component relation types alone.',
    inference:{provider:'anthropic',model:MODEL,path:'local Claude CLI restricted/no-tools',effort:'low',astrologicalLabelsExposed:false},
    collisionTest:{pairs:collisionRows,bagOnlyMaximumCorrect:bagUpperBound,total:fixtures.length},
    fullTopology:{modelRuns:rows.length,modelCorrect:rows.filter(r=>r.correct).length,deterministicCorrect:detCorrect,deterministicTotal:fixtures.length},
    byFixture,rows,
    researchOnlyAnalogueMap:{CROSS_CONSTRAINT_TRIAD:'T-square-like hypothesis source',RESONANT_TRIAD:'grand-trine-like hypothesis source',ASYMMETRIC_FOCAL_CONFIGURATION:'yod-like focal hypothesis source',BALANCED_CROSS_CONSTRAINT:'grand-cross-like hypothesis source',POLAR_MEDIATION_TRIAD:'neutral polarity-mediation family; no one-to-one traditional claim'},
    law:'Configuration is a property of relation incidence topology, not merely the inventory of edge types. Symbolic names remain downstream analogies only.'
  };
  const out=path.join(process.cwd(),'docs/programme/evidence/relational-geometry-integration/H6D_CONFIGURATION_MOTIFS_2026-09-16.json');fs.writeFileSync(out,JSON.stringify(output,null,2)+'\n');
  console.log(JSON.stringify({collisionTest:output.collisionTest,fullTopology:output.fullTopology,byFixture},null,2));
}
main().catch(e=>{console.error(e);process.exit(1)});
