import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.BECOMING_BASE ?? 'http://localhost:3797';
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
  const maiaRequests = [];
  let maiaMockCount = 0;
  await page.route('**/api/maia', async route => {
    const payload = JSON.parse(route.request().postData() || '{}');
    maiaRequests.push(payload);
    maiaMockCount += 1;
    const message = maiaMockCount === 1
      ? 'Synthetic MAIA synthesis: I hear a movement from urgency toward spacious contribution. Does that distinction feel alive to you?'
      : 'Synthetic MAIA continuation: yes — we can stay with that without turning it into a conclusion.';
    if (maiaMockCount > 1) await new Promise(resolve => setTimeout(resolve, 250));
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message }) });
  });

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
  const doors=page.locator('.elemental-entry-choices[aria-label="Choose an elemental doorway"]');
  await doors.getByRole('button', { name: 'Fire', exact: true }).click();
  await page.getByLabel('What is alive in you here?').fill('Teaching, making, and giving from desire rather than compulsion.');
  const elementalTrace=page.locator('.elemental-trace[aria-label="Elemental immersion"]');
  await elementalTrace.getByRole('button', { name: 'Earth', exact: true }).click();
  await page.getByLabel('What is physically here?').fill('Cool floorboards, morning light, coffee, and room to breathe.');
  await elementalTrace.getByRole('button', { name: 'Water', exact: true }).click();
  await page.getByLabel('What is moving through you here?').fill('Relief, warmth, and affection without urgency.');
  await elementalTrace.getByRole('button', { name: 'Air', exact: true }).click();
  await page.getByLabel('What do you understand from inside this life?').fill('Availability and care are not the same thing.');
  await elementalTrace.getByRole('button', { name: 'Aether', exact: true }).click();
  await page.getByLabel('When you stop explaining it, what seems quietly true here?').fill('Contribution remains when urgency falls away.');
  assert.deepEqual(await elementalTrace.getByRole('button').allTextContents(), ['Earth', 'Water', 'Air', 'Fire', 'Aether']);
  await page.screenshot({ path: output + '/screenshots/ux01r3-elemental-aether-desktop.png', fullPage: true });
  pass('J05E', 'The member can enter the elemental field non-linearly and inhabit Earth, Water, Air, Fire, and Aether without any element claiming authority over meaning.');
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

  await page.getByRole('button', { name: 'Talk with MAIA about this journey', exact: true }).click();
  await page.getByRole('heading', { name: 'Stay with what opened.' }).waitFor();
  await page.getByText(/conversation stays in Becoming/).waitFor();
  assert.equal(new URL(page.url()).pathname, '/becoming');
  await page.getByText(/Synthetic MAIA synthesis:/).waitFor();
  assert.equal(maiaRequests.length, 1);
  const firstHandoff = maiaRequests[0];
  assert.match(firstHandoff.message, /Please do not ask me to repeat/);
  assert.match(firstHandoff.message, /An ordinary morning with enough time to walk before work/);
  assert.match(firstHandoff.message, /I stopped treating urgency as proof of care/);
  assert.match(firstHandoff.message, /WHAT I BROUGHT BACK\nPause before saying yes/);
  assert.match(firstHandoff.message, /imaginal possibilities, not predictions/);
  await page.screenshot({ path: output + '/screenshots/ux01r2-maia-synthesis-desktop.png', fullPage: true });
  pass('J09', 'One explicit gesture hands the whole returned journey to MAIA with imaginal provenance and no retyping.');

  await page.getByLabel('Continue with MAIA').fill('Yes. The spaciousness feels important.');
  await page.getByRole('button', { name: 'Send to MAIA', exact: true }).click();
  await page.getByRole('status', { name: '' }).filter({ hasText: 'MAIA is reflecting…' }).waitFor();
  await page.getByText(/Synthetic MAIA continuation:/).waitFor();
  const latestMaia = page.locator('.maia-turn.maia').last();
  const latestBox = await latestMaia.boundingBox();
  assert.ok(latestBox && latestBox.y < 1000 && latestBox.y + Math.min(latestBox.height, 120) > 0);
  assert.equal(new URL(page.url()).pathname, '/becoming');
  assert.equal(maiaRequests.length, 2);
  assert.equal(maiaRequests[1].message, 'Yes. The spaciousness feels important.');
  assert.ok(Array.isArray(maiaRequests[1].conversationHistory));
  assert.match(maiaRequests[1].conversationHistory[0].content, /Soullab Becoming/);
  pass('J10', 'The synthesis becomes a continuing MAIA conversation; waiting is labeled reflecting and the arriving response is brought into view.');

  await page.getByRole('button', { name: 'Carry something into present life', exact: true }).click();
  await page.getByRole('button', { name: 'Nothing yet', exact: true }).click();
  await page.getByText('Nothing needs to become an action. The encounter can remain open.', { exact: true }).waitFor();
  pass('J11', 'Carry is optional and Nothing yet is a complete choice.');
  await page.getByRole('button', { name: 'Keep this journey', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'revision 1' }).waitFor();
  await page.getByRole('button', { name: 'Your journeys', exact: true }).click();
  await page.getByRole('heading', { name: 'Your journeys', exact: true }).waitFor();
  await page.getByRole('button').filter({ has: page.getByRole('heading', { name: 'Spacious contribution', exact: true }) }).waitFor();
  await page.getByRole('button', { name: 'Across time', exact: true }).waitFor();
  pass('J12', 'Across Time appears only after a journey has actually been kept.');

  await page.getByRole('button', { name: 'Across time', exact: true }).click();
  await page.getByRole('heading', { name: 'What does this journey touch?' }).waitFor();
  assert.equal(await page.getByText('Has been', { exact: true }).count(), 0);
  assert.equal(await page.getByText('Is being', { exact: true }).count(), 0);
  assert.equal(await page.getByText('Is becoming', { exact: true }).count(), 0);
  await page.getByRole('heading', { name: 'What brought you here' }).waitFor();
  await page.getByRole('heading', { name: 'What is true now' }).waitFor();
  await page.getByRole('heading', { name: 'What is opening' }).waitFor();
  pass('J13', 'Across Time uses human language while the temporal architecture remains underneath.');
  const sourceChoice = page.locator('.source-check').filter({ hasText: 'Spacious contribution' });
  await sourceChoice.locator('input').check();
  await page.getByLabel('What feels true in your life today?')
    .fill('Synthetic present: a new invitation is here.');
  await page.getByLabel('A connection I notice')
    .fill('Generosity and automatic availability may not be the same thing.');
  await page.getByLabel('And what does not fit?')
    .fill('Some invitations feel joyful rather than burdensome.');
  await page.getByRole('button', { name: 'Ask MAIA what it notices', exact: true }).click();
  await page.getByRole('heading', { name: 'What might connect?' }).waitFor();
  assert.equal(maiaRequests.length,3);
  assert.match(maiaRequests[2].message,/has_been · present_self_report/);
  assert.match(maiaRequests[2].message,/is_being · present_self_report/);
  assert.match(maiaRequests[2].message,/is_becoming · imagined_possibility/);
  assert.match(maiaRequests[2].message,/Do not infer a thread, memory, relationship profile/);
  assert.match(maiaRequests[2].message,/one relational gestalt without collapsing the facets/);
  assert.match(maiaRequests[2].message,/center is a vantage of integration, not a new source of facts/);
  assert.match(maiaRequests[2].message,/preserve every item’s source and epistemic distinction/);
  await page.getByLabel('What fits—or does not?').fill('That does not fit anymore. The invitations I accept now are chosen and joyful.');
  await page.getByRole('button', { name: 'This doesn’t fit', exact: true }).click();
  assert.equal(maiaRequests.length,4);
  assert.match(maiaRequests[3].message,/member correction outranks the prior hypothesis/i);
  assert.match(maiaRequests[3].message,/Release any unsupported claim/);
  await page.screenshot({ path: output + '/screenshots/ux02r4-across-time-maia-desktop.png', fullPage: true });
  pass('J13M', 'Across Time can hand only selected temporal material to MAIA, hold it as a differentiated gestalt at center, and release a hypothesis when the member corrects it.');

  await page.getByRole('button', { name: 'Your journeys', exact: true }).click();
  await page.getByRole('dialog', { name: 'Leave these Across Time notes?' }).waitFor();
  await page.getByRole('button', { name: 'Stay with these notes', exact: true }).click();
  assert.equal(
    await page.getByLabel('A connection I notice').inputValue(),
    'Generosity and automatic availability may not be the same thing.',
  );
  pass('J14', 'Across Time notes are not silently discarded on navigation.');
  await page.getByRole('button', { name: 'Take this into a new Becoming journey →', exact: true }).click();
  await page.getByRole('heading', { name: 'Begin with what brought you here.' }).waitFor();
  await page.getByRole('heading', { name: 'What you chose to bring' }).waitFor();
  await page.getByText('Spacious contribution', { exact: true }).waitFor();
  await page.getByText('earlier imagined possibility', { exact: false }).waitFor();
  pass('J15', 'Across Time opens a new journey with exact-source identity and explicit epistemic framing.');

  await page.getByRole('button', { name: 'Pause and leave', exact: true }).click();
  await page.getByRole('dialog', { name: 'Leave this journey?' }).waitFor();
  await page.getByRole('button', { name: 'Leave without keeping', exact: true }).click();
  await page.getByRole('heading', { name: 'Becoming', exact: true }).waitFor();
  pass('J16', 'An unfinished journey may be explicitly discarded without inventing Return.');
  await page.getByRole('button', { name: 'Your journeys', exact: true }).click();
  const card = page.getByRole('button').filter({ has: page.getByRole('heading', { name: 'Spacious contribution', exact: true }) });
  await card.click();
  await page.getByText('I stopped treating urgency as proof of care.', { exact: true }).waitFor();
  await page.getByText('IMAGINED POSSIBILITY · NOT A PREDICTION', { exact: true }).waitFor();
  await page.getByText('ELEMENTAL IMMERSION · MEMBER-ENTERED', { exact: true }).waitFor();
  await page.getByText('Cool floorboards, morning light, coffee, and room to breathe.', { exact: true }).waitFor();
  await page.getByText('Contribution remains when urgency falls away.', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Talk with MAIA about this journey', exact: true }).waitFor();
  pass('J17', 'The kept journey visibly preserves member-authored elemental immersion, dialogue, imaginal provenance, and a no-repeat MAIA doorway.');

  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.getByRole('button', { name: 'Delete journey and revisions', exact: true }).click();
  await page.getByRole('heading', { name: 'Nothing has been kept here yet.' }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Across time', exact: true }).count(), 0);
  pass('J18', 'Deleting the only kept journey returns Across Time to unavailable.');
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
  pass('J19', 'The Future Self threshold fits a 390px mobile viewport without horizontal overflow.');

  await mp.getByRole('button', { name: /Let something emerge/ }).click();
  await mp.getByLabel('What feels most present right now?').fill('Synthetic mobile journey.');
  await mp.getByRole('button', { name: 'Let some time pass →', exact: true }).click();
  assert.ok(await mp.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  pass('J20', 'The guided journey remains width-safe after entering the experience.');
  const visibleButtons = await mp.getByRole('button').evaluateAll(buttons =>
    buttons.filter(button => button.getBoundingClientRect().height > 0).map(button => ({
      label: button.textContent,
      size: parseFloat(getComputedStyle(button).fontSize),
      height: button.getBoundingClientRect().height,
    })),
  );
  assert.ok(visibleButtons.every(button => button.size >= 16 && button.height >= 44), JSON.stringify(visibleButtons));
  pass('J21', 'Visible mobile actions meet the 16px type and 44px target floors.');
  await mobile.close();

  assert.equal(errors.length, 0, errors.join('\n'));
  assert.ok(requests.every(url => new URL(url).origin === base));
  pass('J22', 'The bounded witness produced no page errors or off-origin browser requests.');

  const healthResponse = await fetch(base + '/health');
  const health = await healthResponse.json();
  assert.equal(health.scope, 'isolated-local-preview');
  assert.equal(health.providerCalls, 'explicit-member-acts-only');
  assert.equal(health.journeyGuide, 'sanctuary-ephemeral-current-journey-only');
  assert.equal(health.postReturnMaia, 'continuity-explicit-only');
  assert.equal(health.maiaHandoff, 'fixed-localhost-canonical-route');
  await writeFile(output + '/ux01r2-health.json', JSON.stringify(health, null, 2));
  pass('J23', 'The preview keeps both MAIA lanes behind explicit member acts and preserves the guide/continuity boundary.');
} catch (error) {
  failure = error;
  console.error('UX01R2_WITNESS_FAILED', error.message);
} finally {
  await browser.close();
  await writeFile(
    output + '/ux01r2-browser-witness.json',
    JSON.stringify({
      scope: 'Fresh synthetic browser contexts; visible journey UI with mocked MAIA responses; no provider call, production write, or direct database audit.',
      recordedAt: new Date().toISOString(),
      results,
      errors,
      requests: [...new Set(requests)],
      failure: failure ? String(failure.message) : null,
    }, null, 2),
  );
}
if (failure) process.exitCode = 1;
