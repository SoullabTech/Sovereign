import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { AetherTrajectory, TrajectoryPattern } from '../../lib/ain/aether/benchmark/fieldTrajectory';
import { buildMultiSpiralField, summarizeDomainStates, validateMultiSpiralField } from '../../lib/ain/aether/benchmark/multiSpiral';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-01/r4');
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
    supportingSignals:['r4-multi-spiral-witness'],
    confidence:.7,
    predictiveAuthority:false,
    destinyAuthority:false,
    developmentalRankAuthority:false,
    finalMeaningAuthority:'member',
    provisional:true,
  };
}

const field=buildMultiSpiralField('member-field:r4',[
  {spiralRef:'relationship',domain:'relationship',trajectory:trajectory('relationship','oscillation')},
  {spiralRef:'work',domain:'work',trajectory:trajectory('work','phase_change')},
  {spiralRef:'family',domain:'family',trajectory:trajectory('family','recurrence')},
  {spiralRef:'creative',domain:'creative',trajectory:trajectory('creative','sustained_convergence')},
  {spiralRef:'body',domain:'body',trajectory:trajectory('body','ordinary_fluctuation')},
  {spiralRef:'spiritual',domain:'spiritual',trajectory:trajectory('spiritual','dissolution')},
]);

const validation=validateMultiSpiralField(field);
const domainStates=summarizeDomainStates(field);

const evidence={
  generatedAt:new Date().toISOString(),
  parentR3:'499fc344b9cccb8d96757a4497e1a9407adf5deb',
  field,
  domainStates,
  validation,
};

writeFileSync(OUT+'/r4-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r4-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR3:evidence.parentR3,
  spiralCount:evidence.field.spirals.length,
  domainStates:evidence.domainStates,
  relationCount:evidence.field.crossSpiralRelations.length,
  coConvergenceCount:evidence.field.crossSpiralRelations.filter(x=>x.kind==='co_convergence').length,
  timingMismatchCount:evidence.field.crossSpiralRelations.filter(x=>x.kind==='timing_mismatch').length,
  independentMovementCount:evidence.field.crossSpiralRelations.filter(x=>x.kind==='independent_movement').length,
  singleStageAuthority:evidence.field.singleStageAuthority,
  developmentalRankAuthority:evidence.field.developmentalRankAuthority,
  predictiveAuthority:evidence.field.predictiveAuthority,
  memberOwnsFinalMeaning:evidence.field.finalMeaningAuthority==='member',
  valid:evidence.validation.valid,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r4-summary.json','utf8')),null,2));
