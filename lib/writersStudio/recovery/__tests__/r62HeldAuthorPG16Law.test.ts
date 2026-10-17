/** R62 physical fixture must never loosen accepted real-member gates. */
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
const src=(relative:string)=>readFileSync(join(process.cwd(),relative),'utf8');
describe('R62 held PostgreSQL author POST source law',()=>{
  const driver=src('scripts/ops/wsBetaR56SessionWorkPG16.ts');
  const wrapper=src('scripts/ops/wsBetaR62HeldAuthorPG16.ts');
  const r61=src('lib/writersStudio/recovery/heldNextAuthorAdmissionR61.ts');
  it('R62 runs only as opt-in fiction in a standalone physical driver',()=>{
    expect(wrapper).toContain("R62_HELD_AUTHOR_PG16_FIXTURE!=='fictional-only'");
    expect(wrapper).toContain("R61_HELD_AUTHOR_POST_FIXTURE!=='fictional-only'");
    expect(wrapper).toContain("R56_PHYSICAL_PG16_FIXTURE!=='fictional-only'");
    expect(wrapper).toContain("process.env.NODE_ENV!=='test'");
    expect(driver).toContain("R62_HELD_AUTHOR_PG16_FIXTURE==='fictional-only'");
    expect(driver).toContain('R62_EXACT_FICTIONAL_POST_OPT_IN_REQUIRED');
  });
  it('preserves R56 original physical qualification when not opted in',()=>{
    expect(driver).toContain("R56_VERIFIED_MEMBER_WORK_PG16_");
    expect(driver).toContain('R56_REAL_AUTH_SESSION_WORK_RELATION_PG16_PASS_RELEASE_HOLD');
    expect(driver).toContain("R62_REAL_SQL_HELD_AUTHOR_POST_PASS_RELEASE_HOLD");
    expect(driver).toContain('R56_REAL_MEMBER_DATABASE_REFUSED');
  });
  it('never upgrades a server-only admission to a live Next API route',()=>{
    expect(r61).toContain('export const R61_REAL_AUTHOR_POST_ENABLED=false');
    expect(driver).toContain("await import(");
    expect(driver).toContain("heldNextAuthorAdmissionR61");
    expect(driver).toContain("response.status===423");
    expect(driver).toContain("responseBody.canApply===false");
    expect(driver).toContain("responseBody.canUndo===false");
    expect(driver).toContain('R62 held POST refuses after immutable consent withdrawal');
    expect(driver).toContain('R62 held POST never falls back to plaintext');
    expect(driver).not.toContain('submitHeldSignedApplyR46(');
    expect(driver).not.toContain('submitHeldUndoR47(');
  });
});
