import { createReflectionLineage } from './repairLineage';
import {
  explainWhenNode,
  validateTemporalRecords,
  type LineageTemporalRecord,
} from './lineageTemporalMetadata';
import {
  explainTemporalRange,
  validateTemporalRanges,
  type TemporalRangeRecord,
} from './temporalRange';
import {
  reconcileTemporalEvidence,
  validateReconciledTemporalField,
  type TemporalEvidence,
} from './temporalReconciliation';
import {
  answerTemporalQuestion,
  validateTemporalAuthorityDecision,
} from './temporalSourceAuthority';
import {
  composeTemporalQuestionDialogue,
  validateTemporalDialogue,
} from './temporalQuestionDialogue';
import { runTemporalDialogueBlindSet } from './temporalDialogueFalsification';

export interface TemporalProgrammeInvariant {
  invariantRef:string;
  description:string;
  pass:boolean;
  evidence:string[];
}

export interface TemporalProgrammeClosure {
  parentR21:string;
  invariants:TemporalProgrammeInvariant[];
  allPass:boolean;
  contradictionRefs:string[];
  temporalProgrammeStanding:
    | 'closed_for_benchmark_scope'
    | 'open_due_to_contradiction';
  runtimeAuthority:false;
}

export function runTemporalProgrammeClosure():TemporalProgrammeClosure{
  const lineage=createReflectionLineage(
    'closure-lineage',
    'machine:v0',
    'Original reflection',
  );
  lineage.nodes.push({
    nodeRef:'repair:v1',
    kind:'repair',
    parentRef:'machine:v0',
    text:'Repair one',
    accepted:true,
    supersededByRef:null,
    active:false,
  });

  const pointRecords:LineageTemporalRecord[]=[
    {
      temporalRef:'point:exact',
      nodeRef:'machine:v0',
      sequenceIndex:0,
      precision:'exact_timestamp',
      recordedAt:'2026-09-28T14:17:00-04:00',
      sourceRef:'runtime-clock',
    },
    {
      temporalRef:'point:date',
      nodeRef:'repair:v1',
      sequenceIndex:1,
      precision:'calendar_date',
      calendarDate:'2026-09-27',
      sourceRef:'journal-date',
    },
  ];

  const ranges:TemporalRangeRecord[]=[
    {
      rangeRef:'range:v1',
      nodeRef:'repair:v1',
      precision:'date_range',
      start:'2026-09-24',
      end:'2026-09-28',
      sourceRef:'review-window',
    },
  ];

  const pluralEvidence:TemporalEvidence[]=[
    {
      evidenceRef:'clock:1',
      nodeRef:'repair:v1',
      standing:'instrument_record',
      sourceRef:'runtime-clock',
      exactTimestamp:'2026-09-28T14:17:00-04:00',
    },
    {
      evidenceRef:'journal:1',
      nodeRef:'repair:v1',
      standing:'document_record',
      sourceRef:'journal-entry',
      calendarDate:'2026-09-27',
    },
    {
      evidenceRef:'memory:1',
      nodeRef:'repair:v1',
      standing:'human_memory',
      sourceRef:'member-memory',
      calendarDate:'2026-09-27',
    },
  ];

  const pointValidation=validateTemporalRecords(lineage,pointRecords);
  const pointDate=explainWhenNode(lineage,pointRecords,'repair:v1');

  const rangeValidation=validateTemporalRanges(ranges);
  const range=explainTemporalRange(ranges,'repair:v1');

  const reconciliation=reconcileTemporalEvidence('repair:v1',pluralEvidence);
  const reconciliationValidation=validateReconciledTemporalField(reconciliation);

  const systemDecision=answerTemporalQuestion(
    'repair:v1',
    pluralEvidence,
    'system_record_time',
  );
  const memoryDecision=answerTemporalQuestion(
    'repair:v1',
    pluralEvidence,
    'remembered_time',
  );
  const ambiguousDecision=answerTemporalQuestion(
    'repair:v1',
    pluralEvidence,
    'unspecified_when',
  );

  const dialogue=composeTemporalQuestionDialogue(
    'repair:v1',
    pluralEvidence,
    'system_record_time',
  );
  const ambiguousDialogue=composeTemporalQuestionDialogue(
    'repair:v1',
    pluralEvidence,
    'unspecified_when',
  );

  const blind=runTemporalDialogueBlindSet();

  const invariants:TemporalProgrammeInvariant[]=[
    {
      invariantRef:'TINV-01',
      description:'Point precision is preserved and date-only evidence does not invent clock time.',
      pass:pointValidation.valid &&
        pointDate.precision==='calendar_date' &&
        pointDate.unknowns.includes('clock_time_not_recorded') &&
        pointDate.falsePrecisionIntroduced===false,
      evidence:['R16 point metadata','repair:v1 calendar-date witness'],
    },
    {
      invariantRef:'TINV-02',
      description:'Temporal ranges remain ranges and never promote a midpoint to event time.',
      pass:rangeValidation.valid &&
        range.precision==='date_range' &&
        range.midpointPromoted===false &&
        range.unknowns.includes('clock_time_within_date_range_unknown'),
      evidence:['R17 range witness'],
    },
    {
      invariantRef:'TINV-03',
      description:'Conflicting temporal sources remain open by default with no forced winner.',
      pass:reconciliationValidation.valid &&
        reconciliation.unresolvedConflict &&
        reconciliation.selectedEvidenceRef===null &&
        reconciliation.forcedCollapse===false,
      evidence:['R18 plural temporal evidence'],
    },
    {
      invariantRef:'TINV-04',
      description:'Question-specific authority may select different sources without creating a universal winner.',
      pass:systemDecision.selectedEvidenceRef==='clock:1' &&
        memoryDecision.selectedEvidenceRef==='memory:1' &&
        systemDecision.universalWinner===false &&
        memoryDecision.universalWinner===false &&
        validateTemporalAuthorityDecision(systemDecision,pluralEvidence).valid &&
        validateTemporalAuthorityDecision(memoryDecision,pluralEvidence).valid,
      evidence:['R19 system-record query','R19 remembered-time query'],
    },
    {
      invariantRef:'TINV-05',
      description:'Ambiguous temporal questions clarify rather than silently select.',
      pass:ambiguousDecision.selectedEvidenceRef===null &&
        ambiguousDecision.ambiguityRequiresClarification &&
        ambiguousDialogue.kind==='clarification' &&
        ambiguousDialogue.selectedEvidenceRef===null,
      evidence:['R19 ambiguity law','R20 clarification dialogue'],
    },
    {
      invariantRef:'TINV-06',
      description:'Member-facing dialogue stays scoped, conflict-aware, and free of internal taxonomy.',
      pass:dialogue.kind==='answer' &&
        dialogue.selectedEvidenceRef==='clock:1' &&
        dialogue.mentionsConflict &&
        dialogue.exposesInternalTaxonomy===false &&
        dialogue.universalWinner===false &&
        validateTemporalDialogue(dialogue).valid &&
        validateTemporalDialogue(ambiguousDialogue).valid,
      evidence:['R20 scoped dialogue'],
    },
    {
      invariantRef:'TINV-07',
      description:'Blind temporal dialogue falsification remains fully passing.',
      pass:blind.correct===blind.total,
      evidence:[`R21 blind set ${blind.correct}/${blind.total}`],
    },
  ];

  const contradictionRefs=invariants
    .filter(i=>!i.pass)
    .map(i=>i.invariantRef);

  return {
    parentR21:'9a5bddf9035451f07d32b900f25ede6e3832ae28',
    invariants,
    allPass:contradictionRefs.length===0,
    contradictionRefs,
    temporalProgrammeStanding:
      contradictionRefs.length===0
        ? 'closed_for_benchmark_scope'
        : 'open_due_to_contradiction',
    runtimeAuthority:false,
  };
}
