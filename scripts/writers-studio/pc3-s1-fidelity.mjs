#!/usr/bin/env node
/**
 * PC3-S1 fidelity instrument — canonical Light Shell vs the founder originals.
 *
 *   node scripts/writers-studio/pc3-s1-fidelity.mjs [baseUrl] [--mutant maia-drop]
 *
 * Every contract number below is measured from the founder ORIGINAL named on its
 * state (corpus custody c0f4bca2), never from a candidate render. Tolerance ±6 px.
 *
 * Proves: region geometry, landmark geometry, colour roles, text integrity,
 * chapter-range non-wrap, MAIA-stays-right at 1536/1440/1280/1100/1024, and zero
 * business network traffic from the review harness.
 * Does NOT prove: atmosphere, elegance, relational quality, founder acceptance.
 *
 * --drift <px> (e.g. -0.3px, 0.6px) re-runs the whole contract with every glyph advance
 * shifted, standing in for another platform's text shaping; the contract must still hold.
 *
 * --mutant maia-drop re-creates the rejected 2026-09-23 preview's defect (MAIA
 * stacks beneath the Work below 1180 px) on the live candidate. The instrument
 * must go RED on it; a run where it stays green means the instrument is blind.
 */
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const base = (args.find((a) => /^https?:/.test(a)) ?? 'http://localhost:3100').replace(/\/$/, '');
const mutant = args.includes('--mutant') ? args[args.indexOf('--mutant') + 1] : null;
// --drift <px>: shift every glyph advance by <px> to stand in for another platform's
// text shaping. Landmark extents must not move when a line break does (PC3-S1R2).
const drift = args.includes('--drift') ? args[args.indexOf('--drift') + 1] : null;
const ROUTE = '/dev/writers-studio-full-redesign-review';
const TOL = 6;
const WIDTHS = [1536, 1440, 1280, 1100, 1024];

const MUTANTS = {
  'maia-drop': `@media (max-width:1180px){.fr-room{grid-template-columns:var(--fr-ms-w) minmax(0,1fr)!important}.fr-maia{grid-column:1 / -1!important}}`,
};

// [left, right, top, bottom] — from the originals at 1536×1024.
const CONTRACT = {
  'develop-themes': {
    ref: 'Soullab Themes Writing Workspace.png (#10) · c3f70882',
    bar: 56,
    regions: { manuscript: [13, 311, 63, 1011], work: [333, 1175, null, null], maia: [1193, 1524, 63, 1011] },
    landmarks: { hero: [334, 1174, 206, 437], 'theme-row': [333, 1175, 505, 570], lower: [null, null, 785, null] },
    pitch: { 'theme-row': 68 },
  },
  'develop-manuscript': {
    ref: 'Soullab Manuscript Analysis Dashboard.png (#11) · 9986821d',
    bar: 55,
    regions: { manuscript: [11, 305, 66, 1009], work: [318, 1112, 66, 1009], maia: [1125, 1527, 66, 1009] },
    landmarks: { held: [348, 1080, 537, 618], 'maia-card': [1148, 1507, 181, 423] },
  },
  'review-chapter': {
    ref: 'Soullab Writer’s Studio Review Dashboard(3).png (#23) · b46562a7',
    bar: 51,
    regions: { manuscript: [19, 256, 66, 976], work: [273, 1164, null, null], maia: [1182, 1517, 66, 977] },
    landmarks: { hero: [274, 1163, 187, 350], tiles: [273, 1164, 360, 431], findings: [273, null, 439, 944] },
  },
};
const COLORS = { ground: [243, 243, 243], panel: [254, 254, 254], ink: [8, 20, 59] };

const near = (a, b) => b === null || Math.abs(a - b) <= TOL;
const rgb = (s) => (s.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
const dE = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const fmt = (r) => (r ? `${r.l}/${r.r}/${r.t}/${r.b}` : 'missing');

async function open(browser, state, w, h) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const traffic = [];
  page.on('request', (req) => {
    const u = new URL(req.url());
    const staticAsset = u.pathname.startsWith('/_next/') || u.pathname.startsWith('/__nextjs') || u.pathname === ROUTE || /\.(woff2?|png|jpe?g|svg|ico|css|js)$/.test(u.pathname);
    if (!staticAsset || ['fetch', 'xhr', 'eventsource', 'websocket'].includes(req.resourceType()) && !u.pathname.startsWith('/_next/')) {
      traffic.push(`${req.method()} ${u.pathname} [${req.resourceType()}]`);
    }
  });
  page.on('websocket', (ws) => {
    if (!/\/_next\/webpack-hmr/.test(ws.url())) traffic.push(`WS ${ws.url()}`);
  });
  await page.goto(`${base}${ROUTE}?state=${state}`, { waitUntil: 'networkidle', timeout: 180000 });
  if (mutant) await page.addStyleTag({ content: MUTANTS[mutant] });
  if (drift) await page.addStyleTag({ content: `.fr-shell *{letter-spacing:${drift}!important}` });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  return { page, traffic };
}

const box = (page, sel, all) =>
  page.evaluate(([s, a]) => {
    const els = a ? [...document.querySelectorAll(s)] : [document.querySelector(s)].filter(Boolean);
    return els.map((e) => {
      const r = e.getBoundingClientRect();
      return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom) };
    });
  }, [sel, all]);

const browser = await chromium.launch();
const results = [];
const rec = (state, id, ok, detail) => results.push({ state, id, ok, detail });

for (const [state, c] of Object.entries(CONTRACT)) {
  const { page, traffic } = await open(browser, state, 1536, 1024);
  const [bar] = await box(page, '[data-region="topbar"]');
  rec(state, 'G-bar', !!bar && near(bar.b - bar.t, c.bar), bar ? `h=${bar.b - bar.t} (ref ${c.bar})` : 'missing');
  for (const [region, want] of Object.entries(c.regions)) {
    const [r] = await box(page, `[data-region="${region}"]`);
    rec(state, `G-${region}`, !!r && [r.l, r.r, r.t, r.b].every((v, i) => near(v, want[i])), `${fmt(r)} (ref ${want.map((v) => v ?? '·').join('/')})`);
  }
  for (const [lm, want] of Object.entries(c.landmarks)) {
    const [r] = await box(page, `[data-landmark="${lm}"]`);
    rec(state, `L-${lm}`, !!r && [r.l, r.r, r.t, r.b].every((v, i) => near(v, want[i])), `${fmt(r)} (ref ${want.map((v) => v ?? '·').join('/')})`);
  }
  for (const [lm, want] of Object.entries(c.pitch ?? {})) {
    const rs = await box(page, `[data-landmark="${lm}"]`, true);
    rec(state, `L-${lm}-pitch`, rs.length > 1 && near(rs[1].t - rs[0].t, want), rs.length > 1 ? `pitch=${rs[1].t - rs[0].t} (ref ${want})` : 'missing');
  }
  const col = await page.evaluate(() => ({
    ground: getComputedStyle(document.querySelector('.fr-shell')).backgroundColor,
    panel: getComputedStyle(document.querySelector('[data-region="maia"]')).backgroundColor,
    ink: getComputedStyle(document.querySelector('[data-region="work"] h1')).color,
  }));
  for (const k of Object.keys(COLORS)) {
    const d = dE(rgb(col[k]), COLORS[k]);
    rec(state, `P-${k}`, d <= 6, `${col[k]} ΔE=${d.toFixed(1)}`);
  }
  const text = await page.evaluate(() => {
    const t = document.querySelector('[data-capture-frame]').innerText;
    return { mojibake: (t.match(/â€|Ã.|�/g) || []).length, curly: /[’“”—]/.test(t) };
  });
  rec(state, 'T-encoding', text.mojibake === 0 && text.curly, `mojibake=${text.mojibake} curly=${text.curly}`);
  const wrapped = await page.evaluate(() => [...document.querySelectorAll('.fr-range')].filter((e) => e.offsetHeight > 20).length);
  if (state === 'develop-themes') rec(state, 'T-range-nowrap', wrapped === 0, `wrapped=${wrapped}`);
  const nav = await page.evaluate(() => [...document.querySelectorAll('[data-region="topbar"] nav button')].map((b) => b.textContent.trim()).join('·'));
  rec(state, 'N-spine', nav === 'Home·Write·Develop·Review', nav);
  rec(state, 'Z-network', traffic.length === 0, traffic.length ? traffic.join(' | ') : 'zero business requests');
  await page.close();

  for (const w of WIDTHS) {
    const { page: q } = await open(browser, state, w, 900);
    const [m] = await box(q, '[data-region="maia"]');
    const [k] = await box(q, '[data-region="work"]');
    const ok = m && k && m.l >= k.r - 1 && Math.abs(m.t - k.t) < 40;
    rec(state, `R-maia-right@${w}`, !!ok, m && k ? `maia l=${m.l} t=${m.t} · work r=${k.r} t=${k.t}` : 'missing');
    await q.close();
  }
}
await browser.close();

const fail = results.filter((r) => !r.ok);
console.log(`\nPC3-S1 fidelity · ${base}${ROUTE}${mutant ? ` · MUTANT ${mutant}` : ''}${drift ? ` · DRIFT ${drift}` : ''}`);
let last = '';
for (const r of results) {
  if (r.state !== last) console.log(`\n  ${r.state} — ref ${CONTRACT[r.state].ref}`), (last = r.state);
  console.log(`    ${r.ok ? 'PASS' : 'FAIL'}  ${r.id.padEnd(18)} ${r.detail}`);
}
console.log(`\n  → ${results.length - fail.length}/${results.length} ${fail.length ? 'RED' : 'GREEN'}`);
process.exit(fail.length ? 1 : 0);
