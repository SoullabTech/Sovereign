/**
 * LISTEN-47 reproducible browser witness.
 *
 * Required inputs point only at a disposable fictional Next/PostgreSQL fixture:
 *   LISTEN47_BASE
 *   LISTEN47_DATABASE_URL
 *   LISTEN47_AUDIO_FILE
 * Optional: LISTEN47_EVIDENCE_DIR and fictional token/member overrides.
 *
 * The witness never creates users, calls external networks, or touches production.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright-core');
const { Pool } = require('pg');

const E = process.env.LISTEN47_EVIDENCE_DIR || process.cwd();
const BASE = process.env.LISTEN47_BASE;
const DATABASE_URL = process.env.LISTEN47_DATABASE_URL;
const AUDIO_FILE = process.env.LISTEN47_AUDIO_FILE;
if (!BASE || !DATABASE_URL || !AUDIO_FILE) {
  throw new Error('LISTEN47_BASE, LISTEN47_DATABASE_URL and LISTEN47_AUDIO_FILE are required');
}
const TOKEN_A = process.env.LISTEN47_TOKEN_A || 'fictional-listen47-A';
const TOKEN_B = process.env.LISTEN47_TOKEN_B || 'fictional-listen47-B';
const MEMBER_A = process.env.LISTEN47_MEMBER_A || '11111111-2222-4333-8444-555555555555';
const MEMBER_B = process.env.LISTEN47_MEMBER_B || 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const WAV = fs.readFileSync(AUDIO_FILE);
const pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
const results = [], pageErrors = [], external = [], readerRequests = [], sessionReceipts = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass: Boolean(pass), detail });
  if (!pass) throw new Error(`FAILED ${name}: ${detail}`);
};
async function musicState(page, id) {
  return page.evaluate(id => {
    const target = (window.__listen47Contexts || []).find(context => context.__listen47ID === id);
    const dock = document.querySelector('[data-listen10-persistent-dock="true"]');
    return { state: target?.state || null, text: dock?.textContent?.replace(/\s+/g, ' ').trim() || '' };
  }, id);
}
async function waitForMusicState(page, id, expected, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  let last = null;
  while (Date.now() < deadline) {
    last = await musicState(page, id);
    if (last.state === expected) return last;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Music state did not become ${expected}: ${JSON.stringify(last)}`);
}
async function startMusic(page) {
  await page.getByRole('button', { name: /Listen to sound sketch/ }).click();
  await page.waitForFunction(() => document.querySelector('[data-listen10-state="true"]')?.textContent?.includes('playing'));
  return page.evaluate(() => {
    const unlock = window.__maiaAudioContext || null;
    const target = (window.__listen47Contexts || []).filter(context => context !== unlock).at(-1);
    return { id: target?.__listen47ID || null, state: target?.state || null };
  });
}
async function readerState(page) {
  return page.evaluate(() => {
    const audio = document.querySelector('[data-reader-audio="true"]');
    const status = document.querySelector('[data-reader-audio-state]');
    return {
      present: Boolean(audio), paused: audio ? audio.paused : null,
      currentTime: audio ? audio.currentTime : null,
      status: status?.getAttribute('data-reader-audio-state') || null,
      browserMember: localStorage.getItem('memberId'),
    };
  });
}

(async () => {
  let browser;
  try {
    await pool.query(`UPDATE auth_sessions SET revoked=false, revoked_at=null, revoked_reason=null,
      expires_at=now()+interval '2 days' WHERE session_token=ANY($1)`, [[TOKEN_A, TOKEN_B]]);
    browser = await chromium.launch({
      headless: true,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--no-first-run', '--disable-extensions', '--disable-background-networking', '--autoplay-policy=no-user-gesture-required'],
    });
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    await context.addCookies([{ name: 'maia_session', value: TOKEN_A, domain: '127.0.0.1', path: '/' }]);
    await context.addInitScript(({ alternateMember }) => {
      localStorage.setItem('memberId', alternateMember);
      localStorage.setItem('beta_user', JSON.stringify({ id: alternateMember }));
      window.__listen47Contexts = [];
      const Base = window.AudioContext || window.webkitAudioContext;
      if (Base) {
        const Wrapped = class extends Base {
          constructor(...args) {
            super(...args);
            this.__listen47ID = `listen47-${window.__listen47Contexts.length + 1}`;
            window.__listen47Contexts.push(this);
          }
        };
        window.AudioContext = Wrapped;
        window.webkitAudioContext = Wrapped;
      }
    }, { alternateMember: MEMBER_B });
    await context.route('**/audiobook/elemental-alchemy/preface/manifest.json', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'preface',
        title: 'Preface',
        audioFile: 'preface.wav',
        durationMs: 4000,
        segments: [
          { text: 'A fictional passage for Reader acceptance.', startMs: 0, endMs: 2000, type: 'paragraph' },
          { text: 'A second fictional passage confirms progress.', startMs: 2000, endMs: 4000, type: 'paragraph' },
        ],
      }),
    }));
    await context.route('**/audiobook/elemental-alchemy/preface/preface.wav', route => route.fulfill({
      status: 200,
      contentType: 'audio/wav',
      body: WAV,
    }));

    const attach = page => {
      page.on('pageerror', error => pageErrors.push(String(error)));
      page.on('request', request => {
        const url = request.url();
        if (/^https?:/.test(url) && !url.startsWith(BASE)) external.push(url);
        if (url.includes('/api/reader/')) {
          const headers = request.headers();
          readerRequests.push({
            url,
            method: request.method(),
            xMemberId: headers['x-member-id'] || null,
          });
        }
      });
      page.on('response', async response => {
        if (!response.url().includes('/api/members/session')) return;
        let body = null;
        try { body = await response.json(); } catch {}
        sessionReceipts.push({ status: response.status(), body });
      });
    };

    // Next dev compiles client chunks only when a real browser loads the route.
    // Warm Reader before any audio starts so HMR cannot reload a playing tab.
    const warmReaderPage = await context.newPage();
    attach(warmReaderPage);
    const warmReader = await warmReaderPage.goto(
      `${BASE}/maia/community/elemental-alchemy/reader`,
      { waitUntil: 'domcontentloaded', timeout: 60000 },
    );
    if (warmReader?.status() !== 200) throw new Error(`Reader prewarm failed: ${warmReader?.status()}`);
    await warmReaderPage.getByRole('heading', { name: 'Preface' }).waitFor({ timeout: 30000 });
    await warmReaderPage.waitForFunction(() => document.querySelector('[data-reader-audio="true"]'));
    await warmReaderPage.waitForFunction(
      member => localStorage.getItem('memberId') === member,
      MEMBER_A,
      { timeout: 15000 },
    );
    await warmReaderPage.close();

    // Delay the next current-session receipt after prewarming to prove the root
    // Listen surface cannot fall into its standalone player during verification.
    let firstSessionReceipt = true;
    await context.route('**/api/members/session', async route => {
      if (firstSessionReceipt) {
        firstSessionReceipt = false;
        await new Promise(resolve => setTimeout(resolve, 650));
      }
      await route.continue();
    });

    const musicPage = await context.newPage();
    attach(musicPage);
    const listenResponse = await musicPage.goto(`${BASE}/listen`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    check('strict-listen-route-admitted', listenResponse?.status() === 200, String(listenResponse?.status()));
    await musicPage.getByRole('heading', { name: 'The Blue Hour' }).waitFor({ timeout: 30000 });
    const rootPlay = musicPage.locator('[data-listening-boundary-status]').first();
    await rootPlay.waitFor({ timeout: 30000 });
    const pending = {
      status: await rootPlay.getAttribute('data-listening-boundary-status'),
      disabled: await rootPlay.isDisabled(),
    };
    check('fast-click-surface-disabled-before-session-receipt',
      pending.status === 'checking' && pending.disabled,
      JSON.stringify(pending));
    await musicPage.waitForFunction(() => {
      const button = document.querySelector('[data-listening-boundary-status]');
      return button?.getAttribute('data-listening-boundary-status') === 'ready' && !button.disabled;
    }, null, { timeout: 15000 });
    check('verified-transport-enables-one-play-surface',
      await rootPlay.getAttribute('data-listening-boundary-status') === 'ready' && !await rootPlay.isDisabled());
    const music = await startMusic(musicPage);
    check('sound-field-starts-one-output', music.state === 'running' && Boolean(music.id), JSON.stringify(music));

    const readerPage = await context.newPage();
    attach(readerPage);
    const readerResponse = await readerPage.goto(`${BASE}/maia/community/elemental-alchemy/reader`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    check('strict-reader-route-admitted', readerResponse?.status() === 200, String(readerResponse?.status()));
    await readerPage.getByRole('heading', { name: 'Preface' }).waitFor({ timeout: 30000 });
    await readerPage.waitForFunction(() => document.querySelector('[data-reader-audio="true"]'));
    await readerPage.waitForFunction(
      member => localStorage.getItem('memberId') === member,
      MEMBER_A,
      { timeout: 15000 },
    );
    const initialReader = await readerState(readerPage);
    check('credential-healing-repairs-stale-browser-identity',
      initialReader.browserMember === MEMBER_A && initialReader.present && initialReader.paused === true,
      JSON.stringify(initialReader));
    check('reader-private-request-sends-no-bare-member-header',
      readerRequests.some(request => request.url.includes('/api/reader/moments')) &&
      readerRequests.filter(request => request.url.includes('/api/reader/moments')).every(request => request.xMemberId === null),
      JSON.stringify(readerRequests));
    check('reader-session-receipt-is-cookie-member-A',
      sessionReceipts.some(receipt => receipt.status === 200 && receipt.body?.member?.id === MEMBER_A),
      JSON.stringify(sessionReceipts));

    await readerPage.getByRole('button', { name: 'Play narration' }).click();
    await readerPage.waitForFunction(() =>
      document.querySelector('[data-reader-audio-state="playing"]') &&
      !document.querySelector('[data-reader-audio="true"]')?.paused,
      null,
      { timeout: 15000 },
    );
    await waitForMusicState(musicPage, music.id, 'suspended');
    check('reader-narration-preempts-sound-field',
      (await musicState(musicPage, music.id)).state === 'suspended',
      JSON.stringify(await musicState(musicPage, music.id)));

    await musicPage.getByRole('button', { name: 'Resume persistent music' }).click();
    await musicPage.waitForTimeout(350);
    check('sound-field-cannot-preempt-active-reader',
      (await musicState(musicPage, music.id)).state === 'suspended' &&
      (await readerState(readerPage)).paused === false,
      JSON.stringify({ music: await musicState(musicPage, music.id), reader: await readerState(readerPage) }));

    await readerPage.getByRole('button', { name: 'Pause narration' }).click();
    await readerPage.waitForFunction(() => document.querySelector('[data-reader-audio="true"]')?.paused === true);
    check('reader-pause-releases-output-without-music-resume',
      (await musicState(musicPage, music.id)).state === 'suspended',
      JSON.stringify(await musicState(musicPage, music.id)));

    await musicPage.getByRole('button', { name: 'Resume persistent music' }).click();
    await waitForMusicState(musicPage, music.id, 'running');
    check('fresh-member-act-resumes-music',
      (await musicState(musicPage, music.id)).state === 'running',
      JSON.stringify(await musicState(musicPage, music.id)));

    await readerPage.getByRole('button', { name: 'Play narration' }).click();
    await readerPage.waitForFunction(() => document.querySelector('[data-reader-audio-state="playing"]'));
    await waitForMusicState(musicPage, music.id, 'suspended');
    await readerPage.evaluate(() => window.dispatchEvent(new CustomEvent('soullab:audio-focus-request', {
      detail: { source: 'maia-voice' },
    })));
    await readerPage.waitForFunction(() => document.querySelector('[data-reader-audio="true"]')?.paused === true);
    check('maia-focus-pauses-reader-without-music-resume',
      (await readerState(readerPage)).paused === true &&
      (await musicState(musicPage, music.id)).state === 'suspended',
      JSON.stringify({ reader: await readerState(readerPage), music: await musicState(musicPage, music.id) }));

    await readerPage.getByRole('button', { name: 'Stop narration' }).click();
    await readerPage.waitForFunction(() => document.querySelector('[data-reader-audio="true"]')?.currentTime === 0);
    check('explicit-reader-stop-resets-position',
      (await readerState(readerPage)).currentTime === 0,
      JSON.stringify(await readerState(readerPage)));

    await readerPage.getByRole('button', { name: 'Play narration' }).click();
    await readerPage.waitForFunction(() => document.querySelector('[data-reader-audio-state="playing"]'));
    await context.addCookies([{ name: 'maia_session', value: TOKEN_B, domain: '127.0.0.1', path: '/' }]);
    await readerPage.evaluate(() => window.dispatchEvent(new Event('focus')));
    await readerPage.waitForFunction(() => {
      const audio = document.querySelector('[data-reader-audio="true"]');
      return !audio || audio.paused === true;
    }, null, { timeout: 15000 });
    check('verified-member-switch-retires-A-reader-output',
      (await readerState(readerPage)).paused !== false,
      JSON.stringify(await readerState(readerPage)));
    const bReceipt = await readerPage.evaluate(async () => {
      const response = await fetch('/api/members/session', { cache: 'no-store', credentials: 'include' });
      return { status: response.status, body: await response.json() };
    });
    await readerPage.getByRole('heading', { name: 'Preface' }).waitFor({ timeout: 15000 });
    await readerPage.waitForFunction(() =>
      document.querySelector('[data-reader-audio="true"]')?.paused === true &&
      document.querySelector('[data-reader-audio-state="idle"]'),
      null,
      { timeout: 15000 },
    );
    check('verified-member-B-remounts-reader-idle',
      bReceipt.status === 200 && bReceipt.body?.member?.id === MEMBER_B &&
      (await readerState(readerPage)).paused === true,
      JSON.stringify({ receipt: bReceipt, reader: await readerState(readerPage) }));

    await context.addCookies([{ name: 'maia_session', value: TOKEN_A, domain: '127.0.0.1', path: '/' }]);
    await readerPage.evaluate(() => window.dispatchEvent(new Event('focus')));
    await readerPage.getByRole('heading', { name: 'Preface' }).waitFor({ timeout: 15000 });
    await readerPage.getByRole('button', { name: 'Play narration' }).click();
    await readerPage.waitForFunction(() => document.querySelector('[data-reader-audio-state="playing"]'));
    await pool.query(
      `UPDATE auth_sessions SET revoked=true, revoked_at=now(), revoked_reason='listen47-acceptance'
       WHERE session_token=$1`,
      [TOKEN_A],
    );
    await readerPage.evaluate(() => window.dispatchEvent(new Event('focus')));
    await readerPage.getByRole('heading', { name: 'Reading session ended' }).waitFor({ timeout: 15000 });
    check('postgres-revocation-stops-reader-and-clears-private-surface',
      (await readerState(readerPage)).present === false,
      JSON.stringify(await readerState(readerPage)));

    const anonymous = await browser.newContext();
    const anonymousPage = await anonymous.newPage();
    const anonymousResponse = await anonymousPage.goto(`${BASE}/maia/community/elemental-alchemy/reader`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    check('strict-reader-route-refuses-anonymous',
      anonymousResponse?.status() === 200 && anonymousPage.url().includes('/signin'),
      JSON.stringify({ status: anonymousResponse?.status(), url: anonymousPage.url() }));
    const unauthApi = await anonymousPage.request.get(`${BASE}/api/reader/moments?chapterId=preface`, {
      maxRedirects: 0,
    });
    check('strict-reader-api-refuses-anonymous', unauthApi.status() === 401, String(unauthApi.status()));
    await anonymous.close();

    check('no-page-errors', pageErrors.length === 0, JSON.stringify(pageErrors));
    check('no-external-network', external.length === 0, JSON.stringify([...new Set(external)]));

    const output = {
      status: 'PASS',
      passed: results.length,
      results,
      pageErrors,
      external: [...new Set(external)],
      readerRequests,
      sessionReceipts,
    };
    fs.writeFileSync(path.join(E, 'LISTEN47_READER_BROWSER_RESULT.json'), JSON.stringify(output, null, 2));
    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    const output = {
      status: 'FAIL',
      passed: results.filter(result => result.pass).length,
      results,
      pageErrors,
      external: [...new Set(external)],
      readerRequests,
      sessionReceipts,
      error: String(error?.stack || error),
    };
    fs.writeFileSync(path.join(E, 'LISTEN47_READER_BROWSER_RESULT.json'), JSON.stringify(output, null, 2));
    console.error(JSON.stringify(output, null, 2));
    process.exitCode = 2;
  } finally {
    await pool.query(
      `UPDATE auth_sessions SET revoked=false, revoked_at=null, revoked_reason=null,
       expires_at=now()+interval '2 days' WHERE session_token=ANY($1)`,
      [[TOKEN_A, TOKEN_B]],
    ).catch(() => {});
    await pool.end().catch(() => {});
    if (browser) await browser.close();
  }
})();
