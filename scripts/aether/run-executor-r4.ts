import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runExecutorProgrammeClosure } from '../../lib/ain/aether/executor/executorProgrammeClosure';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-EXECUTOR-01/r4');
mkdirSync(OUT,{recursive:true});

const closure=runExecutorProgrammeClosure();

const evidence={generatedAt:new Date().toISOString(),closure};
writeFileSync(OUT+'/r4-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r4-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR3:closure.parentR3,
  invariantCount:closure.invariants.length,
  passingInvariants:closure.invariants.filter(i=>i.pass).length,
  allPass:closure.allPass,
  contradictionRefs:closure.contradictionRefs,
  standing:closure.standing,
  productionReachable:closure.productionReachable,
  externalNetworkCall:closure.externalNetworkCall,
  persistenceAuthorized:closure.persistenceAuthorized,
  memberFacingDeliveryAuthorized:closure.memberFacingDeliveryAuthorized,
  maiaPromptMutationAuthorized:closure.maiaPromptMutationAuthorized,
  productionAuthority:closure.productionAuthority,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r4-summary.json','utf8')),null,2));