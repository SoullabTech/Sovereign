import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-SOURCE-FABRIC-02/r10/r10-summary.json'),'utf8'
));

describe('R10 generated evidence',()=>{
  test('is bound to the exact R9 parent',()=>{
    expect(summary.parentR9).toBe('990fe23d91d9dec8b4f913cd5f98cd783a54095d');
  });

  test('semantic proposition passes fidelity validation',()=>{
    expect(summary.valid).toBe(true);
    expect(summary.sourceCount).toBe(4);
  });

  test('core source ablations remove the semantic proposition',()=>{
    expect(summary.coreAblationsRemove).toBe(true);
  });

  test('historical qualifier can be removed without fabricating current standing',()=>{
    expect(summary.historicalAblationPreservesCore).toBe(true);
  });

  test('contradiction, absence, and uncertainty remain visible',()=>{
    expect(summary.contradictionVisible).toBe(true);
    expect(summary.absenceVisible).toBe(true);
    expect(summary.uncertaintyVisible).toBe(true);
  });

  test('human semantic review is mandatory',()=>{
    expect(summary.humanReviewRequired).toBe(true);
    expect(summary.counterfactualCount).toBe(4);
  });
});
