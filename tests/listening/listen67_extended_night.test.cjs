'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const manifest=JSON.parse(read('lib/listening/manifests/night-ground-01-extended-night-v0.1.json'));
const firstNight=JSON.parse(read('lib/listening/manifests/night-ground-01-nicole-first-night-v0.1.json'));

test('Extended Night is an explicit founder-review experience, not hidden autoplay',()=>{
  assert.equal(manifest.manifestId,'night-ground-01-extended-night-v0.1-private-review');
  assert.equal(manifest.title,'Night Ground 01 — Extended Night');
  assert.equal(manifest.status,'private_review');
  assert.equal(manifest.ownerLane,'LISTEN-01#1979');
  assert.equal(manifest.permissions.productionRelease,false);
  assert.equal(manifest.permissions.looping,true);
  assert.equal(manifest.continuation.memberSelectedByExperience,true);
  assert.equal(manifest.acceptance.release,'hold');
});

test('only the final music segment may repeat and the voice remains opening-only',()=>{
  const continuation=manifest.continuation;
  assert.equal(continuation.mode,'loop_final_segment');
  assert.equal(continuation.repeatSegmentIndex,manifest.editions.sequence.length-1);
  assert.equal(continuation.startsAfterMs,manifest.durationMs);
  assert.match(continuation.label,/until Stop/);
  assert.equal(manifest.script.cueCount,4);
  assert.ok(manifest.script.finalCueEndBeforeMs<10*60*1000);
  assert.equal(manifest.editions.sequence[0].sha256,firstNight.editions.sequence[0].sha256);
  assert.equal(manifest.editions.sequence[1].sha256,firstNight.editions.sequence[1].sha256);
  assert.match(manifest.editions.sequence[1].id,/part2/);
});

test('review validation binds continuation to the final declared sequence segment',()=>{
  const model=read('lib/listening/soundStudioExperience.ts');
  assert.match(model,/continuation\.repeatSegmentIndex !== sequence\.length - 1/);
  assert.match(model,/continuation\.startsAfterMs !== manifest\.durationMs/);
  assert.match(model,/memberSelectedByExperience/);
  assert.match(model,/NIGHT_GROUND_EXTENDED_NIGHT_EXPERIENCE_MANIFEST/);
  assert.match(model,/durationLabel: '109 min, then until Stop'/);
});

test('persistent player counts core repeats without resetting the experience or voice',()=>{
  const provider=read('components/listening/PersistentListeningProvider.tsx');
  assert.match(provider,/reviewContinuationCycles/);
  assert.match(provider,/reviewContinuationCycles\.current \* current\.durationMs/);
  assert.match(provider,/continuation\?\.mode === 'loop_final_segment'/);
  assert.match(provider,/audio\.currentTime = 0/);
  assert.match(provider,/guidance will not repeat/);
  assert.match(provider,/reviewContinuationCycles\.current = 0/);
  assert.equal((provider.match(/<audio ref=\{media\}/g)||[]).length,1);
  assert.equal((provider.match(/new Audio\(/g)||[]).length,0);
});

test('dock names Until Stop and preserves direct Stop plus interruption law',()=>{
  const dock=read('components/listening/PersistentListeningDock.tsx');
  assert.match(dock,/data-listen-continuation/);
  assert.match(dock,/Until Stop/);
  assert.match(dock,/Core repeats/);
  assert.match(dock,/Stop clears all continuation/);
  assert.match(dock,/MAIA speech pauses the field and never resumes it automatically/);
  assert.match(dock,/aria-label="Stop and clear persistent music"/);
});
