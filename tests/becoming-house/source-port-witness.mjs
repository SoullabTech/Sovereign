import { randomBytes, randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { config as loadDotEnv } from 'dotenv';
import pg from 'pg';

loadDotEnv({ path: '.env.local', quiet: true });
loadDotEnv({ path: '.env.development.local', quiet: true });
loadDotEnv({ path: '.env', quiet: true });

const base = process.env.BECOMING_HOUSE_BASE ?? 'http://localhost:3802';
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL_NOT_LOADED');
const db = new URL(dbUrl);
if (!['localhost','127.0.0.1','::1'].includes(db.hostname)) throw new Error('REFUSED_NON_LOOPBACK_DB:'+db.hostname);

const memberId=randomUUID();
const entryId=randomUUID();
const suffix=memberId.slice(0,8);
const token=randomBytes(32).toString('hex');
const client=new pg.Client({connectionString:dbUrl});
let evidence={};
async function cleanup(){
  try{await client.query('DELETE FROM member_facet_crossings WHERE member_id=$1 AND source_ref_id=$2',[memberId,entryId]);}catch{}
  try{await client.query('DELETE FROM quick_journal_entries WHERE id=$1',[entryId]);}catch{}
  try{await client.query('DELETE FROM auth_sessions WHERE member_id=$1',[memberId]);}catch{}
  try{await client.query('DELETE FROM members WHERE id=$1',[memberId]);}catch{}
}
async function countCrossings(){
  return Number((await client.query(
    'SELECT count(*)::text n FROM member_facet_crossings WHERE member_id=$1 AND source_ref_id=$2',
    [memberId,entryId],
  )).rows[0]?.n??0);
}
async function post(headers,body){
  const res=await fetch(base+'/api/becoming/source-port',{
    method:'POST',
    headers:{'content-type':'application/json',...headers},
    body:JSON.stringify(body),
  });
  return {status:res.status,json:await res.json().catch(()=>({}))};
}
try{
  await client.connect();
  await client.query(
    "INSERT INTO members (id,passkey,username,password_hash,name) VALUES ($1,$2,$3,$4,$5)",
    [memberId,'BECOMING-SOURCE-'+suffix,'becoming-source-'+suffix,'x'.repeat(64),'Becoming Source Witness'],
  );
  await client.query(
    "INSERT INTO auth_sessions (member_id,session_token,expires_at) VALUES ($1,$2,NOW()+INTERVAL '1 hour')",
    [memberId,token],
  );
  const content='Synthetic source-port witness: a quiet morning with enough room to think.';
  await client.query(
    "INSERT INTO quick_journal_entries (id,user_id,entry_type,content,source) VALUES ($1,$2,'day',$3,$4)",
    [entryId,memberId,content,'becoming-source-port-witness'],
  );
  const baseline=await countCrossings();

  const unauth=await post({'x-becoming-source-port':'1'},{facet:'journal',refId:entryId});
  const noAct=await post({'x-session-token':token},{facet:'journal',refId:entryId});
  const ok=await post({'x-session-token':token,'x-becoming-source-port':'1'},{facet:'journal',refId:entryId});
  const unsupported=await post(
    {'x-session-token':token,'x-becoming-source-port':'1'},
    {facet:'practices',refId:'practice-1'},
  );
  const missing=await post(
    {'x-session-token':token,'x-becoming-source-port':'1'},
    {facet:'journal',refId:randomUUID()},
  );
  const after=await countCrossings();

  if(unauth.status!==401)throw new Error('UNAUTH_STATUS_'+unauth.status);
  if(noAct.status!==403)throw new Error('MISSING_ACT_STATUS_'+noAct.status);
  if(ok.status!==200)throw new Error('SOURCE_STATUS_'+ok.status);
  if(unsupported.status!==400)throw new Error('UNSUPPORTED_STATUS_'+unsupported.status);
  if(missing.status!==404)throw new Error('MISSING_SOURCE_STATUS_'+missing.status);
  if(after!==baseline)throw new Error('SOURCE_PORT_PERSISTED_CROSSING');

  const source=ok.json?.source;
  if(source?.facet!=='journal')throw new Error('FACET_MISMATCH');
  if(source?.objectType!=='journal_entry')throw new Error('OBJECT_TYPE_MISMATCH');
  if(source?.objectId!==entryId)throw new Error('OBJECT_ID_MISMATCH');
  if(source?.memberSelected!==true)throw new Error('MEMBER_SELECTION_MISSING');
  if(source?.returnHref!==('/journal?entry='+encodeURIComponent(entryId)))throw new Error('RETURN_HREF_MISMATCH');
  if(source?.persistence!=='none')throw new Error('PERSISTENCE_CLAIM_MISMATCH');
  if(!String(source?.excerpt||'').includes('Synthetic source-port witness'))throw new Error('EXCERPT_MISSING');
  evidence={
    observedAt:new Date().toISOString(),
    base,
    syntheticOnly:true,
    statuses:{unauthenticated:unauth.status,missingExplicitAct:noAct.status,exactSource:ok.status,unsupportedFacet:unsupported.status,missingSource:missing.status},
    source:{facet:source.facet,objectType:source.objectType,objectId:source.objectId,memberSelected:source.memberSelected,returnHref:source.returnHref,persistence:source.persistence},
    crossings:{before:baseline,after},
  };
  console.log(JSON.stringify(evidence,null,2));
}finally{
  await cleanup();
  const residue={
    journal:Number((await client.query('SELECT count(*)::text n FROM quick_journal_entries WHERE id=$1',[entryId])).rows[0]?.n??-1),
    crossings:Number((await client.query('SELECT count(*)::text n FROM member_facet_crossings WHERE member_id=$1 AND source_ref_id=$2',[memberId,entryId])).rows[0]?.n??-1),
    auth:Number((await client.query('SELECT count(*)::text n FROM auth_sessions WHERE member_id=$1',[memberId])).rows[0]?.n??-1),
    member:Number((await client.query('SELECT count(*)::text n FROM members WHERE id=$1',[memberId])).rows[0]?.n??-1),
  };
  evidence.cleanup=residue;
  await writeFile('.becoming-house-source-port.json',JSON.stringify(evidence,null,2)+'\n');
  await client.end();
}
