import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-01/r18/r18-summary.json'),'utf8'
));

describe('AIN-AETHER-01R18 generated evidence',()=>{
  test('is bound to exact R17 parent',()=>{
    expect(summary.parentR17).toBe('cd4faae325db6abeadfe5edd9851459bcd4c7a34');
  });
  test('conflict stays open by default with no selected winner',()=>{
    expect(summary.openConflict).toBe(true);
    expect(summary.openConflictSelected).toBeNull();
    expect(summary.falseConsensus).toBe(false);
  });
  test('human memory and instrument record both remain preserved',()=>{
    expect(summary.humanMemoryPreserved).toBe(true);
    expect(summary.instrumentRecordPreserved).toBe(true);
  });
  test('explicit rule can select without erasing conflict history',()=>{
    expect(summary.explicitRuleSelected).toBe('clock:1');
    expect(summary.explicitRuleReason).toBe('explicit_rule_prefer_instrument_exact_timestamp');
    expect(summary.conflictHistoryPreservedAfterRule).toBe(true);
  });
  test('uncontested evidence can be selected without forced collapse',()=>{
    expect(summary.uncontestedSelected).toBe('journal:2');
    expect(summary.forcedCollapse).toBe(false);
    expect(summary.allValid).toBe(true);
  });
});