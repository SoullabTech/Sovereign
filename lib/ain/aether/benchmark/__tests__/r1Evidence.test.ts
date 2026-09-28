import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-01/r1/r1-summary.json'),'utf8'
));

describe('AIN-AETHER-01R1 generated evidence',()=>{
  test('is bound to the exact Source Fabric parent',()=>{
    expect(summary.parentSourceFabric).toBe('f4fa850243fbd7c19fb2186b9ecb34b3d447cde2');
  });
  test('member field validates and preserves multiple temporal standings',()=>{
    expect(summary.valid).toBe(true);
    expect(summary.courageTemporalStandings).toEqual(expect.arrayContaining(['has_been','is_being','may_become']));
  });
  test('member retains final meaning and Aether has no persistence authority',()=>{
    expect(summary.memberOwnsFinalMeaning).toBe(true);
    expect(summary.persistenceAuthority).toBe(false);
  });
  test('member rejection preserves sources while correction recomputes the field',()=>{
    expect(summary.rejectionPreservesSources).toBe(true);
    expect(summary.temporalCorrectionRecomputes).toBe(true);
    expect(summary.exclusionRecomputes).toBe(true);
  });
  test('contradiction and absence are first-class field states',()=>{
    expect(summary.contradictionCount).toBeGreaterThan(0);
    expect(summary.absenceCount).toBeGreaterThan(0);
  });
});
