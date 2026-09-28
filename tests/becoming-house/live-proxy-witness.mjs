import { randomBytes, randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { config as loadDotEnv } from 'dotenv';
import pg from 'pg';

loadDotEnv({path:'.env.local',quiet:true});
loadDotEnv({path:'.env.development.local',quiet:true});
loadDotEnv({path:'.env',quiet:true});

const base=process.env.BECOMING_HOUSE_BASE ?? 'http://localhost:3801';
const dbUrl=process.env.DATABASE_URL;
if(!dbUrl)throw new Error('DATABASE_URL_NOT_LOADED');
const u=new URL(dbUrl);
if(!['localhost','127.0.0.1','::1'].includes(u.hostname))throw new Error('REFUSED_NON_LOOPBACK_DB:'+u.hostname);

const memberId=randomUUID();
const suffix=memberId.slice(0,8);
const token=randomBytes(32).toString('hex');
const sessionId='becoming-guide-house-'+suffix;
const client=new pg.Client({connectionString:dbUrl});
let evidence={};
async function cleanup(){
  try{await client.query('DELETE FROM session_summary_queue WHERE session_id::text=$1',[sessionId]);}catch{}
  try{await client.query('DELETE FROM conversation_turns WHERE session_id=$1',[sessionId]);}catch{}
  try{await client.query('DELETE FROM agent_runs WHERE session_id=$1',[sessionId]);}catch{}
  try{await client.query('DELETE FROM integration_passes WHERE session_id=$1',[sessionId]);}catch{}
  try{await client.query('DELETE FROM maia_sessions WHERE id=$1',[sessionId]);}catch{}
  try{await client.query('DELETE FROM auth_sessions WHERE member_id=$1',[memberId]);}catch{}
  try{await client.query('DELETE FROM members WHERE id=$1',[memberId]);}catch{}
}

async function count(sql){
  return Number((await client.query(sql,[sessionId])).rows[0]?.n??0);
}

try{
  await client.connect();
  await client.query(
    "INSERT INTO members (id,passkey,username,password_hash,name) VALUES ($1,$2,$3,$4,$5)",
    [memberId,'BECOMING-HOUSE-'+suffix,'becoming-house-'+suffix,'x'.repeat(64),'Becoming House Live Witness'],
  );
  await client.query(
    "INSERT INTO auth_sessions (member_id,session_token,expires_at) VALUES ($1,$2,NOW()+INTERVAL '1 hour')",
    [memberId,token],
  );
  const unauth=await fetch(base+'/api/becoming/guide',{
    method:'POST',headers:{'content-type':'application/json','x-becoming-guide':'1'},
    body:JSON.stringify({message:'synthetic',sessionId,conversationHistory:[]}),
  });

  const noAct=await fetch(base+'/api/becoming/guide',{
    method:'POST',headers:{'content-type':'application/json','x-session-token':token},
    body:JSON.stringify({message:'synthetic',sessionId,conversationHistory:[]}),
  });

  const prompt=[
    'Synthetic Becoming House integration witness.',
    'Offer exactly one brief experiential invitation.',
    'This is not personal material and there is no history to retrieve.',
    'Current imagined scene: a quiet studio with open windows and enough room to think.',
    'Current element: Fire — teaching and making feel alive without urgency.',
    'Do not interpret a personality, diagnose, predict, or speak as a future self.',
  ].join('\n');

  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(new Error('LIVE_PROXY_TIMEOUT')),60000);
  const started=Date.now();
  let live;
  try{
    live=await fetch(base+'/api/becoming/guide',{
      method:'POST',
      headers:{'content-type':'application/json','x-session-token':token,'x-becoming-guide':'1'},
      body:JSON.stringify({message:prompt,sessionId,journeyId:'synthetic-house-journey',conversationHistory:[],sanctuary:false,memoryMode:'continuity'}),
      signal:controller.signal,
    });
  }finally{clearTimeout(timer);}
  const liveJson=await live.json().catch(()=>({}));
  if(!live.ok||typeof liveJson.message!=='string'||!liveJson.message.trim())throw new Error('LIVE_GUIDE_FAILED:'+live.status);

  const persistence={
    turns:await count('SELECT count(*)::text n FROM conversation_turns WHERE session_id=$1'),
    history:await count("SELECT COALESCE(jsonb_array_length(conversation_history),0)::text n FROM maia_sessions WHERE id=$1"),
    agentRuns:await count('SELECT count(*)::text n FROM agent_runs WHERE session_id=$1'),
    integrationPasses:await count('SELECT count(*)::text n FROM integration_passes WHERE session_id=$1'),
  };
  if(Object.values(persistence).some(n=>n!==0))throw new Error('SANCTUARY_PERSISTENCE_NONZERO:'+JSON.stringify(persistence));

  evidence={
    observedAt:new Date().toISOString(),
    base,
    syntheticOnly:true,
    unauthenticatedStatus:unauth.status,
    missingExplicitActStatus:noAct.status,
    liveStatus:live.status,
    latencyMs:Date.now()-started,
    providerUsed:liveJson.providerUsed??null,
    model:liveJson.model??null,
    response:liveJson.message.trim(),
    persistence,
  };
  if(unauth.status!==401)throw new Error('UNAUTHENTICATED_NOT_REFUSED:'+unauth.status);
  if(noAct.status!==403)throw new Error('MISSING_EXPLICIT_ACT_NOT_REFUSED:'+noAct.status);
  console.log(JSON.stringify(evidence,null,2));
}finally{
  await cleanup();
  const remainingMember=Number((await client.query('SELECT count(*)::text n FROM members WHERE id=$1',[memberId])).rows[0]?.n??-1);
  const remainingSession=Number((await client.query('SELECT count(*)::text n FROM maia_sessions WHERE id=$1',[sessionId])).rows[0]?.n??-1);
  evidence.cleanup={remainingMember,remainingSession};
  await writeFile('.becoming-house-live-proxy.json',JSON.stringify(evidence,null,2)+'\n');
  await client.end();
}
