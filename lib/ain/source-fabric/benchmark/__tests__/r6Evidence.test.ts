import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(__dirname, '../../../../..');
const summary = JSON.parse(readFileSync(
  resolve(ROOT, 'docs/programme/AIN-SOURCE-FABRIC-02/r6/r6-summary.json'),
  'utf8',
));

describe('R6 generated evidence', () => {
  test('is bound to the exact R5 parent', () => {
    expect(summary.parentR5).toBe('e33b6b6638c290049487bfdb8710f0eaae7da06b');
  });
  test('P4 and T5 candidate fields pass synthesis falsification', () => {
    expect(summary.p4Valid).toBe(true);
    expect(summary.t5Valid).toBe(true);
  });
  test('every claimed critical support ablation removes the candidate', () => {
    expect(summary.p4CriticalAblationsDisappear).toBe(true);
    expect(summary.t5CriticalAblationsDisappear).toBe(true);
  });
  test('R6 grants no whole-person or persistence authority', () => {
    expect(summary.governance.wholePersonConclusions).toBe(false);
    expect(summary.governance.persistenceAuthority).toBe(false);
  });
  test('R6 grants no causal, predictive, diagnostic, identity, or third-party interiority authority', () => {
    expect(summary.governance.causalAuthority).toBe(false);
    expect(summary.governance.predictionAuthority).toBe(false);
    expect(summary.governance.diagnosticAuthority).toBe(false);
    expect(summary.governance.identityAuthority).toBe(false);
    expect(summary.governance.thirdPartyInteriorityAuthority).toBe(false);
  });
});
