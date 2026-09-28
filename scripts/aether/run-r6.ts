import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { AetherTrajectory, TrajectoryPattern } from '../../lib/ain/aether/benchmark/fieldTrajectory';
import { buildMultiSpiralField } from '../../lib/ain/aether/benchmark/multiSpiral';
import { deriveAethericGestalt, validateAethericGestalt } from '../../lib/ain/aether/benchmark/fieldOfFields';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-01/r6');
mkdirSync(OUT,{recursive:true});

function trajectory(ref:string,classification:TrajectoryPattern):AetherTrajectory{
  return {
    trajectoryRef:ref,
    moments:[
      {index:0,fieldRef:ref+':1',motifRefs:[],relationRefs:[]},
      {index:1,fieldRef:ref+':2',motifRefs:[],relationRefs:[]},
      {index:2,fieldRef:ref+':3',motifRefs:[],relationRefs:[]},
    ],
    deltas:[],
    classification,
    supportingSignals:['r6-field-of-fields-witness'],
    confidence:.7,
    predictiveAuthority:false,
    destinyAuthority:false,
    developmentalRankAuthority:false,
    finalMeaningAuthority:'member',
    provisional:true,
  };
}

const field=buildMultiSpiralField('r6:field',[
  {spiralRef:'work',domain:'work',trajectory:trajectory('work','phase_change')},
  {spiralRef:'creative',domain:'creative',trajectory:trajectory('creative','sustained_convergence')},
  {spiralRef:'relationship',domain:'relationship',trajectory:trajectory('relationship','phase_change')},
  {spiralRef:'family',domain:'family',trajectory:trajectory('family','recurrence')},
  {spiralRef:'body',domain:'body',trajectory:trajectory('body','ordinary_fluctuation')},
  {spiralRef:'spiritual',domain:'spiritual',trajectory:trajectory('spiritual','dissolution')},
]);

const gestalt=deriveAethericGestalt(field);
const validation=validateAethericGestalt(field,gestalt);

const evidence={
  generatedAt:new Date().toISOString(),
  parentR5:'496d185efcf111271de34a47361ef6be805c6e2a',
  field,
  gestalt,
  validation,
};

writeFileSync(OUT+'/r6-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r6-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR5:evidence.parentR5,
  standing:evidence.gestalt.standing,
  participatingSpiralRefs:evidence.gestalt.participatingSpiralRefs,
  excludedSpiralRefs:evidence.gestalt.excludedSpiralRefs,
  supportingRelationCount:evidence.gestalt.supportingRelationRefs.length,
  excludedRelationCount:evidence.gestalt.excludedRelationRefs.length,
  preservesNonfit:evidence.gestalt.preservesNonfit,
  totalizingAuthority:evidence.gestalt.totalizingAuthority,
  identityAuthority:evidence.gestalt.identityAuthority,
  causalAuthority:evidence.gestalt.causalAuthority,
  predictiveAuthority:evidence.gestalt.predictiveAuthority,
  destinyAuthority:evidence.gestalt.destinyAuthority,
  developmentalRankAuthority:evidence.gestalt.developmentalRankAuthority,
  soulRepresentationAuthority:evidence.gestalt.soulRepresentationAuthority,
  memberOwnsFinalMeaning:evidence.gestalt.finalMeaningAuthority==='member',
  valid:evidence.validation.valid,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r6-summary.json','utf8')),null,2));
