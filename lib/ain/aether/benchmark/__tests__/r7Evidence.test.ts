import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-01/r7/r7-summary.json'),'utf8'
));

describe('AIN-AETHER-01R7 generated evidence',()=>{
  test('is bound to the exact R6 parent',()=>{
    expect(summary.parentR6).toBe('619d8f18fe3ca8d637c2246516ab7c9bcef575aa');
  });
  test('member can recognize or reject the gestalt',()=>{
    expect(summary.recognized).toBe('recognized');
    expect(summary.rejected).toBe('rejected');
    expect(summary.rejectedStanding).toBe('insufficient_gestalt');
  });
  test('member can narrow or expand the active gestalt',()=>{
    expect(summary.narrowedRecognition).toBe('reshaped');
    expect(summary.narrowedActive).not.toContain(summary.narrowedRemovedSpiral);
    expect(summary.expandedRecognition).toBe('reshaped');
    expect(summary.expandedActive).toContain(summary.expandedAddedSpiral);
  });
  test('underlying field and relation history are preserved',()=>{
    expect(summary.sourceFieldPreserved).toBe(true);
    expect(summary.relationHistoryPreserved).toBe(true);
  });
  test('final meaning remains member-owned',()=>{
    expect(summary.memberOwnsFinalMeaning).toBe(true);
    expect(summary.allValid).toBe(true);
  });
});
