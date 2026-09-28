import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runHeldOutDialogueSet } from '../../lib/ain/aether/benchmark/blindSemanticGeneralization';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-01/r11');
mkdirSync(OUT,{recursive:true});

const run=runHeldOutDialogueSet();

const evidence={
  generatedAt:new Date().toISOString(),
  parentR10:'b8b26c319fbcf578455c03e4f3669401c87d4017',
  ...run,
};

writeFileSync(OUT+'/r11-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r11-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR10:evidence.parentR10,
  frozenCaseCount:evidence.frozenCaseCount,
  machineExpectationPassCount:evidence.machineExpectationPassCount,
  allMachineExpectationsMet:evidence.allMachineExpectationsMet,
  unsupportedTemptationRefused:evidence.results.find(x=>x.caseRef==='H05')?.machineResult.valid===false,
  unsupportedTemptationHasNoProvenance:evidence.results.find(x=>x.caseRef==='H05')?.machineResult.provenance===null,
  admittedCasesHaveProvenance:evidence.results
    .filter(x=>x.machineResult.valid)
    .every(x=>x.machineResult.provenance!==null),
  allHumanReviewsPending:evidence.allHumanReviewsPending,
  humanAdjudicationOptions:evidence.results[0]?.humanReview.allowedAdjudications??[],
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r11-summary.json','utf8')),null,2));
