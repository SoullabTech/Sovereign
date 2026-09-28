import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { deriveMemberAetherField, type MemberFieldObservation } from '../../lib/ain/aether/benchmark/memberField';
import { deriveFieldTrajectory, validateAetherTrajectory } from '../../lib/ain/aether/benchmark/fieldTrajectory';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-01/r3');
mkdirSync(OUT,{recursive:true});

function o(ref:string,facet:string,motif:string,qualities:any[]=['resonance']):MemberFieldObservation{
  return {observationRef:ref,facetRef:facet,motif,temporalStanding:'is_being',standing:'member_named',qualities,note:ref};
}
function f(ref:string,obs:MemberFieldObservation[]){
  return deriveMemberAetherField(ref,obs);
}

const moments=[
  f('r3:t1',[
    o('g1','journal','Grief',['tension']),
    o('f1','journal','Fear',['tension']),
    o('i1','relationship','Isolation',['tension']),
  ]),
  f('r3:t2',[
    o('g2','journal','Grief',['tension']),
    o('f2','relationship','Fear',['tension']),
    o('m2','journal','Memory',['resonance']),
  ]),
  f('r3:t3',[
    o('g3','journal','Grief',['resonance']),
    o('g4','creative','Grief',['resonance']),
    o('m3','journal','Memory',['resonance']),
    o('l3','relationship','Love',['resonance']),
  ]),
  f('r3:t4',[
    o('g5','journal','Grief',['resonance']),
    o('g6','creative','Grief',['resonance']),
    o('m4','journal','Memory',['resonance']),
    o('l4','relationship','Love',['resonance']),
    o('c4','creative','Creativity',['resonance']),
  ]),
];

const trajectory=deriveFieldTrajectory('r3:phase-witness',moments);
const validation=validateAetherTrajectory(trajectory);

const recurrence=deriveFieldTrajectory('r3:recurrence',[
  f('rr1',[o('rg1','journal','Grief'),o('rm1','journal','Memory')]),
  f('rr2',[o('rl1','relationship','Love'),o('rm2','journal','Memory')]),
  f('rr3',[o('rg2','creative','Grief'),o('rm3','journal','Memory')]),
]);

const evidence={
  generatedAt:new Date().toISOString(),
  parentR2:'23c83ccc895af27037a43d405ce80a32db0649a6',
  trajectory,
  validation,
  recurrence,
};

writeFileSync(OUT+'/r3-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r3-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR2:evidence.parentR2,
  momentCount:evidence.trajectory.moments.length,
  classification:evidence.trajectory.classification,
  supportingSignals:evidence.trajectory.supportingSignals,
  confidence:evidence.trajectory.confidence,
  recurrenceClassification:evidence.recurrence.classification,
  predictiveAuthority:evidence.trajectory.predictiveAuthority,
  destinyAuthority:evidence.trajectory.destinyAuthority,
  developmentalRankAuthority:evidence.trajectory.developmentalRankAuthority,
  memberOwnsFinalMeaning:evidence.trajectory.finalMeaningAuthority==='member',
  valid:evidence.validation.valid,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r3-summary.json','utf8')),null,2));
