import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-RUNTIME-01/r3/r3-summary.json'),'utf8'
));

describe('AIN-AETHER-RUNTIME-01R3 generated evidence',()=>{
  test('is bound to exact runtime R2 parent',()=>{
    expect(summary.parentRuntimeR2).toBe('8a6286cce0953b60af9689ad755212b57c1c5463');
  });
  test('member and imported observations adapt with bounded standings',()=>{
    expect(summary.memberAdapted).toBe(true);
    expect(summary.memberStanding).toBe('member_named');
    expect(summary.importedAdapted).toBe(true);
    expect(summary.importedStanding).toBe('source_observed');
  });
  test('source confidence is preserved rather than increased',()=>{
    expect(summary.memberConfidencePreserved).toBe(true);
    expect(summary.importedConfidencePreserved).toBe(true);
    expect(summary.confidenceIncreased).toBe(false);
  });
  test('unknown temporal standing is refused rather than coerced',()=>{
    expect(summary.unknownTemporalRefused).toBe(true);
    expect(summary.unknownTemporalErrors).toContain(
      'target_cannot_losslessly_represent_unknown_temporal_standing',
    );
  });
  test('conversion grants no authority or persistence',()=>{
    expect(summary.authorityEscalated).toBe(false);
    expect(summary.persistenceAuthority).toBe(false);
  });
});