import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-01/r16/r16-summary.json'),'utf8'
));

describe('AIN-AETHER-01R16 generated evidence',()=>{
  test('is bound to exact R15 parent',()=>{
    expect(summary.parentR15).toBe('34094c8f78dffab768126eddd7c6cc2588f0dcb9');
  });
  test('all temporal precision classes are represented',()=>{
    expect(summary.exactPrecision).toBe('exact_timestamp');
    expect(summary.datePrecision).toBe('calendar_date');
    expect(summary.coarsePrecision).toBe('coarse_period');
    expect(summary.sequencePrecision).toBe('sequence_only');
    expect(summary.unknownPrecision).toBe('unknown');
  });
  test('date-only record refuses invented clock time',()=>{
    expect(summary.dateUnknowns).toContain('clock_time_not_recorded');
  });
  test('relative order is sequence-only',()=>{
    expect(summary.orderAnswer).toBe('repair:v1 is recorded before repair:v3.');
    expect(summary.orderPrecision).toBe('sequence_only');
  });
  test('missing temporal metadata stays unknown',()=>{
    expect(summary.missingUnknowns).toContain('temporal_metadata_not_recorded');
  });
  test('no witness introduces false precision',()=>{
    expect(summary.noFalsePrecision).toBe(true);
    expect(summary.valid).toBe(true);
  });
});