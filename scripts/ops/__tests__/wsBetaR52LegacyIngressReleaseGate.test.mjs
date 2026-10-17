import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {inspectR52} from '../wsBetaR52LegacyIngressReleaseGate.mjs';

const root=resolve(process.cwd());
const manuscript='app/api/sovereign/manuscripts/route.ts';
const draft='app/api/sovereign/manuscripts/[id]/draft/route.ts';
const keep='app/api/sovereign/manuscripts/[id]/keeps/route.ts';
const modulePath='lib/writersStudio/release/heldLegacyWriterFenceR52.ts';
const source=(name)=>readFileSync(join(root,name),'utf8');
const override=(name,transform)=>{
 const newSource=transform(source(name));
 assert.notEqual(newSource,source(name),'fixture did not change source');
 return inspectR52(root,{read:(base,path)=>
  path===name?newSource:readFileSync(join(base,path),'utf8')});
};
test('actual R52 route snapshot is complete but refuses beta release',()=>{
 const r=inspectR52(root);
 assert.equal(r.status,'R52_DEFAULT_OFF_LEGACY_RELEASE_HOLD');
 assert.equal(r.legacyWriterRoutes,12);
 assert.equal(r.guardedWriteMethods,13);
 assert.equal(r.relatedUnmigratedCustodySurfaces,2);
 assert.equal(r.failures.length,0);
 assert.equal(r.memberDataTouched,false);
 assert.equal(r.releaseApproved,false);
});
test('removed guarded draft autosave must cause drift',()=>{
 const r=override(draft,s=>s.replace(
  'const r52Hold = await holdLegacyWriterForVerifiedMemberR52(memberId);',
  'const r52Hold = null;'));
 assert.equal(r.status,'R52_FENCE_DRIFT_HOLD');
 assert.ok(r.failures.some(x=>x.includes('boundary_position_or_count_drift')));
});
test('a missing route import is release drift',()=>{
 const r=override(keep,s=>s.replace(
  "from '@/lib/writersStudio/release/heldLegacyWriterFenceR52'",
  "from '@/lib/writersStudio/release/not-yet-approved'"));
 assert.ok(r.failures.some(x=>x.includes('no_pilot_boundary_import')));
});
test('moving the hold behind SQL cannot become safe',()=>{
 const r=override(draft,s=>s.replace(
  '  const r52Hold = await holdLegacyWriterForVerifiedMemberR52(memberId);',
  '  const r52Hold = null;').replace(
  'UPDATE manuscript_working_drafts',
  'UPDATE manuscript_working_drafts\n await holdLegacyWriterForVerifiedMemberR52(memberId);'));
 assert.equal(r.status,'R52_FENCE_DRIFT_HOLD');
});
test('offline Cabin writes must be stopped separately',()=>{
 const r=override(manuscript,s=>s.replace(
  'const r52CabinHold = holdLegacyOfflineCabinWriteR52();',
  'const r52CabinHold = null;'));
 assert.ok(r.failures.includes('offline_cabin_bypass'));
});
test('accidentally gating the Keep deletion path is drift',()=>{
 const r=override(keep,s=>s.replace(
  'export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {',
  'export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {\n  await holdLegacyWriterForVerifiedMemberR52(memberId);'));
 assert.ok(r.failures.some(x=>x.includes('read_or_privacy_delete_accidentally_fenced')));
});
test('activating by source edit cannot be certified as merely default-off',()=>{
 const r=override(modulePath,s=>s.replace(
  'R52_REAL_LEGACY_PILOT_FENCE_ENABLED=false as const',
  'R52_REAL_LEGACY_PILOT_FENCE_ENABLED=true as const'));
 assert.ok(r.failures.includes('pilot_fence_was_activated_or_modified'));
});
test('removing the no-I/O default-OFF branch is detected',()=>{
 const r=override(modulePath,s=>s.replace(
  'if(!R52_REAL_LEGACY_PILOT_FENCE_ENABLED)return null;',
  'if(process.env.R52_ENABLED!==\"1\")return null;'));
 assert.ok(r.failures.includes('default_off_no_io_precondition_changed'));
});
test('changed writer sink marker forces route/source drift',()=>{
 const r=override(draft,s=>s.replaceAll(
  'UPDATE manuscript_working_drafts',
  'R52_MOVED_WRITER_SINK_MARKER'));
 assert.equal(r.status,'R52_FENCE_DRIFT_HOLD');
});
test('source-only production release gate exits 2 even with all guards wired',()=>{
 const result=spawnSync(process.execPath,[
  'scripts/ops/wsBetaR52LegacyIngressReleaseGate.mjs',
  '--release-gate'],{cwd:root,encoding:'utf8',timeout:9000});
 assert.equal(result.status,2);
 const report=JSON.parse(result.stdout);
 assert.equal(report.status,'R52_DEFAULT_OFF_LEGACY_RELEASE_HOLD');
 assert.equal(report.releaseApproved,false);
});
