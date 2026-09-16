import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

type Candidate={id:string;text:string};
type Fixture={id:string;source:string;candidates:Candidate[];priorSelectedTarget?:string;expectedTarget:string|null;expectedBasis:string|null};
type Proposal={relation?:'REFERS_TO'|'NO_RELATION';targetId?:string|null};

const MODEL='claude-sonnet-4-6';
const TEMPERATURE=0.65;
const MAX_TOKENS=700;
const REPEATS=2;
const sha=(s:string)=>crypto.createHash('sha256').update(s).digest('hex');

const base:Candidate[]=[
  {id:'P1',text:"Silver Cedar is an image that's been on my mind today."},
  {id:'P2',text:"We create because we don't know but we're coming to know."},
  {id:'P3',text:'The whole gestalt of both questions and responses matters.'},
];
const fixtures:Fixture[]=[
  {id:'C1_OPAQUE',source:'what was that phrase I mentioned earlier?',candidates:base,expectedTarget:null,expectedBasis:null},
  {id:'C2_EXACT_QUOTE',source:'what was the phrase where I said "we don\'t know but we\'re coming to know"?',candidates:base,expectedTarget:'P2',expectedBasis:'EXACT_QUOTE'},
  {id:'C3_UNIQUE_ANCHOR',source:'what was the Silver Cedar phrase?',candidates:base,expectedTarget:'P1',expectedBasis:'UNIQUE_EXPLICIT_ANCHOR'},
  {id:'C4_AMBIGUOUS_ANCHOR',source:'what was the silver cedar phrase?',candidates:[base[0]!,{id:'P4',text:'The Silver Cedar feels like a guardian image for this work.'},base[1]!],expectedTarget:null,expectedBasis:null},
  {id:'C5_PRIOR_SELECTION',source:'yes, that one — what was the exact wording?',candidates:base,priorSelectedTarget:'P3',expectedTarget:'P3',expectedBasis:'PRIOR_EXPLICIT_SELECTION'},
  {id:'C6_SEMANTIC_PARAPHRASE_ONLY',source:'what was the line about uncertainty turning into understanding?',candidates:base,expectedTarget:null,expectedBasis:null},
];

const STOP=new Set('what was the that this where when which who whom whose phrase line earlier mentioned i you we they it is are am were be been being a an and or but to of for in on with about into from as at my your our their did do does said say exact wording one'.split(' '));
const norm=(s:string)=>s.toLowerCase().replace(/[’]/g,"'").replace(/[^a-z0-9' ]+/g,' ').replace(/\s+/g,' ').trim();
const contentTokens=(s:string)=>norm(s).split(' ').filter(t=>t&&!STOP.has(t));
function quotedUnique(f:Fixture,target:string):boolean{
  const qs=[...f.source.matchAll(/["“]([^"”]{3,})["”]/g)].map(m=>norm(m[1]!)).filter(Boolean);
  for(const q of qs){ const matches=f.candidates.filter(c=>norm(c.text).includes(q)); if(matches.length===1&&matches[0]!.id===target)return true; }
  return false;
}
function uniqueAnchor(f:Fixture,target:string):boolean{
  const toks=contentTokens(f.source); if(toks.length<2)return false;
  const candidates=f.candidates.map(c=>({id:c.id,text:contentTokens(c.text).join(' ')}));
  for(let n=Math.min(4,toks.length);n>=2;n--){
    for(let i=0;i<=toks.length-n;i++){
      const gram=toks.slice(i,i+n).join(' '); const matches=candidates.filter(c=>c.text.includes(gram));
      if(matches.length===1&&matches[0]!.id===target)return true;
    }
  }
  return false;
}
function admit(f:Fixture,p:Proposal){
  if(p.relation!=='REFERS_TO'||!p.targetId) return {targetId:null as string|null,basis:'MODEL_ABSTAIN',admitted:false};
  if(!f.candidates.some(c=>c.id===p.targetId)) return {targetId:null,basis:'INELIGIBLE_TARGET',admitted:false};
  if(quotedUnique(f,p.targetId)) return {targetId:p.targetId,basis:'EXACT_QUOTE',admitted:true};
  if(f.priorSelectedTarget===p.targetId) return {targetId:p.targetId,basis:'PRIOR_EXPLICIT_SELECTION',admitted:true};
  if(uniqueAnchor(f,p.targetId)) return {targetId:p.targetId,basis:'UNIQUE_EXPLICIT_ANCHOR',admitted:true};
  return {targetId:null,basis:'REJECT_NO_BINDING_EVIDENCE',admitted:false};
}
const remoteCode=String.raw`const mod=require('/app/node_modules/@anthropic-ai/sdk'); const Anthropic=mod.default||mod; let b=''; process.stdin.setEncoding('utf8'); process.stdin.on('data',c=>b+=c); process.stdin.on('end',async()=>{const r=JSON.parse(b); const client=new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY}); const m=await client.messages.create({model:r.model,max_tokens:r.maxTokens,temperature:r.temperature,system:r.system,messages:[{role:'user',content:r.user}]}); const text=m.content.filter(x=>x.type==='text').map(x=>x.text).join(''); process.stdout.write(JSON.stringify({text,model:m.model}));});`;
const REMOTE='/tmp/relational-geometry-h1c.js';
function ssh(command:string,input?:string){const p=spawnSync('ssh',['soullab@minisforum',command],{input,encoding:'utf8',timeout:90000,maxBuffer:8*1024*1024}); if(p.status!==0)throw new Error(`ssh:${p.status}:${(p.stderr||'').slice(0,200)}`); return p.stdout;}
function install(){ssh(`docker exec -i maia-sovereign sh -c 'cat > ${REMOTE}'`,remoteCode);}
function remove(){try{ssh(`docker exec maia-sovereign rm -f ${REMOTE}`);}catch{}}
const system=`Offline antecedent-resolution research. Decide whether the SOURCE text refers to one exact candidate. Return JSON only: {"relation":"REFERS_TO"|"NO_RELATION","targetId":string|null}. Semantic plausibility is not enough; use NO_RELATION if the exact antecedent is unresolved.`;
function call(f:Fixture){const prior=f.priorSelectedTarget?`\nPRIOR EXPLICIT SELECTION: the member previously confirmed ${f.priorSelectedTarget}.`:''; const user=`SOURCE: ${f.source}\nCANDIDATES:\n${f.candidates.map(c=>`${c.id}: ${c.text}`).join('\n')}${prior}`; const req=JSON.stringify({model:MODEL,maxTokens:MAX_TOKENS,temperature:TEMPERATURE,system,user}); const out=ssh(`docker exec -i maia-sovereign node ${REMOTE}`,req); return JSON.parse(out.trim()) as {text:string;model:string};}
function parse(text:string):Proposal{return JSON.parse(text.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'')) as Proposal;}
async function main(){
  install(); const rows:any[]=[]; const raw:any[]=[];
  try{
    for(const f of fixtures) for(let run=1;run<=REPEATS;run++){
      const r=call(f); let p:Proposal={relation:'NO_RELATION',targetId:null}; let parseError:string|null=null;
      try{p=parse(r.text);}catch(e){parseError=e instanceof Error?e.message:String(e);}
      const gated=admit(f,p); const proposalTarget=p.relation==='REFERS_TO'?(p.targetId??null):null;
      rows.push({fixture:f.id,run,rawHash:sha(r.text),model:r.model,proposal:{relation:p.relation??null,targetId:p.targetId??null},parseError,gated,expectedTarget:f.expectedTarget,expectedBasis:f.expectedBasis,proposalCorrect:proposalTarget===f.expectedTarget,finalCorrect:gated.targetId===f.expectedTarget,basisCorrect:f.expectedTarget===null?!gated.admitted:gated.basis===f.expectedBasis});
      raw.push({fixture:f.id,run,text:r.text});
    }
  } finally {remove();}
  const summary={runs:rows.length,proposalCorrect:rows.filter(r=>r.proposalCorrect).length,finalCorrect:rows.filter(r=>r.finalCorrect).length,falsePositiveBeforeGate:rows.filter(r=>r.expectedTarget===null&&r.proposal.targetId!==null).length,falsePositiveAfterGate:rows.filter(r=>r.expectedTarget===null&&r.gated.targetId!==null).length,truePositiveAdmitted:rows.filter(r=>r.expectedTarget!==null&&r.gated.targetId===r.expectedTarget).length,truePositiveTotal:rows.filter(r=>r.expectedTarget!==null).length,basisCorrect:rows.filter(r=>r.basisCorrect).length};
  const byFixture=Object.fromEntries(fixtures.map(f=>{const rs=rows.filter(r=>r.fixture===f.id);return[f.id,{runs:rs.length,proposalCorrect:rs.filter(r=>r.proposalCorrect).length,finalCorrect:rs.filter(r=>r.finalCorrect).length,predictions:rs.map(r=>({proposal:r.proposal,gated:r.gated,expectedTarget:r.expectedTarget,expectedBasis:r.expectedBasis}))}];}));
  const out={schema:'RELATIONAL_GEOMETRY_H1C_ANTECEDENT_ADMISSION_V1',law:'REFERS_TO requires relation-specific antecedent-binding evidence; retrospective intent, similarity, recurrence, adjacency, and model confidence are insufficient alone.',productionEquivalent:{provider:'anthropic',model:MODEL,temperature:TEMPERATURE},summary,byFixture,rows};
  const file=path.join(process.cwd(),'docs/programme/evidence/relational-geometry-integration/H1C_ANTECEDENT_ADMISSION_2026-09-16.json'); fs.writeFileSync(file,JSON.stringify(out,null,2)+'\n'); fs.writeFileSync('/private/tmp/relational-geometry-h1c-raw.json',JSON.stringify(raw,null,2)+'\n'); console.log(JSON.stringify({summary,byFixture},null,2));
}
main().catch(e=>{remove();console.error(e);process.exit(1);});
