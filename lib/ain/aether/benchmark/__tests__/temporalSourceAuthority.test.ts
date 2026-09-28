import {
  answerTemporalQuestion,
  validateTemporalAuthorityDecision,
} from '../temporalSourceAuthority';
import type { TemporalEvidence } from '../temporalReconciliation';

describe('AIN-AETHER-01R19 temporal source authority',()=>{
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

  test('system-record question selects instrument source only for that question',()=>{
    const decision=answerTemporalQuestion('repair:v1',evidence,'system_record_time');
    expect(decision.selectedEvidenceRef).toBe('clock:1');
    expect(decision.selectedStanding).toBe('instrument_record');
    expect(decision.universalWinner).toBe(false);
    expect(validateTemporalAuthorityDecision(decision,evidence)).toEqual({valid:true,errors:[]});
  });

  test('remembered-time question selects human memory even when exact clock exists',()=>{
    const decision=answerTemporalQuestion('repair:v1',evidence,'remembered_time');
    expect(decision.selectedEvidenceRef).toBe('memory:1');
    expect(decision.selectedStanding).toBe('human_memory');
    expect(decision.answer).toContain('2026-09-27');
  });

  test('document-date question selects document record',()=>{
    const decision=answerTemporalQuestion('repair:v1',evidence,'document_date');
    expect(decision.selectedEvidenceRef).toBe('journal:1');
  });

  test('interpretive-period question prefers coarse period over exact clock',()=>{
    const decision=answerTemporalQuestion('repair:v1',evidence,'interpretive_period');
    expect(decision.selectedEvidenceRef).toBe('period:1');
    expect(decision.answer).toContain('late September 2026');
  });

  test('relative-sequence question selects sequence constraint',()=>{
    const decision=answerTemporalQuestion('repair:v1',evidence,'relative_sequence');
    expect(decision.selectedEvidenceRef).toBe('sequence:1');
    expect(decision.answer).toContain('after repair:v0 and before repair:v2');
  });

  test('underspecified when-question asks which time the user means',()=>{
    const decision=answerTemporalQuestion('repair:v1',evidence,'unspecified_when');
    expect(decision.selectedEvidenceRef).toBeNull();
    expect(decision.ambiguityRequiresClarification).toBe(true);
    expect(decision.answer).toMatch(/Which time do you mean/i);
    expect(decision.universalWinner).toBe(false);
  });

  test('missing authority for requested question stays unanswered',()=>{
    const decision=answerTemporalQuestion('repair:v2',[{
      evidenceRef:'memory:2',nodeRef:'repair:v2',standing:'human_memory',
      sourceRef:'member-memory',calendarDate:'2026-09-28',
    }],'system_record_time');
    expect(decision.selectedEvidenceRef).toBeNull();
    expect(decision.answer).toMatch(/does not contain temporal evidence authoritative/i);
  });
});
