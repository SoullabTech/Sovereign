import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

type Feature={id:string;description:string;sourceTurns:number[]};
type EventClass='WHOLE_FIELD'|'LOCAL_RELATIONAL'|'TEMPORAL_LOCAL';
type Event={id:string;class:EventClass;file:string;cutoff:number;outcomeTurns:number[];features:Feature[]};
type Manifest={schema:string;events:Event[]};
type Condition='B_PAIRWISE'|'D_TEMPORAL'|'E_GESTALT';

const MODEL='claude-sonnet-4-6';
const BUDGET=120;
const MANIFEST=process.env.H7D_CORPUS_MANIFEST || '/private/tmp/h7d-corpus-manifest.json';
const CONDITIONS:Condition[]=['B_PAIRWISE','D_TEMPORAL','E_GESTALT'];
const sha=(s:string)=>crypto.createHash('sha256').update(s).digest('hex');
const fileSha=(p:string)=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const manifest=JSON.parse(fs.readFileSync(MANIFEST,'utf8')) as Manifest;

type Turn={role:string;content?:string;text?:string};
const textOf=(t:Turn)=>t.content??t.text??'';
const transcript=(turns:Turn[])=>turns.map((t,i)=>`T${i} ${t.role.toUpperCase()}: ${textOf(t).replace(/\s+/g,' ').trim()}`).join('\n');
const words=(s:string)=>s.trim()?s.trim().split(/\s+/).length:0;
const clip=(s:string)=>s.trim().split(/\s+/).slice(0,BUDGET).join(' ');
const systems:Record<Condition,string>={
 B_PAIRWISE:`Offline ecological-validity research. Produce a compact pairwise relation representation in plain text. Use OBJECT and A --RELATION--> B lines with standing. Preserve member-authored meanings, corrections, explicit tensions, and established relations. Allowed predicates: REFERS_TO,CORRECTS,CONFIRMS,RETURNS_TO,ADOPTED_AS,EVOKES,INHIBITS,ALIGNMENT,TENSION,GROUNDS,SUPPORTS,REOPENS. Do not encode temporal trajectories or whole-field synthesis. HARD LIMIT 120 words.`,
 D_TEMPORAL:`Offline ecological-validity research. Produce compact relational field notation in plain text: OBJECTS; REL; MOTIF; TEMPORAL; OPEN. Preserve multidimensional relation geometry, standing/provenance, repeated or reopened patterns, and temporal operators EMERGES,DISSOLVES,TRANSFORMS,RETURNS_TO,PERSISTS,REOPENS only when evidenced. Do not create a whole-field phenomenological synthesis. HARD LIMIT 120 words.`,
 E_GESTALT:`Offline ecological-validity research. Produce a compact WHOLE-FIELD GESTALT projection in plain text with sections ACTIVE PROCESS; FIELD QUALITY; ESTABLISHED; TENSIONS/POLARITIES; MOVEMENT; OPEN EDGE. Integrate only what is explicitly supported across the conversation. Every substantive line must include evidence turn IDs like [T4,T10] and mark standing as MEMBER, MAIA, or UNCERTAIN. Do not infer hidden psychology, trait identity, metaphysical truth, or future outcome. The Gestalt is a disposable projection over evidence, never evidence itself. HARD LIMIT 120 words.`,
};

const REMOTE_HELPER='/tmp/h7d-anthropic-research.js';
const REMOTE_CODE=String.raw`const mod=require('/app/node_modules/@anthropic-ai/sdk'); const Anthropic=mod.default||mod; let b=''; process.stdin.setEncoding('utf8'); process.stdin.on('data',c=>b+=c); process.stdin.on('end',async()=>{const r=JSON.parse(b); const client=new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY}); const m=await client.messages.create({model:r.model,max_tokens:r.maxTokens,temperature:r.temperature,system:r.system,messages:[{role:'user',content:r.user}]}); const text=m.content.filter(x=>x.type==='text').map(x=>x.text).join(''); process.stdout.write(JSON.stringify({text,model:m.model}));});`;
function ssh(command:string,input?:string){
 const p=spawnSync('ssh',['soullab@minisforum',command],{input,encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024});
 if(p.status!==0) throw new Error(`ssh:${p.status}:${(p.stderr||'').slice(0,300)}`);
 return p.stdout;
}
function installRemote(){ssh(`docker exec -i maia-sovereign sh -c 'cat > ${REMOTE_HELPER}'`,REMOTE_CODE);}
function removeRemote(){try{ssh(`docker exec maia-sovereign rm -f ${REMOTE_HELPER}`);}catch{}}
function callClaude(system:string,user:string,temperature=0.2):Promise<string>{
 const req=JSON.stringify({model:MODEL,maxTokens:900,temperature,system,user});
 const out=ssh(`docker exec -i maia-sovereign node ${REMOTE_HELPER}`,req);
 const parsed=JSON.parse(out.trim()) as {text:string;model:string};
 return Promise.resolve(parsed.text.trim());
}
const decodeSystem=`Blind ecological-validity decoder. You are given ONE representation of an earlier conversation cutoff and a list of later-validated precursor features. For each feature decide only whether the representation preserves enough explicit structure to support that feature. Do not infer from general plausibility. Return JSON only {"features":[{"id":"...","supported":true|false,"quote":"exact representation span"|null}]}. If supported, quote must be an exact contiguous span from REPRESENTATION. If unsupported, quote must be null.`;
const cleanJson=(s:string)=>s.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
function parseDecode(s:string){
 const x=JSON.parse(cleanJson(s)) as {features?:{id:string;supported:boolean;quote:string|null}[]};
 if(!Array.isArray(x.features)) throw new Error('features-array-missing');
 return x.features;
}
const exactQuote=(rep:string,q:string|null)=>typeof q==='string'&&q.length>0&&rep.includes(q);

async function main(){
 installRemote();
 const rows:any[]=[]; const scratch:any[]=[];
 for(const e of manifest.events){
  const source=JSON.parse(fs.readFileSync(e.file,'utf8')) as {sessionId:string;turns:Turn[]};
  const before=source.turns.slice(0,e.cutoff+1);
  const beforeText=transcript(before);
  const outcomeText=transcript(e.outcomeTurns.map(i=>source.turns[i]).filter(Boolean));
  const sourceFeatureHash=sha(e.features.map(f=>f.sourceTurns.map(i=>textOf(source.turns[i]??{role:'missing'})).join('|')).join('||'));
  const target=e.features.map(f=>({id:f.id,description:f.description}));
  for(const condition of CONDITIONS){
   const rawRep=await callClaude(systems[condition],`CONVERSATION SO FAR:\n${beforeText}`);
   const rep=clip(rawRep);
   const decRaw=await callClaude(decodeSystem,`REPRESENTATION:\n${rep}\n\nFEATURES:\n${JSON.stringify(target)}`,0);
   let decoded:{id:string;supported:boolean;quote:string|null}[]=[]; let parseError:string|null=null;
   try{decoded=parseDecode(decRaw)}catch(err){parseError=err instanceof Error?err.message:String(err)}
   const features=e.features.map(f=>{
    const d=decoded.find(z=>z.id===f.id);
    const quoteValid=d?.supported?exactQuote(rep,d.quote):true;
    return {id:f.id,supported:!!d?.supported&&quoteValid,decoderSaid:!!d?.supported,quoteValid};
   });
   rows.push({
    event:e.id,eventClass:e.class,condition,sourceFileHash:fileSha(e.file),
    sessionHash:sha(source.sessionId),cutoff:e.cutoff,outcomeTurns:e.outcomeTurns,
    sourceFeatureHash,outcomeHash:sha(outcomeText),
    representationHash:sha(rep),decoderHash:sha(decRaw),
    representationWords:words(rep),rawWords:words(rawRep),budgetViolation:words(rep)>BUDGET,
    parseError,features,featureCorrect:features.filter(f=>f.supported).length,featureTotal:features.length
   });
   scratch.push({event:e.id,condition,representation:rep,decoder:decRaw});
  }
 }
 const summarize=(rs:any[])=>{
  const correct=rs.reduce((a,r)=>a+r.featureCorrect,0);
  const total=rs.reduce((a,r)=>a+r.featureTotal,0);
  const wordTotal=rs.reduce((a,r)=>a+r.representationWords,0);
  return {events:rs.length,featureCorrect:correct,featureTotal:total,recall:total?correct/total:0,
   perfectEvents:rs.filter(r=>r.featureCorrect===r.featureTotal).length,
   meanWords:rs.length?wordTotal/rs.length:0,
   featuresPer100Words:wordTotal?correct/(wordTotal/100):0};
 };
 const summary=Object.fromEntries(CONDITIONS.map(c=>[c,summarize(rows.filter(r=>r.condition===c))]));
 const whole=Object.fromEntries(CONDITIONS.map(c=>[c,summarize(rows.filter(r=>r.condition===c&&r.eventClass==='WHOLE_FIELD'))]));
 const controls=Object.fromEntries(CONDITIONS.map(c=>[c,summarize(rows.filter(r=>r.condition===c&&r.eventClass!=='WHOLE_FIELD'))]));
 const byEvent=Object.fromEntries(manifest.events.map(e=>[e.id,Object.fromEntries(CONDITIONS.map(c=>{
  const r=rows.find(x=>x.event===e.id&&x.condition===c)!;
  return [c,{featureCorrect:r.featureCorrect,featureTotal:r.featureTotal,representationWords:r.representationWords}];
 }))]));
 const wholeEvents=manifest.events.filter(e=>e.class==='WHOLE_FIELD');
 const bestOrTied=wholeEvents.filter(e=>{
  const vals=CONDITIONS.map(c=>rows.find(r=>r.event===e.id&&r.condition===c)!.featureCorrect);
  const ev=rows.find(r=>r.event===e.id&&r.condition==='E_GESTALT')!.featureCorrect;
  return ev===Math.max(...vals);
 }).length;
 const acceptance={
  gestaltBeatsPairwise:whole.E_GESTALT.featureCorrect>whole.B_PAIRWISE.featureCorrect,
  gestaltBeatsTemporal:whole.E_GESTALT.featureCorrect>whole.D_TEMPORAL.featureCorrect,
  gestaltBestOrTiedEvents:bestOrTied,requiredBestOrTiedEvents:2,
 };
 const passed=acceptance.gestaltBeatsPairwise&&acceptance.gestaltBeatsTemporal&&bestOrTied>=2;
 const out={schema:'RELATIONAL_GEOMETRY_H7D_WHOLE_FIELD_GESTALT_V1',authority:'offline ecological-validity research only',
  inference:{model:MODEL,transport:'production-container direct Anthropic SDK via temporary /tmp helper',representationTemperature:0.2,decoderTemperature:0,servingRouteUsed:false,localCliAttempt:'NO_EVIDENCE_weekly_limit'},
  model:MODEL,budgetWords:BUDGET,manifestHash:sha(JSON.stringify(manifest)),
  events:manifest.events.map(e=>({id:e.id,class:e.class,cutoff:e.cutoff,outcomeTurns:e.outcomeTurns,features:e.features.map(f=>({id:f.id,sourceTurns:f.sourceTurns}))})),
  summary,wholeField:whole,controls,byEvent,acceptance,passed,rows};
 const evidence=path.join(process.cwd(),'docs/programme/evidence/relational-geometry-integration/H7D_WHOLE_FIELD_GESTALT_2026-09-17.json');
 fs.writeFileSync(evidence,JSON.stringify(out,null,2)+'\n');
 fs.writeFileSync('/private/tmp/h7d-whole-field-scratch.json',JSON.stringify(scratch,null,2)+'\n');
 console.log(JSON.stringify({summary,wholeField:whole,controls,byEvent,acceptance,passed},null,2));
}
main().then(()=>removeRemote()).catch(e=>{removeRemote();console.error(e);process.exit(1)});
