'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '../..');
const manifestPath = path.join(root, 'lib/listening/manifests/night-ground-01-guided-arrival-v0.1.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const review = manifest.editions.defaultReview;
const publicMedia = path.join(root, 'public', review.path.replace(/^\//, ''));
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('Night Ground binds one exact guided private-review experience', () => {
  assert.equal(manifest.schema, 'soullab.sound.experience-manifest.v1');
  assert.equal(manifest.manifestId, 'night-ground-01-guided-arrival-v0.1-private-review');
  assert.equal(manifest.experienceId, 'night-ground-01-guided-arrival-v0.1');
  assert.equal(manifest.title, 'Night Ground 01');
  assert.equal(manifest.status, 'private_review');
  assert.equal(manifest.ownerLane, 'LISTEN-01#1979');
  assert.equal(manifest.durationMs, 720000);
});

test('authorship distinguishes original composition and local synthetic voice', () => {
  assert.match(manifest.authorship.creativeDirection, /Kelly Nezat/);
  assert.equal(manifest.authorship.thirdPartyAudio, false);
  assert.equal(manifest.authorship.learnedAudioModel, false);
  assert.deepEqual(manifest.authorship.performers,
    ['Bella / Kokoro synthetic voice (authorized local rendering)']);
  assert.equal(manifest.voice.provider, 'Kokoro local sovereign TTS');
  assert.equal(manifest.voice.voiceId, 'af_bella');
  assert.equal(manifest.voice.clonedVoice, false);
});

test('script is sparse, conscious and contains no hidden or reversed content', () => {
  assert.equal(manifest.script.cueCount, 5);
  assert.match(manifest.script.delivery, /consciously audible/);
  assert.equal(manifest.script.hiddenOrReversedContent, false);
  assert.ok(manifest.script.finalCueEndBeforeMs < manifest.durationMs);
});

test('guided review media exists and matches the admitted identity', () => {
  assert.equal(fs.existsSync(publicMedia), true);
  assert.equal(fs.statSync(publicMedia).size, review.sizeBytes);
  assert.equal(sha256(publicMedia), review.sha256);
  assert.equal(review.sha256, '1ad2e5670048db439c8b6f9340f810ef374fe4ac3cbf3aaf3f3eb4e216e14d31');
});

test('guided AAC decodes as twelve-minute stereo 48 kHz media', () => {
  const probe = JSON.parse(execFileSync('ffprobe', [
    '-v', 'error', '-show_entries', 'stream=codec_name,sample_rate,channels:format=duration',
    '-of', 'json', publicMedia,
  ], { encoding: 'utf8' }));
  assert.equal(probe.streams[0].codec_name, 'aac');
  assert.equal(Number(probe.streams[0].sample_rate), 48000);
  assert.equal(probe.streams[0].channels, 2);
  assert.ok(Math.abs(Number(probe.format.duration) - 720) < 0.05);
});

test('guided preservation master is identified but not Git-served', () => {
  const master = manifest.editions.preservationMaster;
  assert.equal(master.role, 'preservation_master');
  assert.equal(master.bundled, false);
  assert.equal(master.path, null);
  assert.equal(master.sha256, 'fe15788cceb4aa8260b401b645c31a1fa141e4ffee51859122a9af2084e9f699');
  assert.equal(fs.existsSync(path.join(root,
    'public/media/sound-studio/night-ground/Night_Ground_01_Guided_Arrival_12min_v0.1_24bit48k.flac')), false);
});

test('guided edition cannot loop, shape, download, analyze or imply release', () => {
  const permissions = manifest.permissions;
  assert.equal(permissions.scope, 'authenticated_founder_private_review');
  assert.equal(permissions.onDemandReview, true);
  assert.equal(permissions.productionRelease, false);
  assert.equal(permissions.download, false);
  assert.equal(permissions.offlineCabin, false);
  assert.equal(permissions.shaping, false);
  assert.equal(permissions.looping, false);
  assert.equal(permissions.aiAudioAnalysis, false);
  assert.equal(manifest.acceptance.release, 'hold');
});

test('Night Ground has a distinct four-part guided arrival arc', () => {
  assert.deepEqual(manifest.passages.map(value => value.label),
    ['Arrival', 'Settling', 'Release of guidance', 'Threshold']);
  assert.equal(manifest.techniques.tuningReferenceHz, 432);
  assert.equal(manifest.techniques.rootHz, 72);
  assert.equal(manifest.techniques.regularBeat, false);
  assert.equal(manifest.techniques.designedBinauralProtocol, false);
  assert.equal(manifest.techniques.designedIsochronicProtocol, false);
});

test('Sound Studio exposes Night Ground through the same manifest player', () => {
  const model = read('lib/listening/soundStudioExperience.ts');
  const field = read('app/listen/SoundStudioField.tsx');
  const provider = read('components/listening/PersistentListeningProvider.tsx');
  assert.match(model, /nightGroundManifestSource/);
  assert.match(model, /NIGHT_GROUND_EXPERIENCE_MANIFEST/);
  assert.match(model, /Guidance does not loop/);
  assert.match(field, /playExperienceMedia\(selected\.manifest\)/);
  assert.match(field, /selected\.manifest/);
  assert.equal((provider.match(/<audio ref=\{media\}/g) || []).length, 1);
  assert.equal((provider.match(/new Audio\(/g) || []).length, 0);
});
