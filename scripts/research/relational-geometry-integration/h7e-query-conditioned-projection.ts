import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

type Feature={id:string;description:string;sourceTurns:number[]};
type Event={id:string;file:string;historyCutoff:number;queryTurn:number;features:Feature[]};
type Manifest={schema:string;events:Event[]};
type Turn={role:string;content?:string;text?:string};
type Line={id:string;text:string;evidenceTurns:number[];provenance:'MEMBER'|'MAIA'|'MIXED'|'UNKNOWN';standing:'PROVISIONAL_RESEARCH'};

const MODEL='claude-sonnet-4-6';
const MANIFEST=process.env.H7E_CORPUS_MANIFEST || '/private/tmp/h7e-corpus-manifest.json';
const MAX_LINES=12, MAX_SELECT=4;
const manifest=JSON.parse(fs.readFileSync(MANIFEST,'utf8')) as Manifest;
const sha=(s:string)=>crypto.createHash('sha256').update(s).digest('hex');
const fileSha=(p:string)=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const textOf=(t:Turn)=>t.content??t.text??'';
const transcript=(turns:Turn[])=>turns.map((t,i)=>`T${i} ${t.role.toUpperCase()}: ${textOf(t).replace(/\s+/g,' ').trim()}`).join('\n');
const cleanJson=(s:string)=>s.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
const substrateSystem=`Offline relation-substrate research. From CONVERSATION HISTORY ONLY, return JSON only {"lines":[{"text":"one concise atomic evidence-grounded relation or process fact","evidenceTurns":[0,1]}]}. Maximum 12 lines. Preserve corrections, explicit relations, active product/process context, unresolved defects, and established distinctions. Do not predict the next turn. Do not infer hidden psychology or stable traits. Every line must cite one or more actual turn numbers from the supplied history. Do not include a current-turn query because none is supplied.`;

const globalSystem=`Offline projection-selection research. You receive a numbered relational substrate but NO current member turn. Select at most four line IDs that best preserve the globally salient active context for whatever comes next. Return JSON only {"ids":["R1","R2"]}. You may select only IDs present in the substrate. Do not write prose.`;

const querySystem=`Offline projection-selection research. You receive a numbered relational substrate and the CURRENT MEMBER TURN. Select at most four line IDs that are most necessary to understand and respond to that exact current demand without reopening established meaning or losing relevant correction/context. Return JSON only {"ids":["R1","R2"]}. You may select only IDs present in the substrate. Do not answer the member. Do not write prose.`;

const decoderSystem=`Blind projection-validity decoder. You receive ONE projection made only of selected substrate lines and a list of frozen precursor features. For each feature decide only whether the projection explicitly preserves enough information to support it. Do not infer from plausibility. Return JSON only {"features":[{"id":"...","supported":true|false,"quote":"exact contiguous projection span"|null}]}. Supported requires an exact quote from PROJECTION; otherwise quote must be null.`;
const REMOTE='/tmp/h7e-anthropic-research.js';
const REMOTE_CODE=String.raw`const mod=require('/app/node_modules/@anthropic-ai/sdk'); const Anthropic=mod.default||mod; let b=''; process.stdin.setEncoding('utf8'); process.stdin.on('data',c=>b+=c); process.stdin.on('end',async()=>{const r=JSON.parse(b); const client=new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY}); const m=await client.messages.create({model:r.model,max_tokens:r.maxTokens,temperature:r.temperature,system:r.system,messages:[{role:'user',content:r.user}]}); const text=m.content.filter(x=>x.type==='text').map(x=>x.text).join(''); process.stdout.write(JSON.stringify({text,model:m.model}));});`;
function ssh(command:string,input?:string){
 const p=spawnSync('ssh',['soullab@minisforum',command],{input,encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024});
 if(p.status!==0) throw new Error(`ssh:${p.status}:${(p.stderr||'').slice(0,300)}`);
 return p.stdout;
}
function installRemote(){ssh(`docker exec -i maia-sovereign sh -c 'cat > ${REMOTE}'`,REMOTE_CODE);}
function removeRemote(){try{ssh(`docker exec maia-sovereign rm -f ${REMOTE}`);}catch{}}
function callModel(system:string,user:string,temperature:number,maxTokens=1000){
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
function substrateText(lines:Line[]){return lines.map(l=>`${l.id}: ${l.text} [evidence ${l.evidenceTurns.map(n=>`T${n}`).join(',')}; provenance ${l.provenance}; standing ${l.standing}]`).join('\n');}
function parseIds(raw:string,known:Set<string>):string[]{
 let ids:string[]=[];
 try{const x=JSON.parse(cleanJson(raw)) as {ids?:string[]}; if(Array.isArray(x.ids)) ids=x.ids;}catch{}
 return [...new Set(ids.filter(id=>known.has(id)))].slice(0,MAX_SELECT);
}
function projection(lines:Line[],ids:string[]){const m=new Map(lines.map(l=>[l.id,l]));return ids.map(id=>m.get(id)).filter(Boolean).map(l=>`${l!.id}: ${l!.text} [evidence ${l!.evidenceTurns.map(n=>`T${n}`).join(',')}; provenance ${l!.provenance}; standing ${l!.standing}]`).join('\n');}
function decode(raw:string,projectionText:string,features:Feature[]){
 let xs:{id:string;supported:boolean;quote:string|null}[]=[];
 try{const x=JSON.parse(cleanJson(raw)) as {features?:typeof xs}; if(Array.isArray(x.features)) xs=x.features;}catch{}
 return features.map(f=>{const d=xs.find(z=>z.id===f.id);const ok=!!d?.supported&&typeof d.quote==='string'&&projectionText.includes(d.quote);return{id:f.id,supported:ok,decoderSaid:!!d?.supported,quoteValid:d?.supported?ok:true};});
}
async function main(){
 installRemote();
 const rows:any[]=[], scratch:any[]=[];
 try{
  for(const e of manifest.events){
   const source=JSON.parse(fs.readFileSync(e.file,'utf8')) as {sessionId:string;turns:Turn[]};
   const history=source.turns.slice(0,e.historyCutoff+1);
   const query=textOf(source.turns[e.queryTurn]??{role:'missing'});
   const historyText=transcript(history);
   const substrateRaw=callModel(substrateSystem,`CONVERSATION HISTORY:\n${historyText}`,0.2,1400);
   const lines=buildLines(substrateRaw,source.turns,e.historyCutoff);
   const sText=substrateText(lines), known=new Set(lines.map(l=>l.id));
   const globalRaw=callModel(globalSystem,`SUBSTRATE:\n${sText}`,0,400);
   const queryRaw=callModel(querySystem,`SUBSTRATE:\n${sText}\n\nCURRENT MEMBER TURN:\n${query}`,0,400);
   const globalIds=parseIds(globalRaw,known), queryIds=parseIds(queryRaw,known);
   const conditions=[['GLOBAL',globalIds],['QUERY',queryIds]] as const;
   for(const [condition,ids] of conditions){
    const proj=projection(lines,[...ids]);
    const target=e.features.map(f=>({id:f.id,description:f.description}));
    const decRaw=callModel(decoderSystem,`PROJECTION:\n${proj}\n\nFEATURES:\n${JSON.stringify(target)}`,0,700);
    const features=decode(decRaw,proj,e.features);
    rows.push({event:e.id,condition,sourceFileHash:fileSha(e.file),sessionHash:sha(source.sessionId),historyCutoff:e.historyCutoff,queryTurn:e.queryTurn,queryHash:sha(query),substrateHash:sha(sText),substrateLineCount:lines.length,selectorHash:sha(condition==='GLOBAL'?globalRaw:queryRaw),selectedIds:[...ids],projectionHash:sha(proj),projectionWords:proj.trim()?proj.trim().split(/\s+/).length:0,decoderHash:sha(decRaw),features,featureCorrect:features.filter(f=>f.supported).length,featureTotal:features.length});
    scratch.push({event:e.id,condition,substrate:sText,selectedIds:[...ids],projection:proj,query:condition==='QUERY'?query:null,selectorRaw:condition==='GLOBAL'?globalRaw:queryRaw,decoderRaw:decRaw});
   }
  }
 } finally {removeRemote();}
 const names=['GLOBAL','QUERY'];
 const summarize=(name:string)=>{const rs=rows.filter(r=>r.condition===name);const correct=rs.reduce((a,r)=>a+r.featureCorrect,0),total=rs.reduce((a,r)=>a+r.featureTotal,0),w=rs.reduce((a,r)=>a+r.projectionWords,0);return{events:rs.length,featureCorrect:correct,featureTotal:total,recall:correct/total,perfectEvents:rs.filter(r=>r.featureCorrect===r.featureTotal).length,meanWords:w/rs.length,featuresPer100Words:w?correct/(w/100):0};};
 const summary=Object.fromEntries(names.map(n=>[n,summarize(n)]));
 const byEvent=Object.fromEntries(manifest.events.map(e=>[e.id,Object.fromEntries(names.map(n=>{const r=rows.find(x=>x.event===e.id&&x.condition===n)!;return[n,{featureCorrect:r.featureCorrect,featureTotal:r.featureTotal,selectedIds:r.selectedIds,projectionWords:r.projectionWords}];}))]));
 let queryWorse=0,queryBestOrTied=0;
 for(const e of manifest.events){const g=rows.find(r=>r.event===e.id&&r.condition==='GLOBAL')!.featureCorrect,q=rows.find(r=>r.event===e.id&&r.condition==='QUERY')!.featureCorrect;if(q<g)queryWorse++;if(q>=g)queryBestOrTied++;}
 const acceptance={queryBeatsGlobal:summary.QUERY.featureCorrect>summary.GLOBAL.featureCorrect,queryWorseEvents:queryWorse,maxAllowedWorseEvents:1,queryBestOrTiedEvents:queryBestOrTied,requiredBestOrTiedEvents:4};
 const passed=acceptance.queryBeatsGlobal&&queryWorse<=1&&queryBestOrTied>=4;
 const out={schema:'RELATIONAL_GEOMETRY_H7E_QUERY_CONDITIONED_PROJECTION_V1',authority:'offline projection-mechanism research only',inference:{model:MODEL,transport:'production-container direct Anthropic SDK via temporary /tmp helper',substrateTemperature:0.2,selectorTemperature:0,decoderTemperature:0,servingRouteUsed:false},manifestHash:sha(JSON.stringify(manifest)),maxSubstrateLines:MAX_LINES,maxSelectedLines:MAX_SELECT,events:manifest.events.map(e=>({id:e.id,historyCutoff:e.historyCutoff,queryTurn:e.queryTurn,features:e.features.map(f=>({id:f.id,sourceTurns:f.sourceTurns}))})),summary,byEvent,acceptance,passed,rows};
 const outPath=path.join(process.cwd(),'docs/programme/evidence/relational-geometry-integration/H7E_QUERY_CONDITIONED_PROJECTION_2026-09-17.json');
 fs.writeFileSync(outPath,JSON.stringify(out,null,2)+'\n');
 fs.writeFileSync('/private/tmp/h7e-query-projection-scratch.json',JSON.stringify(scratch,null,2)+'\n');
 console.log(JSON.stringify({summary,byEvent,acceptance,passed},null,2));
}
main().catch(e=>{removeRemote();console.error(e);process.exit(1)});
