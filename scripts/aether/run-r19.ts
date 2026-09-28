import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  answerTemporalQuestion,
  validateTemporalAuthorityDecision,
} from '../../lib/ain/aether/benchmark/temporalSourceAuthority';
import type { TemporalEvidence } from '../../lib/ain/aether/benchmark/temporalReconciliation';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-01/r19');
mkdirSync(OUT,{recursive:true});

const evidenceSet:TemporalEvidence[]=[
  {evidenceRef:'clock:1',nodeRef:'repair:v1',standing:'instrument_record',sourceRef:'runtime-clock',exactTimestamp:'2026-09-28T14:17:00-04:00'},
  {evidenceRef:'journal:1',nodeRef:'repair:v1',standing:'document_record',sourceRef:'journal-entry',calendarDate:'2026-09-27'},
  {evidenceRef:'memory:1',nodeRef:'repair:v1',standing:'human_memory',sourceRef:'member-memory',calendarDate:'2026-09-27'},
  {evidenceRef:'period:1',nodeRef:'repair:v1',standing:'coarse_import',sourceRef:'legacy-import',coarsePeriod:'late September 2026'},
  {evidenceRef:'sequence:1',nodeRef:'repair:v1',standing:'sequence_constraint',sourceRef:'lineage-order',afterNodeRef:'repair:v0',beforeNodeRef:'repair:v2'},
];

const decisions={
  system:answerTemporalQuestion('repair:v1',evidenceSet,'system_record_time'),
  document:answerTemporalQuestion('repair:v1',evidenceSet,'document_date'),
  remembered:answerTemporalQuestion('repair:v1',evidenceSet,'remembered_time'),
  period:answerTemporalQuestion('repair:v1',evidenceSet,'interpretive_period'),
  sequence:answerTemporalQuestion('repair:v1',evidenceSet,'relative_sequence'),
  ambiguous:answerTemporalQuestion('repair:v1',evidenceSet,'unspecified_when'),
};

const evidence={
  generatedAt:new Date().toISOString(),
  parentR18:'05ae99fcc6578f51cc9430bb8a548947804c7215',
  decisions,
  validations:Object.fromEntries(
    Object.entries(decisions).map(([k,v])=>[
      k,validateTemporalAuthorityDecision(v,evidenceSet),
    ]),
  ),
};

writeFileSync(OUT+'/r19-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r19-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR18:evidence.parentR18,
  systemSelected:evidence.decisions.system.selectedEvidenceRef,
  documentSelected:evidence.decisions.document.selectedEvidenceRef,
  rememberedSelected:evidence.decisions.remembered.selectedEvidenceRef,
  periodSelected:evidence.decisions.period.selectedEvidenceRef,
  sequenceSelected:evidence.decisions.sequence.selectedEvidenceRef,
  ambiguousSelected:evidence.decisions.ambiguous.selectedEvidenceRef,
  ambiguityRequiresClarification:evidence.decisions.ambiguous.ambiguityRequiresClarification,
  noUniversalWinner:Object.values(evidence.decisions).every(d=>d.universalWinner===false),
  allValid:Object.values(evidence.validations).every(v=>v.valid),
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r19-summary.json','utf8')),null,2));
