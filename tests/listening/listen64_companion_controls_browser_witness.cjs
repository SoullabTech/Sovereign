'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const esbuild = require('esbuild');
const { chromium } = require('playwright-core');

const repo = path.resolve(__dirname, '../..');
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'soullab-listen64-companion-'));
const evidence = process.env.LISTEN64_EVIDENCE_DIR || fixture;
fs.mkdirSync(evidence, { recursive: true });

const sourceFiles = [
  'app/listen/SoundStudioField.tsx',
  'app/listen/listen.module.css',
  'components/listening/PersistentListeningProvider.tsx',
  'components/listening/PersistentListeningDock.tsx',
  'components/listening/persistentListeningDock.module.css',
  'lib/listening/soundStudioExperience.ts',
  'lib/listening/manifests/open-ground-432-v1.json',
  'public/media/sound-studio/open-ground/Open_Ground_Drone01_6min_v1.m4a',
];
const sourceHashes = Object.fromEntries(sourceFiles.map(file => [
  file,
  crypto.createHash('sha256').update(fs.readFileSync(path.join(repo, file))).digest('hex'),
]));

const entry = `
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {PersistentListeningProvider} from ${JSON.stringify(path.join(repo, 'components/listening/PersistentListeningProvider.tsx'))};
import SoundStudioField from ${JSON.stringify(path.join(repo, 'app/listen/SoundStudioField.tsx'))};
function App(){
  const [room,setRoom]=useState('studio');
  return <PersistentListeningProvider reviewMemberKey="11111111-2222-4333-8444-555555555555">
    <div className="fixtureShell">
      <nav className="fixtureNav" aria-label="Fixture room navigation">
        <button onClick={()=>setRoom('studio')}>Sound Studio</button>
        <button onClick={()=>setRoom('writer')}>Writer’s Studio</button>
      </nav>
      {room==='studio' ? <SoundStudioField/> : <main data-test-other-room="writer"><span>SOULLAB / WRITER’S STUDIO</span><h1>A different Soullab room</h1><p>The same authenticated listening provider remains mounted above this route.</p></main>}
    </div>
  </PersistentListeningProvider>;
}
createRoot(document.getElementById('app')).render(<App/>);
`;
fs.writeFileSync(path.join(fixture, 'entry.jsx'), entry);
fs.writeFileSync(path.join(fixture, 'next-link-shim.jsx'), `
import React from 'react';
export default function Link({href,children,...rest}){return <a href={href} {...rest}>{children}</a>}
`);

async function buildFixture() {
  await esbuild.build({
    entryPoints: [path.join(fixture, 'entry.jsx')],
    outdir: fixture,
    entryNames: 'bundle',
    bundle: true,
    format: 'iife',
    platform: 'browser',
    jsx: 'automatic',
    target: 'es2022',
    alias: {
      '@': repo,
      'react': require.resolve('react'),
      'react-dom/client': require.resolve('react-dom/client'),
      'react/jsx-runtime': require.resolve('react/jsx-runtime'),
    },
    loader: { '.css': 'local-css' },
    plugins: [{
      name: 'next-link-shim',
      setup(build) {
        build.onResolve({ filter: /^next\/link$/ }, () => ({ path: path.join(fixture, 'next-link-shim.jsx') }));
      },
    }],
    logLevel: 'silent',
  });
  const css = fs.readdirSync(fixture).find(file => file.endsWith('.css'));
  fs.writeFileSync(path.join(fixture, 'index.html'), `<!doctype html><html lang="en"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
    <title>Sound Studio responsive witness</title>${css ? `<link rel="stylesheet" href="/${css}">` : ''}
    <style>
      html,body,#app{min-height:100%;margin:0;background:#071015;color:#efe9dc}
      body{font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;overflow-x:hidden;padding-bottom:110px}
      .fixtureShell{min-height:100vh}.fixtureNav{position:sticky;top:0;z-index:80;display:flex;gap:8px;padding:9px 14px;background:rgba(5,14,18,.94);border-bottom:1px solid rgba(235,210,169,.2)}
      .fixtureNav button{min-height:42px;border:1px solid rgba(229,201,156,.35);border-radius:999px;background:#13242a;color:#eed9b8;padding:8px 14px}
      [data-test-other-room]{min-height:78vh;padding:9vw;background:radial-gradient(circle at 80% 20%,#32494d,transparent 30%),#0b171c}
      [data-test-other-room] h1{font:400 clamp(40px,7vw,88px) Georgia,serif;max-width:700px}
    </style></head><body><div id="app"></div><script src="/bundle.js"></script></body></html>`);
}

function streamFile(req, res, target, type) {
  const size = fs.statSync(target).size;
  const range = req.headers.range;
  if (range) {
    const match = /^bytes=(\d+)-(\d*)$/.exec(range);
    if (!match) { res.writeHead(416, { 'content-range': `bytes */${size}` }); res.end(); return; }
    const start = Number(match[1]);
    const end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
    if (start > end || start >= size) { res.writeHead(416, { 'content-range': `bytes */${size}` }); res.end(); return; }
    res.writeHead(206, {
      'content-type': type, 'content-length': end - start + 1,
      'content-range': `bytes ${start}-${end}/${size}`, 'accept-ranges': 'bytes',
      'cache-control': 'no-store',
    });
    fs.createReadStream(target, { start, end }).pipe(res);
    return;
  }
  res.writeHead(200, {
    'content-type': type, 'content-length': size, 'accept-ranges': 'bytes',
    'cache-control': 'no-store',
  });
  fs.createReadStream(target).pipe(res);
}

function serverFor(root) {
  return http.createServer((req, res) => {
    const requested = decodeURIComponent((req.url || '/').split('?')[0]);
    if (requested === '/media/sound-studio/open-ground/Open_Ground_Drone01_6min_v1.m4a') {
      const media = path.join(repo, 'public', requested.replace(/^\//, ''));
      streamFile(req, res, media, 'audio/mp4');
      return;
    }
    const target = path.join(root, requested === '/' ? 'index.html' : requested.replace(/^\//, ''));
    if (!target.startsWith(root) || !fs.existsSync(target) || fs.statSync(target).isDirectory()) {
      res.writeHead(404); res.end('not found'); return;
    }
    const ext = path.extname(target);
    const type = ext === '.html' ? 'text/html; charset=utf-8'
      : ext === '.js' ? 'text/javascript; charset=utf-8'
        : ext === '.css' ? 'text/css; charset=utf-8' : 'application/octet-stream';
    streamFile(req, res, target, type);
  });
}

const profiles = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'ipad', width: 1024, height: 1366 },
  { name: 'iphone', width: 390, height: 844, isMobile: true, hasTouch: true },
];
const results = [];
const check = (profile, name, pass, detail = '') => {
  const record = { profile, name, pass: Boolean(pass), detail };
  results.push(record);
  if (!pass) throw new Error(`${profile}: ${name}: ${detail}`);
};

(async () => {
  let server;
  let browser;
  const external = [];
  const pageErrors = [];
  try {
    await buildFixture();
    server = serverFor(fixture);
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    const base = `http://127.0.0.1:${address.port}`;
    browser = await chromium.launch({
      headless: true,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--no-first-run','--disable-extensions','--disable-background-networking','--autoplay-policy=no-user-gesture-required'],
    });

    for (const profile of profiles) {
      const context = await browser.newContext({
        viewport: { width: profile.width, height: profile.height },
        isMobile: Boolean(profile.isMobile), hasTouch: Boolean(profile.hasTouch),
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      page.on('pageerror', error => pageErrors.push(`${profile.name}: ${error}`));
      page.on('request', request => {
        const url = request.url();
        if (/^https?:/.test(url) && !url.startsWith(base)) external.push(`${profile.name}: ${url}`);
      });
      await page.goto(base, { waitUntil: 'networkidle', timeout: 45_000 });
      await page.locator('[data-sound-studio-field="true"]').waitFor({ timeout: 15_000 });

      const widths = await page.evaluate(() => ({
        viewport: innerWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
      }));
      check(profile.name, 'no-horizontal-overflow-at-entry', widths.document <= widths.viewport + 1 && widths.body <= widths.viewport + 1, JSON.stringify(widths));
      check(profile.name, 'four-entry-doors-visible', await page.locator('[data-sound-studio-door-button]').count() === 4);
      for (const door of ['experience','explore','create','professional']) {
        await page.locator(`[data-sound-studio-door-button="${door}"]`).click();
        check(profile.name, `door-${door}-selected`, await page.locator('[data-sound-studio-field]').getAttribute('data-sound-studio-door') === door);
      }
      await page.locator('[data-sound-studio-door-button="experience"]').click();
      await page.locator('[data-sound-studio-work="open-ground-432-v1"] button').click();
      await page.locator('[data-sound-studio-immersive="open-ground"]').waitFor();
      check(profile.name, 'open-ground-shows-four-passages', await page.locator('[data-sound-studio-immersive="open-ground"] li').count() === 4);

      const begin = page.getByRole('button', { name: 'Play Open Ground' });
      await begin.click();
      await page.waitForFunction(() => document.querySelector('[data-listen10-persistent-dock="true"]')?.style.display === 'flex', null, { timeout: 12_000 });
      check(profile.name, 'existing-persistent-dock-shows-open-ground', (await page.locator('[data-listen10-title="true"]').textContent()) === 'Open Ground');
      check(profile.name, 'one-persistent-dock-only', await page.locator('[data-listen10-persistent-dock="true"]').count() === 1);
      await page.waitForFunction(() => {
        const audio = document.querySelector('[data-listen10-audio="true"]');
        return audio && audio.paused === false && audio.readyState >= 2 && audio.currentTime > 0;
      }, null, { timeout: 15_000 });
      const mediaState = await page.locator('[data-listen10-audio="true"]').evaluate(audio => ({
        src: audio.getAttribute('src'), currentSrc: audio.currentSrc, currentTime: audio.currentTime,
        paused: audio.paused, readyState: audio.readyState, duration: audio.duration,
      }));
      check(profile.name, 'exact-reviewed-media-is-selected',
        mediaState.src === '/media/sound-studio/open-ground/Open_Ground_Drone01_6min_v1.m4a', JSON.stringify(mediaState));
      check(profile.name, 'exact-reviewed-media-is-playing',
        mediaState.paused === false && mediaState.readyState >= 2 && Number.isFinite(mediaState.duration), JSON.stringify(mediaState));
      check(profile.name, 'dock-identifies-exact-review-edition',
        (await page.locator('[data-listen10-persistent-dock="true"]').textContent()).includes('exact private-review media'));
      const mixToggle = page.locator('[data-listen-companion-toggle="true"]');
      check(profile.name, 'mix-control-is-visible', await mixToggle.isVisible());
      await mixToggle.click();
      const companionPanel = page.locator('[data-listen-companion-panel="true"]');
      check(profile.name, 'companion-panel-opens', await companionPanel.isVisible());
      check(profile.name, 'other-app-boundary-is-visible',
        (await companionPanel.textContent()).includes('Other music stays in its original app'));
      await page.locator('[data-listen-companion-enable="true"]').click();
      await page.waitForFunction(() =>
        document.querySelector('[data-listen10-persistent-dock="true"]')?.getAttribute('data-listen-companion-mode') === 'on');
      await page.waitForFunction(() =>
        Math.abs((document.querySelector('[data-listen10-audio="true"]')?.volume ?? -1) - 0.22) < 0.001);
      check(profile.name, 'companion-mode-selects-soft-independent-volume',
        await page.locator('[data-listen10-audio="true"]').evaluate(audio => Math.abs(audio.volume - 0.22) < 0.001));
      await page.locator('[data-listen-companion-preset="under"]').click();
      await page.waitForFunction(() =>
        Math.abs((document.querySelector('[data-listen10-audio="true"]')?.volume ?? -1) - 0.12) < 0.001);
      check(profile.name, 'under-preset-is-12-percent',
        await page.locator('[data-listen10-audio="true"]').evaluate(audio => Math.abs(audio.volume - 0.12) < 0.001));
      await page.locator('[data-listen-companion-preset="present"]').click();
      await page.waitForFunction(() =>
        Math.abs((document.querySelector('[data-listen10-audio="true"]')?.volume ?? -1) - 0.35) < 0.001);
      await page.locator('[data-listen-companion-mute="true"]').click();
      await page.waitForFunction(() => document.querySelector('[data-listen10-audio="true"]')?.volume === 0);
      const mutedState = await page.locator('[data-listen10-audio="true"]').evaluate(audio => ({ volume: audio.volume, paused: audio.paused }));
      check(profile.name, 'mute-silences-soullab-without-pausing', mutedState.volume === 0 && mutedState.paused === false, JSON.stringify(mutedState));
      await page.locator('[data-listen-companion-mute="true"]').click();
      await page.waitForFunction(() =>
        Math.abs((document.querySelector('[data-listen10-audio="true"]')?.volume ?? -1) - 0.35) < 0.001);
      const restoredState = await page.locator('[data-listen10-audio="true"]').evaluate(audio => ({ volume: audio.volume, paused: audio.paused }));
      check(profile.name, 'restore-returns-prior-volume-and-keeps-playing',
        Math.abs(restoredState.volume - 0.35) < 0.001 && restoredState.paused === false, JSON.stringify(restoredState));
      const loopButton = page.locator('[data-listen-companion-loop="true"]');
      check(profile.name, 'loop-control-is-visible-for-permitted-piece', await loopButton.isVisible());
      await loopButton.click();
      await page.waitForFunction(() => document.querySelector('[data-listen10-audio="true"]')?.loop === true);
      check(profile.name, 'loop-is-explicitly-enabled',
        await page.locator('[data-listen10-audio="true"]').evaluate(audio => audio.loop && !audio.paused));
      await page.locator('[data-listen10-audio="true"]').evaluate(audio => {
        audio.currentTime = Math.max(0, audio.duration - 0.35);
      });
      await page.waitForFunction(() => {
        const audio = document.querySelector('[data-listen10-audio="true"]');
        return audio && audio.loop && !audio.paused && audio.currentTime < 1.5;
      }, null, { timeout: 6_000 });
      check(profile.name, 'exact-piece-repeats-only-after-reaching-the-end',
        await page.locator('[data-listen10-audio="true"]').evaluate(audio => audio.loop && !audio.paused && audio.currentTime < 1.5));
      const companionWidths = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
      check(profile.name, 'expanded-companion-controls-do-not-overflow',
        companionWidths.document <= companionWidths.viewport + 1 && companionWidths.body <= companionWidths.viewport + 1,
        JSON.stringify(companionWidths));
      await page.screenshot({ path: path.join(evidence, `LISTEN64_${profile.name.toUpperCase()}_COMPANION_PANEL_OPEN.png`), fullPage: true });
      await mixToggle.click();
      check(profile.name, 'companion-panel-closes-before-returning-to-the-field',
        await page.locator('[data-listen-companion-panel="true"]').count() === 0);
      const pauseDock = page.getByRole('button', { name: 'Pause persistent music' });
      await pauseDock.click();
      await page.waitForFunction(() => document.querySelector('[data-listen10-audio="true"]')?.paused === true);
      check(profile.name, 'persistent-pause-pauses-exact-media',
        await page.locator('[data-listen10-audio="true"]').evaluate(audio => audio.paused));
      const pausedAt = await page.locator('[data-listen10-audio="true"]').evaluate(audio => audio.currentTime);
      await page.getByRole('button', { name: 'Resume persistent music' }).click();
      await page.waitForFunction(() => document.querySelector('[data-listen10-audio="true"]')?.paused === false);
      await page.waitForTimeout(400);
      check(profile.name, 'persistent-resume-continues-same-exact-media',
        await page.locator('[data-listen10-audio="true"]').evaluate((audio, previous) => !audio.paused && audio.currentTime > previous, pausedAt));

      await page.evaluate(() => window.dispatchEvent(new CustomEvent('soullab:audio-focus-request', {
        detail: { source: 'maia-voice' },
      })));
      await page.waitForFunction(() => document.querySelector('[data-listen10-audio="true"]')?.paused === true);
      const interruptedAt = await page.locator('[data-listen10-audio="true"]').evaluate(audio => audio.currentTime);
      await page.waitForTimeout(700);
      const afterInterruption = await page.locator('[data-listen10-audio="true"]').evaluate(audio => ({
        paused: audio.paused, currentTime: audio.currentTime,
      }));
      check(profile.name, 'maia-interruption-pauses-exact-media', afterInterruption.paused, JSON.stringify(afterInterruption));
      check(profile.name, 'maia-interruption-does-not-auto-resume',
        Math.abs(afterInterruption.currentTime - interruptedAt) < 0.08, `${interruptedAt} -> ${afterInterruption.currentTime}`);
      await page.getByRole('button', { name: 'Resume persistent music' }).click();
      await page.waitForFunction(previous => {
        const audio = document.querySelector('[data-listen10-audio="true"]');
        return audio && audio.paused === false && audio.currentTime > previous;
      }, interruptedAt, { timeout: 8_000 });
      check(profile.name, 'member-deliberately-resumes-after-maia',
        await page.locator('[data-listen10-audio="true"]').evaluate(audio => !audio.paused));

      const stop = page.getByRole('button', { name: 'Stop and clear persistent music' });
      check(profile.name, 'stop-is-visible', await stop.isVisible());
      const stopBox = await stop.boundingBox();
      check(profile.name, 'stop-is-in-viewport', Boolean(stopBox && stopBox.x >= 0 && stopBox.x + stopBox.width <= profile.width + 1 && stopBox.y >= 0 && stopBox.y + stopBox.height <= profile.height + 1), JSON.stringify(stopBox));
      await page.waitForTimeout(1_200);
      const beforeRoute = await page.locator('[data-listen10-persistent-dock="true"]').textContent();
      check(profile.name, 'arrival-passage-is-visible', beforeRoute.includes('Arrival'), beforeRoute);

      await page.getByRole('button', { name: 'Writer’s Studio' }).click();
      await page.locator('[data-test-other-room="writer"]').waitFor();
      check(profile.name, 'player-persists-in-another-soullab-room', await page.locator('[data-listen10-title="true"]').textContent() === 'Open Ground');
      check(profile.name, 'explicit-loop-setting-persists-across-room-navigation',
        await page.locator('[data-listen10-audio="true"]').evaluate(audio => audio.loop === true));
      await page.waitForFunction(previous => {
        const current = document.querySelector('[data-listen10-persistent-dock="true"]')?.textContent || '';
        return current !== previous;
      }, beforeRoute, { timeout: 3_500 });
      const afterRoute = await page.locator('[data-listen10-persistent-dock="true"]').textContent();
      check(profile.name, 'experience-clock-continues-across-room', afterRoute !== beforeRoute, `${beforeRoute} -> ${afterRoute}`);

      await page.getByRole('button', { name: 'Sound Studio' }).click();
      await page.locator('[data-sound-studio-field="true"]').waitFor();
      await page.locator('[data-sound-studio-work="open-ground-432-v1"] button').click();
      check(profile.name, 'return-rejoins-same-open-ground-session', await page.getByRole('button', { name: 'Pause Open Ground' }).isVisible());
      const immersiveWidths = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
      check(profile.name, 'no-horizontal-overflow-in-immersive-mode', immersiveWidths.document <= immersiveWidths.viewport + 1, JSON.stringify(immersiveWidths));

      await page.screenshot({ path: path.join(evidence, `LISTEN64_${profile.name.toUpperCase()}_COMPANION_CONTROLS.png`), fullPage: true });
      await stop.click();
      await page.waitForFunction(() => document.querySelector('[data-listen10-persistent-dock="true"]')?.style.display === 'none');
      check(profile.name, 'explicit-stop-clears-player', await page.locator('[data-listen10-persistent-dock="true"]').getAttribute('style').then(style => style.includes('none')));
      check(profile.name, 'explicit-stop-clears-loop-setting',
        await page.locator('[data-listen10-audio="true"]').evaluate(audio => audio.loop === false && audio.getAttribute('src') === null));
      await context.close();
    }

    check('all', 'zero-external-network', external.length === 0, JSON.stringify(external));
    check('all', 'zero-page-errors', pageErrors.length === 0, JSON.stringify(pageErrors));
    const output = {
      format: 'SOULLAB_LISTEN64_COMPANION_CONTROLS_BROWSER_V1',
      status: 'PASS',
      passed: results.length,
      profiles,
      sourceHashes,
      external,
      pageErrors,
      results,
    };
    fs.writeFileSync(path.join(evidence, 'LISTEN64_COMPANION_CONTROLS_BROWSER_RESULT.json'), JSON.stringify(output, null, 2));
    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    const output = {
      format: 'SOULLAB_LISTEN64_COMPANION_CONTROLS_BROWSER_V1',
      status: 'FAIL',
      passed: results.filter(result => result.pass).length,
      profiles,
      sourceHashes,
      external,
      pageErrors,
      error: String(error?.stack || error),
      results,
    };
    fs.writeFileSync(path.join(evidence, 'LISTEN64_COMPANION_CONTROLS_BROWSER_RESULT.json'), JSON.stringify(output, null, 2));
    console.error(JSON.stringify(output, null, 2));
    process.exitCode = 1;
  } finally {
    await browser?.close();
    await new Promise(resolve => server ? server.close(resolve) : resolve());
  }
})();
