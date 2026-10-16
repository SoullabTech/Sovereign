/**
 * R47 invented-writing Postgres16/AES-GCM private review custody.
 * Exclusive disposable localhost PG, dedicated fsync vault and fake keys.
 * No authenticated real member, Next route, model, KMS, mail or deployment.
 */
import {createHash,generateKeyPairSync,randomBytes,randomUUID,sign} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {query,closePool} from '@/lib/db/postgres';
import {canonicalDeletionPayload,type DeletionHighwaterV1}
 from '@/lib/writersStudio/recovery/deletionBarrierV1';
import {beginHeldDraftR35,reopenHeldDraftR35,type R35Custody}
 from '@/lib/writersStudio/recovery/heldProtectedDraftR35';
import {exactTextareaPassageR41}
 from '@/lib/writersStudio/exactLiveSelectionR41';
import {
 recordHeldPrivateReviewR47,reconcileHeldPrivateReviewR47,
 reopenHeldPrivateReviewR47,R47_REAL_PRIVATE_EDITORIAL_ENABLED,
 R47_NAMESPACE,
} from '@/lib/writersStudio/recovery/heldPrivateEditorialReviewR47';
import type {R37SectionSelection}
 from '@/lib/writersStudio/recovery/heldSectionApplyR37';
import {R44_REAL_AUTHOR_APPROVAL_ENABLED}
 from '@/lib/writersStudio/recovery/heldDurableAuthorApprovalR44';
import {R46_REAL_DURABLE_SIGNED_APPLY_ENABLED}
 from '@/lib/writersStudio/recovery/heldDurableSignedApplyR46';

const enabled=process.env.R47_PRIVATE_EDITORIAL_FIXTURE==='fictional-only'&&
 process.env.R37_SECTION_PASSAGE_FIXTURE==='fictional-only'&&
 process.env.R36_PASSAGE_REVIEW_FIXTURE==='fictional-only'&&
 process.env.R35_PROTECTED_DRAFT_FIXTURE==='fictional-only'&&
 process.env.R35_PHYSICAL_PG16_FIXTURE==='fictional-only'&&
 /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/r35_draft$/.test(
  process.env.DATABASE_URL||'');
const tests=enabled?describe:describe.skip;
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const W=[
 '33333333-3333-4333-8333-333333333331',
 '33333333-3333-4333-8333-333333333332',
 '33333333-3333-4333-8333-333333333333',
 '33333333-3333-4333-8333-333333333334',
];
const S1='55555555-5555-4555-8555-555555555551';
const S2='55555555-5555-4555-8555-555555555552';
const CHOICE='66666666-6666-4666-8666-666666666661';
const OTHER='66666666-6666-4666-8666-666666666662';
const P1='R47_PRIVATE_LANTERN_ 🍂 First lantern glows. Second lantern glows.\n\n';
const P2='R47_PRIVATE_GARDEN_ Another fictional section remains private.';
const WHOLE=P1+P2;
const sha=(s:string)=>createHash('sha256').update(s,'utf8').digest('hex');
const keys=W.map(()=>({
 draft:{keyId:randomUUID(),keyBytes:randomBytes(32)},
 review:{keyId:randomUUID(),keyBytes:randomBytes(32)},
}));
const signer=generateKeyPairSync('ed25519');
const subject=(memberId=A)=>({
 memberId,assertedBy:'server_verified_member_session' as const,
});
const admission={
 memberId:A,sessionBindingSHA256:sha('fictional browser A session'),
 consentNoticeSHA256:sha('fictional accepted first-writer notice'),
 consentEventSequence:4,activeWriter:true,
};
function auth(key:{keyId:string;keyBytes:Buffer},revokedWork?:string):R35Custody{
 const cp:DeletionHighwaterV1={
  protocol:'soullab.ws.deletion-highwater.v1',
  stream:'writers-studio-beta',generation:92,
  revokedWorks:revokedWork?[revokedWork]:[],revokedKeyIds:[],
 };
 return {
  key,signedDeletion:{checkpoint:cp,signature:sign(null,
   canonicalDeletionPayload(cp),signer.privateKey).toString('base64')},
  trustedSigner:signer.publicKey,independent:{minimumGeneration:92},
 };
}
function fixture(index:number){
 return {subject:subject(),admission,workId:W[index],
  draftCustody:auth(keys[index].draft),
  privateCustody:auth(keys[index].review),
 };
}
function selection(index:number):R37SectionSelection{
 const at=P1.lastIndexOf('lantern glows');
 const selected=exactTextareaPassageR41(P1,P1,at,at+'lantern glows'.length);
 if(!selected)throw Error('R47_exact_canonical_selection_missing');
 return {
  expectedWorkSHA256:sha(WHOLE),
  section:{
   sectionId:S1,currentText:P1,expectedGeneration:1,
   expectedDraftSHA256:sha(P1),
   anchor:{sectionId:S1,start:selected.start,end:selected.end,
    selectedText:selected.text,sectionSHA256:sha(P1)},
   alternatives:[
    {id:CHOICE,origin:'maia',wording:'lantern shimmers'},
    {id:OTHER,origin:'member',wording:'lantern shines'},
   ],chosenAlternativeId:CHOICE,
  },
 };
}
async function count(where:string,values:unknown[]=[]){
 const r=await query<{n:number}>(where,values);
 return Number(r.rows[0].n);
}
const reviewIds=new Map<number,string>();
tests('R47 sealed private editorial proposal/choice and source continuity',()=>{
 beforeAll(async()=>{
  for(let i=0;i<W.length;i++){
   const r=await beginHeldDraftR35({
    subject:subject(),workId:W[i],custody:auth(keys[i].draft),
    sections:[{id:S1,text:P1},{id:S2,text:P2}],
   });
   expect(r.status).toBe('saved');
  }
 });
 afterAll(async()=>{
  const escrow=process.env.R47_FICTIONAL_ESCROW_PATH;
  if(enabled){
   if(!escrow||!reviewIds.has(0)||!reviewIds.has(3))
     throw Error('R47_escrow_and_review_keys_required');
   writeFileSync(escrow,JSON.stringify({
    signerPKCS8:signer.privateKey.export({type:'pkcs8',format:'pem'}),
    reviewIds:Object.fromEntries(reviewIds),
    keys:keys.map(k=>({
     draft:{id:k.draft.keyId,hex:k.draft.keyBytes.toString('hex')},
     review:{id:k.review.keyId,hex:k.review.keyBytes.toString('hex')},
    })),
   }),{flag:'wx',mode:0o600});
   await closePool();
  }
 });
 it('never exposes real approved writer, durable Apply or Undo',()=>{
  expect(R47_REAL_PRIVATE_EDITORIAL_ENABLED).toBe(false);
  expect(R44_REAL_AUTHOR_APPROVAL_ENABLED).toBe(false);
  expect(R46_REAL_DURABLE_SIGNED_APPLY_ENABLED).toBe(false);
 });
 it('seals a verified proposal and returns only a structural receipt',async()=>{
  const input={...fixture(0),selection:selection(0),idempotencyKey:'r47-first-read-001'};
  const first=await recordHeldPrivateReviewR47(input);
  expect(first).toMatchObject({kind:'HELD_ENCRYPTED_PRIVATE_REVIEW',
   status:'created',releaseApproved:false,canApply:false,
   sectionId:S1,alternativeId:CHOICE,generation:1});
  reviewIds.set(0,first.reviewId);
  expect(JSON.stringify(first)).not.toContain('lantern shimmers');
  const own=await reopenHeldPrivateReviewR47({
   ...fixture(0),reviewId:first.reviewId,generation:1,
  });
  expect(own.preview).toMatchObject({
   originalPassage:'lantern glows',proposedPassage:'lantern shimmers',
   sectionOrder:[S1,S2],untouchedSectionIds:[S2],
  });
  expect(own.selection.section.anchor.start).toBeGreaterThan(
   Array.from(P1.slice(0,P1.indexOf('lantern glows'))).length);
  expect(own.canApply).toBe(false);
  const again=await recordHeldPrivateReviewR47(input);
  expect(again).toMatchObject({reviewId:first.reviewId,status:'replayed'});
  expect(await count('SELECT count(*)::int n FROM writers_studio_r47_private_review WHERE work_id=$1',[W[0]])).toBe(1);
  expect((await reopenHeldDraftR35({subject:subject(),workId:W[0],
   generation:1,custody:auth(keys[0].draft)})).content).toBe(WHOLE);
  expect(await count('SELECT count(*)::int n FROM writers_studio_r35_draft_versions WHERE work_id=$1',[W[0]])).toBe(1);
 });
 it('reusing intent for a different selected alternative fails closed',async()=>{
  const alternative=selection(0);
  const changed={...alternative,section:{
    ...alternative.section,chosenAlternativeId:OTHER,
  }};
  await expect(recordHeldPrivateReviewR47({
   ...fixture(0),selection:changed,idempotencyKey:'r47-first-read-001',
  })).rejects.toHaveProperty('code','r47_idempotency_review_choice_conflict');
  expect(await count('SELECT count(*)::int n FROM writers_studio_r47_private_review WHERE work_id=$1',[W[0]])).toBe(1);
 });
 it('concurrent identical proposal intents cannot create duplicate ciphertext',async()=>{
  const input={...fixture(1),selection:selection(1),
   idempotencyKey:'r47-parallel-review-001'};
  const results=await Promise.allSettled([
   recordHeldPrivateReviewR47(input),recordHeldPrivateReviewR47(input),
  ]);
  const fulfilled=results.filter(x=>x.status==='fulfilled') as
    PromiseFulfilledResult<Awaited<ReturnType<typeof recordHeldPrivateReviewR47>>>[];
  const id=fulfilled[0]?.value.reviewId;
  if(!id)throw Error('R47_concurrent_at_least_one_verified_required');
  reviewIds.set(1,id);
  // A competing waiter may correctly HOLD while the first fsync is in flight.
  expect(results.filter(x=>x.status==='rejected').length).toBeLessThanOrEqual(1);
  const replay=await recordHeldPrivateReviewR47(input);
  expect(replay.reviewId).toBe(id);
  expect(await count('SELECT count(*)::int n FROM writers_studio_r47_private_review WHERE work_id=$1',[W[1]])).toBe(1);
 });
 it('crash after intention stays reserved, does not silently republish',async()=>{
  const input={...fixture(2),selection:selection(2),
   idempotencyKey:'r47-interrupted-intention-001'};
  await expect(recordHeldPrivateReviewR47({...input,interruptAfter:'intention'}))
   .rejects.toHaveProperty('code','r47_interrupted_after_intention_held');
  const r=await query<{review_id:string;state:string}>(
   'SELECT review_id,state FROM writers_studio_r47_private_review WHERE work_id=$1',[W[2]]);
  expect(r.rows).toHaveLength(1);
  expect(r.rows[0].state).toBe('reserved');
  reviewIds.set(2,r.rows[0].review_id);
  await expect(reconcileHeldPrivateReviewR47({...fixture(2),
   reviewId:r.rows[0].review_id,generation:1,
  })).rejects.toHaveProperty('code','r47_reserved_missing_ciphertext_held');
  await expect(recordHeldPrivateReviewR47(input))
   .rejects.toHaveProperty('code','r47_reserved_missing_ciphertext_held');
  expect(await count("SELECT count(*)::int n FROM writers_studio_r47_private_review WHERE work_id=$1 AND state='reserved'",[W[2]])).toBe(1);
 });
 it('crash after ciphertext is reconciled by authenticated readback, never rewritten',async()=>{
  const input={...fixture(3),selection:selection(3),
   idempotencyKey:'r47-interrupted-vault-001'};
  await expect(recordHeldPrivateReviewR47({...input,interruptAfter:'ciphertext'}))
   .rejects.toHaveProperty('code','r47_interrupted_after_ciphertext_held');
  const r=await query<{review_id:string;state:string;cipher_ref:string}>(
   'SELECT review_id,state,cipher_ref FROM writers_studio_r47_private_review WHERE work_id=$1',[W[3]]);
  expect(r.rows).toHaveLength(1);
  expect(r.rows[0].state).toBe('reserved');
  expect(r.rows[0].cipher_ref).toBe(R47_NAMESPACE+'/'+r.rows[0].review_id+'.enc');
  reviewIds.set(3,r.rows[0].review_id);
  await expect(reopenHeldPrivateReviewR47({...fixture(3),
   reviewId:r.rows[0].review_id,generation:1,
  })).rejects.toHaveProperty('code','r47_unreconciled_private_review_held');
  const recovered=await reconcileHeldPrivateReviewR47({...fixture(3),
   reviewId:r.rows[0].review_id,generation:1,
  });
  expect(recovered.status).toBe('reconciled');
  const viewed=await reopenHeldPrivateReviewR47({...fixture(3),
   reviewId:r.rows[0].review_id,generation:1,
  });
  expect(viewed.preview.proposedPassage).toBe('lantern shimmers');
  const again=await recordHeldPrivateReviewR47(input);
  expect(again).toMatchObject({status:'replayed',reviewId:r.rows[0].review_id});
  expect(await count('SELECT count(*)::int n FROM writers_studio_r47_private_review WHERE work_id=$1',[W[3]])).toBe(1);
 });
 it('wrong current member, consent, revoked key or reused Draft key never opens',async()=>{
  const read={...fixture(0),reviewId:reviewIds.get(0)!,generation:1};
  await expect(reopenHeldPrivateReviewR47({
   ...read,subject:subject(B),admission:{...admission,memberId:B},
  })).rejects.toHaveProperty('code','r47_foreign_or_missing_private_review');
  await expect(reopenHeldPrivateReviewR47({
   ...read,admission:{...admission,activeWriter:false},
  })).rejects.toBeTruthy();
  await expect(reopenHeldPrivateReviewR47({
   ...read,admission:{...admission,consentEventSequence:admission.consentEventSequence+1},
  })).rejects.toHaveProperty('code','r47_review_manifest_or_consent_mismatch');
  await expect(reopenHeldPrivateReviewR47({
   ...read,privateCustody:auth(keys[0].review,W[0]),
  })).rejects.toHaveProperty('code','deleted_work_refused');
  await expect(reopenHeldPrivateReviewR47({
   ...read,privateCustody:auth(keys[0].draft),
  })).rejects.toHaveProperty('code','r47_private_review_and_draft_keys_must_differ');
  // A forged review key with the same UUID but different bytes fails the
  // private keyed consent/manifest HMAC BEFORE any AES-GCM decryption.
  // Keep this earlier fail-closed refusal distinct from a GCM-tag failure.
  await expect(reopenHeldPrivateReviewR47({...read,
   privateCustody:auth({keyId:keys[0].review.keyId,keyBytes:randomBytes(32)}),
  })).rejects.toHaveProperty('code','r47_review_manifest_or_consent_mismatch');
 });
 it('SQL metadata-only custody cannot be changed or erased',async()=>{
  const rows=await query('SELECT * FROM writers_studio_r47_private_review');
  const contents=JSON.stringify(rows.rows);
  for(const marker of ['R47_PRIVATE_LANTERN_','R47_PRIVATE_GARDEN_',
   'lantern shimmers','lantern shines','R47 fictional secret']){
   expect(contents).not.toContain(marker);
  }
  expect(rows.rows).toHaveLength(4);
  await expect(query('DELETE FROM writers_studio_r47_private_review WHERE work_id=$1',[W[0]]))
   .rejects.toBeTruthy();
  await expect(query("UPDATE writers_studio_r47_private_review SET state='reserved' WHERE work_id=$1",[W[0]]))
   .rejects.toBeTruthy();
 });
});
