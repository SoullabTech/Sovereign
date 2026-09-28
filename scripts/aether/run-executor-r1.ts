import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { AetherConnectorQueryPlan } from '../../lib/ain/aether/connector/queryPlan';
import { createHumanQueryPlanReview, fingerprintQueryPlan } from '../../lib/ain/aether/connector/planReviewCustody';
import { issueExecutionToken } from '../../lib/ain/aether/connector/executionToken';
import { executeOneLocalFixtureRecord } from '../../lib/ain/aether/executor/localFixtureExecutor';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-EXECUTOR-01/r1');
mkdirSync(OUT,{recursive:true});

const plan:AetherConnectorQueryPlan={
  queryRef:'query:executor:r1:witness',
  connectorRef:'connector:executor:r1:witness',
  manifestRef:'manifest:executor:r1:witness',
  memberRef:'member:fixture',
  consentRef:'consent:executor:r1:witness',
  sourceClass:'member_authored_text',
  fields:['recordRef','memberRef','text','createdAt','domain'],
  startTime:'2026-09-01T00:00:00-04:00',
  endTime:'2026-09-29T00:00:00-04:00',
  maxRecords:1,
  wildcard:false,
  paginationAllowed:false,
  execute:false,
};

const review=createHumanQueryPlanReview('review:executor:r1:witness',plan,true,'Exact max-1 fixture plan reviewed.');
const issued=issueExecutionToken(plan,review,{
  authorizationRef:'exec-auth:executor:r1:witness',
  actor:'human',
  queryRef:plan.queryRef,
  fingerprint:fingerprintQueryPlan(plan),
  authorized:true,
  issuedAt:'2026-09-28T18:00:00-04:00',
  expiresAt:'2026-09-28T19:00:00-04:00',
  note:'Authorize one local fixture record read only.',
});
if(!issued.token) throw new Error('EXECUTOR_R1_TOKEN_NOT_ISSUED');

const result=executeOneLocalFixtureRecord({
  transportRef:'transport:executor:r1:witness',
  transportKind:'local_fixture_only',
  productionReachable:false,
  networkEnabled:false,
  records:[{
    recordRef:'fixture-record:r1:witness',
    memberRef:'member:fixture',
    text:'A local fixture observation.',
    createdAt:'2026-09-28T12:00:00-04:00',
    domain:'work',
  }],
},issued.token,plan,'2026-09-28T18:30:00-04:00');

const evidence={
  generatedAt:new Date().toISOString(),
  parentConnectorClosure:'ec65dc2ccd93a2d031a8168c7891c4624b06dd7d',
  plan,
  result,
};
writeFileSync(OUT+'/r1-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r1-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentConnectorClosure:evidence.parentConnectorClosure,
  executed:result.executed,
  recordRef:result.record?.recordRef??null,
  recordCountRead:result.receipt?.recordCountRead??0,
  tokenConsumed:result.consumedToken?.consumed??null,
  externalNetworkCall:result.receipt?.externalNetworkCall??null,
  productionReachable:result.receipt?.productionReachable??null,
  persisted:result.receipt?.persisted??null,
  memberFacingDelivery:result.receipt?.memberFacingDelivery??null,
  maiaPromptMutated:result.receipt?.maiaPromptMutated??null,
  productionAuthority:result.receipt?.productionAuthority??null,
},null,2)+'\n');
console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r1-summary.json','utf8')),null,2));