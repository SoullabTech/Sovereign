import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { AetherConnectorQueryPlan } from '../../lib/ain/aether/connector/queryPlan';
import {
  createHumanQueryPlanReview,
  fingerprintQueryPlan,
} from '../../lib/ain/aether/connector/planReviewCustody';
import { issueExecutionToken } from '../../lib/ain/aether/connector/executionToken';
import { rehearseExecutionWithoutIo } from '../../lib/ain/aether/connector/executionRehearsalSink';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-CONNECTOR-01/r6');
mkdirSync(OUT,{recursive:true});

const plan:AetherConnectorQueryPlan={
  queryRef:'query:r6:witness',
  connectorRef:'connector:r6:witness',
  manifestRef:'manifest:r6:witness',
  memberRef:'member:fixture',
  consentRef:'consent:r6:witness',
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
  'review:r6:witness',
  plan,
  true,
  'Exact bounded plan reviewed.',
);

const issued=issueExecutionToken(plan,review,{
  authorizationRef:'exec-auth:r6:witness',
  actor:'human',
  queryRef:plan.queryRef,
  fingerprint:fingerprintQueryPlan(plan),
  authorized:true,
  issuedAt:'2026-09-28T17:00:00-04:00',
  expiresAt:'2026-09-28T18:00:00-04:00',
  note:'Authorize one inert execution rehearsal only.',
});

if(!issued.token) throw new Error('R6_EXECUTION_TOKEN_NOT_ISSUED');

const rehearsal=rehearseExecutionWithoutIo(
  issued.token,
  plan,
  '2026-09-28T17:30:00-04:00',
);

const expired=rehearseExecutionWithoutIo(
  issued.token,
  plan,
  '2026-09-28T18:00:00-04:00',
);

const drifted=rehearseExecutionWithoutIo(
  issued.token,
  {...plan,maxRecords:50},
  '2026-09-28T17:30:00-04:00',
);

const evidence={
  generatedAt:new Date().toISOString(),
  parentConnectorR5:'8e7826314e2d21f96561f5e388693c26b7ba5f48',
  plan,
  issued,
  rehearsal,
  expired,
  drifted,
};

writeFileSync(OUT+'/r6-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r6-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentConnectorR5:evidence.parentConnectorR5,
  rehearsed:evidence.rehearsal.rehearsed,
  tokenConsumed:evidence.rehearsal.receipt?.tokenConsumed??null,
  receiptFingerprint:evidence.rehearsal.receipt?.fingerprintDigest??null,
  tokenFingerprint:evidence.issued.token?.fingerprint.digest??null,
  connectorIoAttempted:evidence.rehearsal.receipt?.connectorIoAttempted??null,
  externalNetworkCall:evidence.rehearsal.receipt?.externalNetworkCall??null,
  executionOccurred:evidence.rehearsal.receipt?.executionOccurred??null,
  recordReadExecuted:evidence.rehearsal.receipt?.recordReadExecuted??null,
  recordCountRead:evidence.rehearsal.receipt?.recordCountRead??null,
  persisted:evidence.rehearsal.receipt?.persisted??null,
  memberFacingDelivery:evidence.rehearsal.receipt?.memberFacingDelivery??null,
  maiaPromptMutated:evidence.rehearsal.receipt?.maiaPromptMutated??null,
  productionAuthority:evidence.rehearsal.receipt?.productionAuthority??null,
  expiredRehearsed:evidence.expired.rehearsed,
  expiredErrors:evidence.expired.errors,
  driftedRehearsed:evidence.drifted.rehearsed,
  driftedErrors:evidence.drifted.errors,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r6-summary.json','utf8')),null,2));