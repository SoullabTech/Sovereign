/**
 * R49 physical PostgreSQL SIGKILL/restart → FRESH Node process:
 * read exact immutable original Source, Draft 1/2/3, private proposal,
 * token-specific observed Apply, distinct durably spent Undo.
 *
 * Synthetic key escrow is mode-0600 and deleted with disposable vault;
 * never creates real Work, session, KMS, mail, provider or release privileges.
 */
import {readFileSync,statSync} from 'node:fs';
import {createPrivateKey,createPublicKey,sign} from 'node:crypto';
import {query,closePool} from '@/lib/db/postgres';
import {canonicalDeletionPayload,type DeletionHighwaterV1}
 from '@/lib/writersStudio/recovery/deletionBarrierV1';
import {readHeldOriginalR32} from '@/lib/writersStudio/recovery/heldOriginalSourceR32';
import {reopenHeldDraftR35,type R35Custody}
 from '@/lib/writersStudio/recovery/heldProtectedDraftR35';
import {reopenHeldPrivateReviewR47}
 from '@/lib/writersStudio/recovery/heldPrivateEditorialReviewR47';
import {inspectSpentApplyR48}
 from '@/lib/writersStudio/recovery/heldSpentApplyEvidenceR48';

const enabled=process.env.R49_COLD_PHYSICAL_PG16==='fictional-only'&&
 process.env.R49_WHOLE_WORK_FIXTURE==='fictional-only';
const tests=enabled?describe:describe.skip;
const A='11111111-1111-4111-8111-111111111111';
const W='33333333-3333-4333-8333-33333333333f';
const S1='66666666-6666-4666-8666-666666666661';
const S2='66666666-6666-4666-8666-666666666662';
const P1='R49_FICTIONAL_SOURCE_ 🍂 The first fictional lantern. Another first fictional lantern.\n\n';
const P2='R49_FICTIONAL_SECOND_ Another invented section remains.';
type Key={id:string;bytes:string};
type Escrow={
 protocol:'soullab.ws.r49.fictional-continuous-cold-v1';
 memberId:string;workId:string;arrivalId:string;reviewId:string;
 applyToken:string;undoToken:string;consentEpoch:number;issuerRoot:string;
 highwaterSignerPKCS8:string;
 keys:{source:Key;draft:Key;review:Key};
};
let receipt:Escrow;
const subject=(m=A)=>({
 memberId:m,assertedBy:'server_verified_member_session' as const,
});
const admission=()=>({
 memberId:A,activeWriter:true,
 consentNoticeSHA256:'b'.repeat(64),
 consentEventSequence:receipt.consentEpoch,
 sessionBindingSHA256:'f'.repeat(64),
});
function custody(name:keyof Escrow['keys'],revoked=false):R35Custody{
 const key=receipt.keys[name];
 const signer=createPrivateKey(receipt.highwaterSignerPKCS8);
 const cp:DeletionHighwaterV1={
  protocol:'soullab.ws.deletion-highwater.v1',
  stream:'writers-studio-beta',generation:100,
  revokedWorks:revoked?[W]:[],revokedKeyIds:[],
 };
 return {
  key:{keyId:key.id,keyBytes:Buffer.from(key.bytes,'base64')},
  signedDeletion:{checkpoint:cp,signature:sign(null,
   canonicalDeletionPayload(cp),signer).toString('base64')},
  trustedSigner:createPublicKey(signer),
  independent:{minimumGeneration:100},
 };
}
async function count(table:string){
 const n=await query<{n:number}>(
  'SELECT count(*)::int n FROM '+table+' WHERE work_id=$1',[W]);
 return n.rows[0]?.n;
}
tests('R49 cold restart of the SAME fictional Work after Source→Apply→Undo',()=>{
 beforeAll(()=>{
  const loc=process.env.R49_COLD_ESCROW_PATH||'';
  if(!loc||!statSync(loc).isFile()||statSync(loc).mode&0o077)
   throw Error('r49_untrusted_cold_test_key_fixture');
  receipt=JSON.parse(readFileSync(loc,'utf8')) as Escrow;
  if(receipt.protocol!=='soullab.ws.r49.fictional-continuous-cold-v1'||
      receipt.memberId!==A||receipt.workId!==W||!receipt.arrivalId||
      !receipt.reviewId||!receipt.applyToken||!receipt.undoToken)
    throw Error('r49_escrow_shape_or_author_mismatch');
 });
 afterAll(async()=>{if(enabled)await closePool();});
 it('reopens exact R36 immutable Source under its own distinct source key',async()=>{
  const obj=await readHeldOriginalR32({
   subject:subject(),workId:W,
   arrivalId:receipt.arrivalId,generation:1,
   authority:custody('source'),
  });
  expect(obj.source.sourceText).toBe(P1+P2);
  expect(obj.source.originalBytes).toEqual(
   Buffer.from('R49_FICTIONAL_ORIGINAL_DOCX_BYTES'));
  expect(obj.source.originalFilename).toBe('R49-fictional.docx');
  expect(receipt.keys.source.id).not.toBe(receipt.keys.draft.id);
  expect(receipt.keys.draft.id).not.toBe(receipt.keys.review.id);
 });
 it('reopens first, signed-Apply and Undo encrypted versions without mutation',async()=>{
  const snapshots=await Promise.all([1,2,3].map(g=>reopenHeldDraftR35({
   subject:subject(),workId:W,generation:g,custody:custody('draft'),
  })));
  expect(snapshots[0].sections).toEqual([
   {id:S1,text:P1},{id:S2,text:P2},
  ]);
  expect(snapshots[1].sections[0].text).toBe(
   P1.replace('Another first fictional','Another first enchanted'));
  expect(snapshots[1].sections[1]).toEqual(snapshots[0].sections[1]);
  expect(snapshots[2].sections).toEqual(snapshots[0].sections);
  expect(snapshots[2].content).toBe(P1+P2);
  expect(snapshots[2].action).toBe('restore');
  expect(snapshots[2].restoredFrom).toBe(1);
  expect(await count('writers_studio_r35_draft_versions')).toBe(3);
 });
 it('reopens original encrypted private editorial proposal without authorizing Apply',async()=>{
  const r=await reopenHeldPrivateReviewR47({
   subject:subject(),admission:admission(),workId:W,
   draftCustody:custody('draft'),privateCustody:custody('review'),
   reviewId:receipt.reviewId,generation:1,
  });
  expect(r).toMatchObject({
   kind:'HELD_PRIVATE_REVIEW_READ_ONLY',
   preview:{originalPassage:'first fictional',
    proposedPassage:'first enchanted',
    sectionOrder:[S1,S2],untouchedSectionIds:[S2]},
   releaseApproved:false,canApply:false,
  });
  expect(await count('writers_studio_r47_private_review')).toBe(1);
 });
 it('classifies spent Apply as saved by token-specific immutable encrypted evidence after Undo',async()=>{
  const proof=await inspectSpentApplyR48({
   authority:'fictional_independent_recovery_custodian_only',
   memberId:A,workId:W,approvalToken:receipt.applyToken,
   approvalIssuerSecret:Buffer.from(receipt.issuerRoot,'base64'),
   custody:custody('draft'),
  });
  expect(proof).toMatchObject({
   kind:'FICTIONAL_CIPHERTEXT_APPLY_CONFIRMED',
   generation:2,priorDraftVersionVerified:true,
   unchangedSectionIds:[S2],retryAuthorized:false,
   releaseApproved:false,
  });
  expect(await count('writers_studio_r44_held_approval')).toBe(1);
 });
 it('the separate spent Undo and all prior encrypted versions survive restart',async()=>{
  const undo=await query<{state:string;applied_generation:number|string}>(
   'SELECT state,applied_generation FROM writers_studio_r47_held_undo WHERE work_id=$1',
   [W]);
  expect(undo.rows).toEqual([{state:'spent',applied_generation:'2'}]);
  expect(await count('writers_studio_r47_held_undo')).toBe(1);
  expect(await count('writers_studio_r35_draft_versions')).toBe(3);
  await expect(query('DELETE FROM writers_studio_r47_held_undo WHERE work_id=$1',[W]))
   .rejects.toBeTruthy();
  expect(await count('writers_studio_r47_held_undo')).toBe(1);
 });
 it('revoked Work cannot open the private choice or editable Draft even after recovery',async()=>{
  await expect(reopenHeldPrivateReviewR47({
   subject:subject(),admission:admission(),workId:W,
   draftCustody:custody('draft',true),privateCustody:custody('review',true),
   reviewId:receipt.reviewId,generation:1,
  })).rejects.toHaveProperty('code','deleted_work_refused');
  await expect(reopenHeldDraftR35({
   subject:subject(),workId:W,generation:3,
   custody:custody('draft',true),
  })).rejects.toHaveProperty('code','deleted_work_refused');
  expect(await count('writers_studio_r35_draft_versions')).toBe(3);
 });
});
