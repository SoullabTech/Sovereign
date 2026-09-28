import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createAetherConnectorDeclaration } from '../../lib/ain/aether/connector/connectorContract';
import { createSourceManifest } from '../../lib/ain/aether/connector/sourceManifest';
import { adjudicateQueryPlan } from '../../lib/ain/aether/connector/queryPlan';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-CONNECTOR-01/r3');
mkdirSync(OUT,{recursive:true});

const connector=createAetherConnectorDeclaration('connector:r3:witness',[
  'member_authored_text',
]);

const manifest=createSourceManifest('manifest:r3:witness',[{
  sourceClass:'member_authored_text',
  fields:[
    {field:'recordRef',purpose:'identify_source',required:true},
    {field:'memberRef',purpose:'bind_member_scope',required:true},
    {field:'text',purpose:'represent_observation',required:true},
    {field:'createdAt',purpose:'represent_time',required:true},
    {field:'domain',purpose:'represent_domain',required:true},
  ],
}]);

const consent={
  consentRef:'consent:r3:witness',
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

const bounded=adjudicateQueryPlan(connector,manifest,consent,{
  queryRef:'query:r3:witness',
  connectorRef:connector.connectorRef,
  manifestRef:manifest.manifestRef,
  memberRef:'member:fixture',
  consentRef:consent.consentRef,
  sourceClass:'member_authored_text',
  fields:['recordRef','memberRef','text','createdAt','domain'],
  startTime:'2026-09-01T00:00:00-04:00',
  endTime:'2026-09-29T00:00:00-04:00',
  maxRecords:25,
  wildcard:false,
  paginationAllowed:false,
  execute:false,
});

const unbounded=adjudicateQueryPlan(connector,manifest,consent,{
  queryRef:'query:r3:unbounded',
  connectorRef:connector.connectorRef,
  manifestRef:manifest.manifestRef,
  memberRef:'member:fixture',
  consentRef:consent.consentRef,
  sourceClass:'member_authored_text',
  fields:['recordRef','memberRef','text','createdAt','domain','email'],
  startTime:'2026-09-30T00:00:00-04:00',
  endTime:'2026-09-29T00:00:00-04:00',
  maxRecords:101,
  wildcard:true as false,
  paginationAllowed:true as false,
  execute:true as false,
});

const evidence={
  generatedAt:new Date().toISOString(),
  parentConnectorR2:'20f5d4c754c126da39f90d0585f55f06853fa996',
  bounded,
  unbounded,
};

writeFileSync(OUT+'/r3-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r3-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentConnectorR2:evidence.parentConnectorR2,
  boundedAllowed:evidence.bounded.allowed,
  boundedPlan:evidence.bounded.plan,
  zeroExecution:evidence.bounded.zeroExecution,
  recordReadExecuted:evidence.bounded.recordReadExecuted,
  recordCountRead:evidence.bounded.recordCountRead,
  unboundedAllowed:evidence.unbounded.allowed,
  unboundedErrors:evidence.unbounded.errors,
  persistenceAuthorized:evidence.bounded.persistenceAuthorized,
  memberFacingDeliveryAuthorized:evidence.bounded.memberFacingDeliveryAuthorized,
  maiaPromptMutationAuthorized:evidence.bounded.maiaPromptMutationAuthorized,
  productionAuthority:evidence.bounded.productionAuthority,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r3-summary.json','utf8')),null,2));