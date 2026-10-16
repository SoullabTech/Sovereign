/**
 * R27 HELD prototype: permission recheck and external Work-level commit fence.
 *
 * No public route, real KMS, live permission or membership change. This
 * contract is valid only if an independently governed coordinator serializes
 * all same-Work revocations with all commits, across every app instance.
 * A fixture callback is NOT evidence that such a service exists.
 */
import type { NextRequest } from 'next/server';
import { reviewHeldWriterRequestR17 } from './heldWriterSessionReviewR17';
import {
  createHeldFixtureCustodianR26,
  type R26FictionalOutsideOperator,
} from './heldExternalCustodyAdapterR26';
import type { R26TrustRoots } from './externalCustodyContractR26';
import { persistHeldHistoryR23,type HeldHistoryR23 } from './heldVaultHistoryR23';
import type { WorkRecord } from './workEnvelopeV1';

export const R27_REAL_COMMIT_FENCE_ENABLED = false as const;
export const R27_HELD_PATH = '/api/sovereign/writers-studio/held-pair' as const;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Scope={memberId:string;workId:string;generation:number};
type FenceProof={
  readonly currentDeletionEpoch:number;
  readonly workActive:true;
};
/** Synthetic only: must hold lock until the persist callback has completed. */
export type R27FictionalCoordinator={
  readonly authority:'fictional_same_work_revocation_commit_lock';
  withWorkFence<T>(
    scope:Scope,
    work:(proof:FenceProof)=>Promise<T>,
  ):Promise<T>;
};
export type R27HeldWriterProviders={
  readonly outside:R26FictionalOutsideOperator;
  readonly pinnedRoots:R26TrustRoots;
  readonly trustedClock:()=>number;
  readonly coordinator:R27FictionalCoordinator;
};
export type R27Result=
  | {kind:'held_fixture_only';manifest:HeldHistoryR23}
  | {kind:'refused';status:400|401|403|404|405|503};
const refused=(status:400|401|403|404|405|503):R27Result=>({kind:'refused',status});
function acceptedWork(workId:unknown,generation:unknown):
  {workId:string;generation:number}|null{
  if(typeof workId!=='string'||!UUID.test(workId)||
     typeof generation!=='number'||!Number.isSafeInteger(generation)||
     generation<1)return null;
  return {workId:workId.toLowerCase(),generation};
}
function checkedFence(fence:FenceProof,epoch:number):boolean{
  return !!fence && fence.workActive===true &&
    Number.isSafeInteger(fence.currentDeletionEpoch)&&
    fence.currentDeletionEpoch>=1 &&
    Number.isSafeInteger(epoch)&&epoch>=1 &&
    fence.currentDeletionEpoch===epoch;
}
/**
 * An HTTP application may NEVER expose this fixture function. It only
 * qualifies that no save can proceed with permissions revoked after the
 * external key call, or a deletion epoch changed before the Work-level fence.
 */
export async function attemptHeldRevisionWithFenceR27(input:{
 request:NextRequest;workId:unknown;generation:unknown;
 records:readonly WorkRecord[];providers:R27HeldWriterProviders;
}):Promise<R27Result>{
 if(R27_REAL_COMMIT_FENCE_ENABLED!==false||
    process.env.R27_COMMIT_FENCE_FIXTURE!=='fictional-only'||
    process.env.R26_EXTERNAL_CUSTODY_FIXTURE!=='fictional-only'||
    process.env.R23_VAULT_HISTORY_FIXTURE!=='fictional-only')
      return refused(404);
 if(input.request.method.toUpperCase()!=='POST')
      return refused(405);
 const first=await reviewHeldWriterRequestR17(input.request);
 if(first.kind!=='held_only')return refused(first.status);
 const work=acceptedWork(input.workId,input.generation);
 if(!work||!Array.isArray(input.records)||input.records.length===0)
   return refused(400);
 const providers=input.providers;
 if(!providers || typeof providers.trustedClock!=='function' ||
    !providers.outside||!providers.pinnedRoots||
    !providers.coordinator ||
    providers.coordinator.authority!=='fictional_same_work_revocation_commit_lock'||
    typeof providers.coordinator.withWorkFence!=='function')
   return refused(503);
 const scope:Scope={memberId:first.subject.memberId, ...work};
 try{
   // Future real service MUST pin three trusted public roots out-of-band.
   const custodian=createHeldFixtureCustodianR26({
     outside:providers.outside,
     trustedPublicRoots:providers.pinnedRoots,
     trustedClock:providers.trustedClock,
   });
   // A key grant may pause here while a member withdraws or a Work is retired.
   const lease=await custodian.resolve({...scope,purpose:'append'});
   if(!lease||lease.scope.memberId!==scope.memberId||
      lease.scope.workId!==scope.workId||
      lease.scope.generation!==scope.generation||
      lease.scope.purpose!=='append'||
      !lease.trust.independent)return refused(503);
   // The test coordinator is an untrusted synthetic stand-in for a separately
   // administered distributed fence shared by all real Work revocations.
   return await providers.coordinator.withWorkFence(scope,async(fence)=>{
     const current=await reviewHeldWriterRequestR17(input.request);
     if(current.kind!=='held_only'||
        current.subject.memberId!==scope.memberId)
       return refused(403);
     if(!checkedFence(fence,lease.trust.independent!.minimumGeneration))
       return refused(403);
     const manifest=await persistHeldHistoryR23({
       subject:current.subject,manuscriptId:scope.workId,
       generation:scope.generation,records:input.records,
       authority:{
         key:lease.key,
         signedDeletion:lease.trust.signed,
         trustedSigner:lease.trust.signer,
         independent:lease.trust.independent,
       },
     });
     return {kind:'held_fixture_only',manifest};
   });
 }catch{
   // Provider failure, revocation-race or storage failure: no fallback, no
   // manuscript text, tokens or key bytes in the member-visible response.
   return refused(503);
 }
}
