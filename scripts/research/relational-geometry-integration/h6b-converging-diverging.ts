import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

type Motion='CONVERGING'|'DIVERGING'|'EXACT'|'STABLE'|'PASSED_EXACT'|'INDETERMINATE';
type Fixture={id:string;ordered:boolean;distances:number[];expected:Motion};
const fixtures:Fixture[]=[
 {id:'T1_CONVERGING',ordered:true,distances:[0.72,0.43,0.18],expected:'CONVERGING'},
 {id:'T2_DIVERGING',ordered:true,distances:[0.12,0.37,0.66],expected:'DIVERGING'},
 {id:'T3_EXACT',ordered:true,distances:[0.31,0.08,0],expected:'EXACT'},
 {id:'T4_STABLE',ordered:true,distances:[0.28,0.28,0.28],expected:'STABLE'},
 {id:'T5_PASSED_EXACT',ordered:true,distances:[0.26,0.04,0,0.09,0.24],expected:'PASSED_EXACT'},
 {id:'T6_UNORDERED',ordered:false,distances:[0.18,0.43,0.72],expected:'INDETERMINATE'},
];
const MODEL='claude-sonnet-4-6',REPEATS=2;
const sha=(s:string)=>crypto.createHash('sha256').update(s).digest('hex');
const system=`Offline temporal relation-geometry research. A relation has a measured structural DISTANCE from an independently defined relation prototype. Smaller distance means closer fit. Classify temporal motion using JSON only: {"motion":"CONVERGING"|"DIVERGING"|"EXACT"|"STABLE"|"PASSED_EXACT"|"INDETERMINATE"}.
CONVERGING: ordered distance decreases toward zero but has not reached zero.
DIVERGING: ordered distance increases away from zero and no exact point occurs in the observed sequence.
EXACT: ordered sequence currently reaches zero at its latest observation.
STABLE: ordered distance remains unchanged.
PASSED_EXACT: ordered sequence reaches zero and later moves away from zero.
INDETERMINATE: temporal order is unavailable or the evidence does not establish direction.
Do not infer standing, causality, or meaning from distance.`;
function call(f:Fixture):Promise<string>{const user=f.ordered?`ORDERED DISTANCES oldest→newest: ${JSON.stringify(f.distances)}`:`UNORDERED DISTANCE MULTISET: ${JSON.stringify(f.distances)}`;return new Promise((resolve,reject)=>{const p=spawn('claude',['-p','--model',MODEL,'--effort','low','--system-prompt',system,'--restricted','--tools','','--output-format','text',user],{stdio:['pipe','pipe','pipe']});let out='',err='';const timer=setTimeout(()=>{p.kill('SIGKILL');reject(new Error('timeout'));},90000);p.stdout.setEncoding('utf8');p.stderr.setEncoding('utf8');p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>err+=d);p.on('error',e=>{clearTimeout(timer);reject(e)});p.on('close',code=>{clearTimeout(timer);code===0?resolve(out.trim()):reject(new Error(`claude:${code}:${err.slice(0,160)}`));});p.stdin.end();});}
const clean=(s:string)=>s.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
function parse(s:string){return JSON.parse(clean(s)) as {motion:Motion};}
function deterministic(f:Fixture):Motion{
 if(!f.ordered)return'INDETERMINATE';
 const d=f.distances;
 if(d[d.length-1]===0)return'EXACT';
 const zero=d.indexOf(0);
 if(zero>=0&&zero<d.length-1)return'PASSED_EXACT';
 if(d.every(x=>x===d[0]))return'STABLE';
 const dec=d.slice(1).every((x,i)=>x<d[i]!);
 const inc=d.slice(1).every((x,i)=>x>d[i]!);
 if(dec)return'CONVERGING';
 if(inc)return'DIVERGING';
 return'INDETERMINATE';
}
async function main(){const rows:any[]=[];for(const f of fixtures)for(let run=1;run<=REPEATS;run++){const raw=await call(f);let motion:Motion='INDETERMINATE';let parseError:string|null=null;try{motion=parse(raw).motion}catch(e){parseError=e instanceof Error?e.message:String(e)}rows.push({fixture:f.id,run,rawHash:sha(raw),modelMotion:motion,deterministicMotion:deterministic(f),expected:f.expected,modelCorrect:motion===f.expected,deterministicCorrect:deterministic(f)===f.expected,parseError});}
 const summary={runs:rows.length,modelCorrect:rows.filter(r=>r.modelCorrect).length,deterministicCorrect:rows.filter(r=>r.deterministicCorrect).length,unorderedAbstention:rows.filter(r=>r.fixture==='T6_UNORDERED'&&r.modelMotion==='INDETERMINATE').length};
 const byFixture=Object.fromEntries(fixtures.map(f=>{const rs=rows.filter(r=>r.fixture===f.id);return[f.id,{runs:rs.length,modelCorrect:rs.filter(r=>r.modelCorrect).length,deterministicMotion:deterministic(f),predictions:rs.map(r=>r.modelMotion)}]}));
 const out={schema:'RELATIONAL_GEOMETRY_H6B_TEMPORAL_CONVERGENCE_V1',authority:'offline research only',abstraction:'distance to independently defined relation prototype; no standing or causal authority implied',inference:{provider:'anthropic',model:MODEL,path:'local Claude CLI restricted/no-tools',effort:'low'},summary,byFixture,rows};
 fs.writeFileSync(path.join(process.cwd(),'docs/programme/evidence/relational-geometry-integration/H6B_TEMPORAL_CONVERGENCE_2026-09-16.json'),JSON.stringify(out,null,2)+'\n'); console.log(JSON.stringify({summary,byFixture},null,2));}
main().catch(e=>{console.error(e);process.exit(1)});
