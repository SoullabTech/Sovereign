import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-01/r11/r11-summary.json'),'utf8'
));

describe('AIN-AETHER-01R11 generated evidence',()=>{
  test('is bound to the exact R10 parent',()=>{
    expect(summary.parentR10).toBe('b8b26c319fbcf578455c03e4f3669401c87d4017');
  });
  test('all frozen held-out machine expectations are met',()=>{
    expect(summary.machineExpectationPassCount).toBe(summary.frozenCaseCount);
    expect(summary.allMachineExpectationsMet).toBe(true);
  });
  test('beautiful unsupported temptation is refused without provenance',()=>{
    expect(summary.unsupportedTemptationRefused).toBe(true);
    expect(summary.unsupportedTemptationHasNoProvenance).toBe(true);
  });
  test('admitted cases remain provenance-bearing',()=>{
    expect(summary.admittedCasesHaveProvenance).toBe(true);
  });
  test('human semantic review remains pending rather than machine-certified',()=>{
    expect(summary.allHumanReviewsPending).toBe(true);
    expect(summary.humanAdjudicationOptions).toContain('beautiful_but_unsupported');
    expect(summary.humanAdjudicationOptions).toContain('technically_grounded_but_lifeless');
  });
});
