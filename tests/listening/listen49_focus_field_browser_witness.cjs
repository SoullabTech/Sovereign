/**
 * LISTEN-49 Focus Field browser witness.
 *
 * Required:
 *   LISTEN49_BASE — isolated local Next origin
 *   LISTEN49_AUDIO_FILE — fictional Reader WAV
 * Optional:
 *   LISTEN49_EVIDENCE_DIR, LISTEN49_TOKEN_A, LISTEN49_TOKEN_B
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright-core');

const BASE = process.env.LISTEN49_BASE;
const AUDIO_FILE = process.env.LISTEN49_AUDIO_FILE;
const EVIDENCE = process.env.LISTEN49_EVIDENCE_DIR || process.cwd();
if (!BASE || !AUDIO_FILE) throw new Error('LISTEN49_BASE and LISTEN49_AUDIO_FILE are required');
const TOKEN_A = process.env.LISTEN49_TOKEN_A || 'fictional-listen47-A';
const TOKEN_B = process.env.LISTEN49_TOKEN_B || 'fictional-listen47-B';
const MEMBER_B = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const wav = fs.readFileSync(AUDIO_FILE);
const results = [];
const pageErrors = [];
const external = [];
const sessionReceipts = [];

function check(name, pass, detail = '') {
  results.push({ name, pass: Boolean(pass), detail });
  if (!pass) throw new Error(`FAILED ${name}: ${detail}`);
}
function compact(text) { return String(text || '').replace(/\s+/g, ' ').trim(); }
async function focusSnapshot(page) {
  return page.evaluate(() => {
    const surface = document.querySelector('[data-focus-field-session]');
    const dock = document.querySelector('[data-focus-field-dock="true"]');
    const audio = document.querySelector('[data-listen10-state="true"]');
    return {
      status: surface?.getAttribute('data-focus-field-session') || null,
      surfaceText: surface?.textContent?.replace(/\s+/g, ' ').trim() || '',
      dockText: dock?.textContent?.replace(/\s+/g, ' ').trim() || '',
      audioState: audio?.textContent?.replace(/\s+/g, ' ').trim() || null,
      path: location.pathname + location.hash,
    };
  });
}
async function waitFocus(page, status, timeout = 15000) {
  await page.waitForFunction(expected =>
    document.querySelector('[data-focus-field-session]')?.getAttribute('data-focus-field-session') === expected,
    status,
    { timeout },
  );
  return focusSnapshot(page);
}
function clockSeconds(text) {
  const match = String(text).match(/(\d+):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

(async () => {
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: [
        '--no-first-run', '--disable-extensions', '--disable-background-networking',
        '--autoplay-policy=no-user-gesture-required',
      ],
    });
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    await context.addCookies([{ name: 'maia_session', value: TOKEN_A, domain: '127.0.0.1', path: '/' }]);
    await context.addInitScript(({ staleMember }) => {
      localStorage.setItem('memberId', staleMember);
      localStorage.setItem('beta_user', JSON.stringify({ id: staleMember }));
    }, { staleMember: MEMBER_B });
    await context.route('**/audiobook/elemental-alchemy/preface/manifest.json', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'preface', title: 'Preface', audioFile: 'preface.wav', durationMs: 4000,
        segments: [
          { text: 'A fictional passage for Focus Field interruption acceptance.', startMs: 0, endMs: 2000, type: 'paragraph' },
          { text: 'A second fictional passage confirms deliberate return.', startMs: 2000, endMs: 4000, type: 'paragraph' },
        ],
      }),
    }));
    await context.route('**/audiobook/elemental-alchemy/preface/preface.wav', route => route.fulfill({
      status: 200, contentType: 'audio/wav', body: wav,
    }));

    const attach = page => {
      page.on('pageerror', error => pageErrors.push(String(error)));
      page.on('request', request => {
        const url = request.url();
        if (/^https?:/.test(url) && !url.startsWith(BASE)) external.push(url);
      });
      page.on('response', async response => {
        if (!response.url().includes('/api/members/session')) return;
        let body = null;
        try { body = await response.json(); } catch {}
        sessionReceipts.push({ status: response.status(), body });
      });
    };

    const page = await context.newPage();
    attach(page);
    const listen = await page.goto(`${BASE}/listen#focus-field`, {
      waitUntil: 'domcontentloaded', timeout: 60000,
    });
    check('strict-listen-route-admitted', listen?.status() === 200, String(listen?.status()));
    await page.getByRole('heading', { name: 'What kind of attention do you need?' }).waitFor({ timeout: 30000 });
    const startButton = page.getByRole('button', { name: 'Start focus session' });
    await page.waitForFunction(() => {
      const button = [...document.querySelectorAll('button')].find(node => node.textContent?.includes('Start focus session'));
      return button && !button.disabled;
    }, null, { timeout: 15000 });
    check('focus-ui-has-guide-and-browse',
      await page.getByRole('tab', { name: /Guide me/ }).isVisible() &&
      await page.getByRole('tab', { name: /Browse/ }).isVisible());
    check('focus-ui-declares-no-surveillance',
      compact(await page.locator('#focus-field').textContent()).includes('No work inspection · no productivity score'));

    await page.getByRole('button', { name: /Administration/ }).click();
    await page.getByRole('button', { name: /Activate/ }).click();
    await page.getByRole('button', { name: 'High' }).click();
    const suggested = page.locator('button').filter({ hasText: /^SuggestedRhythmic \/ percussive$/ });
    check('guide-me-suggests-rhythmic-for-visible-activate-high-choices',
      await suggested.count() === 1,
      compact(await page.locator('#focus-field').textContent()));
    await suggested.click();
    await page.getByRole('button', { name: '25 minutes' }).click();
    await startButton.click();
    let running = await waitFocus(page, 'running');
    check('explicit-start-begins-focus-without-audio',
      running.audioState === null && running.dockText.includes('Focus Field'),
      JSON.stringify(running));
    check('focus-session-summary-is-visible',
      running.surfaceText.includes('Administration') &&
      running.surfaceText.includes('Activate') &&
      running.surfaceText.includes('Rhythmic / percussive'),
      running.surfaceText);
    const clockBeforeRoute = clockSeconds(running.dockText);

    await Promise.all([
      page.waitForURL(/\/writers-studio/),
      page.getByRole('link', { name: 'Writer’s Studio' }).click(),
    ]);
    await page.waitForFunction(() => document.querySelector('[data-focus-field-dock="true"]'));
    await page.waitForTimeout(1200);
    const roomDock = compact(await page.locator('[data-focus-field-dock="true"]').textContent());
    const clockAtRoom = clockSeconds(roomDock);
    check('focus-clock-persists-across-real-room-client-navigation',
      clockBeforeRoute !== null && clockAtRoom !== null && clockAtRoom < clockBeforeRoute,
      JSON.stringify({ clockBeforeRoute, clockAtRoom, roomDock, url: page.url() }));

    await page.goBack({ waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'What kind of attention do you need?' }).waitFor({ timeout: 30000 });
    running = await waitFocus(page, 'running');
    check('client-return-preserves-one-running-session',
      running.surfaceText.includes('Administration') && running.audioState === null,
      JSON.stringify(running));

    await page.evaluate(() => window.dispatchEvent(new CustomEvent('soullab:audio-focus-request', {
      detail: { source: 'maia-voice' },
    })));
    const maiaPaused = await waitFocus(page, 'paused');
    check('maia-pauses-focus-without-starting-audio',
      maiaPaused.audioState === null && maiaPaused.surfaceText.includes('fresh member action'),
      JSON.stringify(maiaPaused));
    await page.waitForTimeout(500);
    check('focus-does-not-auto-resume-after-maia',
      (await focusSnapshot(page)).status === 'paused');
    await page.getByRole('button', { name: 'Resume by my action' }).click();
    await waitFocus(page, 'running');
    // Let the persistent provider's already-mounted cross-tab observer settle
    // after the deliberately rapid room-return/MAIA sequence.
    await page.waitForTimeout(500);

    const readerPage = await context.newPage();
    attach(readerPage);
    const reader = await readerPage.goto(`${BASE}/maia/community/elemental-alchemy/reader`, {
      waitUntil: 'domcontentloaded', timeout: 60000,
    });
    check('real-reader-route-admitted', reader?.status() === 200, String(reader?.status()));
    await readerPage.getByRole('heading', { name: 'Preface' }).waitFor({ timeout: 30000 });
    await readerPage.waitForFunction(() => document.querySelector('[data-reader-audio="true"]'));
    await readerPage.getByRole('button', { name: 'Play narration' }).click();
    await readerPage.waitForFunction(() => document.querySelector('[data-reader-audio-state="playing"]'));
    await waitFocus(page, 'paused');
    const readerDock = compact(await page.locator('[data-focus-field-dock="true"]').textContent());
    check('reader-narration-in-second-tab-pauses-focus-session', readerDock.includes('paused'), readerDock);
    await readerPage.getByRole('button', { name: 'Pause narration' }).click();
    await readerPage.waitForTimeout(500);
    check('reader-pause-does-not-resume-focus',
      compact(await page.locator('[data-focus-field-dock="true"]').textContent()).includes('paused'));
    await readerPage.close();

    const returnedPaused = await waitFocus(page, 'paused');
    check('closing-reader-tab-leaves-focus-paused', returnedPaused.status === 'paused');
    await page.getByRole('button', { name: 'Resume by my action' }).click();
    await waitFocus(page, 'running');

    const beforeRetune = await focusSnapshot(page);
    await page.getByLabel('Musical world').selectOption('cinematic');
    await page.getByLabel('Stimulation').selectOption('medium');
    await page.waitForTimeout(250);
    const afterRetune = await focusSnapshot(page);
    check('retune-preserves-task-and-running-clock',
      afterRetune.status === 'running' &&
      afterRetune.surfaceText.includes('Administration') &&
      afterRetune.surfaceText.includes('Cinematic') &&
      afterRetune.surfaceText.includes('Medium stimulation') &&
      clockSeconds(afterRetune.surfaceText) <= clockSeconds(beforeRetune.surfaceText),
      JSON.stringify({ beforeRetune, afterRetune }));

    await page.getByRole('button', { name: 'Stop session' }).click();
    const stopped = await waitFocus(page, 'stopped');
    check('explicit-stop-is-terminal-and-hides-persistent-focus-dock',
      stopped.status === 'stopped' && !stopped.dockText,
      JSON.stringify(stopped));
    await page.getByRole('button', { name: 'This style worked well' }).click();
    await page.getByRole('button', { name: 'Helped' }).click();
    check('private-feedback-recorded-without-network',
      compact(await page.locator('#focus-field').textContent()).includes('Private session feedback recorded in memory only'));

    await page.getByRole('button', { name: 'New session' }).click();
    await page.getByRole('tab', { name: /Browse/ }).click();
    await page.locator('#focus-field').getByRole('button', { name: /Classical/ }).click();
    await page.locator('#focus-field').getByRole('button', { name: /^Deep Long/ }).click();
    await page.locator('#focus-field').getByRole('button', { name: 'No timer' }).click();
    await page.getByRole('button', { name: 'Start focus session' }).click();
    await waitFocus(page, 'running');
    await context.addCookies([{ name: 'maia_session', value: TOKEN_B, domain: '127.0.0.1', path: '/' }]);
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await page.waitForFunction(() => !document.querySelector('[data-focus-field-dock="true"]'), null, { timeout: 15000 });
    check('verified-member-switch-clears-private-focus-session',
      !await page.locator('[data-focus-field-session]').count());
    check('session-receipt-moved-to-fictional-member-b',
      sessionReceipts.some(receipt => receipt.status === 200 && receipt.body?.member?.id === MEMBER_B),
      JSON.stringify(sessionReceipts.slice(-6)));

    check('no-page-errors', pageErrors.length === 0, JSON.stringify(pageErrors));
    check('no-external-network', external.length === 0, JSON.stringify([...new Set(external)]));

    const output = {
      format: 'SOULLAB_LISTEN49_FOCUS_FIELD_BROWSER_RESULT_V1',
      status: 'PASS',
      passed: results.length,
      results,
      pageErrors,
      external: [...new Set(external)],
      sessionReceipts,
    };
    fs.mkdirSync(EVIDENCE, { recursive: true });
    fs.writeFileSync(path.join(EVIDENCE, 'LISTEN49_FOCUS_FIELD_BROWSER_RESULT.json'), JSON.stringify(output, null, 2));
    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    const output = {
      format: 'SOULLAB_LISTEN49_FOCUS_FIELD_BROWSER_RESULT_V1',
      status: 'FAIL', passed: results.length, results, pageErrors,
      external: [...new Set(external)], sessionReceipts, error: String(error?.stack || error),
    };
    fs.mkdirSync(EVIDENCE, { recursive: true });
    fs.writeFileSync(path.join(EVIDENCE, 'LISTEN49_FOCUS_FIELD_BROWSER_RESULT.json'), JSON.stringify(output, null, 2));
    console.error(JSON.stringify(output, null, 2));
    process.exitCode = 1;
  } finally {
    await browser?.close();
  }
})();
