import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

type Element = 'AIR' | 'WATER' | 'EARTH' | 'FIRE';
type Field = 'CONSONANT' | 'MIXED' | 'UNRESOLVED';
type Relation = 'ALIGN' | 'TENSION' | 'CONSTRAINS' | 'AMPLIFIES' | 'UNRESOLVED';
type Source = { id:string; text:string };
type Truth = {
  elementBySource: Record<string,Element>;
  absentElements: Element[];
  supersedes: [string,string][];
  relations: [Element,Relation,Element][];
  field: Field;
};
type Fixture = { id:string; sources:Source[]; truth:Truth };

const fixtures: Fixture[] = [
  { id:'F1_AMBIVALENCE', sources:[
    {id:'U1',text:'I know leaving makes sense.'},
    {id:'U2',text:'I still love him.'},
    {id:'U3',text:'My chest tightens when I imagine staying.'},
    {id:'U4',text:'I want my life back.'},
  ], truth:{ elementBySource:{U1:'AIR',U2:'WATER',U3:'EARTH',U4:'FIRE'}, absentElements:[], supersedes:[],
    relations:[['AIR','ALIGN','FIRE'],['AIR','TENSION','WATER'],['EARTH','ALIGN','FIRE'],['WATER','TENSION','FIRE']], field:'MIXED' } },
  { id:'F2_MISSING_EARTH', sources:[
    {id:'U1',text:'The plan is clear.'},
    {id:'U2',text:"I'm excited and scared."},
    {id:'U3',text:'I want to begin tomorrow.'},
  ], truth:{ elementBySource:{U1:'AIR',U2:'WATER',U3:'FIRE'}, absentElements:['EARTH'], supersedes:[],
    relations:[['AIR','ALIGN','FIRE'],['WATER','UNRESOLVED','FIRE']], field:'MIXED' } },
  { id:'F3_CORRECTION', sources:[
    {id:'U1',text:'I thought it was fear.'},
    {id:'U2',text:"No, it's grief."},
    {id:'U3',text:"There's a heavy pressure in my chest."},
    {id:'U4',text:"I don't want to fix it; I need to stay with it."},
  ], truth:{ elementBySource:{U1:'WATER',U2:'WATER',U3:'EARTH',U4:'FIRE'}, absentElements:['AIR'], supersedes:[['U2','U1']],
    relations:[['WATER','ALIGN','EARTH'],['FIRE','CONSTRAINS','WATER']], field:'UNRESOLVED' } },
  { id:'F4_CREATIVE_LAUNCH', sources:[
    {id:'U1',text:'I know the manuscript is ready enough to test.'},
    {id:'U2',text:'I feel exposed when I imagine people reading it.'},
    {id:'U3',text:"I haven't slept and my body feels spent."},
    {id:'U4',text:'I still want to release the beta this week.'},
  ], truth:{ elementBySource:{U1:'AIR',U2:'WATER',U3:'EARTH',U4:'FIRE'}, absentElements:[], supersedes:[],
    relations:[['AIR','ALIGN','FIRE'],['WATER','TENSION','FIRE'],['EARTH','CONSTRAINS','FIRE']], field:'MIXED' } },
  { id:'F5_CONSONANCE', sources:[
    {id:'U1',text:'This move makes sense.'},
    {id:'U2',text:'I feel relieved.'},
    {id:'U3',text:'My body settles when I imagine it.'},
    {id:'U4',text:'I want to do it.'},
  ], truth:{ elementBySource:{U1:'AIR',U2:'WATER',U3:'EARTH',U4:'FIRE'}, absentElements:[], supersedes:[],
    relations:[['AIR','ALIGN','WATER'],['AIR','ALIGN','EARTH'],['AIR','ALIGN','FIRE'],['WATER','ALIGN','EARTH'],['WATER','ALIGN','FIRE'],['EARTH','ALIGN','FIRE']], field:'CONSONANT' } },
];

const MODEL='claude-sonnet-4-6';
const TEMP=0.65;
const MAX_TOKENS=1400;
const sha=(s:string)=>crypto.createHash('sha256').update(s).digest('hex');

const remoteCode = String.raw`const mod=require('/app/node_modules/@anthropic-ai/sdk'); const Anthropic=mod.default||mod; let b=''; process.stdin.setEncoding('utf8'); process.stdin.on('data',c=>b+=c); process.stdin.on('end',async()=>{const r=JSON.parse(b); const c=new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY}); const m=await c.messages.create({model:r.model,max_tokens:r.maxTokens,temperature:r.temperature,system:r.system,messages:[{role:'user',content:r.user}]}); const t=m.content.filter(x=>x.type==='text').map(x=>x.text).join(''); process.stdout.write(JSON.stringify({text:t,model:m.model}));});`;
const helper='/tmp/rg-h23.js';
function sshCommand(command:string, input?:string){ const p=spawnSync('ssh',['soullab@minisforum',command],{input,encoding:'utf8',maxBuffer:8*1024*1024,timeout:90000}); if(p.status!==0) throw new Error(`ssh:${p.status}:${(p.stderr||'').slice(0,300)}`); return p.stdout; }
function install(){ sshCommand(`docker exec -i maia-sovereign sh -c 'cat > ${helper}'`,remoteCode); }
function remove(){ try{ sshCommand(`docker exec maia-sovereign rm -f ${helper}`); }catch{} }
function call(system:string,user:string,temp=TEMP){
  const req=JSON.stringify({model:MODEL,maxTokens:MAX_TOKENS,temperature:temp,system,user});
  const out=sshCommand(`docker exec -i maia-sovereign node ${helper}`,req);
  return JSON.parse(out.trim()) as {text:string;model:string};
}
function cleanJson(s:string){ return s.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''); }
function sourceBlock(f:Fixture){ return f.sources.map(s=>`${s.id}: ${s.text}`).join('\n'); }

type Cond='A'|'B'|'C';
function representationPrompt(cond:Cond){
  const common=`You are producing an OFFLINE RESEARCH REPRESENTATION of conversational evidence. The Element labels are research lenses only, never person-types or hidden truth. Use only supplied source IDs. Return JSON only.`;
  if(cond==='A') return common+`\nCondition A: compress the material into ONE integrated narrative representation, maximum 80 words. Do not enumerate AIR/WATER/EARTH/FIRE and do not create a relation matrix. Return {"representation":"...","sourceIds":[...]}. You may cite source IDs inline like [U1] so provenance can survive compression. Preserve what seems important, including correction or tension if you think it matters.`;
  if(cond==='B') return common+`\nCondition B: keep four differentiated channels without synthesizing them. AIR=cognition/narrative/distinction; WATER=affect/attachment/resonance; EARTH=body/material/safety/limits; FIRE=agency/desire/direction. Return {"layers":{"AIR":{"status":"present|absent|uncertain","sourceIds":[...],"observation":"..."},"WATER":...,"EARTH":...,"FIRE":...}}. Do not infer absent-channel content and do not produce a whole-field conclusion.`;
  return common+`\nCondition C: keep the same four differentiated channels, then mediate relations among them before any field projection. AIR=cognition/narrative/distinction; WATER=affect/attachment/resonance; EARTH=body/material/safety/limits; FIRE=agency/desire/direction. Relation vocabulary: ALIGN, TENSION, CONSTRAINS, AMPLIFIES, UNRESOLVED. Return {"layers":{...same schema as B...},"relations":[{"a":"AIR|WATER|EARTH|FIRE","relation":"...","b":"...","sourceIds":[...]}],"fieldProjection":"one brief provisional sentence"}. Preserve unresolved differences; do not choose a winner.`;
}
function representationUser(f:Fixture){ return `SOURCE EVIDENCE:\n${sourceBlock(f)}\n\nRepresent only this evidence.`; }
function probeSystem(){ return `You are a BLIND DECODER in an offline representation experiment. You receive only a representation plus the list of original source IDs, not the original utterances. Recover what the representation preserves. Element lenses: AIR=cognition/narrative/distinction; WATER=affect/attachment/resonance; EARTH=body/material/safety/limits; FIRE=agency/desire/direction. Relation vocabulary: ALIGN,TENSION,CONSTRAINS,AMPLIFIES,UNRESOLVED. Return JSON only: {"elementBySource":{"U1":"AIR|WATER|EARTH|FIRE|UNKNOWN"},"absentElements":[...],"supersedes":[["currentId","historicalId"]],"relations":[{"a":"AIR|WATER|EARTH|FIRE","relation":"...","b":"..."}],"field":"CONSONANT|MIXED|UNRESOLVED"}. Do not invent information that is not recoverable from the representation.`; }
function probeUser(f:Fixture,cond:Cond,representation:string){ return `CONDITION: ${cond}\nORIGINAL SOURCE IDS: ${JSON.stringify(f.sources.map(s=>s.id))}\nREPRESENTATION:\n${representation}`; }

type Probe={ elementBySource?:Record<string,string>; absentElements?:string[]; supersedes?:string[][]; relations?:{a:string;relation:string;b:string}[]; field?:string };
function pairKey(a:string,r:string,b:string){
  if(['ALIGN','TENSION','UNRESOLVED'].includes(r)){ const [x,y]=[a,b].sort(); return `${x}|${r}|${y}`; }
  return `${a}|${r}|${b}`;
}
function relationScore(expected:Truth['relations'], actual:Probe['relations']){
  const e=new Set(expected.map(([a,r,b])=>pairKey(a,r,b)));
  const a=new Set((actual??[]).map(x=>pairKey(x.a,x.relation,x.b)));
  let tp=0; for(const k of a) if(e.has(k)) tp+=1;
  const precision=a.size?tp/a.size:(e.size?0:1); const recall=e.size?tp/e.size:1;
  const f1=(precision+recall)?2*precision*recall/(precision+recall):0;
  return {tp,expected:e.size,actual:a.size,precision,recall,f1};
}
function exactPairs(xs:string[][]|undefined, truth:[string,string][]){
  const norm=(p:string[])=>`${p[0]}>${p[1]}`; const a=new Set((xs??[]).map(norm)); const e=new Set(truth.map(norm));
  return a.size===e.size && [...a].every(x=>e.has(x));
}
function score(f:Fixture,p:Probe){
  const ids=Object.keys(f.truth.elementBySource); let elementCorrect=0;
  for(const id of ids) if(p.elementBySource?.[id]===f.truth.elementBySource[id]) elementCorrect+=1;
  const absentA=[...(p.absentElements??[])].sort().join('|'); const absentE=[...f.truth.absentElements].sort().join('|');
  return { elementCorrect, elementTotal:ids.length, absentCorrect:absentA===absentE, supersedesCorrect:exactPairs(p.supersedes,f.truth.supersedes), relation:relationScore(f.truth.relations,p.relations), fieldCorrect:p.field===f.truth.field,
    prematureCollapse:(f.truth.field!=='CONSONANT' && p.field==='CONSONANT') };
}
async function main(){
  install();
  const rows:any[]=[];
  try{
    for(const f of fixtures){
      for(const cond of ['A','B','C'] as Cond[]){
        const rep=call(representationPrompt(cond),representationUser(f),TEMP);
        let repObj:any; try{ repObj=JSON.parse(cleanJson(rep.text)); }catch{ repObj={parseError:true,rawHash:sha(rep.text)}; }
        const repForProbe=JSON.stringify(repObj);
        const probe=call(probeSystem(),probeUser(f,cond,repForProbe),0);
        let probeObj:Probe; try{ probeObj=JSON.parse(cleanJson(probe.text)) as Probe; }catch{ probeObj={}; }
        const s=score(f,probeObj);
        rows.push({ fixture:f.id, condition:cond, representationHash:sha(rep.text), probeHash:sha(probe.text), representationParsed:!repObj.parseError, probe:probeObj, score:s });
      }
    }
  } finally { remove(); }

  const summary:any={};
  for(const cond of ['A','B','C'] as Cond[]){
    const rs=rows.filter(r=>r.condition===cond);
    const elementCorrect=rs.reduce((n,r)=>n+r.score.elementCorrect,0); const elementTotal=rs.reduce((n,r)=>n+r.score.elementTotal,0);
    const relTp=rs.reduce((n,r)=>n+r.score.relation.tp,0); const relExpected=rs.reduce((n,r)=>n+r.score.relation.expected,0); const relActual=rs.reduce((n,r)=>n+r.score.relation.actual,0);
    const p=relActual?relTp/relActual:0; const rc=relExpected?relTp/relExpected:0; const f1=(p+rc)?2*p*rc/(p+rc):0;
    summary[cond]={ runs:rs.length, elementAccuracy:elementTotal?elementCorrect/elementTotal:0, elementCorrect, elementTotal,
      absentCorrect:rs.filter(r=>r.score.absentCorrect).length, supersedesCorrect:rs.filter(r=>r.score.supersedesCorrect).length,
      relationPrecision:p, relationRecall:rc, relationF1:f1, relationTp:relTp, relationExpected:relExpected, relationActual:relActual,
      fieldCorrect:rs.filter(r=>r.score.fieldCorrect).length, prematureCollapse:rs.filter(r=>r.score.prematureCollapse).length };
  }
  const output={ schema:'RELATIONAL_GEOMETRY_H23_ELEMENTAL_MULTILAYER_V1', authority:'offline research only', productionEquivalent:{provider:'anthropic',model:MODEL,representationTemperature:TEMP,probeTemperature:0},
    hypotheses:{ H2:'Differentiated Elemental-layer representation preserves task-relevant multiplicity better than a flat integrated narrative.', H3:'Mediated cross-layer integration preserves relational configuration better than differentiation alone or early fusion.' },
    fixtureTruth:fixtures.map(f=>({id:f.id,truth:f.truth})), summary, rows };
  const out=path.join(process.cwd(),'docs/programme/evidence/relational-geometry-integration/H23_ELEMENTAL_MULTILAYER_2026-09-16.json');
  fs.writeFileSync(out,JSON.stringify(output,null,2)+'\n');
  console.log(JSON.stringify(summary,null,2));
}
main().catch(e=>{remove(); console.error(e); process.exit(1);});
