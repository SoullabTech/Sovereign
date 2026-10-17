/** R63 held admission + encrypted private review do not imply an Apply grant. */
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
const file=(path:string)=>readFileSync(join(process.cwd(),path),'utf8');
describe('R63 unmounted private-author review law',()=>{
 const r63=file('scripts/ops/wsBetaR63JoinedAdmissionPrivatePG16.py');
 const joined=file('scripts/ops/__tests__/r47PrivateEditorialPG16.test.ts');
 const held=file('lib/writersStudio/recovery/heldNextAuthorAdmissionR61.ts');
 const privateService=file('lib/writersStudio/recovery/heldRealPrivateEditorialR57.ts');
 it('reuses R57 disposable SQL and ciphertext custody rather than adding a new issuer',()=>{
  expect(r63).toContain('wsBetaR57PrivateCurrentSessionPG16.py');
  expect(r63).toContain("'R63_JOINT_HELD_PRIVATE_FIXTURE':'fictional-only'");
  expect(r63).toContain("'R61_HELD_AUTHOR_POST_FIXTURE':'fictional-only'");
  expect(r63).toContain("'NODE_ENV':'test'");
  expect(r63).toContain('R63_EXACT_SOURCE_REQUIRES_CLEAN_WORKTREE');
  expect(r63).toContain('R63_TESTED_SOURCE_SHA');
 });
 it('keeps both source-compiled real-member activation flags off',()=>{
  expect(held).toContain('R61_REAL_AUTHOR_POST_ENABLED=false');
  expect(privateService).toContain('R57_REAL_PRIVATE_EDITORIAL_REVIEW_ENABLED=false');
  expect(joined).toContain("R63_JOINT_HELD_PRIVATE_FIXTURE==='fictional-only'");
 });
 it('denies any writing permission in R61 before separately reopening encrypted R47',()=>{
  const a=joined.indexOf('inspectHeldFictionalAuthorPostR61(request)');
  const b=joined.indexOf('reopenHeldRealPrivateEditorialR57(makeInput(declared))');
  expect(a).toBeGreaterThan(0);
  expect(b).toBeGreaterThan(a);
  expect(joined).toContain("response.status).toBe(423)");
  expect(joined).toContain('canSave:false,canApply:false,canUndo:false');
  expect(joined).toContain('R63_JOINED_SQL_POST_PRIVATE_PREVIEW_WITHDRAWAL_PASS');
  expect(joined).not.toContain('submitHeldSignedApplyR46(');
  expect(joined).not.toContain('submitHeldUndoR47(');
 });
 it('refuses after immutable consent withdrawal without deleting proposal or Draft',()=>{
  expect(joined).toContain("expect(await r63Held(WORK)).toBe('unavailable')");
  expect(joined).toContain('const withdrawn=await reopenHeldRealPrivateEditorialR57');
  expect(joined).toContain('writers_studio_r47_private_review WHERE work_id=$1');
  expect(joined).toContain('writers_studio_r35_draft_versions WHERE work_id=$1');
 });
});
