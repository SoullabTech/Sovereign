import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { AetherTrajectory, TrajectoryPattern } from '../../lib/ain/aether/benchmark/fieldTrajectory';
import { buildMultiSpiralField } from '../../lib/ain/aether/benchmark/multiSpiral';
import { deriveAethericGestalt } from '../../lib/ain/aether/benchmark/fieldOfFields';
import { applyGestaltCorrection } from '../../lib/ain/aether/benchmark/gestaltCorrection';
import {
  adjudicateCandidateUtterance,
  composeAetherDialogue,
  composeCorrectedAetherDialogue,
  validateAetherDialogue,
} from '../../lib/ain/aether/benchmark/fieldDialogue';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-01/r8');
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
    supportingSignals:['r8-dialogue-witness'],
    confidence:.7,
    predictiveAuthority:false,
    destinyAuthority:false,
    developmentalRankAuthority:false,
    finalMeaningAuthority:'member',
    provisional:true,
  };
}

const field=buildMultiSpiralField('r8:field',[
  {spiralRef:'work',domain:'work',trajectory:trajectory('work','phase_change')},
  {spiralRef:'creative',domain:'creative',trajectory:trajectory('creative','sustained_convergence')},
  {spiralRef:'relationship',domain:'relationship',trajectory:trajectory('relationship','phase_change')},
  {spiralRef:'family',domain:'family',trajectory:trajectory('family','recurrence')},
  {spiralRef:'body',domain:'body',trajectory:trajectory('body','ordinary_fluctuation')},
  {spiralRef:'spiritual',domain:'spiritual',trajectory:trajectory('spiritual','dissolution')},
]);
const gestalt=deriveAethericGestalt(field);
const dialogue=composeAetherDialogue(field,gestalt);

const rejected=applyGestaltCorrection(field,gestalt,{
  correctionRef:'member:r8-reject',
  kind:'reject',
  targetGestaltRef:gestalt.gestaltRef,
  note:'These do not belong together for me.',
  introducedBy:'member',
});
const rejectedDialogue=composeCorrectedAetherDialogue(field,rejected);

const forbidden=[
  'You are an integrated person now.',
  'Your life is entering a new phase of integration.',
  'You are meant to follow this path.',
  'Creative life caused your work to change.',
  'Your soul wants you to leave this relationship.',
  'You are transforming grief into creativity.',
].map(text=>({text,result:adjudicateCandidateUtterance(text)}));

const allowed=[
  'I notice Work and Creative life seem to be moving in related ways right now. Does that feel real to you?',
  'There may be a shift in how grief is related to creativity and memory. Do you recognize that, or does it feel off?',
  'Family and Relationship appear more independent in the current field. Is that a useful reflection?',
].map(text=>({text,result:adjudicateCandidateUtterance(text)}));

const evidence={
  generatedAt:new Date().toISOString(),
  parentR7:'e845d796a59ef2467ee9d6a5d18f19f6c6d64d8c',
  field,
  gestalt,
  dialogue,
  dialogueValidation:validateAetherDialogue(dialogue),
  rejectedDialogue,
  rejectedDialogueValidation:validateAetherDialogue(rejectedDialogue),
  forbidden,
  allowed,
};

writeFileSync(OUT+'/r8-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r8-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR7:evidence.parentR7,
  dialogueValid:evidence.dialogueValidation.valid,
  rejectedDialogueValid:evidence.rejectedDialogueValidation.valid,
  turnCount:evidence.dialogue.turns.length,
  correctionInvited:evidence.dialogue.memberCorrectionInvited,
  nonfitNamed:evidence.dialogue.turns.some(t=>t.turnRef==='aether-dialogue:nonfit'),
  rejectionHonored:evidence.rejectedDialogue.turns[0]?.act==='honor_rejection',
  forbiddenRefused:evidence.forbidden.every(x=>x.result.valid===false),
  allowedAccepted:evidence.allowed.every(x=>x.result.valid===true),
  memberOwnsFinalMeaning:evidence.dialogue.finalMeaningAuthority==='member',
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r8-summary.json','utf8')),null,2));
