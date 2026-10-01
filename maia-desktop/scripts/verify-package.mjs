import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const outputDir = process.env.MAIA_DESKTOP_OUTPUT_DIR || path.join(root, 'dist');
const appPath = path.join(outputDir, 'mac-arm64', 'MAIA Desktop.app');
const plist = path.join(appPath, 'Contents', 'Info.plist');
const executable = path.join(appPath, 'Contents', 'MacOS', 'MAIA Desktop');
const asar = path.join(appPath, 'Contents', 'Resources', 'app.asar');

assert.ok(fs.existsSync(plist), `packaged app missing: ${appPath}`);
assert.ok(fs.existsSync(executable), 'packaged executable is missing');
assert.ok(fs.existsSync(asar), 'app.asar is missing');

// Cabin runtime: the packaged app must carry the Next standalone server AND its
// root node_modules (electron-builder's FileMatcher drops a root node_modules —
// candidates c6102a347, 147815873, e3688fce2 all shipped without it). Existence
// is not enough: the packaged next must be the version canonical pins.
const cabinRuntime = path.join(appPath, 'Contents', 'Resources', 'cabin-runtime');
assert.ok(fs.existsSync(path.join(cabinRuntime, 'server.js')), 'packaged cabin-runtime/server.js is missing');
const packagedNextManifest = path.join(cabinRuntime, 'node_modules', 'next', 'package.json');
assert.ok(fs.existsSync(packagedNextManifest), 'packaged cabin-runtime/node_modules/next is missing');
const packagedNextVersion = JSON.parse(fs.readFileSync(packagedNextManifest, 'utf8')).version;
const rootManifest = JSON.parse(fs.readFileSync(path.join(root, '..', 'package.json'), 'utf8'));
const pinnedNext = rootManifest.dependencies?.next;
assert.match(pinnedNext ?? '', /^\d+\.\d+\.\d+$/, `root package.json must pin an exact next version (got ${pinnedNext})`);
assert.equal(packagedNextVersion, pinnedNext, `packaged next ${packagedNextVersion} != pinned next ${pinnedNext}`);

function run(command, args) {
  return spawnSync(command, args, { encoding: 'utf8' });
}

function plistValue(key) {
  const out = run('plutil', ['-extract', key, 'raw', '-o', '-', plist]);
  assert.equal(out.status, 0, out.stderr);
  return out.stdout.trim();
}
assert.equal(plistValue('CFBundleIdentifier'), 'life.soullab.maia.desktop');
assert.equal(plistValue('CFBundleShortVersionString'), '0.1.0-beta.1');
assert.match(plistValue('NSMicrophoneUsageDescription'), /microphone/i);

const arch = run('lipo', ['-archs', executable]);
assert.equal(arch.status, 0, arch.stderr);
assert.match(arch.stdout, /arm64/);

const metadataProbe = spawnSync(executable, [
  '-e',
  `const p=require(${JSON.stringify(asar + '/package.json')});console.log(JSON.stringify(p))`,
], { encoding: 'utf8', env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' } });
assert.equal(metadataProbe.status, 0, metadataProbe.stderr);
const metadata = JSON.parse(metadataProbe.stdout);
assert.equal(metadata.version, '0.1.0-beta.1');
assert.match(metadata.maiaBuildSha, /^[0-9a-f]{12}$/);

const signature = run('codesign', ['--verify', '--deep', '--strict', appPath]);
assert.equal(signature.status, 0, signature.stderr || 'invalid application signature');

const details = run('codesign', ['-dv', '--verbose=4', appPath]);
const signatureText = `${details.stdout}\n${details.stderr}`;
const developerId = /Authority=Developer ID Application:/.test(signatureText);
const assessment = run('spctl', ['--assess', '--type', 'execute', '--verbose=4', appPath]);
const gatekeeperAccepted = assessment.status === 0;
const externalReady = developerId && gatekeeperAccepted;

console.log(JSON.stringify({
  appPath,
  version: plistValue('CFBundleShortVersionString'),
  arch: arch.stdout.trim(),
  cabinNext: packagedNextVersion,
  signatureValid: true,
  developerId,
  gatekeeperAccepted,
  releaseClass: externalReady ? 'EXTERNAL_BETA' : 'LOCAL_BETA_ONLY',
}, null, 2));

if (process.env.REQUIRE_EXTERNAL_BETA === '1') {
  assert.ok(externalReady, 'Developer ID signing and Gatekeeper acceptance are required');
}
