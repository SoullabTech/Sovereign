/**
 * This is the ACTUAL source gate, not the mocked admission used to prove
 * potential code behavior in the G2-3C synthetic route tests.
 */
import { isG2MemberAuthoringReleaseAdmitted } from '../g2MemberAuthoringRelease';
describe('G2-3C source release custody',()=>{
  it('is not enabled by a schema migration, tier, cookie, env or test fixture',()=>{
    expect(isG2MemberAuthoringReleaseAdmitted()).toBe(false);
  });
});
