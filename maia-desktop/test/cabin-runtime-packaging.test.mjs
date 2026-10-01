import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const BUILD = fs.readFileSync(
  path.join(process.cwd(), 'scripts', 'build.mjs'),
  'utf8',
);
const PACKAGE = fs.readFileSync(
  path.join(process.cwd(), 'package.json'),
  'utf8',
);

test('Desktop packaging refuses to claim a Cabin without a real standalone server', () => {
  assert.match(BUILD, /path\.join\(repoRoot, '\.next', 'standalone'\)/);
  assert.match(BUILD, /standaloneServer/);
  assert.match(BUILD, /Cabin runtime is not built/);
});

test('Desktop packaging carries standalone, static, and public assets into the Cabin resource', () => {
  assert.match(BUILD, /const cabinSource = path\.join\(stageParent, 'cabin-runtime'\)/);
  assert.match(BUILD, /fs\.cpSync\(standaloneRoot, cabinSource/);
  assert.match(BUILD, /fs\.cpSync\(standaloneStatic, path\.join\(cabinSource, '\.next', 'static'\)/);
  assert.match(BUILD, /fs\.cpSync\(standalonePublic, path\.join\(cabinSource, 'public'\)/);
  assert.match(PACKAGE, /"from": "\.\.\/cabin-runtime"/);
  assert.match(BUILD, /fs\.rmSync\(cabinSource/);
});

test('Desktop packaging keeps the standalone Cabin dependency tree outside electron-builder npm install', () => {
  assert.doesNotMatch(BUILD, /const cabinStage = path\.join\(stage, 'cabin-runtime'\)/);
  assert.match(BUILD, /outside electron-builder project root/);
});
