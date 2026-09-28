import { createReflectionLineage } from '../repairLineage';
import {
  explainTemporalOrder,
  explainWhenNode,
  validateTemporalRecords,
  type LineageTemporalRecord,
} from '../lineageTemporalMetadata';

describe('AIN-AETHER-01R16 lineage temporal metadata',()=>{
  const lineage=createReflectionLineage('L16','machine:v0','Original reflection');
  lineage.nodes.push({
    nodeRef:'repair:v1',kind:'repair',parentRef:'machine:v0',
    text:'Repair one',accepted:true,supersededByRef:null,active:false,
  });
  lineage.nodes.push({
    nodeRef:'repair:v2',kind:'repair',parentRef:'repair:v1',
    text:'Repair two',accepted:true,supersededByRef:null,active:false,
  });
  lineage.nodes.push({
    nodeRef:'repair:v3',kind:'repair',parentRef:'repair:v2',
    text:'Repair three',accepted:true,supersededByRef:null,active:false,
  });
  lineage.nodes.push({
    nodeRef:'repair:v4',kind:'repair',parentRef:'repair:v3',
    text:'Repair four',accepted:true,supersededByRef:null,active:false,
  });

  const records:LineageTemporalRecord[]=[
    {
      temporalRef:'t:v0',nodeRef:'machine:v0',sequenceIndex:0,
      precision:'exact_timestamp',recordedAt:'2026-09-28T14:00:00-04:00',
      sourceRef:'runtime-clock',
    },
    {
      temporalRef:'t:v1',nodeRef:'repair:v1',sequenceIndex:1,
      precision:'calendar_date',calendarDate:'2026-09-28',
      sourceRef:'review-date',
    },
    {
      temporalRef:'t:v2',nodeRef:'repair:v2',sequenceIndex:2,
      precision:'coarse_period',coarsePeriod:'late September 2026',
      sourceRef:'human-period-note',
    },
    {
      temporalRef:'t:v3',nodeRef:'repair:v3',sequenceIndex:3,
      precision:'sequence_only',sourceRef:'lineage-order',
    },
    {
      temporalRef:'t:v4',nodeRef:'repair:v4',sequenceIndex:4,
      precision:'unknown',sourceRef:'legacy-import',
    },
  ];

  test('validates mixed precision without forcing one time standard',()=>{
    expect(validateTemporalRecords(lineage,records)).toEqual({valid:true,errors:[]});
  });

  test('answers exact timestamp only when exact timestamp exists',()=>{
    const exact=explainWhenNode(lineage,records,'machine:v0');
    expect(exact.precision).toBe('exact_timestamp');
    expect(exact.answer).toContain('2026-09-28T14:00:00-04:00');
    expect(exact.falsePrecisionIntroduced).toBe(false);
  });

  test('calendar date explicitly refuses clock-time precision',()=>{
    const date=explainWhenNode(lineage,records,'repair:v1');
    expect(date.precision).toBe('calendar_date');
    expect(date.answer).toMatch(/no more precise time is preserved/i);
    expect(date.unknowns).toContain('clock_time_not_recorded');
  });

  test('coarse period stays coarse and sequence stays non-calendar',()=>{
    const coarse=explainWhenNode(lineage,records,'repair:v2');
    expect(coarse.answer).toContain('late September 2026');
    expect(coarse.unknowns).toContain('exact_date_and_time_not_recorded');

    const seq=explainWhenNode(lineage,records,'repair:v3');
    expect(seq.precision).toBe('sequence_only');
    expect(seq.answer).toMatch(/no calendar time was recorded/i);
  });

  test('unknown time remains unknown',()=>{
    const unknown=explainWhenNode(lineage,records,'repair:v4');
    expect(unknown.precision).toBe('unknown');
    expect(unknown.answer).toMatch(/does not preserve when/i);
  });

  test('relative order can be stated without inventing clock time',()=>{
    const order=explainTemporalOrder(records,'repair:v1','repair:v3');
    expect(order.answer).toBe('repair:v1 is recorded before repair:v3.');
    expect(order.precision).toBe('sequence_only');
    expect(order.falsePrecisionIntroduced).toBe(false);
  });

  test('missing metadata refuses temporal reconstruction',()=>{
    const missing=explainWhenNode(lineage,[],'repair:v2');
    expect(missing.unknowns).toContain('temporal_metadata_not_recorded');
    expect(missing.falsePrecisionIntroduced).toBe(false);
  });
});
