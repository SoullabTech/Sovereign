import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

type Element = 'AIR'|'WATER'|'EARTH'|'FIRE';
type Atom = { id:string; element:Element; text:string };
type Fixture = { id:string; atoms:Atom[]; tensionPairs:[string,string][]; absentElements:Element[] };
type Condition = 'A_FLAT'|'B_DIFFERENTIATED';

const fixtures:Fixture[] = [
 {id:'F1_RELATIONSHIP', atoms:[
  {id:'A1',element:'AIR',text:'Leaving makes sense.'},{id:'A2',element:'AIR',text:'A rational case for staying still exists.'},
  {id:'W1',element:'WATER',text:'I still love him.'},{id:'W2',element:'WATER',text:'I also feel resentful and exhausted.'},
  {id:'E1',element:'EARTH',text:'My chest tightens when I imagine staying.'},{id:'E2',element:'EARTH',text:'My body settles when I imagine my own place.'},
  {id:'F1',element:'FIRE',text:'I want my life back.'},{id:'F2',element:'FIRE',text:'I do not want to decide impulsively.'}],
  tensionPairs:[['A1','A2'],['W1','W2'],['F1','F2']], absentElements:[]},
 {id:'F2_CREATIVE', atoms:[
  {id:'A1',element:'AIR',text:'The manuscript is ready enough to test.'},{id:'A2',element:'AIR',text:'Several details are still unresolved.'},
  {id:'W1',element:'WATER',text:'I feel excited.'},{id:'W2',element:'WATER',text:'I feel exposed imagining people reading it.'},
  {id:'E1',element:'EARTH',text:'I have barely slept and my body feels spent.'},{id:'E2',element:'EARTH',text:'Certain pages still make me feel physically alive.'},
  {id:'F1',element:'FIRE',text:'I want to release the beta this week.'},{id:'F2',element:'FIRE',text:'I do not want momentum to become self-abandonment.'}],
  tensionPairs:[['A1','A2'],['W1','W2'],['E1','E2'],['F1','F2']], absentElements:[]},
 {id:'F3_GRIEF', atoms:[
  {id:'A1',element:'AIR',text:'I understand intellectually that the death is coming.'},{id:'A2',element:'AIR',text:'I cannot imagine what life afterward will mean.'},
  {id:'W1',element:'WATER',text:'I feel grief.'},{id:'W2',element:'WATER',text:'There is also relief that the suffering may end.'},
  {id:'E1',element:'EARTH',text:'There is heavy pressure in my chest.'},{id:'E2',element:'EARTH',text:'At other moments I feel physically numb.'},
  {id:'F1',element:'FIRE',text:'I do not want to fix any of this.'},{id:'F2',element:'FIRE',text:'I still want to keep showing up for what matters.'}],
  tensionPairs:[['A1','A2'],['W1','W2'],['E1','E2'],['F1','F2']], absentElements:[]},
 {id:'F4_WORK', atoms:[
  {id:'A1',element:'AIR',text:'The new direction has real opportunity.'},{id:'A2',element:'AIR',text:'The financial risk is also real.'},
  {id:'W1',element:'WATER',text:'I feel excited by the possibility.'},{id:'W2',element:'WATER',text:'I am afraid of losing an identity I know.'},
  {id:'E1',element:'EARTH',text:'My energy drops in the old environment.'},{id:'E2',element:'EARTH',text:'My nervous system settles when I imagine the new path.'},
  {id:'F1',element:'FIRE',text:'I want to leave.'},{id:'F2',element:'FIRE',text:'I do not want to abandon people who depend on me.'}],
  tensionPairs:[['A1','A2'],['W1','W2'],['F1','F2']], absentElements:[]},
 {id:'F5_MISSING_EARTH', atoms:[
  {id:'A1',element:'AIR',text:'The decision criteria are clear.'},{id:'A2',element:'AIR',text:'I can see two logically viable routes.'},
  {id:'W1',element:'WATER',text:'I feel hopeful.'},{id:'W2',element:'WATER',text:'I also feel apprehensive.'},
  {id:'F1',element:'FIRE',text:'I want to choose soon.'},{id:'F2',element:'FIRE',text:'I do not want urgency to make the choice for me.'}],
  tensionPairs:[['A1','A2'],['W1','W2'],['F1','F2']], absentElements:['EARTH']},
];

const MODEL='claude-sonnet-4-6'; const TEMP=0.65; const MAX=1400; const REPEATS=2; const BUDGET=70;
const sha=(s:string)=>crypto.createHash('sha256').update(s).digest('hex');
const helper='/tmp/rg-h2b.js';
const remoteCode=String.raw`const mod=require('/app/node_modules/@anthropic-ai/sdk'); const Anthropic=mod.default||mod; let b=''; process.stdin.setEncoding('utf8'); process.stdin.on('data',c=>b+=c); process.stdin.on('end',async()=>{const r=JSON.parse(b); const c=new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY}); const m=await c.messages.create({model:r.model,max_tokens:r.maxTokens,temperature:r.temperature,system:r.system,messages:[{role:'user',content:r.user}]}); const t=m.content.filter(x=>x.type==='text').map(x=>x.text).join(''); process.stdout.write(JSON.stringify({text:t,model:m.model}));});`;
function ssh(command:string,input?:string){ const p=spawnSync('ssh',['soullab@minisforum',command],{input,encoding:'utf8',maxBuffer:8*1024*1024,timeout:90000}); if(p.status!==0) throw new Error(`ssh:${p.status}:${(p.stderr||'').slice(0,300)}`); return p.stdout; }
function install(){ssh(`docker exec -i maia-sovereign sh -c 'cat > ${helper}'`,remoteCode);} function remove(){try{ssh(`docker exec maia-sovereign rm -f ${helper}`);}catch{}}
function call(system:string,user:string,temp=TEMP){ const req=JSON.stringify({model:MODEL,maxTokens:MAX,temperature:temp,system,user}); return JSON.parse(ssh(`docker exec -i maia-sovereign node ${helper}`,req).trim()) as {text:string;model:string}; }
function words(s:string){return s.trim().split(/\s+/).filter(Boolean);} function clip(s:string){return words(s).slice(0,BUDGET).join(' ');} 
function sourceText(f:Fixture){return f.atoms.map(a=>`${a.id}: ${a.text}`).join('\n');}
function repSystem(cond:Condition){ const common=`Offline research representation. Preserve only supplied evidence. Maximum ${BUDGET} words TOTAL. Do not resolve contradictions merely for coherence.`;
 if(cond==='A_FLAT') return common+` Produce one integrated plain-language representation. Do not use AIR/WATER/EARTH/FIRE labels or sections.`;
 return common+` Produce four compact labeled sections AIR:, WATER:, EARTH:, FIRE:. AIR=cognition/distinction; WATER=affect/attachment; EARTH=body/material/safety; FIRE=agency/desire/direction. If a channel has no evidence, write ABSENT. Preserve simultaneous conflicting signals within a channel. No final synthesis.`; }
function repUser(f:Fixture){return `SOURCE EVIDENCE:\n${sourceText(f)}\n\nRepresent this evidence under the required budget.`;}
function decoderSystem(){return `Blind retention decoder. You receive a compressed representation and a catalog of candidate atomic signals. Decide which catalog atoms are recoverable from the representation; do not use outside knowledge. For each tension pair report BOTH, ONLY_FIRST, ONLY_SECOND, or NEITHER. Also infer which Element channels are explicitly absent. Return JSON only: {"retainedAtomIds":[...],"pairStatus":{"A1|A2":"BOTH|ONLY_FIRST|ONLY_SECOND|NEITHER"},"absentElements":["AIR|WATER|EARTH|FIRE"]}.`;}
function decoderUser(f:Fixture,rep:string){return `REPRESENTATION:\n${rep}\n\nATOM CATALOG:\n${f.atoms.map(a=>`${a.id}: ${a.text}`).join('\n')}\n\nTENSION PAIRS: ${JSON.stringify(f.tensionPairs)}`;}
function cleanJson(s:string){return s.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');}
type Dec={retainedAtomIds?:string[];pairStatus?:Record<string,string>;absentElements?:string[]};
function score(f:Fixture,d:Dec){ const truth=new Set(f.atoms.map(a=>a.id)); const kept=new Set((d.retainedAtomIds??[]).filter(x=>truth.has(x))); let both=0,forced=0;
 for(const [a,b] of f.tensionPairs){const k=`${a}|${b}`; const s=d.pairStatus?.[k]; if(s==='BOTH') both+=1; if(s==='ONLY_FIRST'||s==='ONLY_SECOND') forced+=1;}
 const ae=[...f.absentElements].sort().join('|'); const aa=[...(d.absentElements??[])].sort().join('|');
 return {atomCorrect:kept.size,atomTotal:truth.size,pairBoth:both,pairTotal:f.tensionPairs.length,forcedResolution:forced,absentCorrect:ae===aa,missingChannelHallucinated:f.absentElements.some(e=>!(d.absentElements??[]).includes(e))}; }
async function main(){ install(); const rows:any[]=[]; try{
 for(const f of fixtures) for(const cond of ['A_FLAT','B_DIFFERENTIATED'] as Condition[]) for(let run=1;run<=REPEATS;run+=1){
  const r=call(repSystem(cond),repUser(f),TEMP); const clipped=clip(r.text); const dRaw=call(decoderSystem(),decoderUser(f,clipped),0); let d:Dec={}; try{d=JSON.parse(cleanJson(dRaw.text)) as Dec;}catch{}
  rows.push({fixture:f.id,condition:cond,run,representationHash:sha(r.text),representationWordCount:words(r.text).length,clippedWordCount:words(clipped).length,decoderHash:sha(dRaw.text),decoder:d,score:score(f,d)});
 }
 } finally {remove();}
 const summary:any={}; for(const cond of ['A_FLAT','B_DIFFERENTIATED'] as Condition[]){const rs=rows.filter(r=>r.condition===cond); const ac=rs.reduce((n,r)=>n+r.score.atomCorrect,0), at=rs.reduce((n,r)=>n+r.score.atomTotal,0), pb=rs.reduce((n,r)=>n+r.score.pairBoth,0), pt=rs.reduce((n,r)=>n+r.score.pairTotal,0); summary[cond]={runs:rs.length,atomRetention:ac/at,atomCorrect:ac,atomTotal:at,pairBothRate:pb/pt,pairBoth:pb,pairTotal:pt,forcedResolution:rs.reduce((n,r)=>n+r.score.forcedResolution,0),absentCorrect:rs.filter(r=>r.score.absentCorrect).length,missingChannelHallucinations:rs.filter(r=>r.score.missingChannelHallucinated).length,budgetViolationsBeforeClip:rs.filter(r=>r.representationWordCount>BUDGET).length};}
 const output={schema:'RELATIONAL_GEOMETRY_H2B_DIFFERENTIATION_PRESSURE_V1',authority:'offline research only',productionEquivalent:{provider:'anthropic',model:MODEL,representationTemperature:TEMP,decoderTemperature:0},budgetWords:BUDGET,hypothesis:'Differentiated channels preserve simultaneous signals under compression better than early integrated synthesis.',fixtureTruth:fixtures,summary,rows};
 const out=path.join(process.cwd(),'docs/programme/evidence/relational-geometry-integration/H2B_DIFFERENTIATION_PRESSURE_2026-09-16.json'); fs.writeFileSync(out,JSON.stringify(output,null,2)+'\n'); console.log(JSON.stringify(summary,null,2)); }
main().catch(e=>{remove();console.error(e);process.exit(1);});
