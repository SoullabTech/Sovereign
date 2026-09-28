import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-01/r17/r17-summary.json'),'utf8'
));

describe('AIN-AETHER-01R17 generated evidence',()=>{
  test('is bound to exact R16 parent',()=>{
    expect(summary.parentR16).toBe('adf888699013bfbe73825a10503d049ec20ea60b');
  });
  test('all range precision classes are represented',()=>{
    expect(summary.exactPrecision).toBe('exact_range');
    expect(summary.datePrecision).toBe('date_range');
    expect(summary.coarsePrecision).toBe('coarse_range');
    expect(summary.sequencePrecision).toBe('sequence_bounded');
    expect(summary.unknownPrecision).toBe('unknown');
  });
  test('interval uncertainty remains explicit',()=>{
    expect(summary.exactUnknowns).toContain('exact_event_time_within_range_unknown');
    expect(summary.dateUnknowns).toContain('clock_time_within_date_range_unknown');
  });
  test('sequence range remains non-calendar',()=>{
    expect(summary.sequenceAnswer).toMatch(/No calendar time is preserved/i);
  });
  test('missing range remains unknown',()=>{
    expect(summary.missingUnknowns).toContain('temporal_range_not_recorded');
  });
  test('no midpoint promotion occurs',()=>{
    expect(summary.noMidpointPromotion).toBe(true);
    expect(summary.valid).toBe(true);
  });
});