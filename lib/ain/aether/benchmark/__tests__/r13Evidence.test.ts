import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-01/r13/r13-summary.json'),'utf8'
));

describe('AIN-AETHER-01R13 generated evidence',()=>{
  test('is bound to the exact R12 parent',()=>{
    expect(summary.parentR12).toBe('f8c6ea19aede44501521651892ea1134500ca33a');
  });
  test('grounded human repair may become active',()=>{
    expect(summary.acceptedRepair).toBe(true);
    expect(summary.acceptedRepairPostureValid).toBe(true);
    expect(summary.acceptedRepairSemanticValid).toBe(true);
  });
  test('causal and unsupported human repairs remain refused',()=>{
    expect(summary.causalRepairRefused).toBe(true);
    expect(summary.unsupportedRepairRefused).toBe(true);
    expect(summary.unsupportedRepairErrors).toContain('unsupported_related_pair:family::body');
  });
  test('repair does not mutate machine witness or human review record',()=>{
    expect(summary.machineWitnessMutated).toBe(false);
    expect(summary.humanReviewRecordMutated).toBe(false);
  });
  test('final meaning remains member-owned',()=>{
    expect(summary.memberOwnsFinalMeaning).toBe(true);
  });
});