import {
  adjudicateReviewedQueryPlan,
  createHumanQueryPlanReview,
  fingerprintQueryPlan,
} from '../planReviewCustody';
import type { AetherConnectorQueryPlan } from '../queryPlan';

function plan():AetherConnectorQueryPlan{
  return {
    queryRef:'query:r4',
    connectorRef:'connector:r4',
    manifestRef:'manifest:r4',
    memberRef:'member:fixture',
    consentRef:'consent:r4',
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

describe('AIN-AETHER-CONNECTOR-01R4 plan review custody',()=>{
  test('produces deterministic SHA-256 fingerprint for exact plan',()=>{
    const a=fingerprintQueryPlan(plan());
    const b=fingerprintQueryPlan({...plan(),fields:[...plan().fields]});
    expect(a.algorithm).toBe('sha256');
    expect(a.canonicalVersion).toBe('aether-query-plan-v1');
    expect(a.digest).toHaveLength(64);
    expect(a.digest).toBe(b.digest);
  });

  test('human review binds to exact reviewed fingerprint without authorizing execution',()=>{
    const p=plan();
    const review=createHumanQueryPlanReview(
      'review:r4',
      p,
      true,
      'Approve this exact bounded plan for future execution design review only.',
    );
    const result=adjudicateReviewedQueryPlan(p,review);
    expect(result.reviewBound).toBe(true);
    expect(result.approvedForFutureExecutionDesign).toBe(true);
    expect(result.executionAuthorized).toBe(false);
    expect(result.recordReadExecuted).toBe(false);
    expect(result.recordCountRead).toBe(0);
  });

  test('refuses post-review field drift',()=>{
    const p=plan();
    const review=createHumanQueryPlanReview('review:r4:fields',p,true,'Exact plan reviewed.');
    const mutated={...p,fields:[...p.fields,'email']};
    const result=adjudicateReviewedQueryPlan(mutated,review);
    expect(result.reviewBound).toBe(false);
    expect(result.errors).toContain('query_plan_fingerprint_mismatch');
  });

  test('refuses post-review time or cardinality drift',()=>{
    const p=plan();
    const review=createHumanQueryPlanReview('review:r4:bounds',p,true,'Exact bounds reviewed.');

    const timeDrift=adjudicateReviewedQueryPlan({
      ...p,
      endTime:'2026-10-30T00:00:00-04:00',
    },review);
    expect(timeDrift.errors).toContain('query_plan_fingerprint_mismatch');

    const cardinalityDrift=adjudicateReviewedQueryPlan({
      ...p,
      maxRecords:50,
    },review);
    expect(cardinalityDrift.errors).toContain('query_plan_fingerprint_mismatch');
  });

  test('human non-approval remains closed',()=>{
    const p=plan();
    const review=createHumanQueryPlanReview('review:r4:no',p,false,'Do not approve.');
    const result=adjudicateReviewedQueryPlan(p,review);
    expect(result.reviewBound).toBe(false);
    expect(result.errors).toContain('human_review_not_approved');
    expect(result.executionAuthorized).toBe(false);
  });

  test('review custody grants no side-effect authority',()=>{
    const p=plan();
    const review=createHumanQueryPlanReview('review:r4:safe',p,true,'Review only.');
    const result=adjudicateReviewedQueryPlan(p,review);
    expect(result.persistenceAuthorized).toBe(false);
    expect(result.memberFacingDeliveryAuthorized).toBe(false);
    expect(result.maiaPromptMutationAuthorized).toBe(false);
    expect(result.productionAuthority).toBe(false);
  });
});
