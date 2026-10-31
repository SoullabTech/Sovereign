import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../../components/listening/PersistentListeningProvider.tsx', import.meta.url), 'utf8');
const play = src.indexOf('const playSketch');

test('a generated soundscape is carried by a media element so iOS keeps it playing at screen lock', () => {
  assert.match(src, /createMediaStreamDestination/);
  assert.match(src, /el\.srcObject = active\.stream\.stream/);
  assert.match(src, /active\.out\.connect\(active\.stream\)/);
});

test('the element is unlocked inside the tap, before the first await', () => {
  assert.ok(src.indexOf('silentKeepAlive()', play) < src.indexOf("await acquireAudioOutput('listening-music')", play));
});

test('if the element will not carry the sound, output returns to the direct path instead of going silent', () => {
  assert.match(src, /active\.out\.connect\(active\.context\.destination\)/);
});

test('every stop path pauses the element (released with the output); it is kept for later lock-screen Play', () => {
  assert.match(src, /const releaseOutput = useCallback\(\(\) => \{\s*keepAlive\.current\?\.pause\(\);/);
});

test('the element is private and carries no state handlers', () => {
  const block = src.slice(src.indexOf('function silentKeepAlive'), src.indexOf('const recordedCache'));
  assert.ok(!/onplay|onpause|onended|addEventListener/i.test(block));
});
