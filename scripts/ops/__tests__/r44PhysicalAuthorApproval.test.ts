/**
 * R44 fictional physical PostgreSQL acceptance. No browser or actual writer.
 * A HELD choice claim is not a real author gesture or a save permission.
 */
import {randomBytes} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {query,closePool} from '@/lib/db/postgres';
import {
 prepareHeldAuthorApprovalR44,claimHeldAuthorApprovalR44,
 R44_REAL_AUTHOR_APPROVAL_ENABLED,
} from '@/lib/writersStudio/recovery/heldDurableAuthorApprovalR44';
import {
 MEMBER,FOREIGN,WORK,SECTION,OTHER_SECTION,CHOICE,OTHER_CHOICE,
 PHRASE,PART_ONE,PART_TWO,view,selection,admission,
} from '../fixtures/wsR44ChoiceFixture';
const ENABLED=process.env.R44_DURABLE_APPROVAL_FIXTURE==='fictional-only'&&
 process.env.R37_SECTION_PASSAGE_FIXTURE==='fictional-only'&&
 process.env.R36_PASSAGE_REVIEW_FIXTURE==='fictional-only'&&
 /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/r44_choice$/.test(
 process.env.DATABASE_URL||'');
const run=ENABLED?describe:describe.skip;
const root=randomBytes(32);
const now=1792188000000;
const base={admission,workId:WORK,currentView:view,selection:selection(),
 issuerSecret:root,nowMs:now};
let spentToken='',unspentToken='',parallelToken='';
afterAll(async()=>{
 if(ENABLED){
  const p=process.env.R44_FICTIONAL_ESCROW;
  if(!p||!unspentToken||!spentToken||!parallelToken)
   throw Error('r44_fictional_recovery_escrow_required');
  writeFileSync(p,JSON.stringify({
   rootHex:root.toString('hex'),spentToken,unspentToken,parallelToken,nowMs:now,
  }),{flag:'wx',mode:0o600});
  await closePool();
 }
});
run('R44 PG16 one-use author choice, metadata-only durability',()=>{
 it('real author authority is statically OFF, R37 preview cannot write',()=>{
  expect(R44_REAL_AUTHOR_APPROVAL_ENABLED).toBe(false);
  expect(base.selection.section.anchor.selectedText).toBe(PHRASE);
  expect(base.selection.section.anchor.start)
   .toBe(Array.from(PART_ONE.slice(0,PART_ONE.lastIndexOf(PHRASE))).length);
 });
 it('competing exact token consumers: ONE wins, others permanently refuse',async()=>{
  const prepared=await prepareHeldAuthorApprovalR44(base);
  spentToken=prepared.opaqueToken;
  const attempts=await Promise.allSettled(
   Array.from({length:8},()=>claimHeldAuthorApprovalR44({
    ...base,opaqueToken:prepared.opaqueToken,
   })));
  expect(attempts.filter(a=>a.status==='fulfilled')).toHaveLength(1);
  expect(attempts.filter(a=>a.status==='rejected')).toHaveLength(7);
  expect(attempts.find(a=>a.status==='fulfilled')).toMatchObject({
   status:'fulfilled',value:{kind:'HELD_ONE_USE_ATTEMPT_CLAIMED',
    workId:WORK,sectionId:SECTION,expectedGeneration:3,
    alternativeId:CHOICE,releaseApproved:false},
  });
  const r=await query<{n:string}>(`
   SELECT count(*)::text n FROM writers_studio_r44_held_approval
   WHERE state='spent'`);
  expect(r.rows[0].n).toBe('1');
 });
 it('consent, owner, choice, section and draft drift refuse without consuming',async()=>{
  const prepared=await prepareHeldAuthorApprovalR44(base);
  const token=prepared.opaqueToken;
  const mutated={...base,opaqueToken:token};
  await expect(claimHeldAuthorApprovalR44({...mutated,admission:{
   ...admission,consentEventSequence:admission.consentEventSequence+1,
  }})).rejects.toHaveProperty('code','r44_absent_expired_changed_or_already_spent');
  await expect(claimHeldAuthorApprovalR44({...mutated,admission:{
   ...admission,memberId:FOREIGN,
  }})).rejects.toHaveProperty('code','r44_absent_expired_changed_or_already_spent');
  const altered=selection();
  const wrongChoice={...altered,section:{
   ...altered.section,chosenAlternativeId:OTHER_CHOICE,
  }};
  await expect(claimHeldAuthorApprovalR44({...mutated,selection:wrongChoice}))
   .rejects.toHaveProperty('code','r44_absent_expired_changed_or_already_spent');
  const changedView={...view,sections:[
   {...view.sections[0],text:PART_ONE.replace('second','altered')},
   view.sections[1],
  ],content:view.content.replace('second','altered')};
  await expect(claimHeldAuthorApprovalR44({...mutated,currentView:changedView}))
   .rejects.toHaveProperty('code','r37_stale_work_snapshot');
  await expect(claimHeldAuthorApprovalR44({...mutated,selection:{
   ...altered,section:{...altered.section,sectionId:OTHER_SECTION},
  }})).rejects.toBeTruthy();
  const yes=await claimHeldAuthorApprovalR44(mutated);
  expect(yes.kind).toBe('HELD_ONE_USE_ATTEMPT_CLAIMED');
 });
 it('wrong 256-bit root cannot claim an otherwise correctly scoped token',async()=>{
  const prepared=await prepareHeldAuthorApprovalR44(base);
  await expect(claimHeldAuthorApprovalR44({...base,
   issuerSecret:randomBytes(32),opaqueToken:prepared.opaqueToken,
  })).rejects.toHaveProperty('code','r44_absent_expired_changed_or_already_spent');
  expect((await claimHeldAuthorApprovalR44({...base,
   opaqueToken:prepared.opaqueToken})).releaseApproved).toBe(false);
 });
 it('expired and future-clock attempts are refused, not renewed',async()=>{
  const prepared=await prepareHeldAuthorApprovalR44(base);
  await expect(claimHeldAuthorApprovalR44({...base,nowMs:now+120000,
   opaqueToken:prepared.opaqueToken}))
    .rejects.toHaveProperty('code','r44_absent_expired_changed_or_already_spent');
  await expect(claimHeldAuthorApprovalR44({...base,nowMs:now-1,
   opaqueToken:prepared.opaqueToken}))
    .rejects.toHaveProperty('code','r44_absent_expired_changed_or_already_spent');
 });
 it('an unspent choice persists for a new process after PG restart',async()=>{
  const prepared=await prepareHeldAuthorApprovalR44(base);
  expect(prepared.expiresAtMs).toBe(now+120000);
  unspentToken=prepared.opaqueToken;
  // Separate pending proof for two independent OS processes to contest.
  const parallel=await prepareHeldAuthorApprovalR44(base);
  parallelToken=parallel.opaqueToken;
  const check=await query<{n:string}>(`
   SELECT count(*)::text n FROM writers_studio_r44_held_approval
   WHERE state='prepared'`);
  expect(Number(check.rows[0].n)).toBeGreaterThan(0);
 });
 it('attempt state cannot be reset, deleted or have its approval scope altered',async()=>{
  const r=await query<{token_hmac:string}>(`
   SELECT token_hmac FROM writers_studio_r44_held_approval
   WHERE state='spent' LIMIT 1`);
  expect(r.rows.length).toBe(1);
  const h=r.rows[0].token_hmac;
  await expect(query(`
   UPDATE writers_studio_r44_held_approval SET state='prepared'
   WHERE token_hmac=$1`,[h])).rejects.toBeTruthy();
  await expect(query(`
   UPDATE writers_studio_r44_held_approval SET section_id=$2
   WHERE token_hmac=$1`,[h,OTHER_SECTION])).rejects.toBeTruthy();
  await expect(query(`
   DELETE FROM writers_studio_r44_held_approval WHERE token_hmac=$1`,
    [h])).rejects.toBeTruthy();
 });
 it('approved rows carry no author prose, raw token or actual keys',async()=>{
  const r=await query('SELECT * FROM writers_studio_r44_held_approval');
  const plain=JSON.stringify(r.rows);
  for(const marker of [
   PART_ONE,PART_TWO,'lantern shimmers','lantern gleams',
   spentToken,unspentToken,parallelToken,root.toString('hex'),
  ])expect(plain).not.toContain(marker);
 });
});
