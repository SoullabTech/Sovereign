/**
 * R48 — new Node OS process read-only reconciliation after a controlled PG16
 * restart, using ONLY a mode-0600 invented key/approval-token fixture.
 *
 * No private prose persisted in the escrow, log or SQL. Work keys and the raw
 * approval tokens are held only until the disposable fixture is removed.
 * Never instantiate on actual Work or a production database.
 */
import {createPublicKey} from 'node:crypto';
import {lstatSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {inspectSpentApplyR48} from '../../lib/writersStudio/recovery/heldSpentApplyEvidenceR48';
import {closePool} from '../../lib/db/postgres';
import type {R35Custody} from '../../lib/writersStudio/recovery/heldProtectedDraftR35';

if(process.env.R48_COLD_PROCESS_FIXTURE!=='fictional-only'||
 process.env.R48_PHYSICAL_PG16_FIXTURE!=='fictional-only'||
 process.env.R48_SPENT_APPLY_RECOVERY_FIXTURE!=='fictional-only'||
 process.env.R46_DURABLE_SIGNED_APPLY_FIXTURE!=='fictional-only')
 throw Error('R48_COLD_READ_PRODUCTION_DISABLED');
const loc=process.env.R48_COLD_FIXTURE_PATH||'';
const vault=process.env.FILE_STORAGE_PATH||'';
if(!path.isAbsolute(loc)||
    path.basename(loc)!=='r48-spent-apply-cold.json'||
    path.dirname(path.dirname(loc))!==tmpdir()||
    !path.basename(path.dirname(loc)).startsWith('ws-r35-physical-r48-')||
    path.dirname(vault)!==path.dirname(loc)||path.basename(vault)!=='vault')
 throw Error('R48_COLD_UNMARKED_ESCROW_REFUSED');
const info=lstatSync(loc);
if(!info.isFile()||(info.mode&0o077)!==0)
 throw Error('R48_COLD_ESCROW_MODE_OR_LINK_REFUSED');
type Entry={
 memberId:string;workId:string;approvalToken:string;
 issuerSecret:string;keyId:string;keyBytes:string;
 signedDeletion:R35Custody['signedDeletion'];
 publicSignerDER:string;independentMinGeneration:number;
 expected:'FICTIONAL_CIPHERTEXT_APPLY_CONFIRMED'|
 'HELD_SPENT_WITHOUT_MATCHING_RECEIPT';
};
type Fixture={
 protocol:'soullab.ws.r48.fictional-cold-reconciliation-fixture';
 entries:Entry[];
};
const fixture=JSON.parse(readFileSync(loc,'utf8')) as Fixture;
if(fixture.protocol!=='soullab.ws.r48.fictional-cold-reconciliation-fixture'||
 !Array.isArray(fixture.entries)||fixture.entries.length!==2)
 throw Error('R48_COLD_FIXTURE_SHAPE_REFUSED');
async function main(){
 try{
  const results:string[]=[];
  for(const entry of fixture.entries){
   const keyBytes=Buffer.from(entry.keyBytes,'base64');
   const issuer=Buffer.from(entry.issuerSecret,'base64');
   if(keyBytes.length!==32||issuer.length!==32||
     !entry.signedDeletion||entry.independentMinGeneration!==100)
    throw Error('R48_COLD_INVALID_SYNTHETIC_AUTHORITY');
   try{
    const custody:R35Custody={
     key:{keyId:entry.keyId,keyBytes},
     signedDeletion:entry.signedDeletion,
     trustedSigner:createPublicKey({
       key:Buffer.from(entry.publicSignerDER,'base64'),
       format:'der',type:'spki',
     }),
     independent:{minimumGeneration:entry.independentMinGeneration},
    };
    const r=await inspectSpentApplyR48({
     authority:'fictional_independent_recovery_custodian_only',
     memberId:entry.memberId,workId:entry.workId,
     approvalToken:entry.approvalToken,approvalIssuerSecret:issuer,
     custody,
    });
    const status=r.kind==='held_only'?r.reason:r.kind;
    if(status!==entry.expected||r.retryAuthorized!==false||
      r.releaseApproved!==false)
     throw Error('R48_COLD_RECOVERY_STATE_DOES_NOT_MATCH_ENCRYPTED_EVIDENCE');
    results.push(status);
   }finally{
    keyBytes.fill(0);issuer.fill(0);
   }
  }
  console.log(JSON.stringify({
   status:'R48_FRESH_PROCESS_SPENT_APPLY_READ_ONLY_PASS',
   confirmed:results.filter(x=>x==='FICTIONAL_CIPHERTEXT_APPLY_CONFIRMED').length,
   unresolved:results.filter(x=>x==='HELD_SPENT_WITHOUT_MATCHING_RECEIPT').length,
   retryAuthorized:false,releaseApproved:false,
  }));
 }finally{
  await closePool();
 }
}
main().catch(e=>{
 console.error('R48_COLD_RECONCILIATION_HOLD',
  e instanceof Error?e.message:'unknown');
 process.exitCode=2;
});
