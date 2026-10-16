/**
 * R47 cold recovery after actual PostgreSQL SIGKILL/restart in a NEW Node.
 * Same-Mac temporary fictional keys are mode-0600, never external KMS.
 */
import {readFileSync,statSync} from 'node:fs';
import {createPrivateKey,createPublicKey,sign,createHash} from 'node:crypto';
import {query,closePool} from '@/lib/db/postgres';
import {canonicalDeletionPayload,type DeletionHighwaterV1}
 from '@/lib/writersStudio/recovery/deletionBarrierV1';
import type {R35Custody} from '@/lib/writersStudio/recovery/heldProtectedDraftR35';
import {reopenHeldDraftR35}
 from '@/lib/writersStudio/recovery/heldProtectedDraftR35';
import {
 reopenHeldPrivateReviewR47,reconcileHeldPrivateReviewR47,
 R47_REAL_PRIVATE_EDITORIAL_ENABLED,
} from '@/lib/writersStudio/recovery/heldPrivateEditorialReviewR47';
const active=process.env.R47_COLD_PG16==='fictional-only'&&
 process.env.R47_PRIVATE_EDITORIAL_FIXTURE==='fictional-only';
const tests=active?describe:describe.skip;
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
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
type Escrow={
 signerPKCS8:string;
 reviewIds:Record<string,string>;
 keys:Array<{draft:{id:string;hex:string};review:{id:string;hex:string}}>;
};
let source:Escrow;
const subject=(memberId=A)=>({
 memberId,assertedBy:'server_verified_member_session' as const,
});
const admission={
 memberId:A,sessionBindingSHA256:sha('NEW fictional browser A session after restart'),
 consentNoticeSHA256:sha('fictional accepted first-writer notice'),
 consentEventSequence:4,activeWriter:true,
};
function auth(i:number,which:'draft'|'review',revokedWork?:string):R35Custody{
 const signer=createPrivateKey(source.signerPKCS8);
 const cp:DeletionHighwaterV1={
  protocol:'soullab.ws.deletion-highwater.v1',stream:'writers-studio-beta',
  generation:92,revokedWorks:revokedWork?[revokedWork]:[],revokedKeyIds:[],
 };
 const x=source.keys[i][which];
 return {key:{keyId:x.id,keyBytes:Buffer.from(x.hex,'hex')},
  signedDeletion:{checkpoint:cp,signature:sign(null,
   canonicalDeletionPayload(cp),signer).toString('base64')},
  trustedSigner:createPublicKey(signer),
  independent:{minimumGeneration:92},
 };
}
function read(i:number){
 return {subject:subject(),admission,workId:W[i],
  generation:1,reviewId:source.reviewIds[String(i)],
  draftCustody:auth(i,'draft'),privateCustody:auth(i,'review'),
 };
}
tests('R47 actual PostgreSQL restart + new process sealed editorial custody',()=>{
 beforeAll(()=>{
  const file=process.env.R47_FICTIONAL_ESCROW_PATH;
  if(!file||statSync(file).mode & 0o077)
   throw Error('r47_private_recovery_fixture_missing_or_permissive');
  source=JSON.parse(readFileSync(file,'utf8')) as Escrow;
  expect(source.keys).toHaveLength(4);
 });
 afterAll(async()=>{if(active)await closePool();});
 it('real author Apply remains disabled even in recovery',()=>{
  expect(R47_REAL_PRIVATE_EDITORIAL_ENABLED).toBe(false);
 });
 it('a new Node/browser session reopens original exact encrypted proposal',async()=>{
  const out=await reopenHeldPrivateReviewR47(read(0));
  expect(out).toMatchObject({kind:'HELD_PRIVATE_REVIEW_READ_ONLY',
   generation:1,releaseApproved:false,canApply:false,
   preview:{originalPassage:'lantern glows',proposedPassage:'lantern shimmers',
    sectionOrder:[S1,S2],untouchedSectionIds:[S2]}});
  const original=await reopenHeldDraftR35({
   subject:subject(),workId:W[0],generation:1,custody:auth(0,'draft'),
  });
  expect(original.sections.map(x=>x.id)).toEqual([S1,S2]);
  expect(original.content).toContain('First lantern glows. Second lantern glows.');
 });
 it('recovered ciphertext publication stays immutable, with exactly one row',async()=>{
  const v=await reopenHeldPrivateReviewR47(read(3));
  expect(v.preview.alternativeId).toBe('66666666-6666-4666-8666-666666666661');
  const again=await reconcileHeldPrivateReviewR47(read(3));
  expect(again).toMatchObject({status:'replayed',releaseApproved:false,canApply:false});
  const c=await query<{n:number}>(
   'SELECT count(*)::int n FROM writers_studio_r47_private_review WHERE work_id=$1',[W[3]]);
  expect(c.rows[0].n).toBe(1);
 });
 it('a reserved-only no-cipher file stays HELD across actual database restart',async()=>{
  await expect(reconcileHeldPrivateReviewR47(read(2)))
   .rejects.toHaveProperty('code','r47_reserved_missing_ciphertext_held');
  const c=await query<{state:string}>(
   'SELECT state FROM writers_studio_r47_private_review WHERE work_id=$1',[W[2]]);
  expect(c.rows).toEqual([{state:'reserved'}]);
 });
 it('wrong owner, revoked Work, changed consent and wrong private key refuse',async()=>{
  await expect(reopenHeldPrivateReviewR47({...read(0),
    subject:subject(B),admission:{...admission,memberId:B},
  })).rejects.toHaveProperty('code','r47_foreign_or_missing_private_review');
  await expect(reopenHeldPrivateReviewR47({...read(0),
    privateCustody:auth(0,'review',W[0]),
  })).rejects.toHaveProperty('code','deleted_work_refused');
  await expect(reopenHeldPrivateReviewR47({...read(0),
    admission:{...admission,consentEventSequence:5},
  })).rejects.toHaveProperty('code','r47_review_manifest_or_consent_mismatch');
  await expect(reopenHeldPrivateReviewR47({...read(0),
    privateCustody:auth(0,'draft'),
  })).rejects.toHaveProperty('code','r47_private_review_and_draft_keys_must_differ');
 });
});
