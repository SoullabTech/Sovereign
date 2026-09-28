import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  adjudicateConnectorDryRun,
  createAetherConnectorDeclaration,
} from '../../lib/ain/aether/connector/connectorContract';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-CONNECTOR-01/r1');
mkdirSync(OUT,{recursive:true});

const connector=createAetherConnectorDeclaration('connector:r1:witness',[
  'member_authored_text',
  'system_observed_event',
]);

const consent={
  consentRef:'consent:connector:r1:witness',
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

const dryRun=adjudicateConnectorDryRun(connector,consent,{
  dryRunRef:'dry:r1:witness',
  memberRef:'member:fixture',
  consentRef:consent.consentRef,
  requestedSourceClasses:['member_authored_text'],
  executeRecordRead:false,
});

const forbiddenRead=adjudicateConnectorDryRun(connector,consent,{
  dryRunRef:'dry:r1:forbidden-read',
  memberRef:'member:fixture',
  consentRef:consent.consentRef,
  requestedSourceClasses:['member_authored_text'],
  executeRecordRead:true,
});

const evidence={
  generatedAt:new Date().toISOString(),
  parentFixtureClosure:'e775aed82695fc11fa7928071b6a89d5e6f87221',
  connector,
  dryRun,
  forbiddenRead,
};

writeFileSync(OUT+'/r1-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r1-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentFixtureClosure:evidence.parentFixtureClosure,
  connectorRef:evidence.connector.connectorRef,
  declaredSourceClasses:evidence.connector.sourceClasses,
  recordReadImplemented:evidence.connector.recordReadImplemented,
  dryRunAllowed:evidence.dryRun.allowed,
  dryRunOnly:evidence.dryRun.dryRunOnly,
  recordReadExecuted:evidence.dryRun.recordReadExecuted,
  recordCountRead:evidence.dryRun.recordCountRead,
  forbiddenReadAllowed:evidence.forbiddenRead.allowed,
  forbiddenReadErrors:evidence.forbiddenRead.errors,
  persistenceAuthorized:evidence.dryRun.persistenceAuthorized,
  memberFacingDeliveryAuthorized:evidence.dryRun.memberFacingDeliveryAuthorized,
  maiaPromptMutationAuthorized:evidence.dryRun.maiaPromptMutationAuthorized,
  productionAuthority:evidence.dryRun.productionAuthority,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r1-summary.json','utf8')),null,2));