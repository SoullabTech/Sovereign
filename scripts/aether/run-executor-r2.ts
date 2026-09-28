import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { AetherConnectorQueryPlan } from '../../lib/ain/aether/connector/queryPlan';
import {
  createHumanQueryPlanReview,
  fingerprintQueryPlan,
} from '../../lib/ain/aether/connector/planReviewCustody';
import { issueExecutionToken } from '../../lib/ain/aether/connector/executionToken';
import { executeOneLocalFixtureRecord } from '../../lib/ain/aether/executor/localFixtureExecutor';
import { adaptFixtureExecutionToLiveShadow } from '../../lib/ain/aether/executor/fixtureRecordShadowAdapter';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-EXECUTOR-01/r2');
mkdirSync(OUT,{recursive:true});

const plan:AetherConnectorQueryPlan={
  queryRef:'query:executor:r2:witness',
  connectorRef:'connector:executor:r2:witness',
  manifestRef:'manifest:executor:r2:witness',
  memberRef:'member:fixture',
  consentRef:'consent:executor:r2:witness',
  sourceClass:'member_authored_text',
  fields:['recordRef','memberRef','text','createdAt','domain'],
  startTime:'2026-09-01T00:00:00-04:00',
  endTime:'2026-09-29T00:00:00-04:00',
  maxRecords:1,
  wildcard:false,
  paginationAllowed:false,
  execute:false,
};

const review=createHumanQueryPlanReview(
  'review:executor:r2:witness',
  plan,
  true,
  'Exact max-1 fixture plan reviewed.',
);

const issued=issueExecutionToken(plan,review,{
  authorizationRef:'exec-auth:executor:r2:witness',
  actor:'human',
  queryRef:plan.queryRef,
  fingerprint:fingerprintQueryPlan(plan),
  authorized:true,
  issuedAt:'2026-09-28T18:00:00-04:00',
  expiresAt:'2026-09-28T20:00:00-04:00',
  note:'Authorize one local fixture record read.',
});
if(!issued.token) throw new Error('EXECUTOR_R2_TOKEN_NOT_ISSUED');

const execution=executeOneLocalFixtureRecord({
  transportRef:'transport:executor:r2:witness',
  transportKind:'local_fixture_only',
  productionReachable:false,
  networkEnabled:false,
  records:[{
    recordRef:'fixture-record:r2:witness',
    memberRef:'member:fixture',
    text:'A local fixture observation.',
    createdAt:'2026-09-28T12:00:00-04:00',
    domain:'work',
  }],
},issued.token,plan,'2026-09-28T18:30:00-04:00');

const consent={
  consentRef:'consent:executor:r2:witness',
  memberRef:'member:fixture',
  scope:'aether_read_once' as const,
  grantedBy:'member' as const,
  granted:true as const,
  purpose:'aether_reflection' as const,
  persistenceAllowed:false as const,
  deliveryAllowed:false as const,
  promptMutationAllowed:false as const,
  productionEscalationAllowed:false as const,
};

const binding={
  bindingRef:'binding:executor:r2:witness',
  consentRef:consent.consentRef,
  source:'member_authored' as const,
  temporalStanding:'has_been' as const,
  confidence:.8,
};

const adapted=adaptFixtureExecutionToLiveShadow(execution,binding,consent);

const evidence={
  generatedAt:new Date().toISOString(),
  parentExecutorR1:'ead4b3325e56c24f45b3a5a6e4f4aa1b49e1bfea',
  execution,
  binding,
  adapted,
};

writeFileSync(OUT+'/r2-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r2-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentExecutorR1:evidence.parentExecutorR1,
  fixtureExecuted:evidence.execution.executed,
  fixtureRecordRef:evidence.execution.record?.recordRef??null,
  adapted:evidence.adapted.adapted,
  shadowAdmitted:evidence.adapted.admission?.admitted??false,
  memberRefPreserved:evidence.adapted.memberRefPreserved,
  domainPreserved:evidence.adapted.domainPreserved,
  observationPreserved:evidence.adapted.observationPreserved,
  sourceStandingPreserved:evidence.adapted.sourceStandingPreserved,
  temporalStandingPreserved:evidence.adapted.temporalStandingPreserved,
  confidencePreserved:evidence.adapted.confidencePreserved,
  consentRefPreserved:evidence.adapted.consentRefPreserved,
  persisted:evidence.adapted.persisted,
  memberFacingDelivery:evidence.adapted.memberFacingDelivery,
  maiaPromptMutated:evidence.adapted.maiaPromptMutated,
  productionAuthority:evidence.adapted.productionAuthority,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r2-summary.json','utf8')),null,2));