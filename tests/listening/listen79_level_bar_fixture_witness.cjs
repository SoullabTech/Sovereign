/** LISTEN-79 · isolated fixture witness for the level control in components/listening/PersistentListeningDock.tsx.
 * Compiles the real dock (real persistentListeningDock.module.css) with esbuild, renders it with fictional
 * snapshots for each source kind and walks it in local Chrome at desktop and phone width.
 * No Next, no session, no database, no audio, no member data. Writes the contract screenshots.
 *   node tests/listening/listen79_level_bar_fixture_witness.cjs
 * Env: CHROME_BIN (default: macOS Google Chrome).
 */
'use strict';
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), http = require('node:http');
const esbuild = require('esbuild');
const { chromium } = require('playwright-core');

const repo = path.resolve(__dirname, '../..');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'soullab-level-fixture-'));
const shots = path.join(repo, 'docs/design/contracts/screenshots');
const linkShim = path.join(dir, 'link-shim.tsx');
fs.writeFileSync(linkShim, "import React from 'react'; export default function Link({ href, children, ...rest }: any) { return <a href={href} {...rest}>{children}</a>; }");
fs.writeFileSync(path.join(dir, 'entry.jsx'), `
import React, { useState } from 'react'; import { createRoot } from 'react-dom/client';
import Dock from ${JSON.stringify(path.join(repo, 'components/listening/PersistentListeningDock.tsx'))};
const SOURCES = {
  recorded: { kind: 'review-media', playback: 'playing', mood: null, title: 'Night Ground 01 — Extended Night', subtitle: 'Recorded work',
    experienceId: 'night-ground-01', durationMs: 3600000, elapsedMs: 620000, passage: 'Dwelling', fileFormat: 'AAC', continuation: 'until-stop', continuationCycle: 0, message: '' },
  generated: { kind: 'sketch', playback: 'playing', mood: 'focus', title: 'Your soundscape', subtitle: 'Focus Field · generated',
    experienceId: null, durationMs: null, elapsedMs: null, passage: null, fileFormat: null, continuation: null, continuationCycle: 0, message: '' },
};
function App() {
  const q = new URLSearchParams(location.search);
  const [volume, setVolume] = useState(45);
  const [log, setLog] = useState([]);
  return <>
    <main style={{padding:'32px 20px 220px',maxWidth:900,margin:'0 auto'}}>
      <p style={{letterSpacing:'.12em',textTransform:'uppercase',fontSize:11,color:'#9eb9bb'}}>Sound Studio · isolated fixture</p>
      <h1 style={{fontWeight:400,color:'#f5dfbb'}}>What brings you to sound today?</h1>
      <output id="level-log" hidden>{log.join(',')}</output>
    </main>
    <Dock snapshot={SOURCES[q.get('source') || 'recorded']} volume={volume} looping={false} loopAvailable={false} displayed
      focusSession={null} focusRemainingLabel="" volumeAdjustable={q.get('fixed') !== '1'}
      onPauseMusic={() => {}} onResumeMusic={() => {}} onStopMusic={() => {}} onLooping={() => {}}
      onVolume={(v, transient) => { setVolume(v); setLog(l => [...l, transient ? 't' + v : String(v)]); }}
      onPauseFocus={() => {}} onResumeFocus={() => {}} onStopFocus={() => {}} />
  </>;
}
createRoot(document.getElementById('app')).render(<App/>);`);

(async () => {
  await esbuild.build({
    entryPoints: [path.join(dir, 'entry.jsx')], outdir: dir, bundle: true, format: 'iife', platform: 'browser',
    jsx: 'automatic', target: 'es2022', loader: { '.module.css': 'local-css' },
    alias: { 'next/link': linkShim, '@': repo }, logLevel: 'error',
    nodePaths: [path.join(repo, 'node_modules')], define: { 'process.env.NODE_ENV': '"production"' },
  });
  fs.writeFileSync(path.join(dir, 'index.html'),
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Sound Studio level · isolated fixture</title><link rel="stylesheet" href="/entry.css">' +
    '<style>body{margin:0;min-height:100vh;background:radial-gradient(circle at 30% 10%,#173038,#0b1418 60%);color:#f1efe7;font:15px Georgia,serif}</style>' +
    '</head><body><div id="app"></div><script src="/entry.js"></script></body></html>');
  const server = http.createServer((req, res) => {
    const f = path.join(dir, req.url === '/' || req.url.startsWith('/?') ? 'index.html' : req.url.split('?')[0].replace(/^\//, ''));
    if (!f.startsWith(dir) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'text/html' });
    fs.createReadStream(f).pipe(res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const checks = [];
  const check = (label, ok) => checks.push([label, Boolean(ok)]);
  try {
    for (const [name, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
      for (const source of ['recorded', 'generated']) {
        const page = await browser.newPage({ viewport });
        const errors = []; page.on('pageerror', e => errors.push(String(e)));
        await page.goto(`${base}?source=${source}`);
        const slider = page.getByLabel('Persistent music volume');
        check(`${name}/${source}: level slider visible in the bar without opening More`, await slider.isVisible());
        await slider.fill('70');
        check(`${name}/${source}: moving it sets the level (member change, not transient)`, (await page.locator('#level-log').textContent()) === '70');
        check(`${name}/${source}: level reads back as a percentage`, (await page.locator('[data-listen-bar-level] output').textContent()) === '70%');
        const stop = await page.getByRole('button', { name: 'Stop and clear persistent music' }).boundingBox();
        const pause = await page.getByRole('button', { name: 'Pause persistent music' }).boundingBox();
        const more = await page.locator('[data-listen-companion-toggle]').boundingBox();
        const level = await page.locator('[data-listen-bar-level]').boundingBox();
        check(`${name}/${source}: Pause / Stop keep ≥44px targets`, stop.height >= 44 && pause.height >= 44);
        const overlaps = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
        check(`${name}/${source}: the level does not overlap Pause, Stop or More`, ![stop, pause, more].some(b => overlaps(level, b)));
        if (name === 'mobile') check(`mobile/${source}: the level takes its own row below the buttons`, level.y >= stop.y + stop.height - 1 && level.width > 300);
        check(`${name}/${source}: no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await page.locator('[data-listen-companion-toggle]').click();
        check(`${name}/${source}: with More open there is one level slider (the panel's), not two`,
          (await page.getByLabel('Persistent music volume').count()) === 0 && await page.getByLabel('Soullab field volume').isVisible());
        await page.locator('[data-listen-companion-toggle]').click();
        await slider.fill('45');
        check(`${name}/${source}: no page errors`, errors.length === 0);
        if (source === 'recorded') await page.screenshot({ path: path.join(shots, `sound-studio-field-level-${name}.png`) });
        await page.close();
      }
    }
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`${base}?source=recorded&fixed=1`);
    check('mobile/device-fixed: no slider where the device fixes the level', (await page.getByLabel('Persistent music volume').count()) === 0);
    check('mobile/device-fixed: the bar says how to set it', await page.getByText('Level: phone volume buttons').isVisible());
    await page.screenshot({ path: path.join(shots, 'sound-studio-field-level-mobile-device.png') });
    await page.close();
  } finally { await browser.close(); server.close(); }
  for (const [label, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
  console.log(`${checks.filter(([, ok]) => ok).length}/${checks.length} PASS`);
  if (checks.some(([, ok]) => !ok)) process.exit(1);
})().catch(e => { console.error(e); process.exit(1); });
