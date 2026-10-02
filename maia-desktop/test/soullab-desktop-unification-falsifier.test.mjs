import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const LAW = require('../src/soullab-desktop-boundary.js');
const ROOT = path.resolve(import.meta.dirname, '../..');

test('SDU-F1 remote platform can never receive a privileged bridge', () => {
  const defeat = () => true;
  assert.equal(defeat('platform', 'jarvis'), true);
  assert.equal(LAW.canExposeBridge('platform', 'maia'), false);
  assert.equal(LAW.canExposeBridge('platform', 'jarvis'), false);
  assert.equal(LAW.realmPolicy('platform').preload, null);
});

test('SDU-F2 MAIA and JARVIS bridges do not cross realms', () => {
  assert.equal(LAW.canExposeBridge('maia', 'maia'), true);
  assert.equal(LAW.canExposeBridge('jarvis', 'jarvis'), true);
  assert.equal(LAW.canExposeBridge('maia', 'jarvis'), false);
  assert.equal(LAW.canExposeBridge('jarvis', 'maia'), false);
});

test('SDU-F3 sovereign transport never falls through to production', () => {
  const defeat = ({ localOrigin }) => ({ ok: true, origin: localOrigin || 'https://soullab.life' });
  assert.equal(defeat({}).origin, 'https://soullab.life');
  const absent = LAW.selectPlatformTransport({ mode: 'sovereign' });
  assert.deepEqual(absent, { ok: false, mode: 'sovereign', reason: 'LOCAL_RUNTIME_REQUIRED' });
  assert.equal('origin' in absent, false);
});

test('SDU-F4 sovereign transport accepts loopback only and connected is explicit', () => {
  assert.deepEqual(LAW.selectPlatformTransport({ mode: 'connected' }), {
    ok: true, mode: 'connected', origin: 'https://soullab.life',
  });
  assert.equal(LAW.selectPlatformTransport({ mode: 'sovereign', localOrigin: 'https://example.com' }).ok, false);
  assert.equal(LAW.selectPlatformTransport({ mode: 'sovereign', localOrigin: 'http://127.0.0.1:3597/path' }).ok, false);
  assert.deepEqual(LAW.selectPlatformTransport({ mode: 'sovereign', localOrigin: 'http://127.0.0.1:3597' }), {
    ok: true, mode: 'sovereign', origin: 'http://127.0.0.1:3597',
  });
});

test('SDU-F5 legacy Desktop and LabTools never become product authority', () => {
  assert.equal(LAW.productAuthority('desktop-app'), 'legacy-noncanonical');
  assert.equal(LAW.productAuthority('electron'), 'legacy-noncanonical');
  assert.equal(LAW.productAuthority('maia-desktop'), 'host');
  assert.equal(LAW.productAuthority('jarvis-desktop'), 'operator-realm');
});

test('SDU-F6 product rename cannot fork local state without migration', () => {
  assert.deepEqual(LAW.stateIdentityChange({ currentProductName: 'MAIA Desktop', nextProductName: 'Soullab Desktop' }), {
    ok: false, reason: 'STATE_MIGRATION_REQUIRED',
  });
  assert.deepEqual(LAW.stateIdentityChange({
    currentProductName: 'MAIA Desktop', nextProductName: 'Soullab Desktop', migrationDeclared: true,
  }), { ok: true });
});

test('SDU-F7 existing Electron boundaries still structurally agree with the law', () => {
  const shellPolicy = fs.readFileSync(path.join(ROOT, 'maia-desktop/src/shell-policy.js'), 'utf8');
  const jarvisPreload = fs.readFileSync(path.join(ROOT, 'jarvis-desktop/src/preload.js'), 'utf8');
  assert.match(shellPolicy, /preload` key.*absent|NO `preload` key/s);
  assert.match(shellPolicy, /nodeIntegration:\s*false/);
  assert.match(jarvisPreload, /exposeInMainWorld\('jarvis'/);
  assert.doesNotMatch(jarvisPreload, /exposeInMainWorld\('maia'/);
});

test('SDU-F8 JARVIS host lifecycle is suppressible when composed inside Soullab Desktop', () => {
  const jarvisMain = fs.readFileSync(path.join(ROOT, 'jarvis-desktop/src/main.js'), 'utf8');
  assert.match(jarvisMain, /const STANDALONE = require\.main === module/);
  assert.match(jarvisMain, /if \(STANDALONE && !app\.isPackaged\)/);
  assert.match(jarvisMain, /if \(STANDALONE\) \{[\s\S]*app\.whenReady\(\)/);
  assert.match(jarvisMain, /module\.exports = \{[\s\S]*createWindow/);
});

test('SDU-F9 JARVIS durable state is product-name independent', () => {
  const repoConfig = fs.readFileSync(path.join(ROOT, 'jarvis-desktop/src/repo-config.js'), 'utf8');
  const continuity = fs.readFileSync(path.join(ROOT, 'jarvis-desktop/src/continuity.js'), 'utf8');
  assert.match(repoConfig, /CONFIG_DIRNAME = 'JARVIS'/);
  assert.match(repoConfig, /configDir\(appSupportDir\)/);
  assert.match(continuity, /'\.jarvis', 'continuity', 'continuity\.sqlite3'/);
});

test('SDU-F10 JARVIS doorway is server-authorized in MAIN, never role-guessed in renderer', () => {
  const main = fs.readFileSync(path.join(ROOT, 'maia-desktop/src/main.js'), 'utf8');
  const renderer = fs.readFileSync(path.join(ROOT, 'maia-desktop/src/renderer.js'), 'utf8');
  assert.match(main, /authedFetch\('\/api\/admin\/auth'\)/);
  assert.match(main, /founder.*cto|cto.*founder/s);
  assert.match(main, /operatorAccess/);
  assert.doesNotMatch(renderer, /JARVIS|operatorAccess|admin\/auth/);
});

test('SDU-F11 sign-out revokes the JARVIS realm as well as member surfaces', () => {
  const main = fs.readFileSync(path.join(ROOT, 'maia-desktop/src/main.js'), 'utf8');
  assert.match(main, /function closeJarvisRealm\(/);
  assert.match(main, /teardownMemberState[\s\S]*closeJarvisRealm\(\)/);
});

test('SDU-F12 one packaged Desktop carries the JARVIS realm source as a resource', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'maia-desktop/package.json'), 'utf8'));
  const build = fs.readFileSync(path.join(ROOT, 'maia-desktop/scripts/build.mjs'), 'utf8');
  const resources = pkg.build?.extraResources ?? [];
  assert.ok(resources.some((entry) =>
    entry?.from === 'vendor/jarvis-desktop/src' && entry?.to === 'jarvis-desktop/src'));
  assert.match(build, /jarvis-desktop', 'src'/);
  assert.match(build, /vendor', 'jarvis-desktop', 'src'/);
});
