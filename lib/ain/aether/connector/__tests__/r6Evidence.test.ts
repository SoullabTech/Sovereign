import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-CONNECTOR-01/r6/r6-summary.json'),'utf8'
));

describe('AIN-AETHER-CONNECTOR-01R6 generated evidence',()=>{
  test('is bound to exact connector R5 parent',()=>{
    expect(summary.parentConnectorR5).toBe('8e7826314e2d21f96561f5e388693c26b7ba5f48');
  });

  test('valid token is consumed by zero-IO rehearsal sink',()=>{
    expect(summary.rehearsed).toBe(true);
    expect(summary.tokenConsumed).toBe(true);
    expect(summary.receiptFingerprint).toBe(summary.tokenFingerprint);
  });

  test('rehearsal has zero connector IO and zero record read',()=>{
    expect(summary.connectorIoAttempted).toBe(false);
    expect(summary.externalNetworkCall).toBe(false);
    expect(summary.executionOccurred).toBe(false);
    expect(summary.recordReadExecuted).toBe(false);
    expect(summary.recordCountRead).toBe(0);
  });

  test('rehearsal has zero persistence, delivery, MAIA mutation, or production authority',()=>{
    expect(summary.persisted).toBe(false);
    expect(summary.memberFacingDelivery).toBe(false);
    expect(summary.maiaPromptMutated).toBe(false);
    expect(summary.productionAuthority).toBe(false);
  });

  test('expired token and plan drift fail before rehearsal',()=>{
    expect(summary.expiredRehearsed).toBe(false);
    expect(summary.expiredErrors).toContain('token_expired');
    expect(summary.driftedRehearsed).toBe(false);
    expect(summary.driftedErrors).toContain('token_fingerprint_mismatch');
  });
});