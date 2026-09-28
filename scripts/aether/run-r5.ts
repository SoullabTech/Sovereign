import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { AetherTrajectory, TrajectoryPattern } from '../../lib/ain/aether/benchmark/fieldTrajectory';
import { buildMultiSpiralField } from '../../lib/ain/aether/benchmark/multiSpiral';
import {
  compareMultiSpiralFields,
  generateCrossSpiralEmergence,
  validateCrossSpiralDynamics,
} from '../../lib/ain/aether/benchmark/crossSpiralDynamics';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-01/r5');
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
    supportingSignals:['r5-cross-spiral-witness'],
    confidence:.7,
    predictiveAuthority:false,
    destinyAuthority:false,
    developmentalRankAuthority:false,
    finalMeaningAuthority:'member',
    provisional:true,
  };
}

function makeField(ref:string,states:Record<string,TrajectoryPattern>){
  return buildMultiSpiralField(ref,Object.entries(states).map(([spiralRef,classification])=>({
    spiralRef,
    domain:spiralRef as any,
    trajectory:trajectory(spiralRef,classification),
  })));
}

const before=makeField('r5:before',{
  work:'ordinary_fluctuation',
  creative:'ordinary_fluctuation',
  family:'recurrence',
  relationship:'recurrence',
  spiritual:'sustained_convergence',
});

const after=makeField('r5:after',{
  work:'phase_change',
  creative:'sustained_convergence',
  family:'recurrence',
  relationship:'ordinary_fluctuation',
  spiritual:'dissolution',
});

const delta=compareMultiSpiralFields(before,after);
const candidates=generateCrossSpiralEmergence(delta);
const validation=validateCrossSpiralDynamics(delta,candidates);

const evidence={
  generatedAt:new Date().toISOString(),
  parentR4:'a2fbafb88c7e33af0082895266d95b1bfa40608c',
  before,
  after,
  delta,
  candidates,
  validation,
};

writeFileSync(OUT+'/r5-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r5-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR4:evidence.parentR4,
  newlyRelatedPairs:evidence.delta.newlyRelatedPairs,
  newlyIndependentPairs:evidence.delta.newlyIndependentPairs,
  changedRelationPairs:evidence.delta.changedRelationPairs,
  candidateCount:evidence.candidates.length,
  causalAuthority:evidence.delta.causalAuthority,
  predictiveAuthority:evidence.delta.predictiveAuthority,
  destinyAuthority:evidence.candidates.some(x=>x.destinyAuthority),
  memberOwnsFinalMeaning:evidence.delta.finalMeaningAuthority==='member',
  valid:evidence.validation.valid,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r5-summary.json','utf8')),null,2));
