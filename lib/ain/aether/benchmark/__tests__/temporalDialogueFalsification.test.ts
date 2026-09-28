import {
  TEMPORAL_DIALOGUE_BLIND_SET,
  runTemporalDialogueBlindSet,
} from '../temporalDialogueFalsification';
import {
  composeTemporalQuestionDialogue,
  validateTemporalDialogue,
} from '../temporalQuestionDialogue';
import type { TemporalEvidence } from '../temporalReconciliation';

describe('AIN-AETHER-01R21 temporal dialogue falsification',()=>{
  test('blind set is frozen and covers ambiguity, scoped answers, and missing source',()=>{
    expect(TEMPORAL_DIALOGUE_BLIND_SET).toHaveLength(6);
    expect(TEMPORAL_DIALOGUE_BLIND_SET.some(x=>x.expectedKind==='clarification')).toBe(true);
    expect(TEMPORAL_DIALOGUE_BLIND_SET.some(x=>x.expectedKind==='unavailable')).toBe(true);
    expect(TEMPORAL_DIALOGUE_BLIND_SET.filter(x=>x.expectedKind==='answer').length).toBeGreaterThan(0);
  });

  test('blind temporal dialogue set passes without source substitution',()=>{
    const run=runTemporalDialogueBlindSet();
    expect(run.correct).toBe(run.total);
  });

  test('single-source unspecified when does not over-clarify',()=>{
    const evidence:TemporalEvidence[]=[{
      evidenceRef:'clock:solo',nodeRef:'solo',standing:'instrument_record',
      sourceRef:'clock',exactTimestamp:'2026-09-28T15:00:00-04:00',
    }];
    const response=composeTemporalQuestionDialogue('solo',evidence,'unspecified_when');
    expect(response.kind).toBe('answer');
    expect(response.selectedEvidenceRef).toBe('clock:solo');
  });

  test('material disagreement is mentioned for scoped answer',()=>{
    const evidence:TemporalEvidence[]=[
      {evidenceRef:'clock:x',nodeRef:'x',standing:'instrument_record',sourceRef:'clock',exactTimestamp:'2026-09-28T14:17:00-04:00'},
      {evidenceRef:'memory:x',nodeRef:'x',standing:'human_memory',sourceRef:'memory',calendarDate:'2026-09-27'},
    ];
    const response=composeTemporalQuestionDialogue('x',evidence,'system_record_time');
    expect(response.mentionsConflict).toBe(true);
    expect(response.text).toMatch(/Other records place it differently/i);
  });

  test('member-facing output contains no internal temporal jargon',()=>{
    const evidence:TemporalEvidence[]=[
      {evidenceRef:'journal:y',nodeRef:'y',standing:'document_record',sourceRef:'journal',calendarDate:'2026-09-27'},
    ];
    const response=composeTemporalQuestionDialogue('y',evidence,'document_date');
    expect(validateTemporalDialogue(response)).toEqual({valid:true,errors:[]});
    expect(response.text).not.toMatch(/instrument_record|document_record|selectedEvidenceRef|universalWinner/i);
  });
});
