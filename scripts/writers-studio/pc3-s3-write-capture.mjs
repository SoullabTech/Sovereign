#!/usr/bin/env node
/**
 * PC3-S3 Write capture instrument — browser renders + five founder-review boards.
 *
 *   node scripts/writers-studio/pc3-s3-write-capture.mjs [baseUrl]
 *
 * Writes docs/design/contracts/screenshots/full-redesign-pc3-s3/ (packet §11).
 * The authority is read from Git custody (commit:path) and refused on any SHA or
 * byte mismatch. Boards A–D set the region of the custodied PNG beside the
 * browser render of the same state; board E is BEHAVIOURAL evidence — renders
 * taken during one live transition with the measured state tuple printed under
 * each — not a fabricated fifth application screen.
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const base = (process.argv.find((a) => /^https?:/.test(a)) ?? 'http://localhost:3100').replace(/\/$/, '');
const ROUTE = '/dev/writers-studio-full-redesign-review';
const OUT = 'docs/design/contracts/screenshots/full-redesign-pc3-s3';
const CUSTODY = {
  commit: 'fa151298997380fd5e4c76beef22b0afb6dc5662',
  path: 'docs/design/writers-studio/founder-reference-corpus/s3-visual-authority/a_clean_multi_panel_ui_ux_design_composite_with_fi.png',
  sha256: '982b363b158a47d229c3efcb634be0ee09e722a7810df33a500a51de8058b5d9',
  bytes: 1855655,
};

const png = execFileSync('git', ['show', `${CUSTODY.commit}:${CUSTODY.path}`], { maxBuffer: 64 * 1024 * 1024 });
const sha = crypto.createHash('sha256').update(png).digest('hex');
if (sha !== CUSTODY.sha256 || png.length !== CUSTODY.bytes) {
  console.error(`⛔ REFUSED: authority ${sha.slice(0, 16)}… / ${png.length} ≠ custody ${CUSTODY.sha256.slice(0, 16)}… / ${CUSTODY.bytes}`);
  process.exit(2);
}
const authorityUrl = `data:image/png;base64,${png.toString('base64')}`;

const SHOTS = [
  ['write-resting', 1536, 1024, 'light', 'write-resting-1536x1024.png'],
  ['write-resting', 1536, 1024, 'night', 'write-resting-night-1536x1024.png'],
  ['write-full-canvas', 1536, 1024, 'light', 'write-full-canvas-1536x1024.png'],
  ['write-full-canvas', 1536, 1024, 'night', 'write-full-canvas-night-1536x1024.png'],
  ['write-resting', 1280, 800, 'light', 'write-resting-1280x800.png'],
  ['write-resting', 1024, 768, 'light', 'write-resting-1024x768.png'],
  ['write-resting', 390, 844, 'light', 'write-resting-390x844.png'],
  ['write-full-canvas', 1280, 800, 'light', 'write-full-canvas-1280x800.png'],
  ['write-full-canvas', 1024, 768, 'light', 'write-full-canvas-1024x768.png'],
  ['write-full-canvas', 390, 844, 'light', 'write-full-canvas-390x844.png'],
];

/** Regions of the ONE custodied PNG (1536×1024 composite): the five labelled authorities. */
const REGION = {
  a: [0, 0, 768, 410],
  b: [768, 0, 768, 410],
  c: [0, 410, 768, 360],
  d: [768, 410, 768, 360],
  e: [0, 762, 1536, 262],
};

const BOARDS = [
  ['board-s3-a-light-write-resting.jpg', 'S3-A · Light · Write Resting', 'a', 'write-resting-1536x1024.png',
    'Accepted S1 product bar with Write current · MANUSCRIPT context, Chapters 6–12, Chapter 6 current · the page: The River Between › Chapter 6, The Current Changes, the held quotation · Saved · Draft v12 · one quiet Full Canvas · Previous / Next · no resident MAIA · no formatting controls.'],
  ['board-s3-b-light-full-canvas.jpg', 'S3-B · Light · Full Canvas', 'b', 'write-full-canvas-1536x1024.png',
    'The same editor: the bar, the manuscript context and Previous / Next recede · place, Saved · Draft v12, the held quotation and the word count remain · exactly one Return. The page keeps its 980px measure and its height on screen, so no line re-breaks — the field changes, not the work.'],
  ['board-s3-c-night-write-resting.jpg', 'S3-C · Night · Write Resting', 'c', 'write-resting-night-1536x1024.png',
    'Identical geometry and controls to S3-A (measured: 11 landmark boxes equal); appearance changes colour roles only. Chapters 6–12 by law — the generated Night omission has no authority.'],
  ['board-s3-d-night-full-canvas.jpg', 'S3-D · Night · Full Canvas', 'd', 'write-full-canvas-night-1536x1024.png',
    'Identical geometry and controls to S3-B (measured: 11 landmark boxes equal). Deepest ground, one raised page, action blue and gold as accents only.'],
];

/** Boards embed a 1536px authority scaled down: wait until every image is fully
 *  decoded and painted, or Chromium may shoot its interim low-quality scale and
 *  two runs of the same board would differ by a few pixels. */
async function settle(page) {
  await page.evaluate(async () => {
    await Promise.all([...document.images].map((i) => (i.complete ? i.decode().catch(() => {}) : new Promise((r) => { i.onload = i.onerror = r; }))));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  await page.waitForTimeout(600);
}

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const written = [];

async function open(state, w, h, appearance) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto(`${base}${ROUTE}?state=${state}${appearance === 'night' ? '&appearance=night' : ''}`, { waitUntil: 'networkidle', timeout: 180000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  return page;
}

for (const [state, w, h, appearance, name] of SHOTS) {
  const page = await open(state, w, h, appearance);
  const file = path.join(OUT, name);
  if (w < 721) await (await page.$('[data-capture-frame]')).screenshot({ path: file });
  else await page.screenshot({ path: file });
  written.push(file);
  await page.close();
}

const crop = ([x, y, w, h], width) => `<div style="width:${width}px;height:${Math.round((h * width) / w)}px;overflow:hidden;border-radius:6px;background:#fff">
  <img src="${authorityUrl}" style="display:block;width:${Math.round((1536 * width) / w)}px;margin:${-Math.round((y * width) / w)}px 0 0 ${-Math.round((x * width) / w)}px"></div>`;
const style = `<meta charset="utf-8"><style>
  body{margin:0;background:#1C1E24;color:#E8EAF0;font:15px/1.45 -apple-system,Segoe UI,Helvetica,Arial,sans-serif}
  .wrap{padding:22px 24px 24px}h1{margin:0 0 6px;font-size:22px;font-weight:600;color:#FFD9A0}
  .note{margin:0 0 16px;max-width:1700px;color:#D5DAE4}.pair{display:grid;grid-template-columns:1000px 1000px;gap:28px}
  .lab{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#AAB3C5;margin:0 0 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .lab b{color:#FFD9A0;font-weight:600}img.r{display:block;width:1000px;height:667px;border-radius:4px}
  table{border-collapse:collapse;font-size:12.5px;margin-top:8px}td{padding:2px 10px 2px 0;color:#D5DAE4;vertical-align:top}td:first-child{color:#AAB3C5}
</style>`;
const custodyLine = `custody ${CUSTODY.commit.slice(0, 8)} · sha256 ${CUSTODY.sha256.slice(0, 12)}… · ${CUSTODY.bytes} bytes`;

for (const [out, title, region, render, note] of BOARDS) {
  const page = await browser.newPage({ viewport: { width: 2076, height: 900 }, deviceScaleFactor: 1 });
  const r = `data:image/png;base64,${fs.readFileSync(path.join(OUT, render)).toString('base64')}`;
  await page.setContent(`${style}<div class="wrap"><h1>PC3-S3 · ${title}</h1><p class="note">${note}</p>
    <div class="pair"><div><p class="lab"><b>Founder authority</b> · region ${region.toUpperCase()} of the custodied PNG · ${custodyLine}</p>${crop(REGION[region], 1000)}</div>
    <div><p class="lab"><b>PC3-S3 candidate</b> · browser render · ${render.replace('.png', '')} · fixture data</p><img class="r" src="${r}"></div></div></div>`);
  await settle(page);
  const file = path.join(OUT, out);
  await page.screenshot({ path: file, type: 'jpeg', quality: 86, fullPage: true });
  written.push(file);
  await page.close();
}

// Board E — behavioural evidence from ONE live transition.
{
  const page = await open('write-resting', 1536, 1024, 'light');
  await page.evaluate(() => { document.querySelector('[data-write-editor]').__s3mark = 'S3-EDITOR'; });
  const tuple = () => page.evaluate(() => {
    const ed = document.querySelector('[data-write-editor]');
    const sel = getSelection();
    const r = document.createRange();
    r.setStart(ed, 0);
    r.setEnd(sel.focusNode, sel.focusOffset);
    const crumb = [...document.querySelectorAll('.fr-write-crumb span')].map((e) => e.textContent.trim());
    return {
      'editor identity': ed.__s3mark === 'S3-EDITOR' && document.querySelectorAll('[data-write-editor]').length === 1 ? 'same node · 1 editor' : 'CHANGED',
      Work: crumb[0], place: crumb.join(' › '), selection: sel.toString().length > 40 ? `${sel.toString().slice(0, 38)}…” (${sel.toString().length} chars)` : sel.toString(),
      cursor: `offset ${r.toString().length} (end of selection)`, version: document.querySelector('[data-version]').textContent.trim(),
      'save state': document.querySelector('[data-save-state]').textContent.trim(), focus: document.activeElement === ed ? 'editor' : document.activeElement.tagName,
    };
  });
  const frames = [];
  const snap = async (label) => frames.push({ label, img: `data:image/png;base64,${(await page.screenshot()).toString('base64')}`, t: await tuple() });
  await snap('1 · Resting (before)');
  await page.click('[data-full-canvas]');
  // The root app layout (outside S3) shows a 2s "Audio enabled" toast on the first
  // click of any route. It is allowed to expire, not hidden, before the next frame.
  await page.waitForTimeout(2300);
  await snap('2 · Full Canvas (same editor)');
  await page.click('[data-return]');
  await page.waitForTimeout(200);
  await snap('3 · Back via Return');
  await page.focus('[data-full-canvas]');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  await snap('4 · Back via Escape');
  await page.close();
  const bp = await browser.newPage({ viewport: { width: 2076, height: 900 }, deviceScaleFactor: 1 });
  const cell = (f) => `<div><p class="lab"><b>${f.label}</b></p><img src="${f.img}" style="display:block;width:490px;height:327px;border-radius:4px">
    <table>${Object.entries(f.t).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table></div>`;
  await bp.setContent(`${style}<div class="wrap"><h1>PC3-S3 · S3-E · Transition &amp; Return Continuity — behavioural evidence</h1>
    <p class="note">One live browser session. The editor node is marked before entry; the mark is read back at every step. Entry by pointer, return by the visible control; entry by keyboard, return by Escape. The measured tuple is identical in all four columns. This is behaviour, not a drawn screen.</p>
    <p class="lab"><b>Founder authority</b> · region E of the custodied PNG · ${custodyLine}</p>${crop(REGION.e, 2028)}
    <div style="display:grid;grid-template-columns:repeat(4,490px);gap:22px;margin-top:18px">${frames.map(cell).join('')}</div></div>`);
  await settle(bp);
  const file = path.join(OUT, 'board-s3-e-transition-return.jpg');
  await bp.screenshot({ path: file, type: 'jpeg', quality: 86, fullPage: true });
  written.push(file);
  await bp.close();
}
await browser.close();
for (const f of written) console.log(`wrote ${f}`);
