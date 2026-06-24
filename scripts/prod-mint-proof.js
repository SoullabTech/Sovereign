/* eslint-disable */
// Phase 3 PR3 mint-path PROD proof. Runs INSIDE maia. Seeds marked data (face0000-*), drives
// set→accept→room-token, decodes the minted LiveKit JWT, checks the gate (pre-accept/refuse deny)
// and the rate-limit, cleans up. Uses the in-container DATABASE_URL + a real auth_sessions token.
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const BASE = 'http://localhost:3000';
const SID = 'face0000-0000-4000-8000-000000000001';
const CID = 'face0000-0000-4000-8000-000000000002';
const SESSTOK = 'mintproof-sess-face0000-0000-4000-8000-000000000003';
const LINK = 'https://zoom.us/j/MINTPROOF';
const AG = `/api/studio/sessions/${SID}/agreement`;
const HDR = { 'x-session-token': SESSTOK };

async function GET(p, h){const r=await fetch(BASE+p,{headers:h||{}});let b=null;try{b=await r.json()}catch{}return{s:r.status,b};}
async function POST(p, h, body){const r=await fetch(BASE+p,{method:'POST',headers:{'content-type':'application/json',...(h||{})},body:body?JSON.stringify(body):undefined});let b=null;try{b=await r.json()}catch{}return{s:r.status,b};}
function decodeJwt(t){try{return JSON.parse(Buffer.from(t.split('.')[1],'base64url').toString('utf8'))}catch{return null}}
const checks=[];const pass=(n,ok,d)=>checks.push(`${ok?'PASS':'FAIL'}  ${n}${d?'  '+d:''}`);

(async()=>{
  pass('health 200',(await GET('/api/health')).s===200);
  const pr=await pool.query("SELECT p.member_id AS mid FROM practitioners p JOIN members m ON m.id=p.member_id WHERE p.status='active' LIMIT 1");
  if(!pr.rows.length){console.log('NO active practitioner');console.log(checks.join('\n'));await pool.end();return;}
  const mid=pr.rows[0].mid;
  const RT=`/api/session/join/%TOK%/room-token`;
  try{
    await pool.query('DELETE FROM auth_sessions WHERE session_token=$1',[SESSTOK]);
    await pool.query("INSERT INTO auth_sessions (member_id,session_token,expires_at,revoked) VALUES ($1,$2,NOW()+INTERVAL '1 hour',false)",[mid,SESSTOK]);
    await pool.query("INSERT INTO practitioner_clients (id,practitioner_id,name,email,status) SELECT $1,p.id,'Mint Proof','mint-proof@test.invalid','active' FROM practitioners p WHERE p.member_id=$2 AND p.status='active' LIMIT 1 ON CONFLICT (id) DO NOTHING",[CID,mid]);
    await pool.query("INSERT INTO scribe_sessions (id,member_id,container,client_id) VALUES ($1,$2,'practitioner',$3) ON CONFLICT (id) DO UPDATE SET room_state='pre',agreement_mode=NULL,agreement_version=NULL,consent_client_at=NULL,video_link_reveal_allowed=false,video_link=NULL",[SID,mid,CID]);
    await pool.query('DELETE FROM session_join_tokens WHERE session_id=$1',[SID]);
    await pool.query('DELETE FROM session_consent_events WHERE session_id=$1',[SID]);

    const set=await POST(AG,HDR,{agreementMode:'reflection',videoProvider:'zoom',videoLink:LINK});
    const tok=set.b&&set.b.joinToken;
    pass('practitioner set -> token',set.s===200&&!!tok,`(status ${set.s})`);
    const rt=RT.replace('%TOK%',tok);

    const m0=await POST(rt);
    pass('pre-accept: room-token denied (403)',m0.s===403,`(status ${m0.s}, ${m0.b&&m0.b.error})`);

    await POST(`/api/session/join/${tok}/accept`);

    const m1=await POST(rt);
    const pl=m1.b&&m1.b.roomToken&&decodeJwt(m1.b.roomToken);
    pass('accept: room-token 200 + JWT',m1.s===200&&!!(m1.b&&m1.b.roomToken),`(status ${m1.s})`);
    pass('JWT grant correct (sub/room/roomJoin)',!!pl&&pl.sub===`client:${CID}`&&pl.video&&pl.video.room===SID&&pl.video.roomJoin===true,`(sub ${pl&&pl.sub})`);
    pass('reflection: screen_share allowed in grant',!!pl&&Array.isArray(pl.video.canPublishSources)&&pl.video.canPublishSources.includes('screen_share'));
    pass('no room-mgmt privileges in grant',!!pl&&!pl.video.roomAdmin&&!pl.video.roomCreate&&!pl.video.roomList);
    pass('response carries url + 900s expiry',!!(m1.b&&m1.b.url)&&m1.b.expiresInSeconds===900,`(url ${m1.b&&m1.b.url})`);

    for(let i=0;i<4;i++){await POST(rt);}        // m2..m5 (5 total this window)
    const m6=await POST(rt);
    pass('rate-limit: 6th mint -> 429',m6.s===429,`(status ${m6.s})`);

    await POST(`/api/session/join/${tok}/refuse`);
    const mr=await POST(rt);
    pass('after refuse: room-token denied (403)',mr.s===403,`(status ${mr.s})`);
  }finally{
    for(const [sql,args] of [['DELETE FROM auth_sessions WHERE session_token=$1',[SESSTOK]],['DELETE FROM scribe_sessions WHERE id=$1',[SID]],['DELETE FROM practitioner_clients WHERE id=$1',[CID]]]){try{await pool.query(sql,args)}catch(e){console.log('cleanup warn',String(e))}}
    const left=await pool.query('SELECT (SELECT count(*) FROM scribe_sessions WHERE id=$1) a,(SELECT count(*) FROM session_join_tokens WHERE session_id=$1) b,(SELECT count(*) FROM practitioner_clients WHERE id=$2) c,(SELECT count(*) FROM auth_sessions WHERE session_token=$3) d',[SID,CID,SESSTOK]);
    pass('cleanup (0 rows)',Object.values(left.rows[0]).every(n=>Number(n)===0),`(${JSON.stringify(left.rows[0])})`);
  }
  console.log(checks.join('\n'));
  await pool.end();
})().catch(e=>{console.log('FATAL',String(e));process.exit(1)});
