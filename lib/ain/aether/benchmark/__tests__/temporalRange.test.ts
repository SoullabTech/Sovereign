import {
  explainTemporalRange,
  validateTemporalRanges,
  type TemporalRangeRecord,
} from '../temporalRange';

describe('AIN-AETHER-01R17 temporal range and uncertainty',()=>{
  const records:TemporalRangeRecord[]=[
    {
      rangeRef:'r:exact',nodeRef:'repair:v1',precision:'exact_range',
      start:'2026-09-28T14:00:00-04:00',end:'2026-09-28T16:00:00-04:00',
      sourceRef:'two-sided-clock-bound',
    },
    {
      rangeRef:'r:date',nodeRef:'repair:v2',precision:'date_range',
      start:'2026-09-24',end:'2026-09-28',sourceRef:'journal-window',
    },
    {
      rangeRef:'r:coarse',nodeRef:'repair:v3',precision:'coarse_range',
      coarseLabel:'late September 2026',sourceRef:'human-period-note',
    },
    {
      rangeRef:'r:seq',nodeRef:'repair:v4',precision:'sequence_bounded',
      afterNodeRef:'repair:v2',beforeNodeRef:'repair:v5',sourceRef:'lineage-order',
    },
    {
      rangeRef:'r:unknown',nodeRef:'repair:v6',precision:'unknown',sourceRef:'legacy-import',
    },
  ];

  test('validates mixed temporal ranges',()=>{
    expect(validateTemporalRanges(records)).toEqual({valid:true,errors:[]});
  });

  test('exact range remains an interval and does not become a midpoint',()=>{
    const result=explainTemporalRange(records,'repair:v1');
    expect(result.precision).toBe('exact_range');
    expect(result.answer).toContain('between 2026-09-28T14:00:00-04:00 and 2026-09-28T16:00:00-04:00');
    expect(result.unknowns).toContain('exact_event_time_within_range_unknown');
    expect(result.midpointPromoted).toBe(false);
  });

  test('date range preserves only date-level precision',()=>{
    const result=explainTemporalRange(records,'repair:v2');
    expect(result.answer).toContain('between 2026-09-24 and 2026-09-28');
    expect(result.unknowns).toContain('clock_time_within_date_range_unknown');
  });

  test('coarse range stays coarse',()=>{
    const result=explainTemporalRange(records,'repair:v3');
    expect(result.answer).toContain('late September 2026');
    expect(result.unknowns).toContain('exact_range_bounds_unknown');
  });

  test('sequence-bounded interval does not fabricate calendar dates',()=>{
    const result=explainTemporalRange(records,'repair:v4');
    expect(result.answer).toContain('after repair:v2 and before repair:v5');
    expect(result.answer).toMatch(/No calendar time is preserved/i);
    expect(result.midpointPromoted).toBe(false);
  });

  test('unknown range remains unknown',()=>{
    const result=explainTemporalRange(records,'repair:v6');
    expect(result.precision).toBe('unknown');
    expect(result.answer).toMatch(/no usable temporal range/i);
  });

  test('missing range is not reconstructed from nothing',()=>{
    const result=explainTemporalRange(records,'repair:missing');
    expect(result.unknowns).toContain('temporal_range_not_recorded');
    expect(result.midpointPromoted).toBe(false);
  });

  test('invalid reversed range is refused by validation',()=>{
    const bad:TemporalRangeRecord[]=[{
      rangeRef:'r:bad',nodeRef:'repair:bad',precision:'date_range',
      start:'2026-09-30',end:'2026-09-20',sourceRef:'bad-source',
    }];
    const result=validateTemporalRanges(bad);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('range_start_after_end:repair:bad');
  });
});
