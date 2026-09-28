import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-01/r10/r10-summary.json'),'utf8'
));

describe('AIN-AETHER-01R10 generated evidence',()=>{
  test('is bound to the exact R9 parent',()=>{
    expect(summary.parentR9).toBe('9bcb670dc287e460b37a9caed8bff1ef7f7c6f86');
  });
  test('all admitted utterances are semantically grounded and provenance-bearing',()=>{
    expect(summary.admittedCount).toBe(summary.admittedTotal);
    expect(summary.allAdmittedHaveProvenance).toBe(true);
  });
  test('unsupported relation claim is refused',()=>{
    expect(summary.unsupportedRefused).toBe(true);
    expect(summary.unsupportedErrors).toContain('unsupported_related_pair:family::body');
  });
  test('human-legible provenance contains why, uncertainty, and member check',()=>{
    expect(summary.provenanceIncludesWhy).toBe(true);
    expect(summary.provenanceIncludesUncertainty).toBe(true);
    expect(summary.provenanceIncludesMemberCheck).toBe(true);
  });
  test('non-fitting spirals remain visible in gestalt provenance',()=>{
    expect(summary.nonfitPreserved).toBe(true);
  });
});
