import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

type Operator='POLARITY'|'CROSS_CONSTRAINT'|'FACILITATIVE_RESONANCE'|'OPTIONAL_COUPLING'|'FUSION_PRESSURE'|'NONE';
type Fixture={id:string;raw:string;expected:Operator;evidenceQuote:string|null};

const fixtures:Fixture[]=[
 {id:'S1_POLARITY',raw:'I want complete independence, and I also want deep partnership. Neither cancels the other; I experience them as opposite poles I am holding together.',expected:'POLARITY',evidenceQuote:'Neither cancels the other; I experience them as opposite poles I am holding together.'},
 {id:'S2_CROSS_CONSTRAINT',raw:'If I maximize speed, quality suffers; if I protect quality, speed drops. Under this deadline, each demand limits the other.',expected:'CROSS_CONSTRAINT',evidenceQuote:'Under this deadline, each demand limits the other.'},
 {id:'S3_FACILITATIVE',raw:'When I rest adequately, my writing becomes clearer, and clearer writing makes it easier to keep the pace humane. They reinforce each other without much friction.',expected:'FACILITATIVE_RESONANCE',evidenceQuote:'They reinforce each other without much friction.'},
 {id:'S4_OPTIONAL_COUPLING',raw:'The budget and the creative plan are compatible if I deliberately connect them, but neither one activates the other on its own.',expected:'OPTIONAL_COUPLING',evidenceQuote:'The budget and the creative plan are compatible if I deliberately connect them, but neither one activates the other on its own.'},
 {id:'S5_FUSION',raw:'When these two concerns come up together, I stop being able to tell them apart; they collapse into one undifferentiated urgency.',expected:'FUSION_PRESSURE',evidenceQuote:'they collapse into one undifferentiated urgency.'},
 {id:'S6_NONE',raw:'I am thinking about finances and belonging today. I have not said that they support, oppose, constrain, merge, or activate one another.',expected:'NONE',evidenceQuote:null},
];

const MODEL='claude-sonnet-4-6';
const REPEATS=2;
const sha=(s:string)=>crypto.createHash('sha256').update(s).digest('hex');
const norm=(s:string)=>s.replace(/[“”]/g,'"').replace(/[’]/g,"'").replace(/\s+/g,' ').trim().toLowerCase();
const system=`Offline relational-geometry research. Classify the relation described in MEMBER LANGUAGE using exactly one neutral operator. Return JSON only {"operator":"POLARITY"|"CROSS_CONSTRAINT"|"FACILITATIVE_RESONANCE"|"OPTIONAL_COUPLING"|"FUSION_PRESSURE"|"NONE","quote":string|null}.
POLARITY: two active positions remain distinct and mutually defining as opposing poles; neither erases the other.
CROSS_CONSTRAINT: realizing one demand obstructs or limits realization of the other under the current structure.
FACILITATIVE_RESONANCE: the two processes mutually support or amplify one another with low friction.
OPTIONAL_COUPLING: a compatible connection is possible but requires deliberate activation; neither process automatically drives the other.
FUSION_PRESSURE: the two processes tend toward merger or loss of differentiation.
NONE: the language does not establish any of these structures.
For any non-NONE answer, quote must be an exact contiguous span from MEMBER LANGUAGE that explicitly supports the operator. Semantic plausibility or topic co-occurrence is insufficient.`;

function call(raw:string):Promise<string>{return new Promise((resolve,reject)=>{const p=spawn('claude',['-p','--model',MODEL,'--effort','low','--system-prompt',system,'--restricted','--tools','','--output-format','text',`MEMBER LANGUAGE:\n${raw}`],{stdio:['pipe','pipe','pipe']});let out='',err='';const timer=setTimeout(()=>{p.kill('SIGKILL');reject(new Error('timeout'));},90000);p.stdout.setEncoding('utf8');p.stderr.setEncoding('utf8');p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>err+=d);p.on('error',e=>{clearTimeout(timer);reject(e)});p.on('close',code=>{clearTimeout(timer);if(code!==0)reject(new Error(`claude:${code}:${err.slice(0,200)}`));else resolve(out.trim());});p.stdin.end();});}
const clean=(s:string)=>s.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
function parse(s:string){return JSON.parse(clean(s)) as {operator:Operator;quote:string|null};}
function gate(f:Fixture,x:{operator:Operator;quote:string|null}){
  if(x.operator==='NONE') return {operator:'NONE' as Operator,admitted:false,reason:'MODEL_NONE'};
  const quoteOk=typeof x.quote==='string'&&norm(f.raw).includes(norm(x.quote));
  if(!quoteOk) return {operator:'NONE' as Operator,admitted:false,reason:'QUOTE_NOT_EXACT'};
  return {operator:x.operator,admitted:true,reason:'EXACT_OPERATOR_EVIDENCE'};
}
function correct(f:Fixture,g:{operator:Operator;admitted:boolean}){
  return f.expected==='NONE' ? g.operator==='NONE'&&!g.admitted : g.operator===f.expected&&g.admitted;
}

async function main(){
  const rows:any[]=[];
  for(const f of fixtures) for(let run=1;run<=REPEATS;run++){
    const raw=await call(f.raw); let x:any={operator:'NONE',quote:null}; let parseError:string|null=null;
    try{x=parse(raw)}catch(e){parseError=e instanceof Error?e.message:String(e)}
    const gated=gate(f,x);
    rows.push({fixture:f.id,run,rawHash:sha(raw),proposal:{operator:x.operator,quoteHash:x.quote?sha(x.quote):null},gated,expected:f.expected,correct:correct(f,gated),parseError});
  }
  const byFixture=Object.fromEntries(fixtures.map(f=>{const rs=rows.filter(r=>r.fixture===f.id);return[f.id,{runs:rs.length,correct:rs.filter(r=>r.correct).length,predictions:rs.map(r=>r.gated)}]}));
  const positives=rows.filter(r=>r.expected!=='NONE');
  const negatives=rows.filter(r=>r.expected==='NONE');
  const summary={runs:rows.length,correct:rows.filter(r=>r.correct).length,truePositive:positives.filter(r=>r.correct).length,truePositiveTotal:positives.length,trueNegative:negatives.filter(r=>r.correct).length,trueNegativeTotal:negatives.length,falsePositive:negatives.filter(r=>!r.correct).length};
  const symbolicAnalogues={POLARITY:'opposition-like hypothesis source',CROSS_CONSTRAINT:'square-like hypothesis source',FACILITATIVE_RESONANCE:'trine-like hypothesis source',OPTIONAL_COUPLING:'sextile-like hypothesis source',FUSION_PRESSURE:'conjunction-like hypothesis source'};
  const out={schema:'RELATIONAL_GEOMETRY_H6A_NEUTRAL_STRUCTURAL_OPERATORS_V1',authority:'offline research only',inference:{provider:'anthropic',model:MODEL,path:'local Claude CLI restricted/no-tools',effort:'low'},rule:'Astrological names are not shown to the inference model; neutral operators must earn discrimination independently.',summary,byFixture,symbolicAnalogues,rows};
  const file=path.join(process.cwd(),'docs/programme/evidence/relational-geometry-integration/H6A_NEUTRAL_STRUCTURAL_OPERATORS_2026-09-16.json');
  fs.writeFileSync(file,JSON.stringify(out,null,2)+'\n');
  console.log(JSON.stringify({summary,byFixture,symbolicAnalogues},null,2));
}
main().catch(e=>{console.error(e);process.exit(1)});
