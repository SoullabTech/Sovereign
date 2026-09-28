import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { LiveShadowObservation } from '../../lib/ain/aether/live/liveInputContract';
import { replayExecutorOriginShadows } from '../../lib/ain/aether/executor/executorOriginRuntimeReplay';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-EXECUTOR-01/r3');
mkdirSync(OUT,{recursive:true});

function shadow(inputRef:string,domain:string):LiveShadowObservation{
  return {
    inputRef,
    memberRef:'member:fixture',
    source:'member_authored',
    domain,
    observation:'A shared movement toward greater openness.',
    temporalStanding:'is_being',
    confidence:.8,
    consentRef:'consent:executor:r3',
    readOnly:true,
    persisted:false,
    delivered:false,
    maiaPromptMutated:false,
    productionAuthority:false,
    identityAuthority:false,
    diagnosticAuthority:false,
    predictiveAuthority:false,
    destinyAuthority:false,
    soulRepresentationAuthority:false,
    finalMeaningAuthority:'member',
  };
}

const replay=replayExecutorOriginShadows('executor-r3:witness',[
  {
    shadow:shadow('shadow:record:r3:work','work'),
    origin:{
      recordRef:'record:r3:work',
      executorReceiptRef:'receipt:r3:work',
      transportRef:'transport:work',
      transportKind:'local_fixture_only',
      externalNetworkCall:false,
      productionReachable:false,
    },
  },
  {
    shadow:shadow('shadow:record:r3:creative','creative'),
    origin:{
      recordRef:'record:r3:creative',
      executorReceiptRef:'receipt:r3:creative',
      transportRef:'transport:creative',
      transportKind:'local_fixture_only',
      externalNetworkCall:false,
      productionReachable:false,
    },
  },
]);

const evidence={
  generatedAt:new Date().toISOString(),
  parentExecutorR2:'6d4787355ba3a60ad0b841bf9e3fc401ac32d976',
  replay,
};

writeFileSync(OUT+'/r3-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r3-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentExecutorR2:evidence.parentExecutorR2,
  replayed:replay.replayed,
  executorOriginCount:replay.executorOriginCount,
  projectedCount:replay.projectedCount,
  adaptedCount:replay.adaptedCount,
  fieldDerived:replay.fieldDerived,
  reflectionGenerated:replay.reflectionGenerated,
  humanGatePassed:replay.humanGatePassed,
  noOpSimulationPassed:replay.noOpSimulationPassed,
  originRecordsPreserved:replay.originRecordsPreserved,
  originReceiptsPreserved:replay.originReceiptsPreserved,
  originTransportsPreserved:replay.originTransportsPreserved,
  externalNetworkCall:replay.externalNetworkCall,
  persisted:replay.persisted,
  memberFacingContacted:replay.memberFacingContacted,
  deliveryExecuted:replay.deliveryExecuted,
  maiaPromptMutated:replay.maiaPromptMutated,
  productionAuthority:replay.productionAuthority,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r3-summary.json','utf8')),null,2));