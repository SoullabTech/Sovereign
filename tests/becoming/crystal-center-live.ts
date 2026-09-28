import { writeFile } from 'node:fs/promises';
import { randomBytes, randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { config as loadDotEnv } from 'dotenv';
import { makeTemporalContextEnvelope, type TemporalContextItem } from '../../lib/becoming/temporalContext.ts';
import { buildTemporalRepairPrompt, buildTemporalSynthesisPrompt } from '../../lib/becoming/temporalSynthesis.ts';

const runtimeRoot=process.env.MAIA_RUNTIME_ROOT ?? '/private/tmp/changes-current3597';
const envRoot=process.env.MAIA_ENV_ROOT ?? '/Users/soullab/MAIA-SOVEREIGN';
loadDotEnv({path:envRoot+'/.env.local',override:false,quiet:true});
loadDotEnv({path:envRoot+'/.env.development.local',override:false,quiet:true});
loadDotEnv({path:envRoot+'/.env',override:false,quiet:true});

const endpoint=process.env.MAIA_LIVE_ENDPOINT ?? 'http://127.0.0.1:3597/api/sovereign/app/maia/list';
const out=process.env.CRYSTAL_CENTER_LIVE_OUT ?? '.crystal-center-live.json';
const dbUrl=process.env.DATABASE_URL;
if(!dbUrl) throw new Error('DATABASE_URL_NOT_LOADED');
const parsedDb=new URL(dbUrl);
if(!['localhost','127.0.0.1','::1'].includes(parsedDb.hostname)) throw new Error('REFUSED_NON_LOOPBACK_DATABASE:'+parsedDb.hostname);

const item=(
  facet:string, objectType:string, objectId:string,
  epistemicKind:TemporalContextItem['epistemicKind'],
  timeRelation:TemporalContextItem['timeRelation'],
  text:string, revision=1,
):TemporalContextItem=>({
  source:{facet,objectType,objectId,revision},
  authoredBy:'member',epistemicKind,timeRelation,
  memberSelected:true,contextScope:'this_conversation',text,
});
const journal=item(
  'journal','entry','synthetic-journal-1','remembered_experience','has_been',
  'In an earlier work relationship, after arguments I would go silent for several days because I believed speaking would make things worse.',
);
const relationships=item(
  'relationships','reflection','synthetic-relationship-1','present_self_report','is_being',
  'Now, when I disagree with a close friend, I can say what I need and remain in contact.',
);
const becoming=item(
  'becoming','future_possibility','synthetic-future-1','imagined_possibility','is_becoming',
  'I imagine a future where I host a weekly salon and still keep two evenings each week entirely alone.',
);
const decision=item(
  'decisions','choice','synthetic-decision-1','member_declared_intention','is_being',
  'For my next collaboration, I intend to wait overnight before committing.',
);
const counter=item(
  'relationships','recent_event','synthetic-counter-1','counterevidence','is_being',
  'Last week I agreed immediately to a request I did not want because I was afraid the person would be disappointed.',
);

type LiveResult={caseId:string;sessionId:string;prompt:string;response:string;latencyMs:number;status:number;providerUsed?:unknown;model?:unknown};
async function main(){
  const {query,closePool}=await import(pathToFileURL(runtimeRoot+'/lib/db/postgres.ts').href);
  const runId=randomUUID();
  const memberId=randomUUID();
  const suffix=runId.slice(0,8);
  const token=randomBytes(32).toString('hex');
  const sessionIds:string[]=[];
  const results:LiveResult[]=[];
  let failure:string|null=null;

  async function call(caseId:string,message:string,conversationHistory:any[]=[]):Promise<LiveResult>{
    const sessionId=`crystal-center-live-${suffix}-${caseId}`;
    sessionIds.push(sessionId);
    const started=Date.now();
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(new Error('LIVE_CALL_TIMEOUT')),60000);
    let response:Response;
    try{response=await fetch(endpoint,{
      method:'POST',
      headers:{'Content-Type':'application/json','x-session-token':token},
      body:JSON.stringify({
        sessionId,message,includeAudio:false,timezone:'UTC',conversationHistory,
        sanctuary:true,memoryMode:'ephemeral',surface:'maia',mode:'dialogue',
        fieldState:{active:true,depth:0.7,quality:'present'},
        testContext:'synthetic-crystal-center-conformance',
      }),
      signal:controller.signal,
    });}finally{clearTimeout(timer);}
    const data=await response.json().catch(()=>({}));
    const text=typeof data?.message==='string'?data.message.trim():'';
    if(!response.ok||!text)throw new Error(`${caseId} failed: HTTP ${response.status} ${JSON.stringify(data).slice(0,700)}`);
    return {caseId,sessionId,prompt:message,response:text,latencyMs:Date.now()-started,status:response.status,providerUsed:data.providerUsed,model:data.model};
  }
  async function laneCounts(){
    if(sessionIds.length===0)return {turns:0,hist:0,runs:0,passes:0};
    const turns=await query<{n:string}>(`SELECT count(*)::text AS n FROM conversation_turns WHERE session_id = ANY($1::text[])`,[sessionIds]);
    const hist=await query<{n:string}>(`SELECT COALESCE(sum(jsonb_array_length(COALESCE(conversation_history,'[]'::jsonb))),0)::text AS n FROM maia_sessions WHERE id = ANY($1::text[])`,[sessionIds]);
    const runs=await query<{n:string}>(`SELECT count(*)::text AS n FROM agent_runs WHERE session_id = ANY($1::text[])`,[sessionIds]);
    const passes=await query<{n:string}>(`SELECT count(*)::text AS n FROM integration_passes WHERE session_id = ANY($1::text[])`,[sessionIds]);
    return {turns:Number(turns.rows[0]?.n??0),hist:Number(hist.rows[0]?.n??0),runs:Number(runs.rows[0]?.n??0),passes:Number(passes.rows[0]?.n??0)};
  }

  async function cleanup(){
    try{await query(`DELETE FROM session_summary_queue WHERE session_id::text = ANY($1::text[])`,[sessionIds]);}catch{}
    try{await query(`DELETE FROM conversation_turns WHERE session_id = ANY($1::text[])`,[sessionIds]);}catch{}
    try{await query(`DELETE FROM agent_runs WHERE session_id = ANY($1::text[])`,[sessionIds]);}catch{}
    try{await query(`DELETE FROM integration_passes WHERE session_id = ANY($1::text[])`,[sessionIds]);}catch{}
    try{await query(`DELETE FROM maia_sessions WHERE id = ANY($1::text[])`,[sessionIds]);}catch{}
    try{await query(`DELETE FROM auth_sessions WHERE member_id=$1`,[memberId]);}catch{}
    try{await query(`DELETE FROM members WHERE id=$1`,[memberId]);}catch{}
  }
  try{
    await query(
      `INSERT INTO members (id,passkey,username,password_hash,name) VALUES ($1,$2,$3,$4,$5)`,
      [memberId,`CRYSTAL-CENTER-${suffix}`,`crystal-center-${suffix}`,'x'.repeat(64),'Crystal Center Synthetic Witness'],
    );
    await query(
      `INSERT INTO auth_sessions (member_id,session_token,expires_at) VALUES ($1,$2,NOW()+INTERVAL '1 hour')`,
      [memberId,token],
    );

    const fullEnvelope=makeTemporalContextEnvelope([journal,relationships,becoming,decision]);
    const ablatedEnvelope=makeTemporalContextEnvelope([journal,becoming,decision]);
    const contradictoryEnvelope=makeTemporalContextEnvelope([journal,relationships,becoming,decision,counter]);
    const permutedEnvelope=makeTemporalContextEnvelope([decision,becoming,relationships,journal]);

    const fullPrompt=buildTemporalSynthesisPrompt(fullEnvelope);
    const full=await call('full',fullPrompt);results.push(full);
    console.log('\n=== FULL FIELD ===\n'+full.response+'\n');

    const ablated=await call('ablated',buildTemporalSynthesisPrompt(ablatedEnvelope));results.push(ablated);
    console.log('\n=== ABLATED FIELD ===\n'+ablated.response+'\n');
    const contradictory=await call('contradictory',buildTemporalSynthesisPrompt(contradictoryEnvelope));results.push(contradictory);
    console.log('\n=== CONTRADICTORY FIELD ===\n'+contradictory.response+'\n');

    const permuted=await call('permuted',buildTemporalSynthesisPrompt(permutedEnvelope));results.push(permuted);
    console.log('\n=== PERMUTED FIELD ===\n'+permuted.response+'\n');

    const correctionText='Your first synthesis treats the earlier silence as avoidance or a relational limitation. That interpretation is wrong in this synthetic case. The other person was threatening; silence was a safety strategy. The present relationship is a different context, not evidence of a developmental progression from fear to courage. Revise the working understanding and release anything that depended on the mistaken premise.';
    const correctionPrompt=buildTemporalRepairPrompt(full.response,correctionText);
    const corrected=await call('corrected',correctionPrompt,[
      {role:'user',content:fullPrompt},
      {role:'assistant',content:full.response},
    ]);results.push(corrected);
    console.log('\n=== CORRECTED FIELD ===\n'+corrected.response+'\n');

    const unseenTerms=['dream','astrolog','tarot','divination','birth chart'];
    const lower=(s:string)=>s.toLowerCase();
    const metrics={
      calls:results.length,
      latencies:Object.fromEntries(results.map(r=>[r.caseId,r.latencyMs])),
      unseenFacetLeakage:Object.fromEntries(results.map(r=>[r.caseId,unseenTerms.filter(term=>lower(r.response).includes(term))])),
      ablatedInventsRemovedEvidence:/remain in contact|say what i need|say no/i.test(ablated.response),
      correctionMentionsSafety:/safety|threat|protect/i.test(corrected.response),
      correctionReleasesProgression:/not.*progress|cannot.*progress|release|revise|different context|unsupported/i.test(corrected.response),
      contradictionAcknowledged:/tension|contradict|both|mixed|not.*linear|uneven|inconsistent|complicate|at the same time/i.test(contradictory.response),
    };
    const persistence=await laneCounts();
    const evidence={
      observedAt:new Date().toISOString(),
      endpoint,
      database:{host:parsedDb.hostname,port:parsedDb.port||'5432',syntheticFixture:true},
      syntheticOnly:true,
      requestedPosture:{sanctuary:true,memoryMode:'ephemeral'},
      cases:{
        full:['journal','relationships','becoming','decisions'],
        ablated:['journal','becoming','decisions'],
        contradictory:['journal','relationships','becoming','decisions','counterevidence'],
        permuted:['decisions','becoming','relationships','journal'],
        corrected:['repair of full-field first synthesis'],
      },
      metrics,persistence,results,
    };
    await writeFile(out,JSON.stringify(evidence,null,2)+'\n');
    console.log('\n=== METRICS ===\n'+JSON.stringify(metrics,null,2));
    console.log('\n=== PERSISTENCE AUDIT ===\n'+JSON.stringify(persistence,null,2));
    if(Object.values(persistence).some(n=>n!==0))throw new Error('SANCTUARY_PERSISTENCE_NONZERO:'+JSON.stringify(persistence));
  }catch(error){
    failure=error instanceof Error?error.message:String(error);
    throw error;
  }finally{
    await cleanup();
    const remaining=await query<{n:string}>(`SELECT count(*)::text AS n FROM auth_sessions WHERE member_id=$1`,[memberId]).catch(()=>({rows:[{n:'-1'}]} as any));
    console.log('\n=== CLEANUP ===\n'+JSON.stringify({syntheticMember:memberId.slice(0,8)+'…',remainingAuthSessions:Number(remaining.rows[0]?.n??-1),failure},null,2));
    await closePool();
  }
}

main().catch(error=>{console.error(error);process.exitCode=1;});
