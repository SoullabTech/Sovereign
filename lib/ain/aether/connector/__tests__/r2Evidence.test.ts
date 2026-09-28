import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-CONNECTOR-01/r2/r2-summary.json'),'utf8'
));

describe('AIN-AETHER-CONNECTOR-01R2 generated evidence',()=>{
  test('is bound to exact connector R1 parent',()=>{
    expect(summary.parentConnectorR1).toBe('9abb694d4bd0d6c26e2acca46b0187fa5cb42868');
  });
  test('manifest is explicitly minimum-necessary and zero-read',()=>{
    expect(summary.minimumNecessary).toBe(true);
    expect(summary.zeroRecordRead).toBe(true);
    expect(summary.sourceClassCount).toBe(2);
  });
  test('allowlisted field request passes',()=>{
    expect(summary.allowedDryRun).toBe(true);
    expect(summary.allowedFields).toEqual(expect.arrayContaining([
      'recordRef','memberRef','text','createdAt','domain',
    ]));
  });
  test('undeclared field is refused',()=>{
    expect(summary.undeclaredAllowed).toBe(false);
    expect(summary.undeclaredErrors).toContain('field_not_allowlisted:email');
  });
  test('field adjudication still reads zero records',()=>{
    expect(summary.recordReadExecuted).toBe(false);
    expect(summary.recordCountRead).toBe(0);
  });
});