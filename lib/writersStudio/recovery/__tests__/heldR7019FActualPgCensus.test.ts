import type {Client} from 'pg';
import {
 captureR7019FRealFictionalPgCensus,
 matchR7019FRestoredFictionalWorkIndex,
 R7019F_PRODUCTION_CENSUS_ADMISSION_ENABLED,
} from '../heldR7019FActualPgCensus';

const MEMBER='4c0782ca-9074-43ee-9f3c-5f8500026780';
const OTHER='11111111-1111-4111-8111-111111111111';
const A='306902ed-21a9-4c01-aa15-984755598218';
const B='4c0782ca-9074-43ee-9f3c-5f8500026780';
const K1='3ac9b90d-8d79-44cf-bf3f-81376d8b7efe';
const K2='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
type PgRow={member_id:string;work_id:string;key_id:string|null;
  key_epoch:string|null;provider:string|null};
const one=(work_id:string,key_id:string,member_id=MEMBER):PgRow=>({
 work_id,key_id,member_id,key_epoch:'1',provider:'external_managed_kms',
});
const good=[one(A,K1),one(B,K2)];
const archiveIndex=[
 {memberId:MEMBER,workId:A,keyId:K1},
 {memberId:MEMBER,workId:B,keyId:K2},
];
const env={f:process.env.R7019F_CENSUS_FIXTURE,
 b:process.env.R7019B_WRITER_FIXTURE};
beforeEach(()=>{
 process.env.R7019F_CENSUS_FIXTURE='fictional-only';
 process.env.R7019B_WRITER_FIXTURE='fictional-only';
});
afterAll(()=>{
 if(env.f===undefined)delete process.env.R7019F_CENSUS_FIXTURE;
 else process.env.R7019F_CENSUS_FIXTURE=env.f;
 if(env.b===undefined)delete process.env.R7019B_WRITER_FIXTURE;
 else process.env.R7019B_WRITER_FIXTURE=env.b;
});
const fake=(rows:PgRow[]=good,opts:{
 count?:number;keys?:number;members?:string[];isolation?:string;lock?:number;
 }={})=>{
 const fn=jest.fn(async(q:string)=>{
  if(q.includes("current_setting('transaction_isolation')"))
   return {rows:[{isolation:opts.isolation??'repeatable read',
     transaction_read_only:'on',writer_lock:opts.lock??1}]};
  if(q.includes('SELECT id FROM members'))
   return {rows:(opts.members??[MEMBER]).map(id=>({id}))};
  if(q.includes('LEFT JOIN ws_managed_work_key_wrappings_r1q'))
   return {rows};
  if(q.includes('(SELECT count(*)::int FROM member_manuscripts)'))
   return {rows:[{works:opts.count??rows.length,
     keys:opts.keys??rows.length,sources:3,drafts:2}]};
  throw new Error('Unexpected fake SQL query');
 });
 return {query:fn} as unknown as Client;
};
const code=async(run:()=>Promise<unknown>,message:string)=>{
 try{await run();throw Error('DID_NOT_REFUSE');}
 catch(e){expect(e).toMatchObject({code:message});}
};
describe('R70.19F same-snapshot actual SQL Work-key census, production held',()=>{
 it('enumerates exactly canonical fictional owner and R1Q rows',async()=>{
  const c=await captureR7019FRealFictionalPgCensus(fake(),MEMBER);
  expect(c.works).toEqual(archiveIndex);
  expect(c.manuscriptCount).toBe(2);
  expect(c.managedWrappedKeyCount).toBe(2);
  expect(c.offhostWorkCensusAuthorityCertified).toBe(false);
  expect(c.allPlatformAndHistoricalWorksCovered).toBe(false);
  expect(R7019F_PRODUCTION_CENSUS_ADMISSION_ENABLED).toBe(false);
 });
 it('missing canonical R1Q wrapping never silently omits manuscript',async()=>{
  const incomplete=[one(A,K1),{...one(B,K2),key_id:null}];
  await code(()=>captureR7019FRealFictionalPgCensus(fake(incomplete),MEMBER),
   'missing_foreign_or_multiple_epoch_work_key');
 });
 it('multiple key epochs and reused keys are rejected',async()=>{
  await code(()=>captureR7019FRealFictionalPgCensus(fake([
    one(A,K1),{...one(A,K2),key_epoch:'2'},one(B,K2),
  ]),MEMBER),'missing_foreign_or_multiple_epoch_work_key');
  await code(()=>captureR7019FRealFictionalPgCensus(fake([
    one(A,K1),one(B,K1),
  ]),MEMBER),'duplicate_manuscript_or_reused_key_identity');
 });
 it('separate member or unrelated manuscript cannot be included',async()=>{
  await code(()=>captureR7019FRealFictionalPgCensus(fake([
    one(A,K1),one(B,K2,OTHER),
  ]),MEMBER),'missing_foreign_or_multiple_epoch_work_key');
  await code(()=>captureR7019FRealFictionalPgCensus(fake(good,{
    members:[MEMBER,OTHER]}),MEMBER),'not_single_verified_fictional_member');
 });
 it('missing table or out-of-snapshot transaction never passes',async()=>{
  await code(()=>captureR7019FRealFictionalPgCensus(fake(good,{
    isolation:'read committed'}),MEMBER),'capture_session_and_writer_lease_required');
  await code(()=>captureR7019FRealFictionalPgCensus(fake(good,{
    lock:0}),MEMBER),'capture_session_and_writer_lease_required');
 });
 it('count mismatches reject a seemingly valid two-work identity index',async()=>{
  await code(()=>captureR7019FRealFictionalPgCensus(fake(good,{
    count:3}),MEMBER),'incomplete_fixture_manuscript_key_census');
  await code(()=>captureR7019FRealFictionalPgCensus(fake(good,{
    keys:3}),MEMBER),'incomplete_fixture_manuscript_key_census');
 });
 it('missing exact test fixture never reads or authorizes SQL',async()=>{
  delete process.env.R7019F_CENSUS_FIXTURE;
  const client=fake();
  await code(()=>captureR7019FRealFictionalPgCensus(client,MEMBER),'fixture_only');
  expect(client.query).not.toHaveBeenCalled();
 });
 it('freshly restored exact owner/work/key identity must equal signed capture',()=>{
  expect(matchR7019FRestoredFictionalWorkIndex(archiveIndex,archiveIndex)).toBe(true);
  expect(matchR7019FRestoredFictionalWorkIndex(archiveIndex,
    archiveIndex.slice(0,1))).toBe(false);
  expect(matchR7019FRestoredFictionalWorkIndex(archiveIndex,
    [archiveIndex[0],{...archiveIndex[1],keyId:K1}])).toBe(false);
  expect(matchR7019FRestoredFictionalWorkIndex(archiveIndex,
    [archiveIndex[1],archiveIndex[0]])).toBe(false);
  expect(matchR7019FRestoredFictionalWorkIndex(archiveIndex,
    [archiveIndex[0],{...archiveIndex[1],memberId:OTHER}])).toBe(false);
 });
});
