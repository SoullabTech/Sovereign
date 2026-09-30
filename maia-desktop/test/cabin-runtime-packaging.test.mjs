import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const BUILD = fs.readFileSync(
  path.join(process.cwd(), 'scripts', 'build.mjs'),
  'utf8',
);

test('Desktop packaging refuses to claim a Cabin without a real standalone server', () => {
  assert.match(BUILD, /path\.join\(repoRoot, '\.next', 'standalone'\)/);
  assert.match(BUILD, /standaloneServer/);
  assert.match(BUILD, /Cabin runtime is not built/);
});

test('Desktop packaging carries standalone, static, and public assets into the Cabin resource', () => {
  assert.match(BUILD, /fs\.cpSync\(standaloneRoot, cabinStage/);
  assert.match(BUILD, /fs\.cpSync\(standaloneStatic, path\.join\(cabinStage, '\.next', 'static'\)/);
  assert.match(BUILD, /fs\.cpSync\(standalonePublic, path\.join\(cabinStage, 'public'\)/);
});
