// Actual JARVIS window test. Positive opening uses a FICTIONAL loopback fixture.
// This is not acceptance of Cabin's real runtime or conversation implementation.
import { _electron as electron } from 'playwright';
import { createServer } from 'node:http';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import assert from 'node:assert/strict';

const root = resolve('.');
const temporary = mkdtempSync(join(tmpdir(), 'jarvis-cabin-window-'));
const support = join(temporary, 'support');
mkdirSync(support);
const wrapper = join(temporary, 'main.cjs');
writeFileSync(wrapper,
  "const {app}=require('electron');\n" +
  "app.setPath('appData'," + JSON.stringify(support) + ");\n" +
  "require(" + JSON.stringify(join(root, 'jarvis-desktop/src/main.js')) + ");\n");
const executablePath = process.env.CABIN_CANARY_ELECTRON;
assert.ok(executablePath, 'Set CABIN_CANARY_ELECTRON to the installed Electron executable');
const fixture = createServer((request, response) => {
  if (request.url === '/api/cabin/health') {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ status: 'ready', mode: 'offline',
      build: 'FICTIONAL-JARVIS-WINDOW-FIXTURE', context: 'empty' }));
  } else {
    response.setHeader('Content-Type', 'text/html');
    response.end('<html><body><h1>Fictional Cabin opening fixture</h1><a id="outside" href="https://example.com/">External destination</a></body></html>');
  }
});
let application;
let listening = false;
try {
  // Refuse to occupy a port already used by a real runtime.
  await new Promise((resolvePromise, reject) => {
    fixture.once('error', reject);
    fixture.listen(43121, '127.0.0.1', () => { listening = true; resolvePromise(); });
  });
  const env = { ...process.env, JARVIS_REPO_ROOT: root };
  delete env.ELECTRON_RUN_AS_NODE;
  application = await electron.launch({ executablePath, args: [wrapper], env, timeout: 30000 });
  const page = await application.firstWindow();
  await page.locator('#cabin-check').waitFor({ timeout: 30000 });
  const paths = await application.evaluate(({ app }) => ({
    appData: app.getPath('appData'), userData: app.getPath('userData'),
  }));
  assert.ok(paths.appData.startsWith(temporary));
  assert.ok(paths.userData.startsWith(temporary));
  assert.equal(await page.locator('#cabin-open').isDisabled(), true);
  await page.locator('#cabin-check').click();
  await page.waitForFunction(() => !document.querySelector('#cabin-open').disabled);
  assert.match(await page.locator('#cabin-readiness').innerText(), /acceptance remain to be verified/);
  const openedPromise = application.waitForEvent('window');
  await page.locator('#cabin-open').click();
  const cabin = await openedPromise;
  await cabin.locator('h1').waitFor();
  assert.match(await cabin.locator('h1').innerText(), /Fictional Cabin/);
  await cabin.locator('#outside').click({ noWaitAfter: true });
  await cabin.waitForTimeout(250);
  assert.equal(new URL(cabin.url()).origin, 'http://127.0.0.1:43121');
  const externalBlocked = await cabin.evaluate(async () => {
    try { await fetch('https://example.com/', { signal: AbortSignal.timeout(2000) }); return false; } catch { return true; }
  });
  assert.equal(externalBlocked, true);
  await cabin.close();
  await new Promise(resolvePromise => fixture.close(resolvePromise)); listening = false;
  await page.locator('#cabin-check').click();
  await page.waitForFunction(() => document.querySelector('#cabin-readiness').textContent.includes('Start the isolated'));
  assert.equal(await page.locator('#cabin-open').isDisabled(), true);
  console.log(JSON.stringify({
    actualJarvisWindow: 'PASS', isolatedStorage: 'PASS',
    fictionalFixtureOpen: 'PASS', externalNavigationBlocked: 'PASS',
    externalFetchBlocked: 'PASS', stoppedRuntimeDisablesOpen: 'PASS',
    realCabinAcceptance: 'NOT_TESTED', installedJarvisReplacement: false,
  }));
} finally {
  await application?.close();
  if (listening) await new Promise(resolvePromise => fixture.close(resolvePromise));
  rmSync(temporary, { recursive: true, force: true });
}
