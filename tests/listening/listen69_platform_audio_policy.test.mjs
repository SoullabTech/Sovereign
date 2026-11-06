import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  interruptionAction, nowPlayingFor, remoteCommandAction, routeChangeAction, sessionOptionsFor,
} from '../../lib/listening/platformAudioPolicy.ts';

const read = file => fs.readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
// A prose ban must never read as the banned behaviour returning: scan code, not comments.
const code = text => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/([^:])\/\/.*$/gm, '$1');

test('an interruption pauses the field; its end never resumes it, whatever the system hints', () => {
  assert.equal(interruptionAction({ phase: 'began' }), 'pause');
  assert.equal(interruptionAction({ phase: 'ended' }), 'none');
  assert.equal(interruptionAction({ phase: 'ended', shouldResume: true }), 'none');
});

test('only losing a route pauses; a new route never starts sound', () => {
  assert.equal(routeChangeAction({ reason: 'oldDeviceUnavailable' }), 'pause');
  for (const reason of ['newDeviceAvailable', 'categoryChange', 'other', 'wake'])
    assert.equal(routeChangeAction({ reason }), 'none');
});

test('lock-screen Play is the member’s own resume; Stop is terminal; toggle follows state', () => {
  assert.equal(remoteCommandAction('play', false), 'resume');
  assert.equal(remoteCommandAction('pause', true), 'pause');
  assert.equal(remoteCommandAction('stop', true), 'stop');
  assert.equal(remoteCommandAction('toggle', true), 'pause');
  assert.equal(remoteCommandAction('toggle', false), 'resume');
});

test('Now Playing names an until-Stop field honestly and carries nothing but title, passage and clock', () => {
  const night = nowPlayingFor({ kind: 'review-media', playback: 'playing', title: 'Night Ground 01',
    subtitle: 'ignored', passage: 'Core', elapsedMs: 7_200_000, durationMs: 6_540_000, continuation: 'until-stop' });
  assert.equal(night.durationSeconds, null);
  assert.equal(night.subtitle, 'Until Stop');
  assert.equal(night.elapsedSeconds, 7200);
  assert.deepEqual(Object.keys(night).sort(),
    ['durationSeconds', 'elapsedSeconds', 'passage', 'playing', 'subtitle', 'title']);
  const finite = nowPlayingFor({ kind: 'review-media', playback: 'paused', title: 'Open Ground',
    subtitle: 'A sustained tonal world', passage: 'Arrival', elapsedMs: 30_000, durationMs: 360_000 });
  assert.equal(finite.durationSeconds, 360);
  assert.equal(finite.playing, false);
});

test('no Now Playing exists when nothing is held', () => {
  for (const playback of ['idle', 'error'])
    assert.equal(nowPlayingFor({ kind: 'sketch', playback, title: 'x' }), null);
  assert.equal(nowPlayingFor({ kind: 'none', playback: 'playing', title: 'x' }), null);
});

test('mixing with other apps is companion mode only', () => {
  assert.deepEqual(sessionOptionsFor(false), { mixWithOthers: false });
  assert.deepEqual(sessionOptionsFor(true), { mixWithOthers: true });
});

test('native plugin has no microphone, no player, no auto-resume, and reports no device names', () => {
  const swift = code(read('ios/App/App/SoundFieldAudio.swift'));
  assert.doesNotMatch(swift, /requestRecordPermission|AVAudioRecorder|AVAudioEngine|inputNode|playAndRecord|AVAudioPlayer|AVPlayer|SFSpeech/);
  assert.doesNotMatch(swift, /shouldResume|InterruptionOptionKey|\.play\(\)/);
  assert.doesNotMatch(swift, /portName|currentRoute|inputs|outputs/);
  // Measured on a physical iPhone (30 Oct 2026): force-activating the session from the plugin collided with the
  // web view's own activation and produced an immediate spurious interruption that paused the field. The
  // category is therefore touched only for member-chosen companion mode, and never force-activated.
  assert.match(swift, /if mix \{\s*try session\.setCategory\(\.playback, mode: \.default, options: \[\.mixWithOthers\]\)/);
  assert.doesNotMatch(swift, /setActive\(true/);
  assert.match(swift, /notifyListeners\("interruption", data: \["phase":/);
  assert.match(swift, /command\.isEnabled = false/);
});

test('the bridge pauses on interruption and route change and resumes only on a lock-screen gesture', () => {
  const hook = code(read('components/listening/usePlatformAudioSession.ts'));
  const interruption = hook.slice(hook.indexOf("'interruption'"), hook.indexOf("'routeChange'"));
  const route = hook.slice(hook.indexOf("'routeChange'"), hook.indexOf("'remoteCommand'"));
  assert.match(interruption, /onPause/); assert.doesNotMatch(interruption, /onResume/);
  assert.match(route, /onPause/); assert.doesNotMatch(route, /onResume/);
  assert.match(hook, /action === 'resume'/);
  assert.doesNotMatch(hook, /\.play\(|new Audio|<audio|getUserMedia/);
});

test('still one audio element, plugin registered, source in the Xcode project', () => {
  const provider = read('components/listening/PersistentListeningProvider.tsx');
  assert.equal((provider.match(/<audio ref=\{media\}/g) || []).length, 1);
  assert.match(provider, /usePlatformAudioSession\(snapshot, companionMode/);
  assert.match(read('capacitor.config.ts'), /'SoundFieldAudio'/);
  const project = read('ios/App/App.xcodeproj/project.pbxproj');
  assert.match(project, /SoundFieldAudio\.swift in Sources \*\/ = \{isa = PBXBuildFile/);
  assert.match(project, /SoundFieldAudio\.swift \*\/ = \{isa = PBXFileReference/);
  assert.match(project, /\t\t\t\t[0-9A-F]+ \/\* SoundFieldAudio\.swift \*\/,/);
  assert.match(project, /\t\t\t\t[0-9A-F]+ \/\* SoundFieldAudio\.swift in Sources \*\/,/);
});
