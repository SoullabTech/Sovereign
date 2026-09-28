import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-01/r14/r14-summary.json'),'utf8'
));

describe('AIN-AETHER-01R14 generated evidence',()=>{
  test('is bound to exact R13 parent',()=>{
    expect(summary.parentR13).toBe('6140432bf829c4c1c83a2adfacee4da74215b9a3');
  });
  test('lineage has exactly one active head',()=>{
    expect(summary.activeHeadCount).toBe(1);
    expect(summary.v2Active).toBe(true);
  });
  test('prior repairs remain preserved',()=>{
    expect(summary.v1Preserved).toBe(true);
    expect(summary.appendOnly).toBe(true);
  });
  test('rollback creates a new head without rewriting history',()=>{
    expect(summary.rollbackHead).toBe('repair:v3-return-to-v1');
    expect(summary.rollbackPreservedOriginal).toBe(true);
  });
  test('lineage validates before and after rollback',()=>{
    expect(summary.valid).toBe(true);
    expect(summary.rollbackValid).toBe(true);
  });
});