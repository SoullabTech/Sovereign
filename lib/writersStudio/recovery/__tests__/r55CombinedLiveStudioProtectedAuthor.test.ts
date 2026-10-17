/**
 * R55 — exact canonical PC3 source + held private signed author actions:
 * one REVIEWABLE source tree, not a live writer service.
 *
 * These are source and default-off law checks; the genuine local Next.js
 * WebKit and encrypted PG16 Chrome/WebKit checks have their own receipts.
 */
import path from 'node:path';
import {readFileSync,readdirSync} from 'node:fs';
import {R52_REAL_LEGACY_PILOT_FENCE_ENABLED} from '../../release/heldLegacyWriterFenceR52';
import {R53_REAL_CANONICAL_AUTHOR_JOURNEY_ENABLED} from '../heldCanonicalAuthorJourneyR53';
import {R54_REAL_PC3_AUTHOR_JOURNEY_ENABLED} from '@/app/dev/writers-studio-pc3-live/P4R1ProtectedAuthorJourneyR54';
import {R52_REAL_PROTECTED_EDITORIAL_WRITE_ENABLED} from '../../exactRenderedPassageR52';
import {R46_REAL_DURABLE_SIGNED_APPLY_ENABLED} from '../heldDurableSignedApplyR46';
import {R47_REAL_DURABLE_UNDO_ENABLED} from '../heldDurableUndoR47';
const root=process.cwd();
const source=(name:string)=>readFileSync(path.join(root,name),'utf8');
function routes(directory:string):string[]{
 const found:string[]=[];
 for(const entry of readdirSync(directory,{withFileTypes:true})){
  const full=path.join(directory,entry.name);
  if(entry.isDirectory())found.push(...routes(full));
  else if(entry.isFile()&&/^route\.tsx?$/.test(full))found.push(full);
 }
 return found;
}
describe('R55 — R52 actual Writer + R53 signed author + R54 native PC3 and legacy write fence',()=>{
 it('all six real-member authorization flags remain default OFF',()=>{
  expect(R52_REAL_LEGACY_PILOT_FENCE_ENABLED).toBe(false);
  expect(R53_REAL_CANONICAL_AUTHOR_JOURNEY_ENABLED).toBe(false);
  expect(R54_REAL_PC3_AUTHOR_JOURNEY_ENABLED).toBe(false);
  expect(R52_REAL_PROTECTED_EDITORIAL_WRITE_ENABLED).toBe(false);
  expect(R46_REAL_DURABLE_SIGNED_APPLY_ENABLED).toBe(false);
  expect(R47_REAL_DURABLE_UNDO_ENABLED).toBe(false);
 });
 it('canonical /writers-studio host renders genuine PC3 Write/Develop/Review',()=>{
  const page=source('app/writers-studio/page.tsx');
  const host=source('app/dev/writers-studio-p4r1/P4R1StudioHost.tsx');
  expect(page).toContain('<P4R1StudioHost defaultMode="home" />');
  for(const name of ['P4R1WriteEditController','P4R1DevelopController','P4R1ReviewController'])
   expect(host).toContain(name);
 });
 it('true PC3 view retains R54 explicit author panel under compile-time false guard',()=>{
  const view=source('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
  expect(view).toContain('P4R1ProtectedAuthorJourneyR54');
  expect(view).toContain('R54_REAL_PC3_AUTHOR_JOURNEY_ENABLED &&');
  expect(view).toContain('r54ProtectedJourney?:');
  const controller=source('app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx');
  expect(controller).not.toContain('r54ProtectedJourney=');
 });
 it('same true PC3 contenteditable uses R52 source-aligned exact duplicate passage',()=>{
  const view=source('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
  expect(view).toContain('exactRenderedPassageR52(liveBody, editor, range)');
  expect(view).toContain('exactDomPassageR41(liveBody, editor, range)');
  expect(view).toContain('const locus = exact ?? locateUniquePassage');
  expect(view).toContain('props.onHoldPassage(section, picked.start, picked.end, picked.text)');
 });
 it('R53 server author review never trusts the browser for owner/keys/altered prose',()=>{
  const server=source('lib/writersStudio/recovery/heldCanonicalAuthorJourneyR53.ts');
  expect(server).toContain('R53_REAL_CANONICAL_AUTHOR_JOURNEY_ENABLED=false');
  expect(server).toContain('R53_CANONICAL_AUTHOR_FIXTURE');
  expect(server).toContain('reviewHeldDraftAdmissionR38');
  expect(server).toContain('reopenHeldDraftR35');
  expect(server).toContain('R46');
  expect(server).toContain('R47');
 });
 it('R54 UI requires separate explicit Review/Apply/Undo and verified generation',()=>{
  const ui=source('app/dev/writers-studio-pc3-live/P4R1ProtectedAuthorJourneyR54.tsx');
  expect(ui).toContain('R54_REAL_PC3_AUTHOR_JOURNEY_ENABLED=false');
  expect(ui).toContain('Apply');
  expect(ui).toContain('Undo');
  expect(ui).toContain('onVerifiedRevision');
  expect(ui).not.toContain('authorConfirmed:true');
 });
 it('legacy route write stop exists but is not silently activated',()=>{
  const fence=source('lib/writersStudio/release/heldLegacyWriterFenceR52.ts');
  expect(fence).toContain('R52_REAL_LEGACY_PILOT_FENCE_ENABLED=false');
  expect(fence).toContain('R52_CUSTODY_CENSUS_SQL');
  expect(fence).toContain('return null');
  expect(source('scripts/ops/wsBetaR52LegacyIngressReleaseGate.mjs'))
    .toContain('release-gate');
 });
 it('R55 physical fixture requires extra test-only marker in addition to R54 markers',()=>{
  const physical=source('scripts/ops/wsBetaR55ConvergedPc3PG16.ts');
  expect(physical).toContain("process.env.R55_REAL_PC3_CONVERGENCE_FIXTURE!=='fictional-only'");
  expect(physical).toContain("R54_PC3_BROWSER_FIXTURE:'fictional-only'");
  expect(physical).toContain("R55_REAL_PC3_CONVERGENCE_FIXTURE:'fictional-only'");
  expect(physical).toContain('R55_CONVERGED_PC3_ENCRYPTED_BROWSER_20261016');
  const tests=source('scripts/ops/__tests__/r39ActualSignedSectionPG16.test.ts');
  expect(tests).toContain("const inConvergence=process.env.R55_REAL_PC3_CONVERGENCE_FIXTURE==='fictional-only'");
 });
 it('real Next.js WebKit fixture is disabled for real users and never accepts writes',()=>{
  const driver=source('scripts/ops/wsBetaR55ActualCanonicalNextPG16.py');
  const browser=source('scripts/ops/wsBetaR52ActualStudioPlaywright.cjs');
  expect(driver).toContain("FLAGS='R55_REAL_PC3_CONVERGENCE_FIXTURE'");
  expect(driver).toContain("'NEXT_PUBLIC_WS_BETA_REAL_MEMBER_ENABLED':'false'");
  expect(browser).toContain("},423)");
  expect(browser).toContain('persisted:false,releaseApproved:false');
  expect(browser).toContain('external-request-blocked');
 });
 it('no live Next API route imports R53/R54/R55 fixture author services',()=>{
  const connected=routes(path.join(root,'app/api')).filter(f=>
   /heldCanonicalAuthorJourneyR53|P4R1ProtectedAuthorJourneyR54|wsBetaR55ConvergedPc3PG16|R55_REAL_PC3_CONVERGENCE_FIXTURE/
    .test(readFileSync(f,'utf8')));
  expect(connected).toEqual([]);
 });
 it('canonical mobile viewport fix and historical authorized original Source coexist',()=>{
  const css=source('app/dev/writers-studio-p4r1/p4r1-live.css');
  expect(css).toContain('R52 · Canonical mobile Writer product-bar containment');
  expect(css).toContain('overflow-x: auto');
  const bridge=source('lib/writersStudio/recovery/heldSourceDraftBridgeR42.ts');
  expect(bridge).toContain('timingSafeEqual(pending,draft)');
  expect(bridge).toContain('timingSafeEqual(source,draft)');
 });
});
