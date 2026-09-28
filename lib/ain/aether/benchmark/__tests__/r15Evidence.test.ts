import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-01/r15/r15-summary.json'),'utf8'
));

describe('AIN-AETHER-01R15 generated evidence',()=>{
  test('is bound to exact R14 parent',()=>{
    expect(summary.parentR14).toBe('770cca7a04c5cc87dabe9bcd01b1f820402f4312');
  });
  test('active and changed explanations are present',()=>{
    expect(summary.activeAnswer).toMatch(/repair:v2/);
    expect(summary.changeAnswer).toMatch(/changed from/i);
  });
  test('why explanation uses recorded reason',()=>{
    expect(summary.whyAnswer).toMatch(/clearer opening to disagree/i);
  });
  test('missing reason is admitted as unknown',()=>{
    expect(summary.missingWhyAnswer).toMatch(/does not record why/i);
    expect(summary.missingWhyUnknowns).toContain('change_reason_not_recorded');
  });
  test('member note and supersession remain provenance-bound',()=>{
    expect(summary.memberSaidAnswer).toMatch(/too mechanical/i);
    expect(summary.supersededAnswer).toContain('repair:v2');
  });
  test('all explanations are explicitly non-reconstructive',()=>{
    expect(summary.allNonReconstructive).toBe(true);
  });
});