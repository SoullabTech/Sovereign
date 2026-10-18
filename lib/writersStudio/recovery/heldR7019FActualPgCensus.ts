/**
 * R70.19F: REAL PostgreSQL16 fixture manuscript/managed-key census
 * evaluated on the SAME read-only REPEATABLE READ session and advisory lease
 * as the R70.19C encrypted database+vault snapshot.
 *
 * This only qualifies canonical member_manuscripts and R1Q review-only
 * wrapped-key rows loaded into one FICTIONAL disposable database.
 * It does NOT enumerate all Soullab Works, proposal revisions, historical
 * replicas, deleted data or real KMS keys; real production release = HOLD.
 */
import type {Client} from 'pg';

export const R7019F_PRODUCTION_CENSUS_ADMISSION_ENABLED=false as const;
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const LOCK='soullab.ws.r70.17.writer-and-source-capture.v1';
export type R7019FFixtureWorkIdentity=Readonly<{
  memberId:string;workId:string;keyId:string;
}>;
export type R7019FFixtureSqlCensus=Readonly<{
  works:ReadonlyArray<R7019FFixtureWorkIdentity>;
  memberCount:number;manuscriptCount:number;managedWrappedKeyCount:number;
  sourceArrivalsCount:number;draftCount:number;
  allPlatformAndHistoricalWorksCovered:false;
  offhostWorkCensusAuthorityCertified:false;
  realMemberAdmissionApproved:false;
}>;
export class R7019FRefusal extends Error{
  constructor(readonly code:string){super('r7019f_'+code);this.name='R7019FRefusal';}
}
const stop=(x:string):never=>{throw new R7019FRefusal(x);};
type PgRow={
  member_id:string;work_id:string;key_id:string|null;
  key_epoch:string|number|null;provider:string|null;
};
type C={n:number};
function asInt(v:string|number|null){
 const n=typeof v==='number'?v:Number(v);
 if(v===null||!Number.isSafeInteger(n)||n<0)stop('invalid_key_epoch');
 return n;
}
export async function captureR7019FRealFictionalPgCensus(
 client:Client,verifiedMemberId:string,
):Promise<R7019FFixtureSqlCensus>{
 if(R7019F_PRODUCTION_CENSUS_ADMISSION_ENABLED!==false||
    process.env.NODE_ENV!=='test'||
    process.env.R7019F_CENSUS_FIXTURE!=='fictional-only'||
    process.env.R7019B_WRITER_FIXTURE!=='fictional-only'||
    !UUID.test(verifiedMemberId))stop('fixture_only');
 // A separate/pooled connection may see a different MVCC generation.
 const custody=await client.query<{
   isolation:string;transaction_read_only:string;writer_lock:number;
 }>(`
   SELECT current_setting('transaction_isolation') AS isolation,
    current_setting('transaction_read_only') AS transaction_read_only,
    (SELECT count(*)::int FROM pg_locks
      WHERE pid=pg_backend_pid() AND locktype='advisory' AND granted
       AND objsubid=1
       AND classid=((hashtextextended($1::text,0) >> 32)::int::oid)
       AND objid=((hashtextextended($1::text,0) & 4294967295)::oid)
    ) AS writer_lock`,[LOCK]);
 if(custody.rows.length!==1||
    custody.rows[0].isolation!=='repeatable read'||
    custody.rows[0].transaction_read_only!=='on'||
    custody.rows[0].writer_lock!==1)stop('capture_session_and_writer_lease_required');
 const members=await client.query<{id:string}>('SELECT id FROM members ORDER BY id');
 if(members.rows.length!==1||members.rows[0].id!==verifiedMemberId)
  stop('not_single_verified_fictional_member');
 let roster;
 try{
  roster=await client.query<PgRow>(`
    SELECT m.member_id,m.id AS work_id,k.key_id,k.key_epoch,k.provider
      FROM member_manuscripts m
      LEFT JOIN ws_managed_work_key_wrappings_r1q k
        ON k.manuscript_id=m.id AND k.member_id=m.member_id
     ORDER BY m.id,k.key_epoch`);
 }catch{stop('canonical_managed_key_registry_unavailable');}
 if(roster.rows.length<1||roster.rows.length>100)
  stop('unqualified_manuscript_population');
 const owned: R7019FFixtureWorkIdentity[]=[];
 const seenIds=new Set<string>(),seenKeys=new Set<string>();
 for(const row of roster.rows){
  if(row.member_id!==verifiedMemberId||!UUID.test(row.work_id)||
     !row.key_id||!UUID.test(row.key_id)||
     row.provider!=='external_managed_kms'||
     asInt(row.key_epoch)!==1)stop('missing_foreign_or_multiple_epoch_work_key');
  if(seenIds.has(row.work_id)||seenKeys.has(row.key_id))
   stop('duplicate_manuscript_or_reused_key_identity');
  seenIds.add(row.work_id);seenKeys.add(row.key_id);
  owned.push({memberId:row.member_id,workId:row.work_id,keyId:row.key_id});
 }
 const totals=await client.query<{
  works:number;keys:number;sources:number;drafts:number;
 }>(`SELECT
    (SELECT count(*)::int FROM member_manuscripts) AS works,
    (SELECT count(*)::int FROM ws_managed_work_key_wrappings_r1q) AS keys,
    (SELECT count(*)::int FROM manuscript_source_arrivals) AS sources,
    (SELECT count(*)::int FROM manuscript_working_drafts) AS drafts`);
 const n=totals.rows[0];
 if(!n||n.works!==owned.length||n.keys!==owned.length||
    !Number.isSafeInteger(n.sources)||n.sources<0||
    !Number.isSafeInteger(n.drafts)||n.drafts<0)
   stop('incomplete_fixture_manuscript_key_census');
 return Object.freeze({
  works:Object.freeze(owned),memberCount:1,
  manuscriptCount:n.works,managedWrappedKeyCount:n.keys,
  sourceArrivalsCount:n.sources,draftCount:n.drafts,
  allPlatformAndHistoricalWorksCovered:false,
  offhostWorkCensusAuthorityCertified:false,
  realMemberAdmissionApproved:false,
 });
}
/** Compares restored canonical PG rows, not an archive-controlled count.
 * Caller must have obtained the expected index from the PREDECRYPT-verified
 * signed census. This helper cannot authorize any production recovery. */
export function matchR7019FRestoredFictionalWorkIndex(
 expected:ReadonlyArray<R7019FFixtureWorkIdentity>,
 restored:ReadonlyArray<R7019FFixtureWorkIdentity>,
):boolean{
 if(!Array.isArray(expected)||!Array.isArray(restored)||
    !expected.length||expected.length>100||
    expected.length!==restored.length)return false;
 const valid=(a:ReadonlyArray<R7019FFixtureWorkIdentity>)=>{
  let prior='';const keys=new Set<string>();
  for(const r of a){
   if(!r||!UUID.test(r.memberId)||!UUID.test(r.workId)||
      !UUID.test(r.keyId)||r.workId<=prior||keys.has(r.keyId))return false;
   prior=r.workId;keys.add(r.keyId);
  }
  return true;
 };
 return valid(expected)&&valid(restored)&&
  expected.every((item,i)=>item.memberId===restored[i].memberId&&
    item.workId===restored[i].workId&&item.keyId===restored[i].keyId);
}
