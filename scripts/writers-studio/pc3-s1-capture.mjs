#!/usr/bin/env node
/**
 * PC3-S1 capture instrument — actual browser renders + same-viewport side-by-sides.
 *
 *   node scripts/writers-studio/pc3-s1-capture.mjs [baseUrl]
 *
 * Writes to docs/design/contracts/screenshots/full-redesign-pc3-s1/.
 * The LEFT image of every side-by-side is the founder ORIGINAL, read from the
 * corpus custody commit with `git show` — never a previous candidate render.
 * Only the 100vh product frame is captured; the founder-review strip sits below it.
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const base = (process.argv.find((a) => /^https?:/.test(a)) ?? 'http://localhost:3100').replace(/\/$/, '');
const ROUTE = '/dev/writers-studio-full-redesign-review';
const OUT = 'docs/design/contracts/screenshots/full-redesign-pc3-s1';
const CORPUS = 'c0f4bca2952a6b6afa2d74e204117b6abdf1915a';
const ORIG = 'docs/design/writers-studio/founder-reference-corpus/original-27/';
const ORIGINALS = {
  'develop-themes': ['Soullab Themes Writing Workspace.png', 'c3f708824e35d998570241847c4896b94438ad71f8c6cddd3082cb86b417cf08'],
  'develop-manuscript': ['Soullab Manuscript Analysis Dashboard.png', '9986821d23396f4a48058926a556697685530b56f215d841476d70d86a29543e'],
  'review-chapter': ['Soullab Writer’s Studio Review Dashboard(3).png', 'b46562a7268cd499316c49c84bbbeeb13550d5de2aa14e00296eaab2bd8ecc82'],
};
const SHOTS = [
  ['develop-themes', 1536, 1024], ['develop-themes', 1440, 900], ['develop-themes', 1280, 800],
  ['develop-themes', 1100, 800], ['develop-themes', 1024, 768], ['develop-themes', 390, 844, 'mobile'],
  ['develop-manuscript', 1536, 1024], ['review-chapter', 1536, 1024],
  ['develop-themes', 1536, 1024, 'night'],
];

function original(state) {
  const [file, sha] = ORIGINALS[state];
  let buf;
  try {
    buf = execFileSync('git', ['show', `${CORPUS}:${ORIG}${file}`], { maxBuffer: 64 * 1024 * 1024 });
  } catch {
    throw new Error(`Founder original not available locally. Run: git fetch origin ${CORPUS}`);
  }
  const got = execFileSync('sha256sum', { input: buf }).toString().slice(0, 64);
  if (got !== sha) throw new Error(`Custody mismatch for ${file}: ${got} ≠ ${sha}`);
  return buf;
}

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const written = [];

for (const [state, w, h, kind] of SHOTS) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const q = kind === 'night' ? `state=${state}&appearance=night` : `state=${state}`;
  await page.goto(`${base}${ROUTE}?${q}`, { waitUntil: 'networkidle', timeout: 180000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const name = `${state}${kind === 'night' ? '-night' : ''}-${w}x${h}.png`;
  const file = path.join(OUT, name);
  if (kind === 'mobile') {
    // Full product frame at phone width (proves recomposition without content loss); strip excluded.
    const frame = await page.$('[data-capture-frame]');
    await frame.screenshot({ path: file });
  } else {
    await page.screenshot({ path: file });
  }
  written.push(file);
  await page.close();
}

for (const state of Object.keys(ORIGINALS)) {
  const left = `data:image/png;base64,${original(state).toString('base64')}`;
  const right = `data:image/png;base64,${fs.readFileSync(path.join(OUT, `${state}-1536x1024.png`)).toString('base64')}`;
  const [file, sha] = ORIGINALS[state];
  const page = await browser.newPage({ viewport: { width: 3144, height: 1092 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>
    body{margin:0;background:#1C1E24;color:#E8EAF0;font:18px/1.2 -apple-system,Segoe UI,Helvetica,Arial,sans-serif}
    .row{display:flex;gap:24px;padding:0 24px}.c{width:1536px}.l{height:44px;display:flex;align-items:center}
    img{display:block;width:1536px;height:1024px}</style>
    <div class="row"><div class="c"><div class="l">FOUNDER ORIGINAL · ${file} · ${sha.slice(0, 12)} · corpus ${CORPUS.slice(0, 8)}</div><img src="${left}"></div>
    <div class="c"><div class="l">PC3-S1 CANDIDATE · browser render · ${ROUTE}?state=${state} · 1536×1024</div><img src="${right}"></div></div>`);
  const out = path.join(OUT, `side-by-side-${state}.jpg`);
  await page.screenshot({ path: out, type: 'jpeg', quality: 86 });
  written.push(out);
  await page.close();
}
await browser.close();
for (const f of written) console.log(`wrote ${f}`);
