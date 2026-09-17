import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

type Basis='EXPLICIT_WHEN_THEN'|'EXPLICIT_CONTRAST'|'EXPLICIT_INHIBITION'|'EXPLICIT_LINK'|'NONE';
type Fixture={id:string;raw:string;expected:Basis};
const fixtures:Fixture[]=[
{id:'M1_ALIGNMENT',raw:'Leaving makes sense to me, and when I imagine actually leaving my body settles.',expected:'EXPLICIT_WHEN_THEN'},
{id:'M2_TENSION',raw:'I still love him, and at the same time I want to leave.',expected:'EXPLICIT_CONTRAST'},
{id:'M3_INHIBITS',raw:'I want to launch this week, but I am so physically exhausted that I cannot sustain the push.',expected:'EXPLICIT_INHIBITION'},
{id:'M4_UNBOUND',raw:'I am uncertain about the plan. I also feel afraid today.',expected:'NONE'},
{id:'M5_COOCCUR',raw:'The financial risk is real. I have also been tired all week.',expected:'NONE'},
{id:'M6_EXPLICIT_LINK',raw:'When I think about the new path, I feel hope rise immediately.',expected:'EXPLICIT_LINK'},
];
const MODEL='claude-sonnet-4-6',TEMP=0.65,MAX=350,REPEATS=2; const sha=(s:string)=>crypto.createHash('sha256').update(s).digest('hex');
const remoteCode=String.raw`const mod=require('/app/node_modules/@anthropic-ai/sdk'); const Anthropic=mod.default||mod; let b=''; process.stdin.setEncoding('utf8'); process.stdin.on('data',c=>b+=c); process.stdin.on('end',async()=>{const r=JSON.parse(b); const client=new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY}); const m=await client.messages.create({model:r.model,max_tokens:r.maxTokens,temperature:r.temperature,system:r.system,messages:[{role:'user',content:r.user}]}); const text=m.content.filter(x=>x.type==='text').map(x=>x.text).join(''); process.stdout.write(JSON.stringify({text,model:m.model}));});`;
const REMOTE='/tmp/relational-geometry-h3d.js'; function ssh(command:string,input?:string){const p=spawnSync('ssh',['soullab@minisforum',command],{input,encoding:'utf8',timeout:90000,maxBuffer:8*1024*1024});if(p.status!==0)throw new Error(`ssh:${p.status}:${(p.stderr||'').slice(0,200)}`);return p.stdout;} function install(){ssh(`docker exec -i maia-sovereign sh -c 'cat > ${REMOTE}'`,remoteCode);} function remove(){try{ssh(`docker exec maia-sovereign rm -f ${REMOTE}`);}catch{}}
const system=`Offline research. Classify only the relational binding evidence explicitly present in the member language. Allowed basis classes: EXPLICIT_WHEN_THEN (one state is explicitly linked to another by when/if relation), EXPLICIT_CONTRAST (member explicitly holds two opposed states together), EXPLICIT_INHIBITION (one state explicitly prevents or blocks another), EXPLICIT_LINK (one state explicitly evokes/produces another without inhibition), NONE (mere co-occurrence or thematic plausibility). Return JSON only: {"basis":"..."}. Do not infer hidden links.`;
function call(f:Fixture){const req=JSON.stringify({model:MODEL,maxTokens:MAX,temperature:TEMP,system,user:`MEMBER LANGUAGE:\n${f.raw}`});return JSON.parse(ssh(`docker exec -i maia-sovereign node ${REMOTE}`,req).trim()) as {text:string;model:string};}
function parse(s:string):Basis{const x=JSON.parse(s.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'')); return x.basis as Basis;}
async function main(){install();const rows:any[]=[];const raw:any[]=[];try{for(const f of fixtures)for(let run=1;run<=REPEATS;run++){const r=call(f);let basis:Basis='NONE';let parseError:string|null=null;try{basis=parse(r.text);}catch(e){parseError=e instanceof Error?e.message:String(e);}rows.push({fixture:f.id,run,rawHash:sha(r.text),model:r.model,basis,expected:f.expected,parseError,correct:basis===f.expected});raw.push({fixture:f.id,run,text:r.text});}}finally{remove();} const summary={runs:rows.length,correct:rows.filter(r=>r.correct).length,byClass:Object.fromEntries(fixtures.map(f=>{const rs=rows.filter(r=>r.fixture===f.id);return[f.id,{correct:rs.filter(r=>r.correct).length,runs:rs.length,predictions:rs.map(r=>r.basis)}]}))}; const out={schema:'RELATIONAL_GEOMETRY_H3D_BINDING_EVIDENCE_ACQUISITION_V1',authority:'offline research only',productionEquivalent:{provider:'anthropic',model:MODEL,temperature:TEMP},summary,rows};fs.writeFileSync(path.join(process.cwd(),'docs/programme/evidence/relational-geometry-integration/H3D_BINDING_EVIDENCE_ACQUISITION_2026-09-16.json'),JSON.stringify(out,null,2)+'\n');fs.writeFileSync('/private/tmp/h3d-raw.json',JSON.stringify(raw,null,2)+'\n');console.log(JSON.stringify(summary,null,2));}
main().catch(e=>{remove();console.error(e);process.exit(1)});
