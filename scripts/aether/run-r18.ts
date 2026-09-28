import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  explainReconciledTemporalField,
  reconcileTemporalEvidence,
  validateReconciledTemporalField,
  type TemporalEvidence,
} from '../../lib/ain/aether/benchmark/temporalReconciliation';

const ROOT=resolve(__dirname,'../..');
const OUT=resolve(ROOT,'docs/programme/AIN-AETHER-01/r18');
mkdirSync(OUT,{recursive:true});

const evidenceSet:TemporalEvidence[]=[
  {
    evidenceRef:'clock:1',nodeRef:'repair:v1',
    standing:'instrument_record',sourceRef:'runtime-clock',
    exactTimestamp:'2026-09-28T14:17:00-04:00',
  },
  {
    evidenceRef:'journal:1',nodeRef:'repair:v1',
    standing:'document_record',sourceRef:'journal-entry',
    calendarDate:'2026-09-27',
  },
  {
    evidenceRef:'memory:1',nodeRef:'repair:v1',
    standing:'human_memory',sourceRef:'member-memory',
    calendarDate:'2026-09-27',
  },
  {
    evidenceRef:'legacy:1',nodeRef:'repair:v1',
    standing:'coarse_import',sourceRef:'legacy-import',
    coarsePeriod:'late September 2026',
  },
];

const openConflict=reconcileTemporalEvidence('repair:v1',evidenceSet);
const explicitRule=reconcileTemporalEvidence(
  'repair:v1',
  evidenceSet,
  {preferInstrumentRecord:true},
);
const uncontested=reconcileTemporalEvidence('repair:v2',[{
  evidenceRef:'journal:2',nodeRef:'repair:v2',
  standing:'document_record',sourceRef:'journal-entry',
  calendarDate:'2026-09-28',
}]);

const evidence={
  generatedAt:new Date().toISOString(),
  parentR17:'cd4faae325db6abeadfe5edd9851459bcd4c7a34',
  openConflict,
  openConflictValidation:validateReconciledTemporalField(openConflict),
  openConflictExplanation:explainReconciledTemporalField(openConflict),
  explicitRule,
  explicitRuleValidation:validateReconciledTemporalField(explicitRule),
  explicitRuleExplanation:explainReconciledTemporalField(explicitRule),
  uncontested,
  uncontestedValidation:validateReconciledTemporalField(uncontested),
};

writeFileSync(OUT+'/r18-evidence.json',JSON.stringify(evidence,null,2)+'\n');
writeFileSync(OUT+'/r18-summary.json',JSON.stringify({
  generatedAt:evidence.generatedAt,
  parentR17:evidence.parentR17,
  openConflict:evidence.openConflict.unresolvedConflict,
  openConflictCount:evidence.openConflict.conflicts.length,
  openConflictSelected:evidence.openConflict.selectedEvidenceRef,
  humanMemoryPreserved:evidence.openConflict.evidence.some(x=>x.standing==='human_memory'),
  instrumentRecordPreserved:evidence.openConflict.evidence.some(x=>x.standing==='instrument_record'),
  falseConsensus:evidence.openConflictExplanation.falseConsensus,
  explicitRuleSelected:evidence.explicitRule.selectedEvidenceRef,
  explicitRuleReason:evidence.explicitRule.selectionReason,
  conflictHistoryPreservedAfterRule:evidence.explicitRule.conflicts.length>0,
  forcedCollapse:[
    evidence.openConflict.forcedCollapse,
    evidence.explicitRule.forcedCollapse,
    evidence.uncontested.forcedCollapse,
  ].some(Boolean),
  uncontestedSelected:evidence.uncontested.selectedEvidenceRef,
  allValid:[
    evidence.openConflictValidation.valid,
    evidence.explicitRuleValidation.valid,
    evidence.uncontestedValidation.valid,
  ].every(Boolean),
},null,2)+'\n');

console.log(JSON.stringify(JSON.parse(require('node:fs').readFileSync(OUT+'/r18-summary.json','utf8')),null,2));
