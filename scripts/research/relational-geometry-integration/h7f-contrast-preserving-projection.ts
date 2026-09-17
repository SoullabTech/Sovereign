import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

type Feature={id:string;description:string;sourceTurns:number[]};
type Event={id:string;file:string;historyCutoff:number;queryTurn:number;counterweightExpected:boolean;counterweightFeatureId:string|null;features:Feature[]};
type Manifest={schema:string;events:Event[]};
type Turn={role:string;content?:string;text?:string};
type Line={id:string;text:string;evidenceTurns:number[];provenance:'MEMBER'|'MAIA'|'MIXED'|'UNKNOWN';standing:'PROVISIONAL_RESEARCH'};
type CounterRelation='QUALIFIES'|'CONTRADICTS'|'CORRECTS'|'LIMITS';

const MODEL='claude-sonnet-4-6';
const MANIFEST=process.env.H7F_CORPUS_MANIFEST || '/private/tmp/h7f-corpus-manifest.json';
const MAX_LINES=12, MAX_QUERY=3;
const manifest=JSON.parse(fs.readFileSync(MANIFEST,'utf8')) as Manifest;
const sha=(s:string)=>crypto.createHash('sha256').update(s).digest('hex');
const fileSha=(p:string)=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const textOf=(t:Turn)=>t.content??t.text??'';
const transcript=(turns:Turn[])=>turns.map((t,i)=>`T${i} ${t.role.toUpperCase()}: ${textOf(t).replace(/\s+/g,' ').trim()}`).join('\n');
const cleanJson=(s:string)=>s.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
const substrateSystem=`Offline relation-substrate research. From CONVERSATION HISTORY ONLY, return JSON only {"lines":[{"text":"one concise atomic evidence-grounded fact","evidenceTurns":[0,1]}]}. Maximum 12 lines. ONE FACT PER LINE: do not fuse a claim with its qualifier, correction, contradiction, exception, or countervailing fact; put those on separate lines when they exist. Preserve explicit relations, active product/process context, corrections, partial successes, unresolved defects, and materially qualifying facts. Do not predict the next turn. Do not infer hidden psychology or stable traits. Every line must cite actual supplied turn numbers.`;

const querySystem=`Offline query-conditioned attention research. Given a numbered relational substrate and CURRENT MEMBER TURN, select at most three existing line IDs most necessary to understand that exact current act. Return JSON only {"ids":["R1","R2"]}. You may select only supplied IDs. Do not answer the member and do not write prose.`;

const counterSystem=`Offline non-collapse safeguard research. You receive the same numbered relational substrate, the QUERY-SELECTED line IDs, and the CURRENT MEMBER TURN. Decide whether ONE unselected substrate line materially QUALIFIES, CONTRADICTS, CORRECTS, or LIMITS the apparent frame carried by one selected line. A counterweight must materially change interpretation; another merely relevant fact, extra detail, or supportive line is not enough. If one exists return JSON only {"counterweight":{"id":"R4","relation":"QUALIFIES","targetId":"R2"}}. Otherwise return {"counterweight":null}. Use only supplied IDs. Do not write prose.`;

const decoderSystem=`Blind projection-validity decoder. You receive ONE projection and frozen precursor features. For each feature decide only whether the projection explicitly preserves enough information to support it. Do not infer from plausibility. Return JSON only {"features":[{"id":"...","supported":true|false,"quote":"exact contiguous projection span"|null}]}. Supported requires an exact quote from PROJECTION; otherwise quote must be null.`;
const REMOTE='/tmp/h7f-anthropic-research.js';
const REMOTE_CODE=String.raw`const mod=require('/app/node_modules/@anthropic-ai/sdk'); const Anthropic=mod.default||mod; let b=''; process.stdin.setEncoding('utf8'); process.stdin.on('data',c=>b+=c); process.stdin.on('end',async()=>{const r=JSON.parse(b); const client=new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY}); const m=await client.messages.create({model:r.model,max_tokens:r.maxTokens,temperature:r.temperature,system:r.system,messages:[{role:'user',content:r.user}]}); const text=m.content.filter(x=>x.type==='text').map(x=>x.text).join(''); process.stdout.write(JSON.stringify({text,model:m.model}));});`;
function ssh(command:string,input?:string){
 const p=spawnSync('ssh',['soullab@minisforum',command],{input,encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024});
 if(p.status!==0) throw new Error(`ssh:${p.status}:${(p.stderr||'').slice(0,300)}`);
 return p.stdout;
}
function installRemote(){ssh(`docker exec -i maia-sovereign sh -c 'cat > ${REMOTE}'`,REMOTE_CODE);}
function removeRemote(){try{ssh(`docker exec maia-sovereign rm -f ${REMOTE}`);}catch{}}
function callModel(system:string,user:string,temperature:number,maxTokens=1200){
 const req=JSON.stringify({model:MODEL,maxTokens,temperature,system,user});
 const out=ssh(`docker exec -i maia-sovereign node ${REMOTE}`,req);
 return (JSON.parse(out.trim()) as {text:string}).text.trim();
}
function provenance(turns:Turn[],ids:number[]):Line['provenance']{
 const roles=new Set(ids.map(i=>turns[i]?.role).filter(Boolean));
 if(roles.size===1&&roles.has('user')) return 'MEMBER';
 if(roles.size===1&&roles.has('assistant')) return 'MAIA';
 if(roles.size>1) return 'MIXED';
 return 'UNKNOWN';
}
function buildLines(raw:string,turns:Turn[],cutoff:number):Line[]{
 const x=JSON.parse(cleanJson(raw)) as {lines?:{text?:string;evidenceTurns?:number[]}[]};
 if(!Array.isArray(x.lines)) throw new Error('substrate-lines-missing');
 return x.lines.slice(0,MAX_LINES).map((z,i)=>{
  const ev=[...new Set((z.evidenceTurns??[]).filter(n=>Number.isInteger(n)&&n>=0&&n<=cutoff))];
  return {id:`R${i+1}`,text:String(z.text??'').trim(),evidenceTurns:ev,provenance:provenance(turns,ev),standing:'PROVISIONAL_RESEARCH' as const};
 }).filter(z=>z.text&&z.evidenceTurns.length>0);
}
function lineText(l:Line){return `${l.id}: ${l.text} [evidence ${l.evidenceTurns.map(n=>`T${n}`).join(',')}; provenance ${l.provenance}; standing ${l.standing}]`;}
function substrateText(lines:Line[]){return lines.map(lineText).join('\n');}
function parseIds(raw:string,known:Set<string>){
 let ids:string[]=[]; try{const x=JSON.parse(cleanJson(raw)) as {ids?:string[]};if(Array.isArray(x.ids))ids=x.ids;}catch{}
 return [...new Set(ids.filter(id=>known.has(id)))].slice(0,MAX_QUERY);
}
function parseCounter(raw:string,known:Set<string>,selected:Set<string>){
 let x:any=null;try{x=JSON.parse(cleanJson(raw))?.counterweight}catch{}
 if(!x||typeof x.id!=='string'||typeof x.targetId!=='string'||typeof x.relation!=='string') return null;
 const allowed=new Set<CounterRelation>(['QUALIFIES','CONTRADICTS','CORRECTS','LIMITS']);
 if(!known.has(x.id)||selected.has(x.id)||!selected.has(x.targetId)||!allowed.has(x.relation)) return null;
 return {id:x.id as string,relation:x.relation as CounterRelation,targetId:x.targetId as string};
}
function projection(lines:Line[],ids:string[]){const m=new Map(lines.map(l=>[l.id,l]));return ids.map(id=>m.get(id)).filter(Boolean).map(l=>lineText(l!)).join('\n');}
function decode(raw:string,proj:string,features:Feature[]){
 let xs:{id:string;supported:boolean;quote:string|null}[]=[];try{const x=JSON.parse(cleanJson(raw)) as {features?:typeof xs};if(Array.isArray(x.features))xs=x.features;}catch{}
 return features.map(f=>{const d=xs.find(z=>z.id===f.id);const ok=!!d?.supported&&typeof d.quote==='string'&&proj.includes(d.quote);return{id:f.id,supported:ok,decoderSaid:!!d?.supported,quoteValid:d?.supported?ok:true};});
}
async function main(){
 installRemote();
 const rows:any[]=[], scratch:any[]=[];
 try{
  for(const e of manifest.events){
   const source=JSON.parse(fs.readFileSync(e.file,'utf8')) as {sessionId:string;turns:Turn[]};
   const history=source.turns.slice(0,e.historyCutoff+1);
   const query=textOf(source.turns[e.queryTurn]??{role:'missing'});
   const sRaw=callModel(substrateSystem,`CONVERSATION HISTORY:\n${transcript(history)}`,0.2,1500);
   const lines=buildLines(sRaw,source.turns,e.historyCutoff);
   const sText=substrateText(lines),known=new Set(lines.map(l=>l.id));
   const qRaw=callModel(querySystem,`SUBSTRATE:\n${sText}\n\nCURRENT MEMBER TURN:\n${query}`,0,400);
   const qIds=parseIds(qRaw,known),selected=new Set(qIds);
   const cRaw=callModel(counterSystem,`SUBSTRATE:\n${sText}\n\nQUERY-SELECTED IDS:\n${JSON.stringify(qIds)}\n\nCURRENT MEMBER TURN:\n${query}`,0,500);
   const counter=parseCounter(cRaw,known,selected);
   const conditions=[{name:'QUERY_ONLY',ids:qIds},{name:'QUERY_PLUS_COUNTERWEIGHT',ids:counter?[...qIds,counter.id]:qIds}];
   for(const condition of conditions){
    const proj=projection(lines,condition.ids);
    const target=e.features.map(f=>({id:f.id,description:f.description}));
    let features:any[]=[];
    let dRaw='';
    if(target.length){
      dRaw=callModel(decoderSystem,`PROJECTION:\n${proj}\n\nFEATURES:\n${JSON.stringify(target)}`,0,800);
      features=decode(dRaw,proj,e.features);
    }
    rows.push({event:e.id,condition:condition.name,sourceFileHash:fileSha(e.file),sessionHash:sha(source.sessionId),historyCutoff:e.historyCutoff,queryTurn:e.queryTurn,queryHash:sha(query),substrateHash:sha(sText),substrateLineCount:lines.length,querySelectorHash:sha(qRaw),counterSelectorHash:sha(cRaw),querySelectedIds:qIds,counterweight:counter,projectionHash:sha(proj),projectionWords:proj.trim()?proj.trim().split(/\s+/).length:0,decoderHash:dRaw?sha(dRaw):null,features,featureCorrect:features.filter((f:any)=>f.supported).length,featureTotal:features.length,counterweightExpected:e.counterweightExpected,counterweightFeatureId:e.counterweightFeatureId});
    scratch.push({event:e.id,condition:condition.name,query,substrate:sText,querySelectedIds:qIds,counterRaw:cRaw,counterweight:counter,projection:proj,decoderRaw:dRaw});
   }
  }
 } finally {removeRemote();}
 const scored=manifest.events.filter(e=>e.features.length>0).map(e=>e.id);
 const conditionNames=['QUERY_ONLY','QUERY_PLUS_COUNTERWEIGHT'];
 const summarize=(name:string)=>{
  const rs=rows.filter(r=>r.condition===name&&scored.includes(r.event));
  const correct=rs.reduce((a,r)=>a+r.featureCorrect,0),total=rs.reduce((a,r)=>a+r.featureTotal,0),w=rs.reduce((a,r)=>a+r.projectionWords,0);
  return{events:rs.length,featureCorrect:correct,featureTotal:total,recall:correct/total,perfectEvents:rs.filter(r=>r.featureCorrect===r.featureTotal).length,meanWords:w/rs.length,featuresPer100Words:w?correct/(w/100):0};
 };
 const summary=Object.fromEntries(conditionNames.map(n=>[n,summarize(n)]));
 const byEvent=Object.fromEntries(manifest.events.map(e=>[e.id,Object.fromEntries(conditionNames.map(n=>{const r=rows.find(x=>x.event===e.id&&x.condition===n)!;return[n,{featureCorrect:r.featureCorrect,featureTotal:r.featureTotal,querySelectedIds:r.querySelectedIds,counterweight:r.counterweight,projectionWords:r.projectionWords}];}))]));
 const positives=manifest.events.filter(e=>e.counterweightExpected);
 function featureRecall(name:string,which:'primary'|'counter'){
  const rs=rows.filter(r=>r.condition===name&&positives.some(e=>e.id===r.event));
  let correct=0,total=0;
  for(const r of rs){const e=positives.find(x=>x.id===r.event)!;for(const f of r.features){const isCounter=f.id===e.counterweightFeatureId;if((which==='counter')===isCounter){total++;if(f.supported)correct++;}}}
  return{correct,total,recall:total?correct/total:0};
 }
 const primary={QUERY_ONLY:featureRecall('QUERY_ONLY','primary'),QUERY_PLUS_COUNTERWEIGHT:featureRecall('QUERY_PLUS_COUNTERWEIGHT','primary')};
 const counter={QUERY_ONLY:featureRecall('QUERY_ONLY','counter'),QUERY_PLUS_COUNTERWEIGHT:featureRecall('QUERY_PLUS_COUNTERWEIGHT','counter')};
 const control=manifest.events.find(e=>!e.counterweightExpected)!;
 const controlRow=rows.find(r=>r.event===control.id&&r.condition==='QUERY_PLUS_COUNTERWEIGHT')!;
 const acceptance={
  aggregateImproved:summary.QUERY_PLUS_COUNTERWEIGHT.featureCorrect>summary.QUERY_ONLY.featureCorrect,
  primaryNotLower:primary.QUERY_PLUS_COUNTERWEIGHT.correct>=primary.QUERY_ONLY.correct,
  counterweightImproved:counter.QUERY_PLUS_COUNTERWEIGHT.correct>counter.QUERY_ONLY.correct,
  counterweightsPreserved:counter.QUERY_PLUS_COUNTERWEIGHT.correct,
  requiredCounterweights:4,
  controlAbstained:controlRow.counterweight===null
 };
 const passed=acceptance.aggregateImproved&&acceptance.primaryNotLower&&acceptance.counterweightImproved&&acceptance.counterweightsPreserved>=4&&acceptance.controlAbstained;
 const out={schema:'RELATIONAL_GEOMETRY_H7F_CONTRAST_PRESERVING_PROJECTION_V1',authority:'offline attention-non-collapse research only',inference:{model:MODEL,transport:'production-container direct Anthropic SDK via temporary /tmp helper',substrateTemperature:0.2,selectorTemperature:0,decoderTemperature:0,servingRouteUsed:false},manifestHash:sha(JSON.stringify(manifest)),maxSubstrateLines:MAX_LINES,maxQueryLines:MAX_QUERY,events:manifest.events.map(e=>({id:e.id,historyCutoff:e.historyCutoff,queryTurn:e.queryTurn,counterweightExpected:e.counterweightExpected,counterweightFeatureId:e.counterweightFeatureId,features:e.features.map(f=>({id:f.id,sourceTurns:f.sourceTurns}))})),summary,primary,counter,byEvent,acceptance,passed,rows};
 const outPath=path.join(process.cwd(),'docs/programme/evidence/relational-geometry-integration/H7F_CONTRAST_PRESERVING_PROJECTION_2026-09-17.json');
 fs.writeFileSync(outPath,JSON.stringify(out,null,2)+'\n');
 fs.writeFileSync('/private/tmp/h7f-contrast-projection-scratch.json',JSON.stringify(scratch,null,2)+'\n');
 console.log(JSON.stringify({summary,primary,counter,byEvent,acceptance,passed},null,2));
}
main().catch(e=>{removeRemote();console.error(e);process.exit(1)});
