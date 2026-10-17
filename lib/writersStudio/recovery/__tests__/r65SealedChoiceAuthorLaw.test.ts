/** R65 cannot turn R47 private ciphertext into a standing Apply permission. */
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
const read=(p:string)=>readFileSync(join(process.cwd(),p),'utf8');
describe('R65 source boundary: encrypted private choice before one-use Apply',()=>{
 const r65=read('scripts/ops/wsBetaR65SealedAuthorPG16.ts');
 const driver=read('scripts/ops/wsBetaR55ConvergedPc3PG16.ts');
 const physical=read('scripts/ops/__tests__/r39ActualSignedSectionPG16.test.ts');
 const privateReview=read('lib/writersStudio/recovery/heldRealPrivateEditorialR57.ts');
 const r56=read('lib/writersStudio/recovery/heldRealSessionWorkAdmissionR56.ts');
 it('requires exact simultaneous fictional opt-ins and test runtime',()=>{
  for(const marker of ['R65_PRIVATE_APPROVED_AUTHOR_FIXTURE','R64_REAL_SESSION_AUTHOR_FIXTURE',
   'R55_REAL_PC3_CONVERGENCE_FIXTURE'])expect(r65).toContain(marker);
  expect(r65).toContain("process.env.NODE_ENV!=='test'");
  expect(privateReview).toContain('R57_REAL_PRIVATE_EDITORIAL_REVIEW_ENABLED=false');
  expect(r56).toContain('R56_REAL_PROTECTED_WRITER_ENABLED=false');
 });
 it('keeps the R64 acceptance and original disposable R48 custody intact',()=>{
  expect(driver).toContain('ws-r35-physical-r48-r55-');
  expect(driver).toContain("R65?\n 'R65_SEALED_PRIVATE_AUTHOR_APPLY_UNDO_20261017.json'");
  expect(driver).toContain("R54_PC3_BROWSER_FIXTURE:'fictional-only'");
  expect(driver).toContain('R65 exact two immutable verified private editorial records remain sealed');
 });
 it('only derives R53 selected alternative from freshly decrypted private review',()=>{
  expect(physical).toContain('recordHeldPrivateReviewR47({');
  expect(physical).toContain('reopenHeldRealPrivateEditorialR57({');
  expect(physical).toContain("action==='review'||action==='apply'");
  expect(physical).toContain('r65Proposed=currentPrivate.proposedPassage');
  expect(physical).toContain("r65Proposed!==currentPrivate.proposedPassage");
  expect(physical).toContain("return {kind:'refused',reason:'r65_private_review_not_current'");
  expect(physical).toContain('R65_SEALED_CHOICE_META');
 });
 it('preserves separately approved Undo and refuses spent/old-generation private replay',()=>{
  expect(physical).toContain("r65Actions).toEqual(['review','apply'])");
  expect(physical).toContain("kind:'held_only_refused',canApply:false,canRestore:false");
  expect(physical).toContain('verifiedActions:admittedActions.length');
  expect(privateReview).toContain("return hold('current_authority_changed')");
 });
});
