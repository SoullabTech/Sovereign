import { _electron as electron } from 'playwright';
import assert from 'node:assert/strict';
const app = await electron.launch({
  executablePath: '/Users/soullab/Applications/Cabin.app/Contents/MacOS/Electron',
  args: [], timeout: 30000,
});
try {
  const page = await app.firstWindow();
  await page.locator('#check').waitFor();
  await page.waitForFunction(() => !document.querySelector('#check').disabled);
  assert.equal(await page.title(), 'Cabin');
  assert.match(await page.locator('body').innerText(), /Setup in progress/);
  const status = await page.locator('#status').innerText();
  assert.ok(status.includes('not running yet') || status.includes('is running'));
  const identity = await app.evaluate(({ app }) => ({
    name: app.getName(), userData: app.getPath('userData'),
  }));
  assert.equal(identity.name, 'Cabin');
  assert.ok(identity.userData.endsWith('/Soullab Cabin'));
  assert.equal(await page.evaluate(() => typeof window.require), 'undefined');
  assert.deepEqual(await page.evaluate(() => Object.keys(window.cabin).sort()), ['open', 'readiness']);
  await page.locator('#check').click();
  await page.waitForFunction(() => !document.querySelector('#check').disabled);
  console.log(JSON.stringify({ actualPackagedWindow: 'PASS', readinessButton: 'PASS',
    isolatedAppStorage: 'PASS', narrowBridge: 'PASS', nodeIntegration: 'DISABLED',
    status, realConversation: 'NOT_IMPLEMENTED' }));
} finally { await app.close(); }
