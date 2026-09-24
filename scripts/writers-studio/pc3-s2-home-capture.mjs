#!/usr/bin/env node
/**
 * PC3-S2 Home capture instrument — browser renders + founder-review boards.
 *
 *   node scripts/writers-studio/pc3-s2-home-capture.mjs [baseUrl]
 *
 * Writes docs/design/contracts/screenshots/full-redesign-pc3-s2/.
 * Each board shows the governing family reference (Visual Canon frame 1) and
 * the supporting August Work Home as CONTEXT, beside the actual browser render,
 * with a derivation note. No reference is presented as an exact pixel target —
 * there is no single later-generation Home board (packet §11–12). Both
 * references are read from corpus custody with `git show` and hash-checked.
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const base = (process.argv.find((a) => /^https?:/.test(a)) ?? 'http://localhost:3100').replace(/\/$/, '');
const ROUTE = '/dev/writers-studio-full-redesign-review';
const OUT = 'docs/design/contracts/screenshots/full-redesign-pc3-s2';
const CORPUS = 'c0f4bca2952a6b6afa2d74e204117b6abdf1915a';
const CANON = ['docs/design/writers-studio/founder-reference-corpus/original-27/Soullab Writers Studio Visual Canon.png', 'e5a72601548ee0f19e490a0f3c6f99d66694b2333217d6c341e64e9a37c44b25'];
const AUGUST = ['docs/design/writers-studio/founder-reference-corpus/writer-studio-reference-pack/references/01-work-home.png', '27da50dff5773b89bd4ea0e875b1940f648b2671f35b4c90b64c5dfbed8542b7'];

const SHOTS = [
  ['home-begin', 1536, 1024], ['home-begin', 1280, 800], ['home-begin', 1024, 768], ['home-begin', 390, 844, 'mobile'],
  ['home-return', 1536, 1024], ['home-return', 1280, 800], ['home-return', 1024, 768], ['home-return', 390, 844, 'mobile'],
  ['home-unclaimed-writing', 1536, 1024], ['home-many-works', 1536, 1024],
  ['home-return', 1536, 1024, 'night'],
];

const NOTES = {
  'home-begin': {
    title: 'H1 · Begin — empty Studio',
    shell: 'accepted S1 product bar (Home current, no Work picker because no Work exists) · Newsreader/Inter roles · Light ground and panel · S1 action blue and radius',
    canon: 'the Work before the software; no tour, no wizard, no permission language; a new Work feels open; one quiet trust line (First Arrival canon)',
    live: '“Welcome, writer. You are home.”, “Begin a new work”, “Import writing”, “Bring notes & sources” — the live Home’s own words and acts',
    not: 'no fake example Works, no goals, no MAIA insights, no templates, no dark rail — the August Work Home dashboard is history, not target',
  },
  'home-return': {
    title: 'H2 · Return — The River Between',
    shell: 'accepted S1 bar with the Work picker · the Visual Canon frame-1 composition: Work left, “Your writing space” right',
    canon: '“Welcome back to The River Between.” and the current place, allowed only with durable place evidence (Home ruling §9); recognition by a line kept at an exact address with its reason',
    live: 'Return · the Work’s own image beside its name · “Return to this work” · “Also written” (not “recently”) · History as fixed dates · Remove vs Delete as two acts',
    not: 'no “Continue Writing”, no “Edited 2m ago”, no word-count pressure, no goals or progress bars, no MAIA companion rail',
  },
  'home-unclaimed-writing': {
    title: 'H3 · Unclaimed writing',
    shell: 'same bar, type and roles; writing set on a dashed page edge, Works on a solid card with their image',
    canon: 'detected is not declared; nothing becomes structure or a Work by inference (Onboarding / Flagship canons)',
    live: '“Your writing is here.” · Open writing · Make this a work · Add to a work — writing is opened as itself',
    not: 'never labelled a Work; no automatic grouping into Works',
  },
  'home-many-works': {
    title: 'H4 · Many Works',
    shell: 'derived from H2 (compact Return) with a literary shelf in the S1 card language',
    canon: 'capability honesty: the search that exists is named by its scope; no global Search or Library destination',
    live: 'the live Home’s conditional “Find by title…” search, with its scope now stated: “Searches titles only”',
    not: 'no file-manager table, no sort-by-activity, no global search, no Library room',
  },
};

function original([p, sha]) {
  let buf;
  try {
    buf = execFileSync('git', ['show', `${CORPUS}:${p}`], { maxBuffer: 64 * 1024 * 1024 });
  } catch {
    throw new Error(`Reference not available locally. Run: git fetch origin ${CORPUS}`);
  }
  const got = execFileSync('sha256sum', { input: buf }).toString().slice(0, 64);
  if (got !== sha) throw new Error(`Custody mismatch for ${p}: ${got} ≠ ${sha}`);
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
  if (kind === 'mobile') await (await page.$('[data-capture-frame]')).screenshot({ path: file });
  else await page.screenshot({ path: file });
  written.push(file);
  await page.close();
}

// Visual Canon frame 1 (Home) is cropped from the governing original for context.
const canonUrl = `data:image/png;base64,${original(CANON).toString('base64')}`;
const augustUrl = `data:image/png;base64,${original(AUGUST).toString('base64')}`;
for (const state of Object.keys(NOTES)) {
  const n = NOTES[state];
  const render = `data:image/png;base64,${fs.readFileSync(path.join(OUT, `${state}-1536x1024.png`)).toString('base64')}`;
  const page = await browser.newPage({ viewport: { width: 2200, height: 1240 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>
    body{margin:0;background:#1C1E24;color:#E8EAF0;font:15px/1.45 -apple-system,Segoe UI,Helvetica,Arial,sans-serif}
    .wrap{display:grid;grid-template-columns:600px 1536px;gap:28px;padding:22px 18px}
    h1{margin:0 0 14px;font-size:22px;font-weight:600;color:#FFD9A0}
    .lab{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#AAB3C5;margin:0 0 6px}
    .ref{margin:0 0 18px}.crop{width:600px;height:740px;overflow:hidden;border-radius:6px;background:#fff}
    .crop img{width:2472px;margin:-285px 0 0 -48px}
    .aug img{width:600px;border-radius:6px;opacity:.9}
    .render img{display:block;width:1536px;height:1024px;border-radius:4px}
    dl{margin:14px 0 0;display:grid;grid-template-columns:150px 1fr;gap:6px 14px;font-size:13.5px}
    dt{color:#AAB3C5}dd{margin:0}
    </style>
    <div class="wrap"><div>
      <h1>${n.title}</h1>
      <div class="ref"><p class="lab">Governing family · Visual Canon frame 1 · ${CANON[1].slice(0, 12)}</p><div class="crop"><img src="${canonUrl}"></div></div>
    </div><div class="render"><p class="lab">PC3-S2 candidate · browser render · ${ROUTE}?state=${state} · 1536×1024 · fixture data</p><img src="${render}">
      <dl><dt>From Light Shell</dt><dd>${n.shell}</dd><dt>From Home canon</dt><dd>${n.canon}</dd><dt>From live Home</dt><dd>${n.live}</dd><dt>Not copied</dt><dd>${n.not}</dd></dl>
    </div></div>
    <div style="padding:0 18px 18px" class="aug"><p class="lab">Supporting history only — NOT the target · August Work Home · ${AUGUST[1].slice(0, 12)}</p><img src="${augustUrl}" style="width:600px"></div>`);
  const out = path.join(OUT, `board-${state}.jpg`);
  await page.screenshot({ path: out, type: 'jpeg', quality: 86, fullPage: true });
  written.push(out);
  await page.close();
}
await browser.close();
for (const f of written) console.log(`wrote ${f}`);
