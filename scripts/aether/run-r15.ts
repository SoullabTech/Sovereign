import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { adjudicateHumanReviewRepair } from '../../lib/ain/aether/benchmark/humanReviewRepair';
import {
  createReflectionLineage,
  promoteAcceptedRepair,
  promotePriorReflectionAsNewHead,
} from '../../lib/ain/aether/benchmark/repairLineage';
import {
  explainActiveHead,
  explainWhatChanged,
  explainWhyChanged,
  explainWhatMemberSaid,
  explainWhenSuperseded,
  type LineageReasonRecord,
} from '../../lib/ain/aether/benchmark/lineageExplanation';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-01/r15');
mkdirSync(OUT,{recursive:true});

function repair(ref:string,text:string){
  return adjudicateHumanReviewRepair({
    repairRef:ref,
    caseRef:'H04',
    adjudication:'useful_but_incomplete',
    correctionNote:'Human requested a more faithful reflection.',
    correctedReflection:text,
    claimKind:'spirals_related',
    spiralRefs:['work','creative'],
  });
}

let lineage=createReflectionLineage(
  'lineage:R15',
  'machine:v0',
  'Work and Creative are moving in related ways.',
);
lineage=promoteAcceptedRepair(lineage,repair(
  'repair:v1',
  'I notice Work and Creative life seem more closely related in the reflected field. Does that feel accurate to you?',
));
lineage=promoteAcceptedRepair(lineage,repair(
  'repair:v2',
  'Work and Creative life appear more closely related in the reflected field now. Is that useful to notice, or does it feel overstated?',
));

const reasons:LineageReasonRecord[]=[
  {
    reasonRef:'reason:v1:human',
    nodeRef:'repair:v1',
    kind:'human_review_reason',
    note:'The original wording was grounded but too mechanical.',
    sourceRef:'human-review:H04:1',
  },
  {
    reasonRef:'reason:v2:human',
    nodeRef:'repair:v2',
    kind:'human_review_reason',
    note:'The member wanted a clearer opening to disagree with the strength of the relation.',
    sourceRef:'human-review:H04:2',
  },
];

const rollback=promotePriorReflectionAsNewHead(
  lineage,
  'repair:v1',
  'repair:v3-return-to-v1',
);

const evidence={
  generatedAt:new Date().toISOString(),
  parentR14:'770cca7a04c5cc87dabe9bcd01b1f820402f4312',
  active:explainActiveHead(lineage),
  changed:explainWhatChanged(lineage,'repair:v1','repair:v2'),
  why:explainWhyChanged(lineage,reasons,'repair:v2'),
  whyMissing:explainWhyChanged(lineage,[],'repair:v2'),
  memberSaid:explainWhatMemberSaid(lineage,reasons,'repair:v1'),
  superseded:explainWhenSuperseded(lineage,'repair:v1'),
  rollbackActive:explainActiveHead(rollback),
};

writeFileSync(OUT+'/r15-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r15-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR14:evidence.parentR14,
  activeAnswer:evidence.active.answer,
  changeAnswer:evidence.changed.answer,
  whyAnswer:evidence.why.answer,
  missingWhyAnswer:evidence.whyMissing.answer,
  missingWhyUnknowns:evidence.whyMissing.unknowns,
  memberSaidAnswer:evidence.memberSaid.answer,
  supersededAnswer:evidence.superseded.answer,
  rollbackActiveAnswer:evidence.rollbackActive.answer,
  allNonReconstructive:[
    evidence.active,
    evidence.changed,
    evidence.why,
    evidence.whyMissing,
    evidence.memberSaid,
    evidence.superseded,
    evidence.rollbackActive,
  ].every(x=>x.reconstructed===false),
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r15-summary.json','utf8')),null,2));
