import { createHash } from 'node:crypto';
import type { AetherConnectorQueryPlan } from './queryPlan';

export interface QueryPlanFingerprint {
  algorithm:'sha256';
  canonicalVersion:'aether-query-plan-v1';
  digest:string;
}

export interface HumanQueryPlanReview {
  reviewRef:string;
  reviewer:'human';
  reviewedQueryRef:string;
  reviewedFingerprint:QueryPlanFingerprint;
  approved:boolean;
  note:string;
}

export interface QueryPlanReviewAdjudication {
  reviewBound:boolean;
  errors:string[];
  currentFingerprint:QueryPlanFingerprint;
  reviewedFingerprint:QueryPlanFingerprint|null;
  approvedForFutureExecutionDesign:boolean;
  executionAuthorized:false;
  recordReadExecuted:false;
  recordCountRead:0;
  persistenceAuthorized:false;
  memberFacingDeliveryAuthorized:false;
  maiaPromptMutationAuthorized:false;
  productionAuthority:false;
}

function canonicalQueryPlan(plan:AetherConnectorQueryPlan):string{
  return JSON.stringify({
    queryRef:plan.queryRef,
    connectorRef:plan.connectorRef,
    manifestRef:plan.manifestRef,
    memberRef:plan.memberRef,
    consentRef:plan.consentRef,
    sourceClass:plan.sourceClass,
    fields:[...plan.fields],
    startTime:plan.startTime,
    endTime:plan.endTime,
    maxRecords:plan.maxRecords,
    wildcard:plan.wildcard,
    paginationAllowed:plan.paginationAllowed,
    execute:plan.execute,
  });
}

export function fingerprintQueryPlan(
  plan:AetherConnectorQueryPlan,
):QueryPlanFingerprint{
  return {
    algorithm:'sha256',
    canonicalVersion:'aether-query-plan-v1',
    digest:createHash('sha256').update(canonicalQueryPlan(plan),'utf8').digest('hex'),
  };
}

export function createHumanQueryPlanReview(
  reviewRef:string,
  plan:AetherConnectorQueryPlan,
  approved:boolean,
  note:string,
):HumanQueryPlanReview{
  return {
    reviewRef,
    reviewer:'human',
    reviewedQueryRef:plan.queryRef,
    reviewedFingerprint:fingerprintQueryPlan(plan),
    approved,
    note,
  };
}

export function adjudicateReviewedQueryPlan(
  plan:AetherConnectorQueryPlan,
  review:HumanQueryPlanReview|null,
):QueryPlanReviewAdjudication{
  const errors:string[]=[];
  const currentFingerprint=fingerprintQueryPlan(plan);

  if(!review){
    errors.push('human_plan_review_required');
  } else {
    if(review.reviewer!=='human') errors.push('reviewer_not_human');
    if(review.reviewedQueryRef!==plan.queryRef) errors.push('review_query_ref_mismatch');
    if(review.reviewedFingerprint.algorithm!=='sha256') errors.push('review_fingerprint_algorithm_mismatch');
    if(review.reviewedFingerprint.canonicalVersion!=='aether-query-plan-v1'){
      errors.push('review_fingerprint_version_mismatch');
    }
    if(review.reviewedFingerprint.digest!==currentFingerprint.digest){
      errors.push('query_plan_fingerprint_mismatch');
    }
    if(review.approved!==true) errors.push('human_review_not_approved');
    if(!review.reviewRef.trim()) errors.push('review_ref_required');
    if(!review.note.trim()) errors.push('review_note_required');
  }

  return {
    reviewBound:errors.length===0,
    errors:[...new Set(errors)],
    currentFingerprint,
    reviewedFingerprint:review?.reviewedFingerprint??null,
    approvedForFutureExecutionDesign:errors.length===0,
    executionAuthorized:false,
    recordReadExecuted:false,
    recordCountRead:0,
    persistenceAuthorized:false,
    memberFacingDeliveryAuthorized:false,
    maiaPromptMutationAuthorized:false,
    productionAuthority:false,
  };
}
