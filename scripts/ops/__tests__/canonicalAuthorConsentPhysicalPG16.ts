/** R1K + actual canonical manuscript execution: purely synthetic PostgreSQL 16 acceptance.
 * Existing revision writer is legacy/plaintext, not certified protected R79 model/editor. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { authorizeVersion } from '@/lib/manuscript/revisionAuthorization/store';
import { executeAuthorizationOnClient } from '@/lib/manuscript/revisionAuthorization/execute';
import { recordWriterBetaConsentDecisionR1K, withLockedCurrentWriterConsentR1K } from '@/lib/writersStudio/release/serializedWriterBetaConsentR1K';
import { closePool } from '@/lib/db/postgres';

const u=process.env.DATABASE_URL||'';
if(process.env.WS_CANONICAL_TX_FICTIONAL_ONLY!=='fictional-only'||
   !/^postgresql:\/\/fict@127\.0\.0\.1:\d+\/ws_canonical$/.test(u))
 throw new Error('REFUSED_NON_FICTIONAL_CANONICAL_DB');
const MEMBER='11111111-1111-4111-8111-111111111111';
const FOREIGN='22222222-2222-4222-8222-222222222222';
const POLICY={policyVersion:'fictional-consent-canonical-v1',policySHA256:'e'.repeat(64)};
const original='The invented stone was a fictional lantern.';
const changed='The invented stone was a fictional candle.';
const next='The invented stone was a fictional flame.';
const monitor=new Pool({connectionString:u,max:3,connectionTimeoutMillis:4000});
const checks:string[]=[];
function pass(s:string){checks.push(s)}
const sleep=(ms:number)=>new Promise<void>(done=>setTimeout(done,ms));
async function sql<T=any>(query:string,values:unknown[]=[]):Promise<T[]>{
 return (await monitor.query(query,values)).rows as T[];
}
async function row<T=any>(query:string,values:unknown[]=[]):Promise<T>{
 const rows=await sql<T>(query,values);assert.equal(rows.length,1);return rows[0];
}
async function author({work,draft,section,chain,version,expected,replacement,base}:{
 work:string;draft:string;section:string;chain:string;version:string;
 expected:string;replacement:string;base:number;
}){
 await monitor.query(
  `INSERT INTO proposal_chains(id,member_id,work_id,draft_id,base_version,target_section_id,expected_text)
    VALUES($1,$2,$3,$4,$5,$6,$7)`,[chain,MEMBER,work,draft,base,section,expected]);
 await monitor.query(`INSERT INTO proposal_versions(id,chain_id,author,formulation,supersedes)
    VALUES ($1,$2,'member',$3,NULL)`,[version,chain,replacement]);
 const result=await authorizeVersion(MEMBER,chain,version);
 assert.equal(result.ok,true,'fictional member-authored version must mint one permission');
 if(!result.ok)throw Error('FICTIONAL_AUTHOR_MINT_FAILED');
 assert.equal(result.authorization.acceptedAt,null);
 return result.authorization.id;
}
async function main(){
 try{
  const n=await row<{n:number}>('SELECT count(*)::int AS n FROM members');
  assert.equal(n.n,1,'one fictional member only');
  const work=randomUUID(),draft=randomUUID(),src=randomUUID(),section=randomUUID();
  await monitor.query('INSERT INTO member_manuscripts(id,member_id,title) VALUES($1,$2,$3)',
    [work,MEMBER,'R1K purely fictional Work']);
  await monitor.query(`INSERT INTO manuscript_sections(id,manuscript_id,position,heading,body)
    VALUES($1,$2,0,$3,$4)`,[src,work,'Chapter One',original]);
  const c=await monitor.connect();
  try{
   await c.query('BEGIN');
   await c.query(`INSERT INTO manuscript_working_drafts(id,manuscript_id,member_id,content,base_source_hash,revision_count,version,section_addressable_at)
    VALUES($1,$2,$3,'','fictional-sealed-not-real',1,7,NULL)`,[draft,work,MEMBER]);
   await c.query(`INSERT INTO manuscript_draft_sections(id,draft_id,position,text,source_section_id)
    VALUES($1,$2,0,$3,$4)`,[section,draft,'Chapter One\n\n'+original,src]);
   await c.query(`UPDATE manuscript_working_drafts
    SET content=(SELECT COALESCE(string_agg(text,'' ORDER BY position),'') FROM manuscript_draft_sections WHERE draft_id=$1),
     section_addressable_at=now() WHERE id=$1`,[draft]);
   await c.query('COMMIT');
  }catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}
  pass('fictional_addressable_work_and_source_initialized');
  const permission=await author({work,draft,section,chain:randomUUID(),version:randomUUID(),expected:'fictional lantern',replacement:'fictional candle',base:7});
  pass('real_canonical_member_selected_authorization_minted');
  assert.deepEqual(await recordWriterBetaConsentDecisionR1K({verifiedMemberId:MEMBER,decision:'accept',approvedPolicy:POLICY}),{kind:'recorded',decision:'accept'});
  pass('real_writer_member_consent_accepted');

  let entered!:()=>void,release!:()=>void;
  const inside=new Promise<void>(resolve=>entered=resolve);
  const held=new Promise<void>(resolve=>release=resolve);
  const execute=withLockedCurrentWriterConsentR1K(MEMBER,POLICY,async tx=>{
   const outcome=await executeAuthorizationOnClient(tx,MEMBER,permission);
   assert.equal(outcome.outcome,'executed');
   entered();
   await held;
   return outcome;
  });
  await inside;
  let revokeFinished=false;
  const revoke=recordWriterBetaConsentDecisionR1K({verifiedMemberId:MEMBER,decision:'revoke'}).then(o=>{revokeFinished=true;return o});
  await sleep(180);
  assert.equal(revokeFinished,false,'member lock serializes concurrent withdrawal');
  const before=await row<{text:string}>('SELECT text FROM manuscript_draft_sections WHERE id=$1',[section]);
  assert.ok(before.text.endsWith(original),'uncommitted section change not externally visible');
  const beforeAuth=await row<{accepted_at:Date|null}>('SELECT accepted_at FROM manuscript_revision_authorizations WHERE id=$1',[permission]);
  assert.equal(beforeAuth.accepted_at,null,'one-use receipt unspent outside uncommitted transaction');
  pass('locked_real_canonical_edit_uncommitted_and_revoke_waits');
  release();
  const out=await execute;
  assert.equal(out.kind,'executed_inside_consent_lock');
  assert.deepEqual(await revoke,{kind:'recorded',decision:'revoke'});
  const stored=await row<{version:string;content:string}>('SELECT version,content FROM manuscript_working_drafts WHERE id=$1',[draft]);
  assert.equal(Number(stored.version),8);
  assert.ok(stored.content.endsWith(changed));
  const receipt=await row<{accepted_at:Date|null;resulting_version:number}>('SELECT accepted_at,resulting_version FROM manuscript_revision_authorizations WHERE id=$1',[permission]);
  assert.ok(receipt.accepted_at);
  assert.equal(Number(receipt.resulting_version),8);
  const recovery=await row<{after_body:string}>('SELECT after_body FROM manuscript_application_recovery WHERE authorization_id=$1',[permission]);
  assert.equal(recovery.after_body,changed);
  const latest=await row<{decision:string}>('SELECT decision FROM writers_studio_beta_consent_events WHERE member_id=$1 ORDER BY seq DESC LIMIT 1',[MEMBER]);
  assert.equal(latest.decision,'revoke');
  pass('real_section_revision_receipt_and_recovery_commit_before_withdrawal');

  let invoked=false;
  const refused=await withLockedCurrentWriterConsentR1K(MEMBER,POLICY,async tx=>{invoked=true;return executeAuthorizationOnClient(tx,MEMBER,permission)});
  assert.deepEqual(refused,{kind:'refused',reason:'current_consent_not_verified',releaseApproved:false});
  assert.equal(invoked,false);
  pass('post_revoke_author_execution_never_invoked');

  assert.deepEqual(await recordWriterBetaConsentDecisionR1K({verifiedMemberId:MEMBER,decision:'accept',approvedPolicy:POLICY}),{kind:'recorded',decision:'accept'});
  const replay=await withLockedCurrentWriterConsentR1K(MEMBER,POLICY,tx=>executeAuthorizationOnClient(tx,MEMBER,permission));
  assert.equal(replay.kind,'executed_inside_consent_lock');
  if(replay.kind==='executed_inside_consent_lock')assert.deepEqual(replay.value,{outcome:'refused',reason:'already_spent'});
  assert.equal(Number((await row<{version:string}>('SELECT version FROM manuscript_working_drafts WHERE id=$1',[draft])).version),8);
  pass('one_use_authorization_replay_refused_even_after_reaccept');

  const nextPermission=await author({work,draft,section,chain:randomUUID(),version:randomUUID(),expected:'fictional candle',replacement:'fictional flame',base:8});
  await assert.rejects(
   withLockedCurrentWriterConsentR1K(MEMBER,POLICY,async tx=>{
    // The injected failure occurs AFTER the actual canonical section update
    // and authorization receipt, but before the recovery snapshot can commit.
    const veto={query:async(sqlText:string,params:unknown[]=[])=>{
      if(sqlText.includes('INSERT INTO manuscript_application_recovery'))
        throw Error('FICTIONAL_RECOVERY_WRITE_FAILURE');
      return tx.query(sqlText,params);
    }} as typeof tx;
    return executeAuthorizationOnClient(veto,MEMBER,nextPermission);
   }),/FICTIONAL_RECOVERY_WRITE_FAILURE/);
  assert.equal(Number((await row<{version:string}>('SELECT version FROM manuscript_working_drafts WHERE id=$1',[draft])).version),8);
  assert.ok((await row<{text:string}>('SELECT text FROM manuscript_draft_sections WHERE id=$1',[section])).text.endsWith(changed));
  assert.equal((await row<{accepted_at:Date|null}>('SELECT accepted_at FROM manuscript_revision_authorizations WHERE id=$1',[nextPermission])).accepted_at,null);
  assert.equal((await sql('SELECT * FROM manuscript_application_recovery WHERE authorization_id=$1',[nextPermission])).length,0);
  pass('canonical_mutation_authorization_and_recovery_roll_back_together');

  const foreign=await withLockedCurrentWriterConsentR1K(FOREIGN,POLICY,async()=>{throw Error('FOREIGN_MEMBER_EDIT_EXECUTED')});
  assert.deepEqual(foreign,{kind:'refused',reason:'member_unavailable',releaseApproved:false});
  pass('foreign_member_refused_before_any_manuscript_read');
  console.log('CANONICAL_CONSENT_PHYSICAL_PG16_PASS='+checks.length);
  for(const s of checks)console.log('PASS '+s);
 }finally{await Promise.allSettled([monitor.end(),closePool()]);}
}
main().catch(e=>{console.error('FICTIONAL_CANONICAL_CONSENT_HOLD',e.name,String(e.message).slice(0,180));process.exitCode=2});
