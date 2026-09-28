import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { AetherConnectorQueryPlan } from '../../lib/ain/aether/connector/queryPlan';
import {
  createHumanQueryPlanReview,
  fingerprintQueryPlan,
} from '../../lib/ain/aether/connector/planReviewCustody';
import {
  consumeExecutionTokenWithoutExecution,
  issueExecutionToken,
  validateExecutionTokenForNextGate,
} from '../../lib/ain/aether/connector/executionToken';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-CONNECTOR-01/r5');
mkdirSync(OUT,{recursive:true});

const plan:AetherConnectorQueryPlan={
  queryRef:'query:r5:witness',
  connectorRef:'connector:r5:witness',
  manifestRef:'manifest:r5:witness',
  memberRef:'member:fixture',
  consentRef:'consent:r5:witness',
  sourceClass:'member_authored_text',
  fields:['recordRef','memberRef','text','createdAt','domain'],
  startTime:'2026-09-01T00:00:00-04:00',
  endTime:'2026-09-29T00:00:00-04:00',
  maxRecords:25,
  wildcard:false,
  paginationAllowed:false,
  execute:false,
};

const review=createHumanQueryPlanReview(
  'review:r5:witness',
  plan,
  true,
  'Exact bounded plan approved for execution-token design only.',
);

const authorization={
  authorizationRef:'exec-auth:r5:witness',
  actor:'human' as const,
  queryRef:plan.queryRef,
  fingerprint:fingerprintQueryPlan(plan),
  authorized:true,
  issuedAt:'2026-09-28T17:00:00-04:00',
  expiresAt:'2026-09-28T18:00:00-04:00',
  note:'Authorize this exact reviewed plan to cross the next design gate once.',
};

const issued=issueExecutionToken(plan,review,authorization);
if(!issued.token) throw new Error('R5_EXECUTION_TOKEN_NOT_ISSUED');

const preExpiry=validateExecutionTokenForNextGate(
  issued.token,
  plan,
  '2026-09-28T17:30:00-04:00',
);

const expired=validateExecutionTokenForNextGate(
  issued.token,
  plan,
  '2026-09-28T18:00:00-04:00',
);

const consumedToken=consumeExecutionTokenWithoutExecution(issued.token);
const afterConsume=validateExecutionTokenForNextGate(
  consumedToken,
  plan,
  '2026-09-28T17:30:00-04:00',
);

const evidence={
  generatedAt:new Date().toISOString(),
  parentConnectorR4:'11432108863db88231dfb036166a51057988b9d1',
  plan,
  review,
  authorization,
  issued,
  preExpiry,
  expired,
  consumedToken,
  afterConsume,
};

writeFileSync(OUT+'/r5-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r5-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentConnectorR4:evidence.parentConnectorR4,
  tokenIssued:evidence.issued.issued,
  tokenRef:evidence.issued.token?.tokenRef??null,
  tokenQueryRef:evidence.issued.token?.queryRef??null,
  tokenFingerprint:evidence.issued.token?.fingerprint.digest??null,
  tokenOneShot:evidence.issued.token?.oneShot??null,
  tokenConsumedInitially:evidence.issued.token?.consumed??null,
  tokenExecutionEligibleInitially:evidence.issued.token?.executionEligible??null,
  preExpiryUsable:evidence.preExpiry.usable,
  expiredUsable:evidence.expired.usable,
  expiredErrors:evidence.expired.errors,
  consumed:evidence.consumedToken.consumed,
  executionEligibleAfterConsume:evidence.consumedToken.executionEligible,
  afterConsumeUsable:evidence.afterConsume.usable,
  afterConsumeErrors:evidence.afterConsume.errors,
  executionAuthorized:evidence.issued.executionAuthorized,
  recordReadExecuted:evidence.issued.recordReadExecuted,
  recordCountRead:evidence.issued.recordCountRead,
  persistenceAuthorized:evidence.issued.persistenceAuthorized,
  memberFacingDeliveryAuthorized:evidence.issued.memberFacingDeliveryAuthorized,
  maiaPromptMutationAuthorized:evidence.issued.maiaPromptMutationAuthorized,
  productionAuthority:evidence.issued.productionAuthority,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r5-summary.json','utf8')),null,2));