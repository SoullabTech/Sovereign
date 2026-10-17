import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {inspectCandidate,CHECKS,STANDARD_PRIVATE_BETA_REQUIRED,SOVEREIGN_FUTURE_UPGRADE}
 from '../wsBetaLaunchCorridorGate.mjs';

const ROOT=resolve(process.cwd());
const GATE=resolve(ROOT,'scripts/ops/wsBetaLaunchCorridorGate.mjs');

test('the exact canonical UI + held encrypted journey are present in one source, but no beta is approved',()=>{
 const r=inspectCandidate(ROOT);
 assert.equal(r.protocol,'soullab.ws.beta.one-source-release-corridor.v1');
 assert.equal(r.codeContract,'SOURCE_CONVERGED_HOLD');
 assert.equal(r.candidateRelease,'HOLD');
 assert.equal(r.releaseApproved,false);
 assert.equal(r.canonicalSourceCheckCount,CHECKS.length);
 assert.equal(r.canonicalSourceChecksPassed,CHECKS.length);
 assert.equal(r.realReadOnlyWorkReadinessPresent,true);
 assert.equal(r.explicitMemberWorkRelationshipVerifierPresent,true);
 assert.equal(r.readOnlyEncryptedMetadataObserverPresent,true);
 assert.equal(r.actualEditorUXGuardsPresent,true);
 assert.equal(r.actualNextBrowserFixturePresent,true);
 assert.equal(r.nativeAuthorJourneyDefaultOffPresent,true);
 assert.equal(r.specificRealSessionWorkReviewHeldPresent,true);
 assert.equal(r.actualNextAndHeldAuthorSamePGFixturePresent,true);
 assert.equal(r.defaultOffLegacyIngressGuardsPresent,true);
 assert.equal(r.standardPrivateBeta.kind,'conventional_managed_security_beta');
 assert.equal(r.standardPrivateBeta.independentSelfHostedKmsPrerequisite,false);
 assert.equal(r.standardPrivateBeta.currentQualification,'OPERATIONAL_EVIDENCE_HOLD');
 assert.equal(r.standardPrivateBeta.safetySourcePresent,true);
 assert.equal(r.atomicConventionalManuscriptImportSourcePresent,true);
 assert.equal(r.pastedSourceOnceOnlyOriginalAndReceiptPresent,true);
 assert.equal(r.privateMemberGetRoutesCount,20);
 assert.equal(r.privateMemberGetRoutesProtectedCount,20);
 assert.deepEqual(r.privateMemberGetUnprotected,[]);
 assert.equal(r.standardPrivateBeta.productionStorageVerified,false);
 assert.equal(r.standardPrivateBeta.encryptedBackupsAndRestoreVerified,false);
 assert.equal(r.standardPrivateBeta.realAuthorWritingCertified,false);
 assert.equal(r.standardPrivateBeta.releaseApproved,false);
 assert.deepEqual(r.standardPrivateBeta.required,STANDARD_PRIVATE_BETA_REQUIRED);
 assert.equal(r.sovereignUpgrade.status,'PRESERVED_FOR_LATER');
 assert.equal(r.sovereignUpgrade.productionEnabled,false);
 assert.deepEqual(r.sovereignUpgrade.requirements,SOVEREIGN_FUTURE_UPGRADE);
 assert.equal(r.guardedLegacyWriteMethods,13);
 assert.equal(r.knownLegacyWriterRoutes,12);
 assert.equal(r.additionalCustodySurfaces,2);
 assert.deepEqual(r.activeProtectedRouteBindings,[]);
 assert.ok(r.outstandingReleaseGates.includes('actual_authenticated_writer_routes_not_protected'));
 assert.ok(r.outstandingReleaseGates.includes('offsite_original_draft_private_review_and_key_restore_unverified'));
 assert.equal(r.memberDataTouched,false);
});

test('tampered or unmounted canonical author controller is source DRIFT, never a successful release',()=>{
 const file=resolve(ROOT,'app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx');
 const r=inspectCandidate(ROOT,{readText:path=>
  path===file?'// fictional changed route with no Work support':readFileSync(path,'utf8')});
 assert.equal(r.codeContract,'SOURCE_DRIFT_HOLD');
 assert.equal(r.releaseApproved,false);
 assert.deepEqual(r.changedContracts.map(x=>x.file),[
  'app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx']);
});

test('removing real read-only readiness is source drift, never permission to edit',()=>{
 const file=resolve(ROOT,
 'app/api/sovereign/writers-studio/manuscripts/[manuscriptId]/protected-readiness/route.ts');
 const r=inspectCandidate(ROOT,{readText:target=>
  target===file?'// deliberately missing real server preflight':readFileSync(target,'utf8')});
 assert.equal(r.codeContract,'SOURCE_DRIFT_HOLD');
 assert.equal(r.realReadOnlyWorkReadinessPresent,false);
 assert.equal(r.releaseApproved,false);
 assert.ok(r.changedContracts.some(x=>x.file.includes('protected-readiness')));
});

test('loss of request-token verification or explicit Work declarations is release DRIFT',()=>{
 const file=resolve(ROOT,
  'lib/writersStudio/release/verifyWriterReadinessScope.ts');
 for(const damaged of [
   '// fake helper with ambient next/headers cookies',
   'getMemberIdFromSessionToken but not the declared link lookup',
 ]){
  const r=inspectCandidate(ROOT,{readText:target=>
   target===file?damaged:readFileSync(target,'utf8')});
  assert.equal(r.codeContract,'SOURCE_DRIFT_HOLD');
  assert.equal(r.explicitMemberWorkRelationshipVerifierPresent,false);
  assert.equal(r.releaseApproved,false);
 }
});

test('removing exact Source→Draft metadata observer becomes release DRIFT',()=>{
 const file=resolve(ROOT,
  'lib/writersStudio/release/inspectProtectedManifestLineage.ts');
 const r=inspectCandidate(ROOT,{readText:target=>
   target===file?'// fake custody reader':readFileSync(target,'utf8')});
 assert.equal(r.codeContract,'SOURCE_DRIFT_HOLD');
 assert.equal(r.readOnlyEncryptedMetadataObserverPresent,false);
 assert.equal(r.candidateRelease,'HOLD');
 assert.equal(r.releaseApproved,false);
});

test('breaking actual PC3 editor selection/posture controls never produces release GO',()=>{
 for(const relativeName of [
  'app/dev/writers-studio-pc3-live/EditorialDancePanel.tsx',
  'lib/writersStudio/exactRenderedPassageR52.ts',
  'app/dev/writers-studio-p4r1/p4r1-live.css',
 ]){
  const file=resolve(ROOT,relativeName);
  const r=inspectCandidate(ROOT,{readText:target=>
   target===file?'// removed author-control contract':
    readFileSync(target,'utf8')});
  assert.equal(r.codeContract,'SOURCE_DRIFT_HOLD');
  assert.equal(r.actualEditorUXGuardsPresent,false);
  assert.equal(r.candidateRelease,'HOLD');
  assert.equal(r.releaseApproved,false);
 }
});

test('missing the real Next browser test is source DRIFT',()=>{
 const file=resolve(ROOT,'scripts/ops/wsBetaR52ActualStudioNextPG16.py');
 const r=inspectCandidate(ROOT,{readText:target=>
  target===file?'// no actual Next test':readFileSync(target,'utf8')});
 assert.equal(r.codeContract,'SOURCE_DRIFT_HOLD');
 assert.equal(r.actualNextBrowserFixturePresent,false);
 assert.equal(r.releaseApproved,false);
});

test('native PC3 author controls require the exact default-OFF R54 and held R53 backend',()=>{
 for(const relativeName of [
   'app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx',
   'app/dev/writers-studio-pc3-live/P4R1ProtectedAuthorJourneyR54.tsx',
   'lib/writersStudio/recovery/heldCanonicalAuthorJourneyR53.ts',
 ]){
  const file=resolve(ROOT,relativeName);
  const r=inspectCandidate(ROOT,{readText:target=>
   target===file?'// deleted author action, no verified server boundary':
     readFileSync(target,'utf8')});
  assert.equal(r.codeContract,'SOURCE_DRIFT_HOLD');
  assert.equal(r.nativeAuthorJourneyDefaultOffPresent,false);
  assert.equal(r.releaseApproved,false);
  assert.equal(r.candidateRelease,'HOLD');
 }
});

test('missing R56 same-database protected consent/Work witness or Next read-only join is source DRIFT',()=>{
 const items=[
  ['lib/writersStudio/recovery/heldRealSessionWorkAdmissionR56.ts',
   'specificRealSessionWorkReviewHeldPresent'],
  ['scripts/ops/wsBetaR56SessionWorkPG16.ts',
   'actualNextAndHeldAuthorSamePGFixturePresent'],
 ];
 for(const [relativeName,field] of items){
  const file=resolve(ROOT,relativeName);
  const r=inspectCandidate(ROOT,{readText:target=>
    target===file?'// deleted real-session Work preflight':
      readFileSync(target,'utf8')});
  assert.equal(r.codeContract,'SOURCE_DRIFT_HOLD');
  assert.equal(r[field],false);
  assert.equal(r.releaseApproved,false);
  assert.equal(r.candidateRelease,'HOLD');
 }
});

test('standard privacy no-cache promises and founder phased scope are not removable or GO by source alone',()=>{
 const actual=[
  'docs/programme/WS_STANDARD_FIRST_BETA_AND_SOVEREIGN_UPGRADE_DECISION_20261017.md',
  'lib/writersStudio/release/privateWriterNoStore.ts',
  'app/api/sovereign/manuscripts/route.ts',
  'app/api/sovereign/manuscripts/[id]/route.ts',
  'app/api/sovereign/manuscripts/[id]/draft/route.ts',
  'app/api/sovereign/living-works/route.ts',
  'app/api/writers-studio/editorial/thread/route.ts',
  'app/api/writers-studio/editorial/relationships/route.ts',
 ];
 for(const relativeName of actual){
  const file=resolve(ROOT,relativeName);
  const modified=inspectCandidate(ROOT,{readText:target=>
   target===file?'// erased private response security or phased security law':
    readFileSync(target,'utf8')});
  assert.equal(modified.codeContract,'SOURCE_DRIFT_HOLD');
  assert.equal(modified.candidateRelease,'HOLD');
  assert.equal(modified.releaseApproved,false);
  assert.equal(modified.standardPrivateBeta.safetySourcePresent,false);
 }
});

test('an unprotected manuscript history GET turns the standard beta release audit to DRIFT',()=>{
 const file=resolve(ROOT,'app/api/sovereign/manuscripts/[id]/draft/revisions/route.ts');
 const result=inspectCandidate(ROOT,{readText:target=>
  target===file?'export async function GET(request) { return new Response(null); }':
   readFileSync(target,'utf8')});
 assert.equal(result.codeContract,'SOURCE_DRIFT_HOLD');
 assert.equal(result.candidateRelease,'HOLD');
 assert.equal(result.privateMemberGetRoutesCount,20);
 assert.equal(result.privateMemberGetRoutesProtectedCount,19);
 assert.ok(result.privateMemberGetUnprotected.includes(
  'app/api/sovereign/manuscripts/[id]/draft/revisions/route.ts'));
 assert.equal(result.releaseApproved,false);
});

test('removing confirmed manuscript transaction or redacted real POST logging forces release DRIFT',()=>{
 for(const relativeName of [
  'lib/manuscript/source/persistConfirmedSectionsR63.ts',
  'app/api/sovereign/manuscripts/route.ts',
 ]){
  const path=resolve(ROOT,relativeName);
  const r=inspectCandidate(ROOT,{readText:target=>
   target===path?'// removed atomic import and redacted error handler':
    readFileSync(target,'utf8')});
  assert.equal(r.codeContract,'SOURCE_DRIFT_HOLD');
  assert.equal(r.atomicConventionalManuscriptImportSourcePresent,false);
  assert.equal(r.candidateRelease,'HOLD');
  assert.equal(r.releaseApproved,false);
 }
});

test('pasted Source one-use confirmation, receipt tombstone and real Press Save cannot be replaced',()=>{
 for(const relativeName of [
  'lib/manuscript/source/persistConfirmedPasteR65.ts',
  'database/migrations/20261017000001_manuscript_import_confirmation_receipts.sql',
  'app/press/manuscript/page.tsx',
  'app/api/sovereign/manuscripts/route.ts',
 ]){
  const file=resolve(ROOT,relativeName);
  const modified=inspectCandidate(ROOT,{readText:target=>
   target===file?'// removed exact Source/confirmation identifier':
    readFileSync(target,'utf8')});
  assert.equal(modified.codeContract,'SOURCE_DRIFT_HOLD');
  assert.equal(modified.pastedSourceOnceOnlyOriginalAndReceiptPresent,false);
  assert.equal(modified.candidateRelease,'HOLD');
  assert.equal(modified.releaseApproved,false);
 }
});

test('missing one default-off old-write guard is source DRIFT, never beta GO',()=>{
 const bad=inspectCandidate(ROOT,{legacyIngressReport:{
  status:'R52_FENCE_DRIFT_HOLD',
  legacyWriterRoutes:12,guardedWriteMethods:12,
  failures:['boundary_position_or_count_drift:synthetic'],releaseApproved:false,
 }});
 assert.equal(bad.codeContract,'SOURCE_DRIFT_HOLD');
 assert.equal(bad.defaultOffLegacyIngressGuardsPresent,false);
 assert.equal(bad.candidateRelease,'HOLD');
 assert.equal(bad.releaseApproved,false);
});

test('old writing-route inventory drift refuses candidate acceptance',()=>{
 const actual=inspectCandidate(ROOT);
 const bad=inspectCandidate(ROOT,{legacyReport:{
  status:'INVENTORY_DRIFT_HOLD',
  reconstructiveWriterCount:actual.knownLegacyWriterRoutes,
  additionalCustodySurfaceCount:actual.additionalCustodySurfaces,
  knownRoutes:Array(14).fill({}),
  unlisted:['app/api/sovereign/manuscripts/synthetic-fake/route.ts'],
  missing:[],drift:[],
 }});
 assert.equal(bad.codeContract,'SOURCE_DRIFT_HOLD');
 assert.equal(bad.candidateRelease,'HOLD');
});

test('release gate returns nonzero 2 on converged, still-unprotected source',()=>{
 const r=spawnSync(process.execPath,[GATE,'--release-gate'],{
  cwd:ROOT,encoding:'utf8',timeout:12000,
 });
 assert.equal(r.status,2);
 const data=JSON.parse(r.stdout);
 assert.equal(data.codeContract,'SOURCE_CONVERGED_HOLD');
 assert.equal(data.candidateRelease,'HOLD');
 assert.equal(data.activeProtectedRouteBindings.length,0);
});

test('unknown modes cannot weaken the safety gate',()=>{
 const r=spawnSync(process.execPath,[GATE,'--go-now'],{
  cwd:ROOT,encoding:'utf8',timeout:12000,
 });
 assert.equal(r.status,64);
 assert.match(r.stderr,/Expected --audit or --release-gate/);
});
