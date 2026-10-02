#!/usr/bin/env node
/**
 * PC3-S3 Write Resting + Full Canvas — fidelity and behaviour instrument.
 *
 *   node scripts/writers-studio/pc3-s3-write-fidelity.mjs [baseUrl] [--mutant <name>]
 *
 * CUSTODY FIRST. The founder authority is read from Git (commit:path) and the run
 * REFUSES — before any browser opens — on a SHA-256 or byte-count mismatch.
 *
 * Then, in a real browser, against the isolated founder-review route:
 *  FAMILY    Resting keeps the accepted S1 product bar (boxes equal to the S1 bar
 *            with Write current, at 1536/1280/1024); Full Canvas has no bar.
 *  CONTRACT  §12 of the packet: no resident MAIA, no formatting controls, Chapters
 *            6–12 with Chapter 6 current in both appearances, Saved · Draft v12,
 *            Full Canvas entry + Previous/Next at rest, Return and no Previous/Next
 *            in Full Canvas, the same held quotation in A/B/C/D, Light = Night
 *            geometry, type roles only, zero business requests, no overflow.
 *  AUTHORITY Proportions derived from the custodied PNG (see AUTH below), with the
 *            tolerance and its reason recorded here and in the S3 contract.
 *  BEHAVIOUR One editor, the SAME DOM node (a JS mark set before entry must be on
 *            the only editor during and after), and the tuple
 *            Work · place · selection · cursor · version · save · focus identical
 *            before, in Full Canvas, and after BOTH return mechanisms (Return and
 *            Escape), and after keyboard activation of the entry control.
 * It does NOT prove atmosphere, spaciousness, immersion or founder acceptance.
 *
 * Known-bad mutants (§13) — each must turn the run RED on its intended law:
 *  duplicate-editor · cursor-loss · save-state-loss · return-divergence · escape-removed ·
 *  resident-maia · formatting-toolbar · type-role-bypass · light-night-drift · shell-leak ·
 *  custody-mismatch
 * Mutants are runtime injections only; source bytes are hashed before and after.
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';

const args = process.argv.slice(2);
const base = (args.find((a) => /^https?:/.test(a)) ?? 'http://localhost:3100').replace(/\/$/, '');
const mutant = args.includes('--mutant') ? args[args.indexOf('--mutant') + 1] : null;
const ROUTE = '/dev/writers-studio-full-redesign-review';

// ── custody ────────────────────────────────────────────────────────────────
const CUSTODY = {
  commit: 'fa151298997380fd5e4c76beef22b0afb6dc5662',
  path: 'docs/design/writers-studio/founder-reference-corpus/s3-visual-authority/a_clean_multi_panel_ui_ux_design_composite_with_fi.png',
  sha256: '982b363b158a47d229c3efcb634be0ee09e722a7810df33a500a51de8058b5d9',
  bytes: 1855655,
};
/**
 * Authority proportions, measured once from the custodied PNG (fractions of each
 * panel's frame width; method in the S3 contract). Vertical positions are NOT
 * asserted against the image: each panel depicts a 1536-wide screen at ≈0.49
 * horizontally but a shorter-than-1024 frame, so absolute heights are not stable.
 * TOLERANCE 0.03 of width: ≈±1.5% generation noise in the composite, plus one
 * deliberate law-driven difference — the authority's Full Canvas measure is ≈4%
 * wider than its Resting measure, but S3 keeps ONE measure in both states so the
 * same editor never re-breaks its lines ("the field changes, not the work").
 */
const AUTH = { railFrac: 0.236, restTextLeft: 0.297, restMeasure: 0.635, fullTextLeft: 0.188, fullMeasure: 0.661 };
const TOL = 0.03;
const QUOTE = '“Maybe this is what growing feels like,” she whispered. “Not arriving, but learning to stay with the in-between.”';
const CHAPTERS = ['ch-6', 'ch-7', 'ch-8', 'ch-9', 'ch-10', 'ch-11', 'ch-12'];
const FORMATTING = /\b(Bold|Italic|Underline|Paragraph|Heading|Quote|Bullet|Numbered|Format)\b/;
const SOURCES = [
  'app/writers-studio/full-redesign/WriteRoom.tsx',
  'app/writers-studio/full-redesign/Shell.tsx',
  'app/dev/writers-studio-full-redesign-review/FullRedesignReviewClient.tsx',
  'app/dev/writers-studio-full-redesign-review/full-redesign-review.css',
];
const sourceHash = () => crypto.createHash('sha256').update(SOURCES.map((f) => fs.readFileSync(f)).join('\0')).digest('hex');

function verifyCustody() {
  let buf;
  try {
    buf = execFileSync('git', ['show', `${CUSTODY.commit}:${CUSTODY.path}`], { maxBuffer: 64 * 1024 * 1024 });
  } catch {
    return { ok: false, detail: `authority not readable from Git — run: git fetch origin ${CUSTODY.commit}` };
  }
  if (mutant === 'custody-mismatch') buf = Buffer.concat([buf, Buffer.from([0])]); // one foreign byte
  const sha = crypto.createHash('sha256').update(buf).digest('hex');
  const ok = sha === CUSTODY.sha256 && buf.length === CUSTODY.bytes;
  return { ok, detail: `sha256 ${sha.slice(0, 16)}… bytes ${buf.length}${ok ? '' : ` ≠ ${CUSTODY.sha256.slice(0, 16)}… / ${CUSTODY.bytes}`}` };
}

const results = [];
const rec = (state, id, ok, detail) => results.push({ state, id, ok, detail });

const custody = verifyCustody();
rec('custody', 'K-custody', custody.ok, custody.detail);
if (!custody.ok) {
  report();
  console.log('\n  ⛔ REFUSED: the founder authority does not match custody. No fidelity was run.');
  process.exit(2);
}
const hashBefore = sourceHash();

// ── mutant injections (runtime only) ───────────────────────────────────────
const INIT = {
  'duplicate-editor': () => {
    new MutationObserver(() => {
      const s = document.querySelector('.fr-shell');
      if (s?.dataset.canvas === 'full' && document.querySelectorAll('[data-write-editor]').length === 1) {
        const ed = document.querySelector('[data-write-editor]');
        ed.after(ed.cloneNode(true));
      }
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-canvas'] });
  },
  'cursor-loss': () => {
    new MutationObserver(() => {
      if (document.querySelector('.fr-shell')?.dataset.canvas === 'full') setTimeout(() => {
        const ed = document.querySelector('[data-write-editor]');
        getSelection()?.collapse(ed.querySelector('p').firstChild, 0);
      }, 0);
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-canvas'] });
  },
  'save-state-loss': () => {
    new MutationObserver(() => {
      const el = document.querySelector('[data-save-state]');
      if (document.querySelector('.fr-shell')?.dataset.canvas === 'full' && el && el.lastChild?.textContent === 'Saved') el.lastChild.textContent = 'Saving…';
    }).observe(document, { subtree: true, attributes: true, childList: true, attributeFilter: ['data-canvas'] });
  },
  'return-divergence': () => {
    document.addEventListener('click', (e) => {
      if (e.target instanceof Element && e.target.closest('[data-return]')) setTimeout(() => {
        const ed = document.querySelector('[data-write-editor]');
        getSelection()?.setBaseAndExtent(ed.querySelector('p').firstChild, 0, ed.querySelector('p').firstChild, 9);
      }, 30);
    }, true);
  },
  'escape-removed': () => {
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') e.stopImmediatePropagation(); }, true);
  },
  'resident-maia': () => {
    new MutationObserver(() => {
      const room = document.querySelector('.fr-room');
      if (room && !room.querySelector('[data-region="maia"]')) {
        const a = document.createElement('aside');
        a.setAttribute('data-region', 'maia');
        a.textContent = 'MAIA';
        room.appendChild(a);
      }
    }).observe(document, { subtree: true, childList: true });
  },
  'formatting-toolbar': () => {
    new MutationObserver(() => {
      const top = document.querySelector('.fr-write-top');
      if (top && !top.querySelector('[role="toolbar"]')) {
        const t = document.createElement('div');
        t.setAttribute('role', 'toolbar');
        t.innerHTML = '<button>Paragraph</button><button>Bold</button><button>Italic</button>';
        top.appendChild(t);
      }
    }).observe(document, { subtree: true, childList: true });
  },
  'type-role-bypass': () => {
    const s = document.createElement('style');
    s.textContent = '.fr-write-title{font-family:Georgia,serif!important}';
    document.addEventListener('DOMContentLoaded', () => document.head.appendChild(s));
  },
  'light-night-drift': () => {
    const s = document.createElement('style');
    s.textContent = ".fr-shell[data-appearance='night'] .fr-write-top{height:84px!important}";
    document.addEventListener('DOMContentLoaded', () => document.head.appendChild(s));
  },
  'shell-leak': () => {
    new MutationObserver(() => {
      const foot = document.querySelector('.fr-write-foot');
      if (document.querySelector('.fr-shell')?.dataset.canvas === 'full' && foot && !foot.querySelector('[data-move]')) {
        const n = document.createElement('nav');
        n.innerHTML = '<button data-move="previous">Previous</button><button data-move="next">Next</button>';
        foot.appendChild(n);
      }
    }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-canvas'] });
  },
};

async function open(browser, state, w, h, appearance) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const traffic = [];
  page.on('request', (req) => {
    const u = new URL(req.url());
    const staticAsset = u.pathname.startsWith('/_next/') || u.pathname.startsWith('/__nextjs') || u.pathname === ROUTE || /\.(woff2?|png|jpe?g|svg|ico|css|js)$/.test(u.pathname);
    if (!staticAsset) traffic.push(`${req.method()} ${u.pathname}`);
  });
  page.on('websocket', (ws) => { if (!/\/_next\/webpack-hmr/.test(ws.url())) traffic.push(`WS ${ws.url()}`); });
  if (mutant && INIT[mutant]) await page.addInitScript(INIT[mutant]);
  await page.goto(`${base}${ROUTE}?state=${state}${appearance === 'night' ? '&appearance=night' : ''}`, { waitUntil: 'networkidle', timeout: 180000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  return { page, traffic };
}

const barBoxes = (page) =>
  page.evaluate(() =>
    ['[data-region="topbar"]', '.fr-brand', ...[0, 1, 2, 3].map((i) => `.fr-nav-item:nth-child(${i + 1})`), '.fr-workpick', '.fr-avatar'].map((s) => {
      const e = document.querySelector(s);
      if (!e) return null;
      const r = e.getBoundingClientRect();
      return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
    }),
  );

/** Everything the contract names, read from the live DOM. */
const facts = (page) =>
  page.evaluate(({ FORMATTING_SRC }) => {
    const FORMATTING = new RegExp(FORMATTING_SRC);
    const q = (s) => document.querySelector(s);
    const box = (e) => {
      if (!e) return null;
      const r = e.getBoundingClientRect();
      return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
    };
    const frame = q('[data-capture-frame]');
    const shell = q('.fr-shell');
    const ed = q('[data-write-editor]');
    const held = q('[data-write-editor] p[data-held]');
    const tx = frame.innerText;
    // every text-bearing element must resolve to a declared role family
    const offRole = [];
    for (const el of frame.querySelectorAll('*')) {
      if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      if (!el.getClientRects().length) continue;
      const fam = getComputedStyle(el).fontFamily;
      if (!/Newsreader|Inter/.test(fam)) offRole.push(`${el.className || el.tagName}: ${fam.split(',')[0]}`);
    }
    const inlineFamilies = [...frame.querySelectorAll('[style]')].filter((e) => /font-family/i.test(e.getAttribute('style'))).length;
    return {
      canvas: shell.dataset.canvas,
      appearance: shell.dataset.appearance,
      regions: [...frame.querySelectorAll('[data-region]')].map((e) => e.getAttribute('data-region')),
      editors: document.querySelectorAll('[data-write-editor]').length,
      editable: ed?.getAttribute('contenteditable'),
      heldText: held?.textContent ?? '',
      chapters: [...frame.querySelectorAll('[data-chapter]')].map((e) => e.getAttribute('data-chapter')),
      current: [...frame.querySelectorAll('[data-chapter][aria-current="true"]')].map((e) => e.getAttribute('data-chapter')),
      save: q('[data-save-state]')?.textContent.trim() ?? null,
      version: q('[data-version]')?.textContent.trim() ?? null,
      fc: frame.querySelectorAll('[data-full-canvas]').length,
      ret: frame.querySelectorAll('[data-return]').length,
      moves: frame.querySelectorAll('[data-move]').length,
      topbar: !!q('[data-region="topbar"]'),
      maia: !!frame.querySelector('[data-region="maia"]') || /\bMAIA\b/.test(tx),
      formatting: FORMATTING.test(tx) || !!frame.querySelector('[role="toolbar"], [data-format]'),
      offRole,
      inlineFamilies,
      overflow: document.scrollingElement.scrollWidth - window.innerWidth,
      geo: {
        rail: box(q('[data-region="manuscript"]')),
        work: box(q('[data-region="work"]')),
        top: box(q('.fr-write-top')),
        crumb: box(q('.fr-write-crumb')),
        state: box(q('[data-write-state]')),
        fc: box(q('[data-full-canvas]')),
        ret: box(q('[data-return]')),
        title: box(q('.fr-write-title')),
        editor: box(ed),
        held: box(held),
        foot: box(q('.fr-write-foot')),
      },
      vw: window.innerWidth,
      vh: window.innerHeight,
    };
  }, { FORMATTING_SRC: FORMATTING.source });

/** The §8 tuple, read from the live selection, plus the editor's identity mark. */
const tuple = (page) =>
  page.evaluate(() => {
    const ed = document.querySelector('[data-write-editor]');
    const sel = getSelection();
    let cursor = null;
    try {
      const r = document.createRange();
      r.setStart(ed, 0);
      r.setEnd(sel.focusNode, sel.focusOffset);
      cursor = r.toString().length;
    } catch { /* selection outside the editor */ }
    const crumb = [...document.querySelectorAll('.fr-write-crumb span')].map((e) => e.textContent.trim());
    return {
      editors: document.querySelectorAll('[data-write-editor]').length,
      mark: ed?.__s3mark ?? null,
      work: crumb[0] ?? null,
      place: crumb.join(' › '),
      selection: sel?.toString() ?? '',
      cursor,
      version: document.querySelector('[data-version]')?.textContent.trim(),
      save: document.querySelector('[data-save-state]')?.textContent.trim(),
      focus: document.activeElement === ed ? 'editor' : document.activeElement?.tagName ?? 'none',
      canvas: document.querySelector('.fr-shell')?.dataset.canvas,
    };
  });
const same = (a, b) => ['editors', 'mark', 'work', 'place', 'selection', 'cursor', 'version', 'save', 'focus'].every((k) => a[k] === b[k]);
const diff = (a, b) => ['editors', 'mark', 'work', 'place', 'selection', 'cursor', 'version', 'save', 'focus'].filter((k) => a[k] !== b[k]).map((k) => `${k}: ${JSON.stringify(a[k])}→${JSON.stringify(b[k])}`).join(' · ');

function report() {
  const fail = results.filter((r) => !r.ok);
  console.log(`\nPC3-S3 Write fidelity · ${base}${ROUTE}${mutant ? ` · MUTANT ${mutant}` : ''}`);
  let last = '';
  for (const r of results) {
    if (r.state !== last) console.log(`\n  ${r.state}`), (last = r.state);
    console.log(`    ${r.ok ? 'PASS' : 'FAIL'}  ${r.id.padEnd(24)} ${r.detail}`);
  }
  console.log(`\n  → ${results.length - fail.length}/${results.length} ${fail.length ? 'RED' : 'GREEN'}`);
  return fail.length;
}

const browser = await chromium.launch();

// S1 bar reference: develop-themes with WRITE marked current (the bold current label changes widths).
const WIDTHS = [[1536, 1024], [1280, 800], [1024, 768], [390, 844]];
const s1Bars = {};
for (const [w, h] of WIDTHS.slice(0, 3)) {
  const { page } = await open(browser, 'develop-themes', w, h, 'light');
  await page.evaluate(() => {
    const items = [...document.querySelectorAll('.fr-nav-item')];
    items.forEach((b) => b.removeAttribute('aria-current'));
    items[1].setAttribute('aria-current', 'page');
  });
  await page.waitForTimeout(80);
  s1Bars[w] = await barBoxes(page);
  await page.close();
}

// ── S3-A…D at authority width ──────────────────────────────────────────────
const authority = {};
for (const [state, label] of [['write-resting', 'S3-A/C resting'], ['write-full-canvas', 'S3-B/D full canvas']]) {
  for (const appearance of ['light', 'night']) {
    const { page, traffic } = await open(browser, state, 1536, 1024, appearance);
    const f = await facts(page);
    authority[`${state}:${appearance}`] = f;
    const tag = `${label} · ${appearance}`;
    const resting = state === 'write-resting';
    if (resting) {
      const bar = await barBoxes(page);
      const eq = JSON.stringify(bar) === JSON.stringify(s1Bars[1536]);
      rec(tag, 'F-bar=S1', eq, eq ? 'bar, brand, nav ×4, Work picker, avatar identical to the accepted S1 bar (Write current)' : `write ${JSON.stringify(bar)} vs S1 ${JSON.stringify(s1Bars[1536])}`);
      rec(tag, 'F-regions', JSON.stringify(f.regions) === JSON.stringify(['topbar', 'manuscript', 'work']), `regions=${f.regions.join('·')}`);
      rec(tag, 'T-rest-controls', f.save === 'Saved' && f.version === 'Draft v12' && f.fc === 1 && f.moves === 2 && f.ret === 0, `save=${f.save} version=${f.version} fullCanvas=${f.fc} prev/next=${f.moves} return=${f.ret}`);
      rec(tag, 'T-chapters', JSON.stringify(f.chapters) === JSON.stringify(CHAPTERS) && JSON.stringify(f.current) === '["ch-6"]', `chapters=${f.chapters.map((c) => c.slice(3)).join(',')} current=${f.current.join(',')}`);
    } else {
      rec(tag, 'F-no-bar', !f.topbar && JSON.stringify(f.regions) === JSON.stringify(['work']), `topbar=${f.topbar} regions=${f.regions.join('·')}`);
      rec(tag, 'T-canvas-controls', f.save === 'Saved' && f.version === 'Draft v12' && f.ret === 1 && f.moves === 0 && f.fc === 0, `save=${f.save} version=${f.version} return=${f.ret} prev/next=${f.moves} fullCanvas=${f.fc}`);
    }
    rec(tag, 'T-one-editor', f.editors === 1 && f.editable === 'plaintext-only', `editors=${f.editors} contenteditable=${f.editable}`);
    rec(tag, 'T-held-quotation', f.heldText === QUOTE, f.heldText === QUOTE ? 'the full quotation, verbatim' : `held=${JSON.stringify(f.heldText.slice(0, 60))}`);
    rec(tag, 'T-no-resident-maia', !f.maia, f.maia ? 'MAIA present' : 'no MAIA region or text');
    rec(tag, 'T-no-formatting', !f.formatting, f.formatting ? 'formatting control/label present' : 'no formatting controls or labels');
    rec(tag, 'F-type-roles', f.offRole.length === 0 && f.inlineFamilies === 0, f.offRole.length || f.inlineFamilies ? `off-role: ${f.offRole.slice(0, 3).join(' | ')} inline=${f.inlineFamilies}` : 'every text node resolves to Newsreader or Inter roles; 0 inline font-family');
    rec(tag, 'Z-network', traffic.length === 0, traffic.length ? traffic.join(' | ') : 'zero business requests');
    // proportions against the custodied authority
    const g = f.geo;
    if (resting) {
      const rail = g.rail[2] / 1536;
      const left = g.editor[0] / 1536;
      const measure = g.editor[2] / 1536;
      const ok = Math.abs(rail - AUTH.railFrac) <= TOL && Math.abs(left - AUTH.restTextLeft) <= TOL && Math.abs(measure - AUTH.restMeasure) <= TOL;
      rec(tag, 'A-proportions', ok, `rail ${rail.toFixed(3)} (auth ${AUTH.railFrac}) · text-left ${left.toFixed(3)} (${AUTH.restTextLeft}) · measure ${measure.toFixed(3)} (${AUTH.restMeasure}) · tol ±${TOL}`);
    } else {
      const left = g.editor[0] / 1536;
      const measure = g.editor[2] / 1536;
      const ok = Math.abs(left - AUTH.fullTextLeft) <= TOL && Math.abs(measure - AUTH.fullMeasure) <= TOL;
      rec(tag, 'A-proportions', ok, `text-left ${left.toFixed(3)} (auth ${AUTH.fullTextLeft}) · measure ${measure.toFixed(3)} (${AUTH.fullMeasure}) · tol ±${TOL}`);
    }
    rec(tag, 'R@1536', f.overflow <= 0, `overflow=${f.overflow}px`);
    await page.close();
  }
}
// Light = Night, corresponding states; one measure across states; the page holds its height.
for (const state of ['write-resting', 'write-full-canvas']) {
  const L = authority[`${state}:light`].geo;
  const N = authority[`${state}:night`].geo;
  const eq = JSON.stringify(L) === JSON.stringify(N);
  rec('Light = Night', `G-${state}`, eq, eq ? `${Object.keys(L).length} landmark boxes identical` : `light ${JSON.stringify(L)}\n                              vs night ${JSON.stringify(N)}`);
}
{
  const R = authority['write-resting:light'].geo;
  const F = authority['write-full-canvas:light'].geo;
  rec('one page, two fields', 'G-same-measure', R.editor[2] === F.editor[2], `editor width resting ${R.editor[2]} = full ${F.editor[2]} (lines never re-break)`);
  rec('one page, two fields', 'G-page-holds-height', Math.abs(R.title[1] - F.title[1]) <= 2 && Math.abs(R.editor[1] - F.editor[1]) <= 2, `title y ${R.title[1]}→${F.title[1]} · editor y ${R.editor[1]}→${F.editor[1]} (±2px)`);
}

// ── S3-E behaviour: one editor, same state, two return mechanisms ──────────
{
  const { page, traffic } = await open(browser, 'write-resting', 1536, 1024, 'light');
  await page.evaluate(() => { document.querySelector('[data-write-editor]').__s3mark = 'S3-EDITOR'; });
  const before = await tuple(page);
  rec('S3-E transition', 'E-before', before.editors === 1 && before.mark === 'S3-EDITOR' && before.selection === QUOTE && before.focus === 'editor' && before.save === 'Saved' && before.version === 'Draft v12',
    `work=${before.work} · selection=quotation · cursor=${before.cursor} · ${before.version} · ${before.save} · focus=${before.focus}`);
  // enter by pointer
  await page.click('[data-full-canvas]');
  await page.waitForTimeout(150);
  const inCanvas = await tuple(page);
  rec('S3-E transition', 'E-enter-same-editor', inCanvas.canvas === 'full' && same(before, inCanvas), inCanvas.canvas !== 'full' ? `canvas=${inCanvas.canvas}` : same(before, inCanvas) ? 'same node, same tuple' : diff(before, inCanvas));
  // return by the visible control
  await page.click('[data-return]');
  await page.waitForTimeout(150);
  const afterButton = await tuple(page);
  rec('S3-E transition', 'E-return-button', afterButton.canvas === 'resting' && same(before, afterButton), afterButton.canvas !== 'resting' ? `canvas=${afterButton.canvas}` : same(before, afterButton) ? 'identical to before' : diff(before, afterButton));
  // enter by keyboard (focus the control, Enter), return by Escape
  await page.focus('[data-full-canvas]');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  const inCanvasKb = await tuple(page);
  rec('S3-E transition', 'E-enter-keyboard', inCanvasKb.canvas === 'full' && same(before, inCanvasKb), inCanvasKb.canvas !== 'full' ? `canvas=${inCanvasKb.canvas}` : same(before, inCanvasKb) ? 'same node, same tuple, focus restored to the editor' : diff(before, inCanvasKb));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  const afterEscape = await tuple(page);
  const escOk = afterEscape.canvas === 'resting';
  rec('S3-E transition', 'E-return-escape', escOk && same(before, afterEscape), !escOk ? `keyboard return route LOST — Escape left canvas=${afterEscape.canvas}` : same(before, afterEscape) ? 'identical to before' : diff(before, afterEscape));
  rec('S3-E transition', 'E-one-destination', escOk && afterButton.canvas === 'resting' && same(afterButton, afterEscape), escOk ? (same(afterButton, afterEscape) ? 'Return and Escape land identically' : diff(afterButton, afterEscape)) : 'Escape did not return');
  // A lost keyboard route is reported, never crashed on: recover with the visible Return so the run completes.
  if (!escOk) {
    await page.click('[data-return]');
    await page.waitForTimeout(150);
  }
  // no third exit in Full Canvas
  await page.click('[data-full-canvas]');
  await page.waitForTimeout(150);
  const exits = await page.evaluate(() => [...document.querySelectorAll('[data-capture-frame] a[href], [data-capture-frame] button')].filter((b) => b.getClientRects().length).map((b) => b.getAttribute('data-return') !== null ? 'return' : (b.textContent || '').trim() || b.getAttribute('aria-label')));
  rec('S3-E transition', 'E-no-third-exit', exits.length === 1 && exits[0] === 'return', `interactive controls in Full Canvas: ${JSON.stringify(exits)}`);
  const shellLeak = await facts(page);
  rec('S3-E transition', 'E-shell-recedes', !shellLeak.topbar && shellLeak.moves === 0, `topbar=${shellLeak.topbar} prev/next=${shellLeak.moves}`);
  await page.keyboard.press('Escape');
  rec('S3-E transition', 'Z-network', traffic.length === 0, traffic.length ? traffic.join(' | ') : 'zero business requests through every transition');
  await page.close();
}

// ── derived responsive (not founder authority) ─────────────────────────────
for (const [w, h] of WIDTHS.slice(1)) {
  for (const state of ['write-resting', 'write-full-canvas']) {
    const { page } = await open(browser, state, w, h, 'light');
    const f = await facts(page);
    const barOk = state === 'write-full-canvas' ? !f.topbar : w < 720 || JSON.stringify(await barBoxes(page)) === JSON.stringify(s1Bars[w]);
    // Manuscript primary: side by side, the page is at least twice the rail; stacked, the page comes first.
    const sideBySide = f.geo.rail && f.geo.rail[1] < f.geo.editor[1] + f.geo.editor[3] && f.geo.rail[1] + f.geo.rail[3] > f.geo.editor[1];
    const primary = !!f.geo.editor && (!f.geo.rail || (sideBySide ? f.geo.editor[2] >= 2 * f.geo.rail[2] : f.geo.rail[1] >= f.geo.editor[1]));
    const dup = f.editors === 1 && f.fc + f.ret === 1;
    // reachable and returnable at this width
    await page.evaluate(() => { document.querySelector('[data-write-editor]').__s3mark = 'R'; });
    await page.click(state === 'write-resting' ? '[data-full-canvas]' : '[data-return]');
    await page.waitForTimeout(120);
    await page.click(state === 'write-resting' ? '[data-return]' : '[data-full-canvas]');
    await page.waitForTimeout(120);
    const t = await tuple(page);
    const round = t.editors === 1 && t.mark === 'R' && t.canvas === (state === 'write-resting' ? 'resting' : 'full');
    rec(`derived ${w}×${h}`, `R-${state.slice(6)}`, f.overflow <= 0 && barOk && primary && dup && !f.maia && round,
      `overflow=${f.overflow}px bar=${barOk ? 'ok' : 'DRIFT'} manuscript-primary=${primary} single editor+control=${dup} maia=${f.maia} round-trip=${round}`);
    await page.close();
  }
}
await browser.close();

const hashAfter = sourceHash();
rec('custody', 'K-source-unchanged', hashBefore === hashAfter, hashBefore === hashAfter ? 'S3 source bytes identical before and after the witness' : 'source changed during the run');
process.exit(report() ? 1 : 0);
