'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const dockPath = 'components/listening/PersistentListeningDock.tsx';
const dock = read(dockPath);
const css = read('components/listening/persistentListeningDock.module.css');
const provider = read('components/listening/PersistentListeningProvider.tsx');
const manifest = JSON.parse(read('lib/listening/manifests/open-ground-432-v1.json'));

test('companion dock source parses', () => {
  const result = ts.transpileModule(dock, {
    fileName: dockPath, reportDiagnostics: true,
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  const errors = (result.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error);
  assert.equal(errors.length, 0, errors.map(d => ts.flattenDiagnosticMessageText(d.messageText, ' ')).join('; '));
});

test('Companion Mode controls only the existing Soullab field', () => {
  assert.match(dock, /data-listen-companion-mode/);
  assert.match(dock, /Play alongside another app/);
  assert.match(dock, /Other music stays in its original app/);
  assert.match(dock, /does not read, analyze, pause, or control the other app/);
  assert.doesNotMatch(dock, /tidal|spotify|musicKit|provider token|oauth/i);
  assert.doesNotMatch(dock, /new AudioContext|new Audio\(|<audio/);
});

test('independent volume supports slider, presets and mute restore', () => {
  assert.match(dock, /aria-label="Soullab field volume"/);
  assert.match(dock, /id: 'under'.+value: 12/s);
  assert.match(dock, /id: 'soft'.+value: 22/s);
  assert.match(dock, /id: 'present'.+value: 35/s);
  assert.match(dock, /data-listen-companion-mute/);
  assert.match(dock, /lastAudibleVolume/);
});


test('looping is explicit, permission-bound, and cleared by Stop', () => {
  assert.equal(manifest.permissions.looping, true);
  assert.match(dock, /data-listen-companion-loop/);
  assert.match(dock, /Loop repeats only this exact permitted piece after it ends; Stop clears looping/);
  assert.match(provider, /reviewManifest\.current\?\.permissions\.looping === true/);
  assert.match(provider, /kind\.current === 'local-file'/);
  assert.match(provider, /media\.current\.loop = next/);
  assert.match(provider, /media\.current\.loop = false;\s*media\.current\.removeAttribute\('src'\)/s);
  assert.doesNotMatch(dock, /autoplay/i);
});

test('gentle exit preserves immediate Stop and restores volume', () => {
  assert.match(dock, /FADE_DURATION_MS = 12_000/);
  assert.match(dock, /data-listen-companion-fade/);
  assert.match(dock, /onStopMusic\(\);\s*onVolume\(restoreVolume\)/s);
  assert.match(dock, /aria-label="Stop and clear persistent music"/);
});

test('mobile exposes the Mix panel', () => {
  assert.match(css, /@media\(max-width:600px\)/);
  assert.match(css, /\.mixPanel\{grid-column:1\/-1/);
  assert.match(css, /\.mixVolume input\{min-height:36px\}/);
  assert.doesNotMatch(css, /\.mixPanel[^}]*display:none/);
});

test('MAIA priority remains explicit', () => {
  assert.match(dock, /MAIA speech still pauses this field and never resumes it automatically/);
});
