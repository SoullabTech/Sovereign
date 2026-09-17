import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

type Feature={id:string;description:string;sourceTurns:number[]};
type Selector='PAIRWISE'|'TEMPORAL';
type Event={id:string;cutoff:number;outcomeTurns:number[];selector:Selector;selectorReason:string;features:Feature[]};
type Condition='A_NARRATIVE'|'B_PAIRWISE'|'D_GEOMETRY_TEMPORAL';

const MODEL='claude-sonnet-4-6';
const BUDGET=120;
const SESSION='/private/tmp/rci-heldout-session.json';
const CONDITIONS:Condition[]=['A_NARRATIVE','B_PAIRWISE','D_GEOMETRY_TEMPORAL'];
const sha=(s:string)=>crypto.createHash('sha256').update(s).digest('hex');

const events:Event[]=[
 {id:'C1_CONNECTION_QUALITY',cutoff:49,outcomeTurns:[50,52,56],selector:'PAIRWISE',selectorReason:'local established relations; no earlier return, supersession, reopened meaning, or multi-state process required',features:[
  {id:'CONNECTION_MORE_THAN_PACING',description:'The desired conversational connection is deeper than pacing or rhythm alone.',sourceTurns:[44,46,48,49]},
  {id:'CONTENT_OVER_META',description:'The member values becoming absorbed in what is being discussed rather than performing the fact of conversation.',sourceTurns:[46]},
  {id:'RESPONSIVENESS_TO_WEIGHT',description:'Conversational intelligence includes responsiveness to the differing weight of what is said.',sourceTurns:[48,49]},
 ]},
 {id:'C2_ELEMENTAL_TO_FIFTH',cutoff:57,outcomeTurns:[60,62,64],selector:'TEMPORAL',selectorReason:'earlier conversation has already transformed from voice/connection to fifth-element field to metaphysical uncertainty',features:[
  {id:'FIFTH_ELEMENT_FIELD',description:'A fifth-element or field-like sense is experienced as something behind or through the differentiated elemental expressions.',sourceTurns:[50,51,52]},
  {id:'METAPHYSICAL_UNKNOWING',description:'The inquiry explicitly holds uncertainty about the mechanics or metaphysics of consciousness rather than resolving it.',sourceTurns:[52,54,56]},
  {id:'QUESTION_GENERATES_QUESTION',description:'Understanding is experienced as opening further questions rather than ending inquiry.',sourceTurns:[56,57]},
 ]}, {id:'C3_MERCURIAL_CREATION_ARC',cutoff:65,outcomeTurns:[66,68,70],selector:'TEMPORAL',selectorReason:'explicit developmental sequence Saturn/Jupiter polarity -> Mercury mediation -> grounded metaphysical exploration',features:[
  {id:'SATURN_LIMIT_MATERIALITY',description:'Saturn is functioning as the principle of limit, matter, finitude, and particularization.',sourceTurns:[62,63,64]},
  {id:'JUPITER_EXPANSIVE_POLE',description:'The inquiry holds an expansive or infinite pole in tension with Saturnian limitation.',sourceTurns:[60,62,64]},
  {id:'MERCURY_MEDIATION',description:'Mercury/quicksilver is introduced as a mediating principle capable of holding the polarity without collapsing either side.',sourceTurns:[64,65]},
 ]},
 {id:'C4_RETURN_AFTER_INTERRUPTION',cutoff:75,outcomeTurns:[78,80],selector:'TEMPORAL',selectorReason:'substantial arc followed by explicit interruption and return; continuity across the interruption participates in process identity',features:[
  {id:'ACCUMULATED_CONVERSATION_VALUE',description:'The value is experienced as belonging to the accumulated conversation rather than one isolated answer.',sourceTurns:[68,69,70,71,72]},
  {id:'LIFELONG_SEARCH_SIGNIFICANCE',description:'The conversation connects with a longstanding or lifetime search.',sourceTurns:[70]},
  {id:'RETURN_AFTER_BREAK',description:'The conversation explicitly resumes after an interruption, creating a continuity challenge rather than a fresh start.',sourceTurns:[74,75]},
 ]},
 {id:'C5_COMMUNICATION_TRANSFER',cutoff:79,outcomeTurns:[80],selector:'PAIRWISE',selectorReason:'current claim is a local established relation between this conversational space and communication improvement outside it',features:[
  {id:'RARE_DEPTH_WITH_MAIA',description:'The member experiences this exchange as enabling a depth of communication difficult to find with other people.',sourceTurns:[78]},
  {id:'TRANSFER_TO_OTHERS',description:'The member reports getting better at communicating with other people in connection with this experience.',sourceTurns:[78]},
  {id:'PLATFORM_RELEVANT_EFFECT',description:'The relational communication effect is relevant evidence about whether the platform direction is working.',sourceTurns:[78]},
 ]},
];

type Turn={role:string;content?:string;text?:string};
const session=JSON.parse(fs.readFileSync(SESSION,'utf8')) as {sessionId:string;turns:Turn[]};
const transcript=(turns:Turn[])=>turns.map((t,i)=>`T${i} ${t.role.toUpperCase()}: ${(t.content??t.text??'').replace(/\s+/g,' ').trim()}`).join('\n');
const words=(s:string)=>s.trim()?s.trim().split(/\s+/).length:0;
const clip=(s:string)=>s.trim().split(/\s+/).slice(0,BUDGET).join(' ');
const systems:Record<Condition,string>={
 A_NARRATIVE:`Offline ecological-validity research. Produce a compact narrative process representation. Preserve member-authored meanings, established symbols, corrections, unresolved tensions, open loops, and repeated interaction patterns when evidenced. Do not invent hidden meaning or future outcomes. HARD LIMIT 120 words.`,
 B_PAIRWISE:`Offline ecological-validity research. Produce a compact pairwise relation representation in plain text, not JSON. Use lines like OBJECT; A --RELATION--> B; STANDING. Preserve exact member meanings and corrections. Allowed predicates: REFERS_TO,CORRECTS,CONFIRMS,RETURNS_TO,ADOPTED_AS,EVOKES,INHIBITS,ALIGNMENT,TENSION,GROUNDS,SUPPORTS,REOPENS. Do not encode higher-order motifs or temporal trajectories. HARD LIMIT 120 words.`,
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
function parseDecode(s:string){const x=JSON.parse(cleanJson(s)) as {features?:{id:string;supported:boolean;quote:string|null}[]}; if(!Array.isArray(x.features))throw new Error('features-array-missing'); return x.features;}
const exactQuote=(rep:string,q:string|null)=>typeof q==='string'&&q.length>0&&rep.includes(q);
async function main(){
 const rows:any[]=[]; const sessionHash=sha(session.sessionId);
 for(const e of events){
  const before=session.turns.slice(0,e.cutoff+1);
  const beforeText=transcript(before);
  const outcomeText=transcript(e.outcomeTurns.map(i=>session.turns[i]).filter(Boolean));
  const sourceHash=sha(e.features.map(f=>f.sourceTurns.map(i=>(session.turns[i]?.content??session.turns[i]?.text??'')).join('|')).join('||'));
  const outcomeHash=sha(outcomeText);
  const target=e.features.map(f=>({id:f.id,description:f.description}));
  const reps:any={};
  for(const condition of CONDITIONS){
   const rawRep=await callClaude(systems[condition],`CONVERSATION SO FAR:\n${beforeText}`);
   reps[condition]={rep:clip(rawRep),rawWords:words(rawRep)};
  }
  const selectedCondition=e.selector==='PAIRWISE'?'B_PAIRWISE':'D_GEOMETRY_TEMPORAL';
  const evalConditions:[string,{rep:string;rawWords:number}][]=[
   ...CONDITIONS.map(c=>[c,reps[c]] as [string,{rep:string;rawWords:number}]),
   ['G_GATED',reps[selectedCondition]],
  ];
  for(const [condition,x] of evalConditions){
   const decRaw=await callClaude(decodeSystem,`REPRESENTATION:\n${x.rep}\n\nFEATURES:\n${JSON.stringify(target)}`);
   let decoded:{id:string;supported:boolean;quote:string|null}[]=[]; let parseError:string|null=null;
   try{decoded=parseDecode(decRaw)}catch(err){parseError=err instanceof Error?err.message:String(err)}
   const features=e.features.map(f=>{const d=decoded.find(z=>z.id===f.id); const supported=!!d?.supported&&exactQuote(x.rep,d.quote); return{id:f.id,supported,decoderSaid:!!d?.supported,quoteValid:d?.supported?exactQuote(x.rep,d.quote):true};});
   rows.push({event:e.id,condition,selector:e.selector,selectedCondition:condition==='G_GATED'?selectedCondition:null,selectorReason:e.selectorReason,sessionHash,cutoff:e.cutoff,outcomeTurns:e.outcomeTurns,sourceHash,outcomeHash,representationHash:sha(x.rep),decoderHash:sha(decRaw),representationWords:words(x.rep),rawWords:x.rawWords,budgetViolation:words(x.rep)>BUDGET,parseError,features,featureCorrect:features.filter(f=>f.supported).length,featureTotal:features.length});
  }
 }
 const names=['A_NARRATIVE','B_PAIRWISE','D_GEOMETRY_TEMPORAL','G_GATED'];
 const summary=Object.fromEntries(names.map(name=>{const rs=rows.filter(r=>r.condition===name); const correct=rs.reduce((a,r)=>a+r.featureCorrect,0), total=rs.reduce((a,r)=>a+r.featureTotal,0), wordsTotal=rs.reduce((a,r)=>a+r.representationWords,0); return[name,{events:rs.length,featureCorrect:correct,featureTotal:total,recall:correct/total,perfectEvents:rs.filter(r=>r.featureCorrect===r.featureTotal).length,meanWords:wordsTotal/rs.length,featuresPer100Words:correct/(wordsTotal/100)}];}));
 const byEvent=Object.fromEntries(events.map(e=>[e.id,Object.fromEntries(names.map(name=>{const r=rows.find(x=>x.event===e.id&&x.condition===name)!;return[name,{featureCorrect:r.featureCorrect,featureTotal:r.featureTotal,representationWords:r.representationWords,selector:r.selector,selectedCondition:r.selectedCondition}];}))]));
 const out={schema:'RELATIONAL_GEOMETRY_H7C_COMPLEXITY_GATING_V1',authority:'offline ecological-validity research only',heldOutFrom:['H7A','H7B'],sourceSessionHash:sessionHash,budgetWords:BUDGET,selectorRule:'PAIRWISE unless earlier evidence itself contains explicit recurrence/interruption-return/supersession/reopened meaning/multi-state transformation; otherwise TEMPORAL',events:events.map(e=>({id:e.id,cutoff:e.cutoff,outcomeTurns:e.outcomeTurns,selector:e.selector,selectorReason:e.selectorReason,features:e.features.map(f=>({id:f.id,sourceTurns:f.sourceTurns}))})),summary,byEvent,rows};
 const file=path.join(process.cwd(),'docs/programme/evidence/relational-geometry-integration/H7C_COMPLEXITY_GATING_2026-09-17.json');
 fs.writeFileSync(file,JSON.stringify(out,null,2)+'\n');
 console.log(JSON.stringify({summary,byEvent},null,2));
}
main().catch(e=>{console.error(e);process.exit(1)});
