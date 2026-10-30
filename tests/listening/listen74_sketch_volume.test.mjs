import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const src = fs.readFileSync(path.join(import.meta.dirname, '../../components/listening/PersistentListeningProvider.tsx'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
test('LISTEN-74 a generated sound always offers its own volume control, even where a media file cannot', () => {
  assert.match(src, /volumeAdjustable=\{volumeAdjustable \|\| snapshot\.kind === 'sketch'\}/);
});
test('LISTEN-74 the volume control reaches the generated sound (master gain), not only the media element', () => {
  assert.match(src, /master\.gain\.setTargetAtTime\(Math\.max\(0\.0001, next \/ 100 \* 0\.027\)/);
});
