/** R64 must protect the existing default-OFF live writer source. */
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
const src=(p:string)=>readFileSync(join(process.cwd(),p),'utf8');
describe('R64 fictional verified-session author actions',()=>{
  const wrapper=src('scripts/ops/wsBetaR64VerifiedAuthorPG16.ts');
  const pg=src('scripts/ops/wsBetaR55ConvergedPc3PG16.ts');
  const author=src('scripts/ops/__tests__/r39ActualSignedSectionPG16.test.ts');
  const admission=src('lib/writersStudio/recovery/heldRealSessionWorkAdmissionR56.ts');
  it('requires explicit fictional-only and test runtime rather than live activation',()=>{
    expect(wrapper).toContain("R64_REAL_SESSION_AUTHOR_FIXTURE!=='fictional-only'");
    expect(wrapper).toContain("R55_REAL_PC3_CONVERGENCE_FIXTURE!=='fictional-only'");
    expect(wrapper).toContain("process.env.NODE_ENV!=='test'");
    expect(pg).toContain("ws-r35-physical-r48-r55-");
    expect(admission).toContain("ws-r35-physical-r48-r55-");
    expect(pg).toContain("WRITERS_STUDIO_BETA_CONSENT_NOTICE:notice");
    expect(admission).toContain('R56_REAL_PROTECTED_WRITER_ENABLED=false');
    expect(admission).toContain("R64_REAL_SESSION_AUTHOR_FIXTURE==='fictional-only'");
    expect(admission).toContain("R55_REAL_PC3_CONVERGENCE_FIXTURE==='fictional-only'");
  });
  it('requires real R56 PostgreSQL session/consent/Work checks before each fictional browser action',()=>{
    expect(author).toContain('async function checkedR64Action(');
    expect(author).toContain('readHeldRealSessionWorkR56({');
    expect(author).toContain('recheckHeldRealSessionWorkR56(checked,request)');
    expect(author).toContain('await checkedR64Action(workId,');
    expect(author).toContain("if(!admitted)return {kind:'refused'");
    expect(author).toContain('admittedActions.push(action)');
    expect(author).toContain("await checkedR64Action(W18,'apply')");
  });
  it('does not rewrite author-choice, encryption or Undo services into real routes',()=>{
    expect(pg).toContain("R64_SESSION_AUTHOR_META");
    expect(pg).toContain("R64_REVOCATION_META");
    expect(pg).toContain("R54_PC3_BROWSER_FIXTURE:'fictional-only'");
    expect(author).toContain("operationalKms:false,releaseApproved:false");
    expect(author).toContain("R53_REAL_CANONICAL_AUTHOR_JOURNEY_ENABLED");
    expect(src('app/dev/writers-studio-pc3-live/P4R1ProtectedAuthorJourneyR54.tsx'))
      .toContain('R54_REAL_PC3_AUTHOR_JOURNEY_ENABLED=false');
  });
});
