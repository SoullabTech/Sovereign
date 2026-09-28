import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runSyntheticRuntimeClosure } from '../../lib/ain/aether/runtime/runtimeProgrammeClosure';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-RUNTIME-01/r8');
mkdirSync(OUT,{recursive:true});

const closure=runSyntheticRuntimeClosure();

const evidence={
  generatedAt:new Date().toISOString(),
  closure,
};

writeFileSync(OUT+'/r8-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r8-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR7:closure.parentR7,
  invariantCount:closure.invariants.length,
  passingInvariants:closure.invariants.filter(i=>i.pass).length,
  allPass:closure.allPass,
  contradictionRefs:closure.contradictionRefs,
  standing:closure.standing,
  liveMemberDataAuthorized:closure.liveMemberDataAuthorized,
  persistenceAuthorized:closure.persistenceAuthorized,
  memberFacingDeliveryAuthorized:closure.memberFacingDeliveryAuthorized,
  deliveryExecuted:closure.deliveryExecuted,
  maiaPromptMutationAuthorized:closure.maiaPromptMutationAuthorized,
  networkSideEffect:closure.networkSideEffect,
  productionAuthority:closure.productionAuthority,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r8-summary.json','utf8')),null,2));