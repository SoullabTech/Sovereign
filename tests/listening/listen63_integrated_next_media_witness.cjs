'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright-core');

const repo = path.resolve(__dirname, '../..');
const base = process.env.LISTEN63_BASE || 'http://127.0.0.1:43964';
const out = process.env.LISTEN63_EVIDENCE_DIR || path.join(repo, '.listen63-evidence');
fs.mkdirSync(out, { recursive: true });
const expectedMedia = '/media/sound-studio/open-ground/Open_Ground_Drone01_6min_v1.m4a';
const sourceFiles = [
  'app/listen/SoundStudioField.tsx',
  'components/listening/PersistentListeningProvider.tsx',
  'components/listening/PersistentListeningDock.tsx',
  'lib/listening/soundStudioExperience.ts',
  'lib/listening/manifests/open-ground-432-v1.json',
  'public/media/sound-studio/open-ground/Open_Ground_Drone01_6min_v1.m4a',
];
const sourceHashes = Object.fromEntries(sourceFiles.map(file => [file,
  crypto.createHash('sha256').update(fs.readFileSync(path.join(repo, file))).digest('hex'),
]));
const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim();
const result = {
  format: 'SOULLAB_LISTEN63_INTEGRATED_NEXT_CHROME_V1',
  status: 'RUNNING', base, sourceHead: git('rev-parse', 'HEAD'), sourceHashes,
  dirty: git('status', '--porcelain').split('\n').filter(Boolean),
  checks: [], pageErrors: [], externalAttempts: [],
};
function check(name, pass, detail = '') {
  const record = { name, pass: Boolean(pass), detail };
  result.checks.push(record);
  if (!pass) throw new Error(`${name}: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`);
}
async function mediaSnapshot(page) {
  return page.evaluate(() => {
    const audio = document.querySelector('[data-listen10-audio="true"]');
    const dock = document.querySelector('[data-listen10-persistent-dock="true"]');
    return {
      href: location.href,
      marker: window.__listen63Marker || null,
      timeOrigin: performance.timeOrigin,
      src: audio?.getAttribute('src') || '',
      currentSrc: audio?.currentSrc || '',
      currentTime: audio?.currentTime ?? null,
      duration: audio?.duration ?? null,
      paused: audio?.paused ?? null,
      readyState: audio?.readyState ?? null,
      title: document.querySelector('[data-listen10-title="true"]')?.textContent || '',
      state: document.querySelector('[data-listen10-state="true"]')?.textContent || '',
      passage: document.querySelector('[data-listen62-passage]')?.getAttribute('data-listen62-passage') || '',
      dockText: dock?.textContent || '',
      dockDisplay: dock instanceof HTMLElement ? getComputedStyle(dock).display : '',
    };
  });
}

(async () => {
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--no-first-run', '--disable-extensions', '--disable-background-networking',
        '--no-default-browser-check', '--autoplay-policy=no-user-gesture-required'],
    });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const host = new URL(base).hostname;
    await context.addCookies([{ name: 'maia_session', value: 'fictional-listen56-A', domain: host, path: '/' }]);
    await context.addInitScript(() => {
      const id = '11111111-2222-4333-8444-555555555555';
      localStorage.setItem('maia_session_version', '2');
      localStorage.setItem('explorerId', id);
      localStorage.setItem('explorerName', 'Fictional A');
      localStorage.setItem('explorerPreferredName', 'Fictional A');
      localStorage.setItem('beta_user', JSON.stringify({ id, name: 'Fictional A', username: 'fictional-listen-a' }));
      localStorage.setItem('signup_completed', 'true');
      localStorage.setItem('betaOnboardingComplete', 'true');
    });
    const page = await context.newPage();
    page.on('pageerror', error => result.pageErrors.push(error.message));
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (/^https?:$/.test(url.protocol) && url.origin !== base) {
        result.externalAttempts.push(`${url.origin}${url.pathname}`);
        return route.abort('blockedbyclient');
      }
      return route.continue();
    });

    const response = await page.goto(`${base}/listen`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    check('fictional-member-enters-private-listen-route', response?.status() === 200, String(response?.status()));
    await page.locator('[data-sound-studio-field="true"]').waitFor({ timeout: 30_000 });
    check('responsive-sound-studio-is-present', await page.locator('[data-sound-studio-field="true"]').isVisible());
    await page.locator('[data-listen10-audio="true"]').waitFor({ state: 'attached', timeout: 30_000 });
    check('verified-member-persistent-provider-is-mounted',
      await page.locator('[data-listen10-audio="true"]').count() === 1);
    await page.locator('[data-sound-studio-work="open-ground-432-v1"] button').click();
    await page.getByRole('button', { name: 'Play Open Ground' }).click();
    await page.waitForFunction(expected => {
      const audio = document.querySelector('[data-listen10-audio="true"]');
      return audio?.getAttribute('src') === expected && !audio.paused && audio.readyState >= 2 && audio.currentTime > 0;
    }, expectedMedia, { timeout: 25_000 });
    const marker = crypto.randomUUID();
    await page.evaluate(value => { window.__listen63Marker = value; }, marker);
    const initial = await mediaSnapshot(page);
    check('exact-reviewed-media-is-playing', initial.src === expectedMedia && initial.currentTime > 0 && initial.paused === false, initial);
    check('media-duration-and-format-are-truthful', Math.abs(initial.duration - 360) < 0.05 && initial.dockText.includes('AAC 256 kbps listening edition'), initial);
    check('arrival-passage-is-visible', initial.passage === 'Arrival', initial);
    check('one-persistent-player-is-visible', await page.locator('[data-listen10-persistent-dock="true"]').count() === 1 && initial.dockDisplay !== 'none', initial);

    const home = page.locator('a[href="/home"]:visible').first();
    await home.click();
    await page.waitForURL('**/home', { timeout: 45_000 });
    await page.waitForTimeout(900);
    const inHome = await mediaSnapshot(page);
    check('same-browser-document-survives-room-navigation', inHome.marker === marker && inHome.timeOrigin === initial.timeOrigin, inHome);
    check('exact-media-continues-in-another-room', inHome.src === expectedMedia && !inHome.paused && inHome.currentTime > initial.currentTime, { initial, inHome });

    await page.getByRole('link', { name: 'Return to Sound Studio' }).click();
    await page.waitForURL('**/listen#sound-studio', { timeout: 45_000 });
    await page.locator('[data-sound-studio-field="true"]').waitFor({ timeout: 20_000 });
    const returned = await mediaSnapshot(page);
    check('return-rejoins-same-media-session', returned.marker === marker && returned.src === expectedMedia && !returned.paused && returned.currentTime >= inHome.currentTime, returned);

    await page.evaluate(() => window.dispatchEvent(new CustomEvent('soullab:audio-focus-request', {
      detail: { source: 'maia-voice' },
    })));
    await page.waitForFunction(() => document.querySelector('[data-listen10-audio="true"]')?.paused === true);
    const interrupted = await mediaSnapshot(page);
    await page.waitForTimeout(800);
    const remainsPaused = await mediaSnapshot(page);
    check('maia-interruption-pauses-exact-media', interrupted.paused === true, interrupted);
    check('maia-does-not-auto-resume-media', remainsPaused.paused === true && Math.abs(remainsPaused.currentTime - interrupted.currentTime) < 0.08, { interrupted, remainsPaused });

    await page.getByRole('button', { name: 'Resume persistent music' }).click();
    await page.waitForFunction(previous => {
      const audio = document.querySelector('[data-listen10-audio="true"]');
      return audio && !audio.paused && audio.currentTime > previous;
    }, interrupted.currentTime, { timeout: 10_000 });
    check('member-deliberately-resumes-after-maia', (await mediaSnapshot(page)).paused === false);

    await page.getByRole('button', { name: 'Stop and clear persistent music' }).click();
    await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-listen10-persistent-dock="true"]')).display === 'none');
    const stopped = await mediaSnapshot(page);
    check('explicit-stop-clears-exact-media', stopped.src === '' && stopped.title === '' && stopped.dockDisplay === 'none', stopped);
    check('zero-browser-runtime-errors', result.pageErrors.length === 0, result.pageErrors);
    check('zero-external-network-attempts', result.externalAttempts.length === 0, result.externalAttempts);
    await page.screenshot({ path: path.join(out, 'LISTEN63_INTEGRATED_CHROME_OPEN_GROUND.png'), fullPage: true });
    result.status = 'PASS';
    await context.close();
  } catch (error) {
    result.status = 'FAIL';
    result.error = String(error?.stack || error);
    process.exitCode = 1;
  } finally {
    result.finishedAt = new Date().toISOString();
    result.passed = result.checks.filter(item => item.pass).length;
    result.total = result.checks.length;
    fs.writeFileSync(path.join(out, 'LISTEN63_INTEGRATED_CHROME_RESULT.json'), JSON.stringify(result, null, 2) + '\n');
    await browser?.close();
    console.log(JSON.stringify({ status: result.status, passed: result.passed, total: result.total, output: path.join(out, 'LISTEN63_INTEGRATED_CHROME_RESULT.json') }));
  }
})();
