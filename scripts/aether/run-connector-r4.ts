import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  adjudicateReviewedQueryPlan,
  createHumanQueryPlanReview,
  fingerprintQueryPlan,
} from '../../lib/ain/aether/connector/planReviewCustody';
import type { AetherConnectorQueryPlan } from '../../lib/ain/aether/connector/queryPlan';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-CONNECTOR-01/r4');
mkdirSync(OUT,{recursive:true});

const plan:AetherConnectorQueryPlan={
  queryRef:'query:r4:witness',
  connectorRef:'connector:r4:witness',
  manifestRef:'manifest:r4:witness',
  memberRef:'member:fixture',
  consentRef:'consent:r4:witness',
  sourceClass:'member_authored_text',
  fields:['recordRef','memberRef','text','createdAt','domain'],
  startTime:'2026-09-01T00:00:00-04:00',
  endTime:'2026-09-29T00:00:00-04:00',
  maxRecords:25,
  wildcard:false,
  paginationAllowed:false,
  execute:false,
};

const fingerprint=fingerprintQueryPlan(plan);
const review=createHumanQueryPlanReview(
  'review:r4:witness',
  plan,
  true,
  'Approve this exact bounded query plan for future execution design review only.',
);
const exact=adjudicateReviewedQueryPlan(plan,review);
const drifted=adjudicateReviewedQueryPlan({
  ...plan,
  maxRecords:50,
},review);

const evidence={
  generatedAt:new Date().toISOString(),
  parentConnectorR3:'6ed9c1e998485f819bd35f9b33ac9f1aaa0fe326',
  plan,
  fingerprint,
  review,
  exact,
  drifted,
};

writeFileSync(OUT+'/r4-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r4-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentConnectorR3:evidence.parentConnectorR3,
  fingerprintAlgorithm:evidence.fingerprint.algorithm,
  canonicalVersion:evidence.fingerprint.canonicalVersion,
  fingerprintDigest:evidence.fingerprint.digest,
  reviewBound:evidence.exact.reviewBound,
  approvedForFutureExecutionDesign:evidence.exact.approvedForFutureExecutionDesign,
  executionAuthorized:evidence.exact.executionAuthorized,
  recordReadExecuted:evidence.exact.recordReadExecuted,
  recordCountRead:evidence.exact.recordCountRead,
  driftedReviewBound:evidence.drifted.reviewBound,
  driftedErrors:evidence.drifted.errors,
  persistenceAuthorized:evidence.exact.persistenceAuthorized,
  memberFacingDeliveryAuthorized:evidence.exact.memberFacingDeliveryAuthorized,
  maiaPromptMutationAuthorized:evidence.exact.maiaPromptMutationAuthorized,
  productionAuthority:evidence.exact.productionAuthority,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r4-summary.json','utf8')),null,2));