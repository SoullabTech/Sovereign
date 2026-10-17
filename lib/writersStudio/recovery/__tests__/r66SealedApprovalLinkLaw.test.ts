/** R66 review-only, immutable approval-to-private-ciphertext custody law. */
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
const source=(p:string)=>readFileSync(join(process.cwd(),p),'utf8');
describe('R66 one-use R44 approval to sealed R47 review source invariants',()=>{
 const service=source('lib/writersStudio/recovery/heldSealedApprovalBindingR66.ts');
 const schema=source('docs/ops/WS_R66_PRIVATE_APPROVAL_LINK_REVIEW_ONLY.sql');
 const wrapper=source('scripts/ops/wsBetaR66SealedApprovalPG16.ts');
 const panel=source('app/dev/writers-studio-pc3-live/P4R1ProtectedAuthorJourneyR54.tsx');
 it('can never activate real member writing',()=>{
  expect(service).toContain('R66_REAL_SEALED_AUTHOR_LINK_ENABLED=false');
  expect(service).toContain("process.env.NODE_ENV==='test'");
  expect(service).toContain("R66_SEALED_APPROVAL_LINK_FIXTURE==='fictional-only'");
  expect(wrapper).toContain("R66_EXPLICIT_DISPOSABLE_EXACT_FICTION_REQUIRED");
  expect(panel).toContain('R54_REAL_PC3_AUTHOR_JOURNEY_ENABLED=false');
 });
 it('requires original verified R47 proposal and current R57 session/Work',()=>{
  expect(service).toContain('reopenHeldRealPrivateEditorialR57({');
  expect(service).toContain('reopenHeldPrivateReviewR47(input.privateRead)');
  expect(service).toContain('verifyHeldReviewBindingR44({');
  expect(service).toContain("a.private_state!=='verified'");
  expect(service).toContain("a.approval_state!=='prepared'");
 });
 it('links exact R44 token HMAC to R47 review ID and cipher digest',()=>{
  expect(schema).toContain('token_hmac char(64) PRIMARY KEY');
  expect(schema).toContain('review_id uuid NOT NULL UNIQUE');
  expect(schema).toContain('p.cipher_sha256=NEW.private_cipher_sha256');
  expect(schema).toContain("a.state='prepared'");
  expect(schema).toContain("p.state='verified'");
  expect(schema).toContain("r66_immutable_link_cannot_change");
  expect(service).toContain("R44_PROTOCOL,'opaque-token',token");
  expect(service).toContain('signedFields(link,input.linkSignerSecret)');
  expect(service).toContain('timingSafeEqual(');
 });
 it('cannot grant Apply, Undo, or public writing in a response',()=>{
  expect(service).toContain('releaseApproved:false,canApply:false,canUndo:false');
  expect(service).not.toContain('submitHeldSignedApplyR46(');
  expect(service).not.toContain('submitHeldUndoR47(');
  expect(service).not.toContain('claimHeldAuthorApprovalR44(');
 });
});
