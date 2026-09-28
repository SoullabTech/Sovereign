import type { AetherConnectorQueryPlan } from '../queryPlan';
import {
  createHumanQueryPlanReview,
  fingerprintQueryPlan,
} from '../planReviewCustody';
import { issueExecutionToken } from '../executionToken';
import { rehearseExecutionWithoutIo } from '../executionRehearsalSink';

function plan():AetherConnectorQueryPlan{
  return {
    queryRef:'query:r6',
    connectorRef:'connector:r6',
    manifestRef:'manifest:r6',
    memberRef:'member:fixture',
    consentRef:'consent:r6',
    sourceClass:'member_authored_text',
    fields:['recordRef','memberRef','text','createdAt','domain'],
    startTime:'2026-09-01T00:00:00-04:00',
    endTime:'2026-09-29T00:00:00-04:00',
    maxRecords:25,
    wildcard:false,
    paginationAllowed:false,
    execute:false,
  };
}

function token(){
  const p=plan();
  const review=createHumanQueryPlanReview('review:r6',p,true,'Exact reviewed plan.');
  const issued=issueExecutionToken(p,review,{
    authorizationRef:'exec-auth:r6',
    actor:'human',
    queryRef:p.queryRef,
    fingerprint:fingerprintQueryPlan(p),
    authorized:true,
    issuedAt:'2026-09-28T17:00:00-04:00',
    expiresAt:'2026-09-28T18:00:00-04:00',
    note:'Authorize one inert execution rehearsal only.',
  });
  if(!issued.token) throw new Error('token not issued');
  return issued.token;
}

describe('AIN-AETHER-CONNECTOR-01R6 execution rehearsal sink',()=>{
  test('consumes valid token into zero-IO rehearsal receipt',()=>{
    const p=plan();
    const result=rehearseExecutionWithoutIo(token(),p,'2026-09-28T17:30:00-04:00');
    expect(result.rehearsed).toBe(true);
    expect(result.consumedToken?.consumed).toBe(true);
    expect(result.consumedToken?.executionEligible).toBe(false);
    expect(result.receipt?.sink).toBe('zero_io_rehearsal');
    expect(result.receipt?.tokenConsumed).toBe(true);
  });

  test('receipt preserves exact reviewed fingerprint',()=>{
    const p=plan();
    const t=token();
    const result=rehearseExecutionWithoutIo(t,p,'2026-09-28T17:30:00-04:00');
    expect(result.receipt?.fingerprintDigest).toBe(t.fingerprint.digest);
    expect(result.receipt?.queryRef).toBe(p.queryRef);
    expect(result.receipt?.tokenRef).toBe(t.tokenRef);
  });

  test('rehearsal performs zero connector IO and zero record reads',()=>{
    const result=rehearseExecutionWithoutIo(token(),plan(),'2026-09-28T17:30:00-04:00');
    const receipt=result.receipt!;
    expect(receipt.connectorIoAttempted).toBe(false);
    expect(receipt.externalNetworkCall).toBe(false);
    expect(receipt.executionOccurred).toBe(false);
    expect(receipt.recordReadExecuted).toBe(false);
    expect(receipt.recordCountRead).toBe(0);
  });

  test('rehearsal produces no persistence, delivery, prompt mutation, or production authority',()=>{
    const receipt=rehearseExecutionWithoutIo(token(),plan(),'2026-09-28T17:30:00-04:00').receipt!;
    expect(receipt.persisted).toBe(false);
    expect(receipt.memberFacingDelivery).toBe(false);
    expect(receipt.maiaPromptMutated).toBe(false);
    expect(receipt.productionAuthority).toBe(false);
  });

  test('expired token is refused without consumption or receipt',()=>{
    const result=rehearseExecutionWithoutIo(token(),plan(),'2026-09-28T18:00:00-04:00');
    expect(result.rehearsed).toBe(false);
    expect(result.errors).toContain('token_expired');
    expect(result.consumedToken).toBeNull();
    expect(result.receipt).toBeNull();
  });

  test('plan drift is refused before rehearsal',()=>{
    const p=plan();
    const t=token();
    const drifted={...p,maxRecords:50};
    const result=rehearseExecutionWithoutIo(t,drifted,'2026-09-28T17:30:00-04:00');
    expect(result.rehearsed).toBe(false);
    expect(result.errors).toContain('token_fingerprint_mismatch');
    expect(result.receipt).toBeNull();
  });
});
