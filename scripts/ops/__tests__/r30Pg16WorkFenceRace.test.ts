/**
 * R30 fictional PostgreSQL-16 transaction lock ordering using real PG clients.
 * Composes R29's signed-session-consent acceptance with a real PostgreSQL
 * same-Work row lock. This does NOT prove external nonrollbackable governance.
 * No production database or actual user is ever contacted.
 */
import { Pool, type PoolClient } from 'pg';
import {createHash,generateKeyPairSync,randomBytes,sign} from 'node:crypto';
import {WorkRecoveryRefusal} from '@/lib/writersStudio/recovery/workEnvelopeV1';
import {
 canonicalDeletionPayload,type DeletionHighwaterV1,
} from '@/lib/writersStudio/recovery/deletionBarrierV1';
import {
 canonicalKeyLeaseR26,canonicalFreshnessR26,
 type R26VerifiedInput,type R26Lease,type R26Freshness,
} from '@/lib/writersStudio/recovery/externalCustodyContractR26';
import {
 canonicalR29BoundLease,rehearseSessionBoundWriteR29,
 R29_REAL_WRITER_AUTHORIZATION_ENABLED,R29_PROTOCOL,
 type R29SignedBound,type R29BoundAttestation,
 type R29CurrentAdmission,type R29FictionalWorkFence,
} from '@/lib/writersStudio/recovery/sessionBoundCustodyR29';

const enabled=process.env.R30_ACTUAL_PG_FENCE==='fictional-only' &&
 process.env.R29_SESSION_FENCE_FIXTURE==='fictional-only' &&
 typeof process.env.DATABASE_URL==='string' &&
 process.env.DATABASE_URL.includes('127.0.0.1');
const run=enabled?describe:describe.skip;
const NOW=1792164000000;
const MEMBER='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const WORK='4c0782ca-9074-43ee-9f3c-5f8500026780';
const MEMBER_B='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
const WORK_B='4c0782ca-9074-43ee-9f3c-5f8500026781';
const KEY='9f8746d1-76c3-4217-8d2c-115056189df7';
const SESSION_SHA='a'.repeat(64);
const NOTICE_SHA='b'.repeat(64);
const SHA=(data:Buffer)=>createHash('sha256').update(data).digest('hex');
const pool=enabled?new Pool({connectionString:process.env.DATABASE_URL,
 max:8,connectionTimeoutMillis:1500,idleTimeoutMillis:500}):null;
type GateRow={
 member_id:string;work_id:string;session_sha256:string;
 notice_sha256:string;consent_seq:number;active:boolean;deletion_epoch:number;
};
function pg():Pool{if(!pool)throw Error('r30_not_in_exact_fictional_fixture');return pool;}
function deferred<T>(){
 let resolve!:(value:T)=>void,reject!:(e:Error)=>void;
 const promise=new Promise<T>((yes,no)=>{resolve=yes;reject=no;});
 return {promise,resolve,reject};
}
async function reset(){
 await pg().query('DELETE FROM r30_fixture_commits');
 await pg().query(`UPDATE r30_fixture_works SET
  active=true,consent_seq=7,deletion_epoch=10,
  session_sha256=$1,notice_sha256=$2
  WHERE work_id IN ($3,$4)`,[SESSION_SHA,NOTICE_SHA,WORK,WORK_B]);
}
async function current(client?:PoolClient,workId=WORK):Promise<R29CurrentAdmission|null>{
 const q=`SELECT member_id,session_sha256,notice_sha256,consent_seq,active
 FROM r30_fixture_works WHERE work_id=$1`;
 const r=client?await client.query<GateRow>(q,[workId]):
   await pg().query<GateRow>(q,[workId]);
 const row=r.rows[0];if(!row)return null;
 return {memberId:row.member_id,sessionBindingSHA256:row.session_sha256,
  consentNoticeSHA256:row.notice_sha256,consentEventSequence:row.consent_seq,
  activeWriter:row.active};
}
function proof(initial:R29CurrentAdmission){
 const signer=generateKeyPairSync('ed25519');
 const deletion=generateKeyPairSync('ed25519');
 const freshness=generateKeyPairSync('ed25519');
 const keyBytes=randomBytes(32);
 const challenge=randomBytes(32).toString('hex');
 const scope={
  memberId:initial.memberId,workId:WORK,keyId:KEY,generation:1,
  purpose:'append' as const,
 };
 const checkpoint:DeletionHighwaterV1={
  protocol:'soullab.ws.deletion-highwater.v1',stream:'writers-studio-beta',
  generation:10,revokedWorks:[],revokedKeyIds:[],
 };
 const checkpointBytes=canonicalDeletionPayload(checkpoint);
 const checkpointSha256=SHA(checkpointBytes);
 const lease:R26Lease={
  ...scope,protocol:'soullab.ws.external-work-key-lease.r26',
  challenge,issuedAtMs:NOW-1000,expiresAtMs:NOW+20000,
  keySha256:SHA(keyBytes),checkpointSha256,
 };
 const fresh:R26Freshness={
  protocol:'soullab.ws.independent-highwater-witness.r26',
  memberId:initial.memberId,workId:WORK,keyId:KEY,challenge,
  minimumGeneration:10,checkpointSha256,
  issuedAtMs:NOW-1000,expiresAtMs:NOW+20000,
 };
 const r26:R26VerifiedInput={
  scope,serverChallenge:challenge,key:{keyId:KEY,keyBytes},
  roots:{keyCustodian:signer.publicKey,deletionAuthority:deletion.publicKey,
   independentFreshness:freshness.publicKey},
  lease:{statement:lease,signature:sign(null,canonicalKeyLeaseR26(lease),
   signer.privateKey).toString('base64')},
  freshness:{statement:fresh,signature:sign(null,canonicalFreshnessR26(fresh),
   freshness.privateKey).toString('base64')},
  deletion:{checkpoint,signature:sign(null,checkpointBytes,
   deletion.privateKey).toString('base64')},
  nowMs:NOW,
 };
 const attestation:R29BoundAttestation={
  protocol:R29_PROTOCOL,leaseDigestSHA256:SHA(canonicalKeyLeaseR26(lease)),
  ...scope,challenge,sessionBindingSHA256:initial.sessionBindingSHA256,
  consentNoticeSHA256:initial.consentNoticeSHA256,
  consentEventSequence:initial.consentEventSequence,
  issuedAtMs:NOW-1000,expiresAtMs:NOW+10000,
 };
 const signed:R29SignedBound={attestation,signature:
  sign(null,canonicalR29BoundLease(attestation),signer.privateKey)
   .toString('base64')};
 return {r26,signed};
}
async function revoke(workId=WORK):Promise<void>{
 const client=await pg().connect();
 try{
  await client.query('BEGIN');
  const got=await client.query<GateRow>(`SELECT * FROM r30_fixture_works
    WHERE work_id=$1 FOR UPDATE`,[workId]);
  if(got.rows.length!==1)throw Error('r30_work_missing');
  await client.query(`UPDATE r30_fixture_works SET active=false,
    consent_seq=consent_seq+1,deletion_epoch=deletion_epoch+1
    WHERE work_id=$1`,[workId]);
  await client.query('COMMIT');
 }catch(e){await client.query('ROLLBACK').catch(()=>undefined);throw e;}
 finally{client.release();}
}
type RigOptions={
  issueHook?:()=>Promise<void>;
  afterLock?:()=>Promise<void>;
  commitHook?:()=>Promise<void>;
};
async function author(opts:RigOptions={}){
 const initial=await current();
 if(!initial)throw Error('r30_missing_admission');
 const signed=proof(initial);
 let transactionClient:PoolClient|null=null;
 const fence:R29FictionalWorkFence={
  authority:'fictional_work_revocation_lock_only',
  runHeld:async(scope,callback)=>{
   const client=await pg().connect();
   try{
    await client.query('BEGIN');
    const rows=await client.query<GateRow>(
      `SELECT * FROM r30_fixture_works WHERE work_id=$1 AND member_id=$2 FOR UPDATE`,
      [scope.workId,scope.memberId]);
    const row=rows.rows[0];
    if(!row||!row.active||row.deletion_epoch!==10)
      throw new WorkRecoveryRefusal('r29_session_or_consent_changed');
    transactionClient=client;
    if(opts.afterLock)await opts.afterLock();
    const result=await callback();
    await client.query('COMMIT');
    return result;
   }catch(e){await client.query('ROLLBACK').catch(()=>undefined);throw e;}
   finally{transactionClient=null;client.release();}
  },
 };
 return rehearseSessionBoundWriteR29({
  initial,
  issue:async()=>{if(opts.issueHook)await opts.issueHook();return signed;},
  loadCurrentAdmission:async()=>current(transactionClient||undefined),
  fence,
  commit:async()=>{
   if(!transactionClient)throw Error('r30_missing_locked_pg_transaction');
   await transactionClient.query(`INSERT INTO r30_fixture_commits
    (work_id,generation,cipher_sha256) VALUES($1,1,$2)`,
    [WORK,'c'.repeat(64)]);
   if(opts.commitHook)await opts.commitHook();
   return {storedCipherManifest:true};
  },
  nowMs:()=>NOW,
 });
}
run('R30 real PG16 transactional Work lock / revocation race',()=>{
 beforeEach(async()=>{await reset();});
 afterAll(async()=>{await pool?.end();});
 it('keeps all real member writer flags disabled',()=>{
  expect(R29_REAL_WRITER_AUTHORIZATION_ENABLED).toBe(false);
 });
 it('revocation during key latency completes BEFORE fence, with ZERO committed rows',async()=>{
  const result=await author({issueHook:async()=>{await revoke();}});
  expect(result).toEqual({kind:'refused',reason:'session_or_consent_changed'});
  const r=await pg().query('SELECT * FROM r30_fixture_commits WHERE work_id=$1',[WORK]);
  expect(r.rows).toHaveLength(0);
  const state=await pg().query<GateRow>(
   'SELECT active,consent_seq,deletion_epoch FROM r30_fixture_works WHERE work_id=$1',[WORK]);
  expect(state.rows[0].active).toBe(false);
  expect(state.rows[0].consent_seq).toBe(8);
  expect(state.rows[0].deletion_epoch).toBe(11);
 });
 it('even still-active writer must refuse a changed consent epoch',async()=>{
  const result=await author({issueHook:async()=>{
   await pg().query('UPDATE r30_fixture_works SET consent_seq=8 WHERE work_id=$1',[WORK]);
  }});
  expect(result).toEqual({kind:'refused',reason:'session_or_consent_changed'});
  expect((await pg().query('SELECT count(*)::int AS n FROM r30_fixture_commits')).rows[0].n).toBe(0);
 });
 it('save holding a PostgreSQL Work lock completes BEFORE concurrent revocation becomes effective',async()=>{
  const entered=deferred<void>(),release=deferred<void>();
  const writer=author({
   commitHook:async()=>{entered.resolve();await release.promise;},
  });
  await entered.promise;
  let revoked=false;
  const revocation=revoke().then(()=>{revoked=true;});
  // Ensure revoke cannot complete while the writing transaction holds its lock.
  await new Promise(done=>setTimeout(done,50));
  expect(revoked).toBe(false);
  const pending=await pg().query<GateRow>(
   'SELECT deletion_epoch,active FROM r30_fixture_works WHERE work_id=$1',[WORK]);
  expect(pending.rows[0].deletion_epoch).toBe(10);
  expect(pending.rows[0].active).toBe(true);
  release.resolve();
  const result=await writer;
  expect(result.kind).toBe('fictional_fenced_only');
  await revocation;
  expect(revoked).toBe(true);
  const committed=await pg().query('SELECT generation FROM r30_fixture_commits');
  expect(committed.rows).toHaveLength(1);
  const currentState=await pg().query<GateRow>(
   'SELECT deletion_epoch,active FROM r30_fixture_works WHERE work_id=$1',[WORK]);
  expect(currentState.rows[0].deletion_epoch).toBe(11);
  expect(currentState.rows[0].active).toBe(false);
  // Crucial ordering: the save happened before revoke was COMMITTED,
  // NOT proof that key retirement across an external independent service works.
 });
 it('a failed save inside Work transaction rolls back its already-inserted manifest',async()=>{
  const result=await author({commitHook:async()=>{
   throw new Error('r30_fictional_writer_crashed_before_commit');
  }});
  expect(result).toEqual({kind:'refused',reason:'fenced_write_refused'});
  const c=await pg().query('SELECT count(*)::int AS n FROM r30_fixture_commits');
  expect(c.rows[0].n).toBe(0);
 });
 it('a missing remote key receipt has no route to any plaintext write',async()=>{
  const initial=await current();
  expect(initial).toBeTruthy();
  const result=await rehearseSessionBoundWriteR29({
   initial:initial!,issue:async()=>{throw new Error('r30_fixture_remote_custodian_outage');},
   loadCurrentAdmission:async()=>current(),
   fence:{authority:'fictional_work_revocation_lock_only',
    runHeld:async(_,cb)=>cb()},
   commit:async()=>{throw Error('NEVER_SHOULD_WRITE');},
   nowMs:()=>NOW,
  });
  expect(result.kind).toBe('refused');
  expect((await pg().query('SELECT count(*)::int AS n FROM r30_fixture_commits')).rows[0].n).toBe(0);
 });
 it('revoking an unrelated Work leaves this Work untouched',async()=>{
  await revoke(WORK_B);
  const state=await pg().query<GateRow>('SELECT active,deletion_epoch FROM r30_fixture_works WHERE work_id=$1',[WORK]);
  expect(state.rows[0].active).toBe(true);
  expect(state.rows[0].deletion_epoch).toBe(10);
  const result=await author();
  expect(result.kind).toBe('fictional_fenced_only');
 });
});
