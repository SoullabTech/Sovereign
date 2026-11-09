/** LISTEN-01 phase 1 · isolated fixture witness for app/listen/SoundStudioReview.tsx.
 * Compiles the real component with esbuild (real listen.module.css, scoped), replaces verifiedSessionFetch with a
 * window.fetch shim answered by fictional data, and walks consent → talk → summary in local Chrome.
 * No Next, no session, no database, no model call, no member data. Writes the contract screenshots.
 *   node tests/listening/sound_studio_review_fixture_witness.cjs
 * Env: CHROME_BIN (default: macOS Google Chrome).
 */
'use strict';
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), http = require('node:http');
const esbuild = require('esbuild');
const { chromium } = require('playwright-core');

const repo = path.resolve(__dirname, '../..');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'soullab-review-fixture-'));
const shots = path.join(repo, 'docs/design/contracts/screenshots');
const shim = path.join(dir, 'fetch-shim.ts');
fs.writeFileSync(shim, 'export async function verifiedSessionFetch(p: string, o: RequestInit = {}) { return fetch(p, o); }');
fs.writeFileSync(path.join(dir, 'entry.jsx'),
  "import React from 'react'; import { createRoot } from 'react-dom/client';" +
  `import { SoundStudioReview } from ${JSON.stringify(path.join(repo, 'app/listen/SoundStudioReview.tsx'))};` +
  "createRoot(document.getElementById('app')).render(<main style={{padding:'24px',maxWidth:'900px',margin:'0 auto'}}>" +
  "<SoundStudioReview workId='open-ground-432-v1' passageLabel='Dwelling' elapsedMs={240000} onClose={() => {}} /></main>);");

const MOCK = `
window.fetch = async (url, init = {}) => {
  const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json' } });
  if (url === '/api/listen/review' && (!init.method || init.method === 'GET')) return json({ reviews: [] });
  if (url === '/api/listen/review/turn') return json({ reply: 'You mentioned the low end felt warm. Where in the piece did that stand out most?', paused: false, suggestFinish: false });
  if (url === '/api/listen/review/summary') return json({ lines: [
    { kind: 'observation', text: 'The low drone in Dwelling is warm and steady.' },
    { kind: 'experience', text: 'I settled quickly; it felt spacious rather than sleepy.' },
    { kind: 'suggestion', text: 'Bring the high shimmer down a little around minute four.' } ] });
  return json({}, 404);
};`;

(async () => {
  await esbuild.build({
    entryPoints: [path.join(dir, 'entry.jsx')], outdir: dir, bundle: true, format: 'iife', platform: 'browser',
    jsx: 'automatic', target: 'es2022', loader: { '.module.css': 'local-css' },
    alias: { '@/lib/http/verifiedSessionFetch': shim, '@': repo }, logLevel: 'error',
    nodePaths: [path.join(repo, 'node_modules')], define: { 'process.env.NODE_ENV': '"production"' },
  });
  fs.writeFileSync(path.join(dir, 'index.html'),
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Sound Studio review · isolated fixture</title><link rel="stylesheet" href="/entry.css">' +
    '<style>:root{--line:rgba(235,220,194,.16);--ink:#f1efe7}body{margin:0;background:#0b1418;color:#f1efe7;font:15px Georgia,serif}</style>' +
    `<script>${MOCK}</script></head><body><div id="app"></div><script src="/entry.js"></script></body></html>`);
  const server = http.createServer((req, res) => {
    const f = path.join(dir, req.url === '/' ? 'index.html' : req.url.split('?')[0].replace(/^\//, ''));
    if (!f.startsWith(dir) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'text/html' });
    fs.createReadStream(f).pipe(res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const checks = [];
  try {
    for (const [name, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
      const page = await browser.newPage({ viewport });
      const errors = []; page.on('pageerror', e => errors.push(String(e)));
      await page.goto(base);
      await page.getByText('NOT MAIA', { exact: false }).first().waitFor();
      checks.push([`${name}: consent discloses Claude`, await page.getByText('sent to Claude (Anthropic)', { exact: false }).count() > 0]);
      await page.getByRole('button', { name: 'Start the review' }).click();
      await page.getByLabel('Your reply').fill('The low end felt warm and steady.');
      await page.getByRole('button', { name: 'Send' }).click();
      await page.getByText('Where in the piece', { exact: false }).waitFor();
      if (name === 'mobile') await page.screenshot({ path: path.join(shots, 'sound-studio-review-talk-mobile.png'), fullPage: true });
      await page.getByRole('button', { name: /show the summary/ }).click();
      await page.getByText('Here is what I heard', { exact: false }).waitFor();
      checks.push([`${name}: three editable lines`, (await page.getByRole('textbox').count()) === 3]);
      checks.push([`${name}: transcript kept only by opt-in (unchecked)`, !(await page.getByRole('checkbox').isChecked())]);
      checks.push([`${name}: no page errors`, errors.length === 0]);
      await page.screenshot({ path: path.join(shots, `sound-studio-review-${name}.png`), fullPage: true });
      await page.close();
    }
  } finally { await browser.close(); server.close(); }
  for (const [label, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
  if (checks.some(([, ok]) => !ok)) process.exit(1);
})().catch(e => { console.error(e); process.exit(1); });
