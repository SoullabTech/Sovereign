import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runLiveAdapterFixtureClosure } from '../../lib/ain/aether/live/liveAdapterFixtureClosure';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-LIVE-ADAPTER-01/r6');
mkdirSync(OUT,{recursive:true});

const closure=runLiveAdapterFixtureClosure();

const evidence={
  generatedAt:new Date().toISOString(),
  closure,
};

writeFileSync(OUT+'/r6-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r6-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR5:closure.parentR5,
  invariantCount:closure.invariants.length,
  passingInvariants:closure.invariants.filter(i=>i.pass).length,
  allPass:closure.allPass,
  contradictionRefs:closure.contradictionRefs,
  standing:closure.standing,
  realConnectorAuthorized:closure.realConnectorAuthorized,
  realMemberDataRead:closure.realMemberDataRead,
  persistenceAuthorized:closure.persistenceAuthorized,
  memberFacingDeliveryAuthorized:closure.memberFacingDeliveryAuthorized,
  maiaPromptMutationAuthorized:closure.maiaPromptMutationAuthorized,
  networkSideEffect:closure.networkSideEffect,
  productionAuthority:closure.productionAuthority,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r6-summary.json','utf8')),null,2));