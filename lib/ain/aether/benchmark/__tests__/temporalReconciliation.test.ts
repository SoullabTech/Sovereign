import {
  explainReconciledTemporalField,
  reconcileTemporalEvidence,
  validateReconciledTemporalField,
  type TemporalEvidence,
} from '../temporalReconciliation';

describe('AIN-AETHER-01R18 temporal evidence reconciliation',()=>{
  const conflicting:TemporalEvidence[]=[
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

  test('holds conflicting temporal evidence open by default',()=>{
    const field=reconcileTemporalEvidence('repair:v1',conflicting);
    expect(field.unresolvedConflict).toBe(true);
    expect(field.selectedEvidenceRef).toBeNull();
    expect(field.forcedCollapse).toBe(false);
    expect(field.conflicts.length).toBeGreaterThan(0);
    expect(validateReconciledTemporalField(field)).toEqual({valid:true,errors:[]});
  });

  test('human memory is preserved as evidence rather than erased by exact clock',()=>{
    const field=reconcileTemporalEvidence('repair:v1',conflicting);
    expect(field.evidence.some(e=>e.standing==='human_memory')).toBe(true);
    expect(field.evidence.some(e=>e.standing==='instrument_record')).toBe(true);
  });

  test('explanation names disagreement without false consensus',()=>{
    const field=reconcileTemporalEvidence('repair:v1',conflicting);
    const explanation=explainReconciledTemporalField(field);
    expect(explanation.answer).toMatch(/sources disagree/i);
    expect(explanation.falseConsensus).toBe(false);
    expect(explanation.selectedEvidenceRef).toBeNull();
  });

  test('explicit rule may select instrument timestamp without deleting conflict history',()=>{
    const field=reconcileTemporalEvidence(
      'repair:v1',conflicting,{preferInstrumentRecord:true},
    );
    expect(field.selectedEvidenceRef).toBe('clock:1');
    expect(field.selectionReason).toBe('explicit_rule_prefer_instrument_exact_timestamp');
    expect(field.conflicts.length).toBeGreaterThan(0);
    expect(field.conflicts.some(c=>c.status==='resolved_by_explicit_rule')).toBe(true);
    expect(field.forcedCollapse).toBe(false);
  });

  test('single uncontested evidence may be selected without reconciliation fiction',()=>{
    const field=reconcileTemporalEvidence('repair:v2',[{
      evidenceRef:'journal:2',nodeRef:'repair:v2',
      standing:'document_record',sourceRef:'journal-entry',
      calendarDate:'2026-09-28',
    }]);
    expect(field.unresolvedConflict).toBe(false);
    expect(field.selectedEvidenceRef).toBe('journal:2');
    expect(field.selectionReason).toBe('single_uncontested_temporal_evidence');
  });

  test('different-node temporal records do not contaminate reconciliation',()=>{
    const field=reconcileTemporalEvidence('repair:v2',[
      ...conflicting,
      {
        evidenceRef:'clock:2',nodeRef:'repair:v2',
        standing:'instrument_record',sourceRef:'runtime-clock',
        exactTimestamp:'2026-09-28T18:00:00-04:00',
      },
    ]);
    expect(field.evidence).toHaveLength(1);
    expect(field.selectedEvidenceRef).toBe('clock:2');
  });
});
