import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { adjudicateHumanReviewRepair } from '../../lib/ain/aether/benchmark/humanReviewRepair';
import {
  createReflectionLineage,
  appendHumanReviewNode,
  promoteAcceptedRepair,
  promotePriorReflectionAsNewHead,
  validateReflectionLineage,
} from '../../lib/ain/aether/benchmark/repairLineage';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-01/r14');
mkdirSync(OUT,{recursive:true});

const r1=adjudicateHumanReviewRepair({
  repairRef:'repair:v1',
  caseRef:'H04',
  adjudication:'technically_grounded_but_lifeless',
  correctionNote:'Make the reflection more alive without adding authority.',
  correctedReflection:'I notice Work and Creative life seem to be gathering into a stronger relationship in the reflected field right now. Does that connection feel accurate to you?',
  claimKind:'spirals_related',
  spiralRefs:['work','creative'],
});

const r2=adjudicateHumanReviewRepair({
  repairRef:'repair:v2',
  caseRef:'H04',
  adjudication:'useful_but_incomplete',
  correctionNote:'Keep the relation but make the member opening clearer.',
  correctedReflection:'Work and Creative life appear more closely related in the reflected field now. Is that useful to notice, or does it feel overstated?',
  claimKind:'spirals_related',
  spiralRefs:['work','creative'],
});

let lineage=createReflectionLineage(
  'lineage:H04',
  'machine:v0',
  'I notice work and creative are moving in related ways in the reflected field. Does that connection feel real to you?',
);
lineage=appendHumanReviewNode(lineage,'human-review:H04:1');
lineage=promoteAcceptedRepair(lineage,r1);
lineage=appendHumanReviewNode(lineage,'human-review:H04:2');
lineage=promoteAcceptedRepair(lineage,r2);

const rollback=promotePriorReflectionAsNewHead(
  lineage,
  'repair:v1',
  'repair:v3-return-to-v1',
);

const evidence={
  generatedAt:new Date().toISOString(),
  parentR13:'6140432bf829c4c1c83a2adfacee4da74215b9a3',
  lineage,
  validation:validateReflectionLineage(lineage),
  rollback,
  rollbackValidation:validateReflectionLineage(rollback),
};

writeFileSync(OUT+'/r14-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r14-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR13:evidence.parentR13,
  nodeCount:evidence.lineage.nodes.length,
  activeHeadRef:evidence.lineage.activeHeadRef,
  activeHeadCount:evidence.lineage.nodes.filter(n=>n.active).length,
  appendOnly:evidence.lineage.appendOnly,
  v1Preserved:Boolean(evidence.lineage.nodes.find(n=>n.nodeRef==='repair:v1')),
  v2Active:evidence.lineage.activeHeadRef==='repair:v2',
  rollbackHead:evidence.rollback.activeHeadRef,
  rollbackPreservedOriginal:Boolean(evidence.rollback.nodes.find(n=>n.nodeRef==='machine:v0')),
  valid:evidence.validation.valid,
  rollbackValid:evidence.rollbackValidation.valid,
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r14-summary.json','utf8')),null,2));
