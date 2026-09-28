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
 *  - CONTAINMENT (PC3-S2R1): exactly one page-level room field on its own tone
 *    with its own edge; exactly one anchor field (the current Work in H2/H4,
 *    the writing in H3), raised on its own tone and holding the primary act;
 *    in H2 the anchor outranks every supporting region in area; regions sit on
 *    their own tone; every block the room lays out starts on one of at most two
 *    alignment lines, the first being the room's inner edge, the rightmost ends
 *    on the room's inner edge, and the band spans the room's inner width exactly; no metadata line holds only a separator; no heavy chrome
 *    (border > 2 px, shadow blur > 30 px or alpha > .3); Night and Light have
 *    identical containment geometry.
 * It does NOT prove atmosphere, elegance, or founder acceptance.
 *
 * Known-bad mutants — each must turn the run RED:
 *  --mutant resident-maia  a MAIA region appears at Home
 *  --mutant urgency        elapsed-time pressure copy appears
 *  --mutant bar-shift      the product bar drifts from the accepted S1 bar
 *  --mutant no-room-field  the page-level field is removed (children unwrapped)
 *  --mutant flat-tones     every field is flattened to the ground tone
 *  --mutant heavy-chrome   a heavy border/shadow utility lands on the fields
 *  --mutant orphan-sep     the S2 separator-dot defect is reintroduced
 */
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const base = (args.find((a) => /^https?:/.test(a)) ?? 'http://localhost:3100').replace(/\/$/, '');
const mutant = args.includes('--mutant') ? args[args.indexOf('--mutant') + 1] : null;
const ROUTE = '/dev/writers-studio-full-redesign-review';
const STATES = ['home-begin', 'home-return', 'home-unclaimed-writing', 'home-many-works'];
const WIDTHS = [[1536, 1024], [1280, 800], [1024, 768], [390, 844]];
const COLORS = { ground: [243, 243, 243], field: [249, 248, 245], raised: [254, 254, 254], title: [8, 20, 59] };
const FORBIDDEN_COPY = /continue where you left off|pick up where|you were working on|you last worked|\b\d+\s+(minutes?|hours?|days?|weeks?|months?)\s+ago\b|it[’']s been|haven[’']t written|get back on track|streak/i;

const rgb = (s) => (s.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
const dE = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

async function open(browser, state, w, h, appearance) {
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
  await page.goto(`${base}${ROUTE}?state=${state}${appearance ? `&appearance=${appearance}` : ''}`, { waitUntil: 'networkidle', timeout: 180000 });
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
  if (state.startsWith('home-') && mutant === 'no-room-field') {
    await page.evaluate(() => {
      const r = document.querySelector('[data-field="room"]');
      if (r) r.replaceWith(...r.childNodes);
    });
  }
  if (state.startsWith('home-') && mutant === 'flat-tones') {
    await page.addStyleTag({ content: '[data-field], .fr-home-region, .fr-home-anchor, .fr-home-field { background: var(--fr-ground) !important; }' });
  }
  if (state.startsWith('home-') && mutant === 'heavy-chrome') {
    await page.addStyleTag({ content: '.fr-heavy { border: 3px solid #08143B !important; box-shadow: 0 24px 64px rgba(8,20,59,.45) !important; }' });
    await page.evaluate(() => document.querySelectorAll('[data-field="anchor"], [data-field="support"]').forEach((e) => e.classList.add('fr-heavy')));
  }
  if (state.startsWith('home-') && mutant === 'orphan-sep') {
    // The S2 defect: a separator between two stacked facts lands on its own line.
    await page.evaluate(() =>
      document.querySelectorAll('.fr-home-facts-stacked').forEach((p) => {
        const dot = document.createElement('span');
        dot.className = 'fr-home-dot';
        dot.textContent = ' · ';
        p.insertBefore(dot, p.children[1] ?? null);
      }),
    );
  }
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

/** Containment facts read from the live DOM (PC3-S2R1). */
const containment = (page) =>
  page.evaluate(() => {
    const box = (e) => {
      const r = e.getBoundingClientRect();
      return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
    };
    const bg = (e) => getComputedStyle(e).backgroundColor;
    const rooms = [...document.querySelectorAll('[data-home-state] [data-field="room"]')];
    const room = rooms[0];
    const anchors = [...document.querySelectorAll('[data-home-state] [data-field="anchor"]')];
    const supports = [...document.querySelectorAll('[data-home-state] [data-field="support"]')];
    const bands = [...document.querySelectorAll('[data-home-state] [data-field="band"]')];
    const cs = room ? getComputedStyle(room) : null;
    const inner = room
      ? [Math.round(room.getBoundingClientRect().left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft)), Math.round(room.getBoundingClientRect().right - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight))]
      : null;
    // Alignment participants: every block the room lays out directly.
    const fields = room ? [...room.children].filter((e) => e.getClientRects().length) : [];
    // Separator-only lines inside metadata.
    const orphans = [];
    for (const p of document.querySelectorAll('[data-home-state] .fr-home-facts, [data-home-state] .fr-home-kind, [data-home-state] figcaption')) {
      const lines = new Map();
      const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        for (let i = 0; i < n.data.length; i++) {
          const rg = document.createRange();
          rg.setStart(n, i);
          rg.setEnd(n, i + 1);
          const rc = rg.getClientRects()[0];
          if (!rc || rc.width === 0) continue;
          const k = Math.round(rc.top);
          lines.set(k, (lines.get(k) ?? '') + n.data[i]);
        }
      }
      for (const t of lines.values()) if (/^[\s·•|]+$/.test(t)) orphans.push(p.textContent.trim());
    }
    // Heavy chrome anywhere in Home.
    const heavy = [];
    for (const e of document.querySelectorAll('[data-home-state], [data-home-state] *')) {
      const c = getComputedStyle(e);
      const bw = Math.max(...['Top', 'Right', 'Bottom', 'Left'].map((sd) => (c[`border${sd}Style`] === 'none' ? 0 : parseFloat(c[`border${sd}Width`]))));
      if (bw > 2) heavy.push(`${e.className || e.tagName} border ${bw}px`);
      if (c.boxShadow && c.boxShadow !== 'none') {
        for (const sh of c.boxShadow.split(/,(?![^(]*\))/)) {
          const col = sh.match(/rgba?\(([^)]+)\)/);
          const alpha = col ? Number((col[1].split(',')[3] ?? '1').trim()) : 1;
          const px = (sh.replace(/rgba?\([^)]+\)/, '').match(/-?[\d.]+px/g) || []).map(parseFloat);
          const blur = px[2] ?? 0;
          if (blur > 30 || alpha > 0.3) heavy.push(`${e.className || e.tagName} shadow blur ${blur} alpha ${alpha}`);
        }
      }
    }
    return {
      rooms: rooms.length,
      roomEdge: cs ? parseFloat(cs.borderTopWidth) : 0,
      shellBg: bg(document.querySelector('.fr-shell')),
      roomBg: room ? bg(room) : '',
      anchors: anchors.length,
      anchorBg: anchors[0] ? bg(anchors[0]) : '',
      anchorBox: anchors[0] ? box(anchors[0]) : null,
      anchorHasPrimary: anchors[0] ? !!anchors[0].querySelector('[data-primary-act]') : false,
      anchorText: anchors[0] ? anchors[0].innerText : '',
      supportBgs: supports.map(bg),
      supportBoxes: supports.map(box),
      inner,
      fieldEdges: fields.map((e) => {
        const r = e.getBoundingClientRect();
        return [Math.round(r.left), Math.round(r.right), e.getAttribute('data-field') ?? e.className];
      }),
      bandBox: bands[0] ? [Math.round(bands[0].getBoundingClientRect().left), Math.round(bands[0].getBoundingClientRect().right)] : null,
      geometry: [room, ...anchors, ...supports, ...bands].filter(Boolean).map(box),
      orphans,
      heavy,
    };
  });

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
      field: cs('[data-field="room"]', 'backgroundColor'),
      raised: cs('[data-field="anchor"]', 'backgroundColor'),
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
  for (const k of ['ground', 'field', 'title']) {
    const d = dE(rgb(facts[k]), COLORS[k]);
    rec(state, `F-color-${k}`, d <= 6, `${facts[k]} ΔE=${d.toFixed(1)}`);
  }
  if (state !== 'home-begin') {
    const d = dE(rgb(facts.raised), COLORS.raised);
    rec(state, 'F-color-raised', d <= 6, `${facts.raised} ΔE=${d.toFixed(1)}`);
  }

  // ── containment (PC3-S2R1) ────────────────────────────────────────────────
  const c = await containment(page);
  const TONE = 3;
  const roomTone = dE(rgb(c.roomBg), rgb(c.shellBg));
  rec(state, 'C-room-field', c.rooms === 1 && c.roomEdge >= 1 && roomTone >= TONE, `rooms=${c.rooms} edge=${c.roomEdge}px ΔE(room,ground)=${roomTone.toFixed(1)}`);
  const anchorTone = c.anchorBg ? dE(rgb(c.anchorBg), rgb(c.roomBg)) : 0;
  const raisedAnchor = state !== 'home-begin';
  const regionTones = c.supportBgs.map((b) => dE(rgb(b), rgb(c.roomBg)));
  const twoTone = roomTone >= TONE && (!raisedAnchor || anchorTone >= TONE) && regionTones.every((t) => t >= TONE);
  rec(state, 'C-two-tone', twoTone, `room ${roomTone.toFixed(1)} · anchor ${raisedAnchor ? anchorTone.toFixed(1) : 'threshold'} · regions ${regionTones.map((t) => t.toFixed(1)).join('/') || '—'}`);
  let anchorOk = c.anchors === 1 && c.anchorHasPrimary;
  if (state === 'home-return' || state === 'home-many-works') anchorOk &&= /The River Between/.test(c.anchorText) && /Return to this work/.test(c.anchorText);
  if (state === 'home-return') {
    const area = (b) => b[2] * b[3];
    anchorOk &&= c.supportBoxes.every((b) => area(c.anchorBox) > area(b));
  }
  rec(state, 'C-anchor', anchorOk, `anchors=${c.anchors} primary=${c.anchorHasPrimary}${state === 'home-return' ? ` area ${c.anchorBox[2] * c.anchorBox[3]} vs regions ${c.supportBoxes.map((b) => b[2] * b[3]).join('/')}` : ''}`);
  const lefts = [...new Set(c.fieldEdges.map((e) => e[0]))];
  const rights = c.fieldEdges.map((e) => e[1]);
  const aligned =
    !!c.inner && lefts.length <= 2 && Math.abs(Math.min(...lefts) - c.inner[0]) <= 1 && Math.abs(Math.max(...rights) - c.inner[1]) <= 1 && (!c.bandBox || (Math.abs(c.bandBox[0] - c.inner[0]) <= 1 && Math.abs(c.bandBox[1] - c.inner[1]) <= 1));
  rec(state, 'C-boundaries', aligned, `inner ${c.inner?.join('–')} · field lefts ${lefts.join('/')} · band ${c.bandBox?.join('–') ?? '—'}`);
  rec(state, 'C-no-orphan-sep', c.orphans.length === 0, c.orphans.length ? `orphan separator in: ${c.orphans.slice(0, 2).join(' | ')}` : 'no separator-only line');
  rec(state, 'C-no-heavy-chrome', c.heavy.length === 0, c.heavy.length ? c.heavy.slice(0, 2).join(' | ') : 'borders ≤ 2 px · shadows light');
  {
    const { page: n } = await open(browser, state, 1536, 1024, 'night');
    const cn = await containment(n);
    await n.close();
    const same = JSON.stringify(cn.geometry) === JSON.stringify(c.geometry);
    rec(state, 'C-night=light', same, same ? `${c.geometry.length} field boxes identical` : `light ${JSON.stringify(c.geometry)} vs night ${JSON.stringify(cn.geometry)}`);
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
    const cw = await containment(q);
    rec(state, `R@${w}`, r.overflow <= 0 && r.primary > 0 && barSame && cw.rooms === 1 && cw.orphans.length === 0, `overflow=${r.overflow}px primary=${r.primary}px bar=${barSame ? 'S1' : 'DRIFT'} room=${cw.rooms} orphans=${cw.orphans.length}`);
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
