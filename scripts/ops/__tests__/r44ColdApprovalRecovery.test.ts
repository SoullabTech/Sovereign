/** R44 actual fresh-process recovery after forced PostgreSQL restart. */
import {readFileSync} from 'node:fs';
import {query,closePool} from '@/lib/db/postgres';
import {claimHeldAuthorApprovalR44}
 from '@/lib/writersStudio/recovery/heldDurableAuthorApprovalR44';
import {WORK,view,selection,admission}
 from '../fixtures/wsR44ChoiceFixture';
const enabled=process.env.R44_COLD_PG16==='fictional-only' &&
 process.env.R44_DURABLE_APPROVAL_FIXTURE==='fictional-only';
const run=enabled?describe:describe.skip;
run('R44 durable claim after restart in fresh Node instance',()=>{
 let secret:Buffer,unspentToken:string,spentToken:string,now:number;
 beforeAll(()=>{
  const path=process.env.R44_FICTIONAL_ESCROW;
  if(!path)throw Error('r44_missing_fictional_read_key');
  const file=JSON.parse(readFileSync(path,'utf8'));
  secret=Buffer.from(file.rootHex,'hex');
  unspentToken=file.unspentToken;
  spentToken=file.spentToken;
  now=file.nowMs;
  if(secret.length!==32)throw Error('r44_unverified_fictional_issuer_key');
 });
 afterAll(async()=>{await closePool();});
 const input=()=>({admission,workId:WORK,currentView:view,selection:selection(),
  issuerSecret:secret,nowMs:now});
 it('an already-spent approval stays refused on the new process',async()=>{
  await expect(claimHeldAuthorApprovalR44({...input(),opaqueToken:spentToken}))
   .rejects.toHaveProperty('code','r44_absent_expired_changed_or_already_spent');
 });
 it('an unspent approval is claimable just once from the new process',async()=>{
  const one=await claimHeldAuthorApprovalR44({
   ...input(),opaqueToken:unspentToken,
  });
  expect(one.kind).toBe('HELD_ONE_USE_ATTEMPT_CLAIMED');
  const q=await query<{state:string}>(`
    SELECT state FROM writers_studio_r44_held_approval
    WHERE token_hmac IS NOT NULL ORDER BY created_at DESC LIMIT 1`);
  expect(q.rows.length).toBeGreaterThan(0);
  await expect(claimHeldAuthorApprovalR44({
   ...input(),opaqueToken:unspentToken,
  })).rejects.toHaveProperty('code','r44_absent_expired_changed_or_already_spent');
 });
 it('altered consent cannot revive an already-spent token',async()=>{
  await expect(claimHeldAuthorApprovalR44({
   ...input(),admission:{...admission,consentEventSequence:43},
   opaqueToken:unspentToken,
  })).rejects.toHaveProperty('code','r44_absent_expired_changed_or_already_spent');
 });
});
