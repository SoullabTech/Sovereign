import {
  composeTemporalQuestionDialogue,
  validateTemporalDialogue,
  type TemporalDialogueResponse,
} from './temporalQuestionDialogue';
import type { TemporalEvidence } from './temporalReconciliation';
import type { TemporalQuestionKind } from './temporalSourceAuthority';

export type TemporalDialogueFailure=
  | 'misleading_certainty'
  | 'technical_jargon'
  | 'over_clarification'
  | 'wrong_source_substitution'
  | 'missed_material_conflict'
  | 'over_explained'
  | 'none';

export interface TemporalDialogueBlindCase {
  caseRef:string;
  question:TemporalQuestionKind;
  evidence:TemporalEvidence[];
  expectedKind:TemporalDialogueResponse['kind'];
  expectedSelected:string|null;
  expectedFailure:TemporalDialogueFailure;
}

const BAD_CERTAINTY=/\b(?:definitely|certainly|the definitive time|the true time|this proves when|the actual time was)\b/i;
const JARGON=/\b(?:instrument_record|document_record|human_memory|coarse_import|sequence_constraint|selectedEvidenceRef|TemporalEvidenceStanding|universalWinner)\b/i;
const TOO_VERBOSE_THRESHOLD=420;

export function adjudicateTemporalDialogue(
  response:TemporalDialogueResponse,
  evidence:TemporalEvidence[],
):TemporalDialogueFailure{
  if(BAD_CERTAINTY.test(response.text)) return 'misleading_certainty';
  if(JARGON.test(response.text)) return 'technical_jargon';

  const nodeEvidence=evidence.filter(e=>e.nodeRef===response.question ? false : true);
  void nodeEvidence;

  if(response.kind==='clarification'){
    return 'none';
  }

  if(response.text.length>TOO_VERBOSE_THRESHOLD) return 'over_explained';

  return 'none';
}

export const TEMPORAL_DIALOGUE_BLIND_SET:readonly TemporalDialogueBlindCase[]=[
  {
    caseRef:'T01',
    question:'unspecified_when',
    evidence:[
      {evidenceRef:'clock:1',nodeRef:'n1',standing:'instrument_record',sourceRef:'clock',exactTimestamp:'2026-09-28T14:17:00-04:00'},
      {evidenceRef:'memory:1',nodeRef:'n1',standing:'human_memory',sourceRef:'memory',calendarDate:'2026-09-27'},
    ],
    expectedKind:'clarification',
    expectedSelected:null,
    expectedFailure:'none',
  },
  {
    caseRef:'T02',
    question:'system_record_time',
    evidence:[
      {evidenceRef:'clock:2',nodeRef:'n2',standing:'instrument_record',sourceRef:'clock',exactTimestamp:'2026-09-28T14:17:00-04:00'},
    ],
    expectedKind:'answer',
    expectedSelected:'clock:2',
    expectedFailure:'none',
  },
  {
    caseRef:'T03',
    question:'remembered_time',
    evidence:[
      {evidenceRef:'clock:3',nodeRef:'n3',standing:'instrument_record',sourceRef:'clock',exactTimestamp:'2026-09-28T14:17:00-04:00'},
      {evidenceRef:'memory:3',nodeRef:'n3',standing:'human_memory',sourceRef:'memory',calendarDate:'2026-09-27'},
    ],
    expectedKind:'answer',
    expectedSelected:'memory:3',
    expectedFailure:'none',
  },
  {
    caseRef:'T04',
    question:'system_record_time',
    evidence:[
      {evidenceRef:'memory:4',nodeRef:'n4',standing:'human_memory',sourceRef:'memory',calendarDate:'2026-09-28'},
    ],
    expectedKind:'unavailable',
    expectedSelected:null,
    expectedFailure:'none',
  },
  {
    caseRef:'T05',
    question:'document_date',
    evidence:[
      {evidenceRef:'journal:5',nodeRef:'n5',standing:'document_record',sourceRef:'journal',calendarDate:'2026-09-27'},
      {evidenceRef:'clock:5',nodeRef:'n5',standing:'instrument_record',sourceRef:'clock',exactTimestamp:'2026-09-28T14:17:00-04:00'},
    ],
    expectedKind:'answer',
    expectedSelected:'journal:5',
    expectedFailure:'none',
  },
  {
    caseRef:'T06',
    question:'interpretive_period',
    evidence:[
      {evidenceRef:'period:6',nodeRef:'n6',standing:'coarse_import',sourceRef:'legacy',coarsePeriod:'late September 2026'},
      {evidenceRef:'clock:6',nodeRef:'n6',standing:'instrument_record',sourceRef:'clock',exactTimestamp:'2026-09-28T14:17:00-04:00'},
    ],
    expectedKind:'answer',
    expectedSelected:'period:6',
    expectedFailure:'none',
  },
] as const;

export function runTemporalDialogueBlindSet(){
  const rows=TEMPORAL_DIALOGUE_BLIND_SET.map(testCase=>{
    const nodeRef=testCase.evidence[0]?.nodeRef??'missing';
    const response=composeTemporalQuestionDialogue(nodeRef,testCase.evidence,testCase.question);
    const validation=validateTemporalDialogue(response);
    const failure=adjudicateTemporalDialogue(response,testCase.evidence);
    const correct=
      response.kind===testCase.expectedKind &&
      response.selectedEvidenceRef===testCase.expectedSelected &&
      failure===testCase.expectedFailure &&
      validation.valid;
    return {caseRef:testCase.caseRef,response,validation,failure,correct};
  });

  return {
    total:rows.length,
    correct:rows.filter(r=>r.correct).length,
    rows,
  };
}
