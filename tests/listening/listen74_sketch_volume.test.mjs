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
  assert.match(src, /master\.gain\.setTargetAtTime\(generatedGainForLevel\(next\)/); // scale owned by lib/listening/listeningLevel.ts (listen79)
});
const css = fs.readFileSync(path.join(import.meta.dirname, '../../components/listening/persistentListeningDock.module.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
test('LISTEN-74 on a phone the open panel keeps its Pause / Stop / Less row pinned and does not chain scrolling', () => {
  assert.match(css, /max-width:600px\)\{\.dock\[data-dock-expanded="true"\]\{overscroll-behavior:contain\}/);
  assert.match(css, /\.dock\[data-dock-expanded="true"\] \.controls\{position:sticky;top:0/);
});
test('LISTEN-74 the open panel is capped so its top row cannot end up under the status bar', () => {
  const m = css.match(/\.dock\[data-dock-expanded="true"\]\{max-height:calc\(100dvh - 56px - env\(safe-area-inset-bottom\) - env\(safe-area-inset-top\) - (\d+)px\)\}/);
  assert.ok(m, 'expanded cap missing');
  assert.ok(Number(m[1]) >= 76, 'cap must reserve at least the status-bar clearance'); // 108 since the floating controls need room (listen78)
});
