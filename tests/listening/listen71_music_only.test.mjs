import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {
  NIGHT_GROUND_MUSIC_ONLY, NIGHT_GROUND_MUSIC_ONLY_EXPERIENCE_MANIFEST as MO,
  NIGHT_GROUND_NICOLE_FIRST_NIGHT_EXPERIENCE_MANIFEST as NICOLE,
  NIGHT_GROUND_EXTENDED_NIGHT_EXPERIENCE_MANIFEST as EXTENDED,
  SOUND_STUDIO_WORKS, reviewMediaSequence,
} from '../../lib/listening/soundStudioExperience.ts';

const REAL_MASTER = '9fa8ee35914a351d9aca055c51f66618d557940805ed76d97d94a86bc46fa7b1';
const root = new URL('../../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const sha = path => crypto.createHash('sha256').update(fs.readFileSync(new URL(`public${path}`, root))).digest('hex');

test('Music Only is a valid finite two-segment review sequence with no voice and no loop', () => {
  const sequence = reviewMediaSequence(MO);
  assert.ok(sequence, 'the manifest passes the same validation as every other edition');
  assert.equal(sequence.length, 2);
  assert.equal(MO.durationMs, 6_540_000);
  assert.equal(sequence.reduce((sum, media) => sum + media.durationMs, 0), 6_540_000);
  assert.equal(MO.voice, null);
  assert.equal(MO.script, null);
  assert.deepEqual(MO.authorship.performers, []);
  assert.equal(MO.continuation, undefined);
  assert.equal(MO.permissions.looping, false);
  assert.equal(MO.permissions.productionRelease, false);
  assert.equal(MO.authorship.thirdPartyAudio, false);
});

test('the media on disk is exactly what the manifest records', () => {
  for (const media of reviewMediaSequence(MO)) {
    assert.equal(sha(media.path), media.sha256, `${media.id} sha256`);
    assert.equal(fs.statSync(new URL(`public${media.path}`, root)).size, media.sizeBytes, `${media.id} size`);
  }
});

test('Music Only reuses the existing voice-free core and never a voiced file', () => {
  const [part1, part2] = reviewMediaSequence(MO);
  assert.equal(part2.sha256, reviewMediaSequence(NICOLE)[1].sha256);
  const nicolePart1 = reviewMediaSequence(NICOLE)[0];
  assert.notEqual(part1.sha256, nicolePart1.sha256);
  assert.doesNotMatch(part1.path, /Nicole|Bella/);
  assert.doesNotMatch(part2.path, /Bella/);
});

test('the preserved master is recorded with its real fingerprint everywhere, and the typo is gone', () => {
  for (const manifest of [MO, NICOLE, EXTENDED]) {
    assert.equal(manifest.editions.preservationMaster.sha256, REAL_MASTER);
    assert.equal(manifest.editions.preservationMaster.sizeBytes, 186_864_924);
  }
  for (const file of ['night-ground-01-music-only-v0.1', 'night-ground-01-nicole-first-night-v0.1', 'night-ground-01-extended-night-v0.1'])
    assert.doesNotMatch(read(`lib/listening/manifests/${file}.json`), /5968b37465af601891a6/);
});

test('the claim stays as strong as its evidence', () => {
  assert.match(MO.sourceEvidence.technicalQualification, /no independent human A\/B listening yet/);
  assert.equal(MO.acceptance.founderListening, 'pending_music_only_edition');
  assert.equal(MO.acceptance.release, 'hold');
  assert.match(MO.status, /private_review/);
});

test('Music Only is one of four Night Ground editions inside the single catalogue card', () => {
  assert.ok(SOUND_STUDIO_WORKS.some(work => work.id === NIGHT_GROUND_MUSIC_ONLY.id));
  const field = read('app/listen/SoundStudioField.tsx');
  assert.match(field, /label: 'Music Only'/);
  assert.match(field, /NIGHT_GROUND_MUSIC_ONLY/);
  assert.match(NIGHT_GROUND_MUSIC_ONLY.qualities.join(' '), /No voice/);
});
