import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runConnectorProgrammeClosure } from '../../lib/ain/aether/connector/connectorProgrammeClosure';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-CONNECTOR-01/r7');
mkdirSync(OUT,{recursive:true});

const closure=runConnectorProgrammeClosure();

const evidence={
  generatedAt:new Date().toISOString(),
  closure,
};

writeFileSync(OUT+'/r7-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r7-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR6:closure.parentR6,
  invariantCount:closure.invariants.length,
  passingInvariants:closure.invariants.filter(i=>i.pass).length,
  allPass:closure.allPass,
  contradictionRefs:closure.contradictionRefs,
  standing:closure.standing,
  realRecordReadCapability:closure.realRecordReadCapability,
  connectorExecutorImplemented:closure.connectorExecutorImplemented,
  externalIoAuthorized:closure.externalIoAuthorized,
  persistenceAuthorized:closure.persistenceAuthorized,
  memberFacingDeliveryAuthorized:closure.memberFacingDeliveryAuthorized,
  maiaPromptMutationAuthorized:closure.maiaPromptMutationAuthorized,
  productionAuthority:closure.productionAuthority,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r7-summary.json','utf8')),null,2));