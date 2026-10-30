'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const files = [
  'app/listen/page.tsx',
  'app/listen/ListenRoom.tsx',
  'app/listen/SoundStudioField.tsx',
  'app/listen/listen.module.css',
  'components/listening/PersistentListeningProvider.tsx',
  'components/listening/PersistentListeningDock.tsx',
  'components/listening/persistentListeningDock.module.css',
  'lib/listening/soundStudioExperience.ts',
];

for (const file of files.filter(file => /\.(ts|tsx)$/.test(file))) {
  test(`${file} parses`, () => {
    const result = ts.transpileModule(read(file), {
      fileName: file,
      reportDiagnostics: true,
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    });
    const errors = (result.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error);
    assert.equal(errors.length, 0, errors.map(d => ts.flattenDiagnosticMessageText(d.messageText, ' ')).join('; '));
  });
}

test('one Sound Studio field progressively discloses four reasons to enter', () => {
  const field = read('app/listen/SoundStudioField.tsx');
  const model = read('lib/listening/soundStudioExperience.ts');
  for (const door of ['experience', 'explore', 'create', 'professional']) {
    assert.match(model, new RegExp(`id: '${door}'`));
    assert.match(field, /data-sound-studio-door-button/);
  }
  assert.match(field, /What brings you to sound today\?/);
  assert.match(field, /One studio, one listening authority/);
});

test('Open Ground is a manifest-bound six-minute experience with four passages', () => {
  const model = read('lib/listening/soundStudioExperience.ts');
  const manifest = JSON.parse(read('lib/listening/manifests/open-ground-432-v1.json'));
  assert.equal(manifest.schema, 'soullab.sound.experience-manifest.v1');
  assert.equal(manifest.experienceId, 'open-ground-432-v1');
  assert.equal(manifest.durationMs, 6 * 60 * 1000);
  assert.deepEqual(manifest.passages.map(passage => passage.label),
    ['Arrival', 'Opening', 'Dwelling', 'Return']);
  assert.equal(manifest.techniques.tuningReferenceHz, 432);
  assert.match(model, /OPEN_GROUND_EXPERIENCE_MANIFEST\.experienceId/);
  assert.match(model, /reviewMediaEdition/);
  assert.match(model, /A4 = 432 Hz reference/);
});


test('Night Ground is a distinct manifest-bound guided Dream Field experience', () => {
  const model = read('lib/listening/soundStudioExperience.ts');
  const field = read('app/listen/SoundStudioField.tsx');
  const manifest = JSON.parse(read('lib/listening/manifests/night-ground-01-guided-arrival-v0.1.json'));
  assert.equal(manifest.experienceId, 'night-ground-01-guided-arrival-v0.1');
  assert.equal(manifest.durationMs, 12 * 60 * 1000);
  assert.equal(manifest.voice.voiceId, 'af_bella');
  assert.equal(manifest.script.hiddenOrReversedContent, false);
  assert.equal(manifest.permissions.looping, false);
  assert.match(model, /NIGHT_GROUND_EXPERIENCE_MANIFEST\.experienceId/);
  assert.match(field, /work\.manifest \? 'Enter experience' : 'View study'/);
  assert.match(field, /selected\.qualityStatement/);
});

test('new field reuses provider and creates no second audio engine', () => {
  const field = read('app/listen/SoundStudioField.tsx');
  const dock = read('components/listening/PersistentListeningDock.tsx');
  const provider = read('components/listening/PersistentListeningProvider.tsx');
  assert.doesNotMatch(field, /new AudioContext|new Audio\(|<audio/);
  assert.doesNotMatch(dock, /new AudioContext|new Audio\(|<audio/);
  assert.match(field, /transport\.playExperienceMedia/);
  assert.match(field, /transport\.playSketch/);
  assert.match(provider, /function newSketch/);
  assert.match(provider, /const playExperienceMedia/);
  assert.equal((provider.match(/<audio ref=\{media\}/g) || []).length, 1);
});

test('persistent player preserves direct Stop and experience progress', () => {
  const provider = read('components/listening/PersistentListeningProvider.tsx');
  const dock = read('components/listening/PersistentListeningDock.tsx');
  assert.match(provider, /experienceId/);
  assert.match(provider, /elapsedMs/);
  assert.match(provider, /soundPassageAt/);
  assert.match(dock, /aria-label="Stop and clear persistent music"/);
  assert.match(dock, /data-listen62-passage/);
  assert.match(dock, /Open field/);
});

test('desktop, tablet and phone layout contracts are explicit', () => {
  const studio = read('app/listen/listen.module.css');
  const dock = read('components/listening/persistentListeningDock.module.css');
  assert.match(studio, /@media\(max-width:1120px\)/);
  assert.match(studio, /@media\(max-width:700px\)/);
  assert.match(studio, /@media\(max-width:420px\)/);
  assert.match(dock, /@media\(max-width:900px\)/);
  assert.match(dock, /@media\(max-width:600px\)/);
  assert.match(studio, /overflow:hidden/);
});

test('existing review route and daily listening path remain intact', () => {
  const page = read('app/listen/page.tsx');
  const room = read('app/listen/ListenRoom.tsx');
  assert.match(page, /SOULLAB_LISTEN_REVIEW_ENABLED !== '1'/);
  assert.match(page, /await requireMemberId\(\)/);
  assert.match(room, /<SoundStudioField/);
  assert.match(room, /data-daily-listening-world="true"/);
  assert.match(room, /The Blue Hour/);
  assert.doesNotMatch(room, /localStorage|sessionStorage/);
});
