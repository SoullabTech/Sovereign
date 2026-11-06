// The playback contract the older "no `new Audio(`" assertions stood in for (LISTEN-01 / AUDIO-PLATFORM-01):
// one owned session, member-controlled, no automatic restart. The player owns exactly two audio elements:
//   1. the visible recorded-audio element (<audio ref={media}>), and
//   2. one private element created in silentKeepAlive(), which carries a generated soundscape so iOS keeps it
//      playing at screen lock. It is never a second player: it starts only inside playSketch (a member start),
//      and every stop path pauses it through releaseOutput().
// Source-level guards, comments stripped; behaviour in a browser is witnessed separately.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const raw = readFileSync(new URL('../../components/listening/PersistentListeningProvider.tsx', import.meta.url), 'utf8');
const src = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const at = (needle, from = 0) => src.indexOf(needle, from);
const playSketchStart = at('const playSketch = useCallback');
const playSketchEnd = at('const playExperienceMedia = useCallback');

test('exactly two audio elements: the recorded-audio element and the private keepalive', () => {
  assert.equal((src.match(/<audio ref=\{media\}/g) || []).length, 1);
  assert.equal((src.match(/new Audio\(/g) || []).length, 1);
});

test('the private element is created only inside silentKeepAlive and is never rendered', () => {
  const fnStart = at('function silentKeepAlive');
  const created = at('new Audio(');
  assert.ok(fnStart > 0 && created > fnStart);
  const nextTopLevel = at('\nfunction ', fnStart + 10) === -1 ? Infinity : at('\nfunction ', fnStart + 10);
  const nextConst = at('\nconst ', fnStart + 10) === -1 ? Infinity : at('\nconst ', fnStart + 10);
  assert.ok(created < Math.min(nextTopLevel, nextConst));
  assert.ok(!/<audio[^>]*keepAlive/.test(src));
});

test('the private element can only be started inside playSketch, never from a state change or event', () => {
  assert.ok(playSketchStart > 0 && playSketchEnd > playSketchStart);
  const plays = [...src.matchAll(/\bel\.play\(/g)].map(m => m.index);
  assert.ok(plays.length >= 1);
  for (const i of plays) assert.ok(i > playSketchStart && i < playSketchEnd, 'el.play() outside playSketch');
  assert.ok(!/keepAlive\.current\??\.play\(/.test(src), 'keepAlive started by reference outside playSketch');
});

test('every release of the output pauses the private element; Stop and Pause go through that release', () => {
  assert.match(src, /const releaseOutput = useCallback\(\(\) => \{\s*keepAlive\.current\?\.pause\(\);/);
  const stopAll = src.slice(at('const stopAll = useCallback'), at('const stopAll = useCallback') + 1800);
  assert.match(stopAll, /releaseOutput\(\)/);
});

test('the element never listens for or reacts to ended, pause or play: no automatic restart from it', () => {
  const block = src.slice(at('function silentKeepAlive'), at('const recordedCache'));
  assert.ok(!/onplay|onpause|onended|addEventListener/i.test(block));
  assert.ok(!/keepAlive\.current[^;]*\.(onended|onpause|onplay)/.test(src));
});

test('both start paths re-check that they are still current after the element finishes starting', () => {
  const afterPlay = at('await el.play()', playSketchStart);
  const claim = at('claimFocus();', afterPlay);
  const between = src.slice(afterPlay, claim);
  assert.match(between, /generation !== epoch\.current/);
  assert.match(between, /isMaiaSpeechActive\(\)/);
  assert.match(between, /el\.pause\(\)/);
});
