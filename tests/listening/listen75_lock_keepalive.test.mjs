import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../../components/listening/PersistentListeningProvider.tsx', import.meta.url), 'utf8');

test('a generated soundscape starts a private silent media element so iOS keeps it playing at screen lock', () => {
  assert.match(src, /function silentKeepAlive\(\)/);
  assert.match(src, /el\.loop = true/);
  assert.match(src, /if \(soundscape && !keepAlive\.current\)/);
});

test('every stop path ends the keep-alive element (it is released with the output)', () => {
  assert.match(src, /const releaseOutput = useCallback\(\(\) => \{\s*if \(keepAlive\.current\) \{ keepAlive\.current\.pause\(\); keepAlive\.current = null; \}/);
});

test('the keep-alive element is private and carries no state handlers', () => {
  const block = src.slice(src.indexOf('function silentKeepAlive'), src.indexOf('const recordedCache'));
  assert.ok(!/onplay|onpause|onended|addEventListener/i.test(block));
});
