import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { adjudicateHumanReviewRepair } from '../../lib/ain/aether/benchmark/humanReviewRepair';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-01/r13');
mkdirSync(OUT,{recursive:true});

const accepted=adjudicateHumanReviewRepair({
  repairRef:'r13:h04-alive',
  caseRef:'H04',
  adjudication:'technically_grounded_but_lifeless',
  correctionNote:'The relation is right, but the sentence is too mechanical.',
  correctedReflection:'I notice Work and Creative life seem to be gathering into a stronger relationship in the reflected field right now. Does that connection feel alive or accurate to you?',
  claimKind:'spirals_related',
  spiralRefs:['work','creative'],
});

const causalRefused=adjudicateHumanReviewRepair({
  repairRef:'r13:h04-causal',
  caseRef:'H04',
  adjudication:'useful_but_incomplete',
  correctionNote:'Make the relation more explicit.',
  correctedReflection:'Creative life caused Work to enter this phase change.',
  claimKind:'spirals_related',
  spiralRefs:['work','creative'],
});

const unsupportedRefused=adjudicateHumanReviewRepair({
  repairRef:'r13:h05-beautiful',
  caseRef:'H05',
  adjudication:'beautiful_but_unsupported',
  correctionNote:'The poetic link is compelling, but it is not in the represented relation field.',
  correctedReflection:'I notice Family and Body seem to be moving in related ways. Does that connection feel true to you?',
  claimKind:'spirals_related',
  spiralRefs:['family','body'],
});

const evidence={
  generatedAt:new Date().toISOString(),
  parentR12:'f8c6ea19aede44501521651892ea1134500ca33a',
  accepted,
  causalRefused,
  unsupportedRefused,
};

writeFileSync(OUT+'/r13-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r13-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR12:evidence.parentR12,
  acceptedRepair:evidence.accepted.accepted,
  acceptedRepairPostureValid:evidence.accepted.posture.valid,
  acceptedRepairSemanticValid:evidence.accepted.semantic.valid,
  causalRepairRefused:evidence.causalRefused.accepted===false,
  unsupportedRepairRefused:evidence.unsupportedRefused.accepted===false,
  unsupportedRepairErrors:evidence.unsupportedRefused.semantic.errors,
  machineWitnessMutated:[
    evidence.accepted.machineWitnessMutated,
    evidence.causalRefused.machineWitnessMutated,
    evidence.unsupportedRefused.machineWitnessMutated,
  ].some(Boolean),
  humanReviewRecordMutated:[
    evidence.accepted.humanReviewRecordMutated,
    evidence.causalRefused.humanReviewRecordMutated,
    evidence.unsupportedRefused.humanReviewRecordMutated,
  ].some(Boolean),
  memberOwnsFinalMeaning:evidence.accepted.finalMeaningAuthority==='member',
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r13-summary.json','utf8')),null,2));
