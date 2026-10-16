/**
 * R48 separate Node process: both R47 encrypted private proposal and R46
 * token-specific spent Apply proof reopen after disposable PostgreSQL restart.
 * The only escrow is mode-0600 fabricated test key metadata; never real keys.
 */
import {createPublicKey} from 'node:crypto';
import {readFileSync,lstatSync} from 'node:fs';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {closePool} from '../../lib/db/postgres';
import {inspectPrivateChoiceApplyR48}
 from '../../lib/writersStudio/recovery/heldEditorialRecoveryJoinR48';
import type {R35Custody} from '../../lib/writersStudio/recovery/heldProtectedDraftR35';

const flags=[
 'R48_COLD_PROCESS_FIXTURE','R48_EDITORIAL_JOIN_FIXTURE',
 'R47_PRIVATE_EDITORIAL_FIXTURE','R48_SPENT_APPLY_RECOVERY_FIXTURE',
 'R48_PHYSICAL_PG16_FIXTURE',
];
if(flags.some(f=>process.env[f]!=='fictional-only'))
 throw Error('R48_JOINED_COLD_DISABLED');
const file=process.env.R48_JOINED_COLD_FIXTURE_PATH||'';
const vault=process.env.FILE_STORAGE_PATH||'';
if(!path.isAbsolute(file)||
   path.basename(file)!=='r48-joined-cold.json'||
   path.dirname(path.dirname(file))!==tmpdir()||
   !path.basename(path.dirname(file)).startsWith('ws-r35-physical-r48-')||
   path.dirname(file)!==path.dirname(vault)||path.basename(vault)!=='vault')
 throw Error('R48_UNVERIFIED_FAKE_KEY_FIXTURE_PATH');
const info=lstatSync(file);
if(!info.isFile()||(info.mode&0o077)!==0)
 throw Error('R48_FAKE_KEY_FIXTURE_PERMISSIONS');
type Stored={
 protocol:'soullab.ws.r48.fictional-joined-private-recovery.v1';
 memberId:string;workId:string;reviewId:string;generation:number;
 approvalToken:string;admission:{
  memberId:string;sessionBindingSHA256:string;consentNoticeSHA256:string;
  consentEventSequence:number;activeWriter:true;
 };
 issuerSecret:string;draftKeyId:string;draftKey:string;
 privateKeyId:string;privateKey:string;
 signedDeletion:R35Custody['signedDeletion'];
 publicSignerDER:string;independentMinimum:number;
};
const saved=JSON.parse(readFileSync(file,'utf8')) as Stored;
if(saved.protocol!=='soullab.ws.r48.fictional-joined-private-recovery.v1'||
   saved.independentMinimum!==100||saved.generation!==1)
 throw Error('R48_UNTRUSTED_TEST_ESCROW');
const draft=Buffer.from(saved.draftKey,'base64');
const privateKey=Buffer.from(saved.privateKey,'base64');
const issuer=Buffer.from(saved.issuerSecret,'base64');
if(draft.length!==32||privateKey.length!==32||issuer.length!==32||
   !saved.signedDeletion||saved.privateKeyId===saved.draftKeyId)
 throw Error('R48_FAKE_KEY_SCOPE_REFUSED');

async function main(){
 try{
  const signer=createPublicKey({
   key:Buffer.from(saved.publicSignerDER,'base64'),
   format:'der',type:'spki',
  });
  const wrap=(keyId:string,keyBytes:Buffer):R35Custody=>({
   key:{keyId,keyBytes},signedDeletion:saved.signedDeletion,
   trustedSigner:signer,
   independent:{minimumGeneration:saved.independentMinimum},
  });
  const current=()=>({
   originalReview:{
    subject:{memberId:saved.memberId,
      assertedBy:'server_verified_member_session' as const},
    admission:saved.admission,
    workId:saved.workId,reviewId:saved.reviewId,
    generation:saved.generation,draftCustody:wrap(saved.draftKeyId,draft),
    privateCustody:wrap(saved.privateKeyId,privateKey),
   },
   spentApply:{
    authority:'fictional_independent_recovery_custodian_only' as const,
    memberId:saved.memberId,workId:saved.workId,
    approvalToken:saved.approvalToken,approvalIssuerSecret:issuer,
    custody:wrap(saved.draftKeyId,draft),
   },
  });
  const matched=await inspectPrivateChoiceApplyR48(current());
  if(matched.kind!=='FICTIONAL_PRIVATE_CHOICE_APPLY_VERIFIED'||
    matched.generation!==2||matched.releaseApproved!==false||
    matched.retryAuthorized!==false)
   throw Error('R48_SINGLE_WORK_PRIVATE_APPLY_COLD_MISMATCH');
  const wrong=current();
  wrong.originalReview.privateCustody=wrap(
   saved.privateKeyId,Buffer.alloc(32,0x99));
  const refused=await inspectPrivateChoiceApplyR48(wrong);
  if(refused.kind!=='held_only'||refused.retryAuthorized!==false||
     refused.releaseApproved!==false)
   throw Error('R48_WRONG_PRIVATE_KEY_DID_NOT_HOLD');
  const stale=current();
  stale.originalReview.admission={
   ...saved.admission,
   consentEventSequence:saved.admission.consentEventSequence+1,
  };
  const withdrawn=await inspectPrivateChoiceApplyR48(stale);
  if(withdrawn.kind!=='held_only'||withdrawn.retryAuthorized!==false)
   throw Error('R48_CONSENT_EPOCH_REPLAYED');
  console.log(JSON.stringify({
   status:'R48_FRESH_PROCESS_JOINED_PRIVATE_AND_APPLY_PASS',
   verified:1,wrongKeyHeld:true,changedConsentHeld:true,
   retryAuthorized:false,releaseApproved:false,
  }));
 }finally{
  draft.fill(0);privateKey.fill(0);issuer.fill(0);
  await closePool();
 }
}
main().catch(error=>{
 console.error('R48_JOINED_COLD_HOLD',
   error instanceof Error?error.message:'unknown');
 process.exitCode=2;
});
