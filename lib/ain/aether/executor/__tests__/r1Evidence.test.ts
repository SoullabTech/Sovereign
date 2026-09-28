import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-EXECUTOR-01/r1/r1-summary.json'),'utf8'
));

describe('AIN-AETHER-EXECUTOR-01R1 generated evidence',()=>{
  test('is bound to exact connector closure',()=>{
    expect(summary.parentConnectorClosure).toBe('ec65dc2ccd93a2d031a8168c7891c4624b06dd7d');
  });
  test('executes exactly one local fixture record',()=>{
    expect(summary.executed).toBe(true);
    expect(summary.recordRef).toBe('fixture-record:r1:witness');
    expect(summary.recordCountRead).toBe(1);
    expect(summary.tokenConsumed).toBe(true);
  });
  test('fixture executor cannot reach production or network',()=>{
    expect(summary.externalNetworkCall).toBe(false);
    expect(summary.productionReachable).toBe(false);
  });
  test('fixture execution creates no downstream side effects',()=>{
    expect(summary.persisted).toBe(false);
    expect(summary.memberFacingDelivery).toBe(false);
    expect(summary.maiaPromptMutated).toBe(false);
    expect(summary.productionAuthority).toBe(false);
  });
});