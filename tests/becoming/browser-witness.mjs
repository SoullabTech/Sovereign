import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = 'http://localhost:3797';
const output = '.becoming-preview';
await mkdir(output + '/screenshots', { recursive: true });

const results = [];
const errors = [];
const requests = [];
const pass = (id, detail) => {
  results.push({ id, status: 'PASS', detail });
  console.log('PASS', id);
};

const browser = await chromium.launch({ headless: true });
let failure;
function observe(page) {
  page.setDefaultTimeout(8000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => requests.push(request.url()));
}
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    timezoneId: 'America/New_York',
  });
  const page = await context.newPage();
  observe(page);

  await page.goto(base + '/becoming');
  await page.getByRole('heading', { level: 1, name: 'Becoming' }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Across time', exact: true }).count(), 0);
  assert.equal(await page.getByRole('navigation', { name: 'Encounter movements' }).count(), 0);
  pass('J01', 'Arrival begins as a Future Self journey; Across Time and the seven-part operator UI are absent.');

  await page.screenshot({ path: output + '/screenshots/ux01r1-arrival-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Begin the journey', exact: true }).click();
  await page.getByRole('heading', { name: 'Come into the life you are actually in.' }).waitFor();
  await page.getByRole('button', { name: /I have something in mind/ }).waitFor();
  await page.getByRole('button', { name: /Let something emerge/ }).waitFor();
  pass('J02', 'The threshold offers two intelligible entry doors before any future imagery is requested.');
  await page.screenshot({ path: output + '/screenshots/ux01r1-threshold-desktop.png', fullPage: true });
  await page.getByRole('button', { name: /I have something in mind/ }).click();
  await page.getByLabel('What are you bringing into this journey?')
    .fill('Synthetic witness: contribution without constant availability.');

  const progress = page.locator('.journey-progress[aria-label="Journey progress"]');
  assert.deepEqual(await progress.locator('span').allTextContents(), ['Here', 'Opening', 'Encounter', 'Return']);
  assert.equal(await page.getByRole('button', { name: 'Keep this journey', exact: true }).count(), 0);
  pass('J03', 'The member sees four experiential phases, while Keep remains unavailable before Return.');

  await page.getByRole('button', { name: 'Let some time pass →', exact: true }).click();
  await page.getByRole('heading', { name: 'Let some time pass.' }).waitFor();
  await page.getByLabel('Give this possibility a few words').fill('A spacious contribution');
  assert.equal(await page.getByText('Desired', { exact: true }).isVisible(), false);
  pass('J04', 'Future taxonomy is secondary; the journey first asks the member to let time open.');

  await page.getByRole('button', { name: 'Enter this possibility →', exact: true }).click();
  await page.getByLabel('What do you notice first?')
    .fill('An ordinary morning with enough time to walk before work.');
  pass('J05', 'The future is encountered phenomenologically before interpretation.');
  await page.screenshot({ path: output + '/screenshots/ux01r1-encounter-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Speak with this perspective', exact: true }).click();
  await page.getByRole('heading', { name: 'Would you like to speak with this perspective?' }).waitFor();
  await page.getByRole('button', { name: '+ Ask something', exact: true }).click();
  await page.getByLabel('You, now').fill('What changed?');
  await page.getByRole('button', { name: '+ Let an answer arise', exact: true }).click();
  await page.getByLabel('The one you are becoming')
    .fill('I stopped treating urgency as proof of care.');
  await page.getByText(/This is imaginal, not a message from an actual future/).waitFor();
  pass('J06', 'Dialogue appears after encounter and both temporal voices remain member-entered.');

  await page.getByRole('button', { name: 'Reflect on what happened →', exact: true }).click();
  await page.getByLabel('What stayed with you most?').fill('The spaciousness.');
  await page.getByLabel('What feels meaningful about it?')
    .fill('Contribution remained, but urgency did not.');
  assert.equal(await page.getByLabel('What remains open?').isVisible(), false);
  pass('J07', 'Discernment begins with meaning; uncertainty/counterevidence stays optional behind disclosure.');
  await page.getByRole('button', { name: 'Return to today →', exact: true }).click();
  await page.getByRole('heading', { name: 'You are here.' }).waitFor();
  await page.getByLabel('What, if anything, do you want to bring back with you?')
    .fill('Pause before saying yes.');
  await page.getByLabel('Name this journey').fill('Spacious contribution');
  assert.equal(await page.getByRole('button', { name: 'Keep this journey', exact: true }).count(), 0);
  await page.getByRole('button', { name: 'Return to now', exact: true }).click();
  await page.getByText('You are back in the present. Keep is optional.', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Keep this journey', exact: true }).waitFor();
  pass('J08', 'Return is completed before initial Keep becomes available.');

  await page.getByRole('button', { name: 'Carry something into present life', exact: true }).click();
  await page.getByRole('button', { name: 'Nothing yet', exact: true }).click();
  await page.getByText('Nothing needs to become an action. The encounter can remain open.', { exact: true }).waitFor();
  pass('J09', 'Carry is optional and Nothing yet is a complete choice.');
  await page.getByRole('button', { name: 'Keep this journey', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'revision 1' }).waitFor();
  await page.getByRole('button', { name: 'Your journeys', exact: true }).click();
  await page.getByRole('heading', { name: 'Your journeys', exact: true }).waitFor();
  await page.getByRole('button').filter({ has: page.getByRole('heading', { name: 'Spacious contribution', exact: true }) }).waitFor();
  await page.getByRole('button', { name: 'Across time', exact: true }).waitFor();
  pass('J10', 'Across Time appears only after a journey has actually been kept.');

  await page.getByRole('button', { name: 'Across time', exact: true }).click();
  await page.getByRole('heading', { name: 'What does this journey touch?' }).waitFor();
  assert.equal(await page.getByText('Has been', { exact: true }).count(), 0);
  assert.equal(await page.getByText('Is being', { exact: true }).count(), 0);
  assert.equal(await page.getByText('Is becoming', { exact: true }).count(), 0);
  await page.getByRole('heading', { name: 'What brought you here' }).waitFor();
  await page.getByRole('heading', { name: 'What is true now' }).waitFor();
  await page.getByRole('heading', { name: 'What is opening' }).waitFor();
  pass('J11', 'Across Time uses human language while the temporal architecture remains underneath.');
  const sourceChoice = page.locator('.source-check').filter({ hasText: 'Spacious contribution' });
  await sourceChoice.locator('input').check();
  await page.getByLabel('What feels true in your life today?')
    .fill('Synthetic present: a new invitation is here.');
  await page.getByLabel('A connection I notice')
    .fill('Generosity and automatic availability may not be the same thing.');
  await page.getByLabel('And what does not fit?')
    .fill('Some invitations feel joyful rather than burdensome.');
  await page.screenshot({ path: output + '/screenshots/ux01r1-across-time-desktop.png', fullPage: true });

  await page.getByRole('button', { name: 'Your journeys', exact: true }).click();
  await page.getByRole('dialog', { name: 'Leave these Across Time notes?' }).waitFor();
  await page.getByRole('button', { name: 'Stay with these notes', exact: true }).click();
  assert.equal(
    await page.getByLabel('A connection I notice').inputValue(),
    'Generosity and automatic availability may not be the same thing.',
  );
  pass('J12', 'Across Time notes are not silently discarded on navigation.');
  await page.getByRole('button', { name: 'Take this into a new Becoming journey →', exact: true }).click();
  await page.getByRole('heading', { name: 'Begin with what brought you here.' }).waitFor();
  await page.getByRole('heading', { name: 'What you chose to bring' }).waitFor();
  await page.getByText('Spacious contribution', { exact: true }).waitFor();
  await page.getByText('earlier imagined possibility', { exact: false }).waitFor();
  pass('J13', 'Across Time opens a new journey with exact-source identity and explicit epistemic framing.');

  await page.getByRole('button', { name: 'Pause and leave', exact: true }).click();
  await page.getByRole('dialog', { name: 'Leave this journey?' }).waitFor();
  await page.getByRole('button', { name: 'Leave without keeping', exact: true }).click();
  await page.getByRole('heading', { name: 'Becoming', exact: true }).waitFor();
  pass('J14', 'An unfinished journey may be explicitly discarded without inventing Return.');
  await page.getByRole('button', { name: 'Your journeys', exact: true }).click();
  const card = page.getByRole('button').filter({ has: page.getByRole('heading', { name: 'Spacious contribution', exact: true }) });
  await card.click();
  await page.getByText('I stopped treating urgency as proof of care.', { exact: true }).waitFor();
  await page.getByText('IMAGINED POSSIBILITY · NOT A PREDICTION', { exact: true }).waitFor();
  pass('J15', 'The kept journey preserves member-authored dialogue and imagined-future provenance.');

  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.getByRole('button', { name: 'Delete journey and revisions', exact: true }).click();
  await page.getByRole('heading', { name: 'Nothing has been kept here yet.' }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Across time', exact: true }).count(), 0);
  pass('J16', 'Deleting the only kept journey returns Across Time to unavailable.');
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  const mp = await mobile.newPage();
  observe(mp);
  await mp.goto(base + '/becoming');
  await mp.getByRole('button', { name: 'Begin the journey', exact: true }).click();
  await mp.screenshot({ path: output + '/screenshots/ux01r1-threshold-mobile.png', fullPage: true });
  assert.ok(await mp.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  pass('J17', 'The Future Self threshold fits a 390px mobile viewport without horizontal overflow.');

  await mp.getByRole('button', { name: /Let something emerge/ }).click();
  await mp.getByLabel('What feels most present right now?').fill('Synthetic mobile journey.');
  await mp.getByRole('button', { name: 'Let some time pass →', exact: true }).click();
  assert.ok(await mp.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  pass('J18', 'The guided journey remains width-safe after entering the experience.');
  const visibleButtons = await mp.getByRole('button').evaluateAll(buttons =>
    buttons.filter(button => button.getBoundingClientRect().height > 0).map(button => ({
      label: button.textContent,
      size: parseFloat(getComputedStyle(button).fontSize),
      height: button.getBoundingClientRect().height,
    })),
  );
  assert.ok(visibleButtons.every(button => button.size >= 16 && button.height >= 44), JSON.stringify(visibleButtons));
  pass('J19', 'Visible mobile actions meet the 16px type and 44px target floors.');
  await mobile.close();

  assert.equal(errors.length, 0, errors.join('\n'));
  assert.ok(requests.every(url => new URL(url).origin === base));
  pass('J20', 'The bounded witness produced no page errors or off-origin browser requests.');

  const healthResponse = await fetch(base + '/health');
  const health = await healthResponse.json();
  assert.equal(health.scope, 'isolated-local-preview');
  assert.equal(health.providerCalls, false);
  await writeFile(output + '/ux01r1-health.json', JSON.stringify(health, null, 2));
  pass('J21', 'The preview still declares isolated local scope with provider calls disabled.');
} catch (error) {
  failure = error;
  console.error('UX01R1_WITNESS_FAILED', error.message);
} finally {
  await browser.close();
  await writeFile(
    output + '/ux01r1-browser-witness.json',
    JSON.stringify({
      scope: 'Fresh synthetic browser contexts; visible journey UI only; no account, model, production, or direct database audit.',
      recordedAt: new Date().toISOString(),
      results,
      errors,
      requests: [...new Set(requests)],
      failure: failure ? String(failure.message) : null,
    }, null, 2),
  );
}
if (failure) process.exitCode = 1;
