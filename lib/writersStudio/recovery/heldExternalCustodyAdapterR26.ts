/**
 * R26 — fictional-only adaptation of signed Work-key authority into R23's
 * held vault interface. This module does NOT connect an external service.
 *
 * R23 must first obtain the member subject through R17 verified session,
 * active exact-writer invitation and accepted participation notice.
 * A future external KMS is a separate operator-approved release gate.
 */
import {randomBytes} from 'node:crypto';
import {WorkRecoveryRefusal,type WorkEncryptionKey} from './workEnvelopeV1';
import type {SignedDeletionHighwaterV1} from './deletionBarrierV1';
import type {R23FictionalCustodian,R23Scope} from './reviewVaultHistoryServiceR23';
import {
  R26_REAL_MEMBER_KEY_CUSTODY_ENABLED, verifyExternalCustodyR26,
  type R26Signed,type R26Lease,type R26Freshness,type R26TrustRoots,
} from './externalCustodyContractR26';

export const R26_REAL_HELD_KMS_ADAPTER_ENABLED = false as const;
export type R26HeldFixtureSignedMaterial = {
  readonly key:WorkEncryptionKey;
  readonly lease:R26Signed<R26Lease>;
  readonly freshness:R26Signed<R26Freshness>;
  readonly deletion:SignedDeletionHighwaterV1;
};
/**
 * No implementation that calls an actual network or managed KMS is provided.
 * Fixture signer may live in-process ONLY in synthetic qualification.
 */
export type R26FictionalOutsideOperator={
  readonly authority:'fabricated_r26_external_operator_test_only';
  resolve(scope:R23Scope,serverChallenge:string):Promise<R26HeldFixtureSignedMaterial>;
};
function refuse(code:string):never{throw new WorkRecoveryRefusal(code);}
export function createHeldFixtureCustodianR26(input:{
  readonly outside:R26FictionalOutsideOperator;
  readonly trustedPublicRoots:R26TrustRoots;
  readonly trustedClock:()=>number;
}):R23FictionalCustodian{
  if(!input || !input.outside ||
     input.outside.authority!=='fabricated_r26_external_operator_test_only' ||
     typeof input.outside.resolve!=='function' ||
     typeof input.trustedClock!=='function')
    refuse('r26_external_operator_not_configured');
  return {
    authority:'fixture_only_not_external_key_authority',
    resolve:async (scope:R23Scope)=>{
      if(R26_REAL_MEMBER_KEY_CUSTODY_ENABLED!==false ||
         R26_REAL_HELD_KMS_ADAPTER_ENABLED!==false ||
         process.env.R26_EXTERNAL_CUSTODY_FIXTURE!=='fictional-only')
        refuse('r26_real_member_key_service_disabled');
      const challenge=randomBytes(32).toString('hex');
      try{
        const raw=await input.outside.resolve(scope,challenge);
        if(!raw)refuse('r26_external_operator_no_grant');
        const accepted=verifyExternalCustodyR26({
          scope:{...scope,keyId:raw.key.keyId},serverChallenge:challenge,
          key:raw.key,lease:raw.lease,
          freshness:raw.freshness,deletion:raw.deletion,
          roots:input.trustedPublicRoots,nowMs:input.trustedClock(),
        });
        return {scope,key:accepted.key,trust:{
          signed:accepted.signedDeletion,signer:accepted.trustedSigner,
          independent:accepted.independent,
        }};
      }catch(e){
        if(e instanceof WorkRecoveryRefusal)throw e;
        // Never return remote response body, raw key, or provider exception.
        refuse('r26_external_custody_unavailable');
      }
    },
  };
}
