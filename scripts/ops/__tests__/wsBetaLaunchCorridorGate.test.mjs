import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {inspectCandidate,CHECKS} from '../wsBetaLaunchCorridorGate.mjs';

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
 assert.equal(r.defaultOffLegacyIngressGuardsPresent,true);
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
