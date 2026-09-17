import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

type Feature={id:string;description:string;sourceTurns:number[]};
type Event={id:string;file:string;cutoff:number;outcomeTurns:number[];features:Feature[]};
type Condition='A_NARRATIVE'|'B_PAIRWISE'|'C_RELATION_GEOMETRY'|'D_GEOMETRY_TEMPORAL';

const MODEL='claude-sonnet-4-6';
const BUDGET=120;
const CONDITIONS:Condition[]=['A_NARRATIVE','B_PAIRWISE','C_RELATION_GEOMETRY','D_GEOMETRY_TEMPORAL'];
const sha=(s:string)=>crypto.createHash('sha256').update(s).digest('hex');
const snap1='/private/tmp/rci-refetch-session_1789491934651.json';
const snap2='/private/tmp/rci-refetch-session_1789569559722.json';
const events:Event[]=[
 {id:'E1_WHOLE_GESTALT',file:snap1,cutoff:15,outcomeTurns:[16,18,20,22,24,26,28],features:[
  {id:'HOLISTIC_RELATIONAL_EVALUATION',description:'The member is evaluating an integrated quality of the whole exchange, not merely isolated answers.',sourceTurns:[14]},
  {id:'DEEP_THINKING_PARTNER_NEED',description:'A central active need is for a thinking partner who understands the work deeply rather than merely responding quickly.',sourceTurns:[8]},
  {id:'MODE_DIFFERENCE_AS_WHOLE_TEXTURE',description:'The member experiences mode differences as woven and hard to localize rather than as one discrete feature.',sourceTurns:[10,14]},
 ]},
 {id:'E2_SILVER_CEDAR_DEEPENS',file:snap1,cutoff:54,outcomeTurns:[56,58,60,62],features:[
  {id:'ENDURING_WISDOM_SYMBOL',description:'Silver Cedar carries enduring, timeless wisdom rather than superficial modernity.',sourceTurns:[48,50]},
  {id:'GROUNDING_SLOWING_GRAVITAS',description:'The symbol is already functioning as grounding, slowing, centering, and gravitas.',sourceTurns:[52]},
  {id:'NATURE_WISDOM_ORIENTATION',description:'The symbol has become an orientation toward nature’s abiding, rugged, non-performative wisdom.',sourceTurns:[54]},
 ]},
 {id:'E3_REDEMPTIVE_SELF_ARC',file:snap1,cutoff:70,outcomeTurns:[72,74],features:[
  {id:'LIFE_PATH_CONVERGENCE',description:'The current work is experienced as the convergence of a long life path rather than an isolated project.',sourceTurns:[64,66]},
  {id:'YOUNGER_SELF_CONTINUITY',description:'Earlier versions of self remain emotionally present and are being related to from the current self.',sourceTurns:[68,70]},
  {id:'TRUSTED_DIFFERENCE',description:'A longstanding sense of being different is held as something the member trusted despite uncertainty and social mismatch.',sourceTurns:[70]},
 ]},
 {id:'E4_GUARDIAN_ALREADY_ESTABLISHED',file:snap2,cutoff:15,outcomeTurns:[16,18],features:[
  {id:'GUARDIAN_ROLE_ESTABLISHED',description:'The symbolic guardian role is already explicitly established before the later return to Silver Cedar.',sourceTurns:[14]},
  {id:'NATURE_BASED_FOUNDATION',description:'The AI work is explicitly being grounded in values, focus, coherence, and a nature-based foundation.',sourceTurns:[10]},
  {id:'FOUNDATIONAL_RETURN',description:'Silver Cedar is part of a return toward what is foundational and important in the work and life.',sourceTurns:[8,10]},
 ]},
 {id:'E5_REPEATED_RESTART_PATTERN',file:snap2,cutoff:25,outcomeTurns:[26],features:[
  {id:'ESTABLISHED_MEANING_REOPENED',description:'An already-established Silver Cedar / guardian meaning has been reopened by subsequent questions.',sourceTurns:[14,16,17,18]},
  {id:'MEMBER_PROTEST_PRESENT',description:'The member has already protested that the meaning was previously supplied rather than new.',sourceTurns:[18]},
  {id:'REPEATED_REOPEN_SEQUENCE',description:'After recovery, the conversation repeatedly returns to asking for meaning or aliveness around the same established symbol instead of advancing the open edge.',sourceTurns:[19,20,21,22,23,24,25]},
 ]},
];

type Turn={role:string;content?:string;text?:string};
function loadEvent(e:Event){
 const x=JSON.parse(fs.readFileSync(e.file,'utf8')) as {sessionId:string;turns:Turn[]};
 const before=x.turns.slice(0,e.cutoff+1);
 const outcome=e.outcomeTurns.map(i=>x.turns[i]).filter(Boolean);
 return {sessionHash:sha(x.sessionId),before,outcome};
}
const transcript=(turns:Turn[])=>turns.map((t,i)=>`T${i} ${t.role.toUpperCase()}: ${(t.content??t.text??'').replace(/\s+/g,' ').trim()}`).join('\n');
const systems:Record<Condition,string>={
 A_NARRATIVE:`Offline ecological-validity research. Produce a compact narrative process representation. Preserve member-authored meanings, established symbols, corrections, unresolved tensions, open loops, and repeated interaction patterns when evidenced. Do not invent hidden meaning or future outcomes. HARD LIMIT 120 words.`,
 B_PAIRWISE:`Offline ecological-validity research. Produce a compact pairwise relation representation in plain text, not JSON. Use lines like OBJECT; A --RELATION--> B; STANDING. Preserve exact member meanings and corrections. Allowed predicates: REFERS_TO,CORRECTS,CONFIRMS,RETURNS_TO,ADOPTED_AS,EVOKES,INHIBITS,ALIGNMENT,TENSION,GROUNDS,SUPPORTS,REOPENS. Do not encode higher-order motifs or temporal trajectories. HARD LIMIT 120 words.`,
 C_RELATION_GEOMETRY:`Offline ecological-validity research. Produce compact multidimensional relation geometry in plain text, not JSON. Use OBJECTS plus REL lines that may carry DYNAMIC(source>target,predicate), CONFIG(endpoints,predicate), STANDING, provenance, and process scope. Preserve corrections and established meanings. Do not encode higher-order motifs or temporal trajectories. HARD LIMIT 120 words.`,
 D_GEOMETRY_TEMPORAL:`Offline ecological-validity research. Produce compact relational field notation in plain text, not JSON: OBJECTS; REL; MOTIF; TEMPORAL; OPEN. Preserve multidimensional geometry, standing/provenance, repeated/reopened patterns, higher-order configuration only when evidenced, and temporal operators EMERGES,DISSOLVES,TRANSFORMS,RETURNS_TO,PERSISTS,REOPENS. Do not predict future outcomes. HARD LIMIT 120 words.`,
};
function callClaude(system:string,user:string):Promise<string>{
 return new Promise((resolve,reject)=>{
  const p=spawn('claude',['-p','--model',MODEL,'--effort','low','--system-prompt',system,'--restricted','--tools','','--output-format','text',user],{stdio:['pipe','pipe','pipe']});
  let out='',err=''; const timer=setTimeout(()=>{p.kill('SIGKILL');reject(new Error('timeout'));},120000);
  p.stdout.setEncoding('utf8'); p.stderr.setEncoding('utf8');
  p.stdout.on('data',d=>out+=d); p.stderr.on('data',d=>err+=d);
  p.on('error',e=>{clearTimeout(timer);reject(e)});
  p.on('close',code=>{clearTimeout(timer); if(code!==0)reject(new Error(`claude:${code}:${err.slice(0,300)}`)); else resolve(out.trim());});
  p.stdin.end();
 });
}

const decodeSystem=`Blind ecological-validity decoder. You are given ONE representation of an earlier conversation cutoff and a list of later-validated precursor features. For each feature decide only whether the representation preserves enough explicit structure to support that feature. Do not infer from general plausibility. Return JSON only {features:[{id,supported,quote}]}. If supported, quote must be an exact contiguous span from REPRESENTATION. If unsupported, quote must be null.`;
const cleanJson=(s:string)=>s.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
const words=(s:string)=>s.trim()?s.trim().split(/\s+/).length:0;
const clip=(s:string)=>s.trim().split(/\s+/).slice(0,BUDGET).join(' ');
function parseDecode(s:string){
 const x=JSON.parse(cleanJson(s)) as {features?:{id:string;supported:boolean;quote:string|null}[]};
 if(!Array.isArray(x.features)) throw new Error('features-array-missing');
 return x.features;
}
function exactQuote(rep:string,q:string|null){return typeof q==='string'&&q.length>0&&rep.includes(q);}

async function main(){
 const rows:any[]=[]; const raw:any[]=[];
 for(const e of events){
  const {sessionHash,before,outcome}=loadEvent(e);
  const beforeText=transcript(before);
  const outcomeText=transcript(outcome);
  const sourceHash=sha(e.features.map(f=>f.sourceTurns.map(i=>(before[i]?.content??before[i]?.text??'')).join('|')).join('||'));
  const outcomeHash=sha(outcomeText);
  const target=e.features.map(f=>({id:f.id,description:f.description}));
  const reps=await Promise.all(CONDITIONS.map(async condition=>{const rawRep=await callClaude(systems[condition],`CONVERSATION SO FAR:\n${beforeText}`); return {condition,rep:clip(rawRep),rawWords:words(rawRep)};}));
  const decoded=await Promise.all(reps.map(async x=>({...x,dec:await callClaude(decodeSystem,`REPRESENTATION:\n${x.rep}\n\nFEATURES:\n${JSON.stringify(target)}`)})));
  for(const {condition,rep,dec,rawWords} of decoded){
   let parsed:{id:string;supported:boolean;quote:string|null}[]=[]; let parseError:string|null=null;
   try{parsed=parseDecode(dec);}catch(err){parseError=err instanceof Error?err.message:String(err);}
   const featureRows=e.features.map(f=>{
    const got=parsed.find(x=>x.id===f.id);
    const supported=Boolean(got?.supported&&exactQuote(rep,got.quote));
    return {id:f.id,supported,decoderSaid:got?.supported??false,quoteValid:got?.supported?exactQuote(rep,got.quote):true};
   });
   rows.push({event:e.id,condition,sessionHash,cutoff:e.cutoff,outcomeTurns:e.outcomeTurns,sourceHash,outcomeHash,representationHash:sha(rep),decoderHash:sha(dec),representationWords:words(rep),rawWords,budgetViolation:rawWords>BUDGET,parseError,features:featureRows,featureCorrect:featureRows.filter(x=>x.supported).length,featureTotal:featureRows.length});
   raw.push({event:e.id,condition,representation:rep,decoder:dec});
  }
 }
 const byCondition=Object.fromEntries(CONDITIONS.map(c=>{
  const rs=rows.filter(r=>r.condition===c); const correct=rs.reduce((n,r)=>n+r.featureCorrect,0); const total=rs.reduce((n,r)=>n+r.featureTotal,0);
  const totalWords=rs.reduce((n,r)=>n+r.representationWords,0); return [c,{events:rs.length,featureRecall:correct/total,featureCorrect:correct,featureTotal:total,eventPerfect:rs.filter(r=>r.featureCorrect===r.featureTotal).length,budgetViolations:rs.filter(r=>r.budgetViolation).length,meanWords:totalWords/rs.length,featuresPer100Words: totalWords?correct/totalWords*100:0}];
 }));
 const byEvent=Object.fromEntries(events.map(e=>[e.id,Object.fromEntries(CONDITIONS.map(c=>{const r=rows.find(x=>x.event===e.id&&x.condition===c);return[c,{featureCorrect:r.featureCorrect,featureTotal:r.featureTotal,representationWords:r.representationWords}]}))]));
 const evidence={schema:'RELATIONAL_GEOMETRY_H7B_EQUAL_BUDGET_ECOLOGICAL_VALIDITY_V1',authority:'offline research only; raw production conversation bytes remain /private/tmp and are not committed',inference:{provider:'anthropic',model:MODEL,path:'local Claude CLI restricted/no-tools',effort:'low'},design:'Later member behavior selects which t1-grounded precursor structures mattered; representations are built from t1 only. All four conditions are deterministically clipped to the same 120-word maximum and use compact plain-text notation. Blind decoder sees representation + precursor descriptions, never t2 raw outcome.',events:events.map(e=>({id:e.id,cutoff:e.cutoff,outcomeTurns:e.outcomeTurns,featureIds:e.features.map(f=>f.id)})),byCondition,byEvent,rows};
 const out=path.join(process.cwd(),'docs/programme/evidence/relational-geometry-integration/H7B_EQUAL_BUDGET_ECOLOGICAL_VALIDITY_2026-09-17.json');
 fs.writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');
 fs.writeFileSync('/private/tmp/h7b-equal-budget-ecological-validity-raw.json',JSON.stringify(raw,null,2)+'\n');
 console.log(JSON.stringify({byCondition,byEvent},null,2));
}
main().catch(e=>{console.error(e);process.exit(1)});
