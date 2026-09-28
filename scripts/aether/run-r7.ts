import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { AetherTrajectory, TrajectoryPattern } from '../../lib/ain/aether/benchmark/fieldTrajectory';
import { buildMultiSpiralField } from '../../lib/ain/aether/benchmark/multiSpiral';
import { deriveAethericGestalt } from '../../lib/ain/aether/benchmark/fieldOfFields';
import {
  applyGestaltCorrection,
  validateCorrectedGestalt,
} from '../../lib/ain/aether/benchmark/gestaltCorrection';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-01/r7');
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
    supportingSignals:['r7-corrigibility-witness'],
    confidence:.7,
    predictiveAuthority:false,
    destinyAuthority:false,
    developmentalRankAuthority:false,
    finalMeaningAuthority:'member',
    provisional:true,
  };
}

const field=buildMultiSpiralField('r7:field',[
  {spiralRef:'work',domain:'work',trajectory:trajectory('work','phase_change')},
  {spiralRef:'creative',domain:'creative',trajectory:trajectory('creative','sustained_convergence')},
  {spiralRef:'relationship',domain:'relationship',trajectory:trajectory('relationship','phase_change')},
  {spiralRef:'family',domain:'family',trajectory:trajectory('family','recurrence')},
  {spiralRef:'body',domain:'body',trajectory:trajectory('body','ordinary_fluctuation')},
  {spiralRef:'spiritual',domain:'spiritual',trajectory:trajectory('spiritual','dissolution')},
]);

const gestalt=deriveAethericGestalt(field);

const recognized=applyGestaltCorrection(field,gestalt,{
  correctionRef:'member:r7-recognize',
  kind:'recognize',
  targetGestaltRef:gestalt.gestaltRef,
  note:'Yes, this broadly feels true.',
  introducedBy:'member',
});

const rejected=applyGestaltCorrection(field,gestalt,{
  correctionRef:'member:r7-reject',
  kind:'reject',
  targetGestaltRef:gestalt.gestaltRef,
  note:'These domains do not form one pattern for me.',
  introducedBy:'member',
});

const narrowTarget=gestalt.participatingSpiralRefs[0];
const narrowed=applyGestaltCorrection(field,gestalt,{
  correctionRef:'member:r7-narrow',
  kind:'exclude_spiral',
  targetGestaltRef:gestalt.gestaltRef,
  spiralRef:narrowTarget,
  note:'That domain does not belong in this gestalt.',
  introducedBy:'member',
});

const expandTarget=gestalt.excludedSpiralRefs[0];
const expanded=applyGestaltCorrection(field,gestalt,{
  correctionRef:'member:r7-expand',
  kind:'include_spiral',
  targetGestaltRef:gestalt.gestaltRef,
  spiralRef:expandTarget,
  note:'This domain belongs in the larger pattern.',
  introducedBy:'member',
});

const evidence={
  generatedAt:new Date().toISOString(),
  parentR6:'619d8f18fe3ca8d637c2246516ab7c9bcef575aa',
  field,
  gestalt,
  recognized,
  rejected,
  narrowed,
  expanded,
  validation:{
    recognized:validateCorrectedGestalt(field,recognized),
    rejected:validateCorrectedGestalt(field,rejected),
    narrowed:validateCorrectedGestalt(field,narrowed),
    expanded:validateCorrectedGestalt(field,expanded),
  },
};

writeFileSync(OUT+'/r7-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r7-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR6:evidence.parentR6,
  originalParticipating:evidence.gestalt.participatingSpiralRefs,
  originalExcluded:evidence.gestalt.excludedSpiralRefs,
  recognized:evidence.recognized.recognition,
  rejected:evidence.rejected.recognition,
  rejectedStanding:evidence.rejected.active.standing,
  narrowedRecognition:evidence.narrowed.recognition,
  narrowedRemovedSpiral:narrowTarget,
  narrowedActive:evidence.narrowed.active.participatingSpiralRefs,
  expandedRecognition:evidence.expanded.recognition,
  expandedAddedSpiral:expandTarget,
  expandedActive:evidence.expanded.active.participatingSpiralRefs,
  sourceFieldPreserved:[
    evidence.recognized.sourceFieldPreserved,
    evidence.rejected.sourceFieldPreserved,
    evidence.narrowed.sourceFieldPreserved,
    evidence.expanded.sourceFieldPreserved,
  ].every(Boolean),
  relationHistoryPreserved:[
    evidence.recognized.relationHistoryPreserved,
    evidence.rejected.relationHistoryPreserved,
    evidence.narrowed.relationHistoryPreserved,
    evidence.expanded.relationHistoryPreserved,
  ].every(Boolean),
  memberOwnsFinalMeaning:[
    evidence.recognized.finalMeaningAuthority,
    evidence.rejected.finalMeaningAuthority,
    evidence.narrowed.finalMeaningAuthority,
    evidence.expanded.finalMeaningAuthority,
  ].every(x=>x==='member'),
  allValid:Object.values(evidence.validation).every(x=>x.valid),
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r7-summary.json','utf8')),null,2));
