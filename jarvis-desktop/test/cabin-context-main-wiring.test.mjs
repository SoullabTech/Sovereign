import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), '..');

test('H3.6 extends the existing jarvis:status surface rather than adding a new IPC channel', () => {
  const source = fs.readFileSync(path.join(ROOT, 'jarvis-desktop', 'src', 'main.js'), 'utf8');

  assert.match(source, /CABIN_CONTEXT/);
  assert.match(source, /cabin_context:\s*CABIN_CONTEXT\.inspectCabinContextArtifact/);
  assert.doesNotMatch(source, /ipcMain\.handle\(['"]jarvis:cabin-context/);
});

test('H3.6 path comes from an explicit host environment binding, not renderer input', () => {
  const source = fs.readFileSync(
    path.join(ROOT, 'jarvis-desktop', 'src', 'cabin-context-status.js'),
    'utf8',
  );

  assert.match(source, /JARVIS_CABIN_CONTEXT_PACKAGE_PATH/);
  assert.doesNotMatch(source, /ipcRenderer|req\.|event\.|sender/);
});
