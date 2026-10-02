import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const MAIN = fs.readFileSync(
  path.join(process.cwd(), 'src', 'main.js'),
  'utf8',
);

test('offline mode selects a loopback platform origin before shell policy loads', () => {
  assert.match(MAIN, /MAIA_CABIN_MODE/);
  assert.match(MAIN, /resolveCabinPort\(process\.env\.MAIA_CABIN_PORT\)/);
  assert.match(MAIN, /process\.env\.MAIA_PLATFORM_ORIGIN = cabinOrigin\(CABIN_PORT\)/);
  assert.match(MAIN, /require\('\.\/shell-policy'\)/);
});

test('offline mode starts the supervised runtime before the MAIA window is created', () => {
  const startup = MAIN.slice(MAIN.indexOf('app.whenReady().then(async () => {'));
  const start = startup.indexOf('const cabin = await startCabinRuntimeIfNeeded();');
  const window = startup.indexOf('\n  createWindow();');
  assert.ok(start >= 0);
  assert.ok(window > start);
});

test('offline startup passes one explicit context package path to the local runtime', () => {
  assert.match(MAIN, /resolveCabinContextPackagePath\(/);
  assert.match(MAIN, /MAIA_CABIN_CONTEXT_PACKAGE_PATH/);
  assert.match(MAIN, /cabinContextPackagePath/);
});

test('offline startup fails closed instead of falling back to the connected origin', () => {
  assert.match(MAIN, /if \(!cabin\.ok\) \{\s*app\.quit\(\);/);
});

test('Desktop shutdown stops the local runtime before quitting', () => {
  assert.match(
    MAIN,
    /app\.on\('before-quit',[\s\S]*cabinRuntime\.stop\(\)\.finally\(\(\) => app\.quit\(\)\)/,
  );
});

test('status reports the local runtime without exposing runtime credentials', () => {
  assert.match(MAIN, /cabinRuntime\.snapshot\(\)/);
  assert.doesNotMatch(MAIN, /cabin.*token/);
});
