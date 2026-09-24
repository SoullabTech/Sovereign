#!/usr/bin/env node
/**
 * PC3-S2 Home / Arrival fidelity instrument.
 *
 *   node scripts/writers-studio/pc3-s2-home-fidelity.mjs [baseUrl] [--mutant resident-maia|urgency|bar-shift]
 *
 * There is no single later-generation Home board, so this instrument does NOT
 * invent a pixel contract (packet §11). It proves the Home states belong to the
 * accepted S1 family and tell the truth:
 *  - FAMILY: the product bar is the accepted S1 bar — every bar element's box is
 *    measured against a live S1 render (develop-themes) at the same viewport;
 *    Light is default; Newsreader/Inter roles and ground/panel/title colours hold;
 *    no manuscript rail and no resident MAIA at Home.
 *  - TRUTH: one primary act per state; H1 “Begin a new work”; H2 declared Work +
 *    “Return to this work”; H3 writing never labelled a Work; H4 title-scoped
 *    search that says so; spine Home·Write·Develop·Review; no false-resume or
 *    elapsed-time copy; zero business network requests.
 *  - RESPONSIVE: no horizontal overflow and the primary act present at 1536 ·
 *    1280 · 1024 · 390.
 * It does NOT prove atmosphere, elegance, or founder acceptance.
 *
 * Known-bad mutants — each must turn the run RED:
 *  --mutant resident-maia  a MAIA region appears at Home
 *  --mutant urgency        elapsed-time pressure copy appears
 *  --mutant bar-shift      the product bar drifts from the accepted S1 bar
 */
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const base = (args.find((a) => /^https?:/.test(a)) ?? 'http://localhost:3100').replace(/\/$/, '');
const mutant = args.includes('--mutant') ? args[args.indexOf('--mutant') + 1] : null;
const ROUTE = '/dev/writers-studio-full-redesign-review';
const STATES = ['home-begin', 'home-return', 'home-unclaimed-writing', 'home-many-works'];
const WIDTHS = [[1536, 1024], [1280, 800], [1024, 768], [390, 844]];
const COLORS = { ground: [243, 243, 243], panel: [254, 254, 254], title: [8, 20, 59] };
const FORBIDDEN_COPY = /continue where you left off|pick up where|you were working on|you last worked|\b\d+\s+(minutes?|hours?|days?|weeks?|months?)\s+ago\b|it[’']s been|haven[’']t written|get back on track|streak/i;

const rgb = (s) => (s.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
const dE = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

async function open(browser, state, w, h) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const traffic = [];
  page.on('request', (req) => {
    const u = new URL(req.url());
    const staticAsset = u.pathname.startsWith('/_next/') || u.pathname.startsWith('/__nextjs') || u.pathname === ROUTE || /\.(woff2?|png|jpe?g|svg|ico|css|js)$/.test(u.pathname);
    if (!staticAsset) traffic.push(`${req.method()} ${u.pathname} [${req.resourceType()}]`);
  });
  page.on('websocket', (ws) => {
    if (!/\/_next\/webpack-hmr/.test(ws.url())) traffic.push(`WS ${ws.url()}`);
  });
  await page.goto(`${base}${ROUTE}?state=${state}`, { waitUntil: 'networkidle', timeout: 180000 });
  if (state.startsWith('home-') && mutant === 'resident-maia') {
    await page.evaluate(() => {
      const a = document.createElement('aside');
      a.setAttribute('data-region', 'maia');
      a.textContent = 'MAIA';
      document.querySelector('.fr-room').appendChild(a);
    });
  }
  if (state.startsWith('home-') && mutant === 'urgency') {
    await page.evaluate(() => {
      const p = document.createElement('p');
      p.textContent = 'It’s been 12 days since you wrote.';
      document.querySelector('[data-home-state]').prepend(p);
    });
  }
  if (state.startsWith('home-') && mutant === 'bar-shift') await page.addStyleTag({ content: '.fr-bar{height:64px!important;padding-left:48px!important}' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  return { page, traffic };
}

const barBoxes = (page) =>
  page.evaluate(() =>
    ['[data-region="topbar"]', '.fr-brand', ...[0, 1, 2, 3].map((i) => `.fr-nav-item:nth-child(${i + 1})`), '.fr-avatar'].map((s) => {
      const e = document.querySelector(s);
      if (!e) return null;
      const r = e.getBoundingClientRect();
      return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
    }),
  );

const browser = await chromium.launch();
const results = [];
const rec = (state, id, ok, detail) => results.push({ state, id, ok, detail });

// The accepted S1 bar, measured live, is the family reference for the Home bar.
// The current item is set in a heavier weight, which changes that label's width,
// so the reference is the S1 bar with HOME marked current — exact equality, no tolerance.
const s1Bars = {};
for (const [w, h] of WIDTHS) {
  const { page } = await open(browser, 'develop-themes', w, h);
  await page.evaluate(() => {
    const items = [...document.querySelectorAll('.fr-nav-item')];
    items.forEach((b) => b.removeAttribute('aria-current'));
    items[0].setAttribute('aria-current', 'page');
  });
  await page.waitForTimeout(100);
  s1Bars[w] = await barBoxes(page);
  await page.close();
}

for (const state of STATES) {
  const { page, traffic } = await open(browser, state, 1536, 1024);
  const bar = await barBoxes(page);
  const same = JSON.stringify(bar) === JSON.stringify(s1Bars[1536]);
  rec(state, 'F-bar=S1', same, same ? 'bar, brand, nav ×4, avatar identical to accepted S1 bar' : `home ${JSON.stringify(bar)} vs S1 ${JSON.stringify(s1Bars[1536])}`);
  const facts = await page.evaluate(() => {
    const cs = (s, p) => {
      const e = document.querySelector(s);
      return e ? getComputedStyle(e)[p] : '';
    };
    const t = document.querySelector('[data-capture-frame]').innerText;
    const nav = [...document.querySelectorAll('[data-region="topbar"] nav button')].map((b) => ({ l: b.textContent.trim(), c: b.getAttribute('aria-current') }));
    const regions = [...document.querySelectorAll('[data-region]')].map((e) => e.getAttribute('data-region'));
    const primaries = [...document.querySelectorAll('[data-capture-frame] [data-primary-act]')].map((e) => e.textContent.trim());
    const writing = [...document.querySelectorAll('[data-kind="writing"]')].map((e) => [...e.querySelectorAll('.fr-home-chip')].map((c) => c.textContent.trim()));
    const works = document.querySelectorAll('[data-kind="work"]').length;
    const search = document.querySelector('input[data-search-scope]');
    return {
      appearance: document.querySelector('.fr-shell').getAttribute('data-appearance'),
      h1Font: cs('[data-capture-frame] h1', 'fontFamily'),
      navFont: cs('.fr-nav-item', 'fontFamily'),
      ground: cs('.fr-shell', 'backgroundColor'),
      panel: cs('.fr-home-space, .fr-home-work-hero, .fr-home-writing-lead, .fr-home-workcard', 'backgroundColor'),
      title: cs('[data-capture-frame] h1', 'color'),
      text: t,
      nav,
      regions,
      primaries,
      writing,
      works,
      search: search ? { scope: search.getAttribute('data-search-scope'), placeholder: search.getAttribute('placeholder') } : null,
      scopeVisible: /Searches titles only/.test(t),
    };
  });
  rec(state, 'F-light-default', facts.appearance === 'light', `appearance=${facts.appearance}`);
  rec(state, 'F-type-roles', /Newsreader/i.test(facts.h1Font) && /Inter/i.test(facts.navFont), `h1: ${facts.h1Font.split(',')[0]} · nav: ${facts.navFont.split(',')[0]}`);
  for (const k of ['ground', 'panel', 'title']) {
    const d = dE(rgb(facts[k]), COLORS[k]);
    rec(state, `F-color-${k}`, d <= 6, `${facts[k]} ΔE=${d.toFixed(1)}`);
  }
  rec(state, 'F-one-room', JSON.stringify(facts.regions) === JSON.stringify(['topbar', 'work']), `regions=${facts.regions.join('·')}`);
  rec(state, 'T-spine', facts.nav.map((n) => n.l).join('·') === 'Home·Write·Develop·Review' && facts.nav.filter((n) => n.c === 'page').map((n) => n.l).join() === 'Home', facts.nav.map((n) => (n.c ? `[${n.l}]` : n.l)).join('·'));
  rec(state, 'T-one-primary', facts.primaries.length === 1, `primary=${JSON.stringify(facts.primaries)}`);
  rec(state, 'T-no-false-copy', !FORBIDDEN_COPY.test(facts.text), (facts.text.match(FORBIDDEN_COPY) || ['clean'])[0]);
  if (state === 'home-begin') rec(state, 'T-begin', facts.primaries[0] === 'Begin a new work' && facts.works === 0, `primary=${facts.primaries[0]} works=${facts.works}`);
  if (state === 'home-return') rec(state, 'T-return', /Welcome back to The River Between\./.test(facts.text) && /You[’']re in Chapter 6/.test(facts.text) && /Return to this work/.test(facts.primaries[0] ?? ''), 'declared Work · place · Return');
  if (state === 'home-unclaimed-writing') {
    const ok = facts.writing.length > 0 && facts.writing.every((chips) => chips.includes('Writing') && !chips.includes('Work'));
    rec(state, 'T-writing-not-work', ok, `writing chips=${JSON.stringify(facts.writing)}`);
  }
  if (state === 'home-many-works') rec(state, 'T-title-search', facts.search?.scope === 'title' && facts.scopeVisible, `scope=${facts.search?.scope} placeholder=${facts.search?.placeholder} visible=${facts.scopeVisible}`);
  rec(state, 'Z-network', traffic.length === 0, traffic.length ? traffic.join(' | ') : 'zero business requests');
  await page.close();

  for (const [w, h] of WIDTHS.slice(1)) {
    const { page: q } = await open(browser, state, w, h);
    const r = await q.evaluate(() => {
      const p = document.querySelector('[data-capture-frame] [data-primary-act]')?.getBoundingClientRect();
      return { overflow: document.scrollingElement.scrollWidth - window.innerWidth, primary: p ? Math.round(p.width) : 0 };
    });
    const bar = await barBoxes(q);
    const barSame = w < 720 || JSON.stringify(bar) === JSON.stringify(s1Bars[w]);
    rec(state, `R@${w}`, r.overflow <= 0 && r.primary > 0 && barSame, `overflow=${r.overflow}px primary=${r.primary}px bar=${barSame ? 'S1' : 'DRIFT'}`);
    await q.close();
  }
}
await browser.close();

const fail = results.filter((r) => !r.ok);
console.log(`\nPC3-S2 Home fidelity · ${base}${ROUTE}${mutant ? ` · MUTANT ${mutant}` : ''}`);
let last = '';
for (const r of results) {
  if (r.state !== last) console.log(`\n  ${r.state}`), (last = r.state);
  console.log(`    ${r.ok ? 'PASS' : 'FAIL'}  ${r.id.padEnd(20)} ${r.detail}`);
}
console.log(`\n  → ${results.length - fail.length}/${results.length} ${fail.length ? 'RED' : 'GREEN'}`);
process.exit(fail.length ? 1 : 0);
