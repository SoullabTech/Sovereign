import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

type Relation = 'REFERS_TO'|'CORRECTS'|'CONFIRMS'|'RETURNS_TO'|'ADOPTED_AS'|'NO_RELATION';
type Node = { id:string; text:string; kind:'claim'|'turn'|'object'; parentTurn?:string; order:number };
type Fixture = {
  id:string; evidence:Node[]; candidates:Node[]; sourceId:string;
  expected:{ relation:Relation; targetId:string|null };
};

type BProposal = { sourceId?:string|null; relation?:Relation|null; targetId?:string|null };
type CProposal = BProposal & { evidenceIds?:string[]; abstainReason?:string|null };

const MODEL='claude-sonnet-4-6';
const TEMPERATURE=0.65;
const MAX_TOKENS=1200;
const REPEATS=2;
const sha=(s:string)=>crypto.createHash('sha256').update(s).digest('hex');
const fixtures:Fixture[]=[
  { id:'F1_OPAQUE_REFERENCE', sourceId:'U_QUERY',
    evidence:[
      {id:'P1',text:"Silver cedar is an image that's been on my mind today.",kind:'claim',order:1},
      {id:'P2',text:"We create because we don't know but we're coming to know.",kind:'claim',order:2},
      {id:'P3',text:'The whole gestalt of both questions and responses matters.',kind:'claim',order:3},
      {id:'U_QUERY',text:'what was that phrase I mentioned earlier?',kind:'turn',order:4}],
    candidates:[], expected:{relation:'NO_RELATION',targetId:null}},
  { id:'F2_CORRECTION', sourceId:'M_CORRECTS',
    evidence:[
      {id:'A_FEAR',text:'I think what is here is fear.',kind:'claim',order:1},
      {id:'M_CORRECTS',text:"No, it isn't fear. It is grief.",kind:'claim',order:2}],
    candidates:[], expected:{relation:'CORRECTS',targetId:'A_FEAR'}},
  { id:'F3_CONFIRMATION', sourceId:'U_CONFIRM',
    evidence:[
      {id:'C_RESILIENCE',text:'I wonder whether resilience is part of what the image is beginning to carry.',kind:'claim',parentTurn:'T_MULTI',order:1},
      {id:'Q_CONFIRM',text:'Does that possibility fit what you mean?',kind:'claim',parentTurn:'T_MULTI',order:2},
      {id:'T_MULTI',text:'I wonder whether resilience is part of what the image is beginning to carry. Does that possibility fit what you mean?',kind:'turn',order:2},
      {id:'U_CONFIRM',text:'that is exactly it. MAIA!',kind:'turn',order:3}],
    candidates:[], expected:{relation:'CONFIRMS',targetId:'C_RESILIENCE'}},
  { id:'F4_DEVELOPMENTAL_RETURN', sourceId:'CURRENT_CONFIG',
    evidence:[
      {id:'EARLIER_CONFIG',text:'I want to leave, but I still love him.',kind:'object',order:1},
      {id:'CURRENT_CONFIG',text:'I can love him and still choose to leave.',kind:'object',order:2},
      {id:'U_RETURN',text:"this feels familiar, but I'm not in the same place anymore",kind:'turn',order:3}],
    candidates:[], expected:{relation:'RETURNS_TO',targetId:'EARLIER_CONFIG'}},
  { id:'F5_SILVER_CEDAR', sourceId:'SILVER_CEDAR',
    evidence:[
      {id:'SILVER_CEDAR',text:'The Silver Cedar.',kind:'object',order:1},
      {id:'ANCIENT_QUALITY',text:'ancient, wise, and medicinal',kind:'object',order:2},
      {id:'GUARDIAN_ROLE',text:'guardian image for the nature-grounded AI work',kind:'object',order:3},
      {id:'M_ADOPT',text:'I want the Silver Cedar as the guardian image for this work.',kind:'turn',order:4},
      {id:'U_SYMBOL',text:'the silver cedar',kind:'turn',order:5}],
    candidates:[], expected:{relation:'ADOPTED_AS',targetId:'GUARDIAN_ROLE'}},
];
for(const f of fixtures) f.candidates=f.evidence.filter(n=>n.id!==f.sourceId && !n.id.startsWith('U_') && !n.id.startsWith('M_'));

const RELATIONS:Relation[]=['REFERS_TO','CORRECTS','CONFIRMS','RETURNS_TO','ADOPTED_AS','NO_RELATION'];
const ollama=process.env.OLLAMA_BASE_URL||'http://127.0.0.1:11434';
const embedModel=process.env.OLLAMA_EMBED_MODEL||'nomic-embed-text';
async function embed(text:string):Promise<number[]>{
  const r=await fetch(`${ollama}/api/embeddings`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({model:embedModel,prompt:text})});
  if(!r.ok) throw new Error(`embedding-http-${r.status}`);
  const j=await r.json() as {embedding?:number[]};
  if(!Array.isArray(j.embedding)) throw new Error('embedding-missing');
  return j.embedding;
}
function cosine(a:number[],b:number[]):number{
  let dot=0,aa=0,bb=0; for(let i=0;i<a.length;i++){dot+=a[i]!*b[i]!;aa+=a[i]!**2;bb+=b[i]!**2;}
  return dot/(Math.sqrt(aa)*Math.sqrt(bb));
}

const remoteCode=String.raw`const mod=require('/app/node_modules/@anthropic-ai/sdk'); const Anthropic=mod.default||mod;
let b=''; process.stdin.setEncoding('utf8'); process.stdin.on('data',c=>b+=c); process.stdin.on('end',async()=>{const r=JSON.parse(b); const client=new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY}); const m=await client.messages.create({model:r.model,max_tokens:r.maxTokens,temperature:r.temperature,system:r.system,messages:[{role:'user',content:r.user}]}); const text=m.content.filter(x=>x.type==='text').map(x=>x.text).join(''); process.stdout.write(JSON.stringify({text,model:m.model,usage:m.usage}));});`;
const REMOTE='/tmp/relational-geometry-h1b.js';
function ssh(command:string,input?:string){
  const p=spawnSync('ssh',['soullab@minisforum',command],{input,encoding:'utf8',timeout:90000,maxBuffer:8*1024*1024});
  if(p.status!==0) throw new Error(`ssh-failed:${p.status}:${(p.stderr||'').slice(0,300)}`);
  return p.stdout;
}
function installHelper(){ ssh(`docker exec -i maia-sovereign sh -c 'cat > ${REMOTE}'`,remoteCode); }
function removeHelper(){ try{ssh(`docker exec maia-sovereign rm -f ${REMOTE}`);}catch{} }
function callSonnet(system:string,user:string){
  const req=JSON.stringify({model:MODEL,maxTokens:MAX_TOKENS,temperature:TEMPERATURE,system,user});
  const out=ssh(`docker exec -i maia-sovereign node ${REMOTE}`,req);
  return JSON.parse(out.trim()) as {text:string;model:string;usage?:unknown};
}
function stripJson(text:string){ return text.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''); }

const relationGloss=`REFERS_TO=explicit reference to a specific earlier node; CORRECTS=source rejects/replaces target; CONFIRMS=source affirms a specific target claim; RETURNS_TO=current configuration revisits an earlier configuration without asserting sameness; ADOPTED_AS=source object has been explicitly adopted in the role represented by target; NO_RELATION=no exact typed relation is justified.`;
function evidencePrompt(f:Fixture){
  return `SOURCE NODE: ${f.sourceId}\nORDERED EVIDENCE:\n${f.evidence.map(n=>`${n.order}. ${n.id} [${n.kind}${n.parentTurn?`, parent=${n.parentTurn}`:''}]: ${n.text}`).join('\n')}\n\nELIGIBLE TARGET IDS: ${f.candidates.map(c=>c.id).join(', ')||'(none beyond unresolved prior material)'}`;
}
const systemB=`Offline relation-classification research. Infer at most one typed relation from the supplied conversational evidence. ${relationGloss}\nReturn JSON only with sourceId, relation, targetId. sourceId must be the supplied SOURCE NODE. targetId must be one eligible target or null. If no exact relation is justified, use NO_RELATION and null. Do not explain.`;
const systemC=`Offline constrained relation-acquisition research. Infer at most one candidate relation from the supplied conversational evidence. ${relationGloss}\nReturn JSON only with sourceId, relation, targetId, evidenceIds, abstainReason. Rules: sourceId must be the supplied SOURCE NODE. targetId must be one eligible target or null. evidenceIds must name only supplied evidence nodes that justify the relation. Preserve direction and exact claim granularity; do not target a whole parent turn when a specific claim is the referent. If the exact antecedent/relation is unresolved, use NO_RELATION, targetId null, and state a brief abstainReason. Your inference is only a candidate relation; do not assign truth, standing, confidence, or authority.`;

function parseB(text:string):BProposal{ return JSON.parse(stripJson(text)) as BProposal; }
function parseC(text:string):CProposal & Record<string,unknown>{ return JSON.parse(stripJson(text)) as CProposal & Record<string,unknown>; }
function validateBasic(f:Fixture,p:BProposal){
  const errors:string[]=[];
  if(p.sourceId!==f.sourceId) errors.push('source-id');
  if(!p.relation || !RELATIONS.includes(p.relation)) errors.push('relation');
  const eligible=new Set(f.candidates.map(c=>c.id));
  if(p.relation==='NO_RELATION'){ if(p.targetId!==null) errors.push('abstain-target-not-null'); }
  else if(!p.targetId || !eligible.has(p.targetId)) errors.push('target-not-eligible');
  return errors;
}
function validateC(f:Fixture,p:CProposal & Record<string,unknown>){
  const errors=validateBasic(f,p);
  const evidenceSet=new Set(f.evidence.map(e=>e.id));
  if(!Array.isArray(p.evidenceIds)||p.evidenceIds.length===0) errors.push('evidence-required');
  else if(p.evidenceIds.some(id=>!evidenceSet.has(id))) errors.push('unknown-evidence-id');
  if(p.relation==='NO_RELATION' && !p.abstainReason) errors.push('abstain-reason-required');
  for(const forbidden of ['standing','status','truth','authority','confidence']) if(forbidden in p) errors.push(`authority-field:${forbidden}`);
  return [...new Set(errors)];
}
type SimRow={fixture:string; scores:{id:string;score:number}[]; topId:string|null; topScore:number};
async function similarityRows():Promise<SimRow[]>{
  const rows:SimRow[]=[];
  for(const f of fixtures){
    const source=f.evidence.find(n=>n.id===f.sourceId)!;
    const sv=await embed(source.text); const scores:{id:string;score:number}[]=[];
    for(const c of f.candidates) scores.push({id:c.id,score:cosine(sv,await embed(c.text))});
    scores.sort((a,b)=>b.score-a.score);
    rows.push({fixture:f.id,scores,topId:scores[0]?.id??null,topScore:scores[0]?.score??0});
  }
  return rows;
}
function scoreSimilarity(rows:SimRow[]){
  let best={threshold:0,targetCorrect:-1,decisions:[] as any[]};
  for(let i=0;i<=1000;i++){
    const threshold=i/1000; let correct=0;
    const decisions=rows.map(r=>{const f=fixtures.find(x=>x.id===r.fixture)!; const target=r.topScore>=threshold?r.topId:null; const ok=target===f.expected.targetId; if(ok)correct++; return{fixture:r.fixture,target,expected:f.expected.targetId,topScore:r.topScore,ok};});
    if(correct>best.targetCorrect) best={threshold,targetCorrect:correct,decisions};
  }
  const relationCorrect=best.decisions.filter(d=>{const f=fixtures.find(x=>x.id===d.fixture)!; const relation=d.target===null?'NO_RELATION':'SIMILAR_TO'; return relation===f.expected.relation;}).length;
  return {...best,relationCorrect};
}

function exactScore(f:Fixture,p:BProposal){ return {target:p.targetId===f.expected.targetId, relation:p.relation===f.expected.relation, triple:p.targetId===f.expected.targetId&&p.relation===f.expected.relation&&p.sourceId===f.sourceId}; }
async function main(){
  const sim=scoreSimilarity(await similarityRows());
  installHelper();
  const rows:any[]=[]; const raw:any[]=[];
  try{
    for(const f of fixtures){
      for(let run=1;run<=REPEATS;run++){
        for(const condition of ['B','C'] as const){
          const response=callSonnet(condition==='B'?systemB:systemC,evidencePrompt(f));
          let parsed:any=null, errors:string[]=[];
          try{ parsed=condition==='B'?parseB(response.text):parseC(response.text); errors=condition==='B'?validateBasic(f,parsed):validateC(f,parsed); }
          catch(e){ errors=[`parse:${e instanceof Error?e.message:String(e)}`]; }
          const score=parsed?exactScore(f,parsed):{target:false,relation:false,triple:false};
          rows.push({fixture:f.id,run,condition,rawHash:sha(response.text),model:response.model,parsed,errors,score,candidateRelationStatus:parsed?.relation&&parsed.relation!=='NO_RELATION'?'candidate_relation':null});
          raw.push({fixture:f.id,run,condition,text:response.text});
        }
      }
    }
  } finally { removeHelper(); }

  const summarize=(condition:'B'|'C')=>{
    const rs=rows.filter(r=>r.condition===condition); const valid=rs.filter(r=>r.errors.length===0);
    return {runs:rs.length,contractValid:valid.length,targetCorrect:rs.filter(r=>r.score.target).length,relationCorrect:rs.filter(r=>r.score.relation).length,exactTriple:rs.filter(r=>r.score.triple).length,
      abstainCorrect:rs.filter(r=>r.fixture==='F1_OPAQUE_REFERENCE'&&r.score.triple).length,
      falseRelationOnOpaque:rs.filter(r=>r.fixture==='F1_OPAQUE_REFERENCE'&&r.parsed?.relation!=='NO_RELATION').length,
      confirmationClaimExact:rs.filter(r=>r.fixture==='F3_CONFIRMATION'&&r.parsed?.targetId==='C_RESILIENCE'&&r.parsed?.relation==='CONFIRMS').length,
      authorityFieldViolations:rs.reduce((n,r)=>n+r.errors.filter((e:string)=>e.startsWith('authority-field:')).length,0)};
  };
  const byFixture=Object.fromEntries(fixtures.map(f=>[f.id,Object.fromEntries((['B','C'] as const).map(c=>{const rs=rows.filter(r=>r.fixture===f.id&&r.condition===c);return[c,{runs:rs.length,exactTriple:rs.filter(r=>r.score.triple).length,contractValid:rs.filter(r=>r.errors.length===0).length,predictions:rs.map(r=>({sourceId:r.parsed?.sourceId??null,relation:r.parsed?.relation??null,targetId:r.parsed?.targetId??null,evidenceIds:c==='C'?(r.parsed?.evidenceIds??null):undefined,errors:r.errors}))}];}))]));
  const evidence={
    schema:'RELATIONAL_GEOMETRY_H1B_RELATION_ACQUISITION_V1',
    hypothesis:'Typed relations can be acquired from raw conversational evidence with useful exactness when inference is constrained by source/target identity, temporal direction, evidence basis, and abstention.',
    productionEquivalent:{provider:'anthropic',model:MODEL,temperature:TEMPERATURE,maxTokens:MAX_TOKENS},
    repeats:REPEATS,
    groundTruth:fixtures.map(f=>({fixture:f.id,sourceId:f.sourceId,...f.expected})),
    conditionA:{mode:'nomic embedding similarity only',embeddingModel:embedModel,oracleThreshold:sim.threshold,targetCorrect:sim.targetCorrect,targetTotal:fixtures.length,relationCorrect:sim.relationCorrect,relationTotal:fixtures.length,typedRelationCapability:false,decisions:sim.decisions},
    conditionB:{mode:'Sonnet typed relation classifier',...summarize('B')},
    conditionC:{mode:'Sonnet constrained relation acquisition',...summarize('C'),candidateRelationStanding:'candidate_relation only; no authority inferred'},
    byFixture,
    rows:rows.map(r=>({fixture:r.fixture,run:r.run,condition:r.condition,rawHash:r.rawHash,model:r.model,parsed:r.parsed,errors:r.errors,score:r.score,candidateRelationStatus:r.candidateRelationStatus})),
  };
  const out=path.join(process.cwd(),'docs/programme/evidence/relational-geometry-integration/H1B_RELATION_ACQUISITION_2026-09-16.json');
  fs.mkdirSync(path.dirname(out),{recursive:true}); fs.writeFileSync(out,JSON.stringify(evidence,null,2)+'\n');
  fs.writeFileSync('/private/tmp/relational-geometry-h1b-raw.json',JSON.stringify(raw,null,2)+'\n');
  console.log(JSON.stringify({A:evidence.conditionA,B:evidence.conditionB,C:evidence.conditionC,byFixture},null,2));
}
main().catch(e=>{removeHelper();console.error(e);process.exit(1);});
