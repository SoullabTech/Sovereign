// LISTEN-01 native mix ("Play with your music"): founder ruling 2026-11-06 (single-source rule, phase 1 =
// recorded sounds only, Class B). Pure policy checks plus source guards on the Swift plugin, comments stripped.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  MIX_DEFAULT_LEVEL, MIX_GAIN_MAX_DB, MIX_GAIN_MIN_DB, mixGainDb, nativeMixMayRestart, singleSourceTransition,
} from '../../lib/listening/platformAudioPolicy.ts';

const read = file => fs.readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
const code = text => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/([^:])\/\/.*$/gm, '$1');
const swift = code(read('ios/App/App/SoundFieldAudio.swift'));
const fnBody = (name) => {
  const start = swift.indexOf(name);
  assert.ok(start > 0, `${name} missing`);
  return swift.slice(start, start + 2200);
};

test('the level maps 0..100 to −60..+18 dB, monotonic, clamped, and never exceeds +18 dB', () => {
  assert.equal(mixGainDb(0), MIX_GAIN_MIN_DB);
  assert.equal(mixGainDb(100), MIX_GAIN_MAX_DB);
  assert.equal(mixGainDb(-50), MIX_GAIN_MIN_DB);
  assert.equal(mixGainDb(500), MIX_GAIN_MAX_DB);
  assert.ok(mixGainDb(Number.NaN) === mixGainDb(MIX_DEFAULT_LEVEL));
  assert.ok(mixGainDb(40) < mixGainDb(41));
  assert.ok(Math.abs(mixGainDb(MIX_DEFAULT_LEVEL) - 2.4) < 0.001); // the setting the founder judged "perfect"
});

test('the Swift gain map is the same as the policy map', () => {
  assert.match(swift, /Float\(-60\.0 \+ 78\.0 \* max\(0\.0, min\(100\.0, level\)\) \/ 100\.0\)/);
  assert.equal(MIX_GAIN_MAX_DB - MIX_GAIN_MIN_DB, 78);
});

test('single source: starting one Soullab sound stops the other, and never both or neither wrongly', () => {
  assert.deepEqual(singleSourceTransition('web', 'native-mix'), { stopWeb: true, stopNative: false });
  assert.deepEqual(singleSourceTransition('native-mix', 'web'), { stopWeb: false, stopNative: true });
  assert.deepEqual(singleSourceTransition('none', 'native-mix'), { stopWeb: false, stopNative: false });
  assert.deepEqual(singleSourceTransition('none', 'web'), { stopWeb: false, stopNative: false });
  assert.deepEqual(singleSourceTransition('native-mix', 'native-mix'), { stopWeb: false, stopNative: false });
  for (const current of ['none', 'web', 'native-mix']) for (const next of ['web', 'native-mix']) {
    const t = singleSourceTransition(current, next);
    assert.ok(!(t.stopWeb && t.stopNative), 'never stops both');
  }
});

test('however the mix ended, the platform never restarts it', () => {
  for (const reason of ['interruption', 'routeLoss', 'stopped', 'finished', 'error', 'replaced']) {
    assert.equal(nativeMixMayRestart(reason), false);
  }
});

test('native: the mix stops when an interruption begins and when a route is lost', () => {
  const interruption = fnBody('@objc private func onInterruption');
  assert.match(interruption, /type == \.began \{ stopMix\(reason: "interruption"\) \}/);
  const route = fnBody('@objc private func onRouteChange');
  assert.match(route, /name == "oldDeviceUnavailable" \{ stopMix\(reason: "routeLoss"\) \}/);
});

test('native: the engine is started only inside mixStart (the member\'s Play), nowhere else', () => {
  const starts = [...swift.matchAll(/\bengine\.start\(\)|mixEngine\??\.start\(\)|\.play\(\)/g)];
  const mixStartAt = swift.indexOf('@objc func mixStart');
  const mixSetLevelAt = swift.indexOf('@objc func mixSetLevel');
  assert.ok(mixStartAt > 0 && mixSetLevelAt > mixStartAt);
  for (const m of starts) assert.ok(m.index > mixStartAt && m.index < mixSetLevelAt, 'engine started outside mixStart');
  assert.equal([...swift.matchAll(/try engine\.start\(\)/g)].length, 1);
  assert.ok(!/AVAudioSessionInterruptionOptionShouldResume|shouldResume/.test(swift), 'no shouldResume handling');
});

test('native: every end of the mix is reported, and the web player going idle cannot take the session from it', () => {
  assert.match(swift, /notifyListeners\("mixStopped", data: \["reason": reason\]\)/);
  const deactivate = fnBody('@objc func deactivate');
  assert.match(deactivate, /if mixActive \{ call\.resolve\(\); return \}/);
});

test('native: only bundled recorded sounds under public/media play; no path escapes; no microphone', () => {
  const start = fnBody('@objc func mixStart');
  assert.match(start, /rel\.hasPrefix\("public\/media\/"\)/);
  assert.match(start, /!rel\.contains\(".."\)/);
  assert.ok(!/AVAudioApplication|requestRecordPermission|AVAudioRecorder|inputNode/.test(swift));
  assert.ok(!/https?:\/\//.test(start), 'the mix does not fetch from the network');
});

test('native: the mix never reads another app\'s audio or metadata', () => {
  assert.ok(!/MPMusicPlayerController|MPMediaQuery|MPNowPlayingInfoCenter\.default\(\)\.nowPlayingInfo\s*\)?\s*(as|\[|\?)/.test(swift.replace(/nowPlayingInfo = nil/g, '')));
  assert.ok(!/installTap|AVAudioSinkNode|inputNode/.test(swift), 'no tap on any audio the app does not own');
});

test('the bridge declares the four mix calls and the stop event', () => {
  const bridge = code(read('lib/listening/nativeSoundAudio.ts'));
  for (const name of ['mixStart', 'mixStop', 'mixSetLevel', 'mixStatus']) assert.match(bridge, new RegExp(`${name}\\(`));
  assert.match(bridge, /addListener\(event: 'mixStopped'/);
});
