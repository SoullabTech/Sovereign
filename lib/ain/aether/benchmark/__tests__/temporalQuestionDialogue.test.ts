import {
  composeTemporalQuestionDialogue,
  validateTemporalDialogue,
} from '../temporalQuestionDialogue';
import type { TemporalEvidence } from '../temporalReconciliation';

describe('AIN-AETHER-01R20 temporal question dialogue',()=>{
  const evidence:TemporalEvidence[]=[
    {
      evidenceRef:'clock:1',nodeRef:'repair:v1',standing:'instrument_record',
      sourceRef:'runtime-clock',exactTimestamp:'2026-09-28T14:17:00-04:00',
    },
    {
      evidenceRef:'journal:1',nodeRef:'repair:v1',standing:'document_record',
      sourceRef:'journal-entry',calendarDate:'2026-09-27',
    },
    {
      evidenceRef:'memory:1',nodeRef:'repair:v1',standing:'human_memory',
      sourceRef:'member-memory',calendarDate:'2026-09-27',
    },
    {
      evidenceRef:'period:1',nodeRef:'repair:v1',standing:'coarse_import',
      sourceRef:'legacy-import',coarsePeriod:'late September 2026',
    },
    {
      evidenceRef:'sequence:1',nodeRef:'repair:v1',standing:'sequence_constraint',
      sourceRef:'lineage-order',afterNodeRef:'repair:v0',beforeNodeRef:'repair:v2',
    },
  ];

  test('ambiguous when becomes natural clarification without taxonomy jargon',()=>{
    const response=composeTemporalQuestionDialogue('repair:v1',evidence,'unspecified_when');
    expect(response.kind).toBe('clarification');
    expect(response.text).toMatch(/Do you mean when the system recorded it/i);
    expect(response.text).not.toMatch(/instrument_record|human_memory/);
    expect(validateTemporalDialogue(response)).toEqual({valid:true,errors:[]});
  });

  test('system-record answer stays scoped and mentions disagreement when relevant',()=>{
    const response=composeTemporalQuestionDialogue('repair:v1',evidence,'system_record_time');
    expect(response.kind).toBe('answer');
    expect(response.selectedEvidenceRef).toBe('clock:1');
    expect(response.text).toContain('2026-09-28T14:17:00-04:00');
    expect(response.text).toMatch(/system-record time rather than the one definitive time/i);
    expect(response.mentionsConflict).toBe(true);
  });

  test('remembered-time answer preserves member memory against more precise clock',()=>{
    const response=composeTemporalQuestionDialogue('repair:v1',evidence,'remembered_time');
    expect(response.selectedEvidenceRef).toBe('memory:1');
    expect(response.text).toContain('2026-09-27');
    expect(response.text).toMatch(/keep your remembered time distinct/i);
  });

  test('document-date answer names document scope rather than universal event time',()=>{
    const response=composeTemporalQuestionDialogue('repair:v1',evidence,'document_date');
    expect(response.selectedEvidenceRef).toBe('journal:1');
    expect(response.text).toMatch(/document or journal date/i);
    expect(response.text).toMatch(/not a universal event time/i);
  });

  test('interpretive period and relative sequence remain natural-language answers',()=>{
    const period=composeTemporalQuestionDialogue('repair:v1',evidence,'interpretive_period');
    expect(period.text).toContain('late September 2026');

    const sequence=composeTemporalQuestionDialogue('repair:v1',evidence,'relative_sequence');
    expect(sequence.text).toContain('after repair:v0 and before repair:v2');
  });

  test('missing source gives transparent unavailable answer without substituting another source',()=>{
    const onlyMemory:TemporalEvidence[]=[{
      evidenceRef:'memory:2',nodeRef:'repair:v2',standing:'human_memory',
      sourceRef:'member-memory',calendarDate:'2026-09-28',
    }];
    const response=composeTemporalQuestionDialogue('repair:v2',onlyMemory,'system_record_time');
    expect(response.kind).toBe('unavailable');
    expect(response.selectedEvidenceRef).toBeNull();
    expect(response.text).toMatch(/don't have a recorded source for when the system recorded it/i);
    expect(validateTemporalDialogue(response)).toEqual({valid:true,errors:[]});
  });
});
