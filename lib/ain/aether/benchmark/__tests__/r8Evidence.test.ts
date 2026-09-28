import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT=resolve(__dirname,'../../../../..');
const summary=JSON.parse(readFileSync(
  resolve(ROOT,'docs/programme/AIN-AETHER-01/r8/r8-summary.json'),'utf8'
));

describe('AIN-AETHER-01R8 generated evidence',()=>{
  test('is bound to the exact R7 parent',()=>{
    expect(summary.parentR7).toBe('e845d796a59ef2467ee9d6a5d18f19f6c6d64d8c');
  });
  test('field dialogue and post-rejection dialogue both validate',()=>{
    expect(summary.dialogueValid).toBe(true);
    expect(summary.rejectedDialogueValid).toBe(true);
  });
  test('dialogue names non-fit and invites correction',()=>{
    expect(summary.nonfitNamed).toBe(true);
    expect(summary.correctionInvited).toBe(true);
  });
  test('rejection is honored without reasserting the gestalt',()=>{
    expect(summary.rejectionHonored).toBe(true);
  });
  test('pronouncements are refused while reflective inquiry is accepted',()=>{
    expect(summary.forbiddenRefused).toBe(true);
    expect(summary.allowedAccepted).toBe(true);
  });
  test('final meaning remains member-owned',()=>{
    expect(summary.memberOwnsFinalMeaning).toBe(true);
  });
});
