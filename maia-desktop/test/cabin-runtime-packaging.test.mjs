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
  assert.match(BUILD, /const cabinSourceParent = process\.env\.MAIA_DESKTOP_CABIN_STAGING_PARENT/);
  assert.match(BUILD, /const cabinSource = path\.join\(cabinSourceParent, `cabin-runtime-\$\{sha\}`\)/);
  assert.match(BUILD, /fs\.cpSync\(standaloneRoot, cabinSource/);
  assert.match(BUILD, /const isBackupPayload = relative === 'backups'/);
  assert.match(BUILD, /const nextCache = path\.join\('\.next', 'cache'\)/);
  assert.match(BUILD, /const isNextBuildCache = relative === nextCache/);
  assert.match(BUILD, /fs\.cpSync\(standaloneStatic, path\.join\(cabinSource, '\.next', 'static'\)/);
  assert.match(BUILD, /fs\.cpSync\(standalonePublic, path\.join\(cabinSource, 'public'\)/);
  assert.match(PACKAGE, /"from": "cabin-runtime"/);
  assert.match(BUILD, /cabinResource\.from = cabinSource/);
  assert.match(BUILD, /const cabinNodeModulesSource = path\.join\(cabinSource, 'node_modules'\)/);
  assert.match(BUILD, /const cabinNodeModulesDestination = 'cabin-runtime\/node_modules'/);
  assert.match(BUILD, /stagedPackage\.build\.extraResources\.push/);
  assert.match(BUILD, /fs\.rmSync\(cabinSource/);
});

test('Desktop packaging refuses to proceed when standalone next is absent', () => {
  assert.match(BUILD, /node_modules', 'next', 'package\.json'/);
  assert.match(BUILD, /Cabin runtime staging missing node_modules\/next/);
});

test('Desktop packaging keeps the standalone Cabin source outside both builder project and staging parent', () => {
  assert.doesNotMatch(BUILD, /path\.join\(stageParent, 'cabin-runtime'/);
  assert.match(BUILD, /outside electron-builder project and staging parent/);
});
