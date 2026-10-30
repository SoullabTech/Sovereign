'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '../..');
const manifestPath = path.join(root, 'lib/listening/manifests/open-ground-432-v1.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const review = manifest.editions.defaultReview;
const publicMedia = path.join(root, 'public', review.path.replace(/^\//, ''));
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('manifest binds one exact private-review experience', () => {
  assert.equal(manifest.schema, 'soullab.sound.experience-manifest.v1');
  assert.equal(manifest.manifestId, 'open-ground-432-v1-private-review');
  assert.equal(manifest.experienceId, 'open-ground-432-v1');
  assert.equal(manifest.status, 'private_review');
  assert.equal(manifest.ownerLane, 'LISTEN-01#1979');
  assert.equal(manifest.durationMs, 360000);
});

test('manifest preserves authorship and contains no third-party recording', () => {
  assert.match(manifest.authorship.creativeDirection, /Kelly Nezat/);
  assert.equal(manifest.authorship.thirdPartyAudio, false);
  assert.equal(manifest.authorship.learnedAudioModel, false);
  assert.deepEqual(manifest.authorship.performers, []);
});

test('default review media exists and matches the preserved Library identity', () => {
  assert.equal(fs.existsSync(publicMedia), true);
  assert.equal(fs.statSync(publicMedia).size, review.sizeBytes);
  assert.equal(sha256(publicMedia), review.sha256);
  assert.equal(review.sha256, '6e3749cd6cd62b6618daf2585269655817e963a0d2b3ea929e1a011c47cddcd5');
});

test('AAC review edition decodes as exact six-minute stereo 48 kHz media', () => {
  const probe = JSON.parse(execFileSync('ffprobe', [
    '-v', 'error', '-show_entries', 'stream=codec_name,sample_rate,channels:format=duration',
    '-of', 'json', publicMedia,
  ], { encoding: 'utf8' }));
  assert.equal(probe.streams[0].codec_name, 'aac');
  assert.equal(Number(probe.streams[0].sample_rate), 48000);
  assert.equal(probe.streams[0].channels, 2);
  assert.ok(Math.abs(Number(probe.format.duration) - 360) < 0.05);
});

test('lossless preservation master is identified but excluded from Git-served media', () => {
  const master = manifest.editions.preservationMaster;
  assert.equal(master.role, 'preservation_master');
  assert.equal(master.bundled, false);
  assert.equal(master.path, null);
  assert.equal(master.sha256, '878491a7d83c13518c4f92fc8b7c151fde73a6155d20c2bc338e2cea1866f5ae');
  assert.equal(fs.existsSync(path.join(root, 'public/media/sound-studio/open-ground/Open_Ground_Drone01_6min_v1_24bit48k.flac')), false);
});

test('private-review permission never implies production, download, shaping or AI analysis', () => {
  const permissions = manifest.permissions;
  assert.equal(permissions.scope, 'authenticated_founder_private_review');
  assert.equal(permissions.onDemandReview, true);
  assert.equal(permissions.productionRelease, false);
  assert.equal(permissions.download, false);
  assert.equal(permissions.offlineCabin, false);
  assert.equal(permissions.shaping, false);
  assert.equal(permissions.looping, true);
  assert.equal(permissions.aiAudioAnalysis, false);
  assert.match(manifest.acceptance.desktopChrome, /verified_exact_media/);
  assert.match(manifest.acceptance.responsiveDeviceEmulation, /not_physical_devices/);
  assert.match(manifest.acceptance.desktopSafari, /^pending_/);
  assert.match(manifest.acceptance.physicalIPad, /^pending_/);
  assert.match(manifest.acceptance.physicalIPhone, /^pending_/);
  assert.equal(manifest.acceptance.release, 'hold');
});

test('the experience arc and sound methods are explicit and non-clinical', () => {
  assert.deepEqual(manifest.passages.map(value => value.label), ['Arrival', 'Opening', 'Dwelling', 'Return']);
  assert.equal(manifest.techniques.tuningReferenceHz, 432);
  assert.equal(manifest.techniques.rootHz, 72);
  assert.equal(manifest.techniques.regularBeat, false);
  assert.equal(manifest.techniques.designedBinauralProtocol, false);
  assert.equal(manifest.techniques.designedIsochronicProtocol, false);
  assert.equal(manifest.script, null);
  assert.equal(manifest.voice, null);
});

test('Sound Studio uses the manifest and exact-media path', () => {
  const model = read('lib/listening/soundStudioExperience.ts');
  const field = read('app/listen/SoundStudioField.tsx');
  assert.match(model, /openGroundManifestSource/);
  assert.match(model, /reviewMediaEdition/);
  assert.match(field, /playExperienceMedia\(selected\.manifest\)/);
  assert.match(field, /exact reviewed media edition/i);
});

test('exact media reuses one persistent HTML audio element and existing output lease', () => {
  const provider = read('components/listening/PersistentListeningProvider.tsx');
  assert.equal((provider.match(/<audio ref=\{media\}/g) || []).length, 1);
  assert.equal((provider.match(/new Audio\(/g) || []).length, 0);
  assert.match(provider, /acquireAudioOutput\('listening-music'\)/);
  assert.match(provider, /const playExperienceMedia/);
  assert.match(provider, /kind\.current = 'review-media'/);
  assert.match(provider, /audio\.src = edition\.path/);
});

test('MAIA Stop sees exact review media as the same existing local player', () => {
  const bridge = read('lib/listening/maiaMusicBridge.ts');
  assert.match(bridge, /'review-media'/);
  assert.match(bridge, /port\.stopMusic\(\)/);
  assert.doesNotMatch(bridge, /new AudioContext|new Audio\(/);
});
