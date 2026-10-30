'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const manifest = JSON.parse(fs.readFileSync(path.join(root,'lib/listening/manifests/night-ground-01-nicole-first-night-v0.1.json'),'utf8'));
const sha = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const read = p => fs.readFileSync(path.join(root,p),'utf8');

test('Nicole First Night is one private 109-minute experience with Nicole only in the opening', () => {
  assert.equal(manifest.manifestId,'night-ground-01-nicole-first-night-v0.1-private-review');
  assert.equal(manifest.durationMs,6540000);
  assert.equal(manifest.voice.voiceId,'af_nicole');
  assert.equal(manifest.script.cueCount,4);
  assert.ok(manifest.script.finalCueEndBeforeMs < 10*60*1000);
  assert.equal(manifest.permissions.looping,false);
  assert.equal(manifest.permissions.productionRelease,false);
  assert.equal(manifest.acceptance.release,'hold');
});

test('two exact bundled parts preserve one complete review sequence under ordinary Git limits', () => {
  const seq=manifest.editions.sequence;
  assert.equal(seq.length,2);
  const files=seq.map(item=>path.join(root,'public',item.path.replace(/^\//,'')));
  for (let i=0;i<seq.length;i++) {
    assert.equal(fs.existsSync(files[i]),true);
    assert.equal(fs.statSync(files[i]).size,seq[i].sizeBytes);
    assert.equal(sha(files[i]),seq[i].sha256);
    assert.ok(seq[i].sizeBytes < 100_000_000);
  }
  assert.ok(Math.abs(seq.reduce((n,x)=>n+x.durationMs,0)-manifest.durationMs)<250);
});

test('both private-review parts decode as stereo AAC at the declared 44.1 kHz review rate', () => {
  for (const item of manifest.editions.sequence) {
    const file=path.join(root,'public',item.path.replace(/^\//,''));
    const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=codec_name,sample_rate,channels:format=duration','-of','json',file],{encoding:'utf8'}));
    assert.equal(probe.streams[0].codec_name,'aac');
    assert.equal(Number(probe.streams[0].sample_rate),44100);
    assert.equal(probe.streams[0].channels,2);
    assert.ok(Math.abs(Number(probe.format.duration)*1000-item.durationMs)<80);
  }
});

test('source model admits sequence media without weakening single-file 48 kHz review editions', () => {
  const model=read('lib/listening/soundStudioExperience.ts');
  assert.match(model,/reviewMediaSequence/);
  assert.match(model,/sampleRateHz === 44_100 \|\| media\.sampleRateHz === 48_000/);
  assert.match(model,/NIGHT_GROUND_NICOLE_FIRST_NIGHT_EXPERIENCE_MANIFEST/);
  assert.match(model,/NIGHT_GROUND_NICOLE_FIRST_NIGHT/);
});

test('persistent player advances internally but preserves interruption and terminal Stop semantics', () => {
  const provider=read('components/listening/PersistentListeningProvider.tsx');
  assert.match(provider,/reviewSegmentIndex/);
  assert.match(provider,/segmentTransitioning/);
  assert.match(provider,/media\.current\?\.ended[\s\S]*reviewSequence\.current\[reviewSegmentIndex\.current \+ 1\]/);
  assert.match(provider,/continues without returning to guidance/);
  assert.match(provider,/MAIA is speaking; resume only when you choose/);
  assert.match(provider,/reviewSequence\.current = \[\]/);
  assert.equal((provider.match(/<audio ref=\{media\}/g)||[]).length,1);
  assert.equal((provider.match(/new Audio\(/g)||[]).length,0);
});
