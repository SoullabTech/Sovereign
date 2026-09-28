import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-LIVE-ADAPTER-01/r6/r6-summary.json'),'utf8'
));

describe('AIN-AETHER-LIVE-ADAPTER-01R6 generated evidence',()=>{
  test('is bound to exact live-adapter R5 parent',()=>{
    expect(summary.parentR5).toBe('b48fbd8a1f6e9aafb2604f06c795b0fc571d0a0b');
  });
  test('all fixture live-adapter closure invariants pass',()=>{
    expect(summary.passingInvariants).toBe(summary.invariantCount);
    expect(summary.allPass).toBe(true);
    expect(summary.contradictionRefs).toEqual([]);
  });
  test('closure standing is fixture-live-adapter scoped only',()=>{
    expect(summary.standing).toBe('closed_for_fixture_live_adapter_scope');
  });
  test('no real-data or external authority is opened',()=>{
    expect(summary.realConnectorAuthorized).toBe(false);
    expect(summary.realMemberDataRead).toBe(false);
    expect(summary.persistenceAuthorized).toBe(false);
    expect(summary.memberFacingDeliveryAuthorized).toBe(false);
    expect(summary.maiaPromptMutationAuthorized).toBe(false);
    expect(summary.networkSideEffect).toBe(false);
    expect(summary.productionAuthority).toBe(false);
  });
});