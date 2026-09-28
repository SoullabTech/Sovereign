import type { AetherConnectorQueryPlan } from '../queryPlan';
import {
  createHumanQueryPlanReview,
  fingerprintQueryPlan,
} from '../planReviewCustody';
import {
  consumeExecutionTokenWithoutExecution,
  issueExecutionToken,
  validateExecutionTokenForNextGate,
} from '../executionToken';

function plan():AetherConnectorQueryPlan{
  return {
    queryRef:'query:r5',
    connectorRef:'connector:r5',
    manifestRef:'manifest:r5',
    memberRef:'member:fixture',
    consentRef:'consent:r5',
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

function authorization(p:AetherConnectorQueryPlan){
  return {
    authorizationRef:'exec-auth:r5',
    actor:'human' as const,
    queryRef:p.queryRef,
    fingerprint:fingerprintQueryPlan(p),
    authorized:true,
    issuedAt:'2026-09-28T17:00:00-04:00',
    expiresAt:'2026-09-28T18:00:00-04:00',
    note:'Authorize this exact reviewed plan to cross the next design gate once.',
  };
}

describe('AIN-AETHER-CONNECTOR-01R5 execution token',()=>{
  test('issues one-shot token only for exact reviewed fingerprint plus fresh human authorization',()=>{
    const p=plan();
    const review=createHumanQueryPlanReview('review:r5',p,true,'Exact reviewed plan.');
    const result=issueExecutionToken(p,review,authorization(p));
    expect(result.issued).toBe(true);
    expect(result.token?.oneShot).toBe(true);
    expect(result.token?.consumed).toBe(false);
    expect(result.token?.executionEligible).toBe(true);
    expect(result.executionAuthorized).toBe(false);
    expect(result.recordReadExecuted).toBe(false);
    expect(result.recordCountRead).toBe(0);
  });

  test('refuses missing fresh execution authorization',()=>{
    const p=plan();
    const review=createHumanQueryPlanReview('review:r5:none',p,true,'Exact reviewed plan.');
    const result=issueExecutionToken(p,review,null);
    expect(result.issued).toBe(false);
    expect(result.errors).toContain('fresh_human_execution_authorization_required');
  });

  test('refuses authorization fingerprint drift',()=>{
    const p=plan();
    const review=createHumanQueryPlanReview('review:r5:drift',p,true,'Exact reviewed plan.');
    const auth=authorization(p);
    auth.fingerprint={...auth.fingerprint,digest:'0'.repeat(64)};
    const result=issueExecutionToken(p,review,auth);
    expect(result.issued).toBe(false);
    expect(result.errors).toContain('authorization_fingerprint_mismatch');
  });

  test('token expires fail-closed and never executes',()=>{
    const p=plan();
    const review=createHumanQueryPlanReview('review:r5:expiry',p,true,'Exact reviewed plan.');
    const token=issueExecutionToken(p,review,authorization(p)).token!;
    const result=validateExecutionTokenForNextGate(token,p,'2026-09-28T18:00:00-04:00');
    expect(result.usable).toBe(false);
    expect(result.errors).toContain('token_expired');
    expect(result.executorPresent).toBe(false);
    expect(result.executionOccurred).toBe(false);
    expect(result.recordReadExecuted).toBe(false);
  });

  test('consumed token cannot be reused and consumption performs no execution',()=>{
    const p=plan();
    const review=createHumanQueryPlanReview('review:r5:consume',p,true,'Exact reviewed plan.');
    const token=issueExecutionToken(p,review,authorization(p)).token!;
    const consumed=consumeExecutionTokenWithoutExecution(token);
    const result=validateExecutionTokenForNextGate(consumed,p,'2026-09-28T17:30:00-04:00');
    expect(result.usable).toBe(false);
    expect(result.errors).toContain('token_already_consumed');
    expect(consumed.executionOccurred).toBe(false);
    expect(consumed.recordReadExecuted).toBe(false);
    expect(consumed.recordCountRead).toBe(0);
  });

  test('execution token grants no persistence, delivery, prompt mutation, or production authority',()=>{
    const p=plan();
    const review=createHumanQueryPlanReview('review:r5:safe',p,true,'Exact reviewed plan.');
    const result=issueExecutionToken(p,review,authorization(p));
    expect(result.persistenceAuthorized).toBe(false);
    expect(result.memberFacingDeliveryAuthorized).toBe(false);
    expect(result.maiaPromptMutationAuthorized).toBe(false);
    expect(result.productionAuthority).toBe(false);
  });
});
