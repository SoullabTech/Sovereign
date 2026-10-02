import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const BUILD = fs.readFileSync(
  path.join(process.cwd(), 'scripts', 'build.mjs'),
  'utf8',
);
const VERIFY = fs.readFileSync(
  path.join(process.cwd(), 'scripts', 'verify-package.mjs'),
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
  assert.match(BUILD, /fs\.cpSync\(standalonePublic, cabinPublic, \{ recursive: true, dereference: true \}\)/);
  assert.match(PACKAGE, /"from": "cabin-runtime"/);
  assert.match(BUILD, /cabinResource\.from = cabinSource/);
  assert.match(BUILD, /const cabinNodeModulesSource = path\.join\(cabinSource, 'node_modules'\)/);
  assert.match(BUILD, /const cabinNodeModulesDestination = 'cabin-runtime\/node_modules'/);
  assert.match(BUILD, /stagedPackage\.build\.extraResources\.push/);
  // The extra resource must copy FROM the node_modules directory itself:
  // electron-builder's FileMatcher drops a root node_modules, so pointing it
  // back at cabinSource (the e3688fce2 defect) would ship without next.
  assert.match(BUILD, /extraResources\.push\(\{\s*from: cabinNodeModulesSource,\s*to: cabinNodeModulesDestination,/);
  assert.match(BUILD, /resource\?\.from === cabinNodeModulesSource && resource\?\.to === cabinNodeModulesDestination/);
  assert.match(BUILD, /fs\.rmSync\(cabinSource/);
});

test('Desktop packaging materializes host-bound public symlinks and rejects non-portable staged symlinks', () => {
  assert.match(BUILD, /fs\.rmSync\(cabinPublic, \{ recursive: true, force: true \}\)/);
  assert.match(BUILD, /dereference: true/);
  assert.match(BUILD, /materializeSymlinks\(cabinPublic\)/);
  assert.match(BUILD, /fs\.realpathSync\(entryPath\)/);
  assert.match(BUILD, /assertPortableSymlinks\(cabinSource\)/);
  assert.match(BUILD, /Cabin runtime contains absolute symlink/);
  assert.match(BUILD, /Cabin runtime symlink escapes staging root/);
});

test('Desktop packaging refuses to proceed when standalone next is absent', () => {
  assert.match(BUILD, /node_modules', 'next', 'package\.json'/);
  assert.match(BUILD, /Cabin runtime staging missing node_modules\/next/);
});

test('Desktop packaging keeps the standalone Cabin source outside both builder project and staging parent', () => {
  assert.doesNotMatch(BUILD, /path\.join\(stageParent, 'cabin-runtime'/);
  assert.match(BUILD, /outside electron-builder project and staging parent/);
});

test('Artifact verification witnesses the packaged Cabin next at the pinned version', () => {
  assert.match(VERIFY, /'cabin-runtime', 'node_modules', 'next', 'package\.json'|cabinRuntime, 'node_modules', 'next', 'package\.json'/);
  assert.match(VERIFY, /packaged cabin-runtime\/node_modules\/next is missing/);
  assert.match(VERIFY, /assert\.equal\(packagedNextVersion, pinnedNext/);
});

test('Desktop signs every staged Cabin Mach-O before electron-builder finalizes the app', () => {
  assert.match(BUILD, /find-identity/);
  assert.match(BUILD, /Developer ID Application:/);
  assert.match(BUILD, /description\.includes\('Mach-O'\)/);
  assert.match(BUILD, /'--timestamp'/);
  assert.match(BUILD, /'--options', 'runtime'/);
  assert.match(BUILD, /signCabinMachOBinaries\(cabinSource\)/);
});

test('External-beta verification requires trust on every packaged Cabin Mach-O', () => {
  assert.match(VERIFY, /cabinMachOBinaries\(cabinRuntime\)/);
  assert.match(VERIFY, /secureTimestamp: \/Timestamp=\/\.test\(text\)/);
  assert.match(VERIFY, /hardenedRuntime: \/flags=\.\*runtime\/\.test\(text\)/);
  assert.match(VERIFY, /const cabinNativeReady = cabinNativeTrust\.every/);
  assert.match(VERIFY, /all Cabin Mach-O binaries require Developer ID, secure timestamp, and hardened runtime/);
});
