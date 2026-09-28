import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  composeTemporalQuestionDialogue,
  validateTemporalDialogue,
} from '../../lib/ain/aether/benchmark/temporalQuestionDialogue';
import type { TemporalEvidence } from '../../lib/ain/aether/benchmark/temporalReconciliation';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-01/r20');
mkdirSync(OUT,{recursive:true});

const evidenceSet:TemporalEvidence[]=[
  {evidenceRef:'clock:1',nodeRef:'repair:v1',standing:'instrument_record',sourceRef:'runtime-clock',exactTimestamp:'2026-09-28T14:17:00-04:00'},
  {evidenceRef:'journal:1',nodeRef:'repair:v1',standing:'document_record',sourceRef:'journal-entry',calendarDate:'2026-09-27'},
  {evidenceRef:'memory:1',nodeRef:'repair:v1',standing:'human_memory',sourceRef:'member-memory',calendarDate:'2026-09-27'},
  {evidenceRef:'period:1',nodeRef:'repair:v1',standing:'coarse_import',sourceRef:'legacy-import',coarsePeriod:'late September 2026'},
  {evidenceRef:'sequence:1',nodeRef:'repair:v1',standing:'sequence_constraint',sourceRef:'lineage-order',afterNodeRef:'repair:v0',beforeNodeRef:'repair:v2'},
];

const responses={
  ambiguous:composeTemporalQuestionDialogue('repair:v1',evidenceSet,'unspecified_when'),
  system:composeTemporalQuestionDialogue('repair:v1',evidenceSet,'system_record_time'),
  document:composeTemporalQuestionDialogue('repair:v1',evidenceSet,'document_date'),
  remembered:composeTemporalQuestionDialogue('repair:v1',evidenceSet,'remembered_time'),
  period:composeTemporalQuestionDialogue('repair:v1',evidenceSet,'interpretive_period'),
  sequence:composeTemporalQuestionDialogue('repair:v1',evidenceSet,'relative_sequence'),
};

const evidence={
  generatedAt:new Date().toISOString(),
  parentR19:'420e250383409f17ff33b43c25938330ecef43a4',
  responses,
  validations:Object.fromEntries(
    Object.entries(responses).map(([k,v])=>[
      k,validateTemporalDialogue(v),
    ]),
  ),
};

writeFileSync(OUT+'/r20-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r20-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR19:evidence.parentR19,
  ambiguityKind:evidence.responses.ambiguous.kind,
  ambiguityText:evidence.responses.ambiguous.text,
  systemSelected:evidence.responses.system.selectedEvidenceRef,
  rememberedSelected:evidence.responses.remembered.selectedEvidenceRef,
  documentSelected:evidence.responses.document.selectedEvidenceRef,
  periodSelected:evidence.responses.period.selectedEvidenceRef,
  sequenceSelected:evidence.responses.sequence.selectedEvidenceRef,
  allNaturalLanguage:Object.values(evidence.responses).every(r=>r.exposesInternalTaxonomy===false),
  noUniversalWinner:Object.values(evidence.responses).every(r=>r.universalWinner===false),
  allValid:Object.values(evidence.validations).every(v=>v.valid),
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r20-summary.json','utf8')),null,2));
