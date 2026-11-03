'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const built = esbuild.buildSync({
  stdin: {
    contents: `export * from './lib/listening/layerMixer';
      export * from './lib/listening/soundStudioExperience';`,
    resolveDir: root, loader: 'ts',
  },
  bundle: true, write: false, format: 'cjs', platform: 'node', loader: { '.json': 'json' },
  alias: { '@': root },
}).outputFiles[0].text;
const mod = { exports: {} };
new Function('module', 'exports', 'require', built)(mod, mod.exports, require);
const {
  createLayerMixer, MAX_LAYERS,
  OPEN_GROUND_EXPERIENCE_MANIFEST: OPEN_GROUND,
  NIGHT_GROUND_EXTENDED_NIGHT_EXPERIENCE_MANIFEST: EXTENDED,
  NIGHT_GROUND_MUSIC_ONLY_EXPERIENCE_MANIFEST: MUSIC_ONLY,
  NIGHT_GROUND_EXPERIENCE_MANIFEST: GUIDED,
} = mod.exports;

function fakeAudio(opts = {}) {
  return {
    src: '', volume: 1, loop: false, preload: '', paused: true, onended: null, onerror: null,
    loads: 0, playCalls: 0,
    async play() { this.playCalls++; if (opts.failPlay) throw new Error('blocked'); this.paused = false; },
    pause() { this.paused = true; },
    load() { this.loads++; },
    removeAttribute(name) { if (name === 'src') this.src = ''; },
  };
}
function setup(opts) {
  const made = [];
  const seen = [];
  const mixer = createLayerMixer(() => { const a = fakeAudio(opts); made.push(a); return a; },
    layers => seen.push(layers), 50);
  return { mixer, made, seen };
}

test('a layer is added paused and plays at level × master', async () => {
  const { mixer, made } = setup();
  const r = mixer.add(OPEN_GROUND);
  assert.equal(r.ok, true);
  assert.equal(made[0].src, OPEN_GROUND.editions.defaultReview.path);
  assert.equal(mixer.list()[0].playback, 'paused');
  assert.equal(await mixer.start(r.id), true);
  assert.equal(mixer.list()[0].playback, 'playing');
  assert.equal(made[0].volume, 0.5);
  mixer.setLevel(r.id, 40);
  assert.ok(Math.abs(made[0].volume - 0.2) < 1e-9);
  mixer.setMaster(100);
  assert.ok(Math.abs(made[0].volume - 0.4) < 1e-9);
});

test('mute silences a layer without losing its level', async () => {
  const { mixer, made } = setup();
  const { id } = mixer.add(OPEN_GROUND);
  mixer.setLevel(id, 60);
  mixer.setMuted(id, true);
  assert.equal(made[0].volume, 0);
  assert.equal(mixer.list()[0].level, 60);
  mixer.setMuted(id, false);
  assert.ok(Math.abs(made[0].volume - 0.3) < 1e-9);
});

test('levels are clamped and non-finite values are silence', () => {
  const { mixer, made } = setup();
  const { id } = mixer.add(OPEN_GROUND);
  mixer.setLevel(id, 400);
  assert.equal(mixer.list()[0].level, 100);
  mixer.setLevel(id, NaN);
  assert.equal(mixer.list()[0].level, 0);
  assert.equal(made[0].volume, 0);
});

test('looping follows the manifest permission, exactly as for the main source', () => {
  const { mixer, made } = setup();
  const a = mixer.add(OPEN_GROUND);
  assert.equal(mixer.list()[0].loopAvailable, OPEN_GROUND.permissions.looping === true);
  mixer.setLoop(a.id, true);
  assert.equal(made[0].loop, OPEN_GROUND.permissions.looping === true);
  const b = mixer.add(GUIDED);
  assert.equal(b.ok, true);
  const entry = mixer.list().find(l => l.id === b.id);
  mixer.setLoop(b.id, true);
  assert.equal(entry.loopAvailable, false);
  assert.equal(made[1].loop, false);
});

test('a timed sequence, a duplicate, and a fourth layer are refused', () => {
  const { mixer } = setup();
  assert.deepEqual(mixer.add(EXTENDED), { ok: false, reason: 'sequence' });
  assert.deepEqual(mixer.add(MUSIC_ONLY), { ok: false, reason: 'sequence' });
  assert.equal(mixer.add(OPEN_GROUND).ok, true);
  assert.deepEqual(mixer.add(OPEN_GROUND), { ok: false, reason: 'duplicate' });
  const fillers = [];
  for (let i = 0; i < MAX_LAYERS; i++) {
    fillers.push({ ...OPEN_GROUND, manifestId: `filler-${i}` });
  }
  let last;
  for (const f of fillers) last = mixer.add(f);
  assert.deepEqual(last, { ok: false, reason: 'full' });
  assert.equal(mixer.size(), MAX_LAYERS);
});

test('a manifest without an admitted private-review edition cannot be layered', () => {
  const { mixer } = setup();
  const notAdmitted = { ...OPEN_GROUND, permissions: { ...OPEN_GROUND.permissions, productionRelease: true } };
  assert.deepEqual(mixer.add(notAdmitted), { ok: false, reason: 'no-edition' });
  const thirdParty = { ...OPEN_GROUND, authorship: { ...OPEN_GROUND.authorship, thirdPartyAudio: true } };
  assert.deepEqual(mixer.add(thirdParty), { ok: false, reason: 'no-edition' });
});

test('pauseAll pauses without removing, and nothing restarts by itself', async () => {
  const { mixer, made } = setup();
  const { id } = mixer.add(OPEN_GROUND);
  await mixer.start(id);
  mixer.pauseAll();
  assert.equal(made[0].paused, true);
  assert.equal(mixer.list()[0].playback, 'paused');
  assert.equal(made[0].playCalls, 1);
});

test('stopAll detaches every layer and empties the mixer', async () => {
  const { mixer, made } = setup();
  const a = mixer.add(OPEN_GROUND); await mixer.start(a.id);
  mixer.stopAll();
  assert.equal(mixer.size(), 0);
  assert.equal(made[0].src, '');
  assert.equal(made[0].loop, false);
  assert.equal(made[0].onended, null);
});

test('a layer that ends reads paused; a failed start reads error', async () => {
  const ok = setup();
  const a = ok.mixer.add(OPEN_GROUND); await ok.mixer.start(a.id);
  ok.made[0].onended();
  assert.equal(ok.mixer.list()[0].playback, 'paused');
  const bad = setup({ failPlay: true });
  const b = bad.mixer.add(OPEN_GROUND);
  assert.equal(await bad.mixer.start(b.id), false);
  assert.equal(bad.mixer.list()[0].playback, 'error');
});

test('layers never take their own output lease; the provider ties them to the one lease', () => {
  const mixerSource = read('lib/listening/layerMixer.ts');
  assert.doesNotMatch(mixerSource, /acquireAudioOutput|audioOutputLock/);
  // The provider still builds no audio element itself; layer elements come only from the mixer module.
  assert.equal((read('components/listening/PersistentListeningProvider.tsx').match(/new Audio\(/g) || []).length, 0);
  assert.equal((mixerSource.match(/new Audio\(/g) || []).length, 1);
  const provider = read('components/listening/PersistentListeningProvider.tsx');
  // pause (every interruption path), stop, session end and unmount reach the mixer
  assert.match(provider, /mixer\.current\?\.pauseAll\(\);\s*releaseOutput\(\);/);
  assert.match(provider, /mixer\.current\?\.stopAll\(\);\s*setLayerNotice/);
  assert.match(provider, /mountedMedia\?\.pause\(\);\s*mixer\.current\?\.stopAll\(\);/);
  // adding needs the main sound to hold the lease and refuses during MAIA speech
  assert.match(provider, /kind\.current === 'none' \|\| !outputLease\.current/);
  assert.match(provider, /if \(refuseDuringMaiaSpeech\(\)\) return \{ added: false, notice: 'MAIA is speaking\.' \};\s*const mix = getMixer\(\)/);
  // resume is member-initiated and follows the main sound's own resume
  assert.match(provider, /main\.then\(ok => \{ if \(ok\) resumeLayers\(\); \}\)/);
});

test('the dock offers per-layer level, mute, loop (only if permitted), remove, and a 2-hour timer', () => {
  const dock = read('components/listening/PersistentListeningDock.tsx');
  assert.match(dock, /\[15, 30, 60, 90, 120\]/);
  assert.match(dock, /layer level/);
  assert.match(dock, /layer\.loopAvailable/);
  assert.match(dock, /Stop all/);
  assert.match(read('app/listen/SoundStudioField.tsx'), /data-sound-studio-add-layer/);
});
